import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Code2, Plus, FolderGit2, Clock, Users, Share2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const navigate = useNavigate();

  const isLoading = projectsLoading || !user;

  // Separate owned and shared projects
  const ownedProjects = projects.filter(project => project.ownerId === user?.id);
  const sharedProjects = projects.filter(project => project.ownerId !== user?.id);

  const ProjectCard = ({ project }: { project: any }) => (
    <Link
      key={project.id}
      to={`/projects/${project.id}`}
      className="group rounded-lg border p-6 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{project.name}</h3>
        <div className="flex items-center gap-2">
          {project.ownerId !== user?.id && (
            <Share2 className="h-4 w-4 text-muted-foreground" />
          )}
          <FolderGit2 className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {project.description}
      </p>
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{project.members.length} members</span>
        </div>
      </div>
    </Link>
  );

  const ProjectGrid = ({ projects }: { projects: any[] }) => (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );

  const EmptyState = ({ type }: { type: 'owned' | 'shared' }) => (
    <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <FolderGit2 className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="mb-2 text-lg font-semibold">
        {type === 'owned' ? 'No projects yet' : 'No shared projects'}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {type === 'owned' 
          ? 'Create your first project to get started'
          : 'Projects shared with you will appear here'
        }
      </p>
      {type === 'owned' && (
        <Button onClick={() => navigate('/projects/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6" />
            <span className="text-xl font-bold">Cloud IDE</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
              <p className="text-muted-foreground">
                Manage your projects and start coding
              </p>
            </div>
            <Button onClick={() => navigate('/projects/create')}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>

            {isLoading ? (
              // Loading skeleton
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-lg border bg-muted"
                />
              ))}
              </div>
            ) : (
            <Tabs defaultValue="owned" className="mt-8">
              <TabsList>
                <TabsTrigger value="owned">
                  My Projects ({ownedProjects.length})
                </TabsTrigger>
                <TabsTrigger value="shared">
                  Shared with me ({sharedProjects.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="owned">
                {ownedProjects.length === 0 ? (
                  <EmptyState type="owned" />
                ) : (
                  <ProjectGrid projects={ownedProjects} />
                )}
              </TabsContent>
              <TabsContent value="shared">
                {sharedProjects.length === 0 ? (
                  <EmptyState type="shared" />
                ) : (
                  <ProjectGrid projects={sharedProjects} />
                )}
              </TabsContent>
            </Tabs>
            )}
        </div>
      </main>
    </div>
  );
} 