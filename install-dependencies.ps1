# PowerShell script to install node modules for all microservices
Write-Host "Installing dependencies for all microservices..." -ForegroundColor Green

# Define services array
$services = @("auth", "customer", "gateway", "invoice", "product", "sales")

# Loop through each service and install dependencies
foreach ($service in $services) {
    Write-Host "==========================================" -ForegroundColor Yellow
    Write-Host "Installing dependencies for $service service..." -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Yellow
    
    $servicePath = "services\$service"
    
    if (Test-Path $servicePath) {
        Set-Location $servicePath
        
        if (Test-Path "package.json") {
            Write-Host "Found package.json in $service, running npm install..." -ForegroundColor White
            npm install
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Dependencies installed successfully for $service" -ForegroundColor Green
            } else {
                Write-Host "❌ Failed to install dependencies for $service" -ForegroundColor Red
            }
        } else {
            Write-Host "⚠️  No package.json found in $service, skipping..." -ForegroundColor Yellow
        }
        
        Set-Location ..\..
    } else {
        Write-Host "❌ Service directory $service not found" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "🎉 Dependency installation process completed!" -ForegroundColor Green
# Return to original directory
Set-Location $PSScriptRoot
