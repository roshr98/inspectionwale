# AWS Cost Management & Budget Setup Guide

**Date**: October 14, 2025  
**Purpose**: Monitor AWS costs, set budget alerts, and identify services exceeding free tier

---

## 🎯 Quick Overview

This guide will help you:
1. ✅ Set up billing alerts (email notifications when costs exceed thresholds)
2. ✅ Create AWS Budgets (track daily/monthly spending)
3. ✅ Monitor which services are using the most money
4. ✅ Identify S3 storage that might exceed free tier
5. ✅ Get simple reports to make cleanup decisions

---

## 📊 Part 1: Enable Billing Alerts (5 minutes)

### Step 1: Access Billing Dashboard

1. **Login to AWS Console** as **root user** (the email you used to create AWS account)
   - URL: https://console.aws.amazon.com/
   - Use root user email and password (NOT IAM user)

2. **Navigate to Billing**
   - Click your account name (top right)
   - Select **"Billing and Cost Management"**
   - Or direct URL: https://console.aws.amazon.com/billing/

### Step 2: Enable Billing Alerts

1. In Billing Dashboard, click **"Billing preferences"** (left sidebar)

2. **Enable these settings:**
   - ✅ **Receive Free Tier Usage Alerts** 
     - Enter email: `inspectionwale@zohomail.in`
     - This alerts you when you're about to exceed free tier limits
   
   - ✅ **Receive Billing Alerts**
     - This enables CloudWatch billing alarms
   
   - ✅ **Receive PDF Invoice By Email**
     - Get monthly invoices automatically

3. Click **"Save preferences"**

---

## 💰 Part 2: Create AWS Budgets (10 minutes)

AWS Budgets let you set spending limits and get alerts BEFORE you're charged.

### Budget 1: Monthly Total Spending Limit

1. Go to **AWS Budgets**: https://console.aws.amazon.com/billing/home#/budgets

2. Click **"Create budget"**

3. **Budget Setup:**
   - Budget type: **Cost budget**
   - Name: `InspectionWale-Monthly-Budget`
   - Period: **Monthly**
   - Budget amount: **$5.00** (recommended to start)
   - Start date: Select current month

4. **Set Budget Scope:**
   - Scope: **All AWS services** (default)
   - Filters: None (monitor everything)

5. **Configure Alerts:**

   **Alert 1 - 50% Threshold:**
   - Threshold: **50%** of budgeted amount ($2.50)
   - Email recipients: `inspectionwale@zohomail.in`
   - Alert message: "⚠️ You've reached 50% ($2.50) of your monthly budget"

   **Alert 2 - 80% Threshold:**
   - Click **"Add alert threshold"**
   - Threshold: **80%** of budgeted amount ($4.00)
   - Email recipients: `inspectionwale@zohomail.in`
   - Alert message: "🚨 You've reached 80% ($4.00) of your monthly budget"

   **Alert 3 - 100% Threshold:**
   - Click **"Add alert threshold"**
   - Threshold: **100%** of budgeted amount ($5.00)
   - Email recipients: `inspectionwale@zohomail.in`
   - Alert message: "🔴 BUDGET EXCEEDED! You've reached $5.00"

6. Click **"Create budget"**

### Budget 2: S3 Storage Specific Budget

1. Click **"Create budget"** again

2. **Budget Setup:**
   - Budget type: **Cost budget**
   - Name: `InspectionWale-S3-Storage-Budget`
   - Period: **Monthly**
   - Budget amount: **$1.00**

3. **Set Budget Scope:**
   - Click **"Add filter"**
   - Filter type: **Service**
   - Service: Select **"Amazon Simple Storage Service"**

4. **Configure Alerts:**
   - Threshold: **80%** ($0.80)
   - Email: `inspectionwale@zohomail.in`
   - Message: "S3 storage costs reaching $0.80 - consider cleanup"

5. Click **"Create budget"**

### Budget 3: Lambda Function Budget

1. Create another budget for Lambda:
   - Name: `InspectionWale-Lambda-Budget`
   - Budget amount: **$1.00/month**
   - Filter: Service = **AWS Lambda**
   - Alert at **80%** threshold

