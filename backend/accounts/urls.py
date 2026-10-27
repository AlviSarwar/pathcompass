from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token

from .views import DemoView, ProfileView, RegisterView

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", obtain_auth_token),
    path("auth/demo/", DemoView.as_view()),
    path("profile/", ProfileView.as_view()),
]
