-- Supabase Schema for LectureAI
-- Copy and run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ljawkcymrhtxlmjsmutn/sql/new

-- 1. profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('faculty', 'student')),
  institution TEXT,
  department TEXT,
  subject TEXT,
  semester TEXT,
  phone TEXT,
  avatar TEXT,
  classes_count INTEGER DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  enrolled_classes_count INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their profile" ON public.profiles FOR UPDATE USING (true);

-- Pre-seed demo user profiles so demo logins never fail foreign key checks
INSERT INTO public.profiles (id, name, email, role, department, classes_count, students_count)
VALUES 
  ('a1111111-1111-4111-a111-111111111111', 'Dr. Alex Johnson', 'alex.johnson@university.edu', 'faculty', 'Computer Science', 5, 142),
  ('b2222222-2222-4222-b222-222222222222', 'Arjun Sharma', 'arjun.sharma@university.edu', 'student', 'Computer Science', 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Trigger to auto-create profile on Supabase auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'role')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  emoji TEXT,
  topic_preset TEXT,
  gradient TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage subjects" ON public.subjects FOR ALL USING (true);

-- 3. classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  subject_id TEXT,
  title TEXT NOT NULL,
  date TIMESTAMPTZ,
  duration INTEGER DEFAULT 0,
  status TEXT,
  transcript TEXT,
  notes JSONB DEFAULT '[]'::jsonb,
  summary JSONB DEFAULT '{}'::jsonb,
  flashcards JSONB DEFAULT '[]'::jsonb,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage classes" ON public.classes FOR ALL USING (true);

-- 4. schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
  id TEXT PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  subject_id TEXT,
  scheduled_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage schedules" ON public.schedules FOR ALL USING (true);

-- 5. resources table
CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  type TEXT,
  url TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage resources" ON public.resources FOR ALL USING (true);

-- 6. Storage bucket for audio recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-recordings', 'audio-recordings', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Public audio upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio-recordings');
CREATE POLICY "Public audio view" ON storage.objects FOR SELECT USING (bucket_id = 'audio-recordings');
