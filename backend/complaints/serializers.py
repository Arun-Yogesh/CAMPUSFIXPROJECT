from rest_framework import serializers
from .models import Complaint
from staff.models import MaintenanceStaff
from staff.serializers import MaintenanceStaffSerializer
from users.serializers import UserSerializer
from .utils import detect_priority_suggestion


class ComplaintSerializer(serializers.ModelSerializer):
    student_details = UserSerializer(source='student', read_only=True)
    assigned_staff_details = MaintenanceStaffSerializer(source='assigned_staff', read_only=True)
    is_editable = serializers.BooleanField(source='is_editable_by_student', read_only=True)
    smart_priority_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id',
            'complaint_title',
            'description',
            'category',
            'location',
            'priority',
            'status',
            'student',
            'student_details',
            'assigned_staff',
            'assigned_staff_details',
            'image',
            'is_editable',
            'smart_priority_info',
            'created_at',
            'updated_at',
            'resolved_at',
        ]
        read_only_fields = ['id', 'student', 'created_at', 'updated_at', 'resolved_at', 'is_editable']

    def get_smart_priority_info(self, obj):
        return detect_priority_suggestion(obj.complaint_title, obj.description)

    def validate_complaint_title(self, value):
        val = value.strip()
        if len(val) < 4:
            raise serializers.ValidationError("Complaint title must be at least 4 characters long.")
        return val

    def validate_description(self, value):
        val = value.strip()
        if len(val) < 10:
            raise serializers.ValidationError("Please provide a detailed description (at least 10 characters).")
        return val

    def validate_location(self, value):
        val = value.strip()
        if len(val) < 3:
            raise serializers.ValidationError("Please specify a clear campus location (e.g. Block A, Room 204).")
        return val

    def validate(self, attrs):
        # Validate status transitions if user is student
        user = self.context['request'].user
        if user.role == 'STUDENT' and self.instance:
            if not self.instance.is_editable_by_student:
                raise serializers.ValidationError(
                    f"This complaint cannot be modified because its status is already '{self.instance.status}'."
                )
            if 'status' in attrs and attrs['status'] != self.instance.status:
                raise serializers.ValidationError("Students cannot directly change the complaint status.")
            if 'assigned_staff' in attrs:
                raise serializers.ValidationError("Students cannot assign maintenance staff.")

        return attrs
