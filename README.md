# LabLoop – Intelligent Laboratory Resource Sharing & Utilization Management System

[![Node.js Version](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v18.3-blue.svg)](https://react.dev/)
[![Express Version](https://img.shields.io/badge/Express-v4.21-lightgrey.svg)](https://expressjs.com/)
[![MongoDB Version](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose-brightgreen.svg)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License: Academic](https://img.shields.io/badge/License-MCA%20Capstone-blueviolet.svg)](#)

> **LabLoop** is a full-stack MERN application engineered for academic and technical institutions to connect multiple departments, prevent duplicate equipment procurement, streamline reservations with automated conflict detection, log maintenance lifecycles, and dynamically balance equipment utilization through the **LabLoop Resource Intelligence Engine**.

---

## Table of Contents

1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [Key Innovation: LabLoop Resource Intelligence Engine](#2-key-innovation-labloop-resource-intelligence-engine)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture Diagram](#4-system-architecture-diagram)
5. [Database Entity-Relationship (ER) Diagram](#5-database-entity-relationship-er-diagram)
6. [Mapping of All 15 Mandatory Academic Checkpoints](#6-mapping-of-all-15-mandatory-academic-checkpoints)
7. [Project Folder Structure](#7-project-folder-structure)
8. [Installation & Execution Guide](#8-installation--execution-guide)
9. [MongoDB Atlas Step-by-Step Configuration](#9-mongodb-atlas-step-by-step-configuration)
10. [Demonstration Credentials (4 Roles)](#10-demonstration-credentials-4-roles)
11. [REST API Documentation](#11-rest-api-documentation)
12. [Booking Engine & Conflict Prevention Logic](#12-booking-engine--conflict-prevention-logic)
13. [End-to-End Test Suite Verification](#13-end-to-end-test-suite-verification)
---

## 1. Executive Summary & Problem Statement

### The Problem
Universities and technical colleges house expensive scientific apparatus, embedded computing hardware, and prototyping tools across independent departments (e.g., Computer Science, Electronics, Mechanical, Civil, and Physics). Traditionally, departments manage equipment in isolated silos resulting in:
- **Severe Underutilization:** Expensive equipment lies idle for weeks in one department while another department faces shortages.
- **Redundant Procurement:** Colleges spend capital purchasing instruments already available elsewhere on campus.
- **Scheduling Conflicts:** Manual paper logbooks cause double-booking and schedule collisions.
- **Untracked Maintenance:** Unrecorded wear-and-tear leads to unexpected breakdowns during critical lab exams.

### The LabLoop Solution
LabLoop bridges this departmental divide by providing:
- A unified multi-department equipment inventory catalog.
- Concurrency-safe, quantity-aware reservation booking with automated overlap prevention.
- Role-based authorization across four distinct institutional personas (Super Admin, Faculty, Student, Technician).
- Transparent equipment maintenance and repair tracking.
- An explainable, rule-based **Resource Intelligence Engine** that surfaces idle assets, pairs compatible cross-department requests, and pinpoints bottlenecked equipment.

---

## 2. Key Innovation: LabLoop Resource Intelligence Engine

The core innovation in LabLoop is located in [`backend/services/recommendationService.js`](file:///C:/Users/Lenovo/.gemini/antigravity/scratch/labloop/backend/services/recommendationService.js). It operates on transparent, explainable rules:

### Feature A: Idle Asset Detection
Monitors the rolling 30-day utilization score of all campus equipment:
$$\text{Utilization \%} = \left(\frac{\text{Actual Usage Hours}}{\text{Available Operating Hours}}\right) \times 100$$
- Where $\text{Available Operating Hours} = \text{Quantity} \times (\text{Days} \times 8\text{ hrs/day}) - \text{Downtime Hours}$.
- An asset is flagged as an **Inter-Departmental Sharing Candidate** if its utilization is $< 25\%$, condition is **Good** or **Excellent**, status is **Available**, and it has positive unreserved inventory.

### Feature B: Cross-Department Equipment Matching
When an academic department experiences a shortage or requires equipment, the engine evaluates available assets across all other departments using a 5-factor weighted algorithm (0 to 100%):
1. **Category Compatibility (30% Weight):** Exact or adjacent category alignment.
2. **Availability Compatibility (25% Weight):** Availability without conflicting bookings during the requested window.
3. **Quantity Availability (20% Weight):** Ratio of surplus available stock to requested stock.
4. **Location Suitability (15% Weight):** Campus building and laboratory proximity.
5. **Department Access Policy (10% Weight):** Inter-department collaboration bonus.

> **Hard Safety Constraints:** Equipment currently **Under Maintenance**, **Retired**, in **Needs Maintenance** condition, or exceeding **maxBookingHours** is strictly excluded from recommendations, regardless of matching score.

### Feature C: Demand & Bottleneck Analysis
Aggregates reservation requests and rejections across departments to highlight high-contention apparatus and recommend inventory adjustments.

---

## 3. Technology Stack

| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript (ES6+), React Router DOM v6 | Single Page Application framework & routing |
| **Styling & UI** | Tailwind CSS v3, Lucide React Icons | Responsive institutional SaaS layout |
| **Data Visualization** | Recharts v2 | Utilization bar charts, monthly trends, status donuts |
| **State & API Client** | Context API, Native Fetch API | Global auth/notification state, HTTP REST communication |
| **Backend** | Node.js, Express.js | REST API server, routing, controllers |
| **Database** | MongoDB Atlas, Mongoose v8 | Persistent document storage, schema validation |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs | Secure password hashing, tokenized authorization |
| **Configuration** | dotenv, CORS | Environment isolation, origin security |

---

## 4. System Architecture Diagram

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React + Vite + Tailwind CSS)"]
        UI["Tailwind SaaS UI & Recharts Dashboard"]
        State["Context API (AuthContext, NotificationContext)"]
        FetchService["api.js (Native Fetch API Wrapper)"]
        UI --> State
        State --> FetchService
    end

    subgraph Server["Backend Server (Node.js + Express.js)"]
        AuthMiddleware["JWT Auth & Role Middleware"]
        Router["Express REST Routes (/api/*)"]
        Controllers["10 Feature Controllers"]
        
        subgraph Engine["LabLoop Core Engines"]
            BookingSvc["Booking Conflict Engine"]
            RecSvc["Resource Intelligence Engine"]
            UtilSvc["Utilization Analytics Engine"]
        end

        FetchService -- "HTTP Bearer JWT" --> AuthMiddleware
        AuthMiddleware --> Router
        Router --> Controllers
        Controllers --> Engine
    end

    subgraph Database["Database Layer (MongoDB Atlas / Mongoose)"]
        MongooseModels["Mongoose Schemas & Indexes\n(User, Dept, Lab, Equipment, Booking, Maintenance, Notification)"]
        Engine --> MongooseModels
        MongooseModels -- "MongoDB Wire Protocol" --> MongoAtlas[("MongoDB Atlas Cloud / Replica Set")]
    end
```

---

## 5. Database Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    DEPARTMENT ||--o{ LABORATORY : contains
    DEPARTMENT ||--o{ USER : assigns
    DEPARTMENT ||--o{ EQUIPMENT : owns
    LABORATORY ||--o{ EQUIPMENT : houses
    USER ||--o{ BOOKING : requests
    EQUIPMENT ||--o{ BOOKING : reserved_in
    USER ||--o{ MAINTENANCE : reports
    USER ||--o{ MAINTENANCE : assigned_to
    EQUIPMENT ||--o{ MAINTENANCE : serviced_in
    USER ||--o{ NOTIFICATION : receives

    DEPARTMENT {
        ObjectId _id PK
        string name UK
        string code UK
        string description
        string headOfDepartment
        string contactEmail
    }

    LABORATORY {
        ObjectId _id PK
        string name
        string laboratoryCode UK
        ObjectId department FK
        string location
        string status
        object operatingHours
    }

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "admin|faculty|student|technician"
        ObjectId department FK
        string studentOrEmployeeId
        boolean isVerified
    }

    EQUIPMENT {
        ObjectId _id PK
        string name
        string equipmentCode UK
        string category
        ObjectId department FK
        ObjectId laboratory FK
        number quantity
        number availableQuantity
        string condition "Excellent|Good|Fair|Poor|Needs Maintenance"
        string status "Available|Partially Available|Under Maintenance|Unavailable|Retired"
        boolean requiresTraining
        number maxBookingHours
    }

    BOOKING {
        ObjectId _id PK
        ObjectId user FK
        ObjectId equipment FK
        ObjectId department FK
        number requestedQuantity
        Date startTime
        Date endTime
        string purpose
        string status "Pending|Approved|Rejected|Checked-Out|Completed|Cancelled"
        ObjectId approvedBy FK
        Date actualCheckIn
        Date actualCheckOut
        number actualUsageHours
    }

    MAINTENANCE {
        ObjectId _id PK
        ObjectId equipment FK
        ObjectId reportedBy FK
        ObjectId assignedTo FK
        string issue
        string description
        string priority "Low|Medium|High|Critical"
        string status "Reported|Assigned|In Progress|Completed|Rejected"
        number repairCost
        string resolutionNotes
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId recipient FK
        string title
        string message
        string type
        boolean isRead
    }
```

---

## 6. Mapping of All 15 Mandatory Academic Checkpoints

| Checkpoint | Requirement | Implementation Evidence |
| :--- | :--- | :--- |
| **01** | Multiple React Components | Built 15+ reusable components: `Navbar.jsx`, `Sidebar.jsx`, `DashboardCard.jsx`, `EquipmentCard.jsx`, `EquipmentTable.jsx`, `BookingCard.jsx`, `BookingForm.jsx`, `StatusBadge.jsx`, `SearchBar.jsx`, `LoadingSpinner.jsx`, `ErrorMessage.jsx`, `NotificationPanel.jsx`, `ConfirmationModal.jsx`, `RecommendationCard.jsx`, `MaintenanceModal.jsx`, `EquipmentModal.jsx`, `DepartmentModal.jsx`. |
| **02** | Responsive Web Design | Mobile drawer sidebar, responsive grids (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`), flex layouts, and touch-friendly controls tested on mobile, tablet, and desktop breakpoints. |
| **03** | Tailwind CSS | Customized palette (`#2563EB` primary, `#111827` sidebar, `#F8FAFC` background) in `tailwind.config.js` and `index.css`. No conflicting CSS frameworks. |
| **04** | Use Native Fetch API | Handled exclusively via `frontend/src/services/api.js` supporting `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, standard token headers, and HTTP error parsing. Zero Axios dependencies. |
| **05** | Error Handling | Frontend `ErrorMessage.jsx` with retry triggers, client-side input validation, centralized Express error middleware (`middleware/errorMiddleware.js`) handling Mongoose CastErrors, duplicate keys (11000), validation errors, and JWT expiration. |
| **06** | Props & State | Component modularity passing props (`equipment`, `booking`, `onApprove`, `onCheckIn`, `onCancel`) and managing state (`useState`, `useMemo`) for filters, search queries, modals, and forms. |
| **07** | Conditional Rendering | Role-tailored dashboards (`AdminDashboard`, `FacultyDashboard`, `StudentDashboard`, `TechnicianDashboard`), color-coded `StatusBadge`, empty states, loading spinners, and permission-gated controls. |
| **08** | React Router & Protected Routes | `ProtectedRoute.jsx` checks session validity; `RoleRoute.jsx` enforces role permissions across 4 user roles. Handled via React Router DOM v6. |
| **09** | Forms & Form Validation | Input forms for User Registration, Login, Equipment Registration, Equipment Edit, Booking Requests, Maintenance Reporting, and Department Creation with client- and server-side checks. |
| **10** | Hooks & Context API | `useState`, `useEffect`, `useContext`, `useNavigate`, `useLocation`, `useMemo`, `AuthContext.jsx`, `NotificationContext.jsx`, and custom hooks (`useEquipment.js`, `useBookings.js`). |
| **11** | REST API Architecture | Express controllers, routes, and services for Auth, Users, Departments, Laboratories, Equipment, Bookings, Maintenance, Analytics, Recommendations, and Notifications with standard HTTP status codes. |
| **12** | Environment Variables | Managed via `dotenv`. Backend `.env` (`PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`), Frontend `.env` (`VITE_API_URL`), `.gitignore`, and sanitized `.env.example` templates. |
| **13** | MongoDB Persistence | Real MongoDB database storing all collections with CRUD operations. No browser localStorage substitutes for operational records. |
| **14** | MongoDB Atlas Integration | Configured via `MONGO_URI`. Includes automatic fallback to cached in-memory MongoDB for offline/zero-setup demonstration, connection status logging, and setup instructions. |
| **15** | Mongoose Schemas | 7 discrete Mongoose schemas (`User.js`, `Department.js`, `Laboratory.js`, `Equipment.js`, `Booking.js`, `Maintenance.js`, `Notification.js`) with types, validators, enums, defaults, timestamps, indexes, and ObjectId references. |

---

## 7. Project Folder Structure

```text
labloop/
├── backend/
│   ├── config/
│   │   └── db.js                        # MongoDB Atlas connection & fallback
│   ├── controllers/
│   │   ├── analyticsController.js       # Dashboard KPIs & usage statistics
│   │   ├── authController.js            # Registration, login, profile
│   │   ├── bookingController.js         # Booking CRUD, check-in, check-out
│   │   ├── departmentController.js      # Department CRUD
│   │   ├── equipmentController.js       # Equipment catalog CRUD & search
│   │   ├── laboratoryController.js      # Laboratory room management
│   │   ├── maintenanceController.js     # Fault tickets & repairs
│   │   ├── notificationController.js    # In-app notifications
│   │   ├── recommendationController.js  # Resource Intelligence API
│   │   └── userController.js            # User role & profile management
│   ├── middleware/
│   │   ├── authMiddleware.js            # JWT Bearer token verification
│   │   ├── errorMiddleware.js           # Central Express error handler
│   │   └── roleMiddleware.js            # RBAC authorization
│   ├── models/
│   │   ├── Booking.js                   # Booking reservation schema
│   │   ├── Department.js                # Academic department schema
│   │   ├── Equipment.js                 # Equipment apparatus schema
│   │   ├── Laboratory.js                # Laboratory room schema
│   │   ├── Maintenance.js               # Maintenance ticket schema
│   │   ├── Notification.js              # User notification schema
│   │   └── User.js                      # User model with bcrypt hashing
│   ├── routes/                          # 10 Express route files
│   ├── scripts/
│   │   ├── seed.js                      # Realistic demonstration seeder
│   │   └── testSuite.js                 # 24-point automated test suite
│   ├── services/
│   │   ├── bookingService.js            # Overlap conflict & quantity engine
│   │   ├── recommendationService.js     # Resource Intelligence Engine
│   │   └── utilizationService.js        # Mathematical utilization calculations
│   ├── .env                             # Backend configuration
│   ├── .env.example                     # Environment template
│   ├── package.json
│   └── server.js                        # Express server entry point
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/                  # 17 reusable React components
    │   ├── context/
    │   │   ├── AuthContext.jsx          # User session & credentials
    │   │   └── NotificationContext.jsx  # Live in-app notifications
    │   ├── hooks/
    │   │   ├── useBookings.js           # Booking management hook
    │   │   └── useEquipment.js          # Catalog & search hook
    │   ├── pages/                       # 14 React pages
    │   ├── routes/
    │   │   ├── ProtectedRoute.jsx       # Auth guard
    │   │   └── RoleRoute.jsx            # RBAC role guard
    │   ├── services/
    │   │   └── api.js                   # Native Fetch API client
    │   ├── App.jsx                      # Router & route definitions
    │   ├── index.css                    # Tailwind CSS directives
    │   └── main.jsx                     # Vite React entry point
    ├── .env                             # Frontend configuration
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 8. Installation & Execution Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Visual Studio Code](https://code.visualstudio.com/)

### Step 1: Open the Project in VS Code
Open the root project folder in VS Code:
```bash
cd C:\Users\Lenovo\.gemini\antigravity\scratch\labloop
```

### Step 2: Backend Setup
Open a terminal in VS Code:
```bash
cd backend
npm install
```

Verify your `backend/.env` file:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/labloop_db
JWT_SECRET=labloop_academic_jwt_secret_key_2026_mca_project
CLIENT_URL=http://localhost:5173
```
*(If you have a MongoDB Atlas connection string, paste it as `MONGO_URI`. If left blank or default, the server automatically starts an in-memory database for immediate demonstration!)*

### Step 3: Seed the Database with Realistic Demonstration Data
Run the database seed script:
```bash
npm run seed
```
*Output: Seeds 5 departments, 5 laboratories, 15 equipment records, 4 role accounts, realistic bookings, and maintenance tickets.*

### Step 4: Frontend Setup
Open a second terminal window:
```bash
cd frontend
npm install
```

Verify your `frontend/.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 5: Start the Development Servers
In Terminal 1 (Backend):
```bash
npm run dev
# Server starts on http://localhost:5000
```

In Terminal 2 (Frontend):
```bash
npm run dev
# Frontend starts on http://localhost:5173
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## 9. MongoDB Atlas Step-by-Step Configuration

To connect LabLoop to a live cloud cluster on MongoDB Atlas:

1. **Sign Up / Log In:** Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create an account.
2. **Create a Free Cluster:** Select **M0 Free Shared Tier**, choose your nearest cloud provider region (e.g., AWS / Mumbai or Singapore), and click **Create Deployment**.
3. **Configure Database User:**
   - Under **Database Access**, click **Add New Database User**.
   - Select **Password Authentication**.
   - Set Username (e.g., `labloop_admin`) and a strong Password (e.g., `LabLoop@2026Secure`).
   - Assign the **Read and write to any database** role.
4. **Configure Network Access (IP Whitelist):**
   - Under **Network Access**, click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) for development, or add your current public IP.
5. **Retrieve Connection String:**
   - Go to **Database Deployments** and click **Connect**.
   - Choose **Drivers** (Node.js).
   - Copy the connection string format:
     ```text
     mongodb+srv://labloop_admin:<password>@cluster0.abcde.mongodb.net/labloop_db?retryWrites=true&w=majority
     ```
6. **Update Backend `.env`:**
   Replace `<password>` with your actual database user password and update `backend/.env`:
   ```env
   MONGO_URI=mongodb+srv://labloop_admin:LabLoop@2026Secure@cluster0.abcde.mongodb.net/labloop_db?retryWrites=true&w=majority
   ```
7. **Verify Connectivity:**
   Run `npm run seed` in `backend/`. The terminal will log:
   ```text
   [Database] MongoDB Connected to: cluster0-shard-00-00.abcde.mongodb.net
   ```

---

## 10. Demonstration Credentials (4 Roles)

For quick demonstration during academic evaluations, the login page features **1-Click Demo Buttons** pre-filled with the credentials below:

| Role | Email Address | Password | Department | Permitted Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@labloop.edu` | `Password@123` | *All Departments* | Full system administration, institution-wide analytics, department & user management, delete equipment. |
| **Faculty / Lab Manager** | `faculty.cse@labloop.edu` | `Password@123` | Computer Science | Add & edit department equipment, approve or reject student bookings, schedule maintenance, view department analytics. |
| **Student / Researcher** | `student@labloop.edu` | `Password@123` | Computer Science | Explore equipment across departments, submit booking reservations, check in/out equipment, report faults. |
| **Technician** | `technician@labloop.edu` | `Password@123` | Electronics | View assigned repair work orders, update progress, log repair costs, mark equipment ready for lab use. |

---

## 11. REST API Documentation

### Authentication & Users
- `POST /api/auth/register` – Register a new user account.
- `POST /api/auth/login` – Authenticate user and receive JWT bearer token.
- `GET /api/auth/me` – Retrieve authenticated user profile (Protected).
- `PUT /api/auth/profile` – Update user profile and change password (Protected).
- `GET /api/users` – List all institutional users with role filters (Admin).
- `GET /api/users/technicians` – List available lab technicians for assignment.

### Departments & Laboratories
- `GET /api/departments` – Retrieve all academic departments and labs.
- `POST /api/departments` – Create a new department (Admin).
- `PUT /api/departments/:id` – Update department details (Admin).
- `DELETE /api/departments/:id` – Remove department (Admin).
- `GET /api/laboratories` – List laboratories by department.
- `POST /api/laboratories` – Register a new laboratory room (Admin/Faculty).

### Equipment Management
- `GET /api/equipment` – Search & filter equipment (Query: `search`, `department`, `category`, `status`, `condition`).
- `GET /api/equipment/:id` – Detailed apparatus view, upcoming bookings, maintenance history.
- `POST /api/equipment` – Register new equipment (Admin/Faculty).
- `PUT /api/equipment/:id` – Edit equipment details (Admin/Faculty).
- `DELETE /api/equipment/:id` – Delete equipment (Admin).

### Reservations & Bookings
- `GET /api/bookings` – List bookings (Role-scoped: student sees own; faculty sees department).
- `POST /api/bookings` – Submit reservation with conflict checking (Protected).
- `GET /api/bookings/:id` – Retrieve booking record details (Protected).
- `PATCH /api/bookings/:id/status` – Approve or reject booking (Faculty/Admin).
- `POST /api/bookings/:id/check-in` – Hand over equipment and start session (Protected).
- `POST /api/bookings/:id/check-out` – Return equipment and record usage hours (Protected).
- `PATCH /api/bookings/:id/cancel` – Cancel pending or approved booking (Student/Admin).

### Maintenance & Diagnostics
- `GET /api/maintenance` – List maintenance work orders with priority filters.
- `POST /api/maintenance` – Report malfunction and place equipment in service mode.
- `PATCH /api/maintenance/:id` – Update repair progress, record cost, and restore availability.

### Resource Intelligence & Analytics
- `GET /api/recommendations/idle-equipment` – Detect underutilized assets ($< 25\%$).
- `GET /api/recommendations/equipment-matches` – 5-factor cross-department matching engine.
- `GET /api/recommendations/demand-analysis` – Bottlenecks and high-demand equipment.
- `GET /api/analytics/dashboard` – Institution-wide KPIs and recent activity.
- `GET /api/analytics/utilization` – 30-day equipment utilization rates.
- `GET /api/analytics/department` – Department-wise utilization comparison.
- `GET /api/analytics/usage-history` – Monthly booking trends.

---

## 12. Booking Engine & Conflict Prevention Logic

The reservation engine implements atomic conflict detection in [`backend/services/bookingService.js`](file:///C:/Users/Lenovo/.gemini/antigravity/scratch/labloop/backend/services/bookingService.js).

### Time Overlap Condition
Two time intervals $[S_1, E_1]$ and $[S_2, E_2]$ overlap if and only if:
$$\text{NewStart} < \text{ExistingEnd} \quad \text{AND} \quad \text{NewEnd} > \text{ExistingStart}$$

### Quantity-Aware Allocation
For equipment with inventory $Q > 1$:
1. Finds all active reservations (`Pending`, `Approved`, `Checked-Out`) whose time overlaps with the requested window.
2. Sums the total reserved units:
   $$\text{ReservedInSlot} = \sum_{i} \text{requestedQuantity}_i$$
3. Calculates available units in that slot:
   $$\text{AvailableInSlot} = Q - \text{ReservedInSlot}$$
4. If $\text{RequestedQuantity} > \text{AvailableInSlot}$, the backend rejects the request with an explicit error detailing how many units are currently reserved.

---

## 13. End-to-End Test Suite Verification

LabLoop includes an automated integration test script (`backend/scripts/testSuite.js`) that verifies 24 critical operational scenarios:

```bash
cd backend
node scripts/testSuite.js
```

### Verified Test Scenarios

```text
============================================================
   LABLOOP COMPREHENSIVE END-TO-END TEST SUITE              
============================================================

--- 1. Testing Department & Laboratory Hierarchy ---
[PASS] Scenario 1: Academic department queried/created successfully
[PASS] Scenario 2: Laboratory associated with department

--- 2. Testing User Authentication & Security ---
[PASS] Scenario 3: Student registration and document creation
[PASS] Scenario 4: Password securely hashed via bcrypt pre-save hook
[PASS] Scenario 5: Successful password comparison on login
[PASS] Scenario 6: Failed login on incorrect password

--- 3. Testing Equipment Catalog & CRUD ---
[PASS] Scenario 7: Equipment creation
[PASS] Scenario 8: Equipment editing / update
[PASS] Scenario 9: Equipment search by keyword

--- 4. Testing Booking Logic & Overlap Conflict Engine ---
[PASS] Scenario 10: Successful booking creation in available slot
[PASS] Scenario 11: Overlapping reservation correctly detected and rejected
[PASS] Scenario 12: Quantity-aware reservation validation enforced

--- 5. Testing Booking Lifecycle (Handover & Return) ---
[PASS] Scenario 13: Equipment check-out / handover
[PASS] Scenario 14: Equipment return and actual usage recorded

--- 6. Testing Maintenance & Repair Desk ---
[PASS] Scenario 15: Equipment fault reporting
[PASS] Scenario 16: Maintenance resolution & equipment restoration

--- 7. Testing LabLoop Resource Intelligence Engine ---
[PASS] Scenario 18: Dynamic utilization calculation formula
[PASS] Scenario 19: Idle equipment detection algorithm
[PASS] Scenario 20: Explainable recommendation justification text
[PASS] Scenario 21: Cross-department equipment matching algorithm
[PASS] Scenario 22: Matching score within 0-100 range
[PASS] Scenario 23: Demand bottleneck analysis
[PASS] Scenario 24: Mongoose ObjectId population across collections
[PASS] Scenario 25: Post-test data cleanup and cascade verification

============================================================
   TEST RESULTS: 24 PASSED, 0 FAILED                 
============================================================
```

---

## License & Academic Disclaimer

Developed as an MCA (Master of Computer Applications) final capstone project. Designed in accordance with academic software engineering guidelines, database normalization principles, and modular full-stack development best practices.

