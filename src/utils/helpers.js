/* Helper utilities */

/**
 * Generate a simple UUID v4.
 */
export function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
}

/**
 * Format seconds into MM:SS or HH:MM:SS.
 */
export function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format a Date object into a readable string.
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return 'Today, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  if (days === 1) {
    return 'Yesterday, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  if (days < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Subject gradient presets.
 */
export const SUBJECT_GRADIENTS = [
  { id: 'purple', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#7c3aed' },
  { id: 'blue', gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)', color: '#3b82f6' },
  { id: 'teal', gradient: 'linear-gradient(135deg, #14b8a6, #06b6d4)', color: '#14b8a6' },
  { id: 'pink', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)', color: '#ec4899' },
  { id: 'orange', gradient: 'linear-gradient(135deg, #f97316, #eab308)', color: '#f97316' },
  { id: 'emerald', gradient: 'linear-gradient(135deg, #10b981, #34d399)', color: '#10b981' },
  { id: 'rose', gradient: 'linear-gradient(135deg, #f43f5e, #fb7185)', color: '#f43f5e' },
  { id: 'indigo', gradient: 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#6366f1' },
];

/**
 * Subject emoji presets.
 */
export const SUBJECT_EMOJIS = [
  '📚', '🔬', '🧮', '🎨', '🌍', '💻', '📐', '🧪',
  '📖', '🎵', '⚡', '🏛️', '🧬', '📊', '🌱', '🔭',
];
