import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { projects } from '../lib/api';
import { useAuth } from './AuthContext';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  members: any[];
}

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  createProject: (data: { name: string; description: string }) => Promise<void>;
  updateProject: (id: string, data: { name: string; description: string }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addMember: (projectId: string, userId: string) => Promise<void>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [projectsList, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  // Only fetch projects when user is authenticated
  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      // Clear projects when user logs out
      setProjects([]);
    }
  }, [user]); // Depend on user instead of running on mount

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projects.list();
      setProjects(response.data);
    } catch (error: any) {
      // Only show error toast if we're still authenticated
      if (user) {
        toast.error('Failed to fetch projects');
      }
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (data: { name: string; description: string }) => {
    try {
      const response = await projects.create(data);
      // After creating, fetch the full list to ensure consistency
      await fetchProjects();
      toast.success('Project created successfully!');
    } catch (error) {
      toast.error('Failed to create project');
      throw error;
    }
  };

  const updateProject = async (id: string, data: { name: string; description: string }) => {
    try {
      const response = await projects.update(id, data);
      setProjects(projectsList.map(p => p.id === id ? response.data : p));
      toast.success('Project updated successfully!');
    } catch (error) {
      toast.error('Failed to update project');
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projects.delete(id);
      setProjects(projectsList.filter(p => p.id !== id));
      toast.success('Project deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete project');
      throw error;
    }
  };

  const addMember = async (projectId: string, userId: string) => {
    try {
      await projects.addMember(projectId, userId);
      toast.success('Member added successfully!');
    } catch (error) {
      toast.error('Failed to add member');
      throw error;
    }
  };

  const removeMember = async (projectId: string, userId: string) => {
    try {
      await projects.removeMember(projectId, userId);
      toast.success('Member removed successfully!');
    } catch (error) {
      toast.error('Failed to remove member');
      throw error;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects: projectsList,
        loading,
        createProject,
        updateProject,
        deleteProject,
        addMember,
        removeMember,
        fetchProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
