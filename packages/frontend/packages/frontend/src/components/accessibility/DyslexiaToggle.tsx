import React from 'react';
import { Button } from '../ui/Button.tsx';

export const DyslexiaToggle: React.FC = () => {
  const toggle = () => {
    document.documentElement.classList.toggle('dyslexia-mode');
  };
  return (
    <Button variant="ghost" onClick={toggle}>
      🔤 Dyslexia Toggle
    </Button>
  );
};
