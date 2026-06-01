# C2C Marketplace Deployment Guide

## Overview
This guide covers the deployment of the Customer-to-Customer (C2C) Car Marketplace feature for inspectionWale.

## What Was Added

### 1. **Frontend Changes (index.html)**
- ✅ Updated section title from "Featured Owner Deals" to "Customer-to-Customer Car Marketplace"
- ✅ Added "Show More" button with rounded edges linking to `C2C_Marketplace.html`

### 2. **New Page: C2C_Marketplace.html**
- ✅ Full marketplace page with inspectionWale branding
- ✅ Logo at top
- ✅ Banner with background image and title
- ✅ Car listings displayed as cards
- ✅ "Tell Us What You're Looking For" inquiry button
- ✅ Detailed inquiry form modal

### 3. **Inquiry Form Fields**
- Budget (required)
- Name (required)
- Mobile Number (required, 10 digits)
- Email (optional)
- Preferred Car Make (dropdown with popular makes)
- Preferred Model (text input with suggestions)
- Fuel Type (dropdown: Petrol, Diesel, CNG, Electric, Any)
- Location (required)
- Additional Comments (optional)

### 4. **Lambda Function: c2c-inquiry**
- ✅ Location: `amplify/functions/c2c-inquiry/index.js`
- ✅ Validates required fields
- ✅ Formats budget in Indian number system
- ✅ Sends formatted email via AWS SES to `inspectionwale@zohomail.in`
- ✅ Handles CORS properly

## Deployment Steps

### Step 1: Deploy Frontend Files (AWS Amplify)

1. **Commit and push changes:**
   ```powershell
   cd "c:\Users\Administrator\Documents\Inpectionwale\website"
   git add index.html C2C_Marketplace.html
   git commit -m "Add C2C Car Marketplace with inquiry form"
   git push
   ```

2. **Wait for Amplify auto-deploy** (2-3 minutes)
   - Check: https://console.aws.amazon.com/amplify
   - Website will update automatically

### Step 2: Deploy Lambda Function

#### Option A: Via Amplify CLI (Recommended)

```powershell
# If you have Amplify CLI configured
amplify function build c2c-inquiry
amplify push
```

#### Option B: Manual Deployment via AWS Console

1. **Package the Lambda function:**
   ```powershell
   cd amplify\functions\c2c-inquiry
   npm install
   Compress-Archive -Path .\* -DestinationPath ..\c2c-inquiry.zip -Force
   ```

2. **Create Lambda function in AWS Console:**
   - Go to: https://console.aws.amazon.com/lambda
   - Click "Create function"
   - Name: `inspectionwale-c2c-inquiry`
   - Runtime: Node.js 18.x or later
   - Click "Create function"

3. **Upload the code:**
   - In the "Code" section, click "Upload from" → ".zip file"
   - Upload `c2c-inquiry.zip`
   - Click "Save"

4. **Configure Function:**
   - **Timeout:** 30 seconds (Configuration → General configuration)
   - **Memory:** 256 MB
   - **Environment variables:**
     - `AWS_REGION`: `us-east-1`

