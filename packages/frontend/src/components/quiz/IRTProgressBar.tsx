import React from 'react';
import { Sparkles } from 'lucide-react';

interface IRTProgressBarProps {
  theta: number; // Current theta ability estimate (-3.0 to +3.0)
  questionIndex: number;
  totalQuestions: number;
}

export const IRTProgressBar: React.FC<IRTProgressBarProps> = ({ theta, questionIndex, totalQuestions }) => {
  // Map theta (-3.0 to +3.0) to a percentage (0% to 100%)
  const percentage = Math.max(0, Math.min(100, ((theta + 3) / 6) * 100));

  return (
    <div style={{ margin: '20px 0px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Question {questionIndex} of {totalQuestions} (Adaptive IRT Play)
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Sparkles size={12} /> Ability Level (θ): {theta.toFixed(2)}
        </span>
      </div>

      {/* Coordinate axis container */}
      <div
        style={{
          height: '24px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-full)',
          position: 'relative',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Tick markers */}
        <div style={{ position: 'absolute', left: '10%', width: '1px', height: '8px', background: 'var(--text-muted)' }} />
        <div style={{ position: 'absolute', left: '50%', width: '1px', height: '12px', background: 'var(--border-color)' }} />
        <div style={{ position: 'absolute', right: '10%', width: '1px', height: '8px', background: 'var(--text-muted)' }} />

        {/* Dynamic Glowing Indicator */}
        <div
          style={{
            position: 'absolute',
            left: `calc(${percentage}% - 12px)`,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            boxShadow: '0 0 15px var(--color-primary-glow)',
            border: '2px solid white',
            transition: 'left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '9px',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          θ
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', padding: '0 8px' }}>
        <span>Difficulty: Easy (-3.0)</span>
        <span>Standard (0.0)</span>
        <span>Advanced (+3.0)</span>
      </div>
    </div>
  );
};
