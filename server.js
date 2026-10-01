/**
 * Minimal backend proxy for VoiceNotes AI
 * - Proxies Grok API calls (keeps API key server-side)
 * - Handles password hashing for authentication
 * - Serves Vite dev server in development, static files in production
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 5173;
const GROK_API_KEY = process.env.GROK_API_KEY || '';
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-3-mini';

// In-memory user store (in production, use a real database)
const users = new Map();

// Password hashing using Web Crypto API (PBKDF2)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.randomBytes(16);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return {
    hash: Buffer.from(hash).toString('base64'),
    salt: salt.toString('base64')
  };
}

async function verifyPassword(password, storedHash, storedSalt) {
  const encoder = new TextEncoder();
  const salt = Buffer.from(storedSalt, 'base64');
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const computedHash = Buffer.from(hash).toString('base64');
  return computedHash === storedHash;
}

// Middleware
app.use(express.json({ limit: '10mb' }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email endpoints
app.post('/api/email/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const { data, error } = await resend.emails.send({
      from: 'LectureAI <onboarding@resend.dev>', // Using Resend test domain
      to: email,
      subject: 'Welcome to LectureAI',
      html: `
        <h1>Welcome to LectureAI, ${name}!</h1>
        <p>We're thrilled to have you on board. With LectureAI, you can record lectures, get AI-powered summaries, and generate flashcards instantly.</p>
        <br>
        <p>Best,<br>The LectureAI Team</p>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error });
    }

    res.status(200).json({ data });
  } catch (err) {
    console.error('Welcome email error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/email/class-notification', async (req, res) => {
  try {
    const { classTitle, subjectId, recipientEmails } = req.body;
    if (!classTitle) {
      return res.status(400).json({ error: 'Class title is required' });
    }

    // In a real app, you would fetch students enrolled in subjectId
    // Here we'll just use the provided emails or a default
    const toEmails = recipientEmails && recipientEmails.length > 0 
      ? recipientEmails 
      : ['delivered@resend.dev'];

    const { data, error } = await resend.emails.send({
      from: 'LectureAI <notifications@resend.dev>', // Using Resend test domain
      to: toEmails,
      subject: `New Lecture Available: ${classTitle}`,
      html: `
        <h2>A new lecture has been published!</h2>
        <p>The recording and AI notes for <strong>${classTitle}</strong> are now available.</p>
        <p>Log in to your dashboard to review the summary, read the transcript, and practice with flashcards.</p>
        <br>
        <p>Best,<br>The LectureAI Team</p>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error });
    }

    res.status(200).json({ data });
  } catch (err) {
    console.error('Class notification error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Grok API proxy
async function callGrok(systemPrompt, userPrompt, responseFormat = 'json_object') {
  const response = await fetch(GROK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROK_API_KEY}`
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: responseFormat },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from Grok');
  return JSON.parse(content);
}

app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { notes, transcript } = req.body;
    if (!notes || notes.length === 0) return res.json(null);

    const systemPrompt = `You are a brilliant academic tutor who creates world-class study guides. 
You extract ACTUAL facts, concepts, definitions, formulas, and arguments from lectures. 
You NEVER write meta-commentary like "This lecture discussed X" or "The professor talked about Y".
Instead, you write the actual knowledge as if teaching it to a student.
Always respond with valid JSON.`;

    const userPrompt = `Create a comprehensive study guide from this lecture.

Format as JSON with:
- overview (string): A substantive 3-4 sentence paragraph explaining the core concepts taught. Write actual knowledge, not a description.
- keyTakeaways (array of 5 strings): The 5 most critical facts or arguments, written as complete sentences with specific details.
- cleanNotes (array of objects): Comprehensive structured notes covering the entire lecture. Fix transcription errors, clarify concepts, ensure proper grammar. Each with:
    - text (string): The cleaned, understandable bullet point with actual lecture content
    - timestamp (number): Approximate timestamp in seconds

Transcript: ${(transcript || '').substring(0, 12000)}
Raw Notes: ${JSON.stringify(notes.map(n => ({ time: n.timestamp, text: n.text })))}`;

    const result = await callGrok(systemPrompt, userPrompt);
    res.json(result);
  } catch (err) {
    console.error('Summarize error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/flashcards', async (req, res) => {
  try {
    const { notes, transcript } = req.body;
    if (!notes || notes.length === 0) return res.json({ flashcards: [], quiz: [] });

    const systemPrompt = `You are an expert study materials creator. You create highly effective flashcards and quiz questions that test genuine understanding, not just memorization.

For flashcards: Write specific questions that target key concepts. Answers should be concise (1-3 sentences) but complete.
For quizzes: Create challenging multiple-choice questions where wrong options are plausible but clearly incorrect to someone who studied. Always respond with valid JSON.`;

    const userPrompt = `Create study materials from this lecture.

Format as JSON with:
- flashcards (array of 10 objects): Each with:
    - id (string): "1", "2", etc.
    - question (string): Specific, testable question about a key concept
    - answer (string): Concise, accurate answer (1-3 sentences)
- quiz (array of 5 objects): Each with:
    - id (string): "1", "2", etc.
    - question (string): Clear multiple-choice question
    - options (array of 4 strings): Four plausible answer choices
    - correctIndex (number): 0-based index of the correct option

Transcript: ${(transcript || '').substring(0, 12000)}
Raw Notes: ${JSON.stringify(notes.map(n => ({ time: n.timestamp, text: n.text })))}`;

    const result = await callGrok(systemPrompt, userPrompt);
    res.json(result);
  } catch (err) {
    console.error('Flashcards error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/extract-3d', async (req, res) => {
  try {
    const { transcriptChunk } = req.body;
    const systemPrompt = `You extract the primary physical object mentioned in the text that would be useful to visualize in 3D (e.g., heart, brain, earth, car, skeleton, astronaut).
Return JSON like { "object_name": "heart" }. Only return the object name, lowercase. If no clear physical object, return { "object_name": null }.`;
    const result = await callGrok(systemPrompt, transcriptChunk);
    res.json(result);
  } catch (err) {
    console.error('Extract 3D error:', err);
    res.json({ object_name: null });
  }
});

app.post('/api/ai/fact-check', async (req, res) => {
  try {
    const { text } = req.body;
    const systemPrompt = `Find objective factual errors in the text.
Return a JSON array of corrections under the key "corrections": 
{ "corrections": [{ "wrong_quote": "exact string from text", "correct_fact": "corrected string" }] }. 
If none, return { "corrections": [] }.`;
    const result = await callGrok(systemPrompt, text);
    res.json(result);
  } catch (err) {
    console.error('Fact check error:', err);
    res.json({ corrections: [] });
  }
});

app.post('/api/ai/ask', async (req, res) => {
  try {
    const { question, transcript, notes } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const systemPrompt = `You are an AI tutor answering questions about a lecture. 
Answer based ONLY on the provided lecture content. 
If the answer isn't in the lecture, say so.
Be concise but complete. Cite timestamps when possible.
Always respond with valid JSON: { "answer": "...", "sources": [{ "type": "note|transcript", "timestamp": 123, "text": "..." }] }`;

    const userPrompt = `Question: ${question}

Lecture Transcript: ${(transcript || '').substring(0, 8000)}
Lecture Notes: ${JSON.stringify((notes || []).map(n => ({ time: n.timestamp, text: n.text })))}`;

    const result = await callGrok(systemPrompt, userPrompt, 'json_object');
    res.json(result);
  } catch (err) {
    console.error('Ask AI error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Serve static files in production
const distPath = join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback
app.get('*', (req, res) => {
  const indexPath = join(distPath, 'index.html');
  try {
    readFileSync(indexPath);
    res.sendFile(indexPath);
  } catch {
    res.status(404).send('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Grok API proxy enabled`);
});

export default app;