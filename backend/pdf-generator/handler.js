
/*
handler.js - Lambda-compatible entrypoint for PDF generation
This handler expects to run inside a Lambda container with Chrome available.
It uses chrome-aws-lambda and puppeteer-core for compatibility.
*/
const AWS = require('aws-sdk');
const fs = require('fs');
const mustache = require('mustache');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

const s3 = new AWS.S3();
const ddb = new AWS.DynamoDB.DocumentClient();

async function fetchInspection(inspectionId) {
  const table = process.env.INSPECTIONS_TABLE;
  const r = await ddb.get({ TableName: table, Key: { inspectionId } }).promise();
  return r.Item;
}

function renderHtml(templatePath, data) {
  const tpl = fs.readFileSync(templatePath, 'utf8');
  return mustache.render(tpl, data);
}

exports.handler = async (event) => {
  const inspectionId = event.inspectionId || (event.Records && event.Records[0] && JSON.parse(event.Records[0].Sns.Message).inspectionId);
  if (!inspectionId && !event.inspection) {
    throw new Error('No inspectionId provided.');
  }
  const inspection = event.inspection || await fetchInspection(inspectionId);
  const html = renderHtml('./render_template.html', inspection);

  let browser = null;
  try {
    const execPath = await chromium.executablePath;
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: execPath,
      headless: chromium.headless
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    // Save to S3
    const bucket = process.env.BUCKET;
    const key = `pdfs/${inspection.inspectionId}/inspection-report.pdf`;
    await s3.putObject({ Bucket: bucket, Key: key, Body: pdfBuffer, ContentType: 'application/pdf' }).promise();

    // Update DynamoDB record with pdf key
    await ddb.update({
      TableName: process.env.INSPECTIONS_TABLE,
      Key: { inspectionId: inspection.inspectionId },
      UpdateExpression: 'SET pdfS3Key = :k, #st = :s',
      ExpressionAttributeValues: { ':k': key, ':s': 'pdf_ready' },
      ExpressionAttributeNames: { '#st': 'status' }
    }).promise();

    return { s3key: key };
  } finally {
    if (browser) await browser.close();
  }
};
