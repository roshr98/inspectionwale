# Vehicle Inspection Form - Testing Guide

## 🚀 Quick Start for Testing

The inspection form now includes **auto-save** functionality and **console helper functions** for easy testing.

---

## ✨ Auto-Save Feature

The form **automatically saves** your data to the browser's cache (localStorage) every time you make a change. This means:

- ✅ **No data loss on refresh** - Your form data persists across page reloads
- ✅ **Auto-save after 500ms** - Changes are saved automatically with a short debounce
- ✅ **Console confirmation** - You'll see `✅ Form data auto-saved to cache` in the console
- ✅ **Works across all sections** - Every field change is tracked and saved

### How It Works

1. Fill out any field in the form
2. Wait 500ms (or move to another field)
3. Data is automatically saved to localStorage
4. Refresh the page - your data is still there!

---

## 🧪 Console Helper Functions

When you open the application, three helper functions are automatically available in your browser console:

### 1. **Prefill Form with Test Data**

```javascript
prefillInspectionForm()
```

**What it does:**
- Loads complete sample inspection data into the form
- Includes realistic values for all 15 sections
- Automatically reloads the page to show the prefilled form
- Shows a preview of the loaded data in console

**Example output:**
```
✅ Test data has been loaded into cache!
🔄 Reloading page to show prefilled form...

🔍 Preview of loaded data:
┌─────────────────┬──────────────────────────┐
│ Inspection ID   │ IW-2025-001234           │
│ Vehicle         │ Maruti Suzuki Swift      │
│ Registration    │ MH 02 AB 1234            │
│ Owner           │ Amit Sharma              │
│ Location        │ Mumbai, Maharashtra      │
└─────────────────┴──────────────────────────┘
```

### 2. **Clear All Form Data**

```javascript
clearInspectionForm()
```

**What it does:**
- Removes all saved inspection data from cache
- Automatically reloads the page to show empty form
- Useful for starting fresh or testing with empty state

**Example output:**
```
🗑️ Form data has been cleared from cache!
🔄 Reloading page to show empty form...
```

### 3. **View Current Form Data**

```javascript
viewInspectionData()
```

**What it does:**
- Displays the current inspection data stored in cache
- Shows the complete JSON object in console
- Useful for debugging or checking what's saved

**Example output:**
```
📊 Current inspection data in cache:
{
  report: { ... },
  inspection: { ... },
  vehicle: { ... },
  ...
}
```

---

## 📋 Step-by-Step Testing Workflow

### Option 1: Test with Prefilled Data

1. **Open your browser's Developer Tools**
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)

2. **Go to the Console tab**

3. **Run the prefill command:**
   ```javascript
   prefillInspectionForm()
   ```

4. **Page will auto-reload** with all form fields filled

5. **Navigate through sections** to see the test data

6. **Click "View Report"** to see the generated PDF report

### Option 2: Test Manual Entry with Auto-Save

1. **Open the application** in your browser

2. **Start filling out the form** manually

3. **Refresh the page at any time** - your data is preserved!

4. **Continue where you left off**

### Option 3: Test from Scratch

1. **Open Developer Console**

2. **Clear any existing data:**
   ```javascript
   clearInspectionForm()
   ```

3. **Page auto-reloads** with empty form

4. **Fill out the form** manually

5. **Data auto-saves** as you type

---

## 🔍 Test Data Sample

The `prefillInspectionForm()` function loads the following sample data:

### Vehicle Information
- **Registration:** MH 02 AB 1234
- **Make/Model:** Maruti Suzuki Swift
- **Variant:** VXI (O) AT
- **Owner:** Amit Sharma (2nd Owner)
- **Fuel Type:** Petrol
- **CNG:** Yes (Company Fitted)

### Ratings (1-5 stars)
- Interior: 4/5
- Exterior: 4/5
- Engine: 5/5
- Test Drive: 4/5
- Structure: 5/5
- Electrical: 4/5

### Inspection Flags
- ✅ RC & Chassis Match
- ✅ Service Logs Available
- ❌ Not Accidental
- ❌ No Flood Damage
- ❌ No Fire Damage

