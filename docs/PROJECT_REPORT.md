# CAMPUSFIX: SMART CAMPUS MAINTENANCE COMPLAINT MANAGEMENT SYSTEM
## Academic Project Report & Technical Specification

---

### 1. Title
**CampusFix – Smart Campus Maintenance Complaint Management System**

---

### 2. Abstract
Higher educational institutions house complex physical and digital infrastructure across academic blocks, lecture halls, research laboratories, libraries, and student hostels. Delays in addressing infrastructure defects—such as faulty electrical fixtures, broken furniture, broken projectors, defective air conditioners, plumbing leaks, and Wi-Fi outages—directly impact student safety and the academic environment. **CampusFix** is a full-stack, enterprise-grade maintenance complaint management platform. It offers a centralized web application facilitating end-to-end complaint lifecycle handling. Students report maintenance issues with heuristic safety hazard detection and duplicate warning checks; administrators manage, prioritize, dispatch, and track complaints; and maintenance technicians execute work orders and resolve issues with complete database persistence.

---

### 3. Problem Statement
In conventional college campus setups, maintenance issues are predominantly reported through informal, fragmented channels such as verbal complaints to hostel wardens, paper logbooks, or unofficial messaging groups. This unstructured approach introduces significant bottlenecks:
1. **Lack of Centralized Tracking:** No verifiable log of reported complaints or their resolution status.
2. **Delayed Response Times:** Urgent emergencies (such as sparking wires or water pipe fractures) fail to be escalated quickly.
3. **Redundant Duplicate Complaints:** Multiple students frequently report identical faults in the same lecture hall or restroom, cluttering maintenance queues.
4. **Poor Accountability:** Inability to assign responsibility to designated technicians or measure average resolution times.
5. **No Verification of Resolution:** Complaints are marked resolved without transparent student visibility.

---

### 4. Objectives
The primary objectives of CampusFix include:
- **Centralized Platform:** Eliminate paper logbooks by establishing a digital portal accessible to all campus students, staff, and administrators.
- **Role-Based Workflows:** Provide dedicated interfaces for Students, Administrators, and Maintenance Staff with tailored permissions.
- **Strict Database Persistence:** Implement robust Create, Read, Update, and Delete (CRUD) operations backed by relational integrity.
- **Smart Heuristics:**
  - *Heuristic Priority Detection:* Automatically scan titles and descriptions for hazard keywords (`spark`, `dangerous`, `fire`, `exposed wire`, `emergency`) to suggest High/Critical priority.
  - *Duplicate Warning Check:* Detect unresolved complaints in identical locations and categories, alerting students prior to submission.
- **Transparent Progress Tracking:** Provide an intuitive 5-stage visual progress timeline from *Submitted* to *Resolved*.
- **Administrative Dispatch & Staff Management:** Enable facility administrators to manage technicians, assign work orders, and review analytics.

---

### 5. Existing System
The existing system relies on:
- Manual handwritten complaint registers at security desks or hostel offices.
- Informal WhatsApp or Telegram messages to department lab assistants.
- Verbal complaints during faculty advisory meetings.

**Limitations of Existing System:**
- High probability of lost or forgotten tickets.
- Zero analytics regarding recurring hardware defects.
- Lack of role-based authorization.
- Inability for students to verify if a complaint is actively being addressed.

---

### 6. Proposed System
CampusFix introduces a structured, automated, and secure full-stack software architecture:
- **Client-Side:** Modern React SPA with responsive glassmorphic cards, accessible status badges, real-time validation, and interactive modals.
- **Server-Side:** Python Django REST Framework exposing secure, token-authenticated RESTful endpoints.
- **Database Layer:** Relational SQLite database with clean schema ready for seamless PostgreSQL/MySQL enterprise migration.
- **Workflow Automation:** Automatic timestamping (`resolved_at`), automatic status progression upon staff assignment, and role-based operational permissions.

---

