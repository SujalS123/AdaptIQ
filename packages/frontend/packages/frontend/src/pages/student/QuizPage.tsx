import React from 'react';
import { NovaSidebar } from '../../components/nova/NovaSidebar.tsx';
import { NovaBubble } from '../../components/nova/NovaBubble.tsx';
import { AccessibilityPanel } from '../../components/accessibility/AccessibilityPanel.tsx';
import { QuizPlayer } from '../../components/quiz/QuizPlayer.tsx';

export const QuizPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <NovaSidebar />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <QuizPlayer />
      </div>
      <NovaBubble />
      <AccessibilityPanel />
    </div>
  );
};
export default QuizPage;
