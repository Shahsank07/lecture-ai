/* 
  Topic Themes Utility
  Provides topic-specific background pictures, accent colors, gradients, and tags.
*/

export const TOPIC_PRESETS = [
  {
    id: 'science',
    name: 'Science & Physics',
    keywords: ['physics', 'science', 'quantum', 'chemistry', 'astronomy', 'lab'],
    bgImage: '/topics/science.jpg',
    accentColor: '#00F2FE',
    secondaryColor: '#4FACFE',
    glowColor: 'rgba(0, 242, 254, 0.4)',
    gradient: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)',
    tag: 'PHYSICS & SCIENCE',
    icon: 'Atom'
  },
  {
    id: 'math',
    name: 'Mathematics & Calculus',
    keywords: ['math', 'mathematics', 'calculus', 'algebra', 'geometry', 'statistics', 'equation'],
    bgImage: '/topics/math.jpg',
    accentColor: '#FFB800',
    secondaryColor: '#F59E0B',
    glowColor: 'rgba(255, 184, 0, 0.4)',
    gradient: 'linear-gradient(135deg, rgba(255, 184, 0, 0.25) 0%, rgba(217, 119, 6, 0.2) 100%)',
    tag: 'CALCULUS & ALGEBRA',
    icon: 'Sigma'
  },
  {
    id: 'coding',
    name: 'Computer Science',
    keywords: ['coding', 'computer', 'programming', 'code', 'software', 'python', 'java', 'web', 'data'],
    bgImage: '/topics/coding.jpg',
    accentColor: '#10B981',
    secondaryColor: '#059669',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%)',
    tag: 'COMPUTER SCIENCE',
    icon: 'Code2'
  },
  {
    id: 'biology',
    name: 'Biology & Medicine',
    keywords: ['biology', 'bio', 'medicine', 'genetics', 'anatomy', 'health', 'dna', 'nature'],
    bgImage: '/topics/biology.jpg',
    accentColor: '#EC4899',
    secondaryColor: '#D946EF',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(139, 92, 246, 0.2) 100%)',
    tag: 'GENETICS & LIFE',
    icon: 'Dna'
  },
  {
    id: 'history',
    name: 'History & Arts',
    keywords: ['history', 'art', 'literature', 'english', 'social', 'civics', 'culture', 'philosophy'],
    bgImage: '/topics/history.jpg',
    accentColor: '#8B5CF6',
    secondaryColor: '#6366F1',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(236, 72, 153, 0.2) 100%)',
    tag: 'WORLD HISTORY & ARTS',
    icon: 'BookOpen'
  },
  {
    id: 'studio',
    name: 'General & Studio',
    keywords: ['general', 'study', 'lecture', 'notes', 'other'],
    bgImage: '/topics/studio.jpg',
    accentColor: '#A855F7',
    secondaryColor: '#7C3AED',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(59, 130, 246, 0.2) 100%)',
    tag: 'STUDIO LEARNING',
    icon: 'Sparkles'
  }
];

export function getTopicPreset(topicIdOrName) {
  if (!topicIdOrName) return TOPIC_PRESETS[5]; // default studio
  const str = topicIdOrName.toLowerCase();
  
  // Direct match by ID
  const directMatch = TOPIC_PRESETS.find(p => p.id === str);
  if (directMatch) return directMatch;

  // Keyword search
  const found = TOPIC_PRESETS.find(p => 
    p.keywords.some(k => str.includes(k)) || p.name.toLowerCase().includes(str)
  );

  return found || TOPIC_PRESETS[5];
}
