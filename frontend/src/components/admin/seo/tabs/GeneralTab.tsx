"use client";

import React, { useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateSeoData, setIsTitleAuto, setIsDescriptionAuto } from "@/store/slices/seoSlice";
import SeoVariableToolbar from "../SeoVariableToolbar";
import { RefreshCw, Lock, Globe, FileText, Settings2 } from "lucide-react";

export default function GeneralTab() {
  const dispatch = useAppDispatch();
  const { 
    seoData, 
    resolvedTitle, 
    resolvedDescription,
    isTitleAuto,
    isDescriptionAuto,
  } = useAppSelector((state) => state.seo);
  
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const titleValue = isTitleAuto ? (resolvedTitle?.value || "") : (seoData?.meta_title || "");
  const descValue = isDescriptionAuto ? (resolvedDescription?.value || "") : (seoData?.meta_description || "");

  const titleLength = titleValue.length;
  const descriptionLength = descValue.length;

  const handleInsert = (field: 'title' | 'description', tag: string) => {
    const input = field === 'title' ? titleRef.current : descRef.current;
    if (!input) return;

    // While the field is in "Auto" mode, the input displays resolvedTitle/
    // resolvedDescription (the computed fallback), not seoData.meta_title -
    // splicing into the (empty) manual value here and leaving isTitleAuto/
    // isDescriptionAuto on meant the field kept displaying the old auto
    // value and the insert appeared to do nothing. Splice into whatever is
    // currently shown, and switch to manual mode, exactly like typing does.
    const currentValue = field === 'title' ? titleValue : descValue;
    const start = input.selectionStart ?? currentValue.length;
    const end = input.selectionEnd ?? currentValue.length;

    const newValue = currentValue.substring(0, start) + tag + currentValue.substring(end);

    if (field === 'title') {
      if (isTitleAuto) dispatch(setIsTitleAuto(false));
      dispatch(updateSeoData({ meta_title: newValue }));
    } else {
      if (isDescriptionAuto) dispatch(setIsDescriptionAuto(false));
      dispatch(updateSeoData({ meta_description: newValue }));
    }

    // Refocus and set cursor position after update
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTitleAuto) dispatch(setIsTitleAuto(false));
    dispatch(updateSeoData({ meta_title: e.target.value }));
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isDescriptionAuto) dispatch(setIsDescriptionAuto(false));
    dispatch(updateSeoData({ meta_description: e.target.value }));
  };

  const handleSetIsTitleAuto = (val: boolean) => {
    dispatch(setIsTitleAuto(val));
  };

  const handleSetIsDescriptionAuto = (val: boolean) => {
    dispatch(setIsDescriptionAuto(val));
  };

  const handleUpdateFocusKeyword = (val: string) => {
    dispatch(updateSeoData({ focus_keyword: val }));
  };

  const getTitleColor = () => {
    if (titleLength === 0) return 'text-muted';
    if (titleLength < 40) return 'text-warning';
    if (titleLength <= 60) return 'text-success';
    return 'text-danger';
  };

  const getDescriptionColor = () => {
    if (descriptionLength === 0) return 'text-muted';
    if (descriptionLength < 120) return 'text-warning';
    if (descriptionLength <= 160) return 'text-success';
    return 'text-danger';
  };

  const getSourceIcon = (source: string | undefined) => {
    if (source === 'manual') return <Lock size={12} />;
    if (source === 'page_field') return <FileText size={12} />;
    if (source === 'global') return <Globe size={12} />;
    return <Settings2 size={12} />;
  };

  const getSourceColorClass = (source: string | undefined) => {
    if (source === 'manual') return 'bg-warning bg-opacity-10 text-warning';
    if (source === 'page_field') return 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25';
    return 'bg-secondary bg-opacity-10 text-secondary';
  };

  return (
    <div className="seo-general-tab">
      {/* Focus Keyword */}
      <div className="mb-4">
        <label className="form-label fw-bold small text-uppercase mb-1">Focus Keyphrase</label>
        <div className="input-group">
          <input 
            type="text" 
            className="form-control"
            placeholder="Enter your main keyword..."
            value={seoData?.focus_keyword || ""}
            onChange={(e) => handleUpdateFocusKeyword(e.target.value)}
          />
        </div>
        <div className="form-text small opacity-75">
          Set the primary phrase you want this page to rank for.
        </div>
      </div>

      <hr className="my-4 opacity-10" />

      {/* SEO Title */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <label className="form-label fw-bold small text-uppercase mb-1 d-block">SEO Title</label>
            {resolvedTitle && (
              <span className={`badge rounded-pill d-inline-flex align-items-center gap-1 x-small fw-medium ${getSourceColorClass(resolvedTitle.source)}`}>
                {getSourceIcon(resolvedTitle.source)} {resolvedTitle.label}
              </span>
            )}
          </div>
          <div className="d-flex align-items-center gap-3">
            {!isTitleAuto && (
              <button 
                className="btn btn-sm btn-link text-primary p-0 x-small text-decoration-none d-flex align-items-center gap-1"
                onClick={() => handleSetIsTitleAuto(true)}
              >
                <RefreshCw size={10} /> Reset to Auto
              </button>
            )}
            <span className={`small fw-bold ${getTitleColor()}`}>{titleLength} / 60</span>
          </div>
        </div>
        
        <SeoVariableToolbar onInsert={(tag) => handleInsert('title', tag)} />
        
        <div className="position-relative">
          <input 
            ref={titleRef}
            type="text" 
            className={`form-control ${isTitleAuto ? 'bg-light border-dashed-custom' : ''}`}
            placeholder="Auto-generating..."
            value={titleValue}
            onChange={handleTitleChange}
          />
        </div>

        <div className="progress mt-1" style={{ height: '3px' }}>
          <div 
            className={`progress-bar ${titleLength > 60 ? 'bg-danger' : titleLength >= 40 ? 'bg-success' : 'bg-warning'}`} 
            role="progressbar" 
            style={{ width: `${Math.min((titleLength / 60) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Meta Description */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <label className="form-label fw-bold small text-uppercase mb-1 d-block">Meta Description</label>
            {resolvedDescription && (
              <span className={`badge rounded-pill d-inline-flex align-items-center gap-1 x-small fw-medium ${getSourceColorClass(resolvedDescription.source)}`}>
                {getSourceIcon(resolvedDescription.source)} {resolvedDescription.label}
              </span>
            )}
          </div>
          <div className="d-flex align-items-center gap-3">
            {!isDescriptionAuto && (
              <button 
                className="btn btn-sm btn-link text-primary p-0 x-small text-decoration-none d-flex align-items-center gap-1"
                onClick={() => handleSetIsDescriptionAuto(true)}
              >
                <RefreshCw size={10} /> Reset to Auto
              </button>
            )}
            <span className={`small fw-bold ${getDescriptionColor()}`}>{descriptionLength} / 160</span>
          </div>
        </div>

        <SeoVariableToolbar onInsert={(tag) => handleInsert('description', tag)} />

        <div className="position-relative">
          <textarea 
            ref={descRef}
            className={`form-control ${isDescriptionAuto ? 'bg-light border-dashed-custom' : ''}`}
            rows={3}
            placeholder="Auto-generating..."
            value={descValue}
            onChange={handleDescChange}
          ></textarea>
        </div>

        <div className="progress mt-1" style={{ height: '3px' }}>
          <div 
            className={`progress-bar ${descriptionLength > 160 ? 'bg-danger' : descriptionLength >= 120 ? 'bg-success' : 'bg-warning'}`} 
            role="progressbar" 
            style={{ width: `${Math.min((descriptionLength / 160) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
      
      <style jsx>{`
        .x-small { font-size: 0.7rem; }
        :global(.border-dashed-custom) {
          border-style: dashed !important;
          border-color: #cbd5e1 !important;
        }
      `}</style>
    </div>
  );
}
