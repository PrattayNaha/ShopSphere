from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartItemSerializer, CartSerializer, OrderSerializer
import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from decimal import Decimal
from accounts.permisisons import IsVendor

def reduce_stock(order):
    for item in order.items.all():
        product = item.product

        if product.stock < item.quantity:
            raise ValidationError(f"Not enough stock for {product.name}")

        product.stock -= item.quantity
        product.save()

stripe.api_key = settings.STRIPE_SECRET_KEY

class CartDetailView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        cart,_=Cart.objects.get_or_create(user = self.request.user)
        return Cart.objects.prefetch_related(
            "items__variant__options"
        ).get(id=cart.id)

class AddToCartView(generics.CreateAPIView):
    serializer_class = CartItemSerializer
    pagination_class = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        cart,_ = Cart.objects.get_or_create(user = request.user)
        product = request.data.get("product")
        quantity = int(request.data.get("quantity",1))
        
        item, created = CartItem.objects.get_or_create(
            cart = cart,
            product_id = product,
            variant_id = request.data.get("variant"),
            defaults={"quantity":quantity}
        )
        
        if not created:
            item.quantity += quantity
            item.variant_id = request.data.get("variant")
            item.save()
            item.refresh_from_db()
            
        item = CartItem.objects.select_related("variant").prefetch_related("variant__options").get(id=item.id)   
        serializer = self.get_serializer(item)
        return Response(serializer.data, status = status.HTTP_201_CREATED)
    
class UpdateCartItemView(generics.UpdateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    queryset = CartItem.objects.all()
    
    def get_queryset(self):
        return CartItem.objects.filter(cart__user = self.request.user)
    
class RemoveCartItemView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = CartItem.objects.all()
    
    def get_queryset(self):
        return CartItem.objects.filter(cart__user = self.request.user)
    

    
#Checkout API view
class CheckOutView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        cart = Cart.objects.get(user = request.user)
        
        
        if not cart.items.exists():
            return Response({"error":"Cart is empty"}, status= 400)
        
        address = request.data.get("address")
        if not address:
            return Response({"error":"Shipping address is required"}, status=400)
        
        payment_method = request.data.get("payment_method")
        
        order = Order.objects.create(
            user = request.user,
            total_price = 0,
            payment_method = payment_method,
            shipping_address = address.get("address_line"),
            shipping_phone = address.get("phone_number"),
            shipping_city = address.get("city"),
            shipping_postal_code = address.get("postal_code"),
         )

        
        from decimal import Decimal

        total = Decimal("0.00")

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price,
                variant = item.variant,
            )
            total += item.quantity * item.product.price

        shipping_fee = Decimal("132.00")
        grand_total = total + shipping_fee

        order.total_price = total
        order.shipping_fee = shipping_fee
        order.grand_total = grand_total
        order.save()
        
        if request.data.get("payment_method") == "COD":
            order.status = "COD"
            order.save()
            reduce_stock(order)
            cart.items.all().delete()

        
        return Response({ "order_id":order.id, "message":"Order Placed Successfully"})
    
class OrderHistoryView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    
    def get_queryset(self):
        return Order.objects.filter(user = self.request.user).prefetch_related("items__product", "items__variant__options")
    
    
#CreatingPaymentIntentView
class CreatePaymentIntentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        order_id = request.data.get("order_id")
        
        try:
            order = Order.objects.get(id = order_id, user = request.user)
        except Order.DoesNotExist:
            raise ValidationError("Invalid Order")
        
        if order.status != "PENDING":
            raise ValidationError("Order already processed")
        
        intent = stripe.PaymentIntent.create(
            amount=int(order.grand_total*100),
            currency = "bdt",
            metadata = {"order_id":order.id}
        )
        
        order.payment_intent_id = intent.id
        order.save()
        
        return Response({
            "client_secret": intent.client_secret,
            "public_secret": settings.STRIPE_PUBLIC_KEY
        })
        
@csrf_exempt
def stripe_webhook(request):
    print("🔥 Stripe webhook received")
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        order_id = intent["metadata"]["order_id"]

        order = Order.objects.get(id=order_id)
        order.status = "PAID"
        order.save()
        reduce_stock(order)

        Cart.objects.get(user=order.user).items.all().delete()

    return HttpResponse(status=200)


class OrderStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)
        return Response({"status": order.status})


class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        if order.status.upper() != "PENDING":
            return Response({"detail": "Only pending orders can be canceled"}, status=status.HTTP_400_BAD_REQUEST)

        order.status = "CANCELLED"
        order.save()
        return Response({"detail": "Order canceled successfully"}, status=status.HTTP_200_OK)


class UpdateDeliveryStatusView(APIView):
    permission_classes = [IsAuthenticated, IsVendor]
    
    def patch(self, request, order_id):
        try:
            order = Order.objects.get(id = order_id)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found"}, status = 404)
        
        if not OrderItem.objects.filter(order = order, product__vendor = request.user).exists():
            return Response({"detail":"Not Authorized"}, status = 403)
        
        new_status = request.data.get("delivery_status")
        
        if new_status not in ["PLACED", "SHIPPED", "DELIVERED", "RETURNED"]:
            return Response({"detail": "Invalid status"}, status = 400)
        
        order.delivery_status = new_status
        order.save()
        
        return Response({
            "message": "Delivery status updated",
            "delivery_status": order.delivery_status
        })
#stripe listen --forward-to localhost:8000/api/payments/webhook/