import React from 'react';
import { Button } from '../ui/Button.tsx';

interface TTSButtonProps {
  textSelector?: string;
}

export const TTSButton: React.FC<TTSButtonProps> = ({ textSelector = 'body' }) => {
  const speak = () => {
    const target = document.querySelector(textSelector);
    if (!target) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(target.textContent || '');
    window.speechSynthesis.speak(utterance);
  };
  
  return (
    <Button variant="ghost" onClick={speak} style={{ padding: '6px 12px', fontSize: '12px' }}>
      🔊 Read Text
    </Button>
  );
};
