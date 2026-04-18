# Update Placeholder Cars in DynamoDB
$TABLE_NAME = "CarListings"
$REGION = "us-east-1"

Write-Host "Updating placeholder cars in DynamoDB..." -ForegroundColor Cyan

# Upload car2.json
Write-Host "`nUploading car2.json..." -ForegroundColor Yellow
aws dynamodb put-item --table-name $TABLE_NAME --item file://car2.json --region $REGION
if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully uploaded car2.json" -ForegroundColor Green
}

# Upload car3.json
Write-Host "`nUploading car3.json..." -ForegroundColor Yellow
aws dynamodb put-item --table-name $TABLE_NAME --item file://car3.json --region $REGION
if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully uploaded car3.json" -ForegroundColor Green
}

# Upload car4.json
Write-Host "`nUploading car4.json..." -ForegroundColor Yellow
aws dynamodb put-item --table-name $TABLE_NAME --item file://car4.json --region $REGION
if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully uploaded car4.json" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Verifying updated cars..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Verify car2 (placeholder-002)
Write-Host "Car 2:" -ForegroundColor Yellow
aws dynamodb get-item --table-name $TABLE_NAME --key '{\"listingId\":{\"S\":\"placeholder-002\"}}' --region $REGION --query 'Item.car.M.[make.S, model.S, registrationYear.S, kmsDriven.S, expectedPrice.S]' --output text

# Verify car3 (placeholder-003)
Write-Host "`nCar 3:" -ForegroundColor Yellow
aws dynamodb get-item --table-name $TABLE_NAME --key '{\"listingId\":{\"S\":\"placeholder-003\"}}' --region $REGION --query 'Item.car.M.[make.S, model.S, registrationYear.S, kmsDriven.S, expectedPrice.S]' --output text

# Verify car4 (placeholder-004)
Write-Host "`nCar 4:" -ForegroundColor Yellow
aws dynamodb get-item --table-name $TABLE_NAME --key '{\"listingId\":{\"S\":\"placeholder-004\"}}' --region $REGION --query 'Item.car.M.[make.S, model.S, registrationYear.S, kmsDriven.S, expectedPrice.S]' --output text

Write-Host "`nComplete!" -ForegroundColor Green
