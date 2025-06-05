import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext';
import { useFiles } from '../contexts/FileContext';
import { useAuth } from '../contexts/AuthContext';
import { projects as projectsApi } from '../lib/api';
import { CodeEditor } from '../components/CodeEditor';
import { ResizablePanel } from '../components/ResizablePanel';
import { FileExplorer } from '../components/FileExplorer';
import { FileTabs } from '../components/FileTabs';
import { ProjectMembers } from '../components/ProjectMembers';
import { Button } from '../components/ui/button';
import { Settings, Share, ChevronLeft, ChevronRight } from 'lucide-react';

import type { File } from '../contexts/FileContext';

interface ProjectWithDetails {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: { id: string; name: string; email: string };
  members: { id: string; name: string; email: string }[];
  files?: File[];
}

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const { files, currentFile, setCurrentFile, createFile, updateFile, deleteFile, fetchFiles } = useFiles();
  const { projects } = useProjects();
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [fetching, setFetching] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openFiles, setOpenFiles] = useState<File[]>([]);

  // Load open files from localStorage
  useEffect(() => {
    if (!projectId) return;
    const savedOpenFiles = localStorage.getItem(`project_${projectId}_open_files`);
    if (savedOpenFiles) {
      try {
        const parsedOpenFiles = JSON.parse(savedOpenFiles);
        const validFiles = parsedOpenFiles.filter((savedFile: File) =>
          files.some(file => file.id === savedFile.id)
        );
        setOpenFiles(validFiles);
        if (validFiles.length > 0 && !currentFile) {
          setCurrentFile(validFiles[0]);
        }
      } catch (error) {
        console.error('Failed to parse saved open files:', error);
      }
    }
  }, [projectId, files, currentFile, setCurrentFile]);

  // Save open files to localStorage
  useEffect(() => {
    if (!projectId) return;
    localStorage.setItem(`project_${projectId}_open_files`, JSON.stringify(openFiles));
  }, [projectId, openFiles]);

  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setFetching(true);
      const response = await projectsApi.get(projectId);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      setProject(null);
    } finally {
      setFetching(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    const dashboardProject = projects.find(p => p.id === projectId);
    if (dashboardProject) {
      setProject(prev => {
        if (!prev) return dashboardProject as ProjectWithDetails;
        return prev;
      });
    }

    Promise.all([
      fetchProjectDetails(),
      fetchFiles(projectId)
    ]).catch(console.error);
  }, [projectId, fetchProjectDetails, fetchFiles]);

  const handleFileSelect = (file: File) => {
    setCurrentFile(file);
    if (!openFiles.some(f => f.id === file.id)) {
      setOpenFiles(prev => [...prev, file]);
    }
  };

  const handleFileClose = (file: File) => {
    setOpenFiles(prev => prev.filter(f => f.id !== file.id));
    if (currentFile?.id === file.id) {
      const newOpenFiles = openFiles.filter(f => f.id !== file.id);
      setCurrentFile(newOpenFiles[newOpenFiles.length - 1] || null);
    }
  };

  const handleFileContentChange = async (content: string) => {
    if (!currentFile) return;
    try {
      await updateFile(currentFile.id, content);
    } catch (error) {
      console.error('Failed to update file:', error);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1e1e1e] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!project || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1e1e1e] text-white">
        Project not found
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white">
      {/* Sidebar */}
      <div className="flex h-full">
        {!isSidebarCollapsed && (
          <div className="w-64 h-full flex flex-col bg-[#23272e] border-r border-[#333]">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-3 border-b border-[#333]">
              <span className="font-medium text-white">Files</span>
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="flex h-6 w-6 items-center justify-center rounded hover:bg-[#3a3a3a] text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            {/* File Explorer */}
            <div className="flex-1 overflow-hidden">
              <FileExplorer
                files={files}
                currentFile={currentFile}
                onFileSelect={handleFileSelect}
                onCreateFile={(name, language, path) => {}}
                onCreateFolder={(path) => {}}
                onDeleteFile={(file) => {}}
                onDeleteFolder={(path) => {}}
              />
            </div>
          </div>
        )}
        
        {isSidebarCollapsed && (
          <div className="w-12 h-full flex flex-col bg-[#23272e] border-r border-[#333]">
            <div className="p-3 border-b border-[#333]">
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="flex h-6 w-6 items-center justify-center rounded hover:bg-[#3a3a3a] text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* File Tabs */}
        <div className="border-b border-[#333] bg-[#1e1e1e]">
          <FileTabs
            openFiles={openFiles}
            activeFile={currentFile}
            onSelectFile={setCurrentFile}
            onCloseFile={handleFileClose}
          />
        </div>

        {/* Top bar */}
        <div className="h-10 flex items-center justify-between px-4 border-b border-[#222] bg-[#23272e] flex-shrink-0">
          <span className="text-sm text-muted-foreground">
            {currentFile ? currentFile.path : 'No file selected'}
          </span>
          <div className="flex items-center gap-2">
            <ProjectMembers
              members={project.members}
              owner={project.owner}
              currentUser={user}
              onAddMember={async () => {}}
              onRemoveMember={async () => {}}
            />
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 bg-[#1e1e1e] overflow-hidden">
          {currentFile ? (
            <CodeEditor
              value={currentFile.content}
              language={currentFile.language}
              onChange={handleFileContentChange}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Select a file to edit or create a new file to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
