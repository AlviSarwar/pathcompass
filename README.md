# PathCompass

![CI](https://github.com/AlviSarwar/pathcompass/actions/workflows/ci.yml/badge.svg)

A CGPA, academic-performance and career planner for university students in Bangladesh. It answers questions like "what GPA do I need in the remaining credits to finish with 3.50?" and "which retake raises my CGPA the most?", and it tracks internships, projects, scholarships and study-abroad documents in the same place.

Every academic number comes from a small, tested Python engine. No AI model produces a CGPA or a target.

## Features

- **CGPA engine**: credit-weighted GPA and CGPA, an editable grading scale, and three retake policies (latest attempt, highest grade, all attempts).
- **Target calculator**: the average GPA you need over your remaining credits, with an honest "not achievable" answer, plus illustrative what-if scenarios.
- **Retake impact**: ranks which retake would raise your CGPA the most, following your own retake policy.
- **"What if I fail this course?" calculator**, a safe-zone meter (probation and Dean's List lines you configure), and a credit-per-semester planner.
- **Career trackers**: skills with progress bars, project portfolio, internship applications, scholarships.
- **Study-abroad trackers**: IELTS/TOEFL/GRE scores with range validation, document checklist, recommendation letters, graduation-requirements checklist.
- **Dashboard deadline reminders** across applications, scholarships, documents and letters.
- **CSV import** with a downloadable template. Every row is validated first, and nothing is saved if any row is wrong.
- **PDF report**, dark mode, a labelled demo account with sample data, and a first-pass Bangla/English toggle.

## Tech stack

| Layer | Tools |
| --- | --- |
| Backend | Python 3.13, Django 6, Django REST Framework, token authentication |
| Database | SQLite by default, PostgreSQL through `DATABASE_URL` |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Recharts, React Router |
| Quality | pytest and pytest-django, TypeScript strict mode, GitHub Actions |

## How it is organised

    backend/
      academics/   engine.py (pure Python CGPA maths), services, insights, csv_import, report (PDF)
      accounts/    registration, login, demo account, student profile and settings
      careers/     skills, projects, applications
      abroad/      scholarships, test scores, documents, recommendation letters
      planning/    graduation requirements, deadlines
    frontend/
      src/pages/       one file per screen
      src/components/  shared UI, generic tracker table, cards

The key design choice is that `academics/engine.py` has no database or framework code. It uses `Decimal` throughout, rounds half up, and rounds a required GPA up so it never understates what you need. The API layer only fetches data and calls the engine.

## Run it locally (Windows PowerShell)

You need Python 3.12+, Node.js 20+ and Git.

    git clone https://github.com/AlviSarwar/pathcompass.git
    cd pathcompass

    # Backend
    cd backend
    python -m venv .venv
    .\.venv\Scripts\python.exe -m pip install -r requirements.txt
    cd ..
    copy .env.example .env      # then put a long random value in DJANGO_SECRET_KEY
    cd backend
    .\.venv\Scripts\python.exe manage.py migrate
    cd ..

    # Frontend
    cd frontend
    npm install
    cd ..

    # Start both servers
    powershell -ExecutionPolicy Bypass -File scripts\dev.ps1

Open http://localhost:5173 and press **Try the demo** to see it with sample data.

## Tests and checks

    powershell -ExecutionPolicy Bypass -File scripts\check.ps1

This runs the Django system check, verifies that migrations are committed, runs the pytest suite, type-checks the frontend and builds it. GitHub Actions runs the same checks on every push.

The tests cover the CGPA maths (including rounding and retake rules), input validation, and that one user can never read or change another user's data.

## API overview

All endpoints are under `/api/` and need `Authorization: Token <token>` except the auth ones.

| Area | Endpoints |
| --- | --- |
| Auth | `auth/register/`, `auth/login/`, `auth/demo/` (rate limited) |
| Academics | `profile/`, `scale/`, `semesters/`, `courses/`, `dashboard/`, `target/`, `what-if/`, `retake-impact/`, `safe-zone/`, `credit-plan/`, `report/pdf/`, `import/template/`, `import/courses/` |
| Careers | `skills/`, `projects/`, `applications/` |
| Study abroad | `scholarships/`, `test-scores/`, `documents/` (and `documents/seed/`), `recommendations/` |
| Planning | `requirements/`, `deadlines/` |

## Known limitations

- The default grading scale is a common Bangladesh-style 4.00 scale. It is editable, and you should check it against your own university's policy.
- Probation and Dean's List thresholds are user settings, not official rules, and are compared against CGPA only.
- The login token is kept in `localStorage`, which is simple but exposed if the site ever has an XSS bug. Httponly cookies are the safer next step.
- Graduation-requirement progress is entered by hand and is not linked to courses yet.
- Bangla covers the navigation, login and dashboard only. There are no email reminders and no offline mode yet.
- List endpoints are not paginated, which is fine for one student's data.

## Roadmap

Link requirement groups to courses, email deadline reminders, a PWA, full Bangla translation, and a deployed demo. See `docs/DEPLOYMENT.md`.
