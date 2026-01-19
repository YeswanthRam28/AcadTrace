import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Building2, BookOpen, Calendar, GraduationCap,
  LayoutDashboard, LogOut, Plus, Trash2, History,
  ChevronRight, Users, CheckCircle, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:8000/api';

// --- API Helper ---
const api = axios.create({ baseURL: API_BASE });

// --- Components ---

const AdminDashboard = () => {
  const [stats, setStats] = useState({ departments: 0, courses: 0, students: 0, offerings: 0 });
  const [deps, setDeps] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sems, setSems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, dRes, cRes, semRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/departments'),
        api.get('/admin/courses'),
        api.get('/admin/semesters')
      ]);
      setStats(sRes.data);
      setDeps(dRes.data);
      setCourses(cRes.data);
      setSems(semRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (endpoint, data, msg) => {
    try {
      await api.post(endpoint, data);
      alert(msg);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed");
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard icon={<Building2 />} label="Departments" value={stats.departments} />
        <StatCard icon={<BookOpen />} label="Courses" value={stats.courses} />
        <StatCard icon={<Users />} label="Students" value={stats.students} />
        <StatCard icon={<Calendar />} label="Offerings" value={stats.offerings} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <GlassCard icon={<Building2 color="#818cf8" />} title="Add Department">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCreate('/admin/departments', { name: e.target.name.value }, "Department Added");
            e.target.reset();
          }}>
            <input name="name" placeholder="Department Name" required />
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Add Department</button>
          </form>
        </GlassCard>

        <GlassCard icon={<BookOpen color="#f472b6" />} title="Create Course">
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            handleCreate('/admin/courses', Object.fromEntries(fd), "Course Created");
            e.target.reset();
          }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input name="code" placeholder="CSE101" required />
              <input name="name" placeholder="Course Name" required />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <select name="department_id" required>
                <option value="">Select Dept</option>
                {deps.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <input name="credits" type="number" placeholder="Credits" required />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }}>Create Course</button>
          </form>
        </GlassCard>

        <GlassCard icon={<Calendar color="#fbbf24" />} title="New Semester">
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            handleCreate('/admin/semesters', Object.fromEntries(fd), "Semester Created");
            e.target.reset();
          }}>
            <input name="name" placeholder="Semester Name (e.g. Fall 2025)" required />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <input name="start_date" type="date" required />
              <input name="end_date" type="date" required />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Open Semester</button>
          </form>
        </GlassCard>

        <GlassCard icon={<Plus color="#10b981" />} title="Create Offering">
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            handleCreate('/admin/offerings', Object.fromEntries(fd), "Offering Opened");
            e.target.reset();
          }}>
            <select name="course_id" required>
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
              <select name="semester_id" required>
                <option value="">Semester</option>
                {sems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input name="total_seats" type="number" placeholder="Seats" required />
            </div>
            <input name="instructor" placeholder="Instructor" required />
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Publish Offering</button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}

