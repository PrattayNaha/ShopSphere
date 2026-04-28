from django.contrib import admin
from .models import Category, SubCategory, Product, Variation, VariationOption, ProductVariant


# 🔹 SubCategory inline inside Category
class SubCategoryInline(admin.TabularInline):
    model = SubCategory
    extra = 1


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_active', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [SubCategoryInline]


# 🔹 Product Variant inline
class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0


# 🔹 Variation Option inline
class VariationOptionInline(admin.TabularInline):
    model = VariationOption
    extra = 1


# 🔹 Variation Admin
class VariationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'product')
    inlines = [VariationOptionInline]


# 🔹 Product Admin
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'vendor', 'price', 'stock', 'is_active')
    list_filter = ('is_active', 'category')
    search_fields = ('name', 'vendor__email')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductVariantInline]


# 🔹 SubCategory Admin
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'is_active')
    prepopulated_fields = {'slug': ('name',)}


# 🔹 Product Variant Admin
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'get_options')

    def get_options(self, obj):
        return ", ".join([o.value for o in obj.options.all()])
    get_options.short_description = "Options"


# 🔹 Register everything
admin.site.register(Category, CategoryAdmin)
admin.site.register(SubCategory, SubCategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Variation, VariationAdmin)
admin.site.register(ProductVariant, ProductVariantAdmin)
admin.site.register(VariationOption)