import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import UserDashboard from './pages/UserDashboard';
import ResumeUpload from './pages/ResumeUpload';
import ResumeAnalysis from './pages/ResumeAnalysis';
import RecruiterDashboard from './pages/RecruiterDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/"         element={<Navigate to="/jobs" replace />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs"     element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />

            <Route path="/dashboard" element={
              <ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>
            } />
            <Route path="/resume/upload" element={
              <ProtectedRoute role="user"><ResumeUpload /></ProtectedRoute>
            } />
            <Route path="/resume/analysis" element={
              <ProtectedRoute role="user"><ResumeAnalysis /></ProtectedRoute>
            } />
            <Route path="/recruiter" element={
              <ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}