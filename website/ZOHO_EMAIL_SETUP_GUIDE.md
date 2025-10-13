# 📧 Zoho Mail Setup Guide for InspectionWale.com

## 🎯 Why Zoho Mail?

✅ **FREE Forever Plan** - Up to 5 users with 5GB storage each  
✅ **Professional Email** - yourname@inspectionwale.com  
✅ **No Ads** - Clean interface, no advertising  
✅ **SMTP/IMAP Support** - Works with AWS SES  
✅ **Mobile Apps** - iOS & Android  
✅ **Webmail** - Access from anywhere  
✅ **Email Forwarding** - Can forward to Gmail if needed  

---

## 📋 What You'll Get

After setup, you'll have these email addresses:

| Email Address | Purpose | Who |
|---------------|---------|-----|
| `no-reply@inspectionwale.com` | Automated emails (SES) | System |
| `hello@inspectionwale.com` | Customer support | Team inbox |
| `prasad.devadiga@inspectionwale.com` | Admin/Owner | Prasad |
| `roshan.kutty@inspectionwale.com` | Operations | Roshan |
| `martin.doon@inspectionwale.com` | Manager | Martin |

**Cost: $0/month** (Free Forever Plan - up to 5 users)

---

## 🚀 Step-by-Step Setup

### STEP 1: Sign Up for Zoho Mail (10 minutes)

#### 1.1 Go to Zoho Mail Free Plan
1. Visit: https://www.zoho.com/mail/zohomail-pricing.html
2. Click **"Free Plan"** (supports up to 5 users)
3. Click **"Sign Up Now"**

#### 1.2 Create Zoho Account
1. Enter your email: `inspectionwale@zohomail.in`
2. Choose password (strong password!)
3. Complete verification (check Gmail for code)
4. Sign in to Zoho

