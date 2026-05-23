export interface IRiskTelemetry {
  studentId: string;
  riskScore: number; // 0.0 to 1.0
  primaryRiskFactor: 'performance_drop' | 'engagement_decay' | 'burnout_signs' | 'late_submissions' | 'none';
  shapContribution: {
    quizScoreSlope: number;
    sessionFrequencyDelta: number;
    lateNightStudyRatio: number;
    completionRateDelta: number;
  };
  lastCalculated: Date;
}

export interface IRiskEvent {
  _id?: string;
  studentId: string;
  riskScore: number;
  riskFactor: string;
  teacherNotified: boolean;
  acknowledgedByTeacher: boolean;
  teacherActionTaken?: string;
  createdAt: Date;
}
