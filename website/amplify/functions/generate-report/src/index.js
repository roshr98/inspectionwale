const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

let getSignedUrl;
try {
  // Optional dependency for presigned uploads.
  ({ getSignedUrl } = require('@aws-sdk/s3-request-presigner'));
} catch (_e) {
  getSignedUrl = null;
}

const { renderPdfFromPayload } = require('./templateRenderer');

const s3Client = new S3Client({});
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
  };
}

function json(statusCode, bodyObj) {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify(bodyObj),
  };
}

function getHeader(event, name) {
  const headers = event.headers || {};
  const lowerName = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (String(k).toLowerCase() === lowerName) return v;
  }
  return undefined;
}

function parseJsonBody(event) {
  if (!event || event.body == null) return null;
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : String(event.body);
  if (!raw.trim()) return null;
  return JSON.parse(raw);
}

function getPath(event) {
  return (
    (event && event.requestContext && event.requestContext.http && event.requestContext.http.path) ||
    event.rawPath ||
    '/'
  );
}

function getMethod(event) {
  return (event && event.requestContext && event.requestContext.http && event.requestContext.http.method) || 'GET';
}

function safeJsonParse(input, fallback = null) {
  try {
    return JSON.parse(input);
  } catch (_e) {
    return fallback;
  }
}

function decodeCursor(cursor) {
  if (!cursor) return undefined;
  const raw = Buffer.from(String(cursor), 'base64').toString('utf8');
  return safeJsonParse(raw, undefined);
}

function encodeCursor(key) {
  if (!key) return null;
  return Buffer.from(JSON.stringify(key), 'utf8').toString('base64');
}

function sanitizeFileName(name) {
  return String(name || 'image')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+/, '')
    .slice(0, 120) || 'image';
}

function stripLargeStrings(value, maxLen = 50_000) {
  if (typeof value === 'string') {
    if (value.startsWith('data:image/')) return '[IMAGE_DATA_STRIPPED]';
    if (value.length > maxLen) return value.slice(0, maxLen) + '…[TRUNCATED]';
    return value;
  }
  if (Array.isArray(value)) return value.map((v) => stripLargeStrings(v, maxLen));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = stripLargeStrings(v, maxLen);
    return out;
  }
  return value;
}

