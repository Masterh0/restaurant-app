from django.contrib import admin
from .models import Dish,Category,CustomUser,Order,OrderItem,Review,Address,DiscountCode
from django.contrib.auth.admin import UserAdmin

@admin.register(Dish)
class DishAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'image')
    list_filter = ('category',)
    search_fields = ('name',)
    ordering = ('name',)
    
    def formfield_for_dbfield(self, db_field, **kwargs):
        if db_field.name == "image":
            kwargs["widget"] = admin.widgets.AdminFileWidget()
        return super().formfield_for_dbfield(db_field, **kwargs)
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at', 'modified_at')  # ستون‌هایی که در لیست نمایش داده می‌شوند
    list_filter = ('is_active', 'created_at')  # فیلتر‌های سمت راست
    search_fields = ('name',)  # فیلد جستجو
    ordering = ('-created_at',)  # ترتیب پیش‌فرض
    readonly_fields = ('created_at', 'modified_at')  # فیلدهای فقط خواندنی


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Custom admin for the CustomUser model.
    """
    model = CustomUser
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'role')
    ordering = ('username',)
    readonly_fields = ('last_login', 'date_joined')

    # Add custom fields to the user admin form
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('email', 'first_name', 'last_name', 'role')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )

    # Add fields for the user creation form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'role', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )
    
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1  # تعداد فیلدهای خالی درون‌ها

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'address', 'total_price', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'address']
    inlines = [OrderItemInline]  # نمایش آیتم‌های سفارش در جزئیات

    def mark_as_completed(modeladmin, request, queryset):
        queryset.update(status='Completed')
    mark_as_completed.short_description = "Mark selected orders as completed"

    actions = [mark_as_completed]  # افزودن دکمه تایید یا لغو سفارش در پنل مدیریت
    
    
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'dish', 'rating', 'created_at')  # Columns to display in the admin list view
    list_filter = ('rating', 'created_at')  # Filter reviews by rating and created_at
    search_fields = ('user__username', 'dish__name')  # Allow searching by username and dish name
    ordering = ('-created_at',)  # Order by creation date (newest first)
    readonly_fields = ('user', 'dish', 'created_at')  # Make the user, dish, and created_at fields readonly in the form

# Register the Review model with the custom admin class
admin.site.register(Review, ReviewAdmin)

class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'street', 'area')  # Fields to display in the list view
    search_fields = ('street', 'area')  # Fields that can be searched in the admin interface
    list_filter = ('user',)  # Add filtering by user

# Register the Address model with the custom admin class
admin.site.register(Address, AddressAdmin)

class DiscountCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percentage', 'expiration_date', 'is_active', 'is_valid','max_usage_per_user')
    list_filter = ('is_active', 'expiration_date')
    search_fields = ('code',)

admin.site.register(DiscountCode, DiscountCodeAdmin)