-- AcadTrace Extended Features Schema

-- 1. Instructors (Proper Table)
CREATE TABLE IF NOT EXISTS instructors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    bio TEXT
);

-- Update offerings to link to instructors instead of just a string
-- This requires a migration, but for a new app we can keep both or transition.
ALTER TABLE offerings ADD COLUMN IF NOT EXISTS instructor_id INTEGER REFERENCES instructors(id);

-- 2. Course Prerequisites
CREATE TABLE IF NOT EXISTS prerequisites (
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    prereq_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, prereq_id)
);

-- 3. Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES admins(id)
);

-- 4. Course Reviews
CREATE TABLE IF NOT EXISTS course_reviews (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    offering_id INTEGER REFERENCES offerings(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, offering_id)
);

-- 5. Waitlist System
CREATE TABLE IF NOT EXISTS waitlist (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    offering_id INTEGER REFERENCES offerings(id) ON DELETE CASCADE,
    position SERIAL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, offering_id)
);

-- 6. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER, -- Can be student or admin id
    user_role VARCHAR(20), -- 'student' or 'admin'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Payment Tracking
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid'
    description VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Attendance Tracking
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    offering_id INTEGER REFERENCES offerings(id),
    date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(10) CHECK (status IN ('present', 'absent', 'late')),
    UNIQUE (student_id, offering_id, date)
);

-- 9. Profile Info for Students
ALTER TABLE students ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bio TEXT;

-- 10. Timing/Timetable for Offerings
ALTER TABLE offerings ADD COLUMN IF NOT EXISTS day_of_week VARCHAR(15); -- 'Monday', etc.
ALTER TABLE offerings ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE offerings ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE offerings ADD COLUMN IF NOT EXISTS room_no VARCHAR(20);
