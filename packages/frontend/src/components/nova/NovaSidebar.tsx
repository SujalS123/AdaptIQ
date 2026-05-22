import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Brain, Award, Calendar, BookOpen, MessageSquare } from 'lucide-react';

export const NovaSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
        onClick={() => navigate('/')}
      >
        <Sparkles size={24} color="var(--color-primary)" />
        <h2 style={{ fontSize: '20px', margin: '0px', fontWeight: 700 }} className="gradient-text">
          AdaptIQ
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
