import express from 'express';
import { Resend } from 'resend';

const app = express();
app.use(express.json({ limit: '10mb' }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const GROK_API_KEY = process.env.GROK_API_KEY || '';
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-3-mini';

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Email endpoints
app.post('/api/email/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Email and name are required' });

    if (!resend) {
      return res.json({ success: false, message: 'Email service not configured' });
    }

    const { data, error } = await resend.emails.send({
      from: 'LectureAI <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to LectureAI',
      html: `
        <h1>Welcome to LectureAI, ${name}!</h1>
        <p>We're thrilled to have you on board. With LectureAI, you can record lectures, get AI-powered summaries, and generate flashcards instantly.</p>
        <br>
        <p>Best,<br>The LectureAI Team</p>
      `
    });

    if (error) return res.json({ success: false, error });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/email/class-notification', async (req, res) => {
  try {
    const { classTitle, recipientEmails } = req.body;
    if (!classTitle) return res.status(400).json({ error: 'Class title is required' });

    if (!resend) {
      return res.json({ success: false, message: 'Email service not configured' });
    }

    const toEmails = recipientEmails && recipientEmails.length > 0 ? recipientEmails : ['delivered@resend.dev'];

    const { data, error } = await resend.emails.send({
      from: 'LectureAI <onboarding@resend.dev>',
      to: toEmails,
      subject: `New Lecture Available: ${classTitle}`,
      html: `
        <h2>A new lecture has been published!</h2>
        <p>The recording and AI notes for <strong>${classTitle}</strong> are now available.</p>
        <p>Log in to review notes, transcripts, and flashcards.</p>
        <br>
        <p>Best,<br>The LectureAI Team</p>
      `
    });

    if (error) return res.json({ success: false, error });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// AI proxy endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, stream = false } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!GROK_API_KEY) {
      return res.status(503).json({ error: 'Grok API key is not configured' });
    }

    const grokRes = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages,
        temperature: 0.3,
        stream: false
      })
    });

    if (!grokRes.ok) {
      const errText = await grokRes.text();
      return res.status(grokRes.status).json({ error: errText });
    }

    const data = await grokRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
