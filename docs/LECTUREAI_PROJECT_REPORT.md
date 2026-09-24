# LECTUREAI
## AN AI-POWERED INTELLIGENT LECTURE COMPANION
### *"Learn Better. While You Learn."*

---

### **PROJECT REPORT**

Submitted in partial fulfillment of the requirements for the award of the degree of  
**BACHELOR OF TECHNOLOGY / BACHELOR OF SCIENCE**  
in  
**COMPUTER SCIENCE AND ENGINEERING**

---

**Submitted By:**  
- **Student Name**: [Student Name Placeholder]  
- **Roll Number / Reg No.**: [Roll Number Placeholder]  

**Under the Guidance of:**  
- **Project Guide**: [Project Guide Name Placeholder]  
- **Designation**: [Designation Placeholder]  

---

**DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING**  
**[INSTITUTION NAME PLACEHOLDER]**  
**[ACADEMIC YEAR: 2025–2026]**

<br/><br/>
<div style="page-break-after: always;"></div>

---

# CERTIFICATE

This is to certify that the project report entitled **"LECTUREAI: AN AI-POWERED INTELLIGENT LECTURE COMPANION"** submitted by **[Student Name Placeholder]** (Roll No: **[Roll Number Placeholder]**) in partial fulfillment of the requirements for the award of the degree of **Bachelor of Technology / Bachelor of Science in Computer Science and Engineering** to **[Institution Name Placeholder]** is an authentic record of work carried out by them under my supervision and guidance.

To the best of my knowledge, the matter embodied in this report has not been submitted to any other University or Institution for the award of any degree or diploma.

<br/><br/><br/>

________________________________________  
**[Project Guide Name Placeholder]**  
Project Guide  
Department of Computer Science & Engineering  

<br/><br/>

________________________________________  
**[Head of Department Name Placeholder]**  
Head of Department  
Department of Computer Science & Engineering  

<br/><br/>

**Date**: ______________  
**Place**: ______________  

<div style="page-break-after: always;"></div>

---

# DECLARATION

I hereby declare that the project report entitled **"LECTUREAI: AN AI-POWERED INTELLIGENT LECTURE COMPANION"** submitted to the Department of Computer Science and Engineering, **[Institution Name Placeholder]**, is an original work carried out by me under the supervision of **[Project Guide Name Placeholder]**.

I further declare that to the best of my knowledge, this report does not contain any part of work which has been submitted for the award of any other degree or diploma in any university or institution.

<br/><br/><br/>

________________________________________  
**[Student Name Placeholder]**  
Roll Number: [Roll Number Placeholder]  
Department of Computer Science and Engineering  
[Institution Name Placeholder]  

<br/><br/>

**Date**: ______________  
**Place**: ______________  

<div style="page-break-after: always;"></div>

---

# ACKNOWLEDGEMENT

I express my deepest gratitude to my project guide, **[Project Guide Name Placeholder]**, for their continuous encouragement, valuable guidance, and insightful feedback throughout the duration of this project. Their expertise and support were instrumental in the successful completion of **LectureAI**.

I extend my sincere thanks to **[Head of Department Name Placeholder]**, Head of the Department of Computer Science and Engineering, for providing the necessary resources, departmental facilities, and academic environment required to carry out this project.

I am also thankful to all faculty members, technical staff, and fellow students of the Department of Computer Science and Engineering at **[Institution Name Placeholder]** for their direct and indirect assistance.

Finally, I express my heartfelt appreciation to my family and friends for their unwavering support and motivation throughout my academic journey.

<br/><br/><br/>

________________________________________  
**[Student Name Placeholder]**  

<div style="page-break-after: always;"></div>

---

# ABSTRACT

During academic lectures, students frequently encounter note-taking fatigue, difficulty maintaining continuous active listening, and challenges synthesizing lecture content into effective study materials. **LectureAI** is an AI-powered intelligent lecture companion designed to assist students during and after classroom sessions. Built as a responsive client-side web application powered by React 19, Vite 6, browser-native media APIs, and IndexedDB local storage, the platform transforms spoken classroom dialogue into structured learning assets.

The platform integrates real-time audio capture via the `MediaRecorder` API and live speech-to-text transcription through the Web Speech API. As the lecture progresses, **LectureAI** automatically extracts structured notes, detects subject topics, and flags important definitions. Post-lecture, sessions are organized into a comprehensive **Lecture Workspace** featuring key takeaways, curated academic reference links, interactive 3D concept maps, flip flashcards, self-assessment quizzes, and a lecture-grounded AI Q&A assistant.

Client-side data persistence is implemented using browser IndexedDB (`idb` v8.0), ensuring that recorded lectures, transcripts, notes, calendar schedules, and saved resources remain available offline across page reloads. A Node.js Express backend proxy handles external LLM interactions with local rule-based fallbacks. **LectureAI** delivers a unified, high-efficiency lecture workflow summarized by its core concept: *"Learn Better. While You Learn."*

<div style="page-break-after: always;"></div>

---

# TABLE OF CONTENTS

