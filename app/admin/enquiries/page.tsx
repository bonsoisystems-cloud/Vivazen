"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, Search, MessageSquare, Phone, Edit2 } from "lucide-react";

const today = new Date().toISOString().split("T")[0];

const leadStatuses = ["Hot", "Warm", "Cold", "Converted", "Lost"];
const leadSources = ["Walk-in", "Instagram", "Google", "Client Referral", "Facebook", "Website", "Pamphlet"];
const enquiryTypes = ["Bridal Package", "Hair Services", "Skin & Facial", "Makeup", "Nail Art", "General Inquiry"];

export default function AdminEnquiriesPage() {
  const [tab, setTab] = useState<"list" | "add">("list");
  const [data, setData] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<any>({
    clientName: "",
    phone: "",
    email: "",
    address: "",
    enquiryFor: "",
    enquiryType: "General Inquiry",
    response: "",
    followDate: today,
    source: "Walk-in",
    representative: "Front Desk",
    status: "Warm"
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eRes, stRes] = await Promise.all([
        fetch("/api/crm/enquiries"),
        fetch("/api/crm/staff")
      ]);

      if (eRes.ok) {
        const d = await eRes.json();
        if (d.success) setData(d.data || []);
      }
      if (stRes.ok) {
        const d = await stRes.json();
        if (d.success) {
          const list: any[] = [];
          if (d.data?.providers) list.push(...d.data.providers);
          if (d.data?.employees) list.push(...d.data.employees);
          setStaff(list);
        }
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

  const save = async () => {
    if (!form.clientName?.trim() || !form.phone?.trim()) {
      return alert("Client name and contact phone are required.");
    }

    try {
      const method = editId ? "PUT" : "POST";
      const payload = editId ? { ...form, id: editId } : form;

      const res = await fetch("/api/crm/enquiries", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (resData.success) {
        setForm({
          clientName: "",
          phone: "",
          email: "",
          address: "",
          enquiryFor: "",
          enquiryType: "General Inquiry",
          response: "",
          followDate: today,
          source: "Walk-in",
          representative: "Front Desk",
          status: "Warm"
        });
        setEditId(null);
        setTab("list");
        loadData();
      } else {
        alert(resData.error || "Failed to save enquiry");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  const startEdit = (e: any) => {
    setForm({ ...e });
    setEditId(e.id);
    setTab("add");
  };

  const del = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      const res = await fetch(`/api/crm/enquiries?id=${id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = useMemo(() => data.filter(e => {
    const m1 = !search || e.clientName.toLowerCase().includes(search.toLowerCase()) || e.phone.includes(search) || e.enquiryFor.toLowerCase().includes(search.toLowerCase());
    const m2 = !filterStatus || e.status === filterStatus;
    const m3 = !filterSource || e.source === filterSource;
    return m1 && m2 && m3;
  }), [data, search, filterStatus, filterSource]);

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">
            Enquiries & Leads Management
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Capture incoming leads, assign staff representatives, set follow-up schedules, and track conversions.
          </p>
        </div>
        <button
          className="btn-gold text-xs"
          onClick={() => {
            setForm({
              clientName: "",
              phone: "",
              email: "",
              address: "",
              enquiryFor: "",
              enquiryType: "General Inquiry",
              response: "",
              followDate: today,
              source: "Walk-in",
              representative: "Front Desk",
              status: "Warm"
            });
            setEditId(null);
            setTab("add");
          }}
        >
          <Plus size={14} /> Add Enquiry
        </button>
      </div>

      {/* Lead Pipeline Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {leadStatuses.map((s) => (
          <div
            key={s}
            className={`crm-card p-3.5 cursor-pointer transition-all ${filterStatus === s ? 'border-amber-500 bg-amber-50/40' : ''}`}
            onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
          >
            <p className="text-slate-500 text-xs font-bold uppercase">{s}</p>
            <p className={`text-2xl font-black mt-0.5 ${
              s === 'Hot' ? 'text-rose-700' :
              s === 'Warm' ? 'text-amber-700' :
              s === 'Cold' ? 'text-blue-700' :
              s === 'Converted' ? 'text-emerald-700' : 'text-slate-700'
            }`}>
              {data.filter(e => e.status === s).length}
            </p>
          </div>
        ))}
      </div>

      <div className="crm-tabs">
        <button className={`tab-btn ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>
          📋 All Inquiries ({filtered.length})
        </button>
        <button className={`tab-btn ${tab === 'add' ? 'active' : ''}`} onClick={() => setTab('add')}>
          {editId ? "✏️ Edit Enquiry" : "➕ Add New Lead"}
        </button>
      </div>

      {tab === "add" && (
        <div className="crm-card max-w-3xl">
          <p className="section-title mb-4">{editId ? "Edit Lead Details" : "Record New Client Inquiry"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="crm-label">Contact Number *</label>
              <input
                className="crm-input text-xs font-bold"
                placeholder="10-digit mobile"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Client Name *</label>
              <input
                className="crm-input text-xs font-bold"
                placeholder="Full name"
                value={form.clientName || ""}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Email</label>
              <input
                type="email"
                className="crm-input text-xs"
                placeholder="client@email.com"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Address</label>
              <input
                className="crm-input text-xs"
                placeholder="Area or City"
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Enquiry For</label>
              <input
                className="crm-input text-xs"
                placeholder="e.g. Bridal Makeup, Keratin Spa"
                value={form.enquiryFor || ""}
                onChange={(e) => setForm({ ...form, enquiryFor: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Enquiry Type</label>
              <select className="crm-select text-xs font-semibold" value={form.enquiryType || ""} onChange={(e) => setForm({ ...form, enquiryType: e.target.value })}>
                {enquiryTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="crm-label">Discussion & Response Notes</label>
              <textarea
                className="crm-input text-xs"
                rows={2}
                placeholder="Details of client requirements discussed..."
                value={form.response || ""}
                onChange={(e) => setForm({ ...form, response: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Follow-up Date</label>
              <input className="crm-input text-xs font-bold" type="date" value={form.followDate || today} onChange={(e) => setForm({ ...form, followDate: e.target.value })} />
            </div>
            <div>
              <label className="crm-label">Source of Lead</label>
              <select className="crm-select text-xs font-semibold" value={form.source || "Walk-in"} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                {leadSources.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="crm-label">Assigned Representative</label>
              <select className="crm-select text-xs font-semibold" value={form.representative || ""} onChange={(e) => setForm({ ...form, representative: e.target.value })}>
                <option value="Front Desk">Front Desk</option>
                {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="crm-label">Lead Status</label>
              <select className="crm-select text-xs font-bold" value={form.status || "Warm"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {leadStatuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button className="btn-gold px-8 text-xs font-bold" onClick={save}>
              {editId ? "Update Lead" : "Save Lead"}
            </button>
            <button className="btn-outline text-xs" onClick={() => { setTab("list"); setEditId(null); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {tab === "list" && (
        <div className="space-y-4">
          <div className="crm-card">
            <div className="filter-bar">
              <div className="flex-1 min-w-44">
                <label className="crm-label">Search</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="crm-input pl-9 text-xs" placeholder="Name, phone, service..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="crm-label">Status</label>
                <select className="crm-select text-xs" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  {leadStatuses.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="crm-label">Source</label>
                <select className="crm-select text-xs" value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
                  <option value="">All Sources</option>
                  {leadSources.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <button className="btn-outline text-xs" onClick={() => { setSearch(""); setFilterStatus(""); setFilterSource(""); }}>
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          <div className="crm-card overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-semibold text-sm">No Enquiries Found</p>
                <p className="text-slate-400 text-xs">Record incoming leads using the 'Add Enquiry' button.</p>
              </div>
            ) : (
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Contact</th>
                    <th>Enquiry For</th>
                    <th>Due Date</th>
                    <th>Source</th>
                    <th>Representative</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id}>
                      <td className="font-bold text-slate-800 text-sm">{e.clientName}</td>
                      <td className="text-slate-500 text-xs font-semibold">{e.phone}</td>
                      <td className="text-slate-700 text-xs font-semibold">{e.enquiryFor}</td>
                      <td className={`text-xs font-bold ${e.followDate <= today && e.status !== 'Converted' ? 'text-rose-700' : 'text-slate-600'}`}>
                        {e.followDate}
                      </td>
                      <td><span className="badge badge-gray">{e.source}</span></td>
                      <td className="text-slate-600 text-xs">{e.representative || "Unassigned"}</td>
                      <td>
                        <span className={`badge ${
                          e.status === 'Hot' ? 'badge-hot' :
                          e.status === 'Warm' ? 'badge-warm' :
                          e.status === 'Converted' ? 'badge-green' : 'badge-cold'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button
                            className="btn-sm bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                            onClick={() => startEdit(e)}
                          >
                            Edit
                          </button>
                          <a
                            href={`https://wa.me/91${e.phone}?text=Hello%20${encodeURIComponent(e.clientName)},%20greeting%20from%20Vivazen%20Beauty%20Salon!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-sm bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                          >
                            <Phone size={11} /> Chat
                          </a>
                          <button className="btn-danger p-1.5" onClick={() => del(e.id)}>
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
      )}
    </div>
  );
}
