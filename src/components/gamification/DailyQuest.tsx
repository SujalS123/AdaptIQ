import React from 'react';
import { Card } from '../ui/Card.tsx';
import { CheckCircle, Circle } from 'lucide-react';

export const DailyQuest: React.FC = () => {
  const quests = [
    { title: 'Chat with Nova about DBMS notes', complete: true },
    { title: 'Solve 1 Adaptive IRT Quiz', complete: false },
    { title: 'Maintain your active study streak', complete: true },
  ];

  return (
    <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '15px', margin: '0px' }}>Daily Quests</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {quests.map((quest, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
            {quest.complete ? (
              <CheckCircle size={18} color="var(--color-secondary)" />
            ) : (
              <Circle size={18} color="var(--text-muted)" />
            )}
            <span style={{ color: quest.complete ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: quest.complete ? 'line-through' : 'none' }}>
              {quest.title}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
export default DailyQuest;
