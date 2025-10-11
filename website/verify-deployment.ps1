# Pre-Deployment Verification Checklist
# Run this before pushing to production

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🔍 PRE-DEPLOYMENT VERIFICATION CHECKLIST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$allGood = $true

# 1. Check API endpoint in js/main.js
Write-Host "[1/5] Checking js/main.js has API Gateway URL..." -ForegroundColor Yellow
$mainJs = Get-Content "js/main.js" -Raw
if ($mainJs -match "https://423cmvhw3g.execute-api.us-east-1.amazonaws.com/prod/customer-listings") {
    Write-Host "✅ API endpoint configured correctly" -ForegroundColor Green
} else {
    Write-Host "❌ API endpoint not found or incorrect!" -ForegroundColor Red
    $allGood = $false
}

# 2. Check Lambda function exists and is configured
Write-Host "`n[2/5] Verifying Lambda function configuration..." -ForegroundColor Yellow
$lambdaConfig = aws lambda get-function-configuration --function-name customerListings --region us-east-1 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Lambda function 'customerListings' exists" -ForegroundColor Green
    $config = $lambdaConfig | ConvertFrom-Json
    Write-Host "   Runtime: $($config.Runtime)" -ForegroundColor Gray
    Write-Host "   Timeout: $($config.Timeout)s" -ForegroundColor Gray
    Write-Host "   Memory: $($config.MemorySize)MB" -ForegroundColor Gray
    
    # Check environment variables
    $envVars = $config.Environment.Variables
    $requiredVars = @("CAR_LISTINGS_TABLE", "CAR_RESERVATIONS_TABLE", "CAR_LISTINGS_BUCKET", "SES_FROM", "LISTINGS_REVIEW_EMAIL")
    $missingVars = @()
    foreach ($var in $requiredVars) {
        if (-not $envVars.$var) {
            $missingVars += $var
        }
    }
    if ($missingVars.Count -eq 0) {
        Write-Host "✅ All environment variables configured" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing environment variables: $($missingVars -join ', ')" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "❌ Lambda function not found or not accessible!" -ForegroundColor Red
    $allGood = $false
}

# 3. Check DynamoDB tables
Write-Host "`n[3/5] Verifying DynamoDB tables..." -ForegroundColor Yellow
$tables = @("CarListings", "CarReservations")
foreach ($table in $tables) {
    $tableInfo = aws dynamodb describe-table --table-name $table --region us-east-1 --query "Table.[TableName,TableStatus]" --output text 2>&1
    if ($LASTEXITCODE -eq 0) {
        $parts = $tableInfo -split "`t"
        Write-Host "✅ Table '$($parts[0])' - Status: $($parts[1])" -ForegroundColor Green
    } else {
        Write-Host "❌ Table '$table' not found!" -ForegroundColor Red
        $allGood = $false
    }
}

# 4. Check S3 bucket
Write-Host "`n[4/5] Verifying S3 bucket..." -ForegroundColor Yellow
$bucketCheck = aws s3 ls s3://inspectionwale-car-listings/ --region us-east-1 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ S3 bucket 'inspectionwale-car-listings' exists" -ForegroundColor Green
} else {
    Write-Host "❌ S3 bucket not accessible!" -ForegroundColor Red
    $allGood = $false
}

# 5. Check SEED data file
Write-Host "`n[5/5] Verifying SEED_CAR_LISTINGS.json..." -ForegroundColor Yellow
if (Test-Path "SEED_CAR_LISTINGS.json") {
    $seedData = Get-Content "SEED_CAR_LISTINGS.json" -Raw | ConvertFrom-Json
    if ($seedData.Count -eq 4) {
        Write-Host "✅ SEED file contains 4 placeholder listings:" -ForegroundColor Green
        foreach ($listing in $seedData) {
            $car = $listing.car
            Write-Host "   - $($car.make) $($car.model) ($($car.registrationYear)) - ₹$([int]$car.expectedPrice / 100000)L" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ SEED file should have 4 listings, found: $($seedData.Count)" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "❌ SEED_CAR_LISTINGS.json not found!" -ForegroundColor Red
    $allGood = $false
}

Write-Host "`n========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ ALL CHECKS PASSED! READY TO DEPLOY" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    Write-Host "📋 Summary of 4 Placeholder Cars:" -ForegroundColor Cyan
    Write-Host "1. Tata Altroz 2021 - ₹7.5L, 32k KMs" -ForegroundColor White
    Write-Host "2. Hyundai i10 2020 - ₹5.25L, 38k KMs" -ForegroundColor White
    Write-Host "3. Maruti Baleno 2022 - ₹8.25L, 15k KMs" -ForegroundColor White
    Write-Host "4. Honda Amaze 2021 - ₹6.95L, 22k KMs`n" -ForegroundColor White
    
    Write-Host "⚠️  IMPORTANT: Before these cars show on website:" -ForegroundColor Yellow
    Write-Host "   1. Upload 24 images to S3 (6 per car)" -ForegroundColor Yellow
    Write-Host "   2. Add 4 listings to DynamoDB" -ForegroundColor Yellow
    Write-Host "   3. Then push code to production`n" -ForegroundColor Yellow
    
    Write-Host "Ready to continue? [Y/N]" -ForegroundColor Cyan
} else {
    Write-Host "❌ DEPLOYMENT BLOCKED - FIX ERRORS ABOVE" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Cyan
}
