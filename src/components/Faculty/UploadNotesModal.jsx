import { useState, useRef } from 'react';
import {
  X, UploadCloud, FileText, CheckCircle, Sparkles, BookOpen,
  FolderPlus, Trash2, ArrowRight, FileCheck, Layers
} from 'lucide-react';
import { saveResource } from '../../db';
import { generateId } from '../../utils/helpers';
import './FacultyPanel.css';

const CLASSES = [
  'Data Structures (B.Tech CSE - 3rd Sem)',
  'Database Management Systems (B.Tech CSE - 4th Sem)',
  'Operating Systems (B.Tech CSE - 3rd Sem)',
  'Computer Networks (B.Tech CSE - 4th Sem)',
  'Artificial Intelligence (B.Tech CSE - 6th Sem)'
];

export default function UploadNotesModal({ isOpen, onClose, onUploaded }) {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [generateAISummary, setGenerateAISummary] = useState(true);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selected]);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setUploading(true);
    try {
      const noteResource = {
        id: generateId(),
        title: title.trim(),
        subject: selectedClass.split(' (')[0],
        classGroup: selectedClass,
        topic: topic.trim() || 'General Unit',
        description: description.trim(),
        aiSummaryGenerated: generateAISummary,
        files: files.map(f => ({
          name: f.name,
          size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
          type: f.type || 'application/pdf'
        })),
        createdAt: new Date().toISOString(),
        uploadedBy: 'Dr. Alex Johnson'
      };

      await saveResource(noteResource);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onUploaded) onUploaded(noteResource);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error uploading notes:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="faculty-modal-overlay" onClick={onClose}>
      <div className="faculty-modal-content" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="faculty-modal-header">
          <div className="modal-title-wrap">
            <div className="modal-title-icon purple">
              <BookOpen size={20} />
            </div>
            <div>
              <h3>Upload Lecture Notes & Materials</h3>
              <p>Distribute study guides and syllabus resources to enrolled students</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="modal-success-state">
            <div className="success-icon-wrap">
              <CheckCircle size={48} />
            </div>
            <h4>Notes Published Successfully!</h4>
            <p>Students in {selectedClass} can now access these materials and AI study summaries.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="faculty-modal-form">
            <div className="modal-form-grid">
              <div className="form-group">
                <label>Select Target Class <span className="req">*</span></label>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="modal-select"
                >
                  {CLASSES.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Note Title <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Module 3: Binary Search Trees & AVL Rotations"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label>Topic / Unit</label>
                <input
                  type="text"
                  placeholder="e.g. Unit 3 - Non-linear Data Structures"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label>Description & Learning Objectives</label>
                <textarea
                  rows="2"
                  placeholder="Brief summary of key concepts covered in this note..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="modal-textarea"
                />
              </div>
            </div>

            {/* File Dropzone */}
            <div className="form-group">
              <label>Attach Files (PDF, DOCX, PPTX, TXT, Images)</label>
              <div
                className="dropzone-area"
                onDragOver={e => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <UploadCloud size={32} className="dropzone-cloud" />
                <div className="dropzone-text">
                  <strong>Click to browse</strong> or drag & drop lecture files here
                </div>
                <span className="dropzone-hint">Supports PDF, PPT, Word up to 50MB</span>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="selected-files-list">
                {files.map((file, idx) => (
                  <div key={idx} className="file-chip">
                    <FileText size={16} className="file-chip-icon" />
                    <span className="file-chip-name">{file.name}</span>
                    <span className="file-chip-size">({(file.size / 1024).toFixed(0)} KB)</span>
                    <button
                      type="button"
                      className="file-remove-btn"
                      onClick={() => handleRemoveFile(idx)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* AI Toggle */}
            <div className="ai-assist-toggle-box">
              <div className="ai-toggle-left">
                <Sparkles size={18} className="ai-sparkle-icon" />
                <div>
                  <strong>Generate AI Lecture Notes & Flashcards</strong>
                  <p>AI will analyze text to produce instant key takeaways and revision cards for students</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={generateAISummary}
                  onChange={e => setGenerateAISummary(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Actions */}
            <div className="modal-actions-row">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="modal-primary-btn purple-btn"
                disabled={uploading || !title.trim()}
              >
                <span>{uploading ? 'Uploading & Processing...' : 'Publish Notes to Students'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