---

## 📈 Part 3: Cost Explorer Setup (15 minutes)

Cost Explorer shows you exactly where your money is going.

### Enable Cost Explorer

1. Go to: https://console.aws.amazon.com/cost-management/home#/cost-explorer

2. Click **"Enable Cost Explorer"** (if not already enabled)
   - Takes ~24 hours to show data after first enable

### Create Custom Reports

Once Cost Explorer is enabled, create these reports:

#### Report 1: Service-Level Costs (Daily)

1. Click **"Create report"**
2. Settings:
   - Name: `Daily Service Costs`
   - Type: **Cost and usage**
   - Time period: **Last 7 days**
   - Granularity: **Daily**
   - Group by: **Service**
   - Show: **Only active costs**

3. Save report

#### Report 2: Top 5 Most Expensive Services

1. Click **"Create report"**
2. Settings:
   - Name: `Top 5 Services`
   - Time period: **Month to date**
   - Granularity: **Monthly**
   - Group by: **Service**
   - Filter: Show top 5 services by cost

3. Save report

---

## 🔍 Part 4: Monitor Free Tier Usage (5 minutes)

### Check Free Tier Limits

1. Go to: https://console.aws.amazon.com/billing/home#/freetier

2. **Review these services carefully:**

   **S3 Storage (Most likely to exceed):**
   - ✅ Free tier: **5 GB** storage
   - ✅ Free tier: **20,000 GET** requests/month
   - ✅ Free tier: **2,000 PUT** requests/month
   
   **Your current usage:**
   - Bucket: `inspectionwale-car-listings`
   - Check size in S3 console
   
   **Lambda:**
   - ✅ Free tier: **1 million requests**/month
   - ✅ Free tier: **400,000 GB-seconds** compute time
   
   **DynamoDB:**
   - ✅ Free tier: **25 GB** storage
   - ✅ Free tier: **25 read/write units**
   
   **CloudFront (if using):**
   - ✅ Free tier: **1 TB** data transfer out
   - ✅ Free tier: **10 million** requests

3. **Look for services showing orange/red:**
   - Orange = Approaching limit (80%+)
   - Red = Exceeded free tier

---

## 🗂️ Part 5: Analyze S3 Storage Costs

S3 is most likely to exceed free tier. Let's check:

### Check S3 Bucket Size

1. **Open S3 Console:** https://s3.console.aws.amazon.com/s3/

2. **Check `inspectionwale-car-listings` bucket:**
   - Click on bucket name
   - Go to **"Metrics"** tab
   - Look at **"Bucket size"** graph
   - Check **"Number of objects"**

3. **What to look for:**
   ```
   Total Size: ______ GB  (Free tier = 5 GB)
   Total Objects: ______ files
   ```

### S3 Storage Breakdown Commands

Run these AWS CLI commands to analyze storage:

```powershell
# Check total bucket size
aws s3 ls s3://inspectionwale-car-listings --recursive --summarize --human-readable

# List largest files (top 20)
aws s3 ls s3://inspectionwale-car-listings --recursive | Sort-Object -Property @{Expression={[int64]($_ -split '\s+')[2]}} -Descending | Select-Object -First 20

# Count files by folder
aws s3 ls s3://inspectionwale-car-listings/ --recursive | ForEach-Object { ($_ -split '\s+')[3].Split('/')[0] } | Group-Object | Sort-Object Count -Descending
```

### Understanding S3 Costs

**Pricing (after free tier):**
- Storage: **$0.023 per GB/month** (₹1.90/GB)
- GET requests: **$0.0004 per 1,000** requests
- PUT requests: **$0.005 per 1,000** requests

**Example cost calculation:**
```
If you have 10 GB of images:
- Free tier: 5 GB
- Charged: 5 GB
- Cost: 5 GB × $0.023 = $0.115/month (₹9.50)

If you have 50,000 GET requests:
- Free tier: 20,000
- Charged: 30,000
- Cost: (30,000 ÷ 1,000) × $0.0004 = $0.012/month (₹1)
```

---

## 📊 Part 6: Simple Monthly Cost Report

### Get Last Month's Bill

