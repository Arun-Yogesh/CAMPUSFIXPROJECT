from rest_framework import viewsets, permissions, filters
from .models import MaintenanceStaff
from .serializers import MaintenanceStaffSerializer
from users.permissions import IsAdminRole


class MaintenanceStaffViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceStaff.objects.all().order_by('name')
    serializer_class = MaintenanceStaffSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'department', 'specialization', 'email']
    ordering_fields = ['name', 'availability', 'created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminRole()]

    def get_queryset(self):
        queryset = super().get_queryset()
        availability = self.request.query_params.get('availability')
        specialization = self.request.query_params.get('specialization')

        if availability:
            queryset = queryset.filter(availability__iexact=availability)
        if specialization:
            queryset = queryset.filter(specialization__icontains=specialization)

        return queryset
