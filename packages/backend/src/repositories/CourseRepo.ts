import { CourseModel, ICourse } from '@adaptiq/shared';
import mongoose from 'mongoose';
import { UserRepo } from './UserRepo';

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
      enrolledStudents: [],
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

  async joinCourse(courseId: string, studentId: string): Promise<boolean> {
    const userRepo = new UserRepo();
    const user = await userRepo.findById(studentId);
    if (!user) return false;

    if (this.isOnline() && mongoose.Types.ObjectId.isValid(courseId) && mongoose.Types.ObjectId.isValid(studentId)) {
      const course = await CourseModel.findById(courseId);
      if (!course) return false;

      const enrolled = course.enrolledStudents || [];
      if (!enrolled.map(id => id.toString()).includes(studentId)) {
        await CourseModel.findByIdAndUpdate(courseId, {
          $addToSet: { enrolledStudents: new mongoose.Types.ObjectId(studentId) },
          $inc: { enrollmentCount: 1 }
        });
      }

      const userEnrolled = user.enrolledCourses || [];
      if (!userEnrolled.includes(courseId)) {
        await userRepo.update(studentId, {
          enrolledCourses: [...userEnrolled, courseId]
        });
      }
      return true;
    }

    // Offline mock execution
    const course = mockCourses.get(courseId);
    if (!course) return false;

    if (!course.enrolledStudents) {
      course.enrolledStudents = [];
    }
    if (!course.enrolledStudents.includes(studentId)) {
      course.enrolledStudents.push(studentId);
      course.enrollmentCount = (course.enrollmentCount || 0) + 1;
    }

    const userEnrolled = user.enrolledCourses || [];
    if (!userEnrolled.includes(courseId)) {
      await userRepo.update(studentId, {
        enrolledCourses: [...userEnrolled, courseId]
      });
    }

    return true;
  }

  async updateModuleNotes(courseId: string, moduleId: string, notesContent: string): Promise<boolean> {
    if (this.isOnline() && mongoose.Types.ObjectId.isValid(courseId)) {
      const result = await CourseModel.updateOne(
        { _id: courseId, 'modules.moduleId': moduleId },
        { $set: { 'modules.$.notesContent': notesContent } }
      );
      return result.modifiedCount > 0;
    }

    // Offline mock execution
    const course = mockCourses.get(courseId);
    if (!course) return false;

    const mod = course.modules.find(m => m.moduleId === moduleId);
    if (!mod) return false;

    mod.notesContent = notesContent;
    return true;
  }

  async updateCourse(id: string, updateData: Partial<ICourse>): Promise<ICourse | null> {
    if (this.isOnline() && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await CourseModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).lean();
      return updated as any;
    }

    // Offline mock execution
    const course = mockCourses.get(id);
    if (!course) return null;

    const updated = {
      ...course,
      ...updateData,
      modules: updateData.modules ? updateData.modules : course.modules
    };
    mockCourses.set(id, updated);
    return updated;
  }
}

