"use client";

import { useState, useEffect } from "react";
import { ArrowLeftRight, Plus, Trash2, X, Truck } from "lucide-react";

export default function AdminTransfersPage() {
  const today = new Date().toISOString().split("T")[0];

  const [data, setData] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    date: today,
    type: "Stock Inventory",
    fromBranch: "Jaunpur Main",
    toBranch: "Varanasi Cantt",
    details: "",
    status: "Completed",
    by: "Super Admin",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/crm/transfers");
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

  const saveTransfer = async () => {
    if (!form.fromBranch.trim() || !form.toBranch.trim()) {
      return alert("Source and Destination branches are required.");
    }

    try {
      const res = await fetch("/api/crm/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const d = await res.json();
      if (d.success) {
        setShowAdd(false);
        setForm({
          date: today,
          type: "Stock Inventory",
          fromBranch: "Jaunpur Main",
          toBranch: "Varanasi Cantt",
          details: "",
          status: "Completed",
          by: "Super Admin",
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">Inter-Branch Transfers</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Audit inventory movements, equipment dispatches, and staff relocations between salon branches.
          </p>
        </div>
        <button
          className="btn-gold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? <X size={14} /> : <Plus size={14} />}
          <span>{showAdd ? "Close Form" : "Record New Transfer"}</span>
        </button>
      </div>

      {/* ─── IN-PAGE EXPANDABLE: RECORD TRANSFER FORM ─── */}
      {showAdd && (
        <div className="crm-card max-w-4xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-700" />
              <span>Record Inter-Branch Stock / Resource Transfer</span>
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
              <label className="crm-label">Transfer Type</label>
              <select
                className="crm-select text-xs font-semibold"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option>Stock Inventory</option>
                <option>Salon Equipment</option>
                <option>Staff Re-allocation</option>
                <option>Petty Cash Transfer</option>
              </select>
            </div>
            <div>
              <label className="crm-label">Source Branch *</label>
              <input
                className="crm-input text-xs font-bold"
                value={form.fromBranch}
                onChange={(e) => setForm({ ...form, fromBranch: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Destination Branch *</label>
              <input
                className="crm-input text-xs font-bold"
                value={form.toBranch}
                onChange={(e) => setForm({ ...form, toBranch: e.target.value })}
              />
            </div>
            <div className="sm:col-span-3">
              <label className="crm-label">Item / Personnel Details &amp; Quantity</label>
              <input
                className="crm-input text-xs"
                placeholder="e.g. 5x Loreal Serie Expert Shampoo 500ml..."
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button className="btn-outline text-xs px-4 cursor-pointer" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer" onClick={saveTransfer}>
              Save Transfer Record
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="crm-card overflow-x-auto">
        {data.length === 0 ? (
          <div className="text-center py-14">
            <ArrowLeftRight size={36} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-bold text-sm">No Inter-Branch Transfers Recorded</p>
            <p className="text-slate-400 text-xs mt-0.5">Use the 'Record New Transfer' button to log movements.</p>
          </div>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Transfer Type</th>
                <th>Source Branch</th>
                <th>Destination Branch</th>
                <th>Transfer Item Details</th>
                <th>Authorized By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="text-slate-600 text-xs whitespace-nowrap">{t.date}</td>
                  <td><span className="badge badge-purple">{t.type}</span></td>
                  <td className="font-bold text-slate-800 text-xs">{t.fromBranch}</td>
                  <td className="font-bold text-slate-800 text-xs">{t.toBranch}</td>
                  <td className="text-slate-700 text-xs max-w-xs">{typeof t.details === 'string' ? t.details : JSON.stringify(t.details)}</td>
                  <td className="text-slate-500 text-xs">{t.by}</td>
                  <td><span className="badge badge-green">{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
