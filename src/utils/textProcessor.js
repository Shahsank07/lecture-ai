/* Text Processor — converts raw transcript into structured notes */

// Filler words to remove
const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'basically', 'actually',
  'sort of', 'kind of', 'I mean', 'right', 'okay so',
  'well', 'so yeah', 'you see'
];

/**
 * Clean up a raw transcript string by removing filler words
 * and normalizing whitespace.
 */
export function cleanTranscript(text) {
  let cleaned = text;
  FILLER_WORDS.forEach((filler) => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '');
  });
  // Remove extra spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  return cleaned;
}

/**
 * Split a transcript into sentences. Uses punctuation and
 * natural pause indicators.
 */
export function splitIntoSentences(text) {
  if (!text || !text.trim()) return [];

  // Split on sentence-ending punctuation
  const sentences = text
    .replace(/([.!?])\s+/g, '$1|SPLIT|')
    .split('|SPLIT|')
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  // If no punctuation was found, split on commas or at ~100 char intervals
  if (sentences.length <= 1 && text.length > 80) {
    return splitByLength(text, 100);
  }

  return sentences;
}

/**
 * Split long text into chunks of roughly `maxLen` characters,
 * preferring to split at word boundaries.
 */
function splitByLength(text, maxLen) {
  const words = text.split(/\s+/);
  const chunks = [];
  let current = '';

  words.forEach((word) => {
    if ((current + ' ' + word).trim().length > maxLen && current) {
      chunks.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  });

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

/**
 * Capitalize the first letter of a string.
 */
function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a raw transcript chunk into a note point object.
 */
export function createNotePoint(text, timestamp, id) {
  const cleaned = cleanTranscript(text);
  let formatted = capitalize(cleaned);

  // Ensure it ends with punctuation
  if (formatted && !/[.!?]$/.test(formatted)) {
    formatted += '.';
  }

  return {
    id,
    text: formatted,
    timestamp,
    isEdited: false,
    highlights: [],
  };
}

/**
 * Process accumulated transcript text into an array of note points.
 * Called when existing transcript grows enough to form new points.
 */
export function processTranscriptToNotes(transcript, startTimestamp = 0) {
  const sentences = splitIntoSentences(transcript);
  return sentences.map((sentence, i) => {
    return createNotePoint(
      sentence,
      startTimestamp + i * 5, // approximate timestamps
      `note-${Date.now()}-${i}`
    );
  });
}
