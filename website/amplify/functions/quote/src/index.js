const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb')
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses')

const REGION = process.env.AWS_REGION || 'ap-south-1'
const QUOTES_TABLE = process.env.QUOTES_TABLE || process.env.STORAGE_QUOTES_NAME

const ddb = new DynamoDBClient({ region: REGION })
const ddbDoc = DynamoDBDocumentClient.from(ddb)
const ses = new SESClient({ region: REGION })

exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const { name, mobile, model, city } = body
    if (!name || !mobile) {
      return { statusCode: 400, body: JSON.stringify({ error: 'name and mobile required' }) }
    }

    const item = {
      id: String(Date.now()),
      name,
      mobile,
      model: model || '',
      city: city || '',
      receivedAt: new Date().toISOString()
    }

    if (!QUOTES_TABLE) console.warn('QUOTES_TABLE not set; skipping DynamoDB save')
    else await ddbDoc.send(new PutCommand({ TableName: QUOTES_TABLE, Item: item }))

    // Try SES if configured
    if (process.env.SES_FROM && process.env.SES_TO) {
      try {
        const params = {
          Source: process.env.SES_FROM,
          Destination: { ToAddresses: [process.env.SES_TO] },
          Message: {
            Subject: { Data: `Quote request from ${name}` },
            Body: { Text: { Data: `Name: ${name}\nMobile: ${mobile}\nModel: ${model || '-'}\nCity: ${city || '-'}\nReceived: ${item.receivedAt}` } }
          }
        }
        await ses.send(new SendEmailCommand(params))
      } catch (err) {
        console.error('SES send failed:', err.message || err)
      }
    } else {
      console.warn('SES_FROM/SES_TO not configured; email not sent')
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error('Handler error', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'server_error' }) }
  }
}
