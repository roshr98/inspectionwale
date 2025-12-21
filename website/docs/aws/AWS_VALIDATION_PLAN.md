# AWS Integration Validation Plan

This checklist covers the resources that must be verified before merging the redesigned UI into the production `main` branch that deploys via AWS Amplify. All commands assume **Region: `us-east-1`** and AWS Account **381328846826**.

## 0. Prerequisites
- Install AWS CLI v2 locally and run `aws configure` with prod credentials that have Amplify, API Gateway, Lambda, DynamoDB, S3, SES, and CloudFront permissions.
- Confirm identity with `aws sts get-caller-identity` and note the active account/role.

### Latest Validation Run — 30 Nov 2025
- `aws --version` → `aws-cli/2.32.6 Python/3.13.9 Windows/11 exe/AMD64`
- `aws sts get-caller-identity` → Account `381328846826`, user `arn:aws:iam::381328846826:root`
- Created DynamoDB table `CarValueRequests` (`PAY_PER_REQUEST`, PITR enabled) and verified insert with `aws dynamodb scan --table-name CarValueRequests`
- Packaged and deployed Lambda `inspectionwale-car-value` (Node.js 22.x) with env vars `CAR_VALUE_TABLE`, `SES_FROM`, `SES_TO`
- Added `/car-value` resource + POST/OPTIONS on API Gateway `423cmvhw3g`, mapped to the new Lambda, deployed stage `prod`, and granted invoke permission via `aws lambda add-permission`
- Updated Amplify app `daouxvnc3zwm` custom rules to proxy `/api/car-value` to `https://423cmvhw3g.execute-api.us-east-1.amazonaws.com/prod/car-value`
- Smoke test: `curl -i -X POST https://423cmvhw3g.execute-api.us-east-1.amazonaws.com/prod/car-value -d '{"name":"Test","mobile":"9999999999"}'` → HTTP 200 with CORS headers and corresponding DynamoDB record

## 1. Amplify Hosting
1. `aws amplify list-apps --region us-east-1`
2. Identify the production app ID (e.g., `dxxxxxxxx`).
3. `aws amplify list-branches --app-id <APP_ID>` to confirm the `main` branch connects to this repo.
4. `aws amplify get-app --app-id <APP_ID>` to note the default domain (e.g., `https://main.<app-id>.amplifyapp.com`).
5. In Amplify Console → *Rewrites & redirects*, ensure rules forward `/api/*` to API Gateway (proxy) and map `/` to `index.html`, `/car-marketplace/` to `car-marketplace/index.html`, `/Used-Car-Marketplace` alias, etc.

## 2. API Gateway & Lambda
1. `aws apigateway get-rest-apis --region us-east-1` → locate the REST API used for `/api/quote`, `/api/customer-listings`, `/api/reviews`.
2. For each API, `aws apigateway get-resources --rest-api-id <API_ID>` and ensure resources `/quote`, `/customer-listings`, `/reviews`, `/car-value` (new) exist with GET/POST methods and Lambda proxy integration.
3. `aws lambda list-functions --region us-east-1 | grep -i inspection` to list `quote`, `customerListings`, `reviews`, `generate-report`, `c2c-inquiry`, etc.
4. For each Lambda, run `aws lambda get-function-configuration --function-name <name>` to verify environment variables:
   - `quote`: `QUOTES_TABLE`, `SES_FROM`, `SES_TO`
   - `carValue` (new): `CAR_VALUE_TABLE`, `SES_FROM`, `SES_TO`
   - `customerListings`: `CAR_LISTINGS_TABLE`, `CAR_RESERVATIONS_TABLE`, `CAR_LISTINGS_BUCKET`, `LISTINGS_REVIEW_EMAIL`
   - `reviews`: `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID`
5. Tail logs via `aws logs tail /aws/lambda/<functionName> --follow --region us-east-1` while submitting each form from staging to confirm requests succeed.

