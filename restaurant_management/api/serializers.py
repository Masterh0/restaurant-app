from rest_framework import serializers
from main.models import Dish, Order, OrderItem, Category, CustomUser,Review,Address,DiscountCode,UserDiscount
from django.contrib.auth.hashers import make_password

class DishSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), allow_null=False, required=True)
    image = serializers.ImageField(use_url=True, required=False)
    categoryName = serializers.CharField(source='category.name', read_only=True)
    average_rating = serializers.ReadOnlyField()

    class Meta:
        model = Dish
        fields = ['id', 'name', 'description', 'category', 'categoryName', 'price', 'image', 'created_at', 'modified_at','average_rating']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError('Price must be a positive number.')
        return value

    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)
        if image:
            instance.image = image
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    
    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    dish_name = serializers.CharField(source='dish.name')
    dish_price = serializers.CharField(source='dish.price')
    class Meta:
        model = OrderItem
        fields = ['id', 'quantity', 'dish_name','dish_price']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }

    def validate(self, data):
        if 'new_password' in data and data['new_password']:
            data['password'] = make_password(data['new_password'])
        elif not data.get('password'):
            user = self.context['request'].user
            data['password'] = user.password
        return data

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class CustomerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    role = serializers.CharField(default='customer', read_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

class PendingOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    total_price = serializers.ReadOnlyField()
    address = serializers.CharField(allow_blank=True, allow_null=True)
    
    class Meta:
        model = Order
        fields = ['id', 'status', 'total_price', 'address', 'items', 'created_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['total_price'] = instance.calculate_total_price
        return representation

class TopDishSerializer(serializers.ModelSerializer):
    order_count = serializers.IntegerField(source='orderitem__count', read_only=True)
    category = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = Dish
        fields = ['id', 'name', 'price', 'description', 'category', 'order_count', 'images']

    def get_category(self, obj):
        return obj.category.name

    def get_images(self, obj):
        return obj.image.url if obj.image else None
    
class RateSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)  # نمایش نام کاربری
    dish_name = serializers.ReadOnlyField(source='dish.name')  # نمایش نام غذا

    class Meta:
        model = Review
        fields = ['id', 'user', 'dish', 'dish_name', 'rating', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
        
        
class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'user', 'street', 'area']
        read_only_fields = ['user']  # The user is read-only as it's assigned automatically

    def create(self, validated_data):
        user = self.context['request'].user  # Get the authenticated user
        validated_data['user'] = user  # Assign the current user to the address
        return super().create(validated_data)
class DiscountCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountCode
        fields = ['id', 'code', 'discount_percentage', 'expiration_date', 'is_active']
        
        
class ApplyDiscountCodeSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)

    def validate_code(self, value):
        # Ensure the code is not empty or malformed
        if not value.strip():
            raise serializers.ValidationError("Discount code cannot be empty.")
        
        try:
            # Check if the code exists
            discount_code = DiscountCode.objects.get(code=value)
            
            # Validate if the discount code is still valid (active, not expired)
            if not discount_code.is_valid():
                raise serializers.ValidationError("This discount code is expired or inactive.")
            
            return value  # return the value if valid

        except DiscountCode.DoesNotExist:
            raise serializers.ValidationError("Invalid discount code.")
    
class CompletedOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)  # Reference the related order items
    
    class Meta:
        model = Order
        fields = ['id', 'address', 'total_price', 'created_at', 'status', 'items']