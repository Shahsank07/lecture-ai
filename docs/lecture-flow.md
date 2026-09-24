# Lecture Workflow & AI Resource Flow — LectureAI

This document details the detailed flowcharts for the core **Live Lecture Recording Workflow** and the **AI Topic & Resource Recommendation Engine** in **LectureAI**.

---

## 1. Core Lecture Recording & Save Flowchart

```mermaid
flowchart TD
    Start([Start]) --> Login[Student Logs In]
    Login --> Dash[Dashboard]
    Dash --> ClickStart[Click 'Start Recording' / 'Go Live']
    
    ClickStart --> CheckMic{Request Microphone\nPermission}
    
    CheckMic -->|Denied / Failed| MicError[Display Error Banner:\n'Microphone permission denied']
    MicError --> Dash
    
    CheckMic -->|Allowed| InitEngines[Initialize MediaRecorder API\n& SpeechEngine Web Speech API]
    
    InitEngines --> StateRec[Set Status = 'recording'\nStart Timer & Waveform Animation]
    
    StateRec --> CaptureLoop[Capture Microphone Stream]
    
    CaptureLoop --> SpeechToText[SpeechEngine Converts Speech to Text]
    
    SpeechToText --> RenderTrans[Render Live Transcript & Interim Text]
    
    RenderTrans --> ExtractNotes[Extract Key Points & Auto Notes]
    RenderTrans --> DetectTopics[Detect Current Topic & Subtopic]
    
    ExtractNotes --> AutoSave[Auto-save Session State to IndexedDB\nevery 5 seconds]
    
    AutoSave --> UserAction{Student Action?}
    
    UserAction -->|Pause Clicked| PauseRec[Pause MediaRecorder & SpeechEngine\nSet Status = 'paused']
    PauseRec --> ResumeAction{Click Resume?}
    ResumeAction -->|Yes| StateRec
    
    UserAction -->|Add Manual Note| ManualNote[Insert Note into Notes List]
    ManualNote --> AutoSave
    
    UserAction -->|Click Finish & Save| StopRec[Stop MediaRecorder & SpeechEngine]
    
    StopRec --> FinalizeAudio[Compile Audio Chunks into WebM Blob]
    FinalizeAudio --> SummarizeAI[Trigger AI Summarization & Flashcard Gen]
    SummarizeAI --> SaveDB[(Save Completed Lecture to\nIndexedDB 'classes' Store)]
    
    SaveDB --> OpenWorkspace[Navigate to Lecture Workspace\n'notes:classId']
    
    OpenWorkspace --> WorkspaceReview[Review Overview, Notes, Resources,\nTimeline, Flashcards & Quiz]
    
    WorkspaceReview --> End([End])
```

---

## 2. AI Topic Detection & Resource Flowchart

```mermaid
flowchart TD
    TranscriptIn[Live Speech Transcript Input] --> Tokenizer[Extract Recent Text Segment\n(Last 2000 Characters)]
    
    Tokenizer --> KeywordMatch{Match TOPIC_KEYWORDS\n(CNN, Pooling, Trees, DBMS, OS)}
    
    KeywordMatch -->|Matches >= 2 Keywords| TopicFound[Update Current Topic &\nSubtopic State]
    KeywordMatch -->|Matches < 2 Keywords| GeneralTopic[Default to 'General Discussion']
    
    TopicFound --> TriggerUI[Display Topic Change Toast Notification]
    GeneralTopic --> ConceptsFetch
    
    TriggerUI --> ConceptsFetch[Fetch Related Concepts & Smart Resources]
    
    ConceptsFetch --> RenderInsights[Render Live Insights Panel:\nTopic Name, 92% Confidence, Key Points]
    
    RenderInsights --> StudentInteract{Student Clicks Resource?}
    
    StudentInteract -->|Open Resource| OpenURL[Open Target External Link\nin New Tab]
    StudentInteract -->|Bookmark Resource| SaveResource[(Save Resource Record to\nIndexedDB 'resources' Store)]
```

---

## 3. AI Assistant Q&A Flowchart

```mermaid
flowchart TD
    QuestionIn[Student Types Question in AI Assistant] --> SendClick{Click Send or Press Enter}
    
    SendClick --> AddMsgUser[Append User Message to Chat History]
    AddMsgUser --> SetLoading[Set Loading State = true\nDisplay Typing Indicator]
    
    SetLoading --> CheckBackend{Is Express Proxy Backend\nAvailable & Key Configured?}
    
    CheckBackend -->|Yes| CallProxy[POST /api/ai/chat with\nLecture Context & History]
    CallProxy --> ProxyResp[Receive LLM Response from Grok]
    
    CheckBackend -->|No / Failed| LocalFallback[Execute Rule-Based Local AI Response\nExtract Contextual Answer]
    
    ProxyResp --> AppendAI[Append AI Response to Chat History]
    LocalFallback --> AppendAI
    
    AppendAI --> RenderChat[Render AI Message Bubble & Timestamp]
    RenderChat --> ResetInput[Reset Input & Clear Loading State]
```
