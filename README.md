# AcadTrace - Academic Intelligence Engine

AcadTrace is a premium Student Information System built with **FastAPI** (Backend) and **React** (Frontend), powered by a robust **PostgreSQL** database. It features modern glassmorphism design, atomic transactions via DB triggers, and secure role-based access.

## 🏗️ Project Structure
```text
d:\Projects\dbms\
├── schema.sql             # DB Tables & Relations
├── triggers.sql           # SQL Triggers for seat management & auditing
├── seed.sql               # Initial testing data (Admins/Students)
└── acadtrace\             # Main Web Application
    ├── backend\           # FastAPI Python Backend
    │   ├── main.py        # API Endpoints & Auth Logic
    │   ├── db.py          # DB Connection Pool
    │   └── .env           # DB Credentials (Update this!)
    └── frontend\          # React + Vite Frontend
        ├── src\           # React Components & Logic
        └── index.html     # Entry point
```

## 🚀 Setup & Execution

### 1. Database Configuration
1. Create a PostgreSQL database named `acadtrace`.
2. Execute the SQL scripts in this specific order:
   - `schema.sql` (Tables)
   - `triggers.sql` (Business Logic)
   - `seed.sql` (Test data)

### 2. Backend Setup (FastAPI)
1. Navigate to `acadtrace/backend`.
2. (Optional) Create a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn psycopg2-binary python-dotenv cors
   ```
4. Update `backend/.env` with your PostgreSQL `DB_PASSWORD`.
5. Start the server:
   ```bash
   python main.py
   ```

### 3. Frontend Setup (React)
1. Navigate to `acadtrace/frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 🔑 Default Credentials
- **Admin**: Username: `admin` | Password: `admin123`
- **Student**: Reg No: `2024CS01` | Password: `pass123`

## 💎 Features
- **Atomic Registration**: Database-level seat management prevents over-registration.
- **Audit Trails**: Every registration/drop action is logged with timestamps.
- **Modern UI**: Dark-mode glassmorphism with Framer Motion animations.
- **Secure Auth**: Role-based login for Admins and Students.
