import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Brain,
  BookOpen,
  Calendar,
  Award,
  MessageSquare,
  BarChart3,
  AlertTriangle,
  Upload,
  ClipboardList,
  FileQuestion,
  Users,
  Activity,
  Building2,
  ArrowRightLeft,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const studentLinks: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <Brain size={18} /> },
  { label: 'Practice & Quiz', path: '/quiz', icon: <BookOpen size={18} /> },
  { label: 'Study Plan', path: '/plan', icon: <Calendar size={18} /> },
  { label: 'Badges & XP', path: '/progress', icon: <Award size={18} /> },
  { label: 'Interview Coach', path: '/interview', icon: <MessageSquare size={18} /> },
];

const teacherLinks: NavItem[] = [
  { label: 'Class Dashboard', path: '/teacher', icon: <BarChart3 size={18} /> },
  { label: 'At-Risk Alerts', path: '/teacher/alerts', icon: <AlertTriangle size={18} /> },
  { label: 'Upload Content', path: '/teacher/content', icon: <Upload size={18} /> },
  { label: 'Assignment Builder', path: '/teacher/assignments', icon: <ClipboardList size={18} /> },
  { label: 'Quiz Generator', path: '/teacher/quiz-generator', icon: <FileQuestion size={18} /> },
];

const adminLinks: NavItem[] = [
  { label: 'User Management', path: '/admin/users', icon: <Users size={18} /> },
  { label: 'Platform Analytics', path: '/admin/analytics', icon: <Activity size={18} /> },
  { label: 'Institution & Billing', path: '/admin/institution', icon: <Building2 size={18} /> },
];

export const NovaSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine active role section from current path
  const isTeacher = currentPath.startsWith('/teacher');
  const isAdmin = currentPath.startsWith('/admin');
  const activeRole: 'student' | 'teacher' | 'admin' = isTeacher
    ? 'teacher'
    : isAdmin
      ? 'admin'
      : 'student';

  const navLinks =
    activeRole === 'teacher'
      ? teacherLinks
      : activeRole === 'admin'
        ? adminLinks
        : studentLinks;

  const roleLabelMap = {
    student: '— STUDENT —',
    teacher: '— TEACHER —',
    admin: '— ADMIN —',
  };

  const isLinkActive = (linkPath: string) => {
    if (linkPath === '/' || linkPath === '/teacher') {
      return currentPath === linkPath;
    }
    return currentPath.startsWith(linkPath);
  };

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
        minHeight: '100vh',
        justifyContent: 'space-between',
      }}
    >
      {/* Top section: branding + navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          <Sparkles size={24} color="var(--color-primary)" />
          <h2
            style={{ fontSize: '20px', margin: '0px', fontWeight: 700 }}
            className="gradient-text"
          >
            AdaptIQ
          </h2>
        </div>

        {/* Role label */}
        <div
          style={{
            fontSize: '10.5px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: 'var(--text-muted)',
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          {roleLabelMap[activeRole]}
        </div>

        {/* Navigation links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navLinks.map((link) => (
            <div
              key={link.path}
              style={linkStyle(isLinkActive(link.path))}
              onClick={() => navigate(link.path)}
            >
              {link.icon}
              <span>{link.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section: role switcher */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ArrowRightLeft size={12} />
          Switch View
        </div>
        {activeRole !== 'student' && (
          <div style={switchLinkStyle()} onClick={() => navigate('/')}>
            Switch to Student View
          </div>
        )}
        {activeRole !== 'teacher' && (
          <div style={switchLinkStyle()} onClick={() => navigate('/teacher')}>
            Switch to Teacher View
          </div>
        )}
        {activeRole !== 'admin' && (
          <div style={switchLinkStyle()} onClick={() => navigate('/admin/users')}>
            Switch to Admin View
          </div>
        )}
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

const switchLinkStyle = (): React.CSSProperties => ({
  fontSize: '12px',
  fontWeight: 500,
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '6px 12px',
  borderRadius: '6px',
  border: '1px solid transparent',
  transition: 'all 0.2s ease',
});

export default NovaSidebar;
