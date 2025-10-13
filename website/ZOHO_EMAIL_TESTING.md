# 🧪 Zoho Email Testing Checklist

## Current Status (October 13, 2025)

### DNS Records Verified ✅
```
MX Records (from Google DNS 8.8.8.8):
✅ 10 mx.zoho.com
✅ 20 mx2.zoho.com
✅ 50 mx3.zoho.com

SPF Record (TXT):
✅ "v=spf1 include:zoho.com include:amazonses.com ~all"

Domain Verification (TXT):
✅ "zoho-verification=zb22769927.zmverify.zoho.in"
```

### Zoho Status
- ✅ Can login to hello@inspectionwale.com
- ⚠️ Zoho shows "MX not configured" (cache issue)
- ✅ SPF detected by Zoho
- ⚠️ DKIM not configured yet
- ❌ DMARC not configured (optional)

---

## 🧪 Email Testing Steps

### TEST 1: Send Email from Zoho → Gmail

**Steps:**
1. Login to: https://mail.zoho.com/
2. Username: `hello@inspectionwale.com`
3. Password: [your password]
4. Click **"Compose"** or **"New Message"**
5. Fill in:
   ```
   To: prasad.devadiga333@gmail.com
   Subject: Test from InspectionWale Zoho
   Body: This is a test email sent from hello@inspectionwale.com via Zoho Mail!
   ```
6. Click **"Send"**
7. Wait 1-2 minutes
8. Check Gmail inbox (and spam folder!)

**Expected Result:**
- ✅ Email arrives in Gmail
- ✅ Shows as from: hello@inspectionwale.com
- ⚠️ Might be in spam (SPF warning)

---

### TEST 2: Receive Email in Zoho from Gmail

**Steps:**
1. Open Gmail: prasad.devadiga333@gmail.com
2. Click **"Compose"**
3. Fill in:
   ```
   To: hello@inspectionwale.com
   Subject: Test TO InspectionWale
   Body: Testing if Zoho can receive emails!
   ```
4. Click **"Send"**
5. Wait 2-3 minutes
6. Go to Zoho webmail: https://mail.zoho.com/
7. Refresh inbox (click refresh icon or press F5)
8. Check inbox AND spam folder

**Expected Result:**
- ✅ Email appears in Zoho inbox
- ✅ Can read the message

---

### TEST 3: Send Email from SES → Zoho

**This tests if AWS SES can send TO your Zoho mailbox:**

1. Go to AWS SES Console: https://console.aws.amazon.com/ses/
2. Click **"Verified identities"**
3. Click on **"inspectionwale.com"**
4. Click **"Send test email"**
5. Fill in:
   ```
   Scenario: Custom
   From address: hello@inspectionwale.com
   To addresses: hello@inspectionwale.com
   Subject: SES to Zoho Test
   Body: Testing AWS SES sending to Zoho mailbox
   ```
6. Click **"Send test email"**
7. Check Zoho webmail
8. Should arrive in 1-2 minutes

**Expected Result:**
- ✅ Email appears in Zoho inbox
- ✅ Sender is hello@inspectionwale.com
- ✅ Proves SES → Zoho delivery works

---

## 📊 Test Results Template

**Copy this and fill in your results:**

```
TEST 1: Zoho → Gmail
Status: [PASS / FAIL / IN SPAM]
Time taken: [X minutes]
Notes: [any issues observed]

TEST 2: Gmail → Zoho
Status: [PASS / FAIL]
Time taken: [X minutes]
Location: [Inbox / Spam / Not received]
Notes: [any issues observed]

TEST 3: SES → Zoho (optional)
Status: [PASS / FAIL / SKIPPED]
Notes: [any issues observed]
```

---

## 🔧 If Tests Fail

### If TEST 1 Fails (Can't Send from Zoho)
**Possible causes:**
- Password incorrect
- Account not activated
- Zoho mail sending blocked

**Solutions:**
- Reset password in Zoho Admin
- Check for activation email
- Check Zoho status page: https://status.zoho.com/

---

### If TEST 2 Fails (Can't Receive in Zoho)
**Possible causes:**
- MX records not propagated yet
- Zoho mail routing not configured
- Email went to spam

**Solutions:**
1. Wait 15-30 minutes for MX propagation
2. Check spam folder in Zoho
3. In Zoho Admin, click "Verify MX Records" again
4. Check Gmail "Sent" folder for bounce message

---

### If Email Goes to Spam
**Cause:** DKIM not configured yet

**Solution:** Configure DKIM in Zoho
1. In Zoho Admin → Domains → inspectionwale.com
2. Click on "DKIM"
3. Enter selector: `zoho`
4. Copy the DKIM value
5. Add TXT record in Route 53:
   ```
   Name: zoho._domainkey.inspectionwale.com
   Type: TXT
   Value: [DKIM value from Zoho]
   ```

---

## ✅ Success Criteria

**Minimum for Lambda Testing:**
- [x] Can send email FROM hello@inspectionwale.com
- [x] Email arrives (even if in spam)
- [ ] Can receive email TO hello@inspectionwale.com
- [ ] Email arrives in inbox within 5 minutes

**For Production:**
- [ ] All emails arrive in inbox (not spam)
- [ ] DKIM configured
- [ ] SPF configured
- [ ] DMARC configured (optional)
- [ ] Email replies work

---

## 🚀 Next Steps After Testing

**If TEST 1 PASSES (can send):**
✅ Update Lambda env vars to use hello@inspectionwale.com
✅ Test Lambda workflow (Step 5 of E2E guide)

**If TEST 2 PASSES (can receive):**
✅ Zoho fully working!
✅ Can receive customer responses
✅ Professional email complete

**If either fails:**
⏰ Use prasad.devadiga333@gmail.com temporarily
⏰ Debug Zoho later
✅ Still proceed with Lambda testing

---

**Date:** October 13, 2025  
**Current Status:** DNS verified, Testing email flow  
**Blocker:** No - can use Gmail as fallback  
