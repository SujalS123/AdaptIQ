import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { LayoutDashboard, Users, AlertTriangle, PenTool, Database, LogOut } from 'lucide-react';

export const TeacherSidebar: React.FC = () => {
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
        onClick={() => navigate('/teacher')}
      >
        <div style={{ backgroundColor: 'var(--color-primary)', padding: '6px', borderRadius: '8px' }}>
          <LayoutDashboard size={20} color="white" />
        </div>
        <h2 style={{ fontSize: '18px', margin: '0px', fontWeight: 700 }}>
          Teacher Portal
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={linkStyle(currentPath === '/teacher')} onClick={() => navigate('/teacher')}>
          <LayoutDashboard size={18} /><span>Class Dashboard</span>
        </div>
        <div style={linkStyle(currentPath === '/teacher/students')} onClick={() => navigate('/teacher/students')}>
          <Users size={18} /><span>Student Roster</span>
        </div>
        <div style={linkStyle(currentPath === '/teacher/alerts')} onClick={() => navigate('/teacher/alerts')}>
          <AlertTriangle size={18} /><span>AI Alerts</span>
        </div>
        <div style={linkStyle(currentPath === '/teacher/assignments')} onClick={() => navigate('/teacher/assignments')}>
          <PenTool size={18} /><span>Assignments</span>
        </div>
        <div style={linkStyle(currentPath === '/teacher/upload')} onClick={() => navigate('/teacher/upload')}>
          <Database size={18} /><span>RAG Content Upload</span>
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
