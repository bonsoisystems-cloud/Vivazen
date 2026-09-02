"use client";

import { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Eye,
  Users,
  UserPlus,
  X,
  Sparkles,
  Download,
  Upload,
  FileSpreadsheet,
  FileDown,
  AlertCircle,
  Award
} from "lucide-react";
import Link from "next/link";

const genderOptions = ["Female", "Male", "Unspecified"];
const clientSources = ["Walk-in", "Instagram", "Google", "Client Referral", "Facebook", "Website", "Pamphlet"];

export default function AdminClientsPage() {
  const [data, setData] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterMembership, setFilterMembership] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<any>({
    name: "",
    phone: "",
    email: "",
    gender: "Female",
    dob: "",
    anniversary: "",
    address: "Jaunpur",
    source: "Walk-in",
    membershipId: "",
  });

  // Bulk Import States (In-Page Card)
  const [importOpen, setImportOpen] = useState(false);
  const [importModal, setImportModal] = useState<{
    file: File | null;
    parsedRows: any[];
    error: string | null;
    loading: boolean;
    result: string | null;
  }>({
    file: null,
    parsedRows: [],
    error: null,
    loading: false,
    result: null,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, bRes, mRes] = await Promise.all([
        fetch("/api/crm/clients"),
        fetch("/api/crm/bills"),
        fetch("/api/crm/memberships")
      ]);

      if (cRes.ok) {
        const d = await cRes.json();
        if (d.success) setData(d.data || []);
      }
      if (bRes.ok) {
        const d = await bRes.json();
        if (d.success) setBills(d.data || []);
      }
      if (mRes.ok) {
        const d = await mRes.json();
        if (d.success) setMemberships(d.data || []);
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

  // ─── EXPORT CLIENTS TO XLSX ───
  const handleExportClientsExcel = () => {
    try {
      if (data.length === 0) {
        return alert("No clients found to export.");
      }

      const flatList = data.map((c) => ({
        "Name": c.name,
        "Contact number": c.phone,
        "First visit": c.firstVisit ? new Date(c.firstVisit).toISOString().split("T")[0] : "",
        "Last visit": c.lastVisit ? new Date(c.lastVisit).toISOString().split("T")[0] : "",
        "Points": c.points || 0,
        "Email": c.email || "",
        "Gender": c.gender || "Female",
        "Address": c.address || "",
        "Wallet balance": c.walletBalance || 0,
        "Referral code": c.inviteCode || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(flatList);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
      XLSX.writeFile(workbook, `Vivazen_Clients_Directory_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (err) {
      console.error(err);
      alert("Failed to export clients to Excel");
    }
  };

  // ─── DOWNLOAD SAMPLE CLIENTS TEMPLATE ───
  const handleDownloadClientsTemplate = () => {
    try {
      const sample = [
        {
          "Name": "Ananya Verma",
          "Contact number": "9876543210",
          "First visit": "2025-01-15",
          "Last visit": "2026-08-20",
          "Points": 250,
        },
        {
          "Name": "Riya Singh",
          "Contact number": "9123456780",
          "First visit": "2025-06-10",
          "Last visit": "2026-08-28",
          "Points": 120,
        },
        {
          "Name": "Kavita Gupta",
          "Contact number": "9988776655",
          "First visit": "2026-02-01",
          "Last visit": "2026-08-15",
          "Points": 50,
        },
        {
          "Name": "Pooja Mishra",
          "Contact number": "9822334455",
          "First visit": "2025-11-20",
          "Last visit": "2026-08-29",
          "Points": 180,
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(sample);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Clients Template");
      XLSX.writeFile(workbook, "Clients_Import_Template.xlsx");
    } catch (err) {
      console.error(err);
      alert("Failed to download sample template");
    }
  };

  // ─── PARSE UPLOADED CLIENTS XLSX ───
  const handleClientsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rows || rows.length === 0) {
          setImportModal((prev) => ({
            ...prev,
            file,
            parsedRows: [],
            error: "The uploaded file contains no data rows.",
          }));
          return;
        }

        const sampleRow = rows[0];
        const hasName = "Name" in sampleRow || "name" in sampleRow || "Client Name" in sampleRow;
        const hasPhone = "Contact number" in sampleRow || "Contact Number" in sampleRow || "phone" in sampleRow || "Phone" in sampleRow || "Mobile" in sampleRow;

        if (!hasName || !hasPhone) {
          setImportModal((prev) => ({
            ...prev,
            file,
            parsedRows: rows,
            error: "Header note: The first row must contain columns: Name, Contact number, First visit, Last visit, Points",
          }));
        } else {
          setImportModal((prev) => ({
            ...prev,
            file,
            parsedRows: rows,
            error: null,
          }));
        }
      } catch (err) {
        console.error(err);
        setImportModal((prev) => ({
          ...prev,
          file,
          parsedRows: [],
          error: "Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.",
        }));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ─── EXECUTE CLIENTS BULK IMPORT ───
  const handleExecuteClientsImport = async () => {
    if (importModal.parsedRows.length === 0) return;
    try {
      setImportModal((prev) => ({ ...prev, loading: true, error: null }));
      const res = await fetch("/api/crm/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "clients",
          items: importModal.parsedRows,
        }),
      });

      const d = await res.json();
      if (d.success) {
        alert(d.message || "Clients bulk import completed successfully!");
        setImportOpen(false);
        setImportModal({
          file: null,
          parsedRows: [],
          error: null,
          loading: false,
          result: null,
        });
        loadData();
      } else {
        setImportModal((prev) => ({
          ...prev,
          loading: false,
          error: d.error || "Failed to complete bulk import",
        }));
      }
    } catch (err) {
      console.error(err);
      setImportModal((prev) => ({
        ...prev,
        loading: false,
        error: "Network error occurred during bulk import",
      }));
    }
  };

  const addClient = async () => {
    if (!form.name?.trim() || !form.phone?.trim()) {
      return alert("Client name and contact phone are required.");
    }

    try {
      const res = await fetch("/api/crm/clients", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const resData = await res.json();
      if (resData.success) {
        setShowAdd(false);
        setForm({ name: "", phone: "", email: "", gender: "Female", dob: "", anniversary: "", address: "Jaunpur", source: "Walk-in" });
        loadData();
      } else {
        alert(resData.error || "Failed to save client profile");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  const delClient = async (id: string) => {
    if (!confirm("Are you sure you want to remove this client profile?")) return;
    try {
      const res = await fetch(`/api/crm/clients?id=${id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const active = data.filter(c => bills.some(b => b.clientId === c.id));

  const filtered = useMemo(() => data.filter(c => {
    const m1 = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase()) || c.inviteCode.toLowerCase().includes(search.toLowerCase()) || (c.membershipName && c.membershipName.toLowerCase().includes(search.toLowerCase()));
    const m2 = !filterSource || c.source === filterSource;
    const m3 = !filterGender || c.gender === filterGender;
    const m4 = !filterMembership || (filterMembership === "yes" ? Boolean(c.membershipId) : !c.membershipId);
    return m1 && m2 && m3 && m4;
  }), [data, search, filterSource, filterGender, filterMembership]);

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">Client Relationship Management</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">Manage customer profiles, visit histories, referral codes, and lifetime value.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportClientsExcel}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Export all clients to Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => {
              setShowAdd(false);
              setImportOpen(!importOpen);
            }}
            className={`px-3.5 py-2.5 border font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${importOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300'}`}
            title="Bulk Import Clients from Excel (.xlsx)"
          >
            {importOpen ? <X className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5 text-blue-700" />}
            <span>{importOpen ? "Close Import" : "Bulk Import"}</span>
          </button>

          <button
            className="btn-gold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
            onClick={() => {
              setImportOpen(false);
              setShowAdd(!showAdd);
            }}
          >
            {showAdd ? <X size={14} /> : <UserPlus size={14} />}
            <span>{showAdd ? "Close Form" : "Register New Client"}</span>
          </button>
        </div>
      </div>

      {/* ─── IN-PAGE EXPANDABLE: BULK IMPORT CLIENTS FORM ─── */}
      {importOpen && (
        <div className="crm-card border-2 border-blue-300 bg-gradient-to-br from-blue-50/40 via-white to-white space-y-5 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-blue-100 text-blue-800">
                <FileSpreadsheet className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900">Bulk Import Clients from Excel (.xlsx)</h3>
                <p className="text-[11px] text-slate-500">Upload customer lists with names, mobile phones, visit dates, and points.</p>
              </div>
            </div>
            <button
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              onClick={() => setImportOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-blue-950">Excel Spreadsheet Headers Required:</p>
              <p className="text-[11px] text-blue-800 mt-0.5">
                First row must have: <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">Name</span>, <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">Contact number</span>, <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">First visit</span>, <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">Last visit</span>, <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">Points</span>
              </p>
            </div>
            <button
              onClick={handleDownloadClientsTemplate}
              className="text-xs font-bold text-blue-900 bg-white px-3 py-1.5 rounded-xl border border-blue-300 hover:bg-blue-50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FileDown size={13} className="text-blue-700" />
              <span>Download Sample Template</span>
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center transition-colors bg-white/70">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleClientsFileChange}
              className="hidden"
              id="client-inpage-file-input"
            />
            <label
              htmlFor="client-inpage-file-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center shadow-xs">
                <Upload size={18} />
              </div>
              <p className="text-xs font-bold text-slate-800">
                {importModal.file ? importModal.file.name : "Click to select Excel spreadsheet (.xlsx)"}
              </p>
              <p className="text-[11px] text-slate-400">Standard spreadsheet with header row</p>
            </label>
          </div>

          {importModal.error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0 text-rose-600" />
              <span>{importModal.error}</span>
            </div>
          )}

          {importModal.parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-800">
                  Detected Rows: {importModal.parsedRows.length} Clients
                </p>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  ✓ Verified Format
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl bg-white">
                <table className="crm-table w-full text-xs">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Contact Number</th>
                      <th>First Visit</th>
                      <th>Last Visit</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importModal.parsedRows.slice(0, 10).map((row, idx) => {
                      const name = row.name || row["Name"] || row["Client Name"] || "—";
                      const phone = row.phone || row["Contact number"] || row["Contact Number"] || row["Phone"] || "—";
                      const fv = row.firstVisit || row["First visit"] || row["First Visit"] || "—";
                      const lv = row.lastVisit || row["Last visit"] || row["Last Visit"] || "—";
                      const pts = row.points || row["Points"] || 0;
                      return (
                        <tr key={idx}>
                          <td className="text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="font-bold text-slate-900">{name}</td>
                          <td className="font-mono text-slate-700">{phone}</td>
                          <td className="text-slate-500 font-mono">{String(fv).split("T")[0]}</td>
                          <td className="text-slate-500 font-mono">{String(lv).split("T")[0]}</td>
                          <td><span className="badge badge-gold font-mono text-[10px]">{pts} pts</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button className="btn-outline text-xs px-4 cursor-pointer" onClick={() => setImportOpen(false)}>
              Cancel
            </button>
            <button
              className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer flex items-center gap-2"
              onClick={handleExecuteClientsImport}
              disabled={importModal.loading || importModal.parsedRows.length === 0}
            >
              {importModal.loading ? "Processing..." : `Import ${importModal.parsedRows.length} Clients`}
            </button>
          </div>
        </div>
      )}

      {/* ─── IN-PAGE EXPANDABLE: REGISTER CLIENT FORM ─── */}
      {showAdd && (
        <div className="crm-card border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-700" />
              <span>Register New Client Profile</span>
            </h3>
            <button className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer" onClick={() => setShowAdd(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
            <div>
              <label className="crm-label">Client Name *</label>
              <input
                className="crm-input text-xs font-bold"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Contact Phone *</label>
              <input
                className="crm-input text-xs font-bold font-mono"
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
                placeholder="client@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Gender</label>
              <select
                className="crm-select text-xs font-semibold"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                {genderOptions.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="crm-label">Date of Birth</label>
              <input
                type="date"
                className="crm-input text-xs"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Anniversary Date</label>
              <input
                type="date"
                className="crm-input text-xs"
                value={form.anniversary}
                onChange={(e) => setForm({ ...form, anniversary: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Acquisition Channel / Source</label>
              <select
                className="crm-select text-xs font-semibold"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              >
                {clientSources.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="crm-label">City / Locality</label>
              <input
                className="crm-input text-xs"
                placeholder="e.g. Line Bazar, Jaunpur"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">VIP Membership Card</label>
              <select
                className="crm-select text-xs font-bold"
                value={form.membershipId || ""}
                onChange={(e) => setForm({ ...form, membershipId: e.target.value })}
              >
                <option value="">-- No Membership Card --</option>
                {memberships.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (₹{m.price})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button className="btn-outline text-xs px-4 cursor-pointer" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer" onClick={addClient}>
              Save Client Profile
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="crm-card py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 animate-pulse">
            Fetching client directory, visit ledgers, and rewards balance...
          </p>
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="crm-card">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Registered Clients</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{data.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Profiles on database</p>
            </div>

            <div className="crm-card">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Visiting Clients</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{active.length}</p>
              <p className="text-[11px] text-emerald-600 mt-0.5">With recorded bills</p>
            </div>

            <div className="crm-card">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Outstanding Wallet Balances</p>
              <p className="text-2xl font-bold text-emerald-800 mt-2">
                {formatCurrency(data.reduce((sum, c) => sum + (c.walletBalance || 0), 0))}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Stored value credit</p>
            </div>

            <div className="crm-card">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Reward Points Outstanding</p>
              <p className="text-2xl font-bold text-amber-900 mt-2">
                {data.reduce((sum, c) => sum + (c.points || 0), 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">Loyalty points</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="crm-card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="section-title">All Customer Directory ({filtered.length})</p>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="w-64 relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="crm-input pl-8 text-xs font-semibold"
                    placeholder="Search name, phone, code, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <select
                  className="crm-select text-xs font-semibold w-36"
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                >
                  <option value="">All Sources</option>
                  {clientSources.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                  className="crm-select text-xs font-semibold w-32"
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                >
                  <option value="">All Genders</option>
                  {genderOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <Users size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-semibold text-sm">No Clients Found</p>
                <p className="text-slate-400 text-xs">Try adjusting your search criteria or register a new client profile.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="crm-table w-full">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Mobile Phone</th>
                      <th>Membership Card</th>
                      <th>Referral Code</th>
                      <th>Reward Points</th>
                      <th>Wallet Balance</th>
                      <th>Source</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-bold text-xs">
                              {c.name[0]?.toUpperCase() || "C"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                              <p className="text-slate-400 text-xs">{c.gender} · {c.source}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-slate-600 text-xs font-semibold">{c.phone}</td>
                        <td>
                          {c.membershipId ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-amber-600/20 border border-amber-300 text-amber-900 text-[10px] font-black shadow-2xs">
                              <Award size={11} className="text-amber-700" />
                              <span>{c.membershipName || "VIP Card"}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">None</span>
                          )}
                        </td>
                        <td className="font-mono text-amber-800 text-xs font-bold">{c.inviteCode}</td>
                        <td className="text-amber-800 font-bold text-xs">{c.points || 0} pts</td>
                        <td className="text-emerald-700 font-bold text-xs">{formatCurrency(c.walletBalance)}</td>
                        <td><span className="badge badge-gray">{c.source}</span></td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setForm({
                                  id: c.id,
                                  name: c.name,
                                  phone: c.phone,
                                  email: c.email || "",
                                  gender: c.gender || "Female",
                                  dob: c.dob || "",
                                  anniversary: c.anniversary || "",
                                  address: c.address || "Jaunpur",
                                  source: c.source || "Walk-in",
                                  membershipId: c.membershipId || "",
                                  points: c.points || 0,
                                  walletBalance: c.walletBalance || 0,
                                });
                                setShowAdd(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="btn-sm bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 cursor-pointer font-bold"
                              title="Edit Client Profile"
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                            <Link
                              href={`/admin/clients/${c.id}`}
                              className="btn-sm bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 cursor-pointer font-bold"
                            >
                              <Eye size={12} /> 360° Profile
                            </Link>
                            <button className="btn-danger p-1.5 cursor-pointer" onClick={() => delClient(c.id)} title="Delete Client">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
