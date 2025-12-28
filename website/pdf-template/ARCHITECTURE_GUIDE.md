# 🏗️ Architecture Guide - Inspectionwale Report System

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Data Flow Architecture](#data-flow-architecture)
3. [Field Placeholder System](#field-placeholder-system)
4. [Adding New Fields](#adding-new-fields)
5. [Report Component Structure](#report-component-structure)
6. [Backend Integration Points](#backend-integration-points)

---

## 🎯 System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    INSPECTIONWALE SYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐  │
│  │              │      │              │      │          │  │
│  │  Inspector   │─────▶│   Form UI    │─────▶│  Report  │  │
│  │    Form      │      │  Component   │      │   Pages  │  │
│  │              │      │              │      │          │  │
│  └──────────────┘      └──────────────┘      └──────────┘  │
│         │                     │                     │       │
│         │                     │                     │       │
│         ▼                     ▼                     ▼       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          localStorage (Data Persistence)             │  │
│  │                                                       │  │
│  │  {                                                    │  │
│  │    inspection: { ... },                              │  │
│  │    vehicle: { ... },                                 │  │
│  │    ratings: { ... },                                 │  │
│  │    front: { ... },                                   │  │
│  │    rhs: { ... },                                     │  │
│  │    lhs: { ... },                                     │  │
│  │    ...                                               │  │
│  │  }                                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│                 ┌──────────────────┐                        │
│                 │  Python Backend  │ (Future Integration)   │
│                 │   API Endpoint   │                        │
│                 └──────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Architecture

### 1. **Form Input → Data Storage → Report Display**

```
Step 1: Inspector Fills Form
  ↓
InspectorForm.tsx
  │
  ├─ Section 1: Inspection Info (4 fields)
  ├─ Section 2: Vehicle Details (29 fields)
  ├─ Section 3: Ratings (5 fields)
  ├─ Section 4: Flags & Comments (20 fields)
  ├─ Section 5-14: Inspection Details (100+ fields)
  └─ Section 15: Images (21 fields)
  
Step 2: Auto-Save (Every 500ms)
  ↓
saveInspectionData(formData)
  ↓
localStorage.setItem('inspection_data', JSON.stringify(data))

Step 3: View Report
  ↓
getInspectionData()
  ↓
JSON.parse(localStorage.getItem('inspection_data'))
  ↓
11 Report Page Components
  │
  ├─ Page1Header.tsx
  ├─ Page2KeyHighlights.tsx
  ├─ Page3FrontView.tsx
  ├─ Page4RHSSide.tsx
  ├─ Page5LHSSide.tsx
  ├─ Page6RearRoof.tsx
  ├─ Page7Interior.tsx
  ├─ Page8RearCabinBoot.tsx
  ├─ Page9EngineTyres.tsx
  ├─ Page10StructurePerformance.tsx
  └─ PageDisclaimer.tsx
```

---

## 🔑 Field Placeholder System

### How Placeholders Work

Every field in the report follows this pattern:

```tsx
// Example from Page1Header.tsx

<span className="detail-value">{data.vehicle.registration_number}</span>
                                  └─┬─┘ └────────┬────────────┘
                                    │            │
                              Data Section   Field Name
```

### Data Structure Hierarchy

```javascript
{
  // Section 1: Inspection Info
  "inspection": {
    "id": "INS-2024-001",              // Placeholder: data.inspection.id
    "date": "2024-01-15",              // Placeholder: data.inspection.date
    "location": "Mumbai",              // Placeholder: data.inspection.location
    "inspector_name": "Rajesh Kumar"   // Placeholder: data.inspection.inspector_name
  },

  // Section 2: Report Details
  "report": {
    "title": "Vehicle Inspection Report",
    "tagline": "Comprehensive 360° inspection",
    "subtagline": "200+ checkpoints validated"
  },

  // Section 3: Vehicle Details (29 fields)
  "vehicle": {
    "registration_number": "MH01AB1234",    // data.vehicle.registration_number
    "manufacturing_date": "2020-05-15",     // data.vehicle.manufacturing_date
    "chassis_number": "MA3ERLF0S00123456",  // data.vehicle.chassis_number
    "engine_number": "K15B0123456",         // data.vehicle.engine_number
    "registration_date": "2020-06-20",      // data.vehicle.registration_date
    "insurance_validity": "2025-06-20",     // data.vehicle.insurance_validity
    "owner_name": "John Doe",               // data.vehicle.owner_name
    "make_model": "Maruti Suzuki Swift",    // data.vehicle.make_model
    "variant": "VXI 1.2L Petrol",           // data.vehicle.variant
    "fuel_type": "Petrol",                  // data.vehicle.fuel_type
    "owner_count": "1st Owner",             // data.vehicle.owner_count
    "rc_type": "Individual",                // data.vehicle.rc_type
    "hypothecation": "No",                  // data.vehicle.hypothecation
    
    // CNG Sub-section
    "cng": {
      "present": "Yes",                     // data.vehicle.cng.present
      "fitment_type": "Company Fitted",     // data.vehicle.cng.fitment_type
      "approval": "Approved",               // data.vehicle.cng.approval
      "leak": "No Leak Detected"            // data.vehicle.cng.leak
    }
  },

  // Section 4: Ratings (5 star ratings)
  "ratings": {
    "overall": 4,                    // data.ratings.overall (1-5)
    "exterior": 4,                   // data.ratings.exterior (1-5)
    "interior": 5,                   // data.ratings.interior (1-5)
    "mechanical": 4,                 // data.ratings.mechanical (1-5)
    "tyres": 5                       // data.ratings.tyres (1-5)
  },

  // Section 5: Flags & Comments
  "flags": {
    "major_accident": "No",          // data.flags.major_accident
    "minor_accident": "Yes",         // data.flags.minor_accident
    "flood_affected": "No",          // data.flags.flood_affected
    "insurance_claimed": "No",       // data.flags.insurance_claimed
    "mileage_tampered": "No",        // data.flags.mileage_tampered
    "buyer_beware": "No",            // data.flags.buyer_beware
    "chassis_damaged": "No",         // data.flags.chassis_damaged
    "engine_issue": "No"             // data.flags.engine_issue
  },

  "comments": {
    "major_comment": "No major damage found",
    "minor_comment": "Minor scratches on front bumper",
    "flood_comment": "No signs of water damage",
    "overall_comment": "Well-maintained vehicle"
  },

  // Section 6: Front Exterior
  "front": {
    "bonnet_condition": "Good",               // data.front.bonnet_condition
    "bonnet_repainted": "No",                 // data.front.bonnet_repainted
    "bonnet_paint_depth": "120 microns",      // data.front.bonnet_paint_depth
    "front_bumper_condition": "Good",         // data.front.front_bumper_condition
    "front_bumper_repainted": "No",           // data.front.front_bumper_repainted
    "windshield_condition": "Good",           // data.front.windshield_condition
    "windshield_original": "Yes",             // data.front.windshield_original
    "headlights_working": "Yes",              // data.front.headlights_working
    "foglamps_working": "Yes"                 // data.front.foglamps_working
  },

  // Section 7: RHS Exterior
  "rhs": {
    "fender_condition": "Good",               // data.rhs.fender_condition
    "fender_repainted": "No",                 // data.rhs.fender_repainted
    "fender_paint_depth": "115 microns",      // data.rhs.fender_paint_depth
    "front_door_condition": "Good",           // data.rhs.front_door_condition
    "front_door_repainted": "No",             // data.rhs.front_door_repainted
    "front_door_paint_depth": "118 microns",  // data.rhs.front_door_paint_depth
    "rear_door_condition": "Good",            // data.rhs.rear_door_condition
    "rear_door_repainted": "No",              // data.rhs.rear_door_repainted
    "rear_door_paint_depth": "120 microns",   // data.rhs.rear_door_paint_depth
    "quarter_panel_condition": "Good",        // data.rhs.quarter_panel_condition
    "quarter_panel_repainted": "No",          // data.rhs.quarter_panel_repainted
    "quarter_panel_paint_depth": "122 microns", // data.rhs.quarter_panel_paint_depth
    "window_glass_original": "Yes",           // data.rhs.window_glass_original
    "side_mirror_condition": "Good",          // data.rhs.side_mirror_condition
    "front_door_company_fitted": "Yes",       // data.rhs.front_door_company_fitted
    "rear_door_company_fitted": "Yes"         // data.rhs.rear_door_company_fitted
  },

  // Section 8: LHS Exterior (Same structure as RHS)
  "lhs": {
    // Same fields as RHS but for left side
    "fender_condition": "Good",
    "fender_repainted": "No",
    // ... (16 fields total)
  },

  // Section 9: Rear & Roof
  "rear": {
    "rear_bumper_condition": "Good",          // data.rear.rear_bumper_condition
    "rear_bumper_repainted": "No",            // data.rear.rear_bumper_repainted
    "tailgate_condition": "Good",             // data.rear.tailgate_condition
    "tailgate_repainted": "No",               // data.rear.tailgate_repainted
    "rear_windshield_condition": "Good",      // data.rear.rear_windshield_condition
    "rear_windshield_original": "Yes",        // data.rear.rear_windshield_original
    "taillights_working": "Yes",              // data.rear.taillights_working
    "reflectors_present": "Yes"               // data.rear.reflectors_present
  },

  "roof": {
    "roof_condition": "Good",                 // data.roof.roof_condition
    "roof_repainted": "No",                   // data.roof.roof_repainted
    "roof_paint_depth": "125 microns",        // data.roof.roof_paint_depth
    "sunroof_present": "No",                  // data.roof.sunroof_present
    "sunroof_condition": "N/A"                // data.roof.sunroof_condition
  },

  // Section 10: Interior Dashboard
  "interior_dashboard": {
    "dashboard_condition": "Good",            // data.interior_dashboard.dashboard_condition
    "ac_working": "Yes",                      // data.interior_dashboard.ac_working
    "heater_working": "Yes",                  // data.interior_dashboard.heater_working
    "music_system_working": "Yes",            // data.interior_dashboard.music_system_working
    "power_windows_working": "Yes",           // data.interior_dashboard.power_windows_working
    "power_steering_working": "Yes",          // data.interior_dashboard.power_steering_working
    "odometer_reading": "45,230 km",          // data.interior_dashboard.odometer_reading
    "odometer_genuine": "Yes",                // data.interior_dashboard.odometer_genuine
    "warning_lights": "None",                 // data.interior_dashboard.warning_lights
    "cluster_condition": "Good"               // data.interior_dashboard.cluster_condition
  },

  // Section 11: Seats & Boot
  "seats": {
    "front_seats_condition": "Good",          // data.seats.front_seats_condition
    "rear_seats_condition": "Good",           // data.seats.rear_seats_condition
    "seat_covers_present": "Yes",             // data.seats.seat_covers_present
    "seat_belt_working": "Yes"                // data.seats.seat_belt_working
  },

  "boot": {
    "boot_space_condition": "Clean",          // data.boot.boot_space_condition
    "spare_wheel_present": "Yes",             // data.boot.spare_wheel_present
    "toolkit_present": "Yes",                 // data.boot.toolkit_present
    "jack_present": "Yes"                     // data.boot.jack_present
  },

  // Section 12: Engine
  "engine": {
    "engine_condition": "Good",               // data.engine.engine_condition
    "oil_leak": "No",                         // data.engine.oil_leak
    "coolant_leak": "No",                     // data.engine.coolant_leak
    "engine_mounting": "Good",                // data.engine.engine_mounting
    "belt_condition": "Good",                 // data.engine.belt_condition
    "battery_condition": "Good",              // data.engine.battery_condition
    "radiator_condition": "Good",             // data.engine.radiator_condition
    "alternator_working": "Yes",              // data.engine.alternator_working
    "starter_working": "Yes"                  // data.engine.starter_working
  },

  // Section 13: Tyres (5 tyres)
  "tyres": {
    "rhs_front": {
      "make": "MRF",                          // data.tyres.rhs_front.make
      "tread_depth": "5mm",                   // data.tyres.rhs_front.tread_depth
      "condition": "Good",                    // data.tyres.rhs_front.condition
      "manufacturing_date": "Week 24, 2022"   // data.tyres.rhs_front.manufacturing_date
    },
    "rhs_rear": { /* same structure */ },
    "lhs_front": { /* same structure */ },
    "lhs_rear": { /* same structure */ },
    "spare": { /* same structure */ }
  },

  // Section 14: Structure & Performance
  "structure": {
    "rhs_apron_condition": "Original",        // data.structure.rhs_apron_condition
    "lhs_apron_condition": "Original",        // data.structure.lhs_apron_condition
    "cowl_top_condition": "Good",             // data.structure.cowl_top_condition
    "firewall_condition": "Original",         // data.structure.firewall_condition
    "chassis_condition": "Good"               // data.structure.chassis_condition
  },

  "performance": {
    "acceleration": "Smooth",                 // data.performance.acceleration
    "braking": "Responsive",                  // data.performance.braking
    "steering_response": "Good",              // data.performance.steering_response
    "suspension": "Comfortable",              // data.performance.suspension
    "gear_shifting": "Smooth",                // data.performance.gear_shifting
    "clutch_operation": "Good",               // data.performance.clutch_operation
    "test_drive_km": "5 km"                   // data.performance.test_drive_km
  },

  // Section 15: Images (21 images)
  "images": {
    "rhs_apron": "url_or_base64",             // data.images.rhs_apron
    "lhs_apron": "url_or_base64",             // data.images.lhs_apron
    "chassis_plate": "url_or_base64",         // data.images.chassis_plate
    "cng_plate": "url_or_base64",             // data.images.cng_plate
    "vehicle_front": "url_or_base64",         // data.images.vehicle_front
    "vehicle_rhs": "url_or_base64",           // data.images.vehicle_rhs
    "vehicle_lhs": "url_or_base64",           // data.images.vehicle_lhs
    "vehicle_rear": "url_or_base64",          // data.images.vehicle_rear
    "dashboard": "url_or_base64",             // data.images.dashboard
    "cluster_meter": "url_or_base64",         // data.images.cluster_meter
    "driver_cabin": "url_or_base64",          // data.images.driver_cabin
    "rear_cabin": "url_or_base64",            // data.images.rear_cabin
    "boot_space": "url_or_base64",            // data.images.boot_space
    "engine_compartment": "url_or_base64",    // data.images.engine_compartment
    "firewall": "url_or_base64",              // data.images.firewall
    "battery": "url_or_base64",               // data.images.battery
    "tyre_rhs_front": "url_or_base64",        // data.images.tyre_rhs_front
    "tyre_rhs_rear": "url_or_base64",         // data.images.tyre_rhs_rear
    "tyre_lhs_front": "url_or_base64",        // data.images.tyre_lhs_front
    "tyre_lhs_rear": "url_or_base64",         // data.images.tyre_lhs_rear
    "spare_tyre": "url_or_base64"             // data.images.spare_tyre
  }
}
```

---

## ➕ Adding New Fields

### Step-by-Step Guide to Add a New Field

Let's say you want to add **"Paint Warranty"** to the Vehicle Details section.

#### **Step 1: Add to Data Loader (Default Data)**

**File:** `/src/utils/dataLoader.ts`

```typescript
// Find the vehicle section
vehicle: {
  registration_number: '',
  manufacturing_date: '',
  // ... existing fields ...
  
  // ✅ ADD NEW FIELD HERE
  paint_warranty: '',  // New field!
  
  cng: {
    present: '',
    // ...
  }
}
```

#### **Step 2: Add to Inspector Form**

**File:** `/src/app/components/InspectorForm.tsx`

Find Section 2 (Vehicle Details) around line 250:

```tsx
{/* Section 2: Vehicle Details */}
{currentSection === 1 && (
  <div className="form-section">
    <h2 className="section-title">Vehicle Details</h2>
    <div className="form-grid">
      
      {/* Existing fields... */}
      
      {/* ✅ ADD NEW FORM FIELD */}
      <div className="form-group">
        <label>Paint Warranty</label>
        <select
          value={formData.vehicle.paint_warranty}
          onChange={(e) => handleInputChange('vehicle', 'paint_warranty', e.target.value)}
          className="form-select"
        >
          <option value="">-- Select --</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Expired">Expired</option>
        </select>
      </div>
      
    </div>
  </div>
)}
```

#### **Step 3: Add to Report Page**

**File:** `/src/app/components/Page1Header.tsx`

Find the vehicle details section:

```tsx
<div className="detail-grid">
  {/* Existing detail items... */}
  
  {/* ✅ ADD NEW DISPLAY FIELD */}
  <div className="detail-item">
    <span className="detail-label">Paint Warranty</span>
    <span className="detail-value">{data.vehicle.paint_warranty}</span>
  </div>
  
</div>
```

#### **Step 4: Add to Test Data Helper**

**File:** `/src/utils/testDataHelper.ts`

```typescript
vehicle: {
  registration_number: 'MH01AB1234',
  // ... existing test data ...
  
  // ✅ ADD TEST VALUE
  paint_warranty: 'Yes',
  
  cng: {
    // ...
  }
}
```

### That's it! 🎉

The new field will now:
- ✅ Appear in the form (Section 2)
- ✅ Be saved to localStorage
- ✅ Display in the report (Page 1)
- ✅ Have test data loaded

---

## 📄 Report Component Structure

### Page-by-Page Breakdown

| Page # | Component File | Data Sections Used | Purpose |
|--------|---------------|-------------------|---------|
| 1 | `Page1Header.tsx` | `inspection`, `report`, `vehicle`, `ratings` | Vehicle registration & ratings |
| 2 | `Page2KeyHighlights.tsx` | `flags`, `comments`, `images` (4 images) | Key flags & initial images |
| 3 | `Page3FrontView.tsx` | `front`, `images.vehicle_front` | Front exterior inspection |
| 4 | `Page4RHSSide.tsx` | `rhs`, `images.vehicle_rhs` | Right side inspection |
| 5 | `Page5LHSSide.tsx` | `lhs`, `images.vehicle_lhs` | Left side inspection |
| 6 | `Page6RearRoof.tsx` | `rear`, `roof`, `images.vehicle_rear` | Rear & roof inspection |
| 7 | `Page7Interior.tsx` | `interior_dashboard`, `images` (3 images) | Dashboard & controls |
| 8 | `Page8RearCabinBoot.tsx` | `seats`, `boot`, `images` (2 images) | Rear cabin & boot |
| 9 | `Page9EngineTyres.tsx` | `engine`, `tyres`, `images` (7 images) | Engine & tyres |
| 10 | `Page10StructurePerformance.tsx` | `structure`, `performance` | Structure diagram & test drive |
| 11 | `PageDisclaimer.tsx` | None | Legal disclaimer (bilingual) |

---

## 🔌 Backend Integration Points

### Data Export Format

The system stores data as:

```javascript
localStorage.getItem('inspection_data')
// Returns JSON string
```

### For Python Backend Integration

**Recommended API Endpoint:**

```python
# Python Flask Example
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/inspection', methods=['POST'])
def save_inspection():
    """
    Receive inspection data from frontend
    """
    data = request.get_json()
    
    # Validate data
    if not data.get('inspection', {}).get('id'):
        return jsonify({'error': 'Missing inspection ID'}), 400
    
    # Save to database
    # ... your database logic ...
    
    return jsonify({
        'success': True,
        'inspection_id': data['inspection']['id']
    }), 201

@app.route('/api/inspection/<inspection_id>', methods=['GET'])
def get_inspection(inspection_id):
    """
    Retrieve inspection data to frontend
    """
    # ... fetch from database ...
    
    return jsonify(inspection_data), 200
```

### Frontend API Integration (Future)

To send data to backend, modify `/src/utils/dataLoader.ts`:

```typescript
// Add API integration function
export async function syncInspectionToBackend(data: any) {
  try {
    const response = await fetch('https://your-api.com/api/inspection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync');
    }
    
    const result = await response.json();
    console.log('✅ Synced to backend:', result.inspection_id);
    return result;
  } catch (error) {
    console.error('❌ Backend sync failed:', error);
    throw error;
  }
}

// Use in InspectorForm.tsx
const handleSaveToBackend = async () => {
  try {
    await syncInspectionToBackend(formData);
    alert('✅ Data saved to server!');
  } catch (error) {
    alert('❌ Failed to save. Data saved locally only.');
  }
};
```

---

## 🎨 Custom Branding

### Current Branding Elements

1. **Page 1 Header:** Brand logo image (blue Inspectionwale plate)
2. **Other Pages Header:** Contact info bar
3. **Footer:** `inspectionwale.com` text

### To Change Branding:

**File:** `/src/app/components/InspectionPage.tsx`

```tsx
// Change logo
import brandLogo from 'figma:asset/YOUR_IMAGE_ID.png';

// Change contact info
<span className="contact-item">
  <Mail className="contact-icon" />
  your-email@yourdomain.com
</span>

// Change footer
<span className="footer-logo-text">yourdomain.com</span>
```

---

## 📊 Data Summary

| Category | Fields Count | Location |
|----------|-------------|----------|
| Inspection Info | 4 | `inspection.*` |
| Report Meta | 3 | `report.*` |
| Vehicle Details | 29 | `vehicle.*` |
| Ratings | 5 | `ratings.*` |
| Flags | 8 | `flags.*` |
| Comments | 4 | `comments.*` |
| Front Exterior | 9 | `front.*` |
| RHS Exterior | 16 | `rhs.*` |
| LHS Exterior | 16 | `lhs.*` |
| Rear & Roof | 13 | `rear.*` + `roof.*` |
| Interior Dashboard | 10 | `interior_dashboard.*` |
| Seats & Boot | 8 | `seats.*` + `boot.*` |
| Engine | 9 | `engine.*` |
| Tyres | 20 | `tyres.*` |
| Structure & Performance | 12 | `structure.*` + `performance.*` |
| Images | 21 | `images.*` |
| **TOTAL** | **187 fields** | |

---

## 🚀 Quick Reference

### Key Files to Modify

| Purpose | File Path |
|---------|-----------|
| **Add/Edit Form Fields** | `/src/app/components/InspectorForm.tsx` |
| **Default Data Structure** | `/src/utils/dataLoader.ts` |
| **Test Data** | `/src/utils/testDataHelper.ts` |
| **Report Page 1** | `/src/app/components/Page1Header.tsx` |
| **Report Page 2** | `/src/app/components/Page2KeyHighlights.tsx` |
| **Report Page 3-11** | `/src/app/components/Page*.tsx` |
| **Header/Footer** | `/src/app/components/InspectionPage.tsx` |
| **Report Styling** | `/src/styles/inspection-report.css` |
| **Form Styling** | `/src/styles/inspector-form.css` |

---

**Need help?** This guide covers the complete architecture. For backend integration, see the [Backend Integration Guide](#).

---

*Last Updated: December 28, 2025*
