# Lambda Function Update Guide - New Photos & Features

## Overview
This document outlines the updates needed for the Lambda function to handle the new photo fields and vehicle features added to the car listing form.

## Changes Made to Frontend

### New Vehicle Features (2 fields)
1. **Sunroof** - Boolean checkbox field
2. **Service Records** - Boolean checkbox field

### New Photo Fields (15 fields)
Replaced `interiorSeat` with two separate fields and added 13 new photo slots:

**Engine Compartment:**
- `engine` - Engine bay view (Required)
- `battery` - Battery and terminals (Required)
- `firewall` - Engine bay firewall (Required)

**Apron Section:**
- `rhsApron` - Right side apron (Required)
- `lhsApron` - Left side apron (Required)

**Tyres (5 photos):**
- `tyreLhsFront` - Left front tyre tread (Required)
- `tyreLhsBack` - Left rear tyre tread (Required)
- `tyreRhsFront` - Right front tyre tread (Required)
- `tyreRhsBack` - Right rear tyre tread (Required)
- `tyreSpare` - Spare tyre condition (Required)

**Interior (3 photos):**
- `seatFrontView` - Front seat area view (Required) - *Replaces interiorSeat*
- `seatRearView` - Rear seat area view (Required) - *New field*
- `dashboard` - Dashboard and controls (Required)

**Documents:**
- `cngPlate` - CNG plate if fitted (Optional)
- `interiorCluster` - Instrument cluster (Required) - *Existing, kept*
- `rcDocument` - RC document (Optional) - *Existing, kept*

### Total Photo Requirements
- **Required photos:** 18 (up from 6)
- **Optional photos:** 2 (rcDocument, cngPlate)
- **Total photo slots:** 20

## Lambda Function Updates Required

### 1. Update Car Object Schema

The Lambda function needs to accept two new boolean fields in the `car` object:

```javascript
// In the car object
sunroof: boolean,           // New field
serviceRecords: boolean     // New field
```

### 2. Update Photos Array Handling

The Lambda function already accepts a `photos` array with arbitrary slot names, so the new photo slots should work automatically. However, ensure validation accepts these new slot names:

**New photo slots to accept:**
- engine
- battery
- firewall
- rhsApron
- lhsApron
- tyreLhsFront
- tyreLhsBack
- tyreRhsFront
- tyreRhsBack
- tyreSpare
- seatFrontView
- seatRearView
- dashboard
- cngPlate

**Remove from validation:**
- interiorSeat (replaced by seatFrontView and seatRearView)

### 3. DynamoDB Updates

Update the DynamoDB PutItem operation to store the new fields:

```javascript
// Add to car object in DynamoDB item
sunroof: { BOOL: car.sunroof || false },
serviceRecords: { BOOL: car.serviceRecords || false }
```

The photos array structure remains the same - just ensure all new photo slots are stored properly.

### 4. Validation Updates

Update photo validation to require 18 photos instead of 6:

```javascript
// Old required slots (6)
const oldRequiredSlots = [
    'exteriorFront', 'exteriorBack', 'exteriorLeft', 'exteriorRight',
    'interiorSeat', 'interiorCluster'
];

// New required slots (18)
const newRequiredSlots = [
    'exteriorFront', 'exteriorBack', 'exteriorLeft', 'exteriorRight',
    'engine', 'battery', 'firewall', 'rhsApron', 'lhsApron',
    'tyreLhsFront', 'tyreLhsBack', 'tyreRhsFront', 'tyreRhsBack', 'tyreSpare',
    'seatFrontView', 'seatRearView', 'dashboard', 'interiorCluster'
];

// Optional slots (2)
const optionalSlots = ['rcDocument', 'cngPlate'];
```

## Testing Checklist

### Frontend Testing
- [ ] All 18 required photo fields accept images
- [ ] Photo preview and clear buttons work for all new fields
- [ ] Sunroof and Service Records checkboxes appear in form
- [ ] Form validation requires all 18 photos before submission
- [ ] Optional photos (RC Document, CNG Plate) work without being required

### Backend Testing
- [ ] Lambda function accepts new sunroof field
- [ ] Lambda function accepts new serviceRecords field
- [ ] All 18 required photo slots are validated
- [ ] Optional photo slots (rcDocument, cngPlate) work
- [ ] DynamoDB stores all new fields correctly
- [ ] S3 stores all new photos with correct keys

### Display Testing
- [ ] Marketplace modal shows 8 features instead of 6
- [ ] Sunroof feature displays correctly (Available/Not Available)
- [ ] Service Records feature displays correctly (Available/Not Available)
- [ ] All new photos appear in carousel
- [ ] Photo gallery includes all uploaded images

## Implementation Steps

1. **Update Lambda Function Code:**
   - Add sunroof and serviceRecords to car object schema
   - Update photo slot validation array
   - Update DynamoDB PutItem to include new fields

2. **Deploy Lambda Function:**
   ```bash
   # Update function code via AWS Console or CLI
   aws lambda update-function-code \
     --function-name customerListings \
     --zip-file fileb://function.zip
   ```

3. **Test End-to-End:**
   - Submit a test listing with all new fields
   - Verify S3 uploads all 18+ photos
   - Verify DynamoDB stores all data
   - Check marketplace display shows all features

4. **Monitor:**
   - Check CloudWatch logs for any errors
   - Verify photo upload performance with 18+ images
   - Monitor S3 bucket size increase

## Notes

- The frontend is already updated and ready
- All changes are local and not pushed to main
- The S3 upload logic doesn't need changes (uses data-slot attributes)
- The presigned URL generation should handle all new slots automatically
- Focus Lambda updates on validation and DynamoDB storage

## Cost Considerations

- Each listing now uploads 18-20 photos (up from 6-7)
- S3 storage costs will increase ~2.5-3x per listing
- Lambda execution time may increase slightly due to more photos
- Consider implementing image compression to keep costs down (already in place - JPEG quality 0.85, max 1920x1440, 2MB limit)

## Related Files

- `index.html` - List car form (lines 1910-2060)
- `js/main.js` - Form handling (lines 107-115, 839-870)
- `car-marketplace/index.html` - Marketplace display (lines 2420-2440)
- AWS Lambda: `customerListings` function
- DynamoDB: `CarListings` table
- S3: `inspectionwale-car-listings` bucket
