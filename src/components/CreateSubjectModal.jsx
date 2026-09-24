import { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { saveSubject } from '../db';
import { generateId, SUBJECT_GRADIENTS, SUBJECT_EMOJIS } from '../utils/helpers';
import { TOPIC_PRESETS } from '../utils/topicThemes';

function CreateSubjectModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📚');
  const [gradientId, setGradientId] = useState('purple');
  const [topicPreset, setTopicPreset] = useState('science');

  const handleCreate = async () => {
    if (!name.trim()) return;

    const gradient = SUBJECT_GRADIENTS.find((g) => g.id === gradientId);
    
    // Get current user to link subject to them
    const userString = localStorage.getItem('vn_user');
    const user = userString ? JSON.parse(userString) : null;
    
    const subject = {
      id: generateId(),
      userId: user?.id || 'anonymous',
      name: name.trim(),
      emoji,
      topicPreset,
      gradient: gradient?.gradient || 'var(--gradient-purple)',
      color: gradient?.color || '#7c3aed',
      createdAt: new Date().toISOString(),
    };

    await saveSubject(subject);
    onCreated();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="modal-title">New Subject Studio</h2>
            <p className="modal-subtitle">Create a subject with custom topic background art & themes</p>
          </div>
          <button
            className="btn btn-icon btn-secondary"
            onClick={onClose}
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Name input */}
        <div className="modal-field">
          <label>Subject Title</label>
          <input
            className="input"
            type="text"
            placeholder="e.g. Quantum Physics, Data Structures, Calculus..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            id="input-subject-name"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>

        {/* Topic Background Picture Selector */}
        <div className="modal-field">
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} style={{ color: '#00F2FE' }} />
            <span>Select Topic Background Art</span>
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            marginTop: '8px'
          }}>
            {TOPIC_PRESETS.map((t) => (
              <div
                key={t.id}
                onClick={() => setTopicPreset(t.id)}
                style={{
                  position: 'relative',
                  height: '75px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: topicPreset === t.id ? `2px solid ${t.accentColor}` : '1px solid rgba(255,255,255,0.15)',
                  boxShadow: topicPreset === t.id ? `0 0 14px ${t.glowColor}` : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${t.bgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.6,
                }} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.85) 100%)',
                }} />
                <div style={{
                  position: 'relative',
                  zIndex: 2,
                  height: '100%',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: t.accentColor }}>{t.tag.split(' ')[0]}</span>
                    {topicPreset === t.id && (
                      <div style={{
                        width: '16px', height: '16px', borderRadius: '50%', background: t.accentColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000'
                      }}>
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>{t.name.split('&')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emoji picker */}
        <div className="modal-field">
          <label>Subject Icon</label>
          <div className="emoji-grid">
            {SUBJECT_EMOJIS.map((e) => (
              <button
                key={e}
                className={`emoji-btn ${emoji === e ? 'selected' : ''}`}
                onClick={() => setEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={!name.trim()}
            id="btn-create-subject"
          >
            Create Subject
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateSubjectModal;
