const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb')
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses')
const crypto = require('crypto')

const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-south-1'

const ddbClient = new DynamoDBClient({ region: REGION })
const ddb = DynamoDBDocumentClient.from(ddbClient, { convertEmptyValues: true })
const s3Client = new S3Client({ region: REGION })
const sesClient = new SESClient({ region: REGION })

const LISTINGS_TABLE = process.env.CAR_LISTINGS_TABLE || process.env.LISTINGS_TABLE
const RESERVATIONS_TABLE = process.env.CAR_RESERVATIONS_TABLE || process.env.RESERVATIONS_TABLE
const LISTINGS_BUCKET = process.env.CAR_LISTINGS_BUCKET || process.env.LISTINGS_BUCKET
const CDN_BASE_URL = trimTrailingSlash(process.env.CAR_LISTINGS_CDN || process.env.LISTINGS_CDN_URL || '')
const REVIEW_EMAIL = process.env.LISTINGS_REVIEW_EMAIL || process.env.SES_TO || 'hello@inspectionwale.com'
const SES_SOURCE = process.env.SES_FROM

const REQUIRED_PHOTO_SLOTS = ['exteriorFront', 'exteriorBack', 'exteriorLeft', 'exteriorRight', 'interiorSeat', 'interiorCluster']
const DOCUMENT_SLOTS = ['rcDocument']
const ALL_ALLOWED_SLOTS = [...REQUIRED_PHOTO_SLOTS, ...DOCUMENT_SLOTS]

function trimTrailingSlash(v) {
  if (!v) return ''
  return v.endsWith('/') ? v.slice(0, -1) : v
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}

function fail(statusCode, message) {
  return response(statusCode, { ok: false, error: message })
}

function randomId(prefix = '') {
  return prefix + crypto.randomUUID()
}

function normaliseString(value) {
  return (value || '').toString().trim()
}

function guessExtension(contentType = '') {
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'image/avif': 'avif'
  }
  return map[contentType.toLowerCase()] || 'jpg'
}

function isEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return response(200, { ok: true })
  }

  const method = event.httpMethod || 'GET'
  let body = {}
  if (event.body) {
    try {
      body = JSON.parse(event.body)
    } catch (err) {
      return fail(400, 'invalid_json')
    }
  }
  const qsAction = event.queryStringParameters && event.queryStringParameters.action
  const action = body.action || qsAction || (method === 'GET' ? 'list' : '')

  try {
    if (method === 'GET') {
      return await handleList()
    }

    if (method === 'POST') {
      if (action === 'requestUpload') return await handleRequestUpload(body)
      if (action === 'submitListing') return await handleSubmitListing(body)
      if (action === 'reserve') return await handleReserve(body)
      return fail(400, 'unknown_action')
    }

    return fail(405, 'method_not_allowed')
  } catch (err) {
    console.error('Handler error', err)
    return fail(500, 'server_error')
  }
}

async function handleList() {
  if (!LISTINGS_TABLE) {
    console.warn('LISTINGS_TABLE not configured; returning empty list')
    return response(200, { ok: true, items: [] })
  }

  const params = {
    TableName: LISTINGS_TABLE
  }

  let items = []
  let startKey
  do {
    if (startKey) params.ExclusiveStartKey = startKey
    const result = await ddb.send(new ScanCommand(params))
    const approved = (result.Items || []).filter(item => item.status === 'approved')
    items = items.concat(approved)
    startKey = result.LastEvaluatedKey
  } while (startKey)

  const sanitized = items.map(sanitizeListingForPublic)
  return response(200, { ok: true, items: sanitized })
}

async function handleRequestUpload(body) {
  if (!LISTINGS_BUCKET) return fail(500, 'bucket_not_configured')

  const files = Array.isArray(body.files) ? body.files : []
  if (!files.length) return fail(400, 'files_required')

  const invalid = files.find(f => !f || !ALL_ALLOWED_SLOTS.includes(f.slot))
  if (invalid) return fail(400, `invalid_slot_${invalid.slot}`)

  const submissionId = body.submissionId || randomId('sub_')
  const baseKey = `submissions/${submissionId}/`

  const uploads = await Promise.all(files.map(async file => {
    const slot = file.slot
    const contentType = normaliseString(file.contentType) || 'image/jpeg'
    const extension = guessExtension(contentType)
    const key = `${baseKey}${slot}.${extension}`

    const putCommand = new PutObjectCommand({
      Bucket: LISTINGS_BUCKET,
      Key: key,
      ContentType: contentType
    })
    const getCommand = new GetObjectCommand({
      Bucket: LISTINGS_BUCKET,
      Key: key
    })

    const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 900 })
    const reviewUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 900 })

    return {
      slot,
      key,
      contentType,
      uploadUrl,
      reviewUrl
    }
  }))

  return response(200, { ok: true, submissionId, uploads })
}

