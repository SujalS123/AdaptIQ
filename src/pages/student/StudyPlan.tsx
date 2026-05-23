import React, { useState, useEffect } from 'react';

import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
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

  // Mark task completed and reward user with XP
  const toggleCompleteItem = (id: string) => {
    setPlanItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.completed;
        if (nextState) {
          setXp(prevXp => prevXp + 50);
          triggerToast("🎉 Target Slot Cleared! +50 XP Gained. Keep it up!");
        }
        return { ...item, completed: nextState };
      }
      return item;
    }));
  };

  // Delete a study slot
  const deleteItem = (id: string, boxLevel: number) => {
    setPlanItems(prev => prev.filter(item => item.id !== id));
    setBoxCounts(prev => ({
      ...prev,
      [boxLevel]: Math.max(0, prev[boxLevel] - 1),
    }));
    triggerToast("🗑️ Study Slot removed from calendar.");
  };

  // Add custom plan slot
  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      date: 'Scheduled',
      subject: newSubject,
      topic: newTopic,
      type: newType,
      time: newTime,
      box: newBox,
      completed: false,
    };

    setPlanItems(prev => [...prev, newItem]);
    setBoxCounts(prev => ({
      ...prev,
      [newBox]: (prev[newBox] || 0) + 1,
    }));

    setNewTopic('');
    setShowAddForm(false);
    triggerToast("📅 Added new spaced repetition slot to list.");
  };

  // Trigger real-time SM-2 Load Balancer optimizer simulation
  const runSM2Optimizer = () => {
    setShowOptimizer(true);
    setOptimizerLogs([]);

    const logSteps = [
      "[ANALYZING] Querying cognitive retention matrices & Leitner Box decay thresholds...",
      "[FETCHING] Syncing student quiz history for DBMS (3NF anomaly score: 62% decay detected)...",
      "[SM-2 ENGINES] Computing difficulty coefficients (EF factor) for active syllabus components...",
      "[CALCULATING] Concept 'Functional Dependencies' EF adjusted from 2.50 to 2.18 (Critical decay).",
      "[REBALANCING] Moving topic 'BCNF vs 3NF Decomposition' to Box 1 for immediate revision.",
      "[SCHEDULING] Shifted Relational Algebra mock session to optimal cognitive peak window.",
      "[COMPLETED] Spaced repetition scheduler finished calibration. Calendar rebalanced successfully!"
    ];

    logSteps.forEach((step, index) => {
      setTimeout(() => {
        setOptimizerLogs(prev => [...prev, step]);
        if (index === logSteps.length - 1) {
          // Sync state reorder triggers
          setPlanItems(prev => {
            const copy = [...prev];
            // Simulate reorder
            const dbmsItems = copy.filter(x => x.subject === 'DBMS');
            const otherItems = copy.filter(x => x.subject !== 'DBMS');
            return [...dbmsItems, ...otherItems];
          });
          setBoxCounts(prev => ({
            ...prev,
            1: prev[1] + 1,
            2: Math.max(0, prev[2] - 1),
          }));
          triggerToast("🚀 Calendar optimized via SuperMemo SM-2. DBMS pushed for immediate review!");
        }
      }, (index + 1) * 450);
    });
  };

  // Socratic Nova Boost flashcard challenge validation
  const submitBoostAnswer = () => {
    if (!userBoostAnswer.trim()) return;

    const currentQuestion = BOOST_QUESTIONS[boostStep];
    const answerLower = userBoostAnswer.toLowerCase();
    const isCorrect = currentQuestion.answerKeywords.some(keyword => answerLower.includes(keyword));

    if (isCorrect) {
      setBoostFeedback(currentQuestion.successReply);
      setBoostSuccess(true);
      setXp(prev => prev + 100);
      setStreak(prev => prev + 1);

      setTimeout(() => {
        if (boostStep < BOOST_QUESTIONS.length - 1) {
          setBoostStep(prev => prev + 1);
          setUserBoostAnswer('');
          setBoostFeedback('');
          setBoostSuccess(false);
        } else {
          // Completed all steps!
          setShowBoostModal(false);
          setBoostStep(0);
          setUserBoostAnswer('');
          setBoostFeedback('');
          setBoostSuccess(false);
          
          // Rebalance boxes counts in calendar
          setBoxCounts(prev => ({
            ...prev,
            2: Math.max(0, prev[2] - 1),
            3: prev[3] + 1,
          }));

          triggerToast("🏆 Socratic Boost Completed! Concept promoted to Box 3 & +100 XP awarded!");
        }
      }, 3500);
    } else {
      setBoostFeedback(`Hmm, not quite right Priya. Socratic guidance: ${currentQuestion.hint} Give it another shot!`);
    }
  };

  const filteredPlanItems = selectedBoxFilter 
    ? planItems.filter(item => item.box === selectedBoxFilter)
    : planItems;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
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
                backgroundColor: 'var(--bg-secondary)', color: 'white',
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
                  backgroundColor: 'var(--bg-secondary)', color: 'white',
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
              <Card style={{ backgroundColor: 'var(--bg-secondary)', color: 'white', border: '1px solid var(--border-color)', padding: '20px' }}>
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
              <Card style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', color: 'white' }}>
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
              backgroundColor: 'var(--bg-secondary)', color: 'white', 
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

    </>
  );
};

export default StudyPlan;

