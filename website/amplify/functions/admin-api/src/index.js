const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  DynamoDBDocumentClient, 
  ScanCommand, 
  GetCommand, 
  UpdateCommand 
} = require('@aws-sdk/lib-dynamodb');

const REGION = process.env.AWS_REGION || 'ap-south-1';

const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient, { 
  marshallOptions: { convertEmptyValues: true, removeUndefinedValues: true } 
});

// Table names from environment
const PAYMENTS_TABLE = process.env.PAYMENTS_TABLE || 'InspectionPayments';
const LISTINGS_TABLE = process.env.LISTINGS_TABLE || 'CarListings';
const REPORTS_TABLE = process.env.REPORTS_TABLE || 'inspectionwale-inspections';

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}

function getPath(event) {
  return (
    (event.requestContext?.http?.path) ||
    event.rawPath ||
    event.path ||
    '/'
  );
}

function getMethod(event) {
  return (
    (event.requestContext?.http?.method) ||
    event.httpMethod ||
    'GET'
  );
}

function parseBody(event) {
  if (!event.body) return {};
  try {
    const body = event.isBase64Encoded 
      ? Buffer.from(event.body, 'base64').toString('utf8') 
      : event.body;
    return JSON.parse(body);
  } catch (e) {
    return {};
  }
}

// Extract ID from path like /admin/payments/BOOKING-123
function extractIdFromPath(path, prefix) {
  const match = path.match(new RegExp(`${prefix}/([^/]+)$`));
  return match ? decodeURIComponent(match[1]) : null;
}

// ===================== PAYMENTS =====================
async function listPayments() {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: PAYMENTS_TABLE
    }));
    
    // Sort by createdAt descending
    const items = (result.Items || []).sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    
    return response(200, { ok: true, items });
  } catch (error) {
    console.error('Error listing payments:', error);
    return response(500, { ok: false, error: 'Failed to list payments' });
  }
}

async function updatePayment(bookingId, updates) {
  try {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'bookingId') {
        const attrName = `#${key}`;
        const attrValue = `:${key}`;
        updateExpressions.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] = value;
      }
    });
    
    // Add updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    
    if (updateExpressions.length === 0) {
      return response(400, { ok: false, error: 'No updates provided' });
    }
    
    await docClient.send(new UpdateCommand({
      TableName: PAYMENTS_TABLE,
      Key: { bookingId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }));
    
    return response(200, { ok: true, message: 'Payment updated' });
  } catch (error) {
    console.error('Error updating payment:', error);
    return response(500, { ok: false, error: 'Failed to update payment' });
  }
}

// ===================== LISTINGS =====================
async function listListings() {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: LISTINGS_TABLE
    }));
    
    // Sort by createdAt descending
    const items = (result.Items || []).sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    
    return response(200, { ok: true, items });
  } catch (error) {
    console.error('Error listing listings:', error);
    return response(500, { ok: false, error: 'Failed to list listings' });
  }
}

async function updateListing(listingId, updates) {
  try {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    
    // Handle nested seller object if seller name/mobile are provided
    if (updates.sellerName || updates.sellerMobile) {
      // First get the current item to merge seller data
      const getResult = await docClient.send(new GetCommand({
        TableName: LISTINGS_TABLE,
        Key: { listingId }
      }));
      
      const currentSeller = getResult.Item?.seller || {};
      const newSeller = {
        ...currentSeller,
        name: updates.sellerName || currentSeller.name,
        mobile: updates.sellerMobile || currentSeller.mobile
      };
      
      updateExpressions.push('#seller = :seller');
      expressionAttributeNames['#seller'] = 'seller';
      expressionAttributeValues[':seller'] = newSeller;
      
      // Remove from updates to avoid duplication
      delete updates.sellerName;
      delete updates.sellerMobile;
    }
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'listingId') {
        const attrName = `#${key}`;
        const attrValue = `:${key}`;
        updateExpressions.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] = value;
      }
    });
    
    // Add updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    
    if (updateExpressions.length === 0) {
      return response(400, { ok: false, error: 'No updates provided' });
    }
    
    await docClient.send(new UpdateCommand({
      TableName: LISTINGS_TABLE,
      Key: { listingId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }));
    
    return response(200, { ok: true, message: 'Listing updated' });
  } catch (error) {
    console.error('Error updating listing:', error);
    return response(500, { ok: false, error: 'Failed to update listing' });
  }
}

// ===================== REPORTS =====================
async function listReports() {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: REPORTS_TABLE
    }));
    
    // Filter out type=INSPECTION items (those are CRUD records), keep only actual report records
    // Also filter out the index record
    const items = (result.Items || [])
      .filter(item => item.reportId !== 'INSPECTION_INDEX' && item.timestamp !== 'LATEST')
      .sort((a, b) => {
        return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
      });
    
    return response(200, { ok: true, items });
  } catch (error) {
    console.error('Error listing reports:', error);
    return response(500, { ok: false, error: 'Failed to list reports' });
  }
}

async function updateReport(reportId, updates) {
  try {
    // Reports table has composite key (reportId, timestamp)
    const timestamp = updates.timestamp;
    if (!timestamp) {
      return response(400, { ok: false, error: 'timestamp is required for report updates' });
    }
    
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    
    delete updates.timestamp; // Remove from updates since it's a key
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'reportId') {
        const attrName = `#${key}`;
        const attrValue = `:${key}`;
        updateExpressions.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] = value;
      }
    });
    
    if (updateExpressions.length === 0) {
      return response(400, { ok: false, error: 'No updates provided' });
    }
    
    await docClient.send(new UpdateCommand({
      TableName: REPORTS_TABLE,
      Key: { reportId, timestamp },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }));
    
    return response(200, { ok: true, message: 'Report updated' });
  } catch (error) {
    console.error('Error updating report:', error);
    return response(500, { ok: false, error: 'Failed to update report' });
  }
}

// ===================== MAIN HANDLER =====================
exports.handler = async (event) => {
  console.log('Admin API Event:', JSON.stringify(event, null, 2));
  
  const method = getMethod(event);
  const path = getPath(event);
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return response(200, { ok: true });
  }
  
  // Route handlers
  try {
    // Payments endpoints
    if (path === '/admin/payments' && method === 'GET') {
      return await listPayments();
    }
    
    if (path.startsWith('/admin/payments/') && method === 'PUT') {
      const bookingId = extractIdFromPath(path, '/admin/payments');
      if (!bookingId) {
        return response(400, { ok: false, error: 'Missing bookingId' });
      }
      const body = parseBody(event);
      return await updatePayment(bookingId, body);
    }
    
    // Listings endpoints
    if (path === '/admin/listings' && method === 'GET') {
      return await listListings();
    }
    
    if (path.startsWith('/admin/listings/') && method === 'PUT') {
      const listingId = extractIdFromPath(path, '/admin/listings');
      if (!listingId) {
        return response(400, { ok: false, error: 'Missing listingId' });
      }
      const body = parseBody(event);
      return await updateListing(listingId, body);
    }
    
    // Reports endpoints
    if (path === '/admin/reports' && method === 'GET') {
      return await listReports();
    }
    
    if (path.startsWith('/admin/reports/') && method === 'PUT') {
      const reportId = extractIdFromPath(path, '/admin/reports');
      if (!reportId) {
        return response(400, { ok: false, error: 'Missing reportId' });
      }
      const body = parseBody(event);
      return await updateReport(reportId, body);
    }
    
    return response(404, { ok: false, error: 'Not found' });
  } catch (error) {
    console.error('Handler error:', error);
    return response(500, { ok: false, error: error.message });
  }
};
