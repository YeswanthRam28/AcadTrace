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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
