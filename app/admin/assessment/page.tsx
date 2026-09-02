"use client";

import { useState, useEffect } from "react";
import { ClipboardCheck, Plus, Trash2, X, Star } from "lucide-react";

const today = new Date().toISOString().split("T")[0];

export default function AdminAssessmentPage() {
  const [data, setData] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    date: today,
    branchName: "Jaunpur Main Branch",
    cleanliness: 5,
    reception: 5,
    service: 5,
    punctuality: 5,
    display: 5,
    feedback: 5,
    targetMet: true,
    targetAmount: 35000,
    actualAmount: 42000,
    notes: "Flawless luxury salon experience recorded today.",
    submittedBy: "Branch Manager",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/crm/assessments");
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

  const saveAssessment = async () => {
    try {
      const res = await fetch("/api/crm/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const d = await res.json();
      if (d.success) {
        setShowAdd(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">Quality Audit Scorecards</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Internal daily audits for hygiene standards, hospitality protocols, staff punctuality, and target revenue tracking.
          </p>
        </div>
        <button
          className="btn-gold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? <X size={14} /> : <Plus size={14} />}
          <span>{showAdd ? "Close Form" : "Record Quality Audit"}</span>
        </button>
      </div>

      {/* ─── IN-PAGE EXPANDABLE: RECORD AUDIT FORM ─── */}
      {showAdd && (
        <div className="crm-card max-w-4xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-amber-700" />
              <span>Record Daily Quality Audit Scorecard</span>
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
              <label className="crm-label">Audit Date *</label>
              <input type="date" className="crm-input text-xs font-bold" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="crm-label">Branch Location</label>
              <input className="crm-input text-xs font-bold" value={form.branchName} onChange={(e) => setForm({ ...form, branchName: e.target.value })} />
            </div>
            <div>
              <label className="crm-label">Auditor Name / Role</label>
              <input className="crm-input text-xs font-medium" value={form.submittedBy} onChange={(e) => setForm({ ...form, submittedBy: e.target.value })} />
            </div>

            {[
              { label: "Hygiene & Cleanliness", key: "cleanliness" },
              { label: "Front Desk & Reception", key: "reception" },
              { label: "Service Protocol Quality", key: "service" },
              { label: "Staff Punctuality", key: "punctuality" },
            ].map((item) => (
              <div key={item.key}>
                <label className="crm-label">{item.label}</label>
                <select
                  className="crm-select text-xs font-semibold"
                  value={(form as any)[item.key]}
                  onChange={(e) => setForm({ ...form, [item.key]: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars {'★'.repeat(n)}</option>)}
                </select>
              </div>
            ))}

            <div>
              <label className="crm-label">Target Revenue (₹)</label>
              <input type="number" className="crm-input text-xs font-bold" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: Number(e.target.value) })} />
            </div>
            <div>
              <label className="crm-label">Actual Revenue (₹)</label>
              <input type="number" className="crm-input text-xs font-bold text-emerald-800" value={form.actualAmount} onChange={(e) => setForm({ ...form, actualAmount: Number(e.target.value) })} />
            </div>
            <div className="sm:col-span-3">
              <label className="crm-label">Auditor Observations &amp; Remarks</label>
              <input className="crm-input text-xs" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button className="btn-outline text-xs px-4 cursor-pointer" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer" onClick={saveAssessment}>
              Save Audit Scorecard
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="crm-card overflow-x-auto">
        {data.length === 0 ? (
          <div className="text-center py-14">
            <ClipboardCheck size={36} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-bold text-sm">No Quality Audits Recorded</p>
            <p className="text-slate-400 text-xs mt-0.5">Maintain excellence across operations by conducting daily inspections.</p>
          </div>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Audit Date</th>
                <th>Branch Location</th>
                <th>Hygiene</th>
                <th>Reception</th>
                <th>Service Quality</th>
                <th>Punctuality</th>
                <th>Daily Target</th>
                <th>Auditor</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="text-slate-600 text-xs font-semibold whitespace-nowrap">{a.date}</td>
                  <td className="font-bold text-slate-800 text-xs">{a.branchName}</td>
                  <td><div className="text-xs font-bold text-amber-900">{'★'.repeat(a.cleanliness)} ({a.cleanliness}/5)</div></td>
                  <td><div className="text-xs font-bold text-amber-900">{'★'.repeat(a.reception)} ({a.reception}/5)</div></td>
                  <td><div className="text-xs font-bold text-amber-900">{'★'.repeat(a.service)} ({a.service}/5)</div></td>
                  <td><div className="text-xs font-bold text-amber-900">{'★'.repeat(a.punctuality)} ({a.punctuality}/5)</div></td>
                  <td>
                    {a.targetMet ? (
                      <span className="badge badge-green font-bold">Target Met ({formatCurrency(a.actualAmount)})</span>
                    ) : (
                      <span className="badge badge-hot font-bold">Under Target</span>
                    )}
                  </td>
                  <td className="text-slate-600 text-xs">{a.submittedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
