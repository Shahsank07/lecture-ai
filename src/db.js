/* IndexedDB wrapper for VoiceNotes AI */
import { openDB } from 'idb';

const DB_NAME = 'voicenotes-ai';
const DB_VERSION = 4;

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Subjects store
        if (!db.objectStoreNames.contains('subjects')) {
          const subjectStore = db.createObjectStore('subjects', { keyPath: 'id' });
          subjectStore.createIndex('createdAt', 'createdAt');
          subjectStore.createIndex('userId', 'userId');
        }
        // Schedules store
        if (!db.objectStoreNames.contains('schedules')) {
          const scheduleStore = db.createObjectStore('schedules', { keyPath: 'id' });
          scheduleStore.createIndex('scheduledDate', 'scheduledDate');
        }
        // Classes store
        if (!db.objectStoreNames.contains('classes')) {
          const classStore = db.createObjectStore('classes', { keyPath: 'id' });
          classStore.createIndex('subjectId', 'subjectId');
          classStore.createIndex('date', 'date');
        }
        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }
        // Resources store
        if (!db.objectStoreNames.contains('resources')) {
          db.createObjectStore('resources', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// ─── Subjects ────────────────────────────────────────
export async function getAllSubjects(userId) {
  const db = await getDB();
  const subjects = await db.getAll('subjects');
  return subjects
    .filter(s => s.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getSubject(id) {
  const db = await getDB();
  return db.get('subjects', id);
}

export async function saveSubject(subject) {
  const db = await getDB();
  return db.put('subjects', subject);
}

export async function deleteSubject(id) {
  const db = await getDB();
  const classes = await getClassesBySubject(id);
  const tx = db.transaction('classes', 'readwrite');
  for (const cls of classes) {
    await tx.store.delete(cls.id);
  }
  await tx.done;
  return db.delete('subjects', id);
}

// ─── Classes ─────────────────────────────────────────
export async function getClassesBySubject(subjectId) {
  const db = await getDB();
  const index = db.transaction('classes').store.index('subjectId');
  const classes = await index.getAll(subjectId);
  return classes.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getClass(id) {
  const db = await getDB();
  return db.get('classes', id);
}

export async function saveClass(cls) {
  const db = await getDB();
  return db.put('classes', cls);
}

export async function deleteClass(id) {
  const db = await getDB();
  return db.delete('classes', id);
}

export async function getClassCount(subjectId) {
  const db = await getDB();
  const index = db.transaction('classes').store.index('subjectId');
  const classes = await index.getAll(subjectId);
  return classes.length;
}

// ─── Users ──────────────────────────────────────────
export async function saveUser(user) {
  const db = await getDB();
  return db.put('users', user);
}

export async function getUserByEmail(email) {
  const db = await getDB();
  return db.getFromIndex('users', 'email', email);
}

// ─── Schedules ───────────────────────────────────────
export async function getSchedules() {
  const db = await getDB();
  const schedules = await db.getAll('schedules');
  return schedules.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
}

export async function saveSchedule(schedule) {
  const db = await getDB();
  return db.put('schedules', schedule);
}

export async function deleteSchedule(id) {
  const db = await getDB();
  return db.delete('schedules', id);
}

export async function getAllClasses() {
  const db = await getDB();
  const classes = await db.getAll('classes');
  return classes.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ─── Resources ───────────────────────────────────────
export async function getAllSavedResources() {
  const db = await getDB();
  return db.getAll('resources');
}

export async function saveResource(resource) {
  const db = await getDB();
  return db.put('resources', resource);
}

export async function deleteSavedResource(id) {
  const db = await getDB();
  return db.delete('resources', id);
}

export async function seedDefaultSubjectsAndClasses(userId) {
  const db = await getDB();
  const existing = await getAllSubjects(userId);
  if (existing && existing.length > 0) return existing;

  const defaultSubs = [
    {
      id: 'sub-dsa',
      userId,
      name: 'Data Structures',
      emoji: '🌳',
      topicPreset: 'studio',
      gradient: 'var(--gradient-purple)',
      color: '#7C3AED',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'sub-dbms',
      userId,
      name: 'Database Management Systems',
      emoji: '🗄️',
      topicPreset: 'studio',
      gradient: 'var(--gradient-blue)',
      color: '#2563EB',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'sub-os',
      userId,
      name: 'Operating Systems',
      emoji: '💻',
      topicPreset: 'studio',
      gradient: 'var(--gradient-teal)',
      color: '#0D9488',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ];

  for (const sub of defaultSubs) {
    await saveSubject(sub);
  }

  // Sample classes with AI summaries
  const sampleClasses = [
    {
      id: 'cls-dbms-norm',
      subjectId: 'sub-dbms',
      title: 'Database Normalization (1NF to 3NF)',
      date: new Date(Date.now() - 86400000).toISOString(),
      duration: 2720,
      status: 'completed',
      transcript: 'In today\'s lecture we discussed database normalization. First Normal Form requires atomic values and elimination of repeating groups. Second Normal Form eliminates partial functional dependencies. Third Normal Form removes transitive dependencies, ensuring that every non-prime attribute is non-transitively dependent on every candidate key.',
      notes: [
        { id: 'n1', timestamp: 120, text: 'First Normal Form (1NF): Each column must contain atomic (indivisible) values, and each record must be unique.', highlights: [] },
        { id: 'n2', timestamp: 450, text: 'Second Normal Form (2NF): Must be in 1NF and have no partial dependency—every non-key attribute fully depends on primary key.', highlights: [] },
        { id: 'n3', timestamp: 890, text: 'Third Normal Form (3NF): Must be in 2NF and have no transitive dependency—non-key attributes depend only on the primary key.', highlights: [] }
      ],
      summary: {
        overview: 'Database Normalization is the systematic process of organizing data in a relational database to minimize redundancy and prevent update, insertion, and deletion anomalies. By progressing through 1NF, 2NF, and 3NF, database designers ensure data integrity, logical consistency, and optimal query performance across enterprise systems.',
        keyTakeaways: [
          '1NF ensures atomicity: columns hold single values with no repeating groups.',
          '2NF removes partial functional dependencies on composite primary keys.',
          '3NF removes transitive dependencies (X -> Y and Y -> Z where Z is non-prime).',
          'Boyce-Codd Normal Form (BCNF) is a stricter version of 3NF for overlapping candidate keys.',
          'Normalization reduces storage redundancy but may require relational JOIN operations for queries.'
        ],
        cleanNotes: [
          { text: 'Functional dependency: Constraint between two sets of attributes in a relational relation.', timestamp: 120 },
          { text: 'Anomalies prevented: Update anomaly, insertion anomaly, deletion anomaly.', timestamp: 350 },
          { text: 'Lossless join decomposition guarantees original relations can be reconstructed without spurious tuples.', timestamp: 780 }
        ]
      },
      flashcards: [
        { id: '1', question: 'What condition violates Second Normal Form (2NF)?', answer: 'A partial dependency, where a non-prime attribute depends on only a proper subset of a composite candidate key.' },
        { id: '2', question: 'What is a transitive dependency in 3NF?', answer: 'When a non-key attribute depends on another non-key attribute rather than directly on the primary key.' }
      ]
    },
    {
      id: 'cls-dsa-trees',
      subjectId: 'sub-dsa',
      title: 'Stacks and Queues',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      duration: 2295,
      status: 'completed',
      transcript: 'Stacks follow Last-In-First-Out (LIFO) order, supporting push and pop in O(1) time. Queues follow First-In-First-Out (FIFO) order, supporting enqueue and dequeue in O(1) time.',
      notes: [
        { id: 'n4', timestamp: 90, text: 'Stack applications: Function call stack, recursion, undo operations, parenthesis matching.', highlights: [] },
        { id: 'n5', timestamp: 320, text: 'Queue applications: CPU scheduling, printer buffer, Breadth-First Search (BFS).', highlights: [] }
      ],
      summary: {
        overview: 'Stacks and Queues are fundamental linear data structures with constrained access points. Stacks operate under LIFO semantics using top pointers, while Queues operate under FIFO semantics using front and rear pointers.',
        keyTakeaways: [
          'Stack push and pop operations are strictly O(1) constant time.',
          'Queue enqueue and dequeue operations run in O(1) time with circular array or linked list.',
          'Breadth-First Search inherently requires a Queue data structure.',
          'Depth-First Search and backtracking inherently utilize a Stack.'
        ],
        cleanNotes: [
          { text: 'Stack overflow occurs when attempting to push onto a full stack.', timestamp: 90 },
          { text: 'Circular queues resolve memory waste in simple array-based queue implementations.', timestamp: 320 }
        ]
      }
    }
  ];

  for (const cls of sampleClasses) {
    await saveClass(cls);
  }

  return defaultSubs;
}
