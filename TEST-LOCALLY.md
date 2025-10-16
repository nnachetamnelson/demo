# 🧪 Complete Local Testing Guide

## 🚀 Quick Start (3 Commands)

### **1. Start Backend (Lambda Container):**
```powershell
docker stop lambda-test-debug 2>$null

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
  education-backend-lambda server.js
```

### **2. Start Frontend:**
```powershell
cd frontend
npm run dev
```

### **3. Open Browser:**
```
http://localhost:5173/register
```

---

## ✅ What You'll Test

```
Browser (localhost:5173)
    ↓
Frontend (React + Vite)
    ↓ API calls to localhost:8080
Lambda Container (Docker)
    ↓
PostgreSQL (Docker)
```

---

## 🧪 Complete Test Flow

### **Step 1: Register a New User**

1. Go to: **http://localhost:5173/register**

2. Fill in:
   ```
   School ID:   school1
   Username:    student1
   Email:       student1@school.com
   Password:    Pass123!
   School Name: Lincoln High School (optional)
   ```

3. Click **"Register"**

4. Expected Result:
   - ✅ Success message: "Registration successful!"
   - ✅ Auto-logged in
   - ✅ Redirected to dashboard after 2 seconds

### **Step 2: Test Login**

1. Log out (if logged in)

2. Go to: **http://localhost:5173/login**

3. Fill in:
   ```
   Username:  student1
   Password:  Pass123!
   School ID: school1
   ```

4. Click **"Login"**

5. Expected Result:
   - ✅ Logged in successfully
   - ✅ Redirected to dashboard
   - ✅ Can access all pages

### **Step 3: Test Multi-Tenancy**

Create users in different schools:

**School 1:**
```
School ID: school1
Username:  admin
Email:     admin@school1.com
Password:  Pass123!
```

**School 2:**
```
School ID: school2
Username:  admin    ← Same username, different school!
Email:     admin@school2.com
Password:  Pass123!
```

Both should work independently! ✅

---

## 📋 Verify Everything is Running

### **Check Backend:**
```powershell
# Container status
docker ps | Select-String "lambda"

# Health check
Invoke-RestMethod http://localhost:8080/health

# View logs
docker logs lambda-test-debug -f
```

### **Check Frontend:**
```powershell
# Should see Vite dev server message
# Open DevTools (F12) → Network tab
# Make a request → See calls to localhost:8080
```

### **Check Database:**
```powershell
# Check if PostgreSQL is running
docker ps | Select-String "postgres"
```

---

## 🐛 Troubleshooting

### **Issue: "Network Error" in Frontend**

**Solution:**
1. Check `frontend/.env.local` exists:
   ```
   VITE_API_BASE=http://localhost:8080
   ```
2. Restart frontend: `npm run dev`

### **Issue: Backend not responding**

**Solution:**
```powershell
# Check container logs
docker logs lambda-test-debug

# Restart container
docker stop lambda-test-debug
# Then run the start command again
```

### **Issue: "Invalid credentials" on login**

**Solution:**
- Register first at `/register`
- Use exact username (case-sensitive)
- Use correct tenantId

### **Issue: Database connection error**

**Solution:**
```powershell
# Start PostgreSQL
docker run -d --name postgres-test `
  -e POSTGRES_DB=education `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=secret `
  -p 5432:5432 `
  postgres:15-alpine

# Wait 5 seconds, then restart backend
```

---

## 📊 Watch Requests in Real-Time

### **Terminal 1 - Backend Logs:**
```powershell
docker logs lambda-test-debug -f
```

You'll see:
```
info: Unified request: POST /api/auth/register
info: Registration endpoint hit...
info: User created successfully, ID: 2, Tenant: school1
info: Unified request: POST /api/auth/login
info: ✅ Login successful for user ID: 2
```

### **Terminal 2 - Run Frontend:**
```powershell
cd frontend
npm run dev
```

### **Browser - DevTools (F12) → Network:**
You'll see:
```
POST http://localhost:8080/api/auth/register
POST http://localhost:8080/api/auth/login
GET  http://localhost:8080/api/students
```

---

## 🎯 Test Scenarios

### **Scenario 1: New School Onboarding**
```
1. Admin registers with tenantId "school1"
2. Admin logs in
3. Admin creates students (future feature)
4. Students login with same tenantId "school1"
```

### **Scenario 2: Multi-School Testing**
```
1. Register user in "school1"
2. Register user in "school2" 
3. Login as school1 user → See only school1 data
4. Login as school2 user → See only school2 data
```

### **Scenario 3: Username Uniqueness**
```
1. Register "john.smith" in "school1" ✅
2. Register "john.smith" in "school2" ✅
3. Both can exist independently
4. Login requires username + tenantId
```

---

## ✅ Success Checklist

- [ ] PostgreSQL container running
- [ ] Lambda backend container running (port 8080)
- [ ] Frontend dev server running (port 5173)
- [ ] Can access http://localhost:5173/register
- [ ] Can register a new user
- [ ] Auto-logged in after registration
- [ ] Can manually login at /login
- [ ] Can logout and login again
- [ ] Lambda logs show requests

---

## 🎨 Pages to Test

```
http://localhost:5173/register   ← Register new users
http://localhost:5173/login      ← Login existing users
http://localhost:5173/           ← Dashboard (after login)
```

---

## 📝 Sample Test Users

Create these for testing:

**School 1 - Admin:**
```
tenantId: school1
username: admin
email:    admin@school1.com
password: Admin123!
```

**School 1 - Student:**
```
tenantId: school1
username: student1
email:    student1@school1.com
password: Student123!
```

**School 2 - Admin:**
```
tenantId: school2
username: admin
email:    admin@school2.com
password: Admin123!
```

---

## 🚀 Ready to Test!

Run these commands:

```powershell
# 1. Start backend
docker stop lambda-test-debug 2>$null
docker run -d --rm --name lambda-test-debug -p 8080:8080 `
  -e PORT=8080 -e DB_HOST=host.docker.internal `
  -e DB_NAME=education -e DB_USER=postgres -e DB_PASSWORD=secret `
  -e DB_DIALECT=postgres -e JWT_SECRET=test-jwt-secret-key `
  -e PROFILE_SERVICE_URL=http://localhost:8080 `
  --entrypoint node education-backend-lambda server.js

# 2. Start frontend (in another terminal)
cd frontend
npm run dev

# 3. Open browser
Start-Process "http://localhost:5173/register"
```

---

**Everything is ready for local testing!** 🎉
