#!/bin/bash
# AWS related docs
mv AWS_*.md docs/aws/ 2>/dev/null
mv LAMBDA_*.md docs/aws/ 2>/dev/null
mv MONITORING_GUIDE.md docs/aws/ 2>/dev/null

# Deployment docs
mv DEPLOYMENT_*.md docs/deployment/ 2>/dev/null
mv C2C_*.md docs/deployment/ 2>/dev/null
mv CUSTOMER_LISTINGS_DEPLOYMENT.md docs/deployment/ 2>/dev/null
mv MARKETPLACE_EMAIL_DEPLOYMENT.md docs/deployment/ 2>/dev/null
mv NO_S3_DEPLOYMENT.md docs/deployment/ 2>/dev/null
mv PHOTO_UPLOAD_DEPLOYMENT_GUIDE.md docs/deployment/ 2>/dev/null
mv FINAL_DESIGN_DEPLOYMENT_READY.md docs/deployment/ 2>/dev/null
mv E2E_CONFIGURATION_GUIDE.md docs/deployment/ 2>/dev/null

# Fix/Bug related docs
mv *FIX*.md docs/fixes/ 2>/dev/null
mv BUG_*.md docs/fixes/ 2>/dev/null
mv CRITICAL_*.md docs/fixes/ 2>/dev/null
mv URGENT_*.md docs/fixes/ 2>/dev/null
mv *IMPROVEMENTS*.md docs/fixes/ 2>/dev/null
mv LOGIN_*.md docs/fixes/ 2>/dev/null

# Feature/Setup guides
mv *SETUP*.md docs/guides/ 2>/dev/null
mv *GUIDE*.md docs/guides/ 2>/dev/null
mv INSPECTOR_*.md docs/guides/ 2>/dev/null
mv GOOGLE_*.md docs/guides/ 2>/dev/null
mv ZOHO_*.md docs/guides/ 2>/dev/null
mv ANALYTICS_*.md docs/guides/ 2>/dev/null
mv PHOTO_FEATURES_*.md docs/guides/ 2>/dev/null
mv SEO_*.md docs/guides/ 2>/dev/null
mv UX_*.md docs/guides/ 2>/dev/null
mv PAGESPEED_*.md docs/guides/ 2>/dev/null
mv COPILOT_*.md docs/guides/ 2>/dev/null
mv INSPECT_ELEMENT_GUIDE.md docs/guides/ 2>/dev/null
mv COMPRESSION_TESTING_GUIDE.md docs/guides/ 2>/dev/null

# Architecture/Summary docs
mv *ARCHITECTURE*.md docs/architecture/ 2>/dev/null
mv *SUMMARY*.md docs/architecture/ 2>/dev/null
mv IMPLEMENTATION_*.md docs/architecture/ 2>/dev/null
mv *_COMPLETE.md docs/architecture/ 2>/dev/null
mv *_PLAN.md docs/architecture/ 2>/dev/null

# Remaining general docs to guides
mv *.md docs/guides/ 2>/dev/null

echo "✅ Documentation organized!"
