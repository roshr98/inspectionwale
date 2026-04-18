const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb')
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses')
const crypto = require('crypto')

const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'
const TABLE_NAME = process.env.CAR_VALUE_TABLE || 'CarValueRequests'
const SES_FROM = normaliseString(process.env.SES_FROM || process.env.CAR_VALUE_FROM || '')
const SES_TO = normaliseString(process.env.SES_TO || process.env.CAR_VALUE_TO || SES_FROM)

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
  const message = normaliseString(body.message || body.notes)
  const formSource = normaliseString(body.formSource || body.source || 'hero-form')

  if (!name || !mobile) {
    return respond(400, { ok: false, error: 'name_and_mobile_required' })
  }

  if (!TABLE_NAME) {
    console.error('CAR_VALUE_TABLE env var missing')
    return respond(500, { ok: false, error: 'table_not_configured' })
  }

  const now = new Date().toISOString()
  const requestId = crypto.randomUUID()
  const item = {
    requestId,
    name,
    mobile,
    email,
    message,
    formSource,
    createdAt: now
  }

  try {
    await ddb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    }))
  } catch (err) {
    console.error('Failed to persist car value request', err)
    return respond(500, { ok: false, error: 'database_error' })
  }

  try {
    await maybeSendSes(item)
  } catch (err) {
    console.error('SES notification failed', err)
    // Continue even if email fails so the lead is not lost
  }

  return respond(200, { ok: true, message: 'Request captured' })
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
    'New "Check Your Car Value" request received',
    '-------------------------------------------',
    `Name: ${item.name}`,
    `Mobile: ${item.mobile}`,
    item.email ? `Email: ${item.email}` : null,
    item.message ? `Message: ${item.message}` : null,
    `Form source: ${item.formSource}`,
    `Received: ${item.createdAt}`
  ].filter(Boolean)

  const command = new SendEmailCommand({
    Source: SES_FROM,
    Destination: { ToAddresses: [SES_TO] },
    Message: {
      Subject: { Data: `inspectionWale: Car value request from ${item.name}` },
      Body: { Text: { Data: lines.join('\n') } }
    }
  })

  await ses.send(command)
}
