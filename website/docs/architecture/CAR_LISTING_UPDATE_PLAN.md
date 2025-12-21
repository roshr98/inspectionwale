# Car Listing Form & Display Update Plan

## Overview
This document outlines the comprehensive updates needed for the car listing feature including form fields, database schema, Lambda functions, and modal display redesign.

## 1. FORM UPDATES (index.html - listCarModal)

### Personal Details Section
- ✅ Name (already exists)
- ✅ Mobile number (already exists)
- ✅ Email ID (already exists)

### Car Details Section
- ✅ Make (already exists)
- ✅ Model (already exists)
- ✅ Variant (need to add)
- ✅ Registration year (already exists)
- ✅ Odometer reading (kmsDriven already exists)
- ✅ Location (already exists)
- ✅ Fuel type (already exists)
- ⚠️ Insurance validity (need to add)
- ⚠️ Accidental history: Yes/No (need to add)
- ⚠️ Warranty Available: Yes/No (need to add)
- ✅ Expected Price (already exists)
- ⚠️ Spare key Available? (need to add)

### Features Section (NEW)
- ⚠️ Transmission type: Automatic/Manual/Others (need to add)
- ⚠️ Cruise control? (need to add)
- ⚠️ Parking assistant (need to add)
- ⚠️ Audio system Working? (need to add)
- ⚠️ Airbags? (need to add)
- ⚠️ ABS? (need to add)

## 2. DATABASE SCHEMA UPDATE (DynamoDB - CarListings Table)

### New Attributes to Add:
```json
{
  "car": {
    "variant": "string",
    "insuranceValidity": "string (date or 'Expired')",
    "accidentalHistory": "boolean",
    "warrantyAvailable": "boolean",
    "spareKeyAvailable": "boolean",
    "transmissionType": "string (Automatic/Manual/Others)",
    "cruiseControl": "boolean",
    "parkingAssistant": "boolean",
    "audioSystemWorking": "boolean",
    "airbags": "number or boolean",
    "abs": "boolean"
  }
}
```

## 3. LAMBDA FUNCTION UPDATE (customerListings)

File: `lambda/customerListings/index.js`

### Update POST handler to accept new fields:
```javascript
// Existing fields validation
const make = car.make?.trim();
const model = car.model?.trim();
const variant = car.variant?.trim(); // NEW
const registrationYear = car.registrationYear;
const kmsDriven = car.kmsDriven;
const location = car.location?.trim();
const fuelType = car.fuelType?.trim();
const insuranceValidity = car.insuranceValidity?.trim(); // NEW
const accidentalHistory = car.accidentalHistory === true || car.accidentalHistory === 'true'; // NEW
const warrantyAvailable = car.warrantyAvailable === true || car.warrantyAvailable === 'true'; // NEW
const spareKeyAvailable = car.spareKeyAvailable === true || car.spareKeyAvailable === 'true'; // NEW

// Features
const transmissionType = car.transmissionType?.trim() || 'Manual'; // NEW
const cruiseControl = car.cruiseControl === true || car.cruiseControl === 'true'; // NEW
const parkingAssistant = car.parkingAssistant === true || car.parkingAssistant === 'true'; // NEW
const audioSystemWorking = car.audioSystemWorking === true || car.audioSystemWorking === 'true'; // NEW
const airbags = car.airbags; // NEW (can be number or boolean)
const abs = car.abs === true || car.abs === 'true'; // NEW
```

## 4. FRONTEND JAVASCRIPT UPDATE (index.html)

### Form Submission Handler:
Update the `listCarForm` submit event to collect new fields:

```javascript
const formData = {
  seller: {
    name: document.getElementById('sellerName').value,
    mobile: document.getElementById('sellerMobile').value,
    email: document.getElementById('sellerEmail').value || null,
    type: document.getElementById('sellerType').value
  },
  car: {
    make: document.getElementById('carMake').value,
    model: document.getElementById('carModel').value,
    variant: document.getElementById('carVariant').value, // NEW
    edition: document.getElementById('carEdition').value || null,
    registrationYear: parseInt(document.getElementById('registrationYear').value),
    kmsDriven: parseInt(document.getElementById('kmsDriven').value),
    location: document.getElementById('carLocation').value,
    fuelType: document.getElementById('carFuelType').value,
    insuranceValidity: document.getElementById('insuranceValidity').value, // NEW
    accidentalHistory: document.getElementById('accidentalHistory').value === 'Yes', // NEW
    warrantyAvailable: document.getElementById('warrantyAvailable').value === 'Yes', // NEW
    expectedPrice: parseInt(document.getElementById('expectedPrice').value),
    spareKeyAvailable: document.getElementById('spareKeyAvailable').value === 'Yes', // NEW
    transmissionType: document.getElementById('transmissionType').value, // NEW
    cruiseControl: document.getElementById('cruiseControl').checked, // NEW
    parkingAssistant: document.getElementById('parkingAssistant').checked, // NEW
    audioSystemWorking: document.getElementById('audioSystemWorking').checked, // NEW
    airbags: document.getElementById('airbags').value, // NEW
    abs: document.getElementById('abs').checked // NEW
  },
  photos: photoData
};
```

