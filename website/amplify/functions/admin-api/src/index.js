const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  DynamoDBDocumentClient, 
  ScanCommand, 
  GetCommand, 
  UpdateCommand,
  PutCommand,
  DeleteCommand
} = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
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
const s3Client = new S3Client({ region: REGION });

// Table names from environment
const PAYMENTS_TABLE = process.env.PAYMENTS_TABLE || 'InspectionPayments';
const LISTINGS_TABLE = process.env.LISTINGS_TABLE || 'CarListings';
const REPORTS_TABLE = process.env.REPORTS_TABLE || 'inspectionwale-inspections';
const INSPECTIONS_TABLE = process.env.INSPECTIONS_TABLE || REPORTS_TABLE;
const LEADS_TABLE = process.env.LEADS_TABLE || process.env.QUOTES_TABLE || process.env.STORAGE_QUOTES_NAME;
const LISTINGS_BUCKET = process.env.CAR_LISTINGS_BUCKET || process.env.LISTINGS_BUCKET || 'inspectionwale-car-listings';
const LISTINGS_CDN_BASE = trimTrailingSlash(process.env.CAR_LISTINGS_CDN || process.env.LISTINGS_CDN_URL || '');
const REPORT_GENERATOR_URL = process.env.REPORT_GENERATOR_URL || 'https://mfy5ajp4e5lggmqypfbco34dd40ugreq.lambda-url.us-east-1.on.aws/';
const LATEST_TS = 'LATEST';
const INSPECTION_INDEX_PK = 'INSPECTION_INDEX';
const LISTING_PHOTO_SLOTS = [
  'exteriorFront',
  'exteriorBack',
  'exteriorLeft',
  'exteriorRight',
  'driverCabin',
  'rearCabin',
  'bootSpace',
  'rcDocument',
  'cngPlate'
];

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
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

function trimTrailingSlash(value) {
  if (!value) return '';
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function normaliseString(value) {
  return (value === undefined || value === null ? '' : String(value)).trim();
}

function toBoolean(value) {
  return value === true || value === 'true' || value === '1' || value === 1;
}

function guessExtension(contentType = '') {
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'image/avif': 'avif',
    'application/pdf': 'pdf'
  };
  return map[String(contentType).toLowerCase()] || 'jpg';
}

function buildListingPhotoPublicUrl(photo) {
  if (!photo) return '';
  if (typeof photo === 'string') return photo;
  if (photo.publicUrl) return photo.publicUrl;
  if (photo.url) return photo.url;
  if (photo.key && LISTINGS_CDN_BASE) return `${LISTINGS_CDN_BASE}/${photo.key}`;
  if (photo.key && LISTINGS_BUCKET) return `https://${LISTINGS_BUCKET}.s3.amazonaws.com/${photo.key}`;
  return '';
}

function normalizeListingPhotos(photos) {
  const source = photos && typeof photos === 'object' ? photos : {};
  return Object.entries(source).reduce((acc, [slot, photo]) => {
    if (!slot || !photo) return acc;
    if (typeof photo === 'string') {
      acc[slot] = {
        key: photo,
        publicUrl: photo,
        url: photo
      };
      return acc;
    }

    const normalized = {
      key: normaliseString(photo.key),
      contentType: normaliseString(photo.contentType),
      originalName: normaliseString(photo.originalName),
      uploadedAt: normaliseString(photo.uploadedAt)
    };
    const publicUrl = buildListingPhotoPublicUrl(photo);
    if (publicUrl) {
      normalized.publicUrl = publicUrl;
      normalized.url = publicUrl;
    }
    acc[slot] = normalized;
    return acc;
  }, {});
}

function enrichListingForAdmin(item) {
  const photos = normalizeListingPhotos(item.photos || {});
  const adminListingId = normaliseString(item.listingId || item.submissionId || item.id);
  return {
    ...item,
    listingId: adminListingId,
    adminListingId,
    submissionId: normaliseString(item.submissionId || adminListingId),
    photos,
    display: item.display || {},
    car: item.car || {},
    seller: item.seller || {},
    carName: item.carName || [item.car?.make, item.car?.model, item.car?.edition].filter(Boolean).join(' '),
    year: item.year || item.car?.registrationYear || '',
    askingPrice: item.askingPrice || item.car?.expectedPrice || '',
    kilometers: item.kilometers || item.car?.kmsDriven || '',
    location: item.location || item.display?.location || item.car?.location || item.car?.city || ''
  };
}

