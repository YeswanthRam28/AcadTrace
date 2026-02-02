from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
from db import get_db_connection
import psycopg2

app = FastAPI(title="AcadTrace API")

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class DeptCreate(BaseModel):
    name: str

class CourseCreate(BaseModel):
    code: str
    name: str
    department_id: int
    credits: int

class SemesterCreate(BaseModel):
    name: str
    start_date: str
    end_date: str

class OfferingCreate(BaseModel):
    course_id: int
    semester_id: int
    instructor: str
    total_seats: int

class RegistrationCreate(BaseModel):
    student_id: int
    offering_id: int

class LoginRequest(BaseModel):
    id_val: str # reg_no for student, username for admin
    password: str

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    admin_id: int

class InstructorCreate(BaseModel):
    name: str
    email: str
    department_id: Optional[int]
    bio: Optional[str]

class ProfileUpdate(BaseModel):
    phone: Optional[str]
    address: Optional[str]
    bio: Optional[str]

class GradeUpdate(BaseModel):
    registration_id: int
    grade: str

class ReviewCreate(BaseModel):
    student_id: int
    offering_id: int
    rating: int
    comment: Optional[str]

class AttendanceCreate(BaseModel):
    student_id: int
    offering_id: int
    status: str # present, absent, late

class PaymentCreate(BaseModel):
    student_id: int
    amount: float
    description: str


# Auth Endpoints
@app.post("/api/auth/login/student")
async def student_login(req: LoginRequest):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, name, email, reg_no FROM students WHERE reg_no = %s AND password = %s", (req.id_val, req.password))
        user = cur.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid Registration Number or Password")
        return user
    finally:
        cur.close()
        conn.close()

@app.post("/api/auth/login/admin")
async def admin_login(req: LoginRequest):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, name, username FROM admins WHERE username = %s AND password = %s", (req.id_val, req.password))
        user = cur.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid Username or Password")
        return user
    finally:
        cur.close()
        conn.close()

# Admin Endpoints
@app.get("/api/admin/stats")
async def get_stats():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT 
                (SELECT COUNT(*) FROM departments) as departments,
                (SELECT COUNT(*) FROM courses) as courses,
                (SELECT COUNT(*) FROM students) as students,
                (SELECT COUNT(*) FROM offerings) as offerings
        """)
        return cur.fetchone()
    finally:
        cur.close()
        conn.close()

@app.post("/api/admin/departments")
async def add_department(dept: DeptCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO departments (name) VALUES (%s) RETURNING *", (dept.name,))
        conn.commit()
        return cur.fetchone()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/admin/departments")
async def get_departments():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM departments ORDER BY name")
    data = cur.fetchall()
    cur.close()
    conn.close()
    return data

@app.post("/api/admin/courses")
async def add_course(course: CourseCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO courses (code, name, department_id, credits) VALUES (%s, %s, %s, %s) RETURNING *",
            (course.code, course.name, course.department_id, course.credits)
        )
        conn.commit()
        return cur.fetchone()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/admin/courses")
async def get_courses():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT c.*, d.name as department_name FROM courses c JOIN departments d ON c.department_id = d.id ORDER BY c.code")
    data = cur.fetchall()
    cur.close()
    conn.close()
    return data

@app.post("/api/admin/semesters")
async def add_semester(sem: SemesterCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO semesters (name, start_date, end_date) VALUES (%s, %s, %s) RETURNING *",
            (sem.name, sem.start_date, sem.end_date)
        )
        conn.commit()
        return cur.fetchone()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/admin/semesters")
async def get_semesters():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM semesters ORDER BY start_date DESC")
    data = cur.fetchall()
    cur.close()
    conn.close()
    return data

@app.post("/api/admin/offerings")
async def add_offering(offering: OfferingCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO offerings (course_id, semester_id, instructor, total_seats, seats_available) VALUES (%s, %s, %s, %s, %s) RETURNING *",
            (offering.course_id, offering.semester_id, offering.instructor, offering.total_seats, offering.total_seats)
        )
        conn.commit()
        return cur.fetchone()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# Student Endpoints
@app.get("/api/student/offerings")
async def get_available_offerings():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT o.*, c.name as course_name, c.code as course_code, s.name as semester_name 
        FROM offerings o 
        JOIN courses c ON o.course_id = c.id 
        JOIN semesters s ON o.semester_id = s.id 
        WHERE o.seats_available > 0
        ORDER BY s.start_date DESC, c.code
    """)
    data = cur.fetchall()
    cur.close()
    conn.close()
    return data

@app.post("/api/student/register")
async def register_course(reg: RegistrationCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO registrations (student_id, offering_id) VALUES (%s, %s) RETURNING *",
            (reg.student_id, reg.offering_id)
        )
        conn.commit()
        return cur.fetchone()
    except psycopg2.Error as e:
        conn.rollback()
        # Extract meaningful error message from PostgreSQL exception
        raise HTTPException(status_code=400, detail=str(e.pgerror).split('\n')[0])
    finally:
        cur.close()
        conn.close()

