import fs from 'node:fs/promises';
import path from 'node:path';

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

function collectLeafPaths(obj, prefix = '') {
  const paths = [];
  for (const [key, value] of Object.entries(obj || {})) {
    const p = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      paths.push(...collectLeafPaths(value, p));
    } else {
      // Treat all non-objects as leaf placeholders.
      paths.push(p);
    }
  }
  return paths;
}

function extractFormFieldNames(html) {
  const names = new Set();

  // Match name="..." on input/select/textarea (simple, robust-enough for our static file).
  // This intentionally ignores fields without a name attribute.
  const tagRe = /<(input|select|textarea)\b[^>]*\bname\s*=\s*"([^"]+)"[^>]*>/gi;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    names.add(m[2]);
  }
  return names;
}

function shouldIgnorePath(p) {
  // You can add exceptions here if you intentionally have extra fields.
  // For now, keep strict.
  return false;
}

async function main() {
  const repoRoot = process.cwd();
  const placeholdersPath = path.join(repoRoot, 'website', 'placeholders.json');
  const formPath = path.join(repoRoot, 'website', 'inspector-form.html');

  const placeholders = JSON.parse(await fs.readFile(placeholdersPath, 'utf8'));
  const html = await fs.readFile(formPath, 'utf8');

  const expected = new Set(collectLeafPaths(placeholders).filter((p) => !shouldIgnorePath(p)));
  const present = extractFormFieldNames(html);

  const missing = [...expected].filter((p) => !present.has(p)).sort();
  const extra = [...present].filter((p) => !expected.has(p)).sort();

  const expectedCount = expected.size;
  const presentCount = present.size;

  console.log('Inspector Form ↔ Placeholders Schema Check');
  console.log('----------------------------------------');
  console.log(`Expected leaf placeholders: ${expectedCount}`);
  console.log(`Form fields with name=:   ${presentCount}`);

  if (missing.length === 0 && extra.length === 0) {
    console.log('✅ PASS: Form captures exactly the placeholders schema.');
    process.exit(0);
  }

  if (missing.length) {
    console.log(`\n❌ Missing in form (${missing.length}):`);
    for (const p of missing) console.log(`- ${p}`);
  }
  if (extra.length) {
    console.log(`\n⚠️ Extra fields in form (${extra.length}):`);
    for (const p of extra) console.log(`- ${p}`);
  }

  process.exit(2);
}

main().catch((err) => {
  console.error('Schema check failed:', err);
  process.exit(1);
});
