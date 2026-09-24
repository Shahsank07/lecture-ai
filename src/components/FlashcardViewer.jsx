import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, RotateCcw, Zap, BookOpen, CheckCircle, XCircle, Trophy, Loader2 } from 'lucide-react';
import './FlashcardViewer.css';

function FlashcardViewer({ flashcards = [], quiz = [], isGenerating = false, onGenerate }) {
  const [mode, setMode] = useState('flashcards'); // 'flashcards' | 'quiz'
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledCards, setShuffledCards] = useState(flashcards);

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    setShuffledCards(flashcards);
  }, [flashcards]);

  // Keyboard navigation for flashcards
  useEffect(() => {
    if (mode !== 'flashcards' || flashcards.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(f => !f);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, currentCard, shuffledCards.length]);

  const goNext = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCard(c => Math.min(c + 1, shuffledCards.length - 1));
    }, 150);
  }, [shuffledCards.length]);

  const goPrev = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCard(c => Math.max(c - 1, 0));
    }, 150);
  }, []);

  const handleShuffle = () => {
    const newOrder = [...shuffledCards].sort(() => Math.random() - 0.5);
    setShuffledCards(newOrder);
    setCurrentCard(0);
    setIsFlipped(false);
  };

  const handleQuizOption = (optionIndex) => {
    if (selectedOption !== null) return; // Already answered
    setSelectedOption(optionIndex);
    setShowResult(true);

    const isCorrect = optionIndex === quiz[currentQuestion].correctIndex;
    if (isCorrect) setScore(s => s + 1);

    setAnsweredQuestions(prev => [...prev, {
      questionIndex: currentQuestion,
      selected: optionIndex,
      correct: isCorrect
    }]);

    // Auto-advance after 1.5s
    setTimeout(() => {
      if (currentQuestion < quiz.length - 1) {
        setCurrentQuestion(q => q + 1);
        setSelectedOption(null);
        setShowResult(false);
      } else {
        setQuizComplete(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions([]);
    setQuizComplete(false);
  };

  const noData = flashcards.length === 0 && quiz.length === 0;

  // ── Loading / Empty State ──
  if (isGenerating) {
    return (
      <div className="fc-empty-state">
        <Loader2 size={32} className="fc-spin" />
        <h3>Generating Study Materials...</h3>
        <p>AI is creating flashcards and quiz questions from your lecture.</p>
      </div>
    );
  }

  if (noData) {
    return (
      <div className="fc-empty-state">
        <div className="fc-empty-icon">🃏</div>
        <h3>No Flashcards Yet</h3>
        <p>Generate AI-powered flashcards and quizzes from your lecture notes.</p>
        {onGenerate && (
          <button className="btn btn-gold fc-generate-btn" onClick={onGenerate}>
            <Zap size={16} />
            Generate Flashcards & Quiz
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="fc-container">
      {/* Mode Switcher */}
      <div className="fc-mode-bar">
        <button
          className={`fc-mode-btn ${mode === 'flashcards' ? 'active' : ''}`}
          onClick={() => setMode('flashcards')}
        >
          <BookOpen size={14} />
          Flashcards ({flashcards.length})
        </button>
        <button
          className={`fc-mode-btn ${mode === 'quiz' ? 'active' : ''}`}
          onClick={() => { setMode('quiz'); resetQuiz(); }}
        >
          <Zap size={14} />
          Quiz ({quiz.length})
        </button>
      </div>

      {/* ──── FLASHCARD MODE ──── */}
      {mode === 'flashcards' && shuffledCards.length > 0 && (
        <div className="fc-flashcard-section">
          {/* Progress */}
          <div className="fc-progress-bar">
            <div className="fc-progress-text">
              {currentCard + 1} / {shuffledCards.length}
            </div>
            <div className="fc-progress-track">
              <div
                className="fc-progress-fill"
                style={{ width: `${((currentCard + 1) / shuffledCards.length) * 100}%` }}
              />
            </div>
            <button className="fc-shuffle-btn" onClick={handleShuffle} title="Shuffle">
              <Shuffle size={14} />
            </button>
          </div>

          {/* Card */}
          <div
            className={`fc-card-wrapper ${isFlipped ? 'flipped' : ''}`}
            onClick={() => setIsFlipped(f => !f)}
          >
            <div className="fc-card">
              <div className="fc-card-front">
                <div className="fc-card-label">QUESTION</div>
                <div className="fc-card-content">{shuffledCards[currentCard]?.question}</div>
                <div className="fc-card-hint">Click to reveal answer</div>
              </div>
              <div className="fc-card-back">
                <div className="fc-card-label">ANSWER</div>
                <div className="fc-card-content">{shuffledCards[currentCard]?.answer}</div>
                <div className="fc-card-hint">Click to see question</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="fc-nav-row">
            <button
              className="fc-nav-btn"
              onClick={goPrev}
              disabled={currentCard === 0}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="fc-keyboard-hints">
              <span>← → navigate</span>
              <span>Space to flip</span>
            </div>
            <button
              className="fc-nav-btn"
              onClick={goNext}
              disabled={currentCard === shuffledCards.length - 1}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ──── QUIZ MODE ──── */}
      {mode === 'quiz' && quiz.length > 0 && !quizComplete && (
        <div className="fc-quiz-section">
          {/* Quiz Progress */}
          <div className="fc-quiz-header">
            <div className="fc-quiz-progress-text">
              Question {currentQuestion + 1} of {quiz.length}
            </div>
            <div className="fc-quiz-score">
              Score: {score}/{answeredQuestions.length}
            </div>
          </div>
          <div className="fc-progress-track" style={{ marginBottom: '24px' }}>
            <div
              className="fc-progress-fill"
              style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="fc-quiz-question">
            {quiz[currentQuestion]?.question}
          </div>

          {/* Options */}
          <div className="fc-quiz-options">
            {quiz[currentQuestion]?.options.map((option, idx) => {
              let optionClass = 'fc-quiz-option';
              if (showResult) {
                if (idx === quiz[currentQuestion].correctIndex) {
                  optionClass += ' correct';
                } else if (idx === selectedOption && idx !== quiz[currentQuestion].correctIndex) {
                  optionClass += ' wrong';
                }
              } else if (selectedOption === idx) {
                optionClass += ' selected';
              }

              return (
                <button
                  key={idx}
                  className={optionClass}
                  onClick={() => handleQuizOption(idx)}
                  disabled={selectedOption !== null}
                >
                  <span className="fc-option-letter">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="fc-option-text">{option}</span>
                  {showResult && idx === quiz[currentQuestion].correctIndex && (
                    <CheckCircle size={18} className="fc-option-icon correct" />
                  )}
                  {showResult && idx === selectedOption && idx !== quiz[currentQuestion].correctIndex && (
                    <XCircle size={18} className="fc-option-icon wrong" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ──── QUIZ COMPLETE ──── */}
      {mode === 'quiz' && quizComplete && (
        <div className="fc-quiz-results">
          <div className="fc-results-trophy">
            <Trophy size={48} />
          </div>
          <h3 className="fc-results-title">Quiz Complete!</h3>
          <div className="fc-results-score">
            <span className="fc-score-big">{score}</span>
            <span className="fc-score-divider">/</span>
            <span className="fc-score-total">{quiz.length}</span>
          </div>
          <div className="fc-results-percent">
            {Math.round((score / quiz.length) * 100)}% correct
          </div>
          <div className="fc-results-message">
            {score === quiz.length
              ? '🎉 Perfect score! You\'ve mastered this material!'
              : score >= quiz.length * 0.7
              ? '👏 Great job! You have a solid understanding.'
              : score >= quiz.length * 0.4
              ? '📚 Good effort! Review the flashcards and try again.'
              : '💪 Keep studying! Use the flashcards to review the material.'}
          </div>
          <button className="btn btn-gold fc-retry-btn" onClick={resetQuiz}>
            <RotateCcw size={16} />
            Try Again
          </button>
        </div>
      )}

      {mode === 'quiz' && quiz.length === 0 && (
        <div className="fc-empty-state">
          <div className="fc-empty-icon">❓</div>
          <h3>No Quiz Questions Available</h3>
          <p>Quiz questions couldn't be generated from this lecture.</p>
        </div>
      )}
    </div>
  );
}

export default FlashcardViewer;
