# AcadTrace: Academic Intelligence Portal

AcadTrace is a modern, full-stack Academic Management System designed for colleges to manage student enrollments, course offerings, grading, and administrative workflows with a premium, high-performance interface.

## 🚀 Key Features

### 👨‍🎓 Student Portal
- **Enrollment System:** Real-time course discovery and one-click registration.
- **Academic History:** Track all registration and drop actions with a persistent history log.
- **Interactive Timetable:** View your weekly class schedule with room and instructor details.
- **Course Reviews:** Rate and comment on courses after completion.
- **Financial Module:** Transparent fee tracking and payment history.
- **Profile Management:** Update personal bios, contact information, and mailing addresses.

### 🔑 Admin Dashboard
- **Instant Analytics:** Live stats for total students, faculty, and enrollment growth.
- **Department & Course Management:** Hierarchical setup for academic units and curricula.
- **Dynamic Offerings:** Publish course classes for specific semesters with seat management and scheduling.
- **Faculty Management:** Dedicated instructor database linked to departments.
- **Live Grading:** Streamlined interface for assigning grades to enrolled students.
- **Communications:** Broadcast announcements to the entire institution.
- **Student Setup:** Create student accounts with secure credentials.

## 🛠️ Technology Stack

- **Frontend:** React, Tailwind-inspired Vanilla CSS, Framer Motion (Animations), Lucide (Icons).
- **Backend:** FastAPI (Python), PostgreSQL (Neon DB).
- **Database Logic:** Custom SQL triggers for seat management and registration history.
- **Performance:** Threaded Connection Pooling for optimized database interaction.

## ⚙️ Local Development

### 1. Backend Setup
```bash
cd acadtrace/backend
pip install -r requirements.txt
# Create a .env file with your DATABASE_URL
python main.py
```

### 2. Frontend Setup
```bash
cd acadtrace/frontend
npm install
npm run dev
```

### 3. Database Initialization
Use the provided seeding scripts to set up the schema and initial data:
```bash
python seed_db.py schema.sql features.sql triggers.sql seed.sql
```

## 📂 Project Structure
- `acadtrace/frontend`: React application source code.
- `acadtrace/backend`: FastAPI server and database utilities.
- `*.sql`: Database schema, features, triggers, and seed data.
- `seed_db.py`: Database initialization utility.
