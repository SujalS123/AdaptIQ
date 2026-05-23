import React from 'react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Sparkles } from 'lucide-react';

export const QuizGenerator: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0px 0px 8px 0px' }} className="gradient-text">
          AI Quiz Generator
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Automatically generate diverse question sets from ingested RAG syllabus.
        </p>
      </div>

      <Card style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ padding: '20px', borderRadius: '8px', border: '1px dashed var(--color-primary)', backgroundColor: 'var(--color-primary-glow)', textAlign: 'center' }}>
            <Sparkles size={32} color="var(--color-primary)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ margin: '0px 0px 8px 0px', fontSize: '18px' }}>One-Click Generation</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', marginInline: 'auto' }}>
              Select a namespace and the AI Engine will spawn 10 balanced questions targeting all cognitive layers.
            </p>
          </div>

          <Button variant="accent">Spawn Quiz for 'course-dbms'</Button>
        </div>
      </Card>
    </div>
  );
};

export default QuizGenerator;
