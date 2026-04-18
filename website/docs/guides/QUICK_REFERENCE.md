# 🚀 Quick Reference Card

## 🔑 Your Secret Key (SAVE THIS!)
```
9386b0ad7c5f6d81d0a1d52c11ff1cc4658c9fe4f9d7ec5214bb7e836568e21b
```

## 📦 Deployment Files Ready
- ✅ `amplify/functions/listing-approval/function.zip`
- ✅ `amplify/functions/customer-listings/function.zip`

## 🌐 Your Current Setup
- **API Endpoint**: `https://423cmvhw3g.execute-api.us-east-1.amazonaws.com/prod/customer-listings`
- **Region**: `us-east-1`
- **Account ID**: `381328846826`

## 📝 Configuration Order (80 minutes total)

### 1️⃣ Configure SES (15 min)
https://console.aws.amazon.com/ses/
- Verify: `hello@inspectionwale.com` (or prasad.devadiga333@gmail.com)
- Verify: `prasad.devadiga333@gmail.com`
- Check: Sandbox status (OK for testing)

### 2️⃣ Find Existing Lambda (5 min)
https://console.aws.amazon.com/lambda/
- Find: `customer-listings` function
- Document: Environment variables
  - CAR_LISTINGS_TABLE
  - SES_FROM
  - WEBSITE_URL
  - AWS_REGION

### 3️⃣ Deploy listing-approval (20 min)
- Create new Lambda: `InspectionWale-ListingApproval`
- Runtime: Node.js 20.x
- Upload: `amplify/functions/listing-approval/function.zip`
- Add env vars (5 variables)
- Create Function URL
- Add IAM permissions

### 4️⃣ Update customer-listings (10 min)
- Backup current code
- Upload: `amplify/functions/customer-listings/function.zip`
- Add 2 new env vars:
  - APPROVAL_SECRET_KEY
  - APPROVAL_URL

### 5️⃣ Test Workflow (10 min)
- Submit test listing
- Check admin email
- Click approve
- Verify on website
- Test duplicate prevention

### 6️⃣ Setup Google Analytics (20 min)
https://analytics.google.com/
- Rename WhizzCheck property
- Get Measurement ID: `G-XXXXXXXXXX`
- Update `index.html` (2 places)
- Commit & push
- Verify in Realtime

## ⚡ Quick AWS Console Links

### Lambda
https://console.aws.amazon.com/lambda/home?region=us-east-1

### SES
https://console.aws.amazon.com/ses/home?region=us-east-1

### DynamoDB
https://console.aws.amazon.com/dynamodb/home?region=us-east-1

### CloudWatch Logs
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups

### IAM Roles
https://console.aws.amazon.com/iam/home?region=us-east-1#/roles

## 🔍 Verification Commands

### Check if function.zip files exist
```powershell
Test-Path "amplify\functions\listing-approval\function.zip"
Test-Path "amplify\functions\customer-listings\function.zip"
```

### View recent commits
```powershell
git log --oneline -3
```

### Check Amplify deployment status
```powershell
# Manual: Check AWS Amplify Console
# https://console.aws.amazon.com/amplify/
```

## 🆘 Quick Troubleshooting

### No admin email?
1. Check SES verified identities
2. Check Lambda CloudWatch logs
3. Check spam folder
4. Verify SES_FROM env var

### Approve button not working?
1. Check listing-approval Lambda logs
2. Verify Function URL in customer-listings
3. Check IAM permissions (DynamoDB)
4. Token not expired (7 days)

### Duplicate prevention not working?
1. Check DynamoDB Scan permission
2. Verify sellerEmail/Mobile fields exist
3. Check CloudWatch logs

### GA4 not tracking?
1. Measurement ID correct?
2. Website deployed (not localhost)?
3. Check Network tab (F12)
4. Adblocker disabled?
5. Wait 24 hours for reports

## 📊 Environment Variables Checklist

### listing-approval Lambda (5 variables)
```
CAR_LISTINGS_TABLE = [Your DynamoDB table name]
SES_FROM = [Your verified email]
APPROVAL_SECRET_KEY = 9386b0ad7c5f6d81d0a1d52c11ff1cc4658c9fe4f9d7ec5214bb7e836568e21b
WEBSITE_URL = https://main.d2vwa3xmr1zslz.amplifyapp.com
AWS_REGION = us-east-1
```

### customer-listings Lambda (Add 2 new)
```
APPROVAL_SECRET_KEY = 9386b0ad7c5f6d81d0a1d52c11ff1cc4658c9fe4f9d7ec5214bb7e836568e21b
APPROVAL_URL = [Function URL from listing-approval]
```

## 🎯 Success Indicators

### After Step 3
- [ ] Function URL returns styled error page

### After Step 4
- [ ] Website still loads listings

### After Step 5
- [ ] Admin email received
- [ ] Approve button works
- [ ] Listing appears on website
- [ ] Duplicate blocked

### After Step 6
- [ ] GA4 Realtime shows 1 user
- [ ] Custom events fire
- [ ] Network tab shows gtag requests

## 📞 Need Help?

1. **Check**: `E2E_CONFIGURATION_GUIDE.md` (detailed steps)
2. **Check**: CloudWatch Logs (most helpful for errors)
3. **Check**: AWS Service Health Dashboard
4. **Remember**: All within AWS Free Tier!

## ⏱️ Time Tracking

- [ ] **Step 1**: SES - 15 min
- [ ] **Step 2**: Find Lambda - 5 min
- [ ] **Step 3**: Deploy listing-approval - 20 min
- [ ] **Step 4**: Update customer-listings - 10 min
- [ ] **Step 5**: Test workflow - 10 min
- [ ] **Step 6**: Google Analytics - 20 min

**Total: 80 minutes**

---

**Start here**: Open `E2E_CONFIGURATION_GUIDE.md` and follow Step 1!

**Created**: October 12, 2025  
**Status**: Ready to configure  
**Cost**: $0 (Free Tier)
