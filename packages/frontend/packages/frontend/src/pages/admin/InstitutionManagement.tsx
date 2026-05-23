import React, { useState, useEffect } from 'react';
import NovaSidebar from '../../components/nova/NovaSidebar';
import { NovaBubble } from '../../components/nova/NovaBubble';
import { AccessibilityPanel } from '../../components/accessibility/AccessibilityPanel';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { 
  Building, 
  BookOpen, 
  ShieldAlert, 
  CreditCard, 
  Award, 
  Plus, 
  Globe, 
  Users, 
  Check, 
  X, 
  ArrowRight,
  Database,
  CheckCircle,
  FileText
} from 'lucide-react';

interface Department {
  name: string;
  students: number;
  teachers: number;
}

interface InstitutionData {
  name: string;
  plan: string;
  activeLicenses: number;
  usedLicenses: number;
  billingCycle: string;
  nextBillingDate: string;
  features: string[];
  departments: Department[];
}

interface CourseShell {
  code: string;
  name: string;
  students: number;
  status: 'published' | 'draft';
  vectorIndexed: boolean;
}

interface FlaggedInteraction {
  id: string;
  studentName: string;
  timestamp: string;
  query: string;
  response: string;
  reason: 'out-of-syllabus' | 'possible-hallucination' | 'sensitive-content';
}

