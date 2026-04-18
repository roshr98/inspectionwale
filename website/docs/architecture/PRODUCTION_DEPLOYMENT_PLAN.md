# 🚀 Production Deployment Plan - Complete UI Redesign Integration

**Date:** December 1, 2025  
**Account ID:** 381328846826  
**Region:** us-east-1  
**API Endpoint:** `https://423cmvhw3g.execute-api.us-east-1.amazonaws.com/prod`

---

## ⚠️ CRITICAL: Authenticate AWS CLI First

```powershell
# Run this command and follow the prompts:
aws sso login

# Or if using access keys:
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Region: us-east-1
# Output format: json
```

---

## 📋 Current Status Check

### Existing Resources (Need to verify after AWS auth)
- ✅ DynamoDB: `CarListings`
- ✅ DynamoDB: `CarReservations`
- ✅ S3 Bucket: `inspectionwale-car-listings`
- ✅ API Gateway: `https://423cmvhw3g.execute-api.us-east-1.amazonaws.com/prod`
- ? Lambda: `customer-listings`
- ? Lambda: `quote` (for booking inspections)
- ? Lambda: `car-value` (needs creation or verification)
- ? DynamoDB: `Quotes` or similar (for inspection bookings)

---

## 🎯 Requirements Mapping to Implementation

### 1️⃣ Check Car Value Form
**Status:** Lambda code exists, need to verify/create infrastructure

**Required Infrastructure:**
- DynamoDB Table: `CarValueRequests`
- Lambda Function: `car-value`
- API Gateway Route: `/car-value`
- SES Configuration: Send email notifications

**Files Ready:**
- `/amplify/functions/car-value/src/index.js` ✅
- `/amplify/functions/car-value/src/package.json` ✅

**Frontend Integration:**
- Desktop form: `#heroContactForm` with `data-car-value-form="desktop"`
- Mobile form: `#mobileHeroForm` with `data-car-value-form="mobile"`

---

### 2️⃣ Book Inspection Forms (Used & New Cars)
**Status:** Lambda code exists as `quote`, need to verify and update

**Required Infrastructure:**
- DynamoDB Table: `Quotes` or `InspectionRequests`
- Lambda Function: `quote`
- API Gateway Route: `/quote`
- **UPDATE NEEDED:** Add `ownership` field support

**Files Ready:**
- `/amplify/functions/quote/src/index.js` ✅ (already supports ownership field)

**Frontend Integration:**
- Used car form: `#usedCarInspectionForm`
- New car form: `#newCarInspectionForm`
- Both forms have ownership field ✅

---

### 3️⃣ List Your Car (Customer Listings)
**Status:** Already implemented and working

**Existing Infrastructure:**
- DynamoDB Table: `CarListings` ✅
- Lambda Function: `customer-listings` ✅
- API Gateway Route: `/customer-listings` ✅
- Email approval workflow ✅

**No Changes Needed** - Already working correctly

---

### 4️⃣ Google Reviews Integration
**Status:** Need to verify API configuration

**Files:**
- `/amplify/functions/reviews/src/index.js` (if exists)
- Frontend: Google Reviews section in `index.html` ✅

**Action:** Verify Google Places API key and implementation

---

### 5️⃣ Google Translate
**Status:** Button exists, need to verify Google Translate API

**Frontend:** Translate button in header ✅
**Action:** Verify Google Translate widget initialization

---

### 6️⃣ Car Marketplace Filters & Search
**Status:** Existing implementation

**Existing Infrastructure:**
- Lambda: `customer-listings` (GET method for fetching)
- DynamoDB: `CarListings`
- S3: `inspectionwale-car-listings`

**Action:** Verify all Lambda functions and API routes work

---

### 7️⃣ Reserve Car & Test Drive
**Status:** Reserve exists, Test Drive needs creation

**Reserve (Existing):**
- DynamoDB Table: `CarReservations` ✅
- Lambda integrated with `customer-listings` ✅

**Test Drive (New):**
- DynamoDB Table: `TestDriveRequests` (need to create)
- Lambda Function: `test-drive` (need to create)
- API Gateway Route: `/test-drive` (need to add)

---

### 8️⃣ Clean URLs (Amplify Redirects)
**Required Redirects:**
- `/Home` → `/index.html`
- `/Used-Car-Marketplace` → `/car-marketplace/index.html`
- `/car-marketplace` → `/car-marketplace/index.html`

**File:** `amplify.yml` (need to add redirects)

---

### 9️⃣ Remove Dummy Placeholders
**Action:** Remove placeholder data, use only real customer listings

