import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Mic, MicOff, Pause, Play,
  FileText, Radio, CheckCircle, Loader2, Trash2, Cuboid,
  BrainCircuit, BookOpen, File, Link2, Sparkles, Bell, Zap,
  Users, Copy, Check
} from 'lucide-react';
import SpeechEngine from '../speechEngine';
import { saveClass, deleteClass, getClass } from '../db';
import { createNotePoint } from '../utils/textProcessor';
import { summarizeNotes, extract3DSubject, factCheckTranscript } from '../services/aiService';
import { generateId, formatDuration } from '../utils/helpers';
import Waveform from './Waveform';
import SubjectStudio from './SubjectStudio';
import { Button } from './ui';
import { Badge } from './ui';
import { Card } from './ui';
import { Avatar } from './ui';
import { Progress } from './ui';
import './LiveSession.css';

const TOPIC_KEYWORDS = {
  'Convolutional Neural Networks': ['convolution', 'filter', 'kernel', 'feature map', 'pooling', 'stride', 'padding', 'cnn', 'convnet'],
  'Pooling Layers': ['pooling', 'max pooling', 'average pooling', 'global pooling', 'downsampling'],
  'Backpropagation': ['backpropagation', 'gradient', 'chain rule', 'weight update', 'learning rate'],
  'Decision Trees': ['decision tree', 'entropy', 'information gain', 'gini', 'split', 'leaf', 'node'],
  'Random Forest': ['random forest', 'ensemble', 'bagging', 'bootstrap', 'voting'],
  'Transformers': ['attention', 'self-attention', 'transformer', 'bert', 'gpt', 'encoder', 'decoder'],
  'RNN': ['recurrent', 'rnn', 'lstm', 'gru', 'sequence', 'hidden state'],
};

