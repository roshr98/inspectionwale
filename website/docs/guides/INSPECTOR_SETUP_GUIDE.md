# Inspector Login & Report Generation Setup Guide

This guide explains how to set up the inspector login system and PDF report generation for InspectionWale.

## Overview

The system consists of:
1. **Inspector Login** - Secure login for inspectors using credentials stored in DynamoDB
2. **Inspection Form** - Comprehensive form to capture vehicle details, checklist items, and photos
3. **PDF Report Generation** - Automated PDF report creation with InspectionWale branding
4. **Storage** - Reports and photos stored in S3, metadata in DynamoDB

---

## Step 1: Create DynamoDB Tables

### Table 1: Inspectors Table (for login credentials)

1. Go to **AWS Console → DynamoDB → Tables**
2. Click **Create table**
3. Configure:
   - **Table name**: `inspectionwale-inspectors`
   - **Partition key**: `id` (Number)
   - **Table settings**: Use default settings
4. Click **Create table**

### Table 2: Inspections Table (for report metadata)

1. Create another table
2. Configure:
   - **Table name**: `inspectionwale-inspections`
   - **Partition key**: `reportId` (String)
   - **Sort key**: `timestamp` (String)
   - **Table settings**: Use default settings
3. Click **Create table**

---

## Step 2: Add Inspector Credentials

### Generate Password Hash

Run this in Node.js or browser console:

```javascript
const crypto = require('crypto'); // Remove this line if in browser

const password = 'inspector123'; // Change this to your desired password
const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log('Password Hash:', hash);
```

### Add Inspector to DynamoDB

1. Go to **DynamoDB → Tables → inspectionwale-inspectors**
2. Click **Explore table items**
3. Click **Create item**
4. Switch to **JSON view** and paste:

```json
{
  "id": {
    "N": "1"
  },
  "createdAt": {
    "S": "2025-10-10 T00:00:00.000Z"
  },
  "email": {
    "S": "prasad@inspectionwale.com"
  },
  "name": {
    "S": "Prasad"
  },
  "passwordHash": {
    "S": "fa8d548eec7e519b2d32f155c6e83878f690f7964c4e448701762ea956cad4ca"
  },
  "status": {
    "S": "active"
  },
  "username": {
    "S": "inspector1"
  }
}
```

5. Replace `PUT_YOUR_GENERATED_HASH_HERE` with the hash you generated
6. Click **Create item**

---

## Step 3: Create S3 Bucket for Reports

1. Go to **AWS Console → S3**
2. Click **Create bucket**
3. Configure:
   - **Bucket name**: `inspectionwale-reports` (must be globally unique)
   - **Region**: Same as your Lambda functions (us-east-1)
   - **Block Public Access**: Uncheck "Block all public access"
   - **Acknowledge**: Check the warning box
4. Click **Create bucket**

### Configure Bucket Policy

1. Go to your bucket → **Permissions** → **Bucket policy**
2. Add this policy (replace `YOUR_BUCKET_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::inspectionwale-reports/*"
    }
  ]
}
```

3. Click **Save**

### Enable CORS

1. Go to **Permissions** → **Cross-origin resource sharing (CORS)**
2. Add:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

3. Click **Save**

---

## Step 4: Deploy Lambda Functions

### Function 1: Inspector Login

1. Go to **AWS Lambda → Create function**
2. Configure:
   - **Function name**: `inspectionwale-inspector-login`
   - **Runtime**: Node.js 20.x
   - **Architecture**: x86_64
3. Click **Create function**

4. Upload code:
   - Copy code from `amplify/functions/inspector-login/src/index.js`
   - Paste into Lambda function code editor
   - Click **Deploy**

5. Configure **Environment variables**:
   ```
   INSPECTORS_TABLE = inspectionwale-inspectors
   ```

6. Configure **IAM Role**:
   - Go to **Configuration** → **Permissions**
   - Click on the role name
   - Add inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/inspectionwale-inspectors"
    }
  ]
}
```

7. Create **Function URL**:
   - Go to **Configuration** → **Function URL**
   - Click **Create function URL**
   - **Auth type**: NONE
   - **Configure cross-origin resource sharing (CORS)**: Check
   - Click **Save**
   - Copy the Function URL

### Function 2: Generate Report

1. Create another Lambda function:
   - **Function name**: `inspectionwale-generate-report`
   - **Runtime**: Node.js 20.x
   - **Timeout**: 30 seconds (Configuration → General configuration)
   - **Memory**: 512 MB

2. Install dependencies locally:
   ```bash
   cd amplify/functions/generate-report/src
   npm install
   ```

3. Create deployment package:
   
   **Windows PowerShell:**
   ```powershell
   Compress-Archive -Path * -DestinationPath ../function.zip -Force
   ```
   
   **Git Bash / Linux / Mac:**
   ```bash
   zip -r ../function.zip .
   ```

4. Upload to Lambda:
   - Go to **Code** → **Upload from** → **.zip file**
   - Upload `function.zip`

5. Configure **Environment variables**:
   ```
   REPORTS_BUCKET = inspectionwale-reports
   INSPECTIONS_TABLE = inspectionwale-inspections
   ```

6. Configure **IAM Role** (add to existing role):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::inspectionwale-reports/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/inspectionwale-inspections"
    }
  ]
}
```

