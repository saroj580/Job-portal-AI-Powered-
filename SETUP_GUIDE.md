# Job Portal - Complete Setup Guide

## Prerequisites
- **PHP** 7.4 or higher (with PDO MySQL extension)
- **MySQL** 5.7+ or **MariaDB** 10.4+
- **Node.js** 16+ and **npm**
- **Composer** (PHP package manager)
- **Git** (optional)

---

## 1. Database Setup

### Create the Database
1. Open MySQL/MariaDB client:
   ```bash
   mysql -u root -p
   ```
2. Copy the entire contents of `database.sql`
3. Paste into MySQL client and execute
4. Or use:
   ```bash
   mysql -u root -p < database.sql
   ```

This creates:
- `job_portal` database
- 4 tables: `users`, `jobs`, `applications`, `resume_analysis`
- Proper indexes and foreign keys

### Verify Setup
```sql
USE job_portal;
SHOW TABLES;
DESC users;
```

---

## 2. Backend Setup (PHP)

### Install Dependencies
```bash
cd backend
composer install
```

### Verify Installation
```bash
php -r "require 'vendor/autoload.php'; echo 'Autoloader OK';"
```

### Update Environment (Optional)
If your database credentials differ, edit `backend/.env`:


### Start PHP Server
```bash
# From backend/ directory
php -S localhost:8000 router.php
```

Expected output:
```
Development Server (http://localhost:8000)
Listening on http://localhost:8000
Press Ctrl-C to quit.
```

---

## 3. Frontend Setup (React)

### Install Dependencies
```bash
cd frontend
npm install
```

### Verify Installation
```bash
npm run build
```
(Should create a `dist/` folder with no errors)

### Start Development Server
```bash
npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## 4. Test the Application

### Access the App
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api

### Test Flow

#### 1. Register (Job Seeker)
- Go to http://localhost:5173/register
- Fill: Name, Email, Password, Role (Job seeker)
- Click Register
- Redirects to Login

#### 2. Login & Browse Jobs
- Login with credentials from step 1
- Should see Jobs page with search filters
- Can click on jobs to see details

#### 3. Upload & Analyze Resume
- Click "Resume" in navbar
- Drag or select a PDF file
- Click "Upload resume"
- After success, click "Analyze with AI"
- Should show resume score and suggestions

#### 4. Apply for Jobs
- Click a job card
- Click "Apply now"
- Should see "Applied ✓"

#### 5. Register as Recruiter
- Register with Role: "Recruiter"
- Login as recruiter
- Click "Dashboard" in navbar
- Post jobs by filling form
- See applicants and change their status

---

## 5. Common Issues & Fixes

### ❌ Error: "Could not connect to database"
**Solution:**
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `backend/.env`
- Ensure database `job_portal` exists

### ❌ Error: "Token expired" during upload/analysis
**Solution:**
- Logout and login again (token needs refresh)
- Check JWT_SECRET in `.env`

### ❌ 404 Error on API calls
**Solution:**
- Ensure PHP server running on port 8000: `php -S localhost:8000`
- Check VITE_API_URL in `frontend/.env`
- Verify routes in `backend/index.php`

### ❌ Resume analysis fails (AI not responding)
**Solution:**
- Verify GROQ_API_KEY in `backend/.env`
- Check internet connection
- Use a different API key from https://console.groq.com

### ❌ "Only PDF files are accepted" error
**Solution:**
- Ensure file is actual PDF (not image renamed to .pdf)
- File size must be < 5 MB

### ❌ MySQL Error: "Duplicate entry for key 'email'"
**Solution:**
- That email is already registered
- Use a different email or clear the users table:
  ```sql
  TRUNCATE TABLE users;
  TRUNCATE TABLE applications;
  TRUNCATE TABLE jobs;
  TRUNCATE TABLE resume_analysis;
  ```

---

## 6. Project Structure

```
job-portal/
├── backend/
│   ├── index.php                 (Main router)
│   ├── .env                      (Database & API credentials)
│   ├── composer.json
│   ├── vendor/                   (Dependencies - auto-generated)
│   ├── config/
│   │   ├── Database.php          (DB connection)
│   │   └── env.php               (Load .env)
│   ├── helpers/
│   │   └── Response.php          (JSON response handler)
│   ├── middleware/
│   │   └── AuthMiddleware.php    (JWT verification)
│   └── modules/
│       ├── auth/AuthController.php
│       ├── jobs/JobController.php
│       ├── applications/ApplicationController.php
│       └── resume/ResumeController.php
│
├── frontend/
│   ├── index.html
│   ├── .env                      (API URL)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── src/
│   │   ├── main.tsx              (Entry point)
│   │   ├── App.tsx               (Routes)
│   │   ├── api/axios.ts          (HTTP client)
│   │   ├── context/AuthContext.tsx
│   │   ├── hooks/
│   │   │   ├── useJobs.ts
│   │   │   ├── useJob.ts
│   │   │   ├── useApplications.ts
│   │   │   └── useResumeAnalysis.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Jobs.tsx
│   │   │   ├── JobDetail.tsx
│   │   │   ├── UserDashboard.tsx
│   │   │   ├── ResumeUpload.tsx
│   │   │   ├── ResumeAnalysis.tsx
│   │   │   └── RecruiterDashboard.tsx
│   │   ├── components/
│   │   │   ├── Alert.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── Spinner.tsx
│   │   └── types/index.ts
│
└── database.sql                  (Create tables - run first!)
```

---

## 7. API Endpoints

### Authentication
- `POST /api/register` - Create account
- `POST /api/login` - Get JWT token

### Jobs
- `GET /api/jobs?search=react&location=remote&skill=typescript` - List jobs
- `GET /api/jobs/{id}` - Get job details
- `POST /api/jobs` - Post job (recruiter only)
- `PUT /api/jobs/{id}` - Update job (recruiter only)
- `DELETE /api/jobs/{id}` - Delete job (recruiter only)

### Applications
- `POST /api/apply` - Submit application
- `GET /api/applications` - List user's applications or recruiter's applicants
- `PUT /api/applications/{id}/status` - Update application status (recruiter only)

### Resume
- `POST /api/upload-resume` - Upload PDF resume
- `POST /api/analyze-resume` - AI analysis with Groq
- `GET /api/my-analysis` - Get user's latest analysis

---

## 8. Production Checklist

Before deploying to production:
- [ ] Change `DB_PASS` to strong password in `backend/.env`
- [ ] Store `JWT_SECRET` securely (rotate regularly)
- [ ] Store `GROQ_API_KEY` in environment variable
- [ ] Disable debug mode
- [ ] Use HTTPS everywhere
- [ ] Configure CORS properly in `backend/index.php`
- [ ] Set up error logging instead of displaying errors
- [ ] Use proper web server (Apache/Nginx) instead of PHP dev server
- [ ] Implement rate limiting
- [ ] Regular database backups

---

## 9. Need Help?

### Check Logs
```bash
# PHP errors
tail -f /var/log/php.log

# MySQL errors
tail -f /var/log/mysql/error.log

# Browser console
F12 → Console tab
```

### Test API Manually
```bash
# Register
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"test@example.com","password":"123456","role":"user"}'

# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# List jobs
curl http://localhost:8000/api/jobs
```

---

**Version**: 1.0  
**Last Updated**: April 2026  
**Status**: ✅ All issues fixed and tested
