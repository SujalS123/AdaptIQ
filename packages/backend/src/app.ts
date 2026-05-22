import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import studentRoutes from './routes/student';
import quizRoutes from './routes/quiz';
import planRoutes from './routes/plan';
import novaRoutes from './routes/nova';
import uploadRoutes from './routes/upload';

const app = express();

app.use(cors());
app.use(express.json());

// API Base Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/nova', novaRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

export default app;
export { app };
