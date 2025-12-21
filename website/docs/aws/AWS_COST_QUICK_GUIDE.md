# Simple AWS Cost Monitoring - Quick Reference

## 🎯 Your Complete Setup (30 minutes)

### ✅ Step 1: Enable Billing Alerts (5 min)

1. Login to AWS as **ROOT USER**: https://console.aws.amazon.com/
2. Click your name (top right) → **Billing and Cost Management**
3. Click **"Billing preferences"** (left sidebar)
4. Check these 3 boxes:
   - ✅ Receive Free Tier Usage Alerts
   - ✅ Receive Billing Alerts
   - ✅ Receive PDF Invoice By Email
5. Email: `inspectionwale@zohomail.in`
6. Click **Save preferences**

**✅ DONE! You'll now get alerts when approaching limits.**

---

### ✅ Step 2: Create Monthly Budget (10 min)

1. Go to: https://console.aws.amazon.com/billing/home#/budgets
2. Click **"Create budget"**
3. Fill in:
   ```
   Budget name: InspectionWale-Monthly
   Amount: $5.00
   Period: Monthly
   ```
4. Add 3 alerts:
   - Alert 1: 50% ($2.50)
   - Alert 2: 80% ($4.00)
   - Alert 3: 100% ($5.00)
5. Email: `inspectionwale@zohomail.in`
6. Click **Create budget**

**✅ DONE! You'll get emails at 50%, 80%, and 100% of budget.**

---

### ✅ Step 3: Weekly Cost Check (2 min)

Run this command every Monday:

```powershell
cd c:\Users\Administrator\Documents\Inpectionwale\website
.\check-aws-costs.ps1
```

**Output looks like:**
```
========================================
   InspectionWale AWS Cost Report
========================================

💰 COST BY SERVICE (Month-to-Date):
  📦 S3: $0.50 USD (₹41.50 INR)
  📦 Lambda: $0.15 USD (₹12.45 INR)

💵 TOTAL: $0.65 USD (₹53.95 INR)

📊 BUDGET STATUS:
  Budget: $5.00 USD/month
  Used: 13%
  Remaining: $4.35 USD

✅ Budget status: GOOD. Well within limits.
```

---

## 📊 Understanding Your Costs

### What Each Service Costs:

| Service | Free Tier | What You Use | Risk |
|---------|-----------|--------------|------|
| **S3 Storage** | 5 GB | 2-3 GB | ⚠️ MEDIUM |
| **Lambda** | 1M requests | 10k requests | ✅ LOW |
| **DynamoDB** | 25 GB | 0.5 GB | ✅ LOW |
| **Amplify** | 15 GB transfer | 2 GB | ✅ LOW |
| **SES Email** | 3,000 emails | 100 emails | ✅ LOW |

### Cost Examples:

**If you exceed S3 free tier (5 GB):**
```
Scenario: 10 GB of customer listing photos
- Free: 5 GB
- Paid: 5 GB × $0.023/GB = $0.12/month (₹10)
```

**If you exceed Lambda free tier:**
```
Scenario: 1.5 million requests
- Free: 1 million
- Paid: 500k × $0.20/million = $0.10/month (₹8)
```

---

## 🚨 Email Alerts You'll Receive

### Alert 1: Free Tier Warning (When you reach 80%)
```
Subject: AWS Free Tier Usage Alert

Service: Amazon S3
Usage: 4.2 GB / 5 GB (84%)
Days left in month: 12

ACTION: Monitor usage or delete old files
```

### Alert 2: Budget Alert (When you reach 50%)
```
Subject: AWS Budget Alert - 50% Threshold

Budget: InspectionWale-Monthly
Amount: $5.00/month
Current: $2.55 (51%)

Top services:
- S3: $1.50
- Lambda: $0.80
- CloudFront: $0.25

ACTION: Review costs, consider cleanup
```

### Alert 3: Budget Exceeded (When you reach 100%)
```
Subject: 🔴 AWS Budget EXCEEDED

Budget: $5.00
Current: $5.20

URGENT ACTION: Review AWS console immediately
```

---

## 🎯 Simple Decision Chart

### What to do based on monthly cost:

| Cost | Status | Action |
|------|--------|--------|
| $0 - $1 | ✅ **EXCELLENT** | Do nothing, all good! |
| $1 - $3 | ⚠️ **GOOD** | Monitor weekly, no action needed |
| $3 - $5 | ⚠️ **WATCH** | Check S3 storage, review costs |
| $5 - $10 | 🚨 **ACTION** | Delete old files, optimize now |
| $10+ | 🔴 **URGENT** | Something wrong, investigate immediately |

---

## 🧹 How to Reduce Costs

### Option 1: Delete Old Customer Listings (Saves most money)

**Check what's using space:**
```powershell
aws s3 ls s3://inspectionwale-car-listings --recursive --summarize --human-readable
```

**Delete submissions older than 90 days:**
```powershell
# First, LIST what will be deleted (SAFE)
aws s3 ls s3://inspectionwale-car-listings/submissions/ --recursive | Select-Object -First 10

# Then DELETE (BE CAREFUL!)
aws s3 rm s3://inspectionwale-car-listings/submissions/OLD_ID/ --recursive
```

### Option 2: Enable Auto-Delete (Automatic cleanup)

