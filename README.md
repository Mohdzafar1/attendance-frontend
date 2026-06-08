# 📅 Attendance Management System — Frontend

A modern, responsive React-based frontend for the Attendance Management System. Provides role-based dashboards for **Admin**, **HR**, and **Employees** with attendance marking, correction requests, user management, and real-time analytics.

##Admin Panel
<img width="1917" height="922" alt="image" src="https://github.com/user-attachments/assets/7eb4c05b-86eb-4af8-8c27-a1c7e31f4597" />

<img width="1920" height="925" alt="image" src="https://github.com/user-attachments/assets/ecfb268f-a0df-476f-8a5b-2add698ecd6f" />

<img width="1920" height="923" alt="image" src="https://github.com/user-attachments/assets/e12c5fbb-4851-4212-b79d-44ae204b9a98" />

<img width="1920" height="925" alt="image" src="https://github.com/user-attachments/assets/74a024cf-0e99-413d-ac40-77de7f774180" />

##Hr Panel
<img width="1917" height="922" alt="image" src="https://github.com/user-attachments/assets/e82b047a-0889-4210-bd68-1cfcd7afc68f" />

<img width="1920" height="920" alt="image" src="https://github.com/user-attachments/assets/9f0f8eea-ac12-40a7-9b6f-914dbf9752b6" />

##Employe Panel
<img width="1920" height="921" alt="image" src="https://github.com/user-attachments/assets/62fd8147-4eb0-4311-adf4-aeedd036093c" />

<img width="1920" height="922" alt="image" src="https://github.com/user-attachments/assets/b51bdda8-41af-4123-b9d4-bffc13eb746b" />

<img width="1920" height="918" alt="image" src="https://github.com/user-attachments/assets/f39fbb33-da91-45a1-bb3a-0d2ad555abb7" />
<img width="1920" height="921" alt="image" src="https://github.com/user-attachments/assets/23813ac3-7995-4225-9280-c3dde549206b" />


