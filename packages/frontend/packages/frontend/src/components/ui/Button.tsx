import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {


  // We write standard CSS inline fallback styles to match pure CSS styles without tailwind dependency clashing:
  const inlineStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
    fontWeight: 500,
    borderRadius: '8px',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: '#ffffff',
      boxShadow: '0 4px 14px 0 var(--color-primary-glow)',
    },
    secondary: {
      backgroundColor: 'var(--color-secondary)',
      color: '#ffffff',
      boxShadow: '0 4px 14px 0 var(--color-secondary-glow)',
    },
    accent: {
      backgroundColor: 'var(--color-accent)',
      color: '#ffffff',
      boxShadow: '0 4px 14px 0 var(--color-accent-glow)',
    },
    danger: {
      backgroundColor: 'var(--color-danger)',
      color: '#ffffff',
      boxShadow: '0 4px 14px 0 var(--color-danger-glow)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-color)',
    },
  }[variant];

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '16px' },
  }[size];

  const combinedStyles = { ...inlineStyles, ...variantStyles, ...sizeStyles };

  return (
    <button
      style={combinedStyles}
      className={`btn-custom-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