function LiveSession({ classData, subject, onNavigate, onRefreshClass }) {
  const [status, setStatus] = useState(classData?.status || 'recording');
  const [transcript, setTranscript] = useState(classData?.transcript || '');
  const [interimText, setInterimText] = useState('');
  const [notes, setNotes] = useState(classData?.notes || []);
  const [duration, setDuration] = useState(classData?.duration || 0);
  const [isListening, setIsListening] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [activeTab, setActiveTab] = useState('transcript');

  // Student joining & real-time distribution
  const [joinCode] = useState(() => classData?.joinCode || ('LEC-' + Math.floor(1000 + Math.random() * 9000)));
  const [attendees, setAttendees] = useState(classData?.attendees || []);
  const [showAttendees, setShowAttendees] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Polling for connected students in real-time
  useEffect(() => {
    if (!classData?.id) return;
    const pollAttendees = async () => {
      try {
        const updated = await getClass(classData.id);
        if (updated?.attendees && Array.isArray(updated.attendees)) {
          setAttendees(updated.attendees);
        }
      } catch {}
    };
    pollAttendees();
    const interval = setInterval(pollAttendees, 2500);
    return () => clearInterval(interval);
  }, [classData?.id]);

  const copyJoinCode = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(joinCode);
    } else {
      const el = document.createElement('textarea');
      el.value = joinCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const classRef = useRef({
    ...(classData || {}),
    joinCode,
    attendees: classData?.attendees || []
  });
  const engineRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const notesEndRef = useRef(null);
  const durationRef = useRef(duration);
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  const [corrections, setCorrections] = useState([]);
  const [active3DModel, setActive3DModel] = useState(null);

  // AI Understanding State
  const [currentTopic, setCurrentTopic] = useState('Introduction');
  const [currentSubtopic, setCurrentSubtopic] = useState('Course Overview');
  const [relatedConcepts, setRelatedConcepts] = useState([]);
  const [smartResources, setSmartResources] = useState([]);
  const [topicHistory, setTopicHistory] = useState([]);
  const [showTopicChange, setShowTopicChange] = useState(false);
  const [lastTopicChange, setLastTopicChange] = useState(null);

  // Topic detection from transcript
  const detectTopics = useCallback((text) => {
    const recentText = text.slice(-2000).toLowerCase();
    let detectedTopic = 'General Discussion';
    let detectedSubtopic = 'Current Topic';

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      const matches = keywords.filter(k => recentText.includes(k.toLowerCase())).length;
      if (matches >= 2) {
        detectedTopic = topic;
        break;
      }
    }

    // Subtopic detection
    if (detectedTopic === 'Convolutional Neural Networks') {
      if (recentText.includes('pooling')) detectedSubtopic = 'Pooling Layers';
      else if (recentText.includes('convolution') || recentText.includes('filter') || recentText.includes('kernel')) detectedSubtopic = 'Convolution Operations';
      else if (recentText.includes('feature map') || recentText.includes('activation')) detectedSubtopic = 'Feature Maps & Activations';
    } else if (detectedTopic === 'Decision Trees') {
      if (recentText.includes('entropy') || recentText.includes('information gain')) detectedSubtopic = 'Splitting Criteria';
      else if (recentText.includes('prune') || recentText.includes('overfit')) detectedSubtopic = 'Pruning & Overfitting';
    }

    if (detectedTopic !== currentTopic || detectedSubtopic !== currentSubtopic) {
      const prevTopic = currentTopic;
      setCurrentTopic(detectedTopic);
      setCurrentSubtopic(detectedSubtopic);
      setTopicHistory(prev => [...prev.slice(-4), { topic: detectedTopic, subtopic: detectedSubtopic, time: duration }]);
      setLastTopicChange({ from: prevTopic, to: detectedTopic, time: duration });
      setShowTopicChange(true);
      setTimeout(() => setShowTopicChange(false), 4000);

      // Update related concepts
      const concepts = getRelatedConcepts(detectedTopic, detectedSubtopic);
      setRelatedConcepts(concepts);

      // Update smart resources
      const resources = getSmartResources(detectedTopic, detectedSubtopic);
      setSmartResources(resources);
    }
  }, [currentTopic, currentSubtopic, duration]);

  useEffect(() => {
    if (!transcript || transcript.length < 50 || status === 'completed') return;

    const timeout = setTimeout(() => {
      detectTopics(transcript);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [transcript, status, detectTopics]);

  const getRelatedConcepts = (topic, subtopic) => {
    const conceptMap = {
      'Convolutional Neural Networks': {
        'Pooling Layers': ['Convolution Layer', 'Feature Maps', 'Filters/Kernels', 'Stride & Padding', 'ReLU Activation'],
        'Convolution Operations': ['Kernel/Filter', 'Stride', 'Padding', 'Feature Maps', 'Receptive Field'],
        'Feature Maps & Activations': ['Convolution Layer', 'ReLU', 'Batch Normalization', 'Pooling Layers', 'Depth'],
      },
      'Decision Trees': {
        'Splitting Criteria': ['Entropy', 'Information Gain', 'Gini Impurity', 'Chi-Square'],
        'Pruning & Overfitting': ['Pre-pruning', 'Post-pruning', 'Cost Complexity', 'Cross-validation'],
      },
      'Random Forest': {
        'default': ['Bagging', 'Feature Randomness', 'Out-of-Bag Error', 'Feature Importance', 'Bootstrap Sampling'],
      },
      'Transformers': {
        'default': ['Self-Attention', 'Multi-Head Attention', 'Positional Encoding', 'Feed-Forward Network', 'Layer Normalization'],
      },
    };

    return conceptMap[topic]?.[subtopic] || conceptMap[topic]?.default || ['Core Concepts', 'Key Definitions', 'Examples', 'Applications'];
  };

  const getSmartResources = (topic, subtopic) => {
    // Mock resources - in production would come from backend
    const resourceMap = {
      'Convolutional Neural Networks': {
        'Pooling Layers': [
          { type: 'book', title: 'Deep Learning - Ch. 9: CNNs', source: 'Goodfellow et al.', reason: 'Covers pooling theory and variants', action: 'Read' },
          { type: 'pdf', title: 'CS231n: Pooling Layer Notes', source: 'Stanford', reason: 'Lecture notes with visualizations', action: 'View PDF' },
          { type: 'doc', title: 'TensorFlow Pooling API', source: 'Official Docs', reason: 'Implementation reference', action: 'Open' },
        ],
        'Convolution Operations': [
          { type: 'book', title: 'Deep Learning - Ch. 9: Convolution', source: 'Goodfellow et al.', reason: 'Mathematical foundations', action: 'Read' },
          { type: 'pdf', title: 'A Guide to Convolution Arithmetic', source: 'Dumoulin & Visin', reason: 'Comprehensive visual guide', action: 'View PDF' },
          { type: 'doc', title: 'PyTorch Conv2d Docs', source: 'Official', reason: 'PyTorch implementation', action: 'Open' },
        ],
        'default': [
          { type: 'book', title: 'Deep Learning - Chapter 9', source: 'Goodfellow et al.', reason: 'Comprehensive CNN chapter', action: 'Read' },
          { type: 'pdf', title: 'CS231n Lecture Notes', source: 'Stanford', reason: 'Industry-standard course material', action: 'View PDF' },
          { type: 'doc', title: 'CNN Architectures Overview', source: 'Papers With Code', reason: 'Modern architecture survey', action: 'Open' },
        ],
      },
      'Decision Trees': {
        'default': [
          { type: 'book', title: 'ISL - Ch. 8: Tree Methods', source: 'James et al.', reason: 'Statistical learning perspective', action: 'Read' },
          { type: 'pdf', title: 'Decision Tree Algorithm', source: 'ML Course Notes', reason: 'Step-by-step algorithm', action: 'View PDF' },
          { type: 'doc', title: 'sklearn DecisionTreeClassifier', source: 'Scikit-learn', reason: 'Python implementation', action: 'Open' },
        ],
      },
      'Random Forest': {
        'default': [
          { type: 'book', title: 'ISL - Ch. 8: Ensemble Methods', source: 'James et al.', reason: 'Bagging and random forests', action: 'Read' },
          { type: 'pdf', title: 'Random Forest Explained', source: 'Berkeley ML', reason: 'Intuitive explanation', action: 'View PDF' },
        ],
      },
      'Transformers': {
        'default': [
          { type: 'book', title: 'Attention Is All You Need', source: 'Vaswani et al.', reason: 'Original transformer paper', action: 'Read' },
          { type: 'pdf', title: 'The Illustrated Transformer', source: 'Jay Alammar', reason: 'Visual explanation', action: 'View PDF' },
          { type: 'doc', title: 'Hugging Face Transformers', source: 'Official', reason: 'Library documentation', action: 'Open' },
        ],
      },
    };

    return resourceMap[topic]?.[subtopic] || resourceMap[topic]?.default || [
      { type: 'book', title: 'Relevant Textbook Chapter', source: 'Academic Source', reason: 'Core theory coverage', action: 'Read' },
      { type: 'pdf', title: 'Lecture Notes', source: 'University Course', reason: 'Structured explanation', action: 'View PDF' },
      { type: 'doc', title: 'Official Documentation', source: 'Framework Docs', reason: 'Implementation guide', action: 'Open' },
    ];
  };

  // AI Extract and Fact Check Debounce
  useEffect(() => {
    if (!transcript || transcript.length < 20 || status === 'completed') return;
    const timeout = setTimeout(async () => {
      const recentTranscript = transcript.slice(-1000);

      const newCorrections = await factCheckTranscript(recentTranscript);
      if (newCorrections && newCorrections.length > 0) {
        setCorrections(prev => {
          const merged = [...prev];
          newCorrections.forEach(c => {
            if (!merged.find(m => m.wrong_quote === c.wrong_quote)) {
              merged.push(c);
            }
          });
          return merged;
        });
      }

      const subjectKey = await extract3DSubject(recentTranscript);
      if (subjectKey) {
        const MODEL_MAP = {
          'heart': 'https://modelviewer.dev/shared-assets/models/Heart.glb',
          'brain': 'https://modelviewer.dev/shared-assets/models/Brain.glb',
          'earth': 'https://modelviewer.dev/shared-assets/models/Earth.glb',
          'skeleton': 'https://modelviewer.dev/shared-assets/models/skeleton.glb',
          'car': 'https://modelviewer.dev/shared-assets/models/car.glb',
          'astronaut': 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
        };
        const model = MODEL_MAP[subjectKey.toLowerCase()];
        if (model && model !== active3DModel) {
          setActive3DModel(model);
        }
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [transcript, status, active3DModel]);

  // Keep classRef in sync
  useEffect(() => {
    classRef.current = {
      ...classData,
      transcript,
      notes,
      duration,
      status,
      modelUrl: active3DModel
    };
  }, [classData, transcript, notes, duration, status, active3DModel]);

  // Auto-save periodically
  useEffect(() => {
    const interval = setInterval(() => {
      saveClass({
        ...classRef.current,
        transcript,
        notes,
        duration,
        status,
        modelUrl: active3DModel
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [transcript, notes, duration, status, active3DModel]);

  // Timer
  useEffect(() => {
    if (status === 'recording' && isListening) {
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status, isListening]);

  // Scroll to bottom on new content
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, interimText, activeTab]);

  useEffect(() => {
    notesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes, activeTab]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [manualNoteText, setManualNoteText] = useState('');

  // Continuous auto-save to IndexedDB every 5 seconds while recording
  useEffect(() => {
    if (status !== 'recording') return;
    const interval = setInterval(async () => {
      try {
        await saveClass({
          ...classData,
          transcript,
          notes,
          duration: durationRef.current,
          status: 'recording'
        });
      } catch (e) {
        console.error('Auto-save failed:', e);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [status, classData, transcript, notes]);

  // Real Speech and Audio engine setup
  const startListening = useCallback(async () => {
    setErrorMessage(null);

    // Initialize SpeechEngine if needed
    if (!engineRef.current) {
      engineRef.current = new SpeechEngine();
    }

    if (!engineRef.current.isSupported()) {
      setErrorMessage('Live speech transcription is not natively supported in this browser. You can use the "Simulate Lecture Audio Stream" below to test live class AI notes.');
    }

    // Request Microphone & Setup MediaRecorder
    try {
      const isStreamActive = streamRef.current && streamRef.current.getTracks().some(t => t.readyState === 'live');
      if (!isStreamActive) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        let options = undefined;
        if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            options = { mimeType: 'audio/webm;codecs=opus' };
          } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            options = { mimeType: 'audio/webm' };
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            options = { mimeType: 'audio/mp4' };
          } else if (MediaRecorder.isTypeSupported('audio/aac')) {
            options = { mimeType: 'audio/aac' };
          }
        }

        try {
          mediaRecorderRef.current = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);
        } catch {
          // Native fallback if browser rejected options
          mediaRecorderRef.current = new MediaRecorder(stream);
        }

        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        mediaRecorderRef.current.start(1000);
      } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
      } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        mediaRecorderRef.current.start(1000);
      }
    } catch (err) {
      console.warn('Microphone access notice:', err);
      setErrorMessage('Microphone access is paused or blocked. Please enable microphone permissions in your browser or click "Simulate Lecture Audio Stream" to test AI notes.');
    }

    // Start SpeechEngine if supported
    try {
      if (engineRef.current && engineRef.current.isSupported()) {
        engineRef.current.onResult = (finalText) => {
          setTranscript((prev) => (prev ? prev + ' ' + finalText : finalText));
          setInterimText('');

          const notePoint = createNotePoint(finalText, durationRef.current, generateId());
          if (notePoint.text.length > 5) {
            setNotes((prev) => [...prev, notePoint]);
          }
          detectTopics(finalText);
        };

        engineRef.current.onInterim = (text) => {
          setInterimText(text);
        };

        engineRef.current.onError = (error) => {
          console.warn('Speech engine notice:', error);
          if (error === 'not-allowed') {
            setErrorMessage('Microphone permission was denied. Please allow microphone access or click "Simulate Lecture Audio Stream".');
          }
        };

        engineRef.current.start();
      }
      setIsListening(true);
      setStatus('recording');
    } catch (err) {
      console.error('Failed to start speech engine:', err);
    }
  }, [detectTopics]);

  const pauseListening = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.pause();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    setIsListening(false);
    setStatus('paused');
    setInterimText('');
  }, []);

  const resumeListening = useCallback(async () => {
    const isStreamActive = streamRef.current && streamRef.current.getTracks().some(t => t.readyState === 'live');
    if (!engineRef.current || !isStreamActive) {
      await startListening();
      return;
    }
    if (engineRef.current && engineRef.current.isSupported()) {
      engineRef.current.start();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
    setIsListening(true);
    setStatus('recording');
  }, [startListening]);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      pauseListening();
    } else {
      await resumeListening();
    }
  }, [isListening, pauseListening, resumeListening]);

  const stopSession = useCallback(async () => {
    if (engineRef.current) {
      try {
        engineRef.current.stop();
        engineRef.current.destroy();
      } catch (e) {
        console.warn('Engine stop warning:', e);
      }
      engineRef.current = null;
    }

    const audioBlob = await Promise.race([
      new Promise((resolve) => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
          resolve(null);
          return;
        }
        mediaRecorderRef.current.onstop = () => {
          try {
            const mimeType = mediaRecorderRef.current?.mimeType || (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4');
            const blob = new Blob(audioChunksRef.current, { type: mimeType });
            resolve(blob);
          } catch {
            resolve(null);
          }
        };
        try {
          if (mediaRecorderRef.current.state !== 'inactive') {
            try { mediaRecorderRef.current.requestData(); } catch {}
            mediaRecorderRef.current.stop();
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      }),
      new Promise((r) => setTimeout(() => r(null), 800))
    ]);

    mediaRecorderRef.current = null;
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(t => t.stop());
      } catch {}
      streamRef.current = null;
    }

    clearInterval(timerRef.current);
    setIsListening(false);
    setInterimText('');
    setIsFinishing(true);

    const autoSummary = await summarizeNotes(notes, transcript);

    const finalNotes = autoSummary?.cleanNotes?.length > 0
      ? autoSummary.cleanNotes.map(n => ({
          id: generateId(),
          text: n.text,
          timestamp: n.timestamp,
          highlights: []
        }))
      : notes;

    const finalData = {
      ...classRef.current,
      id: classData?.id || generateId(),
      subjectId: subject?.id || classRef.current?.subjectId,
      transcript: transcript || '',
      notes: finalNotes || [],
      duration: durationRef.current || 0,
      status: 'completed',
      summary: autoSummary,
      audioBlob: (audioBlob instanceof Blob) ? audioBlob : null,
      modelUrl: active3DModel || null,
      topics: topicHistory || [],
      currentTopic: currentTopic || 'General',
      smartResources: smartResources || [],
      joinCode: joinCode,
      attendees: attendees || [],
    };
    await saveClass(finalData);
    setStatus('completed');
    setIsFinishing(false);
    if (onRefreshClass && finalData.id) {
      try {
        await onRefreshClass(finalData.id);
      } catch (e) {
        console.warn('Refresh class notice:', e);
      }
    }
    return finalData;
  }, [classData?.id, subject?.id, transcript, notes, onRefreshClass, topicHistory, currentTopic, smartResources, active3DModel]);

  // Start listening on mount if recording session
  useEffect(() => {
    let t;
    if (classData?.status === 'recording') {
      t = setTimeout(() => startListening(), 300);
    }
    return () => {
      if (t) clearTimeout(t);
      if (engineRef.current) {
        try {
          engineRef.current.stop();
          engineRef.current.destroy();
        } catch {}
        engineRef.current = null;
      }
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach(t => t.stop());
        } catch {}
        streamRef.current = null;
      }
    };
  }, [classData?.status, startListening]);

  const handleFinishAndView = async () => {
    setIsFinishing(true);
    try {
      const savedClass = await stopSession();
      const targetId = savedClass?.id || classData?.id;
      if (targetId) {
        onNavigate(`notes:${targetId}`);
      } else {
        onNavigate('dashboard');
      }
    } catch (err) {
      console.error('Error finishing session:', err);
      onNavigate(classData?.id ? `notes:${classData.id}` : 'dashboard');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to discard this recording? This cannot be undone.")) {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current.destroy();
        engineRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
      clearInterval(timerRef.current);
      if (classData?.id) await deleteClass(classData.id);
      onNavigate(subject?.id ? `subject:${subject.id}` : 'dashboard');
    }
  };

  const acceptCorrection = (wrong, correct) => {
    setTranscript(prev => prev.replace(wrong, correct));
    setCorrections(prev => prev.filter(c => c.wrong_quote !== wrong));
  };

  const renderTranscriptText = () => {
    if (!corrections || corrections.length === 0) return <span>{transcript}</span>;

    let parsedElements = [];
    let remainingText = transcript;

    corrections.forEach((correction, idx) => {
      const { wrong_quote, correct_fact } = correction;
      const index = remainingText.indexOf(wrong_quote);
      if (index !== -1) {
        if (index > 0) {
          parsedElements.push(<span key={`text-${idx}`}>{remainingText.substring(0, index)}</span>);
        }
        parsedElements.push(
          <span key={`corr-${idx}`} className="correction-container" onClick={() => acceptCorrection(wrong_quote, correct_fact)}>
            <del className="correction-del">{wrong_quote}</del>
            <ins className="correction-ins">{correct_fact}</ins>
          </span>
        );
        remainingText = remainingText.substring(index + wrong_quote.length);
      }
    });

    if (remainingText.length > 0) {
      parsedElements.push(<span key="end">{remainingText}</span>);
    }

    return parsedElements;
  };

  const ResourceIcon = ({ type }) => {
    switch (type) {
      case 'book': return <BookOpen size={18} />;
      case 'pdf': return <File size={18} />;
      case 'doc': return <Link2 size={18} />;
      default: return <FileText size={18} />;
    }
  };

  return (
    <div className="live-session-new">
      {/* Topic Change Toast */}
      {showTopicChange && lastTopicChange && (
        <div className="topic-change-toast">
          <Zap size={16} className="toast-icon" />
          <span>Topic updated</span>
          <span className="toast-arrow">→</span>
          <span className="toast-topic">{lastTopicChange.to}</span>
        </div>
      )}

      {/* Header */}
      <header className="session-header">
        <div className="session-header-left">
          <Button variant="ghost" size="sm" onClick={() => {
            saveClass({
              ...classRef.current,
              transcript, notes, duration, status,
              joinCode, attendees,
            });
            if (engineRef.current) {
              engineRef.current.stop();
              engineRef.current.destroy();
              engineRef.current = null;
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
              mediaRecorderRef.current.stop();
              mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
            }
            onNavigate(subject?.id ? `subject:${subject.id}` : 'dashboard');
          }} leftIcon={<ArrowLeft size={18} />}>
            Back
          </Button>
          <div className="session-subject-badge">
            <Avatar name={subject?.name || 'Lecture'} src={undefined} size="sm" style={{ background: (subject?.color || '#7C3AED') + '20', color: subject?.color || '#7C3AED' }} />
            <span>{subject?.name || 'Class Lecture'}</span>
          </div>
          <span className="session-title">{classData.title}</span>
        </div>

        <div className="session-header-center">
          <button
            type="button"
            className="session-code-pill"
            onClick={copyJoinCode}
            title="Click to copy student invite code"
          >
            <span className="code-pill-label">🔑 Class Code:</span>
            <span className="code-pill-val">{joinCode}</span>
            <span className="code-pill-copy">{codeCopied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}</span>
          </button>

          <button
            type="button"
            className={`session-attendees-pill ${showAttendees ? 'active' : ''}`}
            onClick={() => setShowAttendees(prev => !prev)}
            title="View students joined in this lecture"
          >
            <Users size={14} />
            <span>{attendees.length} Joined</span>
          </button>
        </div>

        <div className="session-timer">
          <div className={`recording-dot ${status === 'paused' ? 'paused' : ''} ${status === 'completed' ? 'completed' : ''}`} />
          <span>{formatDuration(duration)}</span>
        </div>
      </header>

      {/* Attendees Modal / Drawer */}
      {showAttendees && (
        <div className="attendees-modal-overlay" onClick={() => setShowAttendees(false)}>
          <div className="attendees-modal-card" onClick={e => e.stopPropagation()}>
            <div className="attendees-modal-header">
              <div className="attendees-header-info">
                <Users size={20} className="attendees-header-icon" />
                <div>
                  <h3>Joined Students ({attendees.length})</h3>
                  <p>Students connected via code: <strong style={{ color: '#A855F7' }}>{joinCode}</strong></p>
                </div>
              </div>
              <button className="attendees-close-btn" onClick={() => setShowAttendees(false)}>✕</button>
            </div>

            <div className="attendees-modal-body">
              {attendees.length === 0 ? (
                <div className="attendees-empty-state">
                  <div className="attendees-empty-icon">👥</div>
                  <h4>No students joined yet</h4>
                  <p>Share code <strong style={{ color: '#A855F7', letterSpacing: '1px' }}>{joinCode}</strong> with your class. When students enter this code in their <em>"My Lectures"</em> section, they will connect in real time and automatically receive this lecture's recording and notes.</p>
                  <button className="copy-code-btn" onClick={copyJoinCode}>
                    {codeCopied ? 'Code Copied! ✓' : 'Copy Class Code'}
                  </button>
                </div>
              ) : (
                <div className="attendees-list">
                  {attendees.map((student, idx) => (
                    <div key={student.id || idx} className="attendee-row">
                      <div className="attendee-avatar">
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.name} />
                        ) : (
                          <span>{(student.name || 'S').charAt(0).toUpperCase()}</span>
                        )}
                        <span className="live-status-dot"></span>
                      </div>
                      <div className="attendee-info">
                        <span className="attendee-name">{student.name}</span>
                        <span className="attendee-meta">{student.department || student.email || 'Enrolled Student'}</span>
                      </div>
                      <span className="attendee-badge">Connected</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="error-banner-live" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '10px 16px', borderRadius: 'var(--radius-md)', margin: '12px 24px', fontSize: 'var(--text-xs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Waveform */}
      {status !== 'completed' && (
        <div className="waveform-wrapper">
          <Waveform isActive={isListening && status === 'recording'} />
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="session-main">
        {/* LEFT PANEL - Live Lecture */}
        <div className="left-panel">
          {/* Mobile Tabs */}
          <div className="mobile-tabs">
            <Button
              variant={activeTab === 'transcript' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('transcript')}
              leftIcon={<Radio size={16} />}
            >
              Transcript
            </Button>
            <Button
              variant={activeTab === 'notes' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('notes')}
              leftIcon={<FileText size={16} />}
            >
              Notes
            </Button>
            <Button
              variant={activeTab === 'studio' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('studio')}
              leftIcon={<Cuboid size={16} />}
            >
              3D View
            </Button>
          </div>

          {/* Transcript Panel */}
          <div className={`content-panel ${activeTab === 'transcript' ? 'active' : ''}`}>
            <div className="panel-header">
              <Radio size={18} color="var(--primary-600)" />
              <span>Live Transcript</span>
              <Badge variant="live" size="sm">LIVE</Badge>
            </div>
            <div className="transcript-content">
              {!transcript && !interimText ? (
                <div className="transcript-empty">
                  <Mic size={40} color="var(--text-tertiary)" />
                  <p>{status === 'completed' ? 'No transcript recorded' : 'Speak into your microphone...'}</p>
                  <p className="empty-subtext">
                    {status !== 'completed' && 'Your words will appear here in real-time as you teach'}
                  </p>
                  {status !== 'completed' && (
                    <button
                      type="button"
                      style={{
                        marginTop: '16px',
                        background: 'rgba(124, 58, 237, 0.2)',
                        border: '1px solid rgba(124, 58, 237, 0.4)',
                        color: '#C084FC',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onClick={() => {
                        const sample = "Today we are analyzing Convolutional Neural Networks and Balanced Search Trees. In an AVL tree, the balance factor is maintained strictly between negative one and positive one. For CNNs, convolution operations apply filter kernels to produce feature maps, followed by pooling layers to downsample spatial dimensions. Next, backpropagation computes the gradient of the loss function using the chain rule.";
                        setTranscript(prev => (prev ? prev + ' ' + sample : sample));
                        const notePoint = createNotePoint(sample, durationRef.current || 12, generateId());
                        setNotes(prev => [...prev, notePoint]);
                        detectTopics(sample);
                      }}
                    >
                      <Sparkles size={14} />
                      <span>Simulate Lecture Audio Stream</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {renderTranscriptText()}
                  {interimText && (
                    <span className="interim"> {interimText}</span>
                  )}
                  <div ref={transcriptEndRef} />
                </>
              )}
            </div>
          </div>

          {/* Notes Panel */}
          <div className={`content-panel ${activeTab === 'notes' ? 'active' : ''}`}>
            <div className="panel-header">
              <FileText size={18} color="var(--success-500)" />
              <span>Auto-Generated Notes</span>
              <Badge variant="neutral" size="sm">{notes.length} points</Badge>
            </div>
            <div className="notes-content">
              {notes.length === 0 ? (
                <div className="transcript-empty">
                  <FileText size={40} color="var(--text-tertiary)" />
                  <p>Notes will appear here automatically</p>
                  <p className="empty-subtext">
                    As you speak, key points are extracted
                  </p>
                </div>
              ) : (
                <>
                  {notes.map((note) => (
                    <div key={note.id} className="note-item">
                      <div className="note-bullet" />
                      <div className="note-body">
                        <div className="note-text">{note.text}</div>
                        <div className="note-timestamp">{formatDuration(note.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={notesEndRef} />
                </>
              )}
            </div>
            <form 
              className="manual-note-form" 
              onSubmit={(e) => {
                e.preventDefault();
                if (!manualNoteText.trim()) return;
                const newNote = {
                  id: generateId(),
                  text: manualNoteText.trim(),
                  timestamp: durationRef.current,
                  highlights: []
                };
                setNotes(prev => [...prev, newNote]);
                setManualNoteText('');
              }}
              style={{ display: 'flex', gap: '8px', padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}
            >
              <input 
                type="text" 
                placeholder="Add a manual note..." 
                value={manualNoteText} 
                onChange={(e) => setManualNoteText(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)', outline: 'none' }}
              />
              <Button type="submit" variant="primary" size="sm">Add Note</Button>
            </form>
          </div>

          {/* 3D Studio Panel */}
          <div className={`content-panel ${activeTab === 'studio' ? 'active' : ''}`}>
            <div className="panel-header">
              <Cuboid size={18} color="var(--ai-600)" />
              <span>3D Visualization</span>
              {active3DModel && <Badge variant="ai" size="sm">Model Loaded</Badge>}
            </div>
            <div className="studio-content">
              <SubjectStudio modelUrl={active3DModel} />
            </div>
          </div>

          {/* Controls */}
          <div className="session-controls">
            {status === 'completed' ? (
              <div className="controls-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => onNavigate(`notes:${classData.id}`)}
                  leftIcon={<FileText size={20} />}
                >
                  View Notes
                </Button>
              </div>
            ) : (
              <div className="controls-dock">
                <Button
                  variant="danger"
                  size="icon"
                  onClick={handleDelete}
                  aria-label="Discard Recording"
                  leftIcon={<Trash2 size={20} />}
                />
                <Button
                  variant={isListening ? 'secondary' : 'primary'}
                  size="icon-lg"
                  onClick={toggleListening}
                  leftIcon={isListening ? <Pause size={24} /> : <Play size={24} />}
                  aria-label={isListening ? 'Pause' : 'Resume'}
                />
                <Button
                  variant={isListening ? 'primary' : 'ghost'}
                  size="icon-lg"
                  onClick={toggleListening}
                  leftIcon={isListening ? <Mic size={24} /> : <MicOff size={24} />}
                  aria-label={isListening ? 'Stop Listening' : 'Start Listening'}
                />
                <Button
                  variant="success"
                  size="icon-lg"
                  onClick={handleFinishAndView}
                  disabled={isFinishing}
                  leftIcon={isFinishing ? <Loader2 size={24} className="spin" /> : <CheckCircle size={24} />}
                  aria-label={isFinishing ? 'Saving...' : 'Finish & View Notes'}
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - AI Understanding */}
        <aside className="right-panel">
          {/* Current Topic Card */}
          <Card className="ai-topic-card">
            <div className="ai-card-header">
              <div className="ai-card-icon">
                <BrainCircuit size={20} />
              </div>
              <div>
                <h3>AI Understanding</h3>
                <p className="ai-card-subtitle">Real-time topic detection</p>
              </div>
              <Badge variant="ai" size="sm">ACTIVE</Badge>
            </div>

            <div className="topic-main">
              <div className="topic-label">Current Topic</div>
              <h2 className="topic-title">{currentTopic}</h2>
            </div>

            <div className="subtopic-main">
              <div className="topic-label">Currently Discussing</div>
              <h3 className="subtopic-title">{currentSubtopic}</h3>
            </div>

            {/* Progress indicator */}
            <div className="topic-progress">
              <div className="progress-label">
                <span>Lecture Progress</span>
                <span>{Math.round((duration / 3600) * 100)}%</span>
              </div>
              <Progress value={(duration / 3600) * 100} max={100} size="sm" />
            </div>
          </Card>

          {/* Related Concepts */}
          <Card className="ai-concepts-card">
            <div className="ai-card-header">
              <div className="ai-card-icon">
                <Sparkles size={20} />
              </div>
              <div>
                <h3>Related Concepts</h3>
                <p className="ai-card-subtitle">Key terms for this topic</p>
              </div>
            </div>
            <div className="concepts-grid">
              {relatedConcepts.map((concept, i) => (
                <button key={i} className="concept-chip" onClick={() => alert(`Search: ${concept}`)}>
                  {concept}
                </button>
              ))}
            </div>
          </Card>

          {/* Smart Resources */}
          <Card className="ai-resources-card">
            <div className="ai-card-header">
              <div className="ai-card-icon">
                <BookOpen size={20} />
              </div>
              <div>
                <h3>Smart Resources</h3>
                <p className="ai-card-subtitle">AI-curated for current topic</p>
              </div>
            </div>
            <div className="resources-list">
              {smartResources.slice(0, 3).map((resource, i) => (
                <div key={i} className="resource-item">
                  <div className="resource-icon" style={{ background: getResourceColor(resource.type) }}>
                    <ResourceIcon type={resource.type} />
                  </div>
                  <div className="resource-info">
                    <h4 className="resource-title">{resource.title}</h4>
                    <p className="resource-source">{resource.source}</p>
                    <p className="resource-reason">{resource.reason}</p>
                  </div>
                  <Button variant="ghost" size="xs" onClick={() => alert(`${resource.action}: ${resource.title}`)}>
                    {resource.action}
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" fullWidth leftIcon={<Link2 size={14} />}>
              View All Resources
            </Button>
          </Card>

          {/* Topic History */}
          {topicHistory.length > 0 && (
            <Card className="ai-history-card">
              <div className="ai-card-header">
                <div className="ai-card-icon">
                  <Bell size={20} />
                </div>
                <div>
                  <h3>Topic Timeline</h3>
                  <p className="ai-card-subtitle">Detected topic changes</p>
                </div>
              </div>
              <div className="timeline-list">
                {topicHistory.slice(-5).reverse().map((entry, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-time">{formatDuration(entry.time)}</div>
                    <div className="timeline-content">
                      <span className="timeline-topic">{entry.topic}</span>
                      <span className="timeline-subtopic">{entry.subtopic}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

function getResourceColor(type) {
  switch (type) {
    case 'book': return 'var(--primary-100)';
    case 'pdf': return 'var(--success-100)';
    case 'doc': return 'var(--ai-100)';
    default: return 'var(--bg-tertiary)';
  }
}

export default LiveSession;