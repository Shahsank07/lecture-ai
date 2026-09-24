import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { getClassesBySubject } from '../db';
import './SubjectCard.css';

function SubjectCard({ subject, onClick }) {
  const [classCount, setClassCount] = useState(0);
  const [lastRecording, setLastRecording] = useState(null);

  useEffect(() => {
    getClassesBySubject(subject.id).then((classes) => {
      setClassCount(classes.length);
      
      const validClasses = classes.filter(
        c => !(c.status === 'recording' && (!c.transcript || c.transcript.trim() === ''))
      );
      
      if (validClasses.length > 0) {
        validClasses.sort((a, b) => new Date(b.date) - new Date(a.date));
        setLastRecording(validClasses[0].date);
      }
    });
  }, [subject.id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const headerStyle = subject.color 
    ? { backgroundColor: subject.color } 
    : { backgroundColor: 'var(--google-blue, #1a73e8)' };

  return (
    <div
      className="gc-course-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    >
      <div className="gc-card-header" style={headerStyle}>
        <div className="gc-card-header-content">
          <h2 className="gc-course-title">
            <span className="gc-course-emoji">{subject.emoji}</span>
            {subject.name}
          </h2>
          <span className="gc-class-count">
            {classCount} class{classCount !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>
      
      <div className="gc-card-body">
        {lastRecording ? (
          <p className="gc-course-status">Last recording: {formatDate(lastRecording)}</p>
        ) : (
          <p className="gc-course-status">No recordings yet</p>
        )}
      </div>

      <div className="gc-card-footer">
        <div className="gc-footer-icon" aria-label="Open">
          <ArrowRight size={20} />
        </div>
      </div>
    </div>
  );
}

export default SubjectCard;