### 7. Scope
- **Applicability:** Engineering colleges, university campuses, residential student hostels, and multi-facility academic centers.
- **Users:** Undergraduate/postgraduate students, campus facility managers, department heads, and maintenance technicians.
- **Coverage:** Electrical, Furniture, Classroom, Wi-Fi/Network, Plumbing, Cleaning, Projector, and HVAC/Fan facilities.

---

### 8. Technology Stack
- **Frontend:** React (v19+), Vite build tool, Lucide Icons, Modern Vanilla CSS Design System with CSS Custom Properties, Glassmorphism, and responsive flexbox/grid.
- **Backend:** Python (v3.12+), Django (v6.1+), Django REST Framework (DRF v3.18+), django-cors-headers.
- **Database:** SQLite 3 (relational schema configured with foreign keys, cascading rules, and indexing).
- **Security & Auth:** Django PBKDF2 password hashing, Token Authentication, Role-based BasePermissions.
- **API Testing:** Postman Collection v2.1 format + Python automated test suite.

---

### 9. System Architecture
```
[React Frontend Client] 
        │  (HTTP / JSON REST APIs with Token Auth)
        ▼
[Django REST Framework Backend]
   ├── Auth & Role Permission Middleware
   ├── Serializers & Field Validation
   ├── Heuristic Smart Logic (Hazard Detector & Duplicate Checker)
   └── ViewSets & Business Logic
        │  (Django ORM)
        ▼
[Relational Database (SQLite/PostgreSQL)]
   ├── users_user
   ├── staff_maintenancestaff
   └── complaints_complaint
```

---

### 10. Modules
1. **Authentication & Identity Module:**
   - User registration with role designation (`STUDENT`, `ADMIN`, `STAFF`).
   - Secure token-based session management and 1-click evaluation switcher.
2. **Student Complaint Module:**
   - Ticket submission form with hazard detection heuristic and duplicate warnings.
   - "My Complaints" list with search, category filtering, and status badges.
   - Ticket detail viewer with visual 5-stage progress timeline.
   - Edit and cancel/delete functionality for editable tickets.
3. **Administration Dispatch Module:**
   - Central complaint queue with multi-filter controls (Category, Status, Priority).
   - Maintenance staff assignment dropdown and inline status update.
   - Interactive analytics dashboard displaying volume by category, status, and urgency.
4. **Maintenance Staff Management Module:**
   - Staff directory CRUD (Add technician, edit specialization/availability, delete technician).
   - Workload tracking with active complaint counters.
5. **Technician Workbench Module:**
   - Filtered view showing tickets assigned to the logged-in technician.
   - Workflow buttons to transition tickets from "In Progress" to "Resolved".

---

### 11. Database Design & Data Dictionary

#### Table: `users_user`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | BigAutoField | Primary Key | Unique user identifier |
| `email` | EmailField | Unique, NOT NULL | User login email |
| `name` | CharField(150) | NOT NULL | Full name of the user |
| `role` | CharField(20) | Choices: `STUDENT`, `ADMIN`, `STAFF` | User authorization role |
| `department` | CharField(100) | Blank allowed | Academic or administrative department |
| `phone` | CharField(20) | Blank allowed | Contact telephone number |
| `created_at` | DateTimeField | Auto add | Account creation timestamp |

#### Table: `staff_maintenancestaff`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | BigAutoField | Primary Key | Unique staff identifier |
| `name` | CharField(150) | NOT NULL | Technician full name |
| `email` | EmailField | Unique, NOT NULL | Staff email address |
| `phone` | CharField(20) | NOT NULL | Staff phone number |
| `department` | CharField(100) | NOT NULL | Maintenance department |
| `specialization`| CharField(100) | NOT NULL | Technical specialty (e.g. Electrical, HVAC) |
| `availability` | CharField(20) | Choices: `Available`, `Busy`, `On Leave` | Workload status |
| `created_at` | DateTimeField | Auto add | Registration timestamp |

