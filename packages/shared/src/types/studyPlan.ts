export interface ISessionSlot {
  subject: string;
  topic: string;
  durationMinutes: number;
  type: 'new_content' | 'revision' | 'mock_test';
}

export interface IDayPlan {
  date: Date;
  slots: ISessionSlot[];
}

export interface IStudyPlan {
  _id?: string;
  studentId: string;
  examGoalName: string;
  dayPlans: IDayPlan[];
  dynamicAdjustmentsLog: Array<{
    date: Date;
    reason: string;
    description: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}
