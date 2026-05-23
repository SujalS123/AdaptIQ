import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/student/Dashboard.tsx';
import QuizPage from './pages/student/QuizPage.tsx';
import Progress from './pages/student/Progress.tsx';
import StudyPlan from './pages/student/StudyPlan.tsx';
import InterviewCoach from './pages/student/InterviewCoach.tsx';
import CourseDetail from './pages/student/CourseDetail.tsx';
import MainLayout from './components/layout/MainLayout.tsx';
import AuthLayout from './components/layout/AuthLayout.tsx';
import Login from './pages/auth/Login.tsx';
import Register from './pages/auth/Register.tsx';
import ForgotPassword from './pages/auth/ForgotPassword.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import ProtectedRoute from './components/layout/ProtectedRoute.tsx';

// Teacher Imports
import TeacherLayout from './components/layout/TeacherLayout.tsx';
import ClassDashboard from './pages/teacher/ClassDashboard.tsx';
import AlertsPanel from './pages/teacher/AlertsPanel.tsx';
import StudentDetail from './pages/teacher/StudentDetail.tsx';
import AssignmentBuilder from './pages/teacher/AssignmentBuilder.tsx';
import QuizGenerator from './pages/teacher/QuizGenerator.tsx';
import ContentUpload from './pages/teacher/ContentUpload.tsx';

// Admin Imports
import AdminLayout from './components/layout/AdminLayout.tsx';
import PlatformAnalytics from './pages/admin/PlatformAnalytics.tsx';
import UserManagement from './pages/admin/UserManagement.tsx';
import InstitutionManagement from './pages/admin/InstitutionManagement.tsx';

import './styles/globals.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* STUDENT ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/plan" element={<StudyPlan />} />
              <Route path="/interview" element={<InterviewCoach />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
            </Route>
          </Route>

          {/* TEACHER ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route index element={<ClassDashboard />} />
              <Route path="students" element={<StudentDetail />} />
              <Route path="alerts" element={<AlertsPanel />} />
              <Route path="assignments" element={<AssignmentBuilder />} />
              <Route path="quiz" element={<QuizGenerator />} />
              <Route path="upload" element={<ContentUpload />} />
            </Route>
          </Route>

          {/* ADMIN ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<PlatformAnalytics />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="institution" element={<InstitutionManagement />} />
              <Route path="infrastructure" element={<PlatformAnalytics />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
