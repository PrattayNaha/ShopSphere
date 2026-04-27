# EcommerceProject — Documentation

## Project Overview
- **Type:** Full-stack e-commerce application
- **Backend:** Django REST API (Django 6.x)
- **Frontend:** React (Vite)
- **Database:** SQLite (development)
- **Auth:** JWT via `djangorestframework-simplejwt`
- **Payments:** Stripe integration (webhook present)
- **Media:** Uploaded product images stored under `media/products/`

## Repository layout (important folders)
- `backend/` — Django project and apps
  - `backend/` — Django project settings and WSGI/ASGI
  - `accounts/` — Custom user model, auth, profile, password reset
  - `products/` — Categories, subcategories, products models and APIs
  - `orders/` — Cart, order models, Stripe webhook and order flows
  - `db.sqlite3` — local development database
  - `requirements.txt` — Python dependencies
- `frontend/` — React + Vite app
  - `src/` — React source code, routes (`App.jsx`), components
  - `public/` and `assets/` — static resources and images
  - `package.json` — frontend dependencies & scripts

## Key configuration notes
- Backend settings: [backend/backend/settings.py](backend/backend/settings.py#L1)
  - `AUTH_USER_MODEL` is `accounts.User`.
  - `MEDIA_ROOT` set to `media/` and served via `urlpatterns += static(...)` in project urls.
  - REST framework configured with JWT authentication and filters; some setting keys contain typos (e.g., `DeFAULT_PAGINATION_CLASS`, `REFREST_TOKEN_LIFETIME`) — verify before production.
  - Stripe keys are currently present in settings (replace with env variables in production).
- Dependencies (backend): see [backend/requirements.txt](backend/requirements.txt#L1-L20)
  - Includes `djangorestframework`, `djangorestframework-simplejwt`, `django-filter`, `stripe`, and `reportlab`.
- Frontend dependencies: see [frontend/package.json](frontend/package.json#L1-L80)
  - Uses `axios`, `react-router-dom`, `@stripe/react-stripe-js`, `html2pdf.js`, etc.

## How to run (development)
- Backend (assumes Python venv activated):

  - Install dependencies:

    pip install -r backend/requirements.txt

  - Apply migrations and run server:

    cd backend
    python manage.py migrate
    python manage.py runserver

  - Media files are served in DEBUG mode by static config

- Frontend:

  - Install and run dev server:

    cd frontend
    npm install
    npm run dev

  - The frontend expects the backend API under `/api/` as configured in Django `urlpatterns`.

## Main Django apps & important models
- `accounts` (auth/profile)
  - Register, login, token refresh, profile endpoints (see `accounts/urls.py`):
    - `api/register/`, `api/login/`, `api/profile/`, password reset endpoints
- `products` (catalog)
  - Models: `Category`, `SubCategory`, `Product` — see [products/models.py](backend/products/models.py#L1-L200)
  - `Product.save()` auto-generates slug if missing
- `orders` (cart & orders)
  - Models: `Cart`, `CartItem`, `Order`, `OrderItem` — see [orders/models.py](backend/orders/models.py#L1-L300)
  - Stripe webhook entrypoint: `stripe-webhook/` mapped in project urls

## Frontend overview
- Router and pages defined in `frontend/src/App.jsx` — routes for public pages and a protected `/vendor` area.
- `Topbar` component implements search suggestions, cart badge, profile dropdown — see [frontend/src/components/Topbar.jsx](frontend/src/components/Topbar.jsx#L1-L400).
- `main.jsx` wraps `App` with `CartProvider` context and `BrowserRouter`.

## API endpoints (high level)
- Base prefix: `/api/`
- Accounts/auth: `/api/register/`, `/api/login/`, `/api/refresh/`, `/api/profile/`, `/api/addresses/` etc.
- Products and orders endpoints included under `/api/` via their app `urls.py` files.
- Stripe webhook: `/stripe-webhook/` (registered in `backend/backend/urls.py`).

## Notable implementation details & TODOs
- There are several typos in `settings.py` for REST and JWT keys; fix them for expected behavior.
- Secret keys and Stripe secrets are stored in settings — move these to environment variables and `.env` (project already loads dotenv).
- Pagination and throttle settings appear mis-keyed (typos) — verify tests and API behavior.
- Product image uploads go to `media/products/` and are served in DEBUG mode only.

## Testing & data
- Some tests exist in app `tests.py` files; run `python manage.py test` in `backend/` to execute.

## Assets & media
- Sample images present in `media/products/` (e.g., `images.jfif`, `17.jfif`).

## Converting this documentation to PDF
- I added a simple script to attempt conversion using `pandoc` (if installed) — see `docs/convert_to_pdf.bat`.
- Alternative: frontend includes `html2pdf.js` which can generate PDFs client-side from HTML.
- If you want, I can attempt to convert this Markdown into a PDF here if the workspace environment provides `pandoc` or `wkhtmltopdf` — tell me to proceed.

---

### Files I created
- [docs/Project_Documentation.md](docs/Project_Documentation.md#L1)
- [docs/convert_to_pdf.bat](docs/convert_to_pdf.bat#L1)


If you'd like, I can now try to convert the Markdown to a PDF in-place (will check for `pandoc`) or produce a formatted PDF-ready HTML and convert using a headless browser — tell me which you prefer.