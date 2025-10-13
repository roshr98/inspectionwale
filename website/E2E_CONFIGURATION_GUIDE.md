# 🚀 End-to-End Configuration Guide

## 📝 Pre-Configuration Checklist

✅ **Generated Secret Key**: 
```
9386b0ad7c5f6d81d0a1d52c11ff1cc4658c9fe4f9d7ec5214bb7e836568e21b
```
**⚠️ SAVE THIS - You'll need it multiple times!**

✅ **Deployment Packages Ready**:
- `amplify/functions/listing-approval/function.zip` ✅
- `amplify/functions/customer-listings/function.zip` ✅

✅ **Your Current Setup**:
- **API Endpoint**: `https://423cmvhw3g.execute-api.us-east-1.amazonaws.com/prod/customer-listings`
- **Region**: `us-east-1`
- **AWS Account**: `381328846826`

---

## 🎯 Configuration Order (Follow Exactly)

### Step 1: Configure Amazon SES (15 minutes)
### Step 2: Find Existing Lambda Function (5 minutes)
### Step 3: Deploy New listing-approval Lambda (20 minutes)
### Step 4: Update customer-listings Lambda (10 minutes)
### Step 5: Test Approval Workflow (10 minutes)
### Step 6: Setup Google Analytics (20 minutes)

**Total Time: ~80 minutes**

---

## 📧 STEP 1: Configure Amazon SES

### 1.1 Open AWS Console
1. Go to: https://console.aws.amazon.com/ses/
2. **Make sure region is: US East (N. Virginia) us-east-1** ← IMPORTANT!

### 1.2 Verify Sender Email (hello@inspectionwale.com)

**If you OWN this domain:**

1. Click **"Verified identities"** in left menu
2. Click **"Create identity"**
3. Select **"Email address"**
4. Enter: `hello@inspectionwale.com`
5. Click **"Create identity"**
6. **Check your email** for verification link
7. Click the verification link
8. Wait for status to show **"Verified"** ✅

**If you DON'T own this domain yet:**

Use your personal email for testing:
1. Enter: `prasad.devadiga333@gmail.com`
2. Follow same steps above
3. **Update Later**: Once domain is registered, add hello@inspectionwale.com

### 1.3 Verify Admin Email (prasad.devadiga333@gmail.com)

1. Click **"Create identity"** again
2. Select **"Email address"**
3. Enter: `prasad.devadiga333@gmail.com`
4. Click **"Create identity"**
5. Check Gmail for verification link
6. Click verification link
7. Confirm status shows **"Verified"** ✅

### 1.4 Check SES Sandbox Status

1. In SES console, look at top-right for banner
2. If it says **"Your account is in the SES sandbox"**:
   - ✅ **This is OK for testing!**
   - You can send emails between verified addresses
   - Later: Request production access if needed

3. If you need production access NOW:
   - Click **"Request production access"**
   - Fill out form (takes 24 hours)
   - **Not needed for initial testing**

### ✅ Step 1 Complete!
**Verified Emails:**
- [ ] hello@inspectionwale.com (or prasad.devadiga333@gmail.com)
- [ ] prasad.devadiga333@gmail.com

**Note your SES_FROM email**: _________________ (use in Lambda config)

---

## 🔍 STEP 2: Find Existing Lambda Function

### 2.1 Open Lambda Console
1. Go to: https://console.aws.amazon.com/lambda/
2. **Verify region**: US East (N. Virginia) us-east-1

### 2.2 Find customer-listings Function

1. Look for functions with names like:
   - `InspectionWale-customerListings`
   - `customerListings`
   - `customer-listings`
   - Or any function related to your API

2. **How to confirm it's the right function:**
   - Click on the function name
   - Go to **"Configuration"** → **"Environment variables"**
   - Look for: `CAR_LISTINGS_TABLE` variable
   - Should point to a DynamoDB table

3. **Write down:**
   - **Function name**: _______________________________
   - **CAR_LISTINGS_TABLE**: _______________________________
   - **AWS_REGION**: _______________________________ (probably us-east-1)
   - **SES_FROM**: _______________________________ (if exists)
   - **WEBSITE_URL**: _______________________________ (if exists)

### 2.3 Get Current Environment Variables

