import React from 'react';
import { Card } from '../../components/ui/Card.tsx';
import { Users, TrendingUp, AlertCircle, BookOpen } from 'lucide-react';

export const ClassDashboard: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0px 0px 8px 0px' }} className="gradient-text">
          Class Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          High-level analytics for Professor Sharma's classes.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Users size={24} color="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: '15px' }}>Total Students</h3>
          </div>
          <span style={{ fontSize: '32px', fontWeight: 700 }}>142</span>
        </Card>
        
        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <TrendingUp size={24} color="var(--color-success)" />
            <h3 style={{ margin: 0, fontSize: '15px' }}>Avg Class XP</h3>
          </div>
          <span style={{ fontSize: '32px', fontWeight: 700 }}>4,250</span>
        </Card>

        <Card style={{ padding: '20px', borderLeft: '4px solid var(--color-danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <AlertCircle size={24} color="var(--color-danger)" />
            <h3 style={{ margin: 0, fontSize: '15px' }}>At-Risk Students</h3>
          </div>
          <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-danger)' }}>12</span>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <BookOpen size={24} color="var(--color-accent)" />
            <h3 style={{ margin: 0, fontSize: '15px' }}>Active Assignments</h3>
          </div>
          <span style={{ fontSize: '32px', fontWeight: 700 }}>3</span>
        </Card>
      </div>

      <Card style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Recent Student Activity</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', color: 'white', borderRadius: '8px', borderLeft: '3px solid var(--color-primary)' }}>
            <strong>Priya Sharma</strong> just completed the "BCNF Normalization" interactive quiz with a score of 95%.
          </div>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', color: 'white', borderRadius: '8px', borderLeft: '3px solid var(--color-success)' }}>
            <strong>Rahul Kumar</strong> earned the "Database Architect" badge.
          </div>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', color: 'white', borderRadius: '8px', borderLeft: '3px solid var(--color-danger)' }}>
            <strong>Amit Patel</strong> failed the "Concurrency Control" quiz 3 times. AI Intervention triggered.
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClassDashboard;
