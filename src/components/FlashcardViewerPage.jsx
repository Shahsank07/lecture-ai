import { useState } from 'react';
import {
  ArrowLeft, Sparkles, HelpCircle, BookOpen, Layers,
  ChevronRight, Brain, RotateCcw, CheckCircle2, Zap
} from 'lucide-react';
import FlashcardViewer from './FlashcardViewer';
import { Card, Button } from './ui';
import './FlashcardViewerPage.css';

// Curated comprehensive subject quizzes
const PRESET_SUBJECTS = {
  'dsa': {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    emoji: '🌳',
    color: '#7C3AED',
    tag: 'CS-301',
    description: 'Binary trees, AVL rotations, graph traversal, sorting algorithms, and Big-O complexity.',
    quiz: [
      { id: '1', question: 'Which time complexity applies to BST insertion in the worst case (unbalanced)?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], correctIndex: 2 },
      { id: '2', question: 'Which data structure is primarily used to implement Breadth-First Search (BFS)?', options: ['Stack', 'Queue', 'Priority Queue', 'Binary Tree'], correctIndex: 1 },
      { id: '3', question: 'What is the average time complexity of searching an element in a Hash Table?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correctIndex: 0 },
      { id: '4', question: 'What rotation is performed on an AVL tree when a node is inserted into the right subtree of the left child?', options: ['Left-Left (LL)', 'Right-Right (RR)', 'Left-Right (LR)', 'Right-Left (RL)'], correctIndex: 2 },
      { id: '5', question: 'Which sorting algorithm guarantees a worst-case time complexity of O(n log n)?', options: ['Quick Sort', 'Merge Sort', 'Bubble Sort', 'Insertion Sort'], correctIndex: 1 }
    ],
    flashcards: [
      { id: '1', question: 'What is a Binary Search Tree (BST)?', answer: 'A node-based binary tree where the left subtree contains keys smaller than the node, and the right subtree contains keys greater.' },
      { id: '2', question: 'What is the difference between a Stack and a Queue?', answer: 'A Stack follows LIFO (Last In First Out), whereas a Queue follows FIFO (First In First Out).' },
      { id: '3', question: 'What is an AVL Tree?', answer: 'A self-balancing binary search tree where the difference between heights of left and right subtrees cannot exceed 1 for any node.' },
      { id: '4', question: 'What is a Hash Collision?', answer: 'When two different keys produce the exact same index via the hash function.' },
      { id: '5', question: 'What is Dynamic Programming?', answer: 'An optimization algorithm pattern that breaks problems into overlapping subproblems and caches intermediate solutions.' }
    ]
  },
  'dbms': {
    id: 'dbms',
    name: 'Database Management Systems',
    emoji: '🗄️',
    color: '#3B82F6',
    tag: 'CS-401',
    description: 'Relational algebra, 1NF to 3NF/BCNF normalization, SQL queries, ACID properties, and indexing.',
    quiz: [
      { id: '1', question: 'A database table is in 3NF if it is in 2NF and contains no:', options: ['Partial dependencies', 'Transitive dependencies', 'Primary keys', 'Foreign keys'], correctIndex: 1 },
      { id: '2', question: 'Which ACID property ensures that incomplete transactions do not leave partial state in the database?', options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], correctIndex: 0 },
      { id: '3', question: 'Which index type dictates the physical ordering of data rows on disk in a database table?', options: ['Non-Clustered Index', 'Clustered Index', 'Bitmap Index', 'Hash Index'], correctIndex: 1 },
      { id: '4', question: 'In relational algebra, which operator selects rows that satisfy a specified predicate condition?', options: ['Projection (π)', 'Selection (σ)', 'Cartesian Product (×)', 'Join (⋈)'], correctIndex: 1 },
      { id: '5', question: 'Which SQL command deletes all rows in a table rapidly without logging row-by-row deletions?', options: ['DELETE', 'DROP', 'TRUNCATE', 'REMOVE'], correctIndex: 2 }
    ],
    flashcards: [
      { id: '1', question: 'What is Database Normalization?', answer: 'The systematic process of organizing tables to eliminate data redundancy and anomalies while ensuring referential integrity.' },
      { id: '2', question: 'What are the ACID properties in database transactions?', answer: 'Atomicity (all or nothing), Consistency (preserves constraints), Isolation (concurrent execution), Durability (persisted on disk).' },
      { id: '3', question: 'What is the difference between Primary Key and Unique Key?', answer: 'A Primary Key does not accept NULL values and is unique per table. Unique keys allow a single NULL value and a table can have multiple unique keys.' },
      { id: '4', question: 'What is BCNF (Boyce-Codd Normal Form)?', answer: 'A strict variant of 3NF where for every functional dependency X -> Y, X must strictly be a super key.' },
      { id: '5', question: 'What is a Foreign Key?', answer: 'A column or combination of columns that establishes and enforces a link between the data in two tables.' }
    ]
  },
  'os': {
    id: 'os',
    name: 'Operating Systems',
    emoji: '💻',
    color: '#10B981',
    tag: 'CS-302',
    description: 'Process scheduling, concurrency, deadlocks, semaphores, paging, and virtual memory management.',
    quiz: [
      { id: '1', question: 'Which process scheduling algorithm can cause indefinite starvation for low priority processes?', options: ['Round Robin', 'First-Come First-Served', 'Priority Scheduling', 'Shortest Job First'], correctIndex: 2 },
      { id: '2', question: 'Which of the following is NOT one of the 4 Coffman conditions for deadlocks?', options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'], correctIndex: 2 },
      { id: '3', question: 'What is the condition where an operating system spends more time paging than executing instructions?', options: ['Page Fault', 'Belady\'s Anomaly', 'Thrashing', 'Segmentation Fault'], correctIndex: 2 },
      { id: '4', question: 'Which synchronization mechanism uses wait() (P) and signal() (V) primitive operations?', options: ['Mutex', 'Semaphore', 'Condition Variable', 'Spinlock'], correctIndex: 1 },
      { id: '5', question: 'What is the main purpose of the Translation Lookaside Buffer (TLB)?', options: ['Cache virtual-to-physical address translations', 'Schedule kernel threads', 'Buffer disk input/output blocks', 'Manage process interrupt tables'], correctIndex: 0 }
    ],
    flashcards: [
      { id: '1', question: 'What is the difference between a Process and a Thread?', answer: 'A process is an executing program instance with its own virtual memory space; a thread is a lightweight execution unit inside a process sharing memory.' },
      { id: '2', question: 'What is Virtual Memory?', answer: 'An abstraction technique that provides an application with the perception of contiguous available memory, implemented via paging.' },
      { id: '3', question: 'What are the 4 Deadlock conditions?', answer: 'Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.' },
      { id: '4', question: 'What is Context Switching?', answer: 'The procedure of saving the CPU register state of an active process and loading the state of another ready process.' },
      { id: '5', question: 'What is Thrashing?', answer: 'A state where the system is overloaded with page faults and spends almost all processing power swapping pages instead of doing useful work.' }
    ]
  },
  'networks': {
    id: 'networks',
    name: 'Computer Networks',
    emoji: '🌐',
    color: '#F59E0B',
    tag: 'CS-402',
    description: 'TCP/IP and OSI stack, routing protocols, subnetting, DNS, socket programming, and network security.',
    quiz: [
      { id: '1', question: 'Which layer of the OSI model manages end-to-end communication, packet reordering, and flow control?', options: ['Network Layer', 'Transport Layer', 'Data Link Layer', 'Session Layer'], correctIndex: 1 },
      { id: '2', question: 'What packets are exchanged during a standard three-way TCP connection handshake?', options: ['SYN -> ACK -> FIN', 'SYN -> SYN-ACK -> ACK', 'ACK -> SYN -> ACK', 'CONNECT -> ACCEPT -> READY'], correctIndex: 1 },
      { id: '3', question: 'Which protocol translates human-readable domain names into numerical IP addresses?', options: ['DHCP', 'ARP', 'DNS', 'ICMP'], correctIndex: 2 },
      { id: '4', question: 'What default port number is used for secure encrypted HTTPS web traffic?', options: ['80', '8080', '443', '22'], correctIndex: 2 },
      { id: '5', question: 'Which protocol maps a known IPv4 address to a local physical hardware MAC address?', options: ['ARP', 'RARP', 'NAT', 'BGP'], correctIndex: 0 }
    ],
    flashcards: [
      { id: '1', question: 'What are the 7 OSI Model layers?', answer: 'Physical (1), Data Link (2), Network (3), Transport (4), Session (5), Presentation (6), Application (7).' },
      { id: '2', question: 'What is the difference between TCP and UDP?', answer: 'TCP is connection-oriented, ordered, and ensures delivery. UDP is connectionless, lightweight, and does not guarantee packet delivery.' },
      { id: '3', question: 'What is DNS?', answer: 'Domain Name System, the hierarchical distributed naming system that maps domain names to IP addresses.' },
      { id: '4', question: 'What is Subnetting?', answer: 'Dividing a large IP network into smaller logical subnetworks to optimize routing efficiency and enhance security.' },
      { id: '5', question: 'What is a Router vs a Switch?', answer: 'A switch forwards packets within a single local network using MAC addresses (Layer 2); a router forwards packets between different networks using IP addresses (Layer 3).' }
    ]
  },
  'ai': {
    id: 'ai',
    name: 'Artificial Intelligence & ML',
    emoji: '🤖',
    color: '#EC4899',
    tag: 'CS-501',
    description: 'Supervised & unsupervised learning, deep neural nets, transformers, backpropagation, and loss optimization.',
    quiz: [
      { id: '1', question: 'Which optimization algorithm iteratively updates model weights in the opposite direction of the gradient?', options: ['Backpropagation', 'Gradient Descent', 'K-Means Clustering', 'PCA'], correctIndex: 1 },
      { id: '2', question: 'What technique prevents model overfitting by adding a penalty term on large weight coefficients?', options: ['Batch Normalization', 'Regularization (L1/L2)', 'Data Imputation', 'One-Hot Encoding'], correctIndex: 1 },
      { id: '3', question: 'What architectural innovation allows Transformer models to compute contextual weights across entire sequences simultaneously?', options: ['Convolutional Kernels', 'Recurrent Gates (LSTM)', 'Self-Attention Mechanism', 'Max-Pooling Layers'], correctIndex: 2 },
      { id: '4', question: 'In binary classification evaluation, what metric calculates True Positives / (True Positives + False Positives)?', options: ['Recall', 'Precision', 'F1-Score', 'Specificity'], correctIndex: 1 },
      { id: '5', question: 'Which learning paradigm trains an agent to maximize cumulative scalar rewards through trial and error?', options: ['Supervised Learning', 'Unsupervised Learning', 'Self-Supervised Learning', 'Reinforcement Learning'], correctIndex: 3 }
    ],
    flashcards: [
      { id: '1', question: 'What is Supervised vs Unsupervised Learning?', answer: 'Supervised learning trains on labeled input-output target pairs. Unsupervised learning identifies hidden patterns in unlabeled data.' },
      { id: '2', question: 'What is the Attention Mechanism in Transformers?', answer: 'A mechanism that calculates Query-Key dot products to dynamically weigh the relevance of tokens relative to each other.' },
      { id: '3', question: 'What is Overfitting?', answer: 'When a model memorizes training samples including noise, resulting in poor generalization on unseen test data.' },
      { id: '4', question: 'What is Gradient Descent?', answer: 'A first-order optimization algorithm for finding a local minimum of a differentiable loss function by taking proportional negative steps.' },
      { id: '5', question: 'What is the Bias-Variance tradeoff?', answer: 'High bias causes underfitting (too simple); high variance causes overfitting (too sensitive to training set fluctuations).' }
    ]
  }
};

export default function FlashcardViewerPage({
  currentClass,
  subjects = [],
  initialMode = 'quiz',
  onNavigate
}) {
  // If currentClass has an attached quiz, default to it; otherwise start at null so user selects subject
  const [selectedSubject, setSelectedSubject] = useState(
    currentClass?.summary?.quiz?.length
      ? {
          id: currentClass.id,
          name: currentClass.title || 'Lecture Quiz',
          emoji: '📝',
          color: '#7C3AED',
          quiz: currentClass.summary.quiz,
          flashcards: currentClass.summary.flashcards || []
        }
      : null
  );

  const [customTopic, setCustomTopic] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  // Handle generating custom topic quiz
  const handleGenerateCustomQuiz = (topicName) => {
    const topic = (topicName || customTopic || '').trim();
    if (!topic) return;

    setIsGeneratingCustom(true);
    setTimeout(() => {
      const generatedSubject = {
        id: 'custom-' + Date.now(),
        name: topic,
        emoji: '💡',
        color: '#6366F1',
        tag: 'Custom Topic',
        description: `Interactive assessment questions generated for ${topic}.`,
        quiz: [
          {
            id: 'c1',
            question: `What is the core foundational principle behind ${topic}?`,
            options: [
              `Hierarchical abstraction and structured composition in ${topic}`,
              'Brute-force state enumeration without optimization',
              'Static unchangeable compilation patterns',
              'Sequential single-threaded memory execution'
            ],
            correctIndex: 0
          },
          {
            id: 'c2',
            question: `Which methodology is considered an industry best practice when designing ${topic}?`,
            options: [
              'Ignoring error boundaries and edge conditions',
              `Modular separation of concerns and automated testing for ${topic}`,
              'Coupling tightly coupled global state variables',
              'Hardcoding static configuration parameters'
            ],
            correctIndex: 1
          },
          {
            id: 'c3',
            question: `What is the primary operational trade-off encountered when scaling ${topic}?`,
            options: [
              'Code readability vs CPU core temperature',
              'Network latency vs physical wire thickness',
              `Throughput and computational complexity vs memory space overhead in ${topic}`,
              'Keyboard key travel vs algorithm accuracy'
            ],
            correctIndex: 2
          },
          {
            id: 'c4',
            question: `In modern software and engineering pipelines, how is ${topic} typically evaluated?`,
            options: [
              'By visual inspection only',
              `Benchmarking performance, correctness constraints, and invariant verification for ${topic}`,
              'Counting the raw number of lines written',
              'Running on a single legacy operating system'
            ],
            correctIndex: 1
          },
          {
            id: 'c5',
            question: `Which real-world system relies directly on principles derived from ${topic}?`,
            options: [
              `High-availability distributed architectures and production frameworks using ${topic}`,
              'Purely analog mechanical machinery',
              'Paper filing cabinet indices',
              'Uncompressed single-bit registers'
            ],
            correctIndex: 0
          }
        ],
        flashcards: [
          {
            id: 'fc1',
            question: `What is the key definition of ${topic}?`,
            answer: `${topic} is a discipline focused on structured problem-solving, architectural efficiency, and verifiable systems.`
          },
          {
            id: 'fc2',
            question: `What is a primary advantage of applying ${topic}?`,
            answer: `It provides predictability, maintainability, and optimized computational resource utilization.`
          },
          {
            id: 'fc3',
            question: `What are common pitfalls to avoid in ${topic}?`,
            answer: `Premature optimization, lack of automated verification, and ignoring edge condition constraints.`
          }
        ]
      };

      setSelectedSubject(generatedSubject);
      setIsGeneratingCustom(false);
      setCustomTopic('');
    }, 400);
  };

  return (
    <div className="flashcard-page-container">
      {/* Top Breadcrumb & Controls */}
      <div className="quiz-top-bar">
        <button className="quiz-back-btn" onClick={() => onNavigate('dashboard')}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        {selectedSubject && (
          <div className="quiz-active-subject-banner">
            <span className="quiz-subj-pill">
              <span className="subj-dot" style={{ backgroundColor: selectedSubject.color }} />
              Active Subject: <strong>{selectedSubject.name}</strong>
            </span>
            <button
              className="btn-change-subject"
              onClick={() => setSelectedSubject(null)}
              title="Return to subject picker to choose a different quiz"
            >
              <RotateCcw size={14} />
              <span>Change Subject</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= VIEW 1: SUBJECT PICKER (If no subject is selected) ================= */}
      {!selectedSubject ? (
        <div className="quiz-selection-hub">
          <div className="quiz-hub-header">
            <div className="hub-badge">
              <Brain size={16} />
              <span>Interactive Knowledge Evaluation</span>
            </div>
            <h1 className="hub-title">Select a Subject to Begin Quiz</h1>
            <p className="hub-subtitle">
              Choose a core course subject below, take a quiz from your registered classes, or generate custom AI questions on any topic.
            </p>
          </div>

          {/* User-Created Subjects Section (if any exist) */}
          {subjects.length > 0 && (
            <div className="quiz-section-block">
              <h2 className="quiz-section-title">
                <BookOpen size={18} />
                <span>Your Enrolled Classes</span>
              </h2>
              <div className="quiz-cards-grid">
                {subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="subject-quiz-card user-subject"
                    onClick={() => handleGenerateCustomQuiz(sub.name)}
                  >
                    <div className="quiz-card-top">
                      <span className="subj-emoji">{sub.emoji}</span>
                      <span className="quiz-q-count">5 Questions</span>
                    </div>
                    <h3 className="subj-name">{sub.name}</h3>
                    <p className="subj-desc">Test your knowledge and comprehension for your enrolled {sub.name} class.</p>
                    <div className="quiz-card-footer">
                      <span className="start-label">Start Subject Quiz</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Curated Course Subjects */}
          <div className="quiz-section-block">
            <h2 className="quiz-section-title">
              <Layers size={18} />
              <span>Core Academic Subjects</span>
            </h2>
            <div className="quiz-cards-grid">
              {Object.values(PRESET_SUBJECTS).map((sub) => (
                <div
                  key={sub.id}
                  className="subject-quiz-card"
                  onClick={() => setSelectedSubject(sub)}
                >
                  <div className="quiz-card-top">
                    <span className="subj-emoji">{sub.emoji}</span>
                    <span className="quiz-tag-pill" style={{ borderColor: sub.color, color: sub.color }}>
                      {sub.tag}
                    </span>
                  </div>
                  <h3 className="subj-name">{sub.name}</h3>
                  <p className="subj-desc">{sub.description}</p>
                  <div className="quiz-card-footer">
                    <span className="q-count-badge">5 Questions • Flashcards</span>
                    <span className="start-link-btn" style={{ color: sub.color }}>
                      Take Quiz <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Custom Quiz Generator Card */}
          <div className="ai-custom-quiz-banner">
            <div className="ai-banner-content">
              <div className="ai-icon-box">
                <Sparkles size={24} color="#7C3AED" />
              </div>
              <div>
                <h3>Need a Quiz on Another Topic?</h3>
                <p>Type any subject or chapter topic (e.g., Software Engineering, Linear Algebra, React.js) to generate an instant quiz.</p>
              </div>
            </div>

            <div className="ai-input-row">
              <input
                type="text"
                placeholder="Enter topic name..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateCustomQuiz();
                }}
              />
              <button
                className="btn-generate-quiz"
                onClick={() => handleGenerateCustomQuiz()}
                disabled={isGeneratingCustom || !customTopic.trim()}
              >
                <Zap size={16} />
                <span>{isGeneratingCustom ? 'Generating...' : 'Start Custom Quiz'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= VIEW 2: ACTIVE QUIZ / FLASHCARD RUNNER ================= */
        <div className="quiz-runner-container">
          <div className="quiz-runner-header">
            <div className="runner-title-group">
              <span className="runner-emoji">{selectedSubject.emoji || '📝'}</span>
              <div>
                <h1 className="runner-title">{selectedSubject.name}</h1>
                <p className="runner-sub">Interactive multiple-choice quiz and study flashcards</p>
              </div>
            </div>
          </div>

          <Card style={{ padding: '24px', background: 'var(--bg-card, #0E1322)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px' }}>
            <FlashcardViewer
              flashcards={selectedSubject.flashcards || []}
              quiz={selectedSubject.quiz || []}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
