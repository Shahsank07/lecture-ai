/* Supabase + localStorage hybrid data layer for LectureAI
   Optimized for 0ms response time: instant local read/write, fast background sync
*/
import { supabase } from './supabaseClient';
import { generateId } from './utils/helpers';

// Helper: timeout wrapper for Supabase requests so slow/unreachable network never freezes the UI
function withTimeout(promise, ms = 1000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), ms))
  ]);
}

// ─── UUID Mapping for Demo Users ─────────────────────
const DEMO_UUID_MAP = {
  'faculty-alex-johnson': 'a1111111-1111-4111-a111-111111111111',
  'student-arjun-sharma': 'b2222222-2222-4222-b222-222222222222'
};

function toDbUserId(userId) {
  if (!userId) return 'c3333333-3333-4333-c333-333333333333';
  if (DEMO_UUID_MAP[userId]) return DEMO_UUID_MAP[userId];
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(userId)) return userId;
  return 'c3333333-3333-4333-c333-333333333333';
}

// ─── localStorage helpers (0ms instant access) ───────
function getLocal(key, defaultVal = []) {
  try {
    const val = localStorage.getItem('vn_' + key);
    return val ? JSON.parse(val) : defaultVal;
  } catch { return defaultVal; }
}

function setLocal(key, val) {
  try { localStorage.setItem('vn_' + key, JSON.stringify(val)); } catch {}
}

// ─── Subjects ────────────────────────────────────────
export async function getAllSubjects(userId) {
  const localSubs = getLocal('subjects').filter(s => !userId || s.userId === userId || s.user_id === userId);
  
  // If we already have local subjects, return immediately! Sync Supabase in background
  if (localSubs.length > 0) {
    // Background sync without blocking
    (async () => {
      try {
        const dbUserId = toDbUserId(userId);
        const { data, error } = await withTimeout(
          supabase.from('subjects').select('*').eq('user_id', dbUserId).order('created_at', { ascending: false }),
          1000
        );
        if (!error && data && data.length > 0) {
          const mapped = data.map(sub => ({
            ...sub, userId: sub.user_id, topicPreset: sub.topic_preset, createdAt: sub.created_at
          }));
          const merged = [...mapped];
          localSubs.forEach(ls => { if (!merged.find(m => m.id === ls.id)) merged.push(ls); });
          setLocal('subjects', merged);
        }
      } catch {}
    })();
    return localSubs;
  }

  // If local is empty, try Supabase with strict 1s timeout
  try {
    const dbUserId = toDbUserId(userId);
    const { data, error } = await withTimeout(
      supabase.from('subjects').select('*').eq('user_id', dbUserId).order('created_at', { ascending: false }),
      1000
    );
    if (!error && data && data.length > 0) {
      const mapped = data.map(sub => ({
        ...sub, userId: sub.user_id, topicPreset: sub.topic_preset, createdAt: sub.created_at
      }));
      setLocal('subjects', mapped);
      return mapped;
    }
  } catch {}

  return localSubs;
}

export async function getSubject(id) {
  const local = getLocal('subjects').find(s => s.id === id);
  if (local) return local; // Instant return

  try {
    const { data, error } = await withTimeout(
      supabase.from('subjects').select('*').eq('id', id).single(),
      800
    );
    if (!error && data) {
      return { ...data, userId: data.user_id, topicPreset: data.topic_preset, createdAt: data.created_at };
    }
  } catch {}
  return local || null;
}