@app.post("/api/student/drop")
async def drop_course(reg: RegistrationCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE registrations SET status = 'dropped' WHERE student_id = %s AND offering_id = %s AND status = 'registered' RETURNING *",
            (reg.student_id, reg.offering_id)
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Registration not found")
        conn.commit()
        return {"message": "Dropped successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/student/my-courses/{student_id}")
async def get_my_courses(student_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT r.*, c.name as course_name, c.code as course_code, s.name as semester_name, o.instructor
        FROM registrations r
        JOIN offerings o ON r.offering_id = o.id
        JOIN courses c ON o.course_id = c.id
        JOIN semesters s ON o.semester_id = s.id
        WHERE r.student_id = %s
        ORDER BY s.start_date DESC
    """, (student_id,))
    data = cur.fetchall()
    cur.close()
    conn.close()
    return data

@app.get("/api/student/history/{student_id}")
async def get_history(student_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT h.*, c.name as course_name, s.name as semester_name
        FROM registration_history h
        JOIN offerings o ON h.offering_id = o.id
        JOIN courses c ON o.course_id = c.id
        JOIN semesters s ON o.semester_id = s.id
        WHERE h.student_id = %s
        ORDER BY h.performed_at DESC
    """, (student_id,))
    data = cur.fetchall()
    cur.close()
    conn.close()
    return data

# --- New Feature Endpoints ---

# 1. Announcements
@app.post("/api/admin/announcements")
async def add_announcement(ann: AnnouncementCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO announcements (title, content, created_by) VALUES (%s, %s, %s) RETURNING *", 
                    (ann.title, ann.content, ann.admin_id))
        conn.commit()
        return cur.fetchone()
    finally:
        cur.close()
        conn.close()

@app.get("/api/announcements")
async def get_announcements():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT a.*, admin.name as author FROM announcements a JOIN admins admin ON a.created_by = admin.id ORDER BY created_at DESC")
    data = cur.fetchall()
    cur.close()
    conn.close()
    return data

# 2. Instructors
@app.post("/api/admin/instructors")
async def add_instructor(inst: InstructorCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO instructors (name, email, department_id, bio) VALUES (%s, %s, %s, %s) RETURNING *",
                    (inst.name, inst.email, inst.department_id, inst.bio))
        conn.commit()
        return cur.fetchone()
    finally:
        cur.close()
        conn.close()

@app.get("/api/admin/instructors")
async def get_instructors():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT i.*, d.name as department_name FROM instructors i LEFT JOIN departments d ON i.department_id = d.id")
    data = cur.fetchall()
    cur.close()
    conn.close()
    return data

# 3. Student Profile
@app.get("/api/student/profile/{student_id}")
async def get_profile(student_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, reg_no, name, email, phone, address, bio, profile_picture FROM students WHERE id = %s", (student_id,))
    data = cur.fetchone()
    cur.close()
    conn.close()
    return data

@app.put("/api/student/profile/{student_id}")
async def update_profile(student_id: int, prof: ProfileUpdate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("UPDATE students SET phone = %s, address = %s, bio = %s WHERE id = %s RETURNING *",
                    (prof.phone, prof.address, prof.bio, student_id))
        conn.commit()
        return cur.fetchone()
    finally:
        cur.close()
        conn.close()

# 4. Grading
@app.post("/api/admin/grades")
async def update_grade(g: GradeUpdate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("UPDATE registrations SET grade = %s WHERE id = %s RETURNING *", (g.grade, g.registration_id))
        conn.commit()
        return cur.fetchone()
    finally:
        cur.close()
        conn.close()

# 5. Course Reviews
@app.post("/api/student/reviews")
async def add_review(rev: ReviewCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO course_reviews (student_id, offering_id, rating, comment) VALUES (%s, %s, %s, %s) RETURNING *",
                    (rev.student_id, rev.offering_id, rev.rating, rev.comment))
        conn.commit()
        return cur.fetchone()
    finally:
        cur.close()
        conn.close()

# 6. Timetable
@app.get("/api/student/timetable/{student_id}")
async def get_timetable(student_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT o.day_of_week, o.start_time, o.end_time, o.room_no, c.name as course_name, c.code as course_code
        FROM registrations r
        JOIN offerings o ON r.offering_id = o.id
        JOIN courses c ON o.course_id = c.id
        WHERE r.student_id = %s AND r.status = 'registered'
    """, (student_id,))
    data = cur.fetchall()
    cur.close()
    conn.close()
    return data

# 7. Notifications
@app.get("/api/notifications/{user_id}/{role}")
async def get_notifications(user_id: int, role: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM notifications WHERE user_id = %s AND user_role = %s ORDER BY created_at DESC LIMIT 10", (user_id, role))
    data = cur.fetchall()
    cur.close()
    conn.close()
    return data

# 8. Payments
@app.post("/api/student/payments")
async def add_payment(p: PaymentCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO payments (student_id, amount, description, status) VALUES (%s, %s, %s, 'paid') RETURNING *",
                    (p.student_id, p.amount, p.description))
        conn.commit()
        return cur.fetchone()
    finally:
        cur.close()
        conn.close()

@app.get("/api/student/payments/{student_id}")
async def get_payments(student_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM payments WHERE student_id = %s ORDER BY created_at DESC", (student_id,))
    data = cur.fetchall()
    cur.close()
    conn.close()
    return data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
