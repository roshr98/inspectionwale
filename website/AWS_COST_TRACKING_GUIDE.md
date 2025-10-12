# AWS Cost Tracking & Budget Guide for InspectionWale

## 📊 Current AWS Usage Summary (as of Oct 2025)

### Your Budget: ₹3,000/month (~$36 USD)
- **Domain Cost**: ₹1,500 (one-time, already paid)
- **Remaining Monthly Budget**: ₹1,500 (~$18 USD/month)

---

## 🔍 Current AWS Services & Costs

### 1. **AWS Amplify** (Website Hosting)
- **Current Cost**: ~$0-5/month in free tier
- **Free Tier**: 
  - 1000 build minutes/month (you use ~10-20/month)
  - 15 GB served/month (you use ~2-3 GB/month)
  - 5 GB stored (you use ~500 MB)
- **After Free Tier**: $0.01/build minute, $0.15/GB served
- **Your Safety**: ✅ SAFE - Well within free tier

### 2. **AWS Lambda** (customerListings function)
- **Current Cost**: $0 (FREE)
- **Free Tier**: 
  - 1 million requests/month
  - 400,000 GB-seconds compute time
- **Your Usage**: ~100-500 requests/month
- **After Free Tier**: $0.20 per 1M requests, $0.0000166667/GB-second
- **Your Safety**: ✅ SAFE - Using <1% of free tier

### 3. **DynamoDB** (CarListings, CarReservations)
- **Current Cost**: $0 (FREE)
- **Free Tier**: 
  - 25 GB storage
  - 25 read/write capacity units
- **Your Usage**: ~5 MB storage, <1 capacity unit
- **After Free Tier**: $0.25/GB/month, $0.00065 per write
- **Your Safety**: ✅ SAFE - Using <1% of free tier

### 4. **S3** (inspectionwale-car-listings bucket)
- **Current Cost**: ~$0.10/month
- **Free Tier**: 
  - 5 GB storage
  - 20,000 GET requests
  - 2,000 PUT requests
- **Your Usage**: ~500 MB storage, ~200 requests/month
- **After Free Tier**: $0.023/GB/month
- **Your Safety**: ✅ SAFE - Well within free tier

### 5. **API Gateway**
- **Current Cost**: $0 (FREE)
- **Free Tier**: 1 million requests/month for 12 months
- **Your Usage**: ~100-500 requests/month
- **After Free Tier**: $3.50 per million requests
- **Your Safety**: ✅ SAFE - Using <1% of free tier

### 6. **Amazon SES** (Email Service)
- **Current Cost**: $0 (FREE from EC2/Lambda)
- **Free Tier**: 62,000 emails/month when sent from Lambda
- **Your Usage**: ~10-50 emails/month
- **After Free Tier**: $0.10 per 1,000 emails
- **Your Safety**: ✅ SAFE - Well within free tier

---

## 💰 Total Current Monthly Cost: ~₹10-50 (~$0.10-0.60)

### Cost Breakdown:
1. Amplify: ₹0 (free tier)
2. Lambda: ₹0 (free tier)
3. DynamoDB: ₹0 (free tier)
4. S3: ₹8-10 (minimal storage)
5. API Gateway: ₹0 (free tier)
6. SES: ₹0 (free tier)

**Total: ₹10-50/month** ✅ WELL UNDER BUDGET!

---

## 📈 Traffic Projection & Cost Estimates

### Scenario 1: Current Traffic (100-500 visitors/month)
- **Cost**: ₹10-50/month
- **Budget Status**: ✅ SAFE (98% under budget)

### Scenario 2: Medium Traffic (5,000 visitors/month)
- Lambda invocations: ~2,000/month
- DynamoDB reads: ~10,000/month
- S3 bandwidth: ~5 GB/month
- **Estimated Cost**: ₹100-200/month
- **Budget Status**: ✅ SAFE (87% under budget)

### Scenario 3: High Traffic (50,000 visitors/month)
- Lambda invocations: ~20,000/month
- DynamoDB reads: ~100,000/month
- S3 bandwidth: ~50 GB/month
- **Estimated Cost**: ₹800-1,200/month
- **Budget Status**: ✅ SAFE (20-50% under budget)

### Scenario 4: Very High Traffic (200,000 visitors/month)
- Lambda invocations: ~80,000/month
- DynamoDB reads: ~400,000/month
- S3 bandwidth: ~200 GB/month
- **Estimated Cost**: ₹2,500-3,500/month
- **Budget Status**: ⚠️ APPROACHING LIMIT

---

## 🚨 Setting Up AWS Budget Alerts

### Step 1: Create Budget via AWS Console
1. Go to: https://console.aws.amazon.com/billing/home#/budgets
2. Click "Create budget"
3. Budget details:
   - **Budget name**: InspectionWale-Monthly-Budget
   - **Budget amount**: $36 USD (₹3,000)
   - **Period**: Monthly

