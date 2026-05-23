import React, { useState } from 'react';
import NovaSidebar from '../../components/nova/NovaSidebar';
import { NovaBubble } from '../../components/nova/NovaBubble';
import { AccessibilityPanel } from '../../components/accessibility/AccessibilityPanel';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FileQuestion, BarChart2, Check, Sparkles } from 'lucide-react';

export default function QuizGenerator() {
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('dbms');
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficultyMin, setDifficultyMin] = useState(-1.5);
  const [difficultyMax, setDifficultyMax] = useState(1.5);
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedQuiz(null);

    try {
      const res = await fetch('/api/teacher/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          courseId,
          numQuestions,
          difficultyRange: [difficultyMin, difficultyMax],
          conceptTags: ['normalization', 'sql-joins', 'indexing']
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate quiz');

      setGeneratedQuiz(data);
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
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '400px', background: 'radial-gradient(circle at 20% -100px, rgba(108, 92, 231, 0.1), transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileQuestion size={32} color="var(--electric-indigo)" /> IRT Quiz Generator
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Synthesize psychometric quizzes calibrated with dynamic Item Response Theory constraints.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
            
            {/* Form Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Card style={{ padding: '28px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="var(--electric-indigo)" /> IRT Parameters Calibration
                </h2>

                <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Quiz Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                      placeholder="e.g. Normalization Baseline Diagnostic"
                      style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Course Namespace</label>
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
                      <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Question Count</label>
                      <select 
                        value={numQuestions}
                        onChange={e => setNumQuestions(Number(e.target.value))}
                        style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
                      >
                        <option value={5}>5 Questions</option>
                        <option value={10}>10 Questions</option>
                        <option value={15}>15 Questions</option>
                        <option value={20}>20 Questions</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 500 }}>
                      Item Difficulty Bounds (θ): [{difficultyMin.toFixed(1)} to {difficultyMax.toFixed(1)}]
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '32px' }}>Min:</span>
                        <input
                          type="range"
                          min="-3.0"
                          max="0.0"
                          step="0.1"
                          value={difficultyMin}
                          onChange={e => setDifficultyMin(Number(e.target.value))}
                          style={{ flex: 1, cursor: 'pointer', accentColor: 'var(--electric-indigo)' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '32px' }}>Max:</span>
                        <input
                          type="range"
                          min="0.1"
                          max="3.0"
                          step="0.1"
                          value={difficultyMax}
                          onChange={e => setDifficultyMax(Number(e.target.value))}
                          style={{ flex: 1, cursor: 'pointer', accentColor: 'var(--electric-indigo)' }}
                        />
                      </div>
                    </div>
                  </div>

                  <Button variant="primary" size="lg" disabled={isLoading} style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                    {isLoading ? 'Calibrating Models...' : 'Generate Calibrated Quiz'}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Preview Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Card style={{ padding: '28px', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: generatedQuiz ? 'flex-start' : 'center', alignItems: generatedQuiz ? 'stretch' : 'center', border: generatedQuiz ? '1px solid var(--border-color)' : '2px dashed var(--border-color)', background: generatedQuiz ? 'var(--bg-secondary)' : 'rgba(255,255,255,0.002)' }}>
                {!generatedQuiz ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <BarChart2 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>No quiz synthesized yet</h3>
                    <p style={{ margin: 0, fontSize: '13.5px', maxWidth: '280px', lineHeight: 1.5 }}>
                      Calibrate the theta bounds on the left and synthesize a test to preview the IRT metrics card.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <Badge variant="success">SYNTHESIS SUCCESS</Badge>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Quiz ID: {generatedQuiz.quizId.slice(0, 15)}...</span>
                    </div>

                    <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px 0' }}>{generatedQuiz.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px 0' }}>
                      Item characteristics curves established for {generatedQuiz.questions?.length} items.
                    </p>

                    {/* Math parameters card */}
                    <Card style={{ padding: '20px', background: 'var(--bg-tertiary)', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Psychometric Properties</h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Mean Item Difficulty (b)</div>
                          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--electric-indigo)' }}>{generatedQuiz.irtStats?.meanDifficulty.toFixed(3)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Avg Discrimination (a)</div>
                          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--orchid)' }}>1.38</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Guessing Parameter (c)</div>
                          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--emerald)' }}>{generatedQuiz.questions?.[0]?.guessingC}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Test Information (I(θ))</div>
                          <div style={{ fontSize: '20px', fontWeight: 700, color: '#fd9644' }}>{generatedQuiz.irtStats?.testInformation}</div>
                        </div>
                      </div>
                    </Card>

                    {/* Question items preview */}
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600 }}>Calibrated Question Pool Preview</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }}>
                      {generatedQuiz.questions?.map((q: any, idx: number) => (
                        <div key={idx} style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontWeight: 600 }}>Q{idx + 1}:</span> {q.text.length > 40 ? `${q.text.slice(0, 40)}...` : q.text}
                          </div>
                          <Badge variant={q.difficultyB > 1 ? 'danger' : q.difficultyB > -0.5 ? 'warning' : 'success'}>
                            b = {q.difficultyB.toFixed(2)}
                          </Badge>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
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
