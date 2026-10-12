import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://ljawkcymrhtxlmjsmutn.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYXdrY3ltcmh0eGxtanNtdXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjE3MDksImV4cCI6MjEwNjQzNzcwOX0.032xnT3Lkfp4ny48GsuyWPOpLOIK9DuT-YBL-ZUtPXQ';

// Safe environment variable lookup (Vite production + Vercel fallbacks)
const getEnvVar = (key) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch {}
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || FALLBACK_URL;
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || FALLBACK_ANON_KEY;

let client;
try {
  client = createClient(supabaseUrl, supabaseAnonKey);
} catch (err) {
  console.warn('Supabase client initialization warning:', err);
  client = createClient(FALLBACK_URL, FALLBACK_ANON_KEY);
}

export const supabase = client;
