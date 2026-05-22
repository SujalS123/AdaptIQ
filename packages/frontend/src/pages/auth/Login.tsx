import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, Mail, Lock, LogIn, Github, Loader2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Stub login fetch call
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      
      // Navigate based on role
      if (data.user.role === 'teacher') navigate('/teacher');
      else if (data.user.role === 'admin') navigate('/admin/users');
      else navigate('/');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg-primary)' }}>
      <div className="auth-background-effects" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, var(--electric-indigo) 0%, transparent 60%)', opacity: 0.15, filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, var(--emerald) 0%, transparent 60%)', opacity: 0.1, filter: 'blur(100px)' }} />
      </div>

      <Card className="auth-card" style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1, padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--electric-indigo), var(--orchid))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(108, 92, 231, 0.4)' }}>
              <Brain size={32} color="#fff" />
            </div>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0', background: 'linear-gradient(to right, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Sign in to continue your learning journey</p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(255, 118, 117, 0.1)', borderLeft: '4px solid var(--danger)', borderRadius: '4px', color: '#ff7675', marginBottom: '24px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                style={{ width: '100%', padding: '12px 16px 12px 48px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.2s', fontSize: '15px' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--electric-indigo)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '14px', color: 'var(--electric-indigo)', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 16px 12px 48px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.2s', fontSize: '15px' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--electric-indigo)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>

          <Button variant="primary" size="lg" style={{ width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '8px' }} disabled={isLoading}>
            {isLoading ? <Loader2 size={18} className="spin" /> : <LogIn size={18} />}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div style={{ margin: '32px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <Button variant="secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <Github size={18} />
            Google
          </Button>
          <Button variant="secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <Mail size={18} />
            Microsoft
          </Button>
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '15px', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--electric-indigo)', textDecoration: 'none', fontWeight: 600 }}>
            Create one now
          </Link>
        </div>
      </Card>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
