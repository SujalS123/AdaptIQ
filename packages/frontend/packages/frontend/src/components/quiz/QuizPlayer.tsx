import React, { useState } from 'react';
import { Card } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';
import { IRTProgressBar } from './IRTProgressBar.tsx';
import { QuestionCard } from './QuestionCard.tsx';
import { QuizResult } from './QuizResult.tsx';
import { AdaptiveFeedback } from './AdaptiveFeedback.tsx';

interface Question {
  id: string;
  conceptId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanationText: string;
  difficultyB: number;
}

const mockQuestions: Question[] = [
  {
    id: 'q1',
    conceptId: 'db-normal',
    questionText: 'Which of the following describes the key requirements of Second Normal Form (2NF) in databases?',
    options: [
      'It must be in 1NF and contain absolutely zero transitively dependent attributes.',
      'It must be in 1NF and all non-prime attributes must be fully functionally dependent on the primary key (no partial dependencies).',
      'All fields must contain atomic attributes with absolutely zero multi-valued columns.',
      'Every determinant attribute must be a super key within the relational context (BCNF).'
    ],
    correctOptionIndex: 1,
    explanationText: 'To be in 2NF, a relation must be in 1NF and remove any partial dependencies, meaning every non-prime attribute is fully dependent on the primary key.',
    difficultyB: 0.0,
  },
  {
    id: 'q2-hard',
    conceptId: 'db-normal',
    questionText: 'Suppose R(A, B, C, D, E) has FD set F = {A -> BC, CD -> E, B -> D, E -> A}. What is the highest normal form of this relation?',
    options: [
      'First Normal Form (1NF)',
      'Second Normal Form (2NF)',
      'Third Normal Form (3NF)',
      'Boyce-Codd Normal Form (BCNF)'
    ],
    correctOptionIndex: 2,
    explanationText: 'The candidate keys are A, E, BC, and CD. Since B -> D is a partial dependency (as B is part of a key and D is non-prime), the relation is in 2NF only.',
    difficultyB: 1.5,
  },
  {
    id: 'q2-easy',
    conceptId: 'db-normal',
    questionText: 'What basic structural issue does First Normal Form (1NF) primarily address?',
    options: [
      'Removing transitive functional dependencies.',
      'Ensuring columns contain only atomic (indivisible) values and removing multi-valued attributes.',
      'Establishing proper primary and foreign key constraints across multiple tables.',
      'Eliminating redundant joins and composite key mappings.'
    ],
    correctOptionIndex: 1,
    explanationText: '1NF specifies that domain values must be atomic (indivisible), which removes multi-valued or nested table attributes.',
    difficultyB: -1.2,
  },
];

export const QuizPlayer: React.FC = () => {
  const [theta, setTheta] = useState(0.0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [history, setHistory] = useState<Array<{ q: Question; correct: boolean; oldTheta: number; newTheta: number }>>([]);

  const currentQuestion = currentIdx === 0
    ? mockQuestions[0]
    : theta >= 0.5
      ? mockQuestions[1] // Give harder question if ability is high
      : mockQuestions[2]; // Give easier question if ability is low

  const handleSubmit = () => {
    if (selectedOpt === null) return;
    
    const isCorrect = selectedOpt === currentQuestion.correctOptionIndex;
    const oldTheta = theta;
    
    // Simulate MLE Psychometric Ability Calibration update formula
    const updateFactor = currentQuestion.difficultyB >= oldTheta ? 0.8 : 0.4;
    const newTheta = isCorrect
      ? oldTheta + updateFactor * (3.0 - oldTheta) * 0.35
      : oldTheta - updateFactor * (oldTheta + 3.0) * 0.35;
      
    const finalTheta = parseFloat(Math.max(-3.0, Math.min(3.0, newTheta)).toFixed(2));
    
    setHistory(prev => [...prev, { q: currentQuestion, correct: isCorrect, oldTheta, newTheta: finalTheta }]);
    setTheta(finalTheta);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    setSelectedOpt(null);
    if (currentIdx >= 1) {
      setQuizComplete(true);
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  if (quizComplete) {
    return <QuizResult history={history} theta={theta} />;
  }

  return (
    <Card className="animate-scale-up" style={{ maxWidth: '720px', margin: '40px auto' }}>
      <h2 style={{ marginBottom: '8px' }}>Database Normalization Practice</h2>
      
      <IRTProgressBar
        theta={theta}
        questionIndex={currentIdx + 1}
        totalQuestions={2}
      />

      <div style={{ marginTop: '24px' }}>
        <QuestionCard
          question={currentQuestion}
          selectedOption={selectedOpt}
          onSelectOption={setSelectedOpt}
        />
      </div>

      {showExplanation && (
        <div style={{ marginTop: '20px' }}>
          <AdaptiveFeedback
            isCorrect={selectedOpt === currentQuestion.correctOptionIndex}
            explanation={currentQuestion.explanationText}
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        {!showExplanation ? (
          <Button variant="primary" onClick={handleSubmit} disabled={selectedOpt === null}>
            Submit Answer
          </Button>
        ) : (
          <Button variant="secondary" onClick={handleNext}>
            {currentIdx >= 1 ? 'Finish Quiz' : 'Next Question ➡️'}
          </Button>
        )}
      </div>
    </Card>
  );
};
