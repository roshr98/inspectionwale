
/*
handler.local.js - Local dev script to render sample_inspection.json to sample_output.pdf
Requires puppeteer in node_modules (will download Chromium on first install).
Run: npm ci && node handler.local.js
*/
const fs = require('fs');
const mustache = require('mustache');
const puppeteer = require('puppeteer');

const templatePath = './render_template.html';
const samplePath = './sample_inspection.json';
const outPdf = './sample_output.pdf';

async function render() {
  const tpl = fs.readFileSync(templatePath, 'utf8');
  const sample = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
  const html = mustache.render(tpl, sample);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: outPdf, format: 'A4', printBackground: true });
  await browser.close();
  console.log('Wrote', outPdf);
}

render().catch(err => { console.error(err); process.exit(1); });