function validateListingRecord(item) {
  if (!normaliseString(item.seller?.name) || !normaliseString(item.seller?.mobile)) {
    return 'seller_details_required';
  }

  if (!normaliseString(item.car?.make) || !normaliseString(item.car?.model) || !normaliseString(item.car?.registrationYear) || !normaliseString(item.car?.kmsDriven) || !normaliseString(item.car?.expectedPrice) || !normaliseString(item.car?.location)) {
    return 'car_details_incomplete';
  }

  return '';
}

function buildListingRecord(input, existingItem = {}) {
  const now = new Date().toISOString();
  const currentCar = existingItem.car || {};
  const currentSeller = existingItem.seller || {};
  const currentDisplay = existingItem.display || {};
  const currentPhotos = normalizeListingPhotos(existingItem.photos || {});
  const incomingCar = input.car || {};
  const incomingSeller = input.seller || {};
  const incomingDisplay = input.display || {};
  const incomingPhotos = normalizeListingPhotos(input.photos || {});

  const seller = {
    name: normaliseString(incomingSeller.name || input.sellerName || currentSeller.name || existingItem.sellerName),
    mobile: normaliseString(incomingSeller.mobile || input.sellerMobile || currentSeller.mobile || existingItem.sellerMobile),
    email: normaliseString(incomingSeller.email || input.sellerEmail || currentSeller.email || existingItem.sellerEmail),
    type: normaliseString(incomingSeller.type || input.sellerType || currentSeller.type || existingItem.sellerType) || 'Individual'
  };

  const car = {
    make: normaliseString(incomingCar.make || input.brand || currentCar.make || existingItem.brand),
    model: normaliseString(incomingCar.model || input.model || currentCar.model || existingItem.model),
    edition: normaliseString(incomingCar.edition || input.edition || currentCar.edition),
    variant: normaliseString(incomingCar.variant || input.variant || currentCar.variant),
    registrationYear: normaliseString(incomingCar.registrationYear || input.year || currentCar.registrationYear || existingItem.year),
    kmsDriven: normaliseString(incomingCar.kmsDriven || input.kilometers || input.km || currentCar.kmsDriven || existingItem.kilometers),
    expectedPrice: normaliseString(incomingCar.expectedPrice || input.askingPrice || input.price || currentCar.expectedPrice || existingItem.askingPrice),
    location: normaliseString(incomingCar.location || input.location || currentCar.location || existingItem.location),
    city: normaliseString(incomingCar.city || input.city || currentCar.city || existingItem.location || currentCar.location),
    fuelType: normaliseString(incomingCar.fuelType || input.fuelType || currentCar.fuelType),
    numberOfOwners: normaliseString(incomingCar.numberOfOwners || input.numberOfOwners || currentCar.numberOfOwners),
    insuranceValidity: normaliseString(incomingCar.insuranceValidity || input.insuranceValidity || currentCar.insuranceValidity),
    transmissionType: normaliseString(incomingCar.transmissionType || input.transmissionType || currentCar.transmissionType),
    airbags: normaliseString(incomingCar.airbags || input.airbags || currentCar.airbags),
    accidentalHistory: input.car ? toBoolean(incomingCar.accidentalHistory) : toBoolean(currentCar.accidentalHistory),
    warrantyAvailable: input.car ? toBoolean(incomingCar.warrantyAvailable) : toBoolean(currentCar.warrantyAvailable),
    spareKeyAvailable: input.car ? toBoolean(incomingCar.spareKeyAvailable) : toBoolean(currentCar.spareKeyAvailable),
    cruiseControl: input.car ? toBoolean(incomingCar.cruiseControl) : toBoolean(currentCar.cruiseControl),
    parkingAssistant: input.car ? toBoolean(incomingCar.parkingAssistant) : toBoolean(currentCar.parkingAssistant),
    audioSystemWorking: input.car ? toBoolean(incomingCar.audioSystemWorking) : toBoolean(currentCar.audioSystemWorking),
    abs: input.car ? toBoolean(incomingCar.abs) : toBoolean(currentCar.abs),
    sunroof: input.car ? toBoolean(incomingCar.sunroof) : toBoolean(currentCar.sunroof),
    serviceRecords: input.car ? toBoolean(incomingCar.serviceRecords) : toBoolean(currentCar.serviceRecords)
  };

  const display = {
    location: normaliseString(incomingDisplay.location || input.displayLocation || currentDisplay.location || car.location || car.city),
    summary: normaliseString(incomingDisplay.summary || input.summary || currentDisplay.summary)
  };

  const listingId = normaliseString(input.listingId || existingItem.listingId || `admin_${crypto.randomUUID()}`);
  const headline = normaliseString(input.headline || existingItem.headline || [car.make, car.model, car.edition].filter(Boolean).join(' '));
  const location = normaliseString(input.location || display.location || car.location || car.city);
  const photos = Object.keys(incomingPhotos).length ? incomingPhotos : currentPhotos;

  return {
    ...existingItem,
    listingId,
    submissionId: normaliseString(input.submissionId || existingItem.submissionId || listingId),
    status: normaliseString(input.status || existingItem.status) || 'approved',
    createdAt: existingItem.createdAt || now,
    updatedAt: now,
    sellerName: seller.name,
    sellerEmail: seller.email,
    sellerMobile: seller.mobile,
    sellerType: seller.type,
    location,
    seller,
    car,
    carName: [car.make, car.model, car.edition].filter(Boolean).join(' '),
    brand: car.make,
    model: car.model,
    year: car.registrationYear,
    askingPrice: car.expectedPrice,
    kilometers: car.kmsDriven,
    headline,
    display,
    photos,
    notes: normaliseString(input.notes || existingItem.notes)
  };
}

