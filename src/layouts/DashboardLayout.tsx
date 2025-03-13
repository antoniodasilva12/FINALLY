import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { UserRole } from '../services/supabase';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const location = useLocation();
  
  // Redirect if trying to access wrong dashboard
  const isAdminPath = location.pathname.startsWith('/admin');
  const isStudentPath = location.pathname.startsWith('/student');
  
  if (role === 'admin' && isStudentPath) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  if (role === 'student' && isAdminPath) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role={role} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout; 