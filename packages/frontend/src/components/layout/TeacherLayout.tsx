import React from 'react';
import { Outlet } from 'react-router-dom';
import { TeacherSidebar } from '../nova/TeacherSidebar.tsx';

const TeacherLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <TeacherSidebar />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default TeacherLayout;
