import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Card style={{ padding: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', margin: '0px 0px 8px 0px' }}>Reset Password</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          {submitted ? "Check your email for reset instructions." : "Enter your email to receive a password reset link."}
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="priya@student.edu" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />

          <Button type="submit" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
            Send Reset Link
          </Button>
        </form>
      ) : (
        <Button style={{ width: '100%', padding: '12px' }} onClick={() => navigate('/login')}>
          Return to Login
        </Button>
      )}

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
        <span 
          style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}
          onClick={() => navigate('/login')}
        >
          Back to Login
        </span>
      </div>
    </Card>
  );
};

export default ForgotPassword;
