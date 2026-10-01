-- Supabase Schema for LectureAI
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- 1. profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. subjects table (uses TEXT ids like 'sub-dsa-userId')
CREATE TABLE public.subjects (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT,
  topic_preset TEXT,
  gradient TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own subjects" ON public.subjects FOR ALL USING (auth.uid() = user_id);

-- 3. classes table (uses TEXT ids like 'cls-dbms-norm-userId')
CREATE TABLE public.classes (
  id TEXT PRIMARY KEY,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
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
CREATE POLICY "Users can manage classes of their subjects" ON public.classes 
  FOR ALL USING (
    subject_id IN (SELECT id FROM public.subjects WHERE user_id = auth.uid())
  );

-- 4. schedules table
CREATE TABLE public.schedules (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own schedules" ON public.schedules FOR ALL USING (auth.uid() = user_id);

-- 5. resources table
CREATE TABLE public.resources (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT,
  url TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own resources" ON public.resources FOR ALL USING (auth.uid() = user_id);

-- 6. Storage bucket for audio recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-recordings', 'audio-recordings', true) ON CONFLICT DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Anyone can upload audio" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'audio-recordings');
CREATE POLICY "Anyone can view audio" ON storage.objects FOR SELECT 
  USING (bucket_id = 'audio-recordings');
