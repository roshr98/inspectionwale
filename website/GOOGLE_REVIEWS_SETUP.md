# Google Reviews Integration Guide for InspectionWale

## Overview
This guide walks you through integrating live Google Business reviews into your InspectionWale website using Google Places API.

**Prerequisites**:
- Google Business Profile (Google My Business account)
- Google Cloud Console project
- AWS Lambda function deployed

---

## Part 1: Get Your Google Place ID

### Step 1: Find Your Business on Google Maps
1. Go to https://www.google.com/maps
2. Search for your business name: **InspectionWale**
3. Click on your business listing
4. Look at the URL in your browser — it will look like:
   ```
   https://www.google.com/maps/place/InspectionWale/@19.1234,72.5678,17z/data=!3m1!4b1!4m6!3m5!1s0xABCDEF123456:0x123456789ABCDEF...
   ```

### Step 2: Extract Place ID (Easy Method)
1. While on your Google Maps business page, right-click anywhere on the page
2. Click **View page source** (or press Ctrl+U)
3. Press Ctrl+F to search for: `"place_id"`
4. You'll find something like: `"place_id":"ChIJN1t_tDeuEmsRUsoyG83frY4"`
5. **Copy this Place ID** — it starts with `ChIJ` and is ~27 characters long

### Alternative: Use Place ID Finder Tool
1. Go to: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
2. Search for your business name
3. Click on your business in the results
4. Copy the **Place ID** shown

**Save your Place ID** — Example: `ChIJN1t_tDeuEmsRUsoyG83frY4`

---

## Part 2: Enable Google Places API in Google Cloud Console

### Step 1: Open Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account
3. Select your project (or create a new one if needed)

### Step 2: Enable Places API
1. In the left sidebar, click **APIs & Services** → **Library**
2. In the search bar, type: **Places API**
3. Click on **Places API** (not "Places API (New)")
4. Click the blue **Enable** button
5. Wait a few seconds for it to activate

### Step 3: Create API Credentials
1. In left sidebar, click **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **API key**
4. A popup will show your new API key (looks like: `AIzaSyD1234567890ABCdefGHIjklMNOpqrSTUv`)
5. **Copy this API key** — you'll need it for Lambda configuration

### Step 4: Restrict API Key (Recommended for Security)
1. In the API key popup, click **EDIT API KEY** (or click the pencil icon next to your key)
2. Under **API restrictions**:
   - Select **Restrict key**
   - Check **Places API**
   - Uncheck all other APIs
3. Under **Application restrictions** (optional but recommended):
   - Select **HTTP referrers (web sites)**
   - Click **+ ADD AN ITEM**
   - Add your Amplify domain: `https://main.d1234567890.amplifyapp.com/*`
   - Add localhost for testing: `http://localhost:*`
4. Click **Save**

**Save your API Key** — Example: `AIzaSyD1234567890ABCdefGHIjklMNOpqrSTUv`

---

## Part 3: Set Up Lambda Function for Reviews

### Step 1: Create Lambda Function in AWS Console
1. Go to AWS Lambda Console: https://console.aws.amazon.com/lambda/
2. Ensure region is **us-east-1 (N. Virginia)**
3. Click **Create function**

### Step 2: Configure Function
- **Function name**: `inspectionwale-reviews`
- **Runtime**: **Node.js 20.x** (or latest)
- **Architecture**: x86_64
- **Permissions**: Create a new role with basic Lambda permissions
- Click **Create function**

### Step 3: Upload Function Code
1. After function is created, you'll see the **Code** tab
2. In the editor, delete the existing `index.mjs` file content
3. Open your local file: `C:\Users\Administrator\Documents\Inpectionwale\website\amplify\functions\reviews\src\index.js`
4. **Copy all the code** from that file
5. **Paste it** into the Lambda editor
6. Click **File** → **Rename** and change `index.mjs` to `index.js`
7. Click **Deploy** button (orange)

