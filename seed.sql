-- Seed Data for AcadTrace (Updated for New Schema)

-- 1. Departments
INSERT INTO departments (name) VALUES ('Computer Science & Engineering') ON CONFLICT (name) DO NOTHING;
INSERT INTO departments (name) VALUES ('Information Technology') ON CONFLICT (name) DO NOTHING;

-- 2. Instructors (New Table)
INSERT INTO instructors (name, email, department_id, bio) VALUES 
('Dr. Alan Turing', 'turing@acadtrace.edu', 1, 'Pioneer of theoretical computer science and artificial intelligence.'),
('Dr. Grace Hopper', 'hopper@acadtrace.edu', 1, 'Inventor of the first compiler and COBOL pioneer.'),
('Prof. Claude Shannon', 'shannon@acadtrace.edu', 2, 'The father of information theory.');

-- 3. Students
INSERT INTO students (reg_no, password, name, email, phone, address, bio) 
VALUES ('2024CS01', 'pass123', 'Yeswanth Ram', 'student@example.com', '+91 9876543210', 'Main Campus Hostel, Room 402', 'Passionate software developer interested in AI and Web systems.')
ON CONFLICT (reg_no) DO NOTHING;

-- 4. Admins
INSERT INTO admins (username, password, name)
VALUES ('admin', 'admin123', 'Super Admin')
ON CONFLICT (username) DO NOTHING;

-- 5. Courses
INSERT INTO courses (code, name, department_id, credits) VALUES 
('CSE101', 'Introduction to Programming', 1, 4),
('CSE201', 'Data Structures', 1, 4),
('IT301', 'Information Theory', 2, 3)
ON CONFLICT (code) DO NOTHING;

-- 6. Semesters
INSERT INTO semesters (name, start_date, end_date) VALUES 
('Fall 2025', '2025-08-15', '2025-12-15'),
('Spring 2026', '2026-01-10', '2026-05-20')
ON CONFLICT (name) DO NOTHING;

-- 7. Offerings (Updated with instructor_id and Timetable)
-- Fall 2025 Offerings
INSERT INTO offerings (course_id, semester_id, instructor_id, total_seats, seats_available, day_of_week, start_time, end_time, room_no) 
VALUES 
(1, 1, 1, 60, 60, 'Monday', '09:00:00', '11:00:00', 'Hall-A'),
(2, 1, 2, 40, 40, 'Wednesday', '14:00:00', '16:00:00', 'Lab-1');

-- Spring 2026 Offerings
INSERT INTO offerings (course_id, semester_id, instructor_id, total_seats, seats_available, day_of_week, start_time, end_time, room_no) 
VALUES 
(3, 2, 3, 30, 30, 'Friday', '10:00:00', '12:00:00', 'Room-102');
