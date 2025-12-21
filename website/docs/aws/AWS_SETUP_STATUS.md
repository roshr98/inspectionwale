# AWS Setup Status Check - Customer Listings Feature

**Date:** October 12, 2025  
**Account:** 381328846826  
**Region:** us-east-1

---

## ✅ Verified Resources (CLI Check)

### **DynamoDB Tables**
```
✅ CarListings - Ready
✅ CarReservations - Ready
```

---

## 📋 Setup Checklist

### **Step 1: S3 Bucket Configuration** 
**Status:** ⚠️ NEEDS UI CONFIGURATION (CLI user has no permission)

**Action Required (AWS Console):**
1. Go to https://console.aws.amazon.com/s3
2. Click bucket: `inspectionwale-car-listings`
3. Go to **Permissions** tab → **CORS configuration** → **Edit**
4. Paste this and save:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
```
**Note:** Replace `*` in AllowedOrigins with your actual domain after getting it from Amplify Console

---

### **Step 2: SES Email Verification**
**Status:** ⚠️ NEEDS UI CONFIGURATION

**Action Required (AWS Console):**
1. Go to https://console.aws.amazon.com/ses (us-east-1)
2. Click **Verified identities**
3. Verify these 2 emails:
   - `hello@inspectionwale.com` (receiver)
   - `no-reply@inspectionwale.com` (sender)
4. Check inboxes and click verification links

---

### **Step 3: Create Lambda Function**
**Status:** ⚠️ NEEDS CREATION

**Action Required - I'll guide you through CLI:**

#### **3.1 Create ZIP file first**
```bash
cd amplify/functions/customer-listings/src
zip -r ../customer-listings.zip index.js package.json node_modules
cd ../../..
```

#### **3.2 Then create Lambda via Console:**
1. Go to https://console.aws.amazon.com/lambda
2. Click **Create function**
3. Settings:
   - Name: `customerListings`
   - Runtime: `Node.js 20.x`
   - Architecture: `x86_64`
   - Role: Create new role with basic Lambda permissions
4. Click **Create function**

#### **3.3 Upload ZIP:**
1. In Lambda page, **Code source** section
2. **Upload from** → **.zip file**
3. Select: `amplify/functions/customer-listings/customer-listings.zip`
4. Click **Save**

#### **3.4 Environment Variables:**
Add these in Configuration → Environment variables:
```
AWS_REGION = us-east-1
CAR_LISTINGS_TABLE = CarListings
CAR_RESERVATIONS_TABLE = CarReservations
CAR_LISTINGS_BUCKET = inspectionwale-car-listings
SES_FROM = no-reply@inspectionwale.com
LISTINGS_REVIEW_EMAIL = hello@inspectionwale.com
```

#### **3.5 Function Settings:**
Configuration → General configuration:
- Memory: `512 MB`
- Timeout: `30 seconds`

#### **3.6 IAM Policy:**
Configuration → Permissions → Execution role → Add inline policy:
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
                "arn:aws:dynamodb:us-east-1:381328846826:table/CarListings",
                "arn:aws:dynamodb:us-east-1:381328846826:table/CarReservations"
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
                    "ses:FromAddress": "no-reply@inspectionwale.com"
                }
            }
        }
    ]
}
```
Policy name: `CustomerListingsPolicy`

---

### **Step 4: Create API Gateway**
**Status:** ⚠️ NEEDS CREATION

**Action Required (AWS Console):**
1. Go to https://console.aws.amazon.com/apigateway
2. **Create API** → **REST API** → **Build**
3. Settings:
   - Name: `CustomerListingsAPI`
   - Endpoint Type: `Regional`
4. **Actions** → **Create Resource**:
   - Name: `customer-listings`
   - Path: `/customer-listings`
   - ✅ Enable API Gateway CORS
5. With `/customer-listings` selected → **Actions** → **Create Method** → **GET**:
   - Integration: `Lambda Function`
   - ✅ Use Lambda Proxy integration
   - Region: `us-east-1`
   - Function: `customerListings`
6. Repeat for **POST** method (same settings)
7. **Actions** → **Enable CORS** → Accept defaults
8. **Actions** → **Deploy API**:
   - Stage: `[New Stage]`
   - Name: `prod`
9. **Copy the Invoke URL** (e.g., `https://xyz123.execute-api.us-east-1.amazonaws.com/prod`)

---

### **Step 5: Update Frontend Code**
**Status:** ⚠️ NEEDS YOUR API URL

**Action Required:**
1. Get API Gateway Invoke URL from Step 4
2. Open `js/main.js`
3. Find line ~10: `const API_ENDPOINT = '/api/customer-listings'`
4. Replace with: `const API_ENDPOINT = 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/customer-listings'`
5. Save file

---

### **Step 6: Deploy to Amplify**
**Status:** ⚠️ READY TO PUSH

**Action Required (Terminal):**
```bash
git add .
git commit -m "Add customer-to-customer car listings with API integration"
git push origin main
```

Then monitor: https://console.aws.amazon.com/amplify

---

### **Step 7: Add Placeholder Listings**
**Status:** ⚠️ PENDING (Do after Steps 1-6)

**Option A: Via Console (Recommended)**
1. Upload 24 images to S3: `inspectionwale-car-listings/placeholders/`
   - See `PLACEHOLDER_LISTINGS_SETUP.md` for filenames
2. Go to DynamoDB → CarListings table
3. Create 4 items using JSON from `SEED_CAR_LISTINGS.json`

**Option B: Via CLI (I can help after Step 3)**
Once Lambda is created, I can run batch import commands

---

## 🎯 Your Action Plan (In Order)

**RIGHT NOW (Console UI):**
1. ✅ S3 CORS configuration (Step 1)
2. ✅ SES email verification (Step 2)

**NEXT (Lambda via Console):**
3. Create ZIP file (I'll run the command)
4. Create Lambda function + upload ZIP (Step 3)
5. Configure environment variables (Step 3.4)
6. Configure function settings (Step 3.5)
7. Attach IAM policy (Step 3.6)
8. Test Lambda with GET event (Step 3.7)

**THEN (API Gateway via Console):**
9. Create API Gateway (Step 4)
10. Get Invoke URL (Step 4.9)

**FINALLY (Local + Git):**
11. Update `js/main.js` with API URL (Step 5)
12. Git push to deploy (Step 6)
13. Add placeholder listings (Step 7)

---

## 📞 Tell Me When Ready

**After completing Steps 1-2 (S3 + SES):**
- Say "CORS configured and emails verified"
- I'll create the ZIP file and guide you through Lambda

**After completing Step 3 (Lambda):**
- Say "Lambda created"
- I'll guide you through API Gateway

**After completing Step 4 (API Gateway):**
- Give me the Invoke URL
- I'll update js/main.js and push to git

**After Step 6 (Git push):**
- I'll help you add the 4 placeholder listings

---

## ⚡ Quick Commands I Can Run

### Create ZIP file:
```bash
cd amplify/functions/customer-listings/src && zip -r ../customer-listings.zip index.js package.json node_modules && cd ../../..
```

### Check DynamoDB data:
```bash
aws dynamodb scan --table-name CarListings --region us-east-1 --max-items 5
```

### Get Amplify domain:
```bash
aws amplify list-apps --region us-east-1
```

---

**Let me know when you've completed Steps 1-2, and I'll help with the next steps!** 🚀
