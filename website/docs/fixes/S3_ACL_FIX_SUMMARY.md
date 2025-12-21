# 🔧 S3 ACL Fix Summary

## Problem Identified ✅

Your S3 bucket `inspectionwale-car-listings` has:
```
ObjectOwnership: BucketOwnerEnforced
```

This means **ACLs are disabled**. But the Lambda code tries to upload with:
```javascript
ACL: 'public-read'  // ❌ This causes 400 Bad Request!
```

## Fix Applied ✅

Updated `amplify/functions/customer-listings/src/index.js`:

**Before:**
```javascript
const putCommand = new PutObjectCommand({
  Bucket: LISTINGS_BUCKET,
  Key: key,
  ContentType: contentType,
  ACL: 'public-read'  // ❌ Fails with BucketOwnerEnforced
})
```

**After:**
```javascript
const putCommand = new PutObjectCommand({
  Bucket: LISTINGS_BUCKET,
  Key: key,
  ContentType: contentType
  // ACL removed - bucket has BucketOwnerEnforced ownership
})
```

## Next Steps

### Option 1: Manual Update (Easiest)

1. **Open AWS Lambda Console**: https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/customerListings

2. **Upload New Code**:
   - Click on "Code" tab
   - Click "Upload from" → ".zip file"
   - Navigate to: `C:\Users\Administrator\Documents\Inpectionwale\website\amplify\functions\customer-listings\`
   - We need to create the zip first!

### Option 2: Create Zip Manually

1. Open File Explorer
2. Navigate to: `C:\Users\Administrator\Documents\Inpectionwale\website\amplify\functions\customer-listings\src`
3. Select ALL files (Ctrl+A)
4. Right-click → "Send to" → "Compressed (zipped) folder"
5. Name it: `function.zip`
6. Move it to parent folder (customer-listings)
7. Upload via Lambda Console

### Option 3: AWS CLI Update

If amplifyuser has Lambda write permissions:
```powershell
cd C:\Users\Administrator\Documents\Inpectionwale\website\amplify\functions\customer-listings
# First create the zip manually (Option 2)
aws lambda update-function-code --function-name customerListings --zip-file fileb://function.zip --region us-east-1
```

## After Update

1. Wait 30 seconds for Lambda to update
2. Go to your website: https://inspectionwale.com
3. Try submitting a car listing again
4. Photo upload should work! ✅

## Why This Fixes It

- S3 bucket with `BucketOwnerEnforced` doesn't allow ACLs
- Public access is controlled by bucket policy instead
- Removing the ACL parameter allows the upload to succeed
- Objects are still publicly accessible via the bucket policy

---

**Ready to deploy!** Choose Option 1 or 2 above to update the Lambda function.
