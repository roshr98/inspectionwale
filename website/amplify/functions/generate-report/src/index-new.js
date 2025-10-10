const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const PDFDocument = require('pdfkit');
const Busboy = require('busboy');

const s3Client = new S3Client({});
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

// Helper function to ensure items are arrays
function ensureArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

// Parse multipart form data
function parseMultipartForm(event) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ 
      headers: {
        'content-type': event.headers['content-type'] || event.headers['Content-Type']
      }
    });
    
    const fields = {};
    const files = [];
    
    busboy.on('file', (fieldname, file, info) => {
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        files.push({
          fieldname,
          buffer: Buffer.concat(chunks),
          filename: info.filename,
          mimeType: info.mimeType
        });
      });
    });
    
    busboy.on('field', (fieldname, value) => {
      if (fieldname.includes('[')) {
        const match = fieldname.match(/^(.+?)\[(\d+)\]$/);
        if (match) {
          const name = match[1];
          if (!fields[name]) fields[name] = [];
          fields[name].push(value);
        }
      } else {
        fields[fieldname] = value;
      }
    });
    
    busboy.on('finish', () => resolve({ fields, files }));
    busboy.on('error', reject);
    
    const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
    busboy.write(bodyBuffer);
    busboy.end();
  });
}

// Generate Professional PDF Report with Rich Design
async function generatePDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 40,
      bufferPages: true,
      info: {
        Title: `Vehicle Inspection Report - ${data.registrationNumber}`,
        Author: 'InspectionWale',
        Subject: 'Professional Vehicle Inspection',
        Keywords: 'vehicle, inspection, report'
      }
    });
    
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const reportId = `INS-${Date.now()}`;
    const colors = {
      primary: '#004a99',      // Professional Blue
      secondary: '#0066cc',    // Lighter Blue
      accent: '#00a8e8',       // Bright Blue
      success: '#00c853',      // Green
      warning: '#ff6f00',      // Orange
      danger: '#d32f2f',       // Red
      text: '#212121',         // Dark Gray
      lightText: '#616161',    // Medium Gray
      background: '#f5f7fa',   // Light Background
      border: '#e0e0e0'        // Border Gray
    };

    // Helper function to draw gradient background
    function drawGradientBg(x, y, width, height, color1, color2) {
      const steps = 20;
      const stepHeight = height / steps;
      
      for (let i = 0; i < steps; i++) {
        const ratio = i / steps;
        doc.fillColor(color1, 1 - ratio).fillColor(color2, ratio)
           .rect(x, y + (i * stepHeight), width, stepHeight)
           .fill();
      }
    }

    // Helper function to draw section header with icon
    function drawSectionHeader(title, icon, yPos) {
      // Background bar
      doc.rect(40, yPos, 515, 35)
         .fillAndStroke(colors.primary, colors.primary);
      
      // Title
      doc.fillColor('#ffffff')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(title, 50, yPos + 11);
      
      return yPos + 45;
    }

    // Helper function to add a labeled field
    function addField(label, value, x, y, maxWidth = 200) {
      doc.fillColor(colors.lightText)
         .fontSize(9)
         .font('Helvetica')
         .text(label, x, y);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(value || 'N/A', x, y + 12, { width: maxWidth, ellipsis: true });
      
      return y + 32;
    }

    // Helper function to check if we need a new page
    function checkNewPage(currentY, requiredSpace = 100) {
      if (currentY + requiredSpace > 750) {
        doc.addPage();
        return 40;
      }
      return currentY;
    }

    let yPos = 40;

    // ========== HEADER SECTION WITH GLOSSY EFFECT ==========
    // Main header background with gradient effect
    doc.rect(0, 0, 595, 140)
       .fill(colors.primary);
    
    // Add glossy effect overlay
    for (let i = 0; i < 60; i++) {
      const alpha = (60 - i) / 200;
      doc.rect(0, i, 595, 1)
         .fillOpacity(alpha)
         .fill('#ffffff');
    }
    doc.fillOpacity(1);

    // Company Logo/Brand Name
    doc.fillColor('#ffffff')
       .fontSize(32)
       .font('Helvetica-Bold')
       .text('InspectionWale', 40, 30);
    
    doc.fontSize(11)
       .font('Helvetica')
       .text('Professional Vehicle Inspection Services', 40, 68);
    
    // Report Info Box (Right side)
    doc.roundedRect(380, 30, 175, 80, 5)
       .fillAndStroke('#ffffff', '#ffffff');
    
    doc.fillColor(colors.primary)
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('INSPECTION REPORT', 390, 40);
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor(colors.text)
       .text(`Report ID: ${reportId}`, 390, 58)
       .text(`Date: ${new Date().toLocaleDateString('en-IN', { 
         day: '2-digit', month: 'short', year: 'numeric' 
       })}`, 390, 72)
       .text(`Inspector: ${data.inspectorName || 'N/A'}`, 390, 86);

    yPos = 160;

    // ========== KEY HIGHLIGHTS BANNER ==========
    if (data.accidental || data.floodDamage || data.fireDamage) {
      const isClean = data.accidental === 'No' && data.floodDamage === 'No' && data.fireDamage === 'No';
      const bannerColor = isClean ? colors.success : colors.danger;
      
      doc.rect(40, yPos, 515, 45)
         .fill(bannerColor);
      
      doc.fillColor('#ffffff')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('KEY HIGHLIGHTS', 50, yPos + 8);
      
      const highlights = [
        `Accident: ${data.accidental || 'N/A'}`,
        `Flood: ${data.floodDamage || 'N/A'}`,
        `Fire: ${data.fireDamage || 'N/A'}`
      ];
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(highlights.join('  |  '), 50, yPos + 26);
      
      yPos += 60;
    }

    // ========== VEHICLE REGISTRATION DETAILS ==========
    yPos = drawSectionHeader('VEHICLE REGISTRATION DETAILS', '🚗', yPos);
    
    // First Row
    let tempY = addField('Registration Number', data.registrationNumber, 50, yPos);
    addField('Make / Model', `${data.make || 'N/A'} ${data.model || 'N/A'}`, 200, yPos);
    addField('Variant', data.variant, 400, yPos);
    
    yPos = tempY + 5;
    
    // Second Row
    tempY = addField('Chassis Number', data.chassisNumber, 50, yPos);
    addField('Engine Number', data.engineNumber, 300, yPos);
    
    yPos = tempY + 5;
    
    // Third Row
    tempY = addField('Manufacture Year', data.manufactureYear, 50, yPos);
    addField('Registration Date', data.registrationDate, 200, yPos);
    addField('Color', data.color, 400, yPos);
    
    yPos = tempY + 5;
    
    // Fourth Row
    tempY = addField('Fuel Type', data.fuelType, 50, yPos);
    addField('Odometer Reading', `${data.odometerReading || 'N/A'} km`, 200, yPos);
    addField('Number of Owners', data.ownersCount || '1', 400, yPos);
    
    yPos = tempY + 15;

    // ========== OWNER DETAILS ==========
    yPos = checkNewPage(yPos, 150);
    yPos = drawSectionHeader('CURRENT OWNER DETAILS', '👤', yPos);
    
    tempY = addField('Owner Name', data.ownerName, 50, yPos);
    addField('Contact Number', data.ownerContact, 300, yPos);
    
    yPos = tempY + 5;
    
    tempY = addField('Email Address', data.ownerEmail, 50, yPos);
    addField('Location', data.location, 300, yPos);
    
    yPos = tempY + 15;

    // ========== OVERALL ASSESSMENT ==========
    if (data.overallRating) {
      yPos = checkNewPage(yPos, 120);
      yPos = drawSectionHeader('OVERALL ASSESSMENT', '⭐', yPos);
      
      // Rating with colored box
      const ratingColors = {
        'Excellent': colors.success,
        'Good': '#4caf50',
        'Average': colors.warning,
        'Poor': colors.danger
      };
      
      const ratingColor = ratingColors[data.overallRating] || colors.secondary;
      
      doc.roundedRect(50, yPos, 200, 40, 5)
         .fillAndStroke(ratingColor, ratingColor);
      
      doc.fillColor('#ffffff')
         .fontSize(11)
         .font('Helvetica')
         .text('Overall Condition', 60, yPos + 8);
      
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text(data.overallRating, 60, yPos + 22);
      
      // Market Value (if provided)
      if (data.marketValue) {
        doc.roundedRect(270, yPos, 285, 40, 5)
           .fillAndStroke(colors.accent, colors.accent);
        
        doc.fillColor('#ffffff')
           .fontSize(11)
           .font('Helvetica')
           .text('Estimated Market Value', 280, yPos + 8);
        
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text(data.marketValue, 280, yPos + 22);
      }
      
      yPos += 55;
    }

    // Top Comments/Highlights
    if (data.highlights) {
      doc.rect(50, yPos, 505, 'auto')
         .fillColor(colors.background);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(data.highlights, 60, yPos + 10, { 
           width: 485, 
           align: 'justify' 
         });
      
      yPos += doc.heightOfString(data.highlights, { width: 485 }) + 30;
    }

    // ========== EXTERIOR / BODY INSPECTION ==========
    yPos = checkNewPage(yPos, 200);
    yPos = drawSectionHeader('EXTERIOR / BODY INSPECTION', '🎨', yPos);
    
    const exteriorChecks = ensureArray(data.exteriorChecks);
    if (exteriorChecks.length > 0) {
      const checkboxSize = 8;
      let checkY = yPos;
      let checkX = 50;
      const colWidth = 250;
      
      exteriorChecks.forEach((check, index) => {
        if (index > 0 && index % 12 === 0) {
          checkY = yPos;
          checkX += colWidth;
        }
        
        checkY = checkNewPage(checkY, 25);
        
        // Checkbox
        doc.rect(checkX, checkY, checkboxSize, checkboxSize)
           .fillAndStroke(colors.success, colors.success);
        
        // Checkmark
        doc.fillColor('#ffffff')
           .fontSize(10)
           .text('✓', checkX + 1, checkY - 1);
        
        // Label
        doc.fillColor(colors.text)
           .fontSize(9)
           .font('Helvetica')
           .text(check, checkX + checkboxSize + 5, checkY, { 
             width: colWidth - checkboxSize - 10 
           });
        
        checkY += 18;
        
        if (index === exteriorChecks.length - 1) {
          yPos = checkY;
        }
      });
      
      yPos += 10;
    }

    // Paint Depth & Notes
    if (data.paintDepth) {
      yPos = checkNewPage(yPos, 60);
      doc.fillColor(colors.lightText)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('Paint Depth Readings:', 50, yPos);
      
      yPos += 15;
      
      doc.fillColor(colors.text)
         .fontSize(9)
         .font('Helvetica')
         .text(data.paintDepth, 50, yPos, { width: 505 });
      
      yPos += doc.heightOfString(data.paintDepth, { width: 505 }) + 15;
    }

    if (data.exteriorNotes) {
      yPos = checkNewPage(yPos, 60);
      doc.roundedRect(50, yPos, 505, 'auto', 5)
         .fillColor('#f5f5f5');
      
      doc.fillColor(colors.lightText)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('Additional Notes:', 60, yPos + 10);
      
      doc.fillColor(colors.text)
         .fontSize(9)
         .font('Helvetica')
         .text(data.exteriorNotes, 60, yPos + 25, { 
           width: 485,
           align: 'justify'
         });
      
      yPos += doc.heightOfString(data.exteriorNotes, { width: 485 }) + 45;
    } else {
      yPos += 15;
    }

    // ========== INTERIOR INSPECTION ==========
    yPos = checkNewPage(yPos, 200);
    yPos = drawSectionHeader('INTERIOR INSPECTION', '🛋️', yPos);
    
    const interiorChecks = ensureArray(data.interiorChecks);
    if (interiorChecks.length > 0) {
      const checkboxSize = 8;
      let checkY = yPos;
      let checkX = 50;
      const colWidth = 250;
      
      interiorChecks.forEach((check, index) => {
        if (index > 0 && index % 12 === 0) {
          checkY = yPos;
          checkX += colWidth;
        }
        
        checkY = checkNewPage(checkY, 25);
        
        doc.rect(checkX, checkY, checkboxSize, checkboxSize)
           .fillAndStroke(colors.success, colors.success);
        
        doc.fillColor('#ffffff')
           .fontSize(10)
           .text('✓', checkX + 1, checkY - 1);
        
        doc.fillColor(colors.text)
           .fontSize(9)
           .font('Helvetica')
           .text(check, checkX + checkboxSize + 5, checkY, { 
             width: colWidth - checkboxSize - 10 
           });
        
        checkY += 18;
        
        if (index === interiorChecks.length - 1) {
          yPos = checkY;
        }
      });
      
      yPos += 10;
    }

    if (data.interiorNotes) {
      yPos = checkNewPage(yPos, 60);
      doc.roundedRect(50, yPos, 505, 'auto', 5)
         .fillColor('#f5f5f5');
      
      doc.fillColor(colors.lightText)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('Additional Notes:', 60, yPos + 10);
      
      doc.fillColor(colors.text)
         .fontSize(9)
         .font('Helvetica')
         .text(data.interiorNotes, 60, yPos + 25, { 
           width: 485,
           align: 'justify'
         });
      
      yPos += doc.heightOfString(data.interiorNotes, { width: 485 }) + 45;
    } else {
      yPos += 15;
    }

    // ========== ENGINE & MECHANICAL ==========
    yPos = checkNewPage(yPos, 200);
    yPos = drawSectionHeader('ENGINE & MECHANICAL INSPECTION', '⚙️', yPos);
    
    const engineChecks = ensureArray(data.engineChecks);
    if (engineChecks.length > 0) {
      const checkboxSize = 8;
      let checkY = yPos;
      let checkX = 50;
      const colWidth = 250;
      
      engineChecks.forEach((check, index) => {
        if (index > 0 && index % 12 === 0) {
          checkY = yPos;
          checkX += colWidth;
        }
        
        checkY = checkNewPage(checkY, 25);
        
        doc.rect(checkX, checkY, checkboxSize, checkboxSize)
           .fillAndStroke(colors.success, colors.success);
        
        doc.fillColor('#ffffff')
           .fontSize(10)
           .text('✓', checkX + 1, checkY - 1);
        
        doc.fillColor(colors.text)
           .fontSize(9)
           .font('Helvetica')
           .text(check, checkX + checkboxSize + 5, checkY, { 
             width: colWidth - checkboxSize - 10 
           });
        
        checkY += 18;
        
        if (index === interiorChecks.length - 1) {
          yPos = checkY;
        }
      });
      
      yPos += 10;
    }

    if (data.repairCost) {
      yPos = checkNewPage(yPos, 40);
      doc.roundedRect(50, yPos, 200, 35, 5)
         .fillAndStroke(colors.warning, colors.warning);
      
      doc.fillColor('#ffffff')
         .fontSize(9)
         .font('Helvetica')
         .text('Estimated Repair Cost', 60, yPos + 8);
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(data.repairCost, 60, yPos + 20);
      
      yPos += 50;
    }

    if (data.engineNotes) {
      yPos = checkNewPage(yPos, 60);
      doc.roundedRect(50, yPos, 505, 'auto', 5)
         .fillColor('#f5f5f5');
      
      doc.fillColor(colors.lightText)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('Additional Notes:', 60, yPos + 10);
      
      doc.fillColor(colors.text)
         .fontSize(9)
         .font('Helvetica')
         .text(data.engineNotes, 60, yPos + 25, { 
           width: 485,
           align: 'justify'
         });
      
      yPos += doc.heightOfString(data.engineNotes, { width: 485 }) + 45;
    } else {
      yPos += 15;
    }

    // ========== TIRES & WHEELS ==========
    yPos = checkNewPage(yPos, 200);
    yPos = drawSectionHeader('TIRES & WHEELS INSPECTION', '⭕', yPos);
    
    const tireFields = [
      { label: 'Front LHS', value: data.tireFrontLHS },
      { label: 'Front RHS', value: data.tireFrontRHS },
      { label: 'Rear LHS', value: data.tireRearLHS },
      { label: 'Rear RHS', value: data.tireRearRHS },
      { label: 'Spare Tire', value: data.tireSpare }
    ];
    
    tireFields.forEach((tire, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = 50 + (col * 260);
      const y = yPos + (row * 35);
      
      doc.fillColor(colors.lightText)
         .fontSize(9)
         .font('Helvetica')
         .text(tire.label, x, y);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(tire.value || 'N/A', x, y + 12, { width: 240 });
    });
    
    yPos += 90;

    if (data.wheelCondition) {
      doc.fillColor(colors.lightText)
         .fontSize(9)
         .font('Helvetica')
         .text('Alloy Wheels Condition', 50, yPos);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(data.wheelCondition, 50, yPos + 12);
      
      yPos += 30;
    }

    if (data.tiresNotes) {
      yPos = checkNewPage(yPos, 60);
      doc.roundedRect(50, yPos, 505, 'auto', 5)
         .fillColor('#f5f5f5');
      
      doc.fillColor(colors.lightText)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('Additional Notes:', 60, yPos + 10);
      
      doc.fillColor(colors.text)
         .fontSize(9)
         .font('Helvetica')
         .text(data.tiresNotes, 60, yPos + 25, { 
           width: 485,
           align: 'justify'
         });
      
      yPos += doc.heightOfString(data.tiresNotes, { width: 485 }) + 45;
    } else {
      yPos += 15;
    }

    // ========== TEST DRIVE ==========
    if (data.testDrive) {
      yPos = checkNewPage(yPos, 150);
      yPos = drawSectionHeader('TEST DRIVE ASSESSMENT', '🛣️', yPos);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(`Test Drive Conducted: ${data.testDrive}`, 50, yPos);
      
      yPos += 25;
      
      if (data.testDriveNotes) {
        doc.roundedRect(50, yPos, 505, 'auto', 5)
           .fillColor('#f5f5f5');
        
        doc.fillColor(colors.text)
           .fontSize(9)
           .font('Helvetica')
           .text(data.testDriveNotes, 60, yPos + 10, { 
             width: 485,
             align: 'justify'
           });
        
        yPos += doc.heightOfString(data.testDriveNotes, { width: 485 }) + 30;
      }
      
      yPos += 15;
    }

    // ========== STRUCTURE & UNDERCARRIAGE ==========
    const structureChecks = ensureArray(data.structureChecks);
    if (structureChecks.length > 0) {
      yPos = checkNewPage(yPos, 200);
      yPos = drawSectionHeader('STRUCTURE & UNDERCARRIAGE', '🏗️', yPos);
      
      const checkboxSize = 8;
      let checkY = yPos;
      let checkX = 50;
      const colWidth = 250;
      
      structureChecks.forEach((check, index) => {
        if (index > 0 && index % 8 === 0) {
          checkY = yPos;
          checkX += colWidth;
        }
        
        checkY = checkNewPage(checkY, 25);
        
        doc.rect(checkX, checkY, checkboxSize, checkboxSize)
           .fillAndStroke(colors.success, colors.success);
        
        doc.fillColor('#ffffff')
           .fontSize(10)
           .text('✓', checkX + 1, checkY - 1);
        
        doc.fillColor(colors.text)
           .fontSize(9)
           .font('Helvetica')
           .text(check, checkX + checkboxSize + 5, checkY, { 
             width: colWidth - checkboxSize - 10 
           });
        
        checkY += 18;
        
        if (index === structureChecks.length - 1) {
          yPos = checkY;
        }
      });
      
      yPos += 10;
    }

    if (data.structureNotes) {
      yPos = checkNewPage(yPos, 60);
      doc.roundedRect(50, yPos, 505, 'auto', 5)
         .fillColor('#f5f5f5');
      
      doc.fillColor(colors.lightText)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('Additional Notes:', 60, yPos + 10);
      
      doc.fillColor(colors.text)
         .fontSize(9)
         .font('Helvetica')
         .text(data.structureNotes, 60, yPos + 25, { 
           width: 485,
           align: 'justify'
         });
      
      yPos += doc.heightOfString(data.structureNotes, { width: 485 }) + 45;
    } else {
      yPos += 15;
    }

    // ========== ISSUES FOUND & RECOMMENDATIONS ==========
    if (data.issuesFound || data.recommendations) {
      yPos = checkNewPage(yPos, 200);
      yPos = drawSectionHeader('ISSUES FOUND & RECOMMENDATIONS', '📋', yPos);
      
      if (data.issuesFound) {
        doc.roundedRect(50, yPos, 505, 'auto', 5)
           .fillAndStroke(colors.danger, colors.danger);
        
        doc.fillColor('#ffffff')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('Major Issues Found:', 60, yPos + 10);
        
        doc.fontSize(9)
           .font('Helvetica')
           .text(data.issuesFound, 60, yPos + 28, { 
             width: 485,
             align: 'justify'
           });
        
        yPos += doc.heightOfString(data.issuesFound, { width: 485 }) + 48;
      }
      
      if (data.recommendations) {
        yPos = checkNewPage(yPos, 80);
        
        doc.roundedRect(50, yPos, 505, 'auto', 5)
           .fillAndStroke(colors.accent, colors.accent);
        
        doc.fillColor('#ffffff')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('Recommendations:', 60, yPos + 10);
        
        doc.fontSize(9)
           .font('Helvetica')
           .text(data.recommendations, 60, yPos + 28, { 
             width: 485,
             align: 'justify'
           });
        
        yPos += doc.heightOfString(data.recommendations, { width: 485 }) + 48;
      }
    }

    // ========== FOOTER ON ALL PAGES ==========
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 1; i <= pageCount; i++) {
      doc.switchToPage(i);
      
      // Footer background
      doc.rect(0, 780, 595, 62)
         .fillAndStroke(colors.primary, colors.primary);
      
      // Footer text
      doc.fillColor('#ffffff')
         .fontSize(8)
         .font('Helvetica')
         .text(
           'InspectionWale - Professional Vehicle Inspection Services | www.inspectionwale.com',
           40,
           792,
           { align: 'center', width: 515 }
         );
      
      doc.fontSize(7)
         .text(
           'Disclaimer: This report is based on visual inspection only. Mechanical condition beyond visual inspection is not guaranteed.',
           40,
           808,
           { align: 'center', width: 515 }
         );
      
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .text(
           `Page ${i} of ${pageCount}`,
           40,
           824,
           { align: 'center', width: 515 }
         );
    }

    doc.end();
  });
}

