# Python Lambda Deployment Guide for InspectionWale

## What We're Doing

Converting the PDF generation from Node.js (PDFKit) to Python (ReportLab) because:
- ✅ Better font control and sizing
- ✅ No Unicode issues (proper star ratings ★★★★★)
- ✅ Exact template matching
- ✅ Better image compression (Pillow)

## Files Created

1. **lambda_function.py** - Main Python Lambda with ReportLab
2. **requirements.txt** - Python dependencies
3. This deployment guide

## Deployment Options

### Option A: Direct Lambda Deployment (Recommended for Testing)

1. **Package the Lambda Function:**
   ```bash
   cd amplify/functions/generate-report/src
   
   # Create deployment package
   mkdir python-package
   cd python-package
   
   # Install dependencies
   pip install -r ../requirements.txt -t .
   
   # Copy lambda function
   cp ../lambda_function.py .
   
   # Create zip
   zip -r ../python-deployment.zip .
   cd ..
   ```

2. **Deploy via AWS Console:**
   - Go to AWS Lambda Console
   - Find your function (check Amplify for function name)
   - Runtime Settings → Change to **Python 3.11**
   - Upload `python-deployment.zip`
   - Handler: `lambda_function.lambda_handler`
   - Timeout: 60 seconds
   - Memory: 1024 MB (for image processing)

### Option B: AWS SAM Deployment

Create `template.yaml`:
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  GenerateReportFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/
      Handler: lambda_function.lambda_handler
      Runtime: python3.11
      Timeout: 60
      MemorySize: 1024
      Environment:
        Variables:
          BUCKET_NAME: inspectionwale-reports
          TABLE_NAME: InspectionReports
```

Deploy:
```bash
sam build
sam deploy --guided
```

### Option C: Keep Amplify, Update Function

Since Amplify Gen 1 uses Node.js by default, we need to:

1. **Create a Python Layer:**
   ```bash
   mkdir python
   pip install reportlab Pillow -t python/
   zip -r python-layer.zip python/
   ```

2. **Upload layer to AWS Lambda**

3. **Update Amplify function to use Python runtime**

## Testing

Test event (test-event.json):
```json
{
  "httpMethod": "POST",
  "headers": {
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundary"
  },
  "body": "base64_encoded_multipart_data",
  "isBase64Encoded": true
}
```

## Expected Improvements

### Before (Node.js PDFKit):
- ❌ Header overlapping
- ❌ Star ratings showing `&` symbols
- ❌ Footer not visible
- ❌ Font sizes don't match template
- ❌ Text positioning imprecise

### After (Python ReportLab):
- ✅ Perfect header alignment (Logo | Title | Meta)
- ✅ Real star ratings ★★★★★ (no Unicode issues)
- ✅ Footer visible with all 3 details horizontally
- ✅ EXACT template font sizes (18px/14px/12px/11px)
- ✅ Precise positioning (#004a99 colors, 18mm margins)
- ✅ S23 Ultra image compression working

## Manual Deployment Steps (Simplest)

If Amplify deployment is complex, use direct Lambda update:

1. **Package Lambda:**
   ```powershell
   cd C:\Users\Administrator\Documents\Inpectionwale\website\amplify\functions\generate-report\src
   
   # Create virtual environment
   python -m venv venv
   .\venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt -t package/
   
   # Copy lambda function
   copy lambda_function.py package\
   
   # Zip it
   cd package
   tar -a -c -f ..\python-lambda.zip *
   cd ..
   ```

2. **Update Lambda via AWS CLI:**
   ```bash
   aws lambda update-function-code \
     --function-name <your-function-name> \
     --zip-file fileb://python-lambda.zip \
     --runtime python3.11
   ```

3. **Update Lambda Configuration:**
   ```bash
   aws lambda update-function-configuration \
     --function-name <your-function-name> \
     --runtime python3.11 \
     --handler lambda_function.lambda_handler \
     --timeout 60 \
     --memory-size 1024
   ```

## Verification Checklist

After deployment:
- [ ] Lambda runtime shows Python 3.11
- [ ] Handler is `lambda_function.lambda_handler`
- [ ] Timeout is 60 seconds
- [ ] Memory is 1024 MB
- [ ] Environment variables set (BUCKET_NAME, TABLE_NAME)
- [ ] Test with sample form data
- [ ] Verify PDF has proper formatting
- [ ] Check footer appears on all pages
- [ ] Confirm star ratings show properly
- [ ] Test with S23 Ultra images (large files)

## Troubleshooting

**ImportError: No module named 'reportlab'**
- Ensure dependencies are in the deployment package
- Check layer is attached if using layers

**Unicode errors:**
- Python 3.11 has excellent Unicode support
- ReportLab handles special characters natively

**Image errors:**
- Pillow compression should handle all phone formats
- Check CloudWatch logs for specific errors

**Footer not showing:**
- Custom canvas class `FooterCanvas` adds footer to each page
- Check page margins are correct (18mm)

## Next Steps

1. Choose deployment method (recommend Option A for testing)
2. Package and deploy
3. Test with actual form submission
4. Verify PDF matches template exactly
5. Push to production once validated

## Rollback Plan

If Python version has issues:
```bash
# Restore Node.js version
cd amplify/functions/generate-report/src
mv index.js.backup-before-v3 index.js
git checkout package.json
```

Then redeploy via Amplify.
