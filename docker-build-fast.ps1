# Fast Docker Build Script with Caching
# This uses BuildKit for layer caching and parallel builds

param(
    [switch]$NoCache = $false,
    [string]$Tag = "education-backend-lambda"
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Fast Docker Build (with BuildKit)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if package-lock.json exists
if (!(Test-Path "package-lock.json")) {
    Write-Host "❌ package-lock.json not found!" -ForegroundColor Red
    Write-Host "Run 'npm install' first to generate it.`n" -ForegroundColor Yellow
    exit 1
}

# Enable Docker BuildKit for faster builds
$env:DOCKER_BUILDKIT = 1

# Build arguments
$buildArgs = @(
    "-f", "Dockerfile.lambda"
    "-t", $Tag
)

if ($NoCache) {
    $buildArgs += "--no-cache"
    Write-Host "Building WITHOUT cache..." -ForegroundColor Yellow
} else {
    Write-Host "Building WITH cache..." -ForegroundColor Green
}

$buildArgs += "."

Write-Host "`nStarting build...`n" -ForegroundColor Yellow
$startTime = Get-Date

# Build the image
docker build @buildArgs

$endTime = Get-Date
$duration = $endTime - $startTime

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Build completed successfully!" -ForegroundColor Green
    Write-Host "Duration: $($duration.TotalSeconds) seconds`n" -ForegroundColor Cyan
    
    # Show image size
    $imageSize = docker images $Tag --format "{{.Size}}" | Select-Object -First 1
    Write-Host "Image size: $imageSize`n" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  Test locally:  .\test-lambda-local.ps1"
Write-Host "  Push to ECR:   docker push <ecr-repo>:latest`n"
