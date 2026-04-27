from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegisterSerializer, CustomerProfileSerializer, CustomerProfileUpdateSerializer, AddressSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import EmailTokenObtainPairSerializer, PasswordResetConfirmSerializer, PasswordResetRequestSerializer, PasswordResetVerifySerializer
from .models import Address, PasswordResetOTP, CustomerProfile, User
from .throttles import LoginThrottle
from accounts.permisisons import IsVendor

class RegisterView(generics.GenericAPIView):
    
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    def get(self,request):
        serializer = self.get_serializer()
        return Response(serializer.data)
    
    def post(self, request):
        serializer = self.get_serializer(data = request.data)
        serializer.is_valid(raise_exception = True)
        
        user = serializer.save(role = "CUSTOMER")
        
        return Response(
            {"message":"User Registered"},
            status=status.HTTP_201_CREATED
        )
    
class CustomerProfileView(generics.RetrieveAPIView):
    serializer_class = CustomerProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user.customer_profile
    

class CustomerProfileUpdateView(generics.UpdateAPIView):
    serializer_class = CustomerProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.customer_profile

class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.customer_profile.addresses.all()

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user.customer_profile)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.customer_profile.addresses.all()

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    throttle_classes = [LoginThrottle]
    

class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer
    throttle_classes = [LoginThrottle]
    
    def post(self, request):
        serializer = self.get_serializer(data = request.data)
        serializer.is_valid(raise_exception = True)
        serializer.save()
        return Response(
            {"message":"OTP sent to email"},
            status = status.HTTP_200_OK
        )
        
        
class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data = request.data)
        serializer.is_valid(raise_exception = True)
        serializer.save()
        
        return Response(
            {"message":"Password reset successful"},
            status = status.HTTP_200_OK
        )
        

class PasswordResetVerifyView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetVerifySerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(
            {"message": "OTP verified successfully"},
            status=status.HTTP_200_OK
        )

