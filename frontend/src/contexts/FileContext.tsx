import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { files } from '../lib/api';

export interface File {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

interface FileContextType {
  files: File[];
  currentFile: File | null;
  loading: boolean;
  setFiles: (files: File[]) => void;
  setCurrentFile: (file: File | null) => void;
  createFile: (projectId: string, data: { name: string; content: string; language: string; path: string }) => Promise<File>;
  updateFile: (id: string, content: string) => Promise<File>;
  deleteFile: (id: string) => Promise<void>;
  fetchFiles: (projectId: string) => Promise<void>;
  createFolder: (path: string) => Promise<void>;
  deleteFolder: (path: string) => Promise<void>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function useFiles() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
}

interface FileProviderProps {
  children: ReactNode;
}

export function FileProvider({ children }: FileProviderProps) {
  const [filesList, setFiles] = useState<File[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFiles = useCallback(async (projectId: string) => {
    try {
      setLoading(true);
      const response = await files.list(projectId);
      setFiles(response.data);
    } catch (error) {
      toast.error('Failed to fetch files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFile = useCallback(async (projectId: string, data: { name: string; content: string; language: string; path: string }) => {
    try {
      const response = await files.create(projectId, data);
      setFiles(prev => [...prev, response.data]);
      toast.success('File created successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to create file');
      throw error;
    }
  }, []);

  const updateFile = useCallback(async (fileId: string, content: string) => {
    try {
      const response = await files.update(fileId, { content });
      setFiles(prev => prev.map(f => f.id === fileId ? response.data : f));
      if (currentFile?.id === fileId) {
        setCurrentFile(response.data);
      }
      return response.data;
    } catch (error) {
      toast.error('Failed to update file');
      throw error;
    }
  }, [currentFile]);

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      await files.delete(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      if (currentFile?.id === fileId) {
        setCurrentFile(null);
      }
      toast.success('File deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete file');
      throw error;
    }
  }, [currentFile]);

  const value = {
    files: filesList,
    currentFile,
    loading,
    setFiles,
    setCurrentFile,
    createFile,
    updateFile,
    deleteFile,
    fetchFiles,
    createFolder: async () => {},
    deleteFolder: async () => {},
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
}
