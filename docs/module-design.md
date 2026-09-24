# Module Hierarchy & Component Architecture — LectureAI

This document details the software module hierarchy and component structural layout of the **LectureAI** platform.

---

## 1. System Module Hierarchy Diagram

```mermaid
flowchart TD
    Root["🔮 LectureAI System Root\n(App.jsx)"]

    subgraph NavigationLayer["Navigation & Header Layer"]
        Navbar["Navbar.jsx\n(Topbar, Search, Notifications, Sidebar)"]
    end

    subgraph ViewModules["12 Application View Modules"]
        M1["1. Authentication\n(AuthPage.jsx)"]
        M2["2. Dashboard\n(Dashboard.jsx)"]
        M3["3. Live Lecture\n(LiveSession.jsx)"]
        M4["4. My Lectures\n(SubjectView.jsx)"]
        M5["5. Lecture Workspace\n(NoteViewer.jsx)"]
        M6["6. Notes Editor\n(NoteEditor.jsx)"]
        M7["7. Resources\n(ResourcesPage.jsx)"]
        M8["8. Flashcards & Quiz\n(FlashcardViewerPage.jsx)"]
        M9["9. Calendar\n(Calendar.jsx)"]
        M10["10. AI Assistant\n(AIAssistantPage.jsx)"]
        M11["11. Progress Tracking\n(ProgressPage.jsx)"]
        M12["12. Settings\n(SettingsModal.jsx)"]
    end

    subgraph InternalServices["Internal Core Services"]
        S1["Database Layer\n(db.js - idb v8.0)"]
        S2["Auth Controller\n(auth.js)"]
        S3["Speech Engine\n(speechEngine.js)"]
        S4["AI Service Proxy\n(aiService.js)"]
        S5["Text Processor\n(textProcessor.js)"]
        S6["Backend Proxy\n(server.js)"]
    end

    subgraph ReusableUI["Shared UI Primitives (src/components/ui)"]
        U1["Button.jsx"]
        U2["Card.jsx"]
        U3["Badge.jsx"]
        U4["Input.jsx"]
        U5["Avatar.jsx"]
        U6["Progress.jsx"]
    end

    %% Hierarchy Connections
    Root --> Navbar
    Root --> ViewModules
    
    %% View Modules to Services
    M1 --> S2
    M2 --> S1
    M3 --> S3
    M3 --> S5
    M3 --> S1
    M5 --> S4
    M5 --> S1
    M6 --> S1
    M7 --> S1
    M8 --> S4
    M9 --> S1
    M10 --> S4
    M11 --> S1
    M12 --> S1

    %% AI Service to Backend Proxy
    S4 --> S6

    %% Components to Reusable UI
    ViewModules --> ReusableUI
```

---

## 2. Module Functional Breakdown

| Module | Primary Component | Responsibility & Interactions |
| :--- | :--- | :--- |
| **Authentication** | `AuthPage.jsx` | Renders login/signup form with password eye toggle, hero step-flow cards, and social proof reviews. Interacts with `auth.js` and IndexedDB `users` store. |
| **Dashboard** | `Dashboard.jsx` | Renders user greeting, 4 stats cards, Continue Learning widget, Upcoming Schedule list, AI Insights grid, Live Lecture Insights right panel, and Study Progress donut chart. |
| **Live Lecture** | `LiveSession.jsx` | Manages active recording sessions. Displays waveform, live transcript, interim text, auto/manual notes, and AI topic confidence meter. Interacts with `speechEngine.js` and `MediaRecorder`. |
| **My Lectures** | `SubjectView.jsx` | Displays subject header banner and lists all recorded class sessions for a selected subject with fallback demo items. |
| **Lecture Workspace** | `NoteViewer.jsx` | Post-lecture review hub with 10 workspace tabs (`Overview`, `Notes`, `Resources`, `Concept Map`, `Important`, `Ask AI`, `Timeline`, `What I Missed`, `Flashcards`, `3D View`) and audio player bar. |
| **Notes Editor** | `NoteEditor.jsx` | Rich note editor supporting text modifications, point creation, deletion, text highlighting, and auto-saving. |
| **Resources** | `ResourcesPage.jsx` | Filterable academic resource grid with external link triggers and IndexedDB bookmarking via `saveResource`. |
| **Flashcards & Quizzes** | `FlashcardViewerPage.jsx` | Render wrapper for `FlashcardViewer.jsx`. Manages 3D card flips, next/prev navigation, quiz option selection, score calculation, and progress fills. |
| **Calendar** | `Calendar.jsx` | Monthly academic planner grid for date selection, schedule creation, and IndexedDB `schedules` storage. |
| **AI Assistant** | `AIAssistantPage.jsx` | Chatbot Q&A interface with suggestion chips, typing indicator, and `askAI` proxy execution. |
| **Progress Tracking** | `ProgressPage.jsx` | Analytics view presenting completion counts, study hours, quiz accuracy rates, and topic mastery progress bars. |
| **Settings** | `SettingsModal.jsx` | Modal dialog for selecting AI model (`GPT-4o`, `Gemini 1.5 Pro`), testing API connectivity, and managing preferences. |
