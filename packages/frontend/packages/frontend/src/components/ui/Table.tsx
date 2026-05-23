import React from 'react';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Table: React.FC<TableProps> = ({ headers, children, style }) => (
  <div
    style={{
      width: '100%',
      overflowX: 'auto',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-card)',
      backdropFilter: 'blur(var(--glass-blur))',
      ...style,
    }}
  >
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13.5px',
      }}
    >
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th
              key={i}
              style={{
                padding: '14px 16px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '11.5px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border-color)',
                whiteSpace: 'nowrap',
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

interface TableRowProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const TableRow: React.FC<TableRowProps> = ({ children, style }) => (
  <tr
    style={{
      borderBottom: '1px solid var(--border-color)',
      transition: 'background 0.15s ease',
      ...style,
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    {children}
  </tr>
);

interface TableCellProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const TableCell: React.FC<TableCellProps> = ({ children, style }) => (
  <td
    style={{
      padding: '12px 16px',
      color: 'var(--text-primary)',
      verticalAlign: 'middle',
      ...style,
    }}
  >
    {children}
  </td>
);