1. Click on your customer-listings function
2. Go to **"Configuration"** → **"Environment variables"**
3. Click **"Edit"**
4. **Copy ALL existing variables** (we'll preserve these!)

**Expected variables:**
```
CAR_LISTINGS_TABLE = CarListings (or similar)
AWS_REGION = us-east-1
SES_FROM = hello@inspectionwale.com (or might not exist yet)
WEBSITE_URL = https://main.d2vwa3xmr1zslz.amplifyapp.com (or your domain)
```

5. Click **"Cancel"** (don't change anything yet!)

### ✅ Step 2 Complete!
You now have:
- [ ] Lambda function name
- [ ] DynamoDB table name
- [ ] Existing environment variables documented

---

## 🆕 STEP 3: Deploy listing-approval Lambda

### 3.1 Create New Lambda Function

1. In Lambda console, click **"Create function"**
2. Select **"Author from scratch"**
3. Enter details:
   ```
   Function name: InspectionWale-ListingApproval
   Runtime: Node.js 20.x
   Architecture: x86_64
   ```
4. Under **"Permissions"**, click **"Change default execution role"**
5. Select **"Create a new role with basic Lambda permissions"**
6. Click **"Create function"**

### 3.2 Upload Function Code

1. Wait for function to be created
2. Scroll down to **"Code source"** section
3. Click **"Upload from"** → **".zip file"**
4. Click **"Upload"**
5. **Navigate to**: `C:\Users\Administrator\Documents\Inpectionwale\website\amplify\functions\listing-approval\function.zip`
6. Click **"Save"**
7. Wait for upload to complete (should see "Successfully updated")

### 3.3 Configure Environment Variables

1. Click **"Configuration"** tab
2. Click **"Environment variables"** in left menu
3. Click **"Edit"**
4. Click **"Add environment variable"** for each:

```
Key: CAR_LISTINGS_TABLE
Value: [USE THE TABLE NAME FROM STEP 2.3]

Key: SES_FROM
Value: [USE THE VERIFIED EMAIL FROM STEP 1]

Key: APPROVAL_SECRET_KEY
Value: 9386b0ad7c5f6d81d0a1d52c11ff1cc4658c9fe4f9d7ec5214bb7e836568e21b

Key: WEBSITE_URL
Value: https://main.d2vwa3xmr1zslz.amplifyapp.com

Key: AWS_REGION
Value: us-east-1
```

5. Click **"Save"**

### 3.4 Create Function URL

1. Stay in **"Configuration"** tab
2. Click **"Function URL"** in left menu
3. Click **"Create function URL"**
4. Settings:
   ```
   Auth type: NONE
   Configure cross-origin resource sharing (CORS): ✅ CHECKED
   
   CORS settings:
   - Allow origin: *
   - Allow methods: GET, POST
   - Allow headers: *
   - Max age: 3600
   ```
5. Click **"Save"**
6. **COPY THE FUNCTION URL** (looks like: `https://abc123xyz.lambda-url.us-east-1.on.aws/`)
7. **Save this URL**: ________________________________________________

### 3.5 Configure IAM Permissions

1. Still in **"Configuration"** tab
2. Click **"Permissions"** in left menu
3. Under **"Execution role"**, click the role name (opens new tab)
4. Click **"Add permissions"** → **"Attach policies"**
5. Search and select these policies:
   - ✅ `AmazonDynamoDBFullAccess` (or create custom with GetItem, UpdateItem only)
   - ✅ `AmazonSESFullAccess` (or create custom with SendEmail only)
6. Click **"Add permissions"**

**OR Create Inline Policy (More Secure):**
1. Click **"Add permissions"** → **"Create inline policy"**
2. Click **"JSON"** tab
3. Paste this (replace TABLE_NAME):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:UpdateItem"
            ],
            "Resource": "arn:aws:dynamodb:us-east-1:381328846826:table/YOUR_TABLE_NAME"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:us-east-1:381328846826:*"
        }
    ]
}
```
4. Click **"Review policy"**
5. Name: `

`
6. Click **"Create policy"**

### 3.6 Test Function URL

1. Open browser
2. Go to your Function URL
3. You should see a **styled error page** saying:
   ```
   ⚠️ Invalid or Missing Token
   The approval link is invalid or has expired.
   ```
4. ✅ **This is CORRECT!** The function is working!

### ✅ Step 3 Complete!
You now have:
- [ ] listing-approval Lambda deployed
- [ ] Function URL created: ___________________________________
- [ ] Environment variables configured
- [ ] IAM permissions granted
- [ ] Function tested and working

---

## 🔄 STEP 4: Update customer-listings Lambda

### 4.1 Open Existing Lambda Function

1. Go back to Lambda console
2. Click on your **customer-listings** function (from Step 2)

### 4.2 Backup Current Code (Just in Case)

1. Scroll to **"Code source"**
2. Click **"Actions"** → **"Export function"**
3. Click **"Download deployment package"**
4. Save as: `customer-listings-backup.zip`

### 4.3 Upload New Code

1. Click **"Upload from"** → **".zip file"**
2. Click **"Upload"**
3. **Navigate to**: `C:\Users\Administrator\Documents\Inpectionwale\website\amplify\functions\customer-listings\function.zip`
4. Click **"Save"**
5. Wait for upload (may take 30 seconds)

### 4.4 Add New Environment Variables

1. Click **"Configuration"** tab
2. Click **"Environment variables"**
3. Click **"Edit"**
4. **KEEP all existing variables**
5. **ADD these two NEW variables**:

```
Key: APPROVAL_SECRET_KEY
Value: 9386b0ad7c5f6d81d0a1d52c11ff1cc4658c9fe4f9d7ec5214bb7e836568e21b

