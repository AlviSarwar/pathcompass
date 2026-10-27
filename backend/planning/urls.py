from rest_framework.routers import SimpleRouter

from .views import RequirementViewSet

router = SimpleRouter()
router.register("requirements", RequirementViewSet, basename="requirement")
urlpatterns = router.urls
