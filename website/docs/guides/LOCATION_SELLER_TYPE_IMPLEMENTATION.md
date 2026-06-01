# Location and Seller Type Feature Implementation

## Overview
Added location and seller type fields to car listings throughout the marketplace.

## Changes Made

### 1. Frontend - Marketplace Display (`car-marketplace/index.html`)

#### Font Updates
- Updated car title, price, and subtitle fonts to match reference design
- Car title: 1rem, regular weight
- Car price: 1rem, bold
- Car subtitle: 0.85rem, grey color

#### Location Badge
- Added location badge on bottom-left of car images
- Shows city with map marker icon
- Dark semi-transparent background (rgba(0, 0, 0, 0.7))
- **Only displays when location data exists** (not shown for "Location NA")

#### Seller Type Badge
- Added seller type badge on top-right of car images
- Shows "Individual" (teal green) or "Dealer" (orange)
- Defaults to "Individual" for all listings

### 2. Frontend - List Your Car Form (`index.html`)

#### New Fields Added
1. **Location (City)** - Required field
   - Field ID: `carLocation`
   - Name: `location`
   - Placeholder: "e.g. Mumbai, Navi Mumbai"
   - Validation: Required

2. **Fuel Type** - Required field
   - Field ID: `carFuelType`
   - Name: `fuelType`
   - Options: Petrol, Diesel, CNG, Electric, Hybrid
   - Validation: Required

3. **Seller Type** - Required field (already added in previous update)
   - Field ID: `sellerType`
   - Name: `sellerType`
   - Options: Individual (default), Dealer
   - Validation: Required

### 3. Backend - Lambda Function (`amplify/functions/customer-listings/src/index.js`)

#### Updated Fields Captured
```javascript
const carLocation = normaliseString(car.location)
const carFuelType = normaliseString(car.fuelType)
const sellerType = normaliseString(seller.type) || 'Individual'
```

#### Validation Updated
- Added `carLocation` to required fields validation
- Location is now mandatory for new submissions

#### DynamoDB Item Structure
New fields added to the item:
```javascript
{
  // Top-level fields for easy querying
  sellerType: 'Individual',  // or 'Dealer'
  location: 'Mumbai',
  
  // Seller object
  seller: {
    name: '...',
    mobile: '...',
    email: '...',
    type: 'Individual'  // or 'Dealer'
  },
  
  // Car object
  car: {
    make: '...',
    model: '...',
    edition: '...',
    registrationYear: '...',
    kmsDriven: '...',
    expectedPrice: '...',
    location: 'Mumbai',  // Same as top-level
    city: 'Mumbai',      // Alias for backwards compatibility
    fuelType: 'Petrol'   // or Diesel, CNG, Electric, Hybrid
  }
}
```

### 4. Database Schema Updates

#### New Columns in CarListings Table
1. **sellerType** (String)
   - Values: "Individual" or "Dealer"
   - Default: "Individual"

2. **location** (String)
   - City name
   - Top-level field for easy filtering

3. **car.location** (String)
   - Same as top-level location
   - Stored in car object

4. **car.city** (String)
   - Alias for location
   - Backwards compatibility

5. **car.fuelType** (String)
   - Values: "Petrol", "Diesel", "CNG", "Electric", "Hybrid"

6. **seller.type** (String)
   - Same as top-level sellerType
   - Stored in seller object

## Deployment Instructions

### Step 1: Update Lambda Function

```bash
# Navigate to project root
cd /c/Users/ADMIN/Documents/inspectionwale/website

# Run deployment script
bash deploy-customer-listings.sh
```

Or manually:
```bash
cd amplify/functions/customer-listings/src
zip -r ../customer-listings.zip . -x "*.git*"
cd ..
aws lambda update-function-code \
    --function-name customerListings \
    --zip-file fileb://customer-listings.zip \
    --region us-east-1
```

### Step 2: Update Existing Records in DynamoDB

```bash
# Ensure AWS credentials are configured
aws configure
# OR
aws sso login

# Run the schema update script
python update-listing-schema.py
```

The script will:
- Add `sellerType: "Individual"` to all existing listings
- Add `location` from existing `car.city` data (if available)
- Add `car.fuelType` (empty by default)
- Update `seller.type` to match `sellerType`

### Step 3: Test the Changes

1. **Test Marketplace Display**
   - Visit: https://www.inspectionwale.com/car-marketplace/
   - Verify location badges appear on cars with location data
   - Verify seller type badges appear on all cars
   - Verify "Location NA" entries don't show location badge

2. **Test Form Submission**
   - Click "Sell Your Car"
   - Fill all required fields including:
     - Seller Type
     - Location
     - Fuel Type
   - Submit form
   - Verify submission succeeds

3. **Verify API Response**
   ```bash
   curl https://423cmvhw3g.execute-api.us-east-1.amazonaws.com/prod/customer-listings
   ```
   - Check that listings include `sellerType` and `location` fields

## Files Modified

1. `index.html` - Added location and fuel type fields to List Your Car form
2. `car-marketplace/index.html` - Updated fonts, added badges, fixed location display logic
3. `amplify/functions/customer-listings/src/index.js` - Updated Lambda to handle new fields

## Files Created

1. `update-listing-schema.py` - Script to update existing DynamoDB records
2. `deploy-customer-listings.sh` - Deployment script for Lambda function
3. `LOCATION_SELLER_TYPE_IMPLEMENTATION.md` - This documentation file

## Testing Checklist

- [ ] Lambda function deployed successfully
- [ ] Existing records updated in DynamoDB
- [ ] Marketplace displays location badges correctly
- [ ] Marketplace displays seller type badges correctly
- [ ] Location badge hidden when location is NA
- [ ] Form includes all new fields
- [ ] Form validation works for new fields
- [ ] New submissions include location and seller type
- [ ] API returns updated data structure

## Rollback Instructions

If issues occur:

1. **Revert Lambda Function**
   ```bash
   # Restore previous version from Lambda console
   # Or redeploy previous code
   ```

2. **Database Fields**
   - New fields won't break existing functionality
   - They can be left in place or removed via script if needed

## Notes

- Location badge only shows when location data exists
- Seller type defaults to "Individual" for all existing and new listings
- Fuel type is captured but can be empty for existing listings
- All new submissions require location and fuel type
- Backwards compatible with existing API consumers

## Support

For issues or questions:
- Check Lambda CloudWatch logs: `/aws/lambda/customerListings`
- Check API Gateway logs
- Verify DynamoDB table permissions
- Ensure AWS credentials are valid

## Next Steps

1. Monitor form submissions for 24 hours
2. Verify all new listings include location and seller type
3. Consider adding search/filter by location
4. Consider adding search/filter by seller type
5. Add fuel type filter to marketplace filters
