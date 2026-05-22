export interface IStudyPlanItem {
  date: string;
  subject: string;
  topic: string;
  type: 'new_content' | 'revision' | 'mock_test';
  time: string;
}

export interface IStudyPlan {
  studentId: string;
  items: IStudyPlanItem[];
  rebalanceReason?: string;
  updatedAt: Date;
}

const mockPlans: Map<string, IStudyPlan> = new Map([
  [
    'student-priya',
    {
      studentId: 'student-priya',
      items: [
        { date: 'Today', subject: 'DBMS', topic: 'BCNF vs 3NF Decomposition', type: 'new_content', time: '9 PM - 11 PM' },
        { date: 'Tomorrow', subject: 'DBMS', topic: 'Practice Quiz on Normal Forms', type: 'revision', time: '9 PM - 10 PM' },
        { date: 'May 24', subject: 'GATE Prep', topic: 'Mock Test on Relational Algebra', type: 'mock_test', time: '8 PM - 11 PM' },
      ],
      rebalanceReason: "Nova detected a slight decay in your Database normalization quiz score last Tuesday. Tomorrow's session has been automatically rebalanced to add a 15-minute Leitner SRS review.",
      updatedAt: new Date()
    }
  ]
]);

export class StudyPlanRepo {
  async findByStudentId(studentId: string): Promise<IStudyPlan | null> {
    return mockPlans.get(studentId) || null;
  }

  async save(plan: IStudyPlan): Promise<IStudyPlan> {
    mockPlans.set(plan.studentId, plan);
    return plan;
  }
}
