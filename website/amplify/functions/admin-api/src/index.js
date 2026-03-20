const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  DynamoDBDocumentClient, 
  ScanCommand, 
  GetCommand, 
  UpdateCommand 
} = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const REGION = process.env.AWS_REGION || 'ap-south-1';
const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || 'inspectionwale-auth-secret-2026';
const TOKEN_TTL_SECONDS = Number(process.env.AUTH_TOKEN_TTL_SECONDS || 60 * 60 * 12);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'inspectionwale2024';

const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient, { 
  marshallOptions: { convertEmptyValues: true, removeUndefinedValues: true } 
});

// Table names from environment
const PAYMENTS_TABLE = process.env.PAYMENTS_TABLE || 'InspectionPayments';
const LISTINGS_TABLE = process.env.LISTINGS_TABLE || 'CarListings';
const REPORTS_TABLE = process.env.REPORTS_TABLE || 'inspectionwale-inspections';
const INSPECTIONS_TABLE = process.env.INSPECTIONS_TABLE || REPORTS_TABLE;
const REPORT_GENERATOR_URL = process.env.REPORT_GENERATOR_URL || 'https://mfy5ajp4e5lggmqypfbco34dd40ugreq.lambda-url.us-east-1.on.aws/';
const LATEST_TS = 'LATEST';
const INSPECTION_INDEX_PK = 'INSPECTION_INDEX';

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

function safeJsonParse(input, fallback = null) {
  try {
    return JSON.parse(input);
  } catch (_error) {
    return fallback;
  }
}

function encodeOffsetCursor(offset) {
  if (!Number.isFinite(offset) || offset < 0) return null;
  return Buffer.from(JSON.stringify({ offset }), 'utf8').toString('base64');
}

function decodeOffsetCursor(cursor) {
  if (!cursor) return 0;
  const raw = Buffer.from(String(cursor), 'base64').toString('utf8');
  const parsed = safeJsonParse(raw, null);
  const offset = Number(parsed && parsed.offset);
  return Number.isFinite(offset) && offset >= 0 ? offset : 0;
}

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(value) {
  const normalized = String(value)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function issueAdminToken(username) {
  const now = Math.floor(Date.now() / 1000);
  return signToken({
    sub: username,
    username,
    role: 'admin',
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  });
}

function verifyToken(authHeader, expectedRoles) {
  if (!authHeader || !String(authHeader).startsWith('Bearer ')) {
    return { ok: false, error: 'Missing bearer token' };
  }

  const token = String(authHeader).slice(7).trim();
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { ok: false, error: 'Invalid token format' };
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSignature) {
    return { ok: false, error: 'Invalid token signature' };
  }

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload));
  } catch (_error) {
    return { ok: false, error: 'Invalid token payload' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp <= now) {
    return { ok: false, error: 'Token expired' };
  }

  if (expectedRoles.length > 0 && !expectedRoles.includes(payload.role)) {
    return { ok: false, error: 'Forbidden' };
  }

  return { ok: true, payload };
}

function getAuthorizationHeader(event) {
  const headers = event.headers || {};
  for (const [key, value] of Object.entries(headers)) {
    if (String(key).toLowerCase() === 'authorization') {
      return value;
    }
  }
  return '';
}

function unauthorized(message = 'Unauthorized') {
  return response(401, { ok: false, error: message });
}

function forbidden(message = 'Forbidden') {
  return response(403, { ok: false, error: message });
}

function handleAdminLogin(event) {
  const body = parseBody(event);
  const username = String(body.username || '').trim();
  const password = String(body.password || '');

  if (!username || !password) {
    return response(400, { ok: false, error: 'Username and password are required' });
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return unauthorized('Invalid username or password');
  }

  return response(200, {
    ok: true,
    token: issueAdminToken(username),
    user: {
      username,
      role: 'admin',
    },
  });
}

