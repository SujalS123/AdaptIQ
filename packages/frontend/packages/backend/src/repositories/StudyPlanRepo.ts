export interface IStudyPlanItem {
  id: string;
  date: string;
  subject: string;
  topic: string;
  type: 'new_content' | 'revision' | 'mock_test';
  time: string;
  box: number;
  completed: boolean;
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
        { id: '1', date: 'Today', subject: 'DBMS', topic: 'BCNF vs 3NF Decomposition', type: 'revision', time: '9 PM - 11 PM', box: 2, completed: false },
        { id: '2', date: 'Tomorrow', subject: 'DBMS', topic: 'Practice Quiz on Normal Forms', type: 'new_content', time: '9 PM - 10 PM', box: 1, completed: false },
        { id: '3', date: 'May 24', subject: 'Algorithms', topic: 'Dynamic Programming Spacing Grid', type: 'revision', time: '8 PM - 10 PM', box: 3, completed: false },
        { id: '4', date: 'May 25', subject: 'DBMS', topic: 'Transitive Functional Dependencies review', type: 'revision', time: '7 PM - 8 PM', box: 2, completed: false },
        { id: '5', date: 'May 26', subject: 'GATE Prep', topic: 'Mock Test on Relational Algebra', type: 'mock_test', time: '8 PM - 11 PM', box: 4, completed: false },
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
