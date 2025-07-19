from rest_framework import generics
from rest_framework.generics import ListCreateAPIView
from main.models import Dish, Order, OrderItem, Category, CustomUser,Review,Address,DiscountCode,UserDiscount
from .serializers import (
    DishSerializer,
    OrderSerializer,
    OrderItemSerializer,
    CategorySerializer,
    EmployeeSerializer,
    CustomerRegistrationSerializer,
    PendingOrderSerializer,
    RateSerializer,
    AddressSerializer,
    DiscountCodeSerializer,
    ApplyDiscountCodeSerializer,
    CompletedOrderSerializer,
)
from rest_framework.pagination import PageNumberPagination
from datetime import timedelta
from django.utils import timezone
from django.utils.timezone import now
from datetime import datetime
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.mixins import ListModelMixin, CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.generics import GenericAPIView, ListAPIView
from .permissions import IsManager, IsEmployee
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.hashers import make_password
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.authentication import TokenAuthentication
from django.shortcuts import get_object_or_404
from django.db.models import Count    
import logging
from rest_framework.exceptions import ValidationError
from django.db.models import Sum,F


logger = logging.getLogger(__name__)

class DishAPIView(
    GenericAPIView,
    ListModelMixin,
    CreateModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin,
    DestroyModelMixin
):
    permission_classes = [IsAuthenticated, IsManager]
    queryset = Dish.objects.all().order_by('-id')
    serializer_class = DishSerializer

    def get(self, request, *args, **kwargs):
        if 'pk' in kwargs:
            return self.retrieve(request, *args, **kwargs)
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        if 'image' not in request.data:
            request.data._mutable = True
            request.data['image'] = instance.image.name
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

class CategoryListAPIView(ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class CustomAuthTokenView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [TokenAuthentication]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({"error": "Both username and password are required."}, status=status.HTTP_400_BAD_REQUEST)
        user = CustomUser.objects.filter(username=username).first()
        if user and user.check_password(password):
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user_id": user.id,
                "username": user.username,
                "role": user.role
            }, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

