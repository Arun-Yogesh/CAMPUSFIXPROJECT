"""
CampusFix End-to-End API Verification Script
Tests:
- Authentication (Login student, admin)
- CRUD Complaints (Create, Read, Update, Delete)
- CRUD Staff (Create, Read, Update, Delete)
- Smart Priority Detection Heuristic
- Duplicate Detection Check
- Analytics Dashboard
"""

import os
import sys
import json
import django

# Setup django environment for standalone testing
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campusfix_core.settings')
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
django.setup()

from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from complaints.models import Complaint
from staff.models import MaintenanceStaff

def run_tests():
    print("=" * 70)
    print(" CAMPUSFIX REST API TEST SUITE ")
    print("=" * 70)

    client = APIClient()

    # 1. Login as Student
    print("\n[TEST 1] Student Authentication...")
    res = client.post('/api/auth/login/', {
        'email': 'student@campusfix.edu',
        'password': 'Student@123'
    })
    assert res.status_code == 200, f"Login failed: {res.data}"
    student_token = res.data['token']
    print(f"  [PASS] Student logged in successfully. Token: {student_token[:10]}...")

    # 2. Login as Admin
    print("\n[TEST 2] Admin Authentication...")
    res = client.post('/api/auth/login/', {
        'email': 'admin@campusfix.edu',
        'password': 'Admin@123'
    })
    assert res.status_code == 200, f"Admin login failed: {res.data}"
    admin_token = res.data['token']
    print(f"  ✓ Admin logged in successfully. Token: {admin_token[:10]}...")

    # 3. Student Create Complaint
    print("\n[TEST 3] CREATE Complaint (Student)...")
    client.credentials(HTTP_AUTHORIZATION=f'Token {student_token}')
    payload = {
        'complaint_title': 'Flickering fluorescent lights in Seminar Room 102',
        'description': 'Two light tubes are rapidly flickering causing eye strain during presentations.',
        'category': 'Electrical',
        'location': 'Management Block, 1st Floor, Seminar Room 102',
        'priority': 'Medium'
    }
    res = client.post('/api/complaints/', payload)
    assert res.status_code == 201, f"Failed to create complaint: {res.data}"
    complaint_id = res.data['id']
    print(f"  ✓ Created complaint #{complaint_id}: '{res.data['complaint_title']}'")

    # 4. Read Complaints List & Filtering
    print("\n[TEST 4] READ Complaints List with Filter...")
    res = client.get('/api/complaints/?category=Electrical')
    assert res.status_code == 200
    assert any(c['id'] == complaint_id for c in res.data)
    print(f"  ✓ Filtered complaints returned {len(res.data)} matching items.")

    # 5. Read Single Complaint
    print(f"\n[TEST 5] READ Single Complaint #{complaint_id}...")
    res = client.get(f'/api/complaints/{complaint_id}/')
    assert res.status_code == 200
    assert res.data['id'] == complaint_id
    print(f"  ✓ Fetched complaint details. Status: {res.data['status']}, Priority: {res.data['priority']}")

    # 6. Update Complaint
    print(f"\n[TEST 6] UPDATE Complaint #{complaint_id}...")
    res = client.patch(f'/api/complaints/{complaint_id}/', {
        'complaint_title': 'Urgent: Flickering lights in Seminar Room 102',
        'priority': 'High'
    })
    assert res.status_code == 200, f"Update failed: {res.data}"
    assert res.data['priority'] == 'High'
    print(f"  ✓ Updated complaint priority to {res.data['priority']}")

    # 7. Admin Assign Staff & Update Status
    print(f"\n[TEST 7] Admin Assign Staff & Status Transition...")
    client.credentials(HTTP_AUTHORIZATION=f'Token {admin_token}')
    staff = MaintenanceStaff.objects.first()
    res = client.patch(f'/api/complaints/{complaint_id}/assign_staff/', {'staff_id': staff.id})
    assert res.status_code == 200
    print(f"  ✓ Assigned staff: {staff.name} to complaint #{complaint_id}")

    res = client.patch(f'/api/complaints/{complaint_id}/update_status/', {'status': 'Resolved'})
    assert res.status_code == 200
    assert res.data['complaint']['status'] == 'Resolved'
    print(f"  ✓ Status updated to 'Resolved'. Auto-populated resolved_at: {res.data['complaint']['resolved_at']}")

    # 8. Smart Priority Detection Heuristic
    print("\n[TEST 8] Smart Priority Detection Heuristic...")
    res = client.post('/api/complaints/detect_priority/', {
        'title': 'Emergency fire hazard and exposed wire sparking',
        'description': 'Smoke coming out near distribution box'
    })
    assert res.status_code == 200
    assert res.data['suggested_priority'] == 'Critical'
    assert res.data['is_emergency'] is True
    print(f"  ✓ Smart priority suggestion verified: {res.data['suggested_priority']} (Emergency: {res.data['is_emergency']})")

    # 9. Smart Duplicate Detection Check
    print("\n[TEST 9] Smart Duplicate Complaint Check...")
    res = client.get('/api/complaints/check_duplicate/', {
        'category': 'Electrical',
        'location': 'Technology Block C, 3rd Floor, Lab 304',
        'title': 'sparking wire'
    })
    assert res.status_code == 200
    print(f"  ✓ Duplicate check response: found_duplicates = {res.data['found_duplicates']} (Count: {res.data['count']})")

    # 10. Dashboard Analytics
    print("\n[TEST 10] Dashboard Analytics...")
    res = client.get('/api/complaints/analytics/')
    assert res.status_code == 200
    assert 'total' in res.data
    assert 'by_category' in res.data
    print(f"  ✓ Analytics summary verified: Total = {res.data['total']}, Resolved = {res.data['resolved']}")

    # 11. Staff Management CRUD (Admin)
    print("\n[TEST 11] Maintenance Staff CRUD...")
    staff_payload = {
        'name': 'Nathan Drake',
        'email': 'nathan.drake@campusfix.edu',
        'phone': '+1-555-0777',
        'department': 'Mechanical & Lift Maintenance',
        'specialization': 'Elevators & Escalators',
        'availability': 'Available'
    }
    res = client.post('/api/staff/', staff_payload)
    assert res.status_code == 201, f"Failed to create staff: {res.data}"
    new_staff_id = res.data['id']
    print(f"  ✓ Created staff #{new_staff_id}: {res.data['name']}")

    # Update staff
    res = client.patch(f'/api/staff/{new_staff_id}/', {'availability': 'Busy'})
    assert res.status_code == 200
    assert res.data['availability'] == 'Busy'
    print(f"  ✓ Updated staff #{new_staff_id} availability to 'Busy'")

    # Delete staff
    res = client.delete(f'/api/staff/{new_staff_id}/')
    assert res.status_code == 204
    print(f"  ✓ Deleted staff member #{new_staff_id}")

    # 12. Delete Complaint
    print(f"\n[TEST 12] DELETE Complaint #{complaint_id}...")
    res = client.delete(f'/api/complaints/{complaint_id}/')
    assert res.status_code == 200
    print(f"  ✓ Complaint #{complaint_id} deleted successfully.")

    # 13. Negative Validation Tests
    print("\n[TEST 13] Negative Validation Tests...")
    # Missing required fields
    res = client.post('/api/complaints/', {'category': 'Plumbing'})
    assert res.status_code == 400
    print("  ✓ Correctly rejected missing required fields (HTTP 400).")

    # Invalid ID deletion
    res = client.delete('/api/complaints/999999/')
    assert res.status_code == 404
    print("  ✓ Correctly returned 404 for non-existent complaint ID.")

    print("\n" + "=" * 70)
    print(" ALL 13 END-TO-END REST API TESTS PASSED SUCCESSFULLY! ")
    print("=" * 70)

if __name__ == '__main__':
    run_tests()
