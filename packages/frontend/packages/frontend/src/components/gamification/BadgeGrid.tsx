import React from 'react';
import { Card } from '../ui/Card.tsx';

export const BadgeGrid: React.FC = () => {
  const badges = [
    { title: 'Psychometric Pioneer', desc: 'Calibrated your theta score to standard.', icon: '⚡' },
    { title: 'Memory Master', desc: 'Stored over 5 cognitive details with Nova.', icon: '🧠' },
    { title: 'Normalizer', desc: 'Solved a database 3NF practice quiz.', icon: '📊' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
      {badges.map((badge, i) => (
        <Card key={i} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '4px' }}>{badge.icon}</div>
          <span style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>
            {badge.title}
          </span>
          <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>{badge.desc}</span>
        </Card>
      ))}
    </div>
  );
};
