/*
 handler.mock.js
 Local-only PDF rendering helper for development.
 Tries (in order):
  1) Puppeteer's bundled Chromium (if present)
  2) CHROME_PATH env var (if set)
  3) Common system Chrome locations on Windows
 If none available it prints diagnostics and exits non-zero.
 Produces sample_output.pdf in this folder.
*/
const fs = require('fs');
const mustache = require('mustache');
const puppeteer = require('puppeteer');

const templatePath = './render_template.html';
const samplePath = './sample_inspection.json';
const outPdf = './sample_output.pdf';

async function findChromeExecutable() {
  // Respect explicit env var first
  if (process.env.CHROME_PATH) {
    console.log('DEBUG: CHROME_PATH is set to:', process.env.CHROME_PATH);
    if (fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
    console.warn('WARN: CHROME_PATH set but file not found.');
  }

  // Common Windows install paths
  const candidates = [
    'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    'C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    'C:\\\\Program Files\\\\Chromium\\\\chrome.exe',
    'C:\\\\Program Files (x86)\\\\Chromium\\\\chrome.exe'
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        console.log('DEBUG: Found chrome at', p);
        return p;
      }
    } catch (e) { /* ignore */ }
  }

  // Puppeteer local chromium folder (linux/mac/windows)
  const localChromium = 'node_modules/puppeteer/.local-chromium';
  if (fs.existsSync(localChromium)) {
    console.log('DEBUG: Found Puppeteer .local-chromium folder at', localChromium);
    return null; // let puppeteer use its default
  }

  return null; // no system chrome found, let puppeteer try default (will likely fail)
}

(async () => {
  try {
    if (!fs.existsSync(templatePath)) throw new Error('Missing template: ' + templatePath);
    if (!fs.existsSync(samplePath)) throw new Error('Missing sample JSON: ' + samplePath);

    const tpl = fs.readFileSync(templatePath, 'utf8');
    const sample = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
    const html = mustache.render(tpl, sample);

    const chromeExe = await findChromeExecutable();
    const launchOptions = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    };
    if (chromeExe) {
      launchOptions.executablePath = chromeExe;
      console.log('INFO: Will launch Chrome using executablePath:', chromeExe);
    } else {
      console.log('INFO: No explicit Chrome found — attempting Puppeteer default binary (may fail if missing).');
    }

    console.log('INFO: Launching browser with options:', JSON.stringify(launchOptions).replace(/"args":\[[^\]]+\]/, '"args":[...]'));
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: outPdf, format: 'A4', printBackground: true });
    await browser.close();
    console.log('Wrote', outPdf);
  } catch (err) {
    console.error('ERROR:', err && err.stack ? err.stack : err);
    process.exitCode = 2;
  }
})();
