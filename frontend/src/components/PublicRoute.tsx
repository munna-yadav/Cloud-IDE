import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Don't render anything while checking auth
  if (loading) {
    return null;
  }

  // If authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the public content
  return <>{children}</>;
}
