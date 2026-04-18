// Ads API
// - GET: return only APPROVED ads from DynamoDB (for future auto-rendering)
// - POST: accept a "Post an ad" inquiry and email it to InspectionWale

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb')
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses')
const { randomUUID } = require('crypto')

const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'
const TABLE_NAME = process.env.ADS_TABLE || process.env.INSPECTIONWALE_ADS_TABLE || 'inspectionwale-ads'

const SES_FROM = normaliseString(process.env.SES_FROM || process.env.ADS_SES_FROM || '')
const SES_TO = parseEmailList(process.env.SES_TO || process.env.ADS_SES_TO || '')
const SES_REPLY_TO = parseEmailList(process.env.SES_REPLY_TO || process.env.ADS_SES_REPLY_TO || '')

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), { convertEmptyValues: true })
const ses = new SESClient({ region: REGION })

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  }
}

function nowIso() {
  return new Date().toISOString()
}

function asLower(v) {
  return (v || '').toString().trim().toLowerCase()
}

function inWindow(item, now = new Date()) {
  const startAt = item.startAt ? new Date(item.startAt) : null
  const endAt = item.endAt ? new Date(item.endAt) : null

  if (startAt && Number.isFinite(startAt.getTime()) && now < startAt) return false
  if (endAt && Number.isFinite(endAt.getTime()) && now > endAt) return false
  return true
}

exports.handler = async (event) => {
  try {
    const method = event.httpMethod || event.requestContext?.http?.method || 'GET'
    if (method === 'OPTIONS') return json(200, { ok: true })
    if (method === 'POST') return await handleInquiry(event)
    if (method !== 'GET') return json(405, { ok: false, error: 'method_not_allowed' })

    const qs = event.queryStringParameters || {}
    const slotFilter = (qs.slot || qs.slots || '').toString().trim()
    const requestedSlots = slotFilter
      ? slotFilter.split(',').map(s => s.trim()).filter(Boolean)
      : null

    const now = new Date()
    const scan = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }))
    const items = Array.isArray(scan.Items) ? scan.Items : []

    const approved = items
      .filter(item => asLower(item.status) === 'approved')
      .filter(item => inWindow(item, now))
      .filter(item => {
        if (!requestedSlots) return true
        return requestedSlots.includes(item.slot)
      })
      .map(item => ({
        adId: item.adId || item.id || null,
        name: item.name || item.adName || '',
        slot: item.slot || '',
        imageUrl: item.imageUrl || item.imageURL || item.url || '',
        clickUrl: item.clickUrl || item.targetUrl || item.href || '',
        alt: item.alt || item.name || 'Advertisement',
        priority: Number(item.priority || 0),
        updatedAt: item.updatedAt || item.modifiedAt || item.createdAt || nowIso()
      }))
      .filter(item => item.slot && item.imageUrl)
      .sort((a, b) => (b.priority - a.priority) || (String(b.updatedAt).localeCompare(String(a.updatedAt))))

    return json(200, { ok: true, items: approved })
  } catch (err) {
    console.error('ads handler error', err)
    return json(500, { ok: false, error: 'server_error' })
  }
}

async function handleInquiry(event) {
  let body = {}
  try {
    body = event.body ? JSON.parse(event.body) : {}
  } catch (err) {
    return json(400, { ok: false, error: 'invalid_payload' })
  }

  const requestType = normaliseString(body.type)
  if (requestType && requestType !== 'post_ad_inquiry') {
    return json(400, { ok: false, error: 'unsupported_type' })
  }

  const name = normaliseString(body.name)
  const phone = normaliseString(body.phone || body.mobile || body.mobileNumber)
  const message = normaliseString(body.message)
  const page = normaliseString(body.page || body.source || 'website')
  const bannerImageUrl = normaliseString(body.bannerImageUrl || body.imageUrl || body.bannerUrl)

  if (!name || !phone || !message) {
    return json(400, { ok: false, error: 'name_phone_message_required' })
  }

  const receivedAt = nowIso()
  const leadId = `lead_${randomUUID()}`

  // Always capture the lead (even if SES is not configured yet).
  try {
    const item = {
      adId: leadId,
      type: 'post_ad_inquiry',
      status: 'lead',
      name,
      phone,
      message,
      page,
      bannerImageUrl: bannerImageUrl || undefined,
      createdAt: receivedAt,
      updatedAt: receivedAt
    }

    await ddb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    }))
  } catch (err) {
    console.error('failed to store ads inquiry lead', err)
    return json(500, {
      ok: false,
      error: 'lead_store_failed',
      message: `Failed to store lead. Ensure DynamoDB table exists: ${TABLE_NAME}`
    })
  }

  // Optional: send notification email (can be enabled later).
  const emailConfigured = Boolean(SES_FROM) && Array.isArray(SES_TO) && SES_TO.length > 0
  if (!emailConfigured) {
    return json(200, { ok: true, leadId, delivery: 'stored_only' })
  }

  const lines = [
    'Post an ad inquiry received',
    '--------------------------',
    `LeadId: ${leadId}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Message: ${message}`,
    `Page: ${page}`,
    bannerImageUrl ? `Banner Image: ${bannerImageUrl}` : null,
    `Received: ${receivedAt}`
  ].filter(Boolean)

  try {
    const subject = `Post an ad inquiry: ${name} (${phone})`
    const result = await ses.send(new SendEmailCommand({
      Source: SES_FROM,
      Destination: { ToAddresses: SES_TO },
      ReplyToAddresses: SES_REPLY_TO.length ? SES_REPLY_TO : undefined,
      Message: {
        Subject: { Data: subject },
        Body: {
          Text: { Data: lines.join('\n') },
          Html: {
            Data: [
              '<h2>Post an ad inquiry received</h2>',
              '<ul>',
              `<li><strong>LeadId:</strong> ${escapeHtml(leadId)}</li>`,
              `<li><strong>Name:</strong> ${escapeHtml(name)}</li>`,
              `<li><strong>Phone:</strong> ${escapeHtml(phone)}</li>`,
              `<li><strong>Page:</strong> ${escapeHtml(page)}</li>`,
              bannerImageUrl ? `<li><strong>Banner Image:</strong> ${escapeHtml(bannerImageUrl)}</li>` : '',
              `<li><strong>Received:</strong> ${escapeHtml(receivedAt)}</li>`,
              '</ul>',
              '<p><strong>Message:</strong></p>',
              `<pre style="white-space:pre-wrap">${escapeHtml(message)}</pre>`
            ].join('')
          }
        }
      }
    }))

    return json(200, {
      ok: true,
      leadId,
      delivery: 'stored_and_emailed',
      messageId: result && result.MessageId ? result.MessageId : null,
      to: SES_TO
    })
  } catch (err) {
    console.error('SES send failed for ads inquiry (lead already stored)', err)
    return json(200, { ok: true, leadId, delivery: 'stored_only', warning: 'email_send_failed' })
  }
}

function normaliseString(value) {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

function parseEmailList(value) {
  const text = normaliseString(value)
  if (!text) return []
  return text
    .split(/[\s,;]+/)
    .map(v => v.trim())
    .filter(Boolean)
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
