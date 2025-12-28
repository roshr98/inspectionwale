# 🚗 MASTER VEHICLE INSPECTION SYSTEM - COMPLETE SPECIFICATION

## 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Design System & CSS Specifications](#design-system--css-specifications)
3. [Inspector Form - Complete Structure (14 Sections)](#inspector-form---complete-structure)
4. [Final Report - 11 Pages Detailed](#final-report---11-pages-detailed)
5. [Data Flow & Integration](#data-flow--integration)
6. [Backend API Specifications](#backend-api-specifications)
7. [Implementation Guide](#implementation-guide)
8. [ChatGPT Prompt Ready](#chatgpt-prompt-ready)

---

## SYSTEM OVERVIEW

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│                  VEHICLE INSPECTION SYSTEM              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  INSPECTOR FORM (Single Page Scroll)                   │
│  ├─ 14 Sections                                        │
│  ├─ 208 Total Inputs (187 data + 21 images)           │
│  ├─ Purple Gradient Background                         │
│  ├─ White Card Sections                                │
│  └─ Auto-save every 500ms                              │
│                    ↓                                    │
│              localStorage                               │
│           'inspectionData'                              │
│                    ↓                                    │
│  FINAL REPORT (11 A4 Pages)                            │
│  ├─ Bilingual (English/Hindi)                          │
│  ├─ A4 Portrait (210×297mm)                            │
│  ├─ Print Ready                                        │
│  ├─ Professional Automotive Style                      │
│  └─ Conditional Icons & Star Ratings                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Key Statistics
- **Form Sections:** 14
- **Total Fields:** 208 (187 data fields + 21 image uploads)
- **Report Pages:** 11 A4 pages
- **Languages:** 2 (English/Hindi)
- **Translated Labels:** 400+
- **Conditional Icons:** 19 (5 flags + 14 dashboard/cluster)
- **Auto-save:** 500ms debounce

### Technology Stack
- **Frontend:** React 18+ with TypeScript
- **Styling:** CSS-in-JS (Custom CSS files)
- **State Management:** useState + useEffect hooks
- **Storage:** localStorage (client-side) + Backend API
- **Icons:** lucide-react (CheckCircle, XCircle, Star, etc.)
- **Image Handling:** Base64 encoding with compression

---

## DESIGN SYSTEM & CSS SPECIFICATIONS

### COLOR PALETTE

#### Report Colors (Professional Automotive)
```css
/* Primary Colors */
--background-white: #ffffff;
--background-light-gray: #f9fafb;
--background-medium-gray: #f3f4f6;

/* Text Colors */
--text-primary: #111827;
--text-secondary: #374151;
--text-tertiary: #6b7280;
--text-muted: #9ca3af;

/* Border Colors */
--border-light: #e5e7eb;
--border-medium: #d1d5db;
--border-dark: #1f2937;

/* Accent Colors */
--accent-green: #10b981;    /* Success/Yes/Working */
--accent-red: #ef4444;      /* Error/No/Not Working */
--accent-yellow: #fbbf24;   /* Star ratings */
--accent-red-dark: #dc2626; /* Disclaimer title */

/* Icon Colors */
--icon-success: #10b981;    /* Green checkmark */
--icon-error: #ef4444;      /* Red cross */
--icon-muted: #9ca3af;      /* Gray cross */
```

#### Form Colors (Google Forms Style)
```css
/* Background Gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Primary Purple */
--purple-primary: #8b5cf6;
--purple-hover: #7c3aed;

/* Button Colors */
--btn-save: #10b981;        /* Green */
--btn-save-hover: #059669;
--btn-view: #3b82f6;        /* Blue */
--btn-view-hover: #2563eb;
--btn-clear: #ef4444;       /* Red */
--btn-clear-hover: #dc2626;
--btn-test: #8b5cf6;        /* Purple */
--btn-test-hover: #7c3aed;
```

### TYPOGRAPHY

#### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
```

#### Font Sizes - Report
```css
/* Headers */
.report-main-title { font-size: 22px; font-weight: 700; }
.report-tagline { font-size: 13px; font-weight: 600; }
.section-header { font-size: 14px; font-weight: 700; }
.card-title { font-size: 12px; font-weight: 700; }

/* Body Text */
.detail-label { font-size: 9px; text-transform: uppercase; }
.detail-value { font-size: 11px; font-weight: 600; }
.flag-item { font-size: 10px; }
.comment-text { font-size: 10px; line-height: 1.4; }

/* Footer */
.footer-logo-text { font-size: 11px; font-weight: 700; }
.global-footer { font-size: 9px; }
```

#### Font Sizes - Form
```css
/* Headers */
.form-main-title { font-size: 24px; font-weight: 700; }
.section-title { font-size: 22px; font-weight: 700; }
.subsection-title { font-size: 18px; font-weight: 600; }

/* Form Elements */
.form-group label { font-size: 14px; font-weight: 600; }
.form-group input, select, textarea { font-size: 14px; }
.form-header-actions button { font-size: 14px; font-weight: 600; }
```

### LAYOUT SPECIFICATIONS

#### A4 Page Layout (Report)
```css
.inspection-page {
  width: 210mm;                    /* A4 width */
  height: 297mm;                   /* A4 height */
  background: white;
  margin: 0 auto;
  padding: 15mm 15mm 15mm 15mm;   /* 15mm margins all sides */
  box-sizing: border-box;
  position: relative;
  page-break-after: always;
  display: flex;
  flex-direction: column;
}
```

#### Form Layout
```css
.single-page-form {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 60px;
}

.form-content-wrapper {
  max-width: 900px;              /* Maximum form width */
  margin: 24px auto;
  padding: 0 16px;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-top: 4px solid #8b5cf6;  /* Purple accent */
}
```

#### Grid Systems
```css
/* Two Column Grid (Report) */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

/* Four Column Grid (Report) */
.detail-grid-four {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

/* Form Grid (Responsive) */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}
```

### COMPONENT SPECIFICATIONS

#### Sticky Header (Form)
```css
.form-sticky-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
```

#### Global Header (Report)
```css
.global-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 15px;
}

.header-logo .logo-box {
  background: #1f2937;           /* Dark background */
  padding: 6px 12px;
  display: inline-block;
}

.header-logo .logo-text {
  color: white;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;           /* Spaced letters */
}
```

#### Detail Cards (Report)
```css
.detail-card {
  background: white;
  border: 1px solid #d1d5db;
  padding: 14px;
  margin-bottom: 14px;
}

.card-title {
  font-size: 12px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 10px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}
```

#### Section Headers (Report)
```css
.section-header-bilingual {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
  padding: 8px 12px;
  background: #f3f4f6;                /* Light gray */
  border-left: 4px solid #1f2937;     /* Dark accent bar */
  text-align: center;
}
```

#### Images (Report)
```css
/* Large Image (60% width) */
.inspection-image-large {
  width: 100%;
  height: 280px;                  /* Fixed height */
  object-fit: cover;              /* Crop to fit */
  display: block;
}

/* Standard Image */
.inspection-image {
  width: 100%;
  height: 120px;                  /* Smaller height */
  object-fit: cover;
  display: block;
}

/* Tyre Image */
.tyre-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  display: block;
}
```

#### Star Ratings (Report)
```css
.star-filled {
  width: 14px;
  height: 14px;
  fill: #fbbf24;                  /* Yellow fill */
  color: #fbbf24;
}

.star-empty {
  width: 14px;
  height: 14px;
  fill: none;                     /* No fill */
  color: #d1d5db;                 /* Gray outline */
  stroke: #d1d5db;
  stroke-width: 1.5;
}
```

#### Conditional Icons (Report)
```css
/* Success Icons (Green Checkmark) */
.flag-yes {
  color: #10b981;                 /* Green */
}

.check-icon-small {
  width: 14px;
  height: 14px;
  color: #10b981;                 /* Green */
}

/* Error Icons (Red Cross) */
.flag-no {
  color: #ef4444;                 /* Red */
}

.x-icon-small {
  width: 14px;
  height: 14px;
  color: #9ca3af;                 /* Gray (muted) */
}
```

#### Buttons (Form)
```css
.form-header-actions button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save {
  background: #10b981;            /* Green */
  color: white;
}

.btn-save:hover {
  background: #059669;            /* Darker green */
  transform: translateY(-1px);   /* Lift on hover */
}
```

#### Form Inputs
```css
.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #8b5cf6;                        /* Purple border */
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1); /* Purple glow */
}
```

### RESPONSIVE BREAKPOINTS

```css
/* Mobile - Form */
@media (max-width: 768px) {
  .form-main-title { font-size: 20px; }
  .form-section { padding: 20px; }
  .form-grid { grid-template-columns: 1fr; }  /* Single column */
}

/* Print - Report */
@media print {
  .inspection-page {
    margin: 0;
    page-break-after: always;
  }
  
  @page {
    size: A4 portrait;
    margin: 0;
  }
}
```

---

## INSPECTOR FORM - COMPLETE STRUCTURE

### Form Container

```typescript
// Component Structure
<div className="single-page-form">
  {/* Sticky Header */}
  <div className="form-sticky-header">
    <h1 className="form-main-title">Vehicle Inspection Form</h1>
    <div className="form-header-actions">
      <button className="btn-load-test">Load Test Data</button>
      <button className="btn-clear-all">Clear All</button>
      <button className="btn-save">Save Data</button>
      <button className="btn-view-report">View Report</button>
    </div>
  </div>

  {/* Form Content */}
  <div className="form-content-wrapper">
    {/* 14 Sections here */}
  </div>
</div>
```

### SECTION 1: INSPECTION INFORMATION (4 fields)

**Purpose:** Capture inspection metadata  
**Style:** White card with purple top border  
**Displays On:** Report Page 1 (Top card)

```typescript
{
  inspection: {
    id: string,              // Inspection ID *REQUIRED*
    date: string,            // Inspection Date *REQUIRED*
    location: string,        // Inspection Location
    inspector_name: string   // Inspector Name
  }
}
```

**HTML Structure:**
```jsx
<div className="form-section">
  <h2 className="section-title">Inspection Information</h2>
  <div className="form-grid">
    
    <div className="form-group">
      <label>Inspection ID *</label>
      <input 
        type="text"
        placeholder="e.g., IW-2025-001234"
        required
      />
    </div>

    <div className="form-group">
      <label>Inspection Date *</label>
      <input 
        type="date"
        required
      />
    </div>

    <div className="form-group">
      <label>Inspection Location</label>
      <input 
        type="text"
        placeholder="e.g., Mumbai, Maharashtra"
      />
    </div>

    <div className="form-group">
      <label>Inspector Name</label>
      <input 
        type="text"
        placeholder="Enter inspector name"
      />
    </div>

  </div>
</div>
```

**Report Display Format:**
- Page: 1
- Position: Top section below header
- Layout: 2×2 grid
- Background: Light gray (#f9fafb)
- Border: 1px solid #e5e7eb
- Label Style: Uppercase, gray (#6b7280), 10px
- Value Style: Bold, dark (#111827), 10px

---

### SECTION 2: VEHICLE DETAILS (17 fields)

**Purpose:** Vehicle registration and ownership information  
**Style:** White card with purple top border  
**Displays On:** Report Page 1 (Middle section)

```typescript
{
  vehicle: {
    registration_number: string,    // *REQUIRED* e.g., "MH 02 AB 1234"
    manufacturing_date: string,     // e.g., "March 2019"
    chassis_number: string,         // e.g., "MA3EWD81S00123456"
    engine_number: string,          // e.g., "K12M1234567"
    registration_date: string,      // Date picker
    insurance_validity: string,     // Date picker
    owner_name: string,             // e.g., "Rajesh Kumar"
    make_model: string,             // e.g., "Maruti Suzuki Swift"
    variant: string,                // e.g., "VXI (O) AT"
    fuel_type: string,              // Dropdown
    owner_count: string,            // Dropdown
    rc_type: string,                // Dropdown
    hypothecation: string,          // Dropdown
    cng: {
      present: string,              // Dropdown
      type: string,                 // Dropdown
      validity: string,             // Date picker
      endorsed: string              // Dropdown
    }
  }
}
```

**Dropdown Options:**
```typescript
fuel_type: ["Petrol", "Diesel", "CNG", "Electric"]
owner_count: ["1st Owner", "2nd Owner", "3rd Owner", "4th Owner+"]
rc_type: ["Private", "Commercial"]
hypothecation: ["Yes", "No"]
cng.present: ["Yes", "No"]
cng.type: ["Sequential", "Venturi"]
cng.endorsed: ["Yes", "No"]
```

**HTML Structure:**
```jsx
<div className="form-section">
  <h2 className="section-title">Vehicle Details</h2>
  <div className="form-grid">
    
    {/* Basic Details */}
    <div className="form-group">
      <label>Registration Number *</label>
      <input type="text" placeholder="e.g., MH 02 AB 1234" required />
    </div>

    <div className="form-group">
      <label>Manufacturing Date</label>
      <input type="text" placeholder="e.g., March 2019" />
    </div>

    {/* ... more fields ... */}

    <div className="form-group">
      <label>Fuel Type</label>
      <select>
        <option value="">Select fuel type</option>
        <option value="Petrol">Petrol</option>
        <option value="Diesel">Diesel</option>
        <option value="CNG">CNG</option>
        <option value="Electric">Electric</option>
      </select>
    </div>

  </div>

  {/* CNG Sub-section */}
  <h3 className="subsection-title">CNG Details (if applicable)</h3>
  <div className="form-grid">
    
    <div className="form-group">
      <label>CNG Present</label>
      <select>
        <option value="">Select</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
    </div>

    {/* ... more CNG fields ... */}

  </div>
</div>
```

**Report Display Format:**
- Page: 1
- Position: Below inspection info
- Layout: 2-column grid with CNG sub-section
- Bilingual Labels: "Vehicle Number / वाहन संख्या"

---

### SECTION 3: RATINGS (6 fields)

**Purpose:** 5-star ratings for inspection categories  
**Style:** White card with purple top border  
**Displays On:** Report Page 1 (Bottom section)

```typescript
{
  ratings: {
    interior: string,     // "1" to "5" (as string, not number)
    exterior: string,     // "1" to "5"
    engine: string,       // "1" to "5"
    test_drive: string,   // "1" to "5"
    structure: string,    // "1" to "5"
    electrical: string    // "1" to "5"
  }
}
```

**HTML Structure:**
```jsx
<div className="form-section">
  <h2 className="section-title">Ratings (1-5 Stars)</h2>
  <div className="form-grid">
    
    <div className="form-group">
      <label>Interior Rating</label>
      <select>
        <option value="">Select rating</option>
        <option value="1">⭐ (1 Star)</option>
        <option value="2">⭐⭐ (2 Stars)</option>
        <option value="3">⭐⭐⭐ (3 Stars)</option>
        <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
        <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
      </select>
    </div>

    {/* ... 5 more rating fields ... */}

  </div>
</div>
```

**Report Display Format:**
- Page: 1
- Position: Bottom section
- Layout: 3-column grid
- Visual: Star icons (filled yellow ⭐ for rating, empty gray ☆ for remaining)
- Example: Rating "4" → ⭐⭐⭐⭐☆

---

### SECTION 4: FLAGS & COMMENTS (10 fields)

**Purpose:** Key inspection flags and general comments  
**Style:** White card with purple top border  
**Displays On:** Report Page 2 (Two-column layout)

```typescript
{
  flags: {
    accidental: string,              // "Yes" or "No" (NOT boolean)
    flood_damage: string,            // "Yes" or "No"
    fire_damage: string,             // "Yes" or "No"
    rc_chassis_match: string,        // "Yes" or "No"
    service_logs_available: string   // "Yes" or "No"
  },
  comments: {
    engine: string,                  // Textarea
    structure: string,               // Textarea
    test_drive: string,              // Textarea
    exterior: string,                // Textarea
    interior: string                 // Textarea
  }
}
```

**Conditional Icon Logic:**
```typescript
// REVERSED LOGIC (No = Good = Green ✓)
accidental: "No"      → Green CheckCircle
accidental: "Yes"     → Red XCircle

flood_damage: "No"    → Green CheckCircle
flood_damage: "Yes"   → Red XCircle

fire_damage: "No"     → Green CheckCircle
fire_damage: "Yes"    → Red XCircle

// NORMAL LOGIC (Yes = Good = Green ✓)
rc_chassis_match: "Yes"           → Green CheckCircle
rc_chassis_match: "No"            → Red XCircle

service_logs_available: "Yes"     → Green CheckCircle
service_logs_available: "No"      → Red XCircle
```

**HTML Structure:**
```jsx
<div className="form-section">
  <h2 className="section-title">Key Inspection Flags</h2>
  <div className="form-grid">
    
    <div className="form-group">
      <label>Accidental Vehicle?</label>
      <select>
        <option value="">Select</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
    </div>

    {/* ... 4 more flag fields ... */}

  </div>

  <h2 className="section-title">Comments</h2>
  <div className="form-grid">
    
    <div className="form-group full-width">
      <label>Engine Comments</label>
      <textarea 
        placeholder="Enter observations about engine condition..."
        rows={4}
      />
    </div>

    {/* ... 4 more comment fields ... */}

  </div>
</div>
```

**Report Display Format:**
- Page: 2
- Position: Two-column layout (Flags left, Comments right)
- Icons: 16×16px CheckCircle/XCircle from lucide-react
- Colors: Green #10b981 for success, Red #ef4444 for error

---

### SECTION 5: FRONT VIEW INSPECTION (11 fields)

**Purpose:** Front bumper, bonnet, windshield inspection  
**Style:** White card with purple top border  
**Displays On:** Report Page 3 (Large image left, details right)

```typescript
{
  front: {
    bumper_condition: string,        // Text input - e.g., "Good"
    bumper_paint_depth: string,      // Text input - e.g., "120 µm"
    bumper_repainted: string,        // Dropdown: Yes, No
    bonnet_condition: string,        // Text input
    bonnet_paint_depth: string,      // Text input
    bonnet_repainted: string,        // Dropdown: Yes, No
    bonnet_company_fitted: string,   // Dropdown: Yes, No
    grill_condition: string,         // Text input
    windshield_original: string,     // Dropdown: Yes, No
    windshield_condition: string,    // Text input
    headlight_condition: string      // Text input
  }
}
```

**HTML Structure:**
```jsx
<div className="form-section">
  <h2 className="section-title">Front View Inspection</h2>
  <div className="form-grid">
    
    <div className="form-group">
      <label>Front Bumper Condition</label>
      <input type="text" placeholder="e.g., Good" />
    </div>

    <div className="form-group">
      <label>Front Bumper Paint Depth</label>
      <input type="text" placeholder="e.g., 120 µm" />
    </div>

    <div className="form-group">
      <label>Is Front Bumper Repainted?</label>
      <select>
        <option value="">Select</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
    </div>

    {/* ... 8 more fields ... */}

  </div>
</div>
```

**Report Display Format:**
- Page: 3
- Position: Large image (60% width) left, details (40% width) right
- Image: 280px height, object-fit: cover
- Layout: Details in compact vertical list

---

### SECTION 6: RHS (RIGHT HAND SIDE) INSPECTION (16 fields)

**Purpose:** Right side body panel inspection  
**Style:** White card with purple top border  
**Displays On:** Report Page 4

```typescript
{
  rhs: {
    fender_condition: string,
    fender_repainted: string,           // Dropdown: Yes, No
    fender_paint_depth: string,
    front_door_condition: string,
    front_door_repainted: string,       // Dropdown: Yes, No
    front_door_paint_depth: string,
    front_door_company_fitted: string,  // Dropdown: Yes, No
    rear_door_condition: string,
    rear_door_repainted: string,        // Dropdown: Yes, No
    rear_door_paint_depth: string,
    rear_door_company_fitted: string,   // Dropdown: Yes, No
    quarter_panel_condition: string,
    quarter_panel_repainted: string,    // Dropdown: Yes, No
    quarter_panel_paint_depth: string,
    window_glass_original: string,      // Dropdown: Yes, No
    side_mirror_condition: string
  }
}
```

**Report Display Format:**
- Page: 4
- Position: Large image left (60%), details right (40%) then full width below
- Top 6 fields: Compact list in right sidebar
- Bottom 10 fields: 2-column grid full width

---

### SECTION 7: LHS (LEFT HAND SIDE) INSPECTION (16 fields)

**Purpose:** Left side body panel inspection  
**Style:** White card with purple top border  
**Displays On:** Report Page 5

```typescript
{
  lhs: {
    fender_condition: string,
    fender_repainted: string,           // Dropdown: Yes, No
    fender_paint_depth: string,
    front_door_condition: string,
    front_door_repainted: string,       // Dropdown: Yes, No
    front_door_paint_depth: string,
    front_door_company_fitted: string,  // Dropdown: Yes, No
    rear_door_condition: string,
    rear_door_repainted: string,        // Dropdown: Yes, No
    rear_door_paint_depth: string,
    rear_door_company_fitted: string,   // Dropdown: Yes, No
    quarter_panel_condition: string,
    quarter_panel_repainted: string,    // Dropdown: Yes, No
    quarter_panel_paint_depth: string,
    window_glass_original: string,      // Dropdown: Yes, No
    side_mirror_condition: string
  }
}
```

**✅ CONFIRMATION:** ALL 16 LHS FIELDS ARE CAPTURED AND DISPLAYED ON REPORT PAGE 5

**Report Display Format:**
- Page: 5
- Position: Identical to RHS (Page 4)
- Layout: Large image left, 6 fields compact right, 10 fields grid below

---

### SECTION 8: REAR & ROOF INSPECTION (13 fields)

**Purpose:** Rear bumper, tailgate, and roof inspection  
**Style:** White card with purple top border  
**Displays On:** Report Page 6

```typescript
{
  rear: {
    bumper_condition: string,
    bumper_repainted: string,        // Dropdown: Yes, No
    bumper_paint_depth: string,
    windshield_condition: string,
    windshield_original: string,     // Dropdown: Yes, No
    tailgate_condition: string,
    tailgate_paint_depth: string,
    tailgate_repainted: string,      // Dropdown: Yes, No
    tail_lights_condition: string
  },
  roof: {
    condition: string,
    type: string,                    // Dropdown: Metal, Sunroof
    paint_depth: string,
    repainted: string                // Dropdown: Yes, No
  }
}
```

**Dropdown Options:**
```typescript
roof.type: ["Metal", "Sunroof"]
```

**Report Display Format:**
- Page: 6
- Position: Rear section top (with image), Roof section bottom
- Layout: Image + details, then separate roof details grid

---

### SECTION 9: INTERIOR INSPECTION (29 fields)

**Purpose:** Dashboard, cluster controls, and seat details  
**Style:** White card with purple top border  
**Displays On:** Report Page 7

```typescript
{
  interior: {
    // Dashboard Controls (9 fields)
    mil_light: string,              // Dropdown: Working, Not Working
    dashboard_condition: string,    // Dropdown: Good, Fair, Poor
    music_system: string,           // Dropdown: Working, Not Working
    steering_controls: string,      // Dropdown: Working, Not Working
    paddle_shifters: string,        // Dropdown: Working, Not Working, NA
    hand_brake: string,             // Dropdown: Working, Not Working
    speakers: string,               // Dropdown: Working, Not Working
    ac_vents: string,               // Dropdown: Working, Not Working
    ac_working: string,             // Dropdown: Excellent, Good, Fair, Poor
    
    // Cluster Controls (9 fields)
    steering_type: string,          // Dropdown: Power, Manual
    cruise_control: string,         // Dropdown: Working, Not Working, NA
    navigation: string,             // Dropdown: Working, Not Working, NA
    glove_box: string,              // Dropdown: Working, Not Working
    cabin_lights: string,           // Dropdown: Working, Not Working
    headlights: string,             // Dropdown: Working, Not Working
    wipers: string,                 // Dropdown: Working, Not Working
    trip_switch: string,            // Dropdown: Working, Not Working
    boot_lever: string,             // Dropdown: Working, Not Working
    
    // Additional Controls (8 fields)
    central_lock: string,           // Dropdown: Working, Not Working
    rear_wiper: string,             // Dropdown: Working, Not Working, NA
    rear_view_mirror: string,       // Dropdown: Working, Not Working
    bonnet_lever: string,           // Dropdown: Working, Not Working
    side_mirror_adjustment: string, // Dropdown: Manual, Electric
    fuel_lid_lever: string,         // Dropdown: Working, Not Working
    power_windows: string           // Dropdown: Working, Not Working
  },
  seats: {
    front_condition: string,        // Text input
    adjustment_type: string,        // Dropdown: Manual, Electric
    seat_belts: string              // Dropdown: Working, Not Working
  }
}
```

**Conditional Icon Logic:**
```typescript
// All Dashboard & Cluster items
if (value === "Working" || value === "Yes") {
  icon = Green CheckCircle (14×14px, #10b981)
} else {
  icon = Red XCircle (14×14px, #9ca3af)
}
```

**Dropdown Options:**
```typescript
// Dashboard
mil_light: ["Working", "Not Working"]
dashboard_condition: ["Good", "Fair", "Poor"]
music_system: ["Working", "Not Working"]
steering_controls: ["Working", "Not Working"]
paddle_shifters: ["Working", "Not Working", "NA"]
hand_brake: ["Working", "Not Working"]
speakers: ["Working", "Not Working"]
ac_vents: ["Working", "Not Working"]
ac_working: ["Excellent", "Good", "Fair", "Poor"]

// Cluster
steering_type: ["Power", "Manual"]
cruise_control: ["Working", "Not Working", "NA"]
navigation: ["Working", "Not Working", "NA"]
glove_box: ["Working", "Not Working"]
cabin_lights: ["Working", "Not Working"]
headlights: ["Working", "Not Working"]
wipers: ["Working", "Not Working"]
trip_switch: ["Working", "Not Working"]
boot_lever: ["Working", "Not Working"]

// Additional
central_lock: ["Working", "Not Working"]
rear_wiper: ["Working", "Not Working", "NA"]
rear_view_mirror: ["Working", "Not Working"]
bonnet_lever: ["Working", "Not Working"]
side_mirror_adjustment: ["Manual", "Electric"]
fuel_lid_lever: ["Working", "Not Working"]
power_windows: ["Working", "Not Working"]

// Seats
adjustment_type: ["Manual", "Electric"]
seat_belts: ["Working", "Not Working"]
```

**Report Display Format:**
- Page: 7
- Position: 3 images top, Dashboard left, Cluster right, Additional below, Seats bottom
- Layout: Two-column cards with icon lists
- Icons: Show for each item based on "Working" status

---

### SECTION 10: REAR CABIN & BOOT INSPECTION (7 fields)

**Purpose:** Rear seats and boot/trunk inspection  
**Style:** White card with purple top border  
**Displays On:** Report Page 8

```typescript
{
  rear_seats: {
    condition: string,      // Text input
    arm_rest: string,       // Dropdown: Yes, No
    ac_vent: string,        // Dropdown: Working, Not Working
    rhs_panel: string,      // Text input
    lhs_panel: string       // Text input
  },
  boot: {
    condition: string,      // Text input
    jack_available: string  // Dropdown: Yes, No
  }
}
```

**Report Display Format:**
- Page: 8
- Position: Rear cabin left, Boot image + details right

---

### SECTION 11: ENGINE INSPECTION (11 fields)

**Purpose:** Engine compartment and components  
**Style:** White card with purple top border  
**Displays On:** Report Page 9 (Top section)

```typescript
{
  engine: {
    oil_leak: string,               // Dropdown: Yes, No
    battery_condition: string,      // Dropdown: Good, Fair, Poor
    hose_pipes: string,             // Dropdown: Good, Fair, Poor
    oil_condition: string,          // Dropdown: Good, Fair, Poor
    wiring: string,                 // Dropdown: Good, Fair, Poor
    mounting: string,               // Dropdown: Good, Fair, Poor
    brake_oil_level: string,        // Dropdown: Adequate, Low
    coolant_level: string,          // Dropdown: Adequate, Low
    belts: string,                  // Dropdown: Good, Fair, Poor
    firewall_rust: string,          // Dropdown: Yes, No
    estimated_repair_cost: string   // Text input - e.g., "₹5,000"
  }
}
```

**Dropdown Options:**
```typescript
oil_leak: ["Yes", "No"]
battery_condition: ["Good", "Fair", "Poor"]
hose_pipes: ["Good", "Fair", "Poor"]
oil_condition: ["Good", "Fair", "Poor"]
wiring: ["Good", "Fair", "Poor"]
mounting: ["Good", "Fair", "Poor"]
brake_oil_level: ["Adequate", "Low"]
coolant_level: ["Adequate", "Low"]
belts: ["Good", "Fair", "Poor"]
firewall_rust: ["Yes", "No"]
```

**Report Display Format:**
- Page: 9
- Position: Top section with 3 images (Engine, Firewall, Battery)
- Layout: 3 images in row, then detail grid below

---

### SECTION 12: TYRES & WHEELS (20 fields - 5 tyres × 4 fields)

**Purpose:** Individual tyre and wheel inspection  
**Style:** White card with purple top border  
**Displays On:** Report Page 9 (Bottom section)

```typescript
{
  tyres: {
    rhs_front: {
      brand: string,              // Text input - e.g., "MRF"
      wheel_type: string,         // Dropdown: Alloy, Steel
      remaining_life: string,     // Text input - e.g., "70%"
      estimated_cost: string      // Text input - e.g., "₹4,000"
    },
    rhs_rear: {
      brand: string,
      wheel_type: string,
      remaining_life: string,
      estimated_cost: string
    },
    lhs_front: {
      brand: string,
      wheel_type: string,
      remaining_life: string,
      estimated_cost: string
    },
    lhs_rear: {
      brand: string,
      wheel_type: string,
      remaining_life: string,
      estimated_cost: string
    },
    spare: {
      brand: string,
      wheel_type: string,
      remaining_life: string,
      estimated_cost: string
    }
  }
}
```

**Dropdown Options:**
```typescript
wheel_type: ["Alloy", "Steel"]
```

**HTML Structure:**
```jsx
<div className="form-section">
  <h2 className="section-title">Tyres & Wheels - Part 1</h2>
  <div className="form-grid">
    
    {/* RHS Front Tyre */}
    <div className="form-group">
      <label>RHS Front - Tyre Brand</label>
      <input type="text" placeholder="e.g., MRF" />
    </div>
    <div className="form-group">
      <label>RHS Front - Wheel Type</label>
      <select>
        <option value="">Select</option>
        <option value="Alloy">Alloy</option>
        <option value="Steel">Steel</option>
      </select>
    </div>
    <div className="form-group">
      <label>RHS Front - Remaining Life</label>
      <input type="text" placeholder="e.g., 70%" />
    </div>
    <div className="form-group">
      <label>RHS Front - Estimated Cost</label>
      <input type="text" placeholder="e.g., ₹4,000" />
    </div>

    {/* Repeat for 4 more tyres... */}

  </div>
</div>
```

**Report Display Format:**
- Page: 9
- Position: Bottom section
- Layout: 5-column grid (or 3-column responsive)
- Each tyre: Image + 4 detail fields

---

### SECTION 13: STRUCTURE INSPECTION (15 fields)

**Purpose:** Vehicle structural integrity check  
**Style:** White card with purple top border  
**Displays On:** Report Page 10 (Top section)

```typescript
{
  structure: {
    upper_member: string,      // Dropdown: Original, Repaired, Replaced
    lower_member: string,      // Dropdown: Original, Repaired, Replaced
    cross_member: string,      // Dropdown: Original, Repaired, Replaced
    rhs_apron: string,         // Dropdown: Original, Repaired, Replaced
    lhs_apron: string,         // Dropdown: Original, Repaired, Replaced
    a_pillar_rhs: string,      // Dropdown: Original, Repaired, Replaced
    a_pillar_lhs: string,      // Dropdown: Original, Repaired, Replaced
    b_pillar_rhs: string,      // Dropdown: Original, Repaired, Replaced
    b_pillar_lhs: string,      // Dropdown: Original, Repaired, Replaced
    c_pillar_rhs: string,      // Dropdown: Original, Repaired, Replaced
    c_pillar_lhs: string,      // Dropdown: Original, Repaired, Replaced
    fender_wall_rhs: string,   // Dropdown: Original, Repaired, Replaced
    fender_wall_lhs: string,   // Dropdown: Original, Repaired, Replaced
    tailgate_frame: string,    // Dropdown: Original, Repaired, Replaced
    dicky_tub: string          // Dropdown: Original, Repaired, Replaced
  }
}
```

**Dropdown Options:**
```typescript
// ALL structure fields use the same 3 options:
["Original", "Repaired", "Replaced"]
```

**Report Display Format:**
- Page: 10
- Position: Top section
- Layout: 2-column grid of all 15 fields

---

### SECTION 14: PERFORMANCE & TEST DRIVE (12 fields)

**Purpose:** Test drive performance evaluation  
**Style:** White card with purple top border  
**Displays On:** Report Page 10 (Bottom section)

```typescript
{
  performance: {
    steering: string,               // Dropdown: Smooth, Stiff, Loose
    alignment: string,              // Dropdown: Perfect, Needs Adjustment
    ignition: string,               // Dropdown: Instant, Delayed
    clutch: string,                 // Dropdown: Good, Fair, Poor
    brakes: string,                 // Dropdown: Excellent, Good, Fair, Poor
    gear_shift: string,             // Dropdown: Smooth, Rough
    acceleration: string,           // Dropdown: Good, Fair, Poor
    suspension: string,             // Dropdown: Good, Fair, Poor
    engine_noise: string,           // Dropdown: Normal, Abnormal
    cng_mode: string,               // Dropdown: Working, Not Working, NA
    wheel_alignment: string,        // Dropdown: Perfect, Needs Adjustment
    estimated_repair_cost: string   // Text input - e.g., "₹3,000"
  }
}
```

**Dropdown Options:**
```typescript
steering: ["Smooth", "Stiff", "Loose"]
alignment: ["Perfect", "Needs Adjustment"]
ignition: ["Instant", "Delayed"]
clutch: ["Good", "Fair", "Poor"]
brakes: ["Excellent", "Good", "Fair", "Poor"]
gear_shift: ["Smooth", "Rough"]
acceleration: ["Good", "Fair", "Poor"]
suspension: ["Good", "Fair", "Poor"]
engine_noise: ["Normal", "Abnormal"]
cng_mode: ["Working", "Not Working", "NA"]
wheel_alignment: ["Perfect", "Needs Adjustment"]
```

**Report Display Format:**
- Page: 10
- Position: Bottom section
- Layout: 2-column grid

---

### IMAGE UPLOADS (21 images)

**Purpose:** Capture all inspection photos  
**Style:** Custom image upload component with preview  
**Integration:** Separate section or distributed within relevant sections

```typescript
{
  images: {
    // Page 2 Images (4)
    rhs_apron: string,              // Base64 or URL
    lhs_apron: string,              // Base64 or URL
    chassis_plate: string,          // Base64 or URL
    cng_plate: string,              // Base64 or URL
    
    // Page 3 Image (1)
    vehicle_front: string,
    
    // Page 4 Image (1)
    vehicle_rhs: string,
    
    // Page 5 Image (1)
    vehicle_lhs: string,
    
    // Page 6 Image (1)
    vehicle_rear: string,
    
    // Page 7 Images (3)
    dashboard: string,
    cluster_meter: string,
    driver_cabin: string,
    
    // Page 8 Image (1)
    boot_space: string,
    
    // Page 9 Images (8)
    engine_compartment: string,
    firewall: string,
    battery: string,
    tyre_rhs_front: string,
    tyre_rhs_rear: string,
    tyre_lhs_front: string,
    tyre_lhs_rear: string,
    spare_tyre: string,
    
    // Page 1 Image (1)
    rc_front: string
  }
}
```

**Image Upload Component:**
```jsx
<ImageUploadField
  label="Vehicle Front Image"
  value={formData.images.vehicle_front}
  onChange={(base64String) => handleInputChange('images', 'vehicle_front', base64String)}
/>
```

**Image Compression Specs:**
- Max width: 1200px
- Max height: 900px
- Format: JPEG
- Quality: 0.8
- Encoding: Base64
- Storage: localStorage + backend sync

---

## FINAL REPORT - 11 PAGES DETAILED

### Page Structure Template

Every page follows this structure:

```jsx
<div className="inspection-page">
  {/* Global Header */}
  <div className="global-header">
    <div className="header-logo">
      <div className="logo-box">
        <span className="logo-text">INSPECTIONWALE</span>
      </div>
    </div>
    <div className="header-contact">
      <div className="contact-item">
        <Phone className="contact-icon" />
        <span>+91 98765 43210</span>
      </div>
      <span className="contact-separator">|</span>
      <div className="contact-item">
        <Mail className="contact-icon" />
        <span>info@inspectionwale.com</span>
      </div>
    </div>
  </div>

  {/* Page Content */}
  <div className="inspection-content">
    {/* Page-specific content here */}
  </div>

  {/* Global Footer */}
  <div className="global-footer">
    <div className="footer-logo">
      <span className="footer-logo-text">INSPECTIONWALE</span>
    </div>
    <div className="footer-item">
      <CheckCircle className="footer-icon" />
      <span>Certified Inspection</span>
    </div>
    <div className="footer-item">
      <Shield className="footer-icon" />
      <span>200-Point Check</span>
    </div>
    <div className="footer-item">
      <Award className="footer-icon" />
      <span>Professional Report</span>
    </div>
  </div>
  <div className="page-number-footer">Page X of 11</div>
</div>
```

---

### PAGE 1: VEHICLE INFORMATION & RATINGS

**Layout:**
- Report Header (centered)
- Inspection Info Box (2×2 grid)
- Vehicle Details Card (2-column grid)
- Ratings Section (3-column grid with stars)

**Bilingual Labels:**
```
Inspection ID / निरीक्षण आईडी
Inspection Date / निरीक्षण तिथि
Inspection Location / निरीक्षण स्थान
Inspector Name / निरीक्षक का नाम
Vehicle Number / वाहन संख्या
Manufacturing Date / निर्माण तिथि
Chassis Number / चेसिस नंबर
Engine Number / इंजन नंबर
Registration Date / पंजीकरण तिथि
Insurance Validity / बीमा वैधता
Owner Name (RC) / मालिक का नाम (आरसी)
Make / Model / ब्रांड / मॉडल
Variant / वेरिएंट
Fuel Type / ईंधन प्रकार
Number of Owners / मालिकों की संख्या
RC Type / आरसी प्रकार
Hypothecation / हाइपोथिकेशन
CNG Fitment / सीएनजी फिटमेंट
CNG Type / सीएनजी प्रकार
CNG Validity Date / सीएनजी वैधता तिथि
CNG Endorsed on RC / आरसी पर सीएनजी समर्थन
Ratings / रेटिंग
Interior / आंतरिक
Exterior / बाहरी
Engine / इंजन
Test Drive / परीक्षण ड्राइव
Structure / संरचना
Electrical / विद्युत
```

**Star Rating Display:**
```jsx
{/* Example: Rating = "4" */}
<div className="rating-stars">
  <Star className="star-filled" />  {/* Filled yellow */}
  <Star className="star-filled" />
  <Star className="star-filled" />
  <Star className="star-filled" />
  <Star className="star-empty" />   {/* Empty gray outline */}
</div>
```

---

### PAGE 2: KEY HIGHLIGHTS

**Layout:**
- Section Header (bilingual, centered)
- Two-column cards
  - Left: Inspection Flags (5 items with icons)
  - Right: Additional Comments (5 comment boxes)
- Image Row (4 equal images)

**Bilingual Labels:**
```
Key Highlights / मुख्य विशेषताएं
Inspection Flags / निरीक्षण फ्लैग
Is Car Accidental? / क्या कार दुर्घटनाग्रस्त है?
Flood Damage / बाढ़ क्षति
Fire Damage / आग क्षति
RC & Chassis Match / आरसी और चेसिस मेल
Service Logs Available / सर्विस लॉग उपलब्ध
Additional Comments / अतिरिक्त टिप्पणियाँ
Engine / इंजन
Structure / संरचना
Test Drive / परीक्षण ड्राइव
Exterior / बाहरी
Interior / आंतरिक
RHS Apron Image / दायीं एप्रन छवि
LHS Apron Image / बायीं एप्रन छवि
Chassis Plate Image / चेसिस प्लेट छवि
CNG Plate Image / सीएनजी प्लेट छवि
```

**Flag Icon Implementation:**
```jsx
{/* Accidental (Reversed Logic) */}
<div className="flag-item">
  {data.flags.accidental === 'No' ? (
    <CheckCircle className="flag-icon flag-yes" />  {/* Green */}
  ) : (
    <XCircle className="flag-icon flag-no" />       {/* Red */}
  )}
  <span className="flag-label">Is Car Accidental? / क्या कार दुर्घटनाग्रस्त है?</span>
  <span className="flag-value">{data.flags.accidental}</span>
</div>

{/* RC Match (Normal Logic) */}
<div className="flag-item">
  {data.flags.rc_chassis_match === 'Yes' ? (
    <CheckCircle className="flag-icon flag-yes" />  {/* Green */}
  ) : (
    <XCircle className="flag-icon flag-no" />       {/* Red */}
  )}
  <span className="flag-label">RC & Chassis Match / आरसी और चेसिस मेल</span>
  <span className="flag-value">{data.flags.rc_chassis_match}</span>
</div>
```

**Image Row:**
```jsx
<div className="image-row-equal">
  <div className="image-card-equal">
    <img src={data.images.rhs_apron} alt="RHS Apron" className="inspection-image" />
    <div className="image-label">RHS Apron Image / दायीं एप्रन छवि</div>
  </div>
  {/* ... 3 more images ... */}
</div>
```

---

### PAGE 3: VEHICLE FRONT VIEW

**Layout:**
- Section Header (bilingual, centered)
- Image + Detail Layout (60% image left, 40% details right)

**Structure:**
```jsx
<div className="image-detail-layout">
  {/* Large Image */}
  <div className="large-image-container">
    <img 
      src={data.images.vehicle_front} 
      alt="Front View" 
      className="inspection-image-large"
      style={{height: '280px', objectFit: 'cover'}}
    />
  </div>

  {/* Detail Card */}
  <div className="detail-card compact-card">
    <div className="detail-item-compact">
      <span className="detail-label">Front Bumper Condition / फ्रंट बंपर स्थिति</span>
      <span className="detail-value">{data.front.bumper_condition}</span>
    </div>
    {/* ... 10 more detail items ... */}
  </div>
</div>
```

**Bilingual Labels (All 11 fields):**
```
Front Bumper Condition / फ्रंट बंपर स्थिति
Paint Depth Reading / पेंट गहराई रीडिंग
Is Front Bumper Repainted? / क्या फ्रंट बंपर दोबारा रंगा गया?
Bonnet Condition / बोनट स्थिति
Bonnet Paint Depth / बोनट पेंट गहराई
Is Bonnet Repainted? / क्या बोनट दोबारा रंगा गया?
Is Bonnet Company Fitted? / क्या बोनट कंपनी फिटेड है?
Front Grille Condition / फ्रंट ग्रिल स्थिति
Windshield Original / विंडशील्ड मूल
Windshield Condition / विंडशील्ड स्थिति
Headlight Condition / हेडलाइट स्थिति
```

---

### PAGE 4: VEHICLE RHS (RIGHT HAND SIDE)

**Layout:** Same as Page 3
- Large image left (60%)
- 6 compact details right (40%)
- 10 details in 2-column grid below (full width)

**Bilingual Labels (All 16 fields):**
```
RHS Fender Condition / दाहिना फेंडर स्थिति
Is RHS Fender Repainted? / क्या दाहिना फेंडर दोबारा रंगा गया?
RHS Fender Paint Depth / दाहिना फेंडर पेंट गहराई
RHS Front Door Condition / दाहिना फ्रंट डोर स्थिति
Is RHS Front Door Repainted? / क्या दाहिना फ्रंट डोर दोबारा रंगा गया?
RHS Front Door Paint Depth / दाहिना फ्रंट डोर पेंट गहराई
RHS Quarter Panel Condition / दाहिना क्वार्टर पैनल स्थिति
Is RHS Quarter Panel Repainted? / क्या दाहिना क्वार्टर पैनल दोबारा रंगा गया?
RHS Quarter Panel Paint Depth / दाहिना क्��ार्टर पैनल पेंट गहराई
RHS Door Glass Original / दाहिना डोर ग्लास मूल
RHS Side Mirror Condition / दाहिना साइड मिरर स्थिति
RHS Rear Door Condition / दाहिना रियर डोर स्थिति
Is RHS Rear Door Repainted? / क्या दाहिना रियर डोर दोबारा रंगा गया?
RHS Rear Door Paint Depth / दाहिना रियर डोर पेंट गहराई
RHS Front Door Company Fitted / दाहिना फ्रंट डोर कंपनी फिटेड
RHS Rear Door Company Fitted / दाहिना रियर डोर कंपनी फिटेड
```

---

### PAGE 5: VEHICLE LHS (LEFT HAND SIDE)

**Layout:** Identical to Page 4
- Large image left (60%)
- 6 compact details right (40%)
- 10 details in 2-column grid below (full width)

**✅ CONFIRMATION: ALL 16 LHS FIELDS ARE DISPLAYED HERE**

**Bilingual Labels (All 16 fields):**
```
LHS Fender Condition / बायां फेंडर स्थिति
LHS Fender Repainted? / क्या बायां फेंडर दोबारा रंगा गया?
LHS Fender Paint Depth / बायां फेंडर पेंट गहराई
LHS Front Door Condition / बायां फ्रंट डोर स्थिति
LHS Front Door Repainted? / क्या बायां फ्रंट डोर दोबारा रंगा गया?
LHS Front Door Paint Depth / बायां फ्रंट डोर पेंट गहराई
LHS Front Door Company Fitted? / बायां फ्रंट डोर कंपनी फिटेड?
LHS Rear Door Condition / बायां रियर डोर स्थिति
Is LHS Rear Door Repainted? / क्या बायां रियर डोर दोबारा रंगा गया?
LHS Rear Door Paint Depth / बायां रियर डोर पेंट गहराई
LHS Rear Door Company Fitted? / बायां रियर डोर कंपनी फिटेड?
LHS Quarter Panel Condition / बायां क्वार्टर पैनल स्थिति
Is LHS Quarter Panel Repainted? / क्या बायां क्वार्टर पैनल दोबारा रंगा गया?
LHS Quarter Panel Paint Depth / बायां क्वार्टर पैनल पेंट गहराई
LHS Door Glass Original? / बायां डोर ग्लास मूल?
LHS Side Mirror Condition / बायां साइड मिरर स्थिति
```

---

### PAGE 6: VEHICLE REAR & ROOF

**Layout:**
- Section Header
- Image + Detail Layout (Rear section)
- Detail Card (Roof section)

**Bilingual Labels:**
```
Vehicle Rear Image / वाहन पिछला दृश्य
Rear Bumper Condition / रियर बंपर स्थिति
Is Rear Bumper Repainted? / क्या रियर बंपर दोबारा रंगा गया?
Rear Bumper Paint Depth / रियर बंपर पेंट गहराई
Rear Windshield Condition / रियर विंडशील्ड स्थिति
Rear Windshield Original / रियर विंडशील्ड मूल
Tail Gate Condition / टेल गेट स्थिति
Tail Gate Paint Depth / टेल गेट पेंट गहराई
Is Tail Gate Repainted? / क्या टेल गेट दोबारा रंगा गया?
Tail Lights Condition / टेल लाइट्स स्थिति
Roof Condition / छत की स्थिति
Roof Type / छत का प्रकार
Roof Paint Depth / छत पेंट गहराई
Is Roof Repainted? / क्या छत दोबारा रंगी गई?
```

---

### PAGE 7: INTERIOR INSPECTION

**Layout:**
- Section Header
- 3 images in row (Dashboard, Cluster, Driver Cabin)
- Two-column cards (Dashboard left, Cluster right)
- Additional Controls card (full width)
- Seats details card

**Bilingual Labels:**
```
Interior Inspection / आंतरिक निरीक्षण
Dashboard Image / डैशबोर्ड छवि
Cluster Meter Image / क्लस्टर मीटर छवि
Driver Cabin Image / ड्राइवर केबिन छवि
Dashboard / डैशबोर्ड
MIL Light / एमआईएल लाइट
Dashboard Condition / डैशबोर्ड स्थिति
Music System / म्यूजिक सिस्टम
Steering Controls / स्टीयरिंग कंट्रोल
Paddle Shifters / पैडल शिफ्टर
Hand Brake / हैंड ब्रेक
Speakers / स्पीकर
AC Vents / एसी वेंट
AC Performance / एसी प्रदर्शन
Cluster Controls / क्लस्टर कंट्रोल
Steering Type / स्टीयरिंग प्रकार
Cruise Control / क्रूज़ कंट्रोल
Navigation / नेविगेशन
Glove Box / ग्लव बॉक्स
Cabin Lights / केबिन लाइट्स
Headlights / हेडलाइट्स
Wipers / वाइपर
Trip Switch / ट्रिप स्विच
Boot Lever / बूट लीवर
Additional Controls & Features / अतिरिक्त नियंत्रण और सुविधाएँ
Central Lock / सेंट्रल लॉक
Rear Wiper / रियर वाइपर
Rear View Mirror / रियर व्यू मिरर
Bonnet Lever / बोनट लीवर
Side Mirror Adjustment / साइड मिरर एडजस्टमेंट
Fuel Lid Lever / फ्यूल लिड लीवर
Power Windows / पावर विंडोज
Front Seat Condition / फ्रंट सीट स्थिति
Seat Adjustment Type / सीट एडजस्टमेंट प्रकार
Seat Belts / सीट बेल्ट
```

**Dashboard Icon List Implementation:**
```jsx
<div className="icon-detail-list">
  <div className="icon-detail-item">
    {data.interior.mil_light === 'Working' || data.interior.mil_light === 'Yes' ? (
      <CheckCircle className="check-icon-small" />  {/* 14×14px green */}
    ) : (
      <XCircle className="x-icon-small" />          {/* 14×14px gray */}
    )}
    <span className="icon-detail-label">MIL Light / एमआईएल लाइट</span>
    <span className="icon-detail-value">{data.interior.mil_light}</span>
  </div>
  {/* ... 8 more dashboard items ... */}
</div>
```

---

### PAGE 8: REAR CABIN & BOOT

**Layout:**
- Section Header
- Two-column layout (Rear Cabin left, Boot image + details right)
- Interior Comments box (full width)

**Bilingual Labels:**
```
Rear Cabin Inspection / पिछली केबिन निरीक्षण
Rear Cabin / पिछली केबिन
Rear Seat Condition / पिछली सीट स्थिति
Arm Rest / आर्म रेस्ट
Rear AC Vent / पिछला एसी वेंट
RHS Interior Panel / दाहिना आंतरिक पैनल
LHS Interior Panel / बायां आंतरिक पैनल
Boot Inspection / बूट निरीक्षण
Boot Image / बूट छवि
Boot Condition / बूट स्थिति
Jack & Tool Kit / जैक और टूल किट
Interior Comments / आंतरिक टिप्पणियाँ
```

---

### PAGE 9: ENGINE & TYRES

**Layout:**
- Section Header (Engine)
- 3 images in row (Engine, Firewall, Battery)
- Engine details card (2-column grid)
- Section Header (Tyres)
- 5 tyre cards in responsive grid

**Bilingual Labels - Engine:**
```
Engine Inspection / इंजन निरीक्षण
Engine Compartment / इंजन कम्पार्टमेंट
Firewall / फ़ायरवॉल
Battery / बैटरी
Oil Leaks / तेल रिसाव
Battery Condition / बैटरी स्थिति
Hose Pipes / होज पाइप
Engine Oil / इंजन ऑयल
Wiring / वायरिंग
Engine Mounts / इंजन माउंट
Brake Oil Level / ब्रेक ऑयल स्तर
Coolant Level / कूलेंट स्तर
Belts / बेल्ट
Firewall Rust / फ़ायरवॉल जंग
Estimated Repair Cost / अनुमानित मरम्मत लागत
```

**Bilingual Labels - Tyres:**
```
Tyres & Wheels / टायर और पहिये
Front RHS / फ्रंट दाहिना
Rear RHS / रियर दाहिना
Front LHS / फ्रंट बायां
Rear LHS / रियर बायां
Spare Tyre / स्पेयर टायर
Tyre Brand / टायर ब्रांड
Wheel Type / व्हील प्रकार
Remaining Life / शेष जीवन
Est. Replacement Cost / अनुमानित लागत
```

**Tyre Card Structure:**
```jsx
<div className="tyre-grid">
  <div className="tyre-card">
    <img src={data.images.tyre_rhs_front} className="tyre-image" style={{height: '100px'}} />
    <h4 className="tyre-title">Front RHS / फ्रंट दाहिना</h4>
    <div className="tyre-details">
      <div className="tyre-detail-item">
        <span className="tyre-label">Tyre Brand / टायर ब्रांड</span>
        <span className="tyre-value">{data.tyres.rhs_front.brand}</span>
      </div>
      {/* ... 3 more detail items ... */}
    </div>
  </div>
  {/* ... 4 more tyres ... */}
</div>
```

---

### PAGE 10: STRUCTURE & PERFORMANCE

**Layout:**
- Section Header (Structure)
- Structure details card (2-column grid, 15 items)
- Section Header (Performance)
- Performance details card (2-column grid, 12 items)

**Bilingual Labels - Structure:**
```
Structure Inspection / संरचना निरीक्षण
Upper Member / अपर मेम्बर
Lower Member / लोअर मेम्बर
Cross Member / क्रॉस मेम्बर
RHS Apron / दाहिना एप्रन
LHS Apron / बायां एप्रन
A Pillar RHS / ए पिलर दाहिना
A Pillar LHS / ए पिलर बायां
B Pillar RHS / बी पिलर दाहिना
B Pillar LHS / बी पिलर बायां
C Pillar RHS / सी पिलर दाहिना
C Pillar LHS / सी पिलर बायां
RHS Fender Wall / दाहिना फेंडर वॉल
LHS Fender Wall / बायां फेंडर वॉल
Tailgate Frame / टेलगेट फ्रेम
Dicky Tub / डिक्की टब
```

**Bilingual Labels - Performance:**
```
Performance Test Drive / प्रदर्शन परीक्षण ड्राइव
Steering / स्टीयरिंग
Alignment / एलाइनमेंट
Ignition / इग्निशन
Clutch / क्लच
Brakes / ब्रेक
Gear Shifting / गियर शिफ्टिंग
Acceleration / एक्सीलरेशन
Suspension / सस्पेंशन
Engine Noise / इंजन शोर
CNG Performance / सीएनजी प्रदर्शन
Wheel Alignment / व्हील एलाइनमेंट
Estimated Repair Cost / अनुमानित मरम्मत लागत
```

---

### PAGE 11: DISCLAIMER

**Layout:**
- Section Header
- Disclaimer card (centered, full width)
- Bilingual disclaimer text (English then Hindi)
- Signature section

**Content:**
```jsx
<div className="disclaimer-card">
  <h2 className="disclaimer-title">
    DISCLAIMER / अस्वीकरण
  </h2>
  
  <div className="disclaimer-content">
    <p>This inspection report is based on visual inspection...</p>
    {/* ... English disclaimer text ... */}
  </div>
  
  <div className="disclaimer-divider"></div>
  
  <div className="disclaimer-content hindi">
    <p>यह निरीक्षण रिपोर्ट दृश्य निरीक्षण पर आधारित है...</p>
    {/* ... Hindi disclaimer text ... */}
  </div>
  
  <div className="signature-section">
    <div className="signature-line-disclaimer"></div>
    <p className="signature-text">Authorized Signature</p>
    <p className="company-name">INSPECTIONWALE</p>
  </div>
</div>
```

**Styling:**
- Disclaimer title: Red (#dc2626), uppercase, 13px
- Text: 9px, line-height 1.5
- Signature line: 200px width, gray
- Company name: 12px, bold, letter-spacing 1px

---

## DATA FLOW & INTEGRATION

### Auto-Save Implementation

```typescript
// Form Component
const [formData, setFormData] = useState(getInspectionData());

// Auto-save with 500ms debounce
useEffect(() => {
  const timer = setTimeout(() => {
    saveInspectionData(formData);
    console.log('✅ Form data auto-saved to cache');
  }, 500); // Debounce for 500ms

  return () => clearTimeout(timer);
}, [formData]);
```

### Data Loader Utility

```typescript
// /src/utils/dataLoader.ts

import placeholdersData from '../data/placeholders.json';

// Helper function to replace empty strings with "NA"
function replaceEmptyWithNA(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj === '' ? 'NA' : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => replaceEmptyWithNA(item));
  }

  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = replaceEmptyWithNA(obj[key]);
    }
  }
  return result;
}

