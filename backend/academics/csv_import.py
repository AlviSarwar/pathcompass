"""CSV import. Validates EVERY row first; nothing is saved unless all rows are valid."""
import csv
from decimal import Decimal, InvalidOperation
from io import StringIO

from django.db import transaction

from .models import Course, Semester

TEMPLATE = (
    "semester,order,code,title,credits,letter_grade,status\n"
    "Spring 2025,1,CSE101,Intro to Programming,3,A,completed\n"
    "Spring 2025,1,MAT101,Calculus I,3,B+,completed\n"
    "Fall 2025,2,CSE102,Data Structures,3,,planned\n"
)
MAX_CHARS = 200_000
MAX_ROWS = 500
STATUSES = {c.value for c in Course.Status}


def import_courses(user, profile, text):
    """Returns (imported_count, errors). errors is empty on success."""
    text = text.lstrip("\ufeff")
    if len(text) > MAX_CHARS:
        return 0, ["File is too large (limit about 200 KB)."]
    reader = csv.DictReader(StringIO(text))
    if not reader.fieldnames:
        return 0, ["The file is empty."]
    reader.fieldnames = [h.strip().lower() for h in reader.fieldnames]
    missing = {"semester", "code", "credits"} - set(reader.fieldnames)
    if missing:
        return 0, [f"Missing column(s): {', '.join(sorted(missing))}. Download the template and use its header row."]

    lookup = {b.letter.upper(): b for b in profile.grading_scale.boundaries.all()}
    existing = {s.name.lower(): s for s in Semester.objects.filter(user=user)}
    taken_orders = {s.order for s in existing.values()}
    existing_codes = {(c.semester_id, c.code.upper()) for c in Course.objects.filter(semester__user=user)}
    next_order = max(taken_orders, default=0) + 1
    new_sems, rows, seen, errors = {}, [], set(), []

    for line, raw in enumerate(reader, start=2):
        if len(rows) + len(errors) >= MAX_ROWS:
            errors.append(f"Too many rows (limit {MAX_ROWS}).")
            break
        row = {k: (v or "").strip() for k, v in raw.items() if k}
        problems = []
        sem_name, code = row.get("semester", ""), row.get("code", "").upper()
        title, letter = row.get("title", ""), row.get("letter_grade", "").upper()
        if not sem_name or len(sem_name) > 60:
            problems.append("semester is empty or longer than 60 characters")
        if not code or len(code) > 20:
            problems.append("code is empty or longer than 20 characters")
        if len(title) > 150:
            problems.append("title is longer than 150 characters")
        credits = None
        try:
            credits = Decimal(row.get("credits", ""))
            if not (Decimal("0.5") <= credits <= 20) or credits != credits.quantize(Decimal("0.1")):
                raise InvalidOperation
        except InvalidOperation:
            problems.append("credits must be between 0.5 and 20 with at most one decimal")
        status = row.get("status", "").lower() or ("completed" if letter else "planned")
        if status not in STATUSES:
            problems.append(f"status must be one of {sorted(STATUSES)}")
        elif status == "completed" and not letter:
            problems.append("a completed course needs a letter grade")
        if letter and letter not in lookup:
            problems.append(f"grade '{letter}' is not in your grading scale")
        order = None
        if row.get("order"):
            if row["order"].isdigit() and int(row["order"]) >= 1:
                order = int(row["order"])
            else:
                problems.append("order must be a whole number, 1 or more")
        key = sem_name.lower()
        if (key, code) in seen:
            problems.append("duplicate course in this semester inside the file")
        sem = existing.get(key)
        if sem and (sem.id, code) in existing_codes:
            problems.append("this course already exists in that semester")
        if not sem and key not in new_sems and not problems:
            order = order if order is not None else next_order
            if order in taken_orders:
                problems.append(f"semester order {order} is already used")
            else:
                taken_orders.add(order)
                next_order = max(next_order, order + 1)
                new_sems[key] = {"name": sem_name, "order": order, "all_planned": True}
        if problems:
            errors.append(f"Line {line}: " + "; ".join(problems))
            continue
        seen.add((key, code))
        if key in new_sems and status != "planned":
            new_sems[key]["all_planned"] = False
        rows.append((key, code, title, credits, letter, status))

    if not rows and not errors:
        errors.append("No course rows found.")
    if errors:
        return 0, errors[:20]

    with transaction.atomic():
        created = {k: Semester.objects.create(user=user, name=v["name"], order=v["order"],
                                              is_planned=v["all_planned"]) for k, v in new_sems.items()}
        for key, code, title, credits, letter, status in rows:
            b = lookup.get(letter)
            Course.objects.create(semester=existing.get(key) or created[key], code=code, title=title,
                                  credits=credits, letter_grade=letter,
                                  grade_point=b.point if b else None, is_pass=b.is_pass if b else True,
                                  status=status)
    return len(rows), []