5. **Create Function URL:**
   - Go to Configuration → Function URL
   - Click "Create function URL"
   - Auth type: NONE
   - Configure CORS:
     - Allow origin: `*`
     - Allow methods: `POST, OPTIONS`
     - Allow headers: `Content-Type`
   - Click "Save"
   - **Copy the Function URL** (you'll need this)

6. **Update SES Permissions:**
   - Go to Configuration → Permissions
   - Click on the execution role name
   - Add inline policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ses:SendEmail",
           "ses:SendRawEmail"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

### Step 3: Update Frontend with Lambda URL

1. **Edit C2C_Marketplace.html:**
   - Find line with: `fetch('/api/c2cInquiry'`
   - Replace `/api/c2cInquiry` with your Lambda Function URL
   - Example:
     ```javascript
     const res = await fetch('https://YOUR-LAMBDA-URL.lambda-url.us-east-1.on.aws/', {
     ```

2. **Commit and push:**
   ```powershell
   git add C2C_Marketplace.html
   git commit -m "Update C2C inquiry form with Lambda URL"
   git push
   ```

### Step 4: Verify SES Email Configuration

1. **Verify sender email:**
   - Go to: https://console.aws.amazon.com/ses
   - Click "Verified identities"
   - Ensure `inspectionwale@zohomail.in` is verified
   - If not, click "Create identity" and verify

2. **Check if in SES Sandbox:**
   - If in sandbox mode, you can only send to verified emails
   - To send to any email, request production access:
     - SES Console → Account dashboard
     - Click "Request production access"

## Testing

### Test the Marketplace Page

1. **Visit the marketplace:**
   - Go to: `https://your-domain.com/C2C_Marketplace.html`
   - Or from homepage, click "Show More" button

2. **Test inquiry form:**
   - Click "Looking for Something Specific? Tell Us!"
   - Fill required fields:
     - Budget: 500000
     - Name: Test User
     - Number: 9876543210
     - Location: Mumbai
   - Click "Submit Requirements"

3. **Verify email received:**
   - Check `inspectionwale@zohomail.in` inbox
   - Should receive formatted email with all details

### Troubleshooting

**Issue: "Failed to submit" error**
- Check browser console for error details
- Verify Lambda Function URL is correct
- Check Lambda CloudWatch logs: `/aws/lambda/inspectionwale-c2c-inquiry`

**Issue: No email received**
- Check SES sending quota (50 emails/day in sandbox)
- Verify `inspectionwale@zohomail.in` is verified identity
- Check Lambda CloudWatch logs for SES errors
- Verify Lambda has SES permissions

**Issue: CORS error**
- Ensure Lambda Function URL has CORS configured
- Allow origins: `*`
- Allow methods: `POST, OPTIONS`
- Allow headers: `Content-Type`

## Files Created/Modified

### New Files:
- ✅ `C2C_Marketplace.html` - Full marketplace page
- ✅ `amplify/functions/c2c-inquiry/index.js` - Lambda handler
- ✅ `amplify/functions/c2c-inquiry/package.json` - Dependencies
- ✅ `C2C_MARKETPLACE_DEPLOYMENT.md` - This guide

### Modified Files:
- ✅ `index.html` - Updated section title and added "Show More" button

## Features Summary

### Customer-Facing Features:
1. ✅ Browse verified car listings in card layout
2. ✅ View detailed car information
3. ✅ Submit specific requirements via form
4. ✅ Dropdown for popular car makes
5. ✅ Auto-suggestions for popular models
6. ✅ Fuel type selection
7. ✅ Budget and location filters

### Backend Features:
1. ✅ Fetches listings from existing `/api/customerListings` endpoint
2. ✅ Form validation (required fields, mobile number format)
3. ✅ Formatted email notifications with Indian currency
4. ✅ Responsive design matching main website
5. ✅ Professional email template with customer details

## Next Steps (Optional)

### Enhancement Ideas:
1. **Save inquiries to DynamoDB** - Track customer requirements
2. **Auto-matching** - Notify customers when matching cars are listed
3. **SMS notifications** - Use SNS to send SMS confirmations
4. **Admin dashboard** - View and manage inquiries
5. **Filter and search** - Add filters by price range, year, etc.

## Quick Commands

```powershell
# Deploy everything
git add .
git commit -m "Deploy C2C Marketplace with inquiry form"
git push

# Check Amplify deployment status
# Go to: https://console.aws.amazon.com/amplify

# View Lambda logs
aws logs tail /aws/lambda/inspectionwale-c2c-inquiry --follow

# Test Lambda directly
aws lambda invoke --function-name inspectionwale-c2c-inquiry \
  --payload '{"body":"{\"budget\":500000,\"name\":\"Test\",\"number\":\"9876543210\",\"location\":\"Mumbai\"}"}' \
  response.json
```

## Support

If you encounter issues:
1. Check AWS Amplify build logs
2. Check Lambda CloudWatch logs
3. Verify SES email identity
4. Check Lambda Function URL configuration
5. Test form submission in browser console

---

**Ready to deploy!** Follow the steps above and your C2C Marketplace will be live. 🚗✨
