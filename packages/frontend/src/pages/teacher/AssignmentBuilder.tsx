import React from 'react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';

export const AssignmentBuilder: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0px 0px 8px 0px' }} className="gradient-text">
          Adaptive Assignment Builder
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Create dynamic homework that scales in difficulty based on the student's XP level.
        </p>
      </div>

      <Card style={{ padding: '24px' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>Assignment Title</label>
            <input type="text" placeholder="e.g. Week 4: Indexing Algorithms" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>Target XP Threshold</label>
            <input type="number" placeholder="100" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
          </div>

          <Button variant="primary">Generate & Publish Assignment</Button>
        </form>
      </Card>
    </div>
  );
};

export default AssignmentBuilder;
