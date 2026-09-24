import { getUserByEmail, saveUser } from './db';
import { generateId } from './utils/helpers';

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

// Seed demo users into storage on initial load
async function ensureDemoUsers() {
  try {
    const existingFaculty = await getUserByEmail(DEMO_FACULTY.email);
    if (!existingFaculty) {
      await saveUser({ ...DEMO_FACULTY, password: 'password123' });
    }
    const existingStudent = await getUserByEmail(DEMO_STUDENT.email);
    if (!existingStudent) {
      await saveUser({ ...DEMO_STUDENT, password: 'password123' });
    }
  } catch (err) {
    console.warn('Could not preseed demo accounts in DB:', err);
  }
}
ensureDemoUsers();

// Simple session management using localStorage
export function getCurrentUser() {
  const user = localStorage.getItem('vn_user');
  if (!user) return null;
  try {
    const parsed = JSON.parse(user);
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

  // Fast path for demo accounts
  if (cleanEmail === DEMO_FACULTY.email.toLowerCase()) {
    setCurrentUser(DEMO_FACULTY);
    return DEMO_FACULTY;
  }
  if (cleanEmail === DEMO_STUDENT.email.toLowerCase()) {
    setCurrentUser(DEMO_STUDENT);
    return DEMO_STUDENT;
  }

  const user = await getUserByEmail(cleanEmail);
  if (!user) {
    throw new Error('No account found with this email. Please register or use Quick Demo.');
  }

  if (user.password && user.password !== password) {
    throw new Error('Invalid password. Please try again.');
  }

  const { password: _, ...userSafe } = user;
  setCurrentUser(userSafe);
  return userSafe;
}

export async function loginAsDemo(role = 'faculty') {
  const user = role === 'faculty' ? DEMO_FACULTY : DEMO_STUDENT;
  setCurrentUser(user);
  return user;
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
  const existing = await getUserByEmail(cleanEmail);
  if (existing) {
    throw new Error('An account with this email already exists');
  }

  const newUser = {
    id: generateId(),
    name: details.name || 'User',
    email: cleanEmail,
    password: details.password || 'password123',
    role: details.role || 'student',
    institution: details.institution || 'University',
    department: details.department || 'Computer Science',
    subject: details.subject || '',
    semester: details.semester || '6th Semester',
    phone: details.phone || '',
    avatar: details.role === 'faculty' ? DEMO_FACULTY.avatar : DEMO_STUDENT.avatar,
    createdAt: new Date().toISOString()
  };

  await saveUser(newUser);

  const { password: _, ...userSafe } = newUser;
  setCurrentUser(userSafe);
  return userSafe;
}

export function logout() {
  setCurrentUser(null);
  window.location.reload();
}