export default function InstitutionManagement() {
  const [instData, setInstData] = useState<InstitutionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'moderation' | 'billing'>('courses');

  // Courses state
  const [courses, setCourses] = useState<CourseShell[]>([
    { code: 'CS-301', name: 'Database Management Systems', students: 64, status: 'published', vectorIndexed: true },
    { code: 'CS-402', name: 'Design & Analysis of Algorithms', students: 58, status: 'published', vectorIndexed: true },
    { code: 'CS-204', name: 'Computer Networks & Security', students: 51, status: 'published', vectorIndexed: true },
    { code: 'CS-102', name: 'Introduction to Web Technologies', students: 0, status: 'draft', vectorIndexed: false },
    { code: 'CS-408', name: 'Artificial Intelligence & Robotics', students: 0, status: 'draft', vectorIndexed: false }
  ]);

  // Flagged Interactions state
  const [flaggedItems, setFlaggedItems] = useState<FlaggedInteraction[]>([
    { 
      id: 'flg-001', 
      studentName: 'Rahul Verma', 
      timestamp: '2026-05-22T14:22:00Z', 
      query: 'Can you write a code to bypass safety protocols in MongoDB?', 
      response: 'I cannot write scripts designed to bypass authentication locks or security protocols. Aria operates strictly inside syllabus limits.', 
      reason: 'sensitive-content' 
    },
    { 
      id: 'flg-002', 
      studentName: 'Sneha Patel', 
      timestamp: '2026-05-21T18:05:00Z', 
      query: 'What is the exact stock price of Microsoft right now?', 
      response: 'I ground my responses strictly in your computer science curriculum. Stock valuations are out-of-syllabus.', 
      reason: 'out-of-syllabus' 
    },
    { 
      id: 'flg-003', 
      studentName: 'Amit Shah', 
      timestamp: '2026-05-21T09:40:00Z', 
      query: 'Explain the 4th normal form but invent a funny example of a database for magical beasts.', 
      response: 'In 4NF, multi-valued dependencies are resolved. Imagine database table magical_beasts with multiple non-trivial values...', 
      reason: 'possible-hallucination' 
    }
  ]);

  // Scholarship/Voucher State
  const [voucherForm, setVoucherForm] = useState({
    recipient: '',
    role: 'student' as 'student' | 'teacher',
    reason: '',
  });
  const [issuedVouchers, setIssuedVouchers] = useState<Array<{ code: string; recipient: string; role: string; date: string }>>([]);
  const [showVoucherSuccess, setShowVoucherSuccess] = useState(false);
  const [latestVoucherCode, setLatestVoucherCode] = useState('');

  // Course Shell Creation state
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    status: 'draft' as 'published' | 'draft',
    vectorIndexed: false
  });

  useEffect(() => {
    fetch('/api/admin/institution')
      .then(res => res.json())
      .then(data => {
        setInstData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching institution details:", err);
        setIsLoading(false);
      });
  }, []);

  const handleToggleCourseStatus = (code: string) => {
    setCourses(prev => prev.map(c => {
      if (c.code === code) {
        const nextStatus = c.status === 'published' ? 'draft' : 'published';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleTriggerIndexing = (code: string) => {
    // Simulate RAG vector indexing step
    setCourses(prev => prev.map(c => {
      if (c.code === code) {
        return { ...c, vectorIndexed: true };
      }
      return c;
    }));
    alert(`RAG vectorizer triggered. Concept nodes for ${code} have been parsed and committed successfully.`);
  };

  const handleDismissFlagged = (id: string) => {
    setFlaggedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleApproveFlagged = (id: string) => {
    setFlaggedItems(prev => prev.filter(item => item.id !== id));
    alert("Response marked as safe and cleared from moderation log.");
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const courseToAdd: CourseShell = {
      code: newCourse.code,
      name: newCourse.name,
      students: 0,
      status: newCourse.status,
      vectorIndexed: newCourse.vectorIndexed
    };
    setCourses(prev => [...prev, courseToAdd]);
    setIsAddCourseModalOpen(false);
    setNewCourse({ code: '', name: '', status: 'draft', vectorIndexed: false });
  };

  const handleIssueVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `SCHOLAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newVoucher = {
      code,
      recipient: voucherForm.recipient,
      role: voucherForm.role,
      date: new Date().toLocaleDateString()
    };
    
    setIssuedVouchers(prev => [newVoucher, ...prev]);
    setLatestVoucherCode(code);
    setShowVoucherSuccess(true);
    setVoucherForm({ recipient: '', role: 'student', reason: '' });
  };

  if (isLoading || !instData) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <NovaSidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Decrypting institutional security directory...</span>
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
        
        {/* Background Glow */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '400px', 
          background: 'radial-gradient(circle at 50% -100px, rgba(0, 184, 148, 0.1), transparent 70%)', 
          pointerEvents: 'none', 
          zIndex: 0 
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-secondary)', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                <Building size={16} /> INSTITUTION CONSOLE
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #ffffff 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {instData.name}
              </h1>
            </div>
            
            <Badge variant="success" size="md">Plan: {instData.plan} Tier</Badge>
          </div>

          {/* Quick Tab Selector */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '32px', paddingBottom: '12px' }}>
            <button 
              onClick={() => setActiveTab('courses')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'courses' ? 'var(--color-secondary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '15px',
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: activeTab === 'courses' ? '2px solid var(--color-secondary)' : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              Curriculum & Course Shells
            </button>
            <button 
              onClick={() => setActiveTab('moderation')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'moderation' ? 'var(--color-secondary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '15px',
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: activeTab === 'moderation' ? '2px solid var(--color-secondary)' : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              Flagged Content Moderation
            </button>
            <button 
              onClick={() => setActiveTab('billing')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'billing' ? 'var(--color-secondary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '15px',
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: activeTab === 'billing' ? '2px solid var(--color-secondary)' : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              Licenses & Scholarship Tokens
            </button>
          </div>

          {activeTab === 'courses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 6px 0' }}>Institutional Syllabus Directory</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', margin: 0 }}>
                    Manage course shell visibilities and trigger RAG indexing algorithms.
                  </p>
                </div>
                <Button variant="secondary" onClick={() => setIsAddCourseModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={16} /> Create Course Shell
                </Button>
              </div>

              <Card style={{ padding: '8px', overflow: 'hidden' }}>
                <Table headers={['Course Code & Title', 'Students Enrolled', 'Index Status', 'Catalog Status', 'Operations']}>
                  {courses.map((course) => (
                    <TableRow key={course.code}>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'rgba(0, 184, 148, 0.05)',
                            border: '1px solid rgba(0, 184, 148, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-secondary)'
                          }}>
                            <BookOpen size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14.5px' }}>{course.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Syllabus Code: {course.code}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell style={{ fontSize: '13.5px', fontWeight: 600 }}>{course.students} students</TableCell>
                      <TableCell>
                        {course.vectorIndexed ? (
                          <Badge variant="success"><Check size={10} /> RAG Vectorized</Badge>
                        ) : (
                          <Badge variant="muted">No Index Found</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {course.status === 'published' ? (
                          <Badge variant="primary">Published</Badge>
                        ) : (
                          <Badge variant="default">Draft Mode</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleToggleCourseStatus(course.code)}
                            style={{ fontSize: '12px' }}
                          >
                            {course.status === 'published' ? 'Set to Draft' : 'Publish'}
                          </Button>
                          <Button 
                            variant="ghost"
                            size="sm" 
                            disabled={course.vectorIndexed}
                            onClick={() => handleTriggerIndexing(course.code)}
                            style={{ fontSize: '12px', borderColor: course.vectorIndexed ? 'transparent' : 'var(--border-color)' }}
                          >
                            <Database size={11} style={{ marginRight: '4px' }} /> Vectorize
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </Table>
              </Card>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} color="var(--color-danger)" /> Flagged Conversation Sandbox
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', margin: 0 }}>
                  Review chatbot logs flagged for safety, out-of-syllabus exploration, or potential inaccuracies.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {flaggedItems.length === 0 ? (
                  <Card style={{ padding: '40px', textAlign: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Flagged interaction sandbox is empty. Clear skies!</span>
                  </Card>
                ) : (
                  flaggedItems.map((item) => (
                    <Card key={item.id} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Badge variant="danger" size="md">
                            {item.reason === 'sensitive-content' ? 'Sensitive Action' : item.reason === 'out-of-syllabus' ? 'Out of Syllabus' : 'RAG Hallucination'}
                          </Badge>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            Flagged interaction for student <strong style={{ color: 'var(--text-primary)' }}>{item.studentName}</strong>
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(item.timestamp).toLocaleString()}</span>
                      </div>

                      <div style={{ 
                        background: 'var(--bg-secondary)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        fontSize: '13.5px'
                      }}>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>STUDENT QUERY:</div>
                          <div style={{ fontWeight: 500 }}>"{item.query}"</div>
                        </div>
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                          <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>ARIA (SOCRATIC CHATBOT) RESPONSE:</div>
                          <div style={{ color: 'var(--color-secondary)' }}>"{item.response}"</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <Button variant="ghost" size="sm" onClick={() => handleDismissFlagged(item.id)} style={{ fontSize: '12.5px' }}>
                          Dismiss Log
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleApproveFlagged(item.id)} style={{ fontSize: '12.5px' }}>
                          Approve Safe
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              
              {/* Left Column: Billing info & Allocation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <Card style={{ padding: '28px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={18} color="var(--color-secondary)" /> Subscription Directory
                  </h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Institutional Grade</span>
                      <strong style={{ color: 'var(--color-secondary)' }}>{instData.plan} Tier</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>License Capacity</span>
                      <strong>{instData.usedLicenses} / {instData.activeLicenses} Used</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Billing Cycle</span>
                      <span style={{ textTransform: 'capitalize' }}>{instData.billingCycle}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Renewal Date</span>
                      <strong>{new Date(instData.nextBillingDate).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </Card>

                <Card style={{ padding: '28px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} color="var(--color-secondary)" /> Departmental Allotments
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {instData.departments.map((dept, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13.5px' }}>
                          <span style={{ fontWeight: 600 }}>{dept.name} Dept</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{dept.students} std / {dept.teachers} fac</span>
                        </div>
                        {/* Custom visual progress bar */}
                        <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${(dept.students / 215) * 100}%`, 
                            height: '100%', 
                            background: 'var(--color-secondary)' 
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Column: Scholarship Coupon Generator */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <Card style={{ padding: '28px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={18} color="var(--color-secondary)" /> Scholarship & Voucher Issuer
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                    Generate 100% scholarship entry coupon keys for partner schools, rural campuses, or underprivileged students.
                  </p>

                  <form onSubmit={handleIssueVoucher} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Recipient Name / Institution</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rural Campus Block A or Student Name"
                        value={voucherForm.recipient}
                        onChange={e => setVoucherForm(prev => ({ ...prev, recipient: e.target.value }))}
                        style={{
                          padding: '10px 12px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          fontSize: '13.5px'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Voucher Purpose</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="e.g. Scholarship token for partner colleges"
                        value={voucherForm.reason}
                        onChange={e => setVoucherForm(prev => ({ ...prev, reason: e.target.value }))}
                        style={{
                          padding: '10px 12px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          fontSize: '13.5px',
                          fontFamily: 'inherit',
                          resize: 'none'
                        }}
                      />
                    </div>

                    <Button variant="secondary" type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
                      Generate Scholarship Token <ArrowRight size={14} />
                    </Button>
                  </form>

                  {showVoucherSuccess && (
                    <div style={{ 
                      marginTop: '20px', 
                      padding: '16px', 
                      borderRadius: '8px', 
                      background: 'rgba(0, 184, 148, 0.05)', 
                      border: '1px solid rgba(0, 184, 148, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--color-secondary)' }}>
                        <CheckCircle size={16} /> Token Generated Successfully!
                      </div>
                      <div style={{ 
                        padding: '10px', 
                        background: 'var(--bg-secondary)', 
                        border: '1px dashed var(--color-secondary)', 
                        borderRadius: '6px', 
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '16px',
                        letterSpacing: '0.08em',
                        color: 'var(--color-secondary)',
                        fontFamily: 'monospace'
                      }}>
                        {latestVoucherCode}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Share this token code with the recipient. They can input it during signup to trigger a 100% discount.
                      </span>
                    </div>
                  )}
                </Card>

                {/* List of active vouchers */}
                {issuedVouchers.length > 0 && (
                  <Card style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '14.5px', fontWeight: 600, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={15} /> Active Vouchers
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {issuedVouchers.map((v, i) => (
                        <div key={i} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          padding: '10px 14px', 
                          background: 'var(--bg-secondary)', 
                          borderRadius: '6px', 
                          border: '1px solid var(--border-color)',
                          fontSize: '12px'
                        }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{v.recipient}</div>
                            <span style={{ color: 'var(--text-muted)' }}>Issued: {v.date}</span>
                          </div>
                          <strong style={{ color: 'var(--color-secondary)', fontFamily: 'monospace' }}>{v.code}</strong>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Add Course Modal */}
      <Modal isOpen={isAddCourseModalOpen} onClose={() => setIsAddCourseModalOpen(false)} title="Create Syllabus Shell" width="460px">
        <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Course Code</label>
            <input
              type="text"
              required
              placeholder="e.g. CS-302"
              value={newCourse.code}
              onChange={e => setNewCourse(prev => ({ ...prev, code: e.target.value }))}
              style={{
                padding: '10px 12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '13.5px'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Course Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Theory of Computation"
              value={newCourse.name}
              onChange={e => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
              style={{
                padding: '10px 12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '13.5px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Publish Status</label>
              <select
                value={newCourse.status}
                onChange={e => setNewCourse(prev => ({ ...prev, status: e.target.value as any }))}
                style={{
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '13.5px'
                }}
              >
                <option value="draft">Draft Mode</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>RAG Indexing</label>
              <select
                value={newCourse.vectorIndexed ? 'true' : 'false'}
                onChange={e => setNewCourse(prev => ({ ...prev, vectorIndexed: e.target.value === 'true' }))}
                style={{
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '13.5px'
                }}
              >
                <option value="false">Queue (Pending)</option>
                <option value="true">Run Automatically</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsAddCourseModalOpen(false)}>Cancel</Button>
            <Button variant="secondary" type="submit">Create Shell</Button>
          </div>
        </form>
      </Modal>

      <NovaBubble />
      <AccessibilityPanel />
    </div>
  );
}
