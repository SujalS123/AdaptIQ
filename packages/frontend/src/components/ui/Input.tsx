import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
      {label && <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>}
      <input
        style={{
          padding: '12px 16px',
          borderRadius: '8px',
          border: `1px solid ${error ? 'var(--color-danger)' : 'var(--border-color)'}`,
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          fontSize: '15px',
          outline: 'none',
          transition: 'border-color 0.2s',
          ...style
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
        onBlur={(e) => e.target.style.borderColor = error ? 'var(--color-danger)' : 'var(--border-color)'}
        {...props}
      />
      {error && <span style={{ fontSize: '12px', color: 'var(--color-danger)' }}>{error}</span>}
    </div>
  );
};
