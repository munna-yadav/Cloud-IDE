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
      <div key={folder.path} style={{ marginLeft: level ? '1rem' : 0 }}>
        {folder.path !== '/' && (
          <button
            onClick={() => toggleFolder(folder.path)}
            className="flex items-center gap-1 w-full p-1 hover:bg-[#2a2a2a] rounded-sm group"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <FolderOpen className="w-4 h-4 text-yellow-500" />
            <span className="text-sm">{folder.name}</span>
            <div className="ml-auto opacity-0 group-hover:opacity-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setNewItemType('file');
                    setNewItemPath(folder.path);
                  }}>
                    New File
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setNewItemType('folder');
                    setNewItemPath(folder.path);
                  }}>
                    New Folder
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDeleteFolder(folder.path)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </button>
        )}
        {isExpanded && (
          <div>
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
                return (
                  <button
                    key={file.id}
                    onClick={() => onFileSelect(file)}
                    className={`flex items-center gap-1 w-full p-1 hover:bg-[#2a2a2a] rounded-sm group ${
                      currentFile?.id === file.id ? 'bg-[#2a2a2a] text-primary' : ''
                    }`}
                    style={{ marginLeft: '1rem' }}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">{file.name}</span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteFile(file);
                            }}
                          >
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