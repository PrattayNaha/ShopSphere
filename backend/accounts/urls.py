from django.urls import path
from .views import RegisterView, CustomerProfileView, EmailTokenObtainPairView, CustomerProfileUpdateView, AddressListCreateView, AddressDetailView, PasswordResetRequestView, PasswordResetConfirmView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import PasswordResetVerifyView
urlpatterns = [
    path('register/', RegisterView.as_view(), name="register"),
    path('login/', EmailTokenObtainPairView.as_view(), name="get_token"),
    path('refresh/', TokenRefreshView.as_view(), name = "refresh"),
    path('profile/', CustomerProfileView.as_view(), name = "profile"),
    path('profile/update/', CustomerProfileUpdateView.as_view(), name="profile-update"),
    path('addresses/', AddressListCreateView.as_view(), name="address-list-create"),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name="address-detail"),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name="password-reset-request"),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path('password-reset/verify/', PasswordResetVerifyView.as_view(), name="password-reset-verify"),
]
