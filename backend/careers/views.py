from rest_framework import viewsets

from .models import Skill
from .serializers import SkillSerializer


class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer

    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


from .models import Application, Project  # noqa: E402
from .serializers import ApplicationSerializer, ProjectSerializer  # noqa: E402


class _Owned(viewsets.ModelViewSet):
    model = None

    def get_queryset(self):
        return self.model.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProjectViewSet(_Owned):
    model = Project
    serializer_class = ProjectSerializer


class ApplicationViewSet(_Owned):
    model = Application
    serializer_class = ApplicationSerializer
