import React from 'react';
import { Card } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';
import { Award, RefreshCw, Zap } from 'lucide-react';

interface QuizResultProps {
  history: Array<{ q: any; correct: boolean; oldTheta: number; newTheta: number }>;
  theta: number;
}

export const QuizResult: React.FC<QuizResultProps> = ({ history, theta }) => {
  const correctCount = history.filter(h => h.correct).length;
  const xpEarned = correctCount * 50 + (theta > 0 ? 100 : 50);

  return (
    <Card className="animate-scale-up" style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center', padding: '40px 30px' }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-secondary-glow)',
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <Award size={36} color="var(--color-secondary)" />
      </div>

      <h2 style={{ marginBottom: '8px' }}>Practice Complete!</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '24px' }}>
        Nova has updated your Lifelong Learner DNA with these cognitive shifts.
      </p>

      {/* Stats Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <Card style={{ padding: '16px 10px', background: 'var(--bg-secondary)', color: 'white' }}>
          <span style={{ display: 'block', fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)' }}>
            {correctCount}/{history.length}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Score</span>
        </Card>
        
        <Card style={{ padding: '16px 10px', background: 'var(--bg-secondary)', color: 'white' }}>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
            {theta.toFixed(2)}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ability (θ)</span>
        </Card>
        
        <Card style={{ padding: '16px 10px', background: 'var(--bg-secondary)', color: 'white' }}>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-accent)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
            <Zap size={16} /> +{xpEarned}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>XP Earned</span>
        </Card>
      </div>

      {/* Dynamic progression list */}
      <h3 style={{ fontSize: '15px', textAlign: 'left', marginBottom: '12px' }}>Psychometric Calibration Path</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px', textAlign: 'left' }}>
        {history.map((h, i) => (
          <div
            key={i}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'var(--bg-secondary)', color: 'white',
              borderLeft: h.correct ? '4px solid var(--color-secondary)' : '4px solid var(--color-danger)',
              fontSize: '13px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Q{i + 1}: {h.q.questionText.slice(0, 48)}...</span>
            <span style={{ fontWeight: 600 }}>
              θ: {h.oldTheta.toFixed(1)} ➡️ {h.newTheta.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      <Button variant="primary" onClick={() => window.location.reload()} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <RefreshCw size={16} /> Retake / Try Another Quiz
      </Button>
    </Card>
  );
};
