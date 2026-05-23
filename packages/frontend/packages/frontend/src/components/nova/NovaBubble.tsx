import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { NovaChat } from './NovaChat.tsx';

export const NovaBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const bubbleStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
  };

  const windowStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '80px',
    right: '0',
    width: '400px',
    height: '600px',
    display: isOpen ? 'block' : 'none',
    zIndex: 10000,
  };

  return (
    <div style={bubbleStyle}>
      <Button
        variant="primary"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 8px 32px 0 var(--color-primary-glow)',
          border: '1px solid var(--border-color)',
        }}
        className="animate-float"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </Button>

      <div style={windowStyle}>
        <NovaChat onClose={() => setIsOpen(false)} />
      </div>
    </div>
  );
};
