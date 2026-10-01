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

// Seed demo users into Auth and Profiles
async function ensureDemoUsers() {
  try {
    const demos = [DEMO_FACULTY, DEMO_STUDENT];
    
    for (const demo of demos) {
      // 1. Try to sign up demo user in auth
      const { data, error } = await supabase.auth.signUp({
        email: demo.email,
        password: 'password123',
        options: {
          data: {
            name: demo.name,
            role: demo.role
          }
        }
      });
      
      // We ignore error here since it likely just means user already exists
      
      // 2. Ensure profile exists and has full demo data
      // (The trigger handles basic profile creation, but we want full data)
      const existingProfile = await getUserByEmail(demo.email);
      if (existingProfile) {
        await saveUser({ ...existingProfile, ...demo });
      }
    }
  } catch (err) {
    console.warn('Could not preseed demo accounts in DB:', err);
  }
}
ensureDemoUsers();

export function getCurrentUser() {
  const userStr = localStorage.getItem('vn_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
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

  // Fast path for demo accounts - still use supabase auth under the hood if possible
  if (cleanEmail === DEMO_FACULTY.email.toLowerCase()) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: 'password123' });
    if (!error) {
      const user = await getUserByEmail(cleanEmail) || DEMO_FACULTY;
      setCurrentUser(user);
      return user;
    }
  }
  if (cleanEmail === DEMO_STUDENT.email.toLowerCase()) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: 'password123' });
    if (!error) {
      const user = await getUserByEmail(cleanEmail) || DEMO_STUDENT;
      setCurrentUser(user);
      return user;
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password
  });

  if (error) {
    throw new Error('Invalid credentials. Please try again.');
  }

  // Fetch complete profile from public.profiles
  const userProfile = await getUserByEmail(cleanEmail);
  if (!userProfile) {
    throw new Error('Profile not found.');
  }

  setCurrentUser(userProfile);
  return userProfile;
}

export async function loginAsDemo(role = 'faculty') {
  const demoUser = role === 'faculty' ? DEMO_FACULTY : DEMO_STUDENT;
  return await login(demoUser.email, 'password123');
}

export async function signup(userData) {
  let details = {};
  if (typeof userData === 'string') {
    details = {
      name: arguments[0],
      email: arguments[1],
      password: arguments[2],
      role: 'student'
    };
  } else {
    details = { ...userData };
  }

  const cleanEmail = (details.email || '').trim().toLowerCase();
  
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: details.password || 'password123',
    options: {
      data: {
        name: details.name || 'User',
        role: details.role || 'student'
      }
    }
  });

  if (error) {
    throw new Error(error.message || 'Error signing up');
  }
  
  const user = data.user;
  if (!user) {
    throw new Error('Signup failed');
  }

  // Allow trigger time to run, then update with extra info
  const newUserProfile = {
    id: user.id,
    name: details.name || 'User',
    email: cleanEmail,
    role: details.role || 'student',
    institution: details.institution || 'University',
    department: details.department || 'Computer Science',
    subject: details.subject || '',
    semester: details.semester || '6th Semester',
    phone: details.phone || '',
    avatar: details.role === 'faculty' ? DEMO_FACULTY.avatar : DEMO_STUDENT.avatar,
  };
  
  // Wait brief moment for trigger to insert row, then update
  await new Promise(r => setTimeout(r, 1000));
  await saveUser(newUserProfile);

  setCurrentUser(newUserProfile);
  
  // Send welcome email via our backend
  try {
    fetch('/api/email/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, name: newUserProfile.name })
    });
  } catch (e) {
    console.error("Failed to send welcome email", e);
  }
  
  return newUserProfile;
}

export async function logout() {
  await supabase.auth.signOut();
  setCurrentUser(null);
  window.location.reload();
}

// Setup auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_OUT') {
    setCurrentUser(null);
  } else if (event === 'SIGNED_IN' && session) {
    const userProfile = await getUserByEmail(session.user.email);
    if (userProfile) {
      setCurrentUser(userProfile);
    }
  }
});