### Step 4: Add Environment Variables
1. Click **Configuration** tab → **Environment variables** → **Edit**
2. Add these two environment variables:
   - Key: `GOOGLE_PLACES_API_KEY`, Value: `YOUR_API_KEY_HERE` (paste the API key from Part 2, Step 3)
   - Key: `GOOGLE_PLACE_ID`, Value: `YOUR_PLACE_ID_HERE` (paste the Place ID from Part 1)
3. Click **Save**

### Step 5: Create Function URL
1. Still in **Configuration** tab, click **Function URL** in left sidebar
2. Click **Create function URL**
3. Configure:
   - **Auth type**: **NONE**
   - **Configure CORS**: ✅ Check this box
   - **Allow origin**: `*` (or your specific domain)
   - **Allow methods**: `GET, OPTIONS`
   - **Allow headers**: `content-type`
4. Click **Save**
5. **Copy the Function URL** (e.g., `https://xyz789.lambda-url.us-east-1.on.aws/`)

---

## Part 4: Configure Amplify to Proxy Reviews API

### Step 1: Open Amplify Console
1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify/
2. Click on your app: **inspectionwale**

### Step 2: Add Rewrite Rule for Reviews
1. In left sidebar, click **Hosting** → **Rewrites and redirects**
2. Click **Open text editor**
3. You should already have a rule for `/api/quote`. Add this rule **below** it:
```json
[
  {
    "source": "/api/quote",
    "target": "https://YOUR_QUOTE_FUNCTION_URL",
    "type": "200",
    "condition": null
  },
  {
    "source": "/api/reviews",
    "target": "https://YOUR_REVIEWS_FUNCTION_URL",
    "type": "200",
    "condition": null
  }
]
```
Replace `YOUR_REVIEWS_FUNCTION_URL` with the Function URL you copied in Part 3, Step 5

4. Click **Save**
5. Amplify will redeploy (takes ~1-2 minutes)

---

## Part 5: Test Everything

### Test 1: Test Lambda Function Directly
1. Go to Lambda Console → `inspectionwale-reviews` function
2. Click **Test** tab
3. Create a new test event (any name, keep default JSON)
4. Click **Test**
5. Check **Execution results**:
   - Should see `statusCode: 200`
   - Should see `"ok": true`
   - Should see `"reviews": [...]` with actual review data
   - If you see sample/fallback reviews, check that API key and Place ID are correctly set

### Test 2: Test from Browser (Direct Lambda URL)
1. Open a new browser tab
2. Paste your Lambda Function URL: `https://xyz789.lambda-url.us-east-1.on.aws/`
3. Press Enter
4. You should see JSON response with reviews:
```json
{
  "ok": true,
  "businessName": "InspectionWale",
  "overallRating": 4.9,
  "totalReviews": 127,
  "reviews": [...]
}
```

### Test 3: Test from Your Live Website
1. Open your Amplify site: `https://main.d1234567890.amplifyapp.com`
2. Scroll down to the **"What Our Customers Say on Google"** section
3. You should see:
   - Overall rating (e.g., 4.9 stars)
   - Total review count
   - Individual review cards with:
     - Reviewer name and photo
     - Star rating
     - Review text
     - Time posted

### Test 4: Check Browser Console (F12)
1. Press F12 to open Developer Tools
2. Go to **Console** tab
3. Look for any errors related to `/api/reviews`
4. If you see CORS errors or 404s, double-check the Amplify rewrite rule

---

## Troubleshooting

### Issue: Reviews show "Loading..." forever
**Possible causes**:
1. **Amplify rewrite rule not configured**
   - Check Amplify Console → Rewrites and redirects
   - Ensure `/api/reviews` rule is present and points to correct Lambda URL

2. **CORS error in browser console**
   - Check Lambda Function URL has CORS enabled
   - Verify `Allow origin` is set to `*` or your domain

3. **Lambda function error**
   - Go to Lambda Console → Monitor → View CloudWatch logs
   - Look for error messages

### Issue: Shows sample/fallback reviews instead of real ones
**Possible causes**:
1. **API key or Place ID not set**
   - Check Lambda → Configuration → Environment variables
   - Ensure `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` are set correctly

2. **API key not enabled for Places API**
   - Go to Google Cloud Console → APIs & Services → Library
   - Ensure **Places API** is enabled

