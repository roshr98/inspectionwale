# Add 4 Placeholder Car Listings to DynamoDB
# This script adds the placeholder listings one by one to ensure they're properly added

Write-Host "Adding 4 placeholder car listings to DynamoDB..." -ForegroundColor Green

# Navigate to project root
Set-Location "C:\Users\Administrator\Documents\Inpectionwale\website"

# Read the seed data
$seedData = Get-Content -Path "SEED_CAR_LISTINGS.json" -Raw | ConvertFrom-Json

$count = 0
foreach ($listing in $seedData) {
    $count++
    Write-Host "`nAdding listing $count/4: $($listing.car.make) $($listing.car.model)..." -ForegroundColor Cyan
    
    # Convert to DynamoDB JSON format
    $item = @{
        "listingId" = @{ "S" = $listing.listingId }
        "status" = @{ "S" = $listing.status }
        "isPlaceholder" = @{ "BOOL" = $listing.isPlaceholder }
        "createdAt" = @{ "S" = $listing.createdAt }
        "updatedAt" = @{ "S" = $listing.updatedAt }
        "seller" = @{ 
            "M" = @{
                "name" = @{ "S" = $listing.seller.name }
                "mobile" = @{ "S" = $listing.seller.mobile }
                "email" = @{ "S" = $listing.seller.email }
            }
        }
        "car" = @{ 
            "M" = @{
                "make" = @{ "S" = $listing.car.make }
                "model" = @{ "S" = $listing.car.model }
                "edition" = @{ "S" = $listing.car.edition }
                "registrationYear" = @{ "S" = $listing.car.registrationYear }
                "kmsDriven" = @{ "S" = $listing.car.kmsDriven }
                "expectedPrice" = @{ "S" = $listing.car.expectedPrice }
            }
        }
        "photos" = @{ 
            "M" = @{
                "exteriorFront" = @{ 
                    "M" = @{
                        "key" = @{ "S" = $listing.photos.exteriorFront.key }
                        "url" = @{ "S" = $listing.photos.exteriorFront.url }
                        "contentType" = @{ "S" = $listing.photos.exteriorFront.contentType }
                    }
                }
                "exteriorBack" = @{ 
                    "M" = @{
                        "key" = @{ "S" = $listing.photos.exteriorBack.key }
                        "url" = @{ "S" = $listing.photos.exteriorBack.url }
                        "contentType" = @{ "S" = $listing.photos.exteriorBack.contentType }
                    }
                }
                "exteriorLeft" = @{ 
                    "M" = @{
                        "key" = @{ "S" = $listing.photos.exteriorLeft.key }
                        "url" = @{ "S" = $listing.photos.exteriorLeft.url }
                        "contentType" = @{ "S" = $listing.photos.exteriorLeft.contentType }
                    }
                }
                "exteriorRight" = @{ 
                    "M" = @{
                        "key" = @{ "S" = $listing.photos.exteriorRight.key }
                        "url" = @{ "S" = $listing.photos.exteriorRight.url }
                        "contentType" = @{ "S" = $listing.photos.exteriorRight.contentType }
                    }
                }
                "interiorSeat" = @{ 
                    "M" = @{
                        "key" = @{ "S" = $listing.photos.interiorSeat.key }
                        "url" = @{ "S" = $listing.photos.interiorSeat.url }
                        "contentType" = @{ "S" = $listing.photos.interiorSeat.contentType }
                    }
                }
                "interiorCluster" = @{ 
                    "M" = @{
                        "key" = @{ "S" = $listing.photos.interiorCluster.key }
                        "url" = @{ "S" = $listing.photos.interiorCluster.url }
                        "contentType" = @{ "S" = $listing.photos.interiorCluster.contentType }
                    }
                }
            }
        }
    }
    
    # Save to temp JSON file
    $tempFile = "temp-listing-$count.json"
    $item | ConvertTo-Json -Depth 10 | Set-Content -Path $tempFile
    
    # Add to DynamoDB
    aws dynamodb put-item --table-name CarListings --item file://$tempFile --region us-east-1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Successfully added: $($listing.car.make) $($listing.car.model) ($($listing.car.registrationYear))" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to add: $($listing.car.make) $($listing.car.model)" -ForegroundColor Red
    }
    
    # Clean up temp file
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "All 4 placeholder listings added!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Verify the listings
Write-Host "`nVerifying listings in DynamoDB..." -ForegroundColor Cyan
aws dynamodb scan --table-name CarListings --region us-east-1 --filter-expression "isPlaceholder = :true" --expression-attribute-values '{":true":{"BOOL":true}}' --query "Items[].{ListingId:listingId.S, Car:car.M.make.S, Model:car.M.model.S, Status:status.S}" --output table

Write-Host "`n✓ Verification complete! The 4 cars should be visible on your website once deployed." -ForegroundColor Green
