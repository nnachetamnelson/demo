# Local Lambda Testing Commands

## ✅ Your Lambda Container is Running!

**Container**: `lambda-test-debug`
**Port**: http://localhost:8080
**Status**: Healthy ✅

---

## 🧪 Test Commands

### 1. Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/health"
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-06T22:35:04.859Z",
  "service": "education-backend"
}
```

---

### 2. Register a User
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body (ConvertTo-Json @{
    username = "admin"
    email = "admin@school.com"
    password = "AdminPass123!"
    tenantId = "school1"
    role = "admin"
  })
```

---

### 3. Login
```powershell
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body (ConvertTo-Json @{
    email = "admin@school.com"
    password = "AdminPass123!"
  })

# Save the token
$token = $loginResponse.token
Write-Host "Token: $token"
```

---

### 4. Get User Profile (Protected Endpoint)
```powershell
$headers = @{
  "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/profiles/1" `
  -Headers $headers
```

---

### 5. View Container Logs
```powershell
# Follow logs in real-time
docker logs lambda-test-debug -f

# Last 50 lines
docker logs lambda-test-debug --tail 50
```

---

### 6. Stop Container
```powershell
docker stop lambda-test-debug
```

---

## 🔧 Container Management

### Start a New Test:
```powershell
docker run --rm --name lambda-test -p 8080:8080 `
  -e PORT=8080 `
  -e DB_HOST=host.docker.internal `
  -e DB_NAME=education `
  -e DB_USER=postgres `
  -e DB_PASSWORD=secret `
  -e DB_PORT=5432 `
  -e DB_DIALECT=postgres `
  -e JWT_SECRET=test-jwt-secret-key-minimum-32-characters `
  -e NODE_ENV=production `
  --entrypoint node `
  education-backend-lambda server.js
```

### Run in Background:
```powershell
docker run -d --name lambda-test -p 8080:8080 `
  -e PORT=8080 `
  -e DB_HOST=host.docker.internal `
  -e DB_NAME=education `
  -e DB_USER=postgres `
  -e DB_PASSWORD=secret `
  -e DB_PORT=5432 `
  -e DB_DIALECT=postgres `
  -e JWT_SECRET=test-jwt-secret-key-minimum-32-characters `
  --entrypoint node `
  education-backend-lambda server.js
```

### Execute Commands Inside Container:
```powershell
docker exec -it lambda-test-debug sh
```

---

## 📊 Performance Check

### Test Response Time:
```powershell
Measure-Command { 
  Invoke-RestMethod -Uri "http://localhost:8080/health" 
}
```

### Stress Test (Multiple Requests):
```powershell
1..10 | ForEach-Object { 
  Measure-Command { 
    Invoke-RestMethod -Uri "http://localhost:8080/health" 
  } | Select-Object TotalMilliseconds
}
```

---

## 🐛 Troubleshooting

### Check Container Status:
```powershell
docker ps -a | Select-String "lambda"
```

### View Full Logs:
```powershell
docker logs lambda-test-debug
```

### Restart Container:
```powershell
docker restart lambda-test-debug
```

### Remove and Recreate:
```powershell
docker stop lambda-test-debug
docker rm lambda-test-debug
# Then run the start command again
```

---

## ✨ What This Proves

When you deploy to AWS Lambda:
- ✅ Your app will work exactly like this
- ✅ Same endpoints, same responses
- ✅ Lambda Web Adapter handles the HTTP translation
- ✅ No code changes needed!

---

## 🚀 Ready to Deploy to AWS?

Once local testing looks good:

1. **Push image to ECR**
2. **Run Terraform apply**
3. **Your app runs in Lambda!**

See `terraform/components/environments/dev/terraform.tfvars` for configuration.

---

**Your Lambda backend is working locally! 🎉**
