const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb')
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses')
const crypto = require('crypto')

const REGION = process.env.AWS_REGION || 'us-east-1'
const ddbClient = new DynamoDBClient({ region: REGION })
const ddb = DynamoDBDocumentClient.from(ddbClient)
const sesClient = new SESClient({ region: REGION })

const LISTINGS_TABLE = process.env.CAR_LISTINGS_TABLE || 'CarListingsTable'
const SES_FROM = process.env.SES_FROM || 'hello@inspectionwale.com'
const SECRET_KEY = process.env.APPROVAL_SECRET_KEY || 'CHANGE_THIS_IN_PRODUCTION'
const WEBSITE_URL = process.env.WEBSITE_URL || 'https://www.inspectionwale.com'

function htmlResponse(statusCode, html) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    },
    body: html
  }
}

function generateToken(listingId, action) {
  const data = `${listingId}:${action}:${Date.now()}`
  const hash = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex')
  return Buffer.from(`${data}:${hash}`).toString('base64url')
}

function verifyToken(token, maxAgeMs = 7 * 24 * 60 * 60 * 1000) { // 7 days
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const parts = decoded.split(':')
    if (parts.length !== 4) return null
    
    const [listingId, action, timestamp, hash] = parts
    const data = `${listingId}:${action}:${timestamp}`
    const expectedHash = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex')
    
    if (hash !== expectedHash) return null
    if (Date.now() - parseInt(timestamp) > maxAgeMs) return null
    
    return { listingId, action }
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event))
  
  const queryParams = event.queryStringParameters || {}
  const token = queryParams.token
  
  if (!token) {
    return htmlResponse(400, `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invalid Request - InspectionWale</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          h1 { color: #e74c3c; }
          p { color: #555; line-height: 1.6; }
          a { color: #3498db; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ Invalid Request</h1>
          <p>This approval link is invalid or malformed.</p>
          <p>Please use the link provided in the original email or contact support.</p>
          <p><a href="${WEBSITE_URL}">← Back to InspectionWale</a></p>
        </div>
      </body>
      </html>
    `)
  }
  
  const verified = verifyToken(token)
  
  if (!verified) {
    return htmlResponse(400, `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Link Expired - InspectionWale</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          h1 { color: #e67e22; }
          p { color: #555; line-height: 1.6; }
          a { color: #3498db; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🕐 Link Expired</h1>
          <p>This approval link has expired or is invalid.</p>
          <p>Approval links are valid for 7 days. Please check your email for a newer link or contact the admin.</p>
          <p><a href="${WEBSITE_URL}">← Back to InspectionWale</a></p>
        </div>
      </body>
      </html>
    `)
  }
  
  const { listingId, action } = verified
  
  if (!['approve', 'reject'].includes(action)) {
    return htmlResponse(400, `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invalid Action - InspectionWale</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          h1 { color: #e74c3c; }
          p { color: #555; line-height: 1.6; }
          a { color: #3498db; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ Invalid Action</h1>
          <p>The action specified is not valid.</p>
          <p><a href="${WEBSITE_URL}">← Back to InspectionWale</a></p>
        </div>
      </body>
      </html>
    `)
  }
  
  try {
    // Get the listing
    const getResult = await ddb.send(new GetCommand({
      TableName: LISTINGS_TABLE,
      Key: { listingId }
    }))
    
    if (!getResult.Item) {
      return htmlResponse(404, `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Listing Not Found - InspectionWale</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            h1 { color: #e74c3c; }
            p { color: #555; line-height: 1.6; }
            a { color: #3498db; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Listing Not Found</h1>
            <p>The listing you're trying to ${action} could not be found.</p>
            <p>It may have been deleted or the ID is incorrect.</p>
            <p><a href="${WEBSITE_URL}">← Back to InspectionWale</a></p>
          </div>
        </body>
        </html>
      `)
    }
    
    const listing = getResult.Item
    const currentStatus = listing.status
    
    // Check if already processed
    if (currentStatus === 'approved' || currentStatus === 'rejected') {
      return htmlResponse(200, `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Already Processed - InspectionWale</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            h1 { color: #3498db; }
            p { color: #555; line-height: 1.6; }
            a { color: #3498db; text-decoration: none; }
            .status-badge { display: inline-block; padding: 6px 12px; border-radius: 4px; font-weight: 600; background: ${currentStatus === 'approved' ? '#27ae60' : '#e74c3c'}; color: white; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>ℹ️ Already Processed</h1>
            <p>This listing has already been processed.</p>
            <p>Current Status: <span class="status-badge">${currentStatus.toUpperCase()}</span></p>
            <p><a href="${WEBSITE_URL}">← Back to InspectionWale</a></p>
          </div>
        </body>
        </html>
      `)
    }
    
    // Update the status
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const now = new Date().toISOString()
    
    await ddb.send(new UpdateCommand({
      TableName: LISTINGS_TABLE,
      Key: { listingId },
      UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt, #reviewedAt = :reviewedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#updatedAt': 'updatedAt',
        '#reviewedAt': 'reviewedAt'
      },
      ExpressionAttributeValues: {
        ':status': newStatus,
        ':updatedAt': now,
        ':reviewedAt': now
      }
    }))
    
    // Send confirmation email to seller
    try {
      await sendSellerNotification(listing, newStatus)
    } catch (emailError) {
      console.error('Error sending seller notification:', emailError)
      // Don't fail the approval if email fails
    }
    
    const carTitle = `${listing.car.make} ${listing.car.model} ${listing.car.registrationYear}`
    
    if (action === 'approve') {
      return htmlResponse(200, `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Listing Approved - InspectionWale</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            h1 { color: #27ae60; }
            p { color: #555; line-height: 1.6; }
            a { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 4px; }
            .car-info { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Listing Approved!</h1>
            <p>The listing has been successfully approved and is now live on the website.</p>
            <div class="car-info">
              <strong>Car:</strong> ${carTitle}<br>
              <strong>Listing ID:</strong> ${listingId}<br>
              <strong>Seller:</strong> ${listing.seller.name} (${listing.seller.mobile})
            </div>
            <p>The seller will receive a confirmation email shortly.</p>
            <a href="${WEBSITE_URL}">View Live Website</a>
          </div>
        </body>
        </html>
      `)
    } else {
      return htmlResponse(200, `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Listing Rejected - InspectionWale</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            h1 { color: #e74c3c; }
            p { color: #555; line-height: 1.6; }
            a { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 4px; }
            .car-info { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Listing Rejected</h1>
            <p>The listing has been rejected and will not appear on the website.</p>
            <div class="car-info">
              <strong>Car:</strong> ${carTitle}<br>
              <strong>Listing ID:</strong> ${listingId}<br>
              <strong>Seller:</strong> ${listing.seller.name} (${listing.seller.mobile})
            </div>
            <p>The data has been kept in the database with status "rejected".</p>
            <a href="${WEBSITE_URL}">Back to Website</a>
          </div>
        </body>
        </html>
      `)
    }
    
  } catch (error) {
    console.error('Error processing approval:', error)
    return htmlResponse(500, `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - InspectionWale</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          h1 { color: #e74c3c; }
          p { color: #555; line-height: 1.6; }
          a { color: #3498db; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ Error</h1>
          <p>An error occurred while processing your request.</p>
          <p>Please try again or contact support if the problem persists.</p>
          <p><a href="${WEBSITE_URL}">← Back to InspectionWale</a></p>
        </div>
      </body>
      </html>
    `)
  }
}

async function sendSellerNotification(listing, status) {
  if (!listing.seller.email) return
  
  const carTitle = `${listing.car.make} ${listing.car.model} ${listing.car.registrationYear}`
  const isApproved = status === 'approved'
  
  const subject = isApproved 
    ? '✅ Your Car Listing is Now Live - InspectionWale'
    : '❌ Your Car Listing Was Not Approved - InspectionWale'
  
  const htmlBody = isApproved ? `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px;">
        <h1 style="color: #27ae60; margin-top: 0;">🎉 Great News!</h1>
        <p style="color: #555; line-height: 1.6;">Hi ${listing.seller.name},</p>
        <p style="color: #555; line-height: 1.6;">Your car listing has been approved and is now live on InspectionWale!</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Your Listing:</h3>
          <p style="margin: 5px 0; color: #555;"><strong>Car:</strong> ${carTitle}</p>
          <p style="margin: 5px 0; color: #555;"><strong>Edition:</strong> ${listing.car.edition || 'Standard'}</p>
          <p style="margin: 5px 0; color: #555;"><strong>Kilometers:</strong> ${listing.car.kmsDriven} km</p>
          <p style="margin: 5px 0; color: #555;"><strong>Price:</strong> ₹${listing.car.expectedPrice}</p>
        </div>
        <p style="color: #555; line-height: 1.6;">Potential buyers can now see your listing and contact you directly.</p>
        <p style="color: #555; line-height: 1.6;"><strong>What happens next?</strong></p>
        <ul style="color: #555; line-height: 1.8;">
          <li>Your listing is visible to all visitors</li>
          <li>Buyers can reserve your car through the website</li>
          <li>We'll notify you when someone shows interest</li>
          <li>You'll handle the sale directly with the buyer</li>
        </ul>
        <a href="${WEBSITE_URL}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 4px;">View Your Listing</a>
        <p style="color: #999; font-size: 14px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          Best regards,<br>
          InspectionWale Team<br>
          <a href="${WEBSITE_URL}" style="color: #3498db;">www.inspectionwale.com</a>
        </p>
      </div>
    </body>
    </html>
  ` : `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px;">
        <h1 style="color: #e74c3c; margin-top: 0;">Listing Not Approved</h1>
        <p style="color: #555; line-height: 1.6;">Hi ${listing.seller.name},</p>
        <p style="color: #555; line-height: 1.6;">Unfortunately, we were unable to approve your car listing at this time.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Your Submission:</h3>
          <p style="margin: 5px 0; color: #555;"><strong>Car:</strong> ${carTitle}</p>
          <p style="margin: 5px 0; color: #555;"><strong>Submitted:</strong> ${new Date(listing.createdAt).toLocaleDateString('en-IN')}</p>
        </div>
        <p style="color: #555; line-height: 1.6;"><strong>Common reasons for rejection:</strong></p>
        <ul style="color: #555; line-height: 1.8;">
          <li>Incomplete or unclear photos</li>
          <li>Incorrect vehicle information</li>
          <li>Duplicate listing detected</li>
          <li>Quality standards not met</li>
        </ul>
        <p style="color: #555; line-height: 1.6;">If you'd like to resubmit with corrections, please feel free to create a new listing.</p>
        <a href="${WEBSITE_URL}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 4px;">Visit Website</a>
        <p style="color: #999; font-size: 14px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          Questions? Reply to this email or contact support.<br><br>
          Best regards,<br>
          InspectionWale Team<br>
          <a href="${WEBSITE_URL}" style="color: #3498db;">www.inspectionwale.com</a>
        </p>
      </div>
    </body>
    </html>
  `
  
  await sesClient.send(new SendEmailCommand({
    Source: SES_FROM,
    Destination: { ToAddresses: [listing.seller.email] },
    Message: {
      Subject: { Data: subject },
      Body: {
        Html: { Data: htmlBody }
      }
    }
  }))
}

exports.generateToken = generateToken // Export for use in other Lambda
