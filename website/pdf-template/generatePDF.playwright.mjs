/**
 * LOCKED TEMPLATE PDF GENERATOR (Playwright)
 *
 * Non-negotiable rules:
 * - DO NOT modify pdf-template/inspection-report/v1/index.html
 * - DO NOT modify pdf-template/inspection-report/v1/style.css
 * - Only replace {{placeholders}} via string substitution
 * - Render with Playwright Chromium, A4, printBackground:true, no margins/scaling overrides
 */

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = path.join(__dirname, 'inspection-report', 'v1');
const TEMPLATE_INDEX = path.join(TEMPLATE_DIR, 'index.html');
const TEMPLATE_STYLE = path.join(TEMPLATE_DIR, 'style.css');
const DIST_ASSETS_DIR = path.join(__dirname, 'dist', 'assets');

function getByPath(obj, dottedPath) {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = dottedPath.split('.').filter(Boolean);
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function escapeHtml(value) {
  const str = value === null || value === undefined ? '' : String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bindPlaceholders(templateHtml, payload) {
  // Replace {{a.b.c}} placeholders with payload values.
  // IMPORTANT: We do not alter any other parts of the template.
  const re = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;
  return templateHtml.replace(re, (_match, key) => {
    const value = getByPath(payload, key);
    return escapeHtml(value);
  });
}

function guessContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js' || ext === '.mjs') return 'text/javascript; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'application/octet-stream';
}

async function createTemplateServer({ html }) {
  const server = http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || '/', 'http://localhost');
      const pathname = requestUrl.pathname;

      // Serve bound HTML at / or /index.html
      if (pathname === '/' || pathname === '/index.html') {
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store'
        });
        res.end(html);
        return;
      }

      // Serve locked style.css (in case template references it)
      if (pathname === '/style.css') {
        const css = await fs.readFile(TEMPLATE_STYLE);
        res.writeHead(200, {
          'Content-Type': 'text/css; charset=utf-8',
          'Cache-Control': 'no-store'
        });
        res.end(css);
        return;
      }

      // Serve /assets/* from dist/assets
      if (pathname.startsWith('/assets/')) {
        const rel = pathname.replace(/^\/assets\//, '');
        const fsPath = path.join(DIST_ASSETS_DIR, rel);

        // Prevent path traversal
        const resolved = path.resolve(fsPath);
        const resolvedRoot = path.resolve(DIST_ASSETS_DIR);
        if (!resolved.startsWith(resolvedRoot + path.sep) && resolved !== resolvedRoot) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }

        // IMPORTANT: Do not execute template JS during PDF rendering.
        // We still satisfy the request with an empty ES module to keep the DOM stable.
        if (resolved.endsWith('.js') || resolved.endsWith('.mjs')) {
          res.writeHead(200, {
            'Content-Type': 'text/javascript; charset=utf-8',
            'Cache-Control': 'no-store'
          });
          res.end('export {};');
          return;
        }

        const buf = await fs.readFile(resolved);
        res.writeHead(200, {
          'Content-Type': guessContentType(resolved),
          'Cache-Control': 'no-store'
        });
        res.end(buf);
        return;
      }

      res.writeHead(404);
      res.end('Not found');
    } catch (err) {
      res.writeHead(500);
      res.end('Server error');
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : null;
  if (!port) {
    server.close();
    throw new Error('Failed to bind local server port');
  }

  return {
    server,
    baseUrl: `http://127.0.0.1:${port}`
  };
}

async function waitForImagesToLoad(page) {
  // No script tag injection; just evaluate readiness.
  await page.waitForFunction(() => {
    const imgs = Array.from(document.images || []);
    return imgs.every((img) => img.complete);
  }, { timeout: 30000 });
}

export async function generateInspectionReportPdfFromTemplate(payload, outputPath) {
  const templateHtml = await fs.readFile(TEMPLATE_INDEX, 'utf8');
  const boundHtml = bindPlaceholders(templateHtml, payload);

  const { server, baseUrl } = await createTemplateServer({ html: boundHtml });

  const browser = await chromium.launch({
    headless: true
  });

  try {
    const context = await browser.newContext({
      locale: 'en-US',
      timezoneId: 'UTC',
      viewport: { width: 794, height: 1123 },
      deviceScaleFactor: 1
    });

    const page = await context.newPage();

    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle', timeout: 45000 });
    await waitForImagesToLoad(page);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
      // NOTE: no margins override, no scale override
    });

    if (outputPath) {
      await fs.writeFile(outputPath, pdfBuffer);
    }

    return pdfBuffer;
  } finally {
    await browser.close();
    server.close();
  }
}

function parseJsonFile(content) {
  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error('Invalid JSON input');
  }
}

async function main() {
  const [dataPath, outputPath = 'inspection-report.pdf'] = process.argv.slice(2);
  if (!dataPath) {
    console.log('Usage: node generatePDF.playwright.mjs <payload.json> [output.pdf]');
    process.exit(1);
  }

  const json = await fs.readFile(path.resolve(process.cwd(), dataPath), 'utf8');
  const payload = parseJsonFile(json);

  // If caller passes flat data (like old sample-data.json), allow wrapping under a root
  // without changing template; this is only to match expected placeholder paths.
  const normalized = payload && payload.inspection ? payload : { ...payload };

  await generateInspectionReportPdfFromTemplate(normalized, outputPath);
  console.log(`✅ PDF saved to: ${outputPath}`);
}

const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  main().catch((err) => {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  });
}
