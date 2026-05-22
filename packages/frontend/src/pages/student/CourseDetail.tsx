import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NovaSidebar } from '../../components/nova/NovaSidebar.tsx';
import { NovaBubble } from '../../components/nova/NovaBubble.tsx';
import { AccessibilityPanel } from '../../components/accessibility/AccessibilityPanel.tsx';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { BookOpen, FileText, Upload, ArrowLeft, Send, Brain, GraduationCap } from 'lucide-react';
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

  const courseTitle = courseId === 'course-dbms' 
    ? "Professor Sharma's DBMS (CSE SEM-5)" 
    : courseId === 'course-daa' 
    ? "Design & Analysis of Algorithms" 
    : "Computer Networks & Security";

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