```powershell
# Get current month costs by service (PowerShell)
aws ce get-cost-and-usage `
  --time-period Start=2025-10-01,End=2025-10-14 `
  --granularity MONTHLY `
  --metrics BlendedCost `
  --group-by Type=DIMENSION,Key=SERVICE `
  --output table
```

This shows you **exactly which service is costing how much**.

### Example Report Output:
```
Service                          | Cost (USD)
---------------------------------|------------
Amazon Simple Storage Service    | $0.50
AWS Lambda                       | $0.15
Amazon DynamoDB                  | $0.00 (Free tier)
AWS Amplify                      | $0.00 (Free tier)
CloudFront                       | $0.00 (Free tier)
---------------------------------|------------
TOTAL                            | $0.65
```

---

## 🚨 Part 7: Cost Alert Email Examples

You'll receive emails like this:

### Email 1: Free Tier Warning
```
Subject: AWS Free Tier Usage Alert

You've used 82% of your free tier for:
- Service: Amazon S3
- Limit: 5 GB storage
- Current usage: 4.1 GB
- Days remaining: 15 days

Action: Consider deleting old customer listing photos.
```

### Email 2: Budget Alert
```
Subject: AWS Budget Alert - 80% Threshold

Your budget "InspectionWale-Monthly-Budget" has reached 80%.

Budget: $5.00/month
Current spend: $4.05
Forecasted spend: $5.50

Top services:
1. S3: $2.50 (62%)
2. Lambda: $1.00 (25%)
3. CloudFront: $0.55 (13%)

Action: Review S3 storage and consider cleanup.
```

---

## 🧹 Part 8: Cost Cleanup Recommendations

### When S3 Exceeds Free Tier

**Option 1: Delete Old Customer Listings**
```powershell
# List all customer listing submissions older than 90 days
aws s3 ls s3://inspectionwale-car-listings/submissions/ --recursive | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-90) }

# Delete old submissions (BE CAREFUL!)
# Only run this after reviewing the list above
aws s3 rm s3://inspectionwale-car-listings/submissions/OLD_SUBMISSION_ID/ --recursive
```

**Option 2: Enable S3 Lifecycle Policy (Auto-delete old files)**

1. Go to S3 bucket → **Management** → **Lifecycle rules**
2. Create rule:
   - Name: `Delete old submissions`
   - Prefix: `submissions/`
   - Delete objects after: **90 days**
   - Delete incomplete uploads: **7 days**

**Option 3: Compress Images Further**
- Use AWS Lambda to automatically compress uploaded images
- Convert JPEG to WebP/AVIF (70% smaller)

### When Lambda Exceeds Free Tier

**Check Lambda invocations:**
```powershell
aws cloudwatch get-metric-statistics `
  --namespace AWS/Lambda `
  --metric-name Invocations `
  --dimensions Name=FunctionName,Value=customerListings `
  --start-time 2025-10-01T00:00:00Z `
  --end-time 2025-10-14T23:59:59Z `
  --period 86400 `
  --statistics Sum
```

**Reduce Lambda costs:**
1. Check for infinite loops or errors causing re-execution
2. Optimize Lambda memory (reduce from 512 MB to 256 MB)
3. Set reserved concurrency limit (prevent runaway costs)

---

## 📋 Part 9: Daily Cost Monitoring Routine

### Every Monday Morning (5 minutes):

1. **Check AWS Billing Dashboard:**
   - URL: https://console.aws.amazon.com/billing/home#/bills
   - Look at **"Month-to-date balance"**

2. **Review Free Tier Usage:**
   - URL: https://console.aws.amazon.com/billing/home#/freetier
   - Check S3, Lambda, DynamoDB

3. **Run Cost Report:**
```powershell
# Quick cost check
aws ce get-cost-and-usage `
  --time-period Start=2025-10-01,End=2025-10-14 `
  --granularity MONTHLY `
  --metrics BlendedCost `
  --output table
```

---

## 🎯 Part 10: Decision Matrix

Use this simple chart to decide what to do:

| Monthly Cost | Action Required |
|--------------|-----------------|
| **$0 - $1** | ✅ **No action** - You're well within free tier |
| **$1 - $3** | ⚠️ **Monitor** - Check which service is causing it |
| **$3 - $5** | 🔍 **Investigate** - Review S3 storage, consider cleanup |
| **$5 - $10** | 🚨 **Act now** - Delete old files, optimize images |
| **$10+** | 🔴 **URGENT** - Something is wrong, check for errors |

### Cost-Benefit Analysis:

**Current Services:**
```
Service          | Free Tier | Typical Usage | Risk Level
-----------------|-----------|---------------|------------
S3 Storage       | 5 GB      | 2-3 GB        | ⚠️ MEDIUM
Lambda           | 1M reqs   | 10k reqs      | ✅ LOW
DynamoDB         | 25 GB     | 0.5 GB        | ✅ LOW
Amplify Hosting  | 15 GB     | 2 GB          | ✅ LOW
CloudFront       | 1 TB      | 10 GB         | ✅ LOW
SES (Email)      | 3k emails | 100 emails    | ✅ LOW
```

**Most likely to exceed:** S3 Storage (customer listing photos)

---

## 🔧 Part 11: AWS CLI Commands for Cost Analysis

### Get detailed cost breakdown:

```powershell
# Current month costs by service
aws ce get-cost-and-usage `
  --time-period Start=2025-10-01,End=2025-10-14 `
  --granularity DAILY `
  --metrics BlendedCost `
  --group-by Type=DIMENSION,Key=SERVICE `
  --output json | ConvertFrom-Json | Select-Object -ExpandProperty ResultsByTime

# S3 specific costs
aws ce get-cost-and-usage `
  --time-period Start=2025-10-01,End=2025-10-14 `
  --granularity MONTHLY `
  --metrics BlendedCost `
  --filter file://s3-filter.json
```

**Create `s3-filter.json`:**
```json
{
  "Dimensions": {
    "Key": "SERVICE",
    "Values": ["Amazon Simple Storage Service"]
  }
}
```

### Check S3 bucket costs:

```powershell
# Get S3 bucket size
aws cloudwatch get-metric-statistics `
  --namespace AWS/S3 `
  --metric-name BucketSizeBytes `
  --dimensions Name=BucketName,Value=inspectionwale-car-listings Name=StorageType,Value=StandardStorage `
  --start-time 2025-10-01T00:00:00Z `
  --end-time 2025-10-14T23:59:59Z `
  --period 86400 `
  --statistics Average `
  --output table
```

---

## 📧 Part 12: Email Alert Summary

After setup, you'll receive these email alerts:

### Daily Alerts:
- None (unless budget threshold exceeded)

### Weekly Alerts:
- Free tier usage summary (if enabled)

### Monthly Alerts:
- PDF invoice (around 3rd of each month)
- Free tier limits approaching (if >80%)

### Immediate Alerts:
- Budget threshold exceeded (50%, 80%, 100%)
- Free tier limit exceeded
- Unusual spending spike

---

## ✅ Part 13: Setup Checklist

Use this checklist to complete setup:

### Root User Actions:
- [ ] Login as root user to AWS Console
- [ ] Navigate to Billing & Cost Management
- [ ] Enable "Receive Free Tier Usage Alerts"
- [ ] Enable "Receive Billing Alerts"
- [ ] Enable "Receive PDF Invoice By Email"
- [ ] Add email: inspectionwale@zohomail.in
- [ ] Save billing preferences

### Budget Setup:
- [ ] Create Monthly Total Budget ($5/month)
  - [ ] Add 50% threshold alert
  - [ ] Add 80% threshold alert
  - [ ] Add 100% threshold alert
- [ ] Create S3 Specific Budget ($1/month)
  - [ ] Add 80% threshold alert
- [ ] Create Lambda Budget ($1/month)
  - [ ] Add 80% threshold alert

### Cost Explorer:
- [ ] Enable Cost Explorer
- [ ] Create "Daily Service Costs" report
- [ ] Create "Top 5 Services" report
- [ ] Bookmark Cost Explorer URL

### Monitoring:
- [ ] Check Free Tier usage page
- [ ] Review S3 bucket size
- [ ] Test cost report command
- [ ] Verify email alerts working

---

## 🎓 Part 14: Understanding Your AWS Bill

### Bill Components:

**1. Service Charges:**
- What you pay for actual usage (storage, compute, data transfer)

**2. Data Transfer:**
- OUT to internet: Usually charged
- IN from internet: Usually free
- Between AWS services in same region: Usually free

**3. Requests:**
- API calls to services (S3 GET, PUT, Lambda invocations)

### Reading Your Monthly Bill:

```
Service: Amazon S3
  Storage: $0.50
    - Standard Storage: 7 GB × $0.023 = $0.16
    - Exceeded free tier: 2 GB
  Requests: $0.01
    - GET requests: 25,000 (5,000 over free tier)
  Data Transfer: $0.00 (within free tier)
  