Key: APPROVAL_URL
Value: [PASTE THE FUNCTION URL FROM STEP 3.4]
```

6. **VERIFY these existing variables are correct**:
   - `CAR_LISTINGS_TABLE`: Should point to your DynamoDB table
   - `SES_FROM`: Should be your verified email
   - `WEBSITE_URL`: Should be your Amplify URL
   - `AWS_REGION`: Should be us-east-1

7. Click **"Save"**

### 4.5 Verify Permissions

1. Click **"Configuration"** → **"Permissions"**
2. Click on execution role name
3. Click **"Add permissions"** → **"Create inline policy"**
4. Click **"JSON"** tab
5. **Paste this exact policy** (or verify existing policy matches):

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": [
				"dynamodb:PutItem",
				"dynamodb:GetItem",
				"dynamodb:Scan",
				"dynamodb:UpdateItem"
			],
			"Resource": [
				"arn:aws:dynamodb:us-east-1:*:table/CarListings",
				"arn:aws:dynamodb:us-east-1:*:table/CarReservations"
			]
		},
		{
			"Effect": "Allow",
			"Action": [
				"s3:PutObject",
				"s3:GetObject"
			],
			"Resource": "arn:aws:s3:::inspectionwale-car-listings/*"
		},
		{
			"Effect": "Allow",
			"Action": "ses:SendEmail",
			"Resource": "*",
			"Condition": {
				"StringEquals": {
					"ses:FromAddress": "hello@inspectionwale.com"
				}
			}
		}
	]
}
```

6. Click **"Review policy"**
7. Name: `CustomerListingsPolicy`
8. Click **"Create policy"**

**✅ This policy allows:**
- DynamoDB: Read/Write to CarListings and CarReservations tables
- S3: Upload/Download car photos
- SES: Send emails ONLY from hello@inspectionwale.com (security best practice)

### 4.6 Test Existing Functionality

1. Go to your website
2. Try viewing car listings
3. **Verify**: Listings still load correctly
4. ✅ **If yes**: Update successful!
5. ❌ **If no**: Check CloudWatch Logs (see Step 4.7)

### 4.7 Check CloudWatch Logs (If Issues)

1. In Lambda console, click **"Monitor"** tab
2. Click **"View CloudWatch logs"**
3. Click the latest log stream
4. Look for errors
5. Common issues:
   - Missing environment variables
   - DynamoDB permission errors
   - SES permission errors

### ✅ Step 4 Complete!
You now have:
- [ ] customer-listings Lambda updated
- [ ] New environment variables added
- [ ] Permissions verified
- [ ] Existing functionality still working

---

## ✅ STEP 5: Test Complete Approval Workflow

### 5.1 Submit Test Listing

1. Go to your website
2. Click **"Sell Your Car"** (or listing submission page)
3. Fill out the form with **TEST data**:
   ```
   Seller Name: Test Seller
   Email: prasad.devadiga333@gmail.com
   Mobile: 9999999999
   Car Make: Honda
   Car Model: City
   Year: 2020
   KMs: 50000
   Price: 500000
   ```
4. Upload 1-2 test photos
5. Click **"Submit Listing"**

### 5.2 Check for Success Message

You should see:
```
✅ Listing submitted successfully!
Your listing will be reviewed and published shortly.
```

### 5.3 Check Admin Email

1. Check email: `prasad.devadiga333@gmail.com`
2. Look for email with subject: **"New Car Listing Submission"**
3. Email should have:
   - ✅ Car details (Make, Model, Year, etc.)
   - ✅ Seller information (Name, Email, Mobile)
   - ✅ Photo gallery
   - ✅ Large **APPROVE** button (green)
   - ✅ Large **REJECT** button (red)

### 5.4 Test Approve Button

