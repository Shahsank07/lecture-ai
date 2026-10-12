import { useState } from 'react';
import {
  Settings, X, BrainCircuit, ShieldCheck, Sun,
  LogOut, FileText, User, Lock, BookOpen, AlertTriangle, CheckCircle2
} from 'lucide-react';
import './Settings.css';

function SettingsModal({ onClose, onLogout, user }) {
  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'terms'
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleConfirmLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="settings-header">
          <div className="settings-header-title">
            <div className="settings-title-icon-wrap">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="modal-title">Settings & Policies</h2>
              <p className="modal-subtitle">Manage your profile, AI preferences, and university terms</p>
            </div>
          </div>
          <button className="btn btn-icon settings-close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="settings-tab-bar">
          <button
            className={`settings-tab-pill ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <User size={15} />
            <span>Account & Engine</span>
          </button>
          <button
            className={`settings-tab-pill ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            <FileText size={15} />
            <span>Terms & Conditions</span>
          </button>
        </div>

        <div className="settings-body">
          {/* ================= TAB 1: ACCOUNT & ENGINE ================= */}
          {activeTab === 'account' && (
            <div className="settings-tab-pane animate-in">
              {/* Profile Card */}
              <div className="settings-card user-profile-card">
                <div className="profile-card-left">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                    alt="User Avatar"
                    className="settings-profile-avatar"
                  />
                  <div className="settings-profile-details">
                    <div className="profile-name-row">
                      <h3 className="profile-name">{user?.name || 'Academic User'}</h3>
                      <span className="profile-role-badge">
                        {user?.role === 'faculty' ? 'Faculty Instructor' : 'Enrolled Student'}
                      </span>
                    </div>
                    <p className="profile-email">{user?.email || 'user@university.edu'}</p>
                    <p className="profile-meta">
                      {user?.institution || 'State University'} • {user?.department || 'Computer Science'} {user?.semester ? `(${user.semester})` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Engine Status Card */}
              <div className="settings-card ai-info-card">
                <div className="ai-info-header">
                  <div className="ai-icon-box">
                    <BrainCircuit size={24} color="#7C3AED" />
                  </div>
                  <div className="ai-info-text">
                    <h3>Powered by Grok AI Engine ⚡</h3>
                    <p>xAI Grok-3-mini is actively synthesizing lecture recordings into structured notes, study takeaways, and flashcards.</p>
                  </div>
                </div>
                <div className="ai-status">
                  <ShieldCheck size={16} color="#10B981" />
                  <span>Real-time audio processing & speech recognition active</span>
                </div>
              </div>

              {/* App Theme */}
              <div className="settings-card">
                <div className="settings-card-row">
                  <div className="settings-card-content">
                    <h4>Appearance Theme</h4>
                    <p>Clean, high-contrast academic dark workspace designed for lecture focus.</p>
                  </div>
                  <div className="settings-card-action">
                    <div className="theme-pill">
                      <Sun size={14} /> Material Dark
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout Section */}
              <div className="settings-card logout-danger-card">
                <div className="settings-card-row">
                  <div className="settings-card-content">
                    <h4 style={{ color: '#EF4444' }}>Log Out of Account</h4>
                    <p>Sign out of your active session. You will be redirected to the secure login portal.</p>
                  </div>
                  <div className="settings-card-action">
                    {!showLogoutConfirm ? (
                      <button
                        type="button"
                        className="btn-settings-logout"
                        onClick={() => setShowLogoutConfirm(true)}
                      >
                        <LogOut size={16} />
                        <span>Log Out</span>
                      </button>
                    ) : (
                      <div className="logout-confirm-group">
                        <button
                          type="button"
                          className="btn-confirm-logout-danger"
                          onClick={handleConfirmLogout}
                        >
                          Confirm Log Out
                        </button>
                        <button
                          type="button"
                          className="btn-cancel-logout"
                          onClick={() => setShowLogoutConfirm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: PROFESSIONAL TERMS & CONDITIONS ================= */}
          {activeTab === 'terms' && (
            <div className="settings-tab-pane terms-tab-pane animate-in">
              <div className="terms-header-box">
                <div className="terms-badge">
                  <BookOpen size={14} />
                  <span>LectureAI Institutional Agreement</span>
                </div>
                <h3>Academic Terms of Service & Privacy Standards</h3>
                <p>Last Revised: Academic Year 2025–2026. Governs all live classroom recordings, student code access, and AI transcript generation.</p>
              </div>

              <div className="terms-scrollable-content">
                <div className="terms-section">
                  <h4>1. Academic Lecture Audio Recording Consent</h4>
                  <p>
                    Faculty and student users acknowledge that audio capture within LectureAI is conducted exclusively for enrolled educational and instructional purposes. By initiating or participating in a lecture with a join code, participants acknowledge:
                  </p>
                  <ul>
                    <li>Notice of recording is prominently displayed to all connected participants via live indicators.</li>
                    <li>Audio recordings may not be re-transmitted or redistributed outside the enrolled class without written instructor authorization.</li>
                    <li>Recording compliance conforms with institutional acoustic recording guidelines and applicable multi-party consent statutes.</li>
                  </ul>
                </div>

                <div className="terms-section">
                  <h4>2. AI Summarization & Academic Integrity Disclaimer</h4>
                  <p>
                    LectureAI utilizes advanced foundation language models (xAI Grok-3-mini) to generate transcripts, automated notes, summaries, and flashcards. These outputs are intended strictly as study aids and supplementary review material:
                  </p>
                  <ul>
                    <li><strong>No Warranty of Completeness:</strong> Automated speech recognition may misinterpret specialized nomenclature, equations, or ambient classroom dialogue. Students must verify key formulas against course textbooks.</li>
                    <li><strong>Assessment Honor Code:</strong> Use of synthesized lecture summaries or automated flashcards during closed-book examinations is strictly governed by your academic institution's code of academic integrity.</li>
                  </ul>
                </div>

                <div className="terms-section">
                  <h4>3. Student Privacy & Data Protection (FERPA & GDPR Compliance)</h4>
                  <p>
                    LectureAI treats student educational records with highest enterprise security:
                  </p>
                  <ul>
                    <li>All audio recordings, notes, and attendance rosters are encrypted in transit via TLS 1.3 and at rest with AES-256 standards.</li>
                    <li>Student identifiable data is protected under Family Educational Rights and Privacy Act (FERPA) principles.</li>
                    <li>Student lecture recordings and personal study materials are never sold to third parties or used to train public open-web AI models.</li>
                  </ul>
                </div>

                <div className="terms-section">
                  <h4>4. Intellectual Property & Course Materials Ownership</h4>
                  <p>
                    All lectures delivered, slide media uploaded, and classroom presentations captured remain the exclusive intellectual property of the course instructor and their respective university or academic institution. Students are granted a personal, non-exclusive, non-transferable study license solely for the duration of the enrolled academic term.
                  </p>
                </div>

                <div className="terms-section">
                  <h4>5. Code of Conduct & Acceptable Platform Use</h4>
                  <p>
                    Users agree not to:
                  </p>
                  <ul>
                    <li>Share session join codes with individuals not enrolled in the course section.</li>
                    <li>Upload or capture content that contains malicious software, harassment, or infringing material.</li>
                    <li>Attempt to reverse-engineer speech recognition streams or circumvent authentication safeguards.</li>
                  </ul>
                </div>

                <div className="terms-section">
                  <h4>6. Limitation of Liability</h4>
                  <p>
                    LectureAI and its software providers shall not be held liable for temporary network disconnections during live lectures, audio hardware fidelity issues, or academic assessment results derived from automated study materials.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          {activeTab === 'account' && (
            <button className="btn btn-primary" onClick={handleSave}>
              {saved ? 'Saved!' : 'Save Preferences'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default SettingsModal;
