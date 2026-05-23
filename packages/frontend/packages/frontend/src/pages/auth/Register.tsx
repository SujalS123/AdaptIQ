import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Check, ChevronRight, Brain, GraduationCap, Briefcase, Loader2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    languagePreference: 'en',
    accessibilitySettings: { dyslexiaMode: false, highContrast: false }
  });

  const updateForm = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));

  // Password validation
  const hasMinLen = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasDigit = /\d/.test(formData.password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password);
  const isPasswordValid = hasMinLen && hasUpper && hasDigit && hasSpecial;

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      
      // Redirect to onboarding for students
      if (formData.role === 'student') {
        navigate('/onboarding');
      } else if (formData.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/admin/users');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const RoleCard = ({ type, title, desc, icon: Icon }: any) => (
    <Card 
      onClick={() => updateForm('role', type)}
      style={{ 
        cursor: 'pointer', 
        border: formData.role === type ? '2px solid var(--electric-indigo)' : '1px solid var(--border-color)',
        background: formData.role === type ? 'rgba(108, 92, 231, 0.1)' : 'var(--bg-tertiary)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.2s',
        opacity: (formData.role !== type && formData.role !== '') ? 0.6 : 1
      }}
    >
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: formData.role === type ? 'var(--electric-indigo)' : 'var(--text-secondary)' }}>
        <Icon size={24} />
      </div>
      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>{desc}</p>
    </Card>
  );

  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg-primary)' }}>
      <div className="auth-background-effects" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', left: '80%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, var(--orchid) 0%, transparent 60%)', opacity: 0.1, filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '50%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, var(--electric-indigo) 0%, transparent 60%)', opacity: 0.1, filter: 'blur(100px)' }} />
      </div>

      <Card className="auth-card" style={{ width: '100%', maxWidth: '540px', position: 'relative', zIndex: 1, padding: '40px' }}>
        
        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
          {[1, 2, 3].map(i => (
            <React.Fragment key={i}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                background: step >= i ? 'var(--electric-indigo)' : 'var(--bg-tertiary)',
                color: step >= i ? '#fff' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: '14px',
                border: step >= i ? 'none' : '1px solid var(--border-color)',
                transition: 'all 0.3s'
              }}>
                {step > i ? <Check size={16} /> : i}
              </div>
              {i < 3 && <div style={{ width: '40px', height: '2px', background: step > i ? 'var(--electric-indigo)' : 'var(--border-color)', transition: 'all 0.3s' }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0', background: 'linear-gradient(to right, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {step === 1 ? 'Join AdaptIQ' : step === 2 ? 'Create Account' : 'Learning Preferences'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {step === 1 ? 'Select how you will be using the platform' : step === 2 ? 'Enter your details to get started' : 'Customize your experience'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(255, 118, 117, 0.1)', borderLeft: '4px solid var(--danger)', borderRadius: '4px', color: '#ff7675', marginBottom: '24px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* STEP 1: ROLE SELECTION */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <RoleCard type="student" title="Student" desc="Learn with personalized AI tutoring" icon={Brain} />
            <RoleCard type="teacher" title="Educator" desc="Manage classes and track progress" icon={GraduationCap} />
            <div style={{ gridColumn: 'span 2' }}>
              <RoleCard type="admin" title="Administrator" desc="Manage institution settings and billing" icon={Briefcase} />
            </div>
          </div>
        )}

        {/* STEP 2: CREDENTIALS */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => updateForm('name', e.target.value)}
                  placeholder="Alex Doe"
                  style={{ width: '100%', padding: '12px 16px 12px 48px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
                />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => updateForm('email', e.target.value)}
                  placeholder="alex@example.com"
                  style={{ width: '100%', padding: '12px 16px 12px 48px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => updateForm('password', e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '12px 16px 12px 48px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
                />
              </div>
              
              {/* Password Strength Indicator */}
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '12px', color: hasMinLen ? 'var(--emerald)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} style={{ opacity: hasMinLen ? 1 : 0.3 }} /> At least 8 characters
                </div>
                <div style={{ fontSize: '12px', color: hasUpper ? 'var(--emerald)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} style={{ opacity: hasUpper ? 1 : 0.3 }} /> 1 uppercase letter
                </div>
                <div style={{ fontSize: '12px', color: hasDigit ? 'var(--emerald)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} style={{ opacity: hasDigit ? 1 : 0.3 }} /> 1 digit
                </div>
                <div style={{ fontSize: '12px', color: hasSpecial ? 'var(--emerald)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} style={{ opacity: hasSpecial ? 1 : 0.3 }} /> 1 special character
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PREFERENCES */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Preferred Language</label>
              <select 
                value={formData.languagePreference}
                onChange={e => updateForm('languagePreference', e.target.value)}
                style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>

            <Card style={{ background: 'var(--bg-tertiary)', padding: '16px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600 }}>Accessibility Settings</h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>Dyslexia Mode</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Uses OpenDyslexic font for better readability</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.accessibilitySettings.dyslexiaMode}
                  onChange={e => updateForm('accessibilitySettings', { ...formData.accessibilitySettings, dyslexiaMode: e.target.checked })}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--electric-indigo)' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>High Contrast</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Enhances visual distinctiveness</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.accessibilitySettings.highContrast}
                  onChange={e => updateForm('accessibilitySettings', { ...formData.accessibilitySettings, highContrast: e.target.checked })}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--electric-indigo)' }}
                />
              </div>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {step > 1 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)} style={{ flex: 1 }}>
              Back
            </Button>
          )}
          
          {step < 3 ? (
            <Button 
              variant="primary" 
              onClick={() => setStep(step + 1)} 
              disabled={(step === 2 && (!formData.name || !formData.email || !isPasswordValid))}
              style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: '8px' }}
            >
              Continue <ChevronRight size={18} />
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              disabled={isLoading}
              style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: '8px' }}
            >
              {isLoading ? <Loader2 size={18} className="spin" /> : <UserPlus size={18} />}
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </Button>
          )}
        </div>

        {step === 1 && (
          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '15px', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--electric-indigo)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </div>
        )}
      </Card>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
