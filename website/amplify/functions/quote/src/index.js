const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb')
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses')

const REGION = process.env.AWS_REGION || 'us-east-1'
const QUOTES_TABLE = process.env.QUOTES_TABLE || process.env.STORAGE_QUOTES_NAME

const ddb = new DynamoDBClient({ region: REGION })
const ddbDoc = DynamoDBDocumentClient.from(ddb)
const ses = new SESClient({ region: REGION })

function safeString(v) { return v === undefined || v === null ? '' : String(v) }

exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {}

    // Support both { name, mobile, model, city } and the modal fields { firstName, lastName, mobile, email, location, carType }
    const name = (body.name && safeString(body.name).trim()) || (((body.firstName || '') + ' ' + (body.lastName || '')).trim()) || ''
    const mobile = safeString(body.mobile || body.phone || body.mobileNumber || '')
    const email = safeString(body.email || '')
    const model = safeString(body.model || body.carType || '')
    const city = safeString(body.city || body.location || '')
    const make = safeString(body.make || '')
    const extra = {}
    // copy any other fields for storage
    for (const k of Object.keys(body)) {
      if (!['name','firstName','lastName','mobile','phone','mobileNumber','email','model','carType','city','location','make'].includes(k)) extra[k] = body[k]
    }

    if (!name || !mobile) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' },
        body: JSON.stringify({ error: 'name and mobile required' })
      }
    }

    const item = {
      id: String(Date.now()),
      name,
      mobile,
      email,
      make,
      model,
      city,
      extra,
      receivedAt: new Date().toISOString()
    }

    if (!QUOTES_TABLE) console.warn('QUOTES_TABLE not set; skipping DynamoDB save')
    else await ddbDoc.send(new PutCommand({ TableName: QUOTES_TABLE, Item: item }))

    // Compose email body
    const emailLines = [
      `New quote/booking received`,
      `-------------------------`,
      `Name: ${item.name}`,
      `Mobile: ${item.mobile}`,
      item.email ? `Email: ${item.email}` : null,
      item.make ? `Make: ${item.make}` : null,
      item.model ? `Model/Type: ${item.model}` : null,
      item.city ? `City/Location: ${item.city}` : null,
      Object.keys(item.extra || {}).length ? `Extra: ${JSON.stringify(item.extra)}` : null,
      `Received: ${item.receivedAt}`
    ].filter(Boolean).join('\n')

    // Try SES if configured
    if (process.env.SES_FROM && process.env.SES_TO) {
      try {
        const params = {
          Source: process.env.SES_FROM,
          Destination: { ToAddresses: [process.env.SES_TO] },
          Message: {
            Subject: { Data: `InspectionWale: request from ${item.name}` },
            Body: { Text: { Data: emailLines } }
          }
        }
        await ses.send(new SendEmailCommand(params))
      } catch (err) {
        console.error('SES send failed:', err && (err.message || err))
      }
    } else {
      console.warn('SES_FROM/SES_TO not configured; email not sent')
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' },
      body: JSON.stringify({ ok: true })
    }
  } catch (err) {
    console.error('Handler error', err)
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' },
      body: JSON.stringify({ error: 'server_error' })
    }
  }
}
