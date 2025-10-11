# PDF Redesign Requirements - Clean Professional Design

## Current Problems

1. **Images not displaying** - 16 pages with most blank
2. **Too many fancy colors** - Gradients, blues, greens everywhere
3. **Not matching template** - Should look like Indian ITR forms
4. **Missing header** - Should say "InspectionWale - Vehicle Inspection Report | Rebranded from Whizzcheck"

---

## Required Design (From Template)

### Color Scheme
- **Headings:** `#004a99` (professional blue) 
- **Body text:** `#000000` (black)
- **Labels:** `#333333` (dark gray)
- **Backgrounds:** `#f7f9fc` (very light blue-gray for notes sections only)
- **Borders:** `#cccccc` (light gray)
- **NO gradients, NO fancy effects**

### Typography
- **Primary font:** Montserrat (or Helvetica if Montserrat not available in PDFKit)
- **Heading size:** 14-18px
- **Body size:** 12px
- **Label size:** 11px

### Layout
- **Page size:** A4 (595x842 pt)
- **Margins:** 18mm (~51pt) all sides
- **Max width:** ~515pt

### Header Section
```
[Logo] InspectionWale - Vehicle Inspection Report          Inspection ID: INS-xxx
       Rebranded from Whizzcheck                          Date: DD MMM YYYY
-------------------------------------------------------------------
```

### Section Structure
1. **Vehicle Registration Details** (table format, 2 columns)
2. **Current Owner Details** (table format)
3. **Key Highlights** (light background box with bullet points)
4. **Exterior / Body** (table + 3-column image grid)
5. **Interior** (table + images)
6. **Engine & Mechanical** (table + images)  
7. **Tires & Wheels** (table + images)
8. **Structure & Undercarriage** (table + images)
9. **Test Drive** (notes section)
10. **Issues & Recommendations** (highlighted sections)
11. **Footer** (disclaimer text)

---

## Major Code Changes Needed

### 1. Remove All Fancy Graphics
**Current code has:**
```javascript
// ❌ REMOVE: Gradient backgrounds
function drawGradientBg(x, y, width, height, color1, color2) { ... }

// ❌ REMOVE: Glossy effects
doc.rect(0, 0, 595, 140).fill(colors.primary);
for (let i = 0; i < 60; i++) {
  const alpha = (60 - i) / 200;
  doc.rect(0, i, 595, 1).fillOpacity(alpha).fill('#ffffff');
}

// ❌ REMOVE: Colored section headers
doc.rect(40, yPos, 515, 35).fillAndStroke(colors.primary, colors.primary);
```

**Replace with:**
```javascript
// ✅ SIMPLE: Clean section headers
function drawSectionHeader(title, yPos) {
  doc.fillColor('#004a99')
     .fontSize(14)
     .font('Helvetica-Bold')
     .text(title, 51, yPos);
  
  // Simple underline
  doc.moveTo(51, yPos + 18)
     .lineTo(544, yPos + 18)
     .stroke('#cccccc');
  
  return yPos + 30;
}
```

### 2. Fix Image Embedding
**Problem:** Images not displaying because buffer handling is incorrect

**Current:**
```javascript
doc.image(imageBuffer, x, y, { fit: [maxWidth, maxHeight] });
```

**Fix:**
```javascript
function addImage(imageBuffer, x, y, width, height, caption) {
  if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
    console.warn(`Invalid image buffer for: ${caption}`);
    return y;
  }
  
  try {
    // Ensure buffer is valid
    doc.image(imageBuffer, x, y, {
      width: width,
      height: height,
      fit: [width, height],
      align: 'center',
      valign: 'center'
    });
    
    // Caption
    if (caption) {
      doc.fillColor('#666666')
         .fontSize(9)
         .font('Helvetica')
         .text(caption, x, y + height + 3, {
           width: width,
           align: 'center'
         });
    }
    
    return y + height + (caption ? 20 : 10);
  } catch (error) {
    console.error(`Failed to embed image ${caption}:`, error.message);
    // Draw placeholder box
    doc.rect(x, y, width, height)
       .stroke('#cccccc');
    doc.fillColor('#999999')
       .fontSize(8)
       .text('Image error', x, y + height/2, {width: width, align: 'center'});
    return y + height + 10;
  }
}
```

### 3. Fix Page Breaks (Remove Blank Pages)
**Problem:** Creating pages unnecessarily

**Fix:**
```javascript
function checkNewPage(currentY, requiredSpace = 100) {
  // More aggressive page management
  const pageHeight = 792; // A4 height in points (842 - bottom margin)
  const bottomMargin = 50;
  
  if (currentY + requiredSpace > pageHeight - bottomMargin) {
    doc.addPage();
    return 51; // Top margin
  }
  return currentY;
}

// DON'T add pages for every section
// ONLY add when actually needed
```