- **Certificate**
- **Declaration**
- **Acknowledgement**
- **Abstract**
- **1. Introduction**
  - 1.1 Overview
  - 1.2 Modern Educational Challenges
  - 1.3 The LectureAI Concept
- **2. Problem Statement**
  - 2.1 The Note-Taking Trade-Off
  - 2.2 Information Retention & Missed Concepts
  - 2.3 Resource Fragmentation & Revision Friction
- **3. Objectives**
- **4. Existing System**
  - 4.1 Conventional Approaches
  - 4.2 Limitations of Existing Tools
- **5. Proposed System**
  - 5.1 System Overview
  - 5.2 End-to-End Workflow
- **6. System Requirements**
  - 6.1 Hardware Requirements
  - 6.2 Software Requirements
- **7. Technology Stack**
  - 7.1 Frontend Architecture
  - 7.2 Native Browser APIs
  - 7.3 Data Storage & Service Layer
  - 7.4 Backend Proxy Layer
- **8. System Architecture**
  - 8.1 High-Level Architecture Diagram
  - 8.2 Architectural Layers
- **9. System Design**
  - 9.1 Data Flow Diagrams (DFD Level 0 & Level 1)
  - 9.2 Use Case Diagram
  - 9.3 Entity Relationship (ER) Diagram
  - 9.4 Module Hierarchy Diagram
  - 9.5 Core Lecture Process Flowcharts
- **10. Module Description**
  - 10.1 Authentication Module
  - 10.2 Dashboard Module
  - 10.3 Live Lecture Module
  - 10.4 Lecture Workspace Module
  - 10.5 Notes Editor Module
  - 10.6 Resources Module
  - 10.7 Flashcards Module
  - 10.8 Quizzes Module
  - 10.9 Calendar Module
  - 10.10 AI Assistant Module
  - 10.11 Progress Module
  - 10.12 Settings Module
- **11. Database Design**
  - 11.1 IndexedDB Architecture
  - 11.2 Object Store Specifications
- **12. Implementation**
  - 12.1 Live Recording & Speech Transcription
  - 12.2 Lecture Processing & Summarization
  - 12.3 Interactive Revision Engines
  - 12.4 Client-Side Data Persistence
- **13. Testing & Verification**
  - 13.1 Test Methodology
  - 13.2 Comprehensive Test Cases Table
- **14. Results & Discussion**
- **15. Limitations**
- **16. Future Scope**
- **17. Conclusion**
- **18. References**

<div style="page-break-after: always;"></div>

---

# 1. INTRODUCTION

## 1.1 Overview
In higher education, classroom lectures serve as the primary medium for transferring complex domain knowledge. However, traditional lecture environments require students to perform multiple cognitive tasks simultaneously: listening attentively to the instructor, processing technical concepts, writing manual notes, and identifying key exam topics. This cognitive overload frequently results in incomplete notes, unrecorded questions, and low retention rates.

**LectureAI** is an AI-powered intelligent lecture companion developed to solve these challenges by supporting students during and after classroom sessions. Operating entirely within modern web browsers, **LectureAI** captures classroom audio, performs live speech transcription, extracts structured study notes, curates reference materials, and generates interactive revision aids.

## 1.2 Modern Educational Challenges
Modern university curricula move at a rapid pace. A single 50-minute lecture in Computer Science or Engineering may cover multiple algorithms, complex code structures, and abstract theoretical proofs. Students face several operational obstacles:
1. **Multitasking Fatigue**: Writing down board notes or slides interferes with listening to the professor's spoken context and explanations.
2. **Post-Lecture Friction**: Rewriting scribbled notes into organized summaries takes hours of manual effort.
3. **Delayed Self-Assessment**: Students often realize they misunderstand a topic weeks after the lecture, when preparing for midterms.

## 1.3 The LectureAI Concept
> **Product Slogan:** *"Learn Better. While You Learn."*

**LectureAI** operates on the principle that real-time AI assistance during a lecture should augment student attention rather than replace it. By automating raw transcription and note extraction, **LectureAI** allows students to focus on understanding concepts while taking supplemental manual notes.

```
Lecture Audio ──► Audio & Speech Capture ──► Live Speech Transcription ──► AI Concept Understanding ──► Structured Notes & Resources ──► Interactive Revision
```

---

# 2. PROBLEM STATEMENT

## 2.1 The Note-Taking Trade-Off
When a student focuses intensely on writing down verbatim instructor statements, their active listening capacity drops significantly. Conversely, if a student focuses exclusively on listening without writing notes, they retain less than 30% of lecture details 24 hours later. Traditional lecture note-taking forces an undesirable trade-off between **listening comprehension** and **documentation thoroughness**.

## 2.2 Information Retention & Missed Concepts
If an instructor introduces a critical formula or algorithm while a student is looking down or writing a previous point, that concept is missed. Without an automated, synchronized transcript and recording log, catching up on missed lecture portions requires relying on peer notes or guessing.

