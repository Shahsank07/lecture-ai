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

export async function getAllSubjects(userId) {
  const allLocal = getLocal('subjects');
  let localSubs = allLocal.filter(s => !userId || s.userId === userId || s.user_id === userId);
  if (localSubs.length === 0 && allLocal.length > 0) {
    localSubs = allLocal;
  }
  
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

const MOCK_CLASS_IDS = new Set(['cls-dbms-norm', 'cls-dsa-trees', 'cls-os-sync', 'cls-dbms-er', 'lec-1', 'lec-2', 'lec-3', 'lec-4']);

export async function getClass(id) {
  if (MOCK_CLASS_IDS.has(id)) return null;
  const local = getLocal('classes').filter(c => !MOCK_CLASS_IDS.has(c.id)).find(c => c.id === id || c.id?.startsWith(id) || id?.startsWith(c.id));
  if (local) return local; // Instant return

  try {
    const { data, error } = await withTimeout(
      supabase.from('classes').select('*').eq('id', id).single(),
      800
    );
    if (!error && data && !MOCK_CLASS_IDS.has(data.id)) {
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
  return getLocal('classes').filter(c => !MOCK_CLASS_IDS.has(c.id) && (c.subjectId === subjectId || c.subject_id === subjectId)).length;
}

export async function getAllClasses() {
  const local = getLocal('classes').filter(c => !MOCK_CLASS_IDS.has(c.id));
  if (local.length > 0) return local; // Instant return

  try {
    const { data, error } = await withTimeout(
      supabase.from('classes').select('*').order('date', { ascending: false }),
      800
    );
    if (!error && data && data.length > 0) {
      return data
        .map(cls => ({ ...cls, subjectId: cls.subject_id, audioUrl: cls.audio_url, createdAt: cls.created_at }))
        .filter(c => !MOCK_CLASS_IDS.has(c.id));
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
  return defaultSubs;
}

// ─── Announcements ───────────────────────────────────
export async function getAllAnnouncements(user) {
  const local = getLocal('announcements');
  return local;
}

export async function saveAnnouncement(announcement) {
  if (!announcement.id) announcement.id = 'ann-' + Date.now();
  if (!announcement.date) announcement.date = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  if (!announcement.time) announcement.time = 'Just now';
  if (!announcement.createdAt) announcement.createdAt = new Date().toISOString();
  if (!announcement.color) announcement.color = '#F59E0B';
  if (!announcement.badgeClass) announcement.badgeClass = 'amber-badge';
  if (!announcement.category) announcement.category = 'department';
  if (!announcement.categoryLabel) announcement.categoryLabel = 'Notice';
  if (!announcement.author) announcement.author = 'Faculty Instructor';

  const local = getLocal('announcements');
  const idx = local.findIndex(a => a.id === announcement.id);
  if (idx >= 0) {
    local[idx] = { ...local[idx], ...announcement };
  } else {
    local.unshift(announcement);
  }
  setLocal('announcements', local);
  return announcement;
}

export async function deleteAnnouncement(id) {
  const local = getLocal('announcements').filter(a => a.id !== id);
  setLocal('announcements', local);
}

// ─── Bookmarks ───────────────────────────────────────
export async function getAllBookmarks(userId) {
  const local = getLocal('bookmarks');
  if (!userId) return local;
  return local.filter(b => !b.userId || b.userId === userId);
}

export async function toggleBookmark(item, userId) {
  const local = getLocal('bookmarks');
  const existingIdx = local.findIndex(b => b.id === item.id);
  if (existingIdx >= 0) {
    local.splice(existingIdx, 1);
    setLocal('bookmarks', local);
    return false; // unbookmarked
  } else {
    const newBookmark = {
      ...item,
      userId: userId || 'student-arjun-sharma',
      savedAt: new Date().toISOString()
    };
    local.unshift(newBookmark);
    setLocal('bookmarks', local);
    return true; // bookmarked
  }
}

export async function isBookmarked(itemId, userId) {
  const local = getLocal('bookmarks');
  return local.some(b => b.id === itemId && (!userId || !b.userId || b.userId === userId));
}

export async function deleteBookmark(id) {
  const local = getLocal('bookmarks').filter(b => b.id !== id);
  setLocal('bookmarks', local);
}
