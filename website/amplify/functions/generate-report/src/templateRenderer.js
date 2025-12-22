const http = require('http');
const path = require('path');
const fs = require('fs').promises;

// NOTE:
// - This renderer treats the template as immutable.
// - It does ONLY {{...}} string substitution.
// - It does not inject or execute template JS.

const TEMPLATE_ROOT = path.join(__dirname, 'pdf-template');
const TEMPLATE_DIR = path.join(TEMPLATE_ROOT, 'inspection-report', 'v1');
const DIST_ASSETS_DIR = path.join(TEMPLATE_ROOT, 'dist', 'assets');

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getByDottedPath(obj, dottedPath) {
  const parts = dottedPath.split('.').map((p) => p.trim()).filter(Boolean);
  let cur = obj;
  for (const key of parts) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, key)) {
      cur = cur[key];
    } else {
      return undefined;
    }
  }
  return cur;
}

function bindPlaceholders(templateHtml, payload) {
  return templateHtml.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_m, keyPath) => {
    const value = getByDottedPath(payload, keyPath);
    if (value === undefined || value === null) return '';
    return htmlEscape(String(value));
  });
}

async function createTemplateServer(boundHtml) {
  const server = http.createServer(async (req, res) => {
    try {
      const urlPath = (req.url || '/').split('?')[0];

      if (urlPath === '/' || urlPath === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(boundHtml);
        return;
      }

      if (urlPath === '/style.css') {
        const cssPath = path.join(TEMPLATE_DIR, 'style.css');
        const css = await fs.readFile(cssPath);
        res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
        res.end(css);
        return;
      }

      if (urlPath.startsWith('/assets/')) {
        const rel = urlPath.replace(/^\//, '');
        const requestedPath = path.normalize(path.join(TEMPLATE_ROOT, rel));
        const allowedBase = path.normalize(path.join(TEMPLATE_ROOT, 'dist')) + path.sep;

        if (!requestedPath.startsWith(allowedBase)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }

        if (requestedPath.endsWith('.js')) {
          // IMPORTANT: prevent executing template JS while still satisfying requests.
          res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
          res.end('export {};');
          return;
        }

        const file = await fs.readFile(requestedPath);
        const ext = path.extname(requestedPath).toLowerCase();
        const type = ext === '.css'
          ? 'text/css; charset=utf-8'
          : ext === '.svg'
            ? 'image/svg+xml'
            : ext === '.png'
              ? 'image/png'
              : ext === '.jpg' || ext === '.jpeg'
                ? 'image/jpeg'
                : ext === '.woff2'
                  ? 'font/woff2'
                  : 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': type });
        res.end(file);
        return;
      }

      res.writeHead(404);
      res.end('Not found');
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

async function loadTemplateHtml() {
  const indexPath = path.join(TEMPLATE_DIR, 'index.html');
  return fs.readFile(indexPath, 'utf8');
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
  const templateHtml = await loadTemplateHtml();
  const boundHtml = bindPlaceholders(templateHtml, payload || {});

  const server = await createTemplateServer(boundHtml);

  const { chromium, pwChromium } = await resolvePlaywright();
  const launchOptions = chromium
    ? {
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      }
    : { headless: true };

  const browser = await pwChromium.launch(launchOptions);
  try {
    const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });

    await page.goto(`${server.baseUrl}/index.html`, { waitUntil: 'load' });
    await page.waitForTimeout(250);

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
