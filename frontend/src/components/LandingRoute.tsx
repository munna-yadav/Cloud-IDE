import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LandingRouteProps {
  children: React.ReactNode;
}

export default function LandingRoute({ children }: LandingRouteProps) {
  const { user, loading } = useAuth();

  // Show a loading indicator while checking auth status
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show the landing page
  return <>{children}</>;
} 