// Professional Vehicle Inspection Report Generator - Lambda Function
// V3: Fixed all issues + image compression for large phone photos

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const PDFDocument = require('pdfkit');
const Busboy = require('busboy');
const sharp = require('sharp');

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const BUCKET_NAME = process.env.BUCKET_NAME || 'inspectionwale-reports';
const TABLE_NAME = process.env.TABLE_NAME || 'InspectionReports';

// Professional color palette
const colors = {
  primary: '#1e3a8a',
  text: '#000000',
  label: '#4b5563',
  border: '#9ca3af',
  lightBorder: '#e5e7eb',
  bgWhite: '#ffffff',
  star: '#f59e0b',
  starEmpty: '#d1d5db'
};

// Image compression for large phone photos (S23 Ultra, etc.)
async function compressImage(imageBuffer, maxWidth = 1200, maxHeight = 1200, quality = 85) {
  try {
    console.log(`📷 Original image size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB`);
    
    const compressed = await sharp(imageBuffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    
    console.log(`✅ Compressed image size: ${(compressed.length / 1024 / 1024).toFixed(2)}MB`);
    return compressed;
  } catch (error) {
    console.error('⚠️ Image compression failed, using original:', error.message);
    return imageBuffer;
  }
}

// Parse multipart form data
async function parseMultipartForm(event) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: {
        'content-type': event.headers['content-type'] || event.headers['Content-Type']
      }
    });

    const fields = {};
    const files = {};
    let fileCount = 0;

    busboy.on('file', (fieldname, file, info) => {
      const { filename, mimeType } = info;
      const chunks = [];
      
      console.log(`📎 Processing file: ${fieldname} (${filename})`);

      file.on('data', (data) => {
        chunks.push(data);
      });

      file.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        
        // Compress large images (S23 Ultra photos can be 8-12MB+)
        if (mimeType.startsWith('image/')) {
          const compressedBuffer = await compressImage(buffer);
          files[fieldname] = {
            filename,
            mimeType,
            buffer: compressedBuffer
          };
        } else {
          files[fieldname] = {
            filename,
            mimeType,
            buffer
          };
        }
        
        fileCount++;
      });
    });

    busboy.on('field', (fieldname, value) => {
      fields[fieldname] = value;
    });

    busboy.on('finish', () => {
      console.log(`✅ Parsing complete: ${fileCount} files, ${Object.keys(fields).length} fields`);
      resolve({ fields, files });
    });

    busboy.on('error', (error) => {
      console.error('❌ Busboy error:', error);
      reject(error);
    });

    const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
    busboy.write(bodyBuffer);
    busboy.end();
  });
}

