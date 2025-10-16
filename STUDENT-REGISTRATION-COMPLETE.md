# Student Registration with Subjects - COMPLETE

## What I Implemented

Your students can now:
1. Register through the frontend with name and subject selection
2. Automatically create a Student record
3. Link to selected subjects
4. Appear in the Students portal immediately

## Files Created/Updated

### Backend:
1. `shared/models/StudentSubject.js` - NEW junction table for student-subject enrollment
2. `shared/db/models.js` - Added StudentSubject associations
3. `auth-service/src/utils/validation.js` - Added firstName, lastName, date of birth, subjectIds
4. `auth-service/src/controllers/auth-controller.js` - Creates Student record during registration
5. `auth-service/src/routes/public-routes.js` - NEW public API for fetching subjects
6. `server.js` - Added public routes

### Frontend:
7. `frontend/src/pages/Register.tsx` - Added name fields, date of birth, subject selection
8. `frontend/src/App.tsx` - Added /register route

### Utilities:
9. `seed-subjects.js` - Node script to seed subjects
10. `seed-subjects.ps1` - PowerShell script to seed subjects

## How It Works

### Registration Flow:
```
User fills registration form
  ├─ School ID (tenantId)
  ├─ First Name & Last Name
  ├─ Date of Birth (optional)
  ├─ Username
  ├─ Email  
  ├─ Password
  └─ Selects Subjects (optional)
       ↓
System creates:
  1. User record (for authentication)
  2. Student record (with name, DOB)
  3. StudentSubject links (enrollment)
       ↓
Student appears in Students portal
```

## Testing Steps

### Step 1: Seed Subjects (One-Time Setup)

First, create subjects for your school using the Node script:

```powershell
# Run from project root
node seed-subjects.js school1
```

This creates 15 common subjects (Math, Science, English, etc.) for school1.

### Step 2: Rebuild and Restart

```powershell
# Rebuild Docker image
$env:DOCKER_BUILDKIT = 1
docker build -f Dockerfile.lambda -t education-backend-lambda .

# Restart backend
docker stop lambda-test-debug 2>$null
docker run -d --rm --name lambda-test-debug -p 8080:8080 `
  -e PORT=8080 `
  -e DB_HOST=host.docker.internal `
  -e DB_NAME=education `
  -e DB_USER=postgres `
  -e DB_PASSWORD=secret `
  -e DB_DIALECT=postgres `
  -e JWT_SECRET=test-jwt-secret-key `
  -e PROFILE_SERVICE_URL=http://localhost:8080 `
  --entrypoint node `
  education-backend-lambda server.js

# Restart frontend (in its window: Ctrl+C, then npm run dev)
```

### Step 3: Register a Student

1. Go to: http://localhost:5173/register

2. Fill form:
```
School ID:     school1
First Name:    John
Last Name:     Smith
Date of Birth: 2005-01-15 (optional)
Username:      john.smith
Email:         john.smith@school.com
Password:      Student123!
Subjects:      ✓ Mathematics
               ✓ Science
               ✓ English Language
```

3. Click "Register"

4. Auto-logged in and redirected to dashboard!

### Step 4: View Students

1. Go to: http://localhost:5173/students

2. You should see:
```
Students
┌─────────────────────────────────┐
│ John Smith          [Edit] [Delete] │
└─────────────────────────────────┘
```

## API Endpoints

### Public (No Auth Required):
```
GET  /api/public/subjects/:tenantId  - Get available subjects for registration
```

### Protected (Auth Required):
```
GET  /api/students                   - Get all students (filtered by tenantId)
POST /api/students                   - Create student (admin)
PUT  /api/students/:id               - Update student
DELETE /api/students/:id             - Delete student
```

### Registration:
```
POST /api/auth/register
Body: {
  tenantId: string,
  firstName: string,
  lastName: string,
  dateOfBirth?: string,
  username: string,
  email: string,
  password: string,
  schoolName?: string,
  subjectIds?: number[]
}
```

## Database Schema

### New Table: student_subjects
```sql
CREATE TABLE student_subjects (
  id SERIAL PRIMARY KEY,
  studentId INTEGER NOT NULL,
  subjectId INTEGER NOT NULL,
  tenantId VARCHAR(50) NOT NULL,
  enrolledAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(studentId, subjectId, tenantId)
);
```

### Relationships:
```
User (1) ─→ (1) Student
Student (N) ─→ (M) Subject (through StudentSubject)
```

## Seeding Subjects

### Method 1: Node Script
```bash
node seed-subjects.js school1
node seed-subjects.js school2
```

### Method 2: API Call (requires admin token)
```powershell
# Login as admin first to get token
$login = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"username":"admin","password":"Pass123!","tenantId":"school1"}'

$token = $login.tokens.accessToken

# Create subjects
Invoke-RestMethod -Uri "http://localhost:8080/api/subjects" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"Mathematics"}'
```

### Method 3: Direct Database
```sql
INSERT INTO subjects (tenantId, name, createdAt, updatedAt) VALUES
('school1', 'Mathematics', NOW(), NOW()),
('school1', 'Science', NOW(), NOW()),
('school1', 'English', NOW(), NOW());
```

## Multi-School Testing

### School 1:
```powershell
# Seed subjects
node seed-subjects.js school1

# Register student
# Go to /register, use tenantId: school1
# Select subjects
```

### School 2:
```powershell
# Seed subjects  
node seed-subjects.js school2

# Register student
# Go to /register, use tenantId: school2
# Select subjects (school2's subjects)
```

## Features

### Registration Form:
- School ID input (triggers subject fetch)
- First Name & Last Name (required)
- Date of Birth (optional)
- Username (required)
- Email (required)
- Password (required)
- Subject checkboxes (auto-loaded based on school ID)
- School Name (optional)

### Students Portal:
- Lists all students for the school
- Shows: First Name + Last Name
- Edit button (update name)
- Delete button (remove student)
- Add student form (for admins)

### Auto-Loading Subjects:
- Type school ID
- Subjects load automatically
- If no subjects found, registration still works
- Students can register without selecting subjects

## Benefits

✓ Complete student profile during registration
✓ Subject selection at signup
✓ Students immediately visible in portal
✓ Multi-tenant (each school has own subjects)
✓ Flexible (subjects optional)
✓ User-friendly (auto-loads subjects)

## Next Steps

1. Seed subjects for your schools
2. Test registration with subject selection
3. View students in the portal
4. Deploy to AWS!

## Deployment Notes

When deploying to AWS Lambda:
1. Seed subjects via API (using admin token)
2. Or run seed script against RDS database
3. Frontend will work exactly the same

---

Your student registration with subject selection is complete!
