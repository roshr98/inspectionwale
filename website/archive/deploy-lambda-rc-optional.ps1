# Deploy Lambda Function Update - RC Optional

Write-Host "Deploying customer-listings Lambda function..." -ForegroundColor Cyan

$functionPath = "amplify\functions\customer-listings\src"
$zipFile = "amplify\functions\customer-listings\function.zip"
$functionName = "InspectionWale-customerListings"

# Navigate to function directory
Push-Location $functionPath

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
    npm install
}

# Create deployment package
Write-Host "Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "../function.zip") {
    Remove-Item "../function.zip" -Force
}

# Zip the files
Compress-Archive -Path "index.js", "node_modules", "package.json", "package-lock.json" -DestinationPath "../function.zip" -Force

Pop-Location

# Update Lambda function
Write-Host "Updating Lambda function code..." -ForegroundColor Yellow

try {
    aws lambda update-function-code `
        --function-name $functionName `
        --zip-file fileb://$zipFile `
        --region us-east-1

    Write-Host "Lambda function updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Changes made:" -ForegroundColor Cyan
    Write-Host "  - RC document is now OPTIONAL" -ForegroundColor Green
    Write-Host "  - Backend will accept submissions without RC" -ForegroundColor Green
    Write-Host "  - Frontend form updated to reflect optional status" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Test the form submission without RC document"
    Write-Host "  2. Verify no 'rc_required' error occurs"
    Write-Host "  3. Commit and push frontend changes to GitHub"
    
} catch {
    Write-Host "Error updating Lambda function: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual deployment steps:" -ForegroundColor Yellow
    Write-Host "  1. Open AWS Lambda Console: https://console.aws.amazon.com/lambda"
    Write-Host "  2. Find function: $functionName"
    Write-Host "  3. Upload: $zipFile"
    Write-Host "  4. Click 'Deploy'"
}
