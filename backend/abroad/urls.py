from rest_framework.routers import SimpleRouter

from .views import DocumentViewSet, RecommendationViewSet, ScholarshipViewSet, TestScoreViewSet

router = SimpleRouter()
router.register("scholarships", ScholarshipViewSet, basename="scholarship")
router.register("test-scores", TestScoreViewSet, basename="testscore")
router.register("documents", DocumentViewSet, basename="document")
router.register("recommendations", RecommendationViewSet, basename="recommendation")
urlpatterns = router.urls
