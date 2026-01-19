-- Seed Data for AcadTrace

-- 1. Departments
INSERT INTO departments (name) VALUES ('Computer Science & Engineering');
INSERT INTO departments (name) VALUES ('Information Technology');

-- 2. Students (Now with reg_no and password)
-- Password 'pass123' used for demo purposes. In real 앱, use hashing!
INSERT INTO students (reg_no, password, name, email) 
VALUES ('2024CS01', 'pass123', 'Demo Student', 'student@example.com');

-- 3. Admins
INSERT INTO admins (username, password, name)
VALUES ('admin', 'admin123', 'Super Admin');

-- 4. Courses
INSERT INTO courses (code, name, department_id, credits) VALUES ('CSE101', 'Introduction to Programming', 1, 4);
INSERT INTO courses (code, name, department_id, credits) VALUES ('CSE201', 'Data Structures', 1, 4);

-- 5. Semesters
INSERT INTO semesters (name, start_date, end_date) VALUES ('Fall 2025', '2025-08-15', '2025-12-15');

-- 6. Offerings
INSERT INTO offerings (course_id, semester_id, instructor, total_seats, seats_available) 
VALUES (1, 1, 'Dr. Alan Turing', 30, 30);
INSERT INTO offerings (course_id, semester_id, instructor, total_seats, seats_available) 
VALUES (2, 1, 'Dr. Grace Hopper', 2, 2);
