"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Plus, Trash2, X } from "lucide-react";

export default function AdminGalleryPage() {
  const [data, setData] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    category: "Bridal",
    url: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/crm/gallery");
      if (res.ok) {
        const d = await res.json();
        if (d.success) setData(d.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addImage = async () => {
    if (!form.title.trim() || !form.url.trim()) return alert("Title and URL required.");

    try {
      const res = await fetch("/api/crm/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const d = await res.json();
      if (d.success) {
        setShowAdd(false);
        setForm({ title: "", category: "Bridal", url: "" });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const delImage = async (id: string) => {
    if (!confirm("Delete image from gallery?")) return;
    try {
      const res = await fetch(`/api/crm/gallery?id=${id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">Website Photo Gallery</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Manage showcase images for Bridal, Hair, Skin, Nails, and Salon Interior portfolios.
          </p>
        </div>
        <button
          className="btn-gold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? <X size={14} /> : <Plus size={14} />}
          <span>{showAdd ? "Close Form" : "Add Gallery Image"}</span>
        </button>
      </div>

      {/* ─── IN-PAGE EXPANDABLE: ADD IMAGE FORM ─── */}
      {showAdd && (
        <div className="crm-card max-w-4xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-700" />
              <span>Add New Showcase Image</span>
            </h3>
            <button
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              onClick={() => setShowAdd(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="crm-label">Image Title *</label>
              <input
                className="crm-input text-xs font-bold"
                placeholder="e.g. Traditional Bridal Makeover"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Category</label>
              <select
                className="crm-select text-xs font-semibold"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Bridal</option>
                <option>Hair</option>
                <option>Skin</option>
                <option>Nails</option>
                <option>Interior</option>
              </select>
            </div>
            <div>
              <label className="crm-label">Direct Image URL *</label>
              <input
                className="crm-input text-xs"
                placeholder="https://images.unsplash.com/..."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button className="btn-outline text-xs px-4 cursor-pointer" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer" onClick={addImage}>
              Save to Gallery
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {data.map((img) => (
          <div key={img.id} className="crm-card p-0 overflow-hidden group hover:border-amber-300 transition-all shadow-xs">
            <div className="aspect-square relative bg-slate-100 overflow-hidden">
              <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute top-2 left-2">
                <span className="badge badge-gold font-bold text-[10px]">{img.category}</span>
              </div>
              <button
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm cursor-pointer"
                onClick={() => delImage(img.id)}
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="p-3">
              <p className="font-bold text-slate-800 text-xs truncate">{img.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