export function getInspectionData() {
  // Try to load from localStorage first
  const savedData = localStorage.getItem('inspectionData');
  
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      // Replace empty strings with "NA" for report display
      return replaceEmptyWithNA(data);
    } catch (error) {
      console.error('Error parsing saved inspection data:', error);
      return replaceEmptyWithNA(placeholdersData);
    }
  }
  
  // Return default placeholders if no saved data
  return replaceEmptyWithNA(placeholdersData);
}

export function saveInspectionData(data: any) {
  localStorage.setItem('inspectionData', JSON.stringify(data));
}

export function clearInspectionData() {
  localStorage.removeItem('inspectionData');
}
```

### Complete Data Structure

```typescript
interface InspectionData {
  report: {
    title: string;
    tagline: string;
    subtagline: string;
  };
  inspection: {
    id: string;
    date: string;
    location: string;
    inspector_name: string;
  };
  vehicle: {
    registration_number: string;
    manufacturing_date: string;
    chassis_number: string;
    engine_number: string;
    registration_date: string;
    insurance_validity: string;
    owner_name: string;
    make_model: string;
    variant: string;
    fuel_type: string;
    owner_count: string;
    rc_type: string;
    hypothecation: string;
    cng: {
      present: string;
      type: string;
      validity: string;
      endorsed: string;
    };
  };
  ratings: {
    interior: string;
    exterior: string;
    engine: string;
    test_drive: string;
    structure: string;
    electrical: string;
  };
  flags: {
    accidental: string;
    flood_damage: string;
    fire_damage: string;
    rc_chassis_match: string;
    service_logs_available: string;
  };
  comments: {
    engine: string;
    structure: string;
    test_drive: string;
    exterior: string;
    interior: string;
  };
  front: {
    bumper_condition: string;
    bumper_paint_depth: string;
    bumper_repainted: string;
    bonnet_condition: string;
    bonnet_paint_depth: string;
    bonnet_repainted: string;
    bonnet_company_fitted: string;
    grill_condition: string;
    windshield_original: string;
    windshield_condition: string;
    headlight_condition: string;
  };
  rhs: {
    fender_condition: string;
    fender_repainted: string;
    fender_paint_depth: string;
    front_door_condition: string;
    front_door_repainted: string;
    front_door_paint_depth: string;
    front_door_company_fitted: string;
    rear_door_condition: string;
    rear_door_repainted: string;
    rear_door_paint_depth: string;
    rear_door_company_fitted: string;
    quarter_panel_condition: string;
    quarter_panel_repainted: string;
    quarter_panel_paint_depth: string;
    window_glass_original: string;
    side_mirror_condition: string;
  };
  lhs: {
    fender_condition: string;
    fender_repainted: string;
    fender_paint_depth: string;
    front_door_condition: string;
    front_door_repainted: string;
    front_door_paint_depth: string;
    front_door_company_fitted: string;
    rear_door_condition: string;
    rear_door_repainted: string;
    rear_door_paint_depth: string;
    rear_door_company_fitted: string;
    quarter_panel_condition: string;
    quarter_panel_repainted: string;
    quarter_panel_paint_depth: string;
    window_glass_original: string;
    side_mirror_condition: string;
  };
  rear: {
    bumper_condition: string;
    bumper_repainted: string;
    bumper_paint_depth: string;
    windshield_condition: string;
    windshield_original: string;
    tailgate_condition: string;
    tailgate_paint_depth: string;
    tailgate_repainted: string;
    tail_lights_condition: string;
  };
  roof: {
    condition: string;
    type: string;
    paint_depth: string;
    repainted: string;
  };
  interior: {
    mil_light: string;
    dashboard_condition: string;
    music_system: string;
    steering_controls: string;
    paddle_shifters: string;
    hand_brake: string;
    speakers: string;
    ac_vents: string;
    ac_working: string;
    steering_type: string;
    cruise_control: string;
    navigation: string;
    glove_box: string;
    cabin_lights: string;
    headlights: string;
    wipers: string;
    trip_switch: string;
    boot_lever: string;
    central_lock: string;
    rear_wiper: string;
    rear_view_mirror: string;
    bonnet_lever: string;
    side_mirror_adjustment: string;
    fuel_lid_lever: string;
    power_windows: string;
  };
  seats: {
    front_condition: string;
    adjustment_type: string;
    seat_belts: string;
  };
  rear_seats: {
    condition: string;
    arm_rest: string;
    ac_vent: string;
    rhs_panel: string;
    lhs_panel: string;
  };
  boot: {
    condition: string;
    jack_available: string;
  };
  engine: {
    oil_leak: string;
    battery_condition: string;
    hose_pipes: string;
    oil_condition: string;
    wiring: string;
    mounting: string;
    brake_oil_level: string;
    coolant_level: string;
    belts: string;
    firewall_rust: string;
    estimated_repair_cost: string;
  };
  tyres: {
    rhs_front: {
      brand: string;
      wheel_type: string;
      remaining_life: string;
      estimated_cost: string;
    };
    rhs_rear: {
      brand: string;
      wheel_type: string;
      remaining_life: string;
      estimated_cost: string;
    };
    lhs_front: {
      brand: string;
      wheel_type: string;
      remaining_life: string;
      estimated_cost: string;
    };
    lhs_rear: {
      brand: string;
      wheel_type: string;
      remaining_life: string;
      estimated_cost: string;
    };
    spare: {
      brand: string;
      wheel_type: string;
      remaining_life: string;
      estimated_cost: string;
    };
  };
  structure: {
    upper_member: string;
    lower_member: string;
    cross_member: string;
    rhs_apron: string;
    lhs_apron: string;
    a_pillar_rhs: string;
    a_pillar_lhs: string;
    b_pillar_rhs: string;
    b_pillar_lhs: string;
    c_pillar_rhs: string;
    c_pillar_lhs: string;
    fender_wall_rhs: string;
    fender_wall_lhs: string;
    tailgate_frame: string;
    dicky_tub: string;
  };
  performance: {
    steering: string;
    alignment: string;
    ignition: string;
    clutch: string;
    brakes: string;
    gear_shift: string;
    acceleration: string;
    suspension: string;
    engine_noise: string;
    cng_mode: string;
    wheel_alignment: string;
    estimated_repair_cost: string;
  };
  images: {
    rhs_apron: string;
    lhs_apron: string;
    chassis_plate: string;
    cng_plate: string;
    vehicle_front: string;
    vehicle_rhs: string;
    vehicle_lhs: string;
    vehicle_rear: string;
    dashboard: string;
    cluster_meter: string;
    driver_cabin: string;
    boot_space: string;
    engine_compartment: string;
    firewall: string;
    battery: string;
    tyre_rhs_front: string;
    tyre_rhs_rear: string;
    tyre_lhs_front: string;
    tyre_lhs_rear: string;
    spare_tyre: string;
    rc_front: string;
  };
}
```

---

## BACKEND API SPECIFICATIONS

### Required Endpoints

```typescript
// 1. Create Inspection
POST /api/inspection/create
Request Body: InspectionData (complete structure above)
Response: { id: string, message: string }

