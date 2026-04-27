from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from products.permissions import IsVendor
from rest_framework.response import Response
from .serializers_vendor import VendorOrderItemSerializer, VendorRevenueSerializer, OrderMemoSerializer
from .serializers import OrderSerializer
from django.db.models import Sum, F
from rest_framework.views import APIView
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from .models import Order, OrderItem
from accounts.permisisons import IsVendor
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from accounts.models import User

from django.utils.timezone import now, timedelta
from django.db.models import Count, Sum
from collections import defaultdict


class VendorOrderListView(ListAPIView):
    serializer_class = VendorOrderItemSerializer
    permission_classes  = [IsAuthenticated, IsVendor]
    
    def get_queryset(self):
        return OrderItem.objects.filter(
            product__vendor = self.request.user
        ).select_related("order", "product")
        
class VendorRevenueView(APIView):
    permission_classes = [IsAuthenticated, IsVendor]
    
    
    def get(self, request):
        items = OrderItem.objects.filter(
            product__vendor = request.user,
            order__status__in = ["PAID", "COD"]
        )
        
        total_revenue = items.aggregate(
            revenue = Sum(F("price") * F("quantity"))
        )["revenue"] or 0
        
        data = {
            "total_revenue":total_revenue,
            "total_order":items.values("order").distinct().count(),
            "total_items_sold":items.aggregate(
                total = Sum("quantity")
            )["total"] or 0,
            
        }
        serializer  = VendorRevenueSerializer(data)
        return Response(serializer.data)


class VendorOrdersMemoDataView(RetrieveAPIView):
    serializer_class = OrderMemoSerializer  # create a serializer that outputs items, customer info, fees
    permission_classes = [IsAuthenticated, IsVendor]
    lookup_field = "id"
    
    def get_queryset(self):
        return Order.objects.filter(items__product__vendor=self.request.user).distinct()
    
    
class VendorDeshboardView(APIView):
    permission_classes = [IsAuthenticated, IsVendor]
    
    def get(self, request):
        return Response({"message":"Welcome Vendor"})
    
    
    
class VendorDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsVendor]
    
    def delete(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
        except ObjectDoesNotExist:
            return Response({"detail": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
        
        vendor_items = OrderItem.objects.filter(
            order=order,
            product__vendor=request.user
        )
        
        if not vendor_items.exists():
            return Response({"detail": "Not Authorized"}, status=status.HTTP_403_FORBIDDEN)
        
        order.delete()
        return Response({"detail": "Order deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    
class VendorOrderDetailView(RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsVendor]
    lookup_field = "id"
    
    def get_queryset(self):
        return Order.objects.filter(
            items__product__vendor = self.request.user
        ).distinct()


class VendorCustomerStatsView(APIView):
    permission_classes = [IsAuthenticated, IsVendor]

    def get(self, request):
        total_customers = User.objects.filter(role = "CUSTOMER").count()

        orders = Order.objects.filter(
            items__product__vendor=request.user,
            status__in=["PAID", "COD"]
        ).distinct()

        customers = defaultdict(lambda: {
            "total_orders": 0,
            "total_spent": 0,
            "name": "",
            "email": ""
        })

        for order in orders:
            user = order.user
            customers[user.id]["total_orders"] += 1
            customers[user.id]["total_spent"] += float(order.grand_total)
            customers[user.id]["name"] = user.customer_profile.username
            customers[user.id]["email"] = user.email

        # NEW CUSTOMERS (last 7 days)
        last_7_days = now() - timedelta(days=7)
        new_customers = User.objects.filter(
            role = "CUSTOMER",
            date_joined__gte = last_7_days).count()

        # REPEAT CUSTOMERS
        repeat_customers = [
            c for c in customers.values() if c["total_orders"] > 1
        ]

        repeat_percentage = (
            (len(repeat_customers) / total_customers) * 100
            if total_customers > 0 else 0
        )

        # TOP CUSTOMERS
        top_customers = sorted(
            customers.values(),
            key=lambda x: x["total_spent"],
            reverse=True
        )[:5]

        return Response({
            "total_customers": total_customers,
            "new_customers": new_customers,
            "repeat_percentage": round(repeat_percentage, 2),
            "top_customers": top_customers
        })