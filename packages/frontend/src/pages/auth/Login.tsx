import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(response.data.token, response.data.user);
      
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else if (response.data.user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ padding: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', margin: '0px 0px 8px 0px' }}>Welcome Back</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          Sign in to continue your personalized learning journey.
        </p>
        {error && <p style={{ color: 'var(--color-danger)', fontSize: '14px', marginTop: '12px' }}>{error}</p>}
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
        <Button type="button" variant="secondary" onClick={() => { setEmail('priya@adaptiq.edu'); setPassword('password'); }} style={{ padding: '6px 12px', fontSize: '12px' }}>Student Demo</Button>
        <Button type="button" variant="secondary" onClick={() => { setEmail('sharma@adaptiq.edu'); setPassword('password'); }} style={{ padding: '6px 12px', fontSize: '12px' }}>Teacher Demo</Button>
        <Button type="button" variant="secondary" onClick={() => { setEmail('admin@adaptiq.edu'); setPassword('password'); }} style={{ padding: '6px 12px', fontSize: '12px' }}>Admin Demo</Button>
      </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="priya@student.edu" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        <Input 
          label="Password" 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <span 
            style={{ fontSize: '13px', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password?
          </span>
        </div>

        <Button type="submit" disabled={loading} style={{ width: '100%', padding: '12px' }}>
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
        <span 
          style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => navigate('/register')}
        >
          Sign Up
        </span>
      </div>
    </Card>
  );
};

export default Login;