export async function saveSubject(subject) {
  // 1. Instant local persistence (0ms)
  const localSubs = getLocal('subjects');
  const idx = localSubs.findIndex(s => s.id === subject.id);
  if (idx >= 0) localSubs[idx] = subject; else localSubs.push(subject);
  setLocal('subjects', localSubs);

  // 2. Background sync to Supabase
  (async () => {
    try {
      const payload = {
        id: subject.id,
        user_id: toDbUserId(subject.userId),
        name: subject.name,
        emoji: subject.emoji || '📚',
        topic_preset: subject.topicPreset || 'studio',
        gradient: subject.gradient || 'var(--gradient-purple)',
        color: subject.color || '#7C3AED',
        created_at: subject.createdAt || new Date().toISOString()
      };
      await withTimeout(
        supabase.from('subjects').upsert(payload, { onConflict: 'id' }).select().single(),
        1200
      );
    } catch {}
  })();

  return subject;
}

export async function deleteSubject(id) {
  const localSubs = getLocal('subjects').filter(s => s.id !== id);
  setLocal('subjects', localSubs);
  const localClasses = getLocal('classes').filter(c => c.subjectId !== id);
  setLocal('classes', localClasses);
  try {
    withTimeout(supabase.from('subjects').delete().eq('id', id), 800).catch(() => {});
  } catch {}
}

// ─── Classes ─────────────────────────────────────────
export async function getClassesBySubject(subjectId) {
  const localClasses = getLocal('classes').filter(c => c.subjectId === subjectId || c.subject_id === subjectId);
  if (localClasses.length > 0) return localClasses; // Instant return

  try {
    const { data, error } = await withTimeout(
      supabase.from('classes').select('*').eq('subject_id', subjectId).order('date', { ascending: false }),
      800
    );
    if (!error && data && data.length > 0) {
      return data.map(cls => ({ ...cls, subjectId: cls.subject_id, audioUrl: cls.audio_url, createdAt: cls.created_at }));
    }
  } catch {}
  return localClasses;
}

export async function getClass(id) {
  const local = getLocal('classes').find(c => c.id === id || c.id?.startsWith(id) || id?.startsWith(c.id));
  if (local) return local; // Instant return

  try {
    const { data, error } = await withTimeout(
      supabase.from('classes').select('*').eq('id', id).single(),
      800
    );
    if (!error && data) {
      return { ...data, subjectId: data.subject_id, audioUrl: data.audio_url, createdAt: data.created_at };
    }
  } catch {}
  return local || null;
}

export async function saveClass(cls) {
  const normalizedCls = {
    ...cls,
    subjectId: cls.subjectId || cls.subject_id,
    audioUrl: cls.audioUrl || cls.audio_url,
    joinCode: cls.joinCode || cls.code || null,
    attendees: cls.attendees || []
  };

  // 1. Instant local persistence (0ms)
  const localClasses = getLocal('classes');
  const idx = localClasses.findIndex(c => c.id === cls.id);
  if (idx >= 0) localClasses[idx] = normalizedCls; else localClasses.push(normalizedCls);
  setLocal('classes', localClasses);

  // 2. Background sync to Supabase (non-blocking)
  (async () => {
    let audioUrl = normalizedCls.audioUrl;
    if (cls.audioBlob && cls.audioBlob instanceof Blob) {
      try {
        const fileName = `audio-${cls.id}-${Date.now()}.webm`;
        const { data: uploadData } = await withTimeout(
          supabase.storage.from('audio-recordings').upload(fileName, cls.audioBlob, { cacheControl: '3600', upsert: false }),
          1500
        );
        if (uploadData) {
          const { data: publicUrlData } = supabase.storage.from('audio-recordings').getPublicUrl(fileName);
          audioUrl = publicUrlData.publicUrl;
          normalizedCls.audioUrl = audioUrl;
        }
      } catch {}
    }

    try {
      const payload = {
        id: cls.id,
        subject_id: normalizedCls.subjectId,
        title: cls.title,
        date: cls.date,
        duration: cls.duration || 0,
        status: cls.status || 'completed',
        transcript: cls.transcript || '',
        notes: cls.notes || [],
        summary: cls.summary || {},
        flashcards: cls.flashcards || [],
        audio_url: audioUrl || null,
        created_at: cls.createdAt || new Date().toISOString()
      };
      await withTimeout(
        supabase.from('classes').upsert(payload, { onConflict: 'id' }),
        1200
      );
    } catch {}
  })();

  return normalizedCls;
}

