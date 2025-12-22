import fs from 'node:fs/promises';
import path from 'node:path';

function usage() {
  console.log(`\nUsage:\n  node website/scripts/test-lambda-generate-pdf.mjs --in <payload.json> --out <out.pdf> [--url <lambdaUrl>] [--token <bearerToken>]\n\nDefaults:\n  --url defaults to PDF_ENDPOINT in inspector-form.html (hardcoded there)\n`);
}

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function parseEndpointFromInspectorForm(html) {
  const m = html.match(/const\s+PDF_ENDPOINT\s*=\s*'([^']+)'\s*;/);
  return m ? m[1] : null;
}

async function firstExistingFile(candidatePaths) {
  for (const candidatePath of candidatePaths) {
    try {
      await fs.access(candidatePath);
      return candidatePath;
    } catch {
      // continue
    }
  }
  return null;
}

async function main() {
  const inPath = getArg('--in');
  const outPath = getArg('--out');
  const token = getArg('--token');

  if (!inPath || !outPath) {
    usage();
    process.exit(2);
  }

  const cwd = process.cwd();
  const formPath = await firstExistingFile([
    path.join(cwd, 'inspector-form.html'),
    path.join(cwd, 'website', 'inspector-form.html'),
    path.join(cwd, '..', 'inspector-form.html'),
    path.join(cwd, '..', 'website', 'inspector-form.html'),
  ]);

  if (!formPath) {
    console.error('Could not find inspector-form.html. Run from repo root or pass --url explicitly.');
    process.exit(2);
  }

  const formHtml = await fs.readFile(formPath, 'utf8');
  const defaultUrl = parseEndpointFromInspectorForm(formHtml);
  const url = getArg('--url') || defaultUrl;

  if (!url) {
    console.error('Could not find Lambda URL. Pass --url explicitly.');
    process.exit(2);
  }

  const payload = JSON.parse(await fs.readFile(inPath, 'utf8'));

  console.log('POST', url);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error('Non-JSON response:', text.slice(0, 500));
    process.exit(1);
  }

  if (!res.ok || !json.success || !json.pdfData) {
    const bodyPreview = JSON.stringify({ status: res.status, body: json }, null, 2);
    const traceback = (json && typeof json === 'object' && (json.traceback || (json.body && json.body.traceback))) ? String(json.traceback || json.body.traceback) : '';
    if (traceback.includes('parse_multipart') || traceback.includes('boundary=') || traceback.includes('lambda_function.py')) {
      console.error('Lambda error: Deployed endpoint appears to be the OLD multipart/Python implementation.');
      console.error('Expected the new JSON + Playwright renderer that returns { success, pdfData, filename }.');
      console.error('Redeploy the updated generate-report function, then re-run this test.');
      console.error(bodyPreview);
      process.exit(1);
    }
    console.error('Lambda error:', bodyPreview);
    process.exit(1);
  }

  const pdfBytes = Buffer.from(String(json.pdfData), 'base64');
  await fs.writeFile(outPath, pdfBytes);

  console.log(`✅ Saved Lambda PDF: ${outPath}`);
  console.log(`- bytes: ${pdfBytes.length}`);
  console.log(`- filename from API: ${json.filename || '(none)'}`);
  console.log(`- reportUrl: ${json.reportUrl || '(none)'}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