#### Table: `complaints_complaint`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | BigAutoField | Primary Key | Unique complaint ticket number |
| `complaint_title`| CharField(200) | NOT NULL | Concise description of the issue |
| `description` | TextField | NOT NULL | Detailed problem description |
| `category` | CharField(50) | Choices (9 categories) | Issue classification |
| `location` | CharField(255) | NOT NULL | Building, floor, room number |
| `priority` | CharField(20) | Choices: `Low`, `Medium`, `High`, `Critical` | Urgency level |
| `status` | CharField(30) | Choices (6 statuses) | Lifecycle status |
| `student_id` | BigInteger | Foreign Key -> `users_user.id` | Submitting student |
| `assigned_staff_id`| BigInteger | Foreign Key -> `staff_maintenancestaff.id` | Assigned technician |
| `image` | ImageField | Nullable | Uploaded photo attachment |
| `created_at` | DateTimeField | Auto add | Timestamp of submission |
| `updated_at` | DateTimeField | Auto update | Timestamp of last modification |
| `resolved_at` | DateTimeField | Nullable | Timestamp when marked resolved |

---

### 12. ER Diagram Description
- **User to Complaint:** One-to-Many relationship (`1:N`). One student user can submit multiple maintenance complaints. If a user is deleted, their tickets cascade accordingly.
- **MaintenanceStaff to Complaint:** One-to-Many relationship (`1:N`). One staff member can be assigned to multiple complaints concurrently. When a staff record is deleted, assigned complaints set staff to `NULL` (preserving ticket history).

---

### 13. Frontend Design
- Designed using custom CSS tokens, avoiding generic layouts.
- Modern glassmorphic cards (`backdrop-filter: blur(14px)`), smooth rounded radii (`12px`-`16px`), and high-contrast accessible typography (Google Outfit for headings, Google Inter for body).
- Status Badges: Color-coded with distinct icons (e.g., Amber for `Submitted`, Sky for `Under Review`, Purple for `In Progress`, Emerald for `Resolved`).
- Interactive Visual Timeline: Visual step tracker showing current stage with illuminated glow and completed steps with green checks.
- Responsive layout: Adapts from widescreen 4K displays down to 375px mobile screens with scrollable tables and collapsible touch targets.

---

### 14. Backend Design
- Modular Django architecture partitioned into three dedicated apps: `users`, `staff`, and `complaints`.
- RESTful ViewSets with custom decorators for sub-actions (`analytics`, `check_duplicate`, `detect_priority`, `assign_staff`, `update_status`).
- Automatic business logic in model `save()` methods (e.g. auto-populating `resolved_at` when status transitions to `Resolved`).

---

### 15. REST API Design
| HTTP Verb | Endpoint | Purpose | Access Control |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Register new user | Public |
| `POST` | `/api/auth/login/` | Authenticate user & get token | Public |
| `GET` | `/api/auth/me/` | Fetch current user profile | Authenticated |
| `GET` | `/api/complaints/` | List complaints (with filters) | Authenticated (Role-filtered) |
| `POST` | `/api/complaints/` | Submit new complaint | Student / Admin |
| `GET` | `/api/complaints/{id}/` | Get single complaint details | Complaint Owner / Admin |
| `PATCH` | `/api/complaints/{id}/` | Edit complaint fields | Owner (before In Progress) / Admin |
| `DELETE` | `/api/complaints/{id}/` | Delete complaint ticket | Owner (before In Progress) / Admin |
| `PATCH` | `/api/complaints/{id}/assign_staff/` | Assign staff member | Admin |
| `PATCH` | `/api/complaints/{id}/update_status/` | Advance lifecycle status | Admin / Staff |
| `GET` | `/api/complaints/analytics/` | Dashboard statistics & distribution | Authenticated |
| `GET` | `/api/complaints/check_duplicate/` | Duplicate detector API | Authenticated |
| `POST` | `/api/complaints/detect_priority/` | Emergency hazard keyword check | Authenticated |
| `GET` | `/api/staff/` | List all staff members | Authenticated |
| `POST` | `/api/staff/` | Register new staff member | Admin |
| `PATCH` | `/api/staff/{id}/` | Update staff availability/specialty | Admin |
| `DELETE` | `/api/staff/{id}/` | Remove staff technician | Admin |