---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [User Roles & Access](#-user-roles--access)
- [Features by Role](#-features-by-role)
- [Building for Production](#-building-for-production)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Common Features
- 🔐 JWT Authentication with role-based access control
- 📱 Fully responsive design (Mobile, Tablet, Desktop)
- 🎨 Modern UI with smooth animations
- 📊 Real-time statistics dashboard
- 📤 Export reports to CSV
- 🔍 Advanced filtering and search
- 📈 Interactive charts and graphs
- 🎯 Toast notifications for user feedback

### Employee Features
- ✅ Mark attendance with GPS location tracking
- 📅 View attendance history with date filters
- 📝 Submit correction requests
- 🔍 Track correction status (Pending / Approved / Rejected)
- 📊 Personal attendance statistics
- 🕐 Real-time clock display

### HR Features
- 👥 View all employee attendance records
- 🔍 Filter by date, department, and status
- 📋 Review and process correction requests
- ✅ Approve / Reject requests with remarks
- 📊 Department-wise attendance analytics
- 📈 Export attendance reports to CSV

### Admin Features
- 👤 Complete user management (Create / Edit / Deactivate)
- 🔄 Role assignment (Admin / HR / Employee)
- ⚙️ Configure attendance rules and policies
- 📋 View audit logs for compliance
- 📊 System-wide analytics dashboard

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | Frontend Framework |
| React Router DOM | 6.20.0 | Client-side Routing |
| Axios | 1.6.2 | HTTP API Calls |
| React Hot Toast | 2.4.1 | Toast Notifications |
| React Icons | 4.12.0 | Icon Library |
| Recharts | 2.10.0 | Charts & Graphs |
| JWT Decode | 4.0.0 | Token Decoding |
| CSS3 | — | Styling |

---

## 📋 Prerequisites

Before you begin, ensure you have the following:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher)
- Backend API running on `http://localhost:5000` (see [backend README](../attendance-backend/README.md))

---

## 📁 Project Structure

```
attendance-frontend/
├── public/
│   ├── index.html                  # HTML entry point
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Layout.jsx          # Main layout wrapper (sidebar + header + outlet)
│   │   │   ├── Header.jsx          # Top navigation bar with user menu
│   │   │   └── Sidebar.jsx         # Role-aware side navigation menu
│   │   ├── Common/
│   │   │   ├── PrivateRoute.jsx    # Guards protected routes, redirects if not logged in
│   │   │   ├── LoadingSpinner.jsx  # Reusable loading indicator
│   │   │   └── ErrorMessage.jsx    # Reusable error display component
│   │   ├── Auth/
│   │   │   └── Login.jsx           # Login form with JWT handling
│   │   ├── Employee/
│   │   │   ├── Dashboard.jsx       # Clock in/out, today's status, stats
│   │   │   ├── AttendanceHistory.jsx  # Filtered personal attendance table
│   │   │   └── CorrectionRequests.jsx # Submit & track own correction requests
│   │   ├── HR/
│   │   │   ├── HRDashboard.jsx     # HR stats, pending requests summary
│   │   │   ├── PendingRequests.jsx # Approve / reject correction requests
│   │   │   └── AllAttendance.jsx   # All employees' attendance with filters + CSV export
│   │   └── Admin/
│   │       ├── AdminDashboard.jsx  # System-wide analytics
│   │       ├── UserManagement.jsx  # Create, edit, deactivate users
│   │       ├── AttendanceRules.jsx # Configure work hours, late threshold, overtime
│   │       └── AuditLogs.jsx       # View all system audit events
│   ├── services/
│   │   ├── api.js                  # Axios instance with base URL & JWT interceptor
│   │   ├── authService.js          # login(), logout(), getProfile()
│   │   ├── attendanceService.js    # clockIn(), clockOut(), getHistory()
│   │   ├── correctionService.js    # submitRequest(), getMyRequests()
│   │   ├── hrService.js            # getAllAttendance(), getPendingRequests(), approve/reject
│   │   └── adminService.js         # getUsers(), createUser(), updateUser(), getRules()
│   ├── context/
│   │   └── AuthContext.jsx         # Global auth state — user, token, login(), logout()
│   ├── utils/
│   │   └── helpers.js              # formatHours(), formatDate(), computeHours()
│   ├── styles/
│   │   └── global.css              # Global styles, CSS variables, status badge classes
│   ├── App.jsx                     # Route definitions, role-based redirects
│   └── index.js                    # React DOM entry point
├── .env                            # Environment variables (never commit)
├── .env.example                    # Example env file for reference
├── package.json
└── README.md
```

---

## 🚀 Installation

### Step 1: Clone the repository
```bash
git clone https://github.com/yourusername/attendance-frontend.git
cd attendance-frontend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure environment variables
```bash
cp .env.example .env
# Edit .env with your backend URL
```

### Step 4: Start the development server
```bash
npm start
```

App runs at: **http://localhost:3000**

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

> ⚠️ All React environment variables must be prefixed with `REACT_APP_`.  
> ⚠️ Never commit your `.env` file — add it to `.gitignore`.

---

## ▶️ Running the Application

```bash
# Development mode (hot reload)
npm start

# Run tests
npm test

# Build for production
npm run build
```

Make sure the backend is running first:
```bash
# In the backend directory
npm run dev
```

---

## 👥 User Roles & Access

| Role | Login Redirect | Access Level |
|------|---------------|--------------|
| **Admin** | `/admin/dashboard` | Full access — users, rules, audit logs, all records |
| **HR** | `/hr/dashboard` | All attendance records, correction request management |
| **Employee** | `/employee/dashboard` | Own attendance, own corrections only |

> Routes are protected by `PrivateRoute.jsx` and role checked at the component level. Accessing a route outside your role redirects to your own dashboard.

---

## 🧩 Features by Role

### 🟢 Employee Dashboard (`/employee/*`)

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/employee/dashboard` | Clock in/out button, today's status, weekly stats |
| Attendance History | `/employee/attendance` | Personal records with date filter |
| Correction Requests | `/employee/corrections` | Submit new requests, view status of existing ones |

### 🔵 HR Dashboard (`/hr/*`)

| Page | Route | Description |
|------|-------|-------------|
| HR Dashboard | `/hr/dashboard` | Summary cards — present today, late, pending corrections |
| All Attendance | `/hr/attendance` | Full records table filtered by date, department, status; CSV export |
| Pending Requests | `/hr/corrections` | Approve or reject employee correction requests with remarks |

### 🔴 Admin Dashboard (`/admin/*`)

| Page | Route | Description |
|------|-------|-------------|
| Admin Dashboard | `/admin/dashboard` | System-wide stats, charts |
| User Management | `/admin/users` | Add, edit, deactivate users; assign roles |
| Attendance Rules | `/admin/rules` | Set work hours, late threshold, overtime policy |
| Audit Logs | `/admin/audit` | View all system events — logins, clock-ins, edits |

---

## 🔌 Services & API Integration

All API calls go through `src/services/api.js`, which attaches the JWT token automatically:

```js
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### Service → Endpoint Mapping

| Service File | Key Functions | Backend Endpoint |
|---|---|---|
| `authService.js` | `login()`, `getProfile()` | `POST /api/auth/login` |
| `attendanceService.js` | `clockIn()`, `clockOut()`, `getHistory()` | `POST /api/attendance/clock-in` |
| `correctionService.js` | `submitRequest()`, `getMyRequests()` | `POST /api/corrections` |
| `hrService.js` | `getAllAttendance()`, `approveRequest()` | `GET /api/hr/attendance` |
| `adminService.js` | `getUsers()`, `createUser()`, `getRules()` | `GET /api/admin/users` |

---

## 🏗️ Building for Production

```bash
npm run build
```

This creates an optimized `build/` folder ready for deployment. To preview locally:

```bash
npm install -g serve
serve -s build
```

---

## 🚢 Deployment

### Deploy to Vercel (recommended)
```bash
npm install -g vercel
vercel
```

Set the environment variable in Vercel dashboard:
```
REACT_APP_API_URL = https://your-backend-api.com/api
```

### Deploy to Netlify
```bash
npm run build
# Drag and drop the build/ folder to netlify.com/drop
```

Add a `_redirects` file inside `public/` for React Router:
```
/*  /index.html  200
```

---

## 🔧 Troubleshooting

### ❌ `CORS error` when calling the backend
Make sure your backend has CORS enabled for `http://localhost:3000`:
```js
// In backend app.js
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
```

### ❌ `401 Unauthorized` on all API calls
- Token may have expired — log out and log back in
- Check that `REACT_APP_API_URL` points to the correct backend URL
- Ensure the backend `JWT_SECRET` hasn't changed

### ❌ Blank page after login / wrong dashboard shown
- Check `AuthContext.jsx` — confirm the role is being decoded correctly from the JWT
- Clear `localStorage` and log in again:
  ```js
  localStorage.clear();
  ```

### ❌ `npm start` fails — port 3000 in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### ❌ Charts not rendering
Make sure Recharts is installed:
```bash
npm install recharts
```

### ❌ Total hours showing wrong values
Hours are now computed directly from `clock_in_time` and `clock_out_time` timestamps — not from the `total_hours` DB field. See `src/utils/helpers.js → computeHours()`.

---

## 📄 License

This project is licensed under the MIT License.
