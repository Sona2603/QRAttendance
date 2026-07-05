# QR Attendance Management System

Full-stack attendance system using React + Django REST Framework + PostgreSQL.

## Project Structure

```
├── backend/              # Django REST Framework API
│   ├── apps/
│   │   ├── authentication/   # User auth, JWT, RBAC
│   │   ├── departments/      # Department CRUD
│   │   ├── classrooms/       # Classroom CRUD
│   │   └── attendance/       # Sessions, QR, scanning, WebSocket
│   ├── core/             # Settings, URLs, ASGI
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
└── frontend/             # React + Vite + Tailwind
    └── src/
        ├── api/          # Axios service modules
        ├── components/   # Shared UI components
        ├── context/      # Auth + Theme context
        ├── hooks/        # usePagination
        ├── pages/        # admin/ teacher/ student/ auth/
        └── utils/        # helpers
```

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### 1. PostgreSQL
Create the database:
```sql
CREATE DATABASE qr_attendance;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE qr_attendance TO postgres;
```

### 2. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

pip install -r requirements.txt

# Edit .env with your DB credentials
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:5173

## API Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /api/auth/register/ | Public | Register |
| POST | /api/auth/login/ | Public | Login (returns JWT) |
| POST | /api/auth/refresh/ | Public | Refresh token |
| GET | /api/auth/profile/ | Any | Current user profile |
| GET/POST | /api/auth/users/ | Admin | List/create users |
| GET/PUT/DELETE | /api/auth/users/{id}/ | Admin | User detail |
| GET/POST | /api/departments/ | Any/Admin | Departments |
| GET/POST | /api/classrooms/ | Role-based | Classrooms |
| GET/POST | /api/attendance/sessions/ | Teacher/Admin | Sessions |
| POST | /api/attendance/scan/ | Student | Scan QR |
| GET | /api/attendance/ | Teacher/Admin | All attendance |
| GET | /api/attendance/history/ | Student | My history |
| GET | /api/attendance/stats/ | Admin | Dashboard stats |
| GET | /api/attendance/export/csv/ | Teacher/Admin | Export CSV |
| GET | /api/attendance/export/excel/ | Teacher/Admin | Export Excel |

## WebSocket
```
ws://localhost:8000/ws/attendance/{session_id}/
```
Broadcasts live attendance updates when students scan in.

## User Roles
- **ADMIN**: Full access — users, departments, classrooms, sessions, attendance, reports
- **TEACHER**: Own classrooms — create sessions, generate QRs, view attendance
- **STUDENT**: Scan QR, view own attendance history and percentage

## QR Code Flow
1. Teacher creates a session with an end time
2. Backend generates a UUID token and returns a base64 QR image
3. QR auto-refreshes in the UI every 30 seconds
4. Student scans QR with phone camera
5. Frontend decodes `{ session_id, token }` and posts to `/api/attendance/scan/`
6. Backend validates token, checks expiry, prevents duplicates, records status (PRESENT/LATE)
7. WebSocket broadcasts update to teacher's live view
