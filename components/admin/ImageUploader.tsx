"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  CheckCircle2,
  Loader2,
  X,
  FileText,
  Camera,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  category?: string;
  title?: string;
  label?: string;
  variant?: "default" | "compact" | "avatar";
  accept?: string;
  helperText?: string;
  minImageSizeKb?: number;
  maxImageSizeKb?: number;
  maxPdfSizeKb?: number;
  enforceSizeLimits?: boolean;
}

export default function ImageUploader({
  value,
  onChange,
  category = "OTHER",
  title = "",
  label = "Upload Image File",
  variant = "default",
  accept = "image/*,application/pdf",
  helperText,
  minImageSizeKb = 20,
  maxImageSizeKb = 50,
  maxPdfSizeKb = 500,
  enforceSizeLimits = true,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPdf = Boolean(value && (value.endsWith(".pdf") || value.includes("application/pdf") || value.toLowerCase().includes(".pdf")));
  const isKycOrStaff = category.startsWith("KYC") || category.startsWith("STAFF") || variant === "avatar" || variant === "compact";

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const sizeKb = Number((file.size / 1024).toFixed(1));
    const isImage = file.type.startsWith("image/");
    const isPdfFile = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    // Enforce size constraints: Image 20-50 KB for KYC/Staff, PDF max 500 KB
    if (isKycOrStaff || enforceSizeLimits) {
      if (isImage) {
        if (sizeKb < minImageSizeKb) {
          setError(`Image size is too small (${sizeKb} KB). Image must be between ${minImageSizeKb} KB and ${maxImageSizeKb} KB.`);
          return;
        }
        if (sizeKb > maxImageSizeKb) {
          setError(`Image size is too large (${sizeKb} KB). Image must be between ${minImageSizeKb} KB and ${maxImageSizeKb} KB.`);
          return;
        }
      } else if (isPdfFile) {
        if (sizeKb > maxPdfSizeKb) {
          setError(`PDF size exceeds limit (${sizeKb} KB). PDF document must be max ${maxPdfSizeKb} KB.`);
          return;
        }
      }
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("title", title || file.name);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || "Failed to upload file.");
      }
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please check network connection.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // ─── 1. AVATAR VARIANT (Profile Photo) ───
  if (variant === "avatar") {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="crm-label flex items-center justify-between">
            <span>{label}</span>
            {value && <span className="text-[10px] text-emerald-700 font-bold">✓ Uploaded</span>}
          </label>
        )}
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          <div className="relative group shrink-0">
            {value ? (
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-amber-300 shadow-md relative">
                <img src={value} alt="Profile Avatar" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                  title="Remove Photo"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-16 h-16 rounded-2xl bg-amber-50/80 border-2 border-dashed border-amber-300 hover:border-amber-500 flex flex-col items-center justify-center text-amber-700 hover:bg-amber-100/70 transition-all cursor-pointer shadow-xs group"
                title="Click to upload profile photo (20KB - 50KB)"
              >
                {uploading ? (
                  <Loader2 size={18} className="animate-spin text-amber-700" />
                ) : (
                  <>
                    <Camera size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold mt-0.5">Upload</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs font-bold text-slate-800 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Upload size={13} className="text-amber-700" />
              <span>{value ? "Change Profile Photo" : "Upload Staff Photo"}</span>
            </button>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Size limit: <span className="text-amber-900 font-bold">20 KB – 50 KB</span> (JPG, PNG, WebP)
            </p>
            {error && (
              <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                <AlertCircle size={12} className="shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── 2. COMPACT DOCUMENT VARIANT (PAN & Aadhaar KYC Docs) ───
  if (variant === "compact") {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="crm-label flex items-center justify-between">
            <span>{label}</span>
            {value && <span className="text-[10px] text-emerald-700 font-bold">✓ Attached</span>}
          </label>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        {value ? (
          <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
                {isPdf ? <FileText size={15} /> : <ImageIcon size={15} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {isPdf ? "PDF Document" : "Image Document"}
                  </span>
                  <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                    R2 Cloud
                  </span>
                </div>
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-amber-900 hover:underline font-semibold flex items-center gap-1 mt-0.5 truncate"
                >
                  <ExternalLink size={10} />
                  <span className="truncate">{value}</span>
                </a>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 cursor-pointer shadow-2xs"
                title="Change File"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                title="Remove File"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-between gap-2 ${
              dragActive
                ? "border-amber-500 bg-amber-50"
                : "border-slate-300 hover:border-amber-400 bg-slate-50/70 hover:bg-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {uploading ? "Uploading to Cloud..." : "Upload Document"}
                </p>
                <p className="text-[10px] text-slate-500">
                  Image: <span className="font-semibold text-amber-900">20–50 KB</span> | PDF: <span className="font-semibold text-amber-900">Max 500 KB</span>
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-1 rounded-lg border border-amber-200">
              Browse
            </span>
          </div>
        )}

        {error && (
          <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
            <AlertCircle size={12} className="shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }

  // ─── 3. DEFAULT BANNER VARIANT ───
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2.5 flex items-center gap-4 shadow-sm">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-200 shadow-inner">
            {isPdf ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50 text-rose-700">
                <FileText size={24} />
                <span className="text-[9px] font-bold mt-1">PDF</span>
              </div>
            ) : (
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Uploaded Successfully</span>
            </div>
            <p className="text-slate-500 text-[11px] font-mono truncate">{value}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-200/70 transition-colors cursor-pointer"
            title="Remove / Change Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? "border-amber-500 bg-amber-50/70 shadow-sm"
              : "border-slate-300 bg-slate-50/70 hover:border-slate-400 hover:bg-white shadow-sm"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          {uploading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
              <p className="text-xs text-amber-800 font-medium">Uploading to cloud storage...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Click to browse or drag &amp; drop file
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {helperText || "Image: 20 KB – 50 KB | PDF: Max 500 KB"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
          <AlertCircle size={12} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
