// Sample PDF Generator - Test the new clean design locally
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create sample test data
const sampleData = {
  registrationNumber: 'MH04KD2255',
  inspectorName: 'Rajesh Kumar',
  make: 'Toyota',
  model: 'Fortuner',
  variant: '2.8 4x2 AT',
  chassisNumber: 'MABKT26GXJM012345',
  engineNumber: '1GDKC23Z8JM567890',
  manufactureYear: '2020',
  registrationDate: '2020-03-15',
  color: 'Pearl White',
  fuelType: 'Diesel',
  odometerReading: '45000',
  ownersCount: '1',
  ownerName: 'Amit Sharma',
  ownerContact: '9876543210',
  ownerEmail: 'amit.sharma@example.com',
  location: 'Mumbai, Maharashtra',
  exteriorChecks: ['No visible dents or scratches', 'Paint in excellent condition', 'All panels aligned properly', 'Headlights and taillights working', 'Windshield crack-free'],
  interiorChecks: ['Dashboard in good condition', 'All controls functioning', 'Seats clean with minor wear', 'AC working perfectly', 'Music system operational'],
  engineChecks: ['Engine starts smoothly', 'No oil leaks detected', 'Battery in good condition', 'Cooling system normal', 'All fluids at proper levels'],
  tireChecks: ['Good tread depth', 'No sidewall damage', 'Proper inflation', 'Wheels undamaged', 'Spare tire available'],
  structureChecks: ['No rust on chassis', 'Undercarriage intact', 'Suspension working properly', 'No frame damage', 'Exhaust system good'],
  testDrive: 'Yes',
  testDriveNotes: 'Vehicle drives smoothly without any issues. Gear shifts are smooth, brakes respond well, and steering is precise. No unusual noises or vibrations detected during the test drive.',
  overallCondition: 'Excellent',
  issuesFound: 'Minor wear on brake pads, recommend replacement within 5000 km. Slight scratches on rear bumper (cosmetic only).',
  recommendations: 'Overall vehicle in excellent condition. Regular maintenance up to date. All major components functioning properly. Recommended for purchase with routine brake pad replacement in near future.',
  exteriorNotes: 'The exterior is well-maintained with original paint. Minor scratches on rear bumper are purely cosmetic and do not affect structural integrity.',
  interiorNotes: 'Interior shows normal wear consistent with 45,000 km usage. All electronic components including music system, AC, and power windows are functioning properly.',
  engineNotes: 'Engine bay is clean with no signs of major repairs. Oil levels are optimal and no leaks detected. Battery shows good charge retention.',
  tiresNotes: 'All four tires have adequate tread depth (6mm+). Spare tire is in unused condition. Wheel alignment is proper.',
  structureNotes: 'Undercarriage inspection reveals no structural damage or rust. Suspension components are in good working order with no unusual sounds.',
  imageBuffers: {} // Will add sample image placeholders
};

// Helper function to ensure items are arrays
function ensureArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

