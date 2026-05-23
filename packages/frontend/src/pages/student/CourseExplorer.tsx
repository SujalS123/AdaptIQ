import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NovaSidebar from '../../components/nova/NovaSidebar';
import { NovaBubble } from '../../components/nova/NovaBubble';
import { AccessibilityPanel } from '../../components/accessibility/AccessibilityPanel';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { BookOpen, Users, Compass, CheckCircle2, ChevronRight, Award, Plus, Sparkles, AlertCircle, Globe } from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  subject: string;
  domain: string;
  examTags: string[];
  modules: any[];
  enrollmentCount: number;
  language: string;
  enrolledStudents?: string[];
}

export default function CourseExplorer() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [xp, setXp] = useState(350);
  const [level, setLevel] = useState(1);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourses = () => {
    setIsLoading(true);
    // Fetch all active courses
    fetch('/api/student/courses/all')
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses || []);
        // Fetch joined courses
        return fetch('/api/student/courses/joined')
          .then(res => res.json())
          .then(joinedData => {
            const joinedList = joinedData.courses || [];
            setJoinedIds(joinedList.map((c: any) => c._id));
            setIsLoading(false);
          });
      })
      .catch(err => {
        console.warn("⚠️ Backend student endpoints offline. Launching stateful in-memory offline fallback catalog:", err);
        // Fallback preseeded database
        const mockCatalog: Course[] = [
          {
            _id: 'course-dbms',
            title: "Professor Sharma's Introduction to Database Systems",
            subject: 'DBMS',
            domain: 'college',
            examTags: ['GATE', 'Semester Exam'],
            enrollmentCount: 142,
            language: 'en',
            modules: [
              { moduleId: 'module-1-keys', title: 'Database Keys and Integrity Constraints', sequenceOrder: 1 },
              { moduleId: 'module-2-normalization', title: 'Normalization Theory: 1NF, 2NF, 3NF', sequenceOrder: 2 }
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
              { moduleId: 'module-daa-1', title: 'Asymptotic Analysis & Big-O Notation', sequenceOrder: 1 },
              { moduleId: 'module-daa-2', title: 'Divide & Conquer Recurrences', sequenceOrder: 2 },
              { moduleId: 'module-daa-3', title: 'Dynamic Programming Optimization', sequenceOrder: 3 }
            ],
            enrolledStudents: []
          }
        ];
        
        // Add any locally added courses from localStorage if there are any
        try {
          const locallyCreated = localStorage.getItem('mockCourses');
          if (locallyCreated) {
            const parsed = JSON.parse(locallyCreated);
            mockCatalog.push(...parsed);
          }
        } catch (e) {
          console.error(e);
        }

        setCourses(mockCatalog);
        
        // Load joined status from localStorage
        const storedJoined = localStorage.getItem('enrolledCourses');
        if (storedJoined) {
          setJoinedIds(JSON.parse(storedJoined));
        }
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCourses();
    // Load student DNA XP details if available
    fetch('/api/student/dna/student-priya')
      .then(res => res.json())
      .then(data => {
        if (data.dna) {
          setXp(data.dna.xpPoints || 350);
          setLevel(data.dna.level || 1);
        }
      })
      .catch(() => {
        // Offline default
        const localXp = localStorage.getItem('student_xp');
        if (localXp) setXp(Number(localXp));
        const localLevel = localStorage.getItem('student_level');
        if (localLevel) setLevel(Number(localLevel));
      });
  }, []);

  const handleJoinCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/student/courses/${courseId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to join course');
      }

      const data = await response.json();
      
      // Update joined array
      setJoinedIds(prev => [...prev, courseId]);
      
      // Update DNA XP details
      if (data.dna) {
        setXp(data.dna.xpPoints);
        setLevel(data.dna.level);
      } else {
        const newXp = xp + 100;
        setXp(newXp);
        setLevel(Math.floor(newXp / 500) + 1);
      }

      // Show floating micro-animation XP award tag
      setXpAwarded(true);
      setTimeout(() => setXpAwarded(false), 2500);

    } catch (err) {
      console.warn("⚠️ Joining course in offline mock mode.");
      const newJoined = [...joinedIds, courseId];
      setJoinedIds(newJoined);
      localStorage.setItem('enrolledCourses', JSON.stringify(newJoined));

      const newXp = xp + 100;
      setXp(newXp);
      const newLevel = Math.floor(newXp / 500) + 1;
      setLevel(newLevel);
      
      localStorage.setItem('student_xp', newXp.toString());
      localStorage.setItem('student_level', newLevel.toString());

      setXpAwarded(true);
      setTimeout(() => setXpAwarded(false), 2500);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <NovaSidebar />
      
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header & Gamification XP HUD */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', margin: 0, background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Course Explorer
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1.1rem' }}>
                Explore academic courses, unlock spacing revision schedules, and join.
              </p>
            </div>

            {/* Premium HUD */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
              {xpAwarded && (
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '10px',
                  color: '#34d399',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  animation: 'floatUp 2.5s ease-out forwards',
                  fontFamily: 'Outfit, sans-serif',
                  pointerEvents: 'none'
                }}>
                  +100 XP UNLOCKED! 🌟
                </div>
              )}

              <Card className="card" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Award size={28} style={{ color: '#fed330' }} />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>STUDENT RANK</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>LEVEL {level}</div>
                </div>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', height: '30px' }} />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TOTAL XP</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', fontFamily: 'Outfit, sans-serif' }}>{xp} XP</div>
                </div>
              </Card>
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Discovering available syllabi catalog...</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
              {courses.map((course) => {
                const hasJoined = joinedIds.includes(course._id);
                
                return (
                  <Card 
                    key={course._id} 
                    className="card" 
                    style={{ 
                      padding: '28px', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid rgba(255, 255, 255, 0.06)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      minHeight: '280px',
                      borderRadius: '20px',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                  >
                    <div>
                      {/* Top Row: Subject & Language */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <Badge style={{ backgroundColor: 'rgba(129, 140, 248, 0.15)', color: '#818cf8' }}>{course.subject}</Badge>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <Globe size={14} />
                          <span>{course.language.toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 12px 0', fontFamily: 'Outfit, sans-serif', lineHeight: '1.4' }}>
                        {course.title}
                      </h3>

                      {/* Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                        {course.examTags.map((tag, idx) => (
                          <span key={idx} style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats & Join Button */}
                    <div>
                      <div style={{ display: 'flex', justifySelf: 'between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <BookOpen size={16} />
                          <span>{course.modules?.length || 0} Chapters</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <Users size={16} />
                          <span>{(course.enrollmentCount || 0) + (hasJoined && !course.enrolledStudents?.includes('student-priya') ? 1 : 0)} Enrolled</span>
                        </div>
                      </div>

                      {hasJoined ? (
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <Button 
                            variant="secondary" 
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}
                            onClick={() => navigate(`/student/course/${course._id}`)}
                          >
                            <CheckCircle2 size={16} />
                            <span>Enrolled (Study Now)</span>
                            <ChevronRight size={16} />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="primary" 
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                          onClick={() => handleJoinCourse(course._id)}
                        >
                          <Sparkles size={16} />
                          <span>Unlock Course (+100 XP)</span>
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-50px) scale(1.1); opacity: 0; }
        }
      `}} />

      <NovaBubble />
      <AccessibilityPanel />
    </div>
  );
}
