# AWS Updates Pending - Do NOT Push to Main Until Complete

## ⚠️ CRITICAL: Backend Updates Required Before Production

All frontend changes for new photo fields and vehicle features are **LOCAL ONLY** and working. However, the AWS Lambda function MUST be updated before these changes go live, otherwise form submissions will fail.

## Current Status

### ✅ Frontend Complete (Local Changes Only)
- Added 2 new vehicle features: Sunroof, Service Records
- Added 15+ new photo fields (Engine, Battery, Firewall, Aprons, Tyres, Seats, Dashboard, CNG Plate)
- Updated JavaScript to handle 18 required photos (was 6)
- Updated marketplace to display 8 features (was 6)
- All local changes NOT pushed to main

### ⏳ Backend Updates Pending
The Lambda function `customerListings` needs updates to accept and store the new fields.

## What Needs to Be Updated

### 1. Lambda Function: customerListings
**Location:** AWS Lambda Console → customerListings function

**Changes Needed:**

#### A. Update Car Object Schema
Add two new boolean fields:
```javascript
// In the Lambda function where car object is processed
const car = {
    // ... existing fields ...
    sunroof: event.car.sunroof || false,              // NEW
    serviceRecords: event.car.serviceRecords || false  // NEW
};
```

#### B. Update Photo Slot Validation
Change from 6 required photos to 18:

**OLD (6 required):**
```javascript
const REQUIRED_PHOTO_SLOTS = [
    'exteriorFront', 'exteriorBack', 'exteriorLeft', 'exteriorRight',
    'interiorSeat', 'interiorCluster'
];
```

**NEW (18 required):**
```javascript
const REQUIRED_PHOTO_SLOTS = [
    'exteriorFront', 'exteriorBack', 'exteriorLeft', 'exteriorRight',
    'engine', 'battery', 'firewall', 'rhsApron', 'lhsApron',
    'tyreLhsFront', 'tyreLhsBack', 'tyreRhsFront', 'tyreRhsBack', 'tyreSpare',
    'seatFrontView', 'seatRearView', 'dashboard', 'interiorCluster'
];
```

**Note:** Remove `interiorSeat` - replaced by `seatFrontView` and `seatRearView`

**Optional slots (no validation needed):**
- `rcDocument` (already exists)
- `cngPlate` (new)

#### C. Update DynamoDB PutItem
Add new fields to the DynamoDB item:

```javascript
// In the DynamoDB params object
const params = {
    TableName: 'CarListings',
    Item: {
        // ... existing fields ...
        sunroof: { BOOL: car.sunroof },              // NEW
        serviceRecords: { BOOL: car.serviceRecords } // NEW
        // ... rest of fields ...
    }
};
```

### 2. Testing Required After Update

#### Test Submission:
1. Submit a test listing with all 18 required photos
2. Include both new features: Sunroof ✓, Service Records ✓
3. Verify Lambda logs show no errors
4. Check S3 bucket: all 18+ photos uploaded
5. Check DynamoDB: item has sunroof and serviceRecords fields
6. View listing in marketplace: 8 features display correctly

#### Validation Tests:
- Try submitting with only 6 photos → should fail validation
- Try submitting with 17 photos → should fail validation
- Submit with all 18 photos → should succeed
- Optional photos (RC, CNG) should work whether included or not

## Implementation Steps

### Step 1: Access Lambda Function
1. Go to AWS Console → Lambda
2. Find function: `customerListings`
3. Click "Code" tab

### Step 2: Update Code
1. Find where car object is built from event.car
2. Add sunroof and serviceRecords fields
3. Find REQUIRED_PHOTO_SLOTS array
4. Update to include all 18 slots
5. Find DynamoDB PutItem params
6. Add new fields to Item object

### Step 3: Deploy
1. Click "Deploy" button in Lambda console
2. Wait for deployment to complete
3. Check "Monitor" tab for any immediate errors

### Step 4: Test End-to-End
1. Submit test listing from website
2. Monitor CloudWatch logs
3. Verify S3 uploads
4. Verify DynamoDB storage
5. Check marketplace display

## Current Frontend State

### Form Fields (index.html)
```
Vehicle Features (8 total):
- Transmission Type (select)
- Airbags (select)
- Cruise Control (checkbox)
- Parking Assistant (checkbox)
- Audio System Working (checkbox)
- ABS (checkbox)
- Sunroof (checkbox) ← NEW
- Service Records (checkbox) ← NEW

Photo Fields (20 total):
Required (18):
  Exterior: Front, Back, Left, Right (4)
  Engine: Engine, Battery, Firewall (3)
  Aprons: RHS, LHS (2)
  Tyres: LHS Front, LHS Back, RHS Front, RHS Back, Spare (5)
  Interior: Front Seat, Rear Seat, Dashboard, Cluster (4)
  
Optional (2):
  RC Document
  CNG Plate ← NEW
```

### JavaScript (js/main.js)
- REQUIRED_PHOTO_SLOTS: 18 slots
- buildListingPayload(): collects sunroof and serviceRecords
- Photo handling: works with any slot name (generic)

### Marketplace Display (car-marketplace/index.html)
- Features array: 8 items
- Shows Sunroof and Service Records with icons

## Why This Order Matters

