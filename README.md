# Avidus Task - MongoDB RBAC Task Manager & Activity Tracker

A full-stack web application designed to demonstrate robust **Role-Based Access Control (RBAC)** and real-time **User Activity Auditing** powered by **Node.js, Express, MongoDB (Mongoose)** and **React.js**.

---

## Technical Highlights
1. **Granular Access Control (RBAC)**: Enforces clear permission locks. Regular users manage only their own tasks, while administrators have system-wide oversight (deactivating users, auditing logs, viewing and deleting any task).
2. **Account Status Guard**: A security check blocks logins and API access instantly if a user's status is toggled to `Inactive` by an Admin.
3. **Audit Trail Logging**: Database mutations and logins automatically log an audit trail containing user emails, roles, exact actions, client IP addresses, and timestamps.
4. **Data Hashing**: Integrates Mongoose pre-save hooks utilizing `bcryptjs` to encrypt passwords securely inside database records.

---

## Directory Structure
```
Avidus Task/
├── backend/
│   ├── config/
│   │   └── db.js            # MongoDB Mongoose connection config
│   ├── controllers/
│   │   ├── adminController.js # Users deactivation, analytics & logs audit APIs
│   │   ├── authController.js  # Registration & Login endpoints
│   │   └── taskController.js  # Scoped CRUD handlers (User own tasks vs Admin global tasks)
│   ├── middleware/
│   │   ├── activityLogger.js  # Records audit trail entries to MongoDB
│   │   └── authMiddleware.js  # JWT parser, Active status check, & Admin role guard
│   ├── models/
│   │   ├── ActivityLog.js     # MongoDB Schema for activity logs
│   │   ├── Task.js            # MongoDB Schema for task documents
│   │   └── User.js            # MongoDB Schema for users (encrypted credentials)
│   ├── routes/
│   │   └── api.js             # Unified API router
│   ├── seed.js                # Database seeder utility
│   ├── package.json           # Backend dependencies
│   └── server.js              # Express app launcher
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx         # Responsive role-based header navigation
    │   │   └── ProtectedRoute.jsx # Secure route protector
    │   ├── context/
    │   │   └── AuthContext.jsx    # Client session controller (JWT sync to localStorage)
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx # KPI stats cards and platform progress metrics
    │   │   ├── Dashboard.jsx      # Personal workspace with checkboxes & ratio bar
    │   │   ├── Login.jsx          # Simple login view
    │   │   ├── Register.jsx       # Simple register view (Dropdown role selection)
    │   │   ├── ActivityLogs.jsx   # Admin audit logs database list
    │   │   ├── TaskMonitoring.jsx # Global searchable system tasks monitor
    │   │   └── UserManagement.jsx # Admin user activation and deletion table
    │   ├── App.jsx            # App router paths
    │   └── index.css          # Clean dark CSS styles
    ├── index.html             # HTML layout template
    └── package.json           # Vite React dependencies
```

---

## Quick Startup Guide

Follow these steps to run the application locally on a machine equipped with MongoDB:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed and running locally on port `27017` (default).

### 1. Configure Environmental Settings
Navigate to the `backend/` directory, create a `.env` file, and populate the configuration keys:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/avidus_task
JWT_SECRET=avidus_super_secret_jwt_token_key_12345
```

### 2. Seed the MongoDB Database
Before starting the servers, run our automated database seeder to wipe old documents and seed default Administrator and User credentials:
1. Open your terminal in the `backend/` directory:
   ```bash
   cd backend
   ```
2. Run the seed script:
   ```bash
   node seed.js
   ```
3. The terminal will output details of seeded users, tasks, and initial activity logs.

### 3. Launch the Backend Server (Port 5000)
1. Start the Express server:
   ```bash
   npm start
   ```
2. The terminal will print:
   ```
   MongoDB Connected: 127.0.0.1
   Server running in development mode on port 5000
   ```

### 4. Launch the Frontend Server (Port 5173)
1. Open a second terminal window and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
3. Open your web browser and go to: **[http://localhost:5173/](http://localhost:5173/)**

---

## Pre-Seeded Testing Accounts

The database comes pre-configured with the following credentials to make E2E validation completely frictionless:

### 1. Platform Administrator
- **Email**: `admin@example.com`
- **Password**: `password123`
- **Dashboard Capabilities**: Full administrative view. Can toggle standard users between `Active` and `Inactive`, cascade-delete users, view all system tasks, delete any task, and monitor platform logs.
- *Safety Lock*: Administrators are prevented from deactivating or deleting their own accounts.

### 2. Standard Active User
- **Email**: `john@example.com`
- **Password**: `password123`
- **Workspace Capabilities**: Personal task manager. Can create, read, toggle check, edit, and delete *only* their own tasks. Blocked from entering admin portals.

### 3. Deactivated Account (Security Lockout Test)
- **Email**: `disabled@example.com`
- **Password**: `password123`
- **Status**: `Inactive`
- **Behavior**: Blocking handles logins instantly. A clean notification appears indicating the account is deactivated.

---

## REST API Specification

### Authentication Routes (`/api/auth`)
- `POST /register`: Registers a new account.
- `POST /login`: Authenticates email and password, generates a JWT, and creates a `Login` log.
- `GET /me` (Private): Retrieves the currently authenticated user session.

### Task Workspace Routes (`/api/tasks`)
- `POST /` (Private): Creates a task owned by the caller.
- `GET /` (Private): Returns tasks (Standard users get only their own; Admins get all tasks populated with owner names/emails).
- `PUT /:id` (Private): Updates the task details or status (Only allowed for the task owner).
- `DELETE /:id` (Private): Deletes the task (Allowed for the task owner, or *any* administrator).

### Admin Control Routes (`/api/admin`)
- `GET /users` (Private Admin Only): Lists all registered accounts (excluding passwords).
- `PUT /users/:id/status` (Private Admin Only): Toggles account status (`Active` vs `Inactive`).
- `DELETE /users/:id` (Private Admin Only): Cascade-deletes a user and ALL tasks created by them.
- `GET /analytics` (Private Admin Only): Compiles platform metrics (Total users, tasks, pending, and completed ratios).
- `GET /logs` (Private Admin Only): Lists the platform activity logs audit trails.