### Complete Coverage
- All 15 sections prefilled
- All tyres information (RHS/LHS Front/Rear + Spare)
- All structural components
- All performance metrics
- Sample images from Unsplash

---

## 🛠️ Advanced Usage

### Modify Test Data

You can modify the test data by editing `/src/utils/testDataHelper.ts`:

```typescript
const testData = {
  inspection: {
    id: "YOUR-CUSTOM-ID",
    date: "2025-12-25",
    // ... modify as needed
  },
  // ... rest of the data
};
```

### Export Current Form Data

To export your current form data for backup or sharing:

```javascript
// Get the data
const data = viewInspectionData();

// Copy to clipboard (in modern browsers)
copy(JSON.stringify(data, null, 2));

// Or download as file
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'inspection-data.json';
a.click();
```

### Import Custom Data

To import custom inspection data:

```javascript
const customData = {
  // Your custom data structure matching the schema
};

localStorage.setItem('inspectionData', JSON.stringify(customData));
location.reload();
```

---

## 📝 Common Testing Scenarios

### Scenario 1: Test Required Field Validation

1. Run `clearInspectionForm()`
2. Try to proceed without filling Inspection ID
3. Validation error should appear

### Scenario 2: Test Star Ratings

1. Run `prefillInspectionForm()`
2. Go to "Ratings" section
3. Change ratings and view report
4. Stars should update in the final report

### Scenario 3: Test Image URLs

1. Run `prefillInspectionForm()`
2. Go to "Images" section
3. URLs are prefilled with Unsplash images
4. View report to see images loaded

### Scenario 4: Test Auto-Save Recovery

1. Start filling form manually
2. Fill 2-3 sections
3. Close browser tab (without saving)
4. Reopen application
5. Data should be recovered

---

## 🐛 Troubleshooting

### Data not persisting?

```javascript
// Check if localStorage is available
console.log('localStorage available:', typeof(Storage) !== 'undefined');

// Check current data
viewInspectionData();
```

### Clear browser cache if needed

```javascript
// Nuclear option - clear everything
localStorage.clear();
location.reload();
```

### Console not showing helper messages?

Refresh the page - the helper functions are initialized on page load.

---

## 📊 Data Structure Reference

The inspection data follows this structure:

```javascript
{
  report: { title, tagline, subtagline },
  inspection: { id, date, location, inspector_name },
  vehicle: { registration_number, make_model, ... },
  ratings: { interior, exterior, engine, ... },
  flags: { accidental, flood_damage, ... },
  comments: { engine, structure, test_drive, ... },
  front: { bumper_condition, bonnet_condition, ... },
  rhs: { fender_condition, front_door_condition, ... },
  lhs: { ... },
  rear: { ... },
  roof: { ... },
  interior: { mil_light, dashboard_condition, ... },
  seats: { ... },
  rear_seats: { ... },
  boot: { ... },
  engine: { ... },
  tyres: { rhs_front, rhs_rear, lhs_front, lhs_rear, spare },
  structure: { ... },
  performance: { ... },
  images: { vehicle_front, vehicle_rhs, ... }
}
```

---

## 🎯 Best Practices

1. **Always use console functions for testing** - They handle reload and validation
2. **Test auto-save by making small changes** - Verify console shows save confirmations
3. **Use viewInspectionData() frequently** - To check what's actually saved
4. **Clear data before new tests** - Use `clearInspectionForm()` for fresh start
5. **Check the report view** - After filling form, verify data appears correctly

---

## 💡 Tips

- **Keyboard shortcut for console:** Press `F12` on Windows/Linux or `Cmd+Option+J` on Mac
- **Auto-save indicator:** Watch console for `✅ Form data auto-saved to cache` messages
- **Quick test:** Run `prefillInspectionForm()` → Click "View Report" → Print/Export PDF
- **Development mode:** The helper functions are always available in development

---

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Run `viewInspectionData()` to see current state
3. Try `clearInspectionForm()` and start fresh
4. Check localStorage quota (usually 5-10MB per domain)

---

**Happy Testing! 🚗✨**
