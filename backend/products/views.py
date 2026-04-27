from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Category, SubCategory, Product, ProductVariant, VariationOption, Variation
from .serializers import CategorySerializer, SubCategorySerializer, ProductSerializer, ProductVariantSerializer, VariationOptionSerializer, VariationSerializer
from .permissions import IsVendor
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models.functions import Lower, Replace
from django.db.models import Value, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

# Create your views here.
#create list
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsVendor()]
        return [AllowAny()]
    
    
#update delete
class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    
    def get_permissions(self):
        if self.request.method in ["PUT","PATCH", "DELETE"]:
            return [IsVendor()]
        
        return [AllowAny()]


 
#SubCategory Views  
class SubCategoryListCreateView(generics.ListCreateAPIView):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsVendor()]
        
        return [AllowAny()]
    
class SubCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    lookup_field = 'id'
    
    def get_permissions(self):
        if self.request.method in ["PUT","PATCH", "DELETE"]:
            return [IsVendor()]
        
        return [AllowAny()]
    
    
class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsVendor()]
        
        return [AllowAny()]
    
    def perform_create(self, serializer):
        serializer.save(vendor = self.request.user,
                        is_active = True)
        
class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsVendor()]
        return [AllowAny()]
    
class PublicProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    permission_classes = [AllowAny]
    pagination_class = None  # Disable pagination for this view

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True)
        
        subcategory = self.request.query_params.get("subcategory")
        if subcategory:
            try:
                qs = qs.filter(subcategory_id=int(subcategory))
            except ValueError:
                qs = qs.none()
        
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        search = self.request.query_params.get("search")
        if search:
            normalized_search = search.replace(" ", "").lower()
            qs = qs.annotate(
                normalized_name=Lower(
                    Replace("name", Value(" "), Value(""))
                )
            ).filter(normalized_name__icontains=normalized_search)
        
        return qs

from rest_framework.generics import RetrieveAPIView

class PublicProductDetailBySlugView(RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = 'slug'  # Django will use the pk in the URL
    
    def get_permissions(self):
        return [AllowAny()]

#Vendor Product List Create\
class VendorProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsVendor]

    def get_queryset(self):
        qs = Product.objects.filter(vendor=self.request.user).prefetch_related("variations__options", "variants__options")
        subcategory = self.request.query_params.get("subcategory")
        if subcategory:
            try:
                qs = qs.filter(subcategory_id=int(subcategory))
            except ValueError:
                qs = qs.none()
        return qs

    def perform_create(self, serializer):
        # Include category and subcategory from validated data
        serializer.save(
            vendor=self.request.user,
            category=serializer.validated_data.get('category'),
            subcategory=serializer.validated_data.get('subcategory'),
            is_active=True
        )
    
    
class VendorProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsVendor]

    def get_queryset(self):
        return Product.objects.filter(vendor=self.request.user)

    def perform_update(self, serializer):
        serializer.save(
            vendor=self.request.user,
            category=serializer.validated_data.get("category", serializer.instance.category),
            subcategory=serializer.validated_data.get("subcategory", serializer.instance.subcategory),
            is_active=serializer.instance.is_active  # preserve active status
        )
    
class ProductSearchView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        query = self.request.query_params.get("q", "")
        
        return Product.objects.filter(
            Q(name__icontains = query) |
            Q(category__name__icontains = query) |
            Q(subcategory__name__icontains = query)
        ).distinct()
        
class ProductSuggestionView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        query = self.request.query_params.get("q", "")
        return Product.objects.filter(
            name__icontains = query
        )[:5]
        
class VariationListCreateView(generics.ListCreateAPIView):
    queryset = Variation.objects.all()
    serializer_class = VariationSerializer
    permission_classes = [IsVendor]

    def perform_create(self, serializer):
        serializer.save(product_id=self.request.data.get("product"))  # ✅ FORCE LINK


class VariationOptionListCreateView(generics.ListCreateAPIView):
    queryset = VariationOption.objects.all()
    serializer_class = VariationOptionSerializer
    permission_classes = [IsVendor]


class ProductVariantListCreateView(generics.ListCreateAPIView):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsVendor]

    def perform_create(self, serializer):
        variant = serializer.save()

        # IMPORTANT: assign many-to-many options
        options_ids = self.request.data.get("options", [])
        variant.options.set(options_ids)
        
@api_view(["DELETE"])
@permission_classes([IsVendor])
def delete_product_variations(request, pk):
    try:
        product = Product.objects.get(pk=pk, vendor=request.user)

        product.variants.all().delete()     # ✅ delete variants
        product.variations.all().delete()   # ✅ delete variations

        return Response({"message": "Deleted"})
    except Product.DoesNotExist:
        return Response({"error": "Not found"}, status=404)