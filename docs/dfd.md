# Data Flow Diagrams (DFD) — LectureAI

This document presents the Data Flow Diagrams (DFD Level 0 and Level 1) for the **LectureAI** platform.

---

## 1. DFD Level 0 — Context Diagram

The Context Diagram defines the system boundaries of **LectureAI**, illustrating interactions between the external entity (**Student / User**) and the main application process.

```mermaid
flowchart TD
    Student["👤 Student / User"]
    
    subgraph SystemBoundary["LectureAI System Boundary"]
        LectureAISystem(("0.0\nLectureAI\nSystem"))
    end
    
    %% Inputs from Student
    Student -->|1. Credentials / Login Info| LectureAISystem
    Student -->|2. Live Microphone Audio| LectureAISystem
    Student -->|3. Manual Notes & Highlights| LectureAISystem
    Student -->|4. Search Queries| LectureAISystem
    Student -->|5. AI Questions & Prompts| LectureAISystem
    Student -->|6. Calendar Schedules| LectureAISystem
    Student -->|7. Saved Resources & Bookmarks| LectureAISystem
    
    %% Outputs to Student
    LectureAISystem -->|A. Dashboard & Statistics| Student
    LectureAISystem -->|B. Real-Time Speech Transcript| Student
    LectureAISystem -->|C. Structured Notes & Key Takeaways| Student
    LectureAISystem -->|D. Detected Topics & Insights| Student
    LectureAISystem -->|E. Curated Study Resources| Student
    LectureAISystem -->|F. Interactive Flashcards & Quizzes| Student
    LectureAISystem -->|G. AI Q&A Responses| Student
    LectureAISystem -->|H. Academic Calendar & Notifications| Student
```

---

## 2. DFD Level 1 — Process Diagram

DFD Level 1 decomposes the system into main functional processes and their data interactions with IndexedDB data stores (`D1`–`D5`).

```mermaid
flowchart TD
    Student["👤 Student / User"]

    %% Data Stores
    subgraph DataStores["IndexedDB Data Stores (voicenotes-ai)"]
        D1[("D1: Users Store")]
        D2[("D2: Subjects Store")]
        D3[("D3: Classes Store")]
        D4[("D4: Schedules Store")]
        D5[("D5: Resources Store")]
    end

    %% Process Nodes
    subgraph Processes["System Processes"]
        P1(("1.0\nUser\nAuthentication"))
        P2(("2.0\nLecture\nCapture"))
        P3(("3.0\nLecture\nProcessing"))
        P4(("4.0\nLecture\nManagement"))
        P5(("5.0\nResource\nManagement"))
        P6(("6.0\nRevision\nTools"))
        P7(("7.0\nAI Study\nAssistant"))
        P8(("8.0\nCalendar &\nScheduling"))
        P9(("9.0\nProgress &\nAnalytics"))
    end

    %% Process 1: Auth
    Student -->|Credentials| P1
    P1 <-->|Read / Write User| D1
    P1 -->|Auth Token / Session| Student

    %% Process 2: Capture
    Student -->|Audio Stream| P2
    P2 -->|Raw Audio & Text Stream| P3

    %% Process 3: Processing
    P3 -->|Extracted Notes & Topics| D3
    P3 -->|Live Transcript & Insights| Student

    %% Process 4: Lecture Management
    Student -->|Create Subject / Save Session| P4
    P4 <-->|Subject Records| D2
    P4 <-->|Class & Notes Records| D3
    P4 -->|Saved Workspace View| Student

    %% Process 5: Resources
    Student -->|Bookmark Resource| P5
    P5 <-->|Resource Records| D5
    P5 -->|Recommended Articles| Student

    %% Process 6: Revision Tools
    D3 -->|Notes Content| P6
    P6 -->|Flashcards & Quiz Results| Student

    %% Process 7: AI Assistant
    Student -->|AI Query| P7
    D3 -->|Lecture Context| P7
    P7 -->|AI Answer Response| Student

    %% Process 8: Calendar
    Student -->|Add Schedule Event| P8
    P8 <-->|Schedule Records| D4
    P8 -->|Calendar Grid & Reminders| Student

    %% Process 9: Progress
    D3 -->|Completion Stats| P9
    P9 -->|Analytics & Mastery Bars| Student
```
