from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count
from django.utils import timezone
from .models import Complaint
from .serializers import ComplaintSerializer
from .utils import detect_priority_suggestion, find_potential_duplicates
from staff.models import MaintenanceStaff
from users.permissions import IsAdminRole


class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['complaint_title', 'description', 'location', 'category']
    ordering_fields = ['created_at', 'priority', 'status', 'updated_at']
    ordering = ['-created_at']

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Complaint.objects.none()

        if user.role == 'ADMIN' or user.is_superuser or user.is_staff:
            queryset = Complaint.objects.all()
        elif user.role == 'STAFF':
            # Match staff by email or show assigned complaints
            staff_profile = MaintenanceStaff.objects.filter(email__iexact=user.email).first()
            if staff_profile:
                queryset = Complaint.objects.filter(assigned_staff=staff_profile)
            else:
                queryset = Complaint.objects.all()
        else:
            # Student view
            queryset = Complaint.objects.filter(student=user)

        # Query parameter filters
        cat = self.request.query_params.get('category')
        stat = self.request.query_params.get('status')
        prio = self.request.query_params.get('priority')
        student_id = self.request.query_params.get('student')
        assigned = self.request.query_params.get('assigned_staff')

        if cat:
            queryset = queryset.filter(category__iexact=cat)
        if stat:
            queryset = queryset.filter(status__iexact=stat)
        if prio:
            queryset = queryset.filter(priority__iexact=prio)
        if student_id and (user.role == 'ADMIN' or user.is_superuser):
            queryset = queryset.filter(student_id=student_id)
        if assigned:
            queryset = queryset.filter(assigned_staff_id=assigned)

        return queryset

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user

        # Authorization check: Student can only delete their own editable complaints
        if user.role == 'STUDENT':
            if instance.student != user:
                return Response(
                    {'error': 'You do not have permission to delete this complaint.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            if not instance.is_editable_by_student:
                return Response(
                    {'error': f'Cannot cancel complaint once it has advanced to "{instance.status}".'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        self.perform_destroy(instance)
        return Response({'message': 'Complaint successfully deleted.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def analytics(self, request):
        """
        Dashboard statistics: status counts, priority counts, category counts.
        Students see statistics for their own complaints. Admins see whole campus stats.
        """
        user = request.user
        base_qs = Complaint.objects.all() if (user.role == 'ADMIN' or user.is_superuser) else Complaint.objects.filter(student=user)

        total = base_qs.count()
        submitted = base_qs.filter(status='Submitted').count()
        under_review = base_qs.filter(status='Under Review').count()
        assigned = base_qs.filter(status='Assigned').count()
        in_progress = base_qs.filter(status='In Progress').count()
        resolved = base_qs.filter(status='Resolved').count()
        rejected = base_qs.filter(status='Rejected').count()

        pending = submitted + under_review

        critical = base_qs.filter(priority='Critical').count()
        high = base_qs.filter(priority='High').count()
        medium = base_qs.filter(priority='Medium').count()
        low = base_qs.filter(priority='Low').count()

        by_category = dict(
            base_qs.values('category').annotate(count=Count('id')).values_list('category', 'count')
        )
        by_status = dict(
            base_qs.values('status').annotate(count=Count('id')).values_list('status', 'count')
        )
        by_priority = dict(
            base_qs.values('priority').annotate(count=Count('id')).values_list('priority', 'count')
        )

        return Response({
            'total': total,
            'pending': pending,
            'submitted': submitted,
            'under_review': under_review,
            'assigned': assigned,
            'in_progress': in_progress,
            'resolved': resolved,
            'rejected': rejected,
            'critical': critical,
            'high': high,
            'medium': medium,
            'low': low,
            'by_category': by_category,
            'by_status': by_status,
            'by_priority': by_priority,
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def check_duplicate(self, request):
        """
        Checks for potential unresolved duplicate complaints in the same location/category.
        """
        category = request.query_params.get('category', '')
        location = request.query_params.get('location', '')
        title = request.query_params.get('title', '')
        exclude_id = request.query_params.get('exclude_id')

        duplicates = find_potential_duplicates(
            category=category,
            location=location,
            title=title,
            exclude_id=exclude_id
        )

        return Response({
            'found_duplicates': len(duplicates) > 0,
            'count': len(duplicates),
            'duplicates': duplicates,
            'message': 'A similar issue may already have been reported for this location.' if duplicates else 'No similar issues detected.'
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def detect_priority(self, request):
        """
        Real-time priority detection heuristic API for interactive UI.
        """
        title = request.data.get('title', '')
        description = request.data.get('description', '')
        suggestion = detect_priority_suggestion(title, description)
        return Response(suggestion, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminRole])
    def assign_staff(self, request, pk=None):
        """
        Assign a maintenance staff member to the complaint.
        """
        complaint = self.get_object()
        staff_id = request.data.get('staff_id')

        if not staff_id:
            complaint.assigned_staff = None
            complaint.save()
            return Response({'message': 'Staff unassigned successfully.', 'complaint': ComplaintSerializer(complaint).data})

        try:
            staff = MaintenanceStaff.objects.get(id=staff_id)
        except MaintenanceStaff.DoesNotExist:
            return Response({'error': 'Maintenance staff member not found.'}, status=status.HTTP_404_NOT_FOUND)

        complaint.assigned_staff = staff
        if complaint.status == 'Submitted':
            complaint.status = 'Assigned'
        complaint.save()

        return Response({
            'message': f'Complaint assigned to {staff.name}.',
            'complaint': ComplaintSerializer(complaint).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Update status (Admin or Staff).
        """
        user = request.user
        if user.role not in ['ADMIN', 'STAFF'] and not user.is_superuser:
            return Response({'error': 'Only administrators and maintenance staff can update complaint status.'}, status=status.HTTP_403_FORBIDDEN)

        complaint = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = [choice[0] for choice in Complaint.STATUS_CHOICES]

        if new_status not in valid_statuses:
            return Response({'error': f'Invalid status. Allowed values: {", ".join(valid_statuses)}'}, status=status.HTTP_400_BAD_REQUEST)

        complaint.status = new_status
        if new_status == 'Resolved':
            complaint.resolved_at = timezone.now()
        complaint.save()

        return Response({
            'message': f'Complaint status updated to "{new_status}".',
            'complaint': ComplaintSerializer(complaint).data
        }, status=status.HTTP_200_OK)
