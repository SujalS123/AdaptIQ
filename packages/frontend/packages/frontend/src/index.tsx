import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Student pages
import Dashboard from './pages/student/Dashboard.tsx';
import QuizPage from './pages/student/QuizPage.tsx';
import Progress from './pages/student/Progress.tsx';
import StudyPlan from './pages/student/StudyPlan.tsx';
import InterviewCoach from './pages/student/InterviewCoach.tsx';
import CourseDetail from './pages/student/CourseDetail.tsx';
import CourseExplorer from './pages/student/CourseExplorer.tsx';
// Auth pages
import Login from './pages/auth/Login.tsx';
import Register from './pages/auth/Register.tsx';
import ForgotPassword from './pages/auth/ForgotPassword.tsx';
import Onboarding from './pages/auth/Onboarding.tsx';
// Teacher pages
import ClassDashboard from './pages/teacher/ClassDashboard.tsx';
import AlertsPanel from './pages/teacher/AlertsPanel.tsx';
import StudentDetail from './pages/teacher/StudentDetail.tsx';
import ContentUpload from './pages/teacher/ContentUpload.tsx';
import AssignmentBuilder from './pages/teacher/AssignmentBuilder.tsx';
import QuizGenerator from './pages/teacher/QuizGenerator.tsx';
import CourseBuilder from './pages/teacher/CourseBuilder.tsx';
// Admin pages
import UserManagement from './pages/admin/UserManagement.tsx';
import PlatformAnalytics from './pages/admin/PlatformAnalytics.tsx';
import InstitutionManagement from './pages/admin/InstitutionManagement.tsx';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* Student Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/plan" element={<StudyPlan />} />
        <Route path="/interview" element={<InterviewCoach />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path="/student/course/:courseId" element={<CourseDetail />} />
        <Route path="/courses/explorer" element={<CourseExplorer />} />
        
        {/* Teacher Routes */}
        <Route path="/teacher" element={<ClassDashboard />} />
        <Route path="/teacher/courses/new" element={<CourseBuilder />} />
        <Route path="/teacher/alerts" element={<AlertsPanel />} />
        <Route path="/teacher/student/:studentId" element={<StudentDetail />} />
        <Route path="/teacher/content" element={<ContentUpload />} />
        <Route path="/teacher/assignments" element={<AssignmentBuilder />} />
        <Route path="/teacher/quiz-generator" element={<QuizGenerator />} />
        
        {/* Admin Routes */}
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/analytics" element={<PlatformAnalytics />} />
        <Route path="/admin/institution" element={<InstitutionManagement />} />
        
        {/* Fallback */}
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