// 2. Get Inspection by ID
GET /api/inspection/{id}
Response: InspectionData

// 3. Update Inspection
PUT /api/inspection/{id}
Request Body: Partial<InspectionData> or InspectionData
Response: { message: string }

// 4. Delete Inspection
DELETE /api/inspection/{id}
Response: { message: string }

// 5. Upload Images (Optional separate endpoint)
POST /api/inspection/{id}/images
Request: multipart/form-data
Response: { imageUrls: string[] }

// 6. Get All Inspections (List)
GET /api/inspections?page=1&limit=20
Response: {
  inspections: Array<{
    id: string;
    vehicle_number: string;
    date: string;
    inspector: string;
  }>;
  total: number;
  page: number;
  limit: number;
}
```

### Validation Rules

```typescript
// Required Fields
inspection.id: required, string, min: 5 characters
inspection.date: required, valid date format
vehicle.registration_number: required, string

// Data Format Validation
All "Yes"/"No" fields: must be exactly "Yes" or "No" (not boolean)
All ratings: must be "1", "2", "3", "4", or "5" (as strings)
All dropdown fields: must match exact values from dropdown options

// Example Validation
if (data.flags.accidental !== "Yes" && data.flags.accidental !== "No") {
  throw new Error("flags.accidental must be 'Yes' or 'No'");
}

