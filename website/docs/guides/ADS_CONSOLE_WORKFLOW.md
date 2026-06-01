# AWS Console Ads Workflow (No Website Admin UI)

Goal:
1) **Today**: capture “Post an ad” leads (store in DynamoDB)
2) **Later**: upload an ad image + approve it in DynamoDB + (optionally) render it on the website

This repo includes a ready Lambda handler at `amplify/functions/ads/src/index.js`.

## A) Lead capture (today)

The marketplace currently uses **only the “Post an ad” lead form** (no ad rendering).

### 1) Create DynamoDB table
Create a table (example):
- **Table name:** `inspectionwale-ads`
- **Partition key:** `adId` (String)

This single table can hold both:
- Lead items (`status = lead`)
- Real ad items (`status = approved`)

### 2) Configure the Ads Lambda
- Function code: `amplify/functions/ads/src/index.js`
- Set environment variable:
  - `ADS_TABLE = inspectionwale-ads`

### 3) Attach permissions
Lambda execution role permissions:
- `dynamodb:PutItem` on the ads table (required for lead capture)

Optional (only if you will use `GET /api/ads` later):
- `dynamodb:Scan` on the ads table

### 4) (Optional) Enable email notifications later
If you want each lead to send an email:
- `SES_FROM = <verified SES identity>`
- `SES_TO = <your inbox (can be comma-separated)>`

If SES is not configured, the API still returns `{ ok: true }` and stores the lead in DynamoDB.

## B) Posting a real ad later (when you have an image)

When you have a banner image and want it to show on the website, follow these steps.

### 1) Prepare the banner image
- Recommended size: **970×200px** (JPG/PNG/WebP)
- Keep it small (target: **≤ 300 KB**)
- Use a clean filename (no spaces), e.g. `brand1-970x200.webp`

### 2) Upload ad image to S3
- Upload your banner image to **any S3 bucket that is publicly readable via HTTPS** (or behind CloudFront).
- Recommended: reuse your existing public bucket used for car images and keep ads under a prefix like:
  - `ads/970x200/<your-file>.jpg`
  - `ads/300x600/<your-file>.jpg`

You will need the final HTTPS URL (example):
- `https://<bucket>.s3.amazonaws.com/ads/970x200/brand1.jpg`

### 3) Create the ad item in DynamoDB
In DynamoDB Console, create an item in the same table (`inspectionwale-ads`).

Minimum attributes per ad item:
- `adId` (String) – unique, e.g. `ad_2026_01_brand1`
- `name` (String) – label
- `slot` (String) – dimensions/placement selector (pick one)
- `imageUrl` (String) – HTTPS URL to the banner image
- `clickUrl` (String) – destination
- `status` (String) – set `approved` to display

Optional attributes:
- `priority` (Number) – higher shows first
- `startAt` (String ISO) – optional start time
- `endAt` (String ISO) – optional end time

Recommended `slot` values (suggested):
- `H970x200`
- `V300x600`

### 4) Approve the ad
- In DynamoDB Console, set:
  - `status = approved`

Once approved, it will be returned by `GET /api/ads`.

## C) API access for approved ads (later)

### 1) Create/Update Lambda
- Runtime: Node.js 18 or 20
- Create a new function (example name): `inspectionwale-ads`
- Set environment variable:
  - `ADS_TABLE = inspectionwale-ads`

### 2) Attach permissions
Add IAM permissions for DynamoDB read:
- `dynamodb:Scan` on the ads table

### 3) Enable Function URL
- Enable a **Lambda Function URL** (Auth: NONE)

This is safe because the function returns only ads where `status=approved`.

## Route it on your website domain

### 7) Add an Amplify rewrite rule
In your Amplify app settings (or in `amplify-build-spec.yml`), add:
- source: `/api/ads`
- target: `https://<your-lambda-function-url>.lambda-url.<region>.on.aws/`
- status: `200`

After deploy, your site can call:
- `/api/ads`

## D) Rendering ads on the site (not enabled yet)

Right now the marketplace page shows a **“Post an ad”** lead capture card and does not render approved ads.

When you’re ready to integrate real ads, you can either:
1) Replace the “Post an ad” card with a real banner image element, or
2) Add a second slot for ads (recommended)

Then add small JS to call `GET /api/ads?slot=H970x200` and set the returned `imageUrl` + `clickUrl`.
