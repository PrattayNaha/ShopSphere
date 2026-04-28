from django.db import models
from django.conf import settings
from products.models import Product, ProductVariant

# Create your models here.

User = settings.AUTH_USER_MODEL

#Cart API Model
class Cart(models.Model):
    user = models.OneToOneField(
        User,
        related_name="cart",
        on_delete=models.CASCADE
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Cart ({self.user})"

class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        related_name="items",
        on_delete=models.CASCADE
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveBigIntegerField(default = 1)
    
    class Meta:
        unique_together = ("cart", "product")
        
    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


#Order API Model
class Order(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("COD", "Cash On Delivery"),
        ("PAID", "Paid"),
        ("FAILED", "Failed"),
        ("CANCELLED", "Cancelled"),
    )
    
    PAYMENT_CHOICES = (
        ("STRIPE", "Stripe"),
        ("COD", "Cash on Delivery"),
    )
    
    DELIVERY_STATUS_CHOICES = (
        ("PLACED", "Placed"),
        ("SHIPPED", "Shipped"),
        ("DELIVERED", "Delivered"),
        ("RETURNED", "Returned"),
    )
    
    user = models.ForeignKey(
        User,
        related_name = "orders",
        on_delete = models.CASCADE
    )
    total_price = models.DecimalField(max_digits = 10, decimal_places=2)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add = True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default="COD")
    delivery_status = models.CharField(max_length=20, choices=DELIVERY_STATUS_CHOICES, default="PLACED")
    
    shipping_address = models.CharField(max_length=255, blank=True, null=True)
    shipping_phone = models.CharField(max_length=20, blank=True, null=True)
    shipping_city = models.CharField(max_length=100, blank=True, null=True)
    shipping_postal_code = models.CharField(max_length=20, blank=True, null=True)
    

    def __str__(self):
        return f"Order #{self.id} - {self.status}"
    
class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        related_name = "items",
        on_delete = models.CASCADE
    )
    product = models.ForeignKey(Product, on_delete = models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits =10, decimal_places=2)
    variant = models.ForeignKey(
        "products.ProductVariant",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    
    
