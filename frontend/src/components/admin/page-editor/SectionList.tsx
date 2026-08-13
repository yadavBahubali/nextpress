"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateContent } from "@/store/slices/editorSlice";
import { ChevronDown, ChevronRight, Layers, Settings, ExternalLink, RefreshCw } from "lucide-react";
import FieldRenderer from "./FieldRenderer";
import { Field } from "@/types/acf";
import Link from "next/link";
import { useParams } from "next/navigation";

interface TabGroup {
  tab: Field | null;
  fields: Field[];
}

export default function SectionList() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const adminPath = params?.admin || "admin";
  const { fieldGroups, content } = useAppSelector((state) => state.editor);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [activeTabs, setActiveTabs] = useState<Record<string, number>>({});

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleUpdateContent = (path: string, value: any) => {
    dispatch(updateContent({ path, value }));
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const groupFieldsByTabs = (fields: Field[]): TabGroup[] => {
    const groups: TabGroup[] = [];
    let currentGroup: TabGroup = { tab: null, fields: [] };

    fields.forEach(field => {
      if (field.type === 'tab') {
        if (currentGroup.fields.length > 0 || currentGroup.tab) {
          groups.push(currentGroup);
        }
        currentGroup = { tab: field, fields: [] };
      } else {
        currentGroup.fields.push(field);
      }
    });
    
    if (currentGroup.fields.length > 0 || currentGroup.tab) {
      groups.push(currentGroup);
    }

    return groups;
  };

  return (
    <div className="d-flex flex-column gap-4 p-4 p-lg-5">
      {fieldGroups.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border border-dashed shadow-sm">
          <div className="bg-primary-subtle text-primary p-4 rounded-circle d-inline-flex mb-4">
            <Layers className="opacity-75" size={48} strokeWidth={1.5} />
          </div>
          <h5 className="fw-bold text-dark mb-2">No Content Sections Assigned</h5>
          <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: '400px' }}>
            This page template doesn't have any ACF field groups assigned yet. 
            You can assign groups by setting <strong>Location Rules</strong> in the ACF module.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link 
              href={`/${adminPath}/acf`}
              className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm"
            >
              <Settings size={16} /> Manage ACF Groups
            </Link>
            <button 
              onClick={handleRefresh}
              className="btn btn-light border rounded-pill px-4 d-flex align-items-center gap-2"
            >
              <RefreshCw size={16} /> Refresh Editor
            </button>
          </div>
          
          <div className="mt-5 p-3 bg-light rounded-3 text-start mx-auto border-0" style={{ maxWidth: '500px' }}>
             <h6 className="x-small fw-bold text-uppercase text-primary mb-2 d-flex align-items-center gap-2">
               <ExternalLink size={12} /> How to assign fields?
             </h6>
             <ol className="small text-muted mb-0 ps-3">
               <li className="mb-1">Go to the <Link href={`/${adminPath}/acf`} className="text-decoration-none fw-bold">ACF Module</Link>.</li>
               <li className="mb-1">Select or create a <strong>Field Group</strong>.</li>
               <li className="mb-1">Under <strong>Location Rules</strong>, set <code>Page == {document.title || 'this page'}</code>.</li>
               <li>Save changes and return here to refresh the editor.</li>
             </ol>
          </div>
        </div>
      ) : (
        fieldGroups.map((group) => {
          const isExpanded = expandedGroups[group.id!] !== false; // Default to expanded
          const groupKey = group.groupKey;
          const tabGroups = groupFieldsByTabs(group.fields);
          const hasTabs = tabGroups.length > 1 || (tabGroups.length === 1 && tabGroups[0].tab !== null);
          const activeTabIndex = activeTabs[group.id!] || 0;

          return (
            <div key={group.id} className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div 
                className="card-header bg-white border-bottom-0 py-3 px-4 d-flex align-items-center justify-content-between cursor-pointer"
                style={{ cursor: 'pointer' }}
                onClick={() => toggleGroup(group.id!)}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary-subtle text-primary p-2 rounded-3">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">{group.title}</h6>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{groupKey}</p>
                  </div>
                </div>
                {isExpanded ? <ChevronDown size={20} className="text-muted" /> : <ChevronRight size={20} className="text-muted" />}
              </div>
              
              {isExpanded && (
                <div className="card-body p-0 bg-light-subtle border-top">
                  {hasTabs && (
                    <div className="bg-white border-bottom px-4">
                      <div className="nav nav-tabs border-0">
                        {tabGroups.map((tg, idx) => (
                          <button
                            key={idx}
                            className={`nav-link border-0 border-bottom border-3 px-3 py-3 fw-medium small ${activeTabIndex === idx ? 'active border-primary text-primary' : 'text-muted border-transparent'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTabs(prev => ({ ...prev, [group.id!]: idx }));
                            }}
                            style={{ 
                              background: 'transparent',
                              marginBottom: '-1px'
                            }}
                          >
                            {tg.tab ? tg.tab.label : 'General'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="row">
                      {(hasTabs ? tabGroups[activeTabIndex].fields : group.fields).map((field: Field, fieldIdx: number) => (
                        <div 
                          key={field.id || `${field.name}-${fieldIdx}`} 
                          className="col-12"
                          style={{ width: field.wrapper?.width || '100%' }}
                        >
                          <FieldRenderer 
                            field={field}
                            value={content[groupKey]?.[field.name]}
                            onChange={(val) => handleUpdateContent(`${groupKey}.${field.name}`, val)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
      <style jsx>{`
        .border-transparent {
          border-color: transparent !important;
        }
      `}</style>
    </div>
  );
}
