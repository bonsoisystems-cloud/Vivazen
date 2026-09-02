"use client";

import { useState, useMemo, useEffect } from "react";
import { Tag, Plus, Trash2, Edit2, X, Percent } from "lucide-react";

export default function AdminCouponsPage() {
  const [data, setData] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<any>({
    code: "",
    discount: 20,
    discountType: "%",
    minBill: 1000,
    maxDiscount: 500,
    perUser: 1,
    validTill: "2026-12-31",
    rewardPoints: 50,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/crm/coupons");
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

  const saveCoupon = async () => {
    if (!form.code.trim() || !form.discount) return alert("Code and discount are required.");

    try {
      const res = await fetch("/api/crm/coupons", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(form.id ? { id: form.id } : {}),
          ...form,
          code: form.code.toUpperCase().trim()
        })
      });
      const d = await res.json();
      if (d.success) {
        setShowAdd(false);
        setForm({
          code: "",
          discount: 20,
          discountType: "%",
          minBill: 1000,
          maxDiscount: 500,
          perUser: 1,
          validTill: "2026-12-31",
          rewardPoints: 50,
        });
        loadData();
      } else {
        alert(d.error || "Failed to save coupon");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const delCoupon = async (id: string) => {
    if (!confirm("Delete promo coupon?")) return;
    try {
      const res = await fetch(`/api/crm/coupons?id=${id}`, { method: "DELETE" });
      if (res.ok) loadData();
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
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">Promotional Coupons &amp; Vouchers</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">Create discount codes for festive campaigns, marketing promotions, and client loyalty.</p>
        </div>
        <button
          className="btn-gold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? <X size={14} /> : <Plus size={14} />}
          <span>{showAdd ? "Close Form" : "Create Promo Coupon"}</span>
        </button>
      </div>

      {/* ─── IN-PAGE EXPANDABLE: CREATE COUPON FORM ─── */}
      {showAdd && (
        <div className="crm-card max-w-4xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Percent className="w-4 h-4 text-amber-700" />
              <span>Create New Promo Voucher</span>
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
              <label className="crm-label">Coupon Code *</label>
              <input
                className="crm-input text-xs uppercase font-mono font-bold"
                placeholder="e.g. FESTIVE20"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Discount Value *</label>
              <input
                type="number"
                className="crm-input text-xs font-bold"
                value={form.discount || ""}
                onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="crm-label">Discount Type</label>
              <select
                className="crm-select text-xs font-semibold"
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              >
                <option value="%">Percentage (%)</option>
                <option value="₹">Flat Rupees (₹)</option>
              </select>
            </div>
            <div>
              <label className="crm-label">Minimum Bill Required (₹)</label>
              <input
                type="number"
                className="crm-input text-xs font-bold"
                value={form.minBill || ""}
                onChange={(e) => setForm({ ...form, minBill: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="crm-label">Max Discount Cap (₹)</label>
              <input
                type="number"
                className="crm-input text-xs font-bold"
                value={form.maxDiscount || ""}
                onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="crm-label">Per-User Limit</label>
              <input
                type="number"
                className="crm-input text-xs font-bold"
                value={form.perUser || ""}
                onChange={(e) => setForm({ ...form, perUser: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="crm-label">Valid Till Date</label>
              <input
                type="date"
                className="crm-input text-xs font-semibold"
                value={form.validTill}
                onChange={(e) => setForm({ ...form, validTill: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button className="btn-outline text-xs px-4 cursor-pointer" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer" onClick={saveCoupon}>
              Save Promo Coupon
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="crm-card bg-gradient-to-br from-amber-50 to-white border border-amber-200/80 p-4">
          <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Active Promo Codes</p>
          <p className="text-2xl font-black text-slate-900 mt-2">{data.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Configured voucher campaigns</p>
        </div>
        <div className="crm-card bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/80 p-4">
          <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">Avg Discount Rate</p>
          <p className="text-2xl font-black text-emerald-800 mt-2">
            {data.length > 0 ? Math.round(data.reduce((s, c) => s + Number(c.discount || 0), 0) / data.length) : 0}%
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Campaign average</p>
        </div>
        <div className="crm-card bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Avg Min Spend</p>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {formatCurrency(data.length > 0 ? Math.round(data.reduce((s, c) => s + Number(c.minBill || 0), 0) / data.length) : 0)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Threshold requirement</p>
        </div>
      </div>

      {/* Table */}
      <div className="crm-card overflow-x-auto">
        {data.length === 0 ? (
          <div className="text-center py-14">
            <Tag size={36} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-bold text-sm">No Promotional Coupons Created</p>
            <p className="text-slate-400 text-xs mt-0.5">Create discount vouchers using the 'Create Promo Coupon' button.</p>
          </div>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount Value</th>
                <th>Min Bill Condition</th>
                <th>Max Discount Cap</th>
                <th>Per-User Limit</th>
                <th>Valid Till</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="font-mono font-bold text-amber-900 text-sm">{c.code}</td>
                  <td className="text-emerald-700 font-bold text-xs">{c.discount}{c.discountType}</td>
                  <td className="text-slate-600 text-xs font-semibold">{c.minBill > 0 ? formatCurrency(c.minBill) : "None"}</td>
                  <td className="text-slate-600 text-xs font-semibold">{c.maxDiscount > 0 ? formatCurrency(c.maxDiscount) : "No Cap"}</td>
                  <td className="text-slate-500 text-xs">{c.perUser} times</td>
                  <td className="text-slate-600 text-xs font-semibold whitespace-nowrap">{c.validTill}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                        onClick={() => {
                          setForm({
                            id: c.id,
                            code: c.code,
                            discount: c.discount,
                            discountType: c.discountType || "%",
                            minBill: c.minBill || 0,
                            maxDiscount: c.maxDiscount || 0,
                            perUser: c.perUser || 1,
                            validTill: c.validTill || "2026-12-31",
                            rewardPoints: c.rewardPoints || 0,
                          });
                          setShowAdd(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        title="Edit Promo Coupon"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button className="btn-danger p-1.5 cursor-pointer" onClick={() => delCoupon(c.id)} title="Delete Coupon">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
