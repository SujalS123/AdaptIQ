import React from 'react';
import { Card } from '../ui/Card.tsx';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ streak }) => {
  return (
    <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: 'hsla(18, 93%, 53%, 0.15)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Flame size={20} color="var(--color-warning)" />
      </div>
      <div>
        <span style={{ display: 'block', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {streak} Days
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active learning streak!</span>
      </div>
    </Card>
  );
};
export default StreakCounter;
