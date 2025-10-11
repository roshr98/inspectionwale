# Customer-to-Customer Car Listings – AWS Deployment Guide

This guide walks you through deploying the new **customer-to-customer car listing feature** on AWS Amplify. Sellers can submit their cars with photos, buyers can reserve listings, and everything is verified before going live.

---

## 📋 Overview

**What's New:**
- Sellers submit car details + 6 photos (4 exterior, 2 interior) + RC document via a modal form
- Photos upload directly to **S3** using presigned URLs
- Submission metadata stored in **DynamoDB** (`CarListings` table) with `status=pending`
- Admin team receives email notification via **SES** with review links
- Once approved (status changed to `approved`), listings appear in the public carousel
- Buyers can **reserve** a car (stored in `CarReservations` table) and receive confirmation
- Clicking a listing card opens a **detailed modal** with photo gallery
- "Book an Inspection" button pre-fills the inspection form with car details

**Architecture:**
```
Website (Amplify Hosting)
    ↓
API Gateway (/api/customer-listings)
    ↓
Lambda (customer-listings)
    ↓
S3 (photos) + DynamoDB (listings/reservations) + SES (email notifications)
```

---

## 🚀 Deployment Steps

### **Step 1: Configure Existing AWS Resources**

> **✅ Good News!** Your S3 bucket and DynamoDB tables are already created. We just need to configure them.

#### **1.1 Configure S3 Bucket CORS Policy**
The bucket `inspectionwale-car-listings` already exists. Now configure CORS:

