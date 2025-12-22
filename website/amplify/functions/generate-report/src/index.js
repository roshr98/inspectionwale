const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const { renderPdfFromPayload } = require('./templateRenderer');

const s3Client = new S3Client({});
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
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

// ========== MAIN HANDLER ==========
exports.handler = async (event) => {
  if (event && event.requestContext && event.requestContext.http && event.requestContext.http.method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ ok: true }) };
  }

  console.log('Starting report generation (template/Playwright)...');
  const contentType = String(getHeader(event, 'content-type') || '');
  console.log('Content-Type:', contentType);

  try {
    if (!contentType.includes('application/json')) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ success: false, message: 'Expected application/json payload (placeholders schema).' }),
      };
    }

    const payload = parseJsonBody(event);
    if (!payload || typeof payload !== 'object') {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ success: false, message: 'Invalid JSON body.' }),
      };
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

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        success: true,
        message: 'Report generated successfully',
        reportId,
        reportUrl,
        filename: `Inspection_Report_${reportId}.pdf`,
        pdfData: pdfBuffer.toString('base64'),
      }),
    };
  } catch (error) {
    console.error('Report generation error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ success: false, message: 'Failed to generate report', error: error.message }),
    };
  }
};
