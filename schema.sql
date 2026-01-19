-- AcadTrace Database Schema

-- 1. Departments
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Courses
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL CHECK (credits > 0)
);

-- 3. Semesters
CREATE TABLE semesters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'Fall 2025'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    CHECK (end_date > start_date)
);

-- 4. Course Offerings
CREATE TABLE offerings (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    semester_id INTEGER REFERENCES semesters(id) ON DELETE CASCADE,
    instructor VARCHAR(100) NOT NULL,
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    seats_available INTEGER NOT NULL CHECK (seats_available >= 0),
    UNIQUE (course_id, semester_id)
);

-- 5. Students
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    reg_no VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

-- 6. Admins
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL
);

-- 6. Registrations
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    offering_id INTEGER REFERENCES offerings(id) ON DELETE CASCADE,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'dropped')),
    grade VARCHAR(2) DEFAULT NULL, -- A, B, C, D, F
    UNIQUE (student_id, offering_id)
);

-- 7. Audit/History Tables
CREATE TABLE registration_history (
    id SERIAL PRIMARY KEY,
    student_id INTEGER,
    offering_id INTEGER,
    action VARCHAR(20), -- 'REGISTERED', 'DROPPED'
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE grade_history (
    id SERIAL PRIMARY KEY,
    registration_id INTEGER,
    old_grade VARCHAR(2),
    new_grade VARCHAR(2),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
