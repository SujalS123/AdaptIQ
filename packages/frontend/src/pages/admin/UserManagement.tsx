import React from 'react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';

export const UserManagement: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0px 0px 8px 0px' }} className="gradient-text">
            User Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Manage students, teachers, and admins.
          </p>
        </div>
        <Button variant="primary">Invite User</Button>
      </div>

      <Card style={{ padding: '0px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '16px', fontWeight: 600, fontSize: '14px' }}>Name</th>
              <th style={{ padding: '16px', fontWeight: 600, fontSize: '14px' }}>Email</th>
              <th style={{ padding: '16px', fontWeight: 600, fontSize: '14px' }}>Role</th>
              <th style={{ padding: '16px', fontWeight: 600, fontSize: '14px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '16px' }}>Priya Sharma</td>
              <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>priya@adaptiq.edu</td>
              <td style={{ padding: '16px' }}><span style={{ backgroundColor: 'var(--color-primary-glow)', color: 'var(--color-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>STUDENT</span></td>
              <td style={{ padding: '16px' }}><span style={{ color: 'var(--color-success)' }}>Active</span></td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '16px' }}>Professor Sharma</td>
              <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>sharma@adaptiq.edu</td>
              <td style={{ padding: '16px' }}><span style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>TEACHER</span></td>
              <td style={{ padding: '16px' }}><span style={{ color: 'var(--color-success)' }}>Active</span></td>
            </tr>
            <tr>
              <td style={{ padding: '16px' }}>Rohan</td>
              <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>admin@adaptiq.edu</td>
              <td style={{ padding: '16px' }}><span style={{ backgroundColor: 'var(--color-danger-glow)', color: 'var(--color-danger)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>ADMIN</span></td>
              <td style={{ padding: '16px' }}><span style={{ color: 'var(--color-success)' }}>Active</span></td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default UserManagement;
