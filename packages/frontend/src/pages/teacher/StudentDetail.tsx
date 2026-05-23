import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NovaSidebar from '../../components/nova/NovaSidebar';
import { NovaBubble } from '../../components/nova/NovaBubble';
import { AccessibilityPanel } from '../../components/accessibility/AccessibilityPanel';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { ArrowLeft, User, Award, ShieldCheck, Clock, MessageSquare, BookOpen, AlertTriangle } from 'lucide-react';

export default function StudentDetail() {
  const { studentId } = useParams();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teacher/student/${studentId || 'student-001'}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setIsLoading(false);
      })
      .catch(err => {
        console.warn("⚠️ Backend student details endpoint offline. Seeding high-fidelity offline fallback student data:", err);
        setData({
          studentId: studentId || 'student-001',
          name: studentId === 'student-014' ? 'Sneha Patel' : studentId === 'student-031' ? 'Arjun Mehta' : 'Rahul Verma',
          email: studentId === 'student-014' ? 'sneha.patel@university.edu' : studentId === 'student-031' ? 'arjun.mehta@university.edu' : 'rahul.verma@university.edu',
          theta: studentId === 'student-014' ? -0.12 : studentId === 'student-031' ? -0.89 : -0.65,
          quizzesTaken: 8,
          averageScore: studentId === 'student-014' ? 56 : studentId === 'student-031' ? 24 : 42,
          weakConcepts: ['3NF Decomposition', 'BCNF Violations', 'Functional Dependencies', 'SQL Joins'],
          recentActivity: [
            { date: '2026-05-20', type: 'quiz', score: studentId === 'student-014' ? 56 : studentId === 'student-031' ? 24 : 35, topic: 'Normalization' },
            { date: '2026-05-18', type: 'study', duration: 22, topic: 'ER Diagrams' },
            { date: '2026-05-15', type: 'study', duration: 45, topic: 'SQL Basics' }
          ]
        });
        setIsLoading(false);
      });
  }, [studentId]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <NovaSidebar />

      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative' }}>
        
        {/* Background Gradients */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '400px', background: 'radial-gradient(circle at 80% -100px, rgba(108, 92, 231, 0.1), transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          
          {/* Back button */}
          <Link to="/teacher/alerts" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14.5px', marginBottom: '24px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <ArrowLeft size={16} /> Back to At-Risk Alerts
          </Link>

          {isLoading || !data ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <span style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Loading student dossier...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Header profile card */}
              <Card style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <User size={40} />
                  </div>
                  <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0' }}>{data.name}</h1>
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '14.5px' }}>
                      <span>Email: {data.email}</span>
                      <span>•</span>
                      <span>Mastery Index (θ): <span style={{ color: data.theta >= 0 ? 'var(--emerald)' : 'var(--color-danger)', fontWeight: 600 }}>{data.theta}</span></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <Card style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', textAlign: 'center', minWidth: '100px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Active Streak</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--orchid)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Award size={18} /> 12 days</div>
                  </Card>
                  <Card style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', textAlign: 'center', minWidth: '100px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Avg Quiz Score</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--emerald)' }}>{data.averageScore}%</div>
                  </Card>
                </div>
              </Card>

              {/* Grid Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                
                {/* Left Column: Knowledge Graph + Study Telemetry */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Knowledge Graph Visualization */}
                  <Card style={{ padding: '28px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 20px 0' }}>Student Knowledge Graph</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                      Shows prerequisite relationships and the student's current mastery levels per concept node.
                    </p>
                    
                    {/* Visualizer Placeholder */}
                    <div style={{ width: '100%', height: '240px', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {/* Prerequisites mock lines */}
                      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                        <line x1="80" y1="120" x2="220" y2="60" stroke="var(--border-color)" strokeWidth="2" />
                        <line x1="80" y1="120" x2="220" y2="180" stroke="var(--border-color)" strokeWidth="2" />
                        <line x1="220" y1="60" x2="380" y2="120" stroke="var(--border-color)" strokeWidth="2" />
                        <line x1="220" y1="180" x2="380" y2="120" stroke="var(--border-color)" strokeWidth="2" />
                        <line x1="380" y1="120" x2="480" y2="120" stroke="var(--border-color)" strokeWidth="2" />
                      </svg>

                      {/* Mock Nodes */}
                      <div style={{ position: 'absolute', left: '80px', top: '120px', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#00b894', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>1.0</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>ER Model</div>
                      </div>

                      <div style={{ position: 'absolute', left: '220px', top: '60px', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fed330', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontWeight: 700 }}>0.6</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>Normalization</div>
                      </div>

                      <div style={{ position: 'absolute', left: '220px', top: '180px', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#00b894', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>0.8</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>SQL Basics</div>
                      </div>

                      <div style={{ position: 'absolute', left: '380px', top: '120px', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ff7675', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>0.3</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>SQL Joins</div>
                      </div>

                      <div style={{ position: 'absolute', left: '480px', top: '120px', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-card)', border: '2px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 700 }}>-</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>Indexing</div>
                      </div>
                    </div>
                  </Card>

                  {/* Study Telemetry Session History */}
                  <Card style={{ padding: '28px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={20} color="var(--electric-indigo)" /> Daily Engagement (Last 14 Days)
                    </h2>
                    
                    {/* CSS Bar Chart */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '160px', padding: '0 10px', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      {[40, 20, 0, 15, 45, 60, 50, 10, 30, 22, 18, 42, 35, 22].map((dur, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                          <div 
                            style={{ 
                              width: '12px', 
                              height: `${(dur / 60) * 100}px`, 
                              background: 'linear-gradient(to top, var(--electric-indigo), var(--orchid))', 
                              borderRadius: '4px 4px 0 0',
                              transition: 'height 0.3s ease'
                            }} 
                            title={`${dur} minutes`}
                          />
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)', transform: 'rotate(-45deg)' }}>{14 - idx}d ago</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                </div>

                {/* Right Column: Chat logs + Quiz History + Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Weak concepts */}
                  <Card style={{ padding: '28px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={20} color="#ff7675" /> Priority Knowledge Gaps
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {data.weakConcepts?.map((c: string, i: number) => (
                        <Badge key={i} variant="danger" size="md">{c}</Badge>
                      ))}
                    </div>
                  </Card>

                  {/* Nova/Aria Chat log summary */}
                  <Card style={{ padding: '28px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageSquare size={20} color="var(--electric-indigo)" /> Nova AI Tutor Activity
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', margin: '0 0 20px 0' }}>
                      Last 3 conversational interactions with Nova:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <Card style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                          <span>Session: SQL Joins Socratic Dialogue</span>
                          <span>May 20</span>
                        </div>
                        <div style={{ fontSize: '14.5px', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                          "Can you explain why a Full Outer Join returns null values?"
                        </div>
                      </Card>
                      <Card style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                          <span>Session: 3NF Normalization Clarification</span>
                          <span>May 18</span>
                        </div>
                        <div style={{ fontSize: '14.5px', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                          "I am confused about transitive functional dependencies."
                        </div>
                      </Card>
                    </div>
                  </Card>

                  {/* Quiz Performance Timeline */}
                  <Card style={{ padding: '28px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={20} color="var(--emerald)" /> Performance Timeline
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {data.recentActivity?.map((act: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px' }}>
                          <div>
                            <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{act.type}</span>: {act.topic}
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{act.date}</div>
                          </div>
                          {act.score && <span style={{ fontWeight: 700, color: act.score >= 50 ? 'var(--emerald)' : '#ff7675' }}>{act.score}%</span>}
                        </div>
                      ))}
                    </div>
                  </Card>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      <NovaBubble />
      <AccessibilityPanel />
    </div>
  );
}
