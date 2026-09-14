from django.db import models


class MaintenanceStaff(models.Model):
    AVAILABILITY_CHOICES = [
        ('Available', 'Available'),
        ('Busy', 'Busy'),
        ('On Leave', 'On Leave'),
    ]

    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    department = models.CharField(max_length=100)
    specialization = models.CharField(
        max_length=100,
        help_text="e.g. Electrical Systems, Plumbing, HVAC, Wi-Fi/Network, Carpentry"
    )
    availability = models.CharField(
        max_length=20,
        choices=AVAILABILITY_CHOICES,
        default='Available'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Maintenance Staff'
        verbose_name_plural = 'Maintenance Staff'

    def __str__(self):
        return f"{self.name} - {self.specialization} ({self.availability})"
