export interface INovaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  ragChunkIdsUsed?: string[];
}

export interface INovaSession {
  _id?: string;
  studentId: string;
  courseContextId?: string; // Enrolled Course ID if operating within RAG fusion context
  messages: INovaMessage[];
  sessionStart: Date;
  sessionEnd?: Date;
  topicsDiscussed: string[];
  studentSentiment?: 'positive' | 'neutral' | 'confused' | 'frustrated';
}

export interface IMentorMemory {
  _id?: string;
  studentId: string;
  sessionId?: string;
  memoryType: 'weak_concept' | 'preferred_style' | 'doubt_resolved' | 'exam_info' | 'personal_fact';
  content: string;
  conceptId?: string;
  importanceScore: number; // 0.0 to 1.0 (determines prompt retrieval hierarchy)
  isActive: boolean;
  createdAt: Date;
}
