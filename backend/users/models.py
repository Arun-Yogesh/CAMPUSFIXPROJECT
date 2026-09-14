from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('STUDENT', 'Student'),
        ('ADMIN', 'Admin'),
        ('STAFF', 'Staff'),
    ]

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    department = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.name:
            full = f"{self.first_name} {self.last_name}".strip()
            self.name = full if full else self.username
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.role}"
