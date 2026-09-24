import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ArrowLeft, Save, Plus, Trash2, Eye, GripVertical, CheckCircle, X
} from 'lucide-react';
import { saveClass } from '../db';
import { generateId, formatDuration } from '../utils/helpers';
import HighlightToolbar from './HighlightToolbar';
import './NoteEditor.css';

function NoteEditor({ classData, subject, onNavigate, onRefreshClass }) {
  const [notes, setNotes] = useState(classData.notes || []);
  const [saved, setSaved] = useState(false);
  const [highlightToolbar, setHighlightToolbar] = useState(null);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const editorRef = useRef(null);

  // Auto-save on notes change
  useEffect(() => {
    const timeout = setTimeout(async () => {
      await saveClass({ ...classData, notes });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [notes, classData]);

  const handleSave = async () => {
    await saveClass({ ...classData, notes });
    onRefreshClass(classData.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleNoteTextChange = (noteId, newText) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, text: newText, isEdited: true } : n
      )
    );
  };

  const handleDeleteNote = (noteId) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const handleAddNote = () => {
    const newNote = {
      id: generateId(),
      text: '',
      timestamp: 0,
      isEdited: true,
      highlights: [],
    };
    setNotes((prev) => [...prev, newNote]);
  };

  // Highlight handling
  const handleTextSelection = useCallback((noteId) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setHighlightToolbar(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setActiveNoteId(noteId);
    setHighlightToolbar({
      top: rect.top - 44,
      left: rect.left + rect.width / 2 - 70,
    });
  }, []);

  const applyHighlight = useCallback((color) => {
    if (!activeNoteId) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const noteEl = document.querySelector(`[data-note-id="${activeNoteId}"]`);
    if (!noteEl) return;

    // Get the full text content and selection offsets
    const fullText = noteEl.textContent || '';
    const selText = selection.toString();

    // Find the start position of the selection within the note text
    const range = selection.getRangeAt(0);

    // Calculate offset in the text content
    let start = 0;
    const treeWalker = document.createTreeWalker(noteEl, NodeFilter.SHOW_TEXT);
    let found = false;

    while (treeWalker.nextNode()) {
      if (treeWalker.currentNode === range.startContainer) {
        start += range.startOffset;
        found = true;
        break;
      }
      start += treeWalker.currentNode.textContent.length;
    }

    if (!found) return;

    const end = start + selText.length;

    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== activeNoteId) return n;
        const newHighlights = [...(n.highlights || [])];
        // Remove overlapping highlights
        const filtered = newHighlights.filter(
          (h) => h.end <= start || h.start >= end
        );
        filtered.push({ start, end, color });
        return { ...n, highlights: filtered };
      })
    );

    selection.removeAllRanges();
    setHighlightToolbar(null);
  }, [activeNoteId]);

  const removeHighlight = useCallback(() => {
    if (!activeNoteId) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const noteEl = document.querySelector(`[data-note-id="${activeNoteId}"]`);
    if (!noteEl) return;

    const selText = selection.toString();
    const range = selection.getRangeAt(0);

    let start = 0;
    const treeWalker = document.createTreeWalker(noteEl, NodeFilter.SHOW_TEXT);

    while (treeWalker.nextNode()) {
      if (treeWalker.currentNode === range.startContainer) {
        start += range.startOffset;
        break;
      }
      start += treeWalker.currentNode.textContent.length;
    }

    const end = start + selText.length;

    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== activeNoteId) return n;
        const filtered = (n.highlights || []).filter(
          (h) => !(h.start >= start && h.end <= end)
        );
        return { ...n, highlights: filtered };
      })
    );

    selection.removeAllRanges();
    setHighlightToolbar(null);
  }, [activeNoteId]);

  // Click outside to dismiss highlight toolbar
  useEffect(() => {
    const handler = (e) => {
      if (highlightToolbar && !e.target.closest('.highlight-toolbar')) {
        // Small delay to let click handlers fire
        setTimeout(() => setHighlightToolbar(null), 200);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [highlightToolbar]);

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

  return (
    <div className="page-container note-editor-container" ref={editorRef}>
      <button className="back-btn" onClick={() => {
        handleSave();
        onNavigate(`notes:${classData.id}`);
      }}>
        <ArrowLeft size={14} />
        Back to Notes
      </button>

      {/* Header */}
      <div className="page-header animate-in">
        <div className="page-header-left">
          <div className="page-header-emoji">{subject.emoji}</div>
          <div className="page-header-info">
            <h1>Editing — {classData.title}</h1>
            <p>Select text to highlight • Click to edit • Auto-saves</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="editor-toolbar animate-in">
        <button className="btn btn-primary btn-sm" onClick={handleSave} id="btn-save-notes">
          <Save size={14} />
          Save
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            handleSave();
            onNavigate(`notes:${classData.id}`);
          }}
        >
          <Eye size={14} />
          Preview
        </button>
        <div className="editor-toolbar-divider" />
        <button className="btn btn-secondary btn-sm" onClick={handleAddNote}>
          <Plus size={14} />
          Add Point
        </button>
        {saved && (
          <div className="editor-save-indicator">
            <CheckCircle size={14} />
            Saved
          </div>
        )}
      </div>

      {/* Notes list */}
      <div className="editor-note-list animate-in">
        {notes.map((note) => (
          <div key={note.id} className="editor-note-item">
            <div className="editor-note-drag">
              <GripVertical size={16} />
            </div>
            <div
              className="editor-note-bullet"
              style={{ background: subject.color || 'var(--accent-purple)' }}
            />
            <div className="editor-note-content">
              <div
                className="editor-note-text"
                contentEditable
                suppressContentEditableWarning
                data-note-id={note.id}
                onBlur={(e) => {
                  const text = e.target.textContent;
                  handleNoteTextChange(note.id, text);
                }}
                onMouseUp={() => handleTextSelection(note.id)}
                dangerouslySetInnerHTML={{
                  __html: renderNoteTextHTML(note),
                }}
              />
            </div>
            <div className="editor-note-actions">
              <button
                className="editor-note-action-btn"
                onClick={() => handleDeleteNote(note.id)}
                title="Delete this point"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add note button */}
      <button className="editor-add-note" onClick={handleAddNote}>
        <Plus size={16} />
        Add a new point
      </button>

      {/* Floating highlight toolbar */}
      {highlightToolbar && (
        <HighlightToolbar
          position={highlightToolbar}
          onHighlight={applyHighlight}
          onRemove={removeHighlight}
        />
      )}
    </div>
  );
}

// Render note text as HTML with highlight marks
function renderNoteTextHTML(note) {
  if (!note.highlights || note.highlights.length === 0) {
    return escapeHtml(note.text);
  }

  const sorted = [...note.highlights].sort((a, b) => a.start - b.start);
  let html = '';
  let lastIdx = 0;

  sorted.forEach((hl) => {
    if (hl.start > lastIdx) {
      html += escapeHtml(note.text.slice(lastIdx, hl.start));
    }
    html += `<mark data-color="${hl.color}">${escapeHtml(note.text.slice(hl.start, hl.end))}</mark>`;
    lastIdx = hl.end;
  });

  if (lastIdx < note.text.length) {
    html += escapeHtml(note.text.slice(lastIdx));
  }

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default NoteEditor;