**Files to Update:**
- `index.html` - Remove POPULAR_CAR_FALLBACKS
- Ensure all data comes from API only

---

### 🔟 Car Detail Modal Enhancements
**Required:**
- Prefill inspection form with car details
- Add test drive form with car details
- Both save to respective DynamoDB tables

---

## 🛠️ Step-by-Step Deployment Process

### Phase 1: AWS Authentication & Verification (15 min)

```powershell
# 1. Authenticate
aws sso login
# OR
aws configure

# 2. Verify account
aws sts get-caller-identity

# 3. List existing DynamoDB tables
aws dynamodb list-tables --region us-east-1

# 4. List existing Lambda functions
aws lambda list-functions --region us-east-1 --query 'Functions[].FunctionName'

# 5. Check S3 buckets
aws s3 ls

# 6. Check API Gateway
aws apigatewayv2 get-apis --region us-east-1
```

**Expected Output:** Document all existing resources

---

### Phase 2: Create Missing DynamoDB Tables (10 min)

#### Table 1: CarValueRequests
```powershell
aws dynamodb create-table \
    --table-name CarValueRequests \
    --attribute-definitions AttributeName=requestId,AttributeType=S \
    --key-schema AttributeName=requestId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

#### Table 2: TestDriveRequests
```powershell
aws dynamodb create-table \
    --table-name TestDriveRequests \
    --attribute-definitions AttributeName=requestId,AttributeType=S \
    --key-schema AttributeName=requestId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

#### Table 3: Quotes (if not exists)
```powershell
aws dynamodb create-table \
    --table-name Quotes \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

---

### Phase 3: Deploy Lambda Functions (30 min)

#### A. Create car-value Lambda

```powershell
# 1. Navigate and create ZIP
cd amplify/functions/car-value/src
npm install --production
cd ..
Compress-Archive -Path src/* -DestinationPath car-value.zip -Force
cd ../../..
```

**Then via AWS Console:**
1. Go to Lambda Console: https://console.aws.amazon.com/lambda
2. Create function: `InspectionWale-CarValue`
3. Runtime: Node.js 20.x
4. Upload `amplify/functions/car-value/car-value.zip`
5. Environment variables:
   ```
   AWS_REGION=us-east-1
   CAR_VALUE_TABLE=CarValueRequests
   SES_FROM=no-reply@inspectionwale.com
   SES_TO=prasad.devadiga333@gmail.com
   ```
6. Timeout: 30 seconds
7. Memory: 512 MB
8. Add IAM permissions for DynamoDB and SES

#### B. Create test-drive Lambda

**Create file first:** `amplify/functions/test-drive/src/index.js`

```powershell
# After creating the file, package it
cd amplify/functions/test-drive/src
npm install --production
cd ..
Compress-Archive -Path src/* -DestinationPath test-drive.zip -Force
cd ../../..
```

**Deploy via Console** (same process as car-value)

#### C. Update existing quote Lambda (if needed)

```powershell
cd amplify/functions/quote/src
npm install --production
cd ..
Compress-Archive -Path src/* -DestinationPath quote.zip -Force
cd ../../..
```

Update via Lambda Console if ownership field support isn't working

---

### Phase 4: Update API Gateway (20 min)

**Add new routes:**
1. POST `/car-value` → `InspectionWale-CarValue` Lambda
2. POST `/test-drive` → `InspectionWale-TestDrive` Lambda
3. Ensure `/quote` exists → `quote` Lambda

**Enable CORS for all routes:**
- Allow Origins: `*` (or your specific domain)
- Allow Methods: `POST, GET, OPTIONS`
- Allow Headers: `Content-Type, Authorization`

---

### Phase 5: Update Frontend Code (15 min)

**Files to update:**
1. `js/main.js` - Add API endpoints for new forms
2. Remove dummy placeholders
3. Update form submission handlers

---

### Phase 6: Configure Amplify Redirects (10 min)

**Update `amplify.yml`:**

```yaml
version: 1
frontend:
  phases:
    build:
      commands:
        - echo "Building inspectionWale website"
  artifacts:
    baseDirectory: /
    files:
      - '**/*'
  cache:
    paths: []
customHeaders:
  - pattern: '**'
    headers:
      - key: 'Strict-Transport-Security'
        value: 'max-age=31536000; includeSubDomains'
      - key: 'X-Content-Type-Options'
        value: 'nosniff'
      - key: 'X-Frame-Options'
        value: 'DENY'
      - key: 'X-XSS-Protection'
        value: '1; mode=block'
