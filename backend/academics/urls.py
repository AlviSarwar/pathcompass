from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (CourseViewSet, CreditPlanView, DashboardView, ImportCoursesView, ImportTemplateView,
                    ReportPdfView, RetakeImpactView, SafeZoneView, ScaleView, SemesterViewSet, TargetView,
                    WhatIfView)

router = DefaultRouter()
router.register("semesters", SemesterViewSet, basename="semester")
router.register("courses", CourseViewSet, basename="course")

urlpatterns = [
    path("scale/", ScaleView.as_view()),
    path("dashboard/", DashboardView.as_view()),
    path("target/", TargetView.as_view()),
    path("retake-impact/", RetakeImpactView.as_view()),
    path("what-if/", WhatIfView.as_view()),
    path("safe-zone/", SafeZoneView.as_view()),
    path("credit-plan/", CreditPlanView.as_view()),
    path("report/pdf/", ReportPdfView.as_view()),
    path("import/template/", ImportTemplateView.as_view()),
    path("import/courses/", ImportCoursesView.as_view()),
    path("", include(router.urls)),
]
