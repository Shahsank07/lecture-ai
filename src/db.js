import { supabase } from './supabaseClient';

// ─── Subjects ─────────────────────────────────────────
export async function getAllSubjects(userId) {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    // Map snake_case to camelCase
    return data.map(sub => ({
      ...sub,
      userId: sub.user_id,
      topicPreset: sub.topic_preset,
      createdAt: sub.created_at
    }));
  } catch (err) {
    console.error('getAllSubjects error:', err);
    return [];
  }
}

export async function getSubject(id) {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return {
      ...data,
      userId: data.user_id,
      topicPreset: data.topic_preset,
      createdAt: data.created_at
    };
  } catch (err) {
    console.error('getSubject error:', err);
    return null;
  }
}

export async function saveSubject(subject) {
  try {
    const payload = {
      id: subject.id,
      user_id: subject.userId,
      name: subject.name,
      emoji: subject.emoji,
      topic_preset: subject.topicPreset,
      gradient: subject.gradient,
      color: subject.color,
      created_at: subject.createdAt || new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('subjects')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return { ...data, userId: data.user_id, topicPreset: data.topic_preset, createdAt: data.created_at };
  } catch (err) {
    console.error('saveSubject error:', err);
    return null;
  }
}

export async function deleteSubject(id) {
  try {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('deleteSubject error:', err);
  }
}

// ─── Classes ──────────────────────────────────────────
export async function getClassesBySubject(subjectId) {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('subject_id', subjectId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data.map(cls => ({
      ...cls,
      subjectId: cls.subject_id,
      audioUrl: cls.audio_url,
      createdAt: cls.created_at
    }));
  } catch (err) {
    console.error('getClassesBySubject error:', err);
    return [];
  }
}

export async function getClass(id) {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return {
      ...data,
      subjectId: data.subject_id,
      audioUrl: data.audio_url,
      createdAt: data.created_at
    };
  } catch (err) {
    console.error('getClass error:', err);
    return null;
  }
}

export async function saveClass(cls) {
  try {
    let audioUrl = cls.audioUrl || cls.audio_url;

    if (cls.audioBlob && cls.audioBlob instanceof Blob) {
      const fileName = `audio-${cls.id}-${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-recordings')
        .upload(fileName, cls.audioBlob, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Audio upload error:', uploadError);
      } else if (uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('audio-recordings')
          .getPublicUrl(fileName);
        audioUrl = publicUrlData.publicUrl;
      }
    }

    const payload = {
      id: cls.id,
      subject_id: cls.subjectId,
      title: cls.title,
      date: cls.date,
      duration: cls.duration,
      status: cls.status,
      transcript: cls.transcript,
      notes: cls.notes || [],
      summary: cls.summary || {},
      flashcards: cls.flashcards || [],
      audio_url: audioUrl,
      created_at: cls.createdAt || new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('classes')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    
    // If it's a new class or status just changed to complete, trigger email if there's students
    // We could do this securely on the backend, but we'll do a simple fetch here for the frontend integration
    if (cls.status === 'completed' && cls.title) {
       // Optional: Fire and forget email notification
       try {
         fetch('/api/email/class-notification', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ 
             classTitle: cls.title, 
             subjectId: cls.subjectId
           })
         });
       } catch (e) {
         // ignore
       }
    }
    
    return { ...data, subjectId: data.subject_id, audioUrl: data.audio_url, createdAt: data.created_at };
  } catch (err) {
    console.error('saveClass error:', err);
    return null;
  }
}

export async function deleteClass(id) {
  try {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('deleteClass error:', err);
  }
}

export async function getClassCount(subjectId) {
  try {
    const { count, error } = await supabase
      .from('classes')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', subjectId);
    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('getClassCount error:', err);
    return 0;
  }
}

export async function getAllClasses() {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data.map(cls => ({
      ...cls,
      subjectId: cls.subject_id,
      audioUrl: cls.audio_url,
      createdAt: cls.created_at
    }));
  } catch (err) {
    console.error('getAllClasses error:', err);
    return [];
  }
}

// ─── Users ──────────────────────────────────────────
export async function saveUser(user) {
  try {
    const payload = {
      id: user.id,
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
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    
    return {
      ...data,
      classesCount: data.classes_count,
      studentsCount: data.students_count,
      enrolledClassesCount: data.enrolled_classes_count,
      progressPercentage: data.progress_percentage
    };
  } catch (err) {
    console.error('saveUser error:', err);
    return null;
  }
}

export async function getUserByEmail(email) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      ...data,
      classesCount: data.classes_count,
      studentsCount: data.students_count,
      enrolledClassesCount: data.enrolled_classes_count,
      progressPercentage: data.progress_percentage
    };
  } catch (err) {
    console.error('getUserByEmail error:', err);
    return null;
  }
}

// ─── Schedules ───────────────────────────────────────
export async function getSchedules() {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('scheduled_date', { ascending: true });
    if (error) throw error;
    return data.map(s => ({
      ...s,
      userId: s.user_id,
      subjectId: s.subject_id,
      scheduledDate: s.scheduled_date,
      createdAt: s.created_at
    }));
  } catch (err) {
    console.error('getSchedules error:', err);
    return [];
  }
}

export async function saveSchedule(schedule) {
  try {
    const payload = {
      id: schedule.id,
      user_id: schedule.userId,
      title: schedule.title,
      subject_id: schedule.subjectId,
      scheduled_date: schedule.scheduledDate,
      created_at: schedule.createdAt || new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('schedules')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return { ...data, userId: data.user_id, subjectId: data.subject_id, scheduledDate: data.scheduled_date, createdAt: data.created_at };
  } catch (err) {
    console.error('saveSchedule error:', err);
    return null;
  }
}

export async function deleteSchedule(id) {
  try {
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('deleteSchedule error:', err);
  }
}

// ─── Resources ───────────────────────────────────────
export async function getAllSavedResources() {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(r => ({
      ...r,
      userId: r.user_id,
      createdAt: r.created_at
    }));
  } catch (err) {
    console.error('getAllSavedResources error:', err);
    return [];
  }
}

export async function saveResource(resource) {
  try {
    const payload = {
      id: resource.id,
      user_id: resource.userId,
      title: resource.title,
      type: resource.type,
      url: resource.url,
      content: resource.content,
      created_at: resource.createdAt || new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('resources')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return { ...data, userId: data.user_id, createdAt: data.created_at };
  } catch (err) {
    console.error('saveResource error:', err);
    return null;
  }
}

export async function deleteSavedResource(id) {
  try {
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('deleteSavedResource error:', err);
  }
}

export async function seedDefaultSubjectsAndClasses(userId) {
  const existing = await getAllSubjects(userId);
  if (existing && existing.length > 0) return existing;

  const defaultSubs = [
    {
      id: 'sub-dsa-' + userId,
      userId,
      name: 'Data Structures',
      emoji: '🌳',
      topicPreset: 'studio',
      gradient: 'var(--gradient-purple)',
      color: '#7C3AED',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'sub-dbms-' + userId,
      userId,
      name: 'Database Management Systems',
      emoji: '🗄️',
      topicPreset: 'studio',
      gradient: 'var(--gradient-blue)',
      color: '#2563EB',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'sub-os-' + userId,
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
      id: 'cls-dbms-norm-' + userId,
      subjectId: 'sub-dbms-' + userId,
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
      id: 'cls-dsa-trees-' + userId,
      subjectId: 'sub-dsa-' + userId,
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
