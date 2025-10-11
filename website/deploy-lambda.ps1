# Manual Lambda Deployment Script
# Deploy the Python Lambda function directly to AWS

Write-Host "🚀 Deploying Lambda Function..." -ForegroundColor Cyan

# Navigate to Lambda function directory
Set-Location "amplify\functions\generate-report\src"

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow

# Remove old zip if exists
if (Test-Path "lambda-deployment.zip") {
    Remove-Item "lambda-deployment.zip"
}

# Install dependencies to a package directory
Write-Host "📥 Installing Python dependencies..." -ForegroundColor Yellow
pip install -t package reportlab==4.0.7 Pillow==10.1.0 --upgrade

# Copy Lambda function to package
Copy-Item lambda_function.py package/

# Create ZIP file
Write-Host "🗜️ Creating ZIP archive..." -ForegroundColor Yellow
Compress-Archive -Path package\* -DestinationPath lambda-deployment.zip -Force

# Get Lambda function name (you may need to update this)
$FUNCTION_NAME = "generate-report"  # Update if different

Write-Host "⬆️ Uploading to AWS Lambda: $FUNCTION_NAME" -ForegroundColor Yellow

# Deploy to Lambda
aws lambda update-function-code `
    --function-name $FUNCTION_NAME `
    --zip-file fileb://lambda-deployment.zip

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Lambda function deployed successfully!" -ForegroundColor Green
    Write-Host "🎉 New design should now be live!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed. Check AWS credentials and function name." -ForegroundColor Red
    Write-Host "Error code: $LASTEXITCODE" -ForegroundColor Red
}

# Cleanup
Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
Remove-Item -Recurse -Force package -ErrorAction SilentlyContinue
Remove-Item lambda-deployment.zip -ErrorAction SilentlyContinue

Write-Host "✅ Done!" -ForegroundColor Green
