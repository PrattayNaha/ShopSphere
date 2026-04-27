from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .managers import UserManager
from django.conf import settings
import random
from django.utils import timezone
from datetime import timedelta
# Create your models here.

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('VENDOR', 'Vendor'),
        ('CUSTOMER', 'Customer'),
    )
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10 , choices = ROLE_CHOICES, default = 'CUSTOMER')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default = False)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = UserManager()
    
    def __str__(self):
        return self.email

class CustomerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        related_name = "customer_profile"
    )
    
    username = models.CharField(max_length=100)
    mobile_number  = models.CharField(max_length=15, blank=True, null=True)
    
    PAYMENT_CHOICES = (
        ("COD", "Cash on Delivery"),
        ("CARD", "Credit/Debit Card"),
        ("BKASH", "Bkash"),
    )
    
    payment_option = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default="COD")
    
    def __str__(self):
        return self.username
    
class Address(models.Model):
    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name="addresses"
    )
    label = models.CharField(max_length=50, default="Home")  # Home, Work, etc.
    address_line = models.TextField()
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.label} - {self.city}"

class PasswordResetOTP(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    
    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=2)

    def __str__(self):
        return f"{self.user.email} - {self.otp}"
    
    