# Photo Upload Feature - Deployment Guide

## Overview
The inspection form has been updated to capture **48 photos** covering every aspect of vehicle inspection. All photos are uploaded to S3 and embedded in the final PDF report.

## What Was Changed

### 1. Inspector Form (`inspector-form.html`)
✅ **48 Photo Upload Fields Added:**

**Vehicle Documents (3 photos):**
- RC Book
- Chassis Plate  
- Odometer Reading

**Front Exterior (7 photos):**
- Front Bumper
- Bonnet
- Grille
- Left Headlight
- Right Headlight
- Windshield
- Wipers

**Sides (6 photos):**
- Front Left Door
- Front Right Door
- Rear Left Door
- Rear Right Door
- Left Mirror
- Right Mirror

**Rear (6 photos):**
- Rear Bumper
- Boot (Closed)
- Boot (Open)
- Left Taillight
- Right Taillight
- Rear Windshield
- Roof

**Interior (9 photos):**
- Dashboard
- Instrument Cluster
- Steering Wheel
- Front Seats
- Rear Seats
- AC Control Panel
- Music System
- Gear Lever
- Interior Roof

**Engine & Mechanical (6 photos):**
- Engine Bay
- Engine Block
- Battery
- Radiator
- Oil Cap
- Belts & Hoses

**Tires & Wheels (6 photos):**
- Front Left Tire
- Front Right Tire
- Rear Left Tire
- Rear Right Tire
- Spare Tire
- Alloy Wheels

**Undercarriage (6 photos):**
- Front Undercarriage
- Rear Undercarriage
- Exhaust System
- Front Suspension
- Rear Suspension
- Chassis Frame

**Features Added to Form:**
- ✅ All photos marked as **required** (red asterisk)
- ✅ **Instant preview** of uploaded photos
- ✅ Mobile camera direct access (`capture="environment"`)
- ✅ **Progress bar** showing upload percentage
- ✅ Professional blue gradient theme (#0b556b, #0073bb)
- ✅ Form submission changed from JSON to **FormData** (supports files)

### 2. Lambda Function (`amplify/functions/generate-report/src/index.js`)

**Image Processing Added (Lines 888-918):**
```javascript
// Upload all images to S3
const imageUrls = {};
const inspectionTimestamp = Date.now();

if (files.length > 0) {
  for (const file of files) {
    if (file.fieldname.startsWith('photo_')) {
      const photoKey = file.fieldname.replace('photo_', '');
      const imageFileName = `images/${fields.registrationNumber}/${inspectionTimestamp}/${photoKey}.jpg`;
      
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: imageFileName,
        Body: file.buffer,
        ContentType: 'image/jpeg'
      }));
      
      imageUrls[photoKey] = `https://${BUCKET}.s3.amazonaws.com/${imageFileName}`;
    }
  }
}

fields.images = imageUrls;
fields.imageBuffers = files.reduce((acc, file) => {
  if (file.fieldname.startsWith('photo_')) {
    const photoKey = file.fieldname.replace('photo_', '');
    acc[photoKey] = file.buffer;
  }
  return acc;
}, {});
```

**Image Embedding Functions Added (Lines 133-178):**
```javascript
// Embed single image with caption
function addImage(imageBuffer, x, y, maxWidth, maxHeight, caption) {
  yPos = checkNewPage(yPos, maxHeight + 20);
  doc.image(imageBuffer, x, y, {
    fit: [maxWidth, maxHeight],
    align: 'center'
  });
  if (caption) {
    doc.fontSize(8).fillColor('#666666')
       .text(caption, x, y + maxHeight + 5, {
         width: maxWidth,
         align: 'center'
       });
  }
  return y + maxHeight + 20;
}

// Display multiple images in grid layout
function addImageGrid(images, yPos, columns = 3) {
  const pageWidth = 595;
  const margin = 50;
  const availableWidth = pageWidth - (2 * margin);
  const imageWidth = (availableWidth - ((columns - 1) * 10)) / columns;
  const imageHeight = 150;
  
  let xPos = margin;
  let currentColumn = 0;
  
  images.forEach((img, index) => {
    if (currentColumn === columns) {
      yPos += imageHeight + 30;
      xPos = margin;
      currentColumn = 0;
    }
    
    yPos = checkNewPage(yPos, imageHeight + 30);
    
    if (img.buffer) {
      doc.image(img.buffer, xPos, yPos, {
        fit: [imageWidth, imageHeight],
        align: 'center'
      });
      
      if (img.caption) {
        doc.fontSize(8).fillColor('#666666')
           .text(img.caption, xPos, yPos + imageHeight + 5, {
             width: imageWidth,
             align: 'center'
           });
      }
    }
    
    xPos += imageWidth + 10;
    currentColumn++;
  });
  
  return yPos + imageHeight + 30;
}
```

**Image Sections Added to PDF:**
- ✅ Vehicle document photos (after registration details)
- ✅ Exterior photos (after exterior checklist)  
- ✅ Interior photos (after interior checklist)
- ✅ Engine photos (after engine checklist)
- ✅ Tire photos (after tire checklist)
- ✅ Undercarriage photos (after structure checklist)

**S3 Storage Structure:**
```
s3://inspectionwale-reports/
  └── images/
      └── {registrationNumber}/
          └── {timestamp}/
              ├── rcBook.jpg
              ├── chassisPlate.jpg
              ├── odometerPhoto.jpg
              ├── frontBumper.jpg
              ├── bonnet.jpg
              ... (45 more photos)