## 3. DynamoDB Tables
1. `aws dynamodb list-tables --region us-east-1` → verify presence of:
   - `CarListings`
   - `CarReservations`
   - `inspectionwale-quotes` (or equivalent existing quote table)
   - `CarValueRequests` (new table for “Check Your Car Value” form)
2. For each table:
   - `aws dynamodb describe-table --table-name <TableName>` → confirm billing mode, keys, stream status.
   - `aws dynamodb scan --table-name <TableName> --max-items 5` → confirm sample data, especially `ownership` + car metadata persists for bookings.
3. Enable PITR if not already: `aws dynamodb update-continuous-backups --table-name <TableName> --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true`.

## 4. S3 Buckets & Assets
1. `aws s3 ls` → confirm `inspectionwale-car-listings` bucket exists.
2. `aws s3api get-bucket-cors --bucket inspectionwale-car-listings` → ensure origins include Amplify prod domain + inspectionwale.com.
3. `aws s3 ls s3://inspectionwale-car-listings/placeholders/` and `.../submissions/` to verify photos referenced on homepage/marketplace exist.
4. Confirm fonts/images referenced in the new UI are present in Amplify build artifact paths (`website/Images`, `Icons`).

## 5. SES Email Flow
1. `aws ses list-identities --identity-type EmailAddress --region us-east-1` → ensure `no-reply@inspectionwale.com` and `hello@inspectionwale.com` are verified.
2. `aws ses get-identity-verification-attributes --identities no-reply@inspectionwale.com hello@inspectionwale.com` → status should be `Success`.
3. If moving out of sandbox, confirm sending quota via `aws ses get-send-quota`.
4. Send test email from each Lambda (e.g., invoke `quote` with sample payload using `aws lambda invoke`) and verify CloudWatch logs show `SES send success`.

## 6. Frontend Routing & CDN
1. After deploying to Amplify preview, hit:
   - `https://<domain>/` → address bar should show `Home` (rewrite) not `index.html`.
   - `https://<domain>/Used-Car-Marketplace` → should serve `car-marketplace/index.html` while showing desired slug.
2. Validate CDN caching/invalidations triggered post-deploy (Amplify handles automatically but confirm under **App settings → Build settings**).

## 7. Car Marketplace Data Flow
1. Confirm Lambda + API endpoints powering `js/main.js` respond with real data by running:
   - `curl https://423cmvhw3g.execute-api.us-east-1.amazonaws.com/prod/customer-listings`
   - `curl https://423cmvhw3g.execute-api.us-east-1.amazonaws.com/prod/customer-listings -X POST -d '{...}'`
2. Ensure `CarListings` items referencing S3 objects (`photos.*.url`) return HTTP 200.
3. Test reservation path hitting `/api/customer-listings` with `action: "reserve"` payload; verify DynamoDB `CarReservations` entry + SES email.

## 8. New "Check Your Car Value" Workflow
1. Create DynamoDB table `CarValueRequests` (billing mode: On-Demand, PK `requestId` string).
2. Deploy new Lambda (e.g., `carValueHandler`) with env vars `CAR_VALUE_TABLE`, `SES_FROM`, `SES_TO`.
3. Create REST resource `/car-value` + POST method → integrate with Lambda.
4. Update Amplify rewrite to proxy `/api/car-value/*` to new API stage.
5. Submit form from staging; verify DynamoDB insert + SES email + new frontend success toast.

## 9. QA Checklist After Deployment
- Submit each form (Check Car Value, Used Car Inspection, New Car Inspection, List Your Car, Reserve Listing, Book Inspection from car detail, Book Test Drive) and confirm entries in appropriate DynamoDB tables plus email notifications.
- Confirm Google Translate toggles Hindi content (script loads, dropdown displays).
- Confirm Google Reviews carousel fetches live data from `/api/reviews` (monitor CloudWatch logs for quota errors).
- Validate lighthouse/perf to ensure new assets load correctly.
- Document any manual AWS console actions (e.g., enabling SES production) in `DEPLOYMENT_CHECKLIST.md`.

> Keep this file updated as resources evolve so future releases can repeat the verification quickly.
