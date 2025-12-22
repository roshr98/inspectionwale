#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

IN_JSON_DEFAULT="$ROOT/website/test-data/placeholders-test.json"
OUT_DIR_DEFAULT="$ROOT/website/test-output"

IN_JSON="${1:-$IN_JSON_DEFAULT}"
OUT_DIR="${2:-$OUT_DIR_DEFAULT}"

# Normalize to absolute paths (important because the local PDF generator runs from website/pdf-template)
IN_JSON="$(cd "$(dirname "$IN_JSON")" && pwd)/$(basename "$IN_JSON")"
mkdir -p "$OUT_DIR"
OUT_DIR="$(cd "$OUT_DIR" && pwd)"

LOCAL_OUT="$OUT_DIR/local.pdf"
LAMBDA_OUT="$OUT_DIR/lambda.pdf"

echo "=== 1) Verify inspector form covers placeholders.json ==="
node "$ROOT/website/scripts/verify-inspector-form-schema.mjs"

echo "\n=== 2) Generate LOCAL PDF via Playwright (locked template) ==="
# Run from pdf-template dir so node resolves its dependencies
pushd "$ROOT/website/pdf-template" >/dev/null
node "generatePDF.playwright.mjs" "$IN_JSON" "$LOCAL_OUT"
popd >/dev/null
ls -la "$LOCAL_OUT"

echo "\n=== 3) Generate PDF via DEPLOYED Lambda (base64 pdfData) ==="
node "$ROOT/website/scripts/test-lambda-generate-pdf.mjs" --in "$IN_JSON" --out "$LAMBDA_OUT"
ls -la "$LAMBDA_OUT"

echo "\n✅ Smoke test complete"
echo "- Local PDF:  $LOCAL_OUT"
echo "- Lambda PDF: $LAMBDA_OUT"