7. Create **Function URL** (same as above)

---

## Step 5: Configure Amplify Rewrites

1. Go to **AWS Amplify → Your App → Rewrites and redirects**
2. Add these rewrites:

```json
[
  {
    "source": "/api/inspector-login",
    "target": "YOUR_INSPECTOR_LOGIN_FUNCTION_URL",
    "type": "200",
    "condition": null
  },
  {
    "source": "/api/generate-report",
    "target": "YOUR_GENERATE_REPORT_FUNCTION_URL",
    "type": "200",
    "condition": null
  }
]
```

3. Replace `YOUR_*_FUNCTION_URL` with the actual Lambda Function URLs
4. Click **Save**

---

## Step 6: Test the System

### Test 1: Inspector Login

1. Go to `https://your-amplify-domain/inspector-login.html`
2. Login with:
   - **Username**: `inspector1`
   - **Password**: `inspector123` (or whatever you set)
3. Should redirect to inspection form

### Test 2: Create Inspection

1. Fill out the vehicle inspection form
2. Check relevant checklist items
3. Upload photos
4. Click **Generate Inspection Report**
5. PDF should be generated and downloadable

---

## Default Credentials

For testing, you can use these default credentials:

- **Username**: `inspector1`
- **Password**: `inspector123`
- **Password Hash**: `6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090`

To add this inspector, create a DynamoDB item as shown in Step 2.

---

## Troubleshooting

### Login not working
- Check CloudWatch Logs for Lambda errors
- Verify DynamoDB table name matches environment variable
- Confirm password hash is correct

### PDF generation fails
- Check Lambda timeout (increase to 30 seconds)
- Check Lambda memory (increase to 512 MB)
- Verify pdfkit dependency is installed
- Check S3 bucket permissions

### Photos not uploading
- Verify S3 bucket CORS configuration
- Check Lambda IAM permissions for S3
- Ensure bucket policy allows public read

### Reports not accessible
- Check S3 bucket policy allows public reads
- Verify Function URL in Amplify rewrites
- Check CORS configuration

---

## Security Recommendations

1. **Use JWT tokens** instead of simple hashed tokens (production)
2. **Enable HTTPS only** for all endpoints
3. **Implement rate limiting** on login endpoint
4. **Add session expiry** mechanism
5. **Use AWS Cognito** for production authentication
6. **Encrypt sensitive data** in DynamoDB
7. **Enable S3 bucket versioning** for report backups
8. **Set up CloudWatch alarms** for failed logins

---

## Next Steps

1. **Customize PDF template** - Modify the PDF generation code to match your branding
2. **Add more inspectors** - Create additional inspector accounts in DynamoDB
3. **Email reports** - Integrate SES to email reports to customers
4. **Dashboard** - Create an admin dashboard to view all inspections
5. **Mobile app** - Build a mobile app for easier photo capture

---

## Cost Estimate

- **DynamoDB**: ~$1/month (low usage)
- **Lambda**: Free tier covers most usage
- **S3**: ~$0.50/month (per 100 reports with photos)
- **Amplify**: Existing cost (no change)

**Total estimated cost**: ~$2-5/month for moderate usage

---

## Support

For issues or questions:
1. Check AWS CloudWatch Logs for Lambda functions
2. Review DynamoDB tables for data issues
3. Test Function URLs directly using Postman
4. Verify all IAM permissions are correctly set

---

Generated: January 2025
Version: 1.0
