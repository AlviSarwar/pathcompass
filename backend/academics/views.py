from decimal import Decimal, InvalidOperation

from django.db import transaction
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.profile import ensure_profile

from .models import Course, GradeBoundary, Semester
from .serializers import BoundarySerializer, CourseSerializer, ScaleSerializer, SemesterSerializer
from .services import build_dashboard, build_target, recalculate_grade_points


class SemesterViewSet(viewsets.ModelViewSet):
    serializer_class = SemesterSerializer

    def get_queryset(self):
        return Semester.objects.filter(user=self.request.user).order_by("order")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer

    def get_queryset(self):
        qs = Course.objects.filter(semester__user=self.request.user)
        sem = self.request.query_params.get("semester")
        if sem and sem.isdigit():
            qs = qs.filter(semester_id=int(sem))
        return qs


class ScaleView(APIView):
    def get(self, request):
        return Response(ScaleSerializer(ensure_profile(request.user).grading_scale).data)

    @transaction.atomic
    def put(self, request):
        profile = ensure_profile(request.user)
        ser = BoundarySerializer(data=request.data.get("boundaries", []), many=True)
        ser.is_valid(raise_exception=True)
        rows = ser.validated_data
        letters = [r["letter"].strip().upper() for r in rows]
        if not rows or len(set(letters)) != len(letters):
            return Response({"detail": "Provide at least one grade, with no repeated letters."}, status=400)
        scale = profile.grading_scale
        scale.boundaries.all().delete()
        GradeBoundary.objects.bulk_create(
            GradeBoundary(scale=scale, letter=l, point=r["point"], is_pass=r["is_pass"])
            for l, r in zip(letters, rows)
        )
        recalculate_grade_points(profile)
        return Response(ScaleSerializer(scale).data)


class DashboardView(APIView):
    def get(self, request):
        return Response(build_dashboard(ensure_profile(request.user)))


class TargetView(APIView):
    def get(self, request):
        profile = ensure_profile(request.user)
        raw = request.query_params.get("target", profile.target_cgpa)
        try:
            return Response(build_target(profile, Decimal(str(raw))))
        except (ValueError, InvalidOperation) as exc:
            return Response({"detail": str(exc) or "Invalid target."}, status=400)


# ---------- Phase 2 ----------
from django.http import HttpResponse  # noqa: E402

from .insights import build_credit_plan, build_retake_impact, build_safe_zone  # noqa: E402
from .report import build_pdf  # noqa: E402
from .services import scale_limits  # noqa: E402


class RetakeImpactView(APIView):
    def get(self, request):
        profile = ensure_profile(request.user)
        max_point, _ = scale_limits(profile)
        try:
            gp = Decimal(str(request.query_params.get("grade_point", max_point)))
            if not (0 < gp <= max_point):
                raise ValueError
        except (InvalidOperation, ValueError):
            return Response({"detail": f"Grade point must be above 0 and at most {max_point}."}, status=400)
        return Response(build_retake_impact(profile, gp))


class SafeZoneView(APIView):
    def get(self, request):
        return Response(build_safe_zone(ensure_profile(request.user)))


class CreditPlanView(APIView):
    def get(self, request):
        return Response(build_credit_plan(ensure_profile(request.user)))


class ReportPdfView(APIView):
    def get(self, request):
        profile = ensure_profile(request.user)
        dash = build_dashboard(profile)
        try:
            target = build_target(profile, profile.target_cgpa)
        except ValueError:
            target = None
        pdf = build_pdf(profile, dash, target, build_safe_zone(profile), build_credit_plan(profile))
        resp = HttpResponse(pdf, content_type="application/pdf")
        resp["Content-Disposition"] = 'attachment; filename="pathcompass-report.pdf"'
        return resp
