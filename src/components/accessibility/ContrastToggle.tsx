import React from 'react';
import { Button } from '../ui/Button.tsx';

export const ContrastToggle: React.FC = () => {
  const toggle = () => {
    document.documentElement.classList.toggle('high-contrast-mode');
  };
  return (
    <Button variant="ghost" onClick={toggle}>
      👁️ Contrast Toggle
    </Button>
  );
};
