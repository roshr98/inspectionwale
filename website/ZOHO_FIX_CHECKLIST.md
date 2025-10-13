# 🔧 Zoho Mailbox Fix - Step by Step

## Current Problem
- Email to hello@inspectionwale.com bounces
- Error: "remote server is misconfigured"
- DNS records are correct in Route 53
- Domain verified in Zoho

---

## 🎯 Diagnostic Steps

### STEP 1: Verify Mailbox Exists in Zoho

**Open Zoho Mail Admin:**
1. Go to: https://mailadmin.zoho.com/
2. Sign in with your Zoho account (the one you used to sign up)

**Check Users:**
3. Click **"Users"** in left sidebar
4. Look for these users:
   - `hello@inspectionwale.com`
   - `no-reply@inspectionwale.com`

**🚨 CRITICAL QUESTION:**
- Do you see these emails listed?
- OR do you only see: `inspectionwale@zoho.in`?

---

### STEP 2: Check Domain Configuration

**In Zoho Admin:**
1. Click **"Domains"** in left sidebar
2. You should see: `inspectionwale.com`
3. Click on it

**Check these statuses:**
```
Domain Verification: ✅ Verified (or ❌ Pending)
MX Records: ✅ Configured (or ❌ Not Configured)
SPF Record: ✅ Configured (or ⚠️ Warning)
DKIM: ✅ Configured (or ❌ Not Configured)
```

**If MX Records shows "Not Configured":**
- Zoho hasn't detected your MX records yet
- Click **"Verify MX Records"** button
- Wait 5 minutes and check again

---

### STEP 3: Test Mailbox Login

**Try logging in directly:**
1. Open new browser tab: https://mail.zoho.com/
2. Enter: `hello@inspectionwale.com`
3. Enter the password you set when creating mailbox
4. Click Sign In

**Possible Results:**
- ✅ **Login successful** → Mailbox exists! Go to Step 4
- ❌ **"Account doesn't exist"** → Mailbox NOT created! Go to Step 5
- ❌ **"Invalid password"** → Mailbox exists but wrong password
- ❌ **"Account not activated"** → Check email for activation link

---

### STEP 4: If Login Works - Check Inbox

**If you logged in successfully:**
1. Check inbox for any test emails
2. Click **"Compose"**
3. Send test email to: `prasad.devadiga333@gmail.com`
4. Subject: "Test from hello@inspectionwale.com"
5. Check Gmail - did it arrive?

**If Gmail receives email:**
✅ **Sending works!** Now test receiving:
- From Gmail, reply to that email
- Check Zoho inbox - should appear in 1-2 minutes

---

### STEP 5: If Mailbox Doesn't Exist - Create It

**This is the most common issue!**

1. In Zoho Admin, click **"Users"** → **"Add User"**
2. Fill in form:
   ```
   Email Address: hello
   Domain: inspectionwale.com (MUST select from dropdown)
   
   First Name: InspectionWale
   Last Name: Support
   
   Password: [CREATE STRONG PASSWORD]
   Confirm Password: [SAME PASSWORD]
   
   ☐ Send welcome email
   ☑ Add user immediately (check this!)
   ```
3. Click **"Add User"**
4. Wait for success message

**Repeat for no-reply:**
```
Email Address: no-reply
Domain: inspectionwale.com
First Name: InspectionWale
Last Name: System
Password: [STRONG PASSWORD]
☑ Add user immediately
```

---

### STEP 6: Verify MX Records Detection

Sometimes Zoho takes time to detect MX records.

**Run this PowerShell command:**
```powershell
nslookup -type=MX inspectionwale.com 8.8.8.8
```

**Expected output:**
```
inspectionwale.com  mail exchanger = 10 mx.zoho.com
inspectionwale.com  mail exchanger = 20 mx2.zoho.com
inspectionwale.com  mail exchanger = 50 mx3.zoho.com
```

**If you see Zoho mail servers:**
✅ DNS is correct!

**In Zoho Admin:**
1. Go to Domains → inspectionwale.com
2. Click **"Verify MX Records"** button
3. Wait 30 seconds
4. Refresh page
5. Should show "MX Records: Configured" ✅

---

### STEP 7: Check Email Routing (Advanced)

**In Zoho Admin:**
1. Go to **"Email Accounts"** (or "Mail Configuration")
2. Check if `hello@inspectionwale.com` is listed
3. Check **Status**: Should be "Active"
4. Check **Mailbox Quota**: Should show available space

**If status is "Inactive" or "Suspended":**
- Click on the email
- Click **"Activate"** or **"Reactivate"**
- Check email for activation link

---

## 🔍 Common Issues & Solutions

### Issue 1: "Can't find Users section"
**Solution:** You might be in wrong panel
- Make sure you're at: https://mailadmin.zoho.com/ (not mail.zoho.com)
- This is the ADMIN panel, not webmail

### Issue 2: "Domain dropdown is empty"
**Solution:** Domain not added yet
- Go to Domains → Add Domain
- Enter: inspectionwale.com
- Follow verification steps

### Issue 3: "Free plan - user limit reached"
**Solution:** Delete unused accounts
- Free plan = max 5 users
- Delete any test accounts first
- Or create only hello@ and no-reply@ for now (2 users)

### Issue 4: "MX verification keeps failing"
**Solution:** Wait for DNS propagation
- DNS can take 15-30 minutes
- Check with: `nslookup -type=MX inspectionwale.com`
- If records show up, wait 10 more minutes
- Click "Verify MX" again

### Issue 5: "Can login but can't receive emails"
**Solution:** Check spam/forwarding
- In Zoho webmail, check Spam folder
- Check Email Forwarding settings (might be forwarding elsewhere)
- In Settings → Mail Accounts → Check if "Reject incoming mail" is OFF

---

## ✅ Final Verification

Once you complete the steps above:

**Test Sending:**
1. Login to hello@inspectionwale.com in Zoho webmail
2. Send email to prasad.devadiga333@gmail.com
3. Should arrive in 1-2 minutes ✅

**Test Receiving:**
1. From Gmail, send email to hello@inspectionwale.com
2. Check Zoho webmail inbox
3. Should appear in 1-2 minutes ✅

**Both work?** 🎉 **Zoho is fully configured!**

---

## 🚀 After Zoho Works

Update your Lambda environment variables:
```
customer-listings Lambda:
SES_FROM=hello@inspectionwale.com

listing-approval Lambda:
SES_FROM=no-reply@inspectionwale.com
```

Then test the full workflow (Step 5 of E2E guide)!

---

**Ready to start?** Tell me what you see in Step 1 (Zoho Admin → Users section)!
