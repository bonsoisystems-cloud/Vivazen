"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Search,
  X,
  UploadCloud
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface ImageAsset {
  id: string;
  name: string;
  url: string;
  category: string;
  alt?: string | null;
  detail?: string | null;
  order: number;
}

const CATEGORIES = [
  { value: "ALL", label: "All Images" },
  { value: "HERO", label: "Hero Slider" },
  { value: "GALLERY_HAIR", label: "Gallery: Hair" },
  { value: "GALLERY_BRIDAL", label: "Gallery: Bridal" },
  { value: "GALLERY_NAIL", label: "Gallery: Nail" },
  { value: "GALLERY_SKIN", label: "Gallery: Skin" },
  { value: "GALLERY_MAKEUP", label: "Gallery: Makeup" },
  { value: "INTERIOR", label: "Sanctuary Interior" },
  { value: "OFFER", label: "Offers Banner" },
  { value: "SERVICE_ICON", label: "Service Icons" },
  { value: "OTHER", label: "Other Assets" },
];

export default function AdminImagesPage() {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("MANAGER");

  const [modal, setModal] = useState<{
    open: boolean;
    isEdit: boolean;
    data: Partial<ImageAsset>;
  }>({ open: false, isEdit: false, data: {} });

  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadImages = async () => {
    try {
      setLoading(true);
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.user) setUserRole(authData.user.role);
      }

      const url = activeCategory === "ALL" ? "/api/images" : `/api/images?category=${activeCategory}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setImages(data.data);
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load image assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [activeCategory]);

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast("success", "Image URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveImage = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isEdit, data } = modal;

    if (!data.name || !data.url) {
      showToast("error", "Please provide image file / URL and title");
      return;
    }

    try {
      const res = await fetch("/api/images", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        showToast("success", isEdit ? "Image updated successfully" : "Image registered successfully");
        setModal({ open: false, isEdit: false, data: {} });
        loadImages();
      } else {
        showToast("error", result.error || "Failed to save image");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to communicate with server");
    }
  };

  const handleDeleteImage = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from image assets?`)) return;

    try {
      const res = await fetch(`/api/images?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        showToast("success", "Image asset removed");
        loadImages();
      } else {
        showToast("error", result.error || "Failed to delete image");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to communicate with server");
    }
  };

  const filteredImages = images.filter((img) => {
    const q = search.toLowerCase();
    return (
      img.name.toLowerCase().includes(q) ||
      (img.alt && img.alt.toLowerCase().includes(q)) ||
      (img.detail && img.detail.toLowerCase().includes(q)) ||
      img.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold ${
            notification.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-700">
              <ImageIcon className="w-6 h-6" />
            </div>
            Image Asset Vault
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Upload, organize, and manage image assets and gallery categories.
          </p>
        </div>

        <button
          onClick={() =>
            setModal({
              open: true,
              isEdit: false,
              data: {
                category: activeCategory === "ALL" ? "GALLERY_HAIR" : activeCategory,
                order: 0,
              },
            })
          }
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          Upload Image
        </button>
      </div>

      {/* Controls: Category Filter + Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, alt text, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white transition-all"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap gap-1.5 max-w-2xl overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                activeCategory === cat.value
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="p-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 tracking-wider uppercase font-medium">Loading Image Assets...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-slate-300 rounded-3xl bg-white space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-700 font-serif text-lg">No image assets found</p>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            {search
              ? "Try adjusting your search query or filter."
              : "Upload an image file directly to register it in this category."}
          </p>
          <button
            onClick={() =>
              setModal({
                open: true,
                isEdit: false,
                data: { category: activeCategory === "ALL" ? "GALLERY_HAIR" : activeCategory },
              })
            }
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 inline-flex items-center gap-2 mt-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload Image Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              {/* Image Preview Box */}
              <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.alt || image.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyUrl(image.url, image.id)}
                    className="p-1.5 rounded-lg bg-white/90 backdrop-blur-xs text-slate-700 hover:bg-amber-600 hover:text-white transition-colors shadow-xs cursor-pointer"
                    title="Copy Image URL"
                  >
                    {copiedId === image.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white/90 backdrop-blur-xs text-slate-700 hover:bg-slate-900 hover:text-white transition-colors shadow-xs"
                    title="Open Image"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider text-slate-700 shadow-xs">
                  {image.category.replace("GALLERY_", "")}
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-3">
                <p className="text-xs font-bold text-slate-900 truncate" title={image.name}>
                  {image.name}
                </p>
                {image.detail && (
                  <p className="text-[10px] text-slate-500 truncate mt-0.5" title={image.detail}>
                    {image.detail}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setModal({ open: true, isEdit: true, data: image })}
                    className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Edit Details"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  {userRole === "ADMIN" && (
                    <button
                      onClick={() => handleDeleteImage(image.id, image.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* In-Page Form */}
      {modal.open && (
        <div className="crm-card max-w-4xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-700" />
              <span>{modal.isEdit ? "Edit Image Details" : "Upload New Asset Image"}</span>
            </h3>
            <button
              onClick={() => setModal({ open: false, isEdit: false, data: {} })}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveImage} className="space-y-4 text-xs">
            {/* Direct File Upload */}
            <ImageUploader
              value={modal.data.url || ""}
              onChange={(url) => setModal({ ...modal, data: { ...modal.data, url } })}
              category={modal.data.category || "GALLERY_HAIR"}
              title={modal.data.name || ""}
              label="Choose / Upload Image File"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="crm-label">
                  Image Title / Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bridal HD Glow Look"
                  value={modal.data.name || ""}
                  onChange={(e) =>
                    setModal({ ...modal, data: { ...modal.data, name: e.target.value } })
                  }
                  className="crm-input text-xs font-bold"
                />
              </div>

              <div>
                <label className="crm-label">
                  Category
                </label>
                <select
                  value={modal.data.category || "GALLERY_HAIR"}
                  onChange={(e) =>
                    setModal({ ...modal, data: { ...modal.data, category: e.target.value } })
                  }
                  className="crm-select text-xs font-semibold"
                >
                  {CATEGORIES.filter((c) => c.value !== "ALL").map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="crm-label">
                  Alt Text (SEO &amp; Accessibility)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elegant Bridal Makeup Styling"
                  value={modal.data.alt || ""}
                  onChange={(e) =>
                    setModal({ ...modal, data: { ...modal.data, alt: e.target.value } })
                  }
                  className="crm-input text-xs"
                />
              </div>

              <div>
                <label className="crm-label">
                  Subtitle / Detail Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Classic bridal makeup with soft glam finish"
                  value={modal.data.detail || ""}
                  onChange={(e) =>
                    setModal({ ...modal, data: { ...modal.data, detail: e.target.value } })
                  }
                  className="crm-input text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModal({ open: false, isEdit: false, data: {} })}
                className="btn-outline text-xs px-4 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer"
              >
                {modal.isEdit ? "Update Image" : "Save to Vault"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
