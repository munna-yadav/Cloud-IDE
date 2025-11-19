import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext';
import { useFiles } from '../contexts/FileContext';
import { useAuth } from '../contexts/AuthContext';
import { projects as projectsApi } from '../lib/api';
import { CodeEditor, type CursorPosition } from '../components/CodeEditor';
import { CodeRunner } from '../components/CodeRunner';
import { ResizablePanel } from '../components/ResizablePanel';
import { FileExplorer } from '../components/FileExplorer';
import { FileTabs } from '../components/FileTabs';
import { ProjectMembers } from '../components/ProjectMembers';
import { Button } from '../components/ui/button';
import { Settings, Share, ChevronLeft, ChevronRight } from 'lucide-react';
import { socketClient, type CursorUpdatePayload } from '../lib/socket';

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

interface RemoteCursorState {
  cursor: {
    lineNumber: number;
    column: number;
  };
  updatedAt: number;
}

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const { files, currentFile, setCurrentFile, setFiles, createFile, updateFile, deleteFile, fetchFiles } = useFiles();
  const { projects, addMember, removeMember } = useProjects();
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [fetching, setFetching] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openFiles, setOpenFiles] = useState<File[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursorState>>({});

  const saveTimeoutRef = useRef<number | null>(null);
  const latestFileIdRef = useRef<string | null>(null);
  const latestContentRef = useRef('');
  const lastPersistedContentRef = useRef('');
  const cursorThrottleRef = useRef<number | null>(null);
  const pendingCursorRef = useRef<CursorPosition | null>(null);

  const persistLatestContent = useCallback(async () => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    if (!latestFileIdRef.current) {
      return;
    }

    if (latestContentRef.current === lastPersistedContentRef.current) {
      return;
    }

    try {
      await updateFile(latestFileIdRef.current, latestContentRef.current);
      lastPersistedContentRef.current = latestContentRef.current;
    } catch (error) {
      console.error('Failed to persist file:', error);
    }
  }, [updateFile]);

  useEffect(() => {
    latestFileIdRef.current = currentFile?.id ?? null;
    latestContentRef.current = currentFile?.content ?? '';
    lastPersistedContentRef.current = currentFile?.content ?? '';
  }, [currentFile]);

  useEffect(() => {
    return () => {
      void persistLatestContent();
    };
  }, [persistLatestContent]);

  useEffect(() => {
    setRemoteCursors({});
  }, [projectId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemoteCursors(prev => {
        const now = Date.now();
        const entries = Object.entries(prev).filter(([, value]) => now - value.updatedAt < 15000);
        if (entries.length === Object.keys(prev).length) {
          return prev;
        }
        return Object.fromEntries(entries);
      });
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  // Load open files from localStorage
  useEffect(() => {
    if (!projectId || files.length === 0) return;
    
    const savedOpenFiles = localStorage.getItem(`project_${projectId}_open_files`);
    if (savedOpenFiles) {
      try {
        const parsedOpenFiles = JSON.parse(savedOpenFiles);
        const validFiles = parsedOpenFiles.filter((savedFile: File) =>
          files.some(file => file.id === savedFile.id)
        );
        setOpenFiles(validFiles);
        // Only set current file if there's no current file and we have valid saved files
        if (validFiles.length > 0 && !currentFile) {
          setCurrentFile(validFiles[0]);
        }
      } catch (error) {
        console.error('Failed to parse saved open files:', error);
      }
    }
  }, [projectId, files]); // Removed currentFile and setCurrentFile from dependencies

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

  useEffect(() => {
    if (!projectId) return;

    socketClient.joinProject(projectId);

    const unsubscribeCode = socketClient.onCodeUpdate(({ fileId, content }) => {
      setFiles(prev =>
        prev.map(file => (file.id === fileId ? { ...file, content } : file))
      );

      setCurrentFile(prev =>
        prev && prev.id === fileId ? { ...prev, content } : prev
      );

      if (latestFileIdRef.current === fileId) {
        latestContentRef.current = content;
        lastPersistedContentRef.current = content;
      }
    });

    const unsubscribeCursor = socketClient.onCursorUpdate((payload: CursorUpdatePayload) => {
      if (payload.userId === user?.id) {
        return;
      }

      setRemoteCursors(prev => ({
        ...prev,
        [payload.userId]: {
          cursor: payload.cursor,
          updatedAt: Date.now(),
        },
      }));
    });

    return () => {
      unsubscribeCode();
      unsubscribeCursor();
      socketClient.leaveProject(projectId);
    };
  }, [projectId, setFiles, setCurrentFile, user?.id]);

  const handleFileSelect = (file: File) => {
    // Always set the current file first
    setCurrentFile(file);
    
    // Add to open files if not already present
    setOpenFiles(prev => {
      if (!prev.some(f => f.id === file.id)) {
        return [...prev, file];
      }
      return prev;
    });
  };

  const handleFileClose = (file: File) => {
    setOpenFiles(prev => prev.filter(f => f.id !== file.id));
    if (currentFile?.id === file.id) {
      const newOpenFiles = openFiles.filter(f => f.id !== file.id);
      setCurrentFile(newOpenFiles[newOpenFiles.length - 1] || null);
    }
  };

  const handleFileContentChange = useCallback((content: string) => {
    if (!currentFile || !projectId) return;

    latestFileIdRef.current = currentFile.id;
    latestContentRef.current = content;

    setFiles(prev =>
      prev.map(file => (file.id === currentFile.id ? { ...file, content } : file))
    );

    setCurrentFile(prev =>
      prev && prev.id === currentFile.id ? { ...prev, content } : prev
    );

    socketClient.emitCodeChange({
      projectId,
      fileId: currentFile.id,
      content,
    });

    if (latestContentRef.current === lastPersistedContentRef.current) {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      return;
    }

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      void persistLatestContent();
    }, 1500);
  }, [currentFile, projectId, setFiles, setCurrentFile, persistLatestContent]);

  const handleCursorChange = useCallback((cursor: CursorPosition) => {
    if (!projectId || !user?.id) {
      return;
    }

    pendingCursorRef.current = cursor;

    if (cursorThrottleRef.current) {
      return;
    }

    cursorThrottleRef.current = window.setTimeout(() => {
      cursorThrottleRef.current = null;
      if (!pendingCursorRef.current) {
        return;
      }

      socketClient.emitCursorMove({
        projectId,
        userId: user.id,
        cursor: pendingCursorRef.current,
      });

      pendingCursorRef.current = null;
    }, 120);
  }, [projectId, user?.id]);

  const handleEditorBlur = useCallback(() => {
    void persistLatestContent();
  }, [persistLatestContent]);

  useEffect(() => {
    return () => {
      if (cursorThrottleRef.current) {
        window.clearTimeout(cursorThrottleRef.current);
      }
    };
  }, []);

  const handleCreateFile = async (name: string, language: string, path: string) => {
    if (!projectId) return;
    try {
      const newFile = await createFile(projectId, {
        name,
        content: '',
        language,
        path
      });
      setCurrentFile(newFile);
      if (!openFiles.some(f => f.id === newFile.id)) {
        setOpenFiles(prev => [...prev, newFile]);
      }
    } catch (error) {
      console.error('Failed to create file:', error);
    }
  };

  const handleDeleteFile = async (file: File) => {
    try {
      await deleteFile(file.id);
      if (currentFile?.id === file.id) {
        const remainingOpenFiles = openFiles.filter(f => f.id !== file.id);
        setCurrentFile(remainingOpenFiles[remainingOpenFiles.length - 1] || null);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const handleAddMember = async (email: string) => {
    if (!projectId) return;
    try {
      await addMember(projectId, email);
    } catch (error) {
      console.error('Failed to add member:', error);
      throw error; // Re-throw to let the component handle the error display
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!projectId) return;
    try {
      await removeMember(projectId, userId);
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error; // Re-throw to let the component handle the error display
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

  const collaboratorBadges = Object.entries(remoteCursors)
    .filter(([userId]) => userId !== user.id)
    .map(([userId]) => {
      const member =
        project.members.find((m) => m.id === userId) ||
        (project.owner.id === userId ? project.owner : null);

      return {
        userId,
        name: member?.name || 'Collaborator',
      };
    });

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0d1117] to-[#161b22] text-white">
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
                onCreateFile={handleCreateFile}
                onCreateFolder={(_path) => {}}
                onDeleteFile={handleDeleteFile}
                onDeleteFolder={(_path) => {}}
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
            {collaboratorBadges.length > 0 && (
              <div className="flex items-center gap-1 mr-2">
                {collaboratorBadges.map(({ userId, name }) => (
                  <span
                    key={userId}
                    className="rounded-full bg-[#2d333b] px-2 py-0.5 text-xs text-gray-300"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
            <ProjectMembers
              members={project.members}
              owner={project.owner}
              currentUser={user}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
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
            <div className="h-full flex flex-col">
              {/* Check if it's a JavaScript or Java file to show code runner */}
              {(currentFile.language === 'javascript' || currentFile.language === 'java') ? (
                <ResizablePanel
                  direction="horizontal"
                  defaultSize={50}
                  minSize={30}
                  maxSize={70}
                  className="flex-1"
                >
                  {/* Editor Panel */}
                  <div className="h-full overflow-hidden">
                    <CodeEditor
                      value={currentFile.content}
                      language={currentFile.language}
                      onChange={handleFileContentChange}
                    onCursorChange={handleCursorChange}
                    onBlur={handleEditorBlur}
                    />
                  </div>

                  {/* Code Runner Panel */}
                  <div className="h-full border-l border-[#30363d]">
                    <CodeRunner
                      code={currentFile.content}
                      language={currentFile.language}
                      className="h-full"
                    />
                  </div>
                </ResizablePanel>
              ) : (
                <CodeEditor
                  value={currentFile.content}
                  language={currentFile.language}
                  onChange={handleFileContentChange}
                  onCursorChange={handleCursorChange}
                  onBlur={handleEditorBlur}
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md mx-auto">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Welcome to {project.name}</h3>
                <p className="text-gray-400 mb-6">Select a file from the explorer or create a new file to start coding.</p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span>💡</span>
                    <span>Tip: Use the file explorer to navigate your project</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