### 4. Add Professional Header
```javascript
// ========== CLEAN HEADER ==========
let yPos = 51; // Start after margin

// Simple horizontal line at top
doc.moveTo(51, yPos)
   .lineTo(544, yPos)
   .lineWidth(2)
   .stroke('#004a99');

yPos += 10;

// Title
doc.fillColor('#004a99')
   .fontSize(18)
   .font('Helvetica-Bold')
   .text('InspectionWale - Vehicle Inspection Report', 51, yPos);

yPos += 20;

doc.fillColor('#666666')
   .fontSize(10)
   .font('Helvetica')
   .text('Rebranded from Whizzcheck', 51, yPos);

// Report ID and date (right-aligned)
const reportId = `INS-${Date.now()}`;
const reportDate = new Date().toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

doc.fillColor('#333333')
   .fontSize(10)
   .font('Helvetica')
   .text(`Inspection ID: ${reportId}`, 400, yPos - 30, {align: 'right'})
   .text(`Date: ${reportDate}`, 400, yPos - 15, {align: 'right'});

// Bottom border of header
yPos += 15;
doc.moveTo(51, yPos)
   .lineTo(544, yPos)
   .lineWidth(1)
   .stroke('#cccccc');

yPos += 20;
```

### 5. Simplify Tables
```javascript
function addTableRow(label, value, yPos) {
  // Label (left, bold)
  doc.fillColor('#333333')
     .fontSize(11)
     .font('Helvetica-Bold')
     .text(label, 51, yPos, {width: 200});
  
  // Value (right, normal)
  doc.fillColor('#000000')
     .fontSize(11)
     .font('Helvetica')
     .text(value || 'N/A', 260, yPos, {width: 284});
  
  return yPos + 20;
}
```

### 6. Fix Image Grids (3 columns)
```javascript
function addImageGrid(images, yPos, columns = 3) {
  if (!images || images.length === 0) return yPos;
  
  const totalWidth = 493; // 544 - 51 (page width - margin)
  const imageWidth = (totalWidth - ((columns - 1) * 10)) / columns; // 10px gap
  const imageHeight = 90; // Fixed height like template
  
  let currentRow = 0;
  let currentCol = 0;
  
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (!img || !img.buffer) continue;
    
    // Check if need new page
    if (currentCol === 0) {
      yPos = checkNewPage(yPos, imageHeight + 30);
    }
    
    const x = 51 + (currentCol * (imageWidth + 10));
    
    addImage(img.buffer, x, yPos, imageWidth, imageHeight, img.caption);
    
    currentCol++;
    if (currentCol >= columns) {
      currentCol = 0;
      yPos += imageHeight + 30;
    }
  }
  
  // Add remaining row space if not complete
  if (currentCol > 0) {
    yPos += imageHeight + 30;
  }
  
  return yPos + 10;
}
```

---

## File Structure Needed

```javascript
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const PDFDocument = require('pdfkit');
const Busboy = require('busboy');

// ... parseMultipartForm (keep as-is)

// NEW: Clean PDF generation
async function generatePDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 51, bottom: 51, left: 51, right: 51 },
      bufferPages: true,
      info: {
        Title: `Vehicle Inspection Report - ${data.registrationNumber}`,
        Author: 'InspectionWale'
      }
    });
    
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    
    // Start PDF generation
    let yPos = 51;
    
    // 1. Header
    yPos = addHeader(doc, data, yPos);
    
    // 2. Vehicle Details Table
    yPos = addVehicleDetails(doc, data, yPos);
    
    // 3. Owner Details
    yPos = addOwnerDetails(doc, data, yPos);
    
    // 4. Document Photos (RC Book, Chassis Plate, Odometer)
    yPos = addDocumentPhotos(doc, data, yPos);
    
    // 5. Key Highlights
    yPos = addKeyHighlights(doc, data, yPos);
    
    // 6. Exterior Section
    yPos = addExteriorSection(doc, data, yPos);
    
    // 7. Interior Section
    yPos = addInteriorSection(doc, data, yPos);
    
    // 8. Engine Section
    yPos = addEngineSection(doc, data, yPos);
    
    // 9. Tires Section
    yPos = addTiresSection(doc, data, yPos);
    
    // 10. Structure Section
    yPos = addStructureSection(doc, data, yPos);
    
    // 11. Test Drive
    yPos = addTestDriveSection(doc, data, yPos);
    
    // 12. Issues & Recommendations
    yPos = addIssuesSection(doc, data, yPos);
    
    // 13. Footer (on every page)
    addFooterToAllPages(doc);
    
    doc.end();
  });
}

// Helper functions...
function addHeader(doc, data, yPos) { /* ... */ }
function addVehicleDetails(doc, data, yPos) { /* ... */ }
// ... etc
```

---

## Estimated Changes

- **Lines to modify:** ~1000+ lines
- **Time:** 30-45 minutes to fully rewrite
- **Risk:** High (complete redesign)
- **Recommendation:** Create new file `index-clean.js`, test, then replace

---

## Action Plan

1. ✅ Create backup (done: `index.js.backup-old-design`)
2. ⏳ Create new clean design file
3. ⏳ Test with sample data
4. ⏳ Deploy to Lambda
5. ⏳ Test with real form submission
6. ⏳ Verify PDF looks like template

---

**Would you like me to proceed with the full rewrite? This will take ~30 minutes and will completely replace the current PDF generation.**

Alternative: I can make targeted fixes to just:
1. Remove gradients/colors (5 min)
2. Fix image embedding (10 min)
3. Fix page breaks (5 min)
4. Update header (3 min)

Which approach do you prefer?