redirects:
  - source: /Home
    target: /index.html
    status: 200
  - source: /Used-Car-Marketplace
    target: /car-marketplace/index.html
    status: 200
  - source: /car-marketplace
    target: /car-marketplace/index.html
    status: 301
```

---

### Phase 7: Verify Google Services (15 min)

#### A. Google Reviews
- Check if API key is configured
- Test reviews fetch on localhost
- Verify it works with live domain

#### B. Google Translate
- Ensure widget loads properly
- Test language conversion
- Check if CSP allows Google APIs

---

### Phase 8: Test All Forms Locally (20 min)

Before pushing to production:

1. ✅ Check Car Value form (desktop & mobile)
2. ✅ Book Used Car Inspection
3. ✅ Book New Car Inspection
4. ✅ List Your Car (with photo uploads)
5. ✅ Reserve Car
6. ✅ Test Drive booking
7. ✅ Search & filters in marketplace
8. ✅ Car detail modal with prefilled data

---

### Phase 9: Deploy to Production (30 min)

```powershell
# 1. Commit all changes
git add .
git commit -m "Production deployment: Complete UI redesign with all features integrated"

# 2. Push to main branch
git push origin main

# 3. Monitor Amplify deployment
# Visit: https://console.aws.amazon.com/amplify
# Wait for build to complete (~10 minutes)

# 4. Test live website
# Visit your Amplify domain and test all features
```

---

### Phase 10: Post-Deployment Verification (30 min)

**Test Checklist:**

1. ✅ Homepage loads with new design
2. ✅ Logo and header are transparent
3. ✅ Check Car Value form submits successfully
4. ✅ Used car inspection form works
5. ✅ New car inspection form works
6. ✅ List Car form uploads photos correctly
7. ✅ Marketplace displays real listings (no placeholders)
8. ✅ Search and filters work
9. ✅ Car details modal opens with correct data
10. ✅ Reserve button works
11. ✅ Test Drive button works
12. ✅ Google Reviews display correctly
13. ✅ Google Translate works
14. ✅ Clean URLs work (/Home, /Used-Car-Marketplace)
15. ✅ Mobile responsive design works
16. ✅ All emails are being sent
17. ✅ DynamoDB tables receiving data
18. ✅ Images loading from S3 correctly

---

## 📊 Manual Configuration Steps (Cannot be automated)

### SES Email Verification
1. Go to https://console.aws.amazon.com/ses (us-east-1)
2. Click "Verified identities"
3. Verify these emails:
   - `no-reply@inspectionwale.com` (sender)
   - `prasad.devadiga333@gmail.com` (receiver)
4. Check inbox and click verification links

### IAM Permissions for Lambdas
Each Lambda needs these policies:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:Query",
                "dynamodb:Scan",
                "dynamodb:UpdateItem"
            ],
            "Resource": "arn:aws:dynamodb:us-east-1:381328846826:table/*"
        },
        {
            "Effect": "Allow",
            "Action": "ses:SendEmail",
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject"
            ],
            "Resource": "arn:aws:s3:::inspectionwale-car-listings/*"
        }
    ]
}
```

---

## 🚨 Critical Notes

1. **Do NOT delete existing resources** - Only add new ones
2. **Test locally first** - Use mock API endpoints before deploying
3. **Backup DynamoDB data** - Export CarListings table before deployment
4. **Monitor CloudWatch Logs** - Check for errors after deployment
5. **Keep secret keys secure** - Never commit to git

---

## 💰 Cost Estimate

**Free Tier Usage:**
- Lambda: 1M requests/month free
- DynamoDB: 25GB storage free
- S3: 5GB storage free
- API Gateway: 1M requests/month free
- SES: 62,000 emails/month free

**Expected Monthly Cost:** ₹0 (within free tier)

---

## 📞 Need Help?

**Before deployment, provide me:**
1. Output of `aws sts get-caller-identity`
2. List of existing Lambda functions
3. List of existing DynamoDB tables
4. Current API Gateway endpoints

**I'll help you:**
- Create missing infrastructure
- Update Lambda functions
- Configure API Gateway
- Test all integrations

---

## ✅ Pre-Deployment Checklist

- [ ] AWS CLI authenticated
- [ ] All DynamoDB tables exist
- [ ] All Lambda functions deployed
- [ ] API Gateway routes configured
- [ ] SES emails verified
- [ ] IAM permissions set
- [ ] Amplify redirects configured
- [ ] Forms tested locally
- [ ] Placeholder data removed
- [ ] Google services verified
- [ ] Code committed to git
- [ ] Ready to push to main branch

---

**Status:** Awaiting AWS authentication to proceed with deployment

**Next Step:** Run `aws sso login` and provide me with the output of verification commands
