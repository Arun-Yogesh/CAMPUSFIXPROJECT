from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'role', 'department', 'phone', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'password', 'confirm_password', 'role', 'department', 'phone']
        extra_kwargs = {
            'username': {'required': False, 'allow_blank': True},
            'email': {'required': True},
            'name': {'required': True},
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return value.lower()

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        username = validated_data.get('username') or validated_data.get('email').split('@')[0]
        
        # Ensure username uniqueness
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
            
        validated_data['username'] = username
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        login_input = attrs.get('email').strip()
        password = attrs.get('password')

        if not login_input or not password:
            raise serializers.ValidationError("Must include both email/username and password.")

        # Try authenticating by email first, then username
        user = None
        user_obj = User.objects.filter(email__iexact=login_input).first()
        if user_obj:
            user = authenticate(username=user_obj.username, password=password)
        
        if not user:
            user = authenticate(username=login_input, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials. Please check your email/username and password.")

        if not user.is_active:
            raise serializers.ValidationError("This user account is inactive.")

        attrs['user'] = user
        return attrs
