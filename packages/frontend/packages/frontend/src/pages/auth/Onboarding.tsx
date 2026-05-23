import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const QUESTIONS = [
  {
    id: 1,
    category: 'Logic',
    text: 'If all bloops are razzies and all razzies are lazzies, are all bloops lazzies?',
    options: ['Yes', 'No', 'Cannot be determined', 'Some are']
  },
  {
    id: 2,
    category: 'Math',
    text: 'If a sequence starts with 2, 4, 8, 16... what is the 6th number?',
    options: ['32', '64', '128', '256']
  },
  {
    id: 3,
    category: 'Science',
    text: 'Which state of matter has a definite volume but no definite shape?',
    options: ['Solid', 'Liquid', 'Gas', 'Plasma']
  },
  {
    id: 4,
    category: 'Language',
    text: 'Identify the adverb in: "She ran quickly to the store."',
    options: ['She', 'ran', 'quickly', 'store']
  },
  {
    id: 5,
    category: 'General',
    text: 'Which of these is a primary color in the RGB color model?',
    options: ['Yellow', 'Green', 'Orange', 'Purple']
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = Welcome, 1-5 = Questions, 6 = Result
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleNext = () => {
    if (step > 0 && step <= 5 && selectedOption) {
      const updatedAnswers = { ...answers, [step]: selectedOption };
      setAnswers(updatedAnswers);
      setSelectedOption(null);

      if (step === 5) {
        let studentId = 'student-priya';
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userObj = JSON.parse(userStr);
            if (userObj.id) studentId = userObj.id;
            else if (userObj._id) studentId = userObj._id;
          }
        } catch (e) {
          console.warn("Could not read student user from localStorage, using default", e);
        }

        fetch('/api/quiz/diagnostic-baseline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, answers: updatedAnswers })
        })
        .then(res => res.json())
        .then(data => {
          console.log("Baseline established successfully:", data);
        })
        .catch(err => {
          console.error("Error establishing baseline:", err);
        });
      }
    }
    setStep(prev => prev + 1);
  };

  const handleFinish = () => {
    navigate('/'); // Go to dashboard
  };

  return (
    <div className="onboarding-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg-primary)' }}>
      <div className="onboarding-background-effects" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, var(--electric-indigo) 0%, transparent 60%)', opacity: 0.15, filter: 'blur(80px)' }} />
      </div>

      <Card className="onboarding-card" style={{ width: '100%', maxWidth: '600px', position: 'relative', zIndex: 1, padding: '40px' }}>
        
        {/* PROGRESS BAR */}
        {step > 0 && step <= 5 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <span>Diagnostic Assessment</span>
              <span>{step} of {QUESTIONS.length}</span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(step / QUESTIONS.length) * 100}%`, background: 'linear-gradient(90deg, var(--electric-indigo), var(--orchid))', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        {/* WELCOME SCREEN */}
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, var(--electric-indigo), var(--orchid))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(108, 92, 231, 0.4)' }}>
                <Brain size={40} color="#fff" />
              </div>
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 16px 0', background: 'linear-gradient(to right, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Welcome to AdaptIQ
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 32px 0', fontSize: '16px', lineHeight: 1.6 }}>
              Before you start, let's establish your knowledge baseline. This quick 5-question diagnostic helps Nova, your AI tutor, customize your learning journey.
            </p>
            <Button variant="primary" size="lg" onClick={handleNext} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} /> Start Diagnostic
            </Button>
          </div>
        )}

        {/* QUESTION SCREENS */}
        {step > 0 && step <= 5 && (
          <div>
            <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(108, 92, 231, 0.1)', color: 'var(--electric-indigo)', borderRadius: '16px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
              {QUESTIONS[step - 1].category}
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 24px 0', lineHeight: 1.4 }}>
              {QUESTIONS[step - 1].text}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {QUESTIONS[step - 1].options.map((opt, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedOption(opt)}
                  style={{ 
                    padding: '16px 20px', 
                    background: selectedOption === opt ? 'rgba(108, 92, 231, 0.1)' : 'var(--bg-tertiary)', 
                    border: `1px solid ${selectedOption === opt ? 'var(--electric-indigo)' : 'var(--border-color)'}`, 
                    borderRadius: '12px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '15px', color: selectedOption === opt ? '#fff' : 'var(--text-primary)', fontWeight: selectedOption === opt ? 500 : 400 }}>{opt}</span>
                  {selectedOption === opt && <CheckCircle2 size={20} color="var(--electric-indigo)" />}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={handleNext} disabled={!selectedOption} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Next <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}

        {/* RESULT SCREEN */}
        {step === 6 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 184, 148, 0.1)', border: '2px solid var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald)' }}>
                <CheckCircle2 size={40} />
              </div>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 16px 0', color: '#fff' }}>
              Baseline Established
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 32px 0', fontSize: '16px' }}>
              Nova has generated your Learner DNA profile. We've customized your dashboard and study plan to match your exact level.
            </p>
            
            {/* Mock Radar Chart placeholder */}
            <div style={{ width: '100%', height: '200px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: '120px', height: '120px', border: '1px solid var(--border-color)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', width: '80px', height: '80px', border: '1px solid var(--border-color)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', width: '40px', height: '40px', border: '1px solid var(--border-color)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'var(--border-color)' }} />
              <div style={{ position: 'absolute', width: '1px', height: '100%', background: 'var(--border-color)' }} />
              <div style={{ position: 'absolute', zIndex: 1, color: 'var(--electric-indigo)', fontSize: '14px', fontWeight: 600 }}>[Learner DNA Radar]</div>
            </div>

            <Button variant="primary" size="lg" onClick={handleFinish} style={{ width: '100%' }}>
              Go to Dashboard
            </Button>
          </div>
        )}

      </Card>
    </div>
  );
}
