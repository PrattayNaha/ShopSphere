from django.contrib.auth.models import BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, password = None, role = 'CUSTOMER'):
        if not email:
            raise ValueError("User must have an email")
        
        user = self.model(
            email = self.normalize_email(email),
            role = role
        )
        
        user.set_password(password)
        user.save()
        return user
    
    def create_superuser(self, email, password):
        user = self.create_user(email, password, role="VENDOR")
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return user
    
