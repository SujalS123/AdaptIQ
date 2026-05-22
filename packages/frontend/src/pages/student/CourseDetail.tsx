import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NovaSidebar } from '../../components/nova/NovaSidebar.tsx';
import { NovaBubble } from '../../components/nova/NovaBubble.tsx';
import { AccessibilityPanel } from '../../components/accessibility/AccessibilityPanel.tsx';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { 
  BookOpen, 
  FileText, 
  Upload, 
  ArrowLeft, 
  Send, 
  Brain, 
  GraduationCap,
  Play,
  Pause,
  Volume2,
  Gamepad2,
  Check,
  Eye,
  Layout,
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';
import axios from 'axios';

interface NoteItem {
  id: string;
  courseId: string;
  uploaderId: string;
  role: 'student' | 'teacher';
  title: string;
  content: string;
  bloomsLevel?: string;
  createdAt: string;
}

export const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>('teacher');

  // Input states for student notes upload
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Chat interface grounded in selected notes
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: "Namaste! I am Nova, your Socratic mentor. Choose any file from the panel on the left to ground my context, or ask me any syllabus questions directly!",
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isNovaTyping, setIsNovaTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Dynamic VARK learning modality state loaded from student DNA
  const [learningModality, setLearningModality] = useState<'visual' | 'auditory' | 'reading' | 'kinesthetic'>('visual');
  const [prefStyles, setPrefStyles] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio simulation state variables
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(25);

  // Hands-on Kinesthetic database normalization game states
  const [kinestheticSuccess, setKinestheticSuccess] = useState(false);
  const [kinestheticAnswers, setKinestheticAnswers] = useState({
    R1: '',
    R2: ''
  });

  const courseTitle = courseId === 'course-dbms' 
    ? "Professor Sharma's DBMS (CSE SEM-5)" 
    : courseId === 'course-daa' 
    ? "Design & Analysis of Algorithms" 
    : "Computer Networks & Security";

  // Visual XP notification toast helper
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync active learning styles by submitting implicit user interaction metrics
  const updateVarkStyle = async (newStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic', signals: any) => {
    try {
      triggerToast(`🔄 Submitting implicit signals: Analyzing interaction telemetry...`);
      const res = await axios.post('http://localhost:5000/api/student/dna/student-priya/vark', {
        interactionSignals: signals
      });
      if (res.data?.success) {
        setLearningModality(res.data.learningModality);
        setPrefStyles(res.data.dna?.preferredExplanationStyles || []);
        triggerToast(`🎯 VARK Sync Complete! Cognitive style calibrated to "${res.data.learningModality.toUpperCase()}"`);
      }
    } catch (err) {
      console.warn('⚠️ VARK POST failed. Updating style locally.', err);
      setLearningModality(newStyle);
      triggerToast(`🎯 Local Style Updated to "${newStyle.toUpperCase()}"!`);
    }
  };

  // Hands-on normalization exercise checker
  const submitKinestheticDecomposition = async () => {
    const r1 = kinestheticAnswers.R1.toLowerCase().replace(/\s+/g, '');
    const r2 = kinestheticAnswers.R2.toLowerCase().replace(/\s+/g, '');
    
    const isValidR1 = (r1.includes('teacher') && r1.includes('class')) && !r1.includes('student');
    const isValidR2 = (r2.includes('student') && r2.includes('teacher')) && !r2.includes('class');
    
    if (isValidR1 && isValidR2) {
      setKinestheticSuccess(true);
      try {
        await axios.post('http://localhost:5000/api/student/dna/student-priya/xp', { xpAmount: 50 });
        triggerToast('🎉 Core decomposition correct! +50 XP Awarded for hands-on learning!');
      } catch (err) {
        triggerToast('🎉 Core decomposition correct! (Local XP +50 fallback)');
      }
    } else {
      triggerToast('❌ Redundancy detected or dependency lost! Double check your BCNF projection.');
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/upload/notes/${courseId || 'course-dbms'}`);
      setNotes(response.data.notes || []);
    } catch (error) {
      console.warn('[CourseDetail] Backend offline. Using preseeded mock notes local store.');
      // Offline fallback mock data
      setNotes([
        {
          id: 'preseeded-teacher-notes-1',
          courseId: 'course-dbms',
          uploaderId: 'teacher-sharma',
          role: 'teacher',
          title: "Professor Sharma's Slide 14: Relational Normalization",
          content: "Database Normalization is the formal process of structuring a relational database to reduce data redundancy and improve data integrity. Slide 14: Relational Normalization divides tables, isolates data updates, and resolves anomalies.",
          bloomsLevel: 'understand',
          createdAt: new Date().toISOString()
        },
        {
          id: 'preseeded-teacher-notes-2',
          courseId: 'course-dbms',
          uploaderId: 'teacher-sharma',
          role: 'teacher',
          title: "Professor Sharma's Lecture: 3NF Decomposition Rules",
          content: "A relation schema R is in Third Normal Form (3NF) if, for every functional dependency X -> A, either X -> A is trivial, X is a superkey, or A is a prime attribute.",
          bloomsLevel: 'apply',
          createdAt: new Date().toISOString()
        }
      ]);
    }

    // Load active DNA and preferred VARK style
    try {
      const dnaResponse = await axios.get('http://localhost:5000/api/student/dna/student-priya');
      if (dnaResponse.data?.dna) {
        setLearningModality(dnaResponse.data.dna.learningModality || 'visual');
        setPrefStyles(dnaResponse.data.dna.preferredExplanationStyles || []);
      }
    } catch (err) {
      console.warn('[CourseDetail] DNA fetch failed, fallback to visual modality');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [courseId]);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isNovaTyping]);

  const handleUploadNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadContent.trim()) return;

    setIsUploading(true);
    const payload = {
      courseId: courseId || 'course-dbms',
      studentId: 'student-priya',
      title: uploadTitle,
      content: uploadContent
    };

    try {
      await axios.post('http://localhost:5000/api/upload/student-notes', payload);
      setUploadTitle('');
      setUploadContent('');
      await fetchNotes();
      setActiveTab('student');
    } catch (err) {
      console.error('[Upload Note] Failed to upload notes via API. Dropping to local state.');
      // Local sync fallback
      const localNewNote: NoteItem = {
        id: `local-student-note-${Date.now()}`,
        courseId: courseId || 'course-dbms',
        uploaderId: 'student-priya',
        role: 'student',
        title: uploadTitle,
        content: uploadContent,
        createdAt: new Date().toISOString()
      };
      setNotes(prev => [...prev, localNewNote]);
      setUploadTitle('');
      setUploadContent('');
      setActiveTab('student');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    const userMessage = { sender: 'user' as const, text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setIsNovaTyping(true);

    setTimeout(() => {
      let reply = '';
      
      if (selectedNote) {
        // Aligned grounding behavior
        reply = `I have read through your document "${selectedNote.title}". To answer Socratic-style: you asked "${currentInput}". According to the text, we see: "${selectedNote.content.slice(0, 150)}...". How would you relate this concept to your previous GATE quiz error patterns?`;
      } else {
        if (currentInput.toLowerCase().includes('3nf') || currentInput.toLowerCase().includes('normal')) {
          reply = "Third Normal Form (3NF) aims to eliminate transitive functional dependencies. If A -> B and B -> C, then A -> C is a transitive dependency. Why does having C depend transitively on the primary key A cause redundancy during database updates?";
        } else {
          reply = `I hear you! To connect "${currentInput}" to Professor Sharma's course: what specific slide or lecture topic does this relate to, or would you like to review the primary keys first?`;
        }
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setIsNovaTyping(false);
    }, 1200);
  };

  const teacherNotes = notes.filter(n => n.role === 'teacher');
  const studentNotes = notes.filter(n => n.role === 'student');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar Navigation */}
      <NovaSidebar />

      {/* Main Viewport */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Navigation Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            variant="ghost" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
          <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <GraduationCap size={16} /> Course Code: <strong>{courseId?.toUpperCase()}</strong>
          </span>
        </div>

        {/* Header Grid Banner */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, var(--color-primary-glow), var(--bg-card))',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}
        >
          <div 
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 8px 24px var(--color-primary-glow)'
            }}
          >
            <BookOpen size={32} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0' }} className="gradient-text">
              {courseTitle}
            </h1>
            <p style={{ margin: '0', fontSize: '14.5px', color: 'var(--text-secondary)' }}>
              Course syllabus synced. Ask doubts grounded in either official lecture notes or your personal study uploads.
            </p>
          </div>
        </div>

        {/* Inner Two-Column Workspaces */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', flex: 1 }}>
          
          {/* Notes Management Hub (Left Column) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Floating XP/Level Toast Notifications */}
            {toastMessage && (
              <div 
                style={{
                  position: 'fixed',
                  top: '24px',
                  right: '24px',
                  zIndex: 2000,
                  backgroundColor: 'hsla(142, 70%, 45%, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: '#ffffff',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                  fontWeight: 600,
                  fontSize: '14.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  animation: 'slideIn 0.3s ease-out'
                }}
              >
                <Sparkles size={16} /> {toastMessage}
              </div>
            )}

            {/* Nova Adaptive Learning Deck (VARK Dynamic Lesson) */}
            <Card style={{ padding: '24px', borderLeft: '4px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="var(--color-primary)" />
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                    Nova Adaptive Learning Deck
                  </h3>
                </div>
                
                <span 
                  style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    backgroundColor: 'var(--bg-secondary)',
                    color: learningModality === 'visual' ? 'var(--color-primary)' :
                           learningModality === 'auditory' ? 'var(--color-accent)' :
                           learningModality === 'reading' ? '#f59e0b' : '#10b981',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  🎯 Profile Style: {learningModality.toUpperCase()}
                </span>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
                Nova automatically tailors lesson formats to your cognitive style. Try different tabs below to simulate how the system reshapes explanations.
              </p>

              {/* VARK Modality Tab Selector */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: '8px', 
                  backgroundColor: 'var(--bg-secondary)', 
                  padding: '6px', 
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '20px'
                }}
              >
                {[
                  { id: 'visual', label: '📺 Visual', signal: { video_completion_rate: 1.0, diagram_interaction_rate: 0.95 } },
                  { id: 'auditory', label: '🎧 Auditory', signal: { audio_replay_count: 4, video_completion_rate: 0.5 } },
                  { id: 'reading', label: '📖 Reading', signal: { text_reading_time: 350, note_taking_frequency: 3 } },
                  { id: 'kinesthetic', label: '🛠️ Practice', signal: { exercise_attempt_rate: 1.0 } }
                ].map(tab => {
                  const isActive = learningModality === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => updateVarkStyle(tab.id as any, tab.signal)}
                      style={{
                        backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
                        border: isActive ? '1px solid var(--border-color)' : 'none',
                        borderRadius: '6px',
                        padding: '8px 4px',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontSize: '12.5px',
                        fontWeight: isActive ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Lesson Display Panel */}
              <div 
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-color)', 
                  padding: '20px',
                  minHeight: '260px'
                }}
              >
                {/* 1. VISUAL MODALITY */}
                {learningModality === 'visual' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)' }}>Visual Flow: BCNF vs 3NF Decompositions</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Interactive Vector Chart</span>
                    </div>
                    
                    {/* Visual relational diagram */}
                    <div 
                      style={{ 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        padding: '16px', 
                        backgroundColor: 'var(--bg-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      {/* Original relation */}
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Original Relation</span>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '6px' }}>
                          <span style={{ border: '2px solid var(--color-primary)', padding: '6px 12px', borderRadius: '4px', fontWeight: 700 }}>A (Key)</span>
                          <span style={{ border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '4px' }}>B</span>
                          <span style={{ border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '4px' }}>C</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-danger)', marginTop: '6px' }}>
                          ⚠️ Transitive Dependency Detected: A → B, B → C (Violates BCNF/3NF)
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-primary)' }}>
                        ⬇️ Decompose to BCNF (Lossless & Redundancy-Free)
                      </div>

                      {/* Decomposed relations */}
                      <div style={{ display: 'flex', justifyContent: 'space-around', gap: '12px' }}>
                        <div style={{ border: '1px dashed var(--color-secondary)', padding: '10px', borderRadius: '6px', flex: 1, textAlign: 'center' }}>
                          <span style={{ fontSize: '10px', color: 'var(--color-secondary)' }}>Relation R1</span>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
                            <strong style={{ textDecoration: 'underline' }}>A</strong>
                            <span>B</span>
                          </div>
                        </div>
                        <div style={{ border: '1px dashed var(--color-secondary)', padding: '10px', borderRadius: '6px', flex: 1, textAlign: 'center' }}>
                          <span style={{ fontSize: '10px', color: 'var(--color-secondary)' }}>Relation R2</span>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
                            <strong style={{ textDecoration: 'underline' }}>B</strong>
                            <span>C</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '12px', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      💡 **Visual Insight**: Note that **B** becomes the primary key of R2. Since the functional dependency **B → C** is now isolated to a separate table where B is a superkey, the update anomalies disappear.
                    </p>
                  </div>
                )}

                {/* 2. AUDITORY MODALITY */}
                {learningModality === 'auditory' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-accent)' }}>Auditory Podcast: Normal Forms & Dependency Clashes</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>01:45 • High Fidelity Audio Mnemonic</span>
                    </div>

                    {/* Styled simulated audio player */}
                    <div 
                      style={{ 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        padding: '16px', 
                        backgroundColor: 'var(--bg-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <Button 
                          variant="primary" 
                          style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                          onClick={() => {
                            setIsAudioPlaying(!isAudioPlaying);
                            triggerToast(isAudioPlaying ? '⏸️ Audio stream paused.' : '▶️ Audio stream started! Voice explanation playing.');
                          }}
                        >
                          {isAudioPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
                        </Button>

                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, display: 'block' }}>Nova Socratic Podcast Series: Episode 3</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Understanding dependency preservation in 3NF and BCNF</span>
                        </div>
                      </div>

                      {/* Graphic frequency visualizer */}
                      <div style={{ display: 'flex', gap: '3px', alignItems: 'center', height: '24px', justifyContent: 'center' }}>
                        {[8, 16, 24, 12, 18, 22, 10, 14, 20, 16, 24, 12, 8, 15, 20, 6].map((h, i) => (
                          <div 
                            key={i} 
                            style={{ 
                              width: '4px', 
                              height: isAudioPlaying ? `${h}px` : '4px', 
                              backgroundColor: isAudioPlaying ? 'var(--color-accent)' : 'var(--text-muted)',
                              borderRadius: '2px',
                              transition: 'height 0.25s ease',
                              animation: isAudioPlaying ? `pulse 1s infinite alternate ${i * 0.05}s` : 'none'
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', borderLeft: '3px solid var(--color-accent)' }}>
                      🎙️ **Audio Transcription Mnemonic**: *"To remember 3NF vs BCNF, imagine a strict GATE examiner. BCNF enforces that ALL dependencies MUST arise from a superkey. 3NF is slightly more lenient, allowing the right-side attribute to be part of a candidate key (prime attribute). Repeat this: BCNF is clean but strict; 3NF saves functional dependencies!"*
                    </div>
                  </div>
                )}

                {/* 3. READING MODALITY */}
                {learningModality === 'reading' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '280px', overflowY: 'auto' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#f59e0b' }}>Detailed Textbook: Relational Normalization Mathematical Formalisms</span>
                    
                    <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: '1.6', margin: 0 }}>
                      Let R be a relation schema and F be a set of functional dependencies. 
                      A relation schema R is in Boyce-Codd Normal Form (BCNF) with respect to F if for all functional dependencies in F+ of the form:
                      $$\alpha \rightarrow \beta$$
                      where \alpha \subseteq R and \beta \subseteq R, at least one of the following holds:
                      
                      1. \alpha \rightarrow \beta is a trivial functional dependency (i.e., \beta \subseteq \alpha)
                      2. \alpha is a superkey for schema R.
                    </p>

                    <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: '1.6', margin: 0 }}>
                      In contrast, the Third Normal Form (3NF) relaxed rule specifies that \alpha \rightarrow \beta can also satisfy a third condition:
                      
                      3. Each attribute A in \beta - \alpha is a prime attribute (meaning A is a member of some candidate key for R).
                    </p>

                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      📜 Textbook Proof Outline: The main trade-off is dependency preservation. Any relation can be decomposed into a 3NF design that is both lossless and dependency-preserving. However, it is mathematically impossible to guarantee dependency preservation when decomposing into BCNF.
                    </div>
                  </div>
                )}

                {/* 4. KINESTHETIC MODALITY */}
                {learningModality === 'kinesthetic' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>Hands-on Sandbox: Decompose Relation into BCNF</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>+50 XP Challenge</span>
                    </div>

                    {kinestheticSuccess ? (
                      <div 
                        style={{ 
                          textAlign: 'center', 
                          padding: '30px 20px', 
                          backgroundColor: 'var(--color-success-glow)', 
                          border: '1px dashed var(--color-success)', 
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <CheckCircle2 size={36} color="var(--color-success)" />
                        <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Splendid Projection, Priya!</h4>
                        <p style={{ fontSize: '12px', margin: 0, color: 'var(--text-secondary)' }}>
                          Decomposition R1(Teacher, Class) and R2(Student, Teacher) is completely lossless, BCNF compliant, and dependency-preserving!
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          🚀 **Interactive Exercise**: Given R(Student, Class, Teacher) with dependencies:
                          Teacher → Class, Student, Class → Teacher.
                          Decompose R into Boyce-Codd Normal Form. Type the attributes for both relations:
                        </span>

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>R1 Attributes (comma separated)</span>
                            <input 
                              type="text" 
                              placeholder="e.g. Teacher, Class"
                              value={kinestheticAnswers.R1}
                              onChange={(e) => setKinestheticAnswers({ ...kinestheticAnswers, R1: e.target.value })}
                              style={{
                                backgroundColor: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                padding: '8px 10px',
                                color: 'var(--text-primary)',
                                fontSize: '12.5px',
                                outline: 'none'
                              }}
                            />
                          </div>

                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>R2 Attributes (comma separated)</span>
                            <input 
                              type="text" 
                              placeholder="e.g. Student, Teacher"
                              value={kinestheticAnswers.R2}
                              onChange={(e) => setKinestheticAnswers({ ...kinestheticAnswers, R2: e.target.value })}
                              style={{
                                backgroundColor: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                padding: '8px 10px',
                                color: 'var(--text-primary)',
                                fontSize: '12.5px',
                                outline: 'none'
                              }}
                            />
                          </div>
                        </div>

                        <Button variant="primary" size="sm" style={{ alignSelf: 'flex-end' }} onClick={submitKinestheticDecomposition}>
                          Check Normalization Accuracy
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            <Card style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={18} color="var(--color-primary)" /> Materials and Notes Repository
              </h3>

              {/* Tabs selector */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '16px', gap: '12px' }}>
                <span 
                  onClick={() => { setActiveTab('teacher'); setSelectedNote(null); }}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: activeTab === 'teacher' ? 'var(--color-primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'teacher' ? '2px solid var(--color-primary)' : '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🏫 Faculty Course Materials ({teacherNotes.length})
                </span>
                <span 
                  onClick={() => { setActiveTab('student'); setSelectedNote(null); }}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: activeTab === 'student' ? 'var(--color-primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'student' ? '2px solid var(--color-primary)' : '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🎒 My Personal Study Notes ({studentNotes.length})
                </span>
              </div>

              {/* Active Tab Lists */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
                {activeTab === 'teacher' ? (
                  teacherNotes.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No teacher notes uploaded yet.</p>
                  ) : (
                    teacherNotes.map(n => (
                      <div 
                        key={n.id}
                        onClick={() => setSelectedNote(selectedNote?.id === n.id ? null : n)}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '8px',
                          border: selectedNote?.id === n.id ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                          backgroundColor: selectedNote?.id === n.id ? 'var(--color-primary-glow)' : 'var(--bg-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14.5px', display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '8px' }}>
                          <GraduationCap size={16} color="var(--color-primary)" /> {n.title}
                        </h4>
                        <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {n.content.slice(0, 100)}...
                        </p>
                      </div>
                    ))
                  )
                ) : (
                  studentNotes.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No study notes uploaded yet. Write/upload notes below!</p>
                  ) : (
                    studentNotes.map(n => (
                      <div 
                        key={n.id}
                        onClick={() => setSelectedNote(selectedNote?.id === n.id ? null : n)}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '8px',
                          border: selectedNote?.id === n.id ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                          backgroundColor: selectedNote?.id === n.id ? 'var(--color-primary-glow)' : 'var(--bg-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14.5px', display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '8px' }}>
                          <FileText size={16} color="var(--color-accent)" /> {n.title}
                        </h4>
                        <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {n.content.slice(0, 100)}...
                        </p>
                      </div>
                    ))
                  )
                )}
              </div>

              {/* Toggle Banner of selection */}
              {selectedNote && (
                <div 
                  style={{ 
                    padding: '10px 14px', 
                    borderRadius: '6px', 
                    border: '1px dashed var(--color-success)', 
                    backgroundColor: 'var(--color-success-glow)', 
                    color: 'var(--color-success)',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}
                >
                  <span>🎯 Locked Context: <strong>{selectedNote.title}</strong></span>
                  <Button variant="ghost" size="sm" style={{ color: 'var(--color-success)', padding: '0 4px' }} onClick={() => setSelectedNote(null)}>Clear</Button>
                </div>
              )}
            </Card>

            {/* Note upload form wrapper */}
            <Card style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Upload size={18} color="var(--color-accent)" /> Upload New Notes
              </h3>
              <form onSubmit={handleUploadNotes} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input 
                  type="text"
                  placeholder="Notes Title (e.g. Normalization short-notes)..."
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    color: 'var(--text-primary)',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                  required
                />
                <textarea 
                  rows={4}
                  placeholder="Paste or write detailed study notes text here..."
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: 'var(--text-primary)',
                    fontSize: '13.5px',
                    outline: 'none',
                    resize: 'none'
                  }}
                  required
                />
                <Button variant="primary" type="submit" disabled={isUploading}>
                  {isUploading ? 'Ingesting Notes...' : 'Upload Notes & Sync Context'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Grounded doubt Assistant (Right Column) */}
          <Card style={{ display: 'flex', flexDirection: 'column', height: '620px', padding: '0px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-secondary)' }}>
              <Brain size={18} color="var(--color-primary)" />
              <div>
                <h4 style={{ margin: '0px', fontSize: '15px', fontWeight: 600 }}>Nova Grounded Chat</h4>
                <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                  {selectedNote ? 'Grounded in active note selection' : 'Querying course syllabus'}
                </span>
              </div>
            </div>

            {/* Chat Body messages */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {chatMessages.map((msg, i) => (
                <div 
                  key={i}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    maxWidth: '85%',
                    color: 'var(--text-primary)',
                    background: msg.sender === 'user' ? 'var(--color-primary)' : 'var(--bg-secondary)',
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)'
                  }}
                >
                  {msg.text}
                </div>
              ))}

              {isNovaTyping && (
                <div style={{ display: 'flex', gap: '6px', alignSelf: 'flex-start', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', display: 'inline-block', animation: 'float 1.2s infinite' }}></span>
                  <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', display: 'inline-block', animation: 'float 1.2s infinite 0.2s' }}></span>
                  <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', display: 'inline-block', animation: 'float 1.2s infinite 0.4s' }}></span>
                </div>
              )}
              <div ref={chatScrollRef} />
            </div>

            {/* Chat Input panel */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', gap: '10px' }}>
              <input 
                type="text"
                placeholder={selectedNote ? "Ask Nova doubts about this document..." : "Ask Nova doubts about general course..."}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <Button variant="primary" onClick={handleSendChat}>
                <Send size={16} />
              </Button>
            </div>
          </Card>

        </div>
      </div>

      <NovaBubble />
      <AccessibilityPanel />
    </div>
  );
};

export default CourseDetail;
