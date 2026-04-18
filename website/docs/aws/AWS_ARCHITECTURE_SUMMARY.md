# AWS Architecture Summary - Customer Listings Feature

## 🔍 Current Configuration (as of October 12, 2025)

### **AWS Account Details**
- **Account ID**: `381328846826`
- **IAM User**: `amplifyuser`
- **Default Region**: `us-east-1` (N. Virginia)

---

## ✅ Resources Already Created

### **1. S3 Buckets**
```
✅ inspectionwale-car-listings (Created: Oct 12, 2025)
   - Purpose: Store customer car listing photos
   - Region: us-east-1
   - Status: ACTIVE
   
✅ inspectionwale-reports (Created: Oct 10, 2025)
   - Purpose: Store inspection PDFs
   
✅ inspectionwale-data-381328846826 (Created: Oct 3, 2025)
   - Purpose: General data storage
   
✅ inspectionwale.com (Created: Sep 6, 2025)
   - Purpose: Website hosting/assets
```

**Action Needed for Car Listings Bucket:**
- ⚠️ Configure CORS policy (see deployment guide Step 1.1)
- ⚠️ Verify bucket is private with Block Public Access enabled

---

### **2. DynamoDB Tables**

#### ✅ **CarListings**
```
Table Name: CarListings
Status: ACTIVE
Partition Key: listingId (String)
Item Count: 0 (empty - ready for data)
Table Size: 0 bytes
Billing Mode: On-demand (recommended)
```

#### ✅ **CarReservations**
```
Table Name: CarReservations
Status: ACTIVE
Partition Key: reservationId (String)
Item Count: 0 (empty - ready for data)
Table Size: 0 bytes
Billing Mode: On-demand (recommended)
```

#### 📋 **Other Existing Tables**
```
- Inspections
- inspectionwale-inspections
- inspectionwale-inspectors
- inspectionwale-quotes
```

**Action Needed:**
- ✅ Tables already created correctly!
- No configuration needed - ready to use

---

### **3. IAM Permissions**

**Current User**: `amplifyuser` (limited permissions)

**Permissions Available:**
- ✅ S3: List buckets
- ✅ DynamoDB: Describe tables, read/write data
- ✅ STS: Get caller identity

**Permissions NOT Available (need admin/console):**
- ❌ Lambda: List/manage functions
- ❌ API Gateway: List/manage APIs
- ❌ SES: List verified identities
- ❌ S3: Get/modify bucket CORS

**Recommendation:**
- Use AWS Console (with admin credentials) for:
  - Creating Lambda function
  - Setting up API Gateway
  - Configuring SES email verification
  - Modifying S3 CORS policy
  - Managing IAM roles/policies

---

## 🚧 Resources You Need to Create (via AWS Console)

### **1. Lambda Function** ⚠️
```
Function Name: customerListings
Runtime: Node.js 20.x
Region: us-east-1
Status: NOT CREATED YET
```

**Next Steps:**
1. Follow deployment guide Step 2.1-2.6
2. Upload the ZIP file from `amplify/functions/customer-listings/src/`
3. Configure environment variables (see table below)
4. Attach IAM policy for DynamoDB, S3, SES access

---

### **2. Amazon SES Email Verification** ⚠️
```
Sender Email: no-reply@inspectionwale.com
Recipient Email: hello@inspectionwale.com
Status: UNKNOWN (need to verify via Console)
```

**Next Steps:**
1. Follow deployment guide Step 1.3
2. Verify both email addresses in SES Console
3. Request production access to send to any email (optional)

---

### **3. API Gateway REST API** ⚠️
```
API Name: CustomerListingsAPI
Endpoint: Not created yet
Path: /customer-listings
Methods: GET, POST
Status: NOT CREATED YET
```

**Next Steps:**
1. Follow deployment guide Step 3.1-3.4
2. Create REST API with `/customer-listings` resource
3. Link to Lambda function with proxy integration
4. Enable CORS
5. Deploy to `prod` stage
6. Copy Invoke URL to update `js/main.js`

---

## 📊 Complete Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    End-to-End Flow                           │
└─────────────────────────────────────────────────────────────┘

  User Browser
      │
      ├─── HTML/CSS/JS (Amplify Hosting)
      │    └── inspectionwale.com
      │
      └─── API Request (/api/customer-listings)
           │
           ▼
  ┌──────────────────────┐
  │   API Gateway        │ ⚠️ TO BE CREATED
  │   (REST API)         │
  │   us-east-1          │
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────────────┐
  │   Lambda Function    │ ⚠️ TO BE CREATED
  │   customerListings   │
  │   Node.js 20.x       │
  └──────────┬───────────┘
             │
             ├──────────────────────┐
             │                      │
             ▼                      ▼
  ┌──────────────────┐   ┌──────────────────┐
  │   DynamoDB       │   │   S3 Bucket      │
  │   ✅ CarListings │   │   ✅ inspectionw │
  │   ✅ CarReserv.  │   │      ale-car-    │
  │   (ACTIVE)       │   │      listings    │
  └──────────────────┘   └──────────────────┘
             │
             ▼
  ┌──────────────────────┐
  │   Amazon SES         │ ⚠️ VERIFY EMAILS
  │   Email Notifications│
  │   - no-reply@...     │
  │   - hello@...        │
  └──────────────────────┘
