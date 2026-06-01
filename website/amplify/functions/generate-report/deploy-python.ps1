# Deploy Python Lambda - Quick Script
# Run this from PowerShell in the src directory

Write-Host "🚀 Packaging Python Lambda for InspectionWale..." -ForegroundColor Green

# Navigate to correct directory
Set-Location "C:\Users\Administrator\Documents\Inpectionwale\website\amplify\functions\generate-report\src"

# Create package directory
if (Test-Path "package") {
    Remove-Item -Recurse -Force package
}
New-Item -ItemType Directory -Path package

Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow

# Install dependencies
pip install -r requirements.txt -t package --quiet

# Copy lambda function
Copy-Item lambda_function.py package\

# Create ZIP
Write-Host "🗜️ Creating deployment package..." -ForegroundColor Yellow
Set-Location package
Compress-Archive -Path * -DestinationPath ..\python-lambda-deploy.zip -Force
Set-Location ..

Write-Host "✅ Package created: python-lambda-deploy.zip" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to AWS Lambda Console"
Write-Host "2. Find your function (check Amplify console for name)"
Write-Host "3. Click 'Upload from' → '.zip file'"
Write-Host "4. Upload: python-lambda-deploy.zip"
Write-Host "5. Runtime Settings → Edit:"
Write-Host "   - Runtime: Python 3.11"
Write-Host "   - Handler: lambda_function.lambda_handler"
Write-Host "6. Configuration → Edit:"
Write-Host "   - Timeout: 60 seconds"
Write-Host "   - Memory: 1024 MB"
Write-Host "7. Test with form submission!"
Write-Host ""
Write-Host "📄 Deployment package size: $((Get-Item python-lambda-deploy.zip).Length / 1MB) MB" -ForegroundColor Green

# Cleanup
if (Test-Path "package") {
    Remove-Item -Recurse -Force package
}
