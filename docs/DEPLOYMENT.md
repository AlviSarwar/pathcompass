# Deployment guide

This is a reference for hosting PathCompass. I have not tested it against any specific host, so check each step against the host's current documentation.

## Backend (any host that runs Python and gunicorn, for example Render)

- Root directory: `backend`
- Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
- Start command: `gunicorn config.wsgi`
- Environment variables:
  - `DJANGO_SECRET_KEY`: a new long random value
  - `DEBUG`: `False`
  - `ALLOWED_HOSTS`: your backend's hostname
  - `CORS_ALLOWED_ORIGINS`: your frontend's full URL, for example `https://your-app.netlify.app`
  - `CSRF_TRUSTED_ORIGINS`: your backend's full URL (only needed for the Django admin)
  - `DATABASE_URL`: a PostgreSQL connection string. Without it the app uses SQLite, which is wiped on most free hosts.

Static files are served by WhiteNoise when `DEBUG` is `False`.

## Frontend (any static host, for example Netlify)

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL` set to your backend URL ending in `/api`
- `public/_redirects` makes page refreshes work on Netlify. Other hosts need an equivalent rewrite to `index.html`.

## Before going public

- Run `python manage.py check --deploy` with `DEBUG=False` and read its warnings.
- Serve everything over HTTPS only.
- The demo account is open to anyone. It is rate limited to 10 per hour per IP, and demo data is deleted after about a day.
- Do not reuse the development `.env` secret.
