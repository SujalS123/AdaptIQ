import React, { useState } from 'react';

import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Sparkles, Brain, Send } from 'lucide-react';

export const InterviewCoach: React.FC = () => {
  const [chat, setChat] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: "Welcome to your Academic Viva simulator. I will examine you on Professor Sharma's uploaded course materials. Let's begin: explain what a 'Partial Dependency' is, and why it violates Second Normal Form?",
    },
  ]);
  const [input, setInput] = useState('');
  const [evalText, setEvalText] = useState<string | null>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { sender: 'user' as const, text: input };
    setChat(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      setChat(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "Excellent answer. You correctly noted that a partial dependency occurs when a non-prime attribute depends on only a part of a composite primary key. Let's probe deeper: how would you decompose a table with columns (StudentID, CourseID, StudentName, CourseName, Grade) into 2NF? What primary keys would you assign to the new tables?",
        },
      ]);
      setEvalText("Last Answer Evaluation: Accuracy 92% • Fluency 88%. Strong recall of DBMS concepts. Good use of technical definitions.");
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700 }} className="gradient-text">
            AI Interview & Viva Coach
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px' }}>
            Simulate technical placement interviews and academic vivas grounded in your actual coursework.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px', flex: 1 }}>
          {/* Interview Dialogue Interface */}
          <Card style={{ display: 'flex', flexDirection: 'column', height: '540px', padding: '0px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Brain size={18} color="var(--color-primary)" />
              <h4 style={{ margin: '0px', fontSize: '15px' }}>Academic Viva Simulation (DBMS)</h4>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {chat.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    maxWidth: '85%',
                    color: 'var(--text-primary)',
                    background: msg.sender === 'user' ? 'var(--color-primary)' : 'var(--bg-secondary)',
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Speak or type your answer in detail..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <Button variant="primary" onClick={handleSend}>
                <Send size={16} />
              </Button>
            </div>
          </Card>

          {/* Real-time scoring analysis */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                <Sparkles size={16} color="var(--color-accent)" /> Viva Performance Metrics
              </h3>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Technical Accuracy:</span>
                  <strong style={{ float: 'right', color: 'var(--color-secondary)' }}>90%</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Communication Fluency:</span>
                  <strong style={{ float: 'right', color: 'var(--color-primary)' }}>85%</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Subject:</span>
                  <strong style={{ float: 'right' }}>DBMS Sem-5</strong>
                </div>
              </div>
            </Card>

            {evalText && (
              <Card style={{ borderLeft: '4px solid var(--color-secondary)' }} className="animate-scale-up">
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{evalText}</p>
              </Card>
            )}
          </div>
        </div>
    </div>
  );
};
export default InterviewCoach;