if (!["1", "2", "3", "4", "5"].includes(data.ratings.interior)) {
  throw new Error("ratings.interior must be '1' to '5' as string");
}
```

### Sample Request/Response

```json
// POST /api/inspection/create
{
  "inspection": {
    "id": "IW-2025-001234",
    "date": "2025-01-15",
    "location": "Mumbai, Maharashtra",
    "inspector_name": "Rajesh Kumar"
  },
  "vehicle": {
    "registration_number": "MH 02 AB 1234",
    "make_model": "Maruti Suzuki Swift",
    "fuel_type": "Petrol",
    "cng": {
      "present": "No",
      "type": "",
      "validity": "",
      "endorsed": ""
    }
  },
  "flags": {
    "accidental": "No",
    "flood_damage": "No",
    "fire_damage": "No",
    "rc_chassis_match": "Yes",
    "service_logs_available": "Yes"
  },
  "ratings": {
    "interior": "4",
    "exterior": "5",
    "engine": "4",
    "test_drive": "5",
    "structure": "5",
    "electrical": "4"
  },
  // ... all other fields
}

// Response
{
  "id": "IW-2025-001234",
  "message": "Inspection created successfully"
}
```

---

## IMPLEMENTATION GUIDE

### Step 1: Setup Project Structure

```bash
/src
  /app
    /components
      SinglePageForm.tsx           # Main form component
      InspectionPage.tsx           # Page wrapper
      Page1Header.tsx              # Report page 1
      Page2KeyHighlights.tsx       # Report page 2
      Page3FrontView.tsx           # Report page 3
      Page4RHSSide.tsx             # Report page 4
      Page5LHSSide.tsx             # Report page 5
      Page6RearRoof.tsx            # Report page 6
      Page7Interior.tsx            # Report page 7
      Page8RearCabinBoot.tsx       # Report page 8
      Page9EngineTyres.tsx         # Report page 9
      Page10StructurePerformance.tsx # Report page 10
      Page11Disclaimer.tsx         # Report page 11
      ImageUploadField.tsx         # Image upload component
    App.tsx                        # Main app
  /utils
    dataLoader.ts                  # Data management
    testDataHelper.ts              # Test data
  /data
    placeholders.json              # Default data
  /styles
    inspection-report.css          # Report styles
    single-page-form.css           # Form styles
    theme.css                      # Theme variables
