const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb')
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

const DEFAULT_REVIEW_EMAIL = 'inspectionwale@zohomail.in'
const DEFAULT_SOURCE_EMAIL = 'hello@inspectionwale.com'

const REVIEW_EMAIL = normaliseString(process.env.LISTINGS_REVIEW_EMAIL || process.env.SES_TO || DEFAULT_REVIEW_EMAIL)
const SES_SOURCE = normaliseString(process.env.SES_FROM || DEFAULT_SOURCE_EMAIL)
const REVIEW_RECIPIENTS = Array.from(new Set([
  REVIEW_EMAIL,
  process.env.LISTINGS_REVIEW_EMAIL,
  process.env.SES_TO,
  DEFAULT_REVIEW_EMAIL,
  DEFAULT_SOURCE_EMAIL
].map(normaliseString).filter(Boolean)))

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

async function checkDuplicateSeller(email, mobile) {
  if (!LISTINGS_TABLE) {
    return { ok: true } // Skip check if table not configured
  }

  try {
    // Scan for any approved listing with same email or mobile
    const scanResult = await ddb.send(new ScanCommand({
      TableName: LISTINGS_TABLE,
      FilterExpression: '#status = :approved AND (#email = :email OR #mobile = :mobile)',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#email': 'sellerEmail',
        '#mobile': 'sellerMobile'
      },
      ExpressionAttributeValues: {
        ':approved': 'approved',
        ':email': email || 'NO_EMAIL',
        ':mobile': mobile || 'NO_MOBILE'
      }
    }))

    if (scanResult.Items && scanResult.Items.length > 0) {
      const existingListing = scanResult.Items[0]
      return {
        ok: false,
        error: 'duplicate_seller_detected',
        message: `A listing already exists with this ${existingListing.sellerEmail === email ? 'email' : 'mobile number'}. Only one active listing per seller is allowed. Contact support if you need assistance.`
      }
    }

    return { ok: true }
  } catch (error) {
    console.error('Error checking duplicate seller:', error)
    // Don't fail submission if duplicate check fails
    return { ok: true }
  }
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
  const visibleStatuses = new Set(['approved', 'sold', 'soldout', 'sold-out', 'sold out', 'booked', 'reserved'])

  do {
    if (startKey) params.ExclusiveStartKey = startKey
    const result = await ddb.send(new ScanCommand(params))
    const approved = (result.Items || []).filter(item => visibleStatuses.has((item.status || '').toLowerCase()))
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
      // ACL removed - bucket has BucketOwnerEnforced ownership (ACLs disabled)
      // Public access is controlled via bucket policy instead
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

  // RC document is now optional - no validation required
  // if (!documentPhotos.length) return fail(400, 'rc_required')

  // Check for duplicate seller with approved listing
  const duplicateCheck = await checkDuplicateSeller(sellerEmail, sellerMobile)
  if (!duplicateCheck.ok) {
    return fail(400, duplicateCheck.error)
  }

  const now = new Date().toISOString()
  const listingId = submissionId
  const item = {
    listingId,
    submissionId,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    // Top-level seller fields for queries
    sellerName,
    sellerEmail,
    sellerMobile,
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

  // Send email notification (don't fail if email fails)
  try {
    await sendNewListingEmail(item)
  } catch (emailErr) {
    console.error('Failed to send listing submission email:', emailErr)
    // Continue anyway - listing is saved
  }

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

  // Send email notification (don't fail if email fails)
  try {
    await sendReservationEmail(listingResult.Item, reservation)
  } catch (emailErr) {
    console.error('Failed to send reservation email:', emailErr)
    // Continue anyway - reservation is saved
  }

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
    
    // Handle different photo formats
    if (typeof photo === 'string') {
      // Direct string path (for manually added listings with local images)
      url = photo
    } else if (photo.publicUrl) {
      // Explicitly set public URL
      url = photo.publicUrl
    } else if (photo.url) {
      // Pre-built URL
      url = photo.url
    } else if (photo.key && CDN_BASE_URL) {
      // Build URL from CDN + key
      url = `${CDN_BASE_URL}/${photo.key}`
    } else if (photo.key && LISTINGS_BUCKET) {
      // Build URL from S3 bucket (fallback)
      url = `https://${LISTINGS_BUCKET}.s3.amazonaws.com/${photo.key}`
    }
    
    publicPhotos[slot] = {
      url,
      key: photo.key || photo
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
  if (!REVIEW_RECIPIENTS.length || !SES_SOURCE) {
    console.warn('SES SOURCE or review recipients missing; skipping email for new listing')
    return
  }

  const car = item.car || {}
  const seller = item.seller || {}
  const carTitle = `${car.make} ${car.model} ${car.edition || ''}`.trim()
  
  // Generate secure tokens for approve/reject links
  const SECRET_KEY = process.env.APPROVAL_SECRET_KEY || 'CHANGE_THIS_IN_PRODUCTION'
  const APPROVAL_URL = process.env.APPROVAL_URL || 'https://YOUR_APPROVAL_LAMBDA_URL'
  
  const approveToken = generateApprovalToken(item.listingId, 'approve', SECRET_KEY)
  const rejectToken = generateApprovalToken(item.listingId, 'reject', SECRET_KEY)
  
  const approveUrl = `${APPROVAL_URL}?token=${approveToken}`
  const rejectUrl = `${APPROVAL_URL}?token=${rejectToken}`
  
  // Build photo gallery HTML
  let photoGalleryHtml = ''
  if (LISTINGS_BUCKET) {
    const photoUrls = []
    for (const slot of Object.keys(item.photos || {})) {
      const photo = item.photos[slot]
      try {
        const command = new GetObjectCommand({
          Bucket: LISTINGS_BUCKET,
          Key: photo.key
        })
        const url = await getSignedUrl(s3Client, command, { expiresIn: 604800 }) // 7 days
        const label = slot.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()
        photoUrls.push({ label, url })
      } catch (err) {
        console.error('Failed to build signed URL for photo', slot, err)
      }
    }
    
    if (photoUrls.length > 0) {
      photoGalleryHtml = photoUrls.map(({ label, url }) => `
        <div style="margin-bottom: 15px;">
          <p style="margin: 5px 0; font-weight: 600; color: #333;">${label}</p>
          <a href="${url}" target="_blank">
            <img src="${url}" alt="${label}" style="max-width: 100%; height: auto; border-radius: 8px; border: 2px solid #e0e0e0;">
          </a>
        </div>
      `).join('')
    }
  }

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; margin: 0;">
      <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚗 New Car Listing Request</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Review and approve or reject this listing</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px;">
          <!-- Car Details -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">🚘 Car Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 40%;"><strong>Make & Model:</strong></td>
                <td style="padding: 8px 0; color: #333;">${carTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Year:</strong></td>
                <td style="padding: 8px 0; color: #333;">${car.registrationYear}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Kilometers:</strong></td>
                <td style="padding: 8px 0; color: #333;">${car.kmsDriven} km</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Expected Price:</strong></td>
                <td style="padding: 8px 0; color: #27ae60; font-weight: 600;">₹${car.expectedPrice}</td>
              </tr>
            </table>
          </div>
          
          <!-- Seller Details -->
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #ffc107;">
            <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">👤 Seller Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 40%;"><strong>Name:</strong></td>
                <td style="padding: 8px 0; color: #333;">${seller.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Mobile:</strong></td>
                <td style="padding: 8px 0; color: #333;">${seller.mobile}</td>
              </tr>
              ${seller.email ? `
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; color: #333;">${seller.email}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          ${item.notes ? `
          <!-- Additional Notes -->
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #2196f3;">
            <h2 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">📝 Additional Notes</h2>
            <p style="margin: 0; color: #555; line-height: 1.6;">${item.notes}</p>
          </div>
          ` : ''}
          
          <!-- Photo Gallery -->
          ${photoGalleryHtml ? `
          <div style="margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: #333; font-size: 20px;">📸 Photos</h2>
            ${photoGalleryHtml}
          </div>
          ` : ''}
          
          <!-- Action Buttons -->
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; text-align: center;">
            <p style="margin: 0 0 20px 0; color: #555; font-size: 16px;">
              <strong>Review the listing and take action:</strong>
            </p>
            <div style="display: inline-block;">
              <a href="${approveUrl}" style="display: inline-block; padding: 15px 40px; background: #27ae60; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 0 10px; box-shadow: 0 4px 6px rgba(39,174,96,0.3);">
                ✅ APPROVE
              </a>
              <a href="${rejectUrl}" style="display: inline-block; padding: 15px 40px; background: #e74c3c; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 0 10px; box-shadow: 0 4px 6px rgba(231,76,60,0.3);">
                ❌ REJECT
              </a>
            </div>
            <p style="margin: 20px 0 0 0; color: #999; font-size: 13px;">
              These links are valid for 7 days
            </p>
          </div>
          
          <!-- Metadata -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="margin: 5px 0; color: #999; font-size: 13px;">
              <strong>Submission ID:</strong> ${item.submissionId}
            </p>
            <p style="margin: 5px 0; color: #999; font-size: 13px;">
              <strong>Listing ID:</strong> ${item.listingId}
            </p>
            <p style="margin: 5px 0; color: #999; font-size: 13px;">
              <strong>Submitted:</strong> ${new Date(item.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            InspectionWale Admin Notification<br>
            <a href="https://www.inspectionwale.com" style="color: #3498db;">www.inspectionwale.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const primaryRecipient = REVIEW_EMAIL || REVIEW_RECIPIENTS[0]
  const ccRecipients = REVIEW_RECIPIENTS.filter(email => email && email !== primaryRecipient)
  const destination = { ToAddresses: [primaryRecipient] }
  if (ccRecipients.length) destination.CcAddresses = ccRecipients

  const command = new SendEmailCommand({
    Source: SES_SOURCE,
    Destination: destination,
    Message: {
      Subject: { Data: `🚗 Car Listing Request Received: ${carTitle} - ${car.registrationYear}` },
      Body: {
        Html: { Data: htmlBody }
      }
    }
  })

  await sesClient.send(command)
}

function generateApprovalToken(listingId, action, secretKey) {
  const data = `${listingId}:${action}:${Date.now()}`
  const hash = crypto.createHmac('sha256', secretKey).update(data).digest('hex')
  return Buffer.from(`${data}:${hash}`).toString('base64url')
}

async function sendReservationEmail(listing, reservation) {
  if (!REVIEW_RECIPIENTS.length || !SES_SOURCE) {
    console.warn('SES SOURCE or review recipients missing; skipping reservation email')
    return
  }

  const car = listing.car || {}
  const seller = listing.seller || {}

  // Only send to admin, not to customer/seller
  const recipients = REVIEW_RECIPIENTS

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

  const toAddresses = recipients.length ? [recipients[0]] : []
  const ccAddresses = recipients.slice(1)
  const destination = { ToAddresses: toAddresses }
  if (ccAddresses.length) destination.CcAddresses = ccAddresses

  const command = new SendEmailCommand({
    Source: SES_SOURCE,
    Destination: destination,
    Message: {
      Subject: { Data: `Reservation request for ${car.make} ${car.model}`.trim() },
      Body: {
        Text: { Data: lines.join('\n') }
      }
    }
  })

  await sesClient.send(command)
}
