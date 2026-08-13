"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { AxiosError } from "axios";
import { Field } from "@/types/acf";
import { ImageIcon, Code, Eye } from "lucide-react";
import MediaLibraryModal from "../../common/MediaLibraryModal";
import { mediaService, Media } from "@/services/media.service";
import toast from "react-hot-toast";

// Dynamically import ReactQuill with SSR disabled for Next.js App Router
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return function QuillComponent({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="d-flex align-items-center justify-content-center border rounded-3 bg-white" style={{ minHeight: "300px" }}>
        <div className="spinner-border spinner-border-sm text-secondary me-2" role="status"></div>
        <span className="text-muted small">Loading Editor...</span>
      </div>
    ),
  }
);

interface Props {
  field: Field;
  value: any;
  onChange: (value: any) => void;
  // See FieldRenderer/SelfUploadMediaField: when true, "Insert Image" uses
  // a direct upload-only picker instead of MediaLibraryModal, so the
  // founder portal (/my) never exposes browsing/deleting everyone else's
  // uploaded media through the rich text editor either.
  restrictedMediaUpload?: boolean;
}

export default function WysiwygField({ field, value, onChange, restrictedMediaUpload }: Props) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mode, setMode] = useState<"visual" | "code">("visual");
  const [isUploading, setIsUploading] = useState(false);
  const quillRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertImage = (item: Media) => {
    if (!item.url) return;
    if (mode === "visual" && quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);
      const index = range ? range.index : quill.getLength();
      quill.insertEmbed(index, "image", item.url);
    } else {
      // If in HTML code view, insert raw HTML tag at the end
      const imgTag = `<img src="${item.url}" alt="${item.original_name || 'image'}" />`;
      onChange((value || "") + imgTag);
    }
  };

  const handleSelectMedia = (media: Media | Media[]) => {
    const item = Array.isArray(media) ? media[0] : media;
    insertImage(item);
  };

  const handleSelfUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setIsUploading(true);
    try {
      const res = await mediaService.uploadMine(file);
      insertImage(res.data);
    } catch (err) {
      const message = err instanceof AxiosError ? err.response?.data?.message : undefined;
      toast.error(message || "Upload failed. Please try a different image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (content: string, delta: any, source: string) => {
    if (source === "user") {
      onChange(content);
    }
  };

  const modules = {
    toolbar: {
      container: [
        [{ font: [] }, { size: [] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ align: [] }],
        ["link", "image", "video"],
        ["clean"],
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    "font",
    "size",
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "color",
    "background",
    "script",
    "list",
    "indent",
    "direction",
    "align",
    "link",
    "image",
    "video",
  ];

  return (
    <div className="acf-quill-editor border rounded-3 overflow-hidden bg-white shadow-sm">
      {/* Editor Header Toolbar Controls */}
      <div className="bg-light border-bottom p-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <span className="text-muted small ps-1 fw-semibold" style={{ fontSize: "0.75rem" }}>
          {field.label || "Rich Text Editor"}
        </span>
        <div className="d-flex align-items-center gap-2">
          {/* Insert Image */}
          {restrictedMediaUpload ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleSelfUploadFile}
              />
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 py-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Insert an image from your device"
              >
                {isUploading ? <span className="spinner-border spinner-border-sm" role="status" /> : <ImageIcon size={13} />}
                <span style={{ fontSize: "0.72rem" }}>{isUploading ? "Uploading..." : "Insert Image"}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 py-1"
              onClick={() => setIsMediaModalOpen(true)}
              title="Insert from Media Library"
            >
              <ImageIcon size={13} />
              <span style={{ fontSize: "0.72rem" }}>Media Library</span>
            </button>
          )}

          {/* Mode Switchers */}
          <div className="btn-group btn-group-sm border rounded">
            <button
              type="button"
              className={`btn btn-sm border-0 d-flex align-items-center gap-1 ${
                mode === "visual" ? "btn-secondary text-white" : "btn-light text-muted"
              }`}
              onClick={() => setMode("visual")}
            >
              <Eye size={12} />
              <span style={{ fontSize: "0.7rem" }}>Visual</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm border-0 d-flex align-items-center gap-1 ${
                mode === "code" ? "btn-secondary text-white" : "btn-light text-muted"
              }`}
              onClick={() => setMode("code")}
            >
              <Code size={12} />
              <span style={{ fontSize: "0.7rem" }}>HTML</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content Area */}
      {mode === "visual" ? (
        <ReactQuill
          forwardedRef={quillRef}
          value={value || ""}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          theme="snow"
          placeholder="Start writing..."
        />
      ) : (
        <textarea
          className="form-control border-0 rounded-0 font-monospace"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{
            minHeight: "343px",
            fontSize: "0.85rem",
            boxShadow: "none",
            resize: "vertical",
            padding: "1.25rem",
            backgroundColor: "#2d2d2d",
            color: "#f8f8f2",
            lineHeight: "1.5",
          }}
          spellCheck={false}
        />
      )}

      {/* Footer Word/Status bar */}
      <div className="bg-light border-top px-3 py-1.5 d-flex justify-content-between align-items-center" style={{ fontSize: "0.65rem" }}>
        <span className="text-muted">
          {mode === "visual" ? "Visual Editor Mode" : "HTML Source Mode"}
        </span>
        <span className="text-muted fw-semibold">
          Words: {(value || "").replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length}
        </span>
      </div>

      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleSelectMedia}
        type="image"
        title="Insert Image"
      />

      <style jsx global>{`
        .ql-container.ql-snow {
          border: none !important;
          min-height: 300px;
          font-family: inherit !important;
        }
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #dee2e6 !important;
          background-color: #fcfcfc;
          padding: 6px 12px !important;
        }
        .ql-editor {
          min-height: 300px;
          font-size: 0.9rem !important;
          line-height: 1.6 !important;
          padding: 1.25rem !important;
        }
        .ql-editor p {
          margin-bottom: 1rem !important;
        }
        .ql-editor h1 { font-size: 2rem !important; font-weight: 700 !important; margin-bottom: 1.25rem !important; }
        .ql-editor h2 { font-size: 1.5rem !important; font-weight: 600 !important; margin-bottom: 1rem !important; }
        .ql-editor h3 { font-size: 1.25rem !important; font-weight: 600 !important; margin-bottom: 0.75rem !important; }
        .ql-editor img {
          max-width: 100%;
          height: auto;
          display: inline-block;
          margin: 10px 0;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
