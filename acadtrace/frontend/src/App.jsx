import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Building2, BookOpen, Calendar, GraduationCap,
  LayoutDashboard, LogOut, Plus, Trash2, History,
  ChevronRight, Users, CheckCircle, AlertCircle,
  Bell, User, CreditCard, Clock,
  Star, Briefcase, FileText, PieChart, Edit3, UserPlus,
  Shield, Zap, Globe, ArrowRight, MousePointer, MessageSquare, Sparkles, Brain, Cpu, TrendingUp, AlertTriangle, Wand2, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import LightRays from './LightRays';

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
// --- AI Components ---

const AIChat = ({ studentId }) => {
  const [messages, setMessages] = useState([{ role: 'assistant', content: "Hello! I'm your AI Academic Advisor. How can I help you today?" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/advisor', { student_id: studentId, question: input });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch (err) {
      toast.error("AI Advisor is currently unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard icon={<MessageSquare color="var(--primary)" />} title="AI Academic Advisor">
      <div style={{ height: '350px', overflowY: 'auto', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: '1rem', background: m.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: m.role === 'user' ? 'black' : 'white', fontSize: '0.9rem', fontWeight: m.role === 'user' ? '600' : '400' }}>
            {m.content}
          </div>
        ))}
        {loading && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Thinking...</div>}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about your credits, grades, or career..." style={{ flex: 1 }} />
        <button className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem' }}><ArrowRight size={20} /></button>
      </form>
    </GlassCard>
  );
};

const AIRecommender = ({ studentId }) => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await api.post(`/ai/recommend-courses/${studentId}`);
        setRecs(res.data.recommendations);
      } catch (err) {
        console.error("Failed to fetch recs");
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, [studentId]);

  if (loading) return <Loader />;

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {recs.map((r, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="glass" style={{ padding: '1rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: '700', fontSize: '1rem' }}>Offering #{r.offering_id}</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {r.tags?.map(t => <span key={t} className="badge badge-success" style={{ fontSize: '0.6rem' }}>{t}</span>)}
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{r.reason}</p>
        </motion.div>
      ))}
      {!recs.length && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No personalized recommendations yet.</div>}
    </div>
  );
};

const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}
    />
  </div>
);

// --- Admin Sub-Components ---

