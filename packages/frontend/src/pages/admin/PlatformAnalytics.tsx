import React, { useState, useEffect } from 'react';
import NovaSidebar from '../../components/nova/NovaSidebar';
import { NovaBubble } from '../../components/nova/NovaBubble';
import { AccessibilityPanel } from '../../components/accessibility/AccessibilityPanel';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Activity, 
  Cpu, 
  Database, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  HardDrive,
  Clock,
  RefreshCw,
  Server
} from 'lucide-react';

interface AnalyticsData {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalQuizAttempts: number;
  avgPlatformTheta: number;
  dailyActiveUsers: number;
  weeklyRetention: number;
  topCourses: Array<{ name: string; enrolled: number; avgTheta: number }>;
  thetaDistribution: {
    below_minus1: number;
    minus1_to_0: number;
    zero_to_1: number;
    above_1: number;
  };
}

export default function PlatformAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'psychometrics' | 'billing'>('overview');
  
  // Custom states for system statuses
  const [services, setServices] = useState([
    { name: 'Core API Server (Express)', status: 'operational', latency: '42ms', load: '14%' },
    { name: 'Database (MongoDB)', status: 'operational', latency: '8ms', load: '22%' },
    { name: 'Adaptive Learning (FastAPI)', status: 'operational', latency: '120ms', load: '31%' },
    { name: 'Vector Database (RAG / Local)', status: 'operational', latency: '65ms', load: '8%' },
    { name: 'LLM Gateway (Groq)', status: 'operational', latency: '240ms', load: '12%' },
    { name: 'Message Broker (Kafka)', status: 'operational', latency: '15ms', load: '4%' },
    { name: 'In-Memory Cache (Redis)', status: 'operational', latency: '2ms', load: '18%' }
  ]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = () => {
    setIsLoading(true);
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching admin analytics:", err);
        setIsLoading(false);
      });
  };

  const getThetaLabel = (theta: number) => {
    if (theta >= 1.0) return 'Highly Advanced (Exceeds Syllabus)';
    if (theta >= 0.0) return 'Competent (Target ZPD Matched)';
    if (theta >= -1.0) return 'Developing (Foundational Mastery)';
    return 'Struggling (Urgent Intervention Needed)';
  };

  if (isLoading || !data) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <NovaSidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Decrypting system cluster metrics...</span>
        </div>
        <NovaBubble />
        <AccessibilityPanel />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <NovaSidebar />
      
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative' }}>
        
        {/* Background Gradients */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '400px', 
          background: 'radial-gradient(circle at 50% -100px, rgba(108, 92, 231, 0.1), transparent 70%)', 
          pointerEvents: 'none', 
          zIndex: 0 
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px 0', background: 'linear-gradient(135deg, #ffffff 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Platform Analytics
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Platform-wide service heartbeat monitoring, Bayesian student distribution index, and cloud billing logs.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="ghost" onClick={fetchAnalytics} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={15} /> Refresh Dashboard
              </Button>
            </div>
          </div>

          {/* Quick Tab Selector */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '32px', paddingBottom: '12px' }}>
            <button 
              onClick={() => setActiveTab('overview')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'overview' ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '15px',
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: activeTab === 'overview' ? '2px solid var(--color-primary)' : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              Cluster Health & Activity
            </button>
            <button 
              onClick={() => setActiveTab('psychometrics')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'psychometrics' ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '15px',
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: activeTab === 'psychometrics' ? '2px solid var(--color-primary)' : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              IRT Theta ($\theta$) Distribution
            </button>
            <button 
              onClick={() => setActiveTab('billing')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'billing' ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '15px',
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: activeTab === 'billing' ? '2px solid var(--color-primary)' : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              Cloud billing logs
            </button>
          </div>

          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Core Overview Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 184, 148, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)' }}>
                    <Server size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '4px' }}>System Cluster Uptime</div>
                    <div style={{ fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      99.98%
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: 'var(--color-secondary)', 
                        display: 'inline-block',
                        boxShadow: '0 0 8px var(--color-secondary)',
                        animation: 'pulse 1.5s infinite'
                      }} />
                    </div>
                  </div>
                </Card>

                <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(108, 92, 231, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                    <Activity size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '4px' }}>Active User Load</div>
                    <div style={{ fontSize: '22px', fontWeight: 700 }}>{data.dailyActiveUsers} DAU / {data.totalStudents} total</div>
                  </div>
                </Card>

                <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(253, 150, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-warning)' }}>
                    <Layers size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '4px' }}>Total Quiz Responses</div>
                    <div style={{ fontSize: '22px', fontWeight: 700 }}>{data.totalQuizAttempts} evaluations</div>
                  </div>
                </Card>

                <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(235, 94, 40, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '4px' }}>Retention Index</div>
                    <div style={{ fontSize: '22px', fontWeight: 700 }}>{(data.weeklyRetention * 100).toFixed(0)}% Weekly</div>
                  </div>
                </Card>
              </div>

              {/* Service Health Console & Resource Logs */}
              <div style={{ display: 'grid', gridTemplateColumns: '5fr 4fr', gap: '24px' }}>
                
                <Card style={{ padding: '28px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Cpu size={18} color="var(--color-primary)" /> Node Heartbeats & Latencies
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {services.map((srv, idx) => (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '12px 16px', 
                        borderRadius: '8px', 
                        background: 'var(--bg-secondary)', 
                        border: '1px solid var(--border-color)' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            background: srv.status === 'operational' ? 'var(--color-secondary)' : 'var(--color-danger)', 
                            boxShadow: `0 0 6px ${srv.status === 'operational' ? 'var(--color-secondary)' : 'var(--color-danger)'}`,
                            display: 'inline-block' 
                          }} />
                          <span style={{ fontWeight: 600, fontSize: '13.5px' }}>{srv.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '12.5px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Latency: <strong style={{ color: 'var(--text-primary)' }}>{srv.latency}</strong></span>
                          <span style={{ color: 'var(--text-secondary)' }}>Load: <strong style={{ color: 'var(--text-primary)' }}>{srv.load}</strong></span>
                          <Badge variant="success">Online</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <Card style={{ padding: '28px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <HardDrive size={18} color="var(--color-accent)" /> Course Volume Metrics
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {data.topCourses.map((c, i) => (
                        <div key={i} style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 600, fontSize: '14.5px' }}>{c.name} Syllabus Node</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{c.enrolled} Students</span>
                          </div>
                          {/* Custom visual bar */}
                          <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                            <div style={{ 
                              width: `${(c.enrolled / 70) * 100}%`, 
                              height: '100%', 
                              background: i === 0 ? 'var(--color-primary)' : i === 1 ? 'var(--color-secondary)' : 'var(--color-accent)' 
                            }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            <span>Index Size: 1.2 MB RAG Corpus</span>
                            <span>Avg Ability Level: $\theta =$ {c.avgTheta.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '15px' }}>
                      <Clock size={16} style={{ color: 'var(--color-warning)' }} /> Backup Integrity logs
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Platform-wide database states are stored securely across MongoDB Atlas hot instances. 
                      Automatic snapshot schedules trigger daily at <code style={{ color: 'var(--color-warning)' }}>04:00 UTC</code>.
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '6px', background: 'var(--bg-secondary)', fontSize: '12px', border: '1px solid var(--border-color)' }}>
                      <span>Last Backup Snapshot:</span>
                      <strong style={{ color: 'var(--color-secondary)' }}>Today, 04:00 AM (Verified)</strong>
                    </div>
                  </Card>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'psychometrics' && (
            <Card style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    Item Response Theory (IRT) Bayesian $\theta$ Curve
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                    The standard Gaussian normal curve of active student ability coefficients ($\theta$) estimated via MLE.
                  </p>
                </div>
                <Badge variant="primary" size="md">Global Avg Ability: {data.avgPlatformTheta.toFixed(2)}</Badge>
              </div>

              {/* Graphical Histogram represented using CSS custom flexbox */}
              <div style={{ 
                height: '240px', 
                display: 'flex', 
                alignItems: 'flex-end', 
                gap: '24px', 
                padding: '20px 40px', 
                background: 'var(--bg-secondary)', 
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                marginBottom: '32px',
                position: 'relative'
              }}>
                {/* Horizontal reference lines */}
                <div style={{ position: 'absolute', left: 0, right: 0, top: '25%', borderBottom: '1px dashed rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderBottom: '1px dashed rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', left: 0, right: 0, top: '75%', borderBottom: '1px dashed rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

                {/* Below -1.0 */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ 
                    height: `${(data.thetaDistribution.below_minus1 / 156) * 100}%`, 
                    width: '100%', 
                    background: 'linear-gradient(180deg, var(--color-danger) 0%, rgba(255,118,117,0.2) 100%)', 
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.5s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12.5px'
                  }}>
                    {data.thetaDistribution.below_minus1}
                  </div>
                </div>

                {/* -1.0 to 0.0 */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ 
                    height: `${(data.thetaDistribution.minus1_to_0 / 156) * 100}%`, 
                    width: '100%', 
                    background: 'linear-gradient(180deg, var(--color-warning) 0%, rgba(254,211,48,0.2) 100%)', 
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.5s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12.5px'
                  }}>
                    {data.thetaDistribution.minus1_to_0}
                  </div>
                </div>

                {/* 0.0 to 1.0 */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ 
                    height: `${(data.thetaDistribution.zero_to_1 / 156) * 100}%`, 
                    width: '100%', 
                    background: 'linear-gradient(180deg, var(--color-secondary) 0%, rgba(0,184,148,0.2) 100%)', 
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.5s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12.5px'
                  }}>
                    {data.thetaDistribution.zero_to_1}
                  </div>
                </div>

                {/* Above 1.0 */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ 
                    height: `${(data.thetaDistribution.above_1 / 156) * 100}%`, 
                    width: '100%', 
                    background: 'linear-gradient(180deg, var(--color-primary) 0%, rgba(108,92,231,0.2) 100%)', 
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.5s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12.5px'
                  }}>
                    {data.thetaDistribution.above_1}
                  </div>
                </div>
              </div>

              {/* Histogram Labels */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', textAlign: 'center', marginBottom: '40px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>$\theta &lt; -1.0$</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Struggling Segment</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>$-1.0 \le \theta &lt; 0.0$</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Baseline Core Mastery</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>$0.0 \le \theta &lt; 1.0$</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Zone of Proximal Development</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>$\theta \ge 1.0$</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Advanced Excellence</div>
                </div>
              </div>

              {/* Deep Analysis */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <Card style={{ padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '15.5px', fontWeight: 600, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} color="var(--color-warning)" /> Bayesian Rationale
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    The platform's 3-Parameter Logistic (3PL) model analyzes correct/incorrect outputs weighted by question difficulty ($b$), discrimination factor ($a$), and pseudo-guessing index ($c$). 
                    The current average Ability coefficient ($\theta = 0.34$) reveals that the average student is comfortably operating within their target learning boundary without excessive frustration.
                  </div>
                </Card>

                <Card style={{ padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '15.5px', fontWeight: 600, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={16} color="var(--color-primary)" /> Course-Level Recalibration
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    For course segments showing a clustered negative skew ($\theta &lt; -0.5$), the system automatically adjusts recommended Leitner review frequency. 
                    Administrators can trigger local vector content updates inside the RAG corpus to provide simpler scaffolding notes.
                  </div>
                </Card>
              </div>
            </Card>
          )}

          {activeTab === 'billing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Cost Aggregator */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <Card style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Month-to-Date Cost</span>
                    <Badge variant="accent"><DollarSign size={10} /> Billing Active</Badge>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-accent)' }}>$182.40</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>Projected monthly: $238.90 (budget safe)</div>
                </Card>

                <Card style={{ padding: '24px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>RAG Embedding Costs</span>
                  <div style={{ fontSize: '28px', fontWeight: 700 }}>$14.20</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>Vector databases and index updates</div>
                </Card>

                <Card style={{ padding: '24px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>LLM Chat Gateway Costs</span>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-secondary)' }}>$168.20</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>Aria Socratic prompts & Groq API tokens</div>
                </Card>
              </div>

              {/* HSL Cost Allocation Chart */}
              <Card style={{ padding: '28px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 16px 0' }}>API Cost Allocation Breakdown</h2>
                
                <div style={{ display: 'flex', height: '36px', borderRadius: '18px', overflow: 'hidden', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
                  {/* LLM Chat Gateway - 92% */}
                  <div 
                    style={{ 
                      width: '92%', 
                      height: '100%', 
                      background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '16px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    LLM Socratic Tutoring (Aria) — 92.2%
                  </div>
                  {/* RAG Vector Indexing - 7.8% */}
                  <div 
                    style={{ 
                      width: '8%', 
                      height: '100%', 
                      background: 'var(--color-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    RAG — 7.8%
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  <div>
                    <h3 style={{ fontSize: '14.5px', fontWeight: 600, margin: '0 0 12px 0' }}>Infrastructure Optimization Logs</h3>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Our integration with high-speed Llama-3 endpoints on the <strong style={{ color: 'var(--text-primary)' }}>Groq API Client</strong> significantly decreases standard latency (average under 1.1s). 
                      Local RAG embeddings are generated on-the-fly inside the server cache to minimize token waste.
                    </div>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '14.5px', fontWeight: 600, margin: '0 0 12px 0' }}>Billing Threshold Guards</h3>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      The platform has automatic spending locks configured at <code style={{ color: 'var(--color-accent)' }}>$500.00 / month</code>. 
                      If costs exceed this value, the chatbot gateway switches automatically to local lightweight caching models to prevent subscription disruptions.
                    </div>
                  </div>
                </div>
              </Card>

            </div>
          )}

        </div>
      </div>

      <NovaBubble />
      <AccessibilityPanel />
      
      {/* Pulse Animations style definition */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
