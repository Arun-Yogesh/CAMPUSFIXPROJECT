from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from staff.models import MaintenanceStaff
from complaints.models import Complaint
from complaints.utils import detect_priority_suggestion, find_potential_duplicates


class CampusFixBackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin_user = User.objects.create_user(
            username='test_admin',
            email='admin@test.edu',
            password='Password@123',
            name='Test Admin',
            role='ADMIN',
            is_staff=True
        )

        # Student user 1
        self.student1 = User.objects.create_user(
            username='test_student1',
            email='student1@test.edu',
            password='Password@123',
            name='Student One',
            role='STUDENT',
            department='Computer Science'
        )

        # Student user 2
        self.student2 = User.objects.create_user(
            username='test_student2',
            email='student2@test.edu',
            password='Password@123',
            name='Student Two',
            role='STUDENT',
            department='Civil Engineering'
        )

        # Maintenance Staff
        self.staff_member = MaintenanceStaff.objects.create(
            name='Technician John',
            email='john@maintenance.edu',
            phone='+1-555-0999',
            department='Electrical',
            specialization='Wiring & Circuit Breakers',
            availability='Available'
        )

        # Initial test complaint for Student 1
        self.complaint1 = Complaint.objects.create(
            student=self.student1,
            complaint_title='Ceiling Fan making noise in Lab 2',
            description='The fan is vibrating loudly and wobbling dangerously.',
            category='Fan/AC',
            location='Engineering Block 1, Room 102',
            priority='Medium',
            status='Submitted'
        )

    def test_user_authentication_login(self):
        """Test login endpoint returns token and user details."""
        url = reverse('login')
        response = self.client.post(url, {
            'email': 'student1@test.edu',
            'password': 'Password@123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['email'], 'student1@test.edu')

    def test_user_registration(self):
        """Test registration creates new user with token."""
        url = reverse('register')
        data = {
            'name': 'New Student',
            'email': 'newstudent@test.edu',
            'password': 'Password@123',
            'confirm_password': 'Password@123',
            'role': 'STUDENT',
            'department': 'Electronics',
            'phone': '+1-555-0888'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newstudent@test.edu').exists())

    def test_student_create_complaint_success(self):
        """Test student submitting a valid complaint."""
        self.client.force_authenticate(user=self.student1)
        url = '/api/complaints/'
        payload = {
            'complaint_title': 'Projector bulb broken in Hall B',
            'description': 'The projector bulb has burnt out and needs immediate replacement for seminars.',
            'category': 'Projector',
            'location': 'Seminar Hall B, 1st Floor',
            'priority': 'High'
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['complaint_title'], payload['complaint_title'])
        self.assertEqual(response.data['student_details']['email'], self.student1.email)

    def test_student_cannot_edit_in_progress_complaint(self):
        """Student cannot modify a complaint once In Progress."""
        self.complaint1.status = 'In Progress'
        self.complaint1.save()

        self.client.force_authenticate(user=self.student1)
        url = f'/api/complaints/{self.complaint1.id}/'
        response = self.client.patch(url, {'complaint_title': 'Updated Title'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_can_edit_submitted_complaint(self):
        """Student can modify their own complaint while in Submitted status."""
        self.client.force_authenticate(user=self.student1)
        url = f'/api/complaints/{self.complaint1.id}/'
        response = self.client.patch(url, {'complaint_title': 'Updated Fan Vibration Issue'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.complaint1.refresh_from_db()
        self.assertEqual(self.complaint1.complaint_title, 'Updated Fan Vibration Issue')

    def test_student_delete_own_complaint(self):
        """Student can delete/cancel their own complaint while Submitted."""
        self.client.force_authenticate(user=self.student1)
        url = f'/api/complaints/{self.complaint1.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Complaint.objects.filter(id=self.complaint1.id).exists())

    def test_admin_assign_staff_and_update_status(self):
        """Admin can assign staff and change status to Resolved."""
        self.client.force_authenticate(user=self.admin_user)
        # 1. Assign staff
        assign_url = f'/api/complaints/{self.complaint1.id}/assign_staff/'
        res_assign = self.client.patch(assign_url, {'staff_id': self.staff_member.id})
        self.assertEqual(res_assign.status_code, status.HTTP_200_OK)
        self.complaint1.refresh_from_db()
        self.assertEqual(self.complaint1.assigned_staff, self.staff_member)
        self.assertEqual(self.complaint1.status, 'Assigned')

        # 2. Update status to Resolved
        status_url = f'/api/complaints/{self.complaint1.id}/update_status/'
        res_status = self.client.patch(status_url, {'status': 'Resolved'})
        self.assertEqual(res_status.status_code, status.HTTP_200_OK)
        self.complaint1.refresh_from_db()
        self.assertEqual(self.complaint1.status, 'Resolved')
        self.assertIsNotNone(self.complaint1.resolved_at)

    def test_smart_priority_detection(self):
        """Test heuristic emergency priority suggestion."""
        result = detect_priority_suggestion(
            title='Exposed wire sparking',
            description='There is fire smoke and electric shock hazard'
        )
        self.assertEqual(result['suggested_priority'], 'Critical')
        self.assertTrue(result['is_emergency'])

    def test_duplicate_complaint_detection(self):
        """Test detection of existing complaints in the same location and category."""
        duplicates = find_potential_duplicates(
            category='Fan/AC',
            location='Engineering Block 1, Room 102',
            title='Ceiling Fan noise'
        )
        self.assertTrue(len(duplicates) > 0)
        self.assertEqual(duplicates[0]['id'], self.complaint1.id)

    def test_dashboard_analytics_endpoint(self):
        """Test analytics endpoint returns counts."""
        self.client.force_authenticate(user=self.admin_user)
        url = '/api/complaints/analytics/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total', response.data)
        self.assertIn('by_category', response.data)
        self.assertIn('by_status', response.data)
