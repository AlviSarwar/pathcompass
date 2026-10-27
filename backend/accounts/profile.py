from academics.presets import create_default_scale

from .models import StudentProfile


def ensure_profile(user):
    """Return the user's profile, creating it (with a default grading scale) if missing."""
    try:
        profile = user.profile
    except StudentProfile.DoesNotExist:
        return StudentProfile.objects.create(user=user, grading_scale=create_default_scale(user))
    if profile.grading_scale_id is None:
        profile.grading_scale = create_default_scale(user)
        profile.save(update_fields=["grading_scale"])
    return profile
