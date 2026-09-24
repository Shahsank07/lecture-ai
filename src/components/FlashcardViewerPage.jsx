import { useState } from 'react';
import { ArrowLeft, Sparkles, HelpCircle } from 'lucide-react';
import FlashcardViewer from './FlashcardViewer';
import { Card, Button } from './ui';

const DEMO_FLASHCARDS = [
  { id: '1', question: 'What is a Binary Search Tree (BST)?', answer: 'A node-based binary tree data structure where the left subtree contains values smaller than the parent node and the right subtree contains values greater.' },
  { id: '2', question: 'What is the average time complexity for searching in a BST?', answer: 'O(log n) average time complexity, where n is the number of nodes in the tree.' },
  { id: '3', question: 'What is 3NF in Database Normalization?', answer: 'Third Normal Form (3NF) requires the table to be in 2NF and have no transitive functional dependencies.' },
  { id: '4', question: 'What is the purpose of Process Scheduling in Operating Systems?', answer: 'To maximize CPU utilization and throughput by selecting an available process for execution on the CPU.' },
  { id: '5', question: 'What is Inorder Traversal of a Binary Search Tree?', answer: 'Traversing Left subtree -> Root node -> Right subtree, which visits BST nodes in ascending sorted order.' }
];

const DEMO_QUIZ = [
  { id: '1', question: 'Which time complexity applies to BST insertion in the worst case (unbalanced)?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], correctIndex: 2 },
  { id: '2', question: 'A database table is in 3NF if it is in 2NF and contains no:', options: ['Partial dependencies', 'Transitive dependencies', 'Primary keys', 'Foreign keys'], correctIndex: 1 },
  { id: '3', question: 'Which process scheduling algorithm can cause starvation for low priority processes?', options: ['Round Robin', 'FCFS', 'Priority Scheduling', 'Shortest Job First'], correctIndex: 2 }
];

function FlashcardViewerPage({ currentClass, initialMode = 'flashcards', onNavigate }) {
  const cards = currentClass?.summary?.flashcards?.length ? currentClass.summary.flashcards : DEMO_FLASHCARDS;
  const quiz = currentClass?.summary?.quiz?.length ? currentClass.summary.quiz : DEMO_QUIZ;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <button className="back-btn" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <div>
            <h1>{initialMode === 'quiz' ? 'Lecture Quiz' : 'Study Flashcards'}</h1>
            <p>{currentClass?.title ? `Subject: ${currentClass.title}` : 'Review key lecture concepts and test your knowledge'}</p>
          </div>
        </div>
      </div>

      <Card style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <FlashcardViewer 
          flashcards={cards} 
          quiz={quiz} 
        />
      </Card>
    </div>
  );
}

export default FlashcardViewerPage;
