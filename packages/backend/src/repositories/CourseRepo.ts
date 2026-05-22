import { CourseModel, ICourse } from '@adaptiq/shared';
import mongoose from 'mongoose';

const mockCourses: Map<string, ICourse> = new Map([
  [
    'course-dbms',
    {
      _id: 'course-dbms',
      title: "Professor Sharma's Introduction to Database Systems",
      subject: 'DBMS',
      domain: 'college',
      examTags: ['GATE', 'Semester Exam'],
      createdBy: 'teacher-sharma' as any,
      modules: [
        {
          moduleId: 'module-1-keys',
          title: 'Database Keys and Integrity Constraints',
          sequenceOrder: 1,
          durationMinutes: 45,
          conceptsTaught: ['db-keys', 'candidate-keys'],
        },
        {
          moduleId: 'module-2-normalization',
          title: 'Normalization Theory: 1NF, 2NF, 3NF',
          sequenceOrder: 2,
          durationMinutes: 60,
          conceptsTaught: ['normalization-1nf-2nf', 'normalization-3nf-bcnf'],
        }
      ],
      knowledgeGraph: {
        concepts: [
          {
            id: 'db-keys',
            name: 'Primary, Candidate and Foreign Keys',
            prerequisites: [],
            bloomsLevel: 'understand',
          },
          {
            id: 'normalization-1nf-2nf',
            name: '1st and 2nd Normal Forms',
            prerequisites: ['db-keys'],
            bloomsLevel: 'apply',
          },
          {
            id: 'normalization-3nf-bcnf',
            name: '3rd Normal Form & Boyce-Codd Normal Form (BCNF)',
            prerequisites: ['normalization-1nf-2nf'],
            bloomsLevel: 'analyze',
          }
        ]
      },
      isPublished: true,
      enrollmentCount: 142,
      language: 'en',
    }
  ]
]);

export class CourseRepo {
  private isOnline(): boolean {
    return mongoose.connection.readyState === 1;
  }

  async findById(id: string): Promise<ICourse | null> {
    if (this.isOnline() && mongoose.Types.ObjectId.isValid(id)) {
      return (await CourseModel.findById(id).lean()) as any;
    }
    return mockCourses.get(id) || null;
  }

  async findAll(): Promise<ICourse[]> {
    if (this.isOnline()) {
      return (await CourseModel.find({ isPublished: true }).lean()) as any;
    }
    return Array.from(mockCourses.values());
  }

  async create(courseData: ICourse): Promise<ICourse> {
    if (this.isOnline()) {
      const doc = new CourseModel(courseData);
      const saved = await doc.save();
      return saved.toObject() as any;
    }
    const newId = courseData._id || `course-${Date.now()}`;
    const newCourse = { ...courseData, _id: newId, createdAt: new Date(), updatedAt: new Date() };
    mockCourses.set(newId, newCourse);
    return newCourse;
  }
}
