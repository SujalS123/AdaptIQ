import React, { useState } from 'react';
import NovaSidebar from '../../components/nova/NovaSidebar';
import { NovaBubble } from '../../components/nova/NovaBubble';
import { AccessibilityPanel } from '../../components/accessibility/AccessibilityPanel';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { ClipboardList, Calendar, Sliders, Users, Eye, Sparkles, Check } from 'lucide-react';

export default function AssignmentBuilder() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('dbms');
  const [dueDate, setDueDate] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'adaptive'>('adaptive');
  const [targetType, setTargetType] = useState<'all' | 'custom'>('all');
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [existingAssignments, setExistingAssignments] = useState<any[]>([
    { id: 'asgn-1', title: 'Normal Forms Challenge', courseId: 'DBMS', dueDate: '2026-05-30', difficulty: 'adaptive', enrolledCount: 64 },
    { id: 'asgn-2', title: 'SQL Joins Practice Set', courseId: 'DBMS', dueDate: '2026-05-25', difficulty: 'medium', enrolledCount: 64 },
    { id: 'asgn-3', title: 'B+ Tree Indexing Theory', courseId: 'DBMS', dueDate: '2026-05-20', difficulty: 'hard', enrolledCount: 12 }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          courseId,
          dueDate,
          conceptTags: ['normalization', 'joins'],
          difficulty
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create assignment');

      setExistingAssignments(prev => [
        {
          id: data.id,
          title: data.title,
          courseId: data.courseId === 'dbms' ? 'DBMS' : 'DAA',
          dueDate: data.dueDate,
          difficulty,
          enrolledCount: 64
        },
        ...prev
      ]);

      setTitle('');
      setDescription('');
      setDueDate('');
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <NovaSidebar />

      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative' }}>
        
        {/* Background Gradients */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '400px', background: 'radial-gradient(circle at 50% -100px, rgba(108, 92, 231, 0.1), transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ClipboardList size={32} color="var(--electric-indigo)" /> Assignment Builder
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Deploy concept exercises and set personalized or fixed cognitive difficulties.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
            
            {/* Form Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Card style={{ padding: '28px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 24px 0' }}>Create New Assignment</h2>
                
                {success && (
                  <div style={{ padding: '12px 16px', background: 'rgba(0, 184, 148, 0.1)', borderLeft: '4px solid var(--emerald)', borderRadius: '4px', color: 'var(--emerald)', marginBottom: '24px', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={18} /> Assignment published and notifications pushed!
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Title */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Assignment Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                      placeholder="e.g. Normalization Mastery Challenge"
                      style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Instructions / Description</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      required
                      placeholder="Provide guiding instructions or textbook page resources..."
                      style={{ width: '100%', height: '100px', padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', fontSize: '15px', resize: 'none' }}
                    />
                  </div>

                  {/* Course Selector & Due Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Course</label>
                      <select 
                        value={courseId}
                        onChange={e => setCourseId(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
                      >
                        <option value="dbms">Professor Sharma's DBMS</option>
                        <option value="daa">Algorithms (CSE-402)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Due Date</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        required
                        style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
                      />
                    </div>
                  </div>

                  {/* Difficulty Calibration Mode */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 500 }}>Difficulty Calibration Mode</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      {(['easy', 'medium', 'hard', 'adaptive'] as const).map(d => (
                        <div
                          key={d}
                          onClick={() => setDifficulty(d)}
                          style={{
                            padding: '12px',
                            borderRadius: '10px',
                            background: difficulty === d ? 'rgba(108, 92, 231, 0.1)' : 'var(--bg-tertiary)',
                            border: difficulty === d ? '2px solid var(--electric-indigo)' : '1px solid var(--border-color)',
                            textAlign: 'center',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            fontWeight: 600,
                            fontSize: '13.5px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {d === 'adaptive' && <Sparkles size={16} color="var(--electric-indigo)" />}
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 500 }}>Target Students</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14.5px' }}>
                        <input 
                          type="radio" 
                          name="target" 
                          checked={targetType === 'all'} 
                          onChange={() => setTargetType('all')} 
                          style={{ accentColor: 'var(--electric-indigo)' }}
                        /> All Students ({courseId === 'dbms' ? 64 : 58})
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14.5px' }}>
                        <input 
                          type="radio" 
                          name="target" 
                          checked={targetType === 'custom'} 
                          onChange={() => setTargetType('custom')} 
                          style={{ accentColor: 'var(--electric-indigo)' }}
                        /> Custom Select / At-Risk Cohort
                      </label>
                    </div>
                  </div>

                  <Button variant="primary" size="lg" disabled={isLoading} style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                    {isLoading ? 'Creating...' : 'Deploy Assignment'}
                  </Button>

                </form>
              </Card>
            </div>

            {/* Preview & Existing Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Preview Panel */}
              <Card style={{ padding: '28px', border: '1px dashed var(--border-color)', background: 'rgba(255,255,255,0.005)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={18} /> Student Preview
                </h3>
                
                <Card style={{ padding: '20px', background: 'var(--bg-tertiary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <Badge variant={difficulty === 'adaptive' ? 'primary' : difficulty === 'hard' ? 'danger' : 'success'}>
                      {difficulty.toUpperCase()}
                    </Badge>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Due: {dueDate || 'YYYY-MM-DD'}</span>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>{title || 'Untitled Assignment'}</h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {description || 'Provide a title and description on the left to see this card update...'}
                  </p>
                  
                  {difficulty === 'adaptive' && (
                    <div style={{ fontSize: '12.5px', color: 'var(--electric-indigo)', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(108, 92, 231, 0.1)', padding: '8px 12px', borderRadius: '6px' }}>
                      <Sparkles size={14} /> AI Engine adjusts cognitive workload to your zone of proximal development.
                    </div>
                  )}
                </Card>
              </Card>

              {/* Existing Assignments list */}
              <Card style={{ padding: '28px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 20px 0' }}>Deployed Assignments</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {existingAssignments.map(asgn => (
                    <div key={asgn.id} style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{asgn.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Course: {asgn.courseId} • Target: {asgn.enrolledCount} Students • Due: {asgn.dueDate}
                        </div>
                      </div>
                      <Badge variant={asgn.difficulty === 'adaptive' ? 'primary' : asgn.difficulty === 'hard' ? 'danger' : 'success'}>
                        {asgn.difficulty.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

            </div>

          </div>

        </div>

      </div>

      <NovaBubble />
      <AccessibilityPanel />
    </div>
  );
}
