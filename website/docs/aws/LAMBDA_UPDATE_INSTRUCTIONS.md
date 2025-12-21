# Lambda Function Update Instructions

## File: `lambda/customerListings/index.js`

The Lambda function needs to be updated to handle the new car fields. Below are the required changes:

### 1. Update the POST Handler (submitListing endpoint)

In the section where you extract and validate the `car` object from the request body, add these new fields:

```javascript
// Existing fields
const make = car.make?.trim();
const model = car.model?.trim();
const edition = car.edition?.trim() || null;
const registrationYear = car.registrationYear;
const kmsDriven = car.kmsDriven;
const expectedPrice = car.expectedPrice;

// ADD THESE NEW FIELDS:
const location = car.location?.trim() || null;
const fuelType = car.fuelType?.trim() || null;
const variant = car.variant?.trim() || null;
const insuranceValidity = car.insuranceValidity?.trim() || null;
const accidentalHistory = car.accidentalHistory === true || car.accidentalHistory === 'true';
const warrantyAvailable = car.warrantyAvailable === true || car.warrantyAvailable === 'true';
const spareKeyAvailable = car.spareKeyAvailable === true || car.spareKeyAvailable === 'true';
const transmissionType = car.transmissionType?.trim() || 'Manual';
const cruiseControl = car.cruiseControl === true || car.cruiseControl === 'true';
const parkingAssistant = car.parkingAssistant === true || car.parkingAssistant === 'true';
const audioSystemWorking = car.audioSystemWorking === true || car.audioSystemWorking === 'true';
const airbags = car.airbags || null;
const abs = car.abs === true || car.abs === 'true';
```

### 2. Update DynamoDB PutItem

In the DynamoDB `putItem` call, update the `car` attribute to include all new fields:

```javascript
const item = {
  listingId: { S: listingId },
  submissionId: { S: submissionId },
  status: { S: 'pending' },
  createdAt: { S: createdAt },
  seller: {
    M: {
      name: { S: seller.name },
      mobile: { S: seller.mobile },
      email: { S: seller.email || '' }
    }
  },
  car: {
    M: {
      make: { S: make },
      model: { S: model },
      edition: { S: edition || '' },
      registrationYear: { N: String(registrationYear) },
      kmsDriven: { N: String(kmsDriven) },
      expectedPrice: { N: String(expectedPrice) },
      location: { S: location || '' },              // NEW
      fuelType: { S: fuelType || '' },              // NEW
      variant: { S: variant || '' },                // NEW
      insuranceValidity: { S: insuranceValidity || '' }, // NEW
      accidentalHistory: { BOOL: accidentalHistory },    // NEW
      warrantyAvailable: { BOOL: warrantyAvailable },    // NEW
      spareKeyAvailable: { BOOL: spareKeyAvailable },    // NEW
      transmissionType: { S: transmissionType },         // NEW
      cruiseControl: { BOOL: cruiseControl },            // NEW
      parkingAssistant: { BOOL: parkingAssistant },      // NEW
      audioSystemWorking: { BOOL: audioSystemWorking },  // NEW
      airbags: { S: airbags || '0' },                   // NEW
      abs: { BOOL: abs }                                 // NEW
    }
  },
  photos: {
    L: photos.map(photo => ({
      M: {
        slot: { S: photo.slot },
        key: { S: photo.key },
        contentType: { S: photo.contentType },
        originalName: { S: photo.originalName || '' }
      }
    }))
  }
};
```

### 3. Update GET Handler (list/retrieve listings)

When retrieving listings from DynamoDB, ensure the Lambda function returns these new fields in the response. Update the mapping function that converts DynamoDB items to JSON:

