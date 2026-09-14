# CampusFix - System Test Case Specification & Execution Table

This document provides the test cases covering all CRUD operations, role-based authentication, validations, and smart features for **CampusFix – Smart Campus Maintenance Complaint Management System**.

---

## Test Execution Matrix

| Test ID | Test Category | Test Case Description | Input / Payload | Expected Result | Execution Status |
|---|---|---|---|---|:---:|
| **TC-AUTH-01** | Authentication | Student Login with valid credentials | Email: `student@campusfix.edu`<br>Password: `Student@123` | Returns HTTP 200 OK, Auth Token, and Student Profile object. User redirected to Student Dashboard. | **PASSED** |
| **TC-AUTH-02** | Authentication | Admin Login with valid credentials | Email: `admin@campusfix.edu`<br>Password: `Admin@123` | Returns HTTP 200 OK, Auth Token, and Admin Profile object. User redirected to Admin Command Center. | **PASSED** |
| **TC-AUTH-03** | Authentication | Login with invalid password | Email: `student@campusfix.edu`<br>Password: `WrongPass!` | Returns HTTP 400 Bad Request with error: "Invalid credentials." | **PASSED** |
| **TC-AUTH-04** | Authentication | Register new Student account | Name: "Rohan Sharma"<br>Email: `rohan@campusfix.edu`<br>Password: `Rohan@123`<br>Role: `STUDENT` | Returns HTTP 201 Created, generates Auth Token, saves record into database. | **PASSED** |
| **TC-AUTH-05** | Authentication | Register duplicate email | Existing email `student@campusfix.edu` | Returns HTTP 400 Bad Request: "An account with this email address already exists." | **PASSED** |
| **TC-CRUD-01** | Create Complaint | Student submits valid complaint | Title: "Ceiling fan vibrating"<br>Category: "Fan/AC"<br>Location: "Room 302"<br>Priority: "Medium"<br>Description: "Fan vibrating dangerously" | Returns HTTP 201 Created, assigns status="Submitted", saves into SQLite DB, renders on dashboard. | **PASSED** |
| **TC-CRUD-02** | Create Complaint (Validation) | Submit complaint with empty title / description | Title: ""<br>Description: "short" | Returns HTTP 400 Bad Request with validation errors. Database insertion prevented. | **PASSED** |
| **TC-CRUD-03** | Read Complaints | Student views "My Complaints" list | Filter: Category="Electrical" | Returns HTTP 200 OK with list of complaints owned by the student matching category. | **PASSED** |
| **TC-CRUD-04** | Read Complaint Details | View single complaint by ID with visual timeline | ID: `1` | Returns HTTP 200 OK with full ticket details, student contact, assigned staff, and timeline stage. | **PASSED** |
| **TC-CRUD-05** | Update Complaint | Student edits own submitted complaint | Title: "Updated fan vibration in Room 302" | Returns HTTP 200 OK, database updated, UI reflects changes immediately. | **PASSED** |
| **TC-CRUD-06** | Update Complaint (Restricted) | Student attempts to edit "In Progress" complaint | Status: "In Progress"<br>New Title: "Cannot edit" | Returns HTTP 400 Bad Request: "This complaint cannot be modified because its status is already 'In Progress'." | **PASSED** |
| **TC-CRUD-07** | Update Complaint (Admin) | Admin assigns maintenance staff member | Complaint ID: `1`<br>Staff ID: `2` (Sarah Jenkins) | Returns HTTP 200 OK, auto-transitions status to "Assigned", links staff ForeignKey. | **PASSED** |
| **TC-CRUD-08** | Update Status (Workflow) | Admin/Staff marks complaint as "Resolved" | Complaint ID: `1`<br>Status: "Resolved" | Returns HTTP 200 OK, sets status="Resolved", auto-populates `resolved_at` timestamp in DB. | **PASSED** |
| **TC-CRUD-09** | Delete Complaint | Student cancels/deletes own submitted ticket | Complaint ID: `1` | Modal confirmation appears. After confirmation, HTTP 200 OK, permanently removed from DB. | **PASSED** |
| **TC-CRUD-10** | Delete Complaint (Negative) | Attempt to delete with non-existent ID | Complaint ID: `999999` | Returns HTTP 404 Not Found. Handled gracefully with user-friendly error message. | **PASSED** |
| **TC-SMART-01** | Smart Features | Heuristic emergency priority detection | Title: "Live exposed wire sparking in corridor"<br>Description: "Fire hazard emergency" | Client & server heuristic triggers: Suggests "Critical" priority with warning banner. | **PASSED** |
| **TC-SMART-02** | Smart Features | Duplicate unresolved complaint warning | Category: "Electrical"<br>Location: "Lab 304" | Displays alert: "A similar issue was already reported in this location (Status: In Progress)." | **PASSED** |
| **TC-SMART-03** | Analytics | Dashboard analytics endpoint | Request GET `/api/complaints/analytics/` | Returns HTTP 200 OK with total count, pending, resolved, category breakdown, and priority metrics. | **PASSED** |
| **TC-STAFF-01** | Staff CRUD | Admin registers new maintenance technician | Name: "Arthur Pendelton"<br>Specialization: "Roofing & Concrete"<br>Availability: "Available" | Returns HTTP 201 Created, adds record to database, visible in Staff Directory. | **PASSED** |
| **TC-STAFF-02** | Staff CRUD | Admin updates staff availability | Staff ID: `1`<br>Availability: "Busy" | Returns HTTP 200 OK, updates record in database. | **PASSED** |
| **TC-STAFF-03** | Staff CRUD | Admin deletes staff member | Staff ID: `6` | Returns HTTP 204 No Content, permanently deleted from database. | **PASSED** |
| **TC-RESP-01** | Responsiveness | Mobile viewport test (375px width) | Viewport resized to mobile | Tables horizontally scroll or stack cleanly, buttons remain touch-friendly, navigation adjusts. | **PASSED** |
