import { useState } from 'react';
import {
  BookOpen, Video, TrendingUp, FileText, ArrowRight, ArrowLeft,
  User, Mail, Phone, Lock, Building, Layers, CheckCircle2,
  Sparkles, GraduationCap, School, ShieldCheck, ChevronDown
} from 'lucide-react';
import { login, signup, loginAsDemo, DEMO_FACULTY, DEMO_STUDENT } from '../../auth';
import './Auth.css';

const INSTITUTIONS = [
  'Massachusetts Institute of Technology (MIT)',
  'Stanford University',
  'Harvard University',
  'Indian Institute of Technology (IIT Delhi)',
  'University of Oxford',
  'Carnegie Mellon University',
  'National University of Singapore'
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Mathematics & Computing'
];

export default function AuthPage({ mode = 'login', onAuthSuccess }) {
  // 'login' | 'register'
  const [viewMode, setViewMode] = useState(mode);
  // 'faculty' | 'student' | 'both'
  const [activeRegTab, setActiveRegTab] = useState('faculty');

  // Faculty Form State
  const [facultyForm, setFacultyForm] = useState({
    institution: INSTITUTIONS[0],
    department: DEPARTMENTS[0],
    name: '',
    subject: '',
    email: '',
    phone: '',
    password: ''
  });

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    institution: INSTITUTIONS[0],
    department: DEPARTMENTS[0],
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  // Login Form State
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    role: 'faculty'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFacultyChange = (field, val) => {
    setFacultyForm(prev => ({ ...prev, [field]: val }));
    setError('');
  };

  const handleStudentChange = (field, val) => {
    setStudentForm(prev => ({ ...prev, [field]: val }));
    setError('');
  };

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!facultyForm.name.trim()) return setError('Full Name is required for Faculty.');
    if (!facultyForm.subject.trim()) return setError('Subject You Teach is required.');
    if (!facultyForm.email.trim()) return setError('Email Address is required.');

    setLoading(true);
    try {
      const user = await signup({
        role: 'faculty',
        name: facultyForm.name,
        email: facultyForm.email,
        password: facultyForm.password || 'password123',
        institution: facultyForm.institution,
        department: facultyForm.department,
        subject: facultyForm.subject,
        phone: facultyForm.phone
      });
      setSuccessMessage('Faculty account created successfully!');
      setTimeout(() => onAuthSuccess(user), 600);
    } catch (err) {
      setError(err.message || 'Failed to create faculty account');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!studentForm.name.trim()) return setError('Full Name is required for Student.');
    if (!studentForm.email.trim()) return setError('Email Address is required.');

    setLoading(true);
    try {
      const user = await signup({
        role: 'student',
        name: studentForm.name,
        email: studentForm.email,
        password: studentForm.password || 'password123',
        institution: studentForm.institution,
        department: studentForm.department,
        phone: studentForm.phone,
        semester: '6th Semester'
      });
      setSuccessMessage('Student account created successfully!');
      setTimeout(() => onAuthSuccess(user), 600);
    } catch (err) {
      setError(err.message || 'Failed to create student account');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginForm.email.trim()) return setError('Please enter your email address.');

    setLoading(true);
    try {
      const user = await login(loginForm.email, loginForm.password);
      onAuthSuccess(user);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
    setLoading(true);
    setError('');
    try {
      const user = await loginAsDemo(role);
      onAuthSuccess(user);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lecture-auth-root">
      <div className="lecture-auth-container">

        {/* ================= LEFT BRAND PANEL ================= */}
        <div className="lecture-auth-hero">
          {/* Logo Header */}
          <div className="lecture-brand-header">
            <div className="lecture-hexagon-logo">
              <div className="hexagon-inner">
                <div className="hex-circle"></div>
              </div>
            </div>
            <div className="lecture-brand-text">
              <span className="brand-title">LectureAI</span>
              <span className="brand-subtitle">Intelligent Lecture Companion</span>
            </div>
          </div>

          {/* Hero Welcome Message */}
          <div className="lecture-hero-headline">
            <span className="welcome-tag">Welcome to</span>
            <h1 className="hero-app-name">LectureAI</h1>
            <h2 className="hero-tagline">Learn Better. While You Learn.</h2>
            <p className="hero-desc">
              Your all-in-one platform for smart lectures, notes, resources, quizzes and more.
            </p>
          </div>

          {/* 3D Character Illustration with Interactive Badges */}
          <div className="lecture-hero-illustration">
            <div className="illustration-wrapper">
              <div className="character-avatar-glow"></div>
              {/* 3D style Avatar container */}
              <div className="avatar-3d-character">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&auto=format&fit=crop&q=80"
                  alt="Student with laptop"
                  className="character-img"
                />
                <div className="avatar-laptop-icon">💻</div>
              </div>

              {/* Floating Badges */}
              <div className="floating-badge badge-video" title="Live Lectures">
                <Video size={18} />
              </div>
              <div className="floating-badge badge-chat" title="AI Lecture Chat">
                <Sparkles size={18} />
              </div>
              <div className="floating-badge badge-cap" title="Academic Excellence">
                <GraduationCap size={18} />
              </div>
              <div className="floating-badge badge-chart" title="Smart Progress">
                <TrendingUp size={18} />
              </div>
            </div>
          </div>

          {/* Bottom Switcher / Mode toggle */}
          <div className="hero-bottom-actions">
            <div className="hero-divider">
              <span>{viewMode === 'register' ? 'Already have an account?' : "Don't have an account?"}</span>
            </div>
            {viewMode === 'register' ? (
              <button
                type="button"
                className="hero-nav-btn login-btn"
                onClick={() => { setViewMode('login'); setError(''); }}
              >
                <span>Login</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <div className="hero-reg-options">
                <button
                  type="button"
                  className="hero-nav-btn faculty-reg-btn"
                  onClick={() => { setViewMode('register'); setActiveRegTab('faculty'); setError(''); }}
                >
                  <User size={16} />
                  <span>Register as Faculty</span>
                </button>
                <button
                  type="button"
                  className="hero-nav-btn student-reg-btn"
                  onClick={() => { setViewMode('register'); setActiveRegTab('student'); setError(''); }}
                >
                  <GraduationCap size={16} />
                  <span>Register as Student</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT FORM PANEL ================= */}
        <div className="lecture-auth-form-panel">

          {/* Alert messages */}
          {error && (
            <div className="auth-alert error">
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="auth-alert success">
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ---------- MODE: REGISTRATION (Matching Image 1) ---------- */}
          {viewMode === 'register' && (
            <div className="registration-flow">
              {/* Top Title & Back to Login */}
              <div className="reg-header-row">
                <div className="reg-title-group">
                  <h2 className="reg-main-title">Create Your Account</h2>
                  <p className="reg-sub-title">Choose how you want to register</p>
                </div>
                <button
                  type="button"
                  className="back-to-login-btn"
                  onClick={() => { setViewMode('login'); setError(''); }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Login</span>
                </button>
              </div>

              {/* Registration Role Switcher Buttons */}
              <div className="reg-tab-pills">
                <button
                  type="button"
                  className={`tab-pill ${activeRegTab === 'faculty' ? 'active-faculty' : ''}`}
                  onClick={() => setActiveRegTab('faculty')}
                >
                  <User size={18} />
                  <span>Register as Faculty</span>
                </button>
                <button
                  type="button"
                  className={`tab-pill ${activeRegTab === 'student' ? 'active-student' : ''}`}
                  onClick={() => setActiveRegTab('student')}
                >
                  <GraduationCap size={18} />
                  <span>Register as Student</span>
                </button>
                <button
                  type="button"
                  className={`tab-pill ${activeRegTab === 'both' ? 'active-both' : ''}`}
                  onClick={() => setActiveRegTab('both')}
                >
                  <Layers size={18} />
                  <span>Compare Both</span>
                </button>
              </div>

              {/* Side-by-Side or Selected Form Cards */}
              <div className={`registration-cards-container ${activeRegTab === 'both' ? 'show-both' : ''}`}>

                {/* ===== FACULTY REGISTRATION CARD ===== */}
                {(activeRegTab === 'faculty' || activeRegTab === 'both') && (
                  <div className="reg-card faculty-card">
                    <div className="reg-card-header">
                      <div className="card-role-icon purple-badge">
                        <User size={20} />
                      </div>
                      <div className="card-header-text">
                        <h3>Faculty Registration</h3>
                        <p>Create your faculty account</p>
                      </div>
                    </div>

                    <form onSubmit={handleFacultySubmit} className="reg-form">
                      <div className="form-group">
                        <label>Institution <span className="req">*</span></label>
                        <div className="input-with-icon">
                          <Building size={16} className="input-icon" />
                          <select
                            value={facultyForm.institution}
                            onChange={(e) => handleFacultyChange('institution', e.target.value)}
                            required
                          >
                            {INSTITUTIONS.map(inst => (
                              <option key={inst} value={inst}>{inst}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="select-arrow" />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Department <span className="req">*</span></label>
                        <div className="input-with-icon">
                          <Layers size={16} className="input-icon" />
                          <select
                            value={facultyForm.department}
                            onChange={(e) => handleFacultyChange('department', e.target.value)}
                            required
                          >
                            {DEPARTMENTS.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="select-arrow" />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Full Name <span className="req">*</span></label>
                        <div className="input-with-icon">
                          <User size={16} className="input-icon" />
                          <input
                            type="text"
                            placeholder="Enter your full name (e.g. Dr. Alex Johnson)"
                            value={facultyForm.name}
                            onChange={(e) => handleFacultyChange('name', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Subject You Teach <span className="req">*</span></label>
                        <div className="input-with-icon">
                          <BookOpen size={16} className="input-icon" />
                          <input
                            type="text"
                            placeholder="Enter your subject (e.g. Data Structures)"
                            value={facultyForm.subject}
                            onChange={(e) => handleFacultyChange('subject', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Email Address <span className="req">*</span></label>
                        <div className="input-with-icon">
                          <Mail size={16} className="input-icon" />
                          <input
                            type="email"
                            placeholder="Enter your email address"
                            value={facultyForm.email}
                            onChange={(e) => handleFacultyChange('email', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Phone Number <span className="req">*</span></label>
                        <div className="input-with-icon">
                          <Phone size={16} className="input-icon" />
                          <input
                            type="tel"
                            placeholder="Enter your phone number"
                            value={facultyForm.phone}
                            onChange={(e) => handleFacultyChange('phone', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Password <span className="req">*</span></label>
                        <div className="input-with-icon">
                          <Lock size={16} className="input-icon" />
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={facultyForm.password}
                            onChange={(e) => handleFacultyChange('password', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="submit-btn faculty-submit-btn"
                        disabled={loading}
                      >
                        <span>{loading ? 'Creating Account...' : 'Create Faculty Account'}</span>
                        <User size={18} />
                      </button>

                      <p className="terms-text">
                        By creating an account, you agree to our{' '}
                        <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
                      </p>
                    </form>
                  </div>
                )}

                {/* ===== STUDENT REGISTRATION CARD ===== */}
                {(activeRegTab === 'student' || activeRegTab === 'both') && (
                  <div className="reg-card student-card">
                    <div className="reg-card-header">
                      <div className="card-role-icon green-badge">
                        <GraduationCap size={20} />
                      </div>
                      <div className="card-header-text">
                        <h3>Student Registration</h3>
                        <p>Create your student account</p>
                      </div>
                    </div>

                    <form onSubmit={handleStudentSubmit} className="reg-form">
                      <div className="form-group">
                        <label>Institution <span className="req">*</span></label>
                        <div className="input-with-icon">
                          <Building size={16} className="input-icon" />
                          <select
                            value={studentForm.institution}
                            onChange={(e) => handleStudentChange('institution', e.target.value)}
                            required
                          >
                            {INSTITUTIONS.map(inst => (
                              <option key={inst} value={inst}>{inst}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="select-arrow" />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Department <span className="req">*</span></label>
                        <div className="input-with-icon">
                          <Layers size={16} className="input-icon" />
                          <select
                            value={studentForm.department}
                            onChange={(e) => handleStudentChange('department', e.target.value)}
                            required
                          >
                            {DEPARTMENTS.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="select-arrow" />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Full Name <span className="req">*</span></label>
                        <div className="input-with-icon">
                          <User size={16} className="input-icon" />
                          <input
                            type="text"
                            placeholder="Enter your full name (e.g. Arjun Sharma)"
                            value={studentForm.name}
                            onChange={(e) => handleStudentChange('name', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Email Address <span className="req">*</span></label>
                        <div className="input-with-icon">
                          <Mail size={16} className="input-icon" />
                          <input
                            type="email"
                            placeholder="Enter your email address"
                            value={studentForm.email}
                            onChange={(e) => handleStudentChange('email', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Phone Number <span className="req">*</span></label>
                        <div className="input-with-icon">
                          <Phone size={16} className="input-icon" />
                          <input
                            type="tel"
                            placeholder="Enter your phone number"
                            value={studentForm.phone}
                            onChange={(e) => handleStudentChange('phone', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Password <span className="req">*</span></label>
                        <div className="input-with-icon">
                          <Lock size={16} className="input-icon" />
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={studentForm.password}
                            onChange={(e) => handleStudentChange('password', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="submit-btn student-submit-btn"
                        disabled={loading}
                      >
                        <span>{loading ? 'Creating Account...' : 'Create Student Account'}</span>
                        <User size={18} />
                      </button>

                      <p className="terms-text">
                        By creating an account, you agree to our{' '}
                        <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
                      </p>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------- MODE: LOGIN ---------- */}
          {viewMode === 'login' && (
            <div className="login-flow-container">
              <div className="login-card-main">
                <div className="login-header-group">
                  <div className="login-badge-icon">
                    <ShieldCheck size={28} />
                  </div>
                  <h2>Sign In to LectureAI</h2>
                  <p>Choose your portal or sign in with your credentials</p>
                </div>

                {/* Instant 1-Click Demo Login Helpers */}
                <div className="demo-accounts-box">
                  <span className="demo-box-label">⚡ Fast Evaluation: 1-Click Demo Portals</span>
                  <div className="demo-btn-grid">
                    <button
                      type="button"
                      className="demo-card-btn faculty-demo"
                      onClick={() => handleQuickDemoLogin('faculty')}
                      disabled={loading}
                    >
                      <div className="demo-role-badge">Faculty</div>
                      <div className="demo-info">
                        <strong>Dr. Alex Johnson</strong>
                        <span>Computer Science Faculty</span>
                      </div>
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      className="demo-card-btn student-demo"
                      onClick={() => handleQuickDemoLogin('student')}
                      disabled={loading}
                    >
                      <div className="demo-role-badge">Student</div>
                      <div className="demo-info">
                        <strong>Arjun Sharma</strong>
                        <span>B.Tech CSE - 6th Semester</span>
                      </div>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="login-or-divider">
                  <span>or enter email & password</span>
                </div>

                <form onSubmit={handleLoginSubmit} className="login-form">
                  <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-with-icon">
                      <Mail size={16} className="input-icon" />
                      <input
                        type="email"
                        placeholder="e.g. alex.johnson@university.edu"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <div className="input-with-icon">
                      <Lock size={16} className="input-icon" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="submit-btn login-submit-btn"
                    disabled={loading}
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                    <ArrowRight size={18} />
                  </button>
                </form>

                {/* Two Clear Registration Links Required */}
                <div className="login-registration-links-section">
                  <span className="reg-links-title">New to LectureAI? Register below:</span>
                  <div className="reg-links-buttons">
                    <button
                      type="button"
                      className="link-btn-faculty"
                      onClick={() => { setViewMode('register'); setActiveRegTab('faculty'); setError(''); }}
                    >
                      <User size={16} />
                      <span>Register as Faculty</span>
                    </button>
                    <button
                      type="button"
                      className="link-btn-student"
                      onClick={() => { setViewMode('register'); setActiveRegTab('student'); setError(''); }}
                    >
                      <GraduationCap size={16} />
                      <span>Register as Student</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= BOTTOM FEATURE BAR (Matching Image 1) ================= */}
          <div className="auth-feature-pills-bar">
            <div className="feature-pill-card">
              <div className="feature-icon-circle purple">
                <BookOpen size={18} />
              </div>
              <div className="feature-text">
                <div className="feat-title">Smart Learning</div>
                <div className="feat-desc">AI-powered notes, summaries and insights from lectures</div>
              </div>
            </div>

            <div className="feature-pill-card">
              <div className="feature-icon-circle blue">
                <Video size={18} />
              </div>
              <div className="feature-text">
                <div className="feat-title">Live & Recorded</div>
                <div className="feat-desc">Attend live lectures and access recorded sessions anytime</div>
              </div>
            </div>

            <div className="feature-pill-card">
              <div className="feature-icon-circle magenta">
                <TrendingUp size={18} />
              </div>
              <div className="feature-text">
                <div className="feat-title">Track Progress</div>
                <div className="feat-desc">Monitor your learning journey and academic performance</div>
              </div>
            </div>

            <div className="feature-pill-card">
              <div className="feature-icon-circle emerald">
                <FileText size={18} />
              </div>
              <div className="feature-text">
                <div className="feat-title">Rich Resources</div>
                <div className="feat-desc">Access notes, PDFs, videos and external resources</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}