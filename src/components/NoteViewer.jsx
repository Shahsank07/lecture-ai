import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ArrowLeft, ArrowRight, Edit3, Copy, Calendar, Clock, FileText, CheckCircle, Sparkles, Loader2,
  ListTree, BookOpenCheck, Download, Play, Pause, Cuboid, BrainCircuit, Link2,
  File, Search, Lightbulb, Clock as ClockIcon, MessageSquare, Map, AlertCircle
} from 'lucide-react';
import { formatDate, formatDuration } from '../utils/helpers';
import { summarizeNotes, organizeNotesIntoSections, generateFlashcards, askAI } from '../services/aiService';
import FlashcardViewer from './FlashcardViewer';
import SubjectStudio from './SubjectStudio';
import { saveClass } from '../db';
import { Button } from './ui';
import { Badge } from './ui';
import { Card } from './ui';
import { Avatar } from './ui';
import { Input } from './ui';
import { Progress } from './ui';
import './NoteViewer.css';

function NoteViewer({ classData = {}, subject = {}, onNavigate }) {
  const safeClassData = classData || {};
  const [summary, setSummary] = useState(safeClassData.summary || null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);

  // Flashcard & Quiz state
  const [flashcardData, setFlashcardData] = useState({
    flashcards: safeClassData.flashcards || [],
    quiz: safeClassData.quiz || []
  });
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);

  // Ask AI State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiHistory, setAiHistory] = useState([]);

  // Important Points State
  const [importantPoints, setImportantPoints] = useState(safeClassData.importantPoints || []);
  const [showAddImportant, setShowAddImportant] = useState(false);
  const [newImportantText, setNewImportantText] = useState('');

  // What I Missed State
  const [missedDuration, setMissedDuration] = useState(0);

  // Concept Map State
  const [conceptMapData, setConceptMapData] = useState(null);

  // Resources State (from smart resources or generated)
  const [resources, setResources] = useState(safeClassData.resources || []);

  // Sync state if incoming classData prop changes
  useEffect(() => {
    if (classData) {
      if (classData.summary) setSummary(classData.summary);
      if (classData.flashcards || classData.quiz) {
        setFlashcardData({
          flashcards: classData.flashcards || [],
          quiz: classData.quiz || []
        });
      }
      if (classData.importantPoints) setImportantPoints(classData.importantPoints);
      if (classData.resources) setResources(classData.resources);
    }
  }, [classData]);

  // Automatically organize notes into sections
  const sections = organizeNotesIntoSections(safeClassData.notes || []);

  const handleSummarize = useCallback(async () => {
    setIsSummarizing(true);
    try {
      const res = await summarizeNotes(safeClassData.notes || [], safeClassData.transcript || '');
      setSummary(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  }, [safeClassData.notes, safeClassData.transcript]);

  // Generate concept map from notes
  const generateConceptMap = useCallback(() => {
    if (!safeClassData.notes || safeClassData.notes.length === 0) return;

    const mainTopic = safeClassData.currentTopic || subject?.name || 'Lecture';
    const subtopics = [...new Set(sections.map(s => s.title))].slice(0, 6);
    const concepts = (safeClassData.notes || []).slice(0, 20).map(n => (n.text || '').split(' ').slice(0, 4).join(' '));

    setConceptMapData({
      mainTopic,
      subtopics,
      concepts: concepts.slice(0, 12),
    });
  }, [safeClassData.notes, safeClassData.currentTopic, subject?.name, sections]);

  useEffect(() => {
    if (safeClassData.audioBlob && (safeClassData.audioBlob instanceof Blob)) {
      try {
        const url = URL.createObjectURL(safeClassData.audioBlob);
        setAudioUrl(url);
        return () => {
          try { URL.revokeObjectURL(url); } catch {}
        };
      } catch (err) {
        console.warn('AudioBlob URL creation error:', err);
      }
    }
  }, [safeClassData.audioBlob]);

  useEffect(() => {
    if (!summary && (classData?.notes || []).length > 0) {
      handleSummarize();
    }
  }, [handleSummarize, classData?.notes, summary]);

  useEffect(() => {
    if (!conceptMapData && (classData?.notes || []).length > 0) {
      generateConceptMap();
    }
  }, [generateConceptMap, conceptMapData, classData?.notes]);

  useEffect(() => {
    if (classData?.currentTopic && classData?.smartResources) {
      setResources(classData.smartResources);
    }
  }, [classData?.currentTopic, classData?.smartResources]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  };

  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      if (!isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
    }
  };

  const handleGenerateFlashcards = async () => {
    setIsGeneratingCards(true);
    try {
      const result = await generateFlashcards(classData.notes, classData.transcript);
      setFlashcardData(result);
      classData.flashcards = result.flashcards;
      classData.quiz = result.quiz;
      await saveClass(classData);
    } catch (err) {
      console.error("Flashcard generation error:", err);
    } finally {
      setIsGeneratingCards(false);
    }
  };

  const handleCopyNotes = () => {
    const text = (classData.notes || [])
      .map((n) => `• ${n.text}`)
      .join('\n');
    navigator.clipboard.writeText(text).then(() => {
      alert('Notes copied to clipboard!');
    });
  };

  const handleExportMD = () => {
    let mdContent = `# ${classData.title}\n\n`;
    mdContent += `**Date:** ${formatDate(classData.date)}\n\n`;
    mdContent += `**Subject:** ${subject.name}\n\n`;

    if (classData.transcript) {
      mdContent += `## Transcript\n\n${classData.transcript}\n\n`;
    }

    if (classData.notes && classData.notes.length > 0) {
      mdContent += `## Notes\n\n`;
      classData.notes.forEach(note => {
        mdContent += `- ${note.text}\n`;
      });
      mdContent += `\n`;
    }

    if (summary) {
      mdContent += `## Summary\n\n`;
      if (typeof summary === 'string') {
        mdContent += `${summary}\n\n`;
      } else {
        mdContent += `${summary.overview}\n\n`;
        mdContent += `### Key Takeaways:\n\n`;
        summary.keyTakeaways.forEach(takeaway => {
          mdContent += `- ${takeaway}\n`;
        });
        mdContent += `\n`;
      }
    }

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${classData.title.replace(/\s+/g, '_').toLowerCase()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const renderNoteText = (note) => {
    if (!note.highlights || note.highlights.length === 0) {
      return note.text;
    }

    const sorted = [...note.highlights].sort((a, b) => a.start - b.start);
    const parts = [];
    let lastIdx = 0;

    sorted.forEach((hl, i) => {
      if (hl.start > lastIdx) {
        parts.push(<span key={`t-${i}`}>{note.text.slice(lastIdx, hl.start)}</span>);
      }
      parts.push(
        <mark key={`h-${i}`} data-color={hl.color}>
          {note.text.slice(hl.start, hl.end)}
        </mark>
      );
      lastIdx = hl.end;
    });

    if (lastIdx < note.text.length) {
      parts.push(<span key="tail">{note.text.slice(lastIdx)}</span>);
    }

    return parts;
  };

  const progressPercent = (safeClassData.duration && safeClassData.duration > 0) ? Math.min((currentTime / safeClassData.duration) * 100, 100) : 0;

  // Ask AI Handler
  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;

    setIsAiThinking(true);
    const question = aiQuestion;
    setAiQuestion('');

    try {
      const result = await askAI(question, safeClassData.transcript || '', safeClassData.notes || []);

      const newEntry = {
        id: Date.now(),
        question,
        answer: result.answer,
        timestamp: Date.now(),
        sources: result.sources || [],
      };

      setAiHistory(prev => [...prev, newEntry]);
      setAiAnswer(result.answer);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleAddImportant = () => {
    if (!newImportantText.trim()) return;
    const point = {
      id: Date.now(),
      text: newImportantText,
      timestamp: currentTime || Date.now(),
      type: 'MANUAL',
      saved: true,
    };
    setImportantPoints(prev => [...prev, point]);
    setNewImportantText('');
    setShowAddImportant(false);
  };

  const handleMissedCatchUp = () => {
    // In production, would generate AI summary of missed portion
    alert(`Catch-up summary for ${formatDuration(missedDuration)} of missed content would be generated here.`);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FileText size={16} /> },
    { id: 'notes', label: 'Notes', icon: <ListTree size={16} /> },
    { id: 'resources', label: 'Resources', icon: <BookOpenCheck size={16} /> },
    { id: 'concept-map', label: 'Concept Map', icon: <Map size={16} /> },
    { id: 'important', label: 'Important', icon: <Lightbulb size={16} /> },
    { id: 'ask-ai', label: 'Ask AI', icon: <MessageSquare size={16} /> },
    { id: 'timeline', label: 'Timeline', icon: <ClockIcon size={16} /> },
    { id: 'missed', label: 'What I Missed', icon: <AlertCircle size={16} /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Sparkles size={16} /> },
    { id: 'studio', label: '3D View', icon: <Cuboid size={16} /> },
  ];

  const availableTabs = tabs.filter(t => {
    if (t.id === 'studio' && !safeClassData.modelUrl) return false;
    if (t.id === 'flashcards' && (!safeClassData.flashcards || safeClassData.flashcards.length === 0) && !isGeneratingCards) return true; // Allow to generate
    return true;
  });

  return (
    <div className="page-container note-viewer-new">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      )}

      <Button variant="ghost" size="sm" onClick={() => onNavigate(subject?.id ? `subject:${subject.id}` : 'dashboard')} leftIcon={<ArrowLeft size={14} />}>
        Back to {subject?.name || 'Dashboard'}
      </Button>

      {/* Header */}
      <div className="page-header animate-in">
        <div className="page-header-left">
          <div className="page-header-emoji">{subject?.emoji || '📚'}</div>
          <div className="page-header-info">
            <h1 style={{ fontFamily: 'var(--font-heading)' }}>{safeClassData.title || 'Lecture Notes'}</h1>
            <p>{subject?.name || 'Lecture'} • {safeClassData.date ? formatDate(safeClassData.date) : 'Today'} • {formatDuration(safeClassData.duration || 0)}</p>
          </div>
        </div>
        <div className="note-viewer-actions">
          <Button variant="ghost" size="sm" onClick={() => onNavigate(`edit:${safeClassData.id || ''}`)} leftIcon={<Edit3 size={16} />}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportMD} leftIcon={<Download size={16} />}>
            Export MD
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportPDF} leftIcon={<Download size={16} />}>
            PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopyNotes} leftIcon={<Copy size={16} />}>
            Copy
          </Button>
        </div>
      </div>

      {/* Main Document Card */}
      <div className="md-document-card animate-in">
        {/* Tabs */}
        <div className="md-tab-bar" role="tablist">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              className={`md-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Panes */}
        <div className="md-content-pane">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="tab-pane-content fade-in">
              {!summary ? (
                <div className="empty-state-card">
                  <div className="empty-state-icon">
                    <Sparkles size={32} />
                  </div>
                  <h3>AI Summary not generated</h3>
                  <p>Generate a comprehensive summary of this lecture with key takeaways.</p>
                  <Button variant="primary" onClick={handleSummarize} disabled={isSummarizing} leftIcon={isSummarizing ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}>
                    {isSummarizing ? 'Generating...' : 'Generate Summary'}
                  </Button>
                </div>
              ) : (
                <div className="overview-content">
                  {typeof summary === 'string' ? (
                    <div className="overview-section">
                      <p className="overview-text">{summary}</p>
                    </div>
                  ) : (
                    <>
                      <div className="overview-section">
                        <h3>Overview</h3>
                        <p className="overview-text">{summary?.overview || 'Overview available.'}</p>
                      </div>
                      <div className="overview-section">
                        <h3>Key Takeaways</h3>
                        <ul className="takeaways-list">
                          {(Array.isArray(summary?.keyTakeaways) ? summary.keyTakeaways : []).map((item, i) => (
                            <li key={i}>
                              <span className="takeaway-bullet" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {Array.isArray(summary?.mainTopics) && summary.mainTopics.length > 0 && (
                        <div className="overview-section">
                          <h3>Main Topics Covered</h3>
                          <div className="topics-tags">
                            {summary.mainTopics.map((topic, i) => (
                              <Badge key={i} variant="primary" size="sm">{topic}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Quick Stats */}
                  <div className="overview-stats">
                    <div className="stat-item">
                      <span className="stat-value">{classData.notes?.length || 0}</span>
                      <span className="stat-label">Notes</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{classData.duration ? Math.round(classData.duration / 60) : 0}</span>
                      <span className="stat-label">Minutes</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{resources.length}</span>
                      <span className="stat-label">Resources</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{importantPoints.length}</span>
                      <span className="stat-label">Important</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="tab-pane-content fade-in">
              {sections.length === 0 ? (
                <div className="empty-state-card">
                  <div className="empty-state-icon">
                    <FileText size={32} />
                  </div>
                  <h3>No notes structured yet</h3>
                  <p>Start recording or dictating concepts to see notes appear here.</p>
                </div>
              ) : (
                <div className="notes-sections">
                  {sections.map((section, sIdx) => (
                    <div key={sIdx} className="notes-section">
                      <div className="notes-section-header">
                        <ListTree size={16} />
                        <h4>{section.title}</h4>
                        <Badge variant="neutral" size="xs">{section.items.length} points</Badge>
                      </div>
                      <div className="notes-list">
                        {section.items.map((note) => (
                          <div
                            key={note.id}
                            className="note-item-interactive"
                            onClick={() => seekTo(note.timestamp)}
                            title="Click to seek audio"
                          >
                            <div className="note-bullet" style={{ background: subject.color || 'var(--primary-600)' }} />
                            <div className="note-item-content">
                              <div className="note-item-text">{renderNoteText(note)}</div>
                              <div className="note-item-meta">
                                <span className="note-item-time">{formatDuration(note.timestamp)}</span>
                                {note.highlights && note.highlights.length > 0 && (
                                  <Badge variant="warning" size="xs">Highlighted</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RESOURCES TAB */}
          {activeTab === 'resources' && (
            <div className="tab-pane-content fade-in">
              {resources.length === 0 ? (
                <div className="empty-state-card">
                  <div className="empty-state-icon">
                    <BookOpenCheck size={32} />
                  </div>
                  <h3>No resources yet</h3>
                  <p>AI will suggest relevant resources based on the lecture topic.</p>
                  <Button variant="outline" leftIcon={<Search size={16} />}>
                    Find Resources
                  </Button>
                </div>
              ) : (
                <div className="resources-grid">
                  {resources.map((resource, i) => (
                    <div key={i} className="resource-card">
                      <div className="resource-card-header">
                        <div className="resource-card-icon" style={{ background: getResourceColor(resource.type) }}>
                          {resource.type === 'book' && <BookOpenCheck size={18} />}
                          {resource.type === 'pdf' && <File size={18} />}
                          {resource.type === 'doc' && <Link2 size={18} />}
                          {resource.type === 'video' && <Play size={18} />}
                        </div>
                        <Badge variant={resource.type === 'book' ? 'primary' : resource.type === 'pdf' ? 'success' : 'ai'} size="xs">
                          {resource.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="resource-card-content">
                        <h4 className="resource-card-title">{resource.title}</h4>
                        <p className="resource-card-source">{resource.source}</p>
                        <p className="resource-card-reason">{resource.reason || 'Recommended for this topic'}</p>
                      </div>
                      <div className="resource-card-actions">
                        <Button variant="ghost" size="xs" leftIcon={<Search size={14} />}>
                          {resource.action || 'Open'}
                        </Button>
                        <Button variant="ghost" size="xs" leftIcon={<Download size={14} />}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONCEPT MAP TAB */}
          {activeTab === 'concept-map' && (
            <div className="tab-pane-content fade-in">
              {conceptMapData ? (
                <div className="concept-map-container">
                  <ConceptMapVisualization data={conceptMapData} subject={subject} />
                  <div className="concept-map-legend">
                    <div className="legend-item">
                      <span className="legend-dot" style={{ background: 'var(--primary-600)' }} />
                      Main Topic
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot" style={{ background: 'var(--ai-600)' }} />
                      Subtopics
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot" style={{ background: 'var(--success-600)' }} />
                      Key Concepts
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state-card">
                  <div className="empty-state-icon">
                    <Map size={32} />
                  </div>
                  <h3>Generating concept map...</h3>
                  <p>AI is analyzing the lecture structure to create a visual map.</p>
                </div>
              )}
            </div>
          )}

          {/* IMPORTANT POINTS TAB */}
          {activeTab === 'important' && (
            <div className="tab-pane-content fade-in">
              <div className="important-header">
                <h3>Important Points</h3>
                <p>{importantPoints.length} point{importantPoints.length !== 1 ? 's' : ''} marked for revision</p>
              </div>

              {showAddImportant ? (
                <div className="add-important-form">
                  <Input
                    label="What's important?"
                    placeholder="Enter a key concept, definition, formula, or exam hint..."
                    value={newImportantText}
                    onChange={setNewImportantText}
                    leftIcon={<Lightbulb size={18} />}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddImportant()}
                  />
                  <div className="form-actions">
                    <Button variant="secondary" size="sm" onClick={() => setShowAddImportant(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={handleAddImportant} disabled={!newImportantText.trim()}>Save</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowAddImportant(true)} leftIcon={<Lightbulb size={14} />}>
                  Add Important Point
                </Button>
              )}

              {importantPoints.length === 0 ? (
                <div className="empty-state-card" style={{ marginTop: 24 }}>
                  <div className="empty-state-icon">
                    <Lightbulb size={32} />
                  </div>
                  <h3>No important points yet</h3>
                  <p>Mark key concepts, definitions, formulas, or teacher hints for quick revision.</p>
                </div>
              ) : (
                <div className="important-list">
                  {importantPoints.map((point, i) => (
                    <div key={i} className="important-item">
                      <div className="important-type">
                        <span className={`type-badge ${point.type?.toLowerCase()}`}>
                          {point.type || 'NOTE'}
                        </span>
                      </div>
                      <div className="important-content">
                        <p className="important-text">{point.text}</p>
                        <div className="important-meta">
                          <span className="important-time">
                            <ClockIcon size={12} /> {point.timestamp ? formatDuration(point.timestamp) : 'Manual'}
                          </span>
                          {point.saved && <Badge variant="success" size="xs">Saved for revision</Badge>}
                        </div>
                      </div>
                      <Button variant="ghost" size="xs" onClick={() => { setImportantPoints(prev => prev.filter((_, idx) => idx !== i)); }}>
                        <AlertCircle size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ASK AI TAB */}
          {activeTab === 'ask-ai' && (
            <div className="tab-pane-content fade-in">
              <div className="ask-ai-header">
                <h3>Ask Your Lecture</h3>
                <p>Get answers grounded in this lecture's content</p>
              </div>

              <div className="ask-ai-chat">
                {aiHistory.map((entry, i) => (
                  <div key={i} className="chat-message">
                    <div className="message user">
                      <div className="message-avatar">
                        <Avatar name="You" size="sm" />
                      </div>
                      <div className="message-content">
                        <p>{entry.question}</p>
                        <span className="message-time">{formatDuration(Math.floor(entry.timestamp / 1000))}</span>
                      </div>
                    </div>
                    <div className="message ai">
                      <div className="message-avatar">
                        <Avatar name="AI" size="sm" style={{ background: 'var(--ai-100)', color: 'var(--ai-600)' }} />
                      </div>
                      <div className="message-content">
                        <p>{entry.answer}</p>
                        {entry.sources && entry.sources.length > 0 && (
                          <div className="message-sources">
                            <span>Sources: </span>
                            {entry.sources.map((s, si) => (
                              <Badge key={si} variant="primary" size="xs" onClick={() => seekTo(s.timestamp)}>
                                {s.type} @ {formatDuration(s.timestamp)}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <span className="message-time">{formatDuration(Math.floor(entry.timestamp / 1000))}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {isAiThinking && (
                  <div className="chat-message thinking">
                    <div className="message ai">
                      <div className="message-avatar">
                        <Avatar name="AI" size="sm" style={{ background: 'var(--ai-100)', color: 'var(--ai-600)' }} />
                      </div>
                      <div className="message-content">
                        <div className="typing-indicator">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="ask-ai-input">
                <Input
                  value={aiQuestion}
                  onChange={setAiQuestion}
                  placeholder="Ask anything about this lecture..."
                  leftIcon={<MessageSquare size={18} />}
                  rightAction={{
                    icon: <ArrowRight size={18} />,
                    onClick: handleAskAI,
                    'aria-label': 'Send question'
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAskAI())}
                  disabled={isAiThinking}
                />
                <p className="ask-ai-hint">
                  Try: "What is the main concept?", "Explain the difference between X and Y", "Summarize the key formula"
                </p>
              </div>
            </div>
          )}

          {/* TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <div className="tab-pane-content fade-in">
              <div className="timeline-header">
                <h3>Lecture Timeline</h3>
                <p>Click any segment to jump to that point in the transcript and audio</p>
              </div>

              {(classData.topics || []).length > 0 ? (
                <div className="timeline-visual">
                  {(classData.topics || []).map((topic, i) => (
                    <div key={i} className="timeline-segment" onClick={() => seekTo(topic.time)}>
                      <div className="segment-marker" />
                      <div className="segment-content">
                        <div className="segment-time">{formatDuration(topic.time)}</div>
                        <div className="segment-topic">{topic.topic}</div>
                        <div className="segment-subtopic">{topic.subtopic}</div>
                      </div>
                      <div className="segment-arrow">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-card">
                  <div className="empty-state-icon">
                    <ClockIcon size={32} />
                  </div>
                  <h3>No timeline data</h3>
                  <p>Topic timeline will be generated after the lecture is completed.</p>
                </div>
              )}
            </div>
          )}

          {/* WHAT I MISSED TAB */}
          {activeTab === 'missed' && (
            <div className="tab-pane-content fade-in">
              <div className="missed-header">
                <div className="missed-badge">
                  <AlertCircle size={24} />
                  <div>
                    <h3>You Missed Content</h3>
                    <p>Join late or step away? Catch up in 2 minutes.</p>
                  </div>
                </div>
                <div className="missed-duration">
                  <span className="missed-time">{formatDuration(missedDuration)}</span>
                  <span className="missed-label">of content</span>
                </div>
              </div>

              <div className="missed-topics">
                <h4>Topics Covered While You Were Away</h4>
                <ul>
                  {(classData.topics || []).slice(-3).map((t, i) => (
                    <li key={i}>
                      <Badge variant="primary" size="xs">{t.topic}</Badge>
                      <span>{t.subtopic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="missed-actions">
                <Button variant="primary" size="lg" fullWidth onClick={handleMissedCatchUp} leftIcon={<Lightbulb size={18} />}>
                  2-Minute Catch-Up Summary
                </Button>
                <Button variant="secondary" size="lg" fullWidth onClick={() => seekTo(classData.duration - missedDuration)} leftIcon={<Play size={18} />}>
                  Listen from Where You Left Off
                </Button>
              </div>
            </div>
          )}

          {/* FLASHCARDS TAB */}
          {activeTab === 'flashcards' && (
            <div className="tab-pane-content fade-in">
              <FlashcardViewer
                flashcards={flashcardData.flashcards}
                quiz={flashcardData.quiz}
                isGenerating={isGeneratingCards}
                onGenerate={handleGenerateFlashcards}
              />
            </div>
          )}

          {/* STUDIO TAB */}
          {activeTab === 'studio' && classData.modelUrl && (
            <div className="tab-pane-content fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
              <SubjectStudio modelUrl={classData.modelUrl} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Audio Player */}
      {audioUrl && (
        <div className="md-bottom-audio-bar">
          <Button variant="ghost" size="icon" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </Button>
          <div className="md-audio-progress-container" onClick={(e) => {
            if (!audioUrl || !audioRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * classData.duration;
            seekTo(newTime);
          }}>
            <div className="md-progress-bg"></div>
            <div className="md-progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div className="md-audio-time">
            {formatDuration(Math.floor(currentTime))} / {formatDuration(classData.duration)}
          </div>
        </div>
      )}
    </div>
  );
}

function ConceptMapVisualization({ data, subject }) {
  const { mainTopic = 'Lecture Concepts', subtopics = [], concepts = [] } = data || {};
  const centerX = 200;
  const centerY = 200;
  const radius = 140;

  return (
    <div className="concept-map-svg-wrapper">
      <svg viewBox="0 0 400 400" className="concept-map-svg">
        {/* Connections to subtopics */}
        {subtopics.map((subtopic, i) => {
          const angle = (i / subtopics.length) * 2 * Math.PI - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          return (
            <g key={i}>
              <line
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="var(--border-medium)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <circle
                cx={x}
                cy={y}
                r={45}
                fill="var(--ai-100)"
                stroke="var(--ai-600)"
                strokeWidth="2"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="600"
                fill="var(--ai-700)"
                fontFamily="var(--font-sans)"
              >
                {subtopic.length > 12 ? subtopic.slice(0, 12) + '…' : subtopic}
              </text>
              {/* Concepts around subtopics */}
              {concepts.slice(i * 2, (i + 1) * 2).map((concept, ci) => {
                const cAngle = angle + (ci - 0.5) * 0.8;
                const cx = x + 70 * Math.cos(cAngle);
                const cy = y + 70 * Math.sin(cAngle);
                return (
                  <g key={ci}>
                    <line
                      x1={x}
                      y1={y}
                      x2={cx}
                      y2={cy}
                      stroke="var(--border-medium)"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={28}
                      fill="var(--success-100)"
                      stroke="var(--success-600)"
                      strokeWidth="1.5"
                    />
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="9"
                      fontWeight="500"
                      fill="var(--success-700)"
                      fontFamily="var(--font-sans)"
                    >
                      {concept.length > 10 ? concept.slice(0, 10) + '…' : concept}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
        {/* Center - Main Topic */}
        <circle
          cx={centerX}
          cy={centerY}
          r={60}
          fill="var(--primary-100)"
          stroke="var(--primary-600)"
          strokeWidth="3"
        />
        <text
          x={centerX}
          y={centerY - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="13"
          fontWeight="700"
          fill="var(--primary-800)"
          fontFamily="var(--font-sans)"
        >
          {mainTopic.length > 18 ? mainTopic.slice(0, 18) + '…' : mainTopic}
        </text>
        <text
          x={centerX}
          y={centerY + 16}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="var(--primary-600)"
          fontFamily="var(--font-sans)"
        >
          {subject.name}
        </text>
      </svg>
    </div>
  );
}

function getResourceColor(type) {
  switch (type) {
    case 'book': return 'var(--primary-100)';
    case 'pdf': return 'var(--success-100)';
    case 'doc': return 'var(--ai-100)';
    case 'video': return 'var(--warning-100)';
    default: return 'var(--bg-tertiary)';
  }
}

export default NoteViewer;