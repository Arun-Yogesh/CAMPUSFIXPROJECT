from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from users.models import User
from staff.models import MaintenanceStaff
from complaints.models import Complaint


class Command(BaseCommand):
    help = 'Populates the CampusFix database with realistic demo accounts, staff, and complaints.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting CampusFix database seeding...'))

        # 1. Create Admin User
        admin_user, created = User.objects.get_or_create(
            email='admin@campusfix.edu',
            defaults={
                'username': 'admin',
                'name': 'Chief Administrator',
                'role': 'ADMIN',
                'department': 'Campus Facilities & Operations',
                'phone': '+1-555-0100',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('Admin@123')
        admin_user.save()
        self.stdout.write(self.style.SUCCESS(f'Admin user ready: {admin_user.email} (Password: Admin@123)'))

        # 2. Create Student User 1 (Primary Demo Student)
        student1, created = User.objects.get_or_create(
            email='student@campusfix.edu',
            defaults={
                'username': 'student',
                'name': 'Alex Rivera',
                'role': 'STUDENT',
                'department': 'Computer Science & Engineering',
                'phone': '+1-555-0192',
            }
        )
        student1.set_password('Student@123')
        student1.save()
        self.stdout.write(self.style.SUCCESS(f'Student user 1 ready: {student1.email} (Password: Student@123)'))

        # 3. Create Student User 2
        student2, created = User.objects.get_or_create(
            email='emma.watson@campusfix.edu',
            defaults={
                'username': 'emma',
                'name': 'Emma Watson',
                'role': 'STUDENT',
                'department': 'Mechanical Engineering',
                'phone': '+1-555-0183',
            }
        )
        student2.set_password('Student@123')
        student2.save()

        # 4. Create Staff User
        staff_user, created = User.objects.get_or_create(
            email='staff@campusfix.edu',
            defaults={
                'username': 'david_staff',
                'name': 'David Miller',
                'role': 'STAFF',
                'department': 'Electrical & Facilities',
                'phone': '+1-555-0144',
            }
        )
        staff_user.set_password('Staff@123')
        staff_user.save()
        self.stdout.write(self.style.SUCCESS(f'Staff user ready: {staff_user.email} (Password: Staff@123)'))

        # 5. Create Maintenance Staff Profiles
        staff_profiles = [
            {
                'name': 'David Miller',
                'email': 'staff@campusfix.edu',
                'phone': '+1-555-0144',
                'department': 'Electrical Maintenance',
                'specialization': 'Electrical Systems & Wiring',
                'availability': 'Available'
            },
            {
                'name': 'Sarah Jenkins',
                'email': 'sarah.jenkins@campusfix.edu',
                'phone': '+1-555-0177',
                'department': 'HVAC & Climate Control',
                'specialization': 'Air Conditioning & Ventilation',
                'availability': 'Busy'
            },
            {
                'name': 'Robert Chen',
                'email': 'robert.chen@campusfix.edu',
                'phone': '+1-555-0188',
                'department': 'IT Infrastructure',
                'specialization': 'Wi-Fi / Fiber Optic Networks',
                'availability': 'Available'
            },
            {
                'name': 'Michael Vance',
                'email': 'michael.vance@campusfix.edu',
                'phone': '+1-555-0133',
                'department': 'Civil & Plumbing',
                'specialization': 'Plumbing, Water Supply & Drainage',
                'availability': 'Available'
            },
            {
                'name': 'Carlos Gomez',
                'email': 'carlos.gomez@campusfix.edu',
                'phone': '+1-555-0122',
                'department': 'Carpentry & Facilities',
                'specialization': 'Desks, Benches & Acoustic Paneling',
                'availability': 'On Leave'
            },
        ]

        created_staff = {}
        for sp in staff_profiles:
            obj, _ = MaintenanceStaff.objects.update_or_create(
                email=sp['email'],
                defaults=sp
            )
            created_staff[sp['name']] = obj
        self.stdout.write(self.style.SUCCESS(f'Created/Updated {len(created_staff)} maintenance staff profiles.'))

        # 6. Create Seed Complaints
        Complaint.objects.all().delete()

        complaint_samples = [
            {
                'student': student1,
                'complaint_title': 'Exposed live wire sparking in Computer Lab 3',
                'description': 'Near workstation 14, there is an exposed wire sparking when touched. This is extremely dangerous for students using the laboratory.',
                'category': 'Electrical',
                'location': 'Technology Block C, 3rd Floor, Lab 304',
                'priority': 'Critical',
                'status': 'In Progress',
                'assigned_staff': created_staff['David Miller'],
                'days_ago': 2,
            },
            {
                'student': student1,
                'complaint_title': 'Ceiling Projector color distortion and flickering',
                'description': 'The overhead HDMI projector turns magenta and flickers continuously during lectures, making slides unreadable.',
                'category': 'Projector',
                'location': 'Main Academic Block, Lecture Hall 101',
                'priority': 'Medium',
                'status': 'Assigned',
                'assigned_staff': created_staff['Robert Chen'],
                'days_ago': 3,
            },
            {
                'student': student1,
                'complaint_title': 'AC Unit leaking water over study tables',
                'description': 'Split air conditioner unit #2 is leaking condensated water directly onto student desks and carpet tiles.',
                'category': 'Fan/AC',
                'location': 'Central Library, 2nd Floor Reading Room',
                'priority': 'High',
                'status': 'Submitted',
                'assigned_staff': None,
                'days_ago': 1,
            },
            {
                'student': student1,
                'complaint_title': 'Broken bench armrests and wobbly chairs',
                'description': 'Three desks in row 4 have loose armrests and wobbly frames that could collapse when sat on.',
                'category': 'Furniture',
                'location': 'Science Block B, Room 202',
                'priority': 'Low',
                'status': 'Resolved',
                'assigned_staff': created_staff['Carlos Gomez'],
                'days_ago': 7,
                'resolved_days_ago': 1,
            },
            {
                'student': student2,
                'complaint_title': 'Hostel 4 washroom main tap pipe fracture',
                'description': 'The main cold water pipe has a crack and is continuously flooding the 1st floor corridor.',
                'category': 'Plumbing',
                'location': 'Boys Hostel 4, First Floor Restroom',
                'priority': 'Critical',
                'status': 'Under Review',
                'assigned_staff': None,
                'days_ago': 1,
            },
            {
                'student': student2,
                'complaint_title': 'Campus Wi-Fi access point dropping connection',
                'description': 'SSID CampusNet-5G shows connected without internet every 5 minutes in the cafeteria area.',
                'category': 'Wi-Fi/Network',
                'location': 'Student Center Cafeteria, North Wing',
                'priority': 'Medium',
                'status': 'In Progress',
                'assigned_staff': created_staff['Robert Chen'],
                'days_ago': 4,
            },
            {
                'student': student1,
                'complaint_title': 'Dust and debris accumulated behind server racks',
                'description': 'Routine cleaning required behind IoT lab server racks before semester practicals.',
                'category': 'Cleaning',
                'location': 'Innovation Hub, IoT Lab B1',
                'priority': 'Low',
                'status': 'Submitted',
                'assigned_staff': None,
                'days_ago': 1,
            }
        ]

        now = timezone.now()
        for sample in complaint_samples:
            days = sample.pop('days_ago', 1)
            res_days = sample.pop('resolved_days_ago', None)
            created_time = now - timedelta(days=days)
            
            c = Complaint.objects.create(
                **sample
            )
            # Update created_at directly
            Complaint.objects.filter(id=c.id).update(created_at=created_time)
            if res_days:
                Complaint.objects.filter(id=c.id).update(resolved_at=now - timedelta(days=res_days))

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(complaint_samples)} complaints!'))
        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))
