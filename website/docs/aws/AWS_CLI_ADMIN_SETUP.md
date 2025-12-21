# 🔐 AWS CLI Admin Access Setup (Temporary for Diagnostics)

## Option 1: Use Named Profile (Recommended)

### Step 1: Configure Admin Profile
```powershell
aws configure --profile admin
```

**Enter when prompted:**
```
AWS Access Key ID: [Your admin/root access key]
AWS Secret Access Key: [Your admin/root secret key]
Default region name: us-east-1
Default output format: json
```

### Step 2: Test Admin Access
```powershell
aws s3api get-bucket-cors --bucket inspectionwale-car-listings --region us-east-1 --profile admin
```

### Step 3: List Lambda Functions
```powershell
aws lambda list-functions --region us-east-1 --profile admin --query 'Functions[*].[FunctionName,Runtime]' --output table
```

---

## Option 2: Temporary Admin Policy for amplifyuser

**Add this policy to amplifyuser (remove after diagnostics):**

### Go to IAM Console:
https://console.aws.amazon.com/iam/home?region=us-east-1#/users/amplifyuser

### Click "Add permissions" → "Attach policies directly"

**Add these managed policies temporarily:**
- ✅ `AmazonS3ReadOnlyAccess` (to check CORS)
- ✅ `AWSLambda_ReadOnlyAccess` (to check Lambda config)

**After diagnostics, REMOVE these permissions!**

---

## Option 3: Manual Console Check (No CLI Needed)

### Check S3 CORS:
1. Go to: https://s3.console.aws.amazon.com/s3/buckets/inspectionwale-car-listings?region=us-east-1&tab=permissions
2. Scroll to "Cross-origin resource sharing (CORS)"
3. Copy-paste the configuration here

### Check Lambda Functions:
1. Go to: https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions
2. List all function names
3. Click on customer-listings → Configuration → Environment variables
4. Copy-paste all env vars

### Check Lambda IAM Role:
1. In customer-listings → Configuration → Permissions
2. Click on the execution role name
3. Check attached policies
4. Look for S3 permissions

---

## 🎯 What I Need to Check:

**For S3 Bucket:**
- ✅ CORS configuration (allows browser uploads)
- ✅ Bucket policy (allows Lambda to generate pre-signed URLs)
- ✅ Bucket name and region

**For Lambda Functions:**
- ✅ Function names and ARNs
- ✅ Environment variables (SES_FROM, APPROVAL_URL, etc.)
- ✅ IAM role permissions (S3, SES, DynamoDB)
- ✅ Function URLs

**For IAM Policies:**
- ✅ Lambda execution role has s3:PutObject
- ✅ Pre-signed URL generation permissions

---

## 🚀 Quick Path Forward:

**EASIEST:** You manually check in Console and tell me:
1. S3 CORS configuration (copy-paste or "empty")
2. Lambda function names
3. customer-listings environment variables

**FASTEST FOR ME:** Configure AWS CLI admin profile so I can run commands

**Choose whichever is easier for you!** 🎯