Total S3: $0.51
```

---

## 💡 Part 15: Cost Optimization Tips

### Immediate Actions (Free):
1. ✅ Enable S3 Intelligent-Tiering (auto-moves old files to cheaper storage)
2. ✅ Delete failed/incomplete S3 uploads (can accumulate)
3. ✅ Compress customer listing images before upload
4. ✅ Set Lambda timeout to minimum needed (reduce wasted compute)
5. ✅ Enable CloudWatch Logs retention (7 days instead of forever)

### Future Optimizations:
1. Use CloudFront CDN (reduces S3 GET requests)
2. Implement image lazy loading (reduces data transfer)
3. Use WebP/AVIF format (70% smaller than JPEG)
4. Archive old customer listings to S3 Glacier (90% cheaper)

---

## 🆘 Part 16: What To Do If Costs Spike

### Step 1: Identify the Problem
```powershell
# Get yesterday's costs by service
aws ce get-cost-and-usage `
  --time-period Start=2025-10-13,End=2025-10-14 `
  --granularity DAILY `
  --metrics BlendedCost `
  --group-by Type=DIMENSION,Key=SERVICE
```

### Step 2: Check for Common Issues

**S3 Cost Spike:**
- Someone uploaded many large files
- Misconfigured app uploading in loop
- Check CloudWatch Logs for errors

**Lambda Cost Spike:**
- Function stuck in infinite loop
- Error causing automatic retries
- Check CloudWatch Logs for the function

**Data Transfer Spike:**
- DDoS attack or bot scraping
- Check CloudFront access logs
- Enable AWS WAF if needed

### Step 3: Emergency Cost Control

**Stop All Spending (Nuclear Option):**
1. Disable Lambda functions (Configuration → Concurrency → Set to 0)
2. Set S3 bucket to private (Block all public access)
3. Contact AWS Support

**Safer Options:**
1. Set Lambda reserved concurrency to 10 (limits parallel executions)
2. Enable S3 request throttling
3. Review and delete unnecessary files

---

## 📞 Support & Resources

### AWS Support:
- **Basic Support:** Free (email-only, no phone)
- **Developer Support:** $29/month (email, 12-hour response)
- **Business Support:** $100/month (phone, 1-hour response)

### Useful Links:
- AWS Billing Dashboard: https://console.aws.amazon.com/billing/
- Free Tier Tracker: https://console.aws.amazon.com/billing/home#/freetier
- Cost Explorer: https://console.aws.amazon.com/cost-management/home
- AWS Pricing Calculator: https://calculator.aws/
- AWS Cost Optimization Guide: https://aws.amazon.com/pricing/cost-optimization/

---

## 🎯 Quick Start (TL;DR - 10 minutes)

1. **Login as root** → Billing Dashboard
2. **Enable 3 settings:**
   - ✅ Free Tier Usage Alerts
   - ✅ Billing Alerts  
   - ✅ PDF Invoice Email
3. **Create 1 budget:**
   - Name: Monthly Budget
   - Amount: $5
   - Alerts: 50%, 80%, 100%
4. **Bookmark:** https://console.aws.amazon.com/billing/home#/freetier
5. **Check weekly:** Free Tier usage page

**Done!** You'll now get email alerts before exceeding budget.

---

**Status:** Ready to implement ✅  
**Estimated setup time:** 30 minutes  
**Monthly monitoring time:** 5 minutes/week
