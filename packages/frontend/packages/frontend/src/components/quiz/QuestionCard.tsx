import React from 'react';
import { Card } from '../ui/Card.tsx';

interface Question {
  id: string;
  conceptId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanationText: string;
}

interface QuestionCardProps {
  question: Question;
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  onSelectOption,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '16.5px', lineHeight: '1.5', fontWeight: 500 }}>
        {question.questionText}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {question.options.map((opt, i) => {
          const isSelected = selectedOption === i;
          return (
            <Card
              key={i}
              onClick={() => onSelectOption(i)}
              style={{
                padding: '16px 20px',
                cursor: 'pointer',
                backgroundColor: isSelected ? 'var(--color-primary-glow)' : 'var(--bg-secondary)',
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-color)',
                borderWidth: isSelected ? '2px' : '1px',
                transition: 'all 0.2s ease',
              }}
              className="animate-scale-up"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-color)',
                    backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--bg-primary)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isSelected ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
                <span style={{ fontSize: '14px', fontWeight: isSelected ? 500 : 400 }}>{opt}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
