# TaskFlow — Employee Daily Task System

A production-ready full-stack employee productivity application.

## Tech Stack

| Layer       | Technology            |
|-------------|----------------------|
| Frontend    | Next.js 15 (App Router) |
| Backend     | Python Flask          |
| Database    | MongoDB               |
| Auth        | JWT + bcrypt          |
| State       | Zustand               |
| HTTP Client | Axios                 |

---

## Project Structure

```
Employee_Task/
├── backend/               # Flask REST API
│   ├── app.py
│   ├── config/            # DB + settings
│   ├── controllers/       # Business logic
│   ├── middleware/        # JWT auth, error handling
│   ├── models/            # Document schemas
│   ├── routes/            # API routes
│   ├── utils/             # Helpers, validators
│   ├── .env
│   └── requirements.txt
│
└── frontend/              # Next.js 15 App
    ├── app/
    │   ├── (auth)/        # login, register
    │   └── (app)/         # dashboard, tasks, history, analytics, settings
    ├── components/
    ├── context/           # AuthContext
    ├── hooks/             # useTasks
    ├── services/          # Axios API services
    ├── store/             # Zustand stores
    ├── styles/            # theme.css
    └── utils/
```

---

## Setup & Run

### 1. Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment (already set)
# Edit .env if needed

# Run
python app.py
```

Backend runs at: **http://localhost:5000**

### 2. Frontend

```bash
cd frontend

# Install dependencies (already done)
npm install

# Configure environment
# Edit .env.local — set NEXT_PUBLIC_API_URL=http://localhost:5000

# Run dev server
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## Environment Variables

### Backend `.env`
```
MONGODB_URI=mongodb://mongo_root:Pp847060@76.13.246.78:27017/?directConnection=true
DATABASE_NAME=employee_task_system
JWT_SECRET=your_jwt_secret
JWT_EXPIRY_HOURS=24
FLASK_ENV=development
PORT=5000
CORS_ORIGINS=http://localhost:3000
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## API Endpoints

| Method | Endpoint                     | Description          |
|--------|------------------------------|----------------------|
| POST   | /api/auth/register           | Register             |
| POST   | /api/auth/login              | Login                |
| GET    | /api/auth/me                 | Get current user     |
| PUT    | /api/auth/me                 | Update profile       |
| PUT    | /api/auth/password           | Change password      |
| GET    | /api/tasks/today             | Today's tasks        |
| GET    | /api/tasks/date/:date        | Tasks by date        |
| POST   | /api/tasks                   | Create task          |
| PUT    | /api/tasks/:id               | Update task          |
| DELETE | /api/tasks/:id               | Delete task          |
| PATCH  | /api/tasks/:id/toggle        | Toggle complete      |
| GET    | /api/goals/today             | Today's goal         |
| POST   | /api/goals                   | Create/update goal   |
| PUT    | /api/goals/:id               | Update goal          |
| GET    | /api/history                 | History dates list   |
| GET    | /api/history/:date           | Day detail           |
| GET    | /api/analytics/weekly        | 7-day analytics      |
| GET    | /api/analytics/monthly       | 30-day analytics     |
| GET    | /api/analytics/stats         | All-time stats       |

---

## Features

- ✅ JWT Authentication (register / login)
- ✅ Daily task CRUD with priority levels
- ✅ One-click task toggle (complete / pending)
- ✅ Final Goal per day
- ✅ Historical date view with full detail
- ✅ Weekly & Monthly analytics with charts
- ✅ Streak counter
- ✅ PDF daily report export
- ✅ Search & filter tasks
- ✅ Dark mode premium UI
- ✅ Responsive (mobile / tablet / desktop)
- ✅ Loading skeletons & empty states
- ✅ Toast notifications
- ✅ Confirmation dialogs
