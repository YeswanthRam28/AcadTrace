# AcadTrace - Academic Intelligence Engine

AcadTrace is a premium Student Information System built with **FastAPI** (Backend) and **React** (Frontend), powered by a serverless **NeonDB** database. It features modern glassmorphism design, atomic transactions via DB triggers, and secure role-based access.

## 🏗️ Project Structure
```text
AcadTrace/
├── schema.sql             # Core DB Tables & Relations
├── triggers.sql           # SQL Triggers for seat management & auditing
├── seed.sql               # Initial testing data (Admins/Students)
├── features.sql           # Extended features schema (Instructors, Grades, etc.)
├── migrate.py             # Database migration utility
└── acadtrace/             # Main Web Application
    ├── backend/           # FastAPI Python Backend
    │   ├── main.py        # API Endpoints & Extended Logic
    │   ├── db.py          # DB Connection Pool
    │   └── .env           # DB Credentials
    └── frontend/          # React + Vite Frontend
        ├── src/           # Components & Visual Effects (LightRays)
        └── index.html     # Entry point
```

## 🚀 Setup & Execution

### 1. Database Configuration
1. Set up a **NeonDB** project at [neon.tech](https://neon.tech).
2. Get your connection string and add it to `acadtrace/backend/.env` as `DATABASE_URL`.
3. Execute the SQL scripts to initialize the schema:
   - Use the Neon SQL Editor to run:
     - `schema.sql` (Tables)
     - `triggers.sql` (Business Logic)
     - `seed.sql` (Test data)
3. Run migrations for extended features:
   ```bash
   python migrate.py
   ```

### 2. Backend Setup (FastAPI)
1. Navigate to `acadtrace/backend`.
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn psycopg2-binary python-dotenv
   ```
3. Update `backend/.env` with your Neon `DATABASE_URL`.
4. Start the server:
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

### 🎓 Student Ecosystem
- **GPA Calculator**: Real-time CGPA tracking based on academic performance.
- **Dynamic Timetable**: Automated schedule generation with room and instructor details.
- **Enrollment Engine**: One-click registration with real-time seat availability checks.
- **Profile Hub**: Comprehensive student profile management (Bio, Contact, History).
- **Payment Portal**: Secure tracking of tuition fees and payment history.

### 👨‍💼 Administrative Suite
- **Instructor Management**: Dedicated portals to manage faculty and course assignments.
- **Grading Portal**: Direct interface for bulk grade entry and performance tracking.
- **Announcement System**: System-wide broadcast system for critical academic news.
- **Atomic Operations**: Database-level triggers ensure registration integrity and audit logging.

### ✨ Premium Experience
- **Glassmorphism UI**: High-fidelity dark mode interface with 16px blur backdrops.
- **LightRay Visuals**: Dynamic background light effects for a "Cyber-Genic" aesthetic.
- **Modern UX**: Smooth Framer Motion animations and Toast-based real-time feedback.
- **Full SEO**: Optimized semantic HTML and performance tuning.
