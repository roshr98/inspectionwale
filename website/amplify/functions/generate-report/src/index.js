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

// ========== CLEAN PROFESSIONAL PDF GENERATION ==========
async function generatePDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      size: 'A4',
      margins: { top: 51, bottom: 51, left: 51, right: 51 },
      bufferPages: true,
      info: {
        Title: `Vehicle Inspection Report - ${data.registrationNumber}`,
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

    // ========== HELPER FUNCTIONS ==========
    
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

    function addImage(imageBuffer, x, y, width, height, caption) {
      if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
        console.warn(`Invalid image buffer for: ${caption}`);
        return y;
      }
      
      try {
        doc.image(imageBuffer, x, y, {
          fit: [width, height],
          align: 'center',
          valign: 'center'
        });
        
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
      } catch (error) {
        console.error(`Failed to embed image ${caption}:`, error.message);
        doc.rect(x, y, width, height).stroke(colors.border);
        doc.fillColor(colors.lightText)
           .fontSize(8)
           .text('Image error', x, y + height/2, {width: width, align: 'center'});
        return y + height + 5;
      }
    }

    function addImageGrid(images, yPos, columns = 3) {
      if (!images || images.length === 0) return yPos;
      
      const totalWidth = 493;
      const gap = 10;
      const imageWidth = (totalWidth - ((columns - 1) * gap)) / columns;
      const imageHeight = 90;
      
      let currentCol = 0;
      let rowStartY = yPos;
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img || !img.buffer) continue;
        
        if (currentCol === 0) {
          rowStartY = checkNewPage(rowStartY, imageHeight + 25);
        }
        
        const x = 51 + (currentCol * (imageWidth + gap));
        addImage(img.buffer, x, rowStartY, imageWidth, imageHeight, img.caption);
        
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

    // Report metadata (right-aligned)
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
    
    // Column 1
    yPos = addTableRow('Registration Number', data.registrationNumber, 51, yPos);
    yPos = addTableRow('Make / Model', `${data.make || 'N/A'} ${data.model || ''}`.trim(), 51, yPos);
    yPos = addTableRow('Variant', data.variant, 51, yPos);
    yPos = addTableRow('Chassis Number', data.chassisNumber, 51, yPos);
    yPos = addTableRow('Engine Number', data.engineNumber, 51, yPos);
    
    // Column 2 (side by side)
    let yPos2 = yPos - 90;
    yPos2 = addTableRow('Year of Manufacture', data.manufactureYear, 310, yPos2, 110, 120);
    yPos2 = addTableRow('Registration Date', data.registrationDate, 310, yPos2, 110, 120);
    yPos2 = addTableRow('Color', data.color, 310, yPos2, 110, 120);
    yPos2 = addTableRow('Fuel Type', data.fuelType, 310, yPos2, 110, 120);
    yPos2 = addTableRow('Odometer Reading', `${data.odometerReading} km`, 310, yPos2, 110, 120);
    
    yPos = Math.max(yPos, yPos2) + 10;

    // ========== OWNER DETAILS ==========
    yPos = drawSectionHeader('Current Owner Details', yPos);
    
    yPos = checkNewPage(yPos, 60);
    yPos = addTableRow('Owner Name', data.ownerName, 51, yPos);
    yPos = addTableRow('Contact Number', data.ownerContact, 51, yPos);
    yPos = addTableRow('Email Address', data.ownerEmail, 51, yPos);
    yPos = addTableRow('Inspection Location', data.location, 51, yPos);
    yPos += 10;

    // ========== DOCUMENT PHOTOS ==========
    if (data.imageBuffers && (data.imageBuffers.rcBook || data.imageBuffers.chassisPlate || data.imageBuffers.odometer)) {
      yPos = drawSectionHeader('Vehicle Documents', yPos);
      
      const docImages = [
        {buffer: data.imageBuffers.rcBook, caption: 'RC Book'},
        {buffer: data.imageBuffers.chassisPlate, caption: 'Chassis Plate'},
        {buffer: data.imageBuffers.odometer, caption: 'Odometer Reading'}
      ].filter(img => img.buffer);
      
      yPos = addImageGrid(docImages, yPos, 3);
      yPos += 10;
    }

    // ========== EXTERIOR SECTION ==========
    const exteriorChecks = ensureArray(data.exteriorChecks);
    if (exteriorChecks.length > 0) {
      yPos = drawSectionHeader('Exterior / Body', yPos);
      
      yPos = checkNewPage(yPos, 40);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(exteriorChecks.join(', '), 51, yPos, {width: 493, align: 'justify'});
      
      yPos += doc.heightOfString(exteriorChecks.join(', '), {width: 493}) + 15;
    }

    if (data.exteriorNotes) {
      yPos = checkNewPage(yPos, 40);
      
      doc.rect(51, yPos, 493, doc.heightOfString(data.exteriorNotes, {width: 473}) + 20)
         .fill(colors.background);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(data.exteriorNotes, 61, yPos + 10, {width: 473, align: 'justify'});
      
      yPos += doc.heightOfString(data.exteriorNotes, {width: 473}) + 30;
    }

    // Exterior Photos
    if (data.imageBuffers) {
      const exteriorImages = [
        {buffer: data.imageBuffers.frontBumper, caption: 'Front Bumper'},
        {buffer: data.imageBuffers.bonnet, caption: 'Bonnet'},
        {buffer: data.imageBuffers.frontGrille, caption: 'Front Grille'},
        {buffer: data.imageBuffers.headlights, caption: 'Headlights'},
        {buffer: data.imageBuffers.windshield, caption: 'Windshield'},
        {buffer: data.imageBuffers.wipers, caption: 'Wipers'},
        {buffer: data.imageBuffers.doorDriverFront, caption: 'Driver Front Door'},
        {buffer: data.imageBuffers.doorPassengerFront, caption: 'Passenger Front Door'},
        {buffer: data.imageBuffers.doorDriverRear, caption: 'Driver Rear Door'},
        {buffer: data.imageBuffers.doorPassengerRear, caption: 'Passenger Rear Door'},
        {buffer: data.imageBuffers.mirrorLeft, caption: 'Left Mirror'},
        {buffer: data.imageBuffers.mirrorRight, caption: 'Right Mirror'},
        {buffer: data.imageBuffers.rearBumper, caption: 'Rear Bumper'},
        {buffer: data.imageBuffers.bootClosed, caption: 'Boot Closed'},
        {buffer: data.imageBuffers.bootOpen, caption: 'Boot Open'},
        {buffer: data.imageBuffers.taillights, caption: 'Taillights'},
        {buffer: data.imageBuffers.rearWindshield, caption: 'Rear Windshield'},
        {buffer: data.imageBuffers.roof, caption: 'Roof'}
      ].filter(img => img.buffer);
      
      if (exteriorImages.length > 0) {
        yPos = addImageGrid(exteriorImages, yPos, 3);
        yPos += 10;
      }
    }

    // ========== INTERIOR SECTION ==========
    const interiorChecks = ensureArray(data.interiorChecks);
    if (interiorChecks.length > 0) {
      yPos = drawSectionHeader('Interior', yPos);
      
      yPos = checkNewPage(yPos, 40);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(interiorChecks.join(', '), 51, yPos, {width: 493, align: 'justify'});
      
      yPos += doc.heightOfString(interiorChecks.join(', '), {width: 493}) + 15;
    }

    if (data.interiorNotes) {
      yPos = checkNewPage(yPos, 40);
      const notesHeight = doc.heightOfString(data.interiorNotes, {width: 473});
      
      doc.rect(51, yPos, 493, notesHeight + 20)
         .fill(colors.background);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(data.interiorNotes, 61, yPos + 10, {width: 473, align: 'justify'});
      
      yPos += notesHeight + 30;
    }

    // Interior Photos
    if (data.imageBuffers) {
      const interiorImages = [
        {buffer: data.imageBuffers.dashboard, caption: 'Dashboard'},
        {buffer: data.imageBuffers.instrumentCluster, caption: 'Instrument Cluster'},
        {buffer: data.imageBuffers.steeringWheel, caption: 'Steering Wheel'},
        {buffer: data.imageBuffers.frontSeats, caption: 'Front Seats'},
        {buffer: data.imageBuffers.rearSeats, caption: 'Rear Seats'},
        {buffer: data.imageBuffers.acPanel, caption: 'AC Control Panel'},
        {buffer: data.imageBuffers.musicSystem, caption: 'Music System'},
        {buffer: data.imageBuffers.gearLever, caption: 'Gear Lever'},
        {buffer: data.imageBuffers.interiorRoof, caption: 'Interior Roof'}
      ].filter(img => img.buffer);
      
      if (interiorImages.length > 0) {
        yPos = addImageGrid(interiorImages, yPos, 3);
        yPos += 10;
      }
    }

    // ========== ENGINE & MECHANICAL ==========
    const engineChecks = ensureArray(data.engineChecks);
    if (engineChecks.length > 0) {
      yPos = drawSectionHeader('Engine & Mechanical', yPos);
      
      yPos = checkNewPage(yPos, 40);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(engineChecks.join(', '), 51, yPos, {width: 493, align: 'justify'});
      
      yPos += doc.heightOfString(engineChecks.join(', '), {width: 493}) + 15;
    }

    if (data.engineNotes) {
      yPos = checkNewPage(yPos, 40);
      const notesHeight = doc.heightOfString(data.engineNotes, {width: 473});
      
      doc.rect(51, yPos, 493, notesHeight + 20)
         .fill(colors.background);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(data.engineNotes, 61, yPos + 10, {width: 473, align: 'justify'});
      
      yPos += notesHeight + 30;
    }

    // Engine Photos
    if (data.imageBuffers) {
      const engineImages = [
        {buffer: data.imageBuffers.engineBay, caption: 'Engine Bay'},
        {buffer: data.imageBuffers.engineBlock, caption: 'Engine Block'},
        {buffer: data.imageBuffers.battery, caption: 'Battery'},
        {buffer: data.imageBuffers.radiator, caption: 'Radiator'},
        {buffer: data.imageBuffers.oilCap, caption: 'Oil Cap'},
        {buffer: data.imageBuffers.beltsHoses, caption: 'Belts & Hoses'}
      ].filter(img => img.buffer);
      
      if (engineImages.length > 0) {
        yPos = addImageGrid(engineImages, yPos, 3);
        yPos += 10;
      }
    }

    // ========== TIRES & WHEELS ==========
    const tireChecks = ensureArray(data.tireChecks);
    if (tireChecks.length > 0) {
      yPos = drawSectionHeader('Tires & Wheels', yPos);
      
      yPos = checkNewPage(yPos, 40);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(tireChecks.join(', '), 51, yPos, {width: 493, align: 'justify'});
      
      yPos += doc.heightOfString(tireChecks.join(', '), {width: 493}) + 15;
    }

    if (data.tiresNotes) {
      yPos = checkNewPage(yPos, 40);
      const notesHeight = doc.heightOfString(data.tiresNotes, {width: 473});
      
      doc.rect(51, yPos, 493, notesHeight + 20)
         .fill(colors.background);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(data.tiresNotes, 61, yPos + 10, {width: 473, align: 'justify'});
      
      yPos += notesHeight + 30;
    }

    // Tire Photos
    if (data.imageBuffers) {
      const tireImages = [
        {buffer: data.imageBuffers.tireFrontLeft, caption: 'Front Left Tire'},
        {buffer: data.imageBuffers.tireFrontRight, caption: 'Front Right Tire'},
        {buffer: data.imageBuffers.tireRearLeft, caption: 'Rear Left Tire'},
        {buffer: data.imageBuffers.tireRearRight, caption: 'Rear Right Tire'},
        {buffer: data.imageBuffers.tireSpare, caption: 'Spare Tire'}
      ].filter(img => img.buffer);
      
      if (tireImages.length > 0) {
        yPos = addImageGrid(tireImages, yPos, 3);
        yPos += 10;
      }
    }

    // ========== STRUCTURE & UNDERCARRIAGE ==========
    const structureChecks = ensureArray(data.structureChecks);
    if (structureChecks.length > 0) {
      yPos = drawSectionHeader('Structure & Undercarriage', yPos);
      
      yPos = checkNewPage(yPos, 40);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(structureChecks.join(', '), 51, yPos, {width: 493, align: 'justify'});
      
      yPos += doc.heightOfString(structureChecks.join(', '), {width: 493}) + 15;
    }

    if (data.structureNotes) {
      yPos = checkNewPage(yPos, 40);
      const notesHeight = doc.heightOfString(data.structureNotes, {width: 473});
      
      doc.rect(51, yPos, 493, notesHeight + 20)
         .fill(colors.background);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Helvetica')
         .text(data.structureNotes, 61, yPos + 10, {width: 473, align: 'justify'});
      
      yPos += notesHeight + 30;
    }

    // Undercarriage Photos
    if (data.imageBuffers) {
      const structureImages = [
        {buffer: data.imageBuffers.undercarriageFront, caption: 'Front Undercarriage'},
        {buffer: data.imageBuffers.undercarriageRear, caption: 'Rear Undercarriage'},
        {buffer: data.imageBuffers.exhaust, caption: 'Exhaust System'},
        {buffer: data.imageBuffers.suspensionFront, caption: 'Front Suspension'},
        {buffer: data.imageBuffers.suspensionRear, caption: 'Rear Suspension'}
      ].filter(img => img.buffer);
      
      if (structureImages.length > 0) {
        yPos = addImageGrid(structureImages, yPos, 3);
        yPos += 10;
      }
    }

    // ========== TEST DRIVE ==========
    if (data.testDrive || data.testDriveNotes) {
      yPos = drawSectionHeader('Test Drive', yPos);
      
      yPos = checkNewPage(yPos, 40);
      
      if (data.testDrive) {
        doc.fillColor(colors.label)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('Test Drive Conducted: ', 51, yPos, {continued: true})
           .fillColor(colors.text)
           .font('Helvetica')
           .text(data.testDrive);
        
        yPos += 20;
      }

      if (data.testDriveNotes) {
        yPos = checkNewPage(yPos, 40);
        const notesHeight = doc.heightOfString(data.testDriveNotes, {width: 473});
        
        doc.rect(51, yPos, 493, notesHeight + 20)
           .fill(colors.background);
        
        doc.fillColor(colors.text)
           .fontSize(10)
           .font('Helvetica')
           .text(data.testDriveNotes, 61, yPos + 10, {width: 473, align: 'justify'});
        
        yPos += notesHeight + 30;
      }
    }

    // ========== ISSUES & RECOMMENDATIONS ==========
    if (data.issuesFound || data.recommendations) {
      yPos = drawSectionHeader('Issues Found & Recommendations', yPos);
      
      if (data.issuesFound) {
        yPos = checkNewPage(yPos, 60);
        const issuesHeight = doc.heightOfString(data.issuesFound, {width: 473});
        
        doc.rect(51, yPos, 493, issuesHeight + 30)
           .fillAndStroke(colors.danger, colors.danger);
        
        doc.fillColor('#ffffff')
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('Major Issues Found:', 61, yPos + 10);
        
        doc.fontSize(10)
           .font('Helvetica')
           .text(data.issuesFound, 61, yPos + 26, {width: 473, align: 'justify'});
        
        yPos += issuesHeight + 40;
      }

      if (data.recommendations) {
        yPos = checkNewPage(yPos, 60);
        const recHeight = doc.heightOfString(data.recommendations, {width: 473});
        
        doc.rect(51, yPos, 493, recHeight + 30)
           .fill(colors.background);
        
        doc.fillColor(colors.heading)
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('Recommendations:', 61, yPos + 10);
        
        doc.fillColor(colors.text)
           .fontSize(10)
           .font('Helvetica')
           .text(data.recommendations, 61, yPos + 26, {width: 473, align: 'justify'});
        
        yPos += recHeight + 40;
      }
    }

    // ========== OVERALL CONDITION ==========
    if (data.overallCondition) {
      yPos = checkNewPage(yPos, 40);
      
      doc.fillColor(colors.label)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Overall Condition: ', 51, yPos, {continued: true})
         .fillColor(colors.text)
         .font('Helvetica')
         .text(data.overallCondition);
      
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

// ========== MAIN HANDLER ==========
exports.handler = async (event) => {
  console.log('Starting report generation...');
  console.log('Content-Type:', event.headers['content-type'] || event.headers['Content-Type']);
  
  try {
    const { fields, files } = await parseMultipartForm(event);
    console.log('Files count:', files.length);
    
    // Compress and store images
    const imageBuffers = {};
    for (const file of files) {
      const fieldName = file.fieldname.replace('photo_', '');
      imageBuffers[fieldName] = file.buffer;
    }
    
    // Upload photos to S3
    console.log('Uploading images to S3...');
    const timestamp = Date.now();
    for (const [key, buffer] of Object.entries(imageBuffers)) {
      const fileName = `inspections/${fields.registrationNumber}/${timestamp}/${key}.jpg`;
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.REPORTS_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: 'image/jpeg'
      }));
    }
    console.log(`Uploaded ${Object.keys(imageBuffers).length} images successfully`);
    
    // Generate PDF
    console.log('Generating PDF with', Object.keys(imageBuffers).length, 'embedded images...');
    const pdfBuffer = await generatePDF({
      ...fields,
      imageBuffers
    });
    
    const fileName = `reports/${fields.registrationNumber}_${timestamp}.pdf`;
    
    console.log('Uploading PDF to S3:', fileName);
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