```

### Step 2: Implement Form Component

```typescript
// /src/app/components/SinglePageForm.tsx

import React, { useState, useEffect } from 'react';
import { Save, FileText, Trash2, Database } from 'lucide-react';
import { getInspectionData, saveInspectionData, clearInspectionData } from '../../utils/dataLoader';
import { ImageUploadField } from './ImageUploadField';

interface SinglePageFormProps {
  onSave: (formData: any) => void;
  onViewReport: () => void;
}

export function SinglePageForm({ onSave, onViewReport }: SinglePageFormProps) {
  const [formData, setFormData] = useState(getInspectionData());
  const [errors, setErrors] = useState<any>({});

  // Auto-save form data to cache whenever it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveInspectionData(formData);
      console.log('✅ Form data auto-saved to cache');
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timer);
  }, [formData]);

  const handleInputChange = (section: string, field: string, value: any, subField?: string) => {
    setFormData((prev: any) => {
      const newData = { ...prev };
      if (subField) {
        newData[section] = {
          ...newData[section],
          [field]: {
            ...newData[section][field],
            [subField]: value
          }
        };
      } else {
        newData[section] = {
          ...newData[section],
          [field]: value
        };
      }
      return newData;
    });
  };

  const handleSaveData = () => {
    saveInspectionData(formData);
    onSave(formData);
    alert('✅ Data saved successfully!');
  };

  const handleClearAll = () => {
    if (confirm('⚠️ Clear all data? This action cannot be undone.')) {
      clearInspectionData();
      setFormData(getInspectionData());
      alert('🗑️ All data cleared!');
    }
  };

  return (
    <div className="single-page-form">
      {/* Sticky Header */}
      <div className="form-sticky-header">
        <h1 className="form-main-title">Vehicle Inspection Form</h1>
        <div className="form-header-actions">
          <button onClick={handleClearAll} className="btn-clear-all">
            <Trash2 size={18} />
            Clear All
          </button>
          <button onClick={handleSaveData} className="btn-save">
            <Save size={18} />
            Save Data
          </button>
          <button onClick={onViewReport} className="btn-view-report">
            <FileText size={18} />
            View Report
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="form-content-wrapper">
        {/* Render all 14 sections here */}
      </div>
    </div>
  );
}
```

### Step 3: Implement Report Pages

```typescript
// Example: /src/app/components/Page2KeyHighlights.tsx

