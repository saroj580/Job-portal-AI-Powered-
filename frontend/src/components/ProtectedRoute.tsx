import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface Props {
  children: ReactNode;
  role?: User['role'];
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}