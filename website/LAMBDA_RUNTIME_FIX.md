# 🔧 URGENT: Fix Lambda Runtime Configuration

## ❌ Current Problem:
```
Runtime.ImportModuleError: Error: Cannot find module 'index'
Runtime Version: nodejs:22.v59
```

**Issue:** Lambda is configured for Node.js, but we have Python code!

---

## ✅ SOLUTION (5 minutes):

### Step 1: Open Lambda Console
Go to: https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions

### Step 2: Find Your Function
- Look for function with URL: `mfy5ajp4e5lggmqypfbco34dd40ugreq`
- Click on the function name

### Step 3: Change Runtime Settings

**A. Click "Configuration" tab (top menu)**

**B. Click "General configuration" in left sidebar**

**C. Click "Edit" button**

**D. Change these settings:**

| Setting | Current (WRONG) | Change To (CORRECT) |
|---------|----------------|---------------------|
| Runtime | Node.js 22.x ❌ | **Python 3.12** ✅ |
| Architecture | x86_64 or arm64 | Keep same (or x86_64) |
| Handler | index.handler ❌ | **lambda_function.lambda_handler** ✅ |
| Timeout | 3 seconds ❌ | **30 seconds** ✅ (for PDF generation) |
| Memory | 128 MB ❌ | **512 MB** ✅ (for ReportLab) |

**E. Click "Save"**

### Step 4: Upload Python Code

**Now that runtime is Python:**

1. Click "Code" tab
2. Click "Upload from" → ".zip file"
3. Select file: `lambda-final-design.zip`
   - Location: `C:\Users\Administrator\Documents\Inpectionwale\website\amplify\functions\generate-report\src\lambda-final-design.zip`
   - Size: 6.39 MB
4. Click "Save"
5. Wait for "Successfully updated" message (30-60 seconds)

### Step 5: Test

1. Go to: https://www.inspectionwale.com/inspector-form.html
2. Fill form with test data (see QUICK_TEST_GUIDE.md)
3. Upload 3 photos
4. Click "Generate Report"
5. Should work now! ✅

---

## 🔍 How to Find Your Function:

### Option A: Search by URL
1. Go to Lambda Console
2. Search for: `mfy5ajp4e5lggmqypfbco34dd40ugreq`
3. Click the matching function

### Option B: Filter by Runtime
1. Go to Lambda Console
2. Look for functions with "Node.js 22" runtime
3. Find one related to "generate" or "report" or "inspection"
4. Click it

### Option C: Check All Functions
1. Go to Lambda Console
2. List all functions
3. Look for names like:
   - `inspectionwale-generate-report`
   - `generate-report`
   - `pdf-generator`
   - `inspection-report`

---

## 📸 Visual Guide:

### What to Look For in Console:

```
Function overview
┌─────────────────────────────────────────────┐
│ Function name: inspectionwale-generate-...   │
│ Runtime: Node.js 22.x  ← CHANGE THIS TO PYTHON
│ Handler: index.handler  ← CHANGE THIS TOO    │
│ Function URL: https://mfy5ajp4e5l...         │
└─────────────────────────────────────────────┘
```

### After Fix Should Show:

```
Function overview
┌─────────────────────────────────────────────┐
│ Function name: inspectionwale-generate-...   │
│ Runtime: Python 3.12  ✅                     │
│ Handler: lambda_function.lambda_handler ✅   │
│ Function URL: https://mfy5ajp4e5l...         │
└─────────────────────────────────────────────┘
```

---

## ⚠️ Important Notes:

### Runtime Must Be Python!
- **Python 3.12** (recommended) or
- **Python 3.11** (also works)
- **NOT Node.js** ❌

### Handler Must Match Python!
- Format: `filename.function_name`
- Our file: `lambda_function.py`
- Our function: `lambda_handler`
- **Handler value: `lambda_function.lambda_handler`**

### Increase Memory & Timeout!
- PDF generation needs more resources
- **Memory: 512 MB** (minimum)
- **Timeout: 30 seconds** (PDF can take 10-15 seconds)

---

## 🐛 Why This Happened:

When the Lambda was first created, it was probably:
1. Created from AWS Console as Node.js template
2. Or created by Amplify with wrong runtime
3. Code was never uploaded before
4. Default runtime was Node.js

Now we need to:
1. Fix runtime to Python
2. Upload our Python code
3. Configure handler correctly

---

## ✅ Success Checklist:

After making changes, verify:

- [ ] Runtime shows: **Python 3.12** (or 3.11)
- [ ] Handler shows: **lambda_function.lambda_handler**
- [ ] Timeout: **30 seconds**
- [ ] Memory: **512 MB** (or higher)
- [ ] Code uploaded: **lambda-final-design.zip** (6.39 MB)
- [ ] Last modified: **Today's date/time**
- [ ] Test request: **Returns PDF successfully** ✅

---

## 🔧 If Upload Fails:

### Error: "Code size too large"
- Our ZIP is 6.39 MB (well under 50 MB limit)
- Should NOT happen
- If it does: Try uploading via S3 instead

### Error: "Invalid handler"
- Double-check handler spelling
- Must be exactly: `lambda_function.lambda_handler`
- Case-sensitive!

### Error: "Permission denied"
- You need Lambda permissions in AWS
- Ask account admin for: `lambda:UpdateFunctionCode` permission

---

## 📞 Next Steps:

1. **Fix runtime** → Python 3.12 ✅
2. **Fix handler** → lambda_function.lambda_handler ✅
3. **Increase timeout** → 30 seconds ✅
4. **Increase memory** → 512 MB ✅
5. **Upload ZIP** → lambda-final-design.zip ✅
6. **Test form** → Should work! 🎉

---

## 🎯 Expected Result:

### After Fix:
✅ Form submits successfully  
✅ No more 502 errors  
✅ PDF generates with NEW design  
✅ Auto-downloads correctly  
✅ CloudWatch shows Python logs (not Node.js errors)

### You'll See in CloudWatch:
```
START RequestId: abc123...
[INFO] 2025-10-11 Processing inspection request
[INFO] 2025-10-11 Generating PDF with vibrant design
[INFO] 2025-10-11 PDF generated successfully
END RequestId: abc123...
```

**NOT:**
```
Runtime.ImportModuleError: Cannot find module 'index' ❌
```

---

**Current Status:** 🔴 Lambda runtime misconfigured

**Fix Time:** ~5 minutes

**Then:** Ready to test! 🚀
