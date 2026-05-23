import React from 'react';
import { Card } from '../../components/ui/Card.tsx';
import { AlertTriangle, BrainCircuit } from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';

export const AlertsPanel: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0px 0px 8px 0px' }} className="gradient-text">
          AI Early Warning System
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          EduAI Engine telemetry on struggling students requiring pedagogical intervention.
        </p>
      </div>

      <Card style={{ padding: '24px', borderLeft: '4px solid var(--color-danger)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--color-danger-glow)', borderRadius: '50%' }}>
              <AlertTriangle size={24} color="var(--color-danger)" />
            </div>
            <div>
              <h3 style={{ margin: '0px 0px 4px 0px', fontSize: '18px' }}>Amit Patel</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0px 0px 12px 0px', fontSize: '14px' }}>
                Cognitive Block Detected: Concurrency Control (CSE SEM-5)
              </p>
              <div style={{ fontSize: '13.5px', lineHeight: '1.5', padding: '12px', backgroundColor: 'var(--bg-secondary)', color: 'white', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>AI Diagnosis:</strong> Amit is consistently confusing "Strict Two-Phase Locking" with "Conservative Two-Phase Locking". He has failed the past 3 generated assessments on this topic.
              </div>
            </div>
          </div>
          <Button variant="accent">Initiate 1-on-1 Session</Button>
        </div>
      </Card>

      <Card style={{ padding: '24px', borderLeft: '4px solid var(--color-warning)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(234, 179, 8, 0.1)', borderRadius: '50%' }}>
              <BrainCircuit size={24} color="#eab308" />
            </div>
            <div>
              <h3 style={{ margin: '0px 0px 4px 0px', fontSize: '18px' }}>Neha Gupta</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0px 0px 12px 0px', fontSize: '14px' }}>
                Pacing Alert: Design & Analysis of Algorithms
              </p>
              <div style={{ fontSize: '13.5px', lineHeight: '1.5', padding: '12px', backgroundColor: 'var(--bg-secondary)', color: 'white', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>AI Diagnosis:</strong> Neha's study momentum has dropped by 60% over the last week. She has not opened the "Dynamic Programming" module.
              </div>
            </div>
          </div>
          <Button variant="primary">Send Automated Nudge</Button>
        </div>
      </Card>
    </div>
  );
};

export default AlertsPanel;