async function handleSubmitListing(body) {
  if (!LISTINGS_TABLE) return fail(500, 'table_not_configured')

  const submissionId = normaliseString(body.submissionId)
  if (!submissionId) return fail(400, 'submission_id_required')

  const seller = body.seller || {}
  const car = body.car || {}
  const photos = Array.isArray(body.photos) ? body.photos : []

  const sellerName = normaliseString(seller.name)
  const sellerMobile = normaliseString(seller.mobile)
  const sellerEmail = normaliseString(seller.email)

  if (!sellerName || !sellerMobile) return fail(400, 'seller_details_required')
  if (sellerEmail && !isEmail(sellerEmail)) return fail(400, 'seller_email_invalid')

  const carMake = normaliseString(car.make)
  const carModel = normaliseString(car.model)
  const registrationYear = normaliseString(car.registrationYear)
  const kmsDriven = normaliseString(car.kmsDriven)
  const expectedPrice = normaliseString(car.expectedPrice)

  if (!carMake || !carModel || !registrationYear || !kmsDriven || !expectedPrice) {
    return fail(400, 'car_details_incomplete')
  }

  const exteriorPhotos = photos.filter(p => REQUIRED_PHOTO_SLOTS.includes(p.slot))
  const documentPhotos = photos.filter(p => DOCUMENT_SLOTS.includes(p.slot))

  if (exteriorPhotos.length !== REQUIRED_PHOTO_SLOTS.length) return fail(400, 'photos_incomplete')

  if (!documentPhotos.length) return fail(400, 'rc_required')

  const now = new Date().toISOString()
  const listingId = submissionId
  const item = {
    listingId,
    submissionId,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    seller: {
      name: sellerName,
      mobile: sellerMobile,
      email: sellerEmail
    },
    car: {
      make: carMake,
      model: carModel,
      edition: normaliseString(car.edition),
      registrationYear,
      kmsDriven,
      expectedPrice
    },
    photos: photos.reduce((acc, photo) => {
      if (photo && photo.slot && photo.key) {
        acc[photo.slot] = {
          key: photo.key,
          contentType: photo.contentType || 'image/jpeg',
          originalName: normaliseString(photo.originalName),
          uploadedAt: now
        }
      }
      return acc
    }, {}),
    notes: normaliseString(body.notes)
  }

  await ddb.send(new PutCommand({ TableName: LISTINGS_TABLE, Item: item }))

  await sendNewListingEmail(item)

  return response(200, {
    ok: true,
    message: 'Thanks! Our verification team will review your submission and publish it after validating the details.'
  })
}

async function handleReserve(body) {
  if (!LISTINGS_TABLE || !RESERVATIONS_TABLE) return fail(500, 'tables_not_configured')

  const listingId = normaliseString(body.listingId)
  if (!listingId) return fail(400, 'listing_id_required')

  const customerName = normaliseString(body.name)
  const customerEmail = normaliseString(body.email)
  const customerMobile = normaliseString(body.mobile || body.number)
  const offerPrice = normaliseString(body.offerPrice)

  if (!customerName || !customerMobile) return fail(400, 'customer_details_required')
  if (customerEmail && !isEmail(customerEmail)) return fail(400, 'customer_email_invalid')

  const listingResult = await ddb.send(new GetCommand({ TableName: LISTINGS_TABLE, Key: { listingId } }))
  if (!listingResult.Item) return fail(404, 'listing_not_found')

  const reservationId = randomId('res_')
  const now = new Date().toISOString()
  const reservation = {
    reservationId,
    listingId,
    name: customerName,
    email: customerEmail,
    mobile: customerMobile,
    offerPrice,
    createdAt: now
  }

  await ddb.send(new PutCommand({ TableName: RESERVATIONS_TABLE, Item: reservation }))

  await sendReservationEmail(listingResult.Item, reservation)

  return response(200, {
    ok: true,
    message: 'Thank you for your interest! We have received your reservation request and will share your offer with the seller. Our team will contact you shortly to discuss the next steps.'
  })
}

