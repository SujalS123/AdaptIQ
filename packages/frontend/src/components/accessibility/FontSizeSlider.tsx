import React, { useState } from 'react';

export const FontSizeSlider: React.FC = () => {
  const [size, setSize] = useState(100);
  const onChange = (val: number) => {
    setSize(val);
    document.documentElement.style.fontSize = `${16 * (val / 100)}px`;
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Font Adjustment ({size}%)</label>
      <input
        type="range"
        min="80"
        max="150"
        value={size}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
};
