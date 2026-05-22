export interface IInterviewDialog {
  role: 'interviewer' | 'candidate';
  text: string;
  feedback?: {
    accuracyScore: number; // 0.0 to 1.0
    communicationScore: number; // 0.0 to 1.0
    evaluationText: string;
  };
}

export interface IInterviewSession {
  _id?: string;
  studentId: string;
  courseContextId?: string; // If course-specific Viva simulation
  topics: string[];
  roleplayType: 'technical_placement' | 'academic_viva';
  dialogs: IInterviewDialog[];
  overallEvaluation?: {
    technicalMasteryScore: number;
    communicationSkillsScore: number;
    recapStrengths: string[];
    recapGaps: string[];
  };
  createdAt: Date;
}