## 2.3 Resource Fragmentation & Revision Friction
After a lecture ends, study materials remain fragmented across multiple disconnected mediums:
- Handwritten notebooks or digital document files
- Instructor presentation slides
- Bookmarked web pages or video tutorials
- Flashcard decks created in separate third-party tools

This fragmentation increases revision friction. Converting raw notes into self-test flashcards or quizzes requires manual effort that many students skip due to time constraints.

---

# 3. OBJECTIVES

The primary technical and educational objectives of **LectureAI** are:
1. **Capture Classroom Audio**: Stream audio directly from microphone input using standard browser media APIs.
2. **Provide Real-Time Speech Transcription**: Render accurate live speech-to-text transcription as the lecture progresses.
3. **Extract Structured Notes**: Automatically generate key bullet points and highlight critical terms alongside a manual note input toolbar.
4. **Detect Topics & Important Definitions**: Identify topic changes during live sessions and flag core concepts.
5. **Organize Curated Learning Resources**: Recommend subject-specific articles, documentation, and video tutorials.
6. **Support Revision Tools**: Generate interactive flip flashcards and self-assessment quizzes directly from lecture content.
7. **Provide Contextual AI Assistance**: Enable students to query lecture content through a grounded Q&A chatbot interface.
8. **Track Study Progress**: Visualize completion statistics, study streaks, and subject mastery bars.
9. **Ensure Client-Side Data Persistence**: Store subjects, lectures, schedules, and resources inside browser IndexedDB for offline access.
10. **Deliver a Unified Lecture Workspace**: Consolidate transcripts, notes, resources, timelines, and study tools into a single integrated interface.

---

# 4. EXISTING SYSTEM

## 4.1 Conventional Approaches
Currently, students employ a combination of disconnected traditional methods:
- **Handwritten / Digital Notebooks**: Taking manual notes in physical notebooks or word processors (Notion, Google Docs).
- **Standalone Audio Recorders**: Recording audio using voice memo apps on smartphones or dedicated dictaphone devices.
- **Manual Web Search**: Searching Google, YouTube, or Wikipedia manually for tutorials on missed topics.
- **Third-Party Flashcard Apps**: Copying text manually into external spaced-repetition applications (Anki, Quizlet).

## 4.2 Limitations of Existing Tools

| Metric / Feature | Conventional Method | LectureAI Platform |
| :--- | :--- | :--- |
| **Active Listening** | Low (distracted by note writing) | High (automated transcription & notes) |
| **Transcript Synchronization** | None (separate audio file) | Full (audio synchronized with text transcript) |
| **Topic Detection** | Manual (student must identify) | Automated (keyword matching & NLP tagging) |
| **Resource Discovery** | Manual web search required | Contextual recommendations embedded |
| **Revision Creation** | Manual copying to flashcard apps | Instant auto-generation from lecture notes |
| **Data Organization** | Fragmented across apps | Unified single-page workspace & IndexedDB |

---

# 5. PROPOSED SYSTEM

## 5.1 System Overview
**LectureAI** is an integrated single-page web application designed as a comprehensive academic lecture companion. It handles the entire lecture lifecycle from pre-lecture scheduling, live recording and speech transcription, post-lecture summarization, to interactive revision and progress tracking.

## 5.2 End-to-End Workflow

```
1. Authentication (AuthPage.jsx) ──► 2. Dashboard (Dashboard.jsx) ──► 3. Start Live Session (LiveSession.jsx)
                                                                                  │
                                                                                  ▼
6. Lecture Workspace (NoteViewer.jsx) ◄── 5. Save Session to DB ◄── 4. Live Speech Transcription & Notes
      ├── Overview & Notes
      ├── Curated Resources (ResourcesPage.jsx)
      ├── Flashcards & Quizzes (FlashcardViewer.jsx)
      ├── Academic Calendar (Calendar.jsx)
      └── AI Study Assistant (AIAssistantPage.jsx)
```

---

# 6. SYSTEM REQUIREMENTS

## 6.1 Hardware Requirements
- **Processor**: Intel Core i3 (8th Gen or equivalent) / Apple M1 / AMD Ryzen 3 or higher
- **RAM**: Minimum 4 GB (8 GB recommended for optimal multi-tab browser performance)
- **Microphone**: Standard built-in laptop microphone or external USB/3.5mm microphone
- **Network Interface**: Standard Wi-Fi or Ethernet connection (for initial loading and external proxy calls)

## 6.2 Software Requirements
- **Operating System**: macOS, Windows 10/11, Linux, or ChromeOS
- **Web Browser**: Google Chrome (v100+), Microsoft Edge (v100+), or Brave (Browsers supporting Chromium Web Speech API)
- **Runtime Environment**: Node.js (v18.0.0 or higher) & npm (v9.0.0 or higher) for local hosting
- **Browser Permissions**: Explicit user permission for Microphone Audio Input (`navigator.mediaDevices.getUserMedia`)

---

# 7. TECHNOLOGY STACK

- **React 19 (`react`, `react-dom`)**: Component-based user interface architecture utilizing hooks (`useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`).
- **Vite 6 (`vite`, `@vitejs/plugin-react`)**: High-performance frontend build tool and hot-module-replacement (HMR) development server.
- **Lucide React (`lucide-react`)**: Clean, consistent vector icon library for academic UI elements.
- **IndexedDB via `idb` (v8.0.3)**: Promise-based wrapper for client-side transactional database storage.
- **Web Speech API (`webkitSpeechRecognition`)**: Native browser engine for real-time speech-to-text recognition.
- **MediaRecorder API**: Native browser API for streaming and recording raw audio into `audio/webm` blobs.
- **Web Crypto API (`crypto.subtle`)**: Client-side PBKDF2 password hashing and salt generation.
- **Express Backend Proxy (`express`, `ws`)**: Node.js server proxying Grok API requests and hosting static production assets.
- **Design System**: Modular CSS Custom Properties enforcing a dark navy/purple glassmorphism aesthetic (`#0B0E14`, `#131827`, `#635BFF`).

---

# 8. SYSTEM ARCHITECTURE

## 8.1 High-Level Architecture Diagram

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

    Student(["Student / User"]) --> UI
    UI --> AuthSvc
    UI --> SpeechEng
    UI --> AISvc
    UI --> DBSvc
    SpeechEng --> SpeechRec
    SpeechEng --> MediaRec
    AuthSvc --> CryptoAPI
    DBSvc <--> IDB
    AuthSvc <--> DBSvc
    AISvc -->|API Request| AIProxy
    AISvc -.->|Offline / Unconfigured Fallback| UI
    ExpressSvr --> AIProxy
    AIProxy <-->|HTTPS Bearer Auth| GrokAPI
```

## 8.2 Architectural Layers
1. **Presentation Layer**: React 19 single-page application rendering views according to the 12 core modules.
2. **Logic & Service Layer**: `auth.js`, `speechEngine.js`, `aiService.js`, and `textProcessor.js` handling business rules.
3. **Browser Native Layer**: Direct hardware integration with microphone audio streams and speech recognition engines.
4. **Persistence Layer**: Client-side IndexedDB storage (`voicenotes-ai`) managing 5 object stores.
5. **Proxy & LLM Layer**: Express Node.js server routing requests securely to xAI Grok API with rule-based local fallbacks.

---

# 9. SYSTEM DESIGN

## 9.1 Data Flow Diagrams (DFD)

### DFD Level 0 — Context Diagram
```mermaid
flowchart TD
    Student["👤 Student / User"]
    
    subgraph SystemBoundary["LectureAI System Boundary"]
        LectureAISystem(("0.0\nLectureAI\nSystem"))
    end
    
    Student -->|1. Credentials / Login Info| LectureAISystem
    Student -->|2. Live Microphone Audio| LectureAISystem
    Student -->|3. Manual Notes & Highlights| LectureAISystem
    Student -->|4. Search Queries| LectureAISystem
    Student -->|5. AI Questions & Prompts| LectureAISystem
    Student -->|6. Calendar Schedules| LectureAISystem
    Student -->|7. Saved Resources & Bookmarks| LectureAISystem
    
    LectureAISystem -->|A. Dashboard & Statistics| Student
    LectureAISystem -->|B. Real-Time Speech Transcript| Student
    LectureAISystem -->|C. Structured Notes & Key Takeaways| Student
    LectureAISystem -->|D. Detected Topics & Insights| Student
    LectureAISystem -->|E. Curated Study Resources| Student
    LectureAISystem -->|F. Interactive Flashcards & Quizzes| Student
    LectureAISystem -->|G. AI Q&A Responses| Student
    LectureAISystem -->|H. Academic Calendar & Notifications| Student
```

### DFD Level 1 — Process Diagram
```mermaid
flowchart TD
    Student["👤 Student / User"]

    subgraph DataStores["IndexedDB Data Stores (voicenotes-ai)"]
        D1[("D1: Users Store")]
        D2[("D2: Subjects Store")]
        D3[("D3: Classes Store")]
        D4[("D4: Schedules Store")]
        D5[("D5: Resources Store")]
    end

    subgraph Processes["System Processes"]
        P1(("1.0 Auth"))
        P2(("2.0 Audio Capture"))
        P3(("3.0 Speech Process"))
        P4(("4.0 Lecture Mgr"))
        P5(("5.0 Resources"))
        P6(("6.0 Revision"))
        P7(("7.0 AI Assistant"))
        P8(("8.0 Calendar"))
        P9(("9.0 Progress"))
    end

    Student -->|Credentials| P1
    P1 <-->|User Data| D1
    P1 -->|Session| Student

    Student -->|Microphone Stream| P2
    P2 -->|Audio Data| P3
    P3 -->|Transcript & Notes| D3
    P3 -->|Live Text| Student

    Student -->|Save Class / Subject| P4
    P4 <-->|Subjects| D2
    P4 <-->|Classes| D3
    P4 -->|Workspace| Student

    Student -->|Bookmark| P5
    P5 <-->|Resources| D5
    P5 -->|Articles| Student

    D3 -->|Notes| P6
    P6 -->|Flashcards & Quiz| Student

    Student -->|AI Query| P7
    D3 -->|Context| P7
    P7 -->|Answer| Student

    Student -->|Add Schedule| P8
    P8 <-->|Schedules| D4
    P8 -->|Calendar Grid| Student

    D3 -->|Class Stats| P9
    P9 -->|Progress Bars| Student
```

## 9.2 Use Case Diagram

```mermaid
graph LR
    Student(("👤 Student\n(Actor)"))

    subgraph SystemBoundary["LectureAI System"]
        UC1["UC-1: Authenticate / Login"]
        UC2["UC-2: View Dashboard"]
        UC3["UC-3: Global Search Lectures"]
        UC4["UC-4: Start Live Session"]
        UC5["UC-5: Record Audio Stream"]
        UC6["UC-6: View Live Transcript"]
        UC7["UC-7: Pause / Resume Session"]
        UC8["UC-8: Add Manual Notes"]
        UC9["UC-9: Stop & Save Session"]
        UC10["UC-10: Open Lecture Workspace"]
        UC11["UC-11: Edit Notes & Highlights"]
        UC12["UC-12: View Recommended Resources"]
        UC13["UC-13: Bookmark Resources"]
        UC14["UC-14: Study Flashcards"]
        UC15["UC-15: Take Assessment Quiz"]
        UC16["UC-16: Manage Academic Calendar"]
        UC17["UC-17: Ask AI Assistant"]
        UC18["UC-18: View Progress Metrics"]
        UC19["UC-19: Manage Notifications"]
        UC20["UC-20: Configure Settings"]
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6
    Student --> UC7
    Student --> UC8
    Student --> UC9
    Student --> UC10
    Student --> UC11
    Student --> UC12
    Student --> UC13
    Student --> UC14
    Student --> UC15
    Student --> UC16
    Student --> UC17
    Student --> UC18
    Student --> UC19
    Student --> UC20

    UC4 .->|includes| UC5
    UC5 .->|includes| UC6
    UC9 .->|includes| UC10
    UC14 .->|extends| UC10
    UC15 .->|extends| UC10
    UC17 .->|extends| UC10
```

## 9.3 Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ SUBJECTS : "creates (1:N)"
    USERS ||--o{ SCHEDULES : "manages (1:N)"
    SUBJECTS ||--o{ CLASSES : "contains (1:N)"
    CLASSES ||--o{ RESOURCES : "references (1:N)"
    
    USERS {
        string id PK
        string email UK
        string name
        string passwordHash
        string salt
        string createdAt
    }
    
    SUBJECTS {
        string id PK
        string userId FK
        string name
        string emoji
        string color
        string createdAt
    }
    
    CLASSES {
        string id PK
        string subjectId FK
        string title
        string date
        number duration
        string status
        string transcript
        array notes
        object summary
        array topics
        array smartResources
        array flashcards
        array quiz
        blob audioBlob
    }
    
    SCHEDULES {
        string id PK
        string subjectId FK
        string title
        string scheduledDate
        string createdAt
    }
    
    RESOURCES {
        string id PK
        string title
        string url
        string category
        string savedAt
    }
```

## 9.4 Module Hierarchy Diagram

```mermaid
flowchart TD
    Root["🔮 LectureAI System Root (App.jsx)"]
    Navbar["Navbar.jsx (Topbar, Search, Notifications, Sidebar)"]
    
    subgraph Modules["12 Application View Modules"]
        AuthM["AuthPage.jsx"]
        DashM["Dashboard.jsx"]
        LiveM["LiveSession.jsx"]
        SubjM["SubjectView.jsx"]
        NoteM["NoteViewer.jsx"]
        EditM["NoteEditor.jsx"]
        ResM["ResourcesPage.jsx"]
        FCPageM["FlashcardViewerPage.jsx"]
        CalM["Calendar.jsx"]
        AIM["AIAssistantPage.jsx"]
        ProgM["ProgressPage.jsx"]
        SetM["SettingsModal.jsx"]
    end
    
    subgraph Services["Core Services"]
        DB["db.js"]
        Auth["auth.js"]
        Speech["speechEngine.js"]
        AISvc["aiService.js"]
    end
    
    Root --> Navbar
    Root --> Modules
    Modules --> Services
```

## 9.5 Core Lecture Process Flowchart

```mermaid
flowchart TD
    Start([Start]) --> Login[Student Logs In]
    Login --> Dash[Dashboard View]
    Dash --> ClickStart[Click 'Start Recording' / 'Go Live']
    
    ClickStart --> CheckMic{Request Microphone\nPermission}
    
    CheckMic -->|Denied| MicErr[Display Error Banner:\n'Microphone permission denied']
    MicErr --> Dash
    
    CheckMic -->|Allowed| InitEng[Initialize MediaRecorder\n& SpeechEngine API]
    InitEng --> RecordState[Set Status = 'recording'\nStart Timer & Waveform]
    
    RecordState --> Capture[Capture Audio & Transcribe Speech]
    Capture --> Render[Render Live Transcript & Notes]
    Render --> AutoSave[Auto-save to IndexedDB every 5s]
    
    AutoSave --> UserAct{Student Action?}
    UserAct -->|Pause| PauseState[Pause Recording]
    PauseState --> UserAct
    UserAct -->|Add Note| InsertNote[Insert Manual Note]
    InsertNote --> AutoSave
    UserAct -->|Finish & Save| StopState[Stop Recording & Process Chunks]
    
    StopState --> Summarize[Generate Summary & Flashcards]
    Summarize --> SaveDB[(Save Record to IndexedDB)]
    SaveDB --> OpenWorkspace[Open Lecture Workspace]
    OpenWorkspace --> End([End])
```

---

# 10. MODULE DESCRIPTION

## 10.1 Authentication Module (`AuthPage.jsx`)
- **Purpose**: Authenticates student access and manages local user sessions.
- **Main Functionality**: Form validation for email/password sign-in and sign-up, password eye toggle, hero step-flow overview, and Google demo login simulation.
- **Data Involved**: Interacts with `src/auth.js` and IndexedDB `users` store (`email`, `passwordHash`, `salt`).

## 10.2 Dashboard Module (`Dashboard.jsx`)
- **Purpose**: Centralized command center providing an overview of academic progress.
- **Main Functionality**: Renders greeting, 4 stat cards, Continue Learning widget, Upcoming Schedule list, AI Insights grid, Live Lecture Insights right panel with **Go Live** trigger, and Study Progress donut chart.
- **Data Involved**: Queries IndexedDB `classes`, `subjects`, and `schedules` stores.

## 10.3 Live Lecture Module (`LiveSession.jsx`)
- **Purpose**: Real-time classroom recording and live transcription interface.
- **Main Functionality**: Controls microphone recording (`MediaRecorder`), streams live speech recognition (`SpeechEngine`), animates audio waveform, extracts auto-notes, handles manual note submission, and tracks topic confidence.
- **Data Involved**: Continuously auto-saves session state to IndexedDB `classes` store.

## 10.4 Lecture Workspace Module (`NoteViewer.jsx`)
- **Purpose**: Comprehensive post-lecture revision workspace.
- **Main Functionality**: Provides 10 tabbed views (`Overview`, `Notes`, `Resources`, `Concept Map`, `Important`, `Ask AI`, `Timeline`, `What I Missed`, `Flashcards`, `3D View`) and an interactive audio playback bar.
- **Data Involved**: Reads and updates lecture record from `classes` store.

## 10.5 Notes Editor Module (`NoteEditor.jsx`)
- **Purpose**: Dedicated workspace for editing and refining lecture notes.
- **Main Functionality**: In-place text editing, adding/deleting note points, applying color highlights, and auto-saving edits.
- **Data Involved**: Updates `classes.notes` array in IndexedDB.

## 10.6 Resources Module (`ResourcesPage.jsx`)
- **Purpose**: Academic study library organizing external reference materials.
- **Main Functionality**: Filterable resource grid across categories (`Article`, `Courseware`, `Documentation`, `Guide`, `Video Lecture`, `Reference`), external link triggers, and bookmark saving.
- **Data Involved**: Reads/writes records to IndexedDB `resources` store via `saveResource`.

## 10.7 Flashcards Module (`FlashcardViewer.jsx` & `FlashcardViewerPage.jsx`)
- **Purpose**: Spaced-repetition study aid for memorizing key definitions.
- **Main Functionality**: 3D card flip animation, card navigation, shuffle mode, keyboard shortcuts, and deck progress tracking.
- **Data Involved**: Consumes `classData.summary.flashcards` array.

## 10.8 Quizzes Module (`FlashcardViewer.jsx`)
- **Purpose**: Self-assessment testing engine for checking lecture comprehension.
- **Main Functionality**: Multiple-choice question presentation, immediate correct/wrong visual validation, score tracking, and progress bar fill.
- **Data Involved**: Consumes `classData.summary.quiz` array.

## 10.9 Calendar Module (`Calendar.jsx`)
- **Purpose**: Academic planner for tracking lecture schedules and exams.
- **Main Functionality**: Monthly calendar grid, date selection, modal form for scheduling future lectures, and schedule display.
- **Data Involved**: Interacts with IndexedDB `schedules` store (`scheduledDate`, `title`).

## 10.10 AI Assistant Module (`AIAssistantPage.jsx`)
- **Purpose**: Interactive study chatbot for answering lecture-specific questions.
- **Main Functionality**: Question input bar, quick suggestion chips, message history rendering, typing indicator, and `askAI` proxy execution.
- **Data Involved**: Dispatches lecture context to backend proxy `/api/ai/chat` with local rule-based fallback.

## 10.11 Progress Module (`ProgressPage.jsx`)
- **Purpose**: Analytics dashboard for monitoring overall academic performance.
- **Main Functionality**: Displays overall completion percentage, hours learned, quiz accuracy rate, current study streak, and subject-wise topic mastery bars.
- **Data Involved**: Aggregates metrics from IndexedDB `classes` store.

## 10.12 Settings Module (`SettingsModal.jsx`)
- **Purpose**: User preferences and AI model configuration modal.
- **Main Functionality**: AI Model selector (`GPT-4o`, `GPT-4o-mini`, `Gemini 1.5 Pro`), API key input, and test connection button.
- **Data Involved**: Persists preferences to browser `localStorage`.

---

# 11. DATABASE DESIGN

## 11.1 IndexedDB Architecture
**LectureAI** utilizes browser IndexedDB (`voicenotes-ai`, Version `4`) managed via the `idb` promise-based wrapper. Because IndexedDB operates directly inside the browser client, all lecture transcripts, audio recordings, notes, schedules, and resources remain stored locally on the student's device.

## 11.2 Object Store Specifications

```
Database: voicenotes-ai (Version 4)
├── users (Key: id, Index: email [unique])
├── subjects (Key: id, Indices: createdAt, userId)
├── classes (Key: id, Indices: subjectId, date)
├── schedules (Key: id, Index: scheduledDate)
└── resources (Key: id)
```

1. **`users` Store**: Stores account credentials (`id`, `email`, `name`, `passwordHash`, `salt`, `createdAt`).
2. **`subjects` Store**: Stores subject folders (`id`, `userId`, `name`, `emoji`, `color`, `createdAt`).
3. **`classes` Store**: Stores recorded lectures (`id`, `subjectId`, `title`, `date`, `duration`, `status`, `transcript`, `notes`, `summary`, `topics`, `smartResources`, `flashcards`, `quiz`, `audioBlob`).
4. **`schedules` Store**: Stores scheduled study events (`id`, `subjectId`, `title`, `scheduledDate`, `createdAt`).
5. **`resources` Store**: Stores bookmarked academic links (`id`, `title`, `url`, `savedAt`).

---

# 12. IMPLEMENTATION

## 12.1 Live Recording & Speech Transcription
Live audio stream capture is implemented using `navigator.mediaDevices.getUserMedia({ audio: true })` feeding into a `MediaRecorder` instance set to `audio/webm` MIME type. Simultaneously, `SpeechEngine` instantiates `webkitSpeechRecognition` with continuous listening enabled:
```javascript
// SpeechEngine initialization pattern
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
this.recognition = new SpeechRecognition();
this.recognition.continuous = true;
this.recognition.interimResults = true;
```
Recognized text fragments trigger `onResult` callbacks, updating live transcript state and appending extracted note points.

## 12.2 Lecture Processing & Summarization
When a lecture ends, `stopSession()` compiles raw `MediaRecorder` chunks into a single `Blob` object. The transcript and notes are passed to `summarizeNotes()`, which proxies to the Express server or executes local fallback rules to generate an overview summary, key takeaways, and flashcards.

## 12.3 Interactive Revision Engines
Flashcards and quizzes render dynamically from lecture data. The `FlashcardViewer` component manages card flip transforms using CSS 3D perspectives (`transform: rotateY(180deg)`). The quiz engine validates student option clicks against `correctIndex`, applying `.correct` or `.wrong` CSS classes immediately.

## 12.4 Client-Side Data Persistence
All data mutations route through helper methods exported by `src/db.js` (`saveClass`, `saveSubject`, `saveSchedule`, `saveResource`). Continuous auto-saving occurs every 5 seconds during live sessions to protect against browser crashes.

---

# 13. TESTING & VERIFICATION

## 13.1 Test Methodology
Testing was conducted across Chromium-based browser environments (Google Chrome, Microsoft Edge) to verify UI rendering, hardware media streaming, speech recognition accuracy, local IndexedDB transactional integrity, and build stability.

## 13.2 Comprehensive Test Cases Table

| Test ID | Feature / Module | Test Action | Expected Result | Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Authentication | Enter valid credentials and click Sign In | Authenticates user session and loads Dashboard | **PASS** |
| **TC-02** | Auth Password Toggle | Click eye icon in password field | Toggles password visibility between dots and plaintext | **PASS** |
| **TC-03** | Dashboard Loading | Mount Dashboard component | Displays greeting, 4 stats cards, Continue Learning, and Live panel | **PASS** |
| **TC-04** | Start Recording | Click "Go Live" / "Start Recording" | Requests mic permission and initializes live session timer | **PASS** |
| **TC-05** | Mic Permission Handling | Deny microphone prompt | Displays user-visible red error alert banner | **PASS** |
| **TC-06** | Live Transcription | Speak into active microphone | Renders recognized text live in transcript pane | **PASS** |
| **TC-07** | Pause Recording | Click Pause button | Pauses recording timer and SpeechEngine stream | **PASS** |
| **TC-08** | Resume Recording | Click Resume button | Resumes audio stream capture and timer ticking | **PASS** |
| **TC-09** | Add Manual Note | Type custom note and click "Add Note" | Appends note item to auto-generated notes list | **PASS** |
| **TC-10** | Stop & Save Lecture | Click "Finish & Save" | Stops MediaRecorder, generates summary, saves to IndexedDB | **PASS** |
| **TC-11** | Open Saved Workspace | Click completed lecture card | Opens Lecture Workspace (`notes:id`) with 10 workspace tabs | **PASS** |
| **TC-12** | Edit Notes | Modify note text in NoteEditor | Auto-saves updated note array to IndexedDB | **PASS** |
| **TC-13** | Resource Bookmark | Click Bookmark icon on resource card | Toggles bookmark visual fill and updates `resources` store | **PASS** |
| **TC-14** | Open External Link | Click "Open Resource" button | Opens external reference tutorial link in new browser tab | **PASS** |
| **TC-15** | Flashcards Flip | Click flashcard element or press Space | Flips card to reveal answer with 3D animation | **PASS** |
| **TC-16** | Quiz Selection | Click quiz option button | Highlights option green (correct) or red (wrong) and updates score | **PASS** |
| **TC-17** | Calendar Scheduling | Select date and submit schedule form | Adds scheduled event and persists to IndexedDB `schedules` store | **PASS** |
| **TC-18** | Notification Bell | Click Bell icon button | Opens dropdown panel, displays notifications, updates badge | **PASS** |
| **TC-19** | Global Search | Type query into topbar search input | Filters matching lectures and topics in real-time | **PASS** |
| **TC-20** | AI Assistant Chat | Type question and click Send | Appends user message and renders AI response bubble | **PASS** |
| **TC-21** | Data Persistence | Refresh browser window | Retains all subjects, lectures, notes, schedules, and resources | **PASS** |
| **TC-22** | Production Build | Run `npm run build` | Compiles production assets in `dist/` with 0 errors | **PASS** |

---

# 14. RESULTS & DISCUSSION

The completed **LectureAI** platform successfully demonstrates a unified, client-first AI lecture companion. Key achievements include:
- **Flawless End-to-End Workflow**: Seamless progression from authentication, live session recording, live transcription, post-lecture summarization, to multi-tab workspace revision.
- **Zero-Latency Local Storage**: Utilizing IndexedDB enables sub-millisecond data reads and writes without dependency on expensive cloud infrastructure.
- **High Visual Standards**: Strict adherence to the reference design system (`media_1788350746652.jpg`) ensures a professional, dark navy/purple SaaS aesthetic.
- **Reliable Fallback Mechanisms**: Local rule-based engines guarantee uninterrupted functionality during offline or unconfigured API scenarios.

---

# 15. LIMITATIONS

1. **Browser Speech Recognition Dependency**: Live speech-to-text relies on Chromium Web Speech API implementations (`webkitSpeechRecognition`). Browsers lacking native SpeechRecognition support rely on audio recordings and simulation fallback tickers.
2. **Local Browser Storage Scope**: Data persistence operates inside browser IndexedDB on the local device. Data does not automatically synchronize across different physical devices.
3. **Curated Demo Resources**: The recommended learning resources module utilizes curated reference links and keyword matching rather than autonomous web crawling.
4. **Local Proxy Configuration**: External LLM summarization requires passing a valid API key to the Express server proxy (`GROK_API_KEY`); otherwise, local rule-based fallbacks execute.

---

# 16. FUTURE SCOPE

1. **Cloud Database Synchronization**: Implementing PostgreSQL / Supabase backend sync for multi-device cross-platform access.
2. **Server-Side Transformer Models**: Integrating Whisper or Custom Fine-Tuned LLMs for enhanced technical terminology recognition.
3. **Native Mobile Client**: Developing iOS and Android applications using React Native / Expo.
4. **Collaborative Study Groups**: Enabling real-time shared subject folders and group note annotation.
5. **Multi-Lingual Lecture Translation**: Automatically translating speech transcripts into international languages.

---

# 17. CONCLUSION

**LectureAI** successfully addresses the cognitive challenges students experience during traditional academic lectures. By combining live audio recording, Web Speech transcription, automated note extraction, curated resource discovery, interactive flashcards, self-testing quizzes, and an AI study assistant into a single unified workspace, **LectureAI** significantly reduces post-lecture revision friction. The platform fulfills all academic project goals, providing an effective, reliable, and visually stunning lecture companion summarized by its slogan: *"Learn Better. While You Learn."*

---

# 18. REFERENCES

1. **React Documentation**: Official React 19 Developer Guide. Available: https://react.dev/
2. **Vite Documentation**: Vite 6 Frontend Tooling Guide. Available: https://vite.dev/
3. **MDN Web Docs — Web Speech API**: SpeechRecognition Interface Specification. Available: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
4. **MDN Web Docs — MediaRecorder API**: MediaStream Recording API Guide. Available: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
5. **MDN Web Docs — IndexedDB API**: Client-Side Storage Guide. Available: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
6. **idb Documentation**: IndexedDB Promise Wrapper Specification. Available: https://github.com/jakearchibald/idb
7. **Lucide Icons**: Lucide React Icon Library Reference. Available: https://lucide.dev/
8. **Express.js Documentation**: Node.js Web Application Framework Guide. Available: https://expressjs.com/
