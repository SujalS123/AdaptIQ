import React from 'react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';

export const InstitutionManagement: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0px 0px 8px 0px' }} className="gradient-text">
          Institution Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Configure integrations, API keys, and platform settings.
        </p>
      </div>

      <Card style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>API Integrations</h3>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>OpenAI API Key</label>
            <input type="password" value="sk-xxxxxxxxxxxxxxxxxxxxxxxx" readOnly style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>Pinecone Environment</label>
            <input type="text" value="us-west1-gcp" readOnly style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }} />
          </div>

          <Button variant="primary">Save Changes</Button>
        </form>
      </Card>
    </div>
  );
};

export default InstitutionManagement;