export async function getClassByJoinCode(code) {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();
  const local = getLocal('classes').find(c =>
    (c.joinCode && c.joinCode.toUpperCase() === cleanCode) ||
    (c.code && c.code.toUpperCase() === cleanCode)
  );
  if (local) return local;

  const allClasses = await getAllClasses();
  return allClasses.find(c =>
    (c.joinCode && c.joinCode.toUpperCase() === cleanCode) ||
    (c.code && c.code.toUpperCase() === cleanCode)
  ) || null;
}

export async function joinLectureByCode(code, studentUser) {
  if (!code || !studentUser) throw new Error('Valid lecture code and student identity are required.');
  const cls = await getClassByJoinCode(code);
  if (!cls) {
    throw new Error(`Lecture with code "${code.toUpperCase()}" not found. Please verify the code with your instructor.`);
  }

  const attendees = cls.attendees || [];
  const studentId = studentUser.id || studentUser.email;
  const existingIdx = attendees.findIndex(a => a.id === studentId || a.email === studentUser.email);

  const attendeeRecord = {
    id: studentId,
    name: studentUser.name || 'Student',
    email: studentUser.email || '',
    avatar: studentUser.avatar || '',
    department: studentUser.department || '',
    joinedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    attendees[existingIdx] = { ...attendees[existingIdx], ...attendeeRecord };
  } else {
    attendees.push(attendeeRecord);
  }

  cls.attendees = attendees;
  await saveClass(cls);

  // Store in student's personal joined_lectures list
  try {
    const joinedList = JSON.parse(localStorage.getItem('vn_joined_lectures') || '[]');
    if (!joinedList.some(item => item.id === cls.id)) {
      joinedList.push({ id: cls.id, joinCode: code.toUpperCase(), joinedAt: new Date().toISOString() });
      localStorage.setItem('vn_joined_lectures', JSON.stringify(joinedList));
    }
  } catch {}

  return cls;
}

export async function getJoinedLectures(studentUser) {
  if (!studentUser) return [];
  const allClasses = await getAllClasses();
  const studentId = studentUser.id || studentUser.email;

  let localJoined = [];
  try {
    localJoined = JSON.parse(localStorage.getItem('vn_joined_lectures') || '[]');
  } catch {}

  return allClasses.filter(c =>
    c.attendees?.some(a => a.id === studentId || a.email === studentUser.email) ||
    localJoined.some(j => j.id === c.id)
  );
}

export async function deleteClass(id) {
  const localClasses = getLocal('classes').filter(c => c.id !== id);
  setLocal('classes', localClasses);
  try {
    withTimeout(supabase.from('classes').delete().eq('id', id), 800).catch(() => {});
  } catch {}
}

export async function getClassCount(subjectId) {
  return getLocal('classes').filter(c => c.subjectId === subjectId || c.subject_id === subjectId).length;
}

export async function getAllClasses() {
  const local = getLocal('classes');
  if (local.length > 0) return local; // Instant return

  try {
    const { data, error } = await withTimeout(
      supabase.from('classes').select('*').order('date', { ascending: false }),
      800
    );
    if (!error && data && data.length > 0) {
      return data.map(cls => ({ ...cls, subjectId: cls.subject_id, audioUrl: cls.audio_url, createdAt: cls.created_at }));
    }
  } catch {}
  return local;
}

