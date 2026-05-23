import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { Shield, Activity, Users, Settings, Server, LogOut } from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const currentPath = location.pathname;

  return (
    <div
      style={{
        width: '280px',
        borderRight: '1px solid var(--border-color)',
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        background: 'var(--bg-secondary)',
      }}
    >
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer' }}
        onClick={() => navigate('/admin')}
      >
        <div style={{ backgroundColor: 'var(--color-danger)', padding: '6px', borderRadius: '8px' }}>
          <Shield size={20} color="white" />
        </div>
        <h2 style={{ fontSize: '18px', margin: '0px', fontWeight: 700 }}>
          Admin Console
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={linkStyle(currentPath === '/admin')} onClick={() => navigate('/admin')}>
          <Activity size={18} /><span>Platform Analytics</span>
        </div>
        <div style={linkStyle(currentPath === '/admin/users')} onClick={() => navigate('/admin/users')}>
          <Users size={18} /><span>User Management</span>
        </div>
        <div style={linkStyle(currentPath === '/admin/institution')} onClick={() => navigate('/admin/institution')}>
          <Settings size={18} /><span>Institution Settings</span>
        </div>
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
        <div 
          style={linkStyle(false)}
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          <LogOut size={18} color="var(--color-danger)" />
          <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>Log Out</span>
        </div>
      </div>
    </div>
  );
};

const linkStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '14.5px',
  fontWeight: 500,
  cursor: 'pointer',
  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
  backgroundColor: active ? 'var(--bg-card)' : 'transparent',
  border: active ? '1px solid var(--border-color)' : '1px solid transparent',
  transition: 'all 0.2s ease',
});
