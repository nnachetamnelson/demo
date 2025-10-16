# 🚀 Run These Commands to Test

## Copy & Paste These (In Order):

### **1. Seed Subjects (skip if node not available):**
```powershell
node seed-subjects.js school1
```

**OR manually create subjects via API:**
```powershell
# Login as admin first (if you have one), or skip - subjects are optional
```

---

### **2. Rebuild Docker Image:**
```powershell
$env:DOCKER_BUILDKIT = 1
docker build -f Dockerfile.lambda -t education-backend-lambda .
```

---

### **3. Restart Backend:**
```powershell
docker stop lambda-test-debug
docker run -d --rm --name lambda-test-debug -p 8080:8080 -e PORT=8080 -e DB_HOST=host.docker.internal -e DB_NAME=education -e DB_USER=postgres -e DB_PASSWORD=secret -e DB_PORT=5432 -e DB_DIALECT=postgres -e JWT_SECRET=test-jwt-secret-key-minimum-32-characters -e NODE_ENV=production -e PROFILE_SERVICE_URL=http://localhost:8080 --entrypoint node education-backend-lambda server.js
```

---

### **4. Restart Frontend (in frontend terminal window):**
```powershell
# Press Ctrl+C to stop, then:
cd frontend
npm run dev
```

---

### **5. Test Registration:**

Go to: **http://localhost:5173/register**

Fill in:
```
School ID:     school1
First Name:    John
Last Name:     Smith
Date of Birth: 2005-01-15
Username:      john.smith
Email:         john@school.com
Password:      Student123!
Subjects:      (select any if available)
```

---

### **6. View Students:**

Go to: **http://localhost:5173/students**

You should see **John Smith** listed! ✅

---

## 📝 Summary

All changes are complete:
- ✅ Registration creates Student record
- ✅ Subject selection (if subjects exist)
- ✅ Students appear in portal
- ✅ Username-based login
- ✅ Manual tenant IDs

**Just rebuild, restart, and test!** 🎉
