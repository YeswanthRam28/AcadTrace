import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Building2, BookOpen, Calendar, GraduationCap,
  LayoutDashboard, LogOut, Plus, Trash2, History,
  ChevronRight, Users, CheckCircle, AlertCircle,
  Bell, User, CreditCard, MessageSquare, Clock,
  Star, Briefcase, FileText, PieChart, Search, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = 'http://localhost:8000/api';
const api = axios.create({ baseURL: API_BASE });

// --- Shared UI Components ---

const GlassCard = ({ icon, title, children, style }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass" 
    style={{ padding: '2rem', ...style }}
  >
    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
      <span style={{ color: 'var(--primary)' }}>{icon}</span>
      {title}
    </h3>
    {children}
  </motion.div>
);

const StatCard = ({ icon, label, value, color = 'var(--primary)' }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }} 
    className="glass stat-card" 
    style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
  >
    <div style={{ background: `${color}20`, padding: '1rem', borderRadius: '1rem', color }}>{icon}</div>
    <div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05rem' }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{value}</div>
    </div>
  </motion.div>
);

const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    className={`btn ${active ? 'btn-primary' : 'btn-secondary'}`} 
    onClick={onClick}
    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
  >
    {icon} {label}
  </button>
);

// --- Admin Sub-Components ---