```

## Deployment Steps

### Option 1: AWS Console (Recommended)

1. **Navigate to Lambda Console:**
   - Go to: https://console.aws.amazon.com/lambda
   - Search for: `inspectionwale-generate-report`

2. **Upload Deployment Package:**
   - Click on the function name
   - Go to **Code** tab
   - Click **Upload from** → **.zip file**
   - Select: `C:\Users\Administrator\Documents\Inpectionwale\website\amplify\functions\generate-report\deployment-with-photos.zip`
   - Click **Save**

3. **Increase Timeout (IMPORTANT):**
   - Go to **Configuration** tab → **General configuration**
   - Click **Edit**
   - Change **Timeout** from 30 seconds to **90 seconds**
   - Click **Save**

4. **Increase Memory (Optional but Recommended):**
   - Same Configuration tab
   - Change **Memory** from 512 MB to **1024 MB**
   - Click **Save**

5. **Verify S3 Permissions:**
   - Go to **Configuration** → **Permissions**
   - Click on the execution role
   - Verify it has `s3:PutObject` permission for `inspectionwale-reports` bucket

### Option 2: AWS CLI

```powershell
# Update function code
aws lambda update-function-code `
  --function-name inspectionwale-generate-report `
  --zip-file fileb://C:\Users\Administrator\Documents\Inpectionwale\website\amplify\functions\generate-report\deployment-with-photos.zip

# Update timeout to 90 seconds
aws lambda update-function-configuration `
  --function-name inspectionwale-generate-report `
  --timeout 90

# Update memory to 1024 MB
aws lambda update-function-configuration `
  --function-name inspectionwale-generate-report `
  --memory-size 1024
```

## Testing the Feature

### 1. Access the Form
- URL: https://www.inspectionwale.com/inspector-form.html
- Login: `inspector1` / `Google@123455`

### 2. Upload Photos
- Fill in vehicle details
- Upload photos for each section (48 total)
- Use small test images first (< 2MB each)
- Verify instant preview appears for each photo

### 3. Submit Form
- Click **Generate Report**
- Watch progress bar (may take 30-60 seconds with photos)
- Wait for success message

### 4. Verify PDF
- Download the generated PDF
- Check that all sections have photos displayed
- Photos should appear in grids of 3 per row
- Captions should be visible under each photo

### 5. Check S3 Storage
- Go to S3 Console → `inspectionwale-reports` bucket
- Navigate to: `images/{registrationNumber}/{timestamp}/`
- Verify all 48 photos are stored

## Troubleshooting

### Issue: "Request Entity Too Large" Error
**Cause:** Total upload size exceeds API Gateway limit (10MB)
**Solution:** 
- Compress photos before upload (use < 200KB per photo)
- Consider adding client-side image compression

### Issue: Lambda Timeout
**Cause:** Processing 48 photos takes too long
**Solution:**
- Increase timeout to 90 seconds (done in deployment)
- Increase memory to 1024 MB (done in deployment)
- Consider async processing for very large uploads

### Issue: Photos Not Appearing in PDF
**Cause:** Image buffer not passed correctly
**Solution:**
- Check CloudWatch logs for errors
- Verify `data.imageBuffers` contains all photos
- Check if image embedding functions are called

### Issue: S3 Upload Fails
**Cause:** Missing permissions
**Solution:**
- Verify Lambda execution role has `s3:PutObject` permission
- Check bucket policy allows Lambda to write
- Verify bucket name is correct: `inspectionwale-reports`

## Performance Optimization (Future)

If experiencing slowness, consider:

1. **Client-Side Image Compression:**
   - Add JavaScript library to compress before upload
   - Target: 100-200KB per image
   - Maintain reasonable quality

2. **Parallel S3 Uploads:**
   - Use `Promise.all()` for concurrent uploads
   - Faster processing time

3. **Async PDF Generation:**
   - Store images first, generate PDF asynchronously
   - Send email when ready instead of real-time download

4. **Image Optimization:**
   - Resize images to standard dimensions (800x600)
   - Convert to WebP format for smaller size

## Monitoring

**CloudWatch Logs:**
- Function: `/aws/lambda/inspectionwale-generate-report`
- Monitor for errors during image processing
- Check execution time (should be < 90 seconds)

**S3 Metrics:**
- Monitor bucket size growth
- Set up lifecycle policy to archive old images (optional)

**API Gateway:**
- Monitor request count and latency
- Check for timeout errors

## Backup Information

**Original Form Backup:**
- Location: `inspector-form-backup-{timestamp}.html`
- Contains form without photo uploads

**Lambda Code Backups:**
- `deployment-package.zip` - Original deployment
- `deployment-with-photos.zip` - New deployment with photos

## Summary

✅ **Form Updated:** 48 photo upload fields with instant preview
✅ **Lambda Updated:** Image processing, S3 upload, PDF embedding
✅ **Deployment Package:** Ready at `deployment-with-photos.zip` (9.16 MB)
✅ **No Errors:** Code compiled successfully
✅ **Ready to Deploy:** Follow steps above to push to production

## Support

If you encounter any issues:
1. Check CloudWatch logs for error details
2. Verify all photos are < 2MB each
3. Test with fewer photos first (e.g., only required sections)
4. Contact AWS support if Lambda timeout persists despite configuration changes
