/**
 * Inspection Bookings Lambda
 * Handles booking creation and payment tracking for car inspections
 * 
 * Endpoints:
 * - POST /inspection-bookings          - Create new booking, return Razorpay URL
 * - POST /inspection-bookings/webhook  - Razorpay webhook for payment status
 * - GET /inspection-bookings           - List all bookings (admin)
 * - GET /inspection-bookings/{id}      - Get single booking details
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, UpdateCommand, ScanCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

// Initialize DynamoDB
const ddbClient = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(ddbClient);

const TABLE_NAME = 'InspectionPayments';
const RAZORPAY_PAYMENT_PAGE = 'https://rzp.io/l/0vTqRioj9';
const INSPECTION_AMOUNT = 1399;

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Razorpay-Signature',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT'
};

function response(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
        },
        body: JSON.stringify(body)
    };
}

/**
 * Generate unique booking ID
 */
function generateBookingId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `IW-${timestamp}-${random}`.toUpperCase();
}

/**
 * Build Razorpay payment URL with prefilled data
 */
function buildRazorpayUrl(booking) {
    const params = new URLSearchParams();
    
    if (booking.customerName) {
        params.append('prefill[name]', booking.customerName);
    }
    if (booking.email) {
        params.append('prefill[email]', booking.email);
    }
    if (booking.mobile) {
        params.append('prefill[contact]', booking.mobile);
    }
    
    // Add booking reference in notes (Razorpay will show this)
    params.append('notes[booking_id]', booking.bookingId);
    params.append('notes[inspection_type]', booking.inspectionType);
    params.append('notes[car_details]', booking.carDetails || '');
    
    return `${RAZORPAY_PAYMENT_PAGE}?${params.toString()}`;
}

/**
 * Verify Razorpay webhook signature
 * Note: For Payment Pages, signature verification might be different
 * This is a placeholder - you may need to configure webhook secret in Razorpay
 */
function verifyRazorpaySignature(body, signature, secret) {
    if (!secret) return true; // Skip verification if no secret configured
    
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

/**
 * Create new booking
 */
async function createBooking(data) {
    const bookingId = generateBookingId();
    const now = new Date().toISOString();
    
    // Check if this is a pay-later booking
    const isPayLater = data.paymentMode === 'pay-later';
    
    const booking = {
        bookingId,
        customerName: data.name || data.customerName || '',
        email: data.email || '',
        mobile: data.mobile || '',
        address: data.address || '',
        inspectionType: data.inspectionType || data.carType || 'used-car',
        carMake: data.make || data.carMake || '',
        carModel: data.model || data.carModel || '',
        makeModel: data.makeModel || `${data.make || ''} ${data.model || ''}`.trim(),
        registrationYear: data.registrationYear || data.regYear || '',
        kmsDriven: data.kmsDriven || '',
        ownership: data.ownership || '',
        location: data.location || '',
        listingId: data.listingId || null,
        amount: INSPECTION_AMOUNT,
        status: isPayLater ? 'pay-later' : 'pending',
        paymentStatus: isPayLater ? 'pay-later' : 'pending',
        paymentMode: isPayLater ? 'pay-later' : 'online',
        razorpayPaymentId: null,
        razorpayOrderId: null,
        createdAt: now,
        updatedAt: now,
        source: data.source || 'website',
        formType: data.formType || 'unknown'
    };
    
    // Save to DynamoDB
    await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: booking
    }));
    
    // Build payment URL
    const paymentUrl = buildRazorpayUrl(booking);
    
    return {
        booking,
        paymentUrl
    };
}

/**
 * Handle Razorpay webhook
 */
