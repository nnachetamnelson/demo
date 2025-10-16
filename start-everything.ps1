# Start Everything - Backend + Frontend
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Starting Full Stack" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Stop any existing containers
Write-Host "Cleaning up old containers..." -ForegroundColor Yellow
docker stop lambda-test-debug 2>$null | Out-Null
docker rm lambda-test-debug 2>$null | Out-Null

# Start backend
Write-Host "✅ Starting Lambda backend on port 8080..." -ForegroundColor Green
docker run -d --rm --name lambda-test-debug -p 8080:8080 `
  -e PORT=8080 `
  -e DB_HOST=host.docker.internal `
  -e DB_NAME=education `
  -e DB_USER=postgres `
  -e DB_PASSWORD=secret `
  -e DB_PORT=5432 `
  -e DB_DIALECT=postgres `
  -e JWT_SECRET=test-jwt-secret-key-minimum-32-characters `
  -e NODE_ENV=production `
  -e PROFILE_SERVICE_URL=http://localhost:8080 `
  --entrypoint node `
  education-backend-lambda server.js | Out-Null

Start-Sleep -Seconds 5

# Start frontend in new window
Write-Host "✅ Starting frontend on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🎨 Frontend Server' -ForegroundColor Cyan; npm run dev"

Start-Sleep -Seconds 3

# Open browser
Write-Host "✅ Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:5173/register"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ Everything Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nServices:" -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "`nPages:" -ForegroundColor Yellow
Write-Host "  Register: http://localhost:5173/register" -ForegroundColor Cyan
Write-Host "  Login:    http://localhost:5173/login" -ForegroundColor Cyan
Write-Host "`n💡 Browser will open automatically" -ForegroundColor Cyan
Write-Host "   Hard refresh if needed: Ctrl+Shift+R`n" -ForegroundColor Yellow
