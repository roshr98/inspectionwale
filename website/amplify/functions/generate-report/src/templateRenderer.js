const http = require('http');
const path = require('path');
const fs = require('fs').promises;

// NOTE:
// - This renderer serves and executes the built React report app.
// - The inspection payload is injected via localStorage (key: "inspectionData").
// - The report is opened using `/?view=report` and we wait for `html[data-report-ready="true"]`.

const TEMPLATE_ROOT = path.join(__dirname, 'pdf-template');
const DIST_DIR = path.join(TEMPLATE_ROOT, 'dist');

function contentTypeForPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.woff2') return 'font/woff2';
  if (ext === '.woff') return 'font/woff';
  if (ext === '.ttf') return 'font/ttf';
  if (ext === '.ico') return 'image/x-icon';
  return 'application/octet-stream';
}

async function createTemplateServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const urlPath = (req.url || '/').split('?')[0];

      // Serve SPA entry
      const requestedRel = (urlPath === '/' || urlPath === '/index.html') ? 'index.html' : urlPath.replace(/^\//, '');
      const requestedPath = path.normalize(path.join(DIST_DIR, requestedRel));
      const allowedBase = path.normalize(DIST_DIR) + path.sep;

      if (!requestedPath.startsWith(allowedBase)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      let fileToServe = requestedPath;
      try {
        const stat = await fs.stat(fileToServe);
        if (stat.isDirectory()) {
          fileToServe = path.join(fileToServe, 'index.html');
        }
      } catch (_e) {
        // If an asset is missing, return 404 (do not SPA-fallback).
        if (requestedRel.startsWith('assets/')) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }

        // Fallback to SPA index.html for unknown non-asset routes.
        fileToServe = path.join(DIST_DIR, 'index.html');
      }

      const file = await fs.readFile(fileToServe);
      res.writeHead(200, { 'Content-Type': contentTypeForPath(fileToServe) });
      res.end(file);
    } catch (e) {
      res.writeHead(500);
      res.end('Server error');
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  return {
    baseUrl,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

async function resolvePlaywright() {
  // Prefer playwright-core + AWS Lambda Chromium (recommended for Lambda packaging).
  // Fall back to playwright (dev/local).
  try {
    const chromium = require('@sparticuz/chromium');
    const { chromium: pwChromium } = require('playwright-core');
    return { chromium, pwChromium };
  } catch (_e) {
    const { chromium: pwChromium } = require('playwright');
    return { chromium: null, pwChromium };
  }
}

async function renderPdfFromPayload(payload) {
  const server = await createTemplateServer();

  const { chromium, pwChromium } = await resolvePlaywright();
  const launchOptions = chromium
    ? {
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      }
    : { headless: true };

  const browser = await pwChromium.launch(launchOptions);
  try {
    const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });

    await page.addInitScript((data) => {
      try {
        localStorage.setItem('inspectionData', JSON.stringify(data || {}));
      } catch (_e) {
        // ignore
      }
    }, payload || {});

    await page.goto(`${server.baseUrl}/?view=report`, { waitUntil: 'load' });

    // Ensure fonts and layout settle before printing
    try {
      await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()));
    } catch (_e) {
      // ignore
    }

    await page.waitForSelector('html[data-report-ready="true"]', { timeout: 10_000 });
    await page.waitForFunction(() => document.querySelectorAll('.inspection-page').length >= 11, { timeout: 10_000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
    await server.close();
  }
}

module.exports = {
  renderPdfFromPayload,
};
