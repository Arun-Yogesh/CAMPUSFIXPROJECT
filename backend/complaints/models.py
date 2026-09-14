from django.db import models
from django.conf import settings
from django.utils import timezone
from staff.models import MaintenanceStaff


class Complaint(models.Model):
    CATEGORY_CHOICES = [
        ('Electrical', 'Electrical'),
        ('Furniture', 'Furniture'),
        ('Classroom', 'Classroom'),
        ('Wi-Fi/Network', 'Wi-Fi/Network'),
        ('Plumbing', 'Plumbing'),
        ('Cleaning', 'Cleaning'),
        ('Projector', 'Projector'),
        ('Fan/AC', 'Fan/AC'),
        ('Other', 'Other'),
    ]

    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('Submitted', 'Submitted'),
        ('Under Review', 'Under Review'),
        ('Assigned', 'Assigned'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Rejected', 'Rejected'),
    ]

    complaint_title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    location = models.CharField(max_length=255)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Submitted')

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='complaints'
    )
    assigned_staff = models.ForeignKey(
        MaintenanceStaff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_complaints'
    )

    image = models.ImageField(upload_to='complaints/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Complaint'
        verbose_name_plural = 'Complaints'

    def save(self, *args, **kwargs):
        # Auto-set resolved_at when status changes to Resolved
        if self.status == 'Resolved' and not self.resolved_at:
            self.resolved_at = timezone.now()
        elif self.status != 'Resolved' and self.resolved_at:
            self.resolved_at = None

        # Auto-update status to Assigned if staff is newly assigned and status is Submitted
        if self.assigned_staff and self.status == 'Submitted':
            self.status = 'Assigned'

        super().save(*args, **kwargs)

    @property
    def is_editable_by_student(self):
        """Students can edit or cancel only while Submitted or Under Review."""
        return self.status in ['Submitted', 'Under Review']

    def __str__(self):
        return f"[{self.category}] {self.complaint_title} - {self.status}"
