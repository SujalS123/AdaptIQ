export interface IExamGoal {
  examName: string;
  targetDate: Date;
  priority: number;
  coveragePercentage: number;
}

export interface IEnrolledCourse {
  courseId: string;
  institutionId?: string;
  subject: string;
  gradeLevel?: string;
  pineconeNamespace: string;
}

export interface IConceptMastery {
  conceptId: string;
  subject: string;
  domain: string;
  confidence: number; // 0.0 to 1.0
  lastTested?: Date;
  nextReviewDate?: Date;
}

export interface ILearnerDNA {
  studentId: string;
  mentorName: string; // Persistent named AI mentor selected at onboarding e.g. "Nova"
  learningModality: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  comprehensionSpeed: number; // median response/mastery rate
  attentionWindowMin: number; // duration of active session before decay
  bestStudyTime: string; // e.g. "21:00-23:00"
  examGoals: IExamGoal[];
  enrolledCourses: IEnrolledCourse[];
  masteryScores: IConceptMastery[];
  weakConcepts: string[]; // Automatically derived from masteryScores < 0.5
  xpPoints: number;
  level: number;
  streakDays: number;
  streakBest: number;
  badges: string[];
  thetaEstimate: number; // Psychometric IRT Global ability score (-3 to +3)
  preferredExplanationStyles: string[]; // e.g. ["analogies", "step-by-step", "visuals"]
  riskScore: number; // Dynamic XGBoost burnout/dropout threat (0.0 to 1.0)
  updatedAt?: Date;
}
