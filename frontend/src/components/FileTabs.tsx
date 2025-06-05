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
      <div className="flex h-12 items-center px-6 text-sm text-gray-400 bg-gradient-to-r from-[#0d1117] to-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-600 animate-pulse"></div>
          <span>No files open</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-12 items-center gap-0 overflow-x-auto bg-gradient-to-r from-[#0d1117] to-[#161b22] border-b border-[#30363d] scrollbar-hide">
      <div className="flex items-center gap-0 px-2">
        {openFiles.map((file, index) => (
          <button
            key={file.id}
            onClick={() => onSelectFile(file)}
            className={cn(
              'group relative flex h-10 items-center gap-3 px-4 text-sm font-medium transition-all duration-200 border-r border-[#30363d]/50 hover:bg-gradient-to-b hover:from-[#21262d] hover:to-[#30363d]/50',
              activeFile?.id === file.id
                ? 'bg-gradient-to-b from-[#1c2128] to-[#21262d] text-white border-b-2 border-blue-500 shadow-lg'
                : 'text-gray-300 hover:text-white',
              index === 0 && 'border-l border-[#30363d]/50'
            )}
          >
            {/* File type indicator */}
            <div className={cn(
              'w-2 h-2 rounded-full transition-colors',
              activeFile?.id === file.id ? 'bg-blue-500' : 'bg-gray-600'
            )} />
            
            <span className="truncate max-w-[140px] select-none">
              {file.name}
            </span>
            
            {/* Modified indicator */}
            <div className="w-1 h-1 rounded-full bg-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseFile(file);
              }}
              className="opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-full p-1 transition-all duration-200 hover:scale-110"
            >
              <X className="h-3 w-3 hover:text-red-400" />
            </button>
            
            {/* Active tab glow effect */}
            {activeFile?.id === file.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg pointer-events-none" />
            )}
          </button>
        ))}
      </div>
      
      {/* Add new tab button */}
      <button className="flex h-8 w-8 items-center justify-center text-gray-400 hover:text-white hover:bg-[#30363d]/50 rounded transition-all duration-200 mx-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
}