## 5. MODAL DISPLAY REDESIGN (car-marketplace/index.html)

### Layout Structure (matching reference images):

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEADER (Back button + Title)              │
├──────────────────────────────────┬──────────────────────────────┤
│                                  │                               │
│    LARGE IMAGE with              │  Price                        │
│    3 THUMBNAILS (right side)     │  Title                        │
│                                  │  Rating                       │
│                                  │  Quick Stats (4 icons)        │
│                                  │                               │
│                                  │  Contact Form                 │
│                                  │  - Subject dropdown           │
│                                  │  - First/Last Name            │
│                                  │  - Email/Phone                │
│                                  │  - Message                    │
│                                  │  - REQUEST INFO button        │
│                                  │                               │
│                                  │  Inspection CTA (green)       │
│                                  │                               │
├──────────────────────────────────┴──────────────────────────────┤
│  CAR OVERVIEW TABLE (2 cols x 9 rows)                            │
│  - Price, Kilometer, Fuel type                                   │
│  - Registration year, Manufacturing Year, No. of owners          │
│  - Transmission, Color, Car Available at                         │
│  - Insurance, Registration Type, Last Updated                    │
│  + MORE ROWS for new fields                                      │
├───────────────────────────────────────────────────────────────  ─┤
│  FEATURE DETAILS (Accordion/Expandable Sections)                 │
│  - Engine (with rating 4.8)                                      │
│  - Suspension (with rating 5)                                    │
│  - Brakes (with rating 5)                                        │
│  - Transmission (with rating 5)                                  │
│  - A/C (with rating 5)                                           │
│  - Exterior (with rating 4.9)                                    │
│  - Interior (with rating 4.2)                                    │
│  - Tyres (with rating 4.8)                                       │
│  - Accessories                                                    │
├───────────────────────────────────────────────────────────────  ─┤
│  CUSTOMER REVIEWS (3 cards, compact)                             │
├──────────────────────────────────────────────────────────────────┤
│  FOOTER                                                           │
└──────────────────────────────────────────────────────────────────┘
```

### Key Changes:
1. **Image Display**: Carousel with thumbnails on right (like reference image 3)
2. **Car Overview Table**: 3-column format showing all specs (like reference image 2)
3. **Feature Details**: Accordion sections with ratings (like reference image 4)
4. **Green Button**: Change inspection CTA from teal to green (#28a745)
5. **Right Panel**: Keep current design (reference image 1)

## 6. IMPLEMENTATION STEPS

### Step 1: Update Form HTML (index.html)
Add new form fields in the list car modal

### Step 2: Update Form JavaScript
Update form submission handler to collect new fields

### Step 3: Test S3 Upload
Ensure photo uploads still work with existing S3 configuration

### Step 4: Update Lambda Function
Deploy updated Lambda function with new field handling

### Step 5: Update Modal Display
Redesign car detail modal to match reference images

### Step 6: Test End-to-End
1. Submit a listing with all new fields
2. Verify data in DynamoDB
3. Verify photos in S3
4. Verify display in marketplace modal

## 7. FILES TO UPDATE

1. `/index.html` - List car form modal
2. `/car-marketplace/index.html` - Car detail modal display
3. `/lambda/customerListings/index.js` - Lambda function (if exists)
4. Test with actual submissions

## NOTES
- All existing photos and S3 upload logic should remain unchanged
- DynamoDB table schema is flexible (no migration needed)
- Lambda function should handle both old and new data formats
- Modal should gracefully handle missing optional fields

---

**Status**: Ready for implementation
**Priority**: High
**Estimated Effort**: 4-6 hours
