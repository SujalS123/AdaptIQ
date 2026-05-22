import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Mic } from 'lucide-react';
import { Card } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';
import { NovaVoiceInput } from './NovaVoiceInput.tsx';
import { NovaMemoryCard } from './NovaMemoryCard.tsx';

interface Message {
  id: string;
  sender: 'user' | 'nova';
  text: string;
  timestamp: Date;
}

interface NovaChatProps {
  onClose?: () => void;
}

export const NovaChat: React.FC<NovaChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'nova',
      text: "Namaste! I'm Nova, your personal learning guide. I've synced with Professor Sharma's DBMS course slides and your target exam roadmap. What are we exploring today?",
      timestamp: new Date(),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [showVoice, setShowVoice] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // Dynamically connect using WebSocket protocol mapping
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Map port 3000 to Vite dev backend proxy (5000) or use window.location.host
    const wsHost = window.location.port === '3000' ? 'localhost:5000' : window.location.host;
    const wsUrl = `${protocol}//${wsHost}/ws/nova`;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      console.log('[NovaChat] Establishing socket connection to:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[NovaChat] WebSocket connection established successfully.');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'start') {
            setIsTyping(false);
            // Append a fresh, empty Nova message to stream incoming tokens into
            setMessages(prev => [
              ...prev,
              {
                id: 'nova-stream-' + Date.now(),
                sender: 'nova',
                text: '',
                timestamp: new Date()
              }
            ]);
          } else if (data.type === 'token') {
            setIsTyping(false);
            setMessages(prev => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg && lastMsg.sender === 'nova' && lastMsg.id.startsWith('nova-stream-')) {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMsg,
                    text: lastMsg.text + data.token
                  }
                ];
              }
              return prev;
            });
          } else if (data.type === 'end') {
            setIsTyping(false);
          } else if (data.error) {
            console.error('[NovaChat] AI Engine socket error:', data.error);
            setIsTyping(false);
          }
        } catch (err) {
          console.error('[NovaChat] Error parsing incoming socket chunk:', err);
        }
      };

      ws.onclose = () => {
        console.warn('[NovaChat] Socket closed. Attempting reconnect in 3s...');
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error('[NovaChat] Socket encountered error:', err);
      };

      socketRef.current = ws;
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (socketRef.current) {
        socketRef.current.onclose = null; // Detach close listener to prevent loop
        socketRef.current.close();
      }
    };
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Send query to backend WebSocket if connected, otherwise fallback to local templates
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        text,
        studentId: 'student_123'
      }));
    } else {
      console.warn('[NovaChat] Socket offline. Dropping to premium local simulator.');
      setTimeout(() => {
        setIsTyping(false);
        let reply = '';
        if (text.toLowerCase().includes('normal') || text.toLowerCase().includes('database')) {
          reply = "A great question! In Professor Sharma's DBMS Slide 14, he describes Normalization as organizing data to reduce redundancy. Instead of giving you the formula, let me ask: what structural problems arise if we store a student's address repeatedly alongside every single quiz grade?";
        } else if (text.toLowerCase().includes('cricket')) {
          reply = "Ah! Since you mentioned you love cricket analogies, think of Database normalization like organizing a cricket kit bag. Instead of throwing batting pads, wickets, and cricket balls into one messy compartment, we separate them into dedicated sub-compartments (tables). This prevents clutter (redundancy). What kind of compartment structure should we create for bowlers vs batsmen?";
        } else {
          reply = "I hear you! To guide you best: how does this concept connect to your goal of mastering GATE exam patterns, or would you like to review Professor Sharma's class notes first?";
        }

        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'nova',
            text: reply,
            timestamp: new Date(),
          },
        ]);
      }, 1500);
    }
  };

  const handleVoiceCapture = (transcript: string) => {
    setInputVal(transcript);
    setShowVoice(false);
  };

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '0px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--glass-shadow)',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(var(--glass-blur))',
      }}
    >
      {/* Header section with sparkles */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, var(--bg-secondary), var(--bg-card))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-secondary)',
              boxShadow: '0 0 10px var(--color-secondary)',
            }}
          />
          <div>
            <h4 style={{ margin: '0px', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Nova <Sparkles size={14} color="var(--color-primary)" />
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Synced with DBMS notes</span>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" onClick={onClose} style={{ padding: '4px 8px', fontSize: '12px' }}>
            Close
          </Button>
        )}
      </div>

      {/* Messages viewport */}
      <div
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '13.5px',
                lineHeight: '1.5',
                color: 'var(--text-primary)',
                background: msg.sender === 'user' ? 'var(--color-primary)' : 'var(--bg-secondary)',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                boxShadow: msg.sender === 'user' ? '0 4px 12px var(--color-primary-glow)' : 'none',
              }}
            >
              {msg.text}
            </div>
            <span
              style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                marginTop: '4px',
                marginRight: msg.sender === 'user' ? '4px' : '0px',
                marginLeft: msg.sender === 'nova' ? '4px' : '0px',
              }}
            >
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: '6px', alignSelf: 'flex-start', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span className="typing-dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', display: 'inline-block', animation: 'float 1.2s infinite' }}></span>
            <span className="typing-dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', display: 'inline-block', animation: 'float 1.2s infinite 0.2s' }}></span>
            <span className="typing-dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', display: 'inline-block', animation: 'float 1.2s infinite 0.4s' }}></span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Embedded interactive memory card */}
      <div style={{ padding: '0 20px' }}>
        <NovaMemoryCard />
      </div>

      {/* Input panel section */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <Button
          variant="ghost"
          onClick={() => setShowVoice(!showVoice)}
          style={{
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            padding: '0px',
            backgroundColor: showVoice ? 'var(--color-danger-glow)' : 'transparent',
          }}
        >
          <Mic size={18} color={showVoice ? 'var(--color-danger)' : 'var(--text-secondary)'} />
        </Button>

        <input
          type="text"
          placeholder="Ask Nova a doubt (try: 'cricket normal' or 'DBMS normalization')..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal)}
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '10px 16px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none',
          }}
        />

        <Button
          variant="primary"
          onClick={() => handleSend(inputVal)}
          style={{
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            padding: '0px',
          }}
        >
          <Send size={16} />
        </Button>
      </div>

      {showVoice && (
        <NovaVoiceInput
          onCapture={handleVoiceCapture}
          onCancel={() => setShowVoice(false)}
        />
      )}
    </Card>
  );
};
