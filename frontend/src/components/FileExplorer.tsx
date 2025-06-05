import { useState } from 'react';
import { FileText, Folder, FolderOpen, ChevronRight, ChevronDown, Plus, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { File } from '../contexts/FileContext';

interface FolderType {
  name: string;
  path: string;
  items: (File | FolderType)[];
}

interface FileExplorerProps {
  files: File[];
  currentFile: File | null;
  onFileSelect: (file: File) => void;
  onCreateFile: (name: string, language: string, path: string) => void;
  onCreateFolder: (path: string) => void;
  onDeleteFile: (file: File) => void;
  onDeleteFolder: (path: string) => void;
}

export function FileExplorer({
  files,
  currentFile,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onDeleteFolder,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [newItemName, setNewItemName] = useState('');
  const [newItemPath, setNewItemPath] = useState('');
  const [newItemType, setNewItemType] = useState<'file' | 'folder' | null>(null);
  const [newFileLang, setNewFileLang] = useState('javascript');

  // Convert flat file list to tree structure
  const fileTree: FolderType = {
    name: 'root',
    path: '/',
    items: [],
  };

  files.forEach(file => {
    const parts = file.path.split('/').filter(Boolean);
    let current = fileTree;

    parts.slice(0, -1).forEach(part => {
      let folder = current.items.find(
        item => 'items' in item && item.path === `${current.path}${part}/`
      ) as FolderType | undefined;

      if (!folder) {
        folder = {
          name: part,
          path: `${current.path}${part}/`,
          items: [],
        };
        current.items.push(folder);
      }
      current = folder;
    });

    current.items.push(file);
  });

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateItem = () => {
    if (!newItemName || !newItemPath || !newItemType) return;

    if (newItemType === 'file') {
      onCreateFile(newItemName, newFileLang, `${newItemPath}${newItemName}`);
    } else {
      onCreateFolder(`${newItemPath}${newItemName}/`);
    }

    setNewItemName('');
    setNewItemPath('');
    setNewItemType(null);
  };

  const renderTree = (folder: FolderType, level = 0) => {
    const isExpanded = expandedFolders.has(folder.path);

    return (
      <div key={folder.path} style={{ marginLeft: level ? '0.75rem' : 0 }}>
        {folder.path !== '/' && (
          <button
            onClick={() => toggleFolder(folder.path)}
            className="flex items-center gap-2 w-full p-2 hover:bg-gradient-to-r hover:from-[#30363d]/50 hover:to-[#21262d] rounded-lg group transition-all duration-200"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            )}
            <FolderOpen className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium group-hover:text-white transition-colors">{folder.name}</span>
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-[#30363d]">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1c2128] border-[#30363d]">
                  <DropdownMenuItem 
                    onClick={() => {
                      setNewItemType('file');
                      setNewItemPath(folder.path);
                    }}
                    className="hover:bg-[#30363d] focus:bg-[#30363d] text-white"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    New File
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setNewItemType('folder');
                      setNewItemPath(folder.path);
                    }}
                    className="hover:bg-[#30363d] focus:bg-[#30363d] text-white"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    New Folder
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-400 hover:bg-red-500/20 focus:bg-red-500/20"
                    onClick={() => onDeleteFolder(folder.path)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </button>
        )}
        {isExpanded && (
          <div className="ml-2 border-l border-[#30363d]/30 pl-2">
            {folder.items
              .sort((a, b) => {
                // Folders first, then files
                const aIsFolder = 'items' in a;
                const bIsFolder = 'items' in b;
                if (aIsFolder && !bIsFolder) return -1;
                if (!aIsFolder && bIsFolder) return 1;
                return a.name.localeCompare(b.name);
              })
              .map(item => {
                if ('items' in item) {
                  return renderTree(item as FolderType, level + 1);
                }
                const file = item as File;
                const isActive = currentFile?.id === file.id;
                return (
                  <button
                    key={file.id}
                    onClick={() => onFileSelect(file)}
                    className={`flex items-center gap-2 w-full p-2 rounded-lg group transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-white border border-blue-500/30' 
                        : 'hover:bg-gradient-to-r hover:from-[#30363d]/50 hover:to-[#21262d] text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* File type icon */}
                      <div className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-blue-500' : 'bg-gray-500'
                      }`} />
                      <FileText className={`w-4 h-4 ${
                        isActive ? 'text-blue-400' : 'text-gray-400'
                      }`} />
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-[#30363d]">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1c2128] border-[#30363d]">
                          <DropdownMenuItem
                            className="text-red-400 hover:bg-red-500/20 focus:bg-red-500/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteFile(file);
                            }}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </button>
                );
              })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#23272e] text-white">
      <div className="flex items-center justify-between p-2 border-b border-[#222]">
        <span className="font-medium">Files</span>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => {
            setNewItemType('file');
            setNewItemPath('/');
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {renderTree(fileTree)}
      </div>

      {newItemType && (
        <div className="p-2 border-t border-[#222] bg-[#2a2a2a]">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              className="w-full bg-[#23272e] border border-[#333] rounded px-2 py-1 text-sm"
              placeholder={newItemType === 'file' ? 'File name' : 'Folder name'}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateItem();
                if (e.key === 'Escape') {
                  setNewItemName('');
                  setNewItemType(null);
                }
              }}
            />
            {newItemType === 'file' && (
              <select
                value={newFileLang}
                onChange={e => setNewFileLang(e.target.value)}
                className="w-full bg-[#23272e] border border-[#333] rounded px-2 py-1 text-sm"
              >
                <option value="javascript">JavaScript (.js)</option>
                <option value="typescript">TypeScript (.ts)</option>
                <option value="python">Python (.py)</option>
                <option value="json">JSON (.json)</option>
                <option value="markdown">Markdown (.md)</option>
                <option value="html">HTML (.html)</option>
                <option value="css">CSS (.css)</option>
                <option value="cpp">C++ (.cpp)</option>
                <option value="c">C (.c)</option>
                <option value="java">Java (.java)</option>
                <option value="plaintext">Plain Text (.txt)</option>
              </select>
            )}
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setNewItemName('');
                  setNewItemType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateItem}
                disabled={!newItemName}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 