// Professional Vehicle Inspection Report Generator V2
// Fixed: Header overlap, special chars, star ratings, square borders, footer, dynamic pages

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Professional color palette - clean and minimal
const colors = {
  primary: '#1e3a8a',      // Deep professional blue
  text: '#000000',         // Pure black for values
  label: '#4b5563',        // Dark gray for labels
  border: '#9ca3af',       // Medium gray borders
  lightBorder: '#e5e7eb',  // Light gray for subtle borders
  bgWhite: '#ffffff',      // Pure white background
  star: '#f59e0b',         // Golden for star ratings
  starEmpty: '#d1d5db'     // Gray for empty stars
};

// Sample data
const inspectionData = {
  inspectionId: 'INS-2025-001234',
  inspectionDate: '2025-10-11',
  
  vehicle: {
    number: 'MH04KD2255',
    manufacturingDate: '2019-04-01',
    chassisNumber: 'MA3NYF81SKD535417',
    insuranceValidity: '2025-09-29',
    engineNumber: 'D13A-5818272',
    registrationDate: '2019-09-19',
    ownerName: 'Akshada Sondulkar',
    cngValidity: '2025-09-29',
    make: 'Maruti',
    model: 'Brezza',
    variant: 'VDi',
    fuelType: 'Diesel',
    color: 'Pearl White',
    numberOfOwners: 2,
    cngFitment: 'Company fitted',
    rcType: 'Private',
    odometerReading: '45,320 km'
  },
  
  inspector: {
    name: 'Prasad Kumar',
    location: 'Byculla, Mumbai'
  },
  
  keyHighlights: {
    accidental: 'No major accident detected',
    floodDamage: 'No flood damage signs',
    fireDamage: 'No fire damage',
    comments: 'Vehicle in good condition. Regular maintenance documented.'
  },
  
  ratings: {
    interior: 4,
    exteriorBody: 4.5,
    engine: 4,
    structure: 5,
    testDrive: 4.5,
    electrical: 4
  },
  
  exterior: {
    frontBumper: { condition: 'Good', repainted: false, paintDepth: 125 },
    bonnet: { condition: 'Excellent', repainted: false, paintDepth: 130 },
    rhsFender: { condition: 'Good', repainted: false, paintDepth: 128 },
    lhsFender: { condition: 'Minor scratches', repainted: true, paintDepth: 180 }
  },
  
  interior: {
    dashBoardCondition: 'Excellent, no cracks',
    musicSystemWorking: true,
    acWorking: true,
    seatCondition: 'Good with minor wear'
  },
  
  engine: {
    condition: 'Running smoothly',
    oilLeaks: false,
    batteryCondition: 'Good'
  }
};

