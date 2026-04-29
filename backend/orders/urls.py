from django.urls import path
from .views import (
    CartDetailView,
    AddToCartView,
    UpdateCartItemView,
    RemoveCartItemView,
    CheckOutView,
    OrderHistoryView,
    CreatePaymentIntentView,
    stripe_webhook,
    CancelOrderView,
    OrderStatusView,
    UpdateDeliveryStatusView,
)
from .views_vendor import VendorOrderListView, VendorRevenueView, VendorDeleteView, VendorOrderDetailView, VendorOrdersMemoDataView, VendorCustomerStatsView, VendorSalesAnalyticsView

urlpatterns = [
    path('cart/', CartDetailView.as_view(), name='cart'),
    path('cart/add/', AddToCartView.as_view(), name = 'AddToCart'),
    path('cart/item/<int:pk>/', UpdateCartItemView.as_view(),name='updatecart' ),
    path('cart/item/<int:pk>/remove/',RemoveCartItemView.as_view(), name='itemremove'),
    path('checkout/', CheckOutView.as_view(), name = 'checkout'),
    path('orders/', OrderHistoryView.as_view(), name = 'orders'),
    path('payments/create-intent/',CreatePaymentIntentView.as_view(), name='payments'),
    path("payments/webhook/", stripe_webhook),
    path("orders/<int:order_id>/status/", OrderStatusView.as_view(), name="order-status"),

    
    path("vendor/orders/", VendorOrderListView.as_view(), name = "vendororderview"),
    path('vendor/revenue/', VendorRevenueView.as_view(), name = "vendorrevenue"),
    path('vendor/orders/<int:id>/memo-data/', VendorOrdersMemoDataView.as_view(), name='vendor-memo-data'),
    path('orders/<int:order_id>/cancel/', CancelOrderView.as_view(), name='order-cancel'),
    path('vendor/orders/<int:order_id>/delete/', VendorDeleteView.as_view(), name='order-delete'),
    path('vendor/orders/<int:id>/', VendorOrderDetailView.as_view(), name='vendor-order-detail'),
    path('vendor/orders/<int:order_id>/update-status/', UpdateDeliveryStatusView.as_view(), name = 'update-delivery-status'),
    path('vendor/customer/', VendorCustomerStatsView.as_view(), name='vendor-customer-stats'),
    path('vendor/sales-analytics/', VendorSalesAnalyticsView.as_view()),



]
