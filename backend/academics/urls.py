from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (CourseViewSet, CreditPlanView, DashboardView, ReportPdfView, RetakeImpactView,
                    SafeZoneView, ScaleView, SemesterViewSet, TargetView)

router = DefaultRouter()
router.register("semesters", SemesterViewSet, basename="semester")
router.register("courses", CourseViewSet, basename="course")

urlpatterns = [
    path("scale/", ScaleView.as_view()),
    path("dashboard/", DashboardView.as_view()),
    path("target/", TargetView.as_view()),
    path("retake-impact/", RetakeImpactView.as_view()),
    path("safe-zone/", SafeZoneView.as_view()),
    path("credit-plan/", CreditPlanView.as_view()),
    path("report/pdf/", ReportPdfView.as_view()),
    path("", include(router.urls)),
]
