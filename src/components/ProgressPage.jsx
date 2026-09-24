import { ArrowLeft, TrendingUp, CheckCircle, Clock, BookOpen, Award, Target, BarChart2 } from 'lucide-react';
import { Card, Button } from './ui';
import './ProgressPage.css';

function ProgressPage({ onNavigate }) {
  return (
    <div className="progress-page page-container">
      <div className="page-header">
        <div className="page-header-left">
          <button className="back-btn" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <div>
            <h1>Study Progress & Analytics</h1>
            <p>Track your lecture coverage, mastery rate, and weekly study streaks</p>
          </div>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="progress-overview-grid">
        <Card className="prog-card">
          <div className="prog-icon green">
            <CheckCircle size={22} />
          </div>
          <div className="prog-info">
            <span className="prog-label">Overall Completion</span>
            <span className="prog-val">75%</span>
            <span className="prog-sub">18 of 24 lectures completed</span>
          </div>
        </Card>

        <Card className="prog-card">
          <div className="prog-icon purple">
            <Clock size={22} />
          </div>
          <div className="prog-info">
            <span className="prog-label">Total Time Spent</span>
            <span className="prog-val">18.6 Hours</span>
            <span className="prog-sub">+4.2 hours this week</span>
          </div>
        </Card>

        <Card className="prog-card">
          <div className="prog-icon blue">
            <Target size={22} />
          </div>
          <div className="prog-info">
            <span className="prog-label">Quiz Accuracy</span>
            <span className="prog-val">88%</span>
            <span className="prog-sub">Based on 12 quizzes taken</span>
          </div>
        </Card>

        <Card className="prog-card">
          <div className="prog-icon orange">
            <Award size={22} />
          </div>
          <div className="prog-info">
            <span className="prog-label">Current Streak</span>
            <span className="prog-val">7 Days</span>
            <span className="prog-sub">Personal record!</span>
          </div>
        </Card>
      </div>

      {/* Topic Mastery breakdown */}
      <Card className="mastery-card">
        <h3>Topic Mastery Breakdown</h3>
        <div className="mastery-list">
          <div className="mastery-item">
            <div className="mastery-info">
              <span className="name">Data Structures & Algorithms</span>
              <span className="pct">85% Mastery</span>
            </div>
            <div className="prog-track">
              <div className="prog-fill green" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div className="mastery-item">
            <div className="mastery-info">
              <span className="name">Database Management Systems</span>
              <span className="pct">70% Mastery</span>
            </div>
            <div className="prog-track">
              <div className="prog-fill purple" style={{ width: '70%' }}></div>
            </div>
          </div>

          <div className="mastery-item">
            <div className="mastery-info">
              <span className="name">Operating Systems</span>
              <span className="pct">62% Mastery</span>
            </div>
            <div className="prog-track">
              <div className="prog-fill blue" style={{ width: '62%' }}></div>
            </div>
          </div>

          <div className="mastery-item">
            <div className="mastery-info">
              <span className="name">Computer Networks</span>
              <span className="pct">50% Mastery</span>
            </div>
            <div className="prog-track">
              <div className="prog-fill orange" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ProgressPage;
