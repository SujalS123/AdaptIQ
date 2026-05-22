import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/student/Dashboard.tsx';
import QuizPage from './pages/student/QuizPage.tsx';
import Progress from './pages/student/Progress.tsx';
import StudyPlan from './pages/student/StudyPlan.tsx';
import InterviewCoach from './pages/student/InterviewCoach.tsx';
import CourseDetail from './pages/student/CourseDetail.tsx';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/plan" element={<StudyPlan />} />
        <Route path="/interview" element={<InterviewCoach />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
