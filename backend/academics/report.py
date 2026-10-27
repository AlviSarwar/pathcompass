from datetime import date
from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def fmt(v):
    return "-" if v is None else f"{v:.2f}"


def _table(rows, widths=None):
    t = Table(rows, colWidths=widths, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t


def build_pdf(profile, dash, target, zone, plan) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, title="PathCompass report",
                            leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    st = getSampleStyleSheet()
    body = st["BodyText"]
    story = [
        Paragraph("PathCompass academic report", st["Title"]),
        Paragraph(escape(f"{profile.user.get_username()} | {profile.university or 'University not set'} | "
                         f"{profile.department or 'Department not set'} | {date.today().isoformat()}"), body),
        Spacer(1, 10),
        Paragraph("Summary", st["Heading2"]),
        _table([
            ["Item", "Value"],
            ["Current CGPA", fmt(dash["cgpa"])],
            ["Target CGPA", fmt(dash["target_cgpa"])],
            ["Credits earned / required", f"{dash['credits_earned']} / {dash['total_credits_required']}"],
            ["Credits remaining", str(dash["credits_remaining"])],
            ["Safe-zone status", zone["status"].replace("_", " ")],
        ], [200, 200]),
        Spacer(1, 8),
        Paragraph(escape(zone["message"]), body),
        Spacer(1, 10),
        Paragraph("Semester results", st["Heading2"]),
    ]
    sem_rows = [["Semester", "Credits", "GPA", "CGPA after"]]
    sem_rows += [[s["name"], str(s["credits"]), fmt(s["gpa"]), fmt(s["cgpa"])] for s in dash["semesters"]]
    story.append(_table(sem_rows, [200, 70, 70, 80]))
    if target:
        story += [Spacer(1, 10), Paragraph("Target analysis", st["Heading2"]), Paragraph(escape(target["message"]), body)]
    story += [Spacer(1, 10), Paragraph("Credit plan", st["Heading2"])]
    plan_rows = [["Semester", "Credits", "Limit", "Status"]]
    plan_rows += [[s["name"], str(s["credits"]), str(plan["max_per_semester"]), s["status"]] for s in plan["semesters"]]
    story.append(_table(plan_rows, [200, 70, 70, 80]))
    story.append(Paragraph(f"Minimum semesters still needed at your credit limit: {plan['min_semesters_needed']}", body))
    for w in dash["warnings"]:
        story.append(Paragraph(escape("Note: " + w), body))
    story += [Spacer(1, 12), Paragraph(escape(dash["explanation"]), body), Spacer(1, 8),
              Paragraph("Calculated from the data you entered and the grading scale in your settings. "
                        "Always verify against your official transcript and university rules.", body)]
    doc.build(story)
    return buf.getvalue()
