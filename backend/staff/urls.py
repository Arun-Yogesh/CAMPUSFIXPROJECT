from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MaintenanceStaffViewSet

router = DefaultRouter()
router.register(r'', MaintenanceStaffViewSet, basename='staff')

urlpatterns = [
    path('', include(router.urls)),
]