async function handleWebhook(event) {
    const body = event.body;
    const signature = event.headers['x-razorpay-signature'] || event.headers['X-Razorpay-Signature'];
    
    // Parse webhook payload
    let payload;
    try {
        payload = JSON.parse(body);
    } catch (e) {
        return response(400, { error: 'Invalid JSON payload' });
    }
    
    console.log('[Webhook] Received:', JSON.stringify(payload, null, 2));
    
    // Razorpay Payment Page webhooks have different structure
    // Event types: payment_link.paid, payment_link.expired, etc.
    const eventType = payload.event;
    const paymentEntity = payload.payload?.payment?.entity || payload.payload?.payment_link?.entity;
    
    if (!paymentEntity) {
        console.log('[Webhook] No payment entity found');
        return response(200, { ok: true, message: 'No payment entity' });
    }
    
    // Extract booking ID from notes
    const notes = paymentEntity.notes || {};
    const bookingId = notes.booking_id;
    
    if (!bookingId) {
        console.log('[Webhook] No booking_id in notes');
        return response(200, { ok: true, message: 'No booking_id' });
    }
    
    // Update booking based on event type
    let paymentStatus = 'pending';
    let status = 'pending';
    
    if (eventType === 'payment_link.paid' || eventType === 'payment.captured') {
        paymentStatus = 'completed';
        status = 'confirmed';
    } else if (eventType === 'payment.failed') {
        paymentStatus = 'failed';
        status = 'payment_failed';
    } else if (eventType === 'payment_link.expired') {
        paymentStatus = 'expired';
        status = 'expired';
    }
    
    // Update DynamoDB record
    try {
        await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { bookingId },
            UpdateExpression: 'SET paymentStatus = :ps, #status = :s, razorpayPaymentId = :rpid, updatedAt = :ua',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':ps': paymentStatus,
                ':s': status,
                ':rpid': paymentEntity.id || null,
                ':ua': new Date().toISOString()
            }
        }));
        
        console.log(`[Webhook] Updated booking ${bookingId}: ${status}`);
    } catch (error) {
        console.error('[Webhook] Error updating booking:', error);
        return response(500, { error: 'Failed to update booking' });
    }
    
    return response(200, { ok: true, bookingId, status });
}

/**
 * List all bookings
 */
async function listBookings(queryParams) {
    const limit = parseInt(queryParams?.limit) || 50;
    const status = queryParams?.status;
    const inspectionType = queryParams?.inspectionType;
    
    let filterExpressions = [];
    let expressionValues = {};
    let expressionNames = {};
    
    if (status) {
        filterExpressions.push('#status = :status');
        expressionValues[':status'] = status;
        expressionNames['#status'] = 'status';
    }
    
    if (inspectionType) {
        filterExpressions.push('inspectionType = :inspectionType');
        expressionValues[':inspectionType'] = inspectionType;
    }
    
    const params = {
        TableName: TABLE_NAME,
        Limit: limit
    };
    
    if (filterExpressions.length > 0) {
        params.FilterExpression = filterExpressions.join(' AND ');
        params.ExpressionAttributeValues = expressionValues;
        if (Object.keys(expressionNames).length > 0) {
            params.ExpressionAttributeNames = expressionNames;
        }
    }
    
    const result = await docClient.send(new ScanCommand(params));
    
    // Sort by createdAt descending
    const items = (result.Items || []).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    return {
        ok: true,
        count: items.length,
        items
    };
}

/**
 * Get single booking
 */
async function getBooking(bookingId) {
    const result = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { bookingId }
    }));
    
    if (!result.Item) {
        return null;
    }
    
    return result.Item;
}

/**
 * Main handler
 */
exports.handler = async (event) => {
    console.log('[InspectionBookings] Event:', JSON.stringify(event, null, 2));
    
    const method = event.httpMethod || event.requestContext?.http?.method || 'GET';
    const path = event.path || event.rawPath || '/';
    
    // Handle OPTIONS for CORS preflight
    if (method === 'OPTIONS') {
        return response(200, { ok: true });
    }
    
    try {
        // Route: POST /inspection-bookings/webhook
        if (method === 'POST' && path.includes('/webhook')) {
            return await handleWebhook(event);
        }
        
        // Route: POST /inspection-bookings - Create booking
        if (method === 'POST') {
            let body;
            try {
                body = JSON.parse(event.body || '{}');
            } catch (e) {
                return response(400, { error: 'Invalid JSON body' });
            }
            
            // Validate required fields
            if (!body.name && !body.customerName) {
                return response(400, { error: 'Customer name is required' });
            }
            if (!body.mobile) {
                return response(400, { error: 'Mobile number is required' });
            }
            
            const result = await createBooking(body);
            return response(201, {
                ok: true,
                message: 'Booking created successfully',
                bookingId: result.booking.bookingId,
                paymentUrl: result.paymentUrl,
                amount: INSPECTION_AMOUNT
            });
        }
        
        // Route: GET /inspection-bookings/{id}
        if (method === 'GET' && event.pathParameters?.id) {
            const booking = await getBooking(event.pathParameters.id);
            if (!booking) {
                return response(404, { error: 'Booking not found' });
            }
            return response(200, { ok: true, booking });
        }
        
        // Route: GET /inspection-bookings - List all
        if (method === 'GET') {
            const queryParams = event.queryStringParameters || {};
            const result = await listBookings(queryParams);
            return response(200, result);
        }
        
        return response(405, { error: 'Method not allowed' });
        
    } catch (error) {
        console.error('[InspectionBookings] Error:', error);
        return response(500, { error: 'Internal server error', details: error.message });
    }
};