function buildInspectionSummary(item) {
  const data = item && item.data && typeof item.data === 'object' ? item.data : {};
  const inspection = data.inspection && typeof data.inspection === 'object' ? data.inspection : {};
  const vehicle = data.vehicle && typeof data.vehicle === 'object' ? data.vehicle : {};

  return {
    inspectionId: String(item.reportId || inspection.id || ''),
    reportId: item.reportId,
    updatedAt: item.updatedAt || null,
    createdAt: item.createdAt || null,
    deletedAt: item.deletedAt || null,
    inspectorName: inspection.inspector_name || '',
    inspectionDate: inspection.date || '',
    location: inspection.location || '',
    registrationNumber: vehicle.registration_number || '',
    makeModel: vehicle.make_model || '',
  };
}

async function listInspections(cursor, limit) {
  try {
    const offset = decodeOffsetCursor(cursor);
    const boundedLimit = Math.max(1, Math.min(50, Number(limit || 20)));

    const indexResult = await docClient.send(new GetCommand({
      TableName: INSPECTIONS_TABLE,
      Key: { reportId: INSPECTION_INDEX_PK, timestamp: LATEST_TS }
    }));

    const rawIds = Array.isArray(indexResult.Item?.inspectionIds) ? indexResult.Item.inspectionIds : [];
    const seenIds = new Set();
    const idsNewestFirst = [];

    for (let index = rawIds.length - 1; index >= 0; index -= 1) {
      const inspectionId = String(rawIds[index] || '').trim();
      if (!inspectionId || seenIds.has(inspectionId)) continue;
      seenIds.add(inspectionId);
      idsNewestFirst.push(inspectionId);
    }

    const pageIds = idsNewestFirst.slice(offset, offset + boundedLimit);
    const items = await Promise.all(pageIds.map(async (inspectionId) => {
      const result = await docClient.send(new GetCommand({
        TableName: INSPECTIONS_TABLE,
        Key: { reportId: inspectionId, timestamp: LATEST_TS }
      }));
      return result.Item || null;
    }));

    const filteredItems = items.filter((item) => item && !item.deletedAt);
    const nextOffset = offset + pageIds.length;

    return response(200, {
      ok: true,
      items: filteredItems.map((item) => ({
        ...buildInspectionSummary(item),
        data: item.data || {},
      })),
      cursor: nextOffset < idsNewestFirst.length ? encodeOffsetCursor(nextOffset) : null,
    });
  } catch (error) {
    console.error('Error listing inspections:', error);
    return response(500, { ok: false, error: 'Failed to list inspections' });
  }
}

async function getInspection(inspectionId) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: INSPECTIONS_TABLE,
      Key: { reportId: inspectionId, timestamp: LATEST_TS }
    }));

    if (!result.Item || result.Item.deletedAt) {
      return response(404, { ok: false, error: 'Inspection not found' });
    }

    return response(200, {
      ok: true,
      item: {
        inspectionId,
        reportId: result.Item.reportId,
        timestamp: result.Item.timestamp,
        updatedAt: result.Item.updatedAt || null,
        createdAt: result.Item.createdAt || null,
        data: result.Item.data || {},
        summary: buildInspectionSummary(result.Item),
      }
    });
  } catch (error) {
    console.error('Error getting inspection:', error);
    return response(500, { ok: false, error: 'Failed to get inspection' });
  }
}

async function upsertInspection(inspectionId, payload) {
  try {
    const data = payload && typeof payload === 'object' ? payload : {};
    if (!data.inspection || typeof data.inspection !== 'object') {
      data.inspection = {};
    }
    data.inspection.id = inspectionId;

    const nowIso = new Date().toISOString();

    await docClient.send(new UpdateCommand({
      TableName: INSPECTIONS_TABLE,
      Key: { reportId: inspectionId, timestamp: LATEST_TS },
      UpdateExpression: 'SET #type = :type, #data = :data, updatedAt = :updatedAt, createdAt = if_not_exists(createdAt, :createdAt) REMOVE deletedAt',
      ExpressionAttributeNames: {
        '#type': 'type',
        '#data': 'data',
      },
      ExpressionAttributeValues: {
        ':type': 'INSPECTION',
        ':data': data,
        ':updatedAt': nowIso,
        ':createdAt': nowIso,
      }
    }));

    await docClient.send(new UpdateCommand({
      TableName: INSPECTIONS_TABLE,
      Key: { reportId: INSPECTION_INDEX_PK, timestamp: LATEST_TS },
      UpdateExpression: 'SET #type = :type, updatedAt = :updatedAt, inspectionIds = list_append(if_not_exists(inspectionIds, :empty), :ids)',
      ExpressionAttributeNames: {
        '#type': 'type'
      },
      ExpressionAttributeValues: {
        ':type': 'INSPECTION_INDEX',
        ':updatedAt': nowIso,
        ':empty': [],
        ':ids': [inspectionId],
      }
    }));

    return response(200, {
      ok: true,
      inspectionId,
      message: 'Inspection updated successfully',
    });
  } catch (error) {
    console.error('Error updating inspection:', error);
    return response(500, { ok: false, error: 'Failed to update inspection' });
  }
}

