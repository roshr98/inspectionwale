#!/bin/bash
# Deploy Lambda Function - Final Design

echo "🚀 Creating Lambda deployment package with NEW DESIGN..."

cd /c/Users/Administrator/Documents/Inpectionwale/website/amplify/functions/generate-report/src

# Check if dependencies are installed
if [ -d "package" ] && [ "$(ls -A package)" ]; then
    echo "✅ Dependencies found in package directory"
    PACKAGE_SIZE=$(du -sh package | cut -f1)
    echo "📦 Package size: $PACKAGE_SIZE"
else
    echo "❌ Package directory is empty!"
    echo "📥 Installing dependencies..."
    rm -rf package
    mkdir package
    pip install reportlab==4.0.7 Pillow==10.1.0 -t package
fi

# Copy Lambda function to package
echo "📄 Copying lambda_function.py..."
cp lambda_function.py package/

# Create ZIP file
echo "🗜️ Creating ZIP archive..."
cd package
zip -r ../lambda-deployment-final.zip . -q
cd ..

# Check ZIP file
if [ -f "lambda-deployment-final.zip" ]; then
    ZIP_SIZE=$(du -h lambda-deployment-final.zip | cut -f1)
    echo "✅ Deployment package created: lambda-deployment-final.zip ($ZIP_SIZE)"
    echo ""
    echo "📋 NEXT STEPS:"
    echo "1. Go to AWS Lambda Console: https://console.aws.amazon.com/lambda/"
    echo "2. Find your function (search for 'generate-report' or check Amplify)"
    echo "3. Click 'Upload from' → '.zip file'"
    echo "4. Select: lambda-deployment-final.zip"
    echo "5. Click 'Save' and wait for upload"
    echo "6. Test form - NEW DESIGN should appear! 🎨"
    echo ""
    echo "🎉 Package ready for deployment!"
else
    echo "❌ Failed to create ZIP file"
    exit 1
fi

# Cleanup
echo "🧹 Cleaning up package directory..."
rm -rf package

echo "✅ Done!"
