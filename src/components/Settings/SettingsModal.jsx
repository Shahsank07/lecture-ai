import { useState } from 'react';
import { Settings, Save, X, BrainCircuit, ShieldCheck, Moon, Sun } from 'lucide-react';
import './Settings.css';

function SettingsModal({ onClose }) {
  const [saved, setSaved] = useState(false);

  // We no longer manage API keys directly in the UI as Grok is hardcoded for this upgrade
  // We no longer manage heavy themes, but we could eventually add a simple light/dark mode switch

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="settings-header">
          <div className="settings-header-title">
            <Settings size={20} className="text-gradient" />
            <h2 className="modal-title">Settings</h2>
          </div>
          <button className="btn btn-icon settings-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-body">
          {/* AI Info Card */}
          <div className="settings-card ai-info-card">
            <div className="ai-info-header">
              <div className="ai-icon-box">
                <BrainCircuit size={24} color="var(--google-blue)" />
              </div>
              <div className="ai-info-text">
                <h3>Powered by Grok AI ⚡</h3>
                <p>xAI Grok-3-mini is currently providing intelligent summarizations, flashcards, and quizzes.</p>
              </div>
            </div>
            <div className="ai-status">
              <ShieldCheck size={16} color="var(--google-green)" />
              <span>System fully operational</span>
            </div>
          </div>
          
          {/* Theme Note (since we removed neon themes) */}
          <div className="settings-card">
            <div className="settings-card-row">
              <div className="settings-card-content">
                <h4>App Theme</h4>
                <p>The app has been updated to the new clean Material aesthetic.</p>
              </div>
              <div className="settings-card-action">
                <div className="theme-pill">
                  <Sun size={14} /> Light Mode Active
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? 'Saved!' : 'Save Preferences'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default SettingsModal;
