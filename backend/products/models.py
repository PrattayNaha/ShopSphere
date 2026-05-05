from django.db import models
from django.conf import settings
from django.utils.text import slugify
from cloudinary.models import CloudinaryField

# Create your models here.

User = settings.AUTH_USER_MODEL

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
class SubCategory(models.Model):
    category = models.ForeignKey(
        Category,
        related_name = "subcategories",
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100)
    slug = models.SlugField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ("category", "slug")
    
    def __str__(self):
        return f"{self.category.name} -> {self.name}"
    

class Product(models.Model):
    
    vendor = models.ForeignKey(User, related_name="products", on_delete=models.CASCADE)
    category = models.ForeignKey("Category", related_name="products", on_delete=models.CASCADE)
    subcategory = models.ForeignKey("SubCategory", related_name = "products", on_delete=models.CASCADE, null = True, blank=True, db_index = True)
    
    name  = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, db_index = True)
    slug = models.SlugField(max_length=255, unique=True,  blank=True, db_index = True)
    stock = models.PositiveIntegerField(default=0)
    image = CloudinaryField("image", folder="products", blank=True, null=True)
    is_active = models.BooleanField(default = True, db_index = True)
    created_at = models.DateTimeField(auto_now_add=True, db_index = True)
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:  # handles create
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
class Variation(models.Model):
    product = models.ForeignKey(Product, related_name = "variations", on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length = 100)
    
    def __str__(self):
        return self.name
    
class VariationOption(models.Model):
    variation = models.ForeignKey(Variation, related_name = "options", on_delete = models.CASCADE)
    value = models.CharField(max_length = 100)
    
    def __str__(self):
        return f"{self.variation.name}: {self.value}"

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, related_name = "variants", on_delete = models.CASCADE)
    options = models.ManyToManyField(VariationOption)
    
    def __str__(self):
        return f"{self.product.name} - {','.join([o.value for o in self.options.all()])}"