3. **API key restricted too much**
   - Check Google Cloud Console → Credentials → Your API key
   - Ensure it allows Places API
   - Check HTTP referrer restrictions aren't blocking Lambda

4. **Wrong Place ID**
   - Verify Place ID is correct (starts with `ChIJ`)
   - Try the Place ID finder tool again

### Issue: Google API returns "REQUEST_DENIED"
**Possible causes**:
1. **Places API not enabled**
   - Enable it in Google Cloud Console

2. **Billing not enabled on Google Cloud project**
   - Go to Google Cloud Console → Billing
   - Ensure a billing account is linked (Google gives $200 free credit)

3. **API key restrictions too tight**
   - Temporarily remove all restrictions to test
   - Then re-add them once working

### Issue: No reviews showing (but API works)
**Possible causes**:
1. **Business has no reviews yet**
   - Ask customers to leave reviews on Google
   - Use the "Write a Review" button on the page

2. **Reviews are private or filtered**
   - Check your Google Business Profile settings

---

## Understanding Google Places API Costs

### Free Tier (Generous!)
- **First $200/month**: FREE (Google Cloud free credit)
- **Place Details requests**: $17 per 1,000 calls
- **Typical usage**: ~1 call per page load = very low cost

### Example Calculation
- 10,000 page views/month = 10,000 API calls
- Cost: 10 × $17 = $170/month
- **Covered by $200 free credit** = $0 actual cost

### Cost Optimization Tips
1. **Cache reviews on server side** (optional):
   - Store reviews in DynamoDB
   - Refresh every 24 hours instead of every page load
   - Reduces API calls by ~99%

2. **Limit review count**:
   - Currently fetches 6 reviews (`.slice(0, 6)`)
   - Fewer reviews = smaller API response = faster

3. **Monitor usage**:
   - Check Google Cloud Console → Billing → Reports
   - Set up budget alerts

---

## Updating Reviews Display

### To show more/fewer reviews
Edit `amplify/functions/reviews/src/index.js`, line ~23:
```javascript
const reviews = (j.result.reviews || []).slice(0, 6)  // Change 6 to any number
```

### To change review card layout
Edit `index.html`, search for "Google Reviews" section and modify the HTML structure.

### To add photos from reviews
The Lambda already fetches photos. You can display them by editing the review card template in `index.html`.

---

## Google Business Profile Tips

### Get More Reviews
1. Send follow-up emails after inspections with Google review link
2. Add QR code to printed reports linking to Google review page
3. Share review link on social media
4. Respond to all reviews (builds trust and encourages more reviews)

### Optimize Your Profile
1. Add high-quality photos of your team and inspections
2. Keep business hours and contact info updated
3. Post regular updates (Google Posts)
4. Respond quickly to questions

---

## Quick Reference

### Environment Variables (Lambda)
| Variable | Example | Where to Get It |
|----------|---------|----------------|
| `GOOGLE_PLACES_API_KEY` | `AIzaSyD123...` | Google Cloud Console → Credentials |
| `GOOGLE_PLACE_ID` | `ChIJN1t_tDeu...` | Google Maps → Your business → URL |

### Key URLs
- **Google Cloud Console**: https://console.cloud.google.com/
- **Google My Business**: https://business.google.com/
- **Place ID Finder**: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
- **AWS Lambda Console**: https://console.aws.amazon.com/lambda/

---

## Next Steps

1. ✅ Get your Google Place ID from Google Maps
2. ✅ Enable Places API in Google Cloud Console
3. ✅ Create and restrict API key
4. ✅ Deploy reviews Lambda function
5. ✅ Set environment variables (API key + Place ID)
6. ✅ Create Function URL with CORS
7. ✅ Add Amplify rewrite rule for `/api/reviews`
8. ✅ Test Lambda directly
9. ✅ Test from live website
10. ✅ Monitor usage and costs

Once complete, your website will display live Google reviews with:
- Overall rating and total review count
- Individual review cards with star ratings
- Reviewer names and profile photos
- Review text and timestamps
- Direct link to write new reviews

Good luck! 🌟
