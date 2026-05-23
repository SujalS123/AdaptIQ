import React from 'react';
import { Card } from '../../components/ui/Card.tsx';
import { Activity, Server, Users, Database } from 'lucide-react';

export const PlatformAnalytics: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0px 0px 8px 0px' }} className="gradient-text">
          Platform Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Global telemetry for the AdaptIQ deployment.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Users size={24} color="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: '15px' }}>Total Active Users</h3>
          </div>
          <span style={{ fontSize: '32px', fontWeight: 700 }}>1,204</span>
        </Card>
        
        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Activity size={24} color="var(--color-success)" />
            <h3 style={{ margin: 0, fontSize: '15px' }}>Avg API Latency</h3>
          </div>
          <span style={{ fontSize: '32px', fontWeight: 700 }}>142ms</span>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Database size={24} color="var(--color-accent)" />
            <h3 style={{ margin: 0, fontSize: '15px' }}>Pinecone Vectors</h3>
          </div>
          <span style={{ fontSize: '32px', fontWeight: 700 }}>45,219</span>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Server size={24} color="var(--text-secondary)" />
            <h3 style={{ margin: 0, fontSize: '15px' }}>System Uptime</h3>
          </div>
          <span style={{ fontSize: '32px', fontWeight: 700 }}>99.99%</span>
        </Card>
      </div>
    </div>
  );
};

export default PlatformAnalytics;