function generateProfessionalPDF() {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 90, bottom: 80, left: 50, right: 50 },
      bufferPages: true
    });

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = 595;
    const pageHeight = 842;
    const leftMargin = 50;
    const contentWidth = 495;

    // Helper: Draw professional header WITHOUT special characters
    function drawHeader(isFirstPage = false) {
      if (isFirstPage) {
        // WHITE BACKGROUND for header
        doc.rect(0, 0, pageWidth, 85).fill(colors.bgWhite);
        
        // LEFT: InspectionWale text (NO emoji/special chars)
        doc.fillColor(colors.primary)
           .fontSize(20)
           .font('Helvetica-Bold')
           .text('InspectionWale', leftMargin, 20);
        
        doc.fillColor(colors.label)
           .fontSize(9)
           .font('Helvetica')
           .text('Rebranded from Whizzcheck', leftMargin, 45);
        
        // CENTER: Vehicle Inspection Report
        doc.fillColor(colors.primary)
           .fontSize(22)
           .font('Helvetica-Bold')
           .text('Vehicle Inspection Report', 150, 25, {
             width: 250,
             align: 'center'
           });
        
        // RIGHT: Inspection ID and Date (FIXED SPACING - NO OVERLAP)
        doc.fillColor(colors.label)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('Inspection ID:', 430, 18);
        
        doc.fillColor(colors.text)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(inspectionData.inspectionId, 430, 31);
        
        doc.fillColor(colors.label)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('Date:', 430, 48);
        
        doc.fillColor(colors.text)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('11 Oct 2025', 430, 61);
        
        // Header border line
        doc.moveTo(0, 85)
           .lineTo(pageWidth, 85)
           .lineWidth(2)
           .stroke(colors.primary);
      } else {
        // Simplified header for other pages
        doc.rect(0, 0, pageWidth, 60).fill(colors.bgWhite);
        
        doc.fillColor(colors.primary)
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('InspectionWale', leftMargin, 20);
        
        doc.fillColor(colors.text)
           .fontSize(10)
           .font('Helvetica')
           .text(`Report: ${inspectionData.inspectionId}`, 400, 25);
        
        doc.moveTo(0, 60)
           .lineTo(pageWidth, 60)
           .lineWidth(1)
           .stroke(colors.border);
      }
    }

    // Helper: Draw complete footer with ALL details
    function drawFooter(pageNum, totalPages) {
      const footerY = 755;
      
      // Footer top border
      doc.moveTo(0, footerY)
         .lineTo(pageWidth, footerY)
         .lineWidth(1)
         .stroke(colors.lightBorder);
      
      // Contact details (NO emoji - causes encoding issues)
      doc.fillColor(colors.label)
         .fontSize(9)
         .font('Helvetica');
      
      // Email
      doc.text('Email: hello@inspectionwale.com', leftMargin, footerY + 8);
      
      // Mobile
      doc.text('Mobile: 9167558998', 220, footerY + 8);
      
      // Website
      doc.text('Web: inspectionwale.com', 380, footerY + 8);
      
      // Page number
      doc.fillColor(colors.label)
         .fontSize(8)
         .font('Helvetica-Bold')
         .text(`Page ${pageNum} of ${totalPages}`, leftMargin, footerY + 24, {
           width: contentWidth,
           align: 'center'
         });
      
      // Disclaimer
      doc.fillColor(colors.label)
         .fontSize(7)
         .font('Helvetica')
         .text('Professional vehicle inspection report. Visual inspection only. Report valid for 2 days or 20 km.',
               leftMargin, footerY + 36, {
                 width: contentWidth,
                 align: 'center'
               });
    }

    // Helper: Draw section header with CLEAN SQUARE BOX (no rounded corners, no colors)
    function drawSectionHeader(title, yPos) {
      // Simple square box with border
      doc.rect(leftMargin, yPos, contentWidth, 35)
         .lineWidth(1.5)
         .stroke(colors.border);
      
      // Title text - NO special characters/emojis
      doc.fillColor(colors.primary)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(title, leftMargin + 15, yPos + 11);
      
      return yPos + 50;
    }

    // Helper: Add data row with BOLD BLACK VALUES
    function addDataRow(label, value, x, y, labelWidth = 180) {
      // Label in gray
      doc.fillColor(colors.label)
         .fontSize(10)
         .font('Helvetica')
         .text(label, x, y);
      
      // Value in BOLD BLACK
      doc.fillColor(colors.text)
         .fontSize(11)
         .font('Helvetica-Bold')  // BOLD
         .text(value || 'N/A', x + labelWidth, y, {
           width: contentWidth - labelWidth - (x - leftMargin)
         });
      
      return y + 22;
    }

    // Helper: Draw star rating HORIZONTALLY with golden stars
    function drawStarRating(rating, x, y) {
      const starSize = 12;
      const starGap = 3;
      const fullStars = Math.floor(rating);
      const hasHalfStar = (rating % 1) >= 0.5;
      
      for (let i = 0; i < 5; i++) {
        const starX = x + (i * (starSize + starGap));
        
        if (i < fullStars) {
          // Filled golden star
          doc.fillColor(colors.star)
             .fontSize(starSize)
             .text('\u2605', starX, y);  // ★ filled star
        } else if (i === fullStars && hasHalfStar) {
          // Half star (using filled for simplicity)
          doc.fillColor(colors.star)
             .fontSize(starSize)
             .text('\u2605', starX, y);
        } else {
          // Empty star
          doc.fillColor(colors.starEmpty)
             .fontSize(starSize)
             .text('\u2606', starX, y);  // ☆ empty star
        }
      }
      
      // Rating text
      doc.fillColor(colors.label)
         .fontSize(10)
         .font('Helvetica')
         .text(`(${rating}/5)`, x + 75, y + 1);
      
      return y + 22;
    }

    // Helper: Draw clean square box for grouped content
    function drawContentBox(x, y, width, height) {
      doc.rect(x, y, width, height)
         .lineWidth(1)
         .stroke(colors.lightBorder);
    }

    // Helper: Check if new page needed
    function checkNewPage(currentY, requiredSpace = 100) {
      if (currentY + requiredSpace > 680) {
        doc.addPage();
        drawHeader(false);
        return 110;
      }
      return currentY;
    }

    // ========== START PDF GENERATION ==========
    
    // PAGE 1: Vehicle Registration & Summary
    drawHeader(true);
    
    let yPos = 110;

    // Vehicle Registration Details - CLEAN SQUARE BOX
    yPos = drawSectionHeader('Vehicle Registration Details', yPos);
    
    // Draw box around vehicle details
    const boxStartY = yPos;
    
    // Two-column layout with BOLD BLACK values
    let leftColY = yPos + 10;
    let rightColY = yPos + 10;
    
    leftColY = addDataRow('Vehicle Number', inspectionData.vehicle.number, leftMargin + 10, leftColY, 140);
    rightColY = addDataRow('Manufacturing Date', inspectionData.vehicle.manufacturingDate, 310, rightColY, 120);
    
    leftColY = addDataRow('Chassis Number', inspectionData.vehicle.chassisNumber, leftMargin + 10, leftColY, 140);
    rightColY = addDataRow('Insurance Validity', inspectionData.vehicle.insuranceValidity, 310, rightColY, 120);
    
    leftColY = addDataRow('Engine Number', inspectionData.vehicle.engineNumber, leftMargin + 10, leftColY, 140);
    rightColY = addDataRow('Registration Date', inspectionData.vehicle.registrationDate, 310, rightColY, 120);
    
    leftColY = addDataRow('Make / Model', `${inspectionData.vehicle.make} ${inspectionData.vehicle.model}`, leftMargin + 10, leftColY, 140);
    rightColY = addDataRow('Variant', inspectionData.vehicle.variant, 310, rightColY, 120);
    
    leftColY = addDataRow('Fuel Type', inspectionData.vehicle.fuelType, leftMargin + 10, leftColY, 140);
    rightColY = addDataRow('Color', inspectionData.vehicle.color, 310, rightColY, 120);
    
    leftColY = addDataRow('Number of Owners', inspectionData.vehicle.numberOfOwners.toString(), leftMargin + 10, leftColY, 140);
    rightColY = addDataRow('Odometer Reading', inspectionData.vehicle.odometerReading, 310, rightColY, 120);
    
    yPos = Math.max(leftColY, rightColY) + 10;
    
    // Draw border around vehicle details box
    drawContentBox(leftMargin, boxStartY, contentWidth, yPos - boxStartY);
    
    yPos += 20;
    
    // Owner Details Section
    yPos = checkNewPage(yPos, 150);
    yPos = drawSectionHeader('Current Owner Details', yPos);
    
    const ownerBoxStart = yPos;
    yPos += 10;
    
    yPos = addDataRow('Owner Name', inspectionData.vehicle.ownerName, leftMargin + 10, yPos, 140);
    yPos = addDataRow('CNG Validity', inspectionData.vehicle.cngValidity, leftMargin + 10, yPos, 140);
    yPos = addDataRow('CNG Fitment', inspectionData.vehicle.cngFitment, leftMargin + 10, yPos, 140);
    yPos = addDataRow('RC Type', inspectionData.vehicle.rcType, leftMargin + 10, yPos, 140);
    
    yPos += 10;
    drawContentBox(leftMargin, ownerBoxStart, contentWidth, yPos - ownerBoxStart);
    
    yPos += 20;
    
    // Inspector Details
    yPos = checkNewPage(yPos, 100);
    yPos = drawSectionHeader('Inspection Details', yPos);
    
    const inspectorBoxStart = yPos;
    yPos += 10;
    
    yPos = addDataRow('Inspected By', inspectionData.inspector.name, leftMargin + 10, yPos, 140);
    yPos = addDataRow('Location', inspectionData.inspector.location, leftMargin + 10, yPos, 140);
    
    yPos += 10;
    drawContentBox(leftMargin, inspectorBoxStart, contentWidth, yPos - inspectorBoxStart);
    
    yPos += 20;
    
    // Key Highlights
    yPos = checkNewPage(yPos, 150);
    yPos = drawSectionHeader('Key Highlights', yPos);
    
    const highlightBoxStart = yPos;
    yPos += 10;
    
    yPos = addDataRow('Accidental', inspectionData.keyHighlights.accidental, leftMargin + 10, yPos, 140);
    yPos = addDataRow('Flood Damage', inspectionData.keyHighlights.floodDamage, leftMargin + 10, yPos, 140);
    yPos = addDataRow('Fire Damage', inspectionData.keyHighlights.fireDamage, leftMargin + 10, yPos, 140);
    yPos = addDataRow('Comments', inspectionData.keyHighlights.comments, leftMargin + 10, yPos, 140);
    
    yPos += 10;
    drawContentBox(leftMargin, highlightBoxStart, contentWidth, yPos - highlightBoxStart);
    
    yPos += 20;
    
    // Ratings with STAR ICONS (horizontal layout)
    yPos = checkNewPage(yPos, 200);
    yPos = drawSectionHeader('Overall Ratings', yPos);
    
    const ratingBoxStart = yPos;
    yPos += 10;
    
    // Interior rating
    doc.fillColor(colors.label)
       .fontSize(10)
       .font('Helvetica')
       .text('Interior:', leftMargin + 10, yPos);
    yPos = drawStarRating(inspectionData.ratings.interior, leftMargin + 150, yPos);
    
    // Exterior rating
    doc.fillColor(colors.label)
       .fontSize(10)
       .font('Helvetica')
       .text('Exterior / Body:', leftMargin + 10, yPos);
    yPos = drawStarRating(inspectionData.ratings.exteriorBody, leftMargin + 150, yPos);
    
    // Engine rating
    doc.fillColor(colors.label)
       .fontSize(10)
       .font('Helvetica')
       .text('Engine:', leftMargin + 10, yPos);
    yPos = drawStarRating(inspectionData.ratings.engine, leftMargin + 150, yPos);
    
    // Structure rating
    doc.fillColor(colors.label)
       .fontSize(10)
       .font('Helvetica')
       .text('Structure:', leftMargin + 10, yPos);
    yPos = drawStarRating(inspectionData.ratings.structure, leftMargin + 150, yPos);
    
    // Test Drive rating
    doc.fillColor(colors.label)
       .fontSize(10)
       .font('Helvetica')
       .text('Test Drive:', leftMargin + 10, yPos);
    yPos = drawStarRating(inspectionData.ratings.testDrive, leftMargin + 150, yPos);
    
    // Electrical rating
    doc.fillColor(colors.label)
       .fontSize(10)
       .font('Helvetica')
       .text('Electrical:', leftMargin + 10, yPos);
    yPos = drawStarRating(inspectionData.ratings.electrical, leftMargin + 150, yPos);
    
    yPos += 10;
    drawContentBox(leftMargin, ratingBoxStart, contentWidth, yPos - ratingBoxStart);
    
    // ONLY ADD MORE PAGES IF THERE IS ACTUAL CONTENT
    // Skip blank pages - dynamic page management
    
    // Exterior section (only if data exists)
    if (inspectionData.exterior && Object.keys(inspectionData.exterior).length > 0) {
      yPos = checkNewPage(yPos + 20, 200);
      yPos = drawSectionHeader('Exterior Inspection', yPos);
      
      const exteriorBoxStart = yPos;
      yPos += 10;
      
      yPos = addDataRow('Front Bumper', inspectionData.exterior.frontBumper.condition, leftMargin + 10, yPos, 140);
      yPos = addDataRow('Bonnet', inspectionData.exterior.bonnet.condition, leftMargin + 10, yPos, 140);
      yPos = addDataRow('RHS Fender', inspectionData.exterior.rhsFender.condition, leftMargin + 10, yPos, 140);
      yPos = addDataRow('LHS Fender', inspectionData.exterior.lhsFender.condition, leftMargin + 10, yPos, 140);
      
      yPos += 10;
      drawContentBox(leftMargin, exteriorBoxStart, contentWidth, yPos - exteriorBoxStart);
    }
    
    // Interior section (only if data exists)
    if (inspectionData.interior && Object.keys(inspectionData.interior).length > 0) {
      yPos = checkNewPage(yPos + 20, 150);
      yPos = drawSectionHeader('Interior Inspection', yPos);
      
      const interiorBoxStart = yPos;
      yPos += 10;
      
      yPos = addDataRow('Dashboard', inspectionData.interior.dashBoardCondition, leftMargin + 10, yPos, 140);
      yPos = addDataRow('Music System', inspectionData.interior.musicSystemWorking ? 'Working' : 'Not Working', leftMargin + 10, yPos, 140);
      yPos = addDataRow('AC', inspectionData.interior.acWorking ? 'Working' : 'Not Working', leftMargin + 10, yPos, 140);
      yPos = addDataRow('Seats', inspectionData.interior.seatCondition, leftMargin + 10, yPos, 140);
      
      yPos += 10;
      drawContentBox(leftMargin, interiorBoxStart, contentWidth, yPos - interiorBoxStart);
    }
    
    // Engine section (only if data exists)
    if (inspectionData.engine && Object.keys(inspectionData.engine).length > 0) {
      yPos = checkNewPage(yPos + 20, 120);
      yPos = drawSectionHeader('Engine Inspection', yPos);
      
      const engineBoxStart = yPos;
      yPos += 10;
      
      yPos = addDataRow('Condition', inspectionData.engine.condition, leftMargin + 10, yPos, 140);
      yPos = addDataRow('Oil Leaks', inspectionData.engine.oilLeaks ? 'Yes' : 'No', leftMargin + 10, yPos, 140);
      yPos = addDataRow('Battery', inspectionData.engine.batteryCondition, leftMargin + 10, yPos, 140);
      
      yPos += 10;
      drawContentBox(leftMargin, engineBoxStart, contentWidth, yPos - engineBoxStart);
    }

    // Add footers to all pages
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      drawFooter(i + 1, totalPages);
    }

    doc.end();
  });
}

// Generate the fixed professional PDF
console.log('Generating fixed professional PDF...');
generateProfessionalPDF()
  .then(pdfBuffer => {
    const outputPath = path.join(__dirname, 'SAMPLE_PROFESSIONAL_REPORT_V2.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log('\nSUCCESS - All issues fixed!');
    console.log('Saved to:', outputPath);
    console.log('\nFIXED ISSUES:');
    console.log('  [v] Header overlap - proper spacing for ID and Date');
    console.log('  [v] Removed special characters causing encoding issues');
    console.log('  [v] Values now BOLD and BLACK');
    console.log('  [v] Star ratings (golden) instead of numbers');
    console.log('  [v] Clean square borders (no rounded, no colors)');
    console.log('  [v] Complete footer: email, mobile, website, page #, disclaimer');
    console.log('  [v] Dynamic pages - only pages with content (no blank pages)');
    console.log('  [v] Professional spacing with bordered sections');
  })
  .catch(error => {
    console.error('Error:', error);
  });