```

---

## 🎯 Deployment Checklist

Use this checklist as you follow `CUSTOMER_LISTINGS_DEPLOYMENT.md`:

### **Step 1: AWS Resources**
- [x] S3 bucket `inspectionwale-car-listings` created
- [ ] S3 CORS policy configured
- [x] DynamoDB `CarListings` table created
- [x] DynamoDB `CarReservations` table created
- [ ] SES emails verified (`no-reply@inspectionwale.com`, `hello@inspectionwale.com`)

### **Step 2: Lambda Function**
- [ ] Lambda function `customerListings` created
- [ ] Function code ZIP uploaded (with node_modules)
- [ ] Environment variables configured (6 variables)
- [ ] Memory set to 512 MB, timeout to 30 seconds
- [ ] IAM policy attached (DynamoDB + S3 + SES permissions)
- [ ] Test event executed successfully

### **Step 3: API Gateway**
- [ ] REST API `CustomerListingsAPI` created
- [ ] Resource `/customer-listings` created
- [ ] GET method created with Lambda proxy integration
- [ ] POST method created with Lambda proxy integration
- [ ] CORS enabled
- [ ] API deployed to `prod` stage
- [ ] Invoke URL copied

### **Step 4: Frontend Integration**
- [ ] `js/main.js` updated with API Gateway URL
- [ ] Code committed to Git
- [ ] Pushed to GitHub (triggers Amplify build)
- [ ] Amplify deployment completed

### **Step 5: Testing**
- [ ] Test listing submission (photos upload to S3)
- [ ] Verify DynamoDB entry with `status=pending`
- [ ] Check email notification received
- [ ] Approve listing (change status to `approved`)
- [ ] Verify listing appears in website carousel
- [ ] Test reservation flow
- [ ] Test detail modal and "Book an Inspection" button

---

## 🔑 Environment Variables Reference

When creating the Lambda function (Step 2.3), add these 6 variables:

| Variable | Value | Current Status |
|----------|-------|----------------|
| `AWS_REGION` | `us-east-1` | ✅ Known |
| `CAR_LISTINGS_TABLE` | `CarListings` | ✅ Table exists |
| `CAR_RESERVATIONS_TABLE` | `CarReservations` | ✅ Table exists |
| `CAR_LISTINGS_BUCKET` | `inspectionwale-car-listings` | ✅ Bucket exists |
| `SES_FROM` | `no-reply@inspectionwale.com` | ⚠️ Need to verify |
| `LISTINGS_REVIEW_EMAIL` | `hello@inspectionwale.com` | ⚠️ Need to verify |

---

## 📁 Local Files Ready for Upload

Your Lambda function code is ready at:
```
📂 amplify/functions/customer-listings/src/
   ├── index.js (Lambda handler with AWS SDK v3)
   ├── package.json (AWS SDK v3 dependencies)
   └── node_modules/ (installed via npm install)
```

**To create the ZIP file for upload:**
```bash
cd amplify/functions/customer-listings/src
zip -r ../customer-listings.zip index.js package.json node_modules
```

The ZIP file will be at: `amplify/functions/customer-listings/customer-listings.zip`

---

## 🔒 IAM Policy for Lambda Execution Role

When attaching permissions to the Lambda function (Step 2.5), use this policy:

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

*(Note: Your AWS Account ID `381328846826` is already included)*

---

## 🚀 Next Steps

1. **Open AWS Console** (with admin credentials)
2. **Start with Step 1.1** in `CUSTOMER_LISTINGS_DEPLOYMENT.md` (S3 CORS)
3. **Then Step 1.3** (SES email verification)
4. **Then Step 2** (Create Lambda function)
5. **Then Step 3** (Create API Gateway)
6. **Then Step 4** (Deploy frontend)

---

## 💡 Tips

- ✅ Your DynamoDB tables and S3 bucket are already perfectly configured
- ✅ Your Lambda code is AWS SDK v3 ready (modern & efficient)
- ⚠️ Use AWS Console for all remaining steps (your CLI user has limited permissions)
- ⚠️ Don't forget to verify BOTH SES emails before testing
- ⚠️ Copy the API Gateway Invoke URL carefully - it's needed for frontend

---

**Questions?** Refer to `CUSTOMER_LISTINGS_DEPLOYMENT.md` for detailed step-by-step instructions!
