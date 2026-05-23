export interface IKnowledgeConcept {
  id: string;
  name: string;
  prerequisites: string[]; // dependent concept IDs
  bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
}

export interface ICourseModule {
  moduleId: string;
  title: string;
  sequenceOrder: number;
  contentUrl?: string; // S3 storage link
  durationMinutes: number;
  conceptsTaught: string[];
  notesContent?: string; // Pasted faculty notes content
}

export interface ICourse {
  _id?: string;
  title: string;
  subject: string;
  domain: 'school' | 'college' | 'competitive' | 'career';
  examTags: string[]; // e.g. ["JEE", "GATE"]
  institutionId?: string; // Reference to school/college context
  createdBy: string; // Teacher User ID
  modules: ICourseModule[];
  knowledgeGraph: {
    concepts: IKnowledgeConcept[];
  };
  isPublished: boolean;
  enrollmentCount: number;
  language: string;
  enrolledStudents?: string[]; // Array of student User IDs enrolled
  createdAt?: Date;
}
