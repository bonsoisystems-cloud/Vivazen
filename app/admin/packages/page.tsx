"use client";

import { useState, useEffect } from "react";
import { Package as PackageIcon, Plus, Trash2, Edit2, X, Sparkles } from "lucide-react";

export default function AdminPackagesPage() {
  const [data, setData] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<any>({
    name: "",
    durationDays: 90,
    validUpto: "2026-12-31",
    price: 3000,
    services: [{ serviceId: "", serviceName: "", qty: 1, price: 0 }]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, sRes] = await Promise.all([
        fetch("/api/crm/packages"),
        fetch("/api/services")
      ]);

      if (pRes.ok) {
        const d = await pRes.json();
        if (d.success) setData(d.data || []);
      }
      if (sRes.ok) {
        const d = await sRes.json();
        const flat: any[] = [];
        (d.data || []).forEach((cat: any) => {
          (cat.subcategories || []).forEach((sub: any) => {
            (sub.items || []).forEach((itm: any) => {
              flat.push({ id: itm.id, name: `${itm.name} (${cat.name})`, price: itm.price });
            });
          });
        });
        setServices(flat);
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

  const packageWorth = form.services.reduce((s: number, row: any) => s + (Number(row.price || 0) * Number(row.qty || 1)), 0);
  const totalSavings = packageWorth - form.price;
  const savingsPct = packageWorth > 0 ? Math.round((totalSavings / packageWorth) * 100) : 0;

  const addServiceRow = () => {
    setForm({
      ...form,
      services: [...form.services, { serviceId: "", serviceName: "", qty: 1, price: 0 }]
    });
  };

  const removeServiceRow = (idx: number) => {
    if (form.services.length <= 1) return;
    setForm({
      ...form,
      services: form.services.filter((_: any, i: number) => i !== idx)
    });
  };

  const updateRow = (idx: number, serviceId: string) => {
    const svc = services.find(s => s.id === serviceId);
    const copy = [...form.services];
    copy[idx] = {
      serviceId,
      serviceName: svc?.name || "",
      qty: copy[idx].qty || 1,
      price: svc?.price || 0
    };
    setForm({ ...form, services: copy });
  };

  const updateQty = (idx: number, qty: number) => {
    const copy = [...form.services];
    copy[idx].qty = Math.max(1, qty);
    setForm({ ...form, services: copy });
  };

  const savePackage = async () => {
    if (!form.name?.trim() || !form.price) return alert("Package name and price are required.");

    try {
      const res = await fetch("/api/crm/packages", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(form.id ? { id: form.id } : {}),
          name: form.name.trim(),
          originalPrice: packageWorth,
          price: form.price,
          durationDays: form.durationDays,
          validUpto: form.validUpto,
          items: form.services.filter((s: any) => s.serviceName)
        })
      });
      const d = await res.json();
      if (d.success) {
        setShowAdd(false);
        setForm({
          name: "",
          durationDays: 90,
          validUpto: "2026-12-31",
          price: 3000,
          services: [{ serviceId: "", serviceName: "", qty: 1, price: 0 }]
        });
        loadData();
      } else {
        alert(d.error || "Failed to save package");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const delPackage = async (id: string) => {
    if (!confirm("Delete package?")) return;
    try {
      const res = await fetch(`/api/crm/packages?id=${id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">
            Packages &amp; Bundles Builder
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Bundle multiple services into attractive promotional packages with validity limits from PostgreSQL database.
          </p>
        </div>
        <button
          className="btn-gold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? <X size={14} /> : <Plus size={14} />}
          <span>{showAdd ? "Close Form" : "Add Package Bundle"}</span>
        </button>
      </div>

      {/* ─── IN-PAGE EXPANDABLE: CREATE PACKAGE FORM ─── */}
      {showAdd && (
        <div className="crm-card max-w-4xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-5 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <PackageIcon className="w-4 h-4 text-amber-700" />
              <span>Create New Combination Package Bundle</span>
            </h3>
            <button
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              onClick={() => setShowAdd(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div className="sm:col-span-3">
              <label className="crm-label">Package Name *</label>
              <input
                className="crm-input text-xs font-bold"
                placeholder="e.g. Complete Bridal Glow Bundle"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Validity (Days)</label>
              <input
                type="number"
                className="crm-input text-xs font-bold"
                value={form.durationDays}
                onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="crm-label">Valid Upto Date</label>
              <input
                type="date"
                className="crm-input text-xs font-semibold"
                value={form.validUpto}
                onChange={(e) => setForm({ ...form, validUpto: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Special Bundle Price (₹) *</label>
              <input
                type="number"
                className="crm-input text-xs font-black text-amber-900"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Included Services Selector */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="crm-label text-slate-900 font-bold">Included Services &amp; Sessions</label>
              <button
                type="button"
                className="text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/80 cursor-pointer flex items-center gap-1"
                onClick={addServiceRow}
              >
                <Plus size={11} /> Add Service
              </button>
            </div>

            <div className="space-y-2.5">
              {form.services.map((row: any, idx: number) => (
                <div key={idx} className="grid grid-cols-12 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 items-end text-xs">
                  <div className="col-span-7">
                    <label className="crm-label">Select Service</label>
                    <select
                      className="crm-select text-xs font-semibold"
                      value={row.serviceId}
                      onChange={(e) => updateRow(idx, e.target.value)}
                    >
                      <option value="">-- Choose Service --</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.price)})</option>)}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="crm-label">Qty / Sessions</label>
                    <input
                      type="number"
                      min="1"
                      className="crm-input text-xs font-bold"
                      value={row.qty}
                      onChange={(e) => updateQty(idx, Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    {form.services.length > 1 && (
                      <button
                        type="button"
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                        onClick={() => removeServiceRow(idx)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Savings Banner */}
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between text-xs">
              <div>
                <span className="text-slate-600">Total Original Value: </span>
                <span className="line-through text-slate-500 font-bold">{formatCurrency(packageWorth)}</span>
              </div>
              <div className="font-bold text-amber-900">
                Customer Saves: {formatCurrency(totalSavings)} ({savingsPct}%)
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button className="btn-outline text-xs px-4 cursor-pointer" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer" onClick={savePackage}>
              Save Package Bundle
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="crm-card overflow-x-auto">
        {data.length === 0 ? (
          <div className="text-center py-14">
            <PackageIcon size={36} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-bold text-sm">No Package Bundles Configured</p>
            <p className="text-slate-400 text-xs mt-0.5">Create combination service packages using the 'Add Package Bundle' button.</p>
          </div>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Package Name</th>
                <th>Included Services</th>
                <th>Validity (Days)</th>
                <th>Valid Upto</th>
                <th>Original Worth</th>
                <th>Package Price</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="font-bold text-slate-800 text-sm">{p.name}</td>
                  <td className="text-slate-600 text-xs max-w-xs">
                    {Array.isArray(p.items) ? p.items.map((s: any) => `${s.serviceName || s.name} (${s.qty || 1}x)`).join(", ") : "-"}
                  </td>
                  <td className="text-slate-600 text-xs font-semibold">{p.durationDays || 90} days</td>
                  <td className="text-slate-600 text-xs font-semibold whitespace-nowrap">{p.validUpto || "2026-12-31"}</td>
                  <td className="text-slate-400 line-through text-xs font-bold">{formatCurrency(p.originalPrice)}</td>
                  <td className="font-black text-amber-900 text-sm">{formatCurrency(p.price)}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                        onClick={() => {
                          setForm({
                            id: p.id,
                            name: p.name,
                            durationDays: p.durationDays || 90,
                            validUpto: p.validUpto || "2026-12-31",
                            price: Number(p.price || 0),
                            services: Array.isArray(p.items) && p.items.length > 0
                              ? p.items.map((i: any) => ({
                                  serviceId: i.serviceId || i.id || "",
                                  serviceName: i.serviceName || i.name || "",
                                  qty: i.qty || 1,
                                  price: Number(i.price || 0),
                                }))
                              : [{ serviceId: "", serviceName: "", qty: 1, price: 0 }],
                          });
                          setShowAdd(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        title="Edit Package"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button className="btn-danger p-1.5 cursor-pointer" onClick={() => delPackage(p.id)} title="Delete Package">
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