// ─── Users / Profiles ──────────────────────────────────
export async function saveUser(user) {
  const localUsers = getLocal('users');
  const idx = localUsers.findIndex(u => u.id === user.id || u.email === user.email);
  if (idx >= 0) localUsers[idx] = user; else localUsers.push(user);
  setLocal('users', localUsers);

  // Background sync
  (async () => {
    try {
      const payload = {
        id: toDbUserId(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution,
        department: user.department,
        subject: user.subject,
        semester: user.semester,
        phone: user.phone,
        avatar: user.avatar,
        classes_count: user.classesCount || 0,
        students_count: user.studentsCount || 0,
        enrolled_classes_count: user.enrolledClassesCount || 0,
        progress_percentage: user.progressPercentage || 0,
        updated_at: new Date().toISOString()
      };
      await withTimeout(
        supabase.from('profiles').upsert(payload, { onConflict: 'id' }),
        1000
      );
    } catch {}
  })();

  return user;
}

export async function getUserByEmail(email) {
  const localUser = getLocal('users').find(u => u.email === email);
  if (localUser) return localUser; // Instant return

  try {
    const { data, error } = await withTimeout(
      supabase.from('profiles').select('*').eq('email', email).maybeSingle(),
      800
    );
    if (!error && data) {
      return {
        ...data,
        classesCount: data.classes_count,
        studentsCount: data.students_count,
        enrolledClassesCount: data.enrolled_classes_count,
        progressPercentage: data.progress_percentage
      };
    }
  } catch {}
  return localUser || null;
}

// ─── Schedules ───────────────────────────────────────
export async function getSchedules() {
  return getLocal('schedules');
}

export async function saveSchedule(schedule) {
  const localSchedules = getLocal('schedules');
  const idx = localSchedules.findIndex(s => s.id === schedule.id);
  if (idx >= 0) localSchedules[idx] = schedule; else localSchedules.push(schedule);
  setLocal('schedules', localSchedules);
  return schedule;
}

export async function deleteSchedule(id) {
  const localSchedules = getLocal('schedules').filter(s => s.id !== id);
  setLocal('schedules', localSchedules);
}

// ─── Resources ───────────────────────────────────────
export async function getAllSavedResources() {
  return getLocal('resources');
}

export async function saveResource(resource) {
  const localResources = getLocal('resources');
  const idx = localResources.findIndex(r => r.id === resource.id);
  if (idx >= 0) localResources[idx] = resource; else localResources.push(resource);
  setLocal('resources', localResources);
  return resource;
}

export async function deleteSavedResource(id) {
  const localResources = getLocal('resources').filter(r => r.id !== id);
  setLocal('resources', localResources);
}

// ─── Assignments ─────────────────────────────────────
export async function getAllAssignments(user) {
  const local = getLocal('assignments');
  if (!user) return local;

  // If user is student, filter assignments published for their classes or enrolled subjects
  if (user.role === 'student') {
    const studentDept = (user.department || '').toLowerCase();
    const studentSem = (user.semester || '').toLowerCase();
    return local.filter(a => {
      // If assignment was assigned to 'all' or matches student class/subject
      if (!a.classGroup || a.classGroup === 'All Classes' || a.classGroup === 'all') return true;
      const target = a.classGroup.toLowerCase();
      // Match department, course name or semester keywords
      if (studentDept && (target.includes(studentDept) || studentDept.includes(target))) return true;
      if (a.course && target.includes(a.course.toLowerCase())) return true;
      return true; // Show published assignments
    });
  }

  // If faculty, show assignments created by this faculty or all assignments
  return local;
}

export async function saveAssignment(assignment) {
  if (!assignment.id) assignment.id = generateId();
  if (!assignment.createdAt) assignment.createdAt = new Date().toISOString();
  const local = getLocal('assignments');
  const idx = local.findIndex(a => a.id === assignment.id);
  if (idx >= 0) {
    local[idx] = { ...local[idx], ...assignment };
  } else {
    local.unshift(assignment);
  }
  setLocal('assignments', local);
  return assignment;
}

export async function deleteAssignment(id) {
  const local = getLocal('assignments').filter(a => a.id !== id);
  setLocal('assignments', local);
}

// ─── Attendance Records ──────────────────────────────
export async function getAttendanceRecords() {
  return getLocal('attendance_records');
}

export async function saveAttendanceRecord(record) {
  if (!record.id) record.id = generateId();
  if (!record.recordedAt) record.recordedAt = new Date().toISOString();
  const local = getLocal('attendance_records');
  const idx = local.findIndex(r => r.id === record.id);
  if (idx >= 0) {
    local[idx] = { ...local[idx], ...record };
  } else {
    local.unshift(record);
  }
  setLocal('attendance_records', local);
  return record;
}

// ─── Class Student Enrollment Roster ─────────────────
export function getClassRosterKey(department, semester, section) {
  const dept = (department || 'CSE').trim().toUpperCase();
  const sem = (semester || '3rd Sem').trim();
  const sec = (section || 'A').trim().toUpperCase();
  return `${dept}_${sem}_${sec}`;
}

export async function getClassRoster(classKey) {
  const rosters = getLocal('class_rosters', {});
  return rosters[classKey] || [];
}

export async function enrollStudentsInClass(classKey, newStudents = []) {
  const rosters = getLocal('class_rosters', {});
  const existing = rosters[classKey] || [];
  
  // Merge by id (roll number or email), avoiding duplicates
  const map = new Map();
  existing.forEach(s => map.set(s.id.toUpperCase(), s));
  newStudents.forEach(s => {
    if (s && s.id && s.name) {
      map.set(s.id.toUpperCase(), { ...s, id: s.id.toUpperCase(), enrolledAt: new Date().toISOString() });
    }
  });

  const updated = Array.from(map.values());
  rosters[classKey] = updated;
  setLocal('class_rosters', rosters);
  return updated;
}

export async function removeStudentFromClass(classKey, studentId) {
  const rosters = getLocal('class_rosters', {});
  const existing = rosters[classKey] || [];
  const updated = existing.filter(s => s.id.toUpperCase() !== studentId.toUpperCase());
  rosters[classKey] = updated;
  setLocal('class_rosters', rosters);
  return updated;
}

// ─── Seed Default Data (Instant execution) ───────────
export async function seedDefaultSubjectsAndClasses(userId) {
  const existing = getLocal('subjects').filter(s => !userId || s.userId === userId || s.user_id === userId);
  if (existing && existing.length > 0) return existing;

  const defaultSubs = [
    { id: 'sub-dsa', userId, name: 'Data Structures', emoji: '🌳', topicPreset: 'studio', gradient: 'var(--gradient-purple)', color: '#7C3AED', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 'sub-dbms', userId, name: 'Database Management Systems', emoji: '🗄️', topicPreset: 'studio', gradient: 'var(--gradient-blue)', color: '#2563EB', createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
    { id: 'sub-os', userId, name: 'Operating Systems', emoji: '💻', topicPreset: 'studio', gradient: 'var(--gradient-teal)', color: '#0D9488', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() }
  ];

  setLocal('subjects', defaultSubs);

  const sampleClasses = [
    {
      id: 'cls-dbms-norm', subjectId: 'sub-dbms',
      title: 'Database Normalization (1NF to 3NF)',
      date: new Date(Date.now() - 86400000).toISOString(), duration: 2720, status: 'completed',
      transcript: 'In today\'s lecture we discussed database normalization. First Normal Form requires atomic values. Second Normal Form eliminates partial dependencies. Third Normal Form removes transitive dependencies.',
      notes: [
        { id: 'n1', timestamp: 120, text: 'First Normal Form (1NF): Atomic values, unique records.', highlights: [] },
        { id: 'n2', timestamp: 450, text: 'Second Normal Form (2NF): No partial dependency on composite key.', highlights: [] },
        { id: 'n3', timestamp: 890, text: 'Third Normal Form (3NF): No transitive dependencies.', highlights: [] }
      ],
      summary: {
        overview: 'Database Normalization minimizes redundancy and prevents anomalies by progressing through 1NF, 2NF, and 3NF.',
        keyTakeaways: ['1NF ensures atomicity.', '2NF removes partial dependencies.', '3NF eliminates transitive dependencies.', 'BCNF enforces every determinant is a candidate key.'],
        cleanNotes: [{ text: 'Functional dependency constrains attribute relationships.', timestamp: 120 }, { text: 'Anomalies prevented: update, insertion, deletion.', timestamp: 450 }]
      },
      flashcards: [
        { id: '1', question: 'What violates 2NF?', answer: 'A partial dependency on a composite key.' },
        { id: '2', question: 'What is a transitive dependency?', answer: 'A non-key attribute depends on another non-key attribute.' }
      ]
    },
    {
      id: 'cls-dsa-trees', subjectId: 'sub-dsa',
      title: 'Stacks and Queues',
      date: new Date(Date.now() - 86400000 * 2).toISOString(), duration: 2295, status: 'completed',
      transcript: 'Stacks follow LIFO order. Queues follow FIFO order. Both support O(1) operations.',
      notes: [
        { id: 'n4', timestamp: 90, text: 'Stack: LIFO — push/pop in O(1). Used in recursion, undo ops.', highlights: [] },
        { id: 'n5', timestamp: 320, text: 'Queue: FIFO — enqueue/dequeue in O(1). Used in BFS, scheduling.', highlights: [] }
      ],
      summary: {
        overview: 'Stacks (LIFO) and Queues (FIFO) are fundamental linear data structures.',
        keyTakeaways: ['Stack push/pop are O(1).', 'Queue enqueue/dequeue are O(1).', 'BFS uses Queues.', 'DFS uses Stacks.']
      },
      flashcards: [
        { id: '1', question: 'What order do stacks follow?', answer: 'Last-In-First-Out (LIFO).' },
        { id: '2', question: 'Queue enqueue time complexity?', answer: 'O(1) constant time.' }
      ]
    },
    {
      id: 'cls-os-sync', subjectId: 'sub-os',
      title: 'Process Synchronization',
      date: new Date(Date.now() - 86400000 * 3).toISOString(), duration: 3130, status: 'completed',
      transcript: 'Process synchronization addresses the critical section problem. Semaphores and mutexes provide mutual exclusion.',
      notes: [
        { id: 'n6', timestamp: 100, text: 'Critical section requires mutual exclusion, progress, bounded waiting.', highlights: [] },
        { id: 'n7', timestamp: 400, text: 'Semaphores: wait() and signal() atomic operations.', highlights: [] }
      ],
      summary: {
        overview: 'Process synchronization ensures safe concurrent access to shared resources.',
        keyTakeaways: ['Mutual exclusion: one process in critical section at a time.', 'Deadlock: processes wait indefinitely for each other\'s resources.']
      },
      flashcards: [{ id: '1', question: 'Three requirements for critical section?', answer: 'Mutual exclusion, progress, bounded waiting.' }]
    },
    {
      id: 'cls-dbms-er', subjectId: 'sub-dbms',
      title: 'ER Model and Relationships',
      date: new Date(Date.now() - 86400000 * 4).toISOString(), duration: 2465, status: 'completed',
      transcript: 'Entity-Relationship modeling depicts conceptual database schemas using entities, attributes, and relationships.',
      notes: [
        { id: 'n8', timestamp: 150, text: 'Entity sets contain distinct objects described by attributes.', highlights: [] }
      ],
      summary: {
        overview: 'ER Modeling creates logical blueprints mapping entity relationships into relational tables.',
        keyTakeaways: ['Primary keys uniquely identify entities.', 'M:N relationships use junction tables.']
      },
      flashcards: [{ id: '1', question: 'How is M:N represented in SQL?', answer: 'Through an associative junction table with foreign keys to both entities.' }]
    }
  ];

  setLocal('classes', sampleClasses);
  return defaultSubs;
}
