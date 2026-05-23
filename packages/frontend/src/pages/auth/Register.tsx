import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import axios from 'axios';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        role
      });
      
      login(res.data.token, res.data.user);
      
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else if (res.data.user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card style={{ padding: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', margin: '0px 0px 8px 0px' }}>Create an Account</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          Join AdaptIQ to experience AI-powered education.
        </p>
      </div>

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Input 
          label="Full Name" 
          type="text" 
          placeholder="Priya Sharma" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
        />
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
          placeholder="Create a strong password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Select Role</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: 'var(--text-primary)',
              fontSize: '13.5px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        {error && (
          <div style={{ padding: '12px', backgroundColor: 'var(--color-danger-glow)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '13.5px', textAlign: 'center', marginTop: '8px' }}>
            {error}
          </div>
        )}

        <Button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
        <span 
          style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => navigate('/login')}
        >
          Sign In
        </span>
      </div>
    </Card>
  );
};

export default Register;
