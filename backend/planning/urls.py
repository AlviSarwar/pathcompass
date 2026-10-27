from django.urls import path
from rest_framework.routers import SimpleRouter

from .views import DeadlinesView, RequirementViewSet

router = SimpleRouter()
router.register("requirements", RequirementViewSet, basename="requirement")

urlpatterns = [path("deadlines/", DeadlinesView.as_view()), *router.urls]
