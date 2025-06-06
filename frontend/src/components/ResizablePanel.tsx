import { useEffect, useRef, useState } from 'react';
import React from 'react';

interface ResizablePanelProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  defaultSize?: number; // percentage for horizontal, pixels for vertical
  minSize?: number;
  maxSize?: number;
  className?: string;
}

export function ResizablePanel({
  children,
  direction = 'vertical',
  defaultSize = direction === 'horizontal' ? 50 : 240,
  minSize = direction === 'horizontal' ? 30 : 160,
  maxSize = direction === 'horizontal' ? 70 : 480,
  className = '',
}: ResizablePanelProps) {
  const [size, setSize] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      if (direction === 'horizontal') {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newPercentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        if (newPercentage >= minSize && newPercentage <= maxSize) {
          setSize(newPercentage);
        }
      } else {
        const newWidth = e.clientX;
        if (newWidth >= minSize && newWidth <= maxSize) {
          setSize(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minSize, maxSize, direction]);

  if (direction === 'horizontal') {
    const childrenArray = React.Children.toArray(children);
    if (childrenArray.length !== 2) {
      console.warn('ResizablePanel with horizontal direction expects exactly 2 children');
      return <div className={className}>{children}</div>;
    }

    return (
      <div ref={containerRef} className={`flex ${className}`}>
        <div style={{ width: `${size}%` }} className="overflow-hidden">
          {childrenArray[0]}
        </div>
        <div
          className="w-1 cursor-col-resize hover:bg-primary/20 transition-colors bg-[#30363d] relative"
          onMouseDown={() => setIsResizing(true)}
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>
        <div style={{ width: `${100 - size}%` }} className="overflow-hidden">
          {childrenArray[1]}
        </div>
      </div>
    );
  }

  // Vertical direction (original behavior)
  return (
    <div
      ref={panelRef}
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: `${size}px` }}
    >
      {children}
      <div
        className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/10 transition-colors"
        onMouseDown={() => setIsResizing(true)}
      />
    </div>
  );
} 