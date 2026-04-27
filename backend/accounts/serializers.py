from rest_framework import serializers
from .models import User, CustomerProfile, Address, PasswordResetOTP
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.mail import send_mail
from django.conf import settings
import random
from django.core.validators import MinLengthValidator


User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True, validators = [MinLengthValidator(8, "Password must be at least 8 characters long.")])
    username = serializers.CharField(write_only = True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        
    def create(self, validated_data):
        username = validated_data.pop("username")
        email = validated_data["email"]
        password = validated_data["password"]
        
        user  = User.objects.create_user(
            email=email,
            password=password,
            role = "CUSTOMER"
            )
        CustomerProfile.objects.create(
            user = user,
            username = username
        )
        return user


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "label",
            "address_line",
            "city",
            "postal_code",
            "phone_number",
            "is_default",
        ]

        
class CustomerProfileSerializer(serializers.ModelSerializer):
    
    email = serializers.EmailField(source='user.email', read_only=True)
    addresses = AddressSerializer(many=True, read_only=True)
    
    class Meta:
        model = CustomerProfile
        fields  = ['username',
                   'email',
                   'mobile_number',
                   'addresses',
                   'payment_option'
                  ]

class CustomerProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = [
            "mobile_number",
            "payment_option",
        ]

        
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"
    
    def validate(self, attrs):
        
        data = super().validate(attrs)
        
        
        self.user = self.user
        
        data["role"] = self.user.role

        return data
    
    
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate(self, attrs):
        emails = attrs.get("email")
        
        try:
            user = User.objects.get(email=emails)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")
        
        attrs["user"] = user
        return attrs
    
    def save(self):
        user = self.validated_data["user"]
        
        otp = str(random.randint(100000, 999999))
        
        PasswordResetOTP.objects.create(user=user, otp=otp)
        
        send_mail(
            subject="Password Reset OTP",
            message = f"Your OTP for password reset is: {otp}. It expires in 2 minutes.",
            from_email = settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )
    
class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length = 6)
    new_password = serializers.CharField(write_only = True)
    
    def validate(self, attrs):
        email = attrs.get("email")
        otp = attrs.get("otp")
        
        try:
            user = User.objects.get(email = email)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")
        
        try:
            otp_obj = PasswordResetOTP.objects.filter(
                user = user,
                otp = otp,
                is_verified = True
                ).latest("created_at")
        except PasswordResetOTP.DoesNotExist:
            raise serializers.ValidationError("Invalid OTP")
        
        if otp_obj.is_expired():
            raise serializers.ValidationError("OTP has expired")
        
        attrs["user"]  = user
        attrs["otp_obj"] = otp_obj
        
        return attrs
    
    def save(self):
        user = self.validated_data["user"]
        otp_obj = self.validated_data["otp_obj"]
        new_password = self.validated_data["new_password"]
        
        user.set_password(new_password)
        user.save()
        
        otp_obj.delete()  # Delete OTP after successful password reset
        
class PasswordResetVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, attrs):
        email = attrs.get("email")
        otp = attrs.get("otp")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email.")

        try:
            otp_obj = PasswordResetOTP.objects.filter(
                user=user,
                otp=otp,
                is_verified=False
            ).latest("created_at")
        except PasswordResetOTP.DoesNotExist:
            raise serializers.ValidationError("Invalid OTP.")

        if otp_obj.is_expired():
            raise serializers.ValidationError("OTP expired.")

        # Mark OTP as verified but do NOT reset password
        otp_obj.is_verified = True
        otp_obj.save()

        return attrs
