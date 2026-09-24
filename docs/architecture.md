# System Architecture — LectureAI

This document describes the academic software architecture of the **LectureAI** platform.

---

## 1. High-Level Architecture Overview

**LectureAI** is structured as a client-side modern web application powered by React 19 and Vite 6, utilizing browser-native media and speech recognition APIs alongside a Node.js Express backend proxy for external AI requests.

```mermaid
flowchart TD
    subgraph Client["Client Browser Environment"]
        UI["React 19 Frontend UI\n(App.jsx, Navbar, Dashboard)"]
        
        subgraph NativeAPIs["Browser Native APIs"]
            MediaRec["MediaRecorder API\n(Audio Stream Capture)"]
            SpeechRec["Web Speech API\n(SpeechRecognition Engine)"]
            CryptoAPI["Web Crypto API\n(Password PBKDF2 Hashing)"]
        end
        
        subgraph Services["Application Services"]
            AuthSvc["Authentication Service\n(auth.js)"]
            DBSvc["IndexedDB Layer\n(db.js / idb v8.0)"]
            SpeechEng["Speech Engine\n(speechEngine.js)"]
            AISvc["AI Client Service\n(aiService.js)"]
        end
        
        IDB[("IndexedDB Storage\nvoicenotes-ai v4\n(Users, Subjects, Classes,\nSchedules, Resources)")]
    end
    
    subgraph Server["Server & Proxy Layer"]
        ExpressSvr["Node.js Express Server\n(server.js - Port 5173)"]
        AIProxy["AI Proxy Endpoint\n(/api/ai/*)"]
    end
    
    subgraph External["External Services"]
        GrokAPI["xAI Grok API\n(grok-3-mini)"]
    end

    %% User Interaction
    Student(["Student / User"]) --> UI
    
    %% UI to Services
    UI --> AuthSvc
    UI --> SpeechEng
    UI --> AISvc
    UI --> DBSvc

    %% Native API Interop
    SpeechEng --> SpeechRec
    SpeechEng --> MediaRec
    AuthSvc --> CryptoAPI

    %% Service to Storage
    DBSvc <--> IDB
    AuthSvc <--> DBSvc

    %% AI Fallback & Proxy Flow
    AISvc -->|API Request| AIProxy
    AISvc -.->|Offline / Unconfigured Fallback| UI
    ExpressSvr --> AIProxy
    AIProxy <-->|HTTPS Bearer Auth| GrokAPI
```

---

## 2. Layered Architecture Description

### 2.1 User Interface Layer (Presentation)
- **Framework**: React 19 & Vite 6
- **Styling**: Modern CSS Custom Properties with dark navy/purple glassmorphism theme (`#0B0E14`, `#131827`, `#635BFF`).
- **Components**: View components corresponding to the 12 core modules (`AuthPage`, `Dashboard`, `LiveSession`, `NoteViewer`, `ResourcesPage`, `FlashcardViewerPage`, `Calendar`, `AIAssistantPage`, `ProgressPage`, `SettingsModal`, `Navbar`).

### 2.2 Application Services Layer (Logic & Controllers)
- **`auth.js`**: Manages user registration, login authentication, and active user session state.
- **`speechEngine.js`**: Wraps the browser's `SpeechRecognition` API, handling continuous listening, interim text events, and automatic restart on speech pauses.
- **`aiService.js`**: Dispatches requests for summarization, topic extraction, and question answering to the backend proxy, with intelligent rule-based local fallbacks.
- **`textProcessor.js`**: Extracts structured bullet notes and highlights key terms from live speech transcripts.

### 2.3 Browser Native API Layer
- **MediaRecorder API**: Records raw microphone audio input into `audio/webm` chunks during active live sessions.
- **Web Speech API**: Performs continuous client-side speech-to-text recognition in real-time.
- **Web Crypto API**: Generates PBKDF2 key hashes and salts for secure client-side password handling.

### 2.4 Data & Persistence Layer
- **IndexedDB (`idb` v8.0)**: Manages local object stores (`users`, `subjects`, `classes`, `schedules`, `resources`) ensuring 100% offline accessibility and persistent state across page reloads.

### 2.5 Server & External Proxy Layer
- **`server.js`**: Express backend proxy server that securely stores environment configuration (`GROK_API_KEY`), routes `/api/ai/*` endpoints, and serves built static assets in production.
- **xAI Grok API**: External LLM endpoint (`grok-3-mini`) utilized for advanced lecture summarization and Q&A responses when configured.
