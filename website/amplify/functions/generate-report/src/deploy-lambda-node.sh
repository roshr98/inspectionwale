#!/usr/bin/env bash
set -euo pipefail

FUNCTION_NAME="inspectionwale-generate-report"
REGION="us-east-1"
ZIP_NAME="lambda-deployment-node.zip"

# Package from this folder (amplify/functions/generate-report/src)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v zip >/dev/null 2>&1; then
  echo "Error: zip is not installed or not on PATH." >&2
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "Error: aws CLI is not installed or not on PATH." >&2
  exit 1
fi

rm -f "$ZIP_NAME"

# Create a minimal Node/Playwright deployment artifact.
# - Includes: handler, renderer, template files, node_modules.
# - Excludes: legacy Python artifacts, old backups, existing zips.
zip -qr "$ZIP_NAME" \
  index.js templateRenderer.js package.json package-lock.json \
  pdf-template node_modules lambda-fonts \
  -x "package/*" "__pycache__/*" "*.py" "*.zip" \
     "index-*.js" "index*.backup*" "index*.old*" "index-old-*.js" \
     "lambda_function*" "requirements.txt" "temp-*.txt"

ZIP_PATH_POSIX="$SCRIPT_DIR/$ZIP_NAME"
ZIP_PATH_NATIVE="$ZIP_PATH_POSIX"
if command -v cygpath >/dev/null 2>&1; then
  ZIP_PATH_NATIVE="$(cygpath -m "$ZIP_PATH_POSIX")"
fi

ZIP_SIZE_BYTES="$(wc -c < "$ZIP_NAME" | tr -d '[:space:]')"

# On Windows, AWS CLI (Windows exe) often can't read Git-Bash /c/... paths.
# Also, direct upload has a strict request size limit; fall back to S3 deploy.
DIRECT_UPLOAD_MAX_BYTES=65000000
if [ "$ZIP_SIZE_BYTES" -gt "$DIRECT_UPLOAD_MAX_BYTES" ]; then
  echo "Zip is $ZIP_SIZE_BYTES bytes; using S3-based deployment."

  ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
  DEPLOY_BUCKET="${LAMBDA_DEPLOY_BUCKET:-inspectionwale-lambda-deploy-${ACCOUNT_ID}-${REGION}}"
  DEPLOY_KEY="lambda/${FUNCTION_NAME}/lambda-deployment-node-$(date +%Y%m%d-%H%M%S).zip"

  if ! aws s3api head-bucket --bucket "$DEPLOY_BUCKET" >/dev/null 2>&1; then
    echo "Creating deploy bucket s3://$DEPLOY_BUCKET"
    if [ "$REGION" = "us-east-1" ]; then
      aws s3api create-bucket --bucket "$DEPLOY_BUCKET" --region "$REGION" >/dev/null
    else
      aws s3api create-bucket --bucket "$DEPLOY_BUCKET" --region "$REGION" \
        --create-bucket-configuration LocationConstraint="$REGION" >/dev/null
    fi
  fi

  aws s3 cp "$ZIP_PATH_NATIVE" "s3://$DEPLOY_BUCKET/$DEPLOY_KEY" >/dev/null

  aws lambda update-function-code \
    --region "$REGION" \
    --function-name "$FUNCTION_NAME" \
    --s3-bucket "$DEPLOY_BUCKET" \
    --s3-key "$DEPLOY_KEY" >/dev/null

  echo "✅ Deployed $FUNCTION_NAME from s3://$DEPLOY_BUCKET/$DEPLOY_KEY"
  exit 0
fi

aws lambda update-function-code \
  --region "$REGION" \
  --function-name "$FUNCTION_NAME" \
  --zip-file "fileb://$ZIP_PATH_NATIVE"

echo "✅ Deployed $FUNCTION_NAME from $ZIP_NAME"