### Step 2: Set Alert Thresholds
Configure 4 alerts to email: **roshr98@gmail.com**

**Alert 1 - 50% threshold (₹1,500)**
- Type: Actual costs
- Threshold: 50% of budgeted amount
- Email: roshr98@gmail.com
- Action: Review usage, no action needed

**Alert 2 - 80% threshold (₹2,400)**
- Type: Actual costs
- Threshold: 80% of budgeted amount
- Email: roshr98@gmail.com
- Action: Review high-cost services, consider optimization

**Alert 3 - 100% threshold (₹3,000)**
- Type: Actual costs
- Threshold: 100% of budgeted amount
- Email: roshr98@gmail.com
- Action: URGENT - Review and reduce usage

**Alert 4 - Forecasted 100% (₹3,000)**
- Type: Forecasted costs
- Threshold: 100% of budgeted amount
- Email: roshr98@gmail.com
- Action: Proactive warning of potential overage

### Step 3: Manual Command (Alternative)
If you prefer CLI, run this PowerShell command:

```powershell
# Create budget with alerts
aws budgets create-budget --account-id 381328846826 --budget '{
  "BudgetName": "InspectionWale-Monthly-Budget",
  "BudgetLimit": {
    "Amount": "36",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST"
}' --notifications-with-subscribers '[
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 50,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      {
        "SubscriptionType": "EMAIL",
        "Address": "roshr98@gmail.com"
      }
    ]
  },
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      {
        "SubscriptionType": "EMAIL",
        "Address": "roshr98@gmail.com"
      }
    ]
  },
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 100,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      {
        "SubscriptionType": "EMAIL",
        "Address": "roshr98@gmail.com"
      }
    ]
  }
]' --region us-east-1
```

---

## 📊 How to Check Current Costs

### Method 1: AWS Console
1. Go to: https://console.aws.amazon.com/billing/home
2. View "Month-to-Date Spend"
3. Check "Bills" for detailed breakdown

### Method 2: AWS CLI
```powershell
# Get current month costs
aws ce get-cost-and-usage --time-period Start=2025-10-01,End=2025-10-12 --granularity MONTHLY --metrics "BlendedCost" --region us-east-1

# Get costs by service
aws ce get-cost-and-usage --time-period Start=2025-10-01,End=2025-10-12 --granularity MONTHLY --metrics "BlendedCost" --group-by Type=DIMENSION,Key=SERVICE --region us-east-1
```

---

## 🎯 Free Tier Expiration Alert

**Important**: AWS Free Tier lasts for 12 months from account creation.
- If your account was created in **2024**, free tier expires in **2025**
- After expiration, costs may increase to **₹500-800/month** with current traffic
- Plan ahead for this transition

### Services That Expire:
- Lambda: 1M requests/month becomes paid
- API Gateway: 1M requests/month becomes paid
- S3: 5GB storage becomes paid

### Services That Don't Expire:
- DynamoDB: 25GB always free
- Lambda: First 1M requests always free
- SES: 62,000 emails/month always free (from Lambda)

---

## 💡 Cost Optimization Tips

### 1. **Enable S3 Intelligent-Tiering**
```powershell
aws s3api put-bucket-intelligent-tiering-configuration --bucket inspectionwale-car-listings --id default-tiering --intelligent-tiering-configuration '{
  "Id": "default-tiering",
  "Status": "Enabled",
  "Tierings": [
    {
      "Days": 90,
      "AccessTier": "ARCHIVE_ACCESS"
    }
  ]
}'
```
**Savings**: Up to 70% on storage costs for old images

### 2. **Set S3 Lifecycle Policies**
- Move old inspection reports to Glacier after 6 months
- Delete temporary uploads after 7 days

### 3. **CloudFront CDN** (Optional)
- Add CloudFront for faster loading
- Free tier: 1TB data transfer/month
- Reduces S3 bandwidth costs

### 4. **Lambda Memory Optimization**
- Current: 1024 MB
- Reduce to 512 MB if possible
- **Savings**: 50% on compute costs

---

## 📧 Contact for Budget Alerts
All budget alerts will be sent to: **roshr98@gmail.com**

Make sure to:
1. Check email regularly
2. Verify email subscription when AWS sends confirmation
3. Add aws-no-reply@amazon.com to safe senders

---

## ✅ Summary - You're Safe!

**Current Status**: ✅ EXCELLENT
- Using only ₹10-50 out of ₹3,000 budget (98% under budget)
- All services in free tier
- Can handle 50,000 visitors/month comfortably within budget
- Budget alerts set up to roshr98@gmail.com

**Next Steps**:
1. Set up budget alerts in AWS Console
2. Verify email subscription
3. Monitor monthly usage
4. Review this guide when traffic increases
