// Simple memory repo for storing AI cognitive facts about student
export interface IMemorySlot {
  studentId: string;
  type: string;
  content: string;
  timestamp: Date;
}

const mockMemories: IMemorySlot[] = [
  { studentId: 'student-priya', type: 'preferred_style', content: 'Prefers explanations using analogies (especially cricket matches).', timestamp: new Date() },
  { studentId: 'student-priya', type: 'weak_concept', content: 'Struggled with Database 3NF decomposition last Tuesday.', timestamp: new Date() },
  { studentId: 'student-priya', type: 'personal_fact', content: 'Studies most productively during late evening (9 PM - 11 PM).', timestamp: new Date() }
];

export class MentorMemoryRepo {
  async getMemories(studentId: string): Promise<IMemorySlot[]> {
    return mockMemories.filter(m => m.studentId === studentId);
  }

  async addMemory(memory: IMemorySlot): Promise<IMemorySlot> {
    mockMemories.push(memory);
    return memory;
  }
}
