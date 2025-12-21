# Ads placement + “Post an ad” inquiry (Lambda-based)

This document explains how the website’s **Post an ad** button works today (email inquiry), and how the **same Lambda** can be used later to serve real ads (approved ads feed) without adding any website admin UI.

## 1) What’s implemented on the website

- Marketplace page shows **one ad section only** (the original location).
- The ad image has been replaced with **“Post an ad”**.
- Clicking it opens a small form that captures:
  - Name
  - Phone number
  - Message
- On submit, the page sends a `POST` request to `/api/ads`.
- The Ads Lambda sends an email with subject:
  - `Post an ad inquiry`

Where it is wired:
- Marketplace UI/form: [car-marketplace/index.html](car-marketplace/index.html)
- Lambda handler: [amplify/functions/ads/src/index.js](amplify/functions/ads/src/index.js)

## 2) Ads Lambda behavior

### A) POST (current use): ad inquiry email

Request:
- URL: `/api/ads`
- Method: `POST`
- JSON body example:

```json
{
  "type": "post_ad_inquiry",
  "name": "Rahul",
  "phone": "+91-99999-99999",
  "message": "I want to post an ad for my dealership.",
  "page": "car-marketplace"
}
```

Response:
- `200` → `{ "ok": true }`
- `400` → missing fields
- `500` → SES not configured / email send failed

### B) GET (future use): approved ads feed

Request:
- URL: `/api/ads`
- Method: `GET`
- Optional query:
  - `?slot=H970x200` (or comma-separated slots)

Response:
```json
{
  "ok": true,
  "items": [
    {
      "adId": "ad_123",
      "name": "My Ad",
      "slot": "H970x200",
      "imageUrl": "https://...",
      "clickUrl": "https://...",
      "alt": "My Ad",
      "priority": 10,
      "updatedAt": "2025-12-20T00:00:00.000Z"
    }
  ]
}
```

Note: the marketplace currently does **not** auto-render ads from GET (you asked to revert placements). This GET endpoint is kept so you can enable auto-ads later without rebuilding the backend.

## 3) Required AWS setup (for email)

The Ads Lambda uses Amazon SES to send the inquiry email.

Set these Lambda environment variables:
- `SES_FROM` = a verified SES identity (email or domain)
- `SES_TO` = the email address that should receive leads (your InspectionWale inbox)

Important SES notes:
- If your SES account is still in **sandbox**, you must verify both `SES_FROM` and `SES_TO`.
- In production mode, you can send to unverified recipients (depending on SES settings).

## 4) Required Amplify routing

Make sure Amplify routes `/api/ads` to the Ads Lambda Function URL.

Configured in: [amplify-build-spec.yml](amplify-build-spec.yml)
- Rule:
  - source: `/api/ads`
  - target: `https://<YOUR_ADS_LAMBDA_FUNCTION_URL>/`

Replace the placeholder with your real Function URL.

## 5) (Later) Console-driven real ads (DynamoDB + S3)

When you have real ads ready to show on the site, you can:

1) Upload ad images to S3.
2) Create DynamoDB items in table `inspectionwale-ads` (or set `ADS_TABLE`).

Minimal DynamoDB attributes:
- `adId` (Partition key)
- `status`: `approved`
- `slot`: e.g. `H970x200`
- `imageUrl`: public URL (CloudFront/S3 public URL)
- Optional: `clickUrl`, `priority`, `startAt`, `endAt`

The Lambda `GET /api/ads` will return only `status=approved` and within time windows.

If you want, I can re-enable auto-rendering in the marketplace later (without changing layout) once you confirm the exact slot size(s) you want to use.
