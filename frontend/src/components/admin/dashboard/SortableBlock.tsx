import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaGripLines } from 'react-icons/fa';

interface SortableBlockProps {
  id: string;
  children: React.ReactNode;
}

export function SortableBlock({ id, children }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4 position-relative">
      <div 
        {...attributes} 
        {...listeners}
        className="position-absolute top-0 end-0 p-3"
        style={{ cursor: 'grab', zIndex: 5 }}
      >
        <div className="bg-light border rounded p-1 text-muted">
          <FaGripLines />
        </div>
      </div>
      {children}
    </div>
  );
}
