from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token

from .views import ProfileView, RegisterView

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", obtain_auth_token),
    path("profile/", ProfileView.as_view()),
]
