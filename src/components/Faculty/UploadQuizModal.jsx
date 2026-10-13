import { useState } from 'react';
import {
  X, HelpCircle, Plus, Trash2, CheckCircle, Sparkles,
  Upload, Clock, Award, Calendar, FileQuestion, ArrowRight
} from 'lucide-react';
import { generateId } from '../../utils/helpers';
import { addNotification } from '../../db';
import './FacultyPanel.css';

const CLASSES = [
  'Data Structures (B.Tech CSE - 3rd Sem)',
  'Database Management Systems (B.Tech CSE - 4th Sem)',
  'Operating Systems (B.Tech CSE - 3rd Sem)',
  'Computer Networks (B.Tech CSE - 4th Sem)',
  'Artificial Intelligence (B.Tech CSE - 6th Sem)'
];

const DEFAULT_QUESTIONS = [
  {
    id: 'q-1',
    question: 'What is the time complexity of searching in a balanced Binary Search Tree (AVL tree)?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctIndex: 1,
    explanation: 'A balanced BST maintains a height of O(log n), so search operations take logarithmic time.'
  },
  {
    id: 'q-2',
    question: 'Which tree traversal visits the root node before its subtrees?',
    options: ['In-order Traversal', 'Post-order Traversal', 'Pre-order Traversal', 'Level-order Traversal'],
    correctIndex: 2,
    explanation: 'Pre-order traversal processes Root, then Left Subtree, then Right Subtree.'
  }
];

