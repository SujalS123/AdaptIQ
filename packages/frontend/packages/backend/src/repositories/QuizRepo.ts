import { QuizModel, IQuiz } from '@adaptiq/shared';
import mongoose from 'mongoose';

const mockQuizzes: Map<string, IQuiz> = new Map([
  [
    'quiz-dbms-normalization',
    {
      _id: 'quiz-dbms-normalization',
      title: 'Adaptive DBMS Normalization Check',
      conceptIds: ['normalization-1nf-2nf', 'normalization-3nf-bcnf', 'db-keys'],
      isAdaptive: true,
      questions: [
        {
          id: 'q1',
          conceptId: 'db-keys',
          questionText: 'Which of the following is a minimal superkey?',
          options: ['Candidate Key', 'Primary Key', 'Foreign Key', 'Alternate Key'],
          correctOptionIndex: 0,
          explanationText: 'By definition, a candidate key is a minimal superkey.',
          discriminationA: 1.2,
          difficultyB: -1.0, // Easy
          guessingC: 0.25,
        },
        {
          id: 'q2',
          conceptId: 'normalization-1nf-2nf',
          questionText: 'Which normal form is concerned with eliminating partial functional dependencies?',
          options: ['First Normal Form', 'Second Normal Form', 'Third Normal Form', 'Boyce-Codd Normal Form'],
          correctOptionIndex: 1,
          explanationText: 'Second normal form eliminates partial dependencies where non-prime attributes depend on parts of a composite primary key.',
          discriminationA: 1.4,
          difficultyB: 0.0, // Medium
          guessingC: 0.25,
        },
        {
          id: 'q3',
          conceptId: 'normalization-3nf-bcnf',
          questionText: 'If a relation is in BCNF, what must be true for every functional dependency X ➡️ Y?',
          options: ['X is a superkey', 'Y is a prime attribute', 'X is a primary key', 'Y depends on a candidate key'],
          correctOptionIndex: 0,
          explanationText: 'For a relation to be in BCNF, for every functional dependency X ➡️ Y, X must be a superkey.',
          discriminationA: 1.8,
          difficultyB: 1.2, // Hard
          guessingC: 0.25,
        },
        {
          id: 'q4',
          conceptId: 'normalization-3nf-bcnf',
          questionText: 'Which of the following decomposition strategies is guaranteed to be dependency-preserving and lossless for any 3NF schema?',
          options: [
            '3NF Synthesis Algorithm',
            'BCNF Decomposition',
            '4NF Join Projection',
            'None of the above'
          ],
          correctOptionIndex: 0,
          explanationText: 'The 3NF synthesis algorithm guarantees dependency preservation and lossless-join decomposition, which is not always possible for BCNF.',
          discriminationA: 1.5,
          difficultyB: 1.6, // Very Hard
          guessingC: 0.25,
        }
      ]
    }
  ]
]);

export class QuizRepo {
  private isOnline(): boolean {
    return mongoose.connection.readyState === 1;
  }

  async findById(id: string): Promise<IQuiz | null> {
    if (this.isOnline() && mongoose.Types.ObjectId.isValid(id)) {
      return (await QuizModel.findById(id).lean()) as any;
    }
    return mockQuizzes.get(id) || null;
  }

  async findByConceptIds(conceptIds: string[]): Promise<IQuiz | null> {
    if (this.isOnline()) {
      return (await QuizModel.findOne({ conceptIds: { $in: conceptIds } }).lean()) as any;
    }
    for (const q of mockQuizzes.values()) {
      if (q.conceptIds.some(cid => conceptIds.includes(cid))) {
        return q;
      }
    }
    return Array.from(mockQuizzes.values())[0] || null;
  }

  async create(quizData: IQuiz): Promise<IQuiz> {
    if (this.isOnline()) {
      const doc = new QuizModel(quizData);
      const saved = await doc.save();
      return saved.toObject() as any;
    }
    const newId = quizData._id || `quiz-${Date.now()}`;
    const newQuiz = { ...quizData, _id: newId, createdAt: new Date(), updatedAt: new Date() };
    mockQuizzes.set(newId, newQuiz);
    return newQuiz;
  }
}