### Current Flow:
1. User fills form with new fields
2. Frontend sends data to Lambda
3. ❌ Lambda doesn't recognize sunroof/serviceRecords → may drop them
4. ❌ Lambda validates only 6 photos required → user uploaded 18, confusion
5. ❌ DynamoDB doesn't store new fields
6. ❌ Marketplace can't display new features (no data)

### After Lambda Update:
1. User fills form with new fields
2. Frontend sends data to Lambda
3. ✅ Lambda accepts sunroof/serviceRecords
4. ✅ Lambda validates 18 photos correctly
5. ✅ DynamoDB stores all new fields
6. ✅ Marketplace displays all 8 features with data

## Risk Assessment

### If Pushed Without Lambda Update:
- **High Risk:** Form submissions will fail or data will be lost
- **User Impact:** Sellers can't list cars properly
- **Data Loss:** New fields dropped silently
- **Validation Errors:** Photo count mismatch

### Mitigation:
- Keep all changes LOCAL until Lambda updated
- Test thoroughly with all 18 photos before going live
- Monitor CloudWatch logs after deployment
- Have rollback plan ready

## Additional Notes

### What Doesn't Need Updates:
- ✅ S3 bucket (accepts any key/slot name)
- ✅ API Gateway (passes data through)
- ✅ IAM policies (no new permissions needed)
- ✅ DynamoDB schema (flexible, accepts new fields)

### What's Already Working:
- ✅ Image compression (client-side)
- ✅ Presigned URL generation (generic)
- ✅ Photo upload to S3 (uses data-slot attribute)
- ✅ Form validation (client-side)

### Cost Impact:
- S3 storage: ~3x increase per listing (18 photos vs 6)
- Lambda duration: +10-20ms (negligible)
- DynamoDB: 2 more boolean fields (negligible)
- **Monthly cost increase: ~$0.03-0.06 per 100 listings**

## Timeline

### Before Next Push to Main:
1. ⏳ Make any additional frontend design changes
2. ⏳ Update Lambda function with new schema
3. ⏳ Test thoroughly with test listings
4. ⏳ Verify S3, DynamoDB, marketplace display
5. ⏳ Monitor logs for errors
6. ✅ Push all changes to main together

### Estimated Time for Lambda Update:
- Code changes: 10-15 minutes
- Testing: 20-30 minutes
- Monitoring: 1 hour after deployment
- **Total: ~2 hours including verification**

## Reference Documents

- **LAMBDA_UPDATE_NEW_PHOTOS_FEATURES.md** - Detailed technical guide
- **PHOTO_FEATURES_EXPANSION_COMPLETE.md** - Summary of all changes
- Lambda function: `customerListings`
- DynamoDB table: `CarListings`
- S3 bucket: `inspectionwale-car-listings`

## Quick Checklist Before Going Live

- [ ] All frontend design changes complete
- [ ] Lambda function updated with new schema
- [ ] Test listing submitted successfully
- [ ] All 18 photos uploaded to S3
- [ ] DynamoDB item has sunroof and serviceRecords
- [ ] Marketplace displays 8 features correctly
- [ ] No errors in CloudWatch logs
- [ ] Photo carousel shows all images
- [ ] Form validation works as expected
- [ ] Optional photos (RC, CNG) work correctly
- [ ] Ready to push to main

---

## ChatGPT Prompt for Lambda Updates

Use this prompt when ready to update the Lambda function:

```
I need to update my AWS Lambda function "customerListings" to handle new fields from my car listing form.

CURRENT LAMBDA SETUP:
- Function processes car listing submissions
- Validates required photo uploads (currently 6 photos)
- Stores data in DynamoDB table "CarListings"
- Generates presigned URLs for S3 uploads to bucket "inspectionwale-car-listings"

CHANGES NEEDED:

1. ADD TWO NEW BOOLEAN FIELDS to car object:
   - sunroof (boolean)
   - serviceRecords (boolean)

2. UPDATE PHOTO VALIDATION from 6 to 18 required photos:
   
   OLD required slots (6):
   ['exteriorFront', 'exteriorBack', 'exteriorLeft', 'exteriorRight', 'interiorSeat', 'interiorCluster']
   
   NEW required slots (18):
   ['exteriorFront', 'exteriorBack', 'exteriorLeft', 'exteriorRight',
    'engine', 'battery', 'firewall', 'rhsApron', 'lhsApron',
    'tyreLhsFront', 'tyreLhsBack', 'tyreRhsFront', 'tyreRhsBack', 'tyreSpare',
    'seatFrontView', 'seatRearView', 'dashboard', 'interiorCluster']
   
   REMOVE: 'interiorSeat' (replaced by 'seatFrontView' and 'seatRearView')
   
   Optional slots (no validation): ['rcDocument', 'cngPlate']

3. UPDATE DYNAMODB PUTITEM to include:
   - sunroof: { BOOL: car.sunroof }
   - serviceRecords: { BOOL: car.serviceRecords }

CONTEXT:
The Lambda function receives event.car object with all car details and event.photos array with photo metadata.
Each photo has: slot (string), key (string), contentType (string), originalName (string).

Please provide:
1. The exact code changes needed for the Lambda function
2. Where to make these changes in the typical Lambda structure
3. Any validation logic updates
4. Updated DynamoDB PutItem params

Make sure the function continues to work with existing listings that only have 6 photos.
```

---

**Last Updated:** December 7, 2025  
**Status:** Frontend complete (local), Backend updates pending  
**Next Action:** Complete remaining design changes, then update Lambda before pushing to main
