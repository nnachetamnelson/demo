# Test Lambda Docker container locally
param(
    [string]$DBHost = "host.docker.internal",
    [string]$DBPassword = "secret",
    [string]$JWTSecret = "test-jwt-secret-key-minimum-32-characters"
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing Lambda Container Locally" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Build the Lambda image
Write-Host "Building Lambda Docker image..." -ForegroundColor Yellow
docker build -f Dockerfile.lambda -t education-backend-lambda .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Image built successfully`n" -ForegroundColor Green

# Stop any existing container
docker stop education-lambda-test 2>$null
docker rm education-lambda-test 2>$null

# Run the container
Write-Host "Starting Lambda container..." -ForegroundColor Yellow
docker run -d `
    --name education-lambda-test `
    -p 8080:8080 `
    -e PORT=8080 `
    -e DB_HOST=$DBHost `
    -e DB_NAME=education `
    -e DB_USER=postgres `
    -e DB_PASSWORD=$DBPassword `
    -e DB_PORT=5432 `
    -e DB_DIALECT=postgres `
    -e JWT_SECRET=$JWTSecret `
    -e NODE_ENV=production `
    education-backend-lambda

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to start container" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Container started`n" -ForegroundColor Green
Write-Host "Waiting for app to be ready (checking /health)..." -ForegroundColor Yellow

# Wait for health check
$maxRetries = 30
$retryCount = 0
$isHealthy = $false

while ($retryCount -lt $maxRetries) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $isHealthy = $true
            break
        }
    } catch {
        # Continue waiting
    }
    $retryCount++
    Write-Host "." -NoNewline
}

Write-Host ""

if ($isHealthy) {
    Write-Host "✓ App is healthy!`n" -ForegroundColor Green
    
    # Show logs
    Write-Host "Container logs:" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Gray
    docker logs education-lambda-test --tail 20
    Write-Host "----------------------------------------`n" -ForegroundColor Gray
    
    Write-Host "✅ Lambda container is running successfully!`n" -ForegroundColor Green
    Write-Host "Test endpoints:" -ForegroundColor Yellow
    Write-Host "  Health: http://localhost:8080/health"
    Write-Host "  API:    http://localhost:8080/api/auth`n"
    
    Write-Host "Try these commands:" -ForegroundColor Cyan
    Write-Host "  # Health check"
    Write-Host '  Invoke-RestMethod -Uri "http://localhost:8080/health"' -ForegroundColor White
    Write-Host ""
    Write-Host "  # Register user"
    Write-Host '  Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" \' -ForegroundColor White
    Write-Host '    -Method POST -ContentType "application/json" \' -ForegroundColor White
    Write-Host '    -Body (ConvertTo-Json @{' -ForegroundColor White
    Write-Host '      username="admin"; email="admin@example.com";' -ForegroundColor White
    Write-Host '      password="admin123"; tenantId="school1"; role="admin"' -ForegroundColor White
    Write-Host '    })' -ForegroundColor White
    Write-Host ""
    Write-Host "To stop the container:" -ForegroundColor Yellow
    Write-Host "  docker stop education-lambda-test`n" -ForegroundColor White
    
} else {
    Write-Host "❌ Health check failed after 30 seconds" -ForegroundColor Red
    Write-Host "`nContainer logs:" -ForegroundColor Yellow
    docker logs education-lambda-test
    Write-Host "`nStopping container..." -ForegroundColor Yellow
    docker stop education-lambda-test
    exit 1
}
