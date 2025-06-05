import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext';
import { Button } from '../components/ui/button';

export default function CreateProject() {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="auth-label">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="auth-input"
              placeholder="Enter project name"
              required
            />
          </div>
          <div>
            <label className="auth-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="auth-input min-h-[100px]"
              placeholder="Enter project description"
              required
            />
          </div>
          <Button type="submit" className="w-full rounded-button">
            Create Project
          </Button>
        </form>
      </div>
    </div>
  );
}
