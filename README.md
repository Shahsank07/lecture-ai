# LectureAI

**LectureAI** is an AI-powered intelligent lecture companion designed to assist students during and after academic lectures. Built as an interactive web platform, it transforms real-time classroom audio into structured notes, topic insights, resources, and revision tools.

> **Slogan:** *"Learn Better. While You Learn."*

---

## 1. Project Overview

During traditional lectures, students often struggle to divide attention between listening attentively and taking accurate notes. **LectureAI** bridges this gap by automatically capturing audio, performing live speech-to-text transcription, extracting key concepts, organizing recommended resources, and generating interactive revision aids such as flashcards and quizzes.

### Core Workflow Cycle
```
Lecture Audio ──► Audio & Speech Capture ──► Live Speech Transcription ──► AI Concept Understanding ──► Structured Notes & Resources ──► Interactive Revision
```

---

## 2. Problem Statement

Students in higher education frequently encounter several critical learning bottlenecks during lectures:
- **Note-Taking Fatigue**: Difficulty writing down complex formulas, diagrams, and explanations while maintaining active listening.
- **Missed Concepts**: Temporarily losing focus results in gaps in lecture notes and missed core topics.
- **Fragmented Learning Resources**: Difficulty finding relevant tutorials, reference documentation, or articles for topics covered in class.
- **High Revision Friction**: Converting raw lecture notes into study flashcards and self-assessment quizzes requires substantial manual effort.
- **Lack of Unified Workspace**: Study materials, schedules, and topic notes are typically scattered across different notebooks and apps.

---

## 3. Objectives

The primary technical and educational objectives of **LectureAI** are to:
- **Capture Lecture Audio**: Record classroom sessions through standard browser audio devices.
- **Provide Live Speech Transcription**: Convert spoken lecture dialogue into real-time text output using browser speech recognition.
- **Assist Note Generation**: Automatically extract structured bullet points while allowing students to insert custom manual notes.
- **Detect Topics & Important Concepts**: Identify subject topics and flag key definitions during live sessions.
- **Curate Learning Resources**: Recommend topic-specific articles, documentation, and external reference links.
- **Facilitate Interactive Revision**: Generate study flashcards and multi-choice quizzes for self-testing.
- **Provide Contextual AI Assistance**: Enable students to ask questions about lecture content through an interactive Q&A assistant.
- **Track Learning Progress**: Visualize completion rates, study streaks, and topic mastery metrics.

---

## 4. Main Features

- **User Authentication & Session Management**: Secure local session persistence with login and registration support.
- **Interactive Dashboard**: High-level overview displaying recent lectures, stats counters, upcoming schedules, AI insights, and progress metrics.
- **Live Lecture Session**: Real-time recording interface featuring microphone controls, continuous audio waveform, live transcript display, and topic detection.
- **Pause & Resume Controls**: Pause recording and speech recognition during breaks without losing active session state.
- **Automatic & Manual Notes**: Automatically extracted key points alongside a manual note input toolbar.
- **Saved Lecture Workspace**: Comprehensive post-lecture view featuring Overview, Notes, Resources, Concept Maps, Important Points, Timeline, and 3D Visualizations.
- **Curated Resources Hub**: Filterable library of articles, documentation, video lectures, and reference guides with local bookmarking.
- **Interactive Flashcards**: Flip-card study interface with keyboard navigation (`Left`/`Right` arrows, `Space` to flip) and card progress tracking.
- **Self-Assessment Quizzes**: Interactive multiple-choice quizzes with immediate answer feedback and score calculation.
- **Academic Calendar**: Month-view scheduling grid for adding and managing upcoming lectures and study events.
- **AI Study Assistant**: Conversational study chatbot with suggestion chips for querying lecture concepts.
- **Global Search**: Real-time topbar search query filtering across subjects, lectures, and topics.
- **Notification Center**: Bell icon dropdown panel with unread badge counters, mark as read, and clear-all controls.
- **Progress & Analytics**: Visual dashboards showing overall completion percentages, time spent, quiz accuracy, and topic mastery bars.
- **Local Persistence (IndexedDB)**: Client-side storage ensuring lectures, notes, calendar schedules, and resources persist across browser reloads.

