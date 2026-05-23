import React from 'react';
import { Outlet } from 'react-router-dom';
import { NovaSidebar } from '../nova/NovaSidebar.tsx';
import { NovaBubble } from '../nova/NovaBubble.tsx';
import { AccessibilityPanel } from '../accessibility/AccessibilityPanel.tsx';

export const MainLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Dynamic persistent sidebar navigation */}
      <NovaSidebar />

      {/* Primary viewport content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <Outlet />
      </div>

      {/* Floating interactive tools widgets */}
      <NovaBubble />
      <AccessibilityPanel />
    </div>
  );
};

export default MainLayout;
