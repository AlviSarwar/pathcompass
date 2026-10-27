from rest_framework.routers import SimpleRouter

from .views import ApplicationViewSet, ProjectViewSet, SkillViewSet

router = SimpleRouter()
router.register("skills", SkillViewSet, basename="skill")
router.register("projects", ProjectViewSet, basename="project")
router.register("applications", ApplicationViewSet, basename="application")
urlpatterns = router.urls
