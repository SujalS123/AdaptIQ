import React, { useState } from 'react';
import { Card } from '../ui/Card.tsx';
import { Sparkles, Brain } from 'lucide-react';

export const NovaMemoryCard: React.FC = () => {
  const [showMemories, setShowMemories] = useState(false);

  const memories = [
    { type: 'preferred_style', content: 'Prefers explanations using analogies (especially cricket matches).' },
    { type: 'weak_concept', content: 'Struggled with Database 3NF decomposition last Tuesday.' },
    { type: 'personal_fact', content: 'Studies most productively during late evening (9 PM - 11 PM).' },
  ];

  return (
    <div style={{ marginTop: '12px', marginBottom: '12px' }}>
      <div
        onClick={() => setShowMemories(!showMemories)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          color: 'var(--color-primary)',
          cursor: 'pointer',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <Brain size={12} /> {showMemories ? 'Hide cognitive memories' : 'Show cognitive memories (3 slots captured)'}
      </div>

      {showMemories && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          {memories.map((mem, i) => (
            <Card
              key={i}
              style={{
                padding: '10px 14px',
                background: 'var(--bg-secondary)',
                border: '1px dashed var(--border-color)',
                fontSize: '11.5px',
                lineHeight: '1.4',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              className="animate-scale-up"
            >
              <Sparkles size={10} color="var(--color-accent)" />
              <span>{mem.content}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
