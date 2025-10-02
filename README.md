
# InspectionWale (monorepo)

Monorepo for InspectionWale (frontend + backend PDF generator + infra).

## Layout
- `frontend/` - Amplify-hosted website (inspector & customer portals).
- `backend/pdf-generator/` - Lambda container (Puppeteer) to render HTML -> PDF.
- `infrastructure/` - CDK or CloudFormation definitions.

## Quick start (local)
See each folder's README.md for specific run steps.

## Important
This scaffold is intended to be merged into your existing repository https://github.com/roshr98/inspectionwale.