1. Click **"Approve Listing"** button in email
2. You should see a **success page** in browser:
   ```
   ✅ Listing Approved Successfully
   The listing has been approved and is now live on the website.
   ```

### 5.5 Check Seller Confirmation Email

1. Check email: `prasad.devadiga333@gmail.com` again
2. Look for: **"Your Car Listing Has Been Approved"**
3. Should contain:
   - ✅ Car details
   - ✅ View listing link
   - ✅ Professional formatting

### 5.6 Verify Listing on Website

1. Go to your website homepage
2. Refresh the page
3. **Your test listing should appear!**
4. Click on it to view details
5. ✅ All information should be correct

### 5.7 Test Duplicate Prevention

1. Go back to listing submission form
2. Fill out SAME details:
   - **Same email**: prasad.devadiga333@gmail.com
   - **Same mobile**: 9999999999
3. Try to submit
4. **You should see error**:
   ```
   ❌ A listing already exists with this email/mobile number.
   Only one active listing per seller is allowed.
   ```

### ✅ Step 5 Complete - Workflow Working!

**Verification Checklist:**
- [ ] Test listing submitted successfully
- [ ] Admin approval email received
- [ ] Approve button works
- [ ] Seller confirmation email received
- [ ] Listing appears on website
- [ ] Duplicate prevention blocks re-submission
- [ ] Reject button works (test with another listing)

---

## 📊 STEP 6: Setup Google Analytics 4

### 6.1 Open Google Analytics

1. Go to: https://analytics.google.com/
2. Sign in with: `prasad.devadiga333@gmail.com`

### 6.2 Rename Existing Property (Recommended)

**If you have WhizzCheck property:**

1. Click **"Admin"** (gear icon at bottom-left)
2. Under **"Property"** column, click **"Property settings"**
3. In **"Property name"** field, change to:
   ```
   InspectionWale & WhizzCheck
   ```
   (This preserves historical data for both sites)
4. Click **"Save"**

### 6.3 Update Data Stream for New Domain

1. Still in **"Admin"** → **"Property"** column
2. Click **"Data streams"**
3. Click on your existing data stream (probably "WhizzCheck")
4. Update settings:
   ```
   Stream name: InspectionWale
   Website URL: https://main.d2vwa3xmr1zslz.amplifyapp.com
   
   (Or your custom domain if you have one)
   ```
5. Click **"Save"**

### 6.4 Get Measurement ID

1. Still on the data stream page
2. Look for **"Measurement ID"** at top-right
3. It looks like: `G-XXXXXXXXXX`
4. **Click the copy icon** to copy it
5. **Write it down**: G-_______________________

### 6.5 Update index.html with Measurement ID

1. Open: `C:\Users\Administrator\Documents\Inpectionwale\website\index.html`
2. Find line ~48-50 (the Google Analytics code)
3. Replace `G-XXXXXXXXXX` with your actual Measurement ID
4. Should appear in TWO places:
   - In the script src URL
   - In the gtag('config', 'G-...') line

**Example:**
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_ACTUAL_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-YOUR_ACTUAL_ID', {
    'send_page_view': true,
    'page_title': document.title,
    'page_location': window.location.href
  });
  
  // Helper function for custom events
  window.trackEvent = function(eventName, eventParams) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, eventParams);
    }
  }
