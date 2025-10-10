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
        // Handle array fields
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

// Generate PDF Report
async function generatePDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    
    // Header with branding
    doc.fillColor('#D81324')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('InspectionWale', 50, 50);
    
    doc.fillColor('#666')
       .fontSize(12)
       .font('Helvetica')
       .text('Professional Vehicle Inspection Report', 50, 85);
    
    doc.moveTo(50, 105)
       .lineTo(545, 105)
       .strokeColor('#D81324')
       .lineWidth(2)
       .stroke();
    
    let yPos = 130;
    
    // Report Header Info
    doc.fillColor('#333')
       .fontSize(10)
       .text(`Report Date: ${new Date().toLocaleDateString('en-IN')}`, 50, yPos)
       .text(`Report ID: INS-${Date.now()}`, 350, yPos);
    
    yPos += 40;
    
    // Vehicle Information Section
    doc.fillColor('#D81324')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Vehicle Information', 50, yPos);
    
    yPos += 25;
    
    const vehicleInfo = [
      { label: 'Registration Number', value: data.registrationNumber },
      { label: 'Make', value: data.make },
      { label: 'Model', value: data.model },
      { label: 'Year', value: data.year },
      { label: 'Color', value: data.color || 'N/A' },
      { label: 'Fuel Type', value: data.fuelType || 'N/A' },
      { label: 'Odometer Reading', value: `${data.odometerReading} km` },
      { label: 'VIN/Chassis', value: data.vinNumber || 'N/A' }
    ];
    
    doc.fillColor('#333')
       .fontSize(10)
       .font('Helvetica');
    
    vehicleInfo.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = col === 0 ? 50 : 300;
      const y = yPos + (row * 20);
      
      doc.font('Helvetica-Bold').text(`${item.label}:`, x, y);
      doc.font('Helvetica').text(item.value, x + 120, y);
    });
    
    yPos += (Math.ceil(vehicleInfo.length / 2) * 20) + 30;
    
    // Owner Information
    if (data.ownerName || data.ownerContact) {
      doc.fillColor('#D81324')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('Owner/Seller Information', 50, yPos);
      
      yPos += 25;
      
      doc.fillColor('#333')
         .fontSize(10)
         .font('Helvetica');
      
      if (data.ownerName) {
        doc.font('Helvetica-Bold').text('Owner Name:', 50, yPos);
        doc.font('Helvetica').text(data.ownerName, 150, yPos);
        yPos += 20;
      }
      
      if (data.ownerContact) {
        doc.font('Helvetica-Bold').text('Contact:', 50, yPos);
        doc.font('Helvetica').text(data.ownerContact, 150, yPos);
        yPos += 20;
      }
      
      if (data.location) {
        doc.font('Helvetica-Bold').text('Location:', 50, yPos);
        doc.font('Helvetica').text(data.location, 150, yPos);
        yPos += 20;
      }
      
      yPos += 20;
    }
    
    // Inspection Checklist
    doc.addPage();
    yPos = 50;
    
    doc.fillColor('#D81324')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Inspection Checklist', 50, yPos);
    
    yPos += 30;
    
    const checklistSections = [
      { title: 'Exterior Condition', items: ensureArray(data.exteriorChecks) },
      { title: 'Interior Condition', items: ensureArray(data.interiorChecks) },
      { title: 'Engine & Mechanical', items: ensureArray(data.engineChecks) },
      { title: 'Tires & Wheels', items: ensureArray(data.tireChecks) }
    ];
    
    checklistSections.forEach(section => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }
      
      doc.fillColor('#333')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(section.title, 50, yPos);
      
      yPos += 20;
      
      if (section.items.length > 0) {
        doc.fontSize(10).font('Helvetica');
        section.items.forEach(item => {
          doc.fillColor('#2ecc71')
             .text('✓', 60, yPos)
             .fillColor('#333')
             .text(item, 80, yPos);
          yPos += 18;
        });
      } else {
        doc.fillColor('#999')
           .fontSize(10)
           .font('Helvetica-Oblique')
           .text('No items checked', 60, yPos);
        yPos += 18;
      }
      
      yPos += 15;
    });
    
    // Inspector Notes
    if (data.overallCondition || data.issuesFound || data.recommendations) {
      if (yPos > 650) {
        doc.addPage();
        yPos = 50;
      }
      
      yPos += 20;
      
      doc.fillColor('#D81324')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('Inspector Notes', 50, yPos);
      
      yPos += 25;
      
      if (data.overallCondition) {
        doc.fillColor('#333')
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('Overall Condition:', 50, yPos);
        yPos += 18;
        doc.fontSize(10)
           .font('Helvetica')
           .text(data.overallCondition, 50, yPos, { width: 495, align: 'justify' });
        yPos += doc.heightOfString(data.overallCondition, { width: 495 }) + 15;
      }
      
      if (data.issuesFound) {
        if (yPos > 650) {
          doc.addPage();
          yPos = 50;
        }
        doc.fillColor('#333')
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('Issues Found:', 50, yPos);
        yPos += 18;
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#c0392b')
           .text(data.issuesFound, 50, yPos, { width: 495, align: 'justify' });
        yPos += doc.heightOfString(data.issuesFound, { width: 495 }) + 15;
      }
      
      if (data.recommendations) {
        if (yPos > 650) {
          doc.addPage();
          yPos = 50;
        }
        doc.fillColor('#333')
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('Recommendations:', 50, yPos);
        yPos += 18;
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#333')
           .text(data.recommendations, 50, yPos, { width: 495, align: 'justify' });
        yPos += doc.heightOfString(data.recommendations, { width: 495 }) + 15;
      }
    }
    
    // Footer on each page
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 1; i <= totalPages; i++) {
      doc.switchToPage(i);
      doc.fillColor('#999')
         .fontSize(8)
         .font('Helvetica')
         .text(
           `InspectionWale - Professional Vehicle Inspection Services | Page ${i} of ${totalPages}`,
           50,
           doc.page.height - 50,
           { align: 'center', width: 495 }
         );
    }
    
    doc.end();
  });
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
    console.log('Content-Type:', contentType);
    
    let fields = {};
    let files = [];
    
    // Handle both JSON and multipart/form-data
    if (contentType.includes('application/json')) {
      // Parse JSON body (when sent through Amplify)
      console.log('Parsing JSON body...');
      const body = JSON.parse(event.body || '{}');
      fields = body;
      files = []; // No file uploads in JSON mode
    } else if (contentType.includes('multipart/form-data')) {
      // Parse multipart form data (direct Function URL)
      console.log('Parsing multipart form data...');
      const parsed = await parseMultipartForm(event);
      fields = parsed.fields;
      files = parsed.files;
    } else {
      throw new Error(`Unsupported content type: ${contentType}`);
    }
    
    console.log('Fields:', Object.keys(fields));
    console.log('Files count:', files.length);
    console.log('Field values:', JSON.stringify(fields, null, 2));
    
    // Validate required fields
    if (!fields.registrationNumber) {
      throw new Error('Registration number is required');
    }
    if (!fields.make || !fields.model || !fields.year) {
      throw new Error('Vehicle make, model, and year are required');
    }
    
    // Generate PDF
    console.log('Generating PDF...');
    const pdfBuffer = await generatePDF(fields);
    
    // Upload to S3
    const bucketName = process.env.REPORTS_BUCKET || 'inspectionwale-reports';
    const fileName = `reports/${fields.registrationNumber || Date.now()}_${Date.now()}.pdf`;
    
    console.log('Uploading PDF to S3...');
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      ContentDisposition: `attachment; filename="inspection-report-${fields.registrationNumber}.pdf"`
    }));
    
    // Upload photos to S3
    const photoUrls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const photoKey = `photos/${fields.registrationNumber}/${Date.now()}_${i}.jpg`;
      
      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: photoKey,
        Body: file.buffer,
        ContentType: file.mimeType
      }));
      
      photoUrls.push(`https://${bucketName}.s3.amazonaws.com/${photoKey}`);
    }
    
    // Save inspection record to DynamoDB
    const tableName = process.env.INSPECTIONS_TABLE || 'inspectionwale-inspections';
    const reportId = `INS-${Date.now()}`;
    
    await docClient.send(new PutCommand({
      TableName: tableName,
      Item: {
        reportId,
        registrationNumber: fields.registrationNumber,
        timestamp: new Date().toISOString(),
        vehicleInfo: {
          make: fields.make,
          model: fields.model,
          year: fields.year,
          color: fields.color,
          fuelType: fields.fuelType,
          odometerReading: fields.odometerReading,
          vinNumber: fields.vinNumber
        },
        ownerInfo: {
          name: fields.ownerName,
          contact: fields.ownerContact,
          location: fields.location
        },
        checklist: {
          exterior: ensureArray(fields.exteriorChecks),
          interior: ensureArray(fields.interiorChecks),
          engine: ensureArray(fields.engineChecks),
          tires: ensureArray(fields.tireChecks)
        },
        notes: {
          condition: fields.overallCondition,
          issues: fields.issuesFound,
          recommendations: fields.recommendations
        },
        reportUrl: `https://${bucketName}.s3.amazonaws.com/${fileName}`,
        photoUrls
      }
    }));
    
    console.log('Report generated successfully:', reportId);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        reportId,
        reportUrl: `https://${bucketName}.s3.amazonaws.com/${fileName}`,
        message: 'Inspection report generated successfully'
      })
    };

  } catch (error) {
    console.error('Report generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        ok: false,
        message: 'Failed to generate report',
        error: error.message
      })
    };
  }
};
