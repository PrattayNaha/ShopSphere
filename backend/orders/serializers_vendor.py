from rest_framework import serializers
from .models import OrderItem, Order
from products.serializers import ProductVariantSerializer

class VendorOrderItemSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source = "order.id", read_only = True)
    product_name = serializers.CharField(source = "product.name", read_only = True)
    order_status = serializers.CharField(source = "order.status", read_only = True)
    payment_status = serializers.CharField(source = "order.payment_status", read_only = True)
    order_date = serializers.DateTimeField(source ="order.created_at", read_only = True)
    delivery_status = serializers.CharField(source = "order.delivery_status", read_only = True)
    customer_name = serializers.CharField(source='order.user.username', read_only=True)
    phone = serializers.CharField(source='order.shipping_phone', read_only=True)
    grand_total = serializers.DecimalField(source='order.grand_total', max_digits=12, decimal_places=2, read_only=True)
    variant = ProductVariantSerializer(read_only = True, allow_null = True)
    
    class Meta:
        model = OrderItem
        fields = [
            "order_id",
            "product_name",
            "quantity",
            "grand_total",
            "order_status",
            "delivery_status",
            "payment_status",
            "order_date",
            "customer_name",
            "phone",
            "variant"
        ]
        
class VendorRevenueSerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits =12, decimal_places=2)
    total_order = serializers.IntegerField()
    total_items_sold = serializers.IntegerField()
    
class OrderItemMemoSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'quantity', 'price']


class OrderMemoSerializer(serializers.ModelSerializer):
    items = OrderItemMemoSerializer(many=True)  # no source needed
    customer_name = serializers.CharField(
        source='user.customer_profile.username', 
        default='user.email'
    )
    phone = serializers.CharField(source='shipping_phone')
    address = serializers.CharField(source='shipping_address')
    delivery_status = serializers.CharField(source='order.delivery_status', read_only=True)
    

    # These are computed fields
    subtotal = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'status',
            'delivery_status',
            'created_at',
            'items',
            'customer_name',
            'phone',
            'address',
            'subtotal',
            'grand_total',
            'total'
        ]

    def get_subtotal(self, obj):
        return sum([item.price * item.quantity for item in obj.items.all()])
    
    def get_total(self, obj):
        return obj.total_price

    
    def get_grand_total(self, obj):
        return obj.grand_total