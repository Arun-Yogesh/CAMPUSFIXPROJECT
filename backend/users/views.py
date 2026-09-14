from rest_framework import status, views, permissions, generics
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from .permissions import IsAdminRole


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(user).data
        return Response({
            'message': 'Account created successfully.',
            'token': token.key,
            'user': user_data
        }, status=status.HTTP_201_CREATED)


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(user).data
        return Response({
            'message': 'Login successful.',
            'token': token.key,
            'user': user_data
        }, status=status.HTTP_200_OK)


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class CurrentUserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserListView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = UserSerializer
    queryset = User.objects.all().order_by('-created_at')

    def get_queryset(self):
        role = self.request.query_params.get('role')
        if role:
            return User.objects.filter(role__iexact=role).order_by('-created_at')
        return super().get_queryset()