#### 1.3 Start Domain Setup
1. After login, you'll see: **"Add your domain"**
2. Enter: `inspectionwale.com`
3. Click **"Add Domain"**
4. Select: **"I'll configure DNS myself"** (we'll do it manually)

---

### STEP 2: Verify Domain Ownership (15 minutes)

#### 2.1 Get Verification TXT Record from Zoho
Zoho will show you a TXT record like:
```
Type: TXT
Host/Name: @ (or leave blank)
Value: zoho-verification=zb12345678.zmverify.zoho.com
TTL: 3600 (or 1 hour)
```

**Copy this value!** You'll need it in the next step.

#### 2.2 Add TXT Record to AWS Route 53

**Since your DNS is managed by AWS Route 53:**

1. **Open Route 53 Console**: https://console.aws.amazon.com/route53/
2. Click **"Hosted zones"** in left menu
3. Click on **"inspectionwale.com"** domain
4. Click **"Create record"**
5. Fill in the form:
   ```
   Record name: (leave blank for root domain @)
   Record type: TXT
   Value: "zoho-verification=zb12345678.zmverify.zoho.com"
          (replace with actual code from Zoho - include quotes)
   TTL: 300 (5 minutes)
   Routing policy: Simple routing
   ```
6. Click **"Create records"**
7. Record will appear in your hosted zone immediately

#### 2.3 Wait and Verify (10-30 minutes)

1. Go back to Zoho Mail setup page
2. Click **"Verify"** button
3. If it says "Not yet propagated":
   - **Wait 15-30 minutes** (DNS propagation time)
   - Click "Verify" again
4. Once verified: ✅ **"Domain verified successfully"**

---

### STEP 3: Configure Email Routing (MX Records) (10 minutes)

#### 3.1 Get MX Records from Zoho

Zoho will show you MX records to add. They look like:

```
Priority: 10
Host/Name: @
Value: mx.zoho.com
TTL: 3600

Priority: 20
Host/Name: @
Value: mx2.zoho.com
TTL: 3600

Priority: 50
Host/Name: @
Value: mx3.zoho.com
TTL: 3600
```

#### 3.2 Add MX Records to AWS Route 53

1. **Open Route 53**: https://console.aws.amazon.com/route53/
2. Click **"Hosted zones"** → **"inspectionwale.com"**
3. **⚠️ IMPORTANT: Delete any existing MX records first!**
   - Look for existing MX records
   - Select them and click **"Delete"**
4. Click **"Create record"** to add Zoho MX records

**Add all 3 MX records in ONE record:**
```
Record name: (leave blank for root domain)
Record type: MX
Value: (enter all 3 lines below)
   10 mx.zoho.com
   20 mx2.zoho.com
   50 mx3.zoho.com
TTL: 300
Routing policy: Simple routing
```

**Note:** In Route 53, you add all MX records as separate lines in ONE record, each with format: `priority hostname`

5. Click **"Create records"**
6. You should see one MX record with 3 values listed

#### 3.3 Add SPF Record to Route 53 (Prevents Spam)

1. In Route 53 → Hosted zones → inspectionwale.com
2. Click **"Create record"**
3. Fill in:
   ```
   Record name: (leave blank for root domain)
   Record type: TXT
   Value: "v=spf1 include:zoho.com include:amazonses.com ~all"
          (include quotes - this allows both Zoho AND AWS SES to send)
   TTL: 300
   ```
4. Click **"Create records"**

**Note:** This SPF record includes BOTH Zoho and AWS SES, so emails from your website (via SES) and Zoho won't be marked as spam.

#### 3.4 Add DKIM Record to Route 53 (Email Authentication)

1. In Zoho Mail setup, go to **"Email Configuration"** → **"DKIM"**
2. Zoho will generate a DKIM record like:
   ```
   Type: TXT
   Name: zoho._domainkey
   Value: v=DKIM1; k=rsa; p=MIGfMA0GCSq... (very long string)
   TTL: 3600
   ```
3. **Copy the record details**
4. **Add to Route 53:**
   - Go to Route 53 → Hosted zones → inspectionwale.com
   - Click **"Create record"**
   - Fill in:
     ```
     Record name: zoho._domainkey
     Record type: TXT
     Value: "v=DKIM1; k=rsa; p=MIGfMA0GCSq..." (include quotes, paste full value)
     TTL: 300
     ```
   - Click **"Create records"**
5. Wait 5-10 minutes, then go back to Zoho and click **"Verify DKIM"**

---

### STEP 4: Create Email Accounts (10 minutes)

#### 4.1 Create First User 

1. In Zoho Mail admin panel, go to **"Users"**
2. Click **"Add User"**
3. Fill in:
   ```
   First Name: Prasad
   Last Name: Devadiga
   Email: prasad.devadiga@inspectionwale.com
   Password: [Create strong password]
   ```
4. Click **"Add"**

#### 4.2 Create Remaining Users

Repeat for each team member:

**User 2: Support Email**
```
First Name: Hello
Last Name: Support
Email: hello@inspectionwale.com
Password: [Strong password]
```

**User 3: Roshan**
```
First Name: Roshan
Last Name: Kutty
Email: roshan.kutty@inspectionwale.com
Password: [Strong password]
```

**User 4: inspectionWale** (Admin)
```
First Name: inspectionWale
Last Name: 
Email: inspectionwale@zohomail.in
Password: [Strong password]
```

**User 5: No-Reply (System)**
```
First Name: No-Reply
Last Name: System
Email: no-reply@inspectionwale.com
Password: [Strong password]
```

---

### STEP 5: Configure AWS SES with Zoho (15 minutes)

Now we'll configure AWS SES to send emails through your Zoho domain.

#### 5.1 Verify Domain in AWS SES

1. Go to: https://console.aws.amazon.com/ses/
2. Click **"Verified identities"**
3. Click **"Create identity"**
4. Select **"Domain"**
5. Enter: `inspectionwale.com`
6. Check: ✅ **"Generate DKIM settings"**
7. Click **"Create identity"**

#### 5.2 Add AWS SES DNS Records to Route 53

AWS will show you 3 CNAME records for DKIM:

```
Name: abc123._domainkey.inspectionwale.com
Value: abc123.dkim.amazonses.com

Name: def456._domainkey.inspectionwale.com
Value: def456.dkim.amazonses.com

Name: ghi789._domainkey.inspectionwale.com
Value: ghi789.dkim.amazonses.com
```

**Add all 3 CNAME records to AWS Route 53:**

1. **Open Route 53 Console**: https://console.aws.amazon.com/route53/
2. Click **"Hosted zones"** in left menu
3. Click on **"inspectionwale.com"** domain
4. For each CNAME record, click **"Create record"**:
   
   **Record 1:**
   ```
   Record name: abc123._domainkey (replace with actual value from SES)
   Record type: CNAME
   Value: abc123.dkim.amazonses.com (replace with actual value from SES)
   TTL: 300 (or keep default)
   Routing policy: Simple routing
   ```
   Click **"Create records"**
   
   **Record 2:**
   ```
   Record name: def456._domainkey
   Record type: CNAME
   Value: def456.dkim.amazonses.com
   TTL: 300
   ```
   Click **"Create records"**
   
   **Record 3:**
   ```
   Record name: ghi789._domainkey
   Record type: CNAME
   Value: ghi789.dkim.amazonses.com
   TTL: 300
   ```
   Click **"Create records"**

5. **Wait 5-10 minutes** for DNS propagation
6. Go back to SES console and refresh - domain should show **"Verified"** ✅

#### 5.3 Verify Individual Email Addresses in SES

For sending emails via SES, verify these:

1. In SES console, click **"Verified identities"**
2. Click **"Create identity"**
3. Select **"Email address"**
4. Enter: `no-reply@inspectionwale.com`
5. Click **"Create identity"**

**Check email:**
1. Login to Zoho webmail: https://mail.zoho.com/
2. Use: `no-reply@inspectionwale.com` / password
3. Find verification email from AWS
4. Click verification link
5. ✅ Email verified in SES!

**Repeat for:**
- `hello@inspectionwale.com`
- `prasad.devadiga@inspectionwale.com`

---

### STEP 6: Update Lambda Environment Variables (When You Deploy Them)

**⚠️ NOTE: You'll do this AFTER deploying the Lambda functions (Steps 3-4 of main E2E guide)**

#### 6.1 For customer-listings Lambda (when you update it)

When you update the customer-listings Lambda in Step 4:
- Set `SES_FROM` to: `hello@inspectionwale.com`

#### 6.2 For listing-approval Lambda (when you create it)

When you create the NEW listing-approval Lambda in Step 3:
- Set `SES_FROM` to: `no-reply@inspectionwale.com`

**You don't need to do this now!** Just remember:
- Use `hello@inspectionwale.com` or `no-reply@inspectionwale.com` 
- Both are verified in SES ✅
- Both will work perfectly with Zoho

---

### STEP 7: Setup Email Forwarding (Optional but Recommended)

If you want emails to `hello@inspectionwale.com` to also forward to Gmail:

#### 7.1 In Zoho Mail Admin

1. Go to **"Email Forwarding"** or **"Aliases"**
2. For `hello@inspectionwale.com`:
   - Click **"Forward"**
   - Add: `prasad.devadiga333@gmail.com`
   - Select: **"Keep copy in Zoho"** ✅
3. **Save**

Now emails to hello@inspectionwale.com will:
- Stay in Zoho inbox ✅
- Also forward to Gmail ✅

---

## 🧪 Testing & Verification

### Test 1: Send Test Email from Zoho

1. Login to Zoho webmail: https://mail.zoho.com/
2. Use: `no-reply@inspectionwale.com`
3. Compose new email
4. Send to: `prasad.devadiga333@gmail.com`
5. Check Gmail - should receive it ✅

### Test 2: Test AWS SES Sending

1. Go to AWS SES Console
2. Click **"Verified identities"**
3. Click `no-reply@inspectionwale.com`
4. Click **"Send test email"**
5. Send to: `prasad.devadiga333@gmail.com`
6. Check Gmail - should receive it ✅

### Test 3: Test Website Submission

1. Go to your website
2. Submit a test car listing
3. Check:
   - ✅ Email from `no-reply@inspectionwale.com` received
   - ✅ Reply-to shows correct address
   - ✅ No spam warnings
   - ✅ Approve/Reject buttons work

---

## 📱 Access Your Emails

### Webmail (Browser)
- URL: https://mail.zoho.com/
- Login with: `yourname@inspectionwale.com`

### Mobile Apps
- iOS: Download "Zoho Mail" from App Store
- Android: Download "Zoho Mail" from Play Store

### Desktop Email Client (Outlook, Thunderbird, etc.)

**IMAP Settings (for receiving):**
```
Server: imap.zoho.com
Port: 993
Security: SSL/TLS
Username: yourname@inspectionwale.com
Password: [Your Zoho password]
```

**SMTP Settings (for sending):**
```
Server: smtp.zoho.com
Port: 465 (SSL) or 587 (TLS)
Security: SSL/TLS
Username: yourname@inspectionwale.com
Password: [Your Zoho password]
```

---

## 💰 Cost Comparison

| Provider | Free Tier | Users | Storage | Cost After Free Tier |
|----------|-----------|-------|---------|---------------------|
| **Zoho Mail** | Yes | 5 users | 5GB each | $1/user/month |
| Google Workspace | No | - | 30GB | $6/user/month |
| Microsoft 365 | No | - | 50GB | $6/user/month |
| AWS WorkMail | No | - | 50GB | $4/user/month |

**Winner: Zoho Mail** ✅ FREE for 5 users forever!

---

## 🎯 Final Email Configuration Summary

### For Website (AWS Lambda)
```
SES_FROM = no-reply@inspectionwale.com
Admin Email = prasad.devadiga@inspectionwale.com
Support Email = hello@inspectionwale.com
```

### Team Email Accounts
| Email | Purpose | Access |
|-------|---------|--------|
| no-reply@inspectionwale.com | System emails (SES) | Webmail only |
| hello@inspectionwale.com | Customer support | All team (shared) |
| prasad.devadiga@inspectionwale.com | Admin | Prasad only |
| roshan.kutty@inspectionwale.com | Operations | Roshan only |
| martin.doon@inspectionwale.com | Management | Martin only |

### Email Forwarding
- `hello@inspectionwale.com` → forwards to `prasad.devadiga333@gmail.com`
- Keep copy in Zoho for records

---

## 🔧 DNS Records Summary (Add to Your Domain Registrar)

### Verification (TXT)
```
Type: TXT
Name: @
Value: zoho-verification=zb12345678.zmverify.zoho.com
```

### Mail Routing (MX)
```
Type: MX, Priority: 10
Name: @
Value: mx.zoho.com

Type: MX, Priority: 20
Name: @
Value: mx2.zoho.com

Type: MX, Priority: 50
Name: @
Value: mx3.zoho.com
```

### SPF (TXT)
```
Type: TXT
Name: @
Value: v=spf1 include:zoho.com include:amazonses.com ~all
```

### DKIM - Zoho (TXT)
```
Type: TXT
Name: zoho._domainkey
Value: [Long string from Zoho]
```

### DKIM - AWS SES (3 CNAME records)
```
Type: CNAME
Name: abc123._domainkey
Value: abc123.dkim.amazonses.com

Type: CNAME
Name: def456._domainkey
Value: def456.dkim.amazonses.com

Type: CNAME
Name: ghi789._domainkey
Value: ghi789.dkim.amazonses.com
```

---

## 🆘 Troubleshooting

### Emails Not Receiving

**Check:**
1. MX records added correctly? (Wait 1-2 hours for DNS propagation)
2. Old MX records removed?
3. Check Zoho Mail webmail - emails might be there
4. Check spam folder

### Emails Going to Spam

**Fix:**
1. Add SPF record (v=spf1 include:zoho.com include:amazonses.com ~all)
2. Verify DKIM in Zoho admin panel
3. Add DKIM records to DNS
4. Request production access in AWS SES
5. Warm up your domain (send gradually increasing emails)

### Can't Send from AWS SES

**Check:**
1. Domain verified in SES? (Green checkmark)
2. Email address verified in SES?
3. DKIM records added to DNS?
4. SES_FROM environment variable updated in Lambda?
5. Lambda has SES permissions?
6. Still in SES sandbox? (Verify recipient emails)

### DNS Changes Not Working

**Wait:**
- DNS propagation takes 15 minutes to 48 hours
- Most changes: 30 minutes to 2 hours
- Check propagation: https://dnschecker.org/

---

## 📞 Support Resources

### Zoho Mail Support
- Help Center: https://www.zoho.com/mail/help/
- Community: https://help.zoho.com/portal/en/community/zoho-mail
- Email: support@zohomail.com

### AWS SES Documentation
- SES Setup: https://docs.aws.amazon.com/ses/
- Domain Verification: https://docs.aws.amazon.com/ses/latest/dg/verify-domain-procedure.html

---

## ✅ Setup Checklist

**Zoho Mail Setup:**
- [ ] Signed up for Zoho Mail Free Plan
- [ ] Added inspectionwale.com domain
- [ ] Added TXT verification record to DNS
- [ ] Domain verified in Zoho
- [ ] Added 3 MX records to DNS
- [ ] Added SPF record to DNS
- [ ] Added DKIM record to DNS (Zoho)
- [ ] DKIM verified in Zoho
- [ ] Created 5 email accounts

**AWS SES Setup:**
- [ ] Verified inspectionwale.com domain in SES
- [ ] Added 3 DKIM CNAME records to DNS (AWS)
- [ ] Domain verified in SES (green checkmark)
- [ ] Verified no-reply@inspectionwale.com in SES
- [ ] Verified hello@inspectionwale.com in SES
- [ ] Verified prasad.devadiga@inspectionwale.com in SES

**Lambda Configuration (Do this during E2E deployment):**
- [ ] When creating listing-approval: Set SES_FROM to no-reply@inspectionwale.com
- [ ] When updating customer-listings: Set SES_FROM to hello@inspectionwale.com
- [ ] After Lambda deployment: Test email sending from website

**Email Forwarding:**
- [ ] Setup forwarding: hello@ → prasad.devadiga333@gmail.com
- [ ] Tested forwarding works
- [ ] Configured mobile apps (optional)

---

## 🎉 Congratulations!

You now have:
- ✅ Professional email addresses (@inspectionwale.com)
- ✅ FREE email hosting (Zoho Mail)
- ✅ AWS SES configured for automated emails
- ✅ Email forwarding to Gmail
- ✅ Mobile & webmail access
- ✅ 5 users with 5GB storage each
- ✅ $0/month cost!

**Your website will now send emails from `no-reply@inspectionwale.com` with full SPF/DKIM authentication!**

---

**Setup Date**: October 12, 2025  
**Provider**: Zoho Mail (Free Plan)  
**Monthly Cost**: $0  
**Users**: 5 (25GB total storage)  
**Status**: Production Ready  

🚀 **Professional email setup complete!**
