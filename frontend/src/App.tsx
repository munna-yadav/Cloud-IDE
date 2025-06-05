import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { FileProvider } from './contexts/FileContext';
import './styles/globals.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';
import NotFound from './pages/NotFound';
import VerifyEmail from './pages/VerifyEmail';

// Components
import PrivateRoute from './components/PrivateRoute';
import LandingRoute from './components/LandingRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
      <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ProjectProvider>
            <FileProvider>
              <Toaster position="top-right" />
              <Routes>
                {/* Public routes */}
                <Route 
                  path="/"
                  element={
                    <LandingRoute>
                      <Landing />
                    </LandingRoute>
                  } 
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                
                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/projects/create"
                  element={
                    <PrivateRoute>
                      <CreateProject />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/projects/:projectId"
                  element={
                    <PrivateRoute>
                      <ProjectDetails />
                    </PrivateRoute>
                  }
                />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </FileProvider>
          </ProjectProvider>
        </AuthProvider>
      </BrowserRouter>
      </QueryClientProvider>
  );
}

export default App; 