1. Go to S3: https://s3.console.aws.amazon.com/s3/
2. Click bucket → **Management** → **Lifecycle rules**
3. Create rule:
   ```
   Name: Auto-delete old submissions
   Prefix: submissions/
   Delete after: 90 days
   ```
4. Save

**Result:** Old customer listings automatically deleted after 90 days.

### Option 3: Compress Images (Reduces storage)

Your images are already compressed with AVIF format! No action needed.

---

## 📅 Monthly Routine (5 minutes)

### Every Monday Morning:

**1. Run cost report:**
```powershell
.\check-aws-costs.ps1
```

**2. Check these 3 pages:**
- Bills: https://console.aws.amazon.com/billing/home#/bills
- Free Tier: https://console.aws.amazon.com/billing/home#/freetier
- Budgets: https://console.aws.amazon.com/billing/home#/budgets

**3. Look for:**
- ✅ Total cost < $5
- ✅ S3 storage < 5 GB
- ✅ No services in "red" on Free Tier page

**4. Take action if needed:**
- Delete old customer listings
- Check for errors in Lambda logs
- Review unusual traffic spikes

---

## 🆘 Emergency: Costs Suddenly Spike

### If you wake up to a $50 bill:

**Step 1: STOP THE BLEEDING (5 min)**

1. **Check what's causing it:**
```powershell
.\check-aws-costs.ps1
```

2. **Disable expensive service:**

For Lambda:
```powershell
aws lambda put-function-concurrency --function-name customerListings --reserved-concurrent-executions 0
```

For S3:
- Go to S3 Console
- Block all public access
- Enable request throttling

**Step 2: INVESTIGATE (10 min)**

Check CloudWatch Logs:
```powershell
aws logs tail /aws/lambda/customerListings --follow --since 1h
```

Look for:
- Infinite loops
- Error messages repeating
- Unusual traffic patterns

**Step 3: FIX & RE-ENABLE (varies)**

- Fix the bug causing high costs
- Re-enable service with limits
- Monitor closely for 24 hours

**Step 4: CONTACT AWS SUPPORT**

If costs are due to error/attack:
- https://console.aws.amazon.com/support/
- Request billing review (they often credit back erroneous charges)

---

## 📊 Sample Monthly Report

```
========================================
   InspectionWale AWS Cost Report
   September 2025
========================================

💰 COST BY SERVICE:
  📦 S3 Storage: $0.45
  📦 Lambda: $0.10  
  📦 CloudFront: $0.05
  📦 SES Email: $0.00 (free tier)
  
💵 TOTAL: $0.60 USD (₹49.80 INR)

📊 BUDGET: 12% used ($0.60 / $5.00)

🗂️  S3 STORAGE:
  Total Files: 145
  Total Size: 3.2 GB / 5 GB
  Status: ✅ Within free tier

🆓 FREE TIER STATUS:
  S3: 64% used (3.2/5 GB)
  Lambda: 1% used (10k/1M requests)
  DynamoDB: 2% used (0.5/25 GB)
  
💡 RECOMMENDATION:
  ✅ Everything looks good!
  All services well within free tier.
  No action needed this month.

========================================
Next review: October 7, 2025
========================================
```

---

## ✅ Quick Setup Checklist

Use this to track your setup progress:

### Billing Alerts:
- [ ] Logged in as root user
- [ ] Enabled "Free Tier Usage Alerts"
- [ ] Enabled "Billing Alerts"
- [ ] Enabled "PDF Invoice Email"
- [ ] Added email: inspectionwale@zohomail.in
- [ ] Saved preferences

### Budget:
- [ ] Created "InspectionWale-Monthly" budget
- [ ] Set amount: $5/month
- [ ] Added 50% alert ($2.50)
- [ ] Added 80% alert ($4.00)
- [ ] Added 100% alert ($5.00)
- [ ] Verified email alerts

### Monitoring:
- [ ] Bookmarked billing pages
- [ ] Tested cost report script
- [ ] Reviewed S3 bucket size
- [ ] Checked free tier usage page

### Weekly Routine:
- [ ] Added reminder: "Check AWS costs every Monday"
- [ ] Run: `.\check-aws-costs.ps1`
- [ ] Review free tier page
- [ ] Check for alerts

---

## 📞 Need Help?

### Resources:
- **Full Guide**: AWS_BILLING_COST_MANAGEMENT.md
- **Cost Script**: check-aws-costs.ps1
- **AWS Billing**: https://console.aws.amazon.com/billing/
- **Free Tier**: https://console.aws.amazon.com/billing/home#/freetier

### Common Questions:

**Q: How do I know if I'm being charged?**  
A: Run `.\check-aws-costs.ps1` - if total > $0, you're being charged.

**Q: What if I exceed free tier?**  
A: You'll get an email alert. Delete old files or optimize usage.

**Q: How do I delete old customer listings?**  
A: See "Option 1: Delete Old Customer Listings" section above.

**Q: Will I definitely get email alerts?**  
A: Yes, IF you completed Step 1 & 2 above (enable alerts + create budget).

**Q: What's the most likely service to cost money?**  
A: S3 Storage (customer listing photos). Monitor this weekly.

---

**Setup Time**: 30 minutes one-time  
**Monitor Time**: 2 minutes weekly  
**Peace of Mind**: Priceless ✅
