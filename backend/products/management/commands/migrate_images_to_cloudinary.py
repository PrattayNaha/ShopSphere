import os
import cloudinary.uploader
from django.core.management.base import BaseCommand
from products.models import Product

class Command(BaseCommand):
    help = "Upload existing local images to Cloudinary"

    def handle(self, *args, **kwargs):
        products = Product.objects.all()

        for product in products:
            if not product.image:
                continue

            try:
                # If already Cloudinary, skip
                if "res.cloudinary.com" in product.image.url:
                    self.stdout.write(f"Skipping (already uploaded): {product.name}")
                    continue

                local_path = product.image.path

                if not os.path.exists(local_path):
                    self.stdout.write(f"Missing file: {local_path}")
                    continue

                result = cloudinary.uploader.upload(
                    local_path,
                    folder="products",
                    public_id=f"{product.slug}",
                    overwrite=True
                )

                # Save new Cloudinary URL
                product.image = result["public_id"]
                product.save()

                self.stdout.write(f"Uploaded: {product.name}")

            except Exception as e:
                self.stdout.write(f"Error for {product.name}: {str(e)}")