async function regenerateInspectionReport(inspectionId, payload) {
  try {
    let reportPayload = payload && typeof payload === 'object' ? payload : null;
    if (!reportPayload) {
      const inspectionResult = await docClient.send(new GetCommand({
        TableName: INSPECTIONS_TABLE,
        Key: { reportId: inspectionId, timestamp: LATEST_TS }
      }));

      if (!inspectionResult.Item || inspectionResult.Item.deletedAt) {
        return response(404, { ok: false, error: 'Inspection not found' });
      }

      reportPayload = inspectionResult.Item.data || {};
    }

    if (!reportPayload.inspection || typeof reportPayload.inspection !== 'object') {
      reportPayload.inspection = {};
    }
    reportPayload.inspection.id = inspectionId;

    const reportResponse = await fetch(REPORT_GENERATOR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${issueAdminToken(ADMIN_USERNAME)}`,
      },
      body: JSON.stringify(reportPayload)
    });

    const responseText = await reportResponse.text();
    const parsed = safeJsonParse(responseText, null);

    if (!reportResponse.ok || !parsed || !parsed.success) {
      return response(reportResponse.status || 500, {
        ok: false,
        error: (parsed && parsed.message) || `Failed to regenerate report (HTTP ${reportResponse.status})`
      });
    }

    return response(200, {
      ok: true,
      report: parsed,
    });
  } catch (error) {
    console.error('Error regenerating report:', error);
    return response(500, { ok: false, error: 'Failed to regenerate report' });
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

  if (path === '/admin/auth/login' && method === 'POST') {
    return handleAdminLogin(event);
  }

  const authCheck = verifyToken(getAuthorizationHeader(event), ['admin']);
  if (!authCheck.ok) {
    if (authCheck.error === 'Forbidden') {
      return forbidden(authCheck.error);
    }
    return unauthorized(authCheck.error);
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

    if (path === '/admin/inspections' && method === 'GET') {
      const cursor = event.queryStringParameters?.cursor;
      const limit = event.queryStringParameters?.limit;
      return await listInspections(cursor, limit);
    }

    if (path.startsWith('/admin/inspections/') && method === 'GET') {
      const inspectionId = extractIdFromPath(path, '/admin/inspections');
      if (!inspectionId) {
        return response(400, { ok: false, error: 'Missing inspectionId' });
      }
      return await getInspection(inspectionId);
    }

    if (path.startsWith('/admin/inspections/') && method === 'PUT') {
      const inspectionId = extractIdFromPath(path, '/admin/inspections');
      if (!inspectionId) {
        return response(400, { ok: false, error: 'Missing inspectionId' });
      }
      const body = parseBody(event);
      return await upsertInspection(inspectionId, body.data);
    }

    if (path.startsWith('/admin/inspection-regenerate/') && method === 'POST') {
      const inspectionId = extractIdFromPath(path, '/admin/inspection-regenerate');
      if (!inspectionId) {
        return response(400, { ok: false, error: 'Missing inspectionId' });
      }
      const body = parseBody(event);
      return await regenerateInspectionReport(inspectionId, body.data);
    }
    
    return response(404, { ok: false, error: 'Not found' });
  } catch (error) {
    console.error('Handler error:', error);
    return response(500, { ok: false, error: error.message });
  }
};
