import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary' | 'accent' | 'secondary' | 'muted';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

const variantMap: Record<string, { bg: string; color: string; border: string }> = {
  default: { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: 'var(--border-color)' },
  success: { bg: 'hsla(174, 86%, 45%, 0.15)', color: 'var(--color-secondary)', border: 'hsla(174, 86%, 45%, 0.3)' },
  warning: { bg: 'hsla(45, 93%, 47%, 0.15)', color: 'var(--color-warning)', border: 'hsla(45, 93%, 47%, 0.3)' },
  danger: { bg: 'hsla(354, 70%, 54%, 0.15)', color: 'var(--color-danger)', border: 'hsla(354, 70%, 54%, 0.3)' },
  primary: { bg: 'var(--color-primary-glow)', color: 'var(--color-primary)', border: 'hsla(250, 89%, 65%, 0.3)' },
  accent: { bg: 'var(--color-accent-glow)', color: 'var(--color-accent)', border: 'hsla(322, 85%, 58%, 0.3)' },
  secondary: { bg: 'var(--color-secondary-glow)', color: 'var(--color-secondary)', border: 'hsla(174, 86%, 45%, 0.3)' },
  muted: { bg: 'hsla(215, 15%, 45%, 0.15)', color: 'var(--text-muted)', border: 'hsla(215, 15%, 45%, 0.3)' },
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'sm', style }) => {
  const v = variantMap[variant] || variantMap.default;
  const sizeStyles = size === 'sm'
    ? { padding: '2px 8px', fontSize: '11px' }
    : { padding: '4px 12px', fontSize: '12.5px' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        borderRadius: '9999px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap' as const,
        backgroundColor: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        ...sizeStyles,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
