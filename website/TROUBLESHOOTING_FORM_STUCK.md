# 🔧 Troubleshooting: Form Stuck at 0%

## 🚨 Problem
- Inspector form stuck at 0% loading
- No CloudWatch logs appearing
- Report generation not starting

## 🔍 Root Causes

### 1. **Amplify Build Still In Progress**
**Most Likely Cause:** AWS Amplify takes 5-10 minutes to build and deploy.

**Check:**
```
Go to: https://console.aws.amazon.com/amplify/
Status: Should show "Provision → Build → Deploy → Verify"
```

**Solution:** Wait for build to complete (green checkmark)

---

### 2. **CORS Preflight Request Failing**
**Issue:** Browser sends OPTIONS request before POST, Lambda wasn't handling it.

**Fix Applied:** Added OPTIONS handler in lambda_function.py (commit 9fe2203)
```python
# Handle OPTIONS request for CORS preflight
if event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    }
```

**Now Deploying:** Pushed at commit 9fe2203

---

### 3. **Lambda Not Receiving Requests**
**Possible Causes:**
- Lambda URL changed after deployment
- Lambda not deployed yet
- Network/connectivity issue

**Check:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Submit form
4. Look for request to lambda-url.us-east-1.on.aws
5. Check:
   - Status code (should be 200 or 500, NOT 0)
   - Response (should have JSON)
   - CORS errors in Console tab

---

### 4. **Large Photo Upload Timeout**
**Issue:** Photos too large, request timing out before Lambda responds.

**Check:**
- How many photos are you uploading?
- What's the total size?
- Mobile connection speed?

**Solutions:**
- Try with 3 photos first (RC, Chassis, Odometer)
- Use smaller images (~1-2MB each)
- Ensure stable WiFi connection

---

## 🛠️ Debugging Steps

### Step 1: Check Browser Console
```javascript
1. Open inspector form on phone
2. Press F12 or open DevTools
3. Go to Console tab
4. Look for errors (red text)
5. Screenshot any errors
```

**Common Errors:**
- `CORS policy` → CORS issue (fix deployed)
- `net::ERR_CONNECTION_REFUSED` → Lambda not reachable
- `Failed to fetch` → Network or timeout issue

---

### Step 2: Check Network Tab
```
1. Open DevTools → Network tab
2. Submit form
3. Look for request to:
   https://mfy5ajp4e5lggmqypfbco34dd40ugreq.lambda-url.us-east-1.on.aws/
4. Click on request
5. Check:
   - Status: Should be 200 (success) or 500 (error)
   - Headers: Check CORS headers
   - Preview/Response: See JSON response
```

**What to Look For:**
- **Status 0:** Request not sent (CORS/network issue)
- **Status 200:** Success (should see PDF URL in response)
- **Status 500:** Lambda error (check response message)
- **Status 403/404:** Lambda URL wrong or permissions issue

---

### Step 3: Check AWS Amplify Build
```
1. Go to: https://console.aws.amazon.com/amplify/
2. Find app: inspectionwale
3. Click "Build history"
4. Latest build should show:
   ✓ Provision
   ✓ Build
   ✓ Deploy
   ✓ Verify
```

**If Still Building:**
- Wait 5-10 minutes
- Don't test form yet
- Build progress shows: 10% → 50% → 90% → 100%

**If Build Failed:**
- Click on failed build
- Check error logs
- May need to fix code and redeploy

---

### Step 4: Check Lambda Function
```
1. Go to: https://console.aws.amazon.com/lambda/
2. Find function: generate-report
3. Check:
   - Last modified: Should be recent (within last hour)
   - Status: Active
   - Configuration → Function URL: Should exist
```

**If Lambda URL Changed:**
- Copy new URL from Lambda console
- Update inspector-form.html with new URL
- Commit and push

---

### Step 5: Test Lambda Directly (Optional)
```
Use AWS Lambda console "Test" feature:
1. Create test event
2. Use sample payload
3. Run test
4. Check logs immediately
```