async function handleInspectionApi(event) {
  const tableName = process.env.INSPECTIONS_TABLE;
  if (!tableName) return json(500, { success: false, message: 'INSPECTIONS_TABLE is not configured.' });

  const method = getMethod(event);
  const path = getPath(event);

  // ---- Upsert inspection ----
  if (path === '/api/inspection/upsert' && method === 'POST') {
    const body = parseJsonBody(event) || {};
    const inspectionId = String(body.inspectionId || body.id || body?.data?.inspection?.id || '').trim();
    if (!inspectionId) return json(400, { success: false, message: 'Missing inspectionId.' });

    const data = body.data && typeof body.data === 'object' ? body.data : body;
    const sanitizedData = stripLargeStrings(data);
    const nowIso = new Date().toISOString();

    await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { reportId: inspectionId },
        UpdateExpression:
          'SET #type = :t, #data = :d, updatedAt = :u, createdAt = if_not_exists(createdAt, :c) REMOVE deletedAt',
        ExpressionAttributeNames: {
          '#type': 'type',
          '#data': 'data',
        },
        ExpressionAttributeValues: {
          ':t': 'INSPECTION',
          ':d': sanitizedData,
          ':u': nowIso,
          ':c': nowIso,
        },
      })
    );

    return json(200, { success: true, inspectionId, message: 'Saved' });
  }

  // ---- Get inspection ----
  if ((path === '/api/inspection/get' || path.startsWith('/api/inspection/get/')) && method === 'GET') {
    const idFromPath = path.startsWith('/api/inspection/get/') ? path.slice('/api/inspection/get/'.length) : '';
    const idFromQuery = event.queryStringParameters && (event.queryStringParameters.id || event.queryStringParameters.inspectionId);
    const inspectionId = String(idFromPath || idFromQuery || '').trim();
    if (!inspectionId) return json(400, { success: false, message: 'Missing id.' });

    const resp = await docClient.send(new GetCommand({ TableName: tableName, Key: { reportId: inspectionId } }));
    if (!resp || !resp.Item) return json(404, { success: false, message: 'Not found' });
    if (resp.Item.deletedAt) return json(404, { success: false, message: 'Not found' });

    return json(200, { success: true, inspectionId, item: resp.Item });
  }

  // ---- List inspections ----
  if (path === '/api/inspection/list' && method === 'GET') {
    const limitRaw = event.queryStringParameters && event.queryStringParameters.limit;
    const limit = Math.max(1, Math.min(50, Number(limitRaw || 20)));
    const cursor = event.queryStringParameters && event.queryStringParameters.cursor;
    const ExclusiveStartKey = decodeCursor(cursor);

    const resp = await docClient.send(
      new ScanCommand({
        TableName: tableName,
        Limit: limit,
        ExclusiveStartKey,
        FilterExpression: '#type = :t AND attribute_not_exists(deletedAt)',
        ExpressionAttributeNames: { '#type': 'type' },
        ExpressionAttributeValues: { ':t': 'INSPECTION' },
      })
    );

    return json(200, {
      success: true,
      items: resp.Items || [],
      cursor: encodeCursor(resp.LastEvaluatedKey),
    });
  }

  // ---- Soft delete inspection ----
  if (path === '/api/inspection/delete' && method === 'POST') {
    const body = parseJsonBody(event) || {};
    const inspectionId = String(body.inspectionId || body.id || '').trim();
    if (!inspectionId) return json(400, { success: false, message: 'Missing inspectionId.' });

    await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { reportId: inspectionId },
        UpdateExpression: 'SET deletedAt = :d, updatedAt = :u',
        ExpressionAttributeValues: { ':d': new Date().toISOString(), ':u': new Date().toISOString() },
      })
    );

    return json(200, { success: true, inspectionId, message: 'Deleted' });
  }

  // ---- Upload image (base64) ----
  if (path === '/api/inspection/images/uploadBase64' && method === 'POST') {
    const body = parseJsonBody(event) || {};
    const inspectionId = String(body.inspectionId || '').trim();
    const fieldName = String(body.fieldName || '').trim();
    const fileName = sanitizeFileName(body.fileName || fieldName || 'image.jpg');
    const base64 = String(body.base64 || '').trim();
    const contentTypeHint = String(body.contentType || '').trim();

    if (!inspectionId) return json(400, { success: false, message: 'Missing inspectionId.' });
    if (!base64) return json(400, { success: false, message: 'Missing base64.' });

    const match = base64.match(/^data:([^;]+);base64,(.+)$/);
    const contentType = (match && match[1]) || contentTypeHint || 'image/jpeg';
    const b64 = (match && match[2]) || base64;

    const buffer = Buffer.from(b64, 'base64');
    const maxBytes = Number(process.env.MAX_IMAGE_UPLOAD_BYTES || 2_000_000);
    if (buffer.length > maxBytes) {
      return json(413, {
        success: false,
        message: `Image too large (${buffer.length} bytes). Use presigned upload instead.`
      });
    }

    const bucket = process.env.IMAGES_BUCKET || process.env.REPORTS_BUCKET;
    if (!bucket) return json(500, { success: false, message: 'IMAGES_BUCKET/REPORTS_BUCKET not configured.' });

    const ext = contentType === 'image/png' ? 'png' : 'jpg';
    const key = `inspections/${inspectionId}/images/${Date.now()}-${fileName.replace(/\.(png|jpg|jpeg)$/i, '')}.${ext}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    const url = `https://${bucket}.s3.amazonaws.com/${key}`;
    return json(200, { success: true, url, key });
  }

  // ---- Presigned upload (PUT) ----
  if (path === '/api/inspection/images/presign' && method === 'POST') {
    if (!getSignedUrl) {
      return json(500, {
        success: false,
        message: 'Presign support not packaged. Install @aws-sdk/s3-request-presigner.'
      });
    }

    const body = parseJsonBody(event) || {};
    const inspectionId = String(body.inspectionId || '').trim();
    const fileName = sanitizeFileName(body.fileName || 'image.jpg');
    const contentType = String(body.contentType || 'image/jpeg');

    if (!inspectionId) return json(400, { success: false, message: 'Missing inspectionId.' });

    const bucket = process.env.IMAGES_BUCKET || process.env.REPORTS_BUCKET;
    if (!bucket) return json(500, { success: false, message: 'IMAGES_BUCKET/REPORTS_BUCKET not configured.' });

    const key = `inspections/${inspectionId}/images/${Date.now()}-${fileName}`;
    const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(s3Client, cmd, { expiresIn: 60 * 10 });
    const publicUrl = `https://${bucket}.s3.amazonaws.com/${key}`;

    return json(200, { success: true, uploadUrl, publicUrl, key });
  }

  return json(404, { success: false, message: 'Not found' });
}

