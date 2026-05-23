import React from 'react';

interface AvatarProps {
  name: string;
  size?: number;
  style?: React.CSSProperties;
}

const COLORS = [
  'hsl(250, 89%, 65%)',
  'hsl(174, 86%, 45%)',
  'hsl(322, 85%, 58%)',
  'hsl(45, 93%, 47%)',
  'hsl(200, 80%, 55%)',
  'hsl(280, 70%, 60%)',
  'hsl(10, 80%, 58%)',
  'hsl(140, 60%, 45%)',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 36, style }) => {
  const color = COLORS[hashCode(name) % COLORS.length];
  const initials = getInitials(name);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color + '22',
        border: `2px solid ${color}55`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color,
        fontWeight: 700,
        fontSize: size * 0.38,
        flexShrink: 0,
        letterSpacing: '0.03em',
        ...style,
      }}
    >
      {initials}
    </div>
  );
};
