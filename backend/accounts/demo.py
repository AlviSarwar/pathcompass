import uuid
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone

from academics.models import Course, Semester

from .profile import ensure_profile

# Clearly SAMPLE data. Letters must exist in the default 4.00 scale.
DEMO = [
    ("Sample Sem 1", 1, False, [("CSE101", "Intro to Programming", "3.0", "C"), ("MAT101", "Calculus I", "3.0", "B"),
                                ("ENG101", "English Composition", "3.0", "A-"), ("PHY101", "Physics I", "3.0", "B+")]),
    ("Sample Sem 2", 2, False, [("CSE102", "Data Structures", "3.0", "B+"), ("MAT102", "Calculus II", "3.0", "B"),
                                ("STA201", "Statistics", "3.0", "A"), ("EEE101", "Basic Electronics", "3.0", "B-")]),
    ("Sample Sem 3", 3, False, [("CSE101", "Intro to Programming (retake)", "3.0", "A-"),
                                ("CSE201", "Algorithms", "3.0", "B"), ("CSE203", "Databases", "3.0", "A")]),
    ("Sample Sem 4 (planned)", 4, True, [("CSE202", "Operating Systems", "3.0", ""),
                                         ("CSE204", "Networks", "3.0", ""), ("CSE206", "Software Engineering", "3.0", "")]),
]


def create_demo_user():
    User = get_user_model()
    User.objects.filter(profile__is_demo=True, date_joined__lt=timezone.now() - timedelta(days=1)).delete()
    user = User.objects.create_user(username=f"demo_{uuid.uuid4().hex[:10]}")
    profile = ensure_profile(user)
    profile.is_demo = True
    profile.total_credits_required = Decimal("120")
    profile.target_cgpa = Decimal("3.50")
    profile.save()
    lookup = {b.letter: b for b in profile.grading_scale.boundaries.all()}
    for name, order, planned, courses in DEMO:
        sem = Semester.objects.create(user=user, name=name, order=order, is_planned=planned)
        for code, title, credits, letter in courses:
            b = lookup.get(letter)
            Course.objects.create(semester=sem, code=code, title=title, credits=Decimal(credits),
                                  letter_grade=letter, grade_point=b.point if b else None,
                                  is_pass=b.is_pass if b else True,
                                  status="planned" if planned else "completed")
    return user
