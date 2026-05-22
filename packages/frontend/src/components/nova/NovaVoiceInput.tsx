import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button.tsx';

interface NovaVoiceInputProps {
  onCapture: (transcript: string) => void;
  onCancel: () => void;
}

export const NovaVoiceInput: React.FC<NovaVoiceInputProps> = ({ onCapture, onCancel }) => {
  const [status, setStatus] = useState('Listening...');

  useEffect(() => {
    // If browser supports webkitSpeechRecognition, run it!
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Indian English/Accent support

      recognition.onstart = () => setStatus('Speak now (e.g. "explain normal forms")...');
      recognition.onerror = () => setStatus('Error capturing audio. Falling back...');
      recognition.onend = () => {};
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onCapture(transcript);
      };

      recognition.start();
      return () => recognition.stop();
    } else {
      // Graceful fallback mock
      const timer = setTimeout(() => {
        onCapture('Explain database normalization using cricket analogies');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        textAlign: 'center',
        zIndex: 11000,
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-danger-glow)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '20px',
          animation: 'pulseGlow 1.5s infinite ease-in-out',
        }}
      >
        🎙️
      </div>
      <p style={{ fontSize: '15px', color: 'white', marginBottom: '8px' }}>{status}</p>
      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Translates speaking into text input
      </p>
      <Button variant="ghost" onClick={onCancel} style={{ fontSize: '13px', color: 'white', borderColor: 'var(--text-muted)' }}>
        Cancel
      </Button>
    </div>
  );
};