---

## 5. Application Modules

### 5.1 Authentication Module (`AuthPage.jsx`)
Handles student login and account registration. Features a visual hero banner highlighting the 4-step learning flow, password visibility eye toggle, and local session management via IndexedDB.

### 5.2 Dashboard Module (`Dashboard.jsx`)
Serves as the primary learning command center. Displays top stats (Total Lectures, Hours Learned, Topics Covered, Study Streak), a Continue Learning widget, Upcoming Schedule list, AI Insights grid, Live Lecture Insights right panel with a **Go Live** quick-start trigger, and a Study Progress donut chart.

### 5.3 Live Lecture Module (`LiveSession.jsx`)
The live classroom interface. Utilizes `MediaRecorder` for audio capture and `SpeechEngine` for Web Speech API transcription. Features a two-column layout showing live transcript, interim text, waveform animation, auto/manual notes, and an AI Understanding panel detailing current topic confidence.

### 5.4 Lecture Workspace Module (`NoteViewer.jsx` & `NoteEditor.jsx`)
The post-lecture review hub. Provides 10 tabbed views (`Overview`, `Notes`, `Resources`, `Concept Map`, `Important`, `Ask AI`, `Timeline`, `What I Missed`, `Flashcards`, `3D View`) and an integrated audio player bar.

### 5.5 Resources Module (`ResourcesPage.jsx`)
Organizes external academic reference materials by category (`Article`, `Courseware`, `Documentation`, `Guide`, `Video Lecture`, `Reference`). Allows opening external links and saving bookmarks to IndexedDB.

### 5.6 Flashcards Module (`FlashcardViewer.jsx` & `FlashcardViewerPage.jsx`)
A 3D flip-card study component for reviewing key definitions and concepts. Supports shuffle mode, keyboard controls, and progress tracking.

### 5.7 Quizzes Module (`FlashcardViewer.jsx`)
Interactive assessment engine for testing knowledge retention. Features immediate answer validation (green for correct, red for wrong) and final score summary.

### 5.8 Calendar Module (`Calendar.jsx`)
Monthly academic planner grid for viewing scheduled classes, adding future study sessions, and organizing lecture timelines.

### 5.9 AI Assistant Module (`AIAssistantPage.jsx`)
A conversational assistant interface allowing students to ask follow-up questions, request explanations, or generate summary bullet points.

### 5.10 Progress Module (`ProgressPage.jsx`)
Analytics screen displaying study completion statistics, weekly time investments, quiz score trends, and subject-wise mastery progress bars.

### 5.11 Settings Module (`SettingsModal.jsx`)
Configures AI model selection (`GPT-4o`, `GPT-4o-mini`, `Gemini 1.5 Pro`), API key options, and local application preferences.

---

## 6. Technology Stack

- **Frontend Library**: React 19 (`react`, `react-dom`)
- **Build Tool & Dev Server**: Vite 6 (`vite`, `@vitejs/plugin-react`)
- **UI Icons**: Lucide React (`lucide-react`)
- **Local Database**: IndexedDB via `idb` wrapper
- **Backend Proxy Server**: Node.js & Express (`express`, `ws`)
- **Browser Media & Speech APIs**: Web Speech API (`webkitSpeechRecognition`), MediaRecorder API, Web Crypto API
- **Styling**: Modern Modular CSS with Custom CSS Properties (Dark Navy/Purple Theme)

---

## 7. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          User Browser Interface                        │
│                   React 19 Components & UI Primitive               │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Services & Engine Layer                         │
│   SpeechEngine.js  │  aiService.js  │  textProcessor.js  │  auth.js    │
└──────────────────┬───────────────┬─────────────────────────────┬───────┘
                   │               │                             │
                   ▼               ▼                             ▼