function sanitizeListingForPublic(item) {
  const publicPhotos = {}
  for (const slot of REQUIRED_PHOTO_SLOTS) {
    const photo = item.photos && item.photos[slot]
    if (!photo) continue
    let url = ''
    if (photo.publicUrl) {
      url = photo.publicUrl
    } else if (CDN_BASE_URL) {
      url = `${CDN_BASE_URL}/${photo.key}`
    }
    publicPhotos[slot] = {
      url,
      key: photo.key
    }
  }

  const heroUrl = publicPhotos.exteriorFront && publicPhotos.exteriorFront.url

  return {
    listingId: item.listingId,
    status: item.status,
    car: item.car || {},
    headline: item.headline || `${item.car?.make || ''} ${item.car?.model || ''}`.trim(),
    location: item.display && item.display.location || item.car?.city || '',
    summary: item.display && item.display.summary || '',
    heroUrl,
    photos: publicPhotos,
    createdAt: item.createdAt
  }
}

async function sendNewListingEmail(item) {
  if (!REVIEW_EMAIL || !SES_SOURCE) {
    console.warn('SES SOURCE or REVIEW_EMAIL missing; skipping email for new listing')
    return
  }

  const car = item.car || {}
  const seller = item.seller || {}

  const lines = [
    'New customer-to-customer listing submission',
    '',
    `Submission ID: ${item.submissionId}`,
    `Seller: ${seller.name} (${seller.mobile}${seller.email ? `, ${seller.email}` : ''})`,
    `Car: ${car.make} ${car.model} ${car.edition || ''}`.trim(),
    `Registration year: ${car.registrationYear}`,
    `KMs driven: ${car.kmsDriven}`,
    `Expected price: ${car.expectedPrice}`,
    item.notes ? `Notes: ${item.notes}` : null,
    '',
    'Photos:'
  ].filter(Boolean)

  if (LISTINGS_BUCKET) {
    for (const slot of Object.keys(item.photos || {})) {
      const photo = item.photos[slot]
      try {
        const command = new GetObjectCommand({
          Bucket: LISTINGS_BUCKET,
          Key: photo.key
        })
        const url = await getSignedUrl(s3Client, command, { expiresIn: 86400 })
        lines.push(` - ${slot}: ${url}`)
      } catch (err) {
        console.error('Failed to build signed URL for photo', slot, err)
      }
    }
  }

  const command = new SendEmailCommand({
    Source: SES_SOURCE,
    Destination: { ToAddresses: [REVIEW_EMAIL] },
    Message: {
      Subject: { Data: `InspectionWale listing verification required: ${car.make} ${car.model}`.trim() },
      Body: {
        Text: { Data: lines.join('\n') }
      }
    }
  })

  await sesClient.send(command)
}

async function sendReservationEmail(listing, reservation) {
  if (!REVIEW_EMAIL || !SES_SOURCE) {
    console.warn('SES SOURCE or REVIEW_EMAIL missing; skipping reservation email')
    return
  }

  const car = listing.car || {}
  const seller = listing.seller || {}

  const recipients = new Set([REVIEW_EMAIL])
  if (seller.email && isEmail(seller.email)) recipients.add(seller.email)

  const lines = [
    'New reservation request for a customer listing',
    '',
    `Listing ID: ${listing.listingId}`,
    `Car: ${car.make} ${car.model} ${car.edition || ''}`.trim(),
    `Expected price: ${car.expectedPrice}`,
    '',
    'Buyer details:',
    ` - Name: ${reservation.name}`,
    ` - Mobile: ${reservation.mobile}`,
    reservation.email ? ` - Email: ${reservation.email}` : null,
    reservation.offerPrice ? `Offer price: ${reservation.offerPrice}` : null,
    '',
    `Submitted at: ${reservation.createdAt}`
  ].filter(Boolean)

  const command = new SendEmailCommand({
    Source: SES_SOURCE,
    Destination: { ToAddresses: Array.from(recipients) },
    Message: {
      Subject: { Data: `Reservation request for ${car.make} ${car.model}`.trim() },
      Body: {
        Text: { Data: lines.join('\n') }
      }
    }
  })

  await sesClient.send(command)
}