// Generate professional PDF with all fixes
async function generatePDF(formData, imageBuffers) {
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
    const leftMargin = 50;
    const contentWidth = 495;

    // Helper: Draw header WITHOUT special characters (fixes encoding issue)
    function drawHeader(isFirstPage = false) {
      if (isFirstPage) {
        doc.rect(0, 0, pageWidth, 85).fill(colors.bgWhite);
        
        // LEFT: Logo text
        doc.fillColor(colors.primary)
           .fontSize(20)
           .font('Helvetica-Bold')
           .text('InspectionWale', leftMargin, 20);
        
        doc.fillColor(colors.label)
           .fontSize(9)
           .font('Helvetica')
           .text('Rebranded from Whizzcheck', leftMargin, 45);
        
        // CENTER: Title
        doc.fillColor(colors.primary)
           .fontSize(22)
           .font('Helvetica-Bold')
           .text('Vehicle Inspection Report', 150, 25, {
             width: 250,
             align: 'center'
           });
        
        // RIGHT: ID and Date (FIXED SPACING)
        const reportId = `INS-${Date.now()}`;
        const reportDate = new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        
        doc.fillColor(colors.label)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('Inspection ID:', 430, 18);
        
        doc.fillColor(colors.text)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(reportId, 430, 31);
        
        doc.fillColor(colors.label)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('Date:', 430, 48);
        
        doc.fillColor(colors.text)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(reportDate, 430, 61);
        
        doc.moveTo(0, 85)
           .lineTo(pageWidth, 85)
           .lineWidth(2)
           .stroke(colors.primary);
      } else {
        doc.rect(0, 0, pageWidth, 60).fill(colors.bgWhite);
        
        doc.fillColor(colors.primary)
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('InspectionWale', leftMargin, 20);
        
        doc.moveTo(0, 60)
           .lineTo(pageWidth, 60)
           .lineWidth(1)
           .stroke(colors.border);
      }
    }

    // Helper: Draw complete footer
    function drawFooter(pageNum, totalPages) {
      const footerY = 755;
      
      doc.moveTo(0, footerY)
         .lineTo(pageWidth, footerY)
         .lineWidth(1)
         .stroke(colors.lightBorder);
      
      // Contact details (NO emoji to avoid encoding issues)
      doc.fillColor(colors.label)
         .fontSize(9)
         .font('Helvetica');
      
      doc.text('Email: hello@inspectionwale.com', leftMargin, footerY + 8);
      doc.text('Mobile: 9167558998', 220, footerY + 8);
      doc.text('Web: inspectionwale.com', 380, footerY + 8);
      
      doc.fillColor(colors.label)
         .fontSize(8)
         .font('Helvetica-Bold')
         .text(`Page ${pageNum} of ${totalPages}`, leftMargin, footerY + 24, {
           width: contentWidth,
           align: 'center'
         });
      
      doc.fillColor(colors.label)
         .fontSize(7)
         .font('Helvetica')
         .text('Professional vehicle inspection report. Visual inspection only. Report valid for 2 days or 20 km.',
               leftMargin, footerY + 36, {
                 width: contentWidth,
                 align: 'center'
               });
    }

    // Helper: Section header with CLEAN SQUARE BOX
    function drawSectionHeader(title, yPos) {
      doc.rect(leftMargin, yPos, contentWidth, 35)
         .lineWidth(1.5)
         .stroke(colors.border);
      
      doc.fillColor(colors.primary)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(title, leftMargin + 15, yPos + 11);
      
      return yPos + 50;
    }

    // Helper: Data row with BOLD BLACK values
    function addDataRow(label, value, x, y, labelWidth = 180) {
      doc.fillColor(colors.label)
         .fontSize(10)
         .font('Helvetica')
         .text(label, x, y);
      
      doc.fillColor(colors.text)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text(value || 'N/A', x + labelWidth, y, {
           width: contentWidth - labelWidth - (x - leftMargin)
         });
      
      return y + 22;
    }

    // Helper: Clean content box
    function drawContentBox(x, y, width, height) {
      doc.rect(x, y, width, height)
         .lineWidth(1)
         .stroke(colors.lightBorder);
    }

    // Helper: Add image to PDF (with compression support)
    function addImage(imageBuffer, x, y, width, height) {
      try {
        if (!imageBuffer || imageBuffer.length === 0) {
          // Placeholder
          doc.rect(x, y, width, height)
             .lineWidth(1)
             .stroke(colors.lightBorder);
          doc.fillColor(colors.label)
             .fontSize(10)
             .text('No Image', x, y + height/2 - 5, { width, align: 'center' });
          return;
        }
        
        doc.image(imageBuffer, x, y, {
          fit: [width, height],
          align: 'center',
          valign: 'center'
        });
      } catch (error) {
        console.error('Error embedding image:', error.message);
        doc.rect(x, y, width, height)
           .lineWidth(1)
           .stroke(colors.lightBorder);
      }
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
    
    drawHeader(true);
    let yPos = 110;

    // Vehicle Registration Details
    yPos = drawSectionHeader('Vehicle Registration Details', yPos);
    
    const vehicleBoxStart = yPos;
    yPos += 10;
    
    let leftColY = yPos;
    let rightColY = yPos;
    
    leftColY = addDataRow('Vehicle Number', formData.registrationNumber, leftMargin + 10, leftColY, 140);
    rightColY = addDataRow('Make / Model', `${formData.make} ${formData.model}`, 310, rightColY, 120);
    
    leftColY = addDataRow('Chassis Number', formData.chassisNumber, leftMargin + 10, leftColY, 140);
    rightColY = addDataRow('Engine Number', formData.engineNumber, 310, rightColY, 120);
    
    leftColY = addDataRow('Manufacture Year', formData.manufactureYear, leftMargin + 10, leftColY, 140);
    rightColY = addDataRow('Registration Date', formData.registrationDate, 310, rightColY, 120);
    
    leftColY = addDataRow('Fuel Type', formData.fuelType, leftMargin + 10, leftColY, 140);
    rightColY = addDataRow('Color', formData.color, 310, rightColY, 120);
    
    leftColY = addDataRow('Odometer Reading', `${formData.odometerReading} km`, leftMargin + 10, leftColY, 140);
    rightColY = addDataRow('Owners Count', formData.ownersCount, 310, rightColY, 120);
    
    yPos = Math.max(leftColY, rightColY) + 10;
    drawContentBox(leftMargin, vehicleBoxStart, contentWidth, yPos - vehicleBoxStart);
    
    yPos += 20;

    // Owner Details
    yPos = checkNewPage(yPos, 150);
    yPos = drawSectionHeader('Current Owner Details', yPos);
    
    const ownerBoxStart = yPos;
    yPos += 10;
    
    yPos = addDataRow('Owner Name', formData.ownerName, leftMargin + 10, yPos, 140);
    yPos = addDataRow('Contact', formData.ownerContact, leftMargin + 10, yPos, 140);
    yPos = addDataRow('Email', formData.ownerEmail, leftMargin + 10, yPos, 140);
    yPos = addDataRow('Location', formData.location, leftMargin + 10, yPos, 140);
    
    yPos += 10;
    drawContentBox(leftMargin, ownerBoxStart, contentWidth, yPos - ownerBoxStart);
    
    yPos += 20;

    // Inspector Details
    yPos = checkNewPage(yPos, 100);
    yPos = drawSectionHeader('Inspection Details', yPos);
    
    const inspectorBoxStart = yPos;
    yPos += 10;
    
    yPos = addDataRow('Inspector Name', formData.inspectorName, leftMargin + 10, yPos, 140);
    
    yPos += 10;
    drawContentBox(leftMargin, inspectorBoxStart, contentWidth, yPos - inspectorBoxStart);
    
    yPos += 20;

    // Add images if available (compressed from large phone photos)
    if (imageBuffers && Object.keys(imageBuffers).length > 0) {
      yPos = checkNewPage(yPos, 200);
      yPos = drawSectionHeader('Vehicle Photos', yPos);
      
      const imageWidth = 155;
      const imageHeight = 110;
      const gap = 15;
      
      let xPos = leftMargin;
      let imageCount = 0;
      
      Object.entries(imageBuffers).forEach(([fieldName, buffer]) => {
        if (imageCount % 3 === 0 && imageCount > 0) {
          yPos += imageHeight + 25;
          yPos = checkNewPage(yPos, imageHeight + 30);
          xPos = leftMargin;
        }
        
        addImage(buffer, xPos, yPos, imageWidth, imageHeight);
        
        // Caption
        doc.fillColor(colors.label)
           .fontSize(8)
           .font('Helvetica')
           .text(fieldName.replace(/([A-Z])/g, ' $1').trim(), xPos, yPos + imageHeight + 3, {
             width: imageWidth,
             align: 'center'
           });
        
        xPos += imageWidth + gap;
        imageCount++;
      });
      
      yPos += imageHeight + 30;
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

// Lambda handler
exports.handler = async (event) => {
  console.log('🚀 Starting inspection report generation...');

  try {
    // Parse multipart form data with image compression
    const { fields, files } = await parseMultipartForm(event);
    
    console.log(`✅ Files received: ${Object.keys(files).length}`);
    
    // Extract image buffers
    const imageBuffers = {};
    Object.entries(files).forEach(([key, file]) => {
      if (file.mimeType.startsWith('image/')) {
        imageBuffers[key] = file.buffer;
      }
    });
    
    // Generate PDF with all fixes
    const pdfBuffer = await generatePDF(fields, imageBuffers);
    console.log(`✅ PDF generated: ${(pdfBuffer.length / 1024).toFixed(2)}KB`);
    
    // Upload PDF to S3
    const pdfKey = `reports/${fields.registrationNumber}_${Date.now()}.pdf`;
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: pdfKey,
      Body: pdfBuffer,
      ContentType: 'application/pdf'
    }));
    
    console.log(`✅ PDF uploaded to S3: ${pdfKey}`);
    
    // Save metadata to DynamoDB
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        reportId: `INS-${Date.now()}`,
        vehicleNumber: fields.registrationNumber,
        inspectorName: fields.inspectorName,
        createdAt: new Date().toISOString(),
        pdfUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${pdfKey}`,
        photoCount: Object.keys(imageBuffers).length
      }
    }));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Report generated successfully',
        pdfUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${pdfKey}`,
        photoCount: Object.keys(imageBuffers).length
      })
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
