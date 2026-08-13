"use client";

import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, FileText, Link as LinkIcon, Box, ShoppingBag, Plus, Loader2 } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { addItems, addCustomItem } from '@/store/slices/menuBuilderSlice';
import { EntitySearchItem } from '@/types/menu';

import { menusService } from '@/services/menus.service';

export default function SourceSidebar() {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['pages', 'custom']);
  const [results, setResults] = useState<{ pages: EntitySearchItem[], posts: EntitySearchItem[] }>({ pages: [], posts: [] });
  const [checkedItems, setCheckedItems] = useState<EntitySearchItem[]>([]);

  const [customUrl, setCustomUrl] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  // Debounced search
  useEffect(() => {
    const fetchEntities = async (query?: string) => {
      try {
        const res = await menusService.searchEntities(query || '');
        setResults(res.data);
      } catch (e) {
        console.error("Search failed", e);
      }
    };

    if (search.length > 1) {
      const timer = setTimeout(() => fetchEntities(search), 500);
      return () => clearTimeout(timer);
    } else if (search.length === 0) {
      fetchEntities();
    }
  }, [search]);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const handleCheck = (item: EntitySearchItem, isChecked: boolean) => {
    if (isChecked) {
      setCheckedItems(prev => [...prev, item]);
    } else {
      setCheckedItems(prev => prev.filter(i => i.id !== item.id || i.type !== item.type));
    }
  };

  const handleAddChecked = () => {
    if (checkedItems.length > 0) {
      dispatch(addItems({ entities: checkedItems }));
      setCheckedItems([]); // clear after adding
    }
  };

  const handleAddCustom = () => {
    if (customLabel && customUrl) {
      dispatch(addCustomItem({ label: customLabel, url: customUrl, type: 'custom_url' }));
      setCustomLabel('');
      setCustomUrl('');
    }
  };

  const handleSpecialItemClick = (item: any) => {
    if (item.id === 'dropdown_label') {
      dispatch(addCustomItem({ label: 'New Dropdown', url: '#', type: 'custom_url' }));
    } else if (item.id === 'announcement_header') {
      dispatch(addCustomItem({ label: 'Announcement Bar', url: '#', type: 'announcement_header' }));
    } else {
      dispatch(addItems({ entities: [item as any] }));
    }
  };

  const renderGroup = (id: string, label: string, icon: any, items: EntitySearchItem[]) => {
    const isExpanded = expandedGroups.includes(id);
    return (
      <div className="border-bottom">
        <button 
          className="w-100 bg-transparent border-0 d-flex align-items-center justify-content-between py-3 px-4 text-dark hover-bg-light"
          onClick={() => toggleGroup(id)}
        >
          <span className="fw-bold small d-flex align-items-center gap-2">
            {icon} {label}
          </span>
          {isExpanded ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
        </button>
        
        {isExpanded && (
          <div className="bg-light p-3 border-top border-bottom border-light-subtle">
            {items.length === 0 ? (
              <div className="text-muted x-small text-center py-2">No {label.toLowerCase()} found. Try searching.</div>
            ) : (
              <div className="d-flex flex-column gap-2 scrollbar-thin" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {items.map(item => (
                  <label key={`${item.type}-${item.id}`} className="d-flex align-items-center gap-2 cursor-pointer p-2 bg-white rounded shadow-sm border border-light-subtle hover-border-primary transition-all">
                    <input 
                      type="checkbox" 
                      className="form-check-input mt-0 shadow-none"
                      checked={checkedItems.some(i => i.id === item.id && i.type === item.type)}
                      onChange={(e) => handleCheck(item, e.target.checked)}
                    />
                    <div className="d-flex flex-column">
                      <span className="small fw-medium text-truncate" style={{ maxWidth: '200px' }}>{item.title}</span>
                      <span className="x-small text-muted text-truncate" style={{ maxWidth: '200px' }}>/{item.slug}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="d-flex flex-column h-100">
      <div className="p-4 border-bottom bg-white shadow-sm z-1">
        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
          <Box size={18} className="text-primary" />
          Add Menu Items
        </h6>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0 text-muted px-3">
            <Search size={16} />
          </span>
          <input 
            type="text" 
            className="form-control bg-light border-start-0 shadow-none ps-0 font-monospace-like small"
            placeholder="Search pages, blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto scrollbar-hidden pb-5">
        {renderGroup('pages', 'Pages', <FileText size={16} />, results.pages)}
        {renderGroup('posts', 'Blog Posts', <FileText size={16} />, results.posts)}
        
        {/* Special Items Group */}
        <div className="border-bottom">
          <button 
            className="w-100 bg-transparent border-0 d-flex align-items-center justify-content-between py-3 px-4 text-dark hover-bg-light"
            onClick={() => toggleGroup('special')}
          >
            <span className="fw-bold small d-flex align-items-center gap-2">
              <Plus size={16} className="text-primary" /> Special Items
            </span>
            {expandedGroups.includes('special') ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
          </button>
          
          {expandedGroups.includes('special') && (
            <div className="bg-light p-3 border-top border-bottom border-light-subtle">
              <div className="d-flex flex-column gap-2">
                {[
                  { id: 'announcement_header', title: 'Announcement Header Bar', type: 'announcement_header', slug: 'announcement', label: 'Announcement Bar' },
                  { id: 'dropdown_label', title: 'Dropdown Group Label', type: 'custom_url', slug: '#', label: 'New Dropdown' },
                  { id: 'cta_btn', title: 'Action Button (CTA)', type: 'cta_button', slug: 'button' },
                  { id: 'cart_toggle', title: 'Shopping Cart', type: 'cart', slug: 'cart' },
                  { id: 'account_link', title: 'User Account / Login', type: 'account', slug: 'account' },
                ].map(item => (
                  <div 
                    key={item.id} 
                    className="d-flex align-items-center justify-content-between p-2 bg-white rounded shadow-sm border border-light-subtle hover-border-primary cursor-pointer transition-all"
                    onClick={() => handleSpecialItemClick(item)}
                  >
                    <div className="d-flex flex-column">
                      <span className="small fw-bold">{item.title}</span>
                      <span className="x-small text-muted">Functional Element</span>
                    </div>
                    <Plus size={14} className="text-primary" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Custom Links Group */}
        <div className="border-bottom mb-5">
          <button 
            className="w-100 bg-transparent border-0 d-flex align-items-center justify-content-between py-3 px-4 text-dark hover-bg-light"
            onClick={() => toggleGroup('custom')}
          >
            <span className="fw-bold small d-flex align-items-center gap-2">
              <LinkIcon size={16} /> Custom Links
            </span>
            {expandedGroups.includes('custom') ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
          </button>
          
          {expandedGroups.includes('custom') && (
            <div className="bg-light p-4 border-top border-light-subtle">
              <div className="mb-3">
                <label className="x-small fw-bold text-uppercase text-muted mb-1">URL</label>
                <input 
                  type="text" 
                  className="form-control form-control-sm shadow-none" 
                  placeholder="https://" 
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="x-small fw-bold text-uppercase text-muted mb-1">Link Text</label>
                <input 
                  type="text" 
                  className="form-control form-control-sm shadow-none" 
                  placeholder="Menu Label" 
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                />
              </div>
              <button 
                className="btn btn-outline-dark btn-sm w-100 fw-bold rounded-pill"
                onClick={handleAddCustom}
                disabled={!customUrl || !customLabel}
              >
                Add Custom Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar for Checkboxes */}
      {checkedItems.length > 0 && (
        <div className="p-3 border-top bg-white position-absolute bottom-0 w-100 shadow-lg" style={{ zIndex: 10 }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="x-small fw-bold text-primary bg-primary bg-opacity-10 px-2 py-1 rounded">
              {checkedItems.length} selected
            </span>
            <button className="btn btn-link p-0 x-small text-muted text-decoration-none" onClick={() => setCheckedItems([])}>Clear</button>
          </div>
          <button 
            className="btn btn-primary w-100 fw-bold rounded-pill shadow-sm d-flex justify-content-center align-items-center gap-2"
            onClick={handleAddChecked}
          >
            <Plus size={16} /> Add to Menu
          </button>
        </div>
      )}

      <style jsx>{`
        .x-small { font-size: 0.7rem; }
        .hover-bg-light:hover { background-color: #f8f9fa !important; }
        .cursor-pointer { cursor: pointer; }
        .max-h-200 { max-height: 250px; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
        .transition-all { transition: all 0.2s; }
        .hover-border-primary:hover { border-color: #0061FF !important; }
        .font-monospace-like { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      `}</style>
    </div>
  );
}
