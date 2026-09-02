"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, Trash2, MapPin, Phone, Clock, X } from "lucide-react";

export default function AdminBranchesPage() {
  const [data, setData] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    gst: "",
    hours: "10:00-20:00",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/crm/branches");
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

  const saveBranch = async () => {
    if (!form.name.trim() || !form.phone.trim()) return alert("Branch name and phone number are required.");

    try {
      const res = await fetch("/api/crm/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const d = await res.json();
      if (d.success) {
        setShowAdd(false);
        setForm({
          name: "",
          address: "",
          phone: "",
          email: "",
          gst: "",
          hours: "10:00-20:00",
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const delBranch = async (id: string) => {
    if (!confirm("Delete branch location?")) return;
    try {
      const res = await fetch(`/api/crm/branches?id=${id}`, { method: "DELETE" });
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
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">Salon Branch Locations</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Manage multi-branch salon properties, operating schedules, GSTINs, and contact information.
          </p>
        </div>
        <button
          className="btn-gold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? <X size={14} /> : <Plus size={14} />}
          <span>{showAdd ? "Close Form" : "Add Branch Location"}</span>
        </button>
      </div>

      {/* ─── IN-PAGE EXPANDABLE: REGISTER BRANCH FORM ─── */}
      {showAdd && (
        <div className="crm-card max-w-4xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-700" />
              <span>Register New Branch Location</span>
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
              <label className="crm-label">Branch Name *</label>
              <input
                className="crm-input text-xs font-bold"
                placeholder="e.g. Vivazen Varanasi Cantt"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Contact Phone *</label>
              <input
                className="crm-input text-xs font-bold"
                placeholder="10-digit mobile"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Email Address</label>
              <input
                type="email"
                className="crm-input text-xs"
                placeholder="branch@vivazen.in"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Operating Hours</label>
              <input
                className="crm-input text-xs font-semibold"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">GSTIN Number</label>
              <input
                className="crm-input text-xs font-mono uppercase font-bold"
                placeholder="09AABCV1234A1Z5"
                value={form.gst}
                onChange={(e) => setForm({ ...form, gst: e.target.value })}
              />
            </div>
            <div className="sm:col-span-3">
              <label className="crm-label">Full Street Address</label>
              <input
                className="crm-input text-xs"
                placeholder="Detailed street and landmark..."
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button className="btn-outline text-xs px-4 cursor-pointer" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer" onClick={saveBranch}>
              Save Branch Location
            </button>
          </div>
        </div>
      )}

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.map((b) => (
          <div key={b.id} className="crm-card space-y-4 hover:border-amber-300 transition-all shadow-xs">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                  <span className="badge badge-green mt-0.5">{b.status}</span>
                </div>
              </div>
              <button className="btn-danger p-1.5 cursor-pointer" onClick={() => delBranch(b.id)}>
                <Trash2 size={12} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-amber-800 shrink-0 mt-0.5" />
                <span>{b.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-amber-800" />
                <span className="font-semibold">{b.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-amber-800" />
                <span>{b.hours}</span>
              </div>
              {b.gst && (
                <div className="text-[11px] font-mono text-slate-500">
                  GST: <strong className="text-slate-800">{b.gst}</strong>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
