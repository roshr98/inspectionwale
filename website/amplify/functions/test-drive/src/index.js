const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb')
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses')
const crypto = require('crypto')

const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'
const TABLE_NAME = process.env.TEST_DRIVE_TABLE || 'TestDriveRequests'
const SES_FROM = normaliseString(process.env.SES_FROM || process.env.TEST_DRIVE_FROM || '')
const SES_TO = normaliseString(process.env.SES_TO || process.env.TEST_DRIVE_TO || SES_FROM)

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), { convertEmptyValues: true })
const ses = new SESClient({ region: REGION })

const BASE_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Content-Type': 'application/json'
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return respond(200, { ok: true })
  }

  if (event.httpMethod !== 'POST') {
    return respond(405, { ok: false, error: 'method_not_allowed' })
  }

  let body = {}
  try {
    body = event.body ? JSON.parse(event.body) : {}
  } catch (err) {
    console.error('Invalid JSON payload', err)
    return respond(400, { ok: false, error: 'invalid_payload' })
  }

  const name = normaliseString(body.name || body.fullName)
  const mobile = normaliseString(body.mobile || body.phone || body.mobileNumber)
  const email = normaliseString(body.email)
  const location = normaliseString(body.location || body.city)
  const preferredDate = normaliseString(body.preferredDate || body.date)
  const preferredSlot = normaliseString(body.preferredSlot || body.timeSlot || body.slot)
  const notes = normaliseString(body.notes || body.message || body.additionalNotes)
  const listingId = normaliseString(body.listingId)
  const listingSummary = normaliseString(body.listingSummary)

  if (!name || !mobile) {
    return respond(400, { ok: false, error: 'name_and_mobile_required' })
  }

  if (!TABLE_NAME) {
    console.error('TEST_DRIVE_TABLE env var missing')
    return respond(500, { ok: false, error: 'table_not_configured' })
  }

  const now = new Date().toISOString()
  const requestId = crypto.randomUUID()
  const item = {
    requestId,
    name,
    mobile,
    email,
    location,
    preferredDate,
    preferredSlot,
    notes,
    listingId,
    listingSummary,
    createdAt: now,
    status: 'pending'
  }

  // Remove empty fields
  Object.keys(item).forEach(key => {
    if (!item[key] && item[key] !== 0 && item[key] !== false) {
      delete item[key]
    }
  })

  try {
    await ddb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    }))
  } catch (err) {
    console.error('Failed to persist test drive request', err)
    return respond(500, { ok: false, error: 'database_error' })
  }

  try {
    await maybeSendSes(item)
  } catch (err) {
    console.error('SES notification failed', err)
    // Continue even if email fails so the lead is not lost
  }

  return respond(200, { ok: true, message: 'Test drive request submitted successfully' })
}

function respond(statusCode, body) {
  return {
    statusCode,
    headers: BASE_HEADERS,
    body: JSON.stringify(body)
  }
}

function normaliseString(value) {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

async function maybeSendSes(item) {
  if (!SES_FROM || !SES_TO) {
    console.warn('SES_FROM or SES_TO not configured; skipping email')
    return
  }

  const lines = [
    'New Test Drive Request Received',
    '==============================',
    '',
    `Name: ${item.name}`,
    `Mobile: ${item.mobile}`,
    item.email ? `Email: ${item.email}` : null,
    item.location ? `Location: ${item.location}` : null,
    item.preferredDate ? `Preferred Date: ${item.preferredDate}` : null,
    item.preferredSlot ? `Preferred Time: ${item.preferredSlot}` : null,
    item.notes ? `Notes: ${item.notes}` : null,
    '',
    'Car Details:',
    item.listingSummary ? `${item.listingSummary}` : 'Not specified',
    item.listingId ? `Listing ID: ${item.listingId}` : null,
    '',
    `Received: ${item.createdAt}`,
    `Request ID: ${item.requestId}`
  ].filter(Boolean)

  const command = new SendEmailCommand({
    Source: SES_FROM,
    Destination: { ToAddresses: [SES_TO] },
    Message: {
      Subject: { Data: `inspectionWale: Test Drive Request from ${item.name}` },
      Body: { Text: { Data: lines.join('\n') } }
    }
  })

  await ses.send(command)
}
