from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Document, Scholarship, TestScore
from .serializers import DocumentSerializer, ScholarshipSerializer, TestScoreSerializer

STARTER_DOCUMENTS = [
    "Academic transcript", "Statement of purpose (SOP)", "Recommendation letter 1", "Recommendation letter 2",
    "CV / resume", "Passport copy", "IELTS / TOEFL score report", "Bank statement / financial proof",
    "Certificates and awards",
]


class _Owned(viewsets.ModelViewSet):
    model = None

    def get_queryset(self):
        return self.model.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ScholarshipViewSet(_Owned):
    model = Scholarship
    serializer_class = ScholarshipSerializer


class TestScoreViewSet(_Owned):
    model = TestScore
    serializer_class = TestScoreSerializer


class DocumentViewSet(_Owned):
    model = Document
    serializer_class = DocumentSerializer

    @action(detail=False, methods=["post"])
    def seed(self, request):
        """Add the starter checklist. Items you already have are skipped."""
        have = {n.lower() for n in Document.objects.filter(user=request.user).values_list("name", flat=True)}
        new = [Document(user=request.user, name=n) for n in STARTER_DOCUMENTS if n.lower() not in have]
        Document.objects.bulk_create(new)
        return Response({"added": len(new)}, status=201)
