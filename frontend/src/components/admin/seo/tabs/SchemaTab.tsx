"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateSeoData, setIsSchemaAuto } from "@/store/slices/seoSlice";
import {
  Code,
  Settings,
  RefreshCw,
  Lock,
  AlertCircle,
  ExternalLink,
  Plus,
  ChevronDown
} from "lucide-react";
import { SchemaType } from "@/utils/schemaGenerator";
import toast from "react-hot-toast";

export default function SchemaTab() {
  const dispatch = useAppDispatch();
  const { seoData, resolvedSchema, isSchemaAuto } = useAppSelector((state) => state.seo);

  const [showTemplates, setShowTemplates] = useState(false);

  const schemaTypes: { value: string; label: string; icon: string }[] = [
    { value: "Article", label: "Article", icon: "📝" },
    { value: "BlogPosting", label: "Blog Post", icon: "📰" },
    { value: "Product", label: "Product", icon: "🛍️" },
    { value: "FAQPage", label: "FAQ", icon: "❓" },
    { value: "LocalBusiness", label: "Local Business", icon: "🏢" },
    { value: "Organization", label: "Organization", icon: "🤝" },
    { value: "WebSite", label: "Web Page (Default)", icon: "🌐" },
  ];

  const handleSchemaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isSchemaAuto) dispatch(setIsSchemaAuto(false));
    dispatch(updateSeoData({ schema_custom: e.target.value }));
  };

  const handleUpdateSeo = (data: any) => {
    dispatch(updateSeoData(data));
  };

  const handleToggleAuto = () => {
    dispatch(setIsSchemaAuto(!isSchemaAuto));
  };

  const addSchemaTemplate = (type: string) => {
    let templateObj: any = {};
    
    if (type === 'FAQ') {
      templateObj = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is the question?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "This is the answer."
            }
          }
        ]
      };
    } else if (type === 'Product') {
       templateObj = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": "Product Name",
        "image": "",
        "description": "Product Description",
        "brand": {
          "@type": "Brand",
          "name": "Brand Name"
        },
        "offers": {
          "@type": "Offer",
          "url": "",
          "priceCurrency": "USD",
          "price": "0.00",
          "availability": "https://schema.org/InStock"
        }
       };
    } else if (type === 'Event') {
       templateObj = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": "Event Name",
        "startDate": "2026-12-31T20:00",
        "endDate": "2026-12-31T23:00",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "location": {
          "@type": "Place",
          "name": "Location Name",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 Main St",
            "addressLocality": "City",
            "postalCode": "12345",
            "addressRegion": "State",
            "addressCountry": "US"
          }
        }
      };
    } else if (type === 'HowTo') {
       templateObj = {
        "@context": "https://schema.org/",
        "@type": "HowTo",
        "name": "How to do something",
        "description": "A short description of the HowTo.",
        "step": [
          {
            "@type": "HowToStep",
            "text": "Step 1 description",
            "name": "Step 1"
          }
        ]
      };
    }

    try {
      let currentArr = [];
      if (resolvedSchema && resolvedSchema.trim() !== '') {
        const parsed = JSON.parse(resolvedSchema);
        currentArr = Array.isArray(parsed) ? parsed : [parsed];
      }
      currentArr.push(templateObj);
      const newJson = JSON.stringify(currentArr, null, 2);
      
      if (isSchemaAuto) dispatch(setIsSchemaAuto(false));
      dispatch(updateSeoData({ schema_custom: newJson }));
      
      setShowTemplates(false);
      toast.success(`${type} Schema appended!`);
    } catch (e) {
      toast.error("Current schema is invalid JSON. Please fix syntax errors before adding more.");
    }
  };

  return (
    <div className="seo-schema-tab">
      <div className="alert alert-info border-0 bg-primary bg-opacity-10 p-3 rounded-4 d-flex gap-3 mb-4">
        <AlertCircle size={20} className="text-primary flex-shrink-0" />
        <div className="small">
          <strong>Structured Data (JSON-LD)</strong> helps search engines
          understand your content better. We automatically generate this based
          on your page type, but you can override it or add multiple schemas manually.
        </div>
      </div>

      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <label className="form-label fw-bold small text-uppercase mb-0">
            Primary Auto-Schema Type
          </label>
          {isSchemaAuto && (
            <span className="badge rounded-pill bg-success bg-opacity-10 text-success x-small border border-success border-opacity-25">
              Auto-Generating {schemaTypes.find(t => t.value === (seoData?.schema_type || 'article'))?.label || 'Article'}
            </span>
          )}
        </div>

        <div className="row g-2">
          {schemaTypes.map((type) => (
            <div className="col-md-4 col-lg-3" key={type.value}>
              <div
                className={`p-3 rounded-4 border text-center cursor-pointer transition-all h-100 d-flex flex-column align-items-center justify-content-center gap-2 ${seoData?.schema_type === type.value ? "border-primary bg-primary bg-opacity-5 shadow-sm" : "border-light-subtle hover-bg-light"}`}
                onClick={() => handleUpdateSeo({ schema_type: type.value })}
                style={{ cursor: "pointer" }}
              >
                <span style={{ fontSize: "1.5rem" }}>{type.icon}</span>
                <span className="fw-bold x-small">{type.label}</span>
                {seoData?.schema_type === type.value && (
                  <div
                    className="bg-primary rounded-circle"
                    style={{ width: 6, height: 6 }}
                  ></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="my-5 opacity-10" />

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <label className="form-label fw-bold small text-uppercase mb-0">
              JSON-LD Schema Code
            </label>
            <button
              className={`btn btn-xs rounded-pill d-flex align-items-center gap-1 border-0 ${isSchemaAuto ? "bg-primary bg-opacity-10 text-primary" : "bg-warning bg-opacity-10 text-warning"}`}
              style={{ fontSize: "0.6rem", padding: "1px 8px" }}
              onClick={handleToggleAuto}
            >
              {isSchemaAuto ? (
                <>
                  <RefreshCw size={10} className="animate-spin-slow" />{" "}
                  Automated
                </>
              ) : (
                <>
                  <Lock size={10} /> Custom
                </>
              )}
            </button>
          </div>

          <div className="d-flex gap-2">
            <div className="position-relative">
              <button 
                className="btn btn-sm btn-dark rounded-pill x-small fw-bold d-flex align-items-center gap-1 px-3 shadow-sm"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                <Plus size={12} /> Add Schema Block <ChevronDown size={12} />
              </button>
              
              {showTemplates && (
                <div className="position-absolute end-0 top-100 mt-2 bg-white border rounded-3 shadow-lg z-3" style={{ minWidth: '200px' }}>
                  <div className="p-2 border-bottom x-small text-muted fw-bold text-uppercase">Append Template</div>
                  <div className="list-group list-group-flush rounded-3">
                    <button className="list-group-item list-group-item-action x-small py-2 border-0" onClick={() => addSchemaTemplate('FAQ')}>❓ FAQ Page Schema</button>
                    <button className="list-group-item list-group-item-action x-small py-2 border-0" onClick={() => addSchemaTemplate('Product')}>🛍️ Product Schema</button>
                    <button className="list-group-item list-group-item-action x-small py-2 border-0" onClick={() => addSchemaTemplate('Event')}>📅 Event Schema</button>
                    <button className="list-group-item list-group-item-action x-small py-2 border-0" onClick={() => addSchemaTemplate('HowTo')}>🛠️ How-To Schema</button>
                  </div>
                </div>
              )}
            </div>

            <a
              href="https://validator.schema.org/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-light border rounded-pill x-small d-flex align-items-center gap-1 opacity-75 hover-opacity-100"
            >
              Validate <ExternalLink size={10} />
            </a>
          </div>
        </div>

        <div className="position-relative w-100" style={{ height: '400px' }}>
          <textarea
            id="schema-editor"
            className={`form-control font-monospace x-small p-4 h-100 w-100 ${isSchemaAuto ? "bg-dark text-white opacity-75" : "bg-dark text-success shadow-lg"}`}
            value={resolvedSchema}
            onChange={handleSchemaChange}
            style={{
              lineHeight: "1.6",
              borderRadius: "1rem",
              resize: "none",
            }}
          ></textarea>
          {isSchemaAuto && (
            <div className="position-absolute top-50 start-50 translate-middle text-center pe-none bg-dark bg-opacity-75 p-4 rounded-4 w-75 border border-secondary border-opacity-25">
              <RefreshCw size={24} className="text-white opacity-50 mb-2 animate-spin-slow" />
              <h6 className="text-white fw-bold">Auto-Generated Schema</h6>
              <p className="text-white opacity-50 x-small mb-0">Click "Custom" or "Add Schema Block" to unlock and edit.</p>
            </div>
          )}
        </div>

        <div className="mt-3 p-3 rounded-4 bg-light border-0">
          <div className="d-flex align-items-start gap-2">
            <Settings size={14} className="text-muted mt-1 flex-shrink-0" />
            <div className="x-small text-muted">
              {isSchemaAuto
                ? "This schema is updated in real-time as you change your content. It uses standard JSON-LD structure based on your selected type."
                : "You are currently using Custom Schema. If you provide an array [ ], you can include multiple schema types for this page."}
            </div>
          </div>
        </div>
      </div>

      {showTemplates && (
        <div className="position-fixed top-0 start-0 w-100 h-100 z-2" onClick={() => setShowTemplates(false)}></div>
      )}

      <style jsx>{`
        .x-small {
          font-size: 0.7rem;
        }
        .hover-bg-light:hover {
          background-color: #f8f9fa;
          border-color: #dee2e6 !important;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .font-monospace {
          font-family:
            "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace !important;
        }
        .z-3 {
          z-index: 1000;
        }
        .z-2 {
          z-index: 999;
        }
      `}</style>
    </div>
  );
}