</script>
```

5. Save the file

### 6.6 Commit and Push Changes

Run these commands:
```powershell
git add index.html
git commit -m "Add Google Analytics Measurement ID for InspectionWale"
git push origin main
```

### 6.7 Wait for Amplify Deployment

1. Go to: AWS Amplify Console
2. Watch for automatic deployment (2-3 minutes)
3. Wait for status: **"Deployed"** ✅

### 6.8 Test Google Analytics Tracking

1. Open your website in browser
2. Press **F12** (open DevTools)
3. Go to **"Network"** tab
4. Filter: `google-analytics` or `gtag`
5. Refresh the page
6. **You should see requests** to Google Analytics
7. ✅ Tracking is working!

### 6.9 Verify in GA4 Realtime

1. Go back to Google Analytics
2. Click **"Reports"** in left menu
3. Click **"Realtime"**
4. You should see:
   - **1 user online** (you!)
   - Page views
   - Events firing

### 6.10 Test Custom Events

1. On your website, click on a car listing
2. In GA4 Realtime, look for event: **`view_listing`**
3. Click "Reserve" on a listing
4. Look for event: **`reserve_listing`**
5. ✅ Custom events working!

### 6.11 Update Google Places API (Optional)

**If you're using same API key for reviews:**

1. Go to: https://console.cloud.google.com/
2. Sign in with: `prasad.devadiga333@gmail.com`
3. Go to **"APIs & Services"** → **"Credentials"**
4. Find your Places API key
5. Click **"Edit"**
6. Under **"Website restrictions"**, add:
   ```
   https://main.d2vwa3xmr1zslz.amplifyapp.com/*
   https://inspectionwale.com/*
   ```
   (Keep existing whizzcheck.com URLs)
7. Click **"Save"**

### ✅ Step 6 Complete!
You now have:
- [ ] Google Analytics property configured
- [ ] Measurement ID added to website
- [ ] Code deployed via Amplify
- [ ] Tracking verified in Realtime
- [ ] Custom events working
- [ ] Places API updated (if needed)

---

## 🎉 FULL E2E CONFIGURATION COMPLETE!

### ✅ Final Verification Checklist

**Email Approval System:**
- [ ] Admin receives email on new submission
- [ ] Approve button updates DynamoDB
- [ ] Reject button updates DynamoDB
- [ ] Seller receives confirmation email
- [ ] Listings appear on website after approval

**Duplicate Prevention:**
- [ ] Same email cannot submit twice
- [ ] Same mobile cannot submit twice
- [ ] Clear error message shown
- [ ] Graceful handling if check fails

**Google Analytics:**
- [ ] Page views tracked
- [ ] view_listing event fires
- [ ] reserve_listing event fires
- [ ] submit_listing event fires
- [ ] Realtime data shows in GA4

**Website Performance:**
- [ ] Listings load quickly
- [ ] Images compress on upload
- [ ] Old images show blur-up effect
- [ ] Mobile responsive
- [ ] No console errors

---

## 📊 Monitoring & Next Steps

### Daily Monitoring (First Week)

1. **Check CloudWatch Logs**:
   - Lambda → Monitor → View logs in CloudWatch
   - Look for errors or warnings

2. **Check SES Email Delivery**:
   - SES Console → Sending Statistics
   - Should show 100% delivery rate

3. **Check GA4 Reports**:
   - Analytics → Reports → Engagement
   - Monitor user behavior

4. **Check DynamoDB**:
   - DynamoDB Console → Tables → Items
   - Verify new listings appear
   - Status should be 'approved' or 'pending'

### Cost Monitoring

1. **AWS Cost Explorer**:
   - Check daily costs
   - Should be $0 within free tier

2. **Set Budget Alert**:
   - Go to AWS Billing
   - Create budget: $5/month
   - Get email if exceeded

### Performance Optimization (Later)

1. **Create DynamoDB GSI**:
   - Index on `sellerEmail` for faster duplicate checks
   - Index on `status + createdAt` for faster queries

2. **Enable CloudFront CDN**:
   - Cache images at edge locations
   - Faster page loads worldwide

3. **Implement Image Resizing**:
   - Lambda@Edge for on-the-fly resizing
   - Serve optimal image sizes

---

## 🆘 Troubleshooting

### Issue: No admin email received

**Check:**
1. SES emails are verified
2. Lambda has SES permissions
3. CloudWatch logs show "Email sent successfully"
4. Check spam folder
5. SES account not in sandbox (or both emails verified)

### Issue: Approve button doesn't work

**Check:**
1. listing-approval Lambda has DynamoDB permissions
2. Function URL is correct in customer-listings env vars
3. Token hasn't expired (7 days)
4. CloudWatch logs for errors

### Issue: Duplicate prevention not working

**Check:**
1. DynamoDB has Scan permission
2. sellerEmail and sellerMobile fields exist
3. status field is 'approved' for existing listing
4. CloudWatch logs for errors

### Issue: GA4 not tracking

**Check:**
1. Measurement ID is correct
2. Website is deployed (not local)
3. Adblocker is disabled
4. Network requests show gtag calls
5. Wait 24 hours for data to appear in reports

---

## 📞 Support

**If you encounter issues:**

1. Check CloudWatch Logs first
2. Review this guide step-by-step
3. Verify all environment variables
4. Test each component individually
5. Check AWS service status page

**Common AWS Resource Names:**
- Lambda: `InspectionWale-customerListings`, `InspectionWale-ListingApproval`
- DynamoDB: `CarListings`
- S3: `inspectionwale-photos` (or similar)
- API Gateway: `InspectionWale-API`

---

**Configuration Date**: October 12, 2025  
**Guide Version**: 1.0  
**Estimated Total Time**: 80 minutes  
**Difficulty**: Moderate  
**Prerequisites**: AWS Account, Domain (optional), Gmail access  

🚀 **You're ready to scale to thousands of listings with full automation!**