async function buildListingUploadRequest(body) {
  const files = Array.isArray(body.files) ? body.files : [];
  if (!files.length) {
    return response(400, { ok: false, error: 'files_required' });
  }

  if (!LISTINGS_BUCKET) {
    return response(500, { ok: false, error: 'bucket_not_configured' });
  }

  const invalid = files.find((file) => !file || !LISTING_PHOTO_SLOTS.includes(file.slot));
  if (invalid) {
    return response(400, { ok: false, error: `invalid_slot_${invalid.slot}` });
  }

  const listingId = normaliseString(body.listingId || body.submissionId || `admin_${crypto.randomUUID()}`);
  const uploads = await Promise.all(files.map(async (file) => {
    const contentType = normaliseString(file.contentType) || 'image/jpeg';
    const extension = guessExtension(contentType);
    const key = `submissions/${listingId}/${file.slot}.${extension}`;
    const uploadUrl = await getSignedUrl(s3Client, new PutObjectCommand({
      Bucket: LISTINGS_BUCKET,
      Key: key,
      ContentType: contentType
    }), { expiresIn: 900 });
    const publicUrl = LISTINGS_CDN_BASE
      ? `${LISTINGS_CDN_BASE}/${key}`
      : `https://${LISTINGS_BUCKET}.s3.amazonaws.com/${key}`;

    return {
      slot: file.slot,
      key,
      contentType,
      uploadUrl,
      publicUrl,
      originalName: normaliseString(file.originalName)
    };
  }));

  return response(200, { ok: true, listingId, uploads });
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
    }).map(enrichListingForAdmin);
    
    return response(200, { ok: true, items });
  } catch (error) {
    console.error('Error listing listings:', error);
    return response(500, { ok: false, error: 'Failed to list listings' });
  }
}

async function findListingByIdentifier(identifier) {
  const normalizedIdentifier = normaliseString(identifier);
  if (!normalizedIdentifier) {
    return null;
  }

  const directResult = await docClient.send(new GetCommand({
    TableName: LISTINGS_TABLE,
    Key: { listingId: normalizedIdentifier }
  }));

  if (directResult.Item) {
    return {
      item: directResult.Item,
      listingId: normaliseString(directResult.Item.listingId || normalizedIdentifier)
    };
  }

  const fallbackResult = await docClient.send(new ScanCommand({
    TableName: LISTINGS_TABLE,
    FilterExpression: '#submissionId = :identifier OR #legacyId = :identifier',
    ExpressionAttributeNames: {
      '#submissionId': 'submissionId',
      '#legacyId': 'id'
    },
    ExpressionAttributeValues: {
      ':identifier': normalizedIdentifier
    },
    Limit: 1
  }));

  const fallbackItem = (fallbackResult.Items || [])[0];
  if (!fallbackItem) {
    return null;
  }

  const resolvedListingId = normaliseString(fallbackItem.listingId || fallbackItem.submissionId || fallbackItem.id);
  if (!resolvedListingId) {
    return null;
  }

  return {
    item: fallbackItem,
    listingId: resolvedListingId
  };
}

