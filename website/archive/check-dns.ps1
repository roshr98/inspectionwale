# Check MX Records
Write-Host '=== MX Records ===' -ForegroundColor Cyan
nslookup -type=MX inspectionwale.com

# Check TXT Records (SPF, Zoho verification)
Write-Host '
=== TXT Records ===' -ForegroundColor Cyan
nslookup -type=TXT inspectionwale.com

# Check DKIM (Zoho)
Write-Host '
=== Zoho DKIM ===' -ForegroundColor Cyan
nslookup -type=TXT zoho._domainkey.inspectionwale.com