┌──────────────────────┐ ┌──────────────────┐ ┌──────────────────────────┐
│   Browser Native     │ │   Node.js Proxy  │ │    Client Storage        │
│ Web Speech & Media   │ │ Express Server   │ │ IndexedDB (idb v8.0)     │
│    Recorder APIs     │ │ (Grok API Proxy) │ │ (Subjects/Classes/Users) │
└──────────────────────┘ └──────────────────┘ └──────────────────────────┘
```

---

## 8. Data Storage (IndexedDB Schema)

Database Name: `voicenotes-ai` (Version `4`)

| Object Store | Key Path | Indices | Description |
| :--- | :--- | :--- | :--- |
| `users` | `id` | `email` (unique) | Registered user credentials and profile state |
| `subjects` | `id` | `createdAt`, `userId` | Academic subject folders with colors & emojis |
| `classes` | `id` | `subjectId`, `date` | Recorded lecture sessions, transcripts & notes |
| `schedules` | `id` | `scheduledDate` | Calendar events and upcoming lecture reminders |
| `resources` | `id` | — | Bookmarked articles and reference links |

---

## 9. Recording Workflow

```
1. Click "Start Recording" ──► 2. Request Mic Permission ──► 3. Initialize MediaRecorder & Web Speech API
                                                                        │
                                                                        ▼
6. Lecture Saved to DB ◄── 5. Click "Stop Recording" ◄── 4. Live Audio Stream + Real-Time Transcript & Notes
```

---

## 10. User Workflow

1. **Authentication**: Sign in using existing account credentials or Google demo authentication.
2. **Dashboard Overview**: View study statistics, continue active lectures, or inspect upcoming schedules.
3. **Start Live Lecture**: Click **Go Live** or **Start Recording** to begin audio capture and speech recognition.
4. **Active Session**: Speak or observe the live transcript, review auto-extracted key points, add manual notes, and monitor topic confidence.
5. **Stop & Save**: End recording to auto-summarize notes and persist the lecture to IndexedDB.
6. **Workspace Revision**: Open the saved lecture to review transcript timelines, study flashcards, take self-assessment quizzes, or ask questions via the AI Assistant.

---

## 11. Installation & Local Development

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Steps
1. Clone or download the repository directory.
2. Navigate to the project root:
   ```bash
   cd "major project"
   ```
3. Install project dependencies:
   ```bash
   npm install
   ```
4. Launch the local development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173/` (or port indicated in console).

---

## 12. Production Build

To build the application for production deployment:
```bash
npm run build
```
This generates optimized static assets inside the `dist/` directory.

To preview the built production bundle locally:
```bash
npm run preview
```

---

## 13. Demo Limitations

- **Speech Recognition Support**: Live speech-to-text relies on browser support for Chrome/Edge Web Speech API (`webkitSpeechRecognition`). Fallback simulation tickers operate when speech recognition is unavailable or silent.
- **Local Database Scope**: Data persistence operates client-side via browser IndexedDB. Data is preserved across reloads on the same browser instance.
- **AI Service Proxy**: Backend API requests proxy to xAI/Grok when configured via environment variable `GROK_API_KEY`. Local rule-based fallbacks handle summarization and Q&A when offline.
- **Resource Hub**: Recommended resources feature curated high-quality academic reference links for demo purposes.

---

## 14. Future Scope

- **Cloud Data Synchronization**: Multi-device database sync using PostgreSQL / Supabase backend.
- **Advanced NLP Topic Modeling**: Server-side transformer models for complex technical lecture segmentation.
- **Mobile Application**: Cross-platform mobile client built with React Native / Expo.
- **Collaborative Workspaces**: Shared subject folders and collaborative note-taking for study groups.
- **Accessibility Enhancements**: Screen reader optimizations and multi-language lecture translation.

---

## 15. Academic Project Information

- **Student Name**: [Insert Student Name]
- **Roll Number / Registration No.**: [Insert Roll Number]
- **Department**: Department of Computer Science & Engineering
- **Institution**: [Insert Institution Name]
- **Academic Year**: 2025–2026
- **Project Guide**: [Insert Project Guide Name]