// Lambda Function URLs (and API Gateway/Lambda proxy in general) have a hard response payload limit.
// Returning large PDFs as base64 will exceed this quickly when many images are embedded.
// If the generated PDF is larger than this threshold, we skip inline base64 and rely on S3 `reportUrl`.
const MAX_INLINE_PDF_BYTES = Number(process.env.MAX_INLINE_PDF_BYTES || 3_500_000);

// ========== MAIN HANDLER ==========
exports.handler = async (event) => {
  const method = getMethod(event);
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ ok: true }) };
  }

  // Route inspection CRUD/image APIs on the SAME Lambda Function URL.
  const path = getPath(event);
  if (path.startsWith('/api/inspection')) {
    try {
      return await handleInspectionApi(event);
    } catch (e) {
      console.error('Inspection API error:', e);
      return json(500, { success: false, message: 'Inspection API failed', error: e.message });
    }
  }

  console.log('Starting report generation (template/Playwright)...');
  const contentType = String(getHeader(event, 'content-type') || '');
  console.log('Content-Type:', contentType);

  try {
    if (!contentType.includes('application/json')) {
      return json(400, { success: false, message: 'Expected application/json payload (placeholders schema).' });
    }

    const payload = parseJsonBody(event);
    if (!payload || typeof payload !== 'object') {
      return json(400, { success: false, message: 'Invalid JSON body.' });
    }

    const now = Date.now();
    const reportId = (payload.inspection && payload.inspection.id) ? String(payload.inspection.id) : `INS-${now}`;
    const registrationNumber = payload.vehicle && payload.vehicle.registration_number ? String(payload.vehicle.registration_number) : 'UNKNOWN';

    console.log('Rendering PDF via Playwright...');
    const pdfBuffer = await renderPdfFromPayload(payload);
    console.log('PDF bytes:', pdfBuffer.length);

    let reportUrl = null;
    if (process.env.REPORTS_BUCKET) {
      const fileName = `reports/${registrationNumber}_${now}.pdf`;
      console.log('Uploading PDF to S3:', fileName);
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.REPORTS_BUCKET,
        Key: fileName,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      }));
      reportUrl = `https://${process.env.REPORTS_BUCKET}.s3.amazonaws.com/${fileName}`;
    }

    if (process.env.INSPECTIONS_TABLE) {
      console.log('Saving record to DynamoDB...');
      await docClient.send(new PutCommand({
        TableName: process.env.INSPECTIONS_TABLE,
        Item: {
          reportId,
          timestamp: new Date().toISOString(),
          registrationNumber,
          inspectorName: payload.inspection && payload.inspection.inspector_name ? String(payload.inspection.inspector_name) : undefined,
          reportUrl,
        },
      }));
    }

    const inlinePdfAllowed = pdfBuffer.length <= MAX_INLINE_PDF_BYTES;
    const hasS3Url = Boolean(reportUrl);

    if (!inlinePdfAllowed && !hasS3Url) {
      // We generated a PDF that is too large to return inline, but we also can't provide an S3 URL.
      // Returning base64 would trigger a 413 from the Lambda runtime.
      return json(500, {
        success: false,
        message: 'Generated PDF is too large to return inline and no REPORTS_BUCKET is configured for reportUrl.',
        reportId,
      });
    }

    return json(200, {
      success: true,
      message: inlinePdfAllowed
        ? 'Report generated successfully'
        : 'Report generated successfully (too large for inline download; use reportUrl).',
      reportId,
      reportUrl,
      filename: `Inspection_Report_${reportId}.pdf`,
      pdfData: inlinePdfAllowed ? pdfBuffer.toString('base64') : null,
      pdfBytes: pdfBuffer.length,
      inlinePdf: inlinePdfAllowed,
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return json(500, { success: false, message: 'Failed to generate report', error: error.message });
  }
};
