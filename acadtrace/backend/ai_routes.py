from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
from openai import OpenAI
import os
from dotenv import load_dotenv
from db import get_db_connection, release_db_connection

load_dotenv()

ai_router = APIRouter(prefix="/api/ai", tags=["AI"])

client = OpenAI(
  base_url="https://integrate.api.nvidia.com/v1",
  api_key=os.getenv("NVIDIA_API_KEY", "")
)

def get_kimi_response(system_prompt: str, user_prompt: str) -> str:
    try:
        completion = client.chat.completions.create(
            model="moonshotai/kimi-k2-instruct",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.6,
            top_p=0.9,
            max_tokens=2048,
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Kimi API Error: {e}")
        raise HTTPException(status_code=500, detail="AI Service is currently unavailable.")

# Models
class ChatRequest(BaseModel):
    student_id: int
    question: str

class WhatIfRequest(BaseModel):
    student_id: int
    scenarios: List[Dict[str, Any]] # e.g., [{"course_id": 1, "expected_grade": "A"}]

class DraftAnnouncementRequest(BaseModel):
    admin_id: int
    prompt: str

class ConflictRequest(BaseModel):
    student_id: int
    course_name: str
    conflict_course: str
    day: str
    time: str

class VtopFailureRequest(BaseModel):
    error_message: str

# 1. AI Academic Advisor (Chat)
@ai_router.post("/advisor")
def academic_advisor(req: ChatRequest):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Fetch student academic record
        cur.execute("""
            SELECT r.grade, c.name, c.code, c.credits, s.name as semester 
            FROM registrations r
            JOIN offerings o ON r.offering_id = o.id
            JOIN courses c ON o.course_id = c.id
            JOIN semesters s ON o.semester_id = s.id
            WHERE r.student_id = %s AND r.status != 'dropped'
        """, (req.student_id,))
        records = cur.fetchall()
        
        cur.execute("SELECT name FROM students WHERE id = %s", (req.student_id,))
        student = cur.fetchone()

        if not student:
            raise HTTPException(status_code=404, detail="Student not found.")

        # Build context
        context = f"Student Name: {student['name']}\nAcademic Record: {json.dumps(records, default=str)}"
        
        system_prompt = "You are an AI Academic Advisor for a university. Use the student's academic record to answer their questions helpfully and concisely. Do not make up info."
        user_prompt = f"Context:\n{context}\n\nStudent Question: {req.question}"
        
        answer = get_kimi_response(system_prompt, user_prompt)
        return {"answer": answer}
    finally:
        cur.close()
        release_db_connection(conn)

# 2. Smart Course Recommender
@ai_router.post("/recommend-courses/{student_id}")
def recommend_courses(student_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Fetch past grades
        cur.execute("""
            SELECT c.name as course_name, c.code, r.grade 
            FROM registrations r
            JOIN offerings o ON r.offering_id = o.id
            JOIN courses c ON o.course_id = c.id
            WHERE r.student_id = %s AND r.grade IS NOT NULL
        """, (student_id,))
        history = cur.fetchall()

        # Fetch available courses
        cur.execute("""
            SELECT o.id as offering_id, c.name, c.code, c.credits, i.name as instructor
            FROM offerings o
            JOIN courses c ON o.course_id = c.id
            JOIN instructors i ON o.instructor_id = i.id
            WHERE o.seats_available > 0
        """)
        catalog = cur.fetchall()

        system_prompt = "You are a course recommendation engine. Return a JSON array of recommended offering_id's based on student history and catalog. Add a 'reason' and 'tags' array for each. Output strict JSON only (no markdown formatting code blocks, just raw JSON)."
        user_prompt = f"History: {json.dumps(history)}\nCatalog: {json.dumps(catalog, default=str)}\n\nOutput JSON format:\n[{{\"offering_id\": 1, \"reason\": \"...\", \"tags\": [\"Recommended for you\"]}}]"
        
        response = get_kimi_response(system_prompt, user_prompt)
        
        # safely parse JSON
        try:
            if response.startswith("```json"):
                response = response[7:-3]
            recommendations = json.loads(response.strip("` \n"))
        except:
            recommendations = [] # fallback

        return {"recommendations": recommendations}
    finally:
        cur.close()
        release_db_connection(conn)

# 3. GPA Forecast & What-If Engine
@ai_router.post("/gpa-forecast")
def gpa_forecast(req: WhatIfRequest):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Fetch current history
        cur.execute("""
            SELECT c.name, r.grade, c.credits
            FROM registrations r
            JOIN offerings o ON r.offering_id = o.id
            JOIN courses c ON o.course_id = c.id
            WHERE r.student_id = %s AND r.grade IS NOT NULL
        """, (req.student_id,))
        history = cur.fetchall()

        system_prompt = "You are a GPA forecaster. Analyze the student's past performance and their what-if scenarios (future courses and expected grades). Provide a qualitative forecast and a projected GPA."
        user_prompt = f"Past Performance: {json.dumps(history)}\nWhat-If Scenarios: {json.dumps(req.scenarios)}\nProvide a helpful forecast report."
        
        forecast = get_kimi_response(system_prompt, user_prompt)
        return {"forecast": forecast}
    finally:
        cur.close()
        release_db_connection(conn)

# 4. Auto-Generated Semester Summary
@ai_router.get("/semester-summary/{student_id}")
def semester_summary(student_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT c.name, r.grade, s.name as semester
            FROM registrations r
            JOIN offerings o ON r.offering_id = o.id
            JOIN courses c ON o.course_id = c.id
            JOIN semesters s ON o.semester_id = s.id
            WHERE r.student_id = %s
            ORDER BY s.start_date DESC
        """, (student_id,))
        records = cur.fetchall()

        system_prompt = "You are an AI that writes a 3-sentence natural language summarizing a student's semester performance. Give insights and recommendations."
        user_prompt = f"Grades: {json.dumps(records, default=str)}\nWrite the summary."
        
        summary = get_kimi_response(system_prompt, user_prompt)
        return {"summary": summary}
    finally:
        cur.close()
        release_db_connection(conn)

# 5. Admin Enrollment Anomaly Detector
@ai_router.get("/admin-insights")
def admin_insights():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT c.name, o.total_seats, o.seats_available, 
                   (o.total_seats - o.seats_available) as registered
            FROM offerings o
            JOIN courses c ON o.course_id = c.id
            ORDER BY o.id DESC LIMIT 100
        """)
        data = cur.fetchall()

        system_prompt = "Scan these course enrollments and flag anomalies (filling unusually fast, empty courses). Return a short list of insights."
        user_prompt = f"Enrollment Data: {json.dumps(data, default=str)}"
        
        insights = get_kimi_response(system_prompt, user_prompt)
        return {"insights": insights}
    finally:
        cur.close()
        release_db_connection(conn)

# 6. Announcement Drafting Assistant
@ai_router.post("/draft-announcement")
def draft_announcement(req: DraftAnnouncementRequest):
    system_prompt = "You are an AI assistant for a university administrator. Expand their short prompts into properly formatted, professional campus announcements."
    user_prompt = req.prompt
    draft = get_kimi_response(system_prompt, user_prompt)
    return {"draft": draft}

# 7. Course Review Sentiment Aggregator
@ai_router.get("/course-sentiment/{offering_id}")
def course_sentiment(offering_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT rating, comment FROM course_reviews WHERE offering_id = %s", (offering_id,))
        reviews = cur.fetchall()
        
        if not reviews:
            return {"sentiment": "No reviews available yet."}

        system_prompt = "Read these course reviews and generate a 2-sentence sentiment summary."
        user_prompt = f"Reviews: {json.dumps(reviews)}\nSummarize sentiment."
        
        sentiment = get_kimi_response(system_prompt, user_prompt)
        return {"sentiment": sentiment}
    finally:
        cur.close()
        release_db_connection(conn)

# 8. Timetable Conflict Explainer
@ai_router.post("/timetable-conflict")
def timetable_conflict(req: ConflictRequest):
    system_prompt = "You explain timetable scheduling conflicts to university students in a plain-English, helpful manner and suggest simple alternatives."
    user_prompt = f"Trying to register for {req.course_name} at {req.time} on {req.day}, but it overlaps with {req.conflict_course}. Write a short explanation."
    
    explanation = get_kimi_response(system_prompt, user_prompt)
    return {"explanation": explanation}

# 9. VTOP Sync Failure Diagnosis
@ai_router.post("/vtop-diagnosis")
def vtop_diagnosis(req: VtopFailureRequest):
    system_prompt = "You are an IT assistant explaining scrape/auth errors from university portal (VTOP) to students in non-technical terms. Be reassuring."
    user_prompt = f"Raw Error: {req.error_message}"
    
    diagnosis = get_kimi_response(system_prompt, user_prompt)
    return {"diagnosis": diagnosis}
