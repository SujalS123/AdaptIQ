import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' 
    }}>
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '40px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <h2 style={{ fontSize: '24px', margin: '0px', fontWeight: 700 }} className="gradient-text">
          AdaptIQ
        </h2>
      </div>

      <div style={{ width: '100%', maxWidth: '420px', padding: '20px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
