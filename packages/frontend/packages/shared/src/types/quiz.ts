export interface IQuestion {
  id: string;
  conceptId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanationText: string;
  // 3-Parameter Logistic (3PL) Item Response Theory (IRT) parameters
  discriminationA: number; // a parameter (how well it separates high vs low ability) [0.5, 2.5]
  difficultyB: number;     // b parameter (ability level where correct probability is 50%) [-3, +3]
  guessingC: number;       // c parameter (guessing threshold) [0, 0.33]
}

export interface IQuiz {
  _id?: string;
  title: string;
  courseId?: string;
  conceptIds: string[];
  questions: IQuestion[];
  isAdaptive: boolean;
}

export interface IQuestionResponse {
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
  thetaBefore: number;
  thetaAfter: number;
}

export interface IQuizAttempt {
  _id?: string;
  studentId: string;
  quizId: string;
  courseId?: string;
  responses: IQuestionResponse[];
  finalScore: number;
  finalTheta: number; // ability estimate computed by psychometric mle solver
  completedAt: Date;
}
