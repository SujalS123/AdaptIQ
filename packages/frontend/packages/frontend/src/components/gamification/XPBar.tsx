import React from 'react';
import { Card } from '../ui/Card.tsx';

interface XPBarProps {
  currentXP: number;
  level: number;
}

export const XPBar: React.FC<XPBarProps> = ({ currentXP, level }) => {
  const xpNeeded = level * 1000;
  const percentage = Math.min(100, (currentXP / xpNeeded) * 100);

  return (
    <Card style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
        <span>Level {level} Explorer</span>
        <span style={{ color: 'var(--color-primary)' }}>
          {currentXP} / {xpNeeded} XP
        </span>
      </div>
      
      {/* Progress track */}
      <div style={{ height: '10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </Card>
  );
};
