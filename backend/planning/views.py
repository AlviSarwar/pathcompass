from rest_framework import viewsets

from .models import Requirement
from .serializers import RequirementSerializer


class RequirementViewSet(viewsets.ModelViewSet):
    serializer_class = RequirementSerializer

    def get_queryset(self):
        return Requirement.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


from datetime import timedelta  # noqa: E402

from django.utils import timezone  # noqa: E402
from rest_framework.response import Response  # noqa: E402
from rest_framework.views import APIView  # noqa: E402

from abroad.models import Document, Recommendation, Scholarship  # noqa: E402
from careers.models import Application  # noqa: E402

# (model, date field, statuses that still need action, label, frontend route, title builder)
SOURCES = [
    (Application, "deadline", ("wishlist",), "Application", "/applications", lambda o: f"{o.company}: {o.role}"),
    (Scholarship, "deadline", ("researching", "preparing"), "Scholarship", "/scholarships", lambda o: o.name),
    (Document, "due_date", ("todo", "in_progress"), "Document", "/documents", lambda o: o.name),
    (Recommendation, "due_date", ("to_ask", "asked", "agreed"), "Recommendation", "/recommendations",
     lambda o: f"Letter from {o.recommender}"),
]


class DeadlinesView(APIView):
    """Open items due within `days` (default 14), plus anything already overdue."""

    def get(self, request):
        try:
            days = int(request.query_params.get("days", 14))
        except ValueError:
            days = 0
        if not 1 <= days <= 90:
            return Response({"detail": "days must be a whole number from 1 to 90."}, status=400)
        today = timezone.localdate()
        end = today + timedelta(days=days)
        items = []
        for model, field, open_statuses, kind, path, title in SOURCES:
            rows = model.objects.filter(user=request.user, status__in=open_statuses,
                                        **{f"{field}__isnull": False, f"{field}__lte": end})
            for o in rows:
                d = getattr(o, field)
                left = (d - today).days
                items.append({"kind": kind, "title": title(o), "date": d.isoformat(), "days_left": left,
                              "overdue": left < 0, "path": path})
        items.sort(key=lambda i: i["date"])
        return Response(items[:50])
