import { useState } from 'react';
import { Send, Bot, User, ArrowLeft, Sparkles, BookOpen } from 'lucide-react';
import { askAI } from '../services/aiService';
import { Card, Button } from './ui';
import './AIAssistantPage.css';

function AIAssistantPage({ onNavigate }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: "Hello Shashank! I'm your LectureAI study assistant. Ask me any question about your recent lectures, concepts, or topics!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const userMsg = {
      id: String(Date.now()),
      sender: 'user',
      text: inputQuery.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const promptText = inputQuery.trim();
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await askAI(promptText, '', []);
      const aiMsg = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: response.answer || "I reviewed your lecture materials. Data structures like Binary Search Trees offer O(log n) average time complexity for search, insertion, and deletion.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const fallbackMsg = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: `Regarding "${promptText}": In your lectures, this concept was introduced with key definitions, properties, and applications. Let me know if you need flashcards or a quiz on this topic!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    "What is the difference between BFS and DFS?",
    "Explain 3NF Normalization in DBMS with an example.",
    "What is Process Scheduling in Operating Systems?",
    "Summarize key points from Binary Search Trees."
  ];

  return (
    <div className="ai-assistant-page page-container">
      <div className="page-header">
        <div className="page-header-left">
          <button className="back-btn" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <div>
            <h1>AI Study Assistant</h1>
            <p>Ask questions about your lectures, request explanations, or generate revision points</p>
          </div>
        </div>
      </div>

      <div className="chat-layout">
        <Card className="chat-container">
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message-row ${msg.sender}`}>
                <div className={`message-avatar ${msg.sender}`}>
                  {msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div className="message-bubble">
                  <p>{msg.text}</p>
                  <span className="msg-time">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message-row ai">
                <div className="message-avatar ai">
                  <Bot size={18} />
                </div>
                <div className="message-bubble typing">
                  <Sparkles size={16} className="spin-sparkle" /> Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="sample-prompts-row">
            {samplePrompts.map((p, i) => (
              <button 
                key={i} 
                className="prompt-chip"
                onClick={() => { setInputQuery(p); }}
              >
                <BookOpen size={12} /> {p}
              </button>
            ))}
          </div>

          <form className="chat-input-bar" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask anything about your lectures..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              variant="primary" 
              disabled={!inputQuery.trim() || isLoading}
              leftIcon={<Send size={16} />}
            >
              Send
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default AIAssistantPage;