const AdminDashboard = ({ adminId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ departments: 0, courses: 0, students: 0, offerings: 0, enrollment_growth: 0 });
  const [deps, setDeps] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sems, setSems] = useState([]);
  const [insts, setInsts] = useState([]);
  const [anns, setAnns] = useState([]);
  const [students, setStudents] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOfferingForGrading, setSelectedOfferingForGrading] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [aiInsights, setAiInsights] = useState('');
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchAiInsights = async () => {
    setAiInsightsLoading(true);
    try {
      const res = await api.get('/ai/admin-insights');
      setAiInsights(res.data.insights);
    } catch (err) {
      toast.error("Failed to load AI Insights");
    } finally {
      setAiInsightsLoading(false);
    }
  };

  const draftAnnouncement = async () => {
    if (!draftPrompt) return;
    setIsDrafting(true);
    try {
      const res = await api.post('/ai/draft-announcement', { admin_id: adminId, prompt: draftPrompt });
      // Inject AI draft into current form state if we were in announcements tab
      // For now we just toast it or show it in a modal
      toast.success("AI Draft Generated!");
      return res.data.draft;
    } catch (err) {
      toast.error("Drafting failed");
    } finally {
      setIsDrafting(false);
    }
  };

  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/departments'),
        api.get('/admin/courses'),
        api.get('/admin/semesters'),
        api.get('/admin/instructors'),
        api.get('/announcements'),
        api.get('/admin/students'),
        api.get('/student/offerings') // Admin uses the same offering list logic
      ]);
      if (results[0].status === 'fulfilled') setStats(results[0].value.data);
      if (results[1].status === 'fulfilled') setDeps(results[1].value.data);
      if (results[2].status === 'fulfilled') setCourses(results[2].value.data);
      if (results[3].status === 'fulfilled') setSems(results[3].value.data);
      if (results[4].status === 'fulfilled') setInsts(results[4].value.data);
      if (results[5].status === 'fulfilled') setAnns(results[5].value.data);
      if (results[6].status === 'fulfilled') setStudents(results[6].value.data);
      if (results[7].status === 'fulfilled') setOfferings(results[7].value.data);

      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) toast.error(`${failed.length} API call(s) failed`);
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
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail[0]?.msg : "Action failed");
      toast.error(msg || "Action failed");
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={18} />} label="Overview" />
        <TabButton active={activeTab === 'academic'} onClick={() => setActiveTab('academic')} icon={<BookOpen size={18} />} label="Academic Setup" />
        <TabButton active={activeTab === 'instructors'} onClick={() => setActiveTab('instructors')} icon={<Users size={18} />} label="Instructors" />
        <TabButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<GraduationCap size={18} />} label="Students" />
        <TabButton active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} icon={<Bell size={18} />} label="Announcements" />
        <TabButton active={activeTab === 'grading'} onClick={() => { setActiveTab('grading'); setSelectedOfferingForGrading(''); }} icon={<Edit3 size={18} />} label="Grading" />
        <TabButton active={activeTab === 'student-setup'} onClick={() => setActiveTab('student-setup')} icon={<UserPlus size={18} />} label="Student Setup" />
      </div>

      <AnimatePresence mode="wait">
        {loading ? <Loader /> : (
          <>
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
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>The system is currently serving {stats.students} students across {stats.departments} departments. Enrollment is {stats.enrollment_growth >= 0 ? 'up' : 'down'} by {Math.abs(stats.enrollment_growth)}% compared to last semester.</p>
                
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)' }}><Brain size={16} /> AI Admin Insights</h4>
                    <button className="btn btn-ghost" onClick={fetchAiInsights} disabled={aiInsightsLoading} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                      <RefreshCw size={14} className={aiInsightsLoading ? 'spin' : ''} /> Refresh
                    </button>
                  </div>
                  {aiInsightsLoading ? <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Analyzing database...</div> : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text)', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', lineHeight: '1.5' }}>
                      {aiInsights || "Click refresh to scan for anomalies and enrollment trends."}
                    </div>
                  )}
                </div>
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
                const data = Object.fromEntries(fd);
                data.department_id = parseInt(data.department_id);
                data.credits = parseInt(data.credits);
                handleAction('post', '/admin/courses', data, "Course Created");
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
                const data = Object.fromEntries(fd);
                data.course_id = parseInt(data.course_id);
                data.semester_id = parseInt(data.semester_id);
                data.instructor_id = parseInt(data.instructor_id);
                data.total_seats = parseInt(data.total_seats);
                handleAction('post', '/admin/offerings', data, "Offering Published");
                e.target.reset();
              }}>
                <select name="course_id" required style={{ marginBottom: '1rem' }}>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <select name="semester_id" required>
                    <option value="">Semester</option>
                    {sems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select name="instructor_id" required>
                    <option value="">Instructor</option>
                    {insts.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <select name="day_of_week" required>
                    <option value="">Day</option>
                    <option value="Monday">Monday</option><option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option><option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option><option value="Saturday">Saturday</option>
                  </select>
                  <input name="room_no" placeholder="Room (e.g. L1)" required />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <input name="start_time" type="time" required title="Start Time" />
                  <input name="end_time" type="time" required title="End Time" />
                </div>
                <input name="total_seats" type="number" placeholder="Total Seats" required />
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
                const data = Object.fromEntries(fd);
                data.department_id = parseInt(data.department_id);
                handleAction('post', '/admin/instructors', data, "Instructor Added");
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

        {activeTab === 'students' && (
          <motion.div key="students" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard icon={<GraduationCap />} title="Active Students">
              <div className="table-container">
                <table>
                  <thead><tr><th>Reg No</th><th>Name</th><th>Email</th><th>Contact</th></tr></thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr key={idx}><td><strong>{s.reg_no}</strong></td><td>{s.name}</td><td>{s.email}</td><td>{s.phone || 'N/A'}</td></tr>
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
              <form onSubmit={async (e) => {
                e.preventDefault();
                handleAction('post', '/admin/announcements', {
                  title: e.target.title.value,
                  content: e.target.content.value,
                  admin_id: adminId
                }, "Announcement Posted");
                e.target.reset();
                setDraftPrompt('');
              }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <input name="title" placeholder="Announcement Title" required style={{ flex: 2 }} />
                  <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                    <input value={draftPrompt} onChange={e => setDraftPrompt(e.target.value)} placeholder="Draft with AI prompt..." style={{ fontSize: '0.8rem' }} />
                    <button type="button" className="btn btn-secondary" onClick={async (e) => {
                      const draft = await draftAnnouncement();
                      if (draft) {
                        const form = e.target.closest('form');
                        form.content.value = draft;
                      }
                    }} disabled={isDrafting} title="Expand prompt into full announcement">
                      <Wand2 size={18} />
                    </button>
                  </div>
                </div>
                <textarea name="content" placeholder="Content details..." required style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1rem', color: 'white', minHeight: '120px' }}></textarea>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Post Announcement</button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'grading' && (
          <motion.div key="grading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard icon={<Edit3 />} title="Class Grading">
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Select Offering</label>
                <select 
                  value={selectedOfferingForGrading} 
                  onChange={async (e) => {
                    const id = e.target.value;
                    setSelectedOfferingForGrading(id);
                    if (id) {
                      const res = await api.get(`/admin/offerings/${id}/registrations`);
                      setEnrolledStudents(res.data);
                    } else {
                      setEnrolledStudents([]);
                    }
                  }}
                >
                  <option value="">-- Choose a Course Class --</option>
                  {offerings.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.course_code}: {o.course_name} ({o.semester_name}) - {o.instructor}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>(Only offerings with active registrations are shown here)</p>
              </div>

              {selectedOfferingForGrading && (
                <div className="table-container">
                  <table>
                    <thead><tr><th>Student</th><th>Reg No</th><th>Current Grade</th><th>Action</th></tr></thead>
                    <tbody>
                      {enrolledStudents.map((reg, idx) => (
                        <tr key={idx}>
                          <td>{reg.student_name}</td>
                          <td>{reg.reg_no}</td>
                          <td><span className="badge badge-info">{reg.grade || 'Not Graded'}</span></td>
                          <td>
                            <form 
                              style={{ display: 'flex', gap: '0.5rem' }} 
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleAction('post', '/admin/grades', {
                                  registration_id: reg.registration_id,
                                  grade: e.target.grade.value
                                }, "Grade Assigned");
                              }}
                            >
                              <select name="grade" defaultValue={reg.grade || "A"}>
                                <option value="A">A</option><option value="B">B</option>
                                <option value="C">C</option><option value="D">D</option>
                                <option value="F">F</option>
                              </select>
                              <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>Set</button>
                            </form>
                          </td>
                        </tr>
                      ))}
                      {!enrolledStudents.length && <tr><td colSpan="4">No students enrolled in this offering.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'student-setup' && (
          <motion.div key="student-setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard icon={<UserPlus />} title="Student Account Setup">
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleAction('post', '/admin/students', Object.fromEntries(fd), "Student Account Created");
                e.target.reset();
              }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label">Full Name</label>
                  <input name="name" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="label">Registration Number (Username)</label>
                  <input name="reg_no" placeholder="S12345" required />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input name="email" type="email" placeholder="john@university.edu" required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label">Access Password</label>
                  <input name="password" type="password" placeholder="••••••••" required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>Create Account</button>
              </form>
            </GlassCard>
          </motion.div>
        )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Student Sub-Components ---

const StudentPortal = ({ studentId, initialVtopData }) => {
  const [activeTab, setActiveTab] = useState('offerings');
  const [data, setData] = useState([]);
  const [profile, setProfile] = useState({});
  const [anns, setAnns] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(null); // stores offering_id
  const [vtopLoading, setVtopLoading] = useState(false);
  const [vtopData, setVtopData] = useState(initialVtopData || null);
  const [activeCourseSentiment, setActiveCourseSentiment] = useState({});
  const [semesterSummary, setSemesterSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [forecast, setForecast] = useState('');
  const [forecastLoading, setForecastLoading] = useState(false);

  useEffect(() => {
    setData([]);
    setHistory([]);
    setAnns([]);
    setProfile({});
    fetchTabData();
  }, [activeTab]);

  const fetchSemesterSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await api.get(`/ai/semester-summary/${studentId}`);
      setSemesterSummary(res.data.summary);
    } catch (err) {
      toast.error("Failed to load AI Summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchCourseSentiment = async (offeringId) => {
    try {
      const res = await api.get(`/ai/course-sentiment/${offeringId}`);
      setActiveCourseSentiment(prev => ({ ...prev, [offeringId]: res.data.sentiment }));
    } catch (err) {
      console.error("Sentiment failed");
    }
  };

  const getGpaForecast = async () => {
    setForecastLoading(true);
    try {
      // Mocked scenarios based on current courses for demo
      const scenarios = data.map(c => ({ course_id: c.id || c.offering_id, expected_grade: 'A' }));
      const res = await api.post('/ai/gpa-forecast', { student_id: studentId, scenarios });
      setForecast(res.data.forecast);
    } catch (err) {
      toast.error("Forecast failed");
    } finally {
      setForecastLoading(false);
    }
  };

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
        setHistory(res.data);
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

  const fetchVtopData = async (e) => {
    e.preventDefault();
    setVtopLoading(true);
    try {
      const res = await axios.post('http://localhost:4000/fetch', {
        username: e.target.username.value,
        password: e.target.password.value
      });
      if (res.data.success) {
        setVtopData(res.data.data);
        toast.success("Successfully fetched VTOP data!");
      } else {
        toast.error(res.data.error || "Failed to fetch VTOP data");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Failed to fetch VTOP data");
    } finally {
      setVtopLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <TabButton active={activeTab === 'offerings'} onClick={() => setActiveTab('offerings')} icon={<Plus size={18} />} label="Enrollment" />
        <TabButton active={activeTab === 'my'} onClick={() => setActiveTab('my')} icon={<BookOpen size={18} />} label="My Courses" />
        <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={18} />} label="History" />
        <TabButton active={activeTab === 'timetable'} onClick={() => setActiveTab('timetable')} icon={<Clock size={18} />} label="Timetable" />
        <TabButton active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} icon={<Bell size={18} />} label="News" />
        <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<CreditCard size={18} />} label="Fee" />
        <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18} />} label="Profile" />
      </div>

      <AnimatePresence mode="wait">
        {loading ? <Loader /> : (
          <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
          {activeTab === 'offerings' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Course</th><th>Instructor</th><th>Semester</th><th>Availability</th><th>Action</th></tr></thead>
                    <tbody>
                      {data.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong>{item.course_code}</strong><br />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.course_name}</span>
                            <div style={{ marginTop: '0.5rem' }}>
                              {!activeCourseSentiment[item.id] ? (
                                <button className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem' }} onClick={() => fetchCourseSentiment(item.id)}><Sparkles size={12} /> AI Sentiment</button>
                              ) : (
                                <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontStyle: 'italic', maxWidth: '200px' }}>"{activeCourseSentiment[item.id]}"</p>
                              )}
                            </div>
                          </td>
                          <td>{item.instructor}</td><td>{item.semester_name}</td>
                          <td><span className={`badge ${item.seats_available > 0 ? 'badge-success' : 'badge-error'}`}>{item.seats_available} / {item.total_seats}</span></td>
                          <td><button onClick={() => register(item.id)} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}><Plus size={16} /> Register</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <AIChat studentId={studentId} />
                <GlassCard icon={<Sparkles color="var(--primary)" />} title="Recommended Courses">
                  <AIRecommender studentId={studentId} />
                </GlassCard>
              </div>
            </div>
          )}

          {activeTab === 'my' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
                <StatCard icon={<PieChart />} label="Estimated GPA" value={gpa()} />
                <div className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                      <TrendingUp size={18} /> <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Smart GPA Forecast</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{forecast || "Click refresh to see academic trajectory."}</p>
                  </div>
                  <button className="btn btn-icon" onClick={getGpaForecast} disabled={forecastLoading}><RefreshCw size={18} className={forecastLoading ? 'spin' : ''} /></button>
                </div>
              </div>
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
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {item.status === 'registered' && <button onClick={() => drop(item.offering_id)} className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }}><Trash2 size={16} /> Drop</button>}
                              <button onClick={() => setShowReviewModal(item)} className="btn btn-ghost" style={{ padding: '0.4rem 1rem' }}><Star size={16} /> Review</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Review Modal */}
              {showReviewModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass" style={{ width: '400px', padding: '2.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Review: {showReviewModal.course_code}</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await api.post('/student/reviews', {
                          student_id: studentId,
                          offering_id: showReviewModal.offering_id || showReviewModal.id,
                          rating: parseInt(e.target.rating.value),
                          comment: e.target.comment.value
                        });
                        toast.success("Review Submitted!");
                        setShowReviewModal(null);
                      } catch (err) {
                        toast.error("You have already reviewed this course.");
                      }
                    }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Rating (1-5 Stars)</label>
                        <select name="rating" required>
                          <option value="5">5 - Excellent</option><option value="4">4 - Very Good</option>
                          <option value="3">3 - Good</option><option value="2">2 - Fair</option><option value="1">1 - Poor</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">Comment</label>
                        <textarea name="comment" placeholder="What did you think of the course?" required style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1rem', color: 'white' }}></textarea>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit</button>
                        <button type="button" onClick={() => setShowReviewModal(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <GlassCard icon={<History />} title="Registration History">
              <div className="table-container">
                <table>
                  <thead><tr><th>Course</th><th>Semester</th><th>Action</th><th>Date</th></tr></thead>
                  <tbody>
                    {history.map((h, idx) => (
                      <tr key={idx}>
                        <td><strong>{h.course_name}</strong></td><td>{h.semester_name}</td>
                        <td><span className={`badge ${h.action === 'registered' ? 'badge-success' : 'badge-error'}`}>{h.action.toUpperCase()}</span></td>
                        <td>{new Date(h.performed_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {!history.length && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No history found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {activeTab === 'timetable' && (
            <GlassCard icon={<Clock />} title="Class Schedule">
              <div className="table-container">
                <table>
                  <thead><tr><th>Day</th><th>Time</th><th>Course</th><th>Room</th></tr></thead>
                  <tbody>
                    {data.length ? data.map((t, idx) => (
                      <tr key={idx}><td>{t.day_of_week || 'TBA'}</td><td>{t.start_time || '--'} - {t.end_time || '--'}</td><td>{t.course_name}</td><td>{t.room_no || 'TBA'}</td></tr>
                    )) : <tr><td colSpan="4" style={{ textAlign: 'center' }}>No schedule found. Update offering details in admin.</td></tr>}
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
                        <tr key={i}><td>{p.description}</td><td>${p.amount}</td><td><span className="badge badge-success">{(p.status || 'pending').toUpperCase()}</span></td><td>{new Date(p.created_at).toLocaleDateString()}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="glass" style={{ padding: '1.5rem', borderLeft: '5px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}><Sparkles size={20} /> AI Academic Summary</h4>
                  <button className="btn btn-ghost" onClick={fetchSemesterSummary} disabled={summaryLoading}><RefreshCw size={14} className={summaryLoading ? 'spin' : ''} /></button>
                </div>
                <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--text)' }}>
                  {semesterSummary || "Your personalized AI summary will appear here. Click refresh analyze your recent performance."}
                </p>
              </div>

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

              <GlassCard icon={<Globe />} title="VTOP Integration">
                {!vtopData ? (
                  <form onSubmit={fetchVtopData} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Enter your VTOP credentials to fetch your academic details.</p>
                    <div><label className="label">VTOP Username</label>
                      <input name="username" defaultValue={profile.reg_no || ''} required />
                    </div>
                    <div><label className="label">VTOP Password</label>
                      <input name="password" type="password" required />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={vtopLoading}>
                      {vtopLoading ? "Authenticating & Fetching..." : "Fetch VTOP Details"}
                    </button>
                  </form>
                ) : (
                  <div>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--primary)', letterSpacing: '0.05rem', textTransform: 'uppercase', fontSize: '0.9rem' }}>Fetched VTOP Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '0.5rem' }}>
                      {Object.entries(vtopData).map(([key, value]) => (
                        <div key={key}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize', marginBottom: '0.25rem' }}>
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div style={{ fontWeight: '500' }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setVtopData(null)} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>Disconnect / Clear Data</button>
                  </div>
                )}
              </GlassCard>
            </div>
          )}

        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Landing Page ---

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container relative">
      <div className="trace-line"></div>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full h-[64px] z-50 bg-[#111110]/80 backdrop-blur-md border-b border-[#59413d]/10">
        <div className="flex justify-between items-center px-8 w-full max-w-screen-2xl mx-auto h-full">
          <div className="text-xl font-bold font-mono text-[#E8E4DC] tracking-tighter">ACADTRACE</div>
          <div className="hidden md:flex items-center space-gap-8 gap-x-12">
            <a className="font-mono uppercase tracking-[0.16em] text-[10px] text-[#C0382B] font-bold" href="#">Theory</a>
            <a className="font-mono uppercase tracking-[0.16em] text-[10px] text-[#A8A49C] hover:text-[#E8E4DC] transition-colors duration-200" href="#">Archive</a>
            <a className="font-mono uppercase tracking-[0.16em] text-[10px] text-[#A8A49C] hover:text-[#E8E4DC] transition-colors duration-200" href="#">Methodology</a>
          </div>
          <button onClick={onGetStarted} className="bg-[#C0382B] text-[#E8E4DC] font-mono text-[10px] uppercase tracking-widest px-6 py-2 transition-opacity active:opacity-80">
            Request Access
          </button>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative px-8 pt-24 pb-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C0382B] mb-6">System Protocol 4.02</p>
              <h1 className="text-5xl md:text-7xl font-bold text-on-surface leading-[1.1] tracking-tight mb-8">
                Your University. <br />
                <span className="font-serif italic font-normal">Finally Intelligent.</span>
              </h1>
              <p className="text-lg text-secondary max-w-xl mb-10 leading-relaxed">
                A brutalist approach to academic management. Track, analyze, and optimize your institutional trajectory with archival precision and real-time synchronicity.
              </p>
              <div className="flex flex-wrap gap-4 mb-16">
                <button onClick={onGetStarted} className="bg-primary-container text-on-surface px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-[#a02e23] transition-colors">Deploy System</button>
                <button className="border border-[#59413d]/30 text-on-surface px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-surface-container-high transition-colors">Review Theory</button>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex -space-x-4">
                  <div className="w-10 h-10 border-2 border-background bg-surface-container-highest"></div>
                  <div className="w-10 h-10 border-2 border-background bg-surface-container-high"></div>
                  <div className="w-10 h-10 border-2 border-background bg-secondary-container"></div>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-secondary/60">Currently serving 42,000+ Active Records</p>
              </div>
            </div>
            
            <div className="lg:col-span-5 relative group">
              <div className="bg-surface-container-low border border-outline-variant/10 p-2 relative">
                <div className="flex gap-1.5 mb-2 px-2 pt-1">
                  <div className="w-2 h-2 rounded-full bg-outline-variant/30"></div>
                  <div className="w-2 h-2 rounded-full bg-outline-variant/30"></div>
                  <div className="w-2 h-2 rounded-full bg-outline-variant/30"></div>
                </div>
                <img alt="System Interface" className="w-full grayscale contrast-125 opacity-80" data-alt="Dark sophisticated dashboard UI with minimalist charts, data tables, and high contrast red accents on a deep charcoal background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDswxPvNXrqpk7EDEiDLELWa_0_d9i6FoSUKOS9hHXe6Ml_3UBi2RnP74X8a_ZhxMylw_LYvy0cpehTBJCxwLmOX1eYmeo8kMqF-AFYXbGwp-4WJqIZ2c7zhqHYjfm5WqIV7RrKaS7ZXVoM2PrS391qPKIOu4ANhwE79jo6LweGx6qXbB7qiYi3dktzV81E7EhMfYlRGhSkjhndTMl5M1NCHrC5NWNGvwxmfqt4xGjcfjSs43Lv36wD_5_4Lftq00MoHOA6wkvz1ws" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-primary-container p-6 hidden md:block">
                <div className="font-mono text-xs text-on-surface font-bold">LIVE_LOAD: 98.4%</div>
                <div className="font-mono text-[9px] text-on-surface/80">LATENCY: 12ms</div>
              </div>
            </div>
          </div>
        </section>

        {/* Institution Strip */}
        <section className="border-y border-outline-variant/5 py-12 bg-surface-container-lowest overflow-hidden">
          <div className="flex whitespace-nowrap gap-16 items-center animate-infinite-scroll">
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-secondary/40">Stanford University</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-secondary/40">MIT Technical</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-secondary/40">Oxford Archive</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-secondary/40">ETH Zürich</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-secondary/40">Yale Institution</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-secondary/40">Harvard Medical</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-secondary/40">CalTech Laboratory</span>
          </div>
        </section>

        {/* The Problem */}
        <section className="px-8 py-32 max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-serif italic mb-16 text-on-surface leading-tight">
            Why is the center of intelligence <br /> still managed by <span className="not-italic text-primary-container">legacy decay?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div className="space-y-4">
              <span className="material-symbols-outlined text-primary-container text-3xl">trending_down</span>
              <h3 className="font-bold text-xl">Fragmented Data</h3>
              <p className="text-secondary text-sm leading-relaxed">Silos of information that never speak to each other, creating a gap in institutional visibility.</p>
            </div>
            <div className="space-y-4">
              <span className="material-symbols-outlined text-primary-container text-3xl">emergency_home</span>
              <h3 className="font-bold text-xl">Manual Friction</h3>
              <p className="text-secondary text-sm leading-relaxed">Enrollment processes that feel like paper-pushing in the age of algorithmic precision.</p>
            </div>
            <div className="space-y-4">
              <span className="material-symbols-outlined text-primary-container text-3xl">visibility_off</span>
              <h3 className="font-bold text-xl">Opaque Progress</h3>
              <p className="text-secondary text-sm leading-relaxed">Students navigating their future through a fog of outdated portals and static PDFs.</p>
            </div>
          </div>
        </section>

        {/* Bento Grid */}
        <section className="px-8 py-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 bg-surface-container-low p-10 border border-outline-variant/10 flex flex-col justify-between min-h-[400px]">
              <div>
                <span className="font-mono text-[10px] text-primary-container uppercase tracking-widest block mb-4">Module 01</span>
                <h3 className="text-4xl font-bold mb-6">One-Click Enrollment</h3>
                <p className="text-secondary max-w-md">Proprietary pathfinding algorithms that secure your seat in milliseconds. Say goodbye to server timeouts.</p>
              </div>
              <div className="mt-8 flex justify-end">
                <span className="material-symbols-outlined text-6xl text-surface-container-highest">bolt</span>
              </div>
            </div>
            
            <div className="md:col-span-4 bg-surface-container-high p-8 border border-outline-variant/10 flex flex-col items-center justify-center text-center">
              <div className="relative w-48 h-24 mb-6">
                <svg className="w-full h-full transform -rotate-180" viewBox="0 0 100 50">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#2a2a29" strokeWidth="8"></path>
                  <path d="M 10 50 A 40 40 0 0 1 70 20" fill="none" stroke="#c0382b" strokeWidth="8"></path>
                </svg>
                <div className="absolute inset-0 flex items-end justify-center pb-2">
                  <span className="text-3xl font-bold font-mono">3.88</span>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2">Live GPA Calculator</h3>
              <p className="font-mono text-[10px] text-secondary/60 uppercase">Predictive Weighting Active</p>
            </div>

            <div className="md:col-span-4 bg-surface-container-low p-8 border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary-container mb-4">sync</span>
              <h3 className="font-bold text-xl mb-4">VTOP Sync</h3>
              <p className="text-secondary text-sm">Deep integration with legacy campus portals for seamless data harvesting and visualization.</p>
            </div>

            <div className="md:col-span-4 bg-surface p-8 border border-outline-variant/10 relative overflow-hidden group">
              <h3 className="font-bold text-xl mb-4">Timetable Visualizer</h3>
              <div className="space-y-2 opacity-40 group-hover:opacity-60 transition-opacity">
                <div className="h-4 bg-primary-container/20 w-full"></div>
                <div className="h-4 bg-surface-container-highest w-3/4"></div>
                <div className="h-4 bg-primary-container/40 w-5/6"></div>
              </div>
              <div className="mt-6 font-mono text-[9px] uppercase tracking-tighter">Conflict Detection: Nominal</div>
            </div>

            <div className="md:col-span-4 bg-surface-container-lowest p-8 border border-outline-variant/10">
              <h3 className="font-bold text-xl mb-4">Grade Ledger</h3>
              <div className="font-mono text-[10px] space-y-1">
                <div className="flex justify-between border-b border-outline-variant/10 py-1"><span>CS102</span><span className="text-primary-container">A+</span></div>
                <div className="flex justify-between border-b border-outline-variant/10 py-1"><span>MAT201</span><span className="text-primary-container">A</span></div>
                <div className="flex justify-between py-1"><span>PHO100</span><span className="text-primary-container">B+</span></div>
              </div>
            </div>

            <div className="md:col-span-12 bg-surface-container-lowest p-12 border border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <h3 className="text-3xl font-bold mb-4">Admin Command Center</h3>
                <p className="text-secondary">Full institutional control for faculty. Manage attendance, process grades, and monitor student health metrics from a single terminal.</p>
              </div>
              <button onClick={onGetStarted} className="bg-on-surface text-background px-8 py-3 font-bold uppercase text-xs tracking-widest hover:bg-opacity-80 transition-opacity">Access Mainframe</button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-8 py-32 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <h2 className="text-4xl font-bold uppercase tracking-tighter">The Implementation</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
              <div className="hidden md:block absolute top-12 left-0 w-full h-[1px] border-t border-dashed border-outline-variant/30 z-0"></div>
              
              <div className="relative z-10 pr-12 pb-12">
                <div className="w-24 h-24 bg-background border border-outline-variant/10 flex items-center justify-center mb-8">
                  <span className="font-mono text-4xl text-primary-container font-bold">01</span>
                </div>
                <h4 className="font-bold text-xl mb-4 uppercase">Identity Hook</h4>
                <p className="text-secondary text-sm">Securely connect your institutional credentials to the Trace Network using encrypted handshake protocols.</p>
              </div>
              
              <div className="relative z-10 pr-12 pb-12">
                <div className="w-24 h-24 bg-background border border-outline-variant/10 flex items-center justify-center mb-8">
                  <span className="font-mono text-4xl text-primary-container font-bold">02</span>
                </div>
                <h4 className="font-bold text-xl mb-4 uppercase">Record Extraction</h4>
                <p className="text-secondary text-sm">Our system parses your academic history, current timetable, and attendance metrics into a unified database.</p>
              </div>
              
              <div className="relative z-10 pb-12">
                <div className="w-24 h-24 bg-background border border-outline-variant/10 flex items-center justify-center mb-8">
                  <span className="font-mono text-4xl text-primary-container font-bold">03</span>
                </div>
                <h4 className="font-bold text-xl mb-4 uppercase">Active Guidance</h4>
                <p className="text-secondary text-sm">Receive real-time alerts, performance optimizations, and one-click actions via your personal dashboard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Terminal */}
        <section className="px-8 py-32 max-w-5xl mx-auto">
          <div className="bg-[#0e0e0d] border border-outline-variant/20 p-1 font-mono text-[12px]">
            <div className="bg-surface-container-low px-4 py-2 border-b border-outline-variant/20 flex justify-between items-center">
              <span className="text-secondary/60">ACADTRACE_SECURE_TERMINAL_v4.0</span>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-outline-variant/20"></div>
                <div className="w-2 h-2 rounded-full bg-outline-variant/20"></div>
                <div className="w-2 h-2 rounded-full bg-primary-container/60"></div>
              </div>
            </div>
            <div className="p-8 space-y-2 min-h-[300px]">
              <div className="text-secondary/40">Initializing archival layer...</div>
              <div className="text-[#E8E4DC]">Establishing P2P handshake with University Database... <span className="text-primary-container">SUCCESS</span></div>
              <div className="text-[#E8E4DC]">Applying AES-256 institutional encryption...</div>
              <div className="text-[#E8E4DC]">Scanning for systemic anomalies... <span className="text-primary-container">0 DETECTED</span></div>
              <div className="text-[#E8E4DC]">Identity: USER_8821 verified via BioTrace.</div>
              <div className="flex items-center gap-1">
                <span className="text-[#E8E4DC]">root@acadtrace:~$</span>
                <span className="text-primary-container animate-pulse">_</span>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-2xl mb-4">Hardened Security</h3>
              <p className="text-secondary text-sm">We don't store your passwords. We use persistent tokens and end-to-end encryption to ensure your academic records remain private and permanent.</p>
            </div>
            <div className="flex items-center justify-end">
              <span className="material-symbols-outlined text-6xl text-outline-variant/20">fingerprint</span>
            </div>
          </div>
        </section>

        {/* Dual Role Split */}
        <section className="grid grid-cols-1 md:grid-cols-2 border-t border-outline-variant/10">
          <div className="p-20 border-r border-outline-variant/10 hover:bg-surface-container-lowest transition-colors group">
            <span className="font-mono text-[10px] text-primary-container uppercase tracking-widest block mb-4">Perspective A</span>
            <h3 className="text-5xl font-bold mb-10">For Students</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary-container mt-1">arrow_forward</span>
                <span className="text-lg text-secondary group-hover:text-on-surface transition-colors">Automated Slot Booking and Conflict Resolution</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary-container mt-1">arrow_forward</span>
                <span className="text-lg text-secondary group-hover:text-on-surface transition-colors">Performance Prediction and GPA Guardrails</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary-container mt-1">arrow_forward</span>
                <span className="text-lg text-secondary group-hover:text-on-surface transition-colors">Centralized Assignment Repository</span>
              </li>
            </ul>
          </div>
          <div className="p-20 hover:bg-surface-container-lowest transition-colors group">
            <span className="font-mono text-[10px] text-primary-container uppercase tracking-widest block mb-4">Perspective B</span>
            <h3 className="text-5xl font-bold mb-10">For Faculty</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary-container mt-1">arrow_forward</span>
                <span className="text-lg text-secondary group-hover:text-on-surface transition-colors">Mass Attendance Capture via QR/NFC</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary-container mt-1">arrow_forward</span>
                <span className="text-lg text-secondary group-hover:text-on-surface transition-colors">Direct Student Engagement Analytics</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary-container mt-1">arrow_forward</span>
                <span className="text-lg text-secondary group-hover:text-on-surface transition-colors">Automated Grade Curve Balancing</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-8 py-40 text-center bg-surface-container-lowest">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter mb-12 uppercase leading-none">
              Your semester, <br /> <span className="font-serif italic font-normal text-on-surface/80">under control.</span>
            </h2>
            <div className="flex justify-center">
              <button onClick={onGetStarted} className="relative group p-1 border-2 border-primary-container hover:scale-105 transition-transform duration-300">
                <div className="bg-primary-container text-on-surface px-12 py-5 font-bold uppercase tracking-[0.2em] text-sm relative z-10 hover:bg-[#a02e23] transition-colors">
                  Initialize Deployment
                </div>
              </button>
            </div>
            <p className="mt-12 font-mono text-[10px] uppercase tracking-widest text-secondary/40">Limited institutional slots available for Q4.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#111110] w-full border-t border-[#59413d]/10 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 px-8 max-w-7xl mx-auto">
          <div className="col-span-2 md:col-span-1">
            <div className="text-lg font-bold text-[#E8E4DC] font-mono mb-6">ACADTRACE</div>
            <p className="font-mono text-[10px] text-[#A8A49C] leading-loose">
              THE PERMANENT RECORD.<br />
              VERSION 4.02 // ARCHIVE 2024
            </p>
          </div>
          <div className="space-y-4">
            <h5 className="font-mono text-[10px] text-[#E8E4DC] uppercase font-bold tracking-widest">Protocol</h5>
            <ul className="space-y-2">
              <li><a className="font-mono text-[10px] text-[#A8A49C] hover:text-[#C0382B] transition-all duration-300" href="#">Case Studies</a></li>
              <li><a className="font-mono text-[10px] text-[#A8A49C] hover:text-[#C0382B] transition-all duration-300" href="#">Documentation</a></li>
              <li><a className="font-mono text-[10px] text-[#A8A49C] hover:text-[#C0382B] transition-all duration-300" href="#">API Terminal</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="font-mono text-[10px] text-[#E8E4DC] uppercase font-bold tracking-widest">Governance</h5>
            <ul className="space-y-2">
              <li><a className="font-mono text-[10px] text-[#A8A49C] hover:text-[#C0382B] transition-all duration-300" href="#">Institutional Access</a></li>
              <li><a className="font-mono text-[10px] text-[#A8A49C] hover:text-[#C0382B] transition-all duration-300" href="#">Academic Standards</a></li>
              <li><a className="font-mono text-[10px] text-[#A8A49C] hover:text-[#C0382B] transition-all duration-300" href="#">Privacy Archive</a></li>
            </ul>
          </div>
          <div className="space-y-4 text-right">
            <div className="font-mono text-[10px] text-[#A8A49C]">SYSTEM_STATUS: <span className="text-green-500">OPTIMAL</span></div>
            <div className="font-mono text-[10px] text-[#A8A49C]">UPTIME: 99.998%</div>
          </div>
        </div>
        <div className="mt-20 border-t border-[#59413d]/5 pt-10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#A8A49C]">© 2024 ACADTRACE. FOR THE PERMANENT RECORD.</p>
        </div>
      </footer>
      
      {/* Global Style additions for custom elements like trace-line */}
      <style>{`
        .trace-line {
            position: absolute;
            left: 4rem;
            top: 0;
            bottom: 0;
            width: 1px;
            background-color: #A8A49C;
            opacity: 0.1;
            z-index: 10;
        }
      `}</style>
    </div>
  );
};

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
      if (role === 'admin') {
        const res = await api.post('/auth/login/admin', { id_val: idVal, password });
        onLogin({ ...res.data, role });
        toast.success(`Welcome back, ${res.data.name}!`);
      } else {
        toast.loading("Authenticating with VTOP...");
        const vtopRes = await axios.post('http://localhost:4000/fetch', { username: idVal, password });
        toast.dismiss();
        
        if (vtopRes.data.success) {
          const vtopData = vtopRes.data.data;
          // sync with acadtrace db to get student ID
          const name = vtopData.student_name || idVal;
          const email = `${idVal.toLowerCase()}@vitstudent.ac.in`;
          const syncRes = await api.post('/auth/vtop_sync', { reg_no: idVal, name, email });
          
          onLogin({ ...syncRes.data, role: 'student', vtopData });
          toast.success(`Welcome back, ${syncRes.data.name}!`);
        } else {
          toast.error(vtopRes.data.error || "VTOP Authentication failed");
        }
      }
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.detail || err.message || "Authentication failed");
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
  const [showLanding, setShowLanding] = useState(true);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
      {showLanding ? (
        <LandingPage onGetStarted={() => setShowLanding(false)} />
      ) : !user ? (
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
            {user.role === 'admin' ? <AdminDashboard adminId={user.id} /> : <StudentPortal studentId={user.id} initialVtopData={user.vtopData} />}
          </main>
        </div>
      )}
    </>
  );
}
