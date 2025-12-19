# AWS Console Ads Workflow (No Website Admin UI)

Goal: manage ads entirely from AWS Console (upload image + set status/dimensions) and have ads appear automatically on the website.

This repo includes a ready Lambda handler at `amplify/functions/ads/src/index.js`.

## What you manage in AWS Console

### 1) Upload ad image to S3
- Upload your banner image to **any S3 bucket that is publicly readable via HTTPS** (or behind CloudFront).
- Recommended: reuse your existing public bucket used for car images and keep ads under a prefix like:
  - `ads/970x200/<your-file>.jpg`
  - `ads/300x600/<your-file>.jpg`

You will need the final HTTPS URL (example):
- `https://<bucket>.s3.amazonaws.com/ads/970x200/brand1.jpg`

### 2) Create a DynamoDB table for ad metadata
Create a table (example):
- **Table name:** `inspectionwale-ads`
- **Partition key:** `adId` (String)

Minimum attributes per item:
- `adId` (String) – unique
- `name` (String) – any label you want
- `slot` (String) – dimensions/placement selector
- `imageUrl` (String) – HTTPS URL to the image
- `clickUrl` (String) – where to send users on click
- `status` (String) – use `approved` to display

Optional attributes:
- `priority` (Number) – higher shows first
- `startAt` (String ISO) – optional start time
- `endAt` (String ISO) – optional end time

Recommended `slot` values (keep these exact for the current website integration):
- `H970x200`
- `V300x600`

### 3) Approve an ad
- In DynamoDB Console, edit the item and set:
  - `status = approved`

Once approved, it will be returned by the API and appear automatically.

## AWS Lambda: public read API (no admin UI)

### 4) Create Lambda
- Runtime: Node.js 18 or 20
- Create a new function (example name): `inspectionwale-ads`
- Set environment variable:
  - `ADS_TABLE = inspectionwale-ads`

### 5) Attach permissions
Add IAM permissions for DynamoDB read:
- `dynamodb:Scan` on the ads table

### 6) Enable Function URL
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

## How it appears on the site

The marketplace page will fetch `/api/ads` and fill these slots:
- Horizontal: 970×200 (`slot=H970x200`)
- Vertical: 300×600 (`slot=V300x600`)

If no approved ad exists for a slot, the grey bordered placeholder remains.
