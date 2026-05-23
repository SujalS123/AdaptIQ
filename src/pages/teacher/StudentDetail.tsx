import React from 'react';
import { Card } from '../../components/ui/Card.tsx';
import { Brain, Search } from 'lucide-react';
import { Input } from '../../components/ui/Input.tsx';

export const StudentDetail: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0px 0px 8px 0px' }} className="gradient-text">
          Student Roster & Cognitive Profiles
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Search for a student to view their AI-generated Learner DNA.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', maxWidth: '500px' }}>
        <Input type="text" placeholder="Search by name or email..." style={{ flex: 1 }} />
      </div>

      <Card style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '18px' }}>
            PS
          </div>
          <div>
            <h2 style={{ margin: '0px 0px 4px 0px', fontSize: '20px' }}>Priya Sharma</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>priya@eduai.edu • CSE SEM-5</p>
          </div>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain size={18} color="var(--color-primary)" /> Cognitive DNA Profile
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', color: 'white', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Learning Style</span>
            <div style={{ marginTop: '8px', fontWeight: 600 }}>Visual / Interactive</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', color: 'white', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Strongest Domain</span>
            <div style={{ marginTop: '8px', fontWeight: 600 }}>Database Normalization</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', color: 'white', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Attention Span</span>
            <div style={{ marginTop: '8px', fontWeight: 600 }}>High (18-22 min sessions)</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentDetail;
