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
      const preferredLanguage = localStorage.getItem('languagePreference') || 'en';
      const activeCourseId = localStorage.getItem('activeCourseId') || null;
      socketRef.current.send(JSON.stringify({
        text,
        studentId: 'student_123',
        selectedLanguage: preferredLanguage,
        courseId: activeCourseId
      }));
    } else {
      console.warn('[NovaChat] Socket offline. Dropping to premium local simulator.');
      setTimeout(() => {
        setIsTyping(false);
        const lang = (localStorage.getItem('languagePreference') || 'en').toLowerCase();
        let reply = '';

        const fallbackDbms: Record<string, string> = {
          en: "A great question! In Professor Sharma's DBMS Slide 14, he describes Normalization as organizing data to reduce redundancy. Instead of giving you the formula, let me ask: what structural problems arise if we store a student's address repeatedly alongside every single quiz grade?",
          hi: "एक बहुत अच्छा सवाल! प्रोफेसर शर्मा के DBMS स्लाइड 14 में, वे नॉर्मलाइजेशन को डेटा में दोहराव (redundancy) कम करने के रूप में समझाते हैं। फॉर्मूला देने के बजाय, मैं आपसे पूछता हूँ: यदि हम हर क्विज़ ग्रेड के साथ छात्र का पता बार-बार संग्रहीत करते हैं, तो क्या संरचनात्मक समस्याएं उत्पन्न होंगी?",
          mr: "खूप छान प्रश्न! प्राध्यापक शर्मा यांच्या DBMS स्लाईड १४ मध्ये, ते नॉर्मलायझेशन म्हणजे डेटाबेसमधील डुप्लिकेशन कमी करणे असे स्पष्ट करतात. फॉर्म्युला देण्याआधी, मी तुम्हाला विचारतो: जर आपण प्रत्येक क्विझ ग्रेडसोबत विद्यार्थ्याचा पत्ता वारंवार साठवून ठेवला, तर कोणत्या समस्या निर्माण होतील?",
          bn: "খুব ভালো প্রশ্ন! প্রফেসর শর্মার DBMS স্লাইড ১৪-এ, তিনি নরমালাইজেশনকে ডেটার পুনরাবৃত্তি কমানো হিসেবে বর্ণনা করেছেন। ফর্মুলা দেওয়ার বদলে, আমি আপনাকে জিজ্ঞাসা করি: যদি আমরা প্রতিটি কুইজ গ্রেডের সাথে শিক্ষার্থীর ঠিকানা বারবার সংরক্ষণ করি, তবে কী ধরণের কাঠামোগত সমস্যা হবে?",
          ta: "ஒரு சிறந்த கேள்வி! பேராசிரியர் சர்மாவின் டிபிஎம்எஸ் ஸ்லைடு 14-ல், அவர் நார்மலைசேஷனை மீண்டும் மீண்டும் வருவதைக் குறைப்பதாக விளக்குகிறார். சூத்திரத்தைக் கூறுவதற்குப் பதிலாக, நான் கேட்கிறேன்: ஒவ்வொரு வினாடி வினா மதிப்பெண்ணுடனும் ஒரு மாணவரின் முகவரியை மீண்டும் மீண்டும் சேமித்தால் என்ன பிரச்சனைகள் ஏற்படும்?",
          te: "చాలా మంచి ప్రశ్న! ప్రొఫెసర్ శర్మ గారి DBMS స్లైడ్ 14 లో, నార్మలైజేషన్ అంటే డేటాలో పునరావృతాన్ని తగ్గించడమని వివరించారు. ఫార్ములా చెప్పే బదులు, మిమ్మల్ని అడుగుతున్నాను: ప్రతి క్విజ్ గ్రేడ్‌తో పాటు విద్యార్థి చిరునామాను పదేపదే నిల్వ చేస్తే ఎలాంటి నిర్మాణాత్మక సమస్యలు వస్తాయి?"
        };

        const fallbackCricket: Record<string, string> = {
          en: "Ah! Since you mentioned you love cricket analogies, think of Database normalization like organizing a cricket kit bag. Instead of throwing batting pads, wickets, and cricket balls into one messy compartment, we separate them into dedicated sub-compartments (tables). This prevents clutter (redundancy). What kind of compartment structure should we create for bowlers vs batsmen?",
          hi: "अहा! चूंकि आपने क्रिकेट का उल्लेख किया है, डेटाबेस सामान्यीकरण क्रिकेट किट बैग को व्यवस्थित करने जैसा है। सभी चीज़ों को एक साथ रखने के बजाय, हम उन्हें अलग-अलग रखते हैं। आपके अनुसार गेंदबाजों और बल्लेबाजों के लिए हमें क्या अलग कम्पार्टमेंट बनाने चाहिए?",
          mr: "नक्कीच! डेटाबेस नॉर्मलायझेशन म्हणजे क्रिकेट किट बॅग व्यवस्थित ठेवण्यासारखे आहे. सर्व सामान एकत्र ठेवण्याऐवजी आपण ते वेगवेगळ्या कप्प्यांमध्ये ठेवतो. गोलंदाज आणि फलंदाजांसाठी कोणते वेगवेगळे कप्पे असावेत?",
          bn: "একেবারে! ডেটাবেস নরমালাইজেশন হলো ক্রিকেট কিট ব্যাগ গুছিয়ে রাখার মতো। সব জিনিস একসাথে রাখার চেয়ে আলাদা আলাদা রাখা ভালো। বোলার এবং ব্যাটসম্যানদের জন্য কী কী আলাদা কম্পার্টমেন্ট থাকা উচিত?",
          ta: "நிச்சயமாக! தரவுத்தள நார்மலைசேஷன் என்பது கிரிக்கெட் கிட் பையை ஒழுங்கமைப்பது போன்றது. பேட், பந்து மற்றும் பிற உபகரணங்களை தனித்தனி அறைகளில் வைப்பது போல. பந்துவீச்சாளர்கள் மற்றும் பேட்ஸ்மேன்களுக்கு என்னென்ன தனி அறைகளை உருவாக்க வேண்டும்?",
          te: "ఖచ్చితంగా! డేటాబేస్ నార్మలైజేషన్ అనేది క్రికెట్ కిట్ బ్యాగ్‌ను సర్దడం లాంటిది. అన్ని వస్తువులను ఒకే చోట కాకుండా వేర్వేరు కంపార్ట్‌మెంట్‌లలో ఉంచడం. బౌలర్లు మరియు బ్యాట్స్‌మెన్ కోసం ఎలాంటి వేర్వేరు కంపార్ట్‌మెంట్‌లు ఉండాలి?"
        };

        const fallbackDefault: Record<string, string> = {
          en: "I hear you! To guide you best: how does this concept connect to your goal of mastering GATE exam patterns, or would you like to review Professor Sharma's class notes first?",
          hi: "यह एक दिलचस्प बिंदु है! इसे आपके सिलेबस से जोड़ते हुए: आपको क्या लगता है कि यह कार्यात्मक निर्भरता (functional dependencies) से कैसे संबंधित है, या हमें पहले क्लास स्लाइड्स को देखना चाहिए?",
          mr: "हा एक मनोरंजक मुद्दा आहे! तुमच्या अभ्यासक्रमाशी जोडताना: तुम्हाला काय वाटते की हे फंक्शनल डिपेंडेंसीशी (functional dependencies) कसे संबंधित आहे, की आपण आधी क्लास स्लाईड्स पाहायच्या?",
          bn: "এটি একটি আকর্ষণীয় পয়েন্ট! আপনার সিলেবাসের সাথে সম্পর্কিত করে: এটি ফাংশনাল ডিপেন্ডেন্সির (functional dependencies) সাথে কীভাবে সম্পর্কিত বলে আপনি মনে করেন, নাকি আগে ক্লাস স্লাইডগুলো দেখব?",
          ta: "இது ஒரு சுவாரஸ்யமான புள்ளி! உங்கள் பாடத்திட்டளுடன் ஒப்பிடுகையில்: இது ஃபங்க்ஷனல் டிபென்டென்சியுடன் (functional dependencies) எவ்வாறு தொடர்புடையது என்று நினைக்கிறீர்கள், அல்லது முதலில் வகுப்பு ஸ்லைடுகளை பார்க்கலாமா?",
          te: "ఇది ఒక ఆసక్తికరమైన అంశం! మీ సిలబస్‌తో అనుసంధానిస్తే: ఇది ఫంక్షనల్ డిపెండెన్సీలతో (functional dependencies) ఎలా సంబంధం కలిగి ఉందని మీరు భావిస్తున్నారు, లేదా మొదట క్లాస్ స్లైడ్స్ చూద్దామా?"
        };

        const textLower = text.toLowerCase();
        if (textLower.includes('normal') || textLower.includes('database') || textLower.includes('नॉर्मला') || textLower.includes('सामान्यीकरण') || textLower.includes('নরমালাই') || textLower.includes('நார்மலை') || textLower.includes('నార్మలై')) {
          reply = fallbackDbms[lang] || fallbackDbms['en'];
        } else if (textLower.includes('cricket') || textLower.includes('क्रिकेट') || textLower.includes('கிரிக்கெட்') || textLower.includes('క్రికెట్')) {
          reply = fallbackCricket[lang] || fallbackCricket['en'];
        } else {
          reply = fallbackDefault[lang] || fallbackDefault['en'];
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