// Main Lambda Handler
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event));
  
  try {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
    console.log('Content-Type:', contentType);
    
    let fields = {};
    let files = [];
    
    if (contentType.includes('application/json')) {
      console.log('Parsing JSON body...');
      fields = JSON.parse(event.body);
    } else if (contentType.includes('multipart/form-data')) {
      console.log('Parsing multipart form data...');
      const parsed = await parseMultipartForm(event);
      fields = parsed.fields;
      files = parsed.files;
    } else {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `Unsupported content type: ${contentType}. Use application/json or multipart/form-data` 
        })
      };
    }
    
    console.log('Fields:', Object.keys(fields));
    console.log('Files count:', files.length);
    console.log('Field values:', JSON.stringify(fields, null, 4));
    
    // Convert checkbox arrays properly
    ['exteriorChecks', 'interiorChecks', 'engineChecks', 'structureChecks'].forEach(key => {
      if (fields[key]) {
        fields[key] = ensureArray(fields[key]);
      }
    });
    
    console.log('Generating PDF...');
    const pdfBuffer = await generatePDF(fields);
    
    const timestamp = Date.now();
    const fileName = `reports/${fields.registrationNumber}_${timestamp}.pdf`;
    
    console.log('Uploading to S3:', fileName);
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.REPORTS_BUCKET,
      Key: fileName,
      Body: pdfBuffer,
      ContentType: 'application/pdf'
    }));
    
    const reportUrl = `https://${process.env.REPORTS_BUCKET}.s3.amazonaws.com/${fileName}`;
    
    console.log('Saving to DynamoDB...');
    await docClient.send(new PutCommand({
      TableName: process.env.INSPECTIONS_TABLE,
      Item: {
        reportId: `INS-${timestamp}`,
        timestamp: new Date().toISOString(),
        registrationNumber: fields.registrationNumber,
        make: fields.make,
        model: fields.model,
        inspectorName: fields.inspectorName,
        reportUrl: reportUrl
      }
    }));
    
    console.log('Report generated successfully');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Report generated successfully',
        reportUrl: reportUrl,
        reportId: `INS-${timestamp}`
      })
    };
    
  } catch (error) {
    console.error('Report generation error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: 'Failed to generate report', 
        error: error.message 
      })
    };
  }
};
