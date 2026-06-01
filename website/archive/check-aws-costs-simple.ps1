# AWS Cost Report Script - Simple Version
# Run this weekly: .\check-aws-costs-simple.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   InspectionWale AWS Cost Report" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current date range (month to date)
$startDate = Get-Date -Day 1 -Hour 0 -Minute 0 -Second 0 -Format "yyyy-MM-dd"
$endDate = Get-Date -Format "yyyy-MM-dd"

Write-Host "[DATE] Report Period: $startDate to $endDate" -ForegroundColor Yellow
Write-Host ""

# Check if AWS CLI is configured
try {
    $identity = aws sts get-caller-identity --output json 2>$null | ConvertFrom-Json
    Write-Host "[OK] AWS CLI configured" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] AWS CLI not configured. Run: aws configure" -ForegroundColor Red
    exit 1
}

# Get month-to-date costs by service
Write-Host "[COSTS] Month-to-Date Spending:" -ForegroundColor Cyan
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
        Write-Host "[OK] No costs yet! Still within free tier." -ForegroundColor Green
    } else {
        foreach ($service in $services) {
            $serviceName = $service.Service -replace "Amazon ", "" -replace "AWS ", ""
            Write-Host "  $serviceName" -ForegroundColor White
            Write-Host "     USD: $($service.Cost) | INR: $($service.CostINR)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "----------------------------------------" -ForegroundColor Gray
    $totalINR = [math]::Round($totalCost * 83, 2)
    Write-Host "[TOTAL] Month-to-Date: `$$([math]::Round($totalCost, 2)) USD (Rs. $totalINR)" -ForegroundColor $(if ($totalCost -gt 5) { "Red" } elseif ($totalCost -gt 3) { "Yellow" } else { "Green" })
    Write-Host ""
    
    # Budget status
    $budget = 5.00
    $percentage = [math]::Round(($totalCost / $budget) * 100, 1)
    
    Write-Host "[BUDGET] Status:" -ForegroundColor Cyan
    Write-Host "  Monthly Budget: `$$budget USD" -ForegroundColor White
    Write-Host "  Used: $percentage%" -ForegroundColor $(if ($percentage -gt 80) { "Red" } elseif ($percentage -gt 50) { "Yellow" } else { "Green" })
    Write-Host "  Remaining: `$$([math]::Round($budget - $totalCost, 2)) USD" -ForegroundColor White
    Write-Host ""
    
    # Warning messages
    if ($totalCost -gt $budget) {
        Write-Host "[ALERT] Budget exceeded! Review and cleanup needed." -ForegroundColor Red
    } elseif ($totalCost -gt ($budget * 0.8)) {
        Write-Host "[WARNING] 80% of budget used. Monitor closely." -ForegroundColor Yellow
    } elseif ($totalCost -gt ($budget * 0.5)) {
        Write-Host "[NOTICE] 50% of budget used. Review usage." -ForegroundColor Yellow
    } else {
        Write-Host "[OK] Budget status good. Well within limits." -ForegroundColor Green
    }
    
} catch {
    Write-Host "[ERROR] Could not fetch cost data: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Check S3 bucket size
Write-Host "[S3] Storage Analysis:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    Write-Host "  Bucket: inspectionwale-car-listings" -ForegroundColor White
    
    # Get bucket size
    $bucketOutput = aws s3 ls s3://inspectionwale-car-listings --recursive --summarize 2>&1
    
    if ($bucketOutput -match "Total Size: (\d+)") {
        $sizeBytes = [int64]$matches[1]
        $sizeGB = [math]::Round($sizeBytes / 1GB, 2)
        $sizeMB = [math]::Round($sizeBytes / 1MB, 2)
        $freeTierGB = 5
        
        if ($bucketOutput -match "Total Objects: (\d+)") {
            $totalObjects = $matches[1]
            Write-Host "  Total Files: $totalObjects" -ForegroundColor White
        }
        
        Write-Host "  Total Size: $sizeMB MB ($sizeGB GB)" -ForegroundColor White
        Write-Host "  Free Tier Limit: $freeTierGB GB" -ForegroundColor White
        
        if ($sizeGB -gt $freeTierGB) {
            $overageGB = $sizeGB - $freeTierGB
            $overageCost = [math]::Round($overageGB * 0.023, 2)
            $overageCostINR = [math]::Round($overageCost * 83, 2)
            Write-Host "  [ALERT] Exceeds free tier by $overageGB GB" -ForegroundColor Red
            Write-Host "  Estimated cost: `$$overageCost USD (Rs. $overageCostINR)" -ForegroundColor Red
            Write-Host "  [ACTION] Consider deleting old customer listings" -ForegroundColor Yellow
        } elseif ($sizeGB -gt ($freeTierGB * 0.8)) {
            Write-Host "  [WARNING] Approaching free tier limit (80%+)" -ForegroundColor Yellow
        } else {
            $percentUsed = [math]::Round(($sizeGB / $freeTierGB) * 100, 1)
            Write-Host "  [OK] Within free tier ($percentUsed% used)" -ForegroundColor Green
        }
    } else {
        Write-Host "  [INFO] Could not determine bucket size" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "  [WARNING] Could not analyze S3: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Free Tier link
Write-Host "[INFO] Free Tier Status:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "  Check detailed usage at:" -ForegroundColor White
Write-Host "  https://console.aws.amazon.com/billing/home#/freetier" -ForegroundColor Blue
Write-Host ""

# Recommendations
Write-Host "[TIPS] Recommendations:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

if ($totalCost -eq 0) {
    Write-Host "  [OK] All services within free tier!" -ForegroundColor Green
} else {
    if ($services.Count -gt 0) {
        $topService = $services[0]
        $topServiceName = $topService.Service -replace "Amazon ", "" -replace "AWS ", ""
        
        Write-Host "  Top cost driver: $topServiceName (`$$($topService.Cost))" -ForegroundColor Yellow
        
        if ($topServiceName -like "*S3*" -or $topServiceName -like "*Storage*") {
            Write-Host "  [TIP] S3 Cost Reduction:" -ForegroundColor White
            Write-Host "     - Delete old customer listing photos (>90 days)" -ForegroundColor Gray
            Write-Host "     - Enable S3 Lifecycle for auto-deletion" -ForegroundColor Gray
            Write-Host "     - Compress images before upload" -ForegroundColor Gray
        }
        
        if ($topServiceName -like "*Lambda*") {
            Write-Host "  [TIP] Lambda Cost Reduction:" -ForegroundColor White
            Write-Host "     - Check for errors or infinite loops" -ForegroundColor Gray
            Write-Host "     - Reduce memory allocation" -ForegroundColor Gray
            Write-Host "     - Set concurrency limit" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Report completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""
Write-Host "[NEXT] Setup billing alerts (one-time):" -ForegroundColor White
Write-Host "  See AWS_COST_QUICK_GUIDE.md for instructions" -ForegroundColor Gray
Write-Host ""