1. Go to **S3 Console** (https://console.aws.amazon.com/s3)
2. Click on bucket **`inspectionwale-car-listings`**
3. Go to **Permissions** tab
4. Scroll down to **Cross-origin resource sharing (CORS)**
5. Click **Edit**
6. Paste this CORS policy:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST"],
        "AllowedOrigins": ["https://main.d3o8kqkq3q3q3q.amplifyapp.com", "https://inspectionwale.com"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
```
*(Replace `https://main.d3o8kqkq3q3q3q.amplifyapp.com` with your actual Amplify domain)*

7. Click **Save changes**

**To get your Amplify domain:**
- Go to **AWS Amplify Console** → Your app
- Copy the domain from the app overview (e.g., `https://main.d123abc456.amplifyapp.com`)

8. **(Optional) Enable Lifecycle Rules** to archive old submissions after 90 days:
   - In S3 bucket, go to **Management** tab
   - Click **Create lifecycle rule**
   - Name: `ArchiveOldSubmissions`
   - Apply to prefix: `submissions/`
   - Add transition: After 90 days → Glacier Flexible Retrieval

#### **1.2 Verify DynamoDB Tables**

**✅ Tables Already Created!** Just verify they exist:

1. Go to **DynamoDB Console** (https://console.aws.amazon.com/dynamodb)
2. Click **Tables** in left menu
3. Confirm these tables exist:
   - **`CarListings`** - Partition key: `listingId` (String) ✅
   - **`CarReservations`** - Partition key: `reservationId` (String) ✅

Both tables are already configured correctly and ready to use!

#### **1.3 Set Up Amazon SES for Email Notifications**
1. Go to **SES Console** (https://console.aws.amazon.com/ses) in **us-east-1** region
2. Click **Verified identities** in left menu
3. Click **Create identity**
4. Configure:
   - **Identity type**: Email address
   - **Email address**: `hello@inspectionwale.com`
5. Click **Create identity**
6. **Check your inbox** (hello@inspectionwale.com) and click the verification link

7. Repeat for sender email:
   - Click **Create identity** again
   - **Email address**: `no-reply@inspectionwale.com`
   - Click **Create identity**
   - **Check inbox** and verify

8. **Verify Sandbox Status:**
   - Click **Account dashboard** in left menu
   - If it says **"Your account is in the SES sandbox"**, you need production access
   - Click **Request production access**
   - Fill out form:
     - **Mail type**: Transactional
     - **Website URL**: `https://inspectionwale.com`
     - **Use case**: "Transactional emails for car listing notifications (new submissions, reservations, verification)"
     - **Bounce/complaint handling**: "We use verified email addresses and monitor bounce rates"
   - Submit request (usually approved within 24 hours)

> **Note:** While in sandbox, you can only send emails to verified addresses. For testing, verify both sender and recipient emails.

---

### **Step 2: Create and Deploy Lambda Function**

#### **2.1 Create Lambda Function**
1. Go to **AWS Lambda Console** (https://console.aws.amazon.com/lambda)
2. Click **Create function**
3. Select **Author from scratch**
4. Configure:
   - **Function name**: `customerListings`
   - **Runtime**: **Node.js 20.x** (or 18.x)
   - **Architecture**: x86_64
   - **Execution role**: Create a new role with basic Lambda permissions
5. Click **Create function**

#### **2.2 Upload Function Code**

**✅ Dependencies already installed!** Now create the ZIP file:

1. In your local project, navigate to `amplify/functions/customer-listings/src/`
2. Open a terminal in that directory

3. Verify node_modules exists (should already be there from setup):
```bash
ls node_modules
```
If empty, run:
```bash
npm install
```

4. Create ZIP file containing all files:
```bash
zip -r ../customer-listings.zip index.js package.json node_modules
```
*This creates the ZIP one level up in the `customer-listings` folder*

**Alternative (if zip command not found on Windows):**
```bash
# Go up one directory
cd ..
# Use PowerShell to create ZIP
powershell Compress-Archive -Path src/index.js,src/package.json,src/node_modules -DestinationPath customer-listings.zip -Force
```

5. The ZIP file is now at: `amplify/functions/customer-listings/customer-listings.zip`

6. Go to **Lambda Console** → Your `customerListings` function
5. Scroll down to **Code source** section
6. Click **Upload from** → **.zip file**
7. Click **Upload** → Select `customer-listings.zip`
8. Click **Save**

#### **2.3 Configure Environment Variables**
1. In the Lambda function page, click the **Configuration** tab
2. Click **Environment variables** in the left sidebar
3. Click **Edit**
4. Click **Add environment variable** for each of these:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `AWS_REGION` | `us-east-1` | Your AWS region |
| `CAR_LISTINGS_TABLE` | `CarListings` | DynamoDB table for listings |
| `CAR_RESERVATIONS_TABLE` | `CarReservations` | DynamoDB table for reservations |
| `CAR_LISTINGS_BUCKET` | `inspectionwale-car-listings` | S3 bucket name |
| `SES_FROM` | `no-reply@inspectionwale.com` | Verified SES sender email |
| `LISTINGS_REVIEW_EMAIL` | `hello@inspectionwale.com` | Email to receive new listing notifications |

5. Click **Save**

#### **2.4 Configure Function Settings**
1. Still in the **Configuration** tab, click **General configuration**
2. Click **Edit**
3. Set:
   - **Memory**: 512 MB (adjust based on needs)
   - **Timeout**: 30 seconds (photo URL generation may take time)
4. Click **Save**

#### **2.5 Attach IAM Permissions**
1. In the **Configuration** tab, click **Permissions**
2. Click on the **Execution role name** (opens in new tab)
3. In IAM Console, click **Add permissions** → **Create inline policy**
4. Click **JSON** tab
5. Paste this policy:
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
6. Click **Review policy**
7. **Policy name**: `CustomerListingsPolicy`
8. Click **Create policy**
9. Go back to Lambda function tab

#### **2.6 Test the Lambda Function**
1. In Lambda Console, go to the **Test** tab
2. Click **Create new event**
3. **Event name**: `testGetListings`
4. Paste this test JSON:
```json
{
    "httpMethod": "GET",
    "queryStringParameters": {},
    "body": null
}
```
5. Click **Save**
6. Click **Test**
7. You should see:
```json
{
    "statusCode": 200,
    "headers": {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    },
    "body": "{\"ok\":true,\"items\":[]}"
}
```

✅ **Lambda function is ready!**

---

### **Step 3: Create API Gateway**

#### **3.1 Create REST API**
1. Go to **API Gateway Console** (https://console.aws.amazon.com/apigateway)
2. Click **Create API**
3. Choose **REST API** (not private) → Click **Build**
4. Configure:
   - **API name**: `CustomerListingsAPI`
   - **Description**: API for customer car listings
   - **Endpoint Type**: Regional
5. Click **Create API**

#### **3.2 Create Resource and Method**
1. In the API, click **Actions** → **Create Resource**
2. **Resource Name**: `customer-listings`
3. **Resource Path**: `customer-listings` *(API Gateway automatically adds the leading `/` to make it `/customer-listings`)*
4. Check **Enable API Gateway CORS**
5. Click **Create Resource**

6. With `/customer-listings` selected, click **Actions** → **Create Method**
7. Select **GET** from dropdown → Click the checkmark
8. Configure:
   - **Integration type**: Lambda Function
   - **Use Lambda Proxy integration**: ✅ Check this
   - **Lambda Region**: `us-east-1`
   - **Lambda Function**: `customerListings`
9. Click **Save** → Click **OK** to grant permission

10. Repeat for **POST** method:
    - Click **Actions** → **Create Method** → Select **POST**
    - Same settings as GET (Lambda proxy integration, same function)
    - Click **Save** → **OK**

#### **3.3 Enable CORS**
1. Select `/customer-listings` resource
2. Click **Actions** → **Enable CORS**
3. Keep default settings:
   - **Access-Control-Allow-Methods**: `GET,POST,OPTIONS`
   - **Access-Control-Allow-Headers**: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
   - **Access-Control-Allow-Origin**: `*` (or your domain)
4. Click **Enable CORS and replace existing CORS headers**
5. Click **Yes, replace existing values**

#### **3.4 Deploy API**
1. Click **Actions** → **Deploy API**
2. **Deployment stage**: `[New Stage]`
3. **Stage name**: `prod`
4. Click **Deploy**
5. **Copy the Invoke URL** - it will look like:
   ```
   https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
   ```
   ⚠️ **Important:** Save this URL - you'll need it for the next step!

#### **3.5 Update Frontend with API Endpoint**
1. Open `js/main.js` in your code editor
2. Find this line near the top (around line 10):
```javascript
const API_ENDPOINT = '/api/customer-listings'
```
3. Replace it with your API Gateway URL + resource path:
```javascript
const API_ENDPOINT = 'https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/customer-listings'
```
   *(Replace `abc123xyz` with your actual API ID from step 3.4)*

4. Save the file

**Example:**
If your Invoke URL is `https://k9m7n6p5.execute-api.us-east-1.amazonaws.com/prod`, then:
```javascript
const API_ENDPOINT = 'https://k9m7n6p5.execute-api.us-east-1.amazonaws.com/prod/customer-listings'
```

---

### **Step 4: Deploy Frontend to Amplify**

#### **4.1 Commit and Push Changes**
1. Save all files (especially `js/main.js` with the updated API endpoint)
2. Open terminal in project root
3. Commit and push your code:
```bash
git add .
git commit -m "Add customer-to-customer car listings feature with API integration"
git push origin main
```

#### **4.2 Monitor Amplify Deployment**
1. Go to **AWS Amplify Console** (https://console.aws.amazon.com/amplify)
2. Click on your app
3. You should see a new build triggered automatically
4. Wait for the build to complete (~3-5 minutes)
5. Build stages:
   - ✅ Provision
   - ✅ Build (compiles/bundles your code)
   - ✅ Deploy
   - ✅ Verify

6. Once complete, click on the domain URL to open your website

#### **4.3 Verify Deployment**
1. Open your website in a browser
2. Scroll to the **"Featured Owner Deals"** section
3. The carousel should show:
   - Placeholder slides (if no approved listings yet)
   - OR approved listings from DynamoDB

4. Check browser console (F12) for any errors

---

### **Step 5: Add Placeholder Listings (For Lead Generation)**

> **🎯 Purpose:** These 4 pre-approved placeholder listings will stay live on your website to generate leads through the form until real customer submissions arrive. They're marked with `"isPlaceholder": true` so you can identify and keep them permanently.

#### **5.1 Upload Placeholder Images to S3**

> **⚠️ Important:** Placeholder listings are an **exception** - they only need 6 photos each (24 total), not the full set required for new customer submissions. This is a one-time setup for lead generation.

**Step-by-Step:**

1. **Collect 24 car images** (6 photos × 4 cars):
   - **Honda City 2020**: 6 photos (front, back, left, right, seat, cluster)
   - **Maruti Swift 2019**: 6 photos
   - **Hyundai Creta 2021**: 6 photos
   - **Tata Nexon 2022**: 6 photos

2. **Where to get images:**
   - **Option A:** Use your own car photos
   - **Option B:** Download from free stock sites:
     - Visit **unsplash.com** or **pexels.com**
     - Search: "honda city car", "maruti swift", "hyundai creta", "tata nexon"
     - Download high-quality images showing different angles

3. **Upload to S3:**
   - Go to **S3 Console** → **inspectionwale-car-listings** bucket
   - Click **Create folder** → Name it `placeholders`
   - Open the `placeholders` folder
   - Click **Upload**
   
4. **Use these exact file names** (24 files):
   ```
   Honda City (6 files):
   - honda-city-front.jpg
   - honda-city-back.jpg
   - honda-city-left.jpg
   - honda-city-right.jpg
   - honda-city-seat.jpg
   - honda-city-cluster.jpg
   
   Maruti Swift (6 files):
   - swift-front.jpg
   - swift-back.jpg
   - swift-left.jpg
   - swift-right.jpg
   - swift-seat.jpg
   - swift-cluster.jpg
   
   Hyundai Creta (6 files):
   - creta-front.jpg
   - creta-back.jpg
   - creta-left.jpg
   - creta-right.jpg
   - creta-seat.jpg
   - creta-cluster.jpg
   
   Tata Nexon (6 files):
   - nexon-front.jpg
   - nexon-back.jpg
   - nexon-left.jpg
   - nexon-right.jpg
   - nexon-seat.jpg
   - nexon-cluster.jpg
   ```

5. Click **Upload** and wait for all 24 files to finish

**✅ Why only 6 photos per car?**
- Placeholder listings are added directly to DynamoDB (bypassing validation)
- Real customer submissions will still require the full photo set
- This is a special exception for your initial 4 lead-generation cars

#### **5.2 Add 4 Placeholder Listings to DynamoDB**

**✅ Pre-configured JSON available!** I've created `SEED_CAR_LISTINGS.json` with all 4 listings.

**Method 1: Add via DynamoDB Console (One by One)**
1. Go to **DynamoDB Console** → **CarListings** table
2. Click **Explore table items**
3. Click **Create item**
4. Switch to **JSON view** (toggle at top)
5. Open `SEED_CAR_LISTINGS.json` in your project
6. Copy the first listing JSON (between first `{` and `}`)
7. Paste into DynamoDB and click **Create item**
8. Repeat for all 4 listings

**Method 2: Batch Import via AWS CLI (Faster)**
```bash
# From your project root, run:
aws dynamodb batch-write-item --request-items file://SEED_CAR_LISTINGS_BATCH.json --region us-east-1
```
*(I can create the batch import file if you prefer this method)*

#### **5.3 Verify Placeholder Listings**
1. Go to **DynamoDB Console** → **CarListings** table
2. Click **Explore table items**
3. You should see 4 items with:
   - `listingId`: placeholder-001, placeholder-002, placeholder-003, placeholder-004
   - `status`: "approved"
   - `isPlaceholder`: true ✅ (This marks them as permanent)

4. **Reload your website** → Carousel should show all 4 cars:
   - 🚗 Honda City VX CVT 2020 - ₹9.5L
   - 🚗 Maruti Swift ZXi+ AMT 2019 - ₹6.25L
   - 🚗 Hyundai Creta SX(O) Diesel 2021 - ₹14.5L
   - 🚗 Tata Nexon XZ+ Dark 2022 - ₹11.25L

#### **5.4 Managing Placeholder Listings**

**To Keep Placeholders Live:**
- ✅ Don't delete items with `"isPlaceholder": true`
- ✅ They'll stay visible even when real submissions come in
- ✅ Reservations on these will go to `hello@inspectionwale.com`
- ✅ Only 6 photos needed (exception to the normal rules)

**To Remove Placeholders Later:**
1. Go to DynamoDB → **CarListings** table
2. Filter by `isPlaceholder = true`
3. Delete the 4 placeholder items
4. Real customer listings will remain unaffected

**To Add More Placeholders:**
1. Copy any item from `SEED_CAR_LISTINGS.json`
2. Change `listingId` to `placeholder-005`, etc.
3. Update car details and photo URLs
4. Upload 6 new photos to S3 `placeholders/` folder
5. Add to DynamoDB with `"isPlaceholder": true`

**Important Distinction:**
- **Placeholder listings** (added via DynamoDB): 6 photos minimum ✅
- **Customer submissions** (via website form): Full photo set required as per validation rules ✅
- This ensures quality control for real listings while allowing flexibility for your marketing placeholders


---

### **Step 6: End-to-End Testing**

#### **6.1 Test Full Submission Flow**
1. Open your website
2. Click **"List Your Car"** button
3. Fill in all required fields:
   - Seller: Name, Mobile, Email
   - Car: Make, Model, Year, KMs, Price
   - Upload 6 photos (4 exterior + 2 interior) + RC document
4. Click **"Submit for Verification"**
5. **Expected outcome**:
   - Success message: "Thanks! Our verification team will review..."
   - Check **S3 bucket** → folder `submissions/<submissionId>/` should have 7 images
   - Check **DynamoDB CarListings** → new entry with `status=pending`
   - Check **email** at `hello@inspectionwale.com` → notification with review links

#### **6.2 Test Approval Workflow**
1. Go to **DynamoDB Console** → **CarListings** table
2. Click **Explore table items**
3. Find the pending submission (should have `status: "pending"`)
4. Click on the item to open it
5. Click **Edit** (JSON editor)
6. Change `"status": "pending"` to `"status": "approved"`
7. Verify all photo URLs are correct (should be S3 URLs like):
```json
"exteriorFront": {
    "key": "submissions/sub_abc123/exteriorFront.jpg",
    "url": "https://inspectionwale-car-listings.s3.us-east-1.amazonaws.com/submissions/sub_abc123/exteriorFront.jpg",
    "contentType": "image/jpeg"
}
```
8. Click **Save changes**
9. **Reload your website** → The approved listing should now appear in carousel

**Troubleshooting:**
- If listing doesn't appear, check browser console for errors
- Verify `status` is exactly `"approved"` (lowercase)
- Ensure all 6 photo objects have `url` fields

#### **6.3 Test Reservation Flow**
1. Click on a listing card → **"Reserve"** button
2. Fill in: Name, Mobile, Email (optional), Offer Price (optional)
3. Click **"Reserve Now"**
4. **Expected outcome**:
   - Success message: "Thank you! We will share your offer..."
   - Check **DynamoDB CarReservations** → new entry
   - Check **email** → seller and admin receive notification

#### **6.4 Test Detail Modal**
1. Click any listing card → Modal opens with large photo
2. Click thumbnail images → Hero image changes
3. Click **"Book an Inspection"** → Modal closes, scrolls to inspection form
4. Verify form fields are pre-filled with car make/model/year/kms

---

## 🔧 Troubleshooting

### **Error: "Unable to load listings"**
- **Cause**: Lambda not returning data or API endpoint incorrect
- **Fix**:
  - Check Lambda logs in CloudWatch
  - Verify `CAR_LISTINGS_TABLE` environment variable
  - Ensure Lambda has DynamoDB read permissions
  - Test Lambda directly with GET event

### **Error: "Photo upload failed"**
- **Cause**: S3 presigned URL expired or CORS misconfigured
- **Fix**:
  - Check S3 bucket CORS policy (see Step 1.1)
  - Verify Lambda has `s3:PutObject` permission
  - Check browser console for CORS errors

### **Error: "seller_details_required"**
- **Cause**: Validation failed on backend
- **Fix**:
  - Ensure Name and Mobile fields are filled
  - Check Lambda logs for detailed error

### **No email received**
- **Cause**: SES not verified or Lambda lacks SES permission
- **Fix**:
  - Verify sender/recipient emails in SES Console
  - Check Lambda IAM role has `ses:SendEmail` permission
  - Check CloudWatch logs for SES errors
  - If in SES Sandbox, both sender and recipient must be verified

### **Listings not appearing after approval**
- **Cause**: Status not set to `approved` or missing `photos.url` fields
- **Fix**:
  - Verify `status` field is exactly `"approved"` (case-sensitive)
  - Ensure each photo in `photos` object has a `url` field with public S3 URL
  - Check browser console for JavaScript errors

---

## 📊 Monitoring & Maintenance

### **CloudWatch Logs**
- Lambda function logs: CloudWatch → Log groups → `/aws/lambda/customerListings-...`
- Monitor for errors, slow queries, or failed uploads

### **DynamoDB Capacity**
- Monitor read/write consumption in DynamoDB Console
- Adjust provisioned capacity or switch to On-Demand if traffic spikes

### **S3 Storage Costs**
- Set up lifecycle policies to archive old submissions after 90 days
- Enable S3 Intelligent-Tiering for cost optimization

### **Approval Workflow**
- Build an admin panel (future enhancement) to:
  - List pending submissions
  - Preview photos inline
  - Approve/reject with one click
  - Auto-publish listings

---

## 🔐 Security Considerations

1. **S3 Bucket Security**:
   - Keep bucket private
   - Use presigned URLs (already implemented)
   - Enable S3 Object Lock for sensitive documents (RC photos)

2. **DynamoDB Access**:
   - Use least-privilege IAM policies
   - Enable DynamoDB encryption at rest
   - Set up backups with Point-in-Time Recovery

3. **SES Security**:
   - Use DKIM/DMARC to prevent email spoofing
   - Monitor sending quotas to avoid abuse

4. **Input Validation**:
   - Lambda already validates required fields
   - Consider adding phone number format validation
   - Sanitize file names before S3 upload

5. **Rate Limiting**:
   - Add API Gateway rate limiting to prevent spam submissions
   - Implement CAPTCHA on frontend form (future enhancement)

---

## 🎯 Future Enhancements

1. **Admin Dashboard**: Build a React/Vue admin panel to manage listings
2. **CloudFront CDN**: Serve images via CloudFront for faster load times
3. **Image Optimization**: Auto-resize/compress photos using Lambda trigger
4. **SMS Notifications**: Use SNS to notify sellers when buyers reserve
5. **Payment Integration**: Add payment gateway for inspection booking
6. **Search & Filters**: Add make/model/price filters to carousel
7. **Analytics**: Track listing views, reserve requests, conversion rates

---

## 📞 Support

If you encounter issues:
1. Check CloudWatch logs for Lambda errors
2. Verify all environment variables are set correctly
3. Test each component independently (S3 upload, DynamoDB write, SES send)
4. Contact AWS Support for service-specific issues

---

**Deployment complete! 🎉**

Your customer-to-customer car listing feature is now live. Sellers can submit cars, you receive email notifications for verification, and approved listings appear automatically on your website.
