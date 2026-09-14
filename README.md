# CampusFix – Smart Campus Maintenance Complaint Management System

![CampusFix Banner](https://img.shields.io/badge/CampusFix-v1.0.0-indigo.svg)
![Django](https://img.shields.io/badge/Backend-Django%206.1%20%7C%20DRF-green.svg)
![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-blue.svg)
![Tests](https://img.shields.io/badge/Tests-100%25%20Passing-emerald.svg)

**CampusFix** is an enterprise-grade full-stack web application designed for higher education campuses to streamline maintenance complaint reporting, technician dispatch, progress tracking, and resolution.

---

## Table of Contents
1. [Problem Statement & Objectives](#problem-statement--objectives)
2. [Key Features & Smart Capabilities](#key-features--smart-capabilities)
3. [Technology Stack](#technology-stack)
4. [System Architecture & Database Schema](#system-architecture--database-schema)
5. [Complete CRUD Implementation](#complete-crud-implementation)
6. [REST API Documentation](#rest-api-documentation)
7. [Installation & Setup Guide](#installation--setup-guide)
8. [Testing & Postman Verification](#testing--postman-verification)
9. [College Evaluation Demonstration SOP](#college-evaluation-demonstration-sop)
10. [Academic Report & Test Case Table](#academic-report--test-case-table)

---

## 1. Problem Statement & Objectives

### Problem Statement
College campuses frequently suffer delays in addressing physical infrastructure issues (e.g. broken ceiling fans, damaged desks, flickering projectors, power panel sparks, plumbing leaks, and Wi-Fi outages). Traditional verbal reporting or paper logbooks result in lost tickets, lack of accountability, and zero transparency for students.

### Main Objective
CampusFix replaces manual complaint mechanisms with a centralized digital platform where:
- **Students** can submit complaints with safety hazard alerts, monitor live progress through an interactive visual timeline, and edit or cancel tickets before work starts.
- **Administrators** have a live command center to review campus-wide tickets, filter by urgency, assign dedicated maintenance technicians, monitor category breakdowns, and manage the staff directory.
- **Maintenance Technicians** have a focused workbench to accept work orders and mark them in-progress and resolved with automatic timestamping.

---

## 2. Key Features & Smart Capabilities

- **⚡ Feature 1 — Real-Time Priority Hazard Detection:**
  The system scans complaint titles and descriptions for critical hazard keywords (`spark`, `dangerous`, `fire`, `exposed wire`, `electric shock`, `smoke`). When detected, an animated alert banner appears and automatically suggests **Critical Priority** to prevent electrical and structural accidents.
- **⚠️ Feature 2 — Duplicate Complaint Warning:**
  When a student inputs a location and category (e.g. "Library 2nd floor", "Plumbing"), the system checks active unresolved tickets in the database. If a match is found, an informative alert warns the student that an issue is already under repair, eliminating redundant tickets while still allowing submission if it is a separate fault.
- **📊 Feature 3 — Visual 5-Stage Complaint Progress Timeline:**
  Each complaint displays an illuminated step-by-step progress timeline:
  `Submitted` → `Under Review` → `Assigned` → `In Progress` → `Resolved` (or `Rejected`).
- **📈 Feature 4 — Executive Analytics Dashboard:**
  Real-time visual distribution metrics displaying complaints categorized by Status, Priority level, and Category breakdown.
- **👥 Feature 5 — Maintenance Staff Directory CRUD:**
  Administrators can register new technicians, specify trade specializations (Electrical, Plumbing, HVAC, Carpentry, IT), and manage availability (`Available`, `Busy`, `On Leave`).
- **⚡ Feature 6 — 1-Click Evaluation Switcher:**
  At the top of the application, buttons allow instant 1-click login as **Student**, **Admin**, or **Staff** for rapid college evaluation without manual typing.

---

## 3. Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React (v19), Vite, Lucide Icons, Custom Glassmorphism Design System, CSS Variables, Responsive Grid/Flexbox |
| **Backend** | Python 3.12, Django 6.1, Django REST Framework (DRF 3.18), `django-cors-headers` |
| **Database** | SQLite 3 (Configured with foreign keys, constraints, ready for PostgreSQL/MySQL migration) |
| **Security** | Token Authentication, PBKDF2 Password Hashing, Role-Based Access Control (`BasePermission`) |
| **API Testing** | Postman Collection v2.1 + Automated Python Test Suite (`test_api_endpoints.py`) |

---

## 4. System Architecture & Database Schema

### Database Relational Model

```
       ┌─────────────────┐
       │   users_user    │ (Roles: STUDENT, ADMIN, STAFF)
       └────────┬────────┘
                │ 1
                │
                │ N
       ┌────────▼────────┐                 ┌───────────────────────────┐
       │   complaint     │────────N:1──────►   staff_maintenancestaff   │
       └─────────────────┘                 └───────────────────────────┘
```

- **User Model:** `id`, `email` (unique), `name`, `password`, `role` (`STUDENT`, `ADMIN`, `STAFF`), `department`, `phone`, `created_at`.
- **MaintenanceStaff Model:** `id`, `name`, `email` (unique), `phone`, `department`, `specialization`, `availability` (`Available`, `Busy`, `On Leave`), `created_at`.
- **Complaint Model:** `id`, `complaint_title`, `description`, `category` (9 choices), `location`, `priority` (4 choices), `status` (6 choices), `student` (FK to User), `assigned_staff` (FK to Staff, nullable), `image` (attachment), `created_at`, `updated_at`, `resolved_at`.

---

## 5. Complete CRUD Implementation

| Operation | Student Action | Admin Action | Staff Action |
|---|---|---|---|
| **CREATE** | Submits maintenance complaint with category, room location, priority, description & photo. | Can register new complaints directly. | — |
| **READ** | Views "My Reported Issues", filters by category/status, searches keywords, views visual timeline. | Views global queue, filters across all campus departments, views analytics metrics. | Views tickets assigned to their technician profile. |
| **UPDATE** | Edits ticket details while in `Submitted` or `Under Review` status. | Edits all ticket info, assigns maintenance staff, advances status to `In Progress` or `Resolved`. | Updates assigned ticket to `In Progress` and `Resolved`. |
| **DELETE** | Cancels and deletes own ticket while before work begins (modal confirmed). | Permanently deletes any complaint or staff member with modal confirmation. | — |

---

## 6. REST API Documentation

Base URL: `http://127.0.0.1:8000/api/`

| HTTP Method | Endpoint | Description | Permitted Roles |
|---|---|---|---|
| `POST` | `/auth/login/` | Authenticate user & return token | Public |
| `POST` | `/auth/register/` | Register student or staff account | Public |
| `GET` | `/auth/me/` | Get current user profile details | Authenticated |
| `GET` | `/complaints/` | List complaints (supports `?category=`, `?status=`, `?priority=`, `?search=`) | Authenticated |
| `POST` | `/complaints/` | Submit new complaint | Student / Admin |
| `GET` | `/complaints/{id}/` | Retrieve full complaint metadata | Owner / Admin |
| `PATCH` | `/complaints/{id}/` | Update complaint details | Permitted Owner / Admin |
| `DELETE` | `/complaints/{id}/` | Permanently remove complaint | Permitted Owner / Admin |
| `PATCH` | `/complaints/{id}/assign_staff/` | Assign staff member to complaint | Admin |
| `PATCH` | `/complaints/{id}/update_status/` | Update lifecycle status (`In Progress`, `Resolved`, etc.) | Admin / Staff |
| `GET` | `/complaints/analytics/` | Retrieve dashboard metrics & distributions | Authenticated |
| `GET` | `/complaints/check_duplicate/` | Detect active complaints in same room/category | Authenticated |
| `POST` | `/complaints/detect_priority/` | Scan text for hazard keywords | Authenticated |
| `GET` | `/staff/` | List all maintenance technicians | Authenticated |
| `POST` | `/staff/` | Register new maintenance staff member | Admin |
| `PATCH` | `/staff/{id}/` | Update staff availability or specialization | Admin |
| `DELETE` | `/staff/{id}/` | Delete staff technician | Admin |

---

## 7. Installation & Setup Guide

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- Node.js 18+ (Node v24 tested)
- Git

### Step 1: Clone Repository & Virtual Environment
```bash
cd CAMPUSFIXPROJECT
python -m venv venv
# Activate virtual environment:
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 2: Backend Dependencies & Database Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data
```

> **Note on `seed_data`:** This pre-populates demo accounts with complaints and staff ready for evaluation:
> - **Student:** `student@campusfix.edu` / `Student@123`
> - **Admin:** `admin@campusfix.edu` / `Admin@123`
> - **Staff:** `staff@campusfix.edu` / `Staff@123`

### Step 3: Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run build   # Verifies production build without errors
```

### Step 4: Running the Full Application
- **Terminal 1 (Backend):**
  ```bash
  cd backend
  python manage.py runserver 8000
  ```
- **Terminal 2 (Frontend):**
  ```bash
  cd frontend
  npm run dev
  ```
- Open `http://localhost:5173` in your browser.

---

## 8. Testing & Postman Verification

### Automated Backend Tests
Run the Django unit test suite:
```bash
cd backend
python manage.py test
```
*Output: 10/10 tests passing.*

### Comprehensive End-to-End API Test Script
Run the automated REST API integration script:
```bash
cd backend
python test_api_endpoints.py
```
*Output: 13/13 end-to-end tests passing covering all CRUD operations, validations, and smart features.*

### Postman Collection
Import the collection file located at:
`postman/CampusFix_API_Collection.json`
Configure the collection variable `baseUrl` to `http://127.0.0.1:8000/api`.

---

## 9. College Evaluation Demonstration SOP

During college project evaluation, demonstrate the complete CRUD lifecycle:

### Step 1: Login & Student View (READ)
1. Open `http://localhost:5173`.
2. Click **"Student"** in the 1-Click Evaluation Login banner.
3. Observe the Student Dashboard: statistics cards (Total, Submitted, In Progress, Resolved).
4. Review existing complaints in the table. Use the search bar or category filters to verify reactive filtering.

### Step 2: Create a Complaint & Smart Features (CREATE)
1. Click the large blue **"+ Report a Campus Issue"** button.
2. In the Title input, type: `"Live power line exposed and sparking near lab doorway"`.
3. Notice the **Safety Emergency Banner** automatically appears:
   `⚡ Safety Emergency Detected! Suggesting Critical Priority for rapid response.`
4. Enter location: `"Technology Block C, 3rd Floor, Lab 304"`.
5. Notice the **Duplicate Warning Banner** appears:
   `⚠️ A similar issue was already reported in this location (Status: In Progress).`
6. Fill in the description, select category `"Electrical"`, and click **"Submit Complaint"**.
7. Observe the success toast and confirm the new complaint is saved in the SQLite database and rendered in the list.

### Step 3: View Complaint & Progress Timeline (READ)
1. Click **"View"** on any complaint.
2. Observe the **5-stage Visual Progress Timeline**: `Submitted` → `Under Review` → `Assigned` → `In Progress` → `Resolved`.
3. Inspect student contact details and assigned technician information.

### Step 4: Edit Complaint (UPDATE)
1. On a submitted complaint, click **"Edit"**.
2. Change the title or description (e.g. append `"Updated notes for technician"`).
3. Click **"Save Changes"**.
4. Confirm the update is persisted in the database and updated on the UI.

### Step 5: Switch to Admin & Dispatch Staff (UPDATE)
1. At the top navbar, click **"Admin"** in the demo role switcher.
2. Observe the **Administration Command Center**:
   - Metrics cards: Total, Pending Review, In Progress, Resolved, Critical Emergencies.
   - Category Breakdown distribution bars.
3. In the complaints table, locate the newly submitted ticket.
4. Open the **"Assigned Staff"** dropdown and select a technician (e.g. `David Miller (Electrical Systems)`).
5. Open the ticket detail and change the status to **"In Progress"**, then **"Resolved"**.
6. Observe that `resolved_at` is automatically recorded in the database.

### Step 6: Delete Complaint (DELETE)
1. Click **"Delete"** (Trash icon) on a test complaint.
2. A confirmation modal appears: *"Are you sure you want to permanently delete complaint #ID? This will remove all history and records from the database."*
3. Click **"Permanently Delete"**.
4. Confirm the item is deleted from SQLite and disappears from the UI.

### Step 7: Staff Management (STAFF CRUD)
1. Click the **"Staff Directory"** tab in the Admin dashboard.
2. Click **"+ Add Maintenance Staff"**.
3. Fill in the technician's details and click **"Add Staff"**.
4. Edit the availability from `Available` to `Busy`.
5. Delete the test staff member to demonstrate full staff CRUD.

---

## 10. Academic Report & Test Case Table

- Complete 24-section Academic Project Report: [docs/PROJECT_REPORT.md](file:///c:/Users/Aruny/OneDrive/Desktop/CAMPUSFIXPROJECT/docs/PROJECT_REPORT.md)
- Complete System Test Case Specification Matrix: [docs/TEST_CASES.md](file:///c:/Users/Aruny/OneDrive/Desktop/CAMPUSFIXPROJECT/docs/TEST_CASES.md)
