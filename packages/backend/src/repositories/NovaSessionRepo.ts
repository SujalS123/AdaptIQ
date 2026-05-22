import { INovaMessage } from '@adaptiq/shared';

export interface INovaSession {
  sessionId: string;
  studentId: string;
  messages: INovaMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const mockSessions: Map<string, INovaSession> = new Map([
  [
    'session-1',
    {
      sessionId: 'session-1',
      studentId: 'student-priya',
      messages: [
        {
          role: 'assistant',
          content: "Namaste! I'm Nova, your personal learning guide. I've synced with Professor Sharma's DBMS course slides and your target exam roadmap. What are we exploring today?",
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
]);

export class NovaSessionRepo {
  async findBySessionId(sessionId: string): Promise<INovaSession | null> {
    return mockSessions.get(sessionId) || null;
  }

  async findByStudentId(studentId: string): Promise<INovaSession[]> {
    return Array.from(mockSessions.values()).filter(s => s.studentId === studentId);
  }

  async save(session: INovaSession): Promise<INovaSession> {
    mockSessions.set(session.sessionId, session);
    return session;
  }
}
