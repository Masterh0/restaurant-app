from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
import os
import uuid
from datetime import datetime
from django.conf import settings
from django.utils import timezone

class CustomUser(AbstractUser):
    MANAGER = 'manager'
    EMPLOYEE = 'employee'
    CUSTOMER = 'customer'

    ROLE_CHOICES = [
        (MANAGER, 'Manager'),
        (EMPLOYEE, 'Employee'),
        (CUSTOMER, 'Customer'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=CUSTOMER)
    email = models.EmailField(
        unique=True,
        max_length=254,
        blank=False,
        null=True,
        help_text='Please enter a valid email address.',
        error_messages={'unique': "A user with this email address already exists."}
    )
    
    groups = models.ManyToManyField(Group, related_name='user_groups')
    user_permissions = models.ManyToManyField(Permission, related_name='user_permissions')
    REQUIRED_FIELDS = ['role']
    USERNAME_FIELD = 'username'

    def __str__(self):
        return self.username

def category_image_upload_to(instance, filename):
    ext = filename.split('.')[-1]
    today = datetime.now().strftime('%Y/%m/%d')
    unique_name = f"{instance.name}_{uuid.uuid4().hex}.{ext}"
    return os.path.join('category_images', today, unique_name)

# Category model
class Category(models.Model):
    name = models.CharField(max_length=125, blank=False, null=False, unique=True, db_index=True)
    image = models.ImageField(upload_to=category_image_upload_to, blank=False, null=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name

def dish_image_upload_to(instance, filename):
    ext = filename.split('.')[-1]
    today = datetime.now().strftime('%Y/%m/%d')
    unique_name = f"{instance.name}_{uuid.uuid4().hex}.{ext}"
    return os.path.join('dishes', today, unique_name)

class Dish(models.Model):
    name = models.CharField(max_length=100, blank=False, null=False)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='dishes')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='dish_images/')  # Corrected upload_to path
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    
    @property
    def average_rating(self):
        # This will calculate the average rating for the dish.
        avg_rating = self.reviews.aggregate(avg_score=models.Avg('rating'))['avg_score']
        return round(avg_rating or 0, 2)  # Ensure a default of 0 if no ratings

    def __str__(self):
        return self.name
class Address(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # Associate address with user
    street = models.CharField(max_length=255)  # Street address
    area = models.CharField(max_length=100)  # State

    def __str__(self):
        return f"{self.street}, {self.area}"
class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(
        max_length=50, 
        choices=[('pending', 'Pending'), ('completed', 'Completed'), ('canceled', 'Canceled')],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    address = models.ForeignKey(Address, on_delete=models.CASCADE , null=True, blank=False)  # Link to Address model
    confirmed = models.BooleanField(default=False)  # Order confirmation status
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    pending_at = models.DateTimeField(null=True, blank=True)
    @property
    def calculate_total_price(self):
        order_items = self.items.all()  # Correct: 'items' instead of 'orderitem_set'
        total_price = sum(item.dish.price * item.quantity for item in order_items)
        return total_price

    def __str__(self):
        return f"Order #{self.id} by {self.user.username} - {self.status}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    dish = models.ForeignKey('Dish', on_delete=models.CASCADE, related_name='order_items')
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.dish.name} (Order #{self.order.id})"

class Review(models.Model):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]  # Ratings from 1 to 5

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    dish = models.ForeignKey(Dish, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'dish')  
    def __str__(self):
        return f"{self.user.username} - {self.dish.name} - {self.rating}"
    
    
class DiscountCode(models.Model):
    code = models.CharField(max_length=50, unique=True)  # Unique discount code (e.g., "CHAMRAN1403")
    discount_percentage = models.PositiveIntegerField()  # Discount percentage (e.g., 20 for 20%)
    expiration_date = models.DateTimeField()  # Date and time when the discount code expires
    is_active = models.BooleanField(default=True)  # If the discount code is active
    used_count = models.PositiveIntegerField(default=0)
    max_usage_per_user = models.PositiveIntegerField(default=1)  # Max usage per user

    def is_valid(self):
        """Check if the discount code is still valid."""
        if self.expiration_date <= timezone.now():
            self.is_active = False  # Automatically deactivate the code if expired
            self.save()

        return (
            self.is_active and 
            self.expiration_date > timezone.now()
        )

    def __str__(self):
        return f"{self.code} - {self.discount_percentage}% off"

    def __str__(self):
        return f"{self.code} - {self.discount_percentage}% off"
    def use_code(self, user):
        """Use the discount code."""
        # Check if the discount code is valid
        if not self.is_valid():
            return False
        
        # Increment the total usage count for the discount code
        self.used_count += 1
        self.save()


        return True
class UserDiscount(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  # Associate with the user
    discount_code = models.ForeignKey(DiscountCode, on_delete=models.CASCADE)  # Associate with the discount code
    usage_count = models.PositiveIntegerField(default=0)  # Number of times this user has used the code