import React from 'react';
import { InspectionPage } from './InspectionPage';
import { CheckCircle, XCircle } from 'lucide-react';
import { getInspectionData } from '../../utils/dataLoader';

export function Page2KeyHighlights() {
  const data = getInspectionData();
  
  return (
    <InspectionPage pageNumber={2}>
      <h2 className="section-header-bilingual">Key Highlights / मुख्य विशेषताएं</h2>

      <div className="two-column-cards">
        {/* Inspection Flags Card */}
        <div className="detail-card">
          <h3 className="card-title">Inspection Flags / निरीक्षण फ्लैग</h3>
          <div className="flag-list">
            <div className="flag-item">
              {data.flags.accidental === 'No' ? (
                <CheckCircle className="flag-icon flag-yes" />
              ) : (
                <XCircle className="flag-icon flag-no" />
              )}
              <span className="flag-label">Is Car Accidental? / क्या कार दुर्घटनाग्रस्त है?</span>
              <span className="flag-value">{data.flags.accidental}</span>
            </div>
            {/* ... more flags ... */}
          </div>
        </div>

        {/* Comments Card */}
        <div className="detail-card">
          <h3 className="card-title">Additional Comments / अतिरिक्त टिप्पणियाँ</h3>
          <div className="comment-list">
            <div className="comment-item">
              <span className="comment-label">Engine / इंजन</span>
              <span className="comment-text">{data.comments.engine}</span>
            </div>
            {/* ... more comments ... */}
          </div>
        </div>
      </div>

      {/* Image Row */}
      <div className="image-row-equal">
        <div className="image-card-equal">
          <img src={data.images.rhs_apron} alt="RHS Apron" className="inspection-image" />
          <div className="image-label">RHS Apron Image / दायीं एप्रन छवि</div>
        </div>
        {/* ... 3 more images ... */}
      </div>
    </InspectionPage>
  );
}
```

### Step 4: Testing Checklist

```markdown
✅ Form Functionality
- [ ] All 208 fields render correctly
- [ ] Auto-save triggers every 500ms
- [ ] Load Test Data button works
- [ ] Clear All button works
- [ ] Save Data button works
- [ ] View Report button navigates correctly

