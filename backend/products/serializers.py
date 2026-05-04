from rest_framework import serializers
from .models import Category, SubCategory, Product, Variation, VariationOption, ProductVariant

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        name = attrs.get("name", getattr(instance, "name", None))
        slug = attrs.get("slug", getattr(instance, "slug", None))

        qs_name = Category.objects.filter(name=name)
        if instance:
            qs_name = qs_name.exclude(id=instance.id)
        if qs_name.exists():
            raise serializers.ValidationError({"name": "Category with this name already exists."})

        qs_slug = Category.objects.filter(slug=slug)
        if instance:
            qs_slug = qs_slug.exclude(id=instance.id)
        if qs_slug.exists():
            raise serializers.ValidationError({"slug": "Category with this slug already exists."})

        return attrs

    
    
class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ["id", "name", "slug", "category"]
        

class VariationOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VariationOption
        fields = ["id", "value", "variation"]


class VariationSerializer(serializers.ModelSerializer):
    options = VariationOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Variation
        fields = ["id", "name", "options", "product"]

        

class ProductVariantSerializer(serializers.ModelSerializer):
    options = VariationOptionSerializer(many=True, read_only=True)

    class Meta:
        model = ProductVariant
        fields = ["id", "product", "options"]

class ProductSerializer(serializers.ModelSerializer):
    subcategory = serializers.PrimaryKeyRelatedField(
        queryset=SubCategory.objects.all(),
    )
    subcategory_name = serializers.CharField(
        source="subcategory.name",
        read_only=True
    )
    variants = ProductVariantSerializer(many=True, read_only=True)
    variations = VariationSerializer(many=True, read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ("vendor", "slug")
        
    