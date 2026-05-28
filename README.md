# Avidus Task - Basic RBAC Task Manager & Activity Tracker

A lightweight, zero-configuration full-stack web application designed to demonstrate robust **Role-Based Access Control (RBAC)** and real-time **User Activity Auditing**. 

This project is built using an **Express.js backend** powered by a persistent **Local JSON File Database (`db.json`)** and a **basic, clean React.js (Vite) frontend**. 

> **No MongoDB, Docker, or external database engines are required!** The application is 100% portable and runs instantly on any machine by reading and writing records straight to a local text file.

---

## Technical Highlights
1. **Granular Access Control (RBAC)**: Enforces clear permission locks. Regular users manage only their own tasks, while administrators have system-wide oversight (deactivating users, auditing logs, viewing and deleting any task).
2. **Account Status Guard**: A security check blocks logins and API access instantly if a user's status is toggled to `Inactive` by an Admin.
3. **Audit Trail Logging**: Database mutations and logins automatically log an audit trail containing user emails, roles, exact actions, client IP addresses, and timestamps.
4. **Setup-Free Architecture**: Operates on a flat `db.json` file which persists all changes in real-time, even when backend servers restart.

---

## Directory Structure
```
Avidus Task/
├── backend/
│   ├── config/
│   │   └── db.js            # Custom JSON database read/write helpers
│   ├── controllers/
│   │   ├── adminController.js # Users deactivation, analytics & logs audit APIs
│   │   ├── authController.js  # Registration & Login endpoints (plain-text passwords)
│   │   └── taskController.js  # Scoped CRUD handlers (User own tasks vs Admin global tasks)
│   ├── middleware/
│   │   ├── activityLogger.js  # Records audit trail entries to db.json
│   │   └── authMiddleware.js  # JWT parser, Active status check, & Admin role guard
│   ├── routes/
│   │   └── api.js             # Unified API router
│   ├── db.json                # Local database text file (pre-seeded with accounts)
│   ├── package.json           # Backend Express dependencies
│   └── server.js              # Express app launcher
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx         # Responsive role-based header navigation
    │   │   └── ProtectedRoute.jsx # Secure route protector
    │   ├── context/
    │   │   └── AuthContext.jsx    # Client session controller (JWT sync to localStorage)
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx # KPI aggregate boards and progress metrics
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

Follow these simple steps to run the application locally:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v16.x or newer is recommended).

### 1. Launch the Backend Server (Port 5000)
1. Open your terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Start the Express server:
   ```bash
   npm start
   ```
3. The terminal will print:
   ```
   Local JSON File Database initialized successfully.
   Server running in development mode on port 5000
   ```

### 2. Launch the Frontend Server (Port 5173)
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
- `POST /login`: authenticates email and password, generates a JWT, and creates a `Login` log.
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