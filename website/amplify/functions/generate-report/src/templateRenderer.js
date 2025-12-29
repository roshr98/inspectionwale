const http = require('http');
const path = require('path');
const fs = require('fs').promises;

// NOTE:
// - This renderer serves and executes the built React report app.
// - The inspection payload is injected via localStorage (key: "inspectionData").
// - We do NOT rely on any special URL routing or "ready" markers inside the template.
//   Instead we load the app normally, click the template's own "View Report" button,
//   then wait for pages to render before printing.

const TEMPLATE_ROOT = path.join(__dirname, 'pdf-template');
const DIST_DIR = path.join(TEMPLATE_ROOT, 'dist');
const LAMBDA_FONTS_DIR = path.join(__dirname, 'lambda-fonts');

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

      // Serve bundled fonts for headless PDF rendering.
      // This avoids relying on outbound internet access from Lambda/VPC.
      if (urlPath.startsWith('/_lambda_fonts/')) {
        const rel = urlPath.replace(/^\/_lambda_fonts\//, '');
        const fontPath = path.normalize(path.join(LAMBDA_FONTS_DIR, rel));
        const allowedBase = path.normalize(LAMBDA_FONTS_DIR) + path.sep;
        if (!fontPath.startsWith(allowedBase)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }

        try {
          const file = await fs.readFile(fontPath);
          res.writeHead(200, { 'Content-Type': contentTypeForPath(fontPath) });
          res.end(file);
        } catch (_e) {
          res.writeHead(404);
          res.end('Not found');
        }
        return;
      }

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

async function loadFontDataUrl(filePath) {
  try {
    const buf = await fs.readFile(filePath);
    const b64 = Buffer.from(buf).toString('base64');
    return `data:font/ttf;base64,${b64}`;
  } catch (_e) {
    return null;
  }
}

async function installReportFonts(chromium) {
  if (!chromium || typeof chromium.font !== 'function') return;

  // Ensure Hindi (Devanagari) glyphs render correctly in headless Chromium on Lambda.
  // Without this, labels like "निरीक्षण" may appear as tofu/squares or go missing,
  // and fallback font metrics can shift layout.
  const notoBase = 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansDevanagari';
  const fonts = [
    `${notoBase}/NotoSansDevanagari-Regular.ttf`,
    `${notoBase}/NotoSansDevanagari-Bold.ttf`,
  ];

  for (const fontUrl of fonts) {
    try {
      await chromium.font(fontUrl);
    } catch (_e) {
      // Non-fatal: continue with whatever fonts are available.
    }
  }
}

async function renderPdfFromPayload(payload) {
  const server = await createTemplateServer();
  const debugPdf = !!(payload && typeof payload === 'object' && payload.__debugPdf === true);

  const { chromium, pwChromium } = await resolvePlaywright();

  // Install extra fonts BEFORE launching the browser.
  await installReportFonts(chromium);

  const launchOptions = chromium
    ? {
        // Some Lambda Chromium builds include flags that can prevent @font-face URL loads.
        // We also inline the font via data: URL (below) to avoid network dependency.
        args: (chromium.args || []).filter((a) => a !== '--disable-remote-fonts'),
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

    await page.goto(`${server.baseUrl}/`, { waitUntil: 'load' });

    const devanagariDataUrl = await loadFontDataUrl(path.join(LAMBDA_FONTS_DIR, 'NotoSansDevanagari-Regular.ttf'));
    const devanagariFontUrl = devanagariDataUrl || `${server.baseUrl}/_lambda_fonts/NotoSansDevanagari-Regular.ttf`;

    // Inject a Devanagari-capable font as a fallback so Hindi labels render.
    // Important: append it LAST in the stack so Latin text continues using
    // the template's preferred system fonts; only missing glyphs fall back.
    await page.addStyleTag({
      content: `
@font-face {
  font-family: "Noto Sans Devanagari";
  src: url("${devanagariFontUrl}") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Noto Sans Devanagari";
  src: url("${devanagariFontUrl}") format("truetype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
html, body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
    "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif, "Noto Sans Devanagari" !important;
}
.inspection-page {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
    "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif, "Noto Sans Devanagari" !important;
}
.inspection-page * {
  font-family: inherit !important;
}
      `.trim(),
    });

    // Prefer screen media to match the design-time CSS, unless the template explicitly
    // defines print-only adjustments.
    try {
      await page.emulateMedia({ media: 'screen' });
    } catch (_e) {
      // ignore
    }

    // The template app defaults to the form view; switch to report via its own UI.
    // This keeps the template "locked" (no special routing required).
    try {
      await page.waitForSelector('button.btn-view-report', { timeout: 10_000 });
      await page.click('button.btn-view-report');
    } catch (_e) {
      // If the template already loads in report mode, continue.
    }

    let debugInfo = null;
    if (debugPdf) {
      try {
        debugInfo = await page.evaluate(() => {
          const devanagariRe = /[\u0900-\u097F]/;
          const label = document.querySelector('.detail-label');
          const disclaimerHeader = document.querySelector('h2.section-header-bilingual');
          const sample = 'वाहन संख्या';
          const labelText = label ? (label.textContent || '') : '';
          const disclaimerText = disclaimerHeader ? (disclaimerHeader.textContent || '') : '';
          const fontsStatus = document.fonts ? document.fonts.status : null;
          const fontCheck = document.fonts ? document.fonts.check('16px "Noto Sans Devanagari"', 'अ') : null;
          const computedFamily = label ? window.getComputedStyle(label).fontFamily : null;

          const makeProbe = (family) => {
            const el = document.createElement('span');
            el.textContent = sample;
            el.style.position = 'fixed';
            el.style.left = '-9999px';
            el.style.top = '-9999px';
            el.style.fontSize = '16px';
            el.style.fontFamily = family;
            document.body.appendChild(el);
            const r = el.getBoundingClientRect();
            el.remove();
            return { width: r.width, height: r.height };
          };

          const probeInherit = makeProbe('inherit');
          const probeNoto = makeProbe('"Noto Sans Devanagari", sans-serif');

          return {
            labelTextLen: labelText.length,
            labelHasDevanagari: devanagariRe.test(labelText),
            disclaimerHeaderLen: disclaimerText.length,
            disclaimerHeaderHasDevanagari: devanagariRe.test(disclaimerText),
            fontsStatus,
            fontCheck,
            computedFamily,
            probeInherit,
            probeNoto,
          };
        });
      } catch (_e) {
        debugInfo = { error: 'failed_to_collect_debug_info' };
      }
    }

    // Ensure fonts and layout settle before printing
    try {
      await page.evaluate(() => {
        if (!document.fonts) return Promise.resolve();
        return Promise.all([
          document.fonts.load('16px "Noto Sans Devanagari"'),
          document.fonts.ready,
        ]);
      });
    } catch (_e) {
      // ignore
    }

    await page.waitForFunction(() => document.querySelectorAll('.inspection-page').length >= 11, { timeout: 15_000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    const out = Buffer.from(pdfBuffer);
    return debugPdf ? { pdfBuffer: out, debug: debugInfo } : out;
  } finally {
    await browser.close();
    await server.close();
  }
}

module.exports = {
  renderPdfFromPayload,
};
