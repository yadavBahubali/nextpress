"use client";

import React, { useMemo, useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppDispatch, useAppSelector } from '@/store';
import { setSelectedItem, updateItem, removeItem, setItems } from '@/store/slices/menuBuilderSlice';
import { GripVertical, FileText, Link as LinkIcon, Box, ChevronLeft, ChevronRight, Layout, ExternalLink, Shield ,Trash2} from 'lucide-react';
import { MenuItem } from '@/types/menu';

// --- Sortable Item Component ---
interface SortableItemProps {
  item: MenuItem;
  depth: number;
  isSelected: boolean;
  onSelect: (id: string | number | null) => void;
  onIndent: (id: string | number, delta: number) => void;
  onRemove: (id: string | number) => void;
}

function SortableMenuItem({ item, depth, isSelected, onSelect, onIndent, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${depth * 32}px`,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className="position-relative">
      <div 
        className={`menu-item-row d-flex align-items-center p-3 mb-2 rounded-3 border transition-all cursor-pointer ${isSelected ? 'border-primary bg-primary bg-opacity-5 shadow-sm' : 'border-light-subtle bg-white hover-border-primary'}`}
        onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
        style={{ borderLeft: isSelected ? '4px solid #0d6efd' : undefined }}
      >
        <div className="drag-handle p-2 text-muted cursor-grab d-flex align-items-center justify-content-center" {...attributes} {...listeners}>
          <GripVertical className={`${isSelected ? 'text-white' : 'text-dark'}`} size={18} />
        </div>
        
        <div className="d-flex align-items-center gap-3 flex-grow-1 px-2 overflow-hidden">
          <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${isSelected ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ width: '36px', height: '36px' }}>
            {item.type === 'page' ? <FileText size={16} /> : item.type === 'blog' ? <Layout size={16} /> : <LinkIcon size={16} />}
          </div>
          
          <div className="d-flex flex-column overflow-hidden">
            <span className={`fw-bold small text-truncate ${isSelected ? 'text-white' : 'text-dark'}`}>{item.label}</span>
            <div className="d-flex align-items-center gap-2">
              <span className={`x-small   opacity-75 text-truncate ${isSelected ? 'text-white' : 'text-dark'}`}>
                {item.url || `/${item.type}/${item.entity_id || ''}`}
              </span>
              {item.settings_json?.open_in_new_tab && <ExternalLink size={10} className="text-muted" />}
              {item.settings_json?.visibility && item.settings_json.visibility !== 'all' && <Shield size={10} className="text-warning" />}
            </div>
          </div>
        </div>
        
        {/* Indent/Outdent Controls */}
        <div className="indent-controls d-flex align-items-center gap-1 me-2">
          <button 
            className={`btn btn-sm border p-1 rounded transition-all ${depth === 0 ? 'btn-light opacity-25 cursor-not-allowed' : 'btn-white hover-bg-light'}`} 
            title="Move Left (Outdent)"
            disabled={depth === 0}
            onClick={(e) => { e.stopPropagation(); onIndent(item.id, -1); }}
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            className="btn btn-sm btn-white border p-1 rounded transition-all hover-bg-light" 
            title="Move Right (Indent)"
            onClick={(e) => { e.stopPropagation(); onIndent(item.id, 1); }}
          >
            <ChevronRight size={16} />
          </button>
          <button 
            className="btn btn-sm btn-white border p-1 rounded transition-all hover-bg-danger-subtle hover-text-danger ms-1" 
            title="Remove Item"
            onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        <div className="d-flex align-items-center gap-2 pe-3 flex-shrink-0 d-none d-sm-flex">
          {item.settings_json?.badge_text && (
            <span className="badge bg-danger rounded-pill x-small px-2" style={{ scale: '0.8' }}>{item.settings_json.badge_text}</span>
          )}
          <span className="badge bg-light text-muted border x-small text-uppercase fw-normal" style={{ fontSize: '0.6rem' }}>{item.type}</span>
        </div>
      </div>
      
      {/* Indentation Line Guide */}
      {depth > 0 && (
        <div 
          className="position-absolute border-start border-2 border-primary border-opacity-10" 
          style={{ 
            left: `-${16}px`, 
            top: '-8px', 
            bottom: '24px', 
            zIndex: -1 
          }}
        ></div>
      )}
      
      <style jsx>{`
        .menu-item-row { 
          box-shadow: 0 2px 4px rgba(0,0,0,0.02); 
        }
        .menu-item-row:hover { 
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .indent-controls {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .menu-item-row:hover .indent-controls {
          opacity: 1;
        }
        .hover-bg-danger-subtle:hover {
          background-color: #fee2e2 !important;
          border-color: #fca5a5 !important;
        }
        .x-small { font-size: 0.7rem; }
        .cursor-grab { cursor: grab; }
        .cursor-not-allowed { cursor: not-allowed; }
        .btn-white { background-color: white; }
        .hover-bg-light:hover { background-color: #f8f9fa; }
      `}</style>
    </div>
  );
}

// --- Main Canvas Component ---
export default function BuilderCanvas() {
  const dispatch = useAppDispatch();
  const { items, selectedItemId, isDirty } = useAppSelector((state) => state.menuBuilder);
  const [activeId, setActiveId] = useState<string | number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleIndent = (id: string | number, delta: number) => {
    // To indent/outdent properly, we should rely on the flattened visual order
    const index = itemsWithDepth.findIndex(i => i.id === id);
    if (index === -1) return;

    if (delta === 1) {
      // Indent: Make the item a child of the immediately preceding item in the visual list
      const prevItem = itemsWithDepth[index - 1];
      if (prevItem && prevItem.depth >= itemsWithDepth[index].depth) {
        dispatch(updateItem({ id, data: { parent_id: prevItem.id } }));
      }
    } else {
      // Outdent: Move up one level in hierarchy
      const currentItem = itemsWithDepth[index];
      if (currentItem.parent_id) {
        // Find the parent's parent
        const parentItem = items.find((i: { id: any; }) => i.id === currentItem.parent_id);
        dispatch(updateItem({ id, data: { parent_id: parentItem?.parent_id || null } }));
      }
    }
  };

  const handleSelect = (id: string | number | null) => {
    dispatch(setSelectedItem(id));
  };

  const handleRemove = (id: string | number) => {
    dispatch(removeItem(id));
  };

  // Build a proper flattened tree for rendering so parents and children stay visually grouped
  const itemsWithDepth = useMemo(() => {
    const itemMap = new Map<string | number, any>();
    const roots: any[] = [];

    // Initialize items with children array
    items.forEach((item: MenuItem) => {
      itemMap.set(item.id, { ...item, children: [], depth: 0 });
    });

    // Build the tree
    items.forEach((item: { parent_id: string | number | null; id: string | number; }) => {
      if (item.parent_id && itemMap.has(item.parent_id)) {
        itemMap.get(item.parent_id).children.push(itemMap.get(item.id));
      } else {
        roots.push(itemMap.get(item.id));
      }
    });

    // Sort function based on sort_order
    const sortNodes = (nodes: any[]) => {
      nodes.sort((a, b) => a.sort_order - b.sort_order);
      nodes.forEach(node => {
        if (node.children.length > 0) sortNodes(node.children);
      });
    };
    sortNodes(roots);

    // Flatten the tree for rendering
    const flattened: any[] = [];
    const flattenNode = (node: any, depth: number) => {
      node.depth = depth;
      flattened.push(node);
      node.children.forEach((child: any) => flattenNode(child, depth + 1));
    };
    
    roots.forEach(root => flattenNode(root, 0));
    
    return flattened;
  }, [items]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // We are operating on the visually flattened array
      const oldIndex = itemsWithDepth.findIndex(i => i.id === active.id);
      const newIndex = itemsWithDepth.findIndex(i => i.id === over.id);
      
      const newItems = arrayMove(itemsWithDepth, oldIndex, newIndex);
      
      // We must strip out the 'children' and 'depth' props before saving to store
      // Also, recalculate sort_order based on this new visual array
      const updatedItems = newItems.map((item, idx) => {
        const { children, depth, ...rest } = item;
        return {
          ...rest,
          sort_order: idx
        };
      });
      
      dispatch(setItems(updatedItems));
    }
    
    setActiveId(null);
  };


  return (
    <div className="h-100 d-flex flex-column" onClick={() => handleSelect(null)}>
      {/* Canvas Header */}
      <div className="p-4 bg-white border-bottom shadow-sm z-1 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
            <Layout size={20} />
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-dark">Menu Canvas</h6>
            <p className="x-small text-muted mb-0">Drag vertically to reorder. Use arrows to manage sub-paths.</p>
          </div>
        </div>
        
        <div className="d-flex align-items-center gap-3">
          {isDirty && (
            <div className="d-flex align-items-center gap-2">
              <div className="spinner-grow spinner-grow-sm text-warning" role="status"></div>
              <span className="text-warning x-small fw-bold text-uppercase ls-wide">Unsaved Changes</span>
            </div>
          )}
          <div className="vr h-20px my-auto opacity-10"></div>
          <span className="badge bg-light text-dark border px-3 py-2 rounded-pill x-small fw-bold">
            {items.length} {items.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-grow-1 overflow-auto p-4 p-lg-5 scrollbar-thin bg-light bg-opacity-50">
        {items.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center">
            <div className="mb-4 p-4 bg-white rounded-circle shadow-sm">
              <Box size={48} className="text-muted opacity-25" />
            </div>
            <h5 className="fw-bold text-dark">Build your navigation</h5>
            <p className="small text-muted mb-4 max-w-sm">
              Choose pages from the left library to add them here. 
              Once added, you can drag them into any order you like.
            </p>
            <div className="d-flex gap-2">
              <span className="badge bg-white text-muted border px-2 py-1 x-small fw-normal">Drag to Order</span>
              <span className="badge bg-white text-muted border px-2 py-1 x-small fw-normal">Indent for Dropdowns</span>
            </div>
          </div>
        ) : (
          <div className="menu-tree-container mx-auto" style={{ maxWidth: '850px' }}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i: { id: any; }) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {itemsWithDepth.map((item) => (
                  <SortableMenuItem
                    key={item.id}
                    item={item}
                    depth={item.depth}
                    isSelected={selectedItemId === item.id}
                    onSelect={handleSelect}
                    onIndent={handleIndent}
                    onRemove={handleRemove}
                  />
                ))}
              </SortableContext>
              
              <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: {
                    active: { opacity: '0.4' },
                  },
                }),
              }}>
                {activeId ? (
                  <div className="menu-item-row d-flex align-items-center p-3 rounded-3 border border-primary bg-white shadow-lg shadow-primary-subtle opacity-90" style={{ width: '400px' }}>
                    <div className="p-2 text-muted"><GripVertical size={18} /></div>
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                         <FileText size={14} />
                      </div>
                      <span className="fw-bold small">{items.find((i: { id: string | number; }) => i.id === activeId)?.label}</span>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}
      </div>

      <style jsx>{`
        .ls-wide { letter-spacing: 0.05em; }
        .x-small { font-size: 0.7rem; }
        .h-20px { height: 20px; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 6px; }
        .max-w-sm { max-width: 300px; }
      `}</style>
    </div>
  );
}
