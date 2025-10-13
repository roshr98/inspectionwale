# AWS Cost Report Script
# Run this weekly to check your AWS costs

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   InspectionWale AWS Cost Report" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current date range (month to date)
$startDate = Get-Date -Day 1 -Hour 0 -Minute 0 -Second 0 -Format "yyyy-MM-dd"
$endDate = Get-Date -Format "yyyy-MM-dd"

Write-Host "📅 Report Period: $startDate to $endDate" -ForegroundColor Yellow
Write-Host ""

# Check if AWS CLI is configured
try {
    $identity = aws sts get-caller-identity --output json 2>$null | ConvertFrom-Json
    Write-Host "✅ AWS CLI configured as: $($identity.Arn)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ AWS CLI not configured. Run: aws configure" -ForegroundColor Red
    exit 1
}

# Get month-to-date costs by service
Write-Host "💰 COST BY SERVICE (Month-to-Date):" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    $costs = aws ce get-cost-and-usage `
        --time-period Start=$startDate,End=$endDate `
        --granularity MONTHLY `
        --metrics BlendedCost `
        --group-by Type=DIMENSION,Key=SERVICE `
        --output json | ConvertFrom-Json
    
    $totalCost = 0
    $services = @()
    
    foreach ($result in $costs.ResultsByTime) {
        foreach ($group in $result.Groups) {
            $serviceName = $group.Keys[0]
            $cost = [math]::Round([decimal]$group.Metrics.BlendedCost.Amount, 4)
            
            if ($cost -gt 0) {
                $totalCost += $cost
                $services += [PSCustomObject]@{
                    Service = $serviceName
                    Cost = $cost
                    CostINR = [math]::Round($cost * 83, 2)
                }
            }
        }
    }
    
    # Sort by cost descending
    $services = $services | Sort-Object Cost -Descending
    
    # Display services
    if ($services.Count -eq 0) {
        Write-Host "✅ No costs yet this month! (Still within free tier)" -ForegroundColor Green
    } else {
        foreach ($service in $services) {
            $serviceName = $service.Service -replace "Amazon ", "" -replace "AWS ", ""
            Write-Host "  📦 $serviceName" -ForegroundColor White
            Write-Host "     Cost: `$$($service.Cost) USD (₹$($service.CostINR) INR)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host "💵 TOTAL MONTH-TO-DATE: `$$([math]::Round($totalCost, 2)) USD (₹$([math]::Round($totalCost * 83, 2)) INR)" -ForegroundColor $(if ($totalCost -gt 5) { "Red" } elseif ($totalCost -gt 3) { "Yellow" } else { "Green" })
    Write-Host ""
    
    # Budget status
    $budget = 5.00
    $percentage = [math]::Round(($totalCost / $budget) * 100, 1)
    
    Write-Host "📊 BUDGET STATUS:" -ForegroundColor Cyan
    Write-Host "  Budget: `$$budget USD/month" -ForegroundColor White
    Write-Host "  Used: $percentage%" -ForegroundColor $(if ($percentage -gt 80) { "Red" } elseif ($percentage -gt 50) { "Yellow" } else { "Green" })
    Write-Host "  Remaining: `$$([math]::Round($budget - $totalCost, 2)) USD" -ForegroundColor White
    Write-Host ""
    
    # Warning messages
    if ($totalCost -gt $budget) {
        Write-Host "🔴 ALERT: Budget exceeded! Time to review and cleanup." -ForegroundColor Red
    } elseif ($totalCost -gt ($budget * 0.8)) {
        Write-Host "⚠️  WARNING: 80% of budget used. Monitor closely." -ForegroundColor Yellow
    } elseif ($totalCost -gt ($budget * 0.5)) {
        Write-Host "⚠️  NOTICE: 50% of budget used. Review usage." -ForegroundColor Yellow
    } else {
        Write-Host "✅ Budget status: GOOD. Well within limits." -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Error fetching cost data: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Check S3 bucket size
Write-Host "🗂️  S3 STORAGE ANALYSIS:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    Write-Host "  Checking bucket: inspectionwale-car-listings..." -ForegroundColor White
    
    # Get bucket size using S3 API
    $bucketStats = aws s3 ls s3://inspectionwale-car-listings --recursive --summarize 2>$null
    
    if ($bucketStats) {
        $totalSize = ($bucketStats | Select-String "Total Size:").ToString() -replace "Total Size: ", ""
        $totalObjects = ($bucketStats | Select-String "Total Objects:").ToString() -replace "Total Objects: ", ""
        
        Write-Host "  Total Files: $totalObjects" -ForegroundColor White
        Write-Host "  Total Size: $totalSize" -ForegroundColor White
        
        # Try to extract size in bytes for calculation
        if ($totalSize -match "(\d+)") {
            $sizeBytes = [int64]$matches[1]
            $sizeGB = [math]::Round($sizeBytes / 1GB, 2)
            $freeTierGB = 5
            
            Write-Host "  Size (GB): $sizeGB GB / $freeTierGB GB free tier" -ForegroundColor White
            
            if ($sizeGB -gt $freeTierGB) {
                $overageGB = $sizeGB - $freeTierGB
                $overageCost = [math]::Round($overageGB * 0.023, 2)
                Write-Host "  ⚠️  EXCEEDS FREE TIER by $overageGB GB" -ForegroundColor Red
                Write-Host "  Estimated monthly cost: `$$overageCost USD (₹$([math]::Round($overageCost * 83, 2)) INR)" -ForegroundColor Red
                Write-Host "  💡 Action: Consider deleting old customer listings" -ForegroundColor Yellow
            } elseif ($sizeGB -gt ($freeTierGB * 0.8)) {
                Write-Host "  ⚠️  Approaching free tier limit (80%+)" -ForegroundColor Yellow
            } else {
                Write-Host "  ✅ Well within free tier" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "  ℹ️  Unable to get bucket stats (bucket may be empty)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "  ⚠️  Could not analyze S3 bucket: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Check Free Tier usage (requires Cost Explorer)
Write-Host "🆓 FREE TIER STATUS:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "  Check detailed free tier usage at:" -ForegroundColor White
Write-Host "  https://console.aws.amazon.com/billing/home#/freetier" -ForegroundColor Blue
Write-Host ""

# Recommendations
Write-Host "💡 RECOMMENDATIONS:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

if ($totalCost -eq 0) {
    Write-Host "  ✅ Everything looks good! All services within free tier." -ForegroundColor Green
} else {
    # Find most expensive service
    if ($services.Count -gt 0) {
        $topService = $services[0]
        $topServiceName = $topService.Service -replace "Amazon ", "" -replace "AWS ", ""
        
        Write-Host "  📌 Top cost driver: $topServiceName (`$$($topService.Cost))" -ForegroundColor Yellow
        
        # Service-specific recommendations
        if ($topServiceName -like "*S3*" -or $topServiceName -like "*Storage*") {
            Write-Host "  💡 S3 Cost Reduction Tips:" -ForegroundColor White
            Write-Host "     - Delete old customer listing photos (>90 days)" -ForegroundColor Gray
            Write-Host "     - Enable S3 Lifecycle policy for auto-deletion" -ForegroundColor Gray
            Write-Host "     - Compress images before upload (WebP/AVIF format)" -ForegroundColor Gray
        }
        
        if ($topServiceName -like "*Lambda*") {
            Write-Host "  💡 Lambda Cost Reduction Tips:" -ForegroundColor White
            Write-Host "     - Check for infinite loops or errors" -ForegroundColor Gray
            Write-Host "     - Reduce memory allocation (512 MB → 256 MB)" -ForegroundColor Gray
            Write-Host "     - Set reserved concurrency limit" -ForegroundColor Gray
        }
        
        if ($topServiceName -like "*CloudFront*" -or $topServiceName -like "*Data Transfer*") {
            Write-Host "  💡 Data Transfer Cost Reduction:" -ForegroundColor White
            Write-Host "     - Enable CloudFront caching (reduce origin requests)" -ForegroundColor Gray
            Write-Host "     - Implement lazy loading for images" -ForegroundColor Gray
            Write-Host "     - Check for unusual traffic spikes" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Report generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""
Write-Host "📧 Setup billing alerts:" -ForegroundColor White
Write-Host "   See AWS_BILLING_COST_MANAGEMENT.md for complete guide" -ForegroundColor Gray
Write-Host ""
