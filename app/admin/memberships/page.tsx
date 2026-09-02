"use client";

import { useState, useMemo, useEffect } from "react";
import { Award, Plus, Trash2, Edit2, X, Sparkles } from "lucide-react";

export default function AdminMembershipsPage() {
  const [data, setData] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<any>({
    name: "",
    price: 4999,
    durationDays: 365,
    rewardOnPurchase: 200,
    discountServices: 15,
    discountServicesType: "%",
    discountProducts: 10,
    discountProductsType: "%",
    discountPackages: 10,
    discountPackagesType: "%",
    pointsBoost: "1.5X",
    minPoints: 0,
    minBill: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/crm/memberships");
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

  const saveMembership = async () => {
    if (!form.name.trim() || !form.price) return alert("Name and price are required.");

    try {
      const res = await fetch("/api/crm/memberships", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const d = await res.json();
      if (d.success) {
        setShowAdd(false);
        setForm({
          name: "",
          price: 4999,
          durationDays: 365,
          rewardOnPurchase: 200,
          discountServices: 15,
          discountServicesType: "%",
          discountProducts: 10,
          discountProductsType: "%",
          discountPackages: 10,
          discountPackagesType: "%",
          pointsBoost: "1.5X",
          minPoints: 0,
          minBill: 0,
        });
        loadData();
      } else {
        alert(d.error || "Failed to save membership");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const delMembership = async (id: string) => {
    if (!confirm("Delete membership tier?")) return;
    try {
      const res = await fetch(`/api/crm/memberships?id=${id}`, { method: "DELETE" });
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
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">VIP Loyalty Memberships</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Configure client VIP loyalty tiers, service discounts, and reward multipliers in PostgreSQL.
          </p>
        </div>
        <button
          className="btn-gold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? <X size={14} /> : <Plus size={14} />}
          <span>{showAdd ? "Close Form" : "Add Membership Tier"}</span>
        </button>
      </div>

      {/* ─── IN-PAGE EXPANDABLE: CREATE MEMBERSHIP FORM ─── */}
      {showAdd && (
        <div className="crm-card max-w-4xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-700" />
              <span>Create New VIP Membership Tier</span>
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
              <label className="crm-label">Tier Name *</label>
              <input
                className="crm-input text-xs font-bold"
                placeholder="e.g. VIP Gold Tier"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Price (₹) *</label>
              <input
                type="number"
                className="crm-input text-xs font-bold"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="crm-label">Validity (Days)</label>
              <input
                type="number"
                className="crm-input text-xs font-semibold"
                value={form.durationDays || ""}
                onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="crm-label">Service Discount (%)</label>
              <input
                type="number"
                className="crm-input text-xs font-bold text-amber-900"
                value={form.discountServices || ""}
                onChange={(e) => setForm({ ...form, discountServices: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="crm-label">Product Discount (%)</label>
              <input
                type="number"
                className="crm-input text-xs font-bold text-amber-900"
                value={form.discountProducts || ""}
                onChange={(e) => setForm({ ...form, discountProducts: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="crm-label">Bonus Points on Purchase</label>
              <input
                type="number"
                className="crm-input text-xs font-semibold"
                value={form.rewardOnPurchase || ""}
                onChange={(e) => setForm({ ...form, rewardOnPurchase: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button className="btn-outline text-xs px-4 cursor-pointer" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer" onClick={saveMembership}>
              Save Membership Tier
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="crm-card bg-gradient-to-br from-amber-50 to-white border border-amber-200/80 p-4">
          <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Configured VIP Tiers</p>
          <p className="text-2xl font-black text-slate-900 mt-2">{data.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active tier programs</p>
        </div>
        <div className="crm-card bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/80 p-4">
          <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">Avg Service Benefit</p>
          <p className="text-2xl font-black text-emerald-800 mt-2">
            {data.length > 0 ? Math.round(data.reduce((s, m) => s + Number(m.discountServices || 0), 0) / data.length) : 0}%
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Member discount</p>
        </div>
        <div className="crm-card bg-gradient-to-br from-indigo-50 to-white border border-indigo-200/80 p-4">
          <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">Avg Tier Price</p>
          <p className="text-2xl font-black text-indigo-900 mt-2">
            {formatCurrency(data.length > 0 ? Math.round(data.reduce((s, m) => s + Number(m.price || 0), 0) / data.length) : 0)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Subscription fee</p>
        </div>
      </div>

      {/* Table */}
      <div className="crm-card overflow-x-auto">
        {data.length === 0 ? (
          <div className="text-center py-14">
            <Award size={36} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-bold text-sm">No Memberships Configured</p>
            <p className="text-slate-400 text-xs mt-0.5">Create loyalty tiers using the 'Add Membership Tier' button.</p>
          </div>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Tier Name</th>
                <th>Price</th>
                <th>Validity</th>
                <th>Services Disc.</th>
                <th>Products Disc.</th>
                <th>Packages Disc.</th>
                <th>Points Boost</th>
                <th>Points On Buy</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td>
                    <span className="badge badge-purple text-xs font-bold">
                      {m.name}
                    </span>
                  </td>
                  <td className="font-bold text-amber-900">{formatCurrency(m.price)}</td>
                  <td className="text-slate-600 text-xs font-semibold">{m.durationDays} days</td>
                  <td className="text-emerald-700 font-bold text-xs">{m.discountServices}{m.discountServicesType}</td>
                  <td className="text-emerald-700 font-bold text-xs">{m.discountProducts}{m.discountProductsType}</td>
                  <td className="text-emerald-700 font-bold text-xs">{m.discountPackages}{m.discountPackagesType}</td>
                  <td><span className="badge badge-gold font-bold">{m.pointsBoost}</span></td>
                  <td className="text-amber-800 font-semibold text-xs">{m.rewardOnPurchase} pts</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                        onClick={() => {
                          setForm({
                            id: m.id,
                            name: m.name,
                            price: Number(m.price || 0),
                            durationDays: Number(m.durationDays || 365),
                            rewardOnPurchase: Number(m.rewardOnPurchase || 0),
                            discountServices: Number(m.discountServices || 0),
                            discountServicesType: m.discountServicesType || "%",
                            discountProducts: Number(m.discountProducts || 0),
                            discountProductsType: m.discountProductsType || "%",
                            discountPackages: Number(m.discountPackages || 0),
                            discountPackagesType: m.discountPackagesType || "%",
                            pointsBoost: m.pointsBoost || "1X",
                            minPoints: Number(m.minPoints || 0),
                            minBill: Number(m.minBill || 0),
                          });
                          setShowAdd(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        title="Edit Membership Tier"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button className="btn-danger p-1.5 cursor-pointer" onClick={() => delMembership(m.id)} title="Delete Membership">
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
