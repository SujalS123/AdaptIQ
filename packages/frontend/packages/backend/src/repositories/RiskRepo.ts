export interface IRiskRecord {
  studentId: string;
  riskScore: number;
  factors: string[];
  shapValues: Record<string, number>;
  updatedAt: Date;
}

const mockRisks: Map<string, IRiskRecord> = new Map([
  [
    'student-priya',
    {
      studentId: 'student-priya',
      riskScore: 0.15,
      factors: ['Quiz performance degradation in BCNF', 'Study session interval increase by 2 days'],
      shapValues: {
        'quiz_performance': -0.05,
        'attention_span': -0.02,
        'login_frequency': 0.1,
      },
      updatedAt: new Date()
    }
  ]
]);

export class RiskRepo {
  async findByStudentId(studentId: string): Promise<IRiskRecord | null> {
    return mockRisks.get(studentId) || null;
  }

  async save(record: IRiskRecord): Promise<IRiskRecord> {
    mockRisks.set(record.studentId, record);
    return record;
  }
}
