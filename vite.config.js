import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const FALLBACK_URL = 'https://ljawkcymrhtxlmjsmutn.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYXdrY3ltcmh0eGxtanNtdXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjE3MDksImV4cCI6MjEwNjQzNzcwOX0.032xnT3Lkfp4ny48GsuyWPOpLOIK9DuT-YBL-ZUtPXQ';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || FALLBACK_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY),
  }
});
