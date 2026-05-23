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
  Lock,
  ChevronRight,
  Clock,
  Video,
  Terminal,
  Award,
  ChevronLeft
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
  const [course, setCourse] = useState<any>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

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

  // AI Manim Video Generator states
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoLogs, setVideoLogs] = useState<Array<{ agent: string; status: string; message: string }>>([]);
  const [videoCode, setVideoCode] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFallbackData, setVideoFallbackData] = useState<any | null>(null);
  const [activeVideoStep, setActiveVideoStep] = useState<number>(0);
  const [videoRenderSuccess, setVideoRenderSuccess] = useState<boolean>(false);
  const [claimedVideoXP, setClaimedVideoXP] = useState<boolean>(false);

  // Prerequisite & Flashcard states
  const [unlockedModules, setUnlockedModules] = useState<string[]>([]);
  const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false);
  const [pendingModuleId, setPendingModuleId] = useState<string | null>(null);
  const [prerequisiteQuestions, setPrerequisiteQuestions] = useState<any[]>([]);
  const [prerequisiteAnswers, setPrerequisiteAnswers] = useState<Record<string, string>>({});
  const [prerequisiteResult, setPrerequisiteResult] = useState<any>(null);
  const [isSubmittingDiagnostic, setIsSubmittingDiagnostic] = useState(false);
  
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [contentViewMode, setContentViewMode] = useState<'flashcards' | 'notes'>('flashcards');

  useEffect(() => {
    // Reset video generator states when selected note/chapter changes
    setVideoLogs([]);
    setVideoUrl(null);
    setVideoFallbackData(null);
    setVideoRenderSuccess(false);
    setIsVideoGenerating(false);
    setActiveVideoStep(0);
    setClaimedVideoXP(false);
    setContentViewMode('flashcards');
    setIsFlashcardFlipped(false);
    setActiveFlashcardIndex(0);
  }, [selectedNote?.id]);

  const courseTitle = course?.title || (courseId === 'course-dbms' 
    ? "Professor Sharma's DBMS (CSE SEM-5)" 
    : courseId === 'course-daa' 
    ? "Design & Analysis of Algorithms" 
    : "Computer Networks & Security");

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

  const startVideoGeneration = async () => {
    if (isVideoGenerating) return;
    setIsVideoGenerating(true);
    setVideoLogs([]);
    setVideoUrl(null);
    setVideoFallbackData(null);
    setActiveVideoStep(0);
    setClaimedVideoXP(false);

    // Initial logs to make console look immediate and alive
    setVideoLogs([
      { agent: "Orchestrator", status: "info", message: "🚀 Contacting AdaptIQ FastAPI Video Generator Subsystem..." }
    ]);

    // Simple ticker to add simulated startup logs so it feels alive
    let tickerInterval = setInterval(() => {
      setVideoLogs(prev => {
        if (prev.length === 1) {
          return [...prev, { agent: "Code Writer", status: "working", message: "✍️ Negotiating prompt weights with Groq Llama-3.3 LLM..." }];
        } else if (prev.length === 2) {
          return [...prev, { agent: "Code Writer", status: "working", message: "✍️ Designing spatial coordinate systems & high-contrast schemas..." }];
        }
        return prev;
      });
    }, 1000);

    try {
      const concept = selectedNote?.title || "Database Keys and Normalization Theory";
      const response = await axios.post('http://localhost:5000/api/video/generate', { concept });
      clearInterval(tickerInterval);

      const data = response.data;
      
      // We got the response back from the FastAPI.
      if (data.logs && data.logs.length > 0) {
        setVideoLogs(data.logs);
      } else {
        setVideoLogs(prev => [
          ...prev,
          { agent: "Orchestrator", status: "info", message: "📡 Received agent response payload." }
        ]);
      }

      setVideoCode(data.code || '');
      setVideoUrl(data.video_url || null);
      setVideoRenderSuccess(data.success || false);
      
      if (data.fallback_data) {
        setVideoFallbackData(data.fallback_data);
      }
    } catch (err: any) {
      clearInterval(tickerInterval);
      console.error(err);
      setVideoLogs(prev => [
        ...prev,
        { agent: "Render Engine", status: "warning", message: "⚠️ Sandbox offline / compiler exception. Activating high-fidelity fallback explainer." },
        { agent: "Orchestrator", status: "success", message: "🏁 Fallback visual animation system ready!" }
      ]);
      
      // Generate a client side fallback local dataset based on chapter notes
      const concept = selectedNote?.title || "Database Keys and Normalization Theory";
      
      const fallbackMock = {
        title: `Interactive Explorer: ${concept}`,
        concept: concept,
        steps: [
          {
            title: "Concept Mapping",
            description: `Learning about: ${concept}. The tutoring engine has compiled the core dependencies below.`,
            elements: [
              { type: "circle", id: "n1", label: concept.split(" ")[0] || "Topic", x: 180, y: 110, color: "#818cf8" },
              { type: "circle", id: "n2", label: "Mastery Core", x: 420, y: 110, color: "#34d399" },
              { type: "arrow", from: [240, 110], to: [360, 110], color: "#f472b6", label: "Builds" }
            ]
          },
          {
            title: "Relational Structure",
            description: "Attributes are mapped and optimized into cohesive, anomaly-free tables.",
            elements: [
              { type: "table", id: "t1", title: "Active Lecture Schema", x: 180, y: 50, headers: ["Attribute", "State"], rows: [["Topic", "Analyzed"], ["Modality", "Visual"], ["Status", "Optimized"]], color: "#818cf8" }
            ]
          },
          {
            title: "Calibrating Neural Synthesis",
            description: "The AI agent loop has refined the visual coordinates to establish 100% mastery.",
            elements: [
              { type: "circle", id: "n1", label: "Concept", x: 150, y: 70, color: "#818cf8" },
              { type: "circle", id: "n2", label: "Synthesis", x: 450, y: 70, color: "#34d399" },
              { type: "arrow", from: [210, 70], to: [390, 70], color: "#f472b6" },
              { type: "box", id: "final", title: "Calibrated VARK Vector Result", x: 200, y: 150, width: 200, height: 80, color: "#34d399" }
            ]
          }
        ]
      };
      setVideoFallbackData(fallbackMock);
    } finally {
      setIsVideoGenerating(false);
    }
  };

  const claimVideoXP = async () => {
    if (claimedVideoXP) return;
    try {
      await axios.post('http://localhost:5000/api/student/dna/student-priya/xp', { xpAmount: 50 });
      setClaimedVideoXP(true);
      triggerToast('🏆 Concept mastered! +50 XP awarded to student-priya Mastery profile.');
    } catch (err) {
      setClaimedVideoXP(true);
      triggerToast('🏆 Concept mastered! (Local XP +50 fallback)');
    }
  };

  const renderFallbackElement = (el: any, index: number) => {
    switch (el.type) {
      case 'circle':
        return (
          <g key={index}>
            <circle
              cx={el.x}
              cy={el.y}
              r="40"
              fill="var(--bg-secondary)"
              stroke={el.color || 'var(--color-primary)'}
              strokeWidth="2"
              style={{
                filter: el.glow ? 'drop-shadow(0 0 8px ' + (el.color || 'var(--color-primary)') + ')' : 'none',
                transition: 'all 0.5s ease'
              }}
            />
            <text
              x={el.x}
              y={el.y + 4}
              textAnchor="middle"
              fill="var(--text-primary)"
              fontSize="11px"
              fontWeight="600"
            >
              {el.label}
            </text>
          </g>
        );
      case 'node':
        return (
          <g key={index}>
            <rect
              x={el.x - 60}
              y={el.y - 20}
              width="120"
              height="40"
              rx="6"
              fill="var(--bg-secondary)"
              stroke={el.color || 'var(--color-secondary)'}
              strokeWidth="2"
              style={{
                filter: el.glow ? 'drop-shadow(0 0 8px ' + (el.color || 'var(--color-secondary)') + ')' : 'none',
                transition: 'all 0.5s ease'
              }}
            />
            <text
              x={el.x}
              y={el.y + 5}
              textAnchor="middle"
              fill="var(--text-primary)"
              fontSize="12px"
              fontWeight="600"
            >
              {el.label}
            </text>
          </g>
        );
      case 'box':
        return (
          <g key={index}>
            <rect
              x={el.x}
              y={el.y}
              width={el.width || 120}
              height={el.height || 60}
              rx="8"
              fill="var(--bg-primary)"
              stroke={el.color || 'var(--color-primary)'}
              strokeWidth="1.5"
              style={{ transition: 'all 0.5s ease' }}
            />
            <text
              x={el.x + (el.width || 120) / 2}
              y={el.y + 25}
              textAnchor="middle"
              fill={el.color || 'var(--color-primary)'}
              fontSize="11px"
              fontWeight="700"
            >
              {el.title}
            </text>
          </g>
        );
      case 'table':
        return (
          <foreignObject
            key={index}
            x={el.x}
            y={el.y}
            width="250"
            height="180"
          >
            <div
              className="card"
              style={{
                padding: '8px',
                border: '1px solid ' + (el.color || 'var(--border-color)'),
                fontSize: '11px',
                backgroundColor: 'var(--bg-card)',
                boxShadow: 'var(--glass-shadow)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <div style={{ fontWeight: 700, color: el.color || 'var(--color-secondary)', marginBottom: '4px', textAlign: 'center' }}>
                {el.title}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    {el.headers.map((h: string, idx: number) => (
                      <th key={idx} style={{ padding: '4px', textAlign: 'left', fontSize: '9px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {el.rows.map((row: any[], rowIdx: number) => {
                    const isHighlighted = el.highlightRow === rowIdx;
                    return (
                      <tr
                        key={rowIdx}
                        style={{
                          backgroundColor: isHighlighted ? 'var(--color-primary-glow)' : 'transparent',
                          borderBottom: '1px solid var(--border-color)'
                        }}
                      >
                        {row.map((cell: any, cellIdx: number) => (
                          <td key={cellIdx} style={{ padding: '4px', fontSize: '9px' }}>{cell}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </foreignObject>
        );
      case 'arrow':
        const fx = el.from[0];
        const fy = el.from[1];
        const tx = el.to[0];
        const ty = el.to[1];
        const mx = (fx + tx) / 2;
        const my = (fy + ty) / 2 - 8;
        return (
          <g key={index}>
            <defs>
              <marker
                id={`arrowhead-${index}`}
                markerWidth="10"
                markerHeight="7"
                refX="8"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill={el.color || 'var(--text-primary)'} />
              </marker>
            </defs>
            <line
              x1={fx}
              y1={fy}
              x2={tx}
              y2={ty}
              stroke={el.color || 'var(--text-primary)'}
              strokeWidth="2"
              markerEnd={`url(#arrowhead-${index})`}
              style={{ transition: 'all 0.5s ease' }}
            />
            {el.label && (
              <text
                x={mx}
                y={my}
                textAnchor="middle"
                fill={el.color || 'var(--text-secondary)'}
                fontSize="9px"
                fontWeight="500"
              >
                {el.label}
              </text>
            )}
          </g>
        );
      case 'text':
        return (
          <text
            key={index}
            x={el.x}
            y={el.y}
            fill={el.color || 'var(--text-primary)'}
            fontSize="11px"
            fontWeight="500"
          >
            {el.text}
          </text>
        );
      default:
        return null;
    }
  };

  const fetchNotes = async () => {
    // 1. Fetch Course details (Moodle chapter structure)
    try {
      const response = await axios.get(`http://localhost:5000/api/student/courses/${courseId || 'course-dbms'}`);
      setCourse(response.data);
      if (response.data.modules && response.data.modules.length > 0) {
        const defaultMod = response.data.modules[0];
        setSelectedModuleId(defaultMod.moduleId);
        setSelectedNote({
          id: defaultMod.moduleId,
          courseId: courseId || 'course-dbms',
          uploaderId: 'teacher-sharma',
          role: 'teacher',
          title: defaultMod.title,
          content: defaultMod.notesContent || 'No lecture notes uploaded for this chapter yet.',
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn('[CourseDetail] Backend offline or course API failed. Using preseeded or local storage catalog.');
      
      const mockCatalog: any[] = [
        {
          _id: 'course-dbms',
          title: "Professor Sharma's Introduction to Database Systems",
          subject: 'DBMS',
          domain: 'college',
          examTags: ['GATE', 'Semester Exam'],
          enrollmentCount: 142,
          language: 'en',
          modules: [
            { 
              moduleId: 'module-1-keys', 
              title: 'Database Keys and Integrity Constraints', 
              sequenceOrder: 1,
              durationMinutes: 45,
              conceptsTaught: ['Primary Key', 'Foreign Key', 'Integrity Constraints'],
              notesContent: "Database Integrity refers to the correctness and consistency of stored data. There are Entity Integrity, Referential Integrity, and Domain Integrity. A primary key uniquely identifies each record. A foreign key is a column or group of columns in one table that provides a link between data in two tables."
            },
            { 
              moduleId: 'module-2-normalization', 
              title: 'Normalization Theory: 1NF, 2NF, 3NF', 
              sequenceOrder: 2,
              durationMinutes: 60,
              conceptsTaught: ['1NF', '2NF', '3NF', 'Functional Dependency'],
              notesContent: "Database Normalization is the formal process of structuring a relational database to reduce data redundancy and improve data integrity. Third Normal Form (3NF) aims to eliminate transitive functional dependencies. If A -> B and B -> C, then A -> C is a transitive dependency. A relation is in 3NF if and only if for every non-trivial functional dependency X -> A, X is a superkey or A is a prime attribute."
            }
          ],
          enrolledStudents: []
        },
        {
          _id: 'course-daa',
          title: "Advanced Data Structures & Algorithms",
          subject: 'DAA',
          domain: 'competitive',
          examTags: ['GATE', 'Codeforces'],
          enrollmentCount: 98,
          language: 'en',
          modules: [
            { 
              moduleId: 'module-daa-1', 
              title: 'Asymptotic Analysis & Big-O Notation', 
              sequenceOrder: 1,
              durationMinutes: 40,
              conceptsTaught: ['Big-O', 'Omega', 'Theta', 'Complexity'],
              notesContent: "Asymptotic Analysis of an algorithm refers to defining the mathematical boundation/framing of its run-time performance. Using Big-O notation, we can represent the upper bound of the running time of an algorithm."
            },
            { 
              moduleId: 'module-daa-2', 
              title: 'Divide & Conquer Recurrences', 
              sequenceOrder: 2,
              durationMinutes: 50,
              conceptsTaught: ['Master Method', 'Recursion Tree', 'Merge Sort'],
              notesContent: "Divide and Conquer is an algorithmic paradigm. In divide and conquer, the problem is partitioned into smaller subproblems. Master Theorem provides a cookbook solution for recurrences of the form T(n) = aT(n/b) + f(n)."
            },
            { 
              moduleId: 'module-daa-3', 
              title: 'Dynamic Programming Optimization', 
              sequenceOrder: 3,
              durationMinutes: 75,
              conceptsTaught: ['Memoization', 'Tabulation', 'Optimal Substructure'],
              notesContent: "Dynamic Programming is mainly an optimization over plain recursion. Wherever we see a recursive solution that has repeated calls for same inputs, we can optimize it using Dynamic Programming (Memoization or Tabulation)."
            }
          ],
          enrolledStudents: []
        }
      ];

      // Add locally created courses from localStorage
      try {
        const locallyCreated = localStorage.getItem('mockCourses');
        if (locallyCreated) {
          const parsed = JSON.parse(locallyCreated);
          mockCatalog.push(...parsed);
        }
      } catch (e) {
        console.error(e);
      }

      const currentCourse = mockCatalog.find(c => c._id === courseId) || mockCatalog[0];
      setCourse(currentCourse);

      if (currentCourse && currentCourse.modules && currentCourse.modules.length > 0) {
        const defaultMod = currentCourse.modules[0];
        setSelectedModuleId(defaultMod.moduleId);
        setSelectedNote({
          id: defaultMod.moduleId,
          courseId: courseId || 'course-dbms',
          uploaderId: 'teacher-sharma',
          role: 'teacher',
          title: defaultMod.title,
          content: defaultMod.notesContent || 'No lecture notes uploaded for this chapter yet.',
          createdAt: new Date().toISOString()
        });
      }
    }

    // 2. Fetch Student notes
    try {
      const response = await axios.get(`http://localhost:5000/api/upload/notes/${courseId || 'course-dbms'}`);
      const fetchedNotes = response.data.notes || [];
      setNotes(fetchedNotes.filter((n: any) => n.role === 'student'));
    } catch (error) {
      console.warn('[CourseDetail] Student notes fetch failed. Using localStorage fallbacks.');
      try {
        const localStudNotes = localStorage.getItem(`student_notes_${courseId}`);
        if (localStudNotes) {
          setNotes(JSON.parse(localStudNotes));
        } else {
          setNotes([]);
        }
      } catch (e) {
        setNotes([]);
      }
    }

    // 3. Load active DNA and preferred VARK style
    try {
      const dnaResponse = await axios.get('http://localhost:5000/api/student/dna/student-priya');
      if (dnaResponse.data?.dna) {
        setLearningModality(dnaResponse.data.dna.learningModality || 'visual');
        setPrefStyles(dnaResponse.data.dna.preferredExplanationStyles || []);
        
        // Find the active course to get unlocked modules
        const currentCourse = dnaResponse.data.dna.enrolledCourses?.find(
          (c: any) => c.courseId === (courseId || 'course-dbms')
        );
        if (currentCourse?.unlockedModules) {
          setUnlockedModules(currentCourse.unlockedModules);
        } else {
          // If none are unlocked, default to unlocking the first module
          setUnlockedModules(course?.modules?.[0] ? [course.modules[0].moduleId] : ['mod-1']);
        }
      }
    } catch (err) {
      console.warn('[CourseDetail] DNA fetch failed, fallback to visual modality');
    }
  };

  useEffect(() => {
    fetchNotes();
    if (courseId) {
      localStorage.setItem('activeCourseId', courseId);
    }
  }, [courseId]);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isNovaTyping]);

  const handleModuleClick = async (mod: any) => {
    if (!unlockedModules.includes(mod.moduleId)) {
      setPendingModuleId(mod.moduleId);
      try {
        const response = await axios.get(`http://localhost:5000/api/quiz/prerequisite/${courseId || 'course-dbms'}/${mod.moduleId}`);
        setPrerequisiteQuestions(response.data.questions || []);
        setShowPrerequisiteModal(true);
      } catch (err) {
        console.error('Failed to fetch prerequisite questions');
      }
    } else {
      const nextModuleId = selectedModuleId === mod.moduleId ? null : mod.moduleId;
      setSelectedModuleId(nextModuleId);
      if (nextModuleId) {
        setSelectedNote({
          id: mod.moduleId,
          courseId: courseId || 'course-dbms',
          uploaderId: 'teacher-sharma',
          role: 'teacher',
          title: mod.title,
          content: mod.notesContent || 'No lecture notes uploaded for this chapter yet.',
          createdAt: new Date().toISOString()
        });
        fetchFlashcards(nextModuleId);
      } else {
        setSelectedNote(null);
      }
    }
  };

  const fetchFlashcards = async (moduleId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/flashcards/${courseId || 'course-dbms'}/${moduleId}`);
      setFlashcards(response.data.flashcards || []);
      setContentViewMode('flashcards');
      setActiveFlashcardIndex(0);
      setIsFlashcardFlipped(false);
    } catch (err) {
      console.error('Failed to fetch flashcards');
    }
  };

  const submitPrerequisiteTest = async () => {
    if (!pendingModuleId) return;
    setIsSubmittingDiagnostic(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/quiz/prerequisite/${courseId || 'course-dbms'}/${pendingModuleId}/verify`, {
        studentId: 'student-priya',
        answers: prerequisiteAnswers
      });
      setPrerequisiteResult(response.data);
      setUnlockedModules(prev => [...prev, pendingModuleId]);
    } catch (err) {
      console.error('Failed to submit test');
    } finally {
      setIsSubmittingDiagnostic(false);
    }
  };

  const closePrerequisiteModal = () => {
    setShowPrerequisiteModal(false);
    const wasUnlocked = prerequisiteResult?.unlocked;
    const modId = pendingModuleId;
    setPrerequisiteResult(null);
    setPrerequisiteAnswers({});
    setPendingModuleId(null);
    
    if (wasUnlocked && modId) {
      setSelectedModuleId(modId);
      const mod = course?.modules?.find((m: any) => m.moduleId === modId);
      if (mod) {
        setSelectedNote({
          id: mod.moduleId,
          courseId: courseId || 'course-dbms',
          uploaderId: 'teacher-sharma',
          role: 'teacher',
          title: mod.title,
          content: mod.notesContent || 'No lecture notes uploaded for this chapter yet.',
          createdAt: new Date().toISOString()
        });
      }
      fetchFlashcards(modId);
    }
  };

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
      
      const updatedNotes = [...notes, localNewNote];
      setNotes(updatedNotes);
      localStorage.setItem(`student_notes_${courseId}`, JSON.stringify(updatedNotes));
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
                      className={tab.id === 'visual' && !isActive ? 'animate-pulse-glow' : ''}
                      style={{
                        backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
                        border: isActive ? '1px solid var(--border-color)' : tab.id === 'visual' ? '1px dashed var(--color-primary)' : 'none',
                        borderRadius: '6px',
                        padding: '8px 4px',
                        color: isActive ? 'var(--text-primary)' : tab.id === 'visual' ? 'var(--color-primary)' : 'var(--text-muted)',
                        fontSize: '12.5px',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px'
                      }}
                    >
                      <span>{tab.label}</span>
                      {tab.id === 'visual' && (
                        <span 
                          style={{ 
                            fontSize: '8px', 
                            fontWeight: 700, 
                            color: isActive ? 'var(--color-primary)' : '#818cf8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}
                        >
                          ⚡ Video AI
                        </span>
                      )}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Header Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)', display: 'block' }}>
                          🎥 AI Agentic Manim Video Explainer
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          VARK Visual learning modality calibrated for chapter: "{selectedNote?.title || 'Relational Schema'}"
                        </span>
                      </div>
                      
                      <Button
                        variant={isVideoGenerating ? 'ghost' : 'primary'}
                        onClick={startVideoGeneration}
                        disabled={isVideoGenerating}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 0 15px var(--color-primary-glow)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Video size={16} className={isVideoGenerating ? 'animate-spin' : ''} />
                        {isVideoGenerating ? 'Agent Drafting Code...' : videoLogs.length > 0 ? '🔄 Regenerate Explainer' : 'Generate AI Explainer'}
                      </Button>
                    </div>

                    {/* Console & Canvas Split Viewport */}
                    {videoLogs.length > 0 ? (
                      <div 
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: '20px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {/* Left Console (Telemetry Console) */}
                        <div 
                          style={{
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(2, 4, 10, 0.85)',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            boxShadow: 'var(--glass-shadow)',
                            backdropFilter: 'blur(10px)',
                            minHeight: '240px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <Terminal size={14} style={{ color: 'var(--color-secondary)' }} />
                            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                              AI Agent Telemetry logs
                            </span>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
                            </div>
                          </div>

                          {/* Terminal content */}
                          <div 
                            style={{ 
                              flex: 1, 
                              overflowY: 'auto', 
                              maxHeight: '180px', 
                              fontFamily: 'monospace', 
                              fontSize: '11px', 
                              lineHeight: '1.6',
                              color: '#a9b1d6',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              paddingRight: '6px'
                            }}
                          >
                            {videoLogs.map((log, index) => {
                              let prefix = '⚙️';
                              let color = '#73daca';
                              if (log.status === 'working') {
                                prefix = '⏳';
                                color = '#e0af68';
                              } else if (log.status === 'success') {
                                prefix = '✅';
                                color = '#9ece6a';
                              } else if (log.status === 'healing') {
                                prefix = '🛠️';
                                color = '#bb9af7';
                              } else if (log.status === 'warning') {
                                prefix = '⚠️';
                                color = '#f7768e';
                              } else if (log.status === 'info') {
                                prefix = '📡';
                                color = '#7aa2f7';
                              }
                              return (
                                <div key={index} style={{ borderLeft: '2px solid ' + color, paddingLeft: '8px', margin: '2px 0' }}>
                                  <span style={{ color: color, fontWeight: 700, marginRight: '6px' }}>
                                    [{log.agent}]
                                  </span>
                                  <span style={{ color: '#c0caf5' }}>{log.message}</span>
                                </div>
                              );
                            })}
                            {isVideoGenerating && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', marginTop: '8px', fontStyle: 'italic' }}>
                                <span className="animate-pulse">●</span> Synthesizing canvas frames...
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Screen (Media Player / Interactive Vector SVG Fallback) */}
                        <div 
                          style={{
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                            backgroundColor: 'var(--bg-primary)',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            boxShadow: 'var(--glass-shadow)',
                            minHeight: '340px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {videoRenderSuccess && videoUrl ? '🎬 Rendered Manim Video Output' : '🎨 Interactive Vector Animation Simulator'}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              {videoRenderSuccess ? 'High Contrast MP4' : 'Sandbox Resilient Fallback Mode'}
                            </span>
                          </div>

                          {videoRenderSuccess && videoUrl ? (
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#000' }}>
                              <video 
                                src={videoUrl} 
                                controls 
                                style={{ width: '100%', maxHeight: '250px' }} 
                                autoPlay 
                              />
                            </div>
                          ) : (
                            /* Structured Interactive Vector Fallback */
                            videoFallbackData ? (
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {/* Step description */}
                                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--color-primary)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                    <strong style={{ fontSize: '12px', color: 'var(--color-primary)' }}>
                                      {videoFallbackData.steps[activeVideoStep]?.title}
                                    </strong>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                      Step {activeVideoStep + 1} of {videoFallbackData.steps.length}
                                    </span>
                                  </div>
                                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                                    {videoFallbackData.steps[activeVideoStep]?.description}
                                  </p>
                                </div>

                                {/* Dynamic SVG Graphic Board */}
                                <div 
                                  style={{ 
                                    flex: 1, 
                                    minHeight: '220px', 
                                    border: '1px solid var(--border-color)', 
                                    borderRadius: '8px', 
                                    backgroundColor: 'rgba(6, 8, 20, 0.7)', 
                                    position: 'relative',
                                    overflow: 'hidden'
                                  }}
                                >
                                  <svg style={{ width: '100%', height: '100%', minHeight: '220px' }}>
                                    {/* Render dynamic interactive elements */}
                                    {videoFallbackData.steps[activeVideoStep]?.elements.map((el: any, idx: number) => 
                                      renderFallbackElement(el, idx)
                                    )}
                                  </svg>
                                </div>

                                {/* Step navigation controls */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px' }}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveVideoStep(prev => Math.max(0, prev - 1))}
                                    disabled={activeVideoStep === 0}
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <ChevronLeft size={14} /> Back
                                  </Button>
                                  
                                  {activeVideoStep < videoFallbackData.steps.length - 1 ? (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => setActiveVideoStep(prev => prev + 1)}
                                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      Next Step <ChevronRight size={14} />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="accent"
                                      size="sm"
                                      onClick={claimVideoXP}
                                      disabled={claimedVideoXP}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        boxShadow: claimedVideoXP ? 'none' : '0 0 12px var(--color-accent-glow)'
                                      }}
                                    >
                                      <Award size={14} style={{ color: '#fff' }} />
                                      {claimedVideoXP ? '🏆 Explainer Claimed!' : '🏆 Claim +50 XP'}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                                Awaiting Agent Generation...
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Zero state explanation */
                      <div 
                        style={{ 
                          border: '1px dashed var(--border-color)', 
                          borderRadius: '10px', 
                          padding: '30px', 
                          textAlign: 'center',
                          backgroundColor: 'rgba(250, 250, 250, 0.02)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary-glow)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--color-primary)' }}>
                          <Video size={24} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '14px', display: 'block', color: 'var(--text-primary)' }}>
                            No Visual Explainer Generated Yet
                          </strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '400px', display: 'block', margin: '4px auto 0 auto', lineHeight: '1.5' }}>
                            Unlock high-fidelity mathematical and structural animations generated dynamically by our multi-agent self-healing rendering pipeline.
                          </span>
                        </div>
                        <Button variant="primary" onClick={startVideoGeneration}>
                          ⚡ Generate Video Explainer (+50 XP Opportunity)
                        </Button>
                      </div>
                    )}
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
                  (!course || !course.modules || course.modules.length === 0) ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No teacher chapters uploaded yet.</p>
                  ) : (
                    course.modules.map((mod: any) => {
                      const isActive = selectedModuleId === mod.moduleId;
                      const isUnlocked = unlockedModules.includes(mod.moduleId);
                      return (
                        <div 
                          key={mod.moduleId}
                          onClick={() => handleModuleClick(mod)}
                          style={{
                            padding: '14px 18px',
                            borderRadius: '8px',
                            border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                            backgroundColor: isActive ? 'var(--color-primary-glow)' : 'var(--bg-secondary)',
                            cursor: 'pointer',
                            opacity: isUnlocked ? 1 : 0.6,
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}
                        >
                          {/* Left: BookOpen, Chapter Tag, Duration Badge */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                            <div 
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                backgroundColor: isActive ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                transition: 'all 0.2s ease',
                                flexShrink: 0
                              }}
                            >
                              <BookOpen size={18} color={isActive ? '#ffffff' : 'var(--color-primary)'} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                                Chapter {mod.sequenceOrder}
                              </span>
                              <span 
                                style={{ 
                                  fontSize: '10px', 
                                  color: 'var(--text-secondary)',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  width: 'fit-content',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Clock size={10} /> {mod.durationMinutes || 45} mins
                              </span>
                            </div>
                          </div>

                          {/* Center: Module Title and concepts list */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                            <h4 style={{ margin: '0', fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {mod.title}
                            </h4>
                            {mod.conceptsTaught && mod.conceptsTaught.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {mod.conceptsTaught.map((concept: string, idx: number) => (
                                  <span 
                                    key={idx}
                                    style={{
                                      fontSize: '9px',
                                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                      border: '1px solid rgba(255, 255, 255, 0.05)',
                                      padding: '1px 6px',
                                      borderRadius: '10px',
                                      color: 'var(--text-muted)'
                                    }}
                                  >
                                    {concept}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Right: Chevron icon rotating 90 degrees if active, and premium direct shortcut */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {!isUnlocked && (
                              <Lock size={16} color="var(--text-muted)" />
                            )}
                            {isActive && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateVarkStyle('visual', { video_completion_rate: 1.0, diagram_interaction_rate: 0.95 });
                                  window.scrollTo({ top: 320, behavior: 'smooth' });
                                }}
                                className="animate-pulse-glow"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  backgroundColor: 'rgba(99, 102, 241, 0.18)',
                                  border: '1px dashed var(--color-primary)',
                                  borderRadius: '6px',
                                  padding: '5px 10px',
                                  color: '#ffffff',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  fontFamily: 'Outfit, sans-serif',
                                  backdropFilter: 'blur(8px)',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.35)';
                                  e.currentTarget.style.borderStyle = 'solid';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.18)';
                                  e.currentTarget.style.borderStyle = 'dashed';
                                }}
                              >
                                🎥 AI Explainer
                              </button>
                            )}
                            <div 
                              style={{ 
                                transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)', 
                                transition: 'transform 0.2s ease',
                                color: isActive ? 'var(--color-primary)' : 'var(--text-muted)'
                              }}
                            >
                              <ChevronRight size={18} />
                            </div>
                          </div>
                        </div>
                      );
                    })
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

            {/* Premium Chapter Notes Card (Outfit Typography) */}
            {selectedNote && (
              <Card style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                {/* View Toggles */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <button 
                    onClick={() => setContentViewMode('flashcards')}
                    style={{ 
                      background: 'transparent', border: 'none', color: contentViewMode === 'flashcards' ? 'var(--color-primary)' : 'var(--text-muted)', 
                      fontWeight: 600, cursor: 'pointer', borderBottom: contentViewMode === 'flashcards' ? '2px solid var(--color-primary)' : '2px solid transparent' 
                    }}>
                    Socratic Flashcards
                  </button>
                  <button 
                    onClick={() => setContentViewMode('notes')}
                    style={{ 
                      background: 'transparent', border: 'none', color: contentViewMode === 'notes' ? 'var(--color-primary)' : 'var(--text-muted)', 
                      fontWeight: 600, cursor: 'pointer', borderBottom: contentViewMode === 'notes' ? '2px solid var(--color-primary)' : '2px solid transparent' 
                    }}>
                    Raw Notes
                  </button>
                </div>

                {contentViewMode === 'notes' && (
                  <>
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
                      {selectedNote.title}
                    </h3>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '15px', lineHeight: '1.7', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto', color: 'var(--text-secondary)' }}>
                      {selectedNote.content}
                    </div>
                  </>
                )}
                
                {contentViewMode === 'flashcards' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', perspective: '1000px' }}>
                    {flashcards.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)' }}>No flashcards generated for this chapter.</p>
                    ) : (
                      <>
                        <div 
                          onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                          style={{
                            width: '100%', maxWidth: '400px', height: '250px',
                            position: 'relative',
                            transition: 'transform 0.6s',
                            transformStyle: 'preserve-3d',
                            cursor: 'pointer',
                            transform: isFlashcardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                          }}>
                          {/* Front */}
                          <Card style={{
                            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center',
                            background: 'var(--color-primary-glow)', border: '1px solid var(--color-primary)', fontSize: '18px', fontWeight: 600
                          }}>
                            {flashcards[activeFlashcardIndex]?.front}
                          </Card>
                          {/* Back */}
                          <Card style={{
                            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center',
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', transform: 'rotateY(180deg)', fontSize: '16px'
                          }}>
                            {flashcards[activeFlashcardIndex]?.back}
                          </Card>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                          <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setActiveFlashcardIndex(Math.max(0, activeFlashcardIndex - 1)); setIsFlashcardFlipped(false); }} disabled={activeFlashcardIndex === 0}>
                            Previous
                          </Button>
                          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                            {activeFlashcardIndex + 1} / {flashcards.length}
                          </span>
                          <Button variant="primary" onClick={(e) => { e.stopPropagation(); setActiveFlashcardIndex(Math.min(flashcards.length - 1, activeFlashcardIndex + 1)); setIsFlashcardFlipped(false); }} disabled={activeFlashcardIndex === flashcards.length - 1}>
                            Next
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Card>
            )}

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

      {showPrerequisiteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card style={{ width: '600px', maxWidth: '90%', padding: '32px', background: 'var(--bg-primary)', border: '1px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Brain color="var(--color-primary)" /> Prerequisite Diagnostic
              </h2>
            </div>

            {!prerequisiteResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Please answer these questions to unlock the chapter flashcards.</p>
                {prerequisiteQuestions.map((q, idx) => (
                  <div key={q.id}>
                    <p style={{ fontWeight: 600, marginBottom: '12px' }}>{idx + 1}. {q.text}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((opt: string) => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', background: prerequisiteAnswers[q.id] === opt ? 'var(--color-primary-glow)' : 'var(--bg-secondary)', border: prerequisiteAnswers[q.id] === opt ? '1px solid var(--color-primary)' : '1px solid var(--border-color)', borderRadius: '8px' }}>
                          <input 
                            type="radio" 
                            name={`prereq-${q.id}`} 
                            value={opt} 
                            checked={prerequisiteAnswers[q.id] === opt}
                            onChange={() => setPrerequisiteAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            style={{ display: 'none' }}
                          />
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--color-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {prerequisiteAnswers[q.id] === opt && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }} />}
                          </div>
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="primary" 
                  onClick={submitPrerequisiteTest} 
                  disabled={isSubmittingDiagnostic || Object.keys(prerequisiteAnswers).length < prerequisiteQuestions.length}
                >
                  {isSubmittingDiagnostic ? 'Evaluating...' : 'Submit Diagnostic & Unlock'}
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-success)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Check size={32} color="white" />
                </div>
                <h3>Chapter Unlocked!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>You scored <strong>{prerequisiteResult.score}%</strong> on the prerequisite check.</p>
                
                <div style={{ width: '100%', display: 'flex', gap: '16px', marginTop: '16px' }}>
                  <div style={{ flex: 1, padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '4px solid var(--color-success)', textAlign: 'left' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-success)' }}>Strong Points</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                      {prerequisiteResult.strongPoints?.map((p: string) => <li key={p}>{p}</li>)}
                      {(!prerequisiteResult.strongPoints || prerequisiteResult.strongPoints.length === 0) && <li>None detected yet</li>}
                    </ul>
                  </div>
                  <div style={{ flex: 1, padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '4px solid var(--color-danger)', textAlign: 'left' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-danger)' }}>Focus Areas</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                      {prerequisiteResult.weakPoints?.map((p: string) => <li key={p}>{p}</li>)}
                      {(!prerequisiteResult.weakPoints || prerequisiteResult.weakPoints.length === 0) && <li>None detected yet</li>}
                    </ul>
                  </div>
                </div>

                <Button variant="primary" onClick={closePrerequisiteModal} style={{ marginTop: '24px', width: '100%' }}>
                  Continue to Flashcards
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      <NovaBubble />
      <AccessibilityPanel />
    </div>
  );
};

export default CourseDetail;
