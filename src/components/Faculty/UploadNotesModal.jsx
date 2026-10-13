import { useState, useRef } from 'react';
import {
  X, UploadCloud, FileText, CheckCircle, Sparkles, BookOpen,
  FolderPlus, Trash2, ArrowRight, FileCheck, Layers, Loader2,
  Check, HelpCircle, AlertCircle, FileCode, Tag
} from 'lucide-react';
import { saveResource, addNotification } from '../../db';
import { generateId } from '../../utils/helpers';
import { extractPdfPoints } from '../../services/aiService';
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
  const [analyzingPdf, setAnalyzingPdf] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Process dropped/selected files and trigger PDF AI extraction
  const processFiles = async (newFiles) => {
    if (!newFiles || newFiles.length === 0) return;
    const fileList = Array.from(newFiles);
    setFiles(prev => [...prev, ...fileList]);

    // Find first PDF or text document to analyze
    const targetFile = fileList.find(f => 
      f.type === 'application/pdf' || 
      f.name.toLowerCase().endsWith('.pdf') || 
      f.type.startsWith('text/') || 
      f.name.toLowerCase().endsWith('.txt') ||
      f.name.toLowerCase().endsWith('.md')
    ) || fileList[0];

    if (targetFile) {
      setAnalyzingPdf(true);
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result;
          try {
            const result = await extractPdfPoints(base64Data, targetFile.name);
            if (result && (result.importantPoints || result.documentTitle)) {
              setExtractedData(result);
              if (!title.trim() && result.documentTitle) {
                setTitle(result.documentTitle);
              }
              if (!topic.trim() && result.topic) {
                setTopic(result.topic);
              }
              if (!description.trim() && result.overview) {
                setDescription(result.overview);
              }
            }
          } catch (err) {
            console.error('Error analyzing PDF content:', err);
          } finally {
            setAnalyzingPdf(false);
          }
        };
        reader.readAsDataURL(targetFile);
      } catch (err) {
        console.error('File read error:', err);
        setAnalyzingPdf(false);
      }
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) {
        setExtractedData(null);
      }
      return updated;
    });
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
        topic: topic.trim() || extractedData?.topic || 'General Unit',
        description: description.trim() || extractedData?.overview || '',
        aiSummaryGenerated: generateAISummary,
        extractedPoints: extractedData?.importantPoints || [],
        overview: extractedData?.overview || '',
        keyTakeaways: extractedData?.keyTakeaways || [],
        studyQuestions: extractedData?.studyQuestions || [],
        files: files.map(f => ({
          name: f.name,
          size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
          type: f.type || 'application/pdf'
        })),
        createdAt: new Date().toISOString(),
        uploadedBy: 'Dr. Alex Johnson'
      };

      await saveResource(noteResource);
      await addNotification({
        id: 'notif-' + noteResource.id,
        title: `Study Material: ${noteResource.title}`,
        desc: `New lecture notes uploaded for ${noteResource.subject || noteResource.classGroup}`,
        time: 'Just now',
        type: 'feature',
        targetRole: 'all',
        unread: true
      });
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
      <div 
        className="faculty-modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div className="faculty-modal-header" style={{ flexShrink: 0 }}>
          <div className="modal-title-wrap">
            <div className="modal-title-icon purple">
              <BookOpen size={20} />
            </div>
            <div>
              <h3>Upload Lecture Notes & Study PDFs</h3>
              <p>Drag & drop any syllabus PDF — AI automatically reads it and extracts key study points</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="modal-success-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div className="success-icon-wrap" style={{ margin: '0 auto 16px' }}>
              <CheckCircle size={52} color="#10B981" />
            </div>
            <h4 style={{ fontSize: '18px', color: '#F1F5F9', marginBottom: '8px' }}>Notes & PDF Key Points Published!</h4>
            <p style={{ color: '#94A3B8', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
              Students in {selectedClass} can now study the extracted important points and download the materials.
            </p>
          </div>
        ) : (
          <form 
            onSubmit={handleSubmit} 
            className="faculty-modal-form"
            style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}
          >
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
            <div className="form-group" style={{ marginTop: '14px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Attach Lecture PDF or Slides</span>
                <span style={{ fontSize: '11px', color: '#A855F7', fontWeight: 600 }}>
                  ⚡ Auto-Extracts Important Points
                </span>
              </label>

              <div
                className={`dropzone-area ${dragActive ? 'drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: dragActive ? '2px dashed #A855F7' : '2px dashed rgba(168, 85, 247, 0.35)',
                  background: dragActive ? 'rgba(168, 85, 247, 0.1)' : '#13192B',
                  borderRadius: '14px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <UploadCloud size={34} style={{ color: '#A855F7', margin: '0 auto 8px' }} />
                <div className="dropzone-text" style={{ fontSize: '13px', color: '#F1F5F9' }}>
                  <strong>Click to browse</strong> or drag & drop lecture PDF here
                </div>
                <span className="dropzone-hint" style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Supports PDF documents up to 50MB (Text is read automatically)
                </span>
              </div>
            </div>

            {/* Attached Files List */}
            {files.length > 0 && (
              <div className="selected-files-list" style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {files.map((file, idx) => (
                  <div 
                    key={idx} 
                    className="file-chip"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '6px 12px', background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px', fontSize: '12px', color: '#E2E8F0'
                    }}
                  >
                    <FileText size={15} style={{ color: '#A855F7' }} />
                    <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0 2px' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* AI Extraction Progress Banner */}
            {analyzingPdf && (
              <div style={{
                marginTop: '16px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(168,85,247,0.1))',
                border: '1px solid rgba(168,85,247,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Loader2 size={20} className="spin-icon" style={{ color: '#A855F7', animation: 'spin 1s linear infinite' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                    Reading PDF & Generating Important Points...
                  </div>
                  <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px' }}>
                    AI is analyzing headings, core definitions, and key exam concepts from the uploaded PDF
                  </div>
                </div>
              </div>
            )}

            {/* AI Extracted Important Points Card */}
            {extractedData && extractedData.importantPoints && extractedData.importantPoints.length > 0 && (
              <div style={{
                marginTop: '18px',
                borderRadius: '14px',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                background: '#0F1527',
                padding: '16px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                    }}>
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
                        AI Generated Important Points from PDF
                      </h4>
                      <span style={{ fontSize: '11px', color: '#A855F7' }}>
                        Extracted directly from document content ({extractedData.importantPoints.length} key points)
                      </span>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '3px 8px',
                    borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    ✓ Verified from PDF
                  </span>
                </div>

                {/* Overview paragraph */}
                {extractedData.overview && (
                  <p style={{
                    fontSize: '12px', color: '#94A3B8', lineHeight: '1.5',
                    background: 'rgba(255,255,255,0.03)', padding: '10px 12px',
                    borderRadius: '8px', marginBottom: '14px', borderLeft: '3px solid #A855F7'
                  }}>
                    {extractedData.overview}
                  </p>
                )}

                {/* Important Points List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {extractedData.importantPoints.map((point, pIdx) => (
                    <div 
                      key={pIdx}
                      style={{
                        display: 'flex', gap: '10px', alignItems: 'flex-start',
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '10px 12px', borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '6px',
                        background: 'rgba(168, 85, 247, 0.2)',
                        color: '#C084FC', fontSize: '11px', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: '2px'
                      }}>
                        {point.pointNumber || pIdx + 1}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>
                            {point.title}
                          </span>
                          {point.tag && (
                            <span style={{
                              fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
                              background: 'rgba(124, 58, 237, 0.2)', color: '#A78BFA',
                              fontWeight: 500
                            }}>
                              {point.tag}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: '1.45' }}>
                          {point.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key Takeaways */}
                {extractedData.keyTakeaways && extractedData.keyTakeaways.length > 0 && (
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      Key Revision Takeaways
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {extractedData.keyTakeaways.map((takeaway, tIdx) => (
                        <div key={tIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8' }}>
                          <Check size={13} style={{ color: '#10B981', flexShrink: 0 }} />
                          <span>{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Toggle */}
            <div className="ai-assist-toggle-box" style={{ marginTop: '16px' }}>
              <div className="ai-toggle-left">
                <Sparkles size={18} className="ai-sparkle-icon" />
                <div>
                  <strong>Publish AI Study Points to Student Dashboard</strong>
                  <p>Enrolled students will instantly receive these extracted points and study summaries</p>
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
            <div className="modal-actions-row" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
                <span>{uploading ? 'Publishing Materials...' : 'Publish Notes & PDF Points'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
