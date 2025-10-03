// backend/pdf-generator/handler.js
'use strict';

/**
 * Robust Lambda handler for PDF generation
 * - Expects event.inspection (object)
 * - Renders render_template.html with mustache
 * - Generates PDF with puppeteer
 * - Uploads PDF to S3 and updates DynamoDB table Inspections
 *
 * Environment variables:
 *   BUCKET            - S3 bucket name (required)
 *   INSPECTIONS_TABLE - DynamoDB table name (required)
 *   CHROME_PATH       - optional path to Chrome executable (useful for local testing)
 *
 * Notes:
 * - This file is defensive: missing URLs or missing optional fields won't crash the function.
 * - If a URL is provided but fails to load, we continue and render a fallback image/placeholders.
 */

const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const AWS = require('aws-sdk');
const puppeteer = require('puppeteer');

const s3 = new AWS.S3();
const ddb = new AWS.DynamoDB.DocumentClient();

const TEMPLATE_PATH = path.join(__dirname, 'render_template.html');
const DEFAULT_LOGO = 'https://via.placeholder.com/150x48.png?text=InspectionWale+Logo';

// helper
function isValidString(s) {
  return typeof s === 'string' && s.trim().length > 0;
}

function safeString(s, fallback = '') {
  return isValidString(s) ? s : fallback;
}

// ensure we log unhandled rejections during debugging and avoid process crash
process.on('unhandledRejection', (reason) => {
  console.error('UnhandledPromiseRejection:', reason && reason.stack ? reason.stack : reason);
});

async function renderHtml(inspectObj) {
  const tpl = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  // provide safe defaults to the template
  const view = Object.assign({}, inspectObj);
  if (!isValidString(view.logoUrl)) view.logoUrl = DEFAULT_LOGO;
  return mustache.render(tpl, view);
}

async function generatePdfFromHtml(html, chromePathHint) {
  // Launch puppeteer - prefer CHROME_PATH if provided (works for local testing)
  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  };
  if (isValidString(chromePathHint)) {
    launchOptions.executablePath = chromePathHint;
    console.log('Launching puppeteer with executablePath:', chromePathHint);
  } else {
    console.log('Launching puppeteer with default executable (bundled in container if present).');
  }

  const browser = await puppeteer.launch(launchOptions);
  try {
    const page = await browser.newPage();
    // set generous viewport so A4 rendering is consistent
    await page.setViewport({ width: 1200, height: 800 });

    // Use setContent so relative resources referenced in HTML are loaded
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' }
    });

    return pdfBuffer;
  } finally {
    try { await browser.close(); } catch (e) { console.warn('Failed to close browser', e && e.message); }
  }
}

async function uploadPdfToS3(bucket, key, buffer) {
  const params = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: 'application/pdf',
    ACL: 'private'
  };
  await s3.putObject(params).promise();
  return `s3://${bucket}/${key}`;
}

async function updateDynamoPdfRecord(table, inspectionId, s3Key) {
  const params = {
    TableName: table,
    Key: { inspectionId },
    UpdateExpression: 'SET pdfKey = :k, pdfGeneratedAt = :t',
    ExpressionAttributeValues: {
      ':k': s3Key,
      ':t': new Date().toISOString()
    },
    ReturnValues: 'ALL_NEW'
  };
  return ddb.update(params).promise();
}

exports.handler = async (event) => {
  console.log('handler invoked', { keys: Object.keys(event || {}) });

  const inspection = event && event.inspection ? event.inspection : null;
  if (!inspection || typeof inspection !== 'object') {
    const msg = 'Invalid event: missing "inspection" object in payload';
    console.error(msg);
    return { statusCode: 400, body: msg };
  }

  const bucket = process.env.BUCKET;
  const table = process.env.INSPECTIONS_TABLE;
  if (!isValidString(bucket) || !isValidString(table)) {
    const msg = 'Missing required environment variables: BUCKET and/or INSPECTIONS_TABLE';
    console.error(msg, { BUCKET: bucket, INSPECTIONS_TABLE: table });
    throw new Error(msg);
  }

  const inspectionId = safeString(inspection.inspectionId, `inspect-${Date.now()}`);
  inspection.inspectionId = inspectionId; // ensure exists

  // defensive: ensure logoUrl is a valid string or null so template doesn't get undefined
  if (!isValidString(inspection.logoUrl)) {
    inspection.logoUrl = DEFAULT_LOGO;
  }

  // If images array/object exists, ensure structure is sane (simple normalization)
  if (inspection.images && Array.isArray(inspection.images) && inspection.images.length === 0) {
    inspection.images = {};
  }

  try {
    console.log('Rendering HTML for inspectionId:', inspectionId);
    const html = await renderHtml(inspection);

    const chromePath = process.env.CHROME_PATH || process.env.CHROME_EXE || null;
    const pdfBuffer = await generatePdfFromHtml(html, chromePath);

    const key = `pdfs/${inspectionId}/inspection-report.pdf`;
    console.log('Uploading PDF to S3', { bucket, key });
    await uploadPdfToS3(bucket, key, pdfBuffer);

    console.log('Updating DynamoDB', { table, inspectionId });
    await updateDynamoPdfRecord(table, inspectionId, key);

    const s3Url = `https://${bucket}.s3.amazonaws.com/${key}`;
    console.log('PDF generation complete', { inspectionId, s3Url });

    return {
      statusCode: 200,
      body: JSON.stringify({
        inspectionId,
        s3Key: key,
        s3Url
      })
    };
  } catch (err) {
    console.error('Error generating PDF for inspectionId:', inspectionId, err && err.stack ? err.stack : err);
    // Return a friendly error payload
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'PDF generation failed', error: err && err.message ? err.message : String(err) })
    };
  }
};
