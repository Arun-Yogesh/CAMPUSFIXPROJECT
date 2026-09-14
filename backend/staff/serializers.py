import re
from rest_framework import serializers
from .models import MaintenanceStaff


class MaintenanceStaffSerializer(serializers.ModelSerializer):
    assigned_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MaintenanceStaff
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'department',
            'specialization',
            'availability',
            'assigned_count',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'assigned_count']

    def get_assigned_count(self, obj):
        # Return count of active/assigned complaints
        return obj.assigned_complaints.exclude(status__in=['Resolved', 'Rejected']).count()

    def validate_phone(self, value):
        cleaned = re.sub(r'[\s\-+()]', '', value)
        if not cleaned.isdigit() or len(cleaned) < 7:
            raise serializers.ValidationError("Please provide a valid contact phone number.")
        return value

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Staff member name cannot be empty.")
        return value.strip()
