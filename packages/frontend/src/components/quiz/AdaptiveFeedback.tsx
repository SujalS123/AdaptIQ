import React from 'react';
import { Card } from '../ui/Card.tsx';

interface AdaptiveFeedbackProps {
  isCorrect: boolean;
  explanation: string;
}

export const AdaptiveFeedback: React.FC<AdaptiveFeedbackProps> = ({ isCorrect, explanation }) => {
  return (
    <Card
      style={{
        padding: '16px 20px',
        backgroundColor: isCorrect ? 'var(--bg-secondary)' : 'var(--bg-secondary)',
        borderLeft: isCorrect ? '4px solid var(--color-secondary)' : '4px solid var(--color-danger)',
        borderRadius: '8px',
      }}
      className="animate-scale-up"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h4 style={{ color: isCorrect ? 'var(--color-secondary)' : 'var(--color-danger)', margin: '0px', fontSize: '14.5px' }}>
          {isCorrect ? '✨ Correct Answer!' : '⚠️ Incorrect. Let\'s learn:'}
        </h4>
        <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
          {explanation}
        </p>
      </div>
    </Card>
  );
};
