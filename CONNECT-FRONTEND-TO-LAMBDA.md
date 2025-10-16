# Connect Frontend to Lambda Backend

## ✅ Your Setup

- **Lambda Backend**: Running on http://localhost:8080
- **Frontend**: Starting on http://localhost:5173

## 🔌 Connect Them

### **Option 1: Environment Variable (Quick)**

Create this file: `frontend/.env.local`
```bash
VITE_API_BASE=http://localhost:8080
```

Then restart the frontend:
```powershell
cd frontend
npm run dev
```

### **Option 2: Update Vite Config (Proxy)**

Edit `frontend/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
})
```

### **Option 3: Set Environment Variable Before Start**

```powershell
cd frontend
$env:VITE_API_BASE="http://localhost:8080"
npm run dev
```

---

## 🧪 Test the Connection

Once frontend is running:

1. **Open browser**: http://localhost:5173

2. **Open DevTools** (F12) → Network tab

3. **Try to login** or navigate - you'll see API calls to:
   ```
   http://localhost:8080/api/auth/...
   ```

4. **Check Lambda logs**:
   ```powershell
   docker logs lambda-test-debug -f
   ```

You should see requests coming from the frontend!

---

## 📊 Architecture

```
Browser
   ↓
Frontend (http://localhost:5173)
   ↓ API Calls
Lambda Container (http://localhost:8080)
   ↓
PostgreSQL (host.docker.internal:5432)
```

---

## ✅ Expected Behavior

When you:
- Navigate to `/login`
- Enter credentials
- Click "Login"

You'll see:
1. **Browser**: POST to `http://localhost:8080/api/auth/login`
2. **Lambda logs**: "info: Unified request: POST /api/auth/login"
3. **Response**: JWT token returned
4. **Frontend**: Redirects to dashboard

---

## 🐛 Troubleshooting

### Frontend can't connect?

**Check CORS:**
Your Lambda backend already has CORS enabled:
```javascript
app.use(cors());  // Allows all origins
```

**Check both are running:**
```powershell
# Lambda backend
docker ps | Select-String "lambda"

# Frontend (check the PowerShell window that opened)
# Or check: netstat -ano | findstr ":5173"
```

**Check Network tab in browser:**
- Should see requests to `localhost:8080`
- If requests go to `localhost:4000`, environment variable wasn't set

---

## 🎯 Current Status

✅ **Lambda Backend**: Running on port 8080
🔄 **Frontend**: Starting (check the PowerShell window)
📝 **Next**: Create `frontend/.env.local` with `VITE_API_BASE=http://localhost:8080`

---

**Once .env.local is created, your frontend will seamlessly connect to the Lambda backend!** 🚀
