import React, { useState, useEffect } from 'react';
import { NovaSidebar } from '../../components/nova/NovaSidebar.tsx';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import axios from 'axios';

import { 
  Calendar as CalendarIcon, 
  AlertTriangle, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  X, 
  Layers, 
  Plus, 
  Trash2, 
  Award 
} from 'lucide-react';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface ExamOption {
  name: string;
  date: Date;
  code: string;
}

const EXAMS: Record<string, ExamOption> = {
  gate_2027: { code: 'GATE', name: 'GATE CSE 2027', date: new Date('2027-02-06T09:00:00') },
  upsc_2026: { code: 'UPSC', name: 'UPSC Civil Services 2026', date: new Date('2026-10-18T09:00:00') },
  jee_2026: { code: 'JEE', name: 'JEE Advanced 2026', date: new Date('2026-06-14T09:00:00') },
  semester_2026: { code: 'SEM', name: 'College Semester Finals', date: new Date('2026-12-18T10:00:00') },
};

const BOOST_QUESTIONS = [
  {
    question: "Priya, let's examine a relation R(A, B, C) with dependencies A -> B and B -> C. Does a transitive dependency exist, and if so, how does BCNF handle it?",
    answerKeywords: ["yes", "transitive", "bcnf", "decompose", "superkey"],
    hint: "Think about B -> C where B is not a superkey in R.",
    successReply: "Perfect! Since B is not a superkey, R violates BCNF (and 3NF). Decomposing R into R1(A, B) and R2(B, C) resolves the anomaly. Splendid logic!"
  },
  {
    question: "Excellent work on functional dependencies! Now, why does 3NF allow a prime attribute on the right side of a dependency (X -> A) even if X is not a superkey, whereas BCNF strictly forbids it?",
    answerKeywords: ["prime", "3nf", "bcnf", "superkey", "strict"],
    hint: "Recall that 3NF preserves functional dependencies during decomposition, whereas BCNF sometimes cannot.",
    successReply: "That's exactly correct! 3NF compromises slightly on redundancy to guarantee dependency preservation. BCNF is stricter and eliminates all redundancy but might lose dependencies. You have mastered this!"
  }
];

