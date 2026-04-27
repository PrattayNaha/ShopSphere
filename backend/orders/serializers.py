from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from products.serializers import ProductVariantSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source = "product.name")
    price = serializers.ReadOnlyField(source = "product.price")
    product_image = serializers.ReadOnlyField(source = "product.image.url")
    variant = ProductVariantSerializer(read_only = True, allow_null = True)
    
    
    class Meta:
        model = CartItem
        fields = ["id", "product", "product_name", "price", "quantity", "product_image", "variant"]
        

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many = True, read_only = True)
    
    class Meta:
        model = Cart
        fields = ["id", "items"]
        

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source = "product.name")
    product_image = serializers.ReadOnlyField(source = "product.image.url")
    variant = ProductVariantSerializer(read_only = True, allow_null = True)
    
    class Meta:
        model = OrderItem
        fields = ["id","product_name", "quantity", "price", "product_image", "variant"]

        

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many = True)
    total_quantity = serializers.SerializerMethodField()
    
    customer_name = serializers.ReadOnlyField(source = "user.customer_profile.username")
    customer_email = serializers.ReadOnlyField(source = "user.email")
    
    class Meta:
        model = Order
        fields = ["id",
                  "total_price",
                  "grand_total",
                  "created_at",
                  "items",
                  "total_quantity",
                  "status",
                  "delivery_status",
                  "shipping_address",
                  "shipping_phone",
                  "shipping_city",
                  "shipping_postal_code",
                  "payment_method",
                  "customer_name",
                  "customer_email",
                ]
        
    def get_total_quantity(self, obj):
        return sum(item.quantity for item in obj.items.all())
        