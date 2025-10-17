/**
 * Lambda Function: C2C Marketplace Inquiry Handler
 * Receives customer requirements for car marketplace and sends email via SES
 */

const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({ region: process.env.AWS_REGION || "us-east-1" });

exports.handler = async (event) => {
    console.log("C2C Inquiry received:", JSON.stringify(event, null, 2));

    // Handle CORS preflight
    if (event.requestContext?.http?.method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    try {
        // Parse the request body
        let body;
        if (typeof event.body === 'string') {
            body = JSON.parse(event.body);
        } else {
            body = event.body;
        }

        // Validate required fields
        const { budget, name, number, location } = body;
        if (!budget || !name || !number || !location) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: 'Missing required fields: budget, name, number, and location are required' 
                })
            };
        }

        // Validate mobile number format
        const mobileRegex = /^0?\d{10}$/;
        if (!mobileRegex.test(number.replace(/\s/g, ''))) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: 'Invalid mobile number format. Please provide a 10-digit number.' 
                })
            };
        }

        // Extract all fields with defaults
        const {
            email = '',
            preferredMake = 'Any',
            preferredModel = 'Any',
            fuelType = 'Any',
            additionalComments = ''
        } = body;

        // Format budget with Indian number system
        const formattedBudget = '₹' + parseInt(budget).toLocaleString('en-IN');

        // Build email content
        const emailSubject = `🚗 C2C Marketplace Inquiry - ${name}`;
        
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0B2154; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
        .field { margin-bottom: 15px; padding: 10px; background: white; border-left: 4px solid #D81324; }
        .label { font-weight: bold; color: #0B2154; }
        .value { color: #333; margin-top: 5px; }
        .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        .highlight { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🚗 Customer-to-Customer Marketplace Inquiry</h2>
            <p style="margin: 0;">New car requirement received</p>
        </div>
        <div class="content">
            <div class="highlight">
                <strong>💰 Budget:</strong> ${formattedBudget}
            </div>
            
            <h3 style="color: #0B2154; border-bottom: 2px solid #D81324; padding-bottom: 10px;">Customer Details</h3>
            <div class="field">
                <div class="label">Name</div>
                <div class="value">${name}</div>
            </div>
            <div class="field">
                <div class="label">Mobile Number</div>
                <div class="value">${number}</div>
            </div>
            ${email ? `
            <div class="field">
                <div class="label">Email</div>
                <div class="value">${email}</div>
            </div>` : ''}
            <div class="field">
                <div class="label">Location</div>
                <div class="value">${location}</div>
            </div>
            
            <h3 style="color: #0B2154; border-bottom: 2px solid #D81324; padding-bottom: 10px; margin-top: 30px;">Car Preferences</h3>
            <div class="field">
                <div class="label">Preferred Make</div>
                <div class="value">${preferredMake}</div>
            </div>
            <div class="field">
                <div class="label">Preferred Model</div>
                <div class="value">${preferredModel}</div>
            </div>
            <div class="field">
                <div class="label">Fuel Type</div>
                <div class="value">${fuelType}</div>
            </div>
            
            ${additionalComments ? `
            <h3 style="color: #0B2154; border-bottom: 2px solid #D81324; padding-bottom: 10px; margin-top: 30px;">Additional Requirements</h3>
            <div class="field">
                <div class="value">${additionalComments.replace(/\n/g, '<br>')}</div>
            </div>` : ''}
            
            <div class="footer">
                <p><strong>inspectionWale</strong> - Customer-to-Customer Car Marketplace</p>
                <p>Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        const emailText = `
C2C Marketplace Inquiry - inspectionWale
=========================================

BUDGET: ${formattedBudget}

CUSTOMER DETAILS
----------------
Name: ${name}
Mobile: ${number}
${email ? `Email: ${email}` : ''}
Location: ${location}

CAR PREFERENCES
---------------
Preferred Make: ${preferredMake}
Preferred Model: ${preferredModel}
Fuel Type: ${fuelType}

${additionalComments ? `ADDITIONAL REQUIREMENTS\n-----------------------\n${additionalComments}\n` : ''}

Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST

---
inspectionWale - Customer-to-Customer Car Marketplace
        `;

        // Send email via SES
        const params = {
            Source: 'inspectionwale@zohomail.in',
            Destination: {
                ToAddresses: ['inspectionwale@zohomail.in']
            },
            Message: {
                Subject: {
                    Data: emailSubject,
                    Charset: 'UTF-8'
                },
                Body: {
                    Html: {
                        Data: emailHtml,
                        Charset: 'UTF-8'
                    },
                    Text: {
                        Data: emailText,
                        Charset: 'UTF-8'
                    }
                }
            }
        };

        const command = new SendEmailCommand(params);
        await ses.send(command);

        console.log('C2C inquiry email sent successfully');

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                ok: true,
                message: 'Inquiry submitted successfully. We will contact you soon!'
            })
        };

    } catch (error) {
        console.error('Error processing C2C inquiry:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'Failed to process inquiry. Please try again later.',
                details: error.message 
            })
        };
    }
};
