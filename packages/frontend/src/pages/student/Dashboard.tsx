import React from 'react';
import { NovaSidebar } from '../../components/nova/NovaSidebar.tsx';
import { NovaBubble } from '../../components/nova/NovaBubble.tsx';
import { AccessibilityPanel } from '../../components/accessibility/AccessibilityPanel.tsx';
import { XPBar } from '../../components/gamification/XPBar.tsx';
import { StreakCounter } from '../../components/gamification/StreakCounter.tsx';
import { DailyQuest } from '../../components/gamification/DailyQuest.tsx';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Brain, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Dynamic persistent sidebar navigation */}
      <NovaSidebar />

      {/* Primary viewport content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* Welcome header with dynamic gradient subtitle */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700 }} className="gradient-text">
              Welcome back, Priya!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Your personal AI guide, Nova, is synchronized and prepared.
            </p>
          </div>
          
          <Button
            variant="ghost"
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => window.location.href = '/quiz'}
          >
            Launch Quiz Engine <ArrowRight size={14} />
          </Button>
        </div>

        {/* Quick Statistics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <XPBar currentXP={450} level={3} />
          <StreakCounter streak={12} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }}>
          
          {/* Active Study Path module */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '18px', margin: '0px' }}>Ongoing Academic Journey (My Courses)</h3>
            
            {/* Course 1: DBMS */}
            <Card style={{ display: 'flex', gap: '20px', alignItems: 'center', borderLeft: '4px solid var(--color-primary)' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-primary-glow)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <BookOpen size={24} color="var(--color-primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)' }}>
                    Active • CSE SEM-5
                  </span>
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    RAG Synced
                  </span>
                </div>
                <h4 style={{ margin: '4px 0px', fontSize: '16px' }}>Professor Sharma's DBMS</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Active Topics: Normalization, transitive functional dependencies, 3NF/BCNF.
                </p>
              </div>
              <Button variant="secondary" onClick={() => navigate('/course/course-dbms')}>
                Study & Notes
              </Button>
            </Card>

            {/* Course 2: Algorithms */}
            <Card style={{ display: 'flex', gap: '20px', alignItems: 'center', borderLeft: '4px solid var(--color-accent)' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-accent-glow)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Brain size={24} color="var(--color-accent)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-accent)' }}>
                    Mastered • CSE SEM-4
                  </span>
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--color-success-glow)', color: 'var(--color-success)', fontWeight: 600 }}>
                    Ability: +1.45 θ
                  </span>
                </div>
                <h4 style={{ margin: '4px 0px', fontSize: '16px' }}>Design & Analysis of Algorithms (DAA)</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Mastered: Dynamic programming, greedy algorithms, complexity classes.
                </p>
              </div>
              <Button variant="ghost" onClick={() => navigate('/course/course-daa')}>
                Study & Notes
              </Button>
            </Card>

            {/* Course 3: Networks */}
            <Card style={{ display: 'flex', gap: '20px', alignItems: 'center', opacity: 0.85, borderLeft: '4px solid var(--text-muted)' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Sparkles size={24} color="var(--text-muted)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Enrolled • CSE SEM-5
                  </span>
                </div>
                <h4 style={{ margin: '4px 0px', fontSize: '16px' }}>Computer Networks & Security (CNS)</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Syllabus loaded. Leitner spaced repetition queue setup.
                </p>
              </div>
              <Button variant="ghost" onClick={() => navigate('/course/course-cns')}>
                Study & Notes
              </Button>
            </Card>

            {/* Socratic डाउट handler */}
            <Card style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-primary-glow)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Sparkles size={24} color="var(--color-primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)' }}>
                  Unified doubt solver
                </span>
                <h4 style={{ margin: '4px 0px', fontSize: '16px' }}>Nova Socratic Memory</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Ask Nova doubts across any active course syllabus directly.
                </p>
              </div>
              <Button variant="ghost" onClick={() => {
                // Focus or open Nova Chat bubble
                const bubble = document.getElementById('nova-floating-bubble');
                if (bubble) bubble.click();
              }}>Open Nova</Button>
            </Card>
          </div>

          {/* Daily Quests drawer panel */}
          <DailyQuest />
        </div>
      </div>

      {/* Floating interactive tools widgets */}
      <NovaBubble />
      <AccessibilityPanel />
    </div>
  );
};
export default Dashboard;
