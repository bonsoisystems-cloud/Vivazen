"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { SlidersHorizontal, Plus, Edit2, Trash2, X, AlertCircle } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  tagline: string;
  order: number;
}

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("MANAGER");
  const [modal, setModal] = useState<{ open: boolean; isEdit: boolean; data: Partial<HeroSlide> }>({
    open: false,
    isEdit: false,
    data: {},
  });
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadSlides = async () => {
    try {
      setLoading(true);
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.user) setUserRole(authData.user.role);
      }

      const res = await fetch("/api/hero-slides");
      const data = await res.json();
      if (data.success) {
        setSlides(data.data);
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to load hero slides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isEdit, data } = modal;

    if (!data.image || !data.alt || !data.tagline) {
      showToast("error", "All fields are required");
      return;
    }

    try {
      const res = await fetch("/api/hero-slides", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        showToast("success", isEdit ? "Slide updated successfully" : "Slide added successfully");
        setModal({ open: false, isEdit: false, data: {} });
        loadSlides();
      } else {
        showToast("error", result.error || "Failed to save slide");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error occurred");
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero slide?")) return;
    try {
      const res = await fetch(`/api/hero-slides?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        showToast("success", "Slide deleted successfully");
        loadSlides();
      } else {
        showToast("error", result.error || "Failed to delete slide");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error occurred");
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-700">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            Hero Slides Manager
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Manage the full-screen slideshow images and animated headlines on the homepage.
          </p>
        </div>

        <button
          onClick={() => {
            setModal({
              open: true,
              isEdit: false,
              data: { image: "", alt: "", tagline: "", order: slides.length + 1 },
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slide</span>
        </button>
      </div>

      {/* In-Page Form (Create / Edit) */}
      {modal.open && (
        <div className="crm-card max-w-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-700" />
              <span>{modal.isEdit ? "Edit Hero Slide" : "Create New Hero Slide"}</span>
            </h3>
            <button
              onClick={() => setModal({ open: false, isEdit: false, data: {} })}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveSlide} className="space-y-4 text-xs">
            <ImageUploader
              value={modal.data.image || ""}
              onChange={(url) => setModal({ ...modal, data: { ...modal.data, image: url } })}
              category="HERO"
              title={modal.data.alt || "Hero Slide"}
              label="Slide Background Image"
            />

            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase tracking-wider">
                Alt / Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hair Styling, Bridal Beauty"
                value={modal.data.alt || ""}
                onChange={(e) => setModal({ ...modal, data: { ...modal.data, alt: e.target.value } })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase tracking-wider">
                Tagline
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Where Beauty Meets Art"
                value={modal.data.tagline || ""}
                onChange={(e) => setModal({ ...modal, data: { ...modal.data, tagline: e.target.value } })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white"
              />
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
                {modal.isEdit ? "Update Slide" : "Save Slide"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 tracking-wider uppercase font-medium">Loading Slides...</p>
        </div>
      ) : slides.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs">
          <p className="text-slate-500 text-sm">No hero slides found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full bg-slate-100">
                <Image src={slide.image} alt={slide.alt} fill className="object-cover" />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-amber-800 shadow-xs">
                  Slide #{idx + 1}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">{slide.alt}</h3>
                <p className="text-xs text-slate-500 italic">"{slide.tagline}"</p>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setModal({ open: true, isEdit: true, data: slide });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Edit Slide"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {userRole === "ADMIN" && (
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