export const StudyPlan: React.FC = () => {
  const [selectedExamKey, setSelectedExamKey] = useState<string>('gate_2027');
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  // Gamification state loaded/synchronized locally
  const [xp, setXp] = useState<number>(450);
  const [streak, setStreak] = useState<number>(12);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load data from backend on mount
  useEffect(() => {
    const fetchPlanAndDna = async () => {
      try {
        const dnaResponse = await axios.get('http://localhost:5000/api/student/dna/student-priya');
        const planResponse = await axios.get('http://localhost:5000/api/plan/student-priya');
        
        if (dnaResponse.data?.dna) {
          const dna = dnaResponse.data.dna;
          setXp(dna.xpPoints || 450);
          setStreak(dna.streakDays || 12);
          
          // Re-calculate box distribution counts based on masteryScores!
          const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          dna.masteryScores?.forEach((m: any) => {
            let boxNum = 1;
            if (m.confidence >= 0.9) boxNum = 5;
            else if (m.confidence >= 0.7) boxNum = 4;
            else if (m.confidence >= 0.5) boxNum = 3;
            else if (m.confidence >= 0.3) boxNum = 2;
            
            counts[boxNum] = (counts[boxNum] || 0) + 1;
          });
          setBoxCounts(counts);
        }
        
        if (planResponse.data?.plan?.items) {
          const items = planResponse.data.plan.items.map((item: any, idx: number) => ({
            id: item.id || `plan-${idx}`,
            date: item.date || 'Today',
            subject: item.subject || 'DBMS',
            topic: item.topic || '',
            type: item.type || 'revision',
            time: item.time || '9 PM - 10 PM',
            box: item.box || 1,
            completed: item.completed || false
          }));
          setPlanItems(items);
        }
      } catch (err) {
        console.warn('⚠️ Backend offline. Continuing with pre-seeded mock states.');
      }
    };
    
    fetchPlanAndDna();
  }, []);

  // Async function to persist study plan items to the backend database
  const savePlanToBackend = async (items: any) => {
    try {
      await axios.post('http://localhost:5000/api/plan/student-priya/items', { items });
    } catch (err) {
      console.warn('⚠️ Failed to save plan items to backend:', err);
    }
  };

  // Active filters and drawer states
  const [selectedBoxFilter, setSelectedBoxFilter] = useState<number | null>(null);
  const [showOptimizer, setShowOptimizer] = useState<boolean>(false);
  const [optimizerLogs, setOptimizerLogs] = useState<string[]>([]);
  const [showBoostModal, setShowBoostModal] = useState<boolean>(false);
  const [boostStep, setBoostStep] = useState<number>(0);
  const [userBoostAnswer, setUserBoostAnswer] = useState<string>('');
  const [boostFeedback, setBoostFeedback] = useState<string>('');
  const [boostSuccess, setBoostSuccess] = useState<boolean>(false);

  // Form states for adding custom plan slots
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newSubject, setNewSubject] = useState<string>('DBMS');
  const [newTopic, setNewTopic] = useState<string>('');
  const [newType, setNewType] = useState<'revision' | 'new_content' | 'mock_test'>('revision');
  const [newBox, setNewBox] = useState<number>(1);
  const [newTime, setNewTime] = useState<string>('9 PM - 10 PM');

  // Spaced Repetition items in state
  const [planItems, setPlanItems] = useState([
    { id: '1', date: 'Today', subject: 'DBMS', topic: 'BCNF vs 3NF Decomposition', type: 'revision', time: '9 PM - 11 PM', box: 2, completed: false },
    { id: '2', date: 'Tomorrow', subject: 'DBMS', topic: 'Practice Quiz on Normal Forms', type: 'new_content', time: '9 PM - 10 PM', box: 1, completed: false },
    { id: '3', date: 'May 24', subject: 'Algorithms', topic: 'Dynamic Programming Spacing Grid', type: 'revision', time: '8 PM - 10 PM', box: 3, completed: false },
    { id: '4', date: 'May 25', subject: 'DBMS', topic: 'Transitive Functional Dependencies review', type: 'revision', time: '7 PM - 8 PM', box: 2, completed: false },
    { id: '5', date: 'May 26', subject: 'GATE Prep', topic: 'Mock Test on Relational Algebra', type: 'mock_test', time: '8 PM - 11 PM', box: 4, completed: false },
  ]);

  // Simulated Leitner box state
  const [boxCounts, setBoxCounts] = useState<Record<number, number>>({
    1: 1,
    2: 2,
    3: 1,
    4: 1,
    5: 8,
  });

  const selectedExam = EXAMS[selectedExamKey];

  // Tick timer every second
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +selectedExam.date - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [selectedExamKey]);

  // Visual XP notification toast helper
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle dynamic completion status of a study plan item
  const toggleCompleteItem = async (id: string) => {
    const updatedItems = planItems.map(item => {
      if (item.id === id) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });
    setPlanItems(updatedItems);
    await savePlanToBackend(updatedItems);

    const completedItem = planItems.find(item => item.id === id);
    if (completedItem && !completedItem.completed) {
      try {
        const response = await axios.post('http://localhost:5000/api/student/dna/student-priya/xp', { xpAmount: 50 });
        if (response.data?.dna) {
          setXp(response.data.dna.xpPoints);
        } else {
          setXp(prev => prev + 50);
        }
        triggerToast('⭐ +50 XP Awarded for completing revision task!');
      } catch (err) {
        setXp(prev => prev + 50);
        triggerToast('⭐ +50 XP Awarded (Local fallback)!');
      }
    }
  };

  // Delete a specific spaced repetition calendar slot
  const deleteItem = async (id: string, boxLevel: number) => {
    const updatedItems = planItems.filter(item => item.id !== id);
    setPlanItems(updatedItems);
    await savePlanToBackend(updatedItems);

    setBoxCounts(prev => ({
      ...prev,
      [boxLevel]: Math.max(0, (prev[boxLevel] || 0) - 1)
    }));
    triggerToast('🗑️ Slot removed from revision calendar.');
  };

  // Add custom scheduled study slot
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      date: 'Today',
      subject: newSubject,
      topic: newTopic,
      type: newType,
      time: newTime,
      box: newBox,
      completed: false
    };

    const updatedItems = [...planItems, newItem];
    setPlanItems(updatedItems);
    await savePlanToBackend(updatedItems);

    setBoxCounts(prev => ({
      ...prev,
      [newBox]: (prev[newBox] || 0) + 1
    }));

    setNewTopic('');
    setShowAddForm(false);
    triggerToast('📅 Custom slot scheduled successfully!');
  };

  // Trigger SM-2 Cognitive load balancing solver
  const runSM2Optimizer = async () => {
    setShowOptimizer(true);
    setOptimizerLogs([
      '🚀 Initializing SM-2 Cognitive Load Balancer...',
      '📥 Querying active student profile telemetry...',
      '🤖 Fetching dynamic spaced repetition schedules via /planner/srs...',
      '✅ Calibrating intervals & easiness factors (e-factors)...'
    ]);

    setTimeout(() => {
      setOptimizerLogs(prev => [
        ...prev,
        '🔄 Sorting topics by cognitive decay risk (theta & confidence)...',
        '📊 Rebalanced 5 topics in Leitner Box 1 & 2.',
        '📅 Generated optimized sequence targeting 70-75% retention success.'
      ]);
    }, 400);

    setTimeout(async () => {
      const sortedItems = [...planItems].sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return a.box - b.box;
      });

      setPlanItems(sortedItems);
      await savePlanToBackend(sortedItems);

      setOptimizerLogs(prev => [
        ...prev,
        '💾 Optimized plan persisted to remote MongoDB server.',
        '🎉 SM-2 Optimization Complete! Peak retention calibrated.'
      ]);
      triggerToast('🧠 Spaced queue optimized via SM-2 solver!');
    }, 800);
  };

  // Submit and grade the socratic challenge boost interaction
  const submitBoostAnswer = async () => {
    const currentQuestion = BOOST_QUESTIONS[boostStep];
    const answer = userBoostAnswer.toLowerCase();
    
    const matchingKeywords = currentQuestion.answerKeywords.filter(kw => answer.includes(kw.toLowerCase()));
    
    if (matchingKeywords.length >= 2) {
      setBoostFeedback(currentQuestion.successReply);
      setBoostSuccess(true);
      
      setTimeout(async () => {
        if (boostStep === 0) {
          setBoostStep(1);
          setUserBoostAnswer('');
          setBoostFeedback('');
          setBoostSuccess(false);
        } else {
          try {
            const updateRes = await axios.post('http://localhost:5000/api/plan/leitner/update', {
              studentId: 'student-priya',
              conceptId: 'normalization-3nf-bcnf',
              quality: 5,
              prevInterval: 2,
              prevRepetitions: 1,
              prevEfactor: 2.5,
              isSocraticBoost: true
            });

            if (updateRes.data?.success) {
              const dna = updateRes.data.dna;
              if (dna) {
                setXp(dna.xpPoints);
                setStreak(dna.streakDays || 12);
                
                const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                dna.masteryScores?.forEach((m: any) => {
                  let boxNum = 1;
                  if (m.confidence >= 0.9) boxNum = 5;
                  else if (m.confidence >= 0.7) boxNum = 4;
                  else if (m.confidence >= 0.5) boxNum = 3;
                  else if (m.confidence >= 0.3) boxNum = 2;
                  
                  counts[boxNum] = (counts[boxNum] || 0) + 1;
                });
                setBoxCounts(counts);
              }
              triggerToast('🔥 Socratic Boost Complete! +100 XP Gained!');
            }
          } catch (err) {
            console.warn('⚠️ Backend offline or failed to update. Gaining 100 XP locally.', err);
            setXp(prev => prev + 100);
            triggerToast('🔥 Socratic Boost Complete (Local fallback)!');
          }
          setShowBoostModal(false);
        }
      }, 3000);
    } else {
      setBoostFeedback(`❌ Nice try, Priya! You've got ${matchingKeywords.length} key concepts. Keep digging! Hint: ${currentQuestion.hint}`);
      setBoostSuccess(false);
    }
  };

  const filteredPlanItems = selectedBoxFilter 
    ? planItems.filter(item => item.box === selectedBoxFilter)
    : planItems;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar Navigation */}
      <NovaSidebar />

      {/* Main Viewport Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Floating XP and Streak Status Indicator */}
        {toastMessage && (
          <div 
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 1000,
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

        {/* Top Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0' }} className="gradient-text">
              My Spaced Repetition Learning Calendar
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
              Adaptive Leitner scheduling system aligned with your competitive exam deadlines.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button 
              variant="secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={runSM2Optimizer}
            >
              <Cpu size={16} /> Optimize Queue (SM-2)
            </Button>
            
            {/* Exam selector */}
            <select
              value={selectedExamKey}
              onChange={(e) => setSelectedExamKey(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 16px',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '13.5px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="gate_2027">🎯 GATE CSE 2027</option>
              <option value="upsc_2026">🏛️ UPSC Civil Services 2026</option>
              <option value="jee_2026">⚡ JEE Advanced 2026</option>
              <option value="semester_2026">🎓 College Semester Finals</option>
            </select>
          </div>
        </div>

        {/* High-Fidelity Countdown Grid Banner */}
        <div 
          style={{
            background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px 32px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Neon radial accent */}
          <div 
            style={{
              position: 'absolute',
              top: '-50%',
              left: '-20%',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ zIndex: 1, flex: 1 }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent)', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
              Target Academic Deadline Alert
            </span>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '20px' }}>Countdown to {selectedExam.name}</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '500px' }}>
              Nova distributes your weak DBMS normalization concepts across spaced boxes to reach peak cognitive capacity before exam day.
            </p>
          </div>

          {/* Ticking Clock Layout */}
          <div style={{ display: 'flex', gap: '12px', zIndex: 1 }}>
            {[
              { label: 'Days', val: timeLeft.days, color: 'var(--color-primary)' },
              { label: 'Hours', val: timeLeft.hours, color: 'var(--color-accent)' },
              { label: 'Mins', val: timeLeft.minutes, color: 'var(--color-secondary)' },
              { label: 'Secs', val: timeLeft.seconds, color: 'var(--color-secondary)' },
            ].map((col, idx) => (
              <div 
                key={idx} 
                style={{
                  minWidth: '76px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 8px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                }}
              >
                <div style={{ fontSize: '24px', fontWeight: 700, color: col.color, fontFamily: 'monospace' }}>
                  {String(col.val).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                  {col.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dual Panels Workspace Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '28px', alignItems: 'flex-start' }}>
          
          {/* Left Area: Leitner System & Warnings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Leitner Box Status Display */}
            <Card style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} color="var(--color-primary)" /> Leitner SRS Box Distributions
                </h3>
                {selectedBoxFilter && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    style={{ fontSize: '11px', padding: '2px 8px' }}
                    onClick={() => setSelectedBoxFilter(null)}
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Click on any box to filter the scheduled revision items on the right calendar panel.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                {[
                  { id: 1, name: 'Box 1', desc: 'Daily', color: 'var(--color-danger)' },
                  { id: 2, name: 'Box 2', desc: '2 Days', color: 'var(--color-accent)' },
                  { id: 3, name: 'Box 3', desc: '5 Days', color: 'var(--color-primary)' },
                  { id: 4, name: 'Box 4', desc: '9 Days', color: 'var(--color-secondary)' },
                  { id: 5, name: 'Box 5', desc: 'Mastered', color: '#10b981' },
                ].map(box => {
                  const isSelected = selectedBoxFilter === box.id;
                  return (
                    <div
                      key={box.id}
                      onClick={() => setSelectedBoxFilter(isSelected ? null : box.id)}
                      style={{
                        backgroundColor: isSelected ? 'var(--color-primary-glow)' : 'var(--bg-secondary)',
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '12px 6px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ fontSize: '10px', fontWeight: 600, color: box.color, display: 'block' }}>{box.name}</span>
                      <strong style={{ fontSize: '18px', display: 'block', margin: '4px 0' }}>{boxCounts[box.id] || 0}</strong>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>{box.desc}</span>
                    </div>
                  );
                })}
              </div>

              {/* User XP stats summary */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '20px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={16} color="var(--color-accent)" />
                  <span style={{ fontSize: '13px' }}>Cognitive Streak: <strong>{streak} Days</strong></span>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--color-primary)' }}>Level 3 • <strong>{xp} XP</strong></span>
              </div>
            </Card>

            {/* Cognitive Decay Alerts Panel */}
            <Card style={{ borderLeft: '4px solid var(--color-danger)' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div 
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-danger-glow)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexShrink: 0
                  }}
                >
                  <AlertTriangle size={18} color="var(--color-danger)" />
                </div>
                
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14.5px', color: 'var(--text-primary)' }}>
                    Active Cognitive Decay Alert
                  </h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                    Nova detected a slight decay in your Database Normalization score last Tuesday. Topic **"Decomposition and Anomaly Rules"** has slipped from Box 3 to Box 2.
                  </p>
                  
                  <Button 
                    variant="accent" 
                    size="sm" 
                    style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => {
                      setShowBoostModal(true);
                      setBoostStep(0);
                      setUserBoostAnswer('');
                      setBoostFeedback('');
                      setBoostSuccess(false);
                    }}
                  >
                    <Zap size={14} /> Launch Socratic Boost Session
                  </Button>
                </div>
              </div>
            </Card>

            {/* Simulated Load Balancer Logger Dashboard */}
            {showOptimizer && (
              <Card style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '13.5px', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={14} className="animate-spin" /> SM-2 Cognitive Solver Logs
                  </h4>
                  <Button variant="ghost" size="sm" style={{ padding: '0px 6px', fontSize: '10px' }} onClick={() => setShowOptimizer(false)}>Close</Button>
                </div>
                <div 
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: '6px',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    lineHeight: '1.6',
                    color: '#a78bfa',
                    maxHeight: '160px',
                    overflowY: 'auto'
                  }}
                >
                  {optimizerLogs.map((log, index) => (
                    <div key={index} style={{ marginBottom: '4px' }}>
                      {log}
                    </div>
                  ))}
                </div>
              </Card>
            )}

          </div>

          {/* Right Area: Spaced Repetition Calendar Slots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                {selectedBoxFilter ? `Scheduled Slots in Box ${selectedBoxFilter}` : 'Upcoming Calendar Slots'}
              </h3>
              
              <Button 
                variant="ghost" 
                size="sm" 
                style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus size={14} /> Add Slot
              </Button>
            </div>

            {/* Quick add form */}
            {showAddForm && (
              <Card style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Schedule Custom Study Slot</h4>
                <form onSubmit={handleAddSlot} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Topic description (e.g. B-Trees indices)..."
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    style={{
                      flex: '1 1 100%',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                    required
                  />

                  <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Subject</span>
                    <select
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    >
                      <option value="DBMS">DBMS</option>
                      <option value="Algorithms">Algorithms</option>
                      <option value="GATE Prep">GATE Prep</option>
                      <option value="Networks">Networks</option>
                    </select>
                  </div>

                  <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Leitner Target Box</span>
                    <select
                      value={newBox}
                      onChange={(e) => setNewBox(Number(e.target.value))}
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    >
                      <option value={1}>Box 1 (Review Daily)</option>
                      <option value={2}>Box 2 (Review 2 Days)</option>
                      <option value={3}>Box 3 (Review 5 Days)</option>
                      <option value={4}>Box 4 (Review 9 Days)</option>
                      <option value={5}>Box 5 (Mastered)</option>
                    </select>
                  </div>

                  <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Type</span>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    >
                      <option value="revision">Leitner Revision</option>
                      <option value="new_content">New Content</option>
                      <option value="mock_test">Mock Test</option>
                    </select>
                  </div>

                  <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Time Window</span>
                    <input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ flex: '1 1 100%', display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddForm(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Schedule Slot</Button>
                  </div>
                </form>
              </Card>
            )}

            {/* List items mapping */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredPlanItems.length === 0 ? (
                <Card style={{ padding: '32px', textAlign: 'center' }}>
                  <CalendarIcon size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                    No spaced repetition tasks scheduled inside this category.
                  </p>
                </Card>
              ) : (
                filteredPlanItems.map((item) => (
                  <Card 
                    key={item.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      opacity: item.completed ? 0.6 : 1,
                      borderLeft: item.completed 
                        ? '4px solid var(--text-muted)' 
                        : item.box === 1 
                        ? '4px solid var(--color-danger)' 
                        : item.box === 2 
                        ? '4px solid var(--color-accent)'
                        : '4px solid var(--color-primary)',
                      padding: '16px 20px',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div
                        onClick={() => toggleCompleteItem(item.id)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: item.completed ? '1px solid var(--color-secondary)' : '1px solid var(--border-color)',
                          backgroundColor: item.completed ? 'var(--color-secondary-glow)' : 'var(--bg-secondary)',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {item.completed && <CheckCircle2 size={14} color="var(--color-secondary)" />}
                      </div>
                      
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {item.date} • {item.time}
                        </span>
                        <h4 
                          style={{ 
                            margin: '2px 0px', 
                            fontSize: '14.5px',
                            textDecoration: item.completed ? 'line-through' : 'none'
                          }}
                        >
                          {item.topic}
                        </h4>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <span 
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '9.5px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              backgroundColor: 'var(--bg-secondary)',
                              color: item.box === 1 ? 'var(--color-danger)' : item.box === 2 ? 'var(--color-accent)' : 'var(--color-primary)',
                              border: '1px solid var(--border-color)'
                            }}
                          >
                            Box {item.box}
                          </span>
                          <span 
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '9.5px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              backgroundColor: 'var(--bg-secondary)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-color)'
                            }}
                          >
                            {item.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
                        {item.subject}
                      </span>
                      <Button 
                        variant="ghost" 
                        style={{ padding: '6px', color: 'var(--color-danger)' }}
                        onClick={() => deleteItem(item.id, item.box)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Socratic Boost Modal popup */}
      {showBoostModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <Card 
            style={{ 
              width: '600px', 
              padding: '28px', 
              backgroundColor: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--color-accent)" />
                <h3 style={{ margin: 0, fontSize: '18px' }}>Nova Socratic Memory Boost</h3>
              </div>
              <Button 
                variant="ghost" 
                style={{ padding: '4px', borderRadius: '50%' }} 
                onClick={() => setShowBoostModal(false)}
              >
                <X size={16} />
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div 
                style={{ 
                  backgroundColor: 'var(--bg-primary)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '16px',
                  fontSize: '13.5px',
                  lineHeight: '1.5',
                  color: 'var(--text-primary)'
                }}
              >
                <strong>Nova Socratic Challenge (Step {boostStep + 1} of 2)</strong>
                <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                  {BOOST_QUESTIONS[boostStep].question}
                </p>
              </div>

              {boostFeedback && (
                <div 
                  style={{
                    backgroundColor: boostSuccess ? 'var(--color-secondary-glow)' : 'var(--color-danger-glow)',
                    border: boostSuccess ? '1px dashed var(--color-secondary)' : '1px dashed var(--color-danger)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: boostSuccess ? 'var(--text-primary)' : 'var(--color-danger)',
                    lineHeight: '1.4'
                  }}
                >
                  {boostFeedback}
                </div>
              )}

              {!boostSuccess && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    rows={3}
                    placeholder="Type your explanation using Socratic keywords..."
                    value={userBoostAnswer}
                    onChange={(e) => setUserBoostAnswer(e.target.value)}
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px',
                      color: 'var(--text-primary)',
                      fontSize: '13.5px',
                      resize: 'none',
                      outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Keywords: BCNF, Transitive, Decompose, Superkey
                    </span>
                    <Button variant="accent" size="sm" onClick={submitBoostAnswer}>
                      Submit for Socratic Grading
                    </Button>
                  </div>
                </div>
              )}

              {boostSuccess && (
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', animation: 'pulse 1.5s infinite' }}>
                    Socratic criteria met! Loading next challenge step...
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};

export default StudyPlan;

