"use client";

import { useState, useEffect } from "react";
import { Zap, Plus, Trash2, X, MessageSquare, Bell } from "lucide-react";

export default function AdminRemindersPage() {
  const [data, setData] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    serviceId: "",
    serviceName: "General Hair Cut & Styling",
    afterDays: 30,
    template: "Hello [ClientName], it has been a month since your last hair treatment at Vivazen Beauty Salon! Book your next appointment now for a refreshing look: 7617079955.",
    channel: "WhatsApp",
    status: "Active",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [rRes, sRes] = await Promise.all([
        fetch("/api/crm/reminders"),
        fetch("/api/services")
      ]);

      if (rRes.ok) {
        const d = await rRes.json();
        if (d.success) setData(d.data || []);
      }
      if (sRes.ok) {
        const d = await sRes.json();
        const flat: any[] = [];
        (d.data || []).forEach((cat: any) => {
          (cat.subcategories || []).forEach((sub: any) => {
            (sub.items || []).forEach((itm: any) => {
              flat.push({ id: itm.id, name: `${itm.name} (${cat.name})` });
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

  const saveReminder = async () => {
    if (!form.serviceName || !form.afterDays) return alert("Service and days interval are required.");

    try {
      const res = await fetch("/api/crm/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const d = await res.json();
      if (d.success) {
        setShowAdd(false);
        setForm({
          serviceId: "",
          serviceName: "General Hair Cut & Styling",
          afterDays: 30,
          template: "Hello [ClientName], it has been a month since your last hair treatment at Vivazen Beauty Salon! Book your next appointment now for a refreshing look: 7617079955.",
          channel: "WhatsApp",
          status: "Active",
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "Active" ? "Paused" : "Active";
    try {
      const res = await fetch(`/api/crm/reminders?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next })
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const delReminder = async (id: string) => {
    if (!confirm("Delete reminder trigger?")) return;
    try {
      const res = await fetch(`/api/crm/reminders?id=${id}`, { method: "DELETE" });
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
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">Automated Service Reminders</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Configure automated WhatsApp/SMS recall triggers for facials, hair spas, root touch-ups, and manicures.
          </p>
        </div>
        <button
          className="btn-gold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? <X size={14} /> : <Plus size={14} />}
          <span>{showAdd ? "Close Form" : "Create Reminder Trigger"}</span>
        </button>
      </div>

      {/* ─── IN-PAGE EXPANDABLE: CREATE REMINDER FORM ─── */}
      {showAdd && (
        <div className="crm-card max-w-4xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-700" />
              <span>Create Re-Service Automated Trigger</span>
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
              <label className="crm-label">Associated Service</label>
              <select
                className="crm-select text-xs font-semibold"
                value={form.serviceId}
                onChange={(e) => {
                  const s = services.find(sv => sv.id === e.target.value);
                  setForm({ ...form, serviceId: e.target.value, serviceName: s?.name || "General Service" });
                }}
              >
                <option value="">-- All General Services --</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="crm-label">Trigger Interval (Days) *</label>
              <input
                type="number"
                className="crm-input text-xs font-bold"
                value={form.afterDays}
                onChange={(e) => setForm({ ...form, afterDays: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="crm-label">Communication Channel</label>
              <select
                className="crm-select text-xs font-semibold"
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
              >
                <option>WhatsApp</option>
                <option>SMS</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="crm-label">Notification Message Template</label>
              <textarea
                className="crm-input text-xs"
                rows={2}
                value={form.template}
                onChange={(e) => setForm({ ...form, template: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button className="btn-outline text-xs px-4 cursor-pointer" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer" onClick={saveReminder}>
              Save Reminder Trigger
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="crm-card overflow-x-auto">
        {data.length === 0 ? (
          <div className="text-center py-14">
            <Zap size={36} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-bold text-sm">No Re-Service Reminders Configured</p>
            <p className="text-slate-400 text-xs mt-0.5">Automate client retention by creating periodic service reminders.</p>
          </div>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Trigger Interval</th>
                <th>Channel</th>
                <th>Message Content Template</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="font-bold text-slate-800 text-sm">{r.serviceName}</td>
                  <td className="font-bold text-amber-900 text-xs">Every {r.afterDays} days</td>
                  <td><span className="badge badge-purple">{r.channel}</span></td>
                  <td className="text-slate-600 text-xs max-w-sm truncate">{r.template}</td>
                  <td>
                    <button
                      onClick={() => toggleStatus(r.id, r.status)}
                      className={`badge cursor-pointer ${r.status === 'Active' ? 'badge-green' : 'badge-gray'}`}
                    >
                      {r.status}
                    </button>
                  </td>
                  <td className="text-right">
                    <button className="btn-danger p-1.5 cursor-pointer" onClick={() => delReminder(r.id)}>
                      <Trash2 size={12} />
                    </button>
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