async function createListing(body) {
  try {
    const item = buildListingRecord(body, {});
    const validationError = validateListingRecord(item);
    if (validationError) {
      return response(400, { ok: false, error: validationError });
    }

    await docClient.send(new PutCommand({
      TableName: LISTINGS_TABLE,
      Item: item
    }));

    return response(200, { ok: true, item: enrichListingForAdmin(item), message: 'Listing created' });
  } catch (error) {
    console.error('Error creating listing:', error);
    return response(500, { ok: false, error: 'Failed to create listing' });
  }
}

async function updateListing(listingId, updates) {
  try {
    const existingRecord = await findListingByIdentifier(listingId);

    if (!existingRecord) {
      return response(404, { ok: false, error: 'Listing not found' });
    }

    const item = buildListingRecord({ ...updates, listingId: existingRecord.listingId }, existingRecord.item);
    const validationError = validateListingRecord(item);
    if (validationError) {
      return response(400, { ok: false, error: validationError });
    }

    await docClient.send(new PutCommand({
      TableName: LISTINGS_TABLE,
      Item: item
    }));

    return response(200, { ok: true, item: enrichListingForAdmin(item), message: 'Listing updated' });
  } catch (error) {
    console.error('Error updating listing:', error);
    return response(500, { ok: false, error: 'Failed to update listing' });
  }
}

async function deleteListing(listingId) {
  try {
    const existing = await findListingByIdentifier(listingId);

    if (!existing) {
      return response(404, { ok: false, error: 'Listing not found' });
    }

    const photos = Object.values(existing.item.photos || {}).filter(Boolean);
    if (LISTINGS_BUCKET && photos.length) {
      await Promise.allSettled(photos.map((photo) => {
        const key = typeof photo === 'string' ? '' : normaliseString(photo.key);
        if (!key) return Promise.resolve();
        return s3Client.send(new DeleteObjectCommand({ Bucket: LISTINGS_BUCKET, Key: key }));
      }));
    }

    await docClient.send(new DeleteCommand({
      TableName: LISTINGS_TABLE,
      Key: { listingId: existing.listingId }
    }));

    return response(200, { ok: true, message: 'Listing deleted' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return response(500, { ok: false, error: 'Failed to delete listing' });
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

// ===================== LEADS =====================
async function listLeads() {
  try {
    if (!LEADS_TABLE) {
      return response(500, { ok: false, error: 'Leads table is not configured' });
    }

    const result = await docClient.send(new ScanCommand({
      TableName: LEADS_TABLE
    }));

    const items = (result.Items || [])
      .filter((item) => item && item.formType === 'partner-service-lead')
      .sort((a, b) => new Date(b.receivedAt || 0) - new Date(a.receivedAt || 0));

    return response(200, { ok: true, items });
  } catch (error) {
    console.error('Error listing leads:', error);
    return response(500, { ok: false, error: 'Failed to list leads' });
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

    if (path === '/admin/listings' && method === 'POST') {
      const body = parseBody(event);
      return await createListing(body);
    }

    if (path === '/admin/listings/uploads' && method === 'POST') {
      const body = parseBody(event);
      return await buildListingUploadRequest(body);
    }
    
    if (path.startsWith('/admin/listings/') && method === 'PUT') {
      const listingId = extractIdFromPath(path, '/admin/listings');
      if (!listingId) {
        return response(400, { ok: false, error: 'Missing listingId' });
      }
      const body = parseBody(event);
      return await updateListing(listingId, body);
    }

    if (path.startsWith('/admin/listings/') && method === 'DELETE') {
      const listingId = extractIdFromPath(path, '/admin/listings');
      if (!listingId) {
        return response(400, { ok: false, error: 'Missing listingId' });
      }
      return await deleteListing(listingId);
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

    if (path === '/admin/leads' && method === 'GET') {
      return await listLeads();
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
