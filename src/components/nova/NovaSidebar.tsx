import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { Sparkles, Brain, Award, Calendar, BookOpen, MessageSquare, LogOut } from 'lucide-react';

export const NovaSidebar: React.FC = () => {
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
        background: 'var(--bg-sidebar)',
      }}
    >
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <Sparkles size={24} color="var(--color-primary)" />
        <h2 style={{ fontSize: '20px', margin: '0px', fontWeight: 700, color: 'var(--text-sidebar)' }}>
          EduAI
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div 
          style={linkStyle(currentPath === '/')}
          onClick={() => navigate('/')}
        >
          <Brain size={18} />
          <span>Dashboard</span>
        </div>
        <div 
          style={linkStyle(currentPath === '/quiz')}
          onClick={() => navigate('/quiz')}
        >
          <BookOpen size={18} />
          <span>Practice & Quiz</span>
        </div>
        <div 
          style={linkStyle(currentPath === '/plan')}
          onClick={() => navigate('/plan')}
        >
          <Calendar size={18} />
          <span>Study Plan</span>
        </div>
        <div 
          style={linkStyle(currentPath === '/progress')}
          onClick={() => navigate('/progress')}
        >
          <Award size={18} />
          <span>Badges & XP</span>
        </div>
        <div 
          style={linkStyle(currentPath === '/interview')}
          onClick={() => navigate('/interview')}
        >
          <MessageSquare size={18} />
          <span>Interview Coach</span>
        </div>
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid #333C5A', paddingTop: '24px' }}>
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
  color: active ? 'var(--text-sidebar)' : 'var(--text-sidebar-muted)',
  backgroundColor: active ? 'var(--color-primary)' : 'transparent',
  border: 'none',
  transition: 'all 0.2s ease',
});