```javascript
function mapDynamoDBItemToListing(item) {
  return {
    listingId: item.listingId?.S || '',
    status: item.status?.S || '',
    createdAt: item.createdAt?.S || '',
    seller: {
      name: item.seller?.M?.name?.S || '',
      mobile: item.seller?.M?.mobile?.S || '',
      email: item.seller?.M?.email?.S || ''
    },
    car: {
      make: item.car?.M?.make?.S || '',
      model: item.car?.M?.model?.S || '',
      edition: item.car?.M?.edition?.S || '',
      registrationYear: parseInt(item.car?.M?.registrationYear?.N || '0'),
      kmsDriven: parseInt(item.car?.M?.kmsDriven?.N || '0'),
      expectedPrice: parseInt(item.car?.M?.expectedPrice?.N || '0'),
      location: item.car?.M?.location?.S || '',
      fuelType: item.car?.M?.fuelType?.S || '',
      variant: item.car?.M?.variant?.S || '',                          // NEW
      insuranceValidity: item.car?.M?.insuranceValidity?.S || '',      // NEW
      accidentalHistory: item.car?.M?.accidentalHistory?.BOOL || false, // NEW
      warrantyAvailable: item.car?.M?.warrantyAvailable?.BOOL || false, // NEW
      spareKeyAvailable: item.car?.M?.spareKeyAvailable?.BOOL || false, // NEW
      transmissionType: item.car?.M?.transmissionType?.S || 'Manual',  // NEW
      cruiseControl: item.car?.M?.cruiseControl?.BOOL || false,        // NEW
      parkingAssistant: item.car?.M?.parkingAssistant?.BOOL || false,  // NEW
      audioSystemWorking: item.car?.M?.audioSystemWorking?.BOOL || false, // NEW
      airbags: item.car?.M?.airbags?.S || '0',                        // NEW
      abs: item.car?.M?.abs?.BOOL || false                             // NEW
    },
    photos: (item.photos?.L || []).map(photo => ({
      slot: photo.M?.slot?.S || '',
      key: photo.M?.key?.S || '',
      contentType: photo.M?.contentType?.S || 'image/jpeg',
      originalName: photo.M?.originalName?.S || ''
    }))
  };
}
```

### 4. Validation Updates (Optional but Recommended)

Update the validation logic to ensure required fields are present:

```javascript
// Updated validation
if (!make || !model || !registrationYear || !kmsDriven || !expectedPrice || !variant || !transmissionType) {
  return {
    statusCode: 400,
    headers: corsHeaders,
    body: JSON.stringify({
      error: 'Missing required car fields',
      required: ['make', 'model', 'registrationYear', 'kmsDriven', 'expectedPrice', 'variant', 'transmissionType']
    })
  };
}

// Additional validations
if (!['Yes', 'No'].includes(accidentalHistory) && accidentalHistory !== true && accidentalHistory !== false) {
  return {
    statusCode: 400,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Invalid accidentalHistory value' })
  };
}

if (!['Manual', 'Automatic', 'Semi-Automatic', 'Others'].includes(transmissionType)) {
  return {
    statusCode: 400,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Invalid transmission type' })
  };
}
```

## Deployment Steps

1. **Backup**: Create a backup of the current Lambda function code
2. **Update**: Make the above changes to `lambda/customerListings/index.js`
3. **Test Locally**: If possible, test with sample data
4. **Deploy**: 
   - Option 1: Use AWS Console → Lambda → Upload ZIP
   - Option 2: Use AWS CLI: `aws lambda update-function-code --function-name customerListings --zip-file fileb://function.zip`
   - Option 3: Use the deployment script if available (e.g., `deploy-lambda.ps1`)

5. **Verify**: Test the API endpoint:
   ```bash
   curl -X POST https://423cmvhw3g.execute-api.us-east-1.amazonaws.com/prod/customer-listings \
     -H "Content-Type: application/json" \
     -d '{
       "seller": {"name": "Test", "mobile": "1234567890", "email": "test@test.com"},
       "car": {
         "make": "Maruti",
         "model": "Swift",
         "variant": "VXi",
         "registrationYear": 2020,
         "kmsDriven": 15000,
         "expectedPrice": 650000,
         "location": "Mumbai",
         "fuelType": "Petrol",
         "transmissionType": "Manual",
         "accidentalHistory": false,
         "warrantyAvailable": true,
         "spareKeyAvailable": true
       },
       "photos": []
     }'
   ```

## DynamoDB Notes

- **No Schema Migration Required**: DynamoDB is schema-less, so no table updates needed
- **Backward Compatibility**: Old listings without new fields will still work (fields will be null/empty)
- **Forward Compatibility**: New listings will include all fields

## Testing Checklist

- [ ] Lambda function deploys successfully
- [ ] POST /customer-listings accepts new fields
- [ ] Data is saved correctly in DynamoDB
- [ ] GET /customer-listings returns new fields
- [ ] Old listings still display correctly
- [ ] Frontend form submits successfully
- [ ] Photos upload correctly to S3
- [ ] Validation errors display properly

---

**Important**: Always test in a development/staging environment first before deploying to production!