const AdminDashboard = ({ adminId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ departments: 0, courses: 0, students: 0, offerings: 0 });
  const [deps, setDeps] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sems, setSems] = useState([]);
  const [insts, setInsts] = useState([]);
  const [anns, setAnns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, dRes, cRes, semRes, instRes, annRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/departments'),
        api.get('/admin/courses'),
        api.get('/admin/semesters'),
        api.get('/admin/instructors'),
        api.get('/announcements')
      ]);
      setStats(sRes.data);
      setDeps(dRes.data);
      setCourses(cRes.data);
      setSems(semRes.data);
      setInsts(instRes.data);
      setAnns(annRes.data);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (method, endpoint, data, successMsg) => {
    try {
      if (method === 'post') await api.post(endpoint, data);
      else if (method === 'put') await api.put(endpoint, data);
      toast.success(successMsg);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Action failed");
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={18}/>} label="Overview" />
        <TabButton active={activeTab === 'academic'} onClick={() => setActiveTab('academic')} icon={<BookOpen size={18}/>} label="Academic Setup" />
        <TabButton active={activeTab === 'instructors'} onClick={() => setActiveTab('instructors')} icon={<Users size={18}/>} label="Instructors" />
        <TabButton active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} icon={<Bell size={18}/>} label="Announcements" />
        <TabButton active={activeTab === 'grading'} onClick={() => setActiveTab('grading')} icon={<Edit3 size={18}/>} label="Grading" />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <StatCard icon={<Building2 />} label="Departments" value={stats.departments} color="#818cf8" />
              <StatCard icon={<BookOpen />} label="Courses" value={stats.courses} color="#f472b6" />
              <StatCard icon={<Users />} label="Students" value={stats.students} color="#fbbf24" />
              <StatCard icon={<Calendar />} label="Offerings" value={stats.offerings} color="#10b981" />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <GlassCard icon={<Bell />} title="Recent Announcements">
                {anns.slice(0, 3).map((a, i) => (
                  <div key={i} style={{ padding: '1rem', borderLeft: '3px solid var(--primary)', background: 'rgba(255,255,255,0.03)', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '600' }}>{a.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(a.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </GlassCard>
              <GlassCard icon={<History />} title="Quick Stats">
                <p style={{ color: 'var(--text-muted)' }}>The system is currently serving {stats.students} students across {stats.departments} departments. Enrollment is up by 12% this semester.</p>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {activeTab === 'academic' && (
          <motion.div key="academic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            <GlassCard icon={<Building2 color="#818cf8" />} title="Department">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAction('post', '/admin/departments', { name: e.target.name.value }, "Department Added");
                e.target.reset();
              }}>
                <input name="name" placeholder="Department Name" required />
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Add</button>
              </form>
            </GlassCard>

            <GlassCard icon={<BookOpen color="#f472b6" />} title="Course">
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleAction('post', '/admin/courses', Object.fromEntries(fd), "Course Created");
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
                <button className="btn btn-primary" style={{ width: '100%' }}>Create</button>
              </form>
            </GlassCard>

            <GlassCard icon={<Calendar color="#fbbf24" />} title="Semester">
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleAction('post', '/admin/semesters', Object.fromEntries(fd), "Semester Created");
                e.target.reset();
              }}>
                <input name="name" placeholder="Semester Name" required />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <input name="start_date" type="date" required />
                  <input name="end_date" type="date" required />
                </div>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Open</button>
              </form>
            </GlassCard>

            <GlassCard icon={<Plus color="#10b981" />} title="New Offering">
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleAction('post', '/admin/offerings', Object.fromEntries(fd), "Offering Published");
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
                <input name="instructor" placeholder="Instructor Name" required />
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Publish</button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'instructors' && (
          <motion.div key="inst" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard icon={<Users />} title="Manage Instructors">
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleAction('post', '/admin/instructors', Object.fromEntries(fd), "Instructor Added");
                e.target.reset();
              }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 0.5fr', gap: '1rem', marginBottom: '2rem' }}>
                <input name="name" placeholder="Name" required />
                <input name="email" type="email" placeholder="Email" required />
                <select name="department_id" required>
                  <option value="">Select Dept</option>
                  {deps.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button className="btn btn-primary">Add</button>
              </form>
              <div className="table-container">
                <table>
                  <thead><tr><th>Name</th><th>Email</th><th>Department</th></tr></thead>
                  <tbody>
                    {insts.map((i, idx) => (
                      <tr key={idx}><td>{i.name}</td><td>{i.email}</td><td>{i.department_name}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'announcements' && (
          <motion.div key="ann" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard icon={<Bell />} title="New Announcement">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAction('post', '/admin/announcements', {
                  title: e.target.title.value,
                  content: e.target.content.value,
                  admin_id: adminId
                }, "Announcement Posted");
                e.target.reset();
              }}>
                <input name="title" placeholder="Announcement Title" required style={{ marginBottom: '1rem' }} />
                <textarea name="content" placeholder="Content details..." required style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1rem', color: 'white', minHeight: '120px' }}></textarea>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Post Announcement</button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'grading' && (
          <motion.div key="grading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard icon={<Edit3 />} title="Update Student Grade">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAction('post', '/admin/grades', {
                  registration_id: parseInt(e.target.registration_id.value),
                  grade: e.target.grade.value
                }, "Grade Updated");
                e.target.reset();
              }} style={{ display: 'flex', gap: '1rem' }}>
                <input name="registration_id" placeholder="Registration ID" required type="number" />
                <select name="grade" required style={{ width: '120px' }}>
                  <option value="A">A</option><option value="B">B</option><option value="C">C</option>
                  <option value="D">D</option><option value="F">F</option>
                </select>
                <button className="btn btn-primary">Update</button>
              </form>
              <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>* Find student Registration IDs in the Student List or Enrollment history.</p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Student Sub-Components ---

const StudentPortal = ({ studentId }) => {
  const [activeTab, setActiveTab] = useState('offerings');
  const [data, setData] = useState([]);
  const [profile, setProfile] = useState({});
  const [anns, setAnns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const fetchTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'offerings') {
        const res = await api.get('/student/offerings');
        setData(res.data);
      } else if (activeTab === 'my') {
        const res = await api.get(`/student/my-courses/${studentId}`);
        setData(res.data);
      } else if (activeTab === 'history') {
        const res = await api.get(`/student/history/${studentId}`);
        setData(res.data);
      } else if (activeTab === 'timetable') {
        const res = await api.get(`/student/timetable/${studentId}`);
        setData(res.data);
      } else if (activeTab === 'profile') {
        const res = await api.get(`/student/profile/${studentId}`);
        setProfile(res.data);
      } else if (activeTab === 'announcements') {
        const res = await api.get('/announcements');
        setAnns(res.data);
      } else if (activeTab === 'payments') {
        const res = await api.get(`/student/payments/${studentId}`);
        setData(res.data);
      }
    } catch (err) {
      toast.error("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const gpa = () => {
    if (activeTab !== 'my' || !data.length) return "N/A";
    const grades = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0 };
    let totalPoints = 0, count = 0;
    data.forEach(c => {
      if (c.grade && grades[c.grade] !== undefined) {
        totalPoints += grades[c.grade];
        count++;
      }
    });
    return count > 0 ? (totalPoints / count).toFixed(2) : "0.00";
  }

  const register = async (offId) => {
    try {
      await api.post('/student/register', { student_id: studentId, offering_id: offId });
      toast.success("Successfully Registered!");
      fetchTabData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    }
  };

  const drop = async (offId) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.post('/student/drop', { student_id: studentId, offering_id: offId });
      toast.success("Course Dropped");
      fetchTabData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Drop failed");
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.put(`/student/profile/${studentId}`, Object.fromEntries(fd));
      toast.success("Profile Updated");
      fetchTabData();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const makePayment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/student/payments', {
        student_id: studentId,
        amount: parseFloat(e.target.amount.value),
        description: e.target.description.value
      });
      toast.success("Payment Received!");
      e.target.reset();
      fetchTabData();
    } catch (err) {
      toast.error("Payment failed");
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <TabButton active={activeTab === 'offerings'} onClick={() => setActiveTab('offerings')} icon={<Plus size={18}/>} label="Enrollment" />
        <TabButton active={activeTab === 'my'} onClick={() => setActiveTab('my')} icon={<BookOpen size={18}/>} label="My Courses" />
        <TabButton active={activeTab === 'timetable'} onClick={() => setActiveTab('timetable')} icon={<Clock size={18}/>} label="Timetable" />
        <TabButton active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} icon={<Bell size={18}/>} label="News" />
        <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<CreditCard size={18}/>} label="Fee" />
        <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18}/>} label="Profile" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
          {activeTab === 'offerings' && (
            <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
              <div className="table-container">
                <table>
                  <thead><tr><th>Course</th><th>Instructor</th><th>Semester</th><th>Availability</th><th>Action</th></tr></thead>
                  <tbody>
                    {data.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.course_code}</strong><br /><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.course_name}</span></td>
                        <td>{item.instructor}</td><td>{item.semester_name}</td>
                        <td><span className={`badge ${item.seats_available > 0 ? 'badge-success' : 'badge-error'}`}>{item.seats_available} / {item.total_seats}</span></td>
                        <td><button onClick={() => register(item.id)} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}><Plus size={16} /> Register</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'my' && (
            <div>
              <div style={{ marginBottom: '2rem' }}><StatCard icon={<PieChart />} label="Estimated GPA" value={gpa()} /></div>
              <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Course</th><th>Instructor</th><th>Semester</th><th>Grade</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {data.map((item, idx) => (
                        <tr key={idx}>
                          <td><strong>{item.course_code}</strong></td><td>{item.instructor}</td><td>{item.semester_name}</td>
                          <td><span className="badge badge-info">{item.grade || '-'}</span></td>
                          <td><span className={`badge ${item.status === 'registered' ? 'badge-success' : 'badge-error'}`}>{item.status}</span></td>
                          <td>{item.status === 'registered' && <button onClick={() => drop(item.offering_id)} className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }}><Trash2 size={16} /> Drop</button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timetable' && (
            <GlassCard icon={<Clock />} title="Class Schedule">
               <div className="table-container">
                <table>
                  <thead><tr><th>Day</th><th>Time</th><th>Course</th><th>Room</th></tr></thead>
                  <tbody>
                    {data.length ? data.map((t, idx) => (
                      <tr key={idx}><td>{t.day_of_week || 'TBA'}</td><td>{t.start_time || '--'} - {t.end_time || '--'}</td><td>{t.course_name}</td><td>{t.room_no || 'TBA'}</td></tr>
                    )) : <tr><td colSpan="4" style={{textAlign: 'center'}}>No schedule found. Update offering details in admin.</td></tr>}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {activeTab === 'announcements' && (
             <div style={{ display: 'grid', gap: '1.5rem' }}>
              {anns.map((a, i) => (
                <GlassCard key={i} icon={<Bell />} title={a.title}>
                  <p>{a.content}</p>
                  <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>By: {a.author}</span>
                    <span>{new Date(a.created_at).toLocaleString()}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {activeTab === 'payments' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
              <GlassCard icon={<CreditCard />} title="Make Payment">
                <form onSubmit={makePayment}>
                  <input name="amount" type="number" placeholder="Amount (USD)" required style={{ marginBottom: '1rem' }} />
                  <input name="description" placeholder="Sem 1 Tuition Fees" required style={{ marginBottom: '1rem' }} />
                  <button className="btn btn-primary" style={{ width: '100%' }}>Pay Now</button>
                </form>
              </GlassCard>
              <GlassCard icon={<History />} title="Payment History">
                <div className="table-container">
                  <table>
                    <thead><tr><th>Desc</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {data.map((p, i) => (
                        <tr key={i}><td>{p.description}</td><td>${p.amount}</td><td><span className="badge badge-success">{p.status.toUpperCase()}</span></td><td>{new Date(p.created_at).toLocaleDateString()}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === 'profile' && (
            <GlassCard icon={<User />} title="Edit Profile">
              <form onSubmit={updateProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div><label className="label">Full Name</label><input disabled value={profile.name || ''} /></div>
                <div><label className="label">Registration No</label><input disabled value={profile.reg_no || ''} /></div>
                <div><label className="label">Email Address</label><input disabled value={profile.email || ''} /></div>
                <div><label className="label">Phone Number</label><input name="phone" defaultValue={profile.phone || ''} placeholder="+1 234 567 890" /></div>
                <div style={{ gridColumn: 'span 2' }}><label className="label">Address</label><input name="address" defaultValue={profile.address || ''} placeholder="Mailing Address" /></div>
                <div style={{ gridColumn: 'span 2' }}><label className="label">Bio</label><textarea name="bio" defaultValue={profile.bio || ''} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1rem', color: 'white' }}></textarea></div>
                <button className="btn btn-primary">Save Changes</button>
              </form>
            </GlassCard>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

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
      toast.success(`Welcome back, ${res.data.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass login-card" style={{ width: '100%', maxWidth: '440px', padding: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="logo-box" style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem', background: 'var(--primary)', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px var(--primary-shadow)' }}>
            <GraduationCap color="white" size={32} />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '800' }}>AcadTrace</h1>
          <p style={{ color: 'var(--text-muted)' }}>The Future of Academic Intel</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', padding: '0.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>
          <button className={`btn ${role === 'student' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => setRole('student')}>Student</button>
          <button className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => setRole('admin')}>Admin</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="label">{role === 'admin' ? 'Username' : 'Reg Number'}</label>
            <input value={idVal} onChange={(e) => setIdVal(e.target.value)} placeholder={role === 'admin' ? 'admin' : '2024CS01'} required />
          </div>
          <div style={{ marginBottom: '2.5rem' }}>
            <label className="label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Sign In'} <ChevronRight size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
      {!user ? (
        <LoginPage onLogin={setUser} />
      ) : (
        <div className="container">
          <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 4rem', padding: '1rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', backdropFilter: 'blur(10px)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <GraduationCap color="var(--primary)" size={32} />
              <div>
                <h2 className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: '700' }}>AcadTrace</h2>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Academic Intelligence Portal</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', letterSpacing: '0.1rem' }}>{user.role.toUpperCase()}</div>
              </div>
              <button className="btn-icon" onClick={() => setUser(null)}><LogOut size={20} /></button>
            </div>
          </nav>

          <main style={{ paddingBottom: '4rem' }}>
            {user.role === 'admin' ? <AdminDashboard adminId={user.id} /> : <StudentPortal studentId={user.id} />}
          </main>
        </div>
      )}
    </>
  );
}
