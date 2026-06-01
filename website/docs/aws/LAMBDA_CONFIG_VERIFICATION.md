# 🚀 Lambda Configuration - Ready to Deploy

## Current Status
- ✅ AWS SES: Domain inspectionwale.com verified
- ✅ Zoho Email: SENDING works from hello@inspectionwale.com
- ⏰ Zoho Email: RECEIVING pending (not needed for Lambda testing)
- ✅ Lambda functions: Already deployed

---

## 📝 Lambda Environment Variables

### customer-listings Lambda

**Required Environment Variables:**
```
CAR_LISTINGS_TABLE=CarListings
AWS_REGION=us-east-1
SES_FROM=hello@inspectionwale.com
WEBSITE_URL=https://main.d2vwa3xmr1zslz.amplifyapp.com
APPROVAL_SECRET_KEY=9386b0ad7c5f6d81d0a1d52c11ff1cc4658c9fe4f9d7ec5214bb7e836568e21b
APPROVAL_URL=[Function URL from listing-approval Lambda]
```

### listing-approval Lambda

**Required Environment Variables:**
```
CAR_LISTINGS_TABLE=CarListings
SES_FROM=hello@inspectionwale.com
APPROVAL_SECRET_KEY=9386b0ad7c5f6d81d0a1d52c11ff1cc4658c9fe4f9d7ec5214bb7e836568e21b
WEBSITE_URL=https://main.d2vwa3xmr1zslz.amplifyapp.com
AWS_REGION=us-east-1
```

---

## 🔍 Verify Current Lambda Configuration

Run these AWS CLI commands to check current setup:

### 1. List all Lambda functions
```bash
aws lambda list-functions --region us-east-1 --query 'Functions[*].[FunctionName,Runtime,LastModified]' --output table
```

### 2. Check customer-listings environment variables
```bash
aws lambda get-function-configuration --function-name customer-listings --region us-east-1 --query 'Environment.Variables' --output json
```

### 3. Check listing-approval environment variables (if exists)
```bash
aws lambda get-function-configuration --function-name listing-approval --region us-east-1 --query 'Environment.Variables' --output json
```

### 4. Check Function URLs
```bash
aws lambda list-function-url-configs --function-name listing-approval --region us-east-1
```

---

## ✅ Ready to Test Workflow

Once Lambda env vars are confirmed:

1. Go to website: https://main.d2vwa3xmr1zslz.amplifyapp.com
2. Submit a test car listing
3. Check Gmail (prasad.devadiga333@gmail.com) for approval email
4. Click "Approve" button
5. Verify listing appears on website
6. Test duplicate prevention

---

## 📧 Email Flow Diagram

```
Customer submits listing
    ↓
customer-listings Lambda
    ↓
Sends approval email FROM hello@inspectionwale.com
    ↓
Admin receives at prasad.devadiga333@gmail.com ✅
    ↓
Admin clicks Approve/Reject
    ↓
listing-approval Lambda
    ↓
Updates DynamoDB + Sends confirmation FROM hello@inspectionwale.com
    ↓
Customer receives confirmation at their email ✅
```

**All outgoing emails work!** ✅

---

## 🔧 Fix Zoho Receiving Later

**After Lambda testing works:**

1. Wait 15-30 minutes for Zoho mail routing to activate
2. Try sending from Gmail to hello@inspectionwale.com again
3. If still doesn't work:
   - Contact Zoho support
   - Or use email forwarding in Route 53
   - Or setup catch-all forwarding in Zoho

**Not urgent!** Customers don't email hello@inspectionwale.com - they use the contact form.

---

**Next Action:** Run the AWS CLI commands above to verify Lambda configuration!