✅ Data Validation
- [ ] Required fields show errors when empty
- [ ] Dropdown values are restricted to specified options
- [ ] Date pickers accept valid dates only
- [ ] Text inputs accept any text
- [ ] Image uploads compress and convert to base64

✅ Report Display
- [ ] All 11 pages render correctly
- [ ] Bilingual labels display in "English / Hindi" format
- [ ] Conditional icons show correct colors
- [ ] Star ratings display correctly (filled/empty)
- [ ] Empty values display as "NA"
- [ ] All images load correctly
- [ ] Print layout is A4 (210×297mm)

✅ Data Flow
- [ ] Form data saves to localStorage
- [ ] Report loads data from localStorage
- [ ] Empty values convert to "NA"
- [ ] Backend API accepts data
- [ ] Backend API returns data correctly
```

---

## CHATGPT PROMPT READY

Copy the following prompt to ChatGPT for implementation assistance:

---

**PROMPT START**

I need you to implement a complete Vehicle Inspection System based on this specification. The system consists of:

## System Requirements

### Inspector Form (Single-Page Continuous Scroll)
- **Design:** Google Forms style with purple gradient background (135deg, #667eea to #764ba2)
- **Layout:** Max-width 900px, white card sections with 12px border-radius
- **Sections:** 14 sections total
- **Total Fields:** 208 (187 data fields + 21 image uploads)
- **Auto-save:** 500ms debounce to localStorage
- **Sticky Header:** White, with 4 buttons (Load Test Data, Clear All, Save, View Report)

### Final Report (11 A4 Pages)
- **Format:** A4 Portrait (210mm × 297mm)
- **Margins:** 15mm all sides
- **Style:** Professional automotive inspection (white background, light gray dividers)
- **Language:** Bilingual (English/Hindi) in format "English / Hindi"
- **Icons:** Conditional green checkmarks / red crosses based on values
- **Print Ready:** Page break after each page

## Complete Data Structure

```typescript
[Insert complete InspectionData interface from above]
```

## All 14 Form Sections

**Section 1: Inspection Information (4 fields)**
[Copy details from above]

**Section 2: Vehicle Details (17 fields)**
[Copy details from above]

[... Continue for all 14 sections ...]

## All 11 Report Pages

**Page 1: Vehicle Information & Ratings**
[Copy layout and labels from above]

**Page 2: Key Highlights**
[Copy layout, conditional icon logic from above]

[... Continue for all 11 pages ...]

## CSS Specifications

**Colors:**
- Report Background: #ffffff
- Form Background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
- Success Icon: #10b981
- Error Icon: #ef4444
- Text Primary: #111827
- Text Secondary: #374151
- Border: #e5e7eb

**Typography:**
- Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif
- Form Title: 24px, 700
- Section Title: 22px, 700
- Report Header: 14px, 700

**Key CSS Classes:**
[Copy relevant CSS specifications from above]

## Implementation Requirements

1. Create SinglePageForm component with all 14 sections
2. Implement auto-save with 500ms debounce
3. Create all 11 report page components
4. Implement conditional icon logic for flags
5. Implement star rating display
6. Ensure empty values display as "NA"
7. Make all labels bilingual as specified
8. Ensure A4 print layout with proper margins

## Tech Stack
- React 18+ with TypeScript
- localStorage for data persistence
- lucide-react for icons
- CSS modules for styling

Please implement this complete system with all components, proper TypeScript types, and ensure it matches the design specifications exactly.

**PROMPT END**

---

## SUMMARY

This master specification document contains:

- ✅ Complete design system (colors, typography, layout, CSS specs)
- ✅ All 14 form sections with exact field definitions
- ✅ All 11 report pages with bilingual labels
- ✅ Conditional logic for icons (5 flags + 14 dashboard items)
- ✅ Complete data structure (TypeScript interfaces)
- ✅ Data flow implementation (auto-save, localStorage, "NA" conversion)
- ✅ Backend API specifications (endpoints, validation, sample requests)
- ✅ Implementation guide (project structure, code samples, testing)
- ✅ Ready-to-use ChatGPT prompt

**Total Documentation:** Single comprehensive file covering all aspects.

**Ready for:** Copy-paste to ChatGPT, manual implementation, or team handoff.

---

**Last Updated:** December 28, 2025  
**Version:** 3.0 - Master Specification  
**Status:** ✅ Complete and Production Ready