// Generate the PDF
function generateSamplePDF() {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      size: 'A4',
      margins: { top: 51, bottom: 51, left: 51, right: 51 },
      bufferPages: true,
      info: {
        Title: `Vehicle Inspection Report - ${sampleData.registrationNumber}`,
        Author: 'InspectionWale',
        Subject: 'Professional Vehicle Inspection Report'
      }
    });
    
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const reportId = `INS-${Date.now()}`;
    const colors = {
      heading: '#004a99',
      text: '#000000',
      label: '#333333',
      lightText: '#666666',
      border: '#cccccc',
      background: '#f7f9fc',
      danger: '#d32f2f'
    };

    // Helper functions
    function checkNewPage(currentY, requiredSpace = 100) {
      const pageHeight = 792;
      const bottomMargin = 51;
      
      if (currentY + requiredSpace > pageHeight - bottomMargin) {
        doc.addPage();
        return 51;
      }
      return currentY;
    }

    function drawSectionHeader(title, yPos) {
      yPos = checkNewPage(yPos, 40);
      
      doc.fillColor(colors.heading)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(title, 51, yPos);
      
      doc.moveTo(51, yPos + 18)
         .lineTo(544, yPos + 18)
         .lineWidth(1)
         .stroke(colors.border);
      
      return yPos + 30;
    }

    function addTableRow(label, value, x, y, labelWidth = 150, valueWidth = 180) {
      doc.fillColor(colors.label)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(label, x, y, { width: labelWidth });
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(value || 'N/A', x + labelWidth, y, { width: valueWidth });
      
      return y + 18;
    }

    function addImagePlaceholder(x, y, width, height, caption) {
      // Draw placeholder box
      doc.rect(x, y, width, height)
         .lineWidth(1)
         .stroke(colors.border);
      
      // Add "PHOTO" text in center
      doc.fillColor(colors.lightText)
         .fontSize(12)
         .font('Helvetica')
         .text('PHOTO', x, y + height/2 - 6, {
           width: width,
           align: 'center'
         });
      
      // Caption
      if (caption) {
        doc.fillColor(colors.lightText)
           .fontSize(8)
           .font('Helvetica')
           .text(caption, x, y + height + 2, {
             width: width,
             align: 'center'
           });
      }
      
      return y + height + (caption ? 15 : 5);
    }

    function addImageGrid(captions, yPos, columns = 3) {
      if (!captions || captions.length === 0) return yPos;
      
      const totalWidth = 493;
      const gap = 10;
      const imageWidth = (totalWidth - ((columns - 1) * gap)) / columns;
      const imageHeight = 90;
      
      let currentCol = 0;
      let rowStartY = yPos;
      
      for (let i = 0; i < captions.length; i++) {
        const caption = captions[i];
        
        if (currentCol === 0) {
          rowStartY = checkNewPage(rowStartY, imageHeight + 25);
        }
        
        const x = 51 + (currentCol * (imageWidth + gap));
        addImagePlaceholder(x, rowStartY, imageWidth, imageHeight, caption);
        
        currentCol++;
        if (currentCol >= columns) {
          currentCol = 0;
          rowStartY += imageHeight + 25;
        }
      }
      
      if (currentCol > 0) {
        rowStartY += imageHeight + 25;
      }
      
      return rowStartY;
    }

    // ========== START PDF GENERATION ==========
    let yPos = 51;

    // ========== HEADER ==========
    doc.moveTo(51, yPos)
       .lineTo(544, yPos)
       .lineWidth(2)
       .stroke(colors.heading);
    
    yPos += 12;

    doc.fillColor(colors.heading)
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('InspectionWale - Vehicle Inspection Report', 51, yPos);
    
    yPos += 22;

    doc.fillColor(colors.lightText)
       .fontSize(10)
       .font('Helvetica')
       .text('Rebranded from Whizzcheck', 51, yPos);

    const reportDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    doc.fillColor(colors.label)
       .fontSize(10)
       .font('Helvetica')
       .text(`Inspection ID: ${reportId}`, 400, yPos - 32, {width: 144, align: 'right'})
       .text(`Date: ${reportDate}`, 400, yPos - 18, {width: 144, align: 'right'});

    yPos += 15;
    doc.moveTo(51, yPos)
       .lineTo(544, yPos)
       .lineWidth(1)
       .stroke(colors.border);
    
    yPos += 25;

    // ========== VEHICLE REGISTRATION DETAILS ==========
    yPos = drawSectionHeader('Vehicle Registration Details', yPos);
    
    yPos = checkNewPage(yPos, 120);
    
    yPos = addTableRow('Registration Number', sampleData.registrationNumber, 51, yPos);
    yPos = addTableRow('Make / Model', `${sampleData.make} ${sampleData.model}`, 51, yPos);
    yPos = addTableRow('Variant', sampleData.variant, 51, yPos);
    yPos = addTableRow('Chassis Number', sampleData.chassisNumber, 51, yPos);
    yPos = addTableRow('Engine Number', sampleData.engineNumber, 51, yPos);
    
    let yPos2 = yPos - 90;
    yPos2 = addTableRow('Year of Manufacture', sampleData.manufactureYear, 310, yPos2, 110, 120);
    yPos2 = addTableRow('Registration Date', sampleData.registrationDate, 310, yPos2, 110, 120);
    yPos2 = addTableRow('Color', sampleData.color, 310, yPos2, 110, 120);
    yPos2 = addTableRow('Fuel Type', sampleData.fuelType, 310, yPos2, 110, 120);
    yPos2 = addTableRow('Odometer Reading', `${sampleData.odometerReading} km`, 310, yPos2, 110, 120);
    
    yPos = Math.max(yPos, yPos2) + 10;

    // ========== OWNER DETAILS ==========
    yPos = drawSectionHeader('Current Owner Details', yPos);
    
    yPos = checkNewPage(yPos, 60);
    yPos = addTableRow('Owner Name', sampleData.ownerName, 51, yPos);
    yPos = addTableRow('Contact Number', sampleData.ownerContact, 51, yPos);
    yPos = addTableRow('Email Address', sampleData.ownerEmail, 51, yPos);
    yPos = addTableRow('Inspection Location', sampleData.location, 51, yPos);
    yPos += 10;

    // ========== DOCUMENT PHOTOS ==========
    yPos = drawSectionHeader('Vehicle Documents', yPos);
    yPos = addImageGrid(['RC Book', 'Chassis Plate', 'Odometer Reading'], yPos, 3);
    yPos += 10;

    // ========== EXTERIOR SECTION ==========
    yPos = drawSectionHeader('Exterior / Body', yPos);
    
    yPos = checkNewPage(yPos, 40);
    
    doc.fillColor(colors.text)
       .fontSize(10)
       .font('Helvetica')
       .text(sampleData.exteriorChecks.join(', '), 51, yPos, {width: 493, align: 'justify'});
    
    yPos += doc.heightOfString(sampleData.exteriorChecks.join(', '), {width: 493}) + 15;

    if (sampleData.exteriorNotes) {
      yPos = checkNewPage(yPos, 40);
      const notesHeight = doc.heightOfString(sampleData.exteriorNotes, {width: 473});
      
      doc.rect(51, yPos, 493, notesHeight + 20)
         .fill(colors.background);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(sampleData.exteriorNotes, 61, yPos + 10, {width: 473, align: 'justify'});
      
      yPos += notesHeight + 30;
    }

    yPos = addImageGrid([
      'Front Bumper', 'Bonnet', 'Front Grille',
      'Headlights', 'Windshield', 'Wipers',
      'Driver Front Door', 'Passenger Front Door', 'Driver Rear Door',
      'Passenger Rear Door', 'Left Mirror', 'Right Mirror',
      'Rear Bumper', 'Boot Closed', 'Boot Open',
      'Taillights', 'Rear Windshield', 'Roof'
    ], yPos, 3);
    yPos += 10;

    // ========== INTERIOR SECTION ==========
    yPos = drawSectionHeader('Interior', yPos);
    
    yPos = checkNewPage(yPos, 40);
    
    doc.fillColor(colors.text)
       .fontSize(10)
       .font('Helvetica')
       .text(sampleData.interiorChecks.join(', '), 51, yPos, {width: 493, align: 'justify'});
    
    yPos += doc.heightOfString(sampleData.interiorChecks.join(', '), {width: 493}) + 15;

    if (sampleData.interiorNotes) {
      yPos = checkNewPage(yPos, 40);
      const notesHeight = doc.heightOfString(sampleData.interiorNotes, {width: 473});
      
      doc.rect(51, yPos, 493, notesHeight + 20)
         .fill(colors.background);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(sampleData.interiorNotes, 61, yPos + 10, {width: 473, align: 'justify'});
      
      yPos += notesHeight + 30;
    }

    yPos = addImageGrid([
      'Dashboard', 'Instrument Cluster', 'Steering Wheel',
      'Front Seats', 'Rear Seats', 'AC Control Panel',
      'Music System', 'Gear Lever', 'Interior Roof'
    ], yPos, 3);
    yPos += 10;

    // ========== ENGINE & MECHANICAL ==========
    yPos = drawSectionHeader('Engine & Mechanical', yPos);
    
    yPos = checkNewPage(yPos, 40);
    
    doc.fillColor(colors.text)
       .fontSize(10)
       .font('Helvetica')
       .text(sampleData.engineChecks.join(', '), 51, yPos, {width: 493, align: 'justify'});
    
    yPos += doc.heightOfString(sampleData.engineChecks.join(', '), {width: 493}) + 15;

    if (sampleData.engineNotes) {
      yPos = checkNewPage(yPos, 40);
      const notesHeight = doc.heightOfString(sampleData.engineNotes, {width: 473});
      
      doc.rect(51, yPos, 493, notesHeight + 20)
         .fill(colors.background);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(sampleData.engineNotes, 61, yPos + 10, {width: 473, align: 'justify'});
      
      yPos += notesHeight + 30;
    }

    yPos = addImageGrid([
      'Engine Bay', 'Engine Block', 'Battery',
      'Radiator', 'Oil Cap', 'Belts & Hoses'
    ], yPos, 3);
    yPos += 10;

    // ========== TIRES & WHEELS ==========
    yPos = drawSectionHeader('Tires & Wheels', yPos);
    
    yPos = checkNewPage(yPos, 40);
    
    doc.fillColor(colors.text)
       .fontSize(10)
       .font('Helvetica')
       .text(sampleData.tireChecks.join(', '), 51, yPos, {width: 493, align: 'justify'});
    
    yPos += doc.heightOfString(sampleData.tireChecks.join(', '), {width: 493}) + 15;

    if (sampleData.tiresNotes) {
      yPos = checkNewPage(yPos, 40);
      const notesHeight = doc.heightOfString(sampleData.tiresNotes, {width: 473});
      
      doc.rect(51, yPos, 493, notesHeight + 20)
         .fill(colors.background);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(sampleData.tiresNotes, 61, yPos + 10, {width: 473, align: 'justify'});
      
      yPos += notesHeight + 30;
    }

    yPos = addImageGrid([
      'Front Left Tire', 'Front Right Tire', 'Rear Left Tire',
      'Rear Right Tire', 'Spare Tire'
    ], yPos, 3);
    yPos += 10;

    // ========== STRUCTURE & UNDERCARRIAGE ==========
    yPos = drawSectionHeader('Structure & Undercarriage', yPos);
    
    yPos = checkNewPage(yPos, 40);
    
    doc.fillColor(colors.text)
       .fontSize(10)
       .font('Helvetica')
       .text(sampleData.structureChecks.join(', '), 51, yPos, {width: 493, align: 'justify'});
    
    yPos += doc.heightOfString(sampleData.structureChecks.join(', '), {width: 493}) + 15;

    if (sampleData.structureNotes) {
      yPos = checkNewPage(yPos, 40);
      const notesHeight = doc.heightOfString(sampleData.structureNotes, {width: 473});
      
      doc.rect(51, yPos, 493, notesHeight + 20)
         .fill(colors.background);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(sampleData.structureNotes, 61, yPos + 10, {width: 473, align: 'justify'});
      
      yPos += notesHeight + 30;
    }

    yPos = addImageGrid([
      'Front Undercarriage', 'Rear Undercarriage', 'Exhaust System',
      'Front Suspension', 'Rear Suspension'
    ], yPos, 3);
    yPos += 10;

    // ========== TEST DRIVE ==========
    yPos = drawSectionHeader('Test Drive', yPos);
    
    yPos = checkNewPage(yPos, 40);
    
    doc.fillColor(colors.label)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('Test Drive Conducted: ', 51, yPos, {continued: true})
       .fillColor(colors.text)
       .font('Helvetica')
       .text(sampleData.testDrive);
    
    yPos += 20;

    if (sampleData.testDriveNotes) {
      yPos = checkNewPage(yPos, 40);
      const notesHeight = doc.heightOfString(sampleData.testDriveNotes, {width: 473});
      
      doc.rect(51, yPos, 493, notesHeight + 20)
         .fill(colors.background);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(sampleData.testDriveNotes, 61, yPos + 10, {width: 473, align: 'justify'});
      
      yPos += notesHeight + 30;
    }

    // ========== ISSUES & RECOMMENDATIONS ==========
    yPos = drawSectionHeader('Issues Found & Recommendations', yPos);
    
    if (sampleData.issuesFound) {
      yPos = checkNewPage(yPos, 60);
      const issuesHeight = doc.heightOfString(sampleData.issuesFound, {width: 473});
      
      doc.rect(51, yPos, 493, issuesHeight + 30)
         .fillAndStroke(colors.danger, colors.danger);
      
      doc.fillColor('#ffffff')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Major Issues Found:', 61, yPos + 10);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(sampleData.issuesFound, 61, yPos + 26, {width: 473, align: 'justify'});
      
      yPos += issuesHeight + 40;
    }

    if (sampleData.recommendations) {
      yPos = checkNewPage(yPos, 60);
      const recHeight = doc.heightOfString(sampleData.recommendations, {width: 473});
      
      doc.rect(51, yPos, 493, recHeight + 30)
         .fill(colors.background);
      
      doc.fillColor(colors.heading)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Recommendations:', 61, yPos + 10);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(sampleData.recommendations, 61, yPos + 26, {width: 473, align: 'justify'});
      
      yPos += recHeight + 40;
    }

    // ========== OVERALL CONDITION ==========
    if (sampleData.overallCondition) {
      yPos = checkNewPage(yPos, 40);
      
      doc.fillColor(colors.label)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Overall Condition: ', 51, yPos, {continued: true})
         .fillColor(colors.text)
         .font('Helvetica')
         .text(sampleData.overallCondition);
      
      yPos += 30;
    }

    // ========== FOOTER ON ALL PAGES ==========
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      const footerY = 780;
      
      doc.moveTo(51, footerY)
         .lineTo(544, footerY)
         .lineWidth(1)
         .stroke(colors.border);
      
      doc.fillColor(colors.lightText)
         .fontSize(9)
         .font('Helvetica')
         .text('Disclaimer: InspectionWale offers visual inspection reports. Mechanical condition beyond visual inspection is not guaranteed.', 51, footerY + 8, {width: 493, align: 'center'})
         .text(`Report generated by InspectionWale | Page ${i + 1} of ${pageCount}`, 51, footerY + 22, {width: 493, align: 'center'});
    }

    doc.end();
  });
}

// Generate and save the PDF
console.log('Generating sample PDF...');
generateSamplePDF()
  .then(pdfBuffer => {
    const outputPath = path.join(__dirname, 'SAMPLE_INSPECTION_REPORT.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log('✅ Sample PDF generated successfully!');
    console.log('📄 Saved to:', outputPath);
    console.log('\n📋 This is a preview of how the actual report will look.');
    console.log('   Photo placeholders show where actual images will appear.');
    console.log('\n🎨 Review the design and let me know what changes you want!');
  })
  .catch(error => {
    console.error('❌ Error generating PDF:', error);
  });