class EmployeeAPIView(
    GenericAPIView,
    ListModelMixin,
    CreateModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin,
    DestroyModelMixin
):
    permission_classes = [IsAuthenticated, IsManager]
    queryset = CustomUser.objects.filter(role="employee").order_by("-id")
    serializer_class = EmployeeSerializer

    def get(self, request, *args, **kwargs):
        if "pk" in kwargs:
            return self.retrieve(request, *args, **kwargs)
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        if "role" not in data or data["role"] == "":
            data["role"] = "employee"
        if "password" in data and data["password"]:
            data["password"] = make_password(data["password"])
        serializer = EmployeeSerializer(data=data)
        if serializer.is_valid():
            user=serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        logger.debug("Received data for updating employee.")
        if "new_password" in data and data["new_password"]:
            data["password"] = make_password(data["new_password"])
        else:
            data["password"] = instance.password
        serializer = self.get_serializer(instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.debug(f"Employee updated successfully: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"Serializer validation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

class CustomerRegistrationAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = CustomerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(role='customer')
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'message': 'Customer registration successful!',
                'user': serializer.data,
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomerDishListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Dish.objects.all()
    serializer_class = DishSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    filterset_fields = ['category__name']
    search_fields = ['category__name']

    def get_queryset(self):
        queryset = super().get_queryset()
        category_name = self.request.query_params.get('category', None)
        if category_name and category_name != 'All':
            queryset = queryset.filter(category__name=category_name)
        return queryset

class CompleteOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        address_id = request.data.get('address')  # The address ID sent in the request
        items = request.data.get('items', [])

        # Check if items are provided
        if not items:
            return Response({"error": "No items provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Try to retrieve the address instance
        try:
            address = Address.objects.get(id=address_id, user=user)  # Ensure the address belongs to the current user
        except Address.DoesNotExist:
            return Response({"error": "Address not found or does not belong to the user"}, status=status.HTTP_400_BAD_REQUEST)

        total_price = 0
        # Create the order and associate the correct address
        order = Order.objects.create(user=user, address=address)

        for item in items:
            # Get the dish instance
            try:
                dish = Dish.objects.get(id=item['id'])
            except Dish.DoesNotExist:
                return Response({"error": f"Dish with id {item['id']} not found"}, status=status.HTTP_400_BAD_REQUEST)

            quantity = item['quantity']
            price = dish.price * quantity
            total_price += price

            # Create order item
            OrderItem.objects.create(order=order, dish=dish, quantity=quantity)

        # Update the total price of the order
        order.total_price = total_price
        order.save()

        return Response({"message": "Order completed successfully", "total_price": total_price})

class EmployeePendingOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pending_orders = Order.objects.filter(status='pending')
        serializer = PendingOrderSerializer(pending_orders, many=True)
        return Response(serializer.data)

    def patch(self, request, pk):
        order = Order.objects.get(pk=pk, status='pending')
        order.status = 'completed'
        order.save()
        return Response({'status': 'Order status updated to completed'}, status=status.HTTP_200_OK)

class UpdateOrderStatusView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PendingOrderSerializer

    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(user=user, status='pending')

    def patch(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        status_update = request.data.get('status')
        if status_update not in ['completed', 'canceled']:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        order.status = status_update
        order.save()
        return Response({"message": "Order status updated successfully"}, status=status.HTTP_200_OK)

class CompletedOrderListView(APIView):
    permission_classes = [IsAuthenticated,IsEmployee]

    def get(self, request, format=None):
        completed_orders = Order.objects.filter(status='completed')
        serializer = PendingOrderSerializer(completed_orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class TopOrderedDishesView(APIView):
    def get(self, request):
        top_dishes = (
            OrderItem.objects
            .values('dish__id', 'dish__name', 'dish__price')
            .annotate(order_count=Count('id'))
            .order_by('-order_count')[:5]
        )
        dish_ids = [dish['dish__id'] for dish in top_dishes]
        detailed_dishes = Dish.objects.filter(id__in=dish_ids)
        serializer = DishSerializer(detailed_dishes, many=True, context={'request': request})
        return Response({
            'top_dishes': serializer.data
        }, status=status.HTTP_200_OK)
class RateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        dish_id = kwargs.get('dish_id')

        if dish_id:
            # Retrieve reviews for a specific dish
            reviews = Review.objects.filter(dish_id=dish_id)
            # Check if the current user has rated this dish
            user_rating = Review.objects.filter(user=request.user, dish_id=dish_id).first()

            # If user has rated, return the user's rating
            if user_rating:
                return Response(
                    {"user_rating": user_rating.rating},
                    status=status.HTTP_200_OK
                )

            # If no rating found for the user, return a default value (e.g., 0)
            return Response(
                {"user_rating": 0},
                status=status.HTTP_200_OK
            )
        else:
            # Retrieve reviews for the current user if no dish_id is provided
            reviews = Review.objects.filter(user=request.user)

        serializer = RateSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        dish_id = kwargs.get('dish_id')
        if not dish_id:
            return Response({"error": "Dish ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = RateSerializer(data=request.data)
        
        if serializer.is_valid():
            dish = get_object_or_404(Dish, id=dish_id)
            # Check if the user has already rated this dish
            if Review.objects.filter(user=request.user, dish=dish).exists():
                raise ValidationError("You have already rated this dish.")
            serializer.save(user=request.user, dish=dish)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, *args, **kwargs):
            dish_id = kwargs.get('dish_id')
            if not dish_id:
                return Response({"error": "Dish ID is required."}, status=status.HTTP_400_BAD_REQUEST)

            dish = get_object_or_404(Dish, id=dish_id)
            # Check if the user has rated this dish
            review = Review.objects.filter(user=request.user, dish=dish).first()
            if not review:
                return Response({"error": "You have not rated this dish yet."}, status=status.HTTP_404_NOT_FOUND)

            serializer = RateSerializer(review, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        
class AddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Return only the addresses for the current authenticated user
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        # Deserialize the incoming data
        serializer = AddressSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            # No need to assign the user manually since the serializer takes care of it
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DiscountCodeListCreateView(ListCreateAPIView):
    queryset = DiscountCode.objects.all()
    serializer_class = DiscountCodeSerializer
    permission_classes = [IsAuthenticated, IsManager]  # Only managers can access this view

    def get(self, request, *args, **kwargs):
        """
        List all discount codes for the manager and mark expired codes as inactive.
        """
        # Fetch all discount codes
        discount_codes = self.queryset.all()

        # Check expiration for each discount code
        for code in discount_codes:
            # Check if the expiration date has passed and set is_active to False
            if code.expiration_date <= timezone.now() and code.is_active:
                code.is_active = False
                code.save()

        # Serialize the list of discount codes
        serializer = self.serializer_class(discount_codes, many=True)

        # Return the serialized data
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        """
    Create a new discount code.
    Ensure the expiration date is in the future and discount percentage is valid.
    """
        expiration_date_str = request.data.get('expiration_date')
        discount_percentage = request.data.get('discount_percentage')
        discount_percentage = int(discount_percentage)

    # Validate expiration date
        if expiration_date_str:
            try:
            # Parse expiration_date string to naive datetime object
                expiration_date = datetime.fromisoformat(expiration_date_str)

            # Make the expiration date aware by attaching the current timezone
                expiration_date = timezone.make_aware(expiration_date, timezone.get_current_timezone())

            except ValueError:
                return Response(
                    {"detail": "Invalid expiration date format."},
                    status=status.HTTP_400_BAD_REQUEST
            )   

        # Check if expiration date is in the future
            if expiration_date <= timezone.now():
                return Response(
                    {"detail": "Expiration date must be in the future."},
                    status=status.HTTP_400_BAD_REQUEST
                )

    # Validate discount percentage range
        if discount_percentage is not None and (discount_percentage <= 0 or discount_percentage > 100):
            return Response(
                {"detail": "Discount percentage must be between 1 and 100."},
                status=status.HTTP_400_BAD_REQUEST
            )

    # If all validations pass, create the discount code
        return self.create(request, *args, **kwargs)
    
    
class ApplyDiscountCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logger.info("Received request to apply discount code.")

        # Validate the request data with serializer
        serializer = ApplyDiscountCodeSerializer(data=request.data, context={'request': request})

        # Check if the serializer is valid
        if serializer.is_valid():
            logger.info("Serializer is valid. Attempting to apply discount code.")
            code = serializer.validated_data.get("code")
            user = request.user

            # Fetch the discount code from the database using the cleaned code
            discount_code = DiscountCode.objects.get(code=code)

            # Create or update the user's discount usage record
            user_discount, created = UserDiscount.objects.get_or_create(
                user=user,
                discount_code=discount_code
            )

            # Increment usage count
            user_discount.usage_count += 1
            user_discount.save()

            logger.info(
                "Discount code applied successfully for user %s. Code: %s, Discount Percentage: %s",
                user.username, discount_code.code, discount_code.discount_percentage
            )

            return Response({
                'message': 'Discount code applied successfully.',
                'discount_percentage': discount_code.discount_percentage,
            }, status=status.HTTP_200_OK)

        else:
            logger.error("Serializer validation failed. Errors: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class PendingOrdersAPIView(APIView):
    """
    API to fetch pending orders for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        logger.debug(f"Fetching pending orders for user: {user.username} (ID: {user.id})")

        try:
            # Fetch pending orders
            pending_orders = Order.objects.filter(user=user, status='pending').order_by('-created_at')
            data = []
            for order in pending_orders:
                # Retrieve items for each order
                order_items = OrderItem.objects.filter(order=order).select_related('dish')
                items_data = [
                    {
                        'dish_name': item.dish.name,
                        'quantity': item.quantity,
                    }
                    for item in order_items
                ]

                # Append order data
                data.append({
                    'id': order.id,
                    'address': str(order.address),
                    'total_price': float(order.total_price),
                    'created_at': order.created_at,
                    'pending_at': order.created_at,  # Include pending timestamp
                    'status': order.status,
                    'items': items_data,
                })

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching pending orders for user {user.username}: {str(e)}")
            return Response(
                {"error": "An error occurred while fetching pending orders."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CancelOrderAPIView(APIView):
    """
    API to allow users to cancel an order 30 minutes after its creation.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        order_id = request.data.get('order_id')
        logger.debug(f"User {user.username} requested to cancel order ID: {order_id}")

        try:
            # Check if the order exists and belongs to the user
            order = Order.objects.get(id=order_id, user=user)
        except Order.DoesNotExist:
            logger.error(f"Order ID {order_id} not found or does not belong to user {user.username}")
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if the order is pending
        if order.status != 'pending':
            logger.error(f"Order ID {order_id} is not in 'pending' status")
            return Response({"error": "Only pending orders can be canceled"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if 30 minutes have passed since the order was created
        time_elapsed = now() - order.created_at
        if time_elapsed < timedelta(minutes=30):
            logger.error(f"Order ID {order_id} cannot be canceled before 30 minutes of creation")
            return Response(
                {"error": "Order can only be canceled 30 minutes after it was created."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update the order status to 'canceled' (if not already canceled)
        if order.status != 'canceled':
            order.status = 'canceled'
            order.save()
            logger.info(f"Order ID {order_id} canceled successfully by user {user.username}")
            return Response({"message": "Order canceled successfully"}, status=status.HTTP_200_OK)

        logger.warning(f"Order ID {order_id} is already canceled")
        return Response({"error": "Order is already canceled"}, status=status.HTTP_400_BAD_REQUEST)
    
class CompletedOrdersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        logger.debug(f"Fetching pending orders for user: {user.username} (ID: {user.id})")

        try:
            # Fetch pending orders
            pending_orders = Order.objects.filter(user=user, status='completed').order_by('-created_at')
            data = []
            for order in pending_orders:
                # Retrieve items for each order
                order_items = OrderItem.objects.filter(order=order).select_related('dish')
                items_data = [
                    {
                        'dish_name': item.dish.name,
                        'quantity': item.quantity,
                    }
                    for item in order_items
                ]

                # Append order data
                data.append({
                    'id': order.id,
                    'address': str(order.address),
                    'total_price': float(order.total_price),
                    'created_at': order.created_at,
                    'pending_at': order.created_at,  # Include pending timestamp
                    'status': order.status,
                    'items': items_data,
                })

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching pending orders for user {user.username}: {str(e)}")
            return Response(
                {"error": "An error occurred while fetching pending orders."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TopOrderedDishesManagerView(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        # Get the top 5 ordered dishes with order count
        top_dishes = (
            OrderItem.objects
            .values('dish__id', 'dish__name', 'dish__price')
            .annotate(order_count=Count('id'))
            .order_by('-order_count')[:5]
        )

        # Get the detailed dish objects using the IDs
        dish_ids = [dish['dish__id'] for dish in top_dishes]
        detailed_dishes = Dish.objects.filter(id__in=dish_ids)

        # Prepare a list of dishes with order count
        top_dishes_with_count = []
        for dish in detailed_dishes:
            # Find the corresponding order_count from the query
            order_count = next(
                (item['order_count'] for item in top_dishes if item['dish__id'] == dish.id), 
                0
            )
            # Serialize the dish and add order count
            serialized_dish = DishSerializer(dish, context={'request': request}).data
            serialized_dish['order_count'] = order_count
            top_dishes_with_count.append(serialized_dish)

        return Response({
            'top_dishes': top_dishes_with_count
        }, status=status.HTTP_200_OK)
        
        
        
class OrdersInDateRangeView(APIView):
    permission_classes = [IsAuthenticated, IsManager]  # Ensure only managers can access this view

    def get(self, request):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        try:
            # Parse the date strings to datetime objects
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')

            # Filter orders based on the date range
            orders = Order.objects.filter(created_at__gte=start_date, created_at__lte=end_date)

            # Calculate total revenue in the given date range by aggregating the price from related Dish model
            total_revenue = OrderItem.objects.filter(order__in=orders).annotate(
                dish_price=F('dish__price')  # Accessing price from the related Dish model
            ).aggregate(total=Sum('dish_price'))['total'] or 0

            # Serialize the order items (details such as dish name, price, quantity, etc.)
            order_items = OrderItem.objects.filter(order__in=orders)
            order_item_serializer = OrderItemSerializer(order_items, many=True)

            return Response({
                'orders': order_item_serializer.data,
                'total_revenue': total_revenue
            }, status=status.HTTP_200_OK)
        
        except ValueError:
            return Response({'error': 'Invalid date format. Please use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)