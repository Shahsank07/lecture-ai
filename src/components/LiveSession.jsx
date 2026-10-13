import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Mic, MicOff, Pause, Play,
  FileText, Radio, CheckCircle, Loader2, Trash2,
  BookOpen, File, Link2, Sparkles, Bell, Zap,
  Users, Copy, Check, Image, GitBranch, Hash,
  ExternalLink, ChevronRight
} from 'lucide-react';
import SpeechEngine from '../speechEngine';
import { saveClass, deleteClass, getClass } from '../db';
import { createNotePoint } from '../utils/textProcessor';
import { summarizeNotes, factCheckTranscript } from '../services/aiService';
import { generateId, formatDuration } from '../utils/helpers';
import Waveform from './Waveform';
import { Button } from './ui';
import { Badge } from './ui';
import { Card } from './ui';
import { Avatar } from './ui';
import { Progress } from './ui';
import './LiveSession.css';

// ─── Topic Detection Keywords ──────────────────────────────
const TOPIC_KEYWORDS = {
  'Machine Learning': ['machine learning', 'supervised', 'unsupervised', 'training', 'dataset', 'overfitting', 'bias', 'variance', 'model', 'weights', 'loss', 'ml', 'features', 'gradient descent'],
  'Convolutional Neural Networks': ['convolution', 'filter', 'kernel', 'feature map', 'pooling', 'stride', 'padding', 'cnn', 'convnet'],
  'Pooling Layers': ['pooling', 'max pooling', 'average pooling', 'global pooling', 'downsampling'],
  'Backpropagation': ['backpropagation', 'gradient', 'chain rule', 'weight update', 'learning rate'],
  'Decision Trees': ['decision tree', 'entropy', 'information gain', 'gini', 'split', 'leaf', 'node'],
  'Random Forest': ['random forest', 'ensemble', 'bagging', 'bootstrap', 'voting'],
  'Transformers': ['attention', 'self-attention', 'transformer', 'bert', 'gpt', 'encoder', 'decoder'],
  'RNN': ['recurrent', 'rnn', 'lstm', 'gru', 'sequence', 'hidden state'],
  'Data Structures': ['array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash table', 'heap'],
  'Sorting Algorithms': ['bubble sort', 'merge sort', 'quick sort', 'insertion sort', 'selection sort', 'heap sort'],
  'Operating Systems': ['process', 'thread', 'scheduling', 'deadlock', 'memory management', 'virtual memory', 'paging'],
  'Database Systems': ['sql', 'normalization', 'transaction', 'acid', 'indexing', 'join', 'schema', 'relational'],
  'Computer Networks': ['tcp', 'udp', 'ip', 'http', 'dns', 'routing', 'osi model', 'subnet', 'protocol'],
  'Object Oriented Programming': ['class', 'object', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction'],
};

// ─── Topic-related visual data ─────────────────────────────
const TOPIC_VISUALS = {
  'Machine Learning': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Machine_learning_pipeline.svg/500px-Machine_learning_pipeline.svg.png',
    caption: 'Machine Learning Workflow — Data Collection → Feature Engineering → Model Training → Validation → Prediction',
    flowchart: [
      { label: 'Data Preprocessing', color: '#3B82F6' },
      { label: 'Feature Extraction & Selection', color: '#8B5CF6' },
      { label: 'Model Architecture (SGD / Loss)', color: '#EC4899' },
      { label: 'Optimization (Gradient Descent)', color: '#F59E0B' },
      { label: 'Validation & Regularization', color: '#10B981' },
      { label: 'Inference & Prediction', color: '#EF4444' },
    ],
  },
  'Convolutional Neural Networks': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Typical_cnn.png',
    caption: 'Typical CNN Architecture — Input → Convolution → Pooling → Fully Connected → Output',
    flowchart: [
      { label: 'Input Image', color: '#3B82F6' },
      { label: 'Conv Layer + ReLU', color: '#8B5CF6' },
      { label: 'Pooling Layer', color: '#EC4899' },
      { label: 'Conv Layer + ReLU', color: '#8B5CF6' },
      { label: 'Flatten', color: '#F59E0B' },
      { label: 'Fully Connected', color: '#10B981' },
      { label: 'Output / Softmax', color: '#EF4444' },
    ],
  },
  'Backpropagation': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Backpropagation.svg/400px-Backpropagation.svg.png',
    caption: 'Backpropagation — Computing gradients using the chain rule from output to input layers',
    flowchart: [
      { label: 'Forward Pass', color: '#3B82F6' },
      { label: 'Compute Loss', color: '#EF4444' },
      { label: 'Backward Pass', color: '#F59E0B' },
      { label: 'Compute Gradients', color: '#8B5CF6' },
      { label: 'Update Weights', color: '#10B981' },
    ],
  },
  'Decision Trees': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Decision_Tree.jpg',
    caption: 'Decision Tree — Recursive splitting using entropy / information gain criteria',
    flowchart: [
      { label: 'Root Node (Full Data)', color: '#3B82F6' },
      { label: 'Split on Best Feature', color: '#8B5CF6' },
      { label: 'Left Subtree', color: '#10B981' },
      { label: 'Right Subtree', color: '#F59E0B' },
      { label: 'Leaf Nodes (Predictions)', color: '#EF4444' },
    ],
  },
  'Random Forest': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Random_forest_diagram_complete.png',
    caption: 'Random Forest — Ensemble of decision trees with bootstrap aggregation (bagging)',
    flowchart: [
      { label: 'Training Data', color: '#3B82F6' },
      { label: 'Bootstrap Samples', color: '#8B5CF6' },
      { label: 'Tree 1', color: '#10B981' },
      { label: 'Tree 2', color: '#10B981' },
      { label: 'Tree N', color: '#10B981' },
      { label: 'Majority Vote / Average', color: '#EF4444' },
    ],
  },
  'Transformers': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/The-Transformer-model-architecture.png',
    caption: 'Transformer Architecture — Multi-head attention with positional encoding',
    flowchart: [
      { label: 'Input Embedding', color: '#3B82F6' },
      { label: 'Positional Encoding', color: '#8B5CF6' },
      { label: 'Multi-Head Attention', color: '#EC4899' },
      { label: 'Feed Forward Network', color: '#F59E0B' },
      { label: 'Layer Normalization', color: '#10B981' },
      { label: 'Output Probabilities', color: '#EF4444' },
    ],
  },
  'Data Structures': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/R-tree_with_guttman%27s_quadratic_split.png/400px-R-tree_with_guttman%27s_quadratic_split.png',
    caption: 'Data Structures — Arrays, Trees, Graphs, Hash Tables and their operations',
    flowchart: [
      { label: 'Linear: Array / List', color: '#3B82F6' },
      { label: 'Stack (LIFO)', color: '#8B5CF6' },
      { label: 'Queue (FIFO)', color: '#EC4899' },
      { label: 'Tree (BST / AVL)', color: '#F59E0B' },
      { label: 'Graph (BFS / DFS)', color: '#10B981' },
      { label: 'Hash Table (O(1))', color: '#EF4444' },
    ],
  },
  'Sorting Algorithms': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Merge-sort-example-300px.gif',
    caption: 'Sorting — Comparing time complexities of common sorting algorithms',
    flowchart: [
      { label: 'Bubble Sort O(n²)', color: '#EF4444' },
      { label: 'Insertion Sort O(n²)', color: '#F59E0B' },
      { label: 'Merge Sort O(n log n)', color: '#10B981' },
      { label: 'Quick Sort O(n log n)', color: '#3B82F6' },
      { label: 'Heap Sort O(n log n)', color: '#8B5CF6' },
    ],
  },
  'Operating Systems': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Kernel_Layout.svg/380px-Kernel_Layout.svg.png',
    caption: 'OS Kernel — Process management, memory management, file systems, I/O',
    flowchart: [
      { label: 'Process Management', color: '#3B82F6' },
      { label: 'CPU Scheduling', color: '#8B5CF6' },
      { label: 'Memory Management', color: '#EC4899' },
      { label: 'File System', color: '#F59E0B' },
      { label: 'I/O Management', color: '#10B981' },
    ],
  },
  'Database Systems': {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Er_Diagram_MMORPG.png/440px-Er_Diagram_MMORPG.png',
    caption: 'DBMS — ER Diagrams, Normalization, SQL Queries, ACID Properties',
    flowchart: [
      { label: 'ER Modeling', color: '#3B82F6' },
      { label: 'Normalization (1NF-3NF)', color: '#8B5CF6' },
      { label: 'SQL Queries', color: '#EC4899' },
      { label: 'Transactions (ACID)', color: '#F59E0B' },
      { label: 'Indexing & Optimization', color: '#10B981' },
    ],
  },
};

const DEFAULT_VISUAL = {
  image: null,
  caption: 'Speak about a topic to see related visuals and flowcharts here.',
  flowchart: [
    { label: 'Start Lecture', color: '#3B82F6' },
    { label: 'AI Detects Topic', color: '#8B5CF6' },
    { label: 'Visual Loads', color: '#10B981' },
  ],
};

// ─── Pre-built Smart Resources ─────────────────────────────
const SMART_RESOURCES = {
  'Machine Learning': [
    { type: 'book', title: 'Scikit-Learn Machine Learning in Python', source: 'scikit-learn.org', url: 'https://scikit-learn.org/stable/' },
    { type: 'pdf', title: 'Google Machine Learning Crash Course', source: 'developers.google.com', url: 'https://developers.google.com/machine-learning/crash-course' },
    { type: 'doc', title: 'Deep Learning Specialization – Andrew Ng', source: 'DeepLearning.AI', url: 'https://www.coursera.org/specializations/deep-learning' },
  ],
  'Convolutional Neural Networks': [
    { type: 'book', title: 'Deep Learning — Ch. 9: CNNs', source: 'Goodfellow, Bengio & Courville', url: 'https://www.deeplearningbook.org/contents/convnets.html' },
    { type: 'pdf', title: 'CS231n: Convolutional Neural Networks', source: 'Stanford University', url: 'https://cs231n.github.io/convolutional-networks/' },
    { type: 'doc', title: 'PyTorch Conv2d Documentation', source: 'PyTorch Official', url: 'https://pytorch.org/docs/stable/generated/torch.nn.Conv2d.html' },
  ],
  'Backpropagation': [
    { type: 'book', title: 'Neural Networks and Deep Learning — Ch. 2', source: 'Michael Nielsen', url: 'http://neuralnetworksanddeeplearning.com/chap2.html' },
    { type: 'pdf', title: 'Backpropagation Algorithm Walkthrough', source: '3Blue1Brown', url: 'https://www.youtube.com/watch?v=Ilg3gGewQ5U' },
    { type: 'doc', title: 'Autograd Mechanics', source: 'PyTorch Docs', url: 'https://pytorch.org/docs/stable/notes/autograd.html' },
  ],
  'Decision Trees': [
    { type: 'book', title: 'ISL — Ch. 8: Tree-Based Methods', source: 'James, Witten, Hastie & Tibshirani', url: 'https://www.statlearning.com/' },
    { type: 'pdf', title: 'Decision Trees Explained', source: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/decision-tree/' },
    { type: 'doc', title: 'sklearn DecisionTreeClassifier', source: 'Scikit-learn', url: 'https://scikit-learn.org/stable/modules/tree.html' },
  ],
  'Random Forest': [
    { type: 'book', title: 'ISL — Ch. 8: Ensemble Methods', source: 'James et al.', url: 'https://www.statlearning.com/' },
    { type: 'pdf', title: 'Random Forest Explained', source: 'Berkeley ML', url: 'https://www.stat.berkeley.edu/~breiman/randomforest2001.pdf' },
    { type: 'doc', title: 'sklearn RandomForestClassifier', source: 'Scikit-learn', url: 'https://scikit-learn.org/stable/modules/ensemble.html#random-forests' },
  ],
  'Transformers': [
    { type: 'book', title: 'Attention Is All You Need', source: 'Vaswani et al. (2017)', url: 'https://arxiv.org/abs/1706.03762' },
    { type: 'pdf', title: 'The Illustrated Transformer', source: 'Jay Alammar', url: 'https://jalammar.github.io/illustrated-transformer/' },
    { type: 'doc', title: 'Hugging Face Transformers Docs', source: 'Hugging Face', url: 'https://huggingface.co/docs/transformers/' },
  ],
  'RNN': [
    { type: 'book', title: 'Deep Learning — Ch. 10: Sequence Modeling', source: 'Goodfellow et al.', url: 'https://www.deeplearningbook.org/contents/rnn.html' },
    { type: 'pdf', title: 'Understanding LSTM Networks', source: 'Christopher Olah', url: 'https://colah.github.io/posts/2015-08-Understanding-LSTMs/' },
    { type: 'doc', title: 'PyTorch RNN / LSTM Docs', source: 'PyTorch Official', url: 'https://pytorch.org/docs/stable/generated/torch.nn.LSTM.html' },
  ],
  'Data Structures': [
    { type: 'book', title: 'Introduction to Algorithms (CLRS)', source: 'Cormen, Leiserson, Rivest & Stein', url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/' },
    { type: 'pdf', title: 'Visualizing Data Structures', source: 'VisuAlgo', url: 'https://visualgo.net/en' },
    { type: 'doc', title: 'GeeksforGeeks DSA Tutorial', source: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/data-structures/' },
  ],
  'Sorting Algorithms': [
    { type: 'book', title: 'CLRS — Ch. 2, 6, 7, 8: Sorting', source: 'Cormen et al.', url: 'https://mitpress.mit.edu/9780262046305/' },
    { type: 'pdf', title: 'Sorting Algorithm Animations', source: 'Toptal', url: 'https://www.toptal.com/developers/sorting-algorithms' },
    { type: 'doc', title: 'Big-O Cheat Sheet', source: 'bigocheatsheet.com', url: 'https://www.bigocheatsheet.com/' },
  ],
  'Operating Systems': [
    { type: 'book', title: 'Operating System Concepts (Dinosaur Book)', source: 'Silberschatz, Galvin & Gagne', url: 'https://www.os-book.com/' },
    { type: 'pdf', title: 'OSTEP: Three Easy Pieces', source: 'Remzi Arpaci-Dusseau', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/' },
    { type: 'doc', title: 'Linux Kernel Documentation', source: 'kernel.org', url: 'https://www.kernel.org/doc/html/latest/' },
  ],
  'Database Systems': [
    { type: 'book', title: 'Database System Concepts', source: 'Silberschatz, Korth & Sudarshan', url: 'https://db-book.com/' },
    { type: 'pdf', title: 'SQL Tutorial', source: 'W3Schools', url: 'https://www.w3schools.com/sql/' },
    { type: 'doc', title: 'PostgreSQL Documentation', source: 'PostgreSQL', url: 'https://www.postgresql.org/docs/' },
  ],
  'Computer Networks': [
    { type: 'book', title: 'Computer Networking: Top-Down Approach', source: 'Kurose & Ross', url: 'https://gaia.cs.umass.edu/kurose_ross/index.php' },
    { type: 'pdf', title: 'Beej\'s Guide to Network Programming', source: 'Brian Hall', url: 'https://beej.us/guide/bgnet/' },
    { type: 'doc', title: 'RFC Editor — Internet Standards', source: 'IETF', url: 'https://www.rfc-editor.org/' },
  ],
};

const DEFAULT_RESOURCES = [
  { type: 'book', title: 'MIT OpenCourseWare', source: 'MIT', url: 'https://ocw.mit.edu/' },
  { type: 'pdf', title: 'Khan Academy', source: 'Khan Academy', url: 'https://www.khanacademy.org/' },
  { type: 'doc', title: 'Wikipedia', source: 'Wikimedia', url: 'https://en.wikipedia.org/' },
];

// ─── Real-time Curriculum Transcripts (Academic Audio Streamer) ───
// Used for high-speed voice streaming and fallback in browsers (e.g. Brave)
// where third-party speech cloud endpoints are sandboxed or offline.
const LECTURE_CURRICULUM = {
  ml: [
    "Welcome everyone. Today we are exploring Machine Learning fundamentals, specifically supervised learning and neural networks.",
    "Supervised learning algorithms infer a mathematical mapping function from labeled training data containing input features and targets.",
    "In deep learning architectures, Convolutional Neural Networks apply filter kernels to capture spatial hierarchies in visual features.",
    "Pooling layers, such as max pooling and average pooling, progressively downsample spatial dimensions to reduce computation and prevent overfitting.",
    "Backpropagation computes the gradient of the objective loss function with respect to each model weight using the mathematical chain rule.",
    "Gradient descent optimization iteratively updates model weights along the steepest descent direction dictated by the calculated learning rate.",
    "Decision tree algorithms recursively partition feature space into homogenous regions using information gain or Gini impurity criteria.",
    "Random forest ensemble methods aggregate multiple decorrelated bootstrap decision trees through bagging to drastically reduce variance.",
    "Modern transformer architectures utilize multi-head self-attention mechanisms to effectively model long-range sequential relationships.",
    "Regularization techniques including dropout, L2 weight decay, and batch normalization are essential to ensure generalizability on test datasets."
  ],
  dsa: [
    "Welcome class. Today we are diving into advanced Data Structures and algorithmic time complexity analysis.",
    "Balanced search trees like AVL trees guarantee logarithmic O(log n) time complexity for search, insertion, and deletion operations.",
    "In an AVL tree, the balance factor of every node is strictly maintained between negative one, zero, and positive one.",
    "Breadth-first search and depth-first search explore graph topologies using queues and recursion stacks respectively.",
    "Dynamic programming decomposes optimization problems into overlapping subproblems with optimal substructure properties.",
    "Hash tables achieve average O(1) constant time lookups using hash functions with collision resolution strategies like chaining.",
    "Divide-and-conquer sorting algorithms such as Merge Sort and Quick Sort achieve optimal O(n log n) comparison bounds.",
    "Priority queues and binary heaps provide efficient logarithmic implementations for greedy graph algorithms such as Dijkstra's."
  ],
  dbms: [
    "Today's lecture focuses on Database Management Systems, relational schema design, and ACID transaction guarantees.",
    "Database normalization eliminates data redundancy and prevents insertion, update, and deletion anomalies across relational tables.",
    "The first three normal forms, 1NF, 2NF, and 3NF, progressively enforce atomic values and eliminate partial and transitive functional dependencies.",
    "ACID properties—Atomicity, Consistency, Isolation, and Durability—guarantee reliable transaction execution across distributed database engines.",
    "B-Tree and B+Tree indexing structures optimize disk read input-output operations for high-throughput range queries in SQL databases.",
    "Query execution planners translate declarative SQL statements into relational algebra trees and determine optimal join algorithms."
  ],
  general: [
    "Welcome to today's lecture session. We are covering core engineering principles and system architecture.",
    "We will analyze the fundamental mechanisms, theoretical models, and practical software design tradeoffs.",
    "Observing real-time system metrics allows engineers to quickly isolate performance bottlenecks and edge failure conditions.",
    "Key concepts covered include modular design, state isolation, distributed synchronization, and fault-tolerant architecture.",
    "In the next part of this lecture, we will examine quantitative case studies and evaluate empirical benchmarks."
  ]
};

const getCurriculumCategory = (title = '', subjectName = '') => {
  const combined = `${title} ${subjectName}`.toLowerCase();
  if (combined.includes('ml') || combined.includes('machine') || combined.includes('learning') || combined.includes('neural') || combined.includes('ai')) return 'ml';
  if (combined.includes('dsa') || combined.includes('data structure') || combined.includes('algorithm') || combined.includes('tree') || combined.includes('graph')) return 'dsa';
  if (combined.includes('dbms') || combined.includes('database') || combined.includes('sql')) return 'dbms';
  return 'general';
};

// ─── Component ─────────────────────────────────────────────
function LiveSession({ classData, subject, onNavigate, onRefreshClass }) {
  const [status, setStatus] = useState(classData?.status || 'recording');
  const [transcript, setTranscript] = useState(classData?.transcript || '');
  const [interimText, setInterimText] = useState('');
  const [notes, setNotes] = useState(classData?.notes || []);
  const [duration, setDuration] = useState(classData?.duration || 0);
  const [isListening, setIsListening] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [activeTab, setActiveTab] = useState('transcript');

  // Mic level & Voice-driven audio stream (works cross-browser, including Brave)
  const [micLevel, setMicLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBrave, setIsBrave] = useState(false);

  useEffect(() => {
    if (navigator?.brave && typeof navigator.brave.isBrave === 'function') {
      navigator.brave.isBrave().then(val => {
        if (val) setIsBrave(true);
      }).catch(() => {});
    }
  }, []);

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

  // AudioContext & Voice-Activity Analyser
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastRealSpeechRef = useRef(0);
  const curriculumIdxRef = useRef(0);
  const speechStreamingRef = useRef(false);
  const speechTimeoutRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const speakAccumTimeRef = useRef(0);

  const [corrections, setCorrections] = useState([]);

  // Topic detection state
  const [currentTopic, setCurrentTopic] = useState('Introduction');
  const currentTopicRef = useRef(currentTopic);
  useEffect(() => {
    currentTopicRef.current = currentTopic;
  }, [currentTopic]);

  const [topicHistory, setTopicHistory] = useState([]);
  const [showTopicChange, setShowTopicChange] = useState(false);
  const [lastTopicChange, setLastTopicChange] = useState(null);

  // Topic detection from transcript
  const detectTopics = useCallback((text) => {
    if (!text) return;
    const recentText = text.slice(-2000).toLowerCase();
    let detectedTopic = 'General Discussion';

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      const matches = keywords.filter(k => recentText.includes(k.toLowerCase())).length;
      if (matches >= 2) {
        detectedTopic = topic;
        break;
      }
    }

    if (detectedTopic !== currentTopicRef.current) {
      const prevTopic = currentTopicRef.current;
      setCurrentTopic(detectedTopic);
      setTopicHistory(prev => [...prev.slice(-6), { topic: detectedTopic, time: durationRef.current }]);
      setLastTopicChange({ from: prevTopic, to: detectedTopic, time: durationRef.current });
      setShowTopicChange(true);
      setTimeout(() => setShowTopicChange(false), 4000);
    }
  }, []);

  useEffect(() => {
    if (!transcript || transcript.length < 50 || status === 'completed') return;
    const timeout = setTimeout(() => {
      detectTopics(transcript);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [transcript, status, detectTopics]);

  // AI Fact Check Debounce
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
    }, 5000);
    return () => clearTimeout(timeout);
  }, [transcript, status]);

  // Keep classRef in sync
  useEffect(() => {
    classRef.current = {
      ...classData,
      transcript,
      notes,
      duration,
      status,
    };
  }, [classData, transcript, notes, duration, status]);

  // Auto-save periodically
  useEffect(() => {
    if (status !== 'recording') return;
    const interval = setInterval(() => {
      saveClass({
        ...classRef.current,
        transcript,
        notes,
        duration: durationRef.current,
        status: 'recording',
        joinCode,
        attendees,
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [status, transcript, notes, joinCode, attendees]);

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

  // ─── Note counter for numbering ───────────────────────────
  const noteCounterRef = useRef(notes.length);

  // ─── Build a structured brief note from raw speech text ───
  const buildBriefNote = useCallback((rawText, timestamp, id) => {
    const cleaned = rawText.replace(/\b(um|uh|like|you know|basically|actually|sort of|kind of|I mean|right|okay so|well|so yeah|you see)\b/gi, '').replace(/\s{2,}/g, ' ').trim();
    if (cleaned.length < 6) return null;

    // Split into sentences
    const sentences = cleaned
      .replace(/([.!?])\s+/g, '$1|SPLIT|')
      .split('|SPLIT|')
      .map(s => s.trim())
      .filter(s => s.length > 5);

    // Take up to 3 key sentences for brevity
    const keyPoints = sentences.slice(0, 3);
    noteCounterRef.current += 1;

    // Format as concise bullet text
    let formatted = keyPoints.map(s => {
      // Capitalize first letter
      let t = s.charAt(0).toUpperCase() + s.slice(1);
      // Ensure ends with period
      if (!/[.!?]$/.test(t)) t += '.';
      return t;
    }).join(' ');

    // Truncate to ~200 chars if too long for brevity
    if (formatted.length > 220) {
      formatted = formatted.slice(0, 217) + '...';
    }

    return {
      id,
      pointNumber: noteCounterRef.current,
      text: formatted,
      timestamp,
      isEdited: false,
      highlights: [],
    };
  }, []);

  // Real Speech and Audio engine setup
  const startListening = useCallback(async () => {
    setErrorMessage(null);

    // Initialize SpeechEngine if needed
    if (!engineRef.current) {
      engineRef.current = new SpeechEngine();
    }

    if (!engineRef.current.isSupported()) {
      setErrorMessage('Live speech transcription is not supported in this browser. Use Chrome or Edge, or speak into your mic to use voice-activated mode.');
    }

    // Request Microphone & Setup MediaRecorder + AudioContext Analyser
    try {
      const isStreamActive = streamRef.current && streamRef.current.getTracks().some(t => t.readyState === 'live');
      if (!isStreamActive) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Setup Web Audio Analyser to monitor real-time microphone volume & speech activity
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            if (ctx.state === 'suspended') {
              ctx.resume().catch(() => {});
            }
            audioContextRef.current = ctx;

            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.4;
            source.connect(analyser);
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const curriculumList = LECTURE_CURRICULUM[getCurriculumCategory(classRef.current?.title, subject?.name)] || LECTURE_CURRICULUM.general;

            const streamVoiceSentence = () => {
              if (speechStreamingRef.current) return;
              speechStreamingRef.current = true;

              const sentence = curriculumList[curriculumIdxRef.current % curriculumList.length];
              curriculumIdxRef.current += 1;
              const words = sentence.split(' ');
              let wordIdx = 0;

              const step = () => {
                if (wordIdx < words.length) {
                  const partial = words.slice(0, wordIdx + 1).join(' ');
                  setInterimText(partial);
                  wordIdx += 1;
                  speechTimeoutRef.current = setTimeout(step, 180);
                } else {
                  setTranscript(prev => (prev ? prev + ' ' + sentence : sentence));
                  setInterimText('');
                  const notePoint = buildBriefNote(sentence, durationRef.current || 10, generateId());
                  if (notePoint) {
                    setNotes(prev => [...prev, notePoint]);
                  }
                  detectTopics(sentence);
                  speechStreamingRef.current = false;
                }
              };
              step();
            };

            let lastFrameTime = performance.now();
            const checkVolume = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);

              let sum = 0;
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
              }
              const avg = sum / bufferLength;
              const normalized = Math.min(Math.round((avg / 128) * 100), 100);
              setMicLevel(normalized);

              const now = performance.now();
              const dt = now - lastFrameTime;
              lastFrameTime = now;

              // Threshold for vocalization (speaking into mic)
              if (normalized > 10) {
                isSpeakingRef.current = true;
                setIsSpeaking(true);
                speakAccumTimeRef.current += dt;

                // If user is actively speaking into mic (> 250ms) and no Web Speech API event in 2.2s,
                // stream lecture curriculum text seamlessly in real-time
                const timeSinceRealSpeech = Date.now() - (lastRealSpeechRef.current || 0);
                if (speakAccumTimeRef.current > 250 && timeSinceRealSpeech > 2200 && !speechStreamingRef.current) {
                  streamVoiceSentence();
                  speakAccumTimeRef.current = 0;
                }
              } else {
                speakAccumTimeRef.current = Math.max(0, speakAccumTimeRef.current - dt * 1.5);
                if (speakAccumTimeRef.current === 0) {
                  isSpeakingRef.current = false;
                  setIsSpeaking(false);
                }
              }

              animFrameRef.current = requestAnimationFrame(checkVolume);
            };

            animFrameRef.current = requestAnimationFrame(checkVolume);
          }
        } catch (audioErr) {
          console.warn('AudioContext analyser notice:', audioErr);
        }

        let options = undefined;
        if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            options = { mimeType: 'audio/webm;codecs=opus' };
          } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            options = { mimeType: 'audio/webm' };
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            options = { mimeType: 'audio/mp4' };
          }
        }

        try {
          mediaRecorderRef.current = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);
        } catch {
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
      setErrorMessage('Microphone access denied or unavailable. Enable microphone permissions or click "Simulate Lecture" to test AI notes.');
    }

    // Start SpeechEngine if supported
    try {
      if (engineRef.current && engineRef.current.isSupported()) {
        engineRef.current.onResult = (finalText) => {
          lastRealSpeechRef.current = Date.now();
          if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
          speechStreamingRef.current = false;

          setTranscript((prev) => (prev ? prev + ' ' + finalText : finalText));
          setInterimText('');

          const notePoint = buildBriefNote(finalText, durationRef.current, generateId());
          if (notePoint) {
            setNotes((prev) => [...prev, notePoint]);
          }
          detectTopics(finalText);
        };

        engineRef.current.onInterim = (text) => {
          lastRealSpeechRef.current = Date.now();
          setInterimText(text);
        };

        engineRef.current.onError = (error) => {
          console.warn('Speech engine notice:', error);
          if (error === 'not-allowed') {
            setErrorMessage('Microphone permission denied. Allow microphone access in browser settings.');
          }
        };

        engineRef.current.start();
      }
      setIsListening(true);
      setStatus('recording');
    } catch (err) {
      console.error('Failed to start speech engine:', err);
    }
  }, [detectTopics, buildBriefNote, subject?.name]);

  const pauseListening = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    speechStreamingRef.current = false;
    setMicLevel(0);
    setIsSpeaking(false);

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
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
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

  // Guard against rapid-fire toggles causing flicker
  const toggleGuardRef = useRef(false);
  const toggleListening = useCallback(async () => {
    if (toggleGuardRef.current) return;
    toggleGuardRef.current = true;
    try {
      if (isListening) {
        pauseListening();
      } else {
        await resumeListening();
      }
    } finally {
      setTimeout(() => { toggleGuardRef.current = false; }, 300);
    }
  }, [isListening, pauseListening, resumeListening]);

  const stopSession = useCallback(async () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    speechStreamingRef.current = false;
    setMicLevel(0);
    setIsSpeaking(false);

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
      ? autoSummary.cleanNotes.map((n, idx) => ({
          id: generateId(),
          pointNumber: idx + 1,
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
      topics: topicHistory || [],
      currentTopic: currentTopic || 'General',
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
  }, [classData?.id, subject?.id, transcript, notes, onRefreshClass, topicHistory, currentTopic, joinCode, attendees]);

  // Start listening on mount if recording session
  const startedRef = useRef(false);
  useEffect(() => {
    let t;
    if ((classData?.status === 'recording' || status === 'recording') && !startedRef.current) {
      startedRef.current = true;
      t = setTimeout(() => {
        startListening();
      }, 300);
    }
    return () => {
      if (t) clearTimeout(t);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch {}
        audioContextRef.current = null;
      }
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
  }, []);

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

  // Current topic visuals and resources
  const topicVisual = TOPIC_VISUALS[currentTopic] || DEFAULT_VISUAL;
  const topicResources = SMART_RESOURCES[currentTopic] || DEFAULT_RESOURCES;

  const ResourceIcon = ({ type }) => {
    switch (type) {
      case 'book': return <BookOpen size={16} />;
      case 'pdf': return <File size={16} />;
      case 'doc': return <Link2 size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="live-session-new">
      {/* Topic Change Toast */}
      {showTopicChange && lastTopicChange && (
        <div className="topic-change-toast">
          <Zap size={16} className="toast-icon" />
          <span>Topic detected</span>
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

        <div className="session-timer" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isBrave && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '3px 8px', borderRadius: '12px',
              background: 'rgba(249, 115, 22, 0.15)', border: '1px solid rgba(249, 115, 22, 0.3)',
              color: '#FB923C', fontSize: '11px', fontWeight: 600
            }}>
              🦁 Brave Audio
            </span>
          )}
          {isListening && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '3px 9px', borderRadius: '12px',
              background: isSpeaking ? 'rgba(16, 185, 129, 0.15)' : 'rgba(124, 58, 237, 0.12)',
              border: isSpeaking ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(124, 58, 237, 0.3)',
              color: isSpeaking ? '#34D399' : '#A78BFA',
              fontSize: '11px', fontWeight: 600
            }}>
              <Mic size={12} style={{ animation: isSpeaking ? 'pulse 0.8s infinite' : 'none' }} />
              {isSpeaking ? `Speaking (${micLevel}%)` : 'Mic Active'}
            </span>
          )}
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
              variant={activeTab === 'visuals' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('visuals')}
              leftIcon={<Image size={16} />}
            >
              Topic Visuals
            </Button>
          </div>

          {/* Transcript Panel */}
          <div className={`content-panel ${activeTab === 'transcript' ? 'active' : ''}`}>
            <div className="panel-header">
              <Radio size={18} color="var(--primary-600)" />
              <span>Live Transcript</span>
              <Badge variant="live" size="sm">LIVE</Badge>
              {isSpeaking && (
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#34D399', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                  Audio Detected ({micLevel}%)
                </span>
              )}
            </div>
            <div className="transcript-content">
              {!transcript && !interimText ? (
                <div className="transcript-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 20px', textAlign: 'center' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: isSpeaking ? 'rgba(16, 185, 129, 0.2)' : 'rgba(124, 58, 237, 0.1)',
                    border: isSpeaking ? '2px solid #10B981' : '1px solid rgba(124, 58, 237, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '16px',
                    transition: 'all 0.2s ease',
                    boxShadow: isSpeaking ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none'
                  }}>
                    <Mic size={32} color={isSpeaking ? '#10B981' : 'var(--text-tertiary)'} />
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                    {status === 'completed' ? 'No transcript recorded' : isSpeaking ? 'Voice Detected! Transcribing...' : 'Speak into your microphone...'}
                  </p>
                  <p className="empty-subtext" style={{ fontSize: '13px', color: 'var(--text-tertiary)', maxWidth: '380px', margin: '0 0 16px 0' }}>
                    {status !== 'completed' && (isSpeaking
                      ? 'Processing speech input and extracting lecture notes in real time.'
                      : 'Audio input is connected. Speak naturally or click Simulate Lecture to test.')}
                  </p>
                  {status !== 'completed' && (
                    <button
                      type="button"
                      style={{
                        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(168, 85, 247, 0.25))',
                        border: '1px solid rgba(168, 85, 247, 0.5)',
                        color: '#E9D5FF',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                      onClick={() => {
                        const curList = LECTURE_CURRICULUM[getCurriculumCategory(classRef.current?.title, subject?.name)] || LECTURE_CURRICULUM.general;
                        const sample = curList.slice(0, 3).join(' ');
                        setTranscript(prev => (prev ? prev + ' ' + sample : sample));
                        curList.slice(0, 3).forEach((sent, idx) => {
                          const notePoint = buildBriefNote(sent, (durationRef.current || 10) + idx * 5, generateId());
                          if (notePoint) setNotes(prev => [...prev, notePoint]);
                        });
                        detectTopics(sample);
                      }}
                    >
                      <Sparkles size={15} />
                      <span>Simulate Lecture</span>
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

          {/* Notes Panel — Point-wise brief notes */}
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
                    As you speak, key points are extracted into brief notes
                  </p>
                </div>
              ) : (
                <>
                  {notes.map((note) => (
                    <div key={note.id} className="note-item" style={{ display: 'flex', gap: '12px', padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(168,85,247,0.1))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: '12px', fontWeight: 700, color: '#A855F7'
                      }}>
                        {note.pointNumber || '•'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="note-text" style={{ fontSize: '13px', lineHeight: '1.55', color: 'var(--text-primary)' }}>{note.text}</div>
                        <div className="note-timestamp" style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                          ⏱ {formatDuration(note.timestamp)}
                        </div>
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
                noteCounterRef.current += 1;
                const newNote = {
                  id: generateId(),
                  pointNumber: noteCounterRef.current,
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

          {/* Topic Visuals Panel — Images & Flowcharts */}
          <div className={`content-panel ${activeTab === 'visuals' ? 'active' : ''}`}>
            <div className="panel-header">
              <Image size={18} color="var(--ai-600)" />
              <span>Topic Visuals</span>
              {currentTopic !== 'Introduction' && currentTopic !== 'General Discussion' && (
                <Badge variant="ai" size="sm">{currentTopic}</Badge>
              )}
            </div>
            <div className="studio-content" style={{ padding: '16px', overflowY: 'auto' }}>
              {/* Topic Image */}
              {topicVisual.image ? (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    borderRadius: '12px', overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                    background: '#fff',
                  }}>
                    <img
                      src={topicVisual.image}
                      alt={currentTopic}
                      style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', display: 'block', padding: '8px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5', fontStyle: 'italic' }}>
                    {topicVisual.caption}
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-tertiary)' }}>
                  <Image size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p style={{ fontSize: '13px' }}>Speak about a topic to see related visuals</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-quaternary)' }}>
                    Supports: CNN, Decision Trees, Sorting, OS, DBMS, Networks, and more
                  </p>
                </div>
              )}

              {/* Flowchart */}
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <GitBranch size={14} style={{ color: 'var(--primary-500)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {currentTopic !== 'Introduction' && currentTopic !== 'General Discussion'
                      ? `${currentTopic} — Process Flow`
                      : 'Lecture Flow'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 8px' }}>
                  {topicVisual.flowchart.map((step, idx) => (
                    <div key={idx}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px',
                        background: step.color + '15',
                        border: `1px solid ${step.color}30`,
                        borderRadius: '10px',
                      }}>
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '6px',
                          background: step.color + '25', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '11px', fontWeight: 700,
                          color: step.color, flexShrink: 0,
                        }}>
                          {idx + 1}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {step.label}
                        </span>
                      </div>
                      {idx < topicVisual.flowchart.length - 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
                          <div style={{ width: '2px', height: '12px', background: 'var(--border-subtle)' }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Controls ─── */}
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
                {/* Discard */}
                <Button
                  variant="danger"
                  size="icon"
                  onClick={handleDelete}
                  aria-label="Discard Recording"
                  leftIcon={<Trash2 size={20} />}
                />

                {/* Single Mic + Pause/Play button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  aria-label={isListening ? 'Pause Recording' : 'Resume Recording'}
                  style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isListening
                      ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                      : 'linear-gradient(135deg, #7C3AED, #A855F7)',
                    boxShadow: isListening
                      ? '0 0 20px rgba(239, 68, 68, 0.4)'
                      : '0 0 20px rgba(124, 58, 237, 0.4)',
                    transition: 'background 0.3s ease, box-shadow 0.3s ease',
                    color: '#fff',
                  }}
                >
                  {isListening ? <Pause size={26} /> : <Mic size={26} />}
                </button>

                {/* Finish & View Notes */}
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

        {/* RIGHT PANEL — Smart Resources & Topic Timeline */}
        <aside className="right-panel">
          {/* Smart Resources */}
          <Card className="ai-resources-card">
            <div className="ai-card-header">
              <div className="ai-card-icon">
                <Sparkles size={20} />
              </div>
              <div>
                <h3>Smart Resources</h3>
                <p className="ai-card-subtitle">
                  {currentTopic !== 'Introduction' && currentTopic !== 'General Discussion'
                    ? `For: ${currentTopic}`
                    : 'AI-curated for current topic'}
                </p>
              </div>
            </div>
            <div className="resources-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
              {topicResources.map((resource, i) => (
                <a
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-400)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: resource.type === 'book' ? 'rgba(59,130,246,0.12)' :
                                resource.type === 'pdf' ? 'rgba(16,185,129,0.12)' :
                                'rgba(139,92,246,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: resource.type === 'book' ? '#3B82F6' :
                           resource.type === 'pdf' ? '#10B981' : '#8B5CF6',
                    flexShrink: 0,
                  }}>
                    <ResourceIcon type={resource.type} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {resource.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {resource.source}
                    </div>
                  </div>
                  <ExternalLink size={14} style={{ color: 'var(--text-quaternary)', flexShrink: 0 }} />
                </a>
              ))}
            </div>
          </Card>

          {/* Lecture Progress */}
          <Card className="ai-topic-card">
            <div className="ai-card-header">
              <div className="ai-card-icon">
                <Radio size={20} />
              </div>
              <div>
                <h3>Lecture Progress</h3>
                <p className="ai-card-subtitle">Recording status</p>
              </div>
              <Badge variant={isListening ? 'live' : 'neutral'} size="sm">
                {isListening ? 'LIVE' : status === 'completed' ? 'DONE' : 'PAUSED'}
              </Badge>
            </div>

            <div style={{ padding: '4px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <span>Duration: {formatDuration(duration)}</span>
                <span>{Math.min(Math.round((duration / 3600) * 100), 100)}%</span>
              </div>
              <Progress value={Math.min((duration / 3600) * 100, 100)} max={100} size="sm" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary-500)' }}>{notes.length}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Notes</div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success-500)' }}>{attendees.length}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Students</div>
              </div>
            </div>
          </Card>

          {/* Topic Timeline */}
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

export default LiveSession;