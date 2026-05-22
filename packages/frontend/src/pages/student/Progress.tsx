import React from 'react';
import { NovaSidebar } from '../../components/nova/NovaSidebar.tsx';
import { Card } from '../../components/ui/Card.tsx';
import { Brain, Award } from 'lucide-react';

export const Progress: React.FC = () => {
  const masteryConcepts = [
    { name: 'Database Keys (Primary, Foreign)', score: 0.92, subject: 'DBMS' },
    { name: 'Database Normalization (1NF, 2NF)', score: 0.78, subject: 'DBMS' },
    { name: 'Multivalued Dependencies (4NF)', score: 0.35, subject: 'DBMS' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <NovaSidebar />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }} className="gradient-text">
          My Learner DNA Cognitive Map
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <Card>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
              <Brain size={18} color="var(--color-primary)" /> Cognitive Parameters
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', fontSize: '13.5px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Comprehension Speed:</span>
                <strong style={{ float: 'right' }}>1.2x (Fast)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Attention Window:</span>
                <strong style={{ float: 'right' }}>42 Minutes</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Dominant Modality:</span>
                <strong style={{ float: 'right', textTransform: 'capitalize' }}>Visual Modality</strong>
              </div>
            </div>
          </Card>

          <Card>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
              <Award size={18} color="var(--color-secondary)" /> Psychometric Metrics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', fontSize: '13.5px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Global Ability (θ):</span>
                <strong style={{ float: 'right', color: 'var(--color-secondary)' }}>+1.45 (Advanced)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Quizzes Attempted:</span>
                <strong style={{ float: 'right' }}>14 sessions</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Streak Performance:</span>
                <strong style={{ float: 'right' }}>Top 5% of class</strong>
              </div>
            </div>
          </Card>
        </div>

        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Concept-Level Mastery Grids</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {masteryConcepts.map((concept, i) => {
            const pct = concept.score * 100;
            return (
              <Card key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{concept.subject}</span>
                  <h4 style={{ fontSize: '14.5px', margin: '2px 0px' }}>{concept.name}</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '240px' }}>
                  <div style={{ flex: 1, height: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: pct >= 70 ? 'var(--color-secondary)' : pct >= 50 ? 'var(--color-primary)' : 'var(--color-danger)',
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, width: '40px', textAlign: 'right' }}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default Progress;