---

### 16. CRUD Implementation Verification
- **Create:** Verified via UI modal and API. Student submits title, category, location, priority, description, and optional photo. Data is stored in SQLite DB and immediately rendered.
- **Read:** Verified. Students view their submitted tickets with visual timelines; Admins view campus-wide queues with search and multi-filtering.
- **Update:** Verified. Students can edit tickets while in `Submitted` or `Under Review`. Admins can modify details, assign staff, and update statuses.
- **Delete:** Verified. Confirmation modal prompts user. Upon confirmation, record is deleted from SQLite via HTTP DELETE.

---

### 17. Validation Rules
- **Complaint Title:** Cannot be blank; minimum 4 characters.
- **Description:** Cannot be blank; minimum 10 characters.
- **Category & Location:** Mandatory fields.
- **Email:** Must conform to RFC standard; duplicates rejected with HTTP 400.
- **Phone:** Validated against numeric length constraints.
- **Lifecycle Integrity:** Students cannot modify tickets that have progressed to "In Progress" or "Resolved".

---

### 18. Authentication and Authorization
- **Student Role:** Can create complaints, view own tickets, edit/cancel permitted tickets.
- **Administrator Role:** Global view, full CRUD on complaints, staff assignment, staff directory CRUD, full analytics access.
- **Staff Role:** View assigned complaints, execute work orders, update ticket statuses.

---

### 19. Testing Methodology
- **Automated Unit Testing:** Django test suite executing 10 automated test cases (`python manage.py test`).
- **REST API Integration Testing:** Standalone test runner (`python test_api_endpoints.py`) executing 13 end-to-end API validations.
- **Postman API Testing:** Postman collection covering happy paths, negative tests, and edge cases.
- **Manual End-to-End Verification:** Browser evaluation verifying UI reactivity, modal popups, and layout responsiveness.

---

### 20. Test Cases Summary
All 13 integration test cases and 10 unit test cases achieved a **100% PASS rate**. Full test case details are documented in [TEST_CASES.md](file:///c:/Users/Aruny/OneDrive/Desktop/CAMPUSFIXPROJECT/docs/TEST_CASES.md).

---

### 21. Results
- Verified seamless communication across:
  `React Frontend` → `REST API Client` → `Django DRF Views` → `SQLite Database`.
- Real-time safety hazard detection correctly flags emergency keywords.
- Zero data discrepancies during Create, Read, Update, and Delete cycles.

---

### 22. Challenges and Solutions
1. **Challenge:** Windows console `cp1252` encoding threw `UnicodeEncodeError` when printing unicode checkmarks during automated test execution.
   - **Solution:** Reconfigured stdout encoding to UTF-8 and utilized ASCII-safe `[PASS]` tags in test scripts.
2. **Challenge:** Restricting student edits once technician dispatch has begun.
   - **Solution:** Implemented `is_editable_by_student` property on the `Complaint` model and enforced validation in `ComplaintSerializer.validate()`.

---

### 23. Future Enhancements
- **Push & SMS Notifications:** Integration with Twilio/Firebase to send SMS alerts to students when tickets are resolved.
- **Automated AI Image Analysis:** Utilize computer vision models to inspect uploaded damage photos and verify defect severity.
- **Geographic Campus Mapping:** Integrate campus GIS map to visually pinpoint complaint hotspots.

---

### 24. Conclusion
The **CampusFix** project successfully achieves all problem statement goals by providing a reliable, full-stack, and production-quality maintenance complaint management system. By combining clean Django REST Framework backend architecture with a modern, responsive React interface, CampusFix replaces slow, error-prone manual complaint procedures with automated, transparent, and auditable campus maintenance operations.
