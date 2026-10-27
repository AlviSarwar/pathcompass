from rest_framework.routers import SimpleRouter

from .views import SkillViewSet

router = SimpleRouter()
router.register("skills", SkillViewSet, basename="skill")
urlpatterns = router.urls
