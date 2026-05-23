import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowRight, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request OTP');
      
      // In a real app we wouldn't show the mock OTP, but for this hackathon demo:
      if (data.mockOtp) {
        console.log("MOCK OTP:", data.mockOtp);
      }
      
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg-primary)' }}>
      <div className="auth-background-effects" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '20%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, var(--danger) 0%, transparent 60%)', opacity: 0.05, filter: 'blur(80px)' }} />
      </div>

      <Card className="auth-card" style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1, padding: '40px' }}>
        
        {step < 3 && (
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', marginBottom: '24px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <ArrowLeft size={16} /> Back to login
          </Link>
        )}

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: step === 3 ? 'rgba(0, 184, 148, 0.1)' : 'rgba(108, 92, 231, 0.1)', border: `1px solid ${step === 3 ? 'var(--emerald)' : 'var(--electric-indigo)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: step === 3 ? 'var(--emerald)' : 'var(--electric-indigo)' }}>
              {step === 1 ? <KeyRound size={32} /> : step === 2 ? <Lock size={32} /> : <CheckCircle2 size={32} />}
            </div>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            {step === 1 ? 'Forgot Password?' : step === 2 ? 'Reset Password' : 'Password Reset!'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '15px' }}>
            {step === 1 ? "No worries, we'll send you reset instructions." : step === 2 ? 'Enter the OTP sent to your email and your new password.' : 'Your password has been successfully reset.'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(255, 118, 117, 0.1)', borderLeft: '4px solid var(--danger)', borderRadius: '4px', color: '#ff7675', marginBottom: '24px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* STEP 1: REQUEST OTP */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '12px 16px 12px 48px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
                />
              </div>
            </div>
            <Button variant="primary" size="lg" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }} disabled={isLoading}>
              {isLoading ? <Loader2 size={18} className="spin" /> : 'Send Reset OTP'}
            </Button>
          </form>
        )}

        {/* STEP 2: VERIFY & RESET */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>6-Digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                required
                placeholder="000000"
                style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', fontSize: '24px', letterSpacing: '8px', textAlign: 'center', fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
              />
            </div>
            <Button variant="primary" size="lg" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }} disabled={isLoading}>
              {isLoading ? <Loader2 size={18} className="spin" /> : 'Reset Password'}
            </Button>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Button variant="primary" size="lg" onClick={() => navigate('/login')} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              Continue to Login <ArrowRight size={18} />
            </Button>
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
