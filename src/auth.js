import { supabase } from './supabaseClient';
import { getUserByEmail, saveUser } from './db';

// Default seeded demo accounts matching the screenshots
export const DEMO_FACULTY = {
  id: 'faculty-alex-johnson',
  name: 'Dr. Alex Johnson',
  email: 'alex.johnson@university.edu',
  role: 'faculty',
  institution: 'Massachusetts Institute of Technology',
  department: 'Computer Science',
  subject: 'Data Structures & Algorithms',
  phone: '+1 (555) 234-5678',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  title: 'Professor of Computer Science',
  classesCount: 5,
  studentsCount: 142
};

export const DEMO_STUDENT = {
  id: 'student-arjun-sharma',
  name: 'Arjun Sharma',
  email: 'arjun.sharma@university.edu',
  role: 'student',
  institution: 'Massachusetts Institute of Technology',
  department: 'Computer Science',
  semester: '6th Semester',
  phone: '+1 (555) 987-6543',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  enrolledClassesCount: 5,
  progressPercentage: 75
};

// Helper to check if an ID is a demo user
function isDemoUser(userId) {
  return userId === DEMO_FACULTY.id || userId === DEMO_STUDENT.id;
}

// Seed demo users (non-blocking, best-effort)
async function ensureDemoUsers() {
  try {
    for (const demo of [DEMO_FACULTY, DEMO_STUDENT]) {
      try {
        await supabase.auth.signUp({
          email: demo.email,
          password: 'password123',
          options: { data: { name: demo.name, role: demo.role } }
        });
      } catch {}
      try {
        const existing = await getUserByEmail(demo.email);
        if (existing) {
          await saveUser({ ...existing, ...demo });
        } else {
          await saveUser(demo);
        }
      } catch {}
    }
  } catch (err) {
    console.warn('Could not preseed demo accounts:', err);
  }
}
setTimeout(() => ensureDemoUsers(), 500);

// Simple session management using localStorage
export function getCurrentUser() {
  const userStr = localStorage.getItem('vn_user');
  if (!userStr) return null;
  try {
    const parsed = JSON.parse(userStr);
    if (!parsed) return null;
    if (!parsed.role) {
      parsed.role = (parsed.email && parsed.email.includes('student')) ? 'student' : 'faculty';
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('vn_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('vn_user');
  }
}

export async function login(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();

  // Demo faculty — always works even if Supabase is down
  if (cleanEmail === DEMO_FACULTY.email.toLowerCase()) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: password || 'password123' });
      if (!error) {
        const user = await getUserByEmail(cleanEmail) || DEMO_FACULTY;
        setCurrentUser(user);
        return user;
      }
    } catch {}
    // Fallback — demo login always succeeds
    setCurrentUser(DEMO_FACULTY);
    try { await saveUser(DEMO_FACULTY); } catch {}
    return DEMO_FACULTY;
  }

  // Demo student — always works even if Supabase is down
  if (cleanEmail === DEMO_STUDENT.email.toLowerCase()) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: password || 'password123' });
      if (!error) {
        const user = await getUserByEmail(cleanEmail) || DEMO_STUDENT;
        setCurrentUser(user);
        return user;
      }
    } catch {}
    setCurrentUser(DEMO_STUDENT);
    try { await saveUser(DEMO_STUDENT); } catch {}
    return DEMO_STUDENT;
  }

  // Real user login
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) {
      // Try local profile fallback
      const localProfile = await getUserByEmail(cleanEmail);
      if (localProfile) {
        setCurrentUser(localProfile);
        return localProfile;
      }
      throw new Error('Invalid credentials. Please try again.');
    }

    const userProfile = await getUserByEmail(cleanEmail);
    if (!userProfile) {
      // Create minimal profile from auth data
      const fallbackUser = {
        id: data?.user?.id || cleanEmail.replace(/[^a-zA-Z0-9]/g, '_'),
        name: data?.user?.user_metadata?.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: data?.user?.user_metadata?.role || 'student'
      };
      setCurrentUser(fallbackUser);
      return fallbackUser;
    }

    setCurrentUser(userProfile);
    return userProfile;
  } catch (err) {
    // Last resort: check local storage
    const localProfile = await getUserByEmail(cleanEmail);
    if (localProfile) {
      setCurrentUser(localProfile);
      return localProfile;
    }
    throw new Error(err.message || 'Login failed.');
  }
}

export async function loginAsDemo(role = 'faculty') {
  const demoUser = role === 'faculty' ? DEMO_FACULTY : DEMO_STUDENT;
  try {
    return await login(demoUser.email, 'password123');
  } catch {
    // Demo login ALWAYS succeeds
    setCurrentUser(demoUser);
    return demoUser;
  }
}

export async function signup(userData) {
  let details = {};
  if (typeof userData === 'string') {
    details = { name: arguments[0], email: arguments[1], password: arguments[2], role: 'student' };
  } else {
    details = { ...userData };
  }

  const cleanEmail = (details.email || '').trim().toLowerCase();
  let createdUser = null;

  // Try Supabase auth signup
  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: details.password || 'password123',
      options: { data: { name: details.name || 'User', role: details.role || 'student' } }
    });
    if (!error && data?.user) createdUser = data.user;
  } catch (e) {
    console.warn('Supabase signup fallback:', e);
  }

  const userId = createdUser?.id || ('usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
  const newUserProfile = {
    id: userId,
    name: details.name || 'User',
    email: cleanEmail,
    role: details.role || 'student',
    institution: details.institution || 'University',
    department: details.department || 'Computer Science',
    subject: details.subject || '',
    semester: details.semester || '6th Semester',
    phone: details.phone || '',
    avatar: details.role === 'faculty' ? DEMO_FACULTY.avatar : DEMO_STUDENT.avatar,
    classesCount: details.role === 'faculty' ? 1 : 0,
    studentsCount: details.role === 'faculty' ? 40 : 0,
    enrolledClassesCount: details.role === 'student' ? 4 : 0,
    progressPercentage: 50
  };

  try { await saveUser(newUserProfile); } catch (err) { console.warn('Save profile warning:', err); }
  setCurrentUser(newUserProfile);

  // Send welcome email (fire and forget)
  try {
    fetch('/api/email/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, name: newUserProfile.name })
    }).catch(() => {});
  } catch {}

  return newUserProfile;
}

export async function logout() {
  try { await supabase.auth.signOut(); } catch (e) { console.warn('Sign out warning:', e); }
  setCurrentUser(null);
  window.location.reload();
}

// Auth state listener — does NOT wipe demo sessions
try {
  supabase.auth.onAuthStateChange(async (event, session) => {
    try {
      const current = getCurrentUser();
      if (event === 'SIGNED_OUT') {
        // Never wipe demo users on auth state change
        if (current && isDemoUser(current.id)) return;
        setCurrentUser(null);
      } else if (event === 'SIGNED_IN' && session?.user) {
        const userProfile = await getUserByEmail(session.user.email);
        if (userProfile) setCurrentUser(userProfile);
      }
    } catch (err) {
      console.warn('onAuthStateChange error:', err);
    }
  });
} catch (e) {
  console.warn('Could not register auth listener:', e);
}