const StudentPortal = ({ studentId }) => {
  const [activeTab, setActiveTab] = useState('offerings');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const fetchTabData = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'offerings') res = await api.get('/student/offerings');
      else if (activeTab === 'my') res = await api.get(`/student/my-courses/${studentId}`);
      else res = await api.get(`/student/history/${studentId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (offId) => {
    try {
      await api.post('/student/register', { student_id: studentId, offering_id: offId });
      alert("Registration Successful!");
      fetchTabData();
    } catch (err) {
      alert(err.response?.data?.detail || "Registration failed");
    }
  };

  const drop = async (offId) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.post('/student/drop', { student_id: studentId, offering_id: offId });
      fetchTabData();
    } catch (err) {
      alert(err.response?.data?.detail || "Drop failed");
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button className={`btn ${activeTab === 'offerings' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('offerings')}>Available Courses</button>
        <button className={`btn ${activeTab === 'my' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('my')}>My Registrations</button>
        <button className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('history')}>Activity Log</button>
      </div>

      <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              {activeTab === 'offerings' && (
                <tr><th>Course</th><th>Instructor</th><th>Semester</th><th>Availability</th><th>Action</th></tr>
              )}
              {activeTab === 'my' && (
                <tr><th>Course</th><th>Instructor</th><th>Semester</th><th>Grade</th><th>Status</th><th>Action</th></tr>
              )}
              {activeTab === 'history' && (
                <tr><th>Course</th><th>Semester</th><th>Action</th><th>Timestamp</th></tr>
              )}
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  {activeTab === 'offerings' && (
                    <>
                      <td><strong>{item.course_code}</strong><br /><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.course_name}</span></td>
                      <td>{item.instructor}</td>
                      <td>{item.semester_name}</td>
                      <td><span className={`badge ${item.seats_available > 0 ? 'badge-success' : 'badge-error'}`}>{item.seats_available} / {item.total_seats}</span></td>
                      <td><button onClick={() => register(item.id)} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}><Plus size={16} /> Register</button></td>
                    </>
                  )}
                  {activeTab === 'my' && (
                    <>
                      <td><strong>{item.course_code}</strong></td>
                      <td>{item.instructor}</td>
                      <td>{item.semester_name}</td>
                      <td>{item.grade || '-'}</td>
                      <td><span className={`badge ${item.status === 'registered' ? 'badge-info' : 'badge-error'}`}>{item.status}</span></td>
                      <td>{item.status === 'registered' && <button onClick={() => drop(item.offering_id)} className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }}><Trash2 size={16} /> Drop</button>}</td>
                    </>
                  )}
                  {activeTab === 'history' && (
                    <>
                      <td>{item.course_name}</td>
                      <td>{item.semester_name}</td>
                      <td><span className={`badge ${item.action === 'REGISTERED' ? 'badge-success' : 'badge-error'}`}>{item.action}</span></td>
                      <td>{new Date(item.performed_at).toLocaleString()}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Atomic UI Helpers ---

const StatCard = ({ icon, label, value }) => (
  <motion.div whileHover={{ y: -5 }} className="glass stat-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
    <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '1rem', borderRadius: '1rem', color: 'var(--primary)' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{value}</div>
    </div>
  </motion.div>
);

const GlassCard = ({ icon, title, children }) => (
  <div className="glass" style={{ padding: '2rem' }}>
    <h3 className="card-title">{icon} {title}</h3>
    {children}
  </div>
);

// --- Login Component ---
const LoginPage = ({ onLogin }) => {
  const [role, setRole] = useState('student');
  const [idVal, setIdVal] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = role === 'admin' ? '/auth/login/admin' : '/auth/login/student';
      const res = await api.post(endpoint, { id_val: idVal, password });
      onLogin({ ...res.data, role });
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ width: '100%', maxWidth: '440px', padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>AcadTrace</h1>
          <p style={{ color: 'var(--text-muted)' }}>Secure Academic Gateway</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            className={`btn ${role === 'student' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setRole('student')}
          >
            Student
          </button>
          <button
            className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setRole('admin')}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
              {role === 'admin' ? 'Username' : 'Registration Number'}
            </label>
            <input
              value={idVal}
              onChange={(e) => setIdVal(e.target.value)}
              placeholder={role === 'admin' ? 'e.g. admin' : '2024CS01'}
              required
            />
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'} <ChevronRight size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <div className="container">
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', padding: '1.5rem 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem' }}><CheckCircle color="white" size={24} /></div>
          <h2 className="gradient-text" style={{ fontSize: '1.5rem' }}>AcadTrace</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span className="badge badge-info">{user.role.toUpperCase()} SESSION</span>
          <button className="btn btn-secondary" onClick={() => setUser(null)}><LogOut size={18} /> Logout</button>
        </div>
      </nav>

      {user.role === 'admin' ? <AdminDashboard /> : <StudentPortal studentId={user.id} />}
    </div>
  );
}
