from rest_framework.authtoken.models import Token
from main.models import CustomUser  # Replace with the path to your user model

# Replace 'admin_username' with your superuser's username
admin_user = CustomUser.objects.get(username='manager')
token, created = Token.objects.get_or_create(user=admin_user)

print(f"Token for {admin_user.username}: {token.key}")
