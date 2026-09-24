# Use Case Specifications & Diagram — LectureAI

This document presents the Use Case Diagram and action specifications for the **LectureAI** platform.

---

## 1. Use Case Diagram

```mermaid
graph LR
    Student(("👤 Student\n(Actor)"))

    subgraph SystemBoundary["LectureAI System"]
        UC1["UC-1: Authenticate / Login"]
        UC2["UC-2: View Dashboard"]
        UC3["UC-3: Global Search Lectures & Topics"]
        UC4["UC-4: Start Live Lecture Session"]
        UC5["UC-5: Record Microphone Audio"]
        UC6["UC-6: View Real-Time Speech Transcript"]
        UC7["UC-7: Pause & Resume Session"]
        UC8["UC-8: Add Manual Notes & Highlights"]
        UC9["UC-9: Stop & Save Lecture Session"]
        UC10["UC-10: Open Saved Lecture Workspace"]
        UC11["UC-11: Edit Lecture Notes"]
        UC12["UC-12: View Recommended Resources"]
        UC13["UC-13: Bookmark & Save Resources"]
        UC14["UC-14: Study Flashcards (Flip / Nav)"]
        UC15["UC-15: Take Self-Assessment Quiz"]
        UC16["UC-16: Manage Academic Calendar"]
        UC17["UC-17: Ask AI Study Assistant"]
        UC18["UC-18: View Progress & Analytics"]
        UC19["UC-19: Manage Notifications"]
        UC20["UC-20: Configure Settings"]
    end

    %% Actor Connections
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

    %% Includes & Extends
    UC4 .->|includes| UC5
    UC5 .->|includes| UC6
    UC9 .->|includes| UC10
    UC14 .->|extends| UC10
    UC15 .->|extends| UC10
    UC17 .->|extends| UC10
```

---

## 2. Key Use Case Descriptions

### UC-4: Start Live Lecture Session
- **Primary Actor**: Student
- **Preconditions**: User is logged in and located on Dashboard or Subject view.
- **Main Success Scenario**:
  1. Student clicks **Go Live** or **Start Recording**.
  2. Browser prompts for microphone permission.
  3. System initializes `MediaRecorder` audio capture and `SpeechEngine` speech recognition.
  4. Interface displays recording timer, live waveform, and active transcript pane.

### UC-9: Stop & Save Lecture Session
- **Primary Actor**: Student
- **Preconditions**: Live recording session is in progress or paused.
- **Main Success Scenario**:
  1. Student clicks **Finish & Save**.
  2. System terminates audio recording and speech engine streams.
  3. System triggers automated AI summarization of transcript and extracted notes.
  4. System persists lecture record (with audio blob, summary, and flashcards) to IndexedDB `classes` store.
  5. System redirects student to the saved Lecture Workspace view (`notes:id`).

### UC-14: Study Flashcards
- **Primary Actor**: Student
- **Preconditions**: Lecture workspace or Flashcards module is active.
- **Main Success Scenario**:
  1. Student selects **Flashcards** view.
  2. System loads flashcard deck generated from lecture notes.
  3. Student flips cards by clicking or pressing `Space`, and navigates using `Left`/`Right` arrow keys.
