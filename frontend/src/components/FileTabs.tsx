import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import type { File } from '../contexts/FileContext';

interface FileTabsProps {
  openFiles: File[];
  activeFile: File | null;
  onSelectFile: (file: File) => void;
  onCloseFile: (file: File) => void;
}

export function FileTabs({
  openFiles,
  activeFile,
  onSelectFile,
  onCloseFile,
}: FileTabsProps) {
  if (openFiles.length === 0) {
    return (
      <div className="flex h-10 items-center px-4 text-sm text-muted-foreground bg-[#1e1e1e]">
        No files open
      </div>
    );
  }

  return (
    <div className="flex h-10 items-center gap-1 overflow-x-auto bg-[#1e1e1e] px-2">
      {openFiles.map((file) => (
        <button
          key={file.id}
          onClick={() => onSelectFile(file)}
          className={cn(
            'group flex h-8 items-center gap-2 rounded-md px-3 text-sm hover:bg-[#2a2a2a] transition-colors border-b-2 border-transparent',
            activeFile?.id === file.id && 'bg-[#2a2a2a] border-blue-500 text-white'
          )}
        >
          <span className="truncate max-w-[120px]">{file.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCloseFile(file);
            }}
            className="opacity-0 group-hover:opacity-100 hover:bg-[#3a3a3a] rounded p-0.5 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </button>
      ))}
    </div>
  );
}
