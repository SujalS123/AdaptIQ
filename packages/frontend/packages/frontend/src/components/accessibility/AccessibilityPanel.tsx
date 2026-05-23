import React, { useState, useEffect } from 'react';
import { Settings, Eye, ZoomIn } from 'lucide-react';
import { Card } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';

export const AccessibilityPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(100);

  // Sync state values with document element classes
  useEffect(() => {
    if (dyslexiaMode) {
      document.documentElement.classList.add('dyslexia-mode');
    } else {
      document.documentElement.classList.remove('dyslexia-mode');
    }
  }, [dyslexiaMode]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast-mode');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
    }
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${16 * (fontSizeMultiplier / 100)}px`;
  }, [fontSizeMultiplier]);

  const handleSpeakAloud = () => {
    // Speak page headers and main sections via Web Speech API
    const textToSpeak = Array.from(document.querySelectorAll('h1, h2, p'))
      .map(el => el.textContent)
      .join('. ');
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    window.speechSynthesis.speak(utterance);
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    left: '24px',
    zIndex: 9999,
  };

  const drawerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '60px',
    left: '0',
    width: '320px',
    display: isOpen ? 'block' : 'none',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    zIndex: 10000,
  };

  return (
    <div style={containerStyle}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--glass-shadow)',
          border: '1px solid var(--border-color)',
        }}
      >
        <Eye size={20} color="var(--color-primary)" />
      </Button>

      <div style={drawerStyle}>
        <Card className="animate-scale-up">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} /> Accessibility panel
          </h3>

          {/* Dyslexia Toggle Option */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{ display: 'block', fontSize: '14px', fontWeight: 500 }}>Dyslexia Font</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Lexend heavy letter-spacing</span>
            </div>
            <input
              type="checkbox"
              checked={dyslexiaMode}
              onChange={() => setDyslexiaMode(!dyslexiaMode)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          {/* Contrast Toggle Option */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{ display: 'block', fontSize: '14px', fontWeight: 500 }}>High Contrast</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Maximum visibility outline</span>
            </div>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={() => setHighContrast(!highContrast)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          {/* Font Resizing Slider */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Font Size ({fontSizeMultiplier}%)</span>
              <ZoomIn size={16} />
            </div>
            <input
              type="range"
              min="80"
              max="160"
              value={fontSizeMultiplier}
              onChange={(e) => setFontSizeMultiplier(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Web Speech API Text-to-Speech Trigger */}
          <Button
            variant="ghost"
            onClick={handleSpeakAloud}
            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '13px' }}
          >
            🔊 Read Screen Aloud (TTS)
          </Button>
        </Card>
      </div>
    </div>
  );
};