---

## 🔄 Latest Fixes Applied

### Commit 9fe2203: CORS + Debugging
**What Changed:**
```python
1. Added OPTIONS handler for CORS preflight
2. Added debug logging:
   - Event keys
   - Request method
   - Full event on error
3. Added traceback to error response
```

**Now Deploying:** Amplify building now (5-10 min)

---

## ⏱️ Timeline

| Time | Action | Status |
|------|--------|--------|
| 15:30 | First deployment (84768ec) | ✅ Pushed |
| 15:35 | User tested on phone | ❌ Stuck at 0% |
| 15:40 | Added CORS fix (9fe2203) | ✅ Pushed |
| 15:45 | Amplify building... | 🟡 In Progress |
| 15:50 | Build should complete | ⏳ Waiting |

---

## ✅ What to Do Now

### Option A: Wait for New Build (Recommended)
1. **Wait 5-10 minutes** for commit 9fe2203 to deploy
2. **Clear browser cache** or use incognito mode
3. **Test again** with 3 photos only
4. **Check browser console** for any errors
5. **Report results**

### Option B: Debug While Waiting
1. **Open browser DevTools** (F12 on phone/desktop)
2. **Go to Network tab**
3. **Try submitting form**
4. **Screenshot any errors**
5. **Check what request is sent**

### Option C: Test on Desktop First
1. **Open form on desktop browser**
2. **Easier to debug** with full DevTools
3. **See exact error messages**
4. **Then test on phone** after it works

---

## 📱 Phone-Specific Issues

### Mobile Browser Limitations
- **Cache:** Clear browser cache/data
- **Connection:** Ensure stable WiFi (not mobile data)
- **Photos:** Mobile photos are HUGE (8-12MB each)
- **Memory:** Phone browser may run out of memory

### Solutions for Phone
1. **Use WiFi** not mobile data
2. **Upload 3 photos** initially, not all 46
3. **Close other apps** to free memory
4. **Use Chrome** not other browsers
5. **Try desktop browser** first to confirm working

---

## 🎯 Expected Behavior After Fix

### When Working Correctly:
```
1. Click "Generate Report"
2. Progress shows: 10% (uploading photos)
3. Progress shows: 70% (generating PDF)
4. Progress shows: 100% (complete)
5. Download link appears
6. CloudWatch logs show:
   - "📄 Starting PDF generation..."
   - "✅ Compressed: 8532KB → 876KB"
   - "✅ Parsed 15 fields, 46 files"
   - "✅ PDF uploaded: https://..."
```

### Current Behavior (Before Fix):
```
1. Click "Generate Report"
2. Progress stuck at: 0%
3. Spinner keeps spinning
4. No error message
5. No CloudWatch logs
```

---

## 📞 Next Steps

**Right Now (Immediate):**
1. ⏳ Wait for Amplify build to finish (9fe2203)
2. 🔍 Check browser console for errors
3. 📸 Screenshot any error messages

**After Build Completes (~5-10 min):**
1. ✅ Clear browser cache
2. 🧪 Test with 3 photos only
3. 🔍 Check CloudWatch logs appear
4. 📊 Verify PDF generates

**If Still Not Working:**
1. 📱 Share browser console screenshot
2. 🌐 Share Network tab screenshot
3. ☁️ Check CloudWatch logs together
4. 🔧 Debug Lambda function directly

---

## 🚨 Emergency Rollback

If nothing works after new build:
```powershell
cd "c:\Users\Administrator\Documents\Inpectionwale\website\amplify\functions\generate-report\src"
git revert HEAD
git push origin main
```

This will undo the CORS changes and go back to previous version.

---

**Status:** 🟡 CORS fix deploying, ETA 5-10 minutes

**Next Action:** Wait for build, then test on phone with 3 photos

**Expected Result:** Form should work, CloudWatch logs should appear