export default function UploadQuizModal({ isOpen, onClose, onQuizCreated }) {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [quizTitle, setQuizTitle] = useState('Data Structures: Trees & Graphs Quiz');
  const [duration, setDuration] = useState('25');
  const [dueDate, setDueDate] = useState('2025-05-25');
  const [tab, setTab] = useState('builder'); // 'builder' | 'upload'
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: generateId(),
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: ''
      }
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx, text) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[idx].question = text;
      return copy;
    });
  };

  const handleOptionChange = (qIdx, optIdx, text) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx].options[optIdx] = text;
      return copy;
    });
  };

  const handleCorrectIndexChange = (qIdx, optIdx) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx].correctIndex = optIdx;
      return copy;
    });
  };

  const handleAIGenerate = () => {
    setQuestions([
      {
        id: generateId(),
        question: 'What data structure is used to implement Breadth-First Search (BFS)?',
        options: ['Stack', 'Queue', 'Priority Queue', 'Array'],
        correctIndex: 1,
        explanation: 'BFS uses a FIFO Queue to visit neighbor vertices level by level.'
      },
      {
        id: generateId(),
        question: 'Which hashing collision resolution technique uses linked lists for overflowing entries?',
        options: ['Linear Probing', 'Quadratic Probing', 'Separate Chaining', 'Double Hashing'],
        correctIndex: 2,
        explanation: 'Separate Chaining stores collisions in linked lists at each bucket.'
      },
      {
        id: generateId(),
        question: 'What is the worst-case time complexity of QuickSort?',
        options: ['O(n log n)', 'O(n^2)', 'O(n)', 'O(log n)'],
        correctIndex: 1,
        explanation: 'Worst case happens when the pivot is always the smallest or largest element, leading to O(n^2).'
      },
      {
        id: generateId(),
        question: 'In Dijkstra\'s algorithm, which data structure provides the optimal performance?',
        options: ['Min Heap / Fibonacci Heap', 'Max Heap', 'Simple Linked List', 'Hash Table'],
        correctIndex: 0,
        explanation: 'A min-priority heap allows extracting the minimum weight vertex efficiently.'
      }
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const quizData = {
      id: generateId(),
      title: quizTitle,
      classGroup: selectedClass,
      duration: parseInt(duration, 10),
      dueDate,
      questions,
      totalQuestions: questions.length,
      createdAt: new Date().toISOString(),
      createdBy: 'Dr. Alex Johnson'
    };

    // Save to localStorage for quick student access
    try {
      const existing = JSON.parse(localStorage.getItem('lecture_quizzes') || '[]');
      localStorage.setItem('lecture_quizzes', JSON.stringify([quizData, ...existing]));
      addNotification({
        id: 'notif-' + quizData.id,
        title: `Quiz Live: ${quizData.title}`,
        desc: `New quiz available for ${quizData.classGroup}. Duration: ${quizData.duration} mins.`,
        time: 'Just now',
        type: 'ai',
        targetRole: 'all',
        unread: true
      });
    } catch (err) {
      console.warn('Could not save quiz:', err);
    }

    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onQuizCreated) onQuizCreated(quizData);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="faculty-modal-overlay" onClick={onClose}>
      <div className="faculty-modal-content large" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="faculty-modal-header">
          <div className="modal-title-wrap">
            <div className="modal-title-icon magenta">
              <FileQuestion size={20} />
            </div>
            <div>
              <h3>Upload & Configure Class Quiz</h3>
              <p>Create interactive assessments with instant AI evaluation</p>
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
            <h4>Quiz Published to Students!</h4>
            <p>"{quizTitle}" is now live for all enrolled students in {selectedClass}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="faculty-modal-form">
            {/* Meta Row */}
            <div className="modal-form-grid-3">
              <div className="form-group">
                <label>Target Class</label>
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
                <label>Quiz Title</label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={e => setQuizTitle(e.target.value)}
                  required
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label>Duration (Minutes)</label>
                <div className="input-with-icon">
                  <Clock size={16} className="input-icon" />
                  <input
                    type="number"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    min="5"
                    max="180"
                    required
                    className="modal-input"
                  />
                </div>
              </div>
            </div>

            {/* Tabs & AI Quick Generator */}
            <div className="quiz-tabs-bar">
              <div className="quiz-tab-buttons">
                <button
                  type="button"
                  className={`quiz-tab-btn ${tab === 'builder' ? 'active' : ''}`}
                  onClick={() => setTab('builder')}
                >
                  Question Builder ({questions.length})
                </button>
                <button
                  type="button"
                  className={`quiz-tab-btn ${tab === 'upload' ? 'active' : ''}`}
                  onClick={() => setTab('upload')}
                >
                  Upload Quiz JSON / CSV
                </button>
              </div>

              <button
                type="button"
                className="ai-gen-btn"
                onClick={handleAIGenerate}
                title="Use AI to generate syllabus-aligned multiple choice questions"
              >
                <Sparkles size={16} />
                <span>AI Auto-Generate Questions</span>
              </button>
            </div>

            {/* Tab 1: Builder */}
            {tab === 'builder' && (
              <div className="questions-scroll-area">
                {questions.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="question-card-item">
                    <div className="question-item-header">
                      <span className="q-badge">Question {qIdx + 1}</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          className="q-delete-btn"
                          onClick={() => handleRemoveQuestion(qIdx)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Enter question prompt..."
                      value={q.question}
                      onChange={e => handleQuestionChange(qIdx, e.target.value)}
                      required
                      className="q-input-prompt"
                    />

                    <div className="q-options-grid">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`option-row ${q.correctIndex === optIdx ? 'is-correct' : ''}`}
                        >
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correctIndex === optIdx}
                            onChange={() => handleCorrectIndexChange(qIdx, optIdx)}
                            title="Mark as correct answer"
                          />
                          <span className="opt-letter">{String.fromCharCode(65 + optIdx)}</span>
                          <input
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            value={opt}
                            onChange={e => handleOptionChange(qIdx, optIdx, e.target.value)}
                            required
                            className="opt-input-field"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="add-question-btn"
                  onClick={handleAddQuestion}
                >
                  <Plus size={16} />
                  <span>Add Another Question</span>
                </button>
              </div>
            )}

            {/* Tab 2: Upload File */}
            {tab === 'upload' && (
              <div className="upload-quiz-tab-content">
                <div className="dropzone-area">
                  <Upload size={32} className="dropzone-cloud" />
                  <div className="dropzone-text">
                    <strong>Upload Question Bank File</strong> (.json, .csv, .txt)
                  </div>
                  <span className="dropzone-hint">Questions will be automatically parsed into the builder</span>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
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
                className="modal-primary-btn magenta-btn"
                disabled={submitting}
              >
                <span>{submitting ? 'Publishing...' : 'Publish Quiz to Class'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
