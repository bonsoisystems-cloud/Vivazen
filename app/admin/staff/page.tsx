"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  UserCheck,
  Plus,
  Trash2,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Scissors,
  CheckCircle2,
  Clock,
  Printer,
  Search,
  Filter,
  ArrowRight,
  Eye,
  FileText,
  X,
  CreditCard,
  FileCheck,
  ShieldCheck,
  Lock,
  Key,
  Edit2,
  Building,
  Phone,
  Mail,
  MapPin,
  Camera,
  Award,
  Sparkles,
  SlidersHorizontal,
  ExternalLink,
  Layers
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

export default function AdminStaffPage() {
  const [tab, setTab] = useState<"staff_roster" | "services_ledger">("staff_roster");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "PROVIDER" | "ADMIN">("ALL");

  const [staffList, setStaffList] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // In-Page Expandable Form State
  const [modalStaff, setModalStaff] = useState<{
    open: boolean;
    isEdit: boolean;
    data: any;
  }>({
    open: false,
    isEdit: false,
    data: null,
  });

  // In-Page Profile / KYC Inspector State
  const [viewingProfile, setViewingProfile] = useState<any | null>(null);

  // Month & Staff Filter for Monthly Ledger
  const currentMonthNum = String(new Date().getMonth() + 1);
  const currentYearStr = String(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentMonthNum);
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState("all");
  const [ledgerSearch, setLedgerSearch] = useState("");

  const months = [
    { value: "all", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const defaultStaffForm = {
    name: "",
    phone: "",
    email: "",
    category: "Service Provider", // "Service Provider" | "Administrative"
    department: "Salon & Spa",
    type: "Senior Beautician", // Role / Designation
    specialization: "Bridal & Hair Styling",
    experienceYears: 2,
    commissionService: 15,
    commissionProduct: 10,
    salary: 15000,
    hoursStart: "10:00",
    hoursEnd: "19:00",
    gender: "Female",
    dob: "",
    joiningDate: new Date().toISOString().split("T")[0],
    bloodGroup: "O+",
    address: "",
    emergency: "",
    emergencyPhone: "",
    panNumber: "",
    panDoc: "",
    aadharNumber: "",
    aadharDoc: "",
    photo: "",
    bankName: "",
    bankAccount: "",
    ifscCode: "",
    upiId: "",
    // Linked Login Account
    createLoginAccount: true,
    loginPassword: "",
    loginRole: "STAFF",
    loginPermissions: ["attendance", "appointments", "appointments:view", "clients", "clients:view"],
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [stRes, bRes] = await Promise.all([
        fetch("/api/crm/staff"),
        fetch("/api/crm/bills"),
      ]);

      if (stRes.ok) {
        const d = await stRes.json();
        if (d.success) {
          setStaffList(d.data?.staff || d.data?.providers || []);
          setUsers(d.data?.users || []);
        }
      }
      if (bRes.ok) {
        const d = await bRes.json();
        if (d.success) setBills(d.data || []);
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

  const saveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = modalStaff.data;
    if (!form.name?.trim() || !form.phone?.trim()) return alert("Name and phone number are required.");

    try {
      const url = "/api/crm/staff";
      const method = modalStaff.isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const d = await res.json();
      if (d.success) {
        setModalStaff({ open: false, isEdit: false, data: null });
        loadData();
      } else {
        alert(d.error || "Failed to save staff record");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const delStaff = async (id: string) => {
    if (!confirm("Are you sure you want to remove this staff profile?")) return;
    try {
      const res = await fetch(`/api/crm/staff?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        if (viewingProfile?.id === id) setViewingProfile(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  // ─── Extract All Individual Performed Services from Bills ───
  const allServicesLogs = useMemo(() => {
    const logs: any[] = [];
    bills.forEach((bill) => {
      let itemsList = bill.items;
      if (typeof itemsList === "string") {
        try { itemsList = JSON.parse(itemsList); } catch { itemsList = []; }
      }
      if (!Array.isArray(itemsList)) return;

      itemsList.forEach((item: any, idx: number) => {
        const prov = staffList.find(
          p => (item.providerId && p.id === item.providerId) ||
            (item.providerName && p.name.toLowerCase() === item.providerName.toLowerCase()) ||
            (item.provider && p.name.toLowerCase() === item.provider.toLowerCase())
        );

        const staffName = item.providerName || item.provider || prov?.name || "Unassigned";
        const staffId = item.providerId || prov?.id || "";
        const commPct = Number(prov?.commissionService || 15);

        const itemDate = item.date || bill.date;
        const itemTime = item.time || bill.time || "—";
        const qty = Number(item.qty || 1);
        const rate = Number(item.price || 0);
        const gross = rate * qty;
        const disc = Number(item.discount || 0);
        const net = Math.max(0, gross - disc);
        const commAmt = Math.round((net * commPct) / 100);

        logs.push({
          logId: `${bill.id}_${idx}`,
          billId: bill.id,
          billNo: bill.billNo,
          date: itemDate,
          time: itemTime,
          clientName: bill.clientName,
          phone: bill.phone,
          serviceName: item.name,
          staffId,
          staffName,
          staffRole: prov?.type || "Beautician",
          commPct,
          commAmt,
          rate,
          qty,
          gross,
          disc,
          net,
          billStatus: bill.status
        });
      });
    });

    return logs.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [bills, staffList]);

  // ─── Filtered Services for Monthly Ledger ───
  const filteredServicesLogs = useMemo(() => {
    return allServicesLogs.filter((log) => {
      // Month & Year Filter
      if (selectedMonth !== "all" && log.date) {
        const d = new Date(log.date);
        const logMonth = String(d.getMonth() + 1);
        const logYear = String(d.getFullYear());
        if (logMonth !== selectedMonth || logYear !== selectedYear) return false;
      }

      // Staff Filter
      if (selectedStaffFilter !== "all") {
        if (log.staffId !== selectedStaffFilter && log.staffName !== selectedStaffFilter) {
          return false;
        }
      }

      // Search
      if (ledgerSearch) {
        const query = ledgerSearch.toLowerCase();
        const matchesStaff = log.staffName.toLowerCase().includes(query);
        const matchesService = log.serviceName.toLowerCase().includes(query);
        const matchesClient = log.clientName.toLowerCase().includes(query);
        const matchesBill = log.billNo.toLowerCase().includes(query);
        if (!matchesStaff && !matchesService && !matchesClient && !matchesBill) return false;
      }

      return true;
    });
  }, [allServicesLogs, selectedMonth, selectedYear, selectedStaffFilter, ledgerSearch]);

  // Summary Metrics for Filtered Ledger
  const ledgerMetrics = useMemo(() => {
    const totalServices = filteredServicesLogs.length;
    const totalGross = filteredServicesLogs.reduce((s, l) => s + l.gross, 0);
    const totalNetRevenue = filteredServicesLogs.reduce((s, l) => s + l.net, 0);
    const totalCommission = filteredServicesLogs.reduce((s, l) => s + l.commAmt, 0);
    return {
      totalServices,
      totalGross,
      totalNetRevenue,
      totalCommission,
    };
  }, [filteredServicesLogs]);

  const viewStaffHistory = (provider: any) => {
    setSelectedStaffFilter(provider.id || provider.name);
    setTab("services_ledger");
  };

  // Helper to check if staff member has an active login account
  const getLinkedUser = (staffEmail: string, staffName: string) => {
    if (!staffEmail && !staffName) return null;
    return users.find(
      u => (staffEmail && u.email && u.email.toLowerCase() === staffEmail.toLowerCase()) ||
        (u.name && u.name.toLowerCase() === staffName.toLowerCase())
    );
  };

  // Filtered staff list by category
  const filteredStaffList = useMemo(() => {
    if (categoryFilter === "PROVIDER") {
      return staffList.filter(s => s.category !== "Administrative");
    }
    if (categoryFilter === "ADMIN") {
      return staffList.filter(s => s.category === "Administrative");
    }
    return staffList;
  }, [staffList, categoryFilter]);

  const providerCount = staffList.filter(s => s.category !== "Administrative").length;
  const adminCount = staffList.filter(s => s.category === "Administrative").length;

  return (
    <div className="fade-in space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">
            Staff &amp; Service Provider Directory
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Single unified table managing all salon personnel with PAN, Aadhaar KYC, Banking details, Role-Based Login Access &amp; Performance Ledger.
          </p>
        </div>
      </div>

      {/* ─── TAB NAVIGATION ─── */}
      <div className="crm-tabs">
        <button
          className={`tab-btn ${tab === 'staff_roster' ? 'active' : ''}`}
          onClick={() => { setTab('staff_roster'); }}
        >
          👥 Unified Staff Master ({staffList.length})
        </button>
        <button
          className={`tab-btn ${tab === 'services_ledger' ? 'active' : ''}`}
          onClick={() => { setTab('services_ledger'); }}
        >
          📊 Staff Monthly Service Ledger &amp; Commissions ({allServicesLogs.length})
        </button>
      </div>

      {loading ? (
        <div className="crm-card py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 animate-pulse">
            Fetching unified staff records, KYC documents, and performance logs...
          </p>
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════════════
              TAB 1: UNIFIED STAFF ROSTER
             ═══════════════════════════════════════════════════════════════════ */}
          {tab === "staff_roster" && (
            <div className="space-y-4">
              {/* Category Filter Pills & Add Button */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setCategoryFilter("ALL")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${categoryFilter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    All Staff ({staffList.length})
                  </button>
                  <button
                    onClick={() => setCategoryFilter("PROVIDER")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${categoryFilter === "PROVIDER" ? "bg-white text-amber-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    💇‍♀️ Service Providers ({providerCount})
                  </button>
                  <button
                    onClick={() => setCategoryFilter("ADMIN")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${categoryFilter === "ADMIN" ? "bg-white text-blue-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    💼 Administrative ({adminCount})
                  </button>
                </div>

                <button
                  className="btn-gold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                  onClick={() => {
                    setViewingProfile(null);
                    setModalStaff({
                      open: !modalStaff.open,
                      isEdit: false,
                      data: modalStaff.open ? null : { ...defaultStaffForm }
                    });
                  }}
                >
                  {modalStaff.open ? <X size={14} /> : <Plus size={14} />}
                  <span>{modalStaff.open ? "Close Form" : "Add Staff Member"}</span>
                </button>
              </div>

              {/* ─── IN-PAGE EXPANDABLE: REGISTER / EDIT STAFF FORM ─── */}
              {modalStaff.open && modalStaff.data && (
                <div className="crm-card border-2 border-amber-300 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-6 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h2 className="text-base font-serif font-black text-slate-900 flex items-center gap-2">
                        <Scissors className="text-amber-700" size={16} />
                        <span>{modalStaff.isEdit ? `Edit Staff Member: ${modalStaff.data.name}` : "Register New Staff Personnel"}</span>
                      </h2>
                      <p className="text-xs text-slate-500 font-light mt-0.5">
                        Single unified registration for Service Providers &amp; Administrative Personnel.
                      </p>
                    </div>
                    <button
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                      onClick={() => setModalStaff({ open: false, isEdit: false, data: null })}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={saveStaff} className="space-y-6">
                    {/* Category Selector */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-amber-900">
                        Staff Category Type *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${modalStaff.data.category === 'Service Provider' ? 'bg-white border-amber-400 font-bold text-amber-900 shadow-xs' : 'bg-white/50 border-slate-200 text-slate-600'}`}>
                          <input
                            type="radio"
                            name="category"
                            checked={modalStaff.data.category === "Service Provider"}
                            onChange={() => setModalStaff({
                              ...modalStaff,
                              data: {
                                ...modalStaff.data,
                                category: "Service Provider",
                                department: "Salon & Spa",
                                type: "Senior Beautician",
                                commissionService: 15,
                                commissionProduct: 10,
                                loginRole: "STAFF"
                              }
                            })}
                          />
                          <div>
                            <p className="text-xs font-bold">Service Provider / Beautician</p>
                            <p className="text-[10px] text-slate-400">Hair, Beauty, Makeup, Nails, Spa</p>
                          </div>
                        </label>

                        <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${modalStaff.data.category === 'Administrative' ? 'bg-white border-blue-400 font-bold text-blue-900 shadow-xs' : 'bg-white/50 border-slate-200 text-slate-600'}`}>
                          <input
                            type="radio"
                            name="category"
                            checked={modalStaff.data.category === "Administrative"}
                            onChange={() => setModalStaff({
                              ...modalStaff,
                              data: {
                                ...modalStaff.data,
                                category: "Administrative",
                                department: "Front Desk",
                                type: "Receptionist",
                                commissionService: 0,
                                commissionProduct: 0,
                                loginRole: "MANAGER"
                              }
                            })}
                          />
                          <div>
                            <p className="text-xs font-bold">Administrative &amp; Desk Staff</p>
                            <p className="text-[10px] text-slate-400">Front Desk, Manager, Receptionist, Accounts</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Section 1: Basic & Professional Details */}
                    <div className="space-y-3">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Users size={14} className="text-amber-700" />
                        <span>1. Basic &amp; Professional Details</span>
                      </p>

                      {/* Profile Photo Uploader */}
                      <div className="p-3 bg-gradient-to-r from-amber-50/70 via-amber-50/30 to-slate-50 rounded-2xl border border-amber-200/80 mb-3 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-1 min-w-[240px]">
                          <ImageUploader
                            variant="avatar"
                            label="Staff Profile Photo (Cloud Storage)"
                            value={modalStaff.data.photo || ""}
                            category="STAFF_AVATAR"
                            title={`${modalStaff.data.name || 'Staff'}_Photo`}
                            onChange={(url) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, photo: url } })}
                          />
                        </div>
                        {/* <div className="text-right hidden sm:block">
                          <span className="text-[10px] text-amber-900 font-bold bg-amber-100/70 px-2 py-1 rounded-lg border border-amber-300/60">
                            Direct Cloud Storage &amp; NeonDB
                          </span>
                        </div> */}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="crm-label">Full Name *</label>
                          <input
                            required
                            className="crm-input text-xs font-bold"
                            placeholder="e.g. Pooja Sharma"
                            value={modalStaff.data.name}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, name: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="crm-label">Contact Phone *</label>
                          <input
                            required
                            className="crm-input text-xs font-bold"
                            placeholder="10-digit mobile"
                            value={modalStaff.data.phone}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, phone: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="crm-label">Official Email (for Login)</label>
                          <input
                            type="email"
                            className="crm-input text-xs font-semibold"
                            placeholder="staff@vivazen.in"
                            value={modalStaff.data.email || ""}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, email: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="crm-label">Role Designation *</label>
                          <input
                            required
                            className="crm-input text-xs font-bold"
                            placeholder="e.g. Senior Beautician / Receptionist"
                            value={modalStaff.data.type}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, type: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="crm-label">Department</label>
                          <input
                            className="crm-input text-xs"
                            placeholder="e.g. Salon & Spa / Front Desk"
                            value={modalStaff.data.department || ""}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, department: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="crm-label">Specialization / Expertise</label>
                          <input
                            className="crm-input text-xs"
                            placeholder="e.g. Bridal Makeup, Facials, Keratin"
                            value={modalStaff.data.specialization || ""}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, specialization: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="crm-label">Experience (Years)</label>
                          <input
                            type="number"
                            className="crm-input text-xs font-bold"
                            value={modalStaff.data.experienceYears || 1}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, experienceYears: Number(e.target.value) } })}
                          />
                        </div>
                        <div>
                          <label className="crm-label">Base Monthly Salary (₹)</label>
                          <input
                            type="number"
                            className="crm-input text-xs font-bold"
                            value={modalStaff.data.salary}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, salary: Number(e.target.value) } })}
                          />
                        </div>
                        {modalStaff.data.category === "Service Provider" && (
                          <>
                            <div>
                              <label className="crm-label">Service Commission (%)</label>
                              <input
                                type="number"
                                className="crm-input text-xs font-bold text-amber-900"
                                value={modalStaff.data.commissionService}
                                onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, commissionService: Number(e.target.value) } })}
                              />
                            </div>
                            <div>
                              <label className="crm-label">Product Commission (%)</label>
                              <input
                                type="number"
                                className="crm-input text-xs font-bold text-amber-900"
                                value={modalStaff.data.commissionProduct}
                                onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, commissionProduct: Number(e.target.value) } })}
                              />
                            </div>
                          </>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="crm-label">Shift Start</label>
                            <input
                              type="time"
                              className="crm-input text-xs"
                              value={modalStaff.data.hoursStart}
                              onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, hoursStart: e.target.value } })}
                            />
                          </div>
                          <div>
                            <label className="crm-label">Shift End</label>
                            <input
                              type="time"
                              className="crm-input text-xs"
                              value={modalStaff.data.hoursEnd}
                              onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, hoursEnd: e.target.value } })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="crm-label">Gender</label>
                          <select
                            className="crm-select text-xs"
                            value={modalStaff.data.gender}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, gender: e.target.value } })}
                          >
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="crm-label">Date of Birth</label>
                          <input
                            type="date"
                            className="crm-input text-xs font-semibold"
                            value={modalStaff.data.dob || ""}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, dob: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="crm-label">Joining Date (For Attendance Lock)</label>
                          <input
                            type="date"
                            className="crm-input text-xs font-bold text-amber-900"
                            value={modalStaff.data.joiningDate || ""}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, joiningDate: e.target.value } })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: KYC & Official Identification */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                          <CreditCard size={14} className="text-amber-700" />
                          <span>2. Official KYC Identification Documents</span>
                        </p>
                        <span className="text-[10px] text-amber-800 font-semibold bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200">
                          PDF &amp; Images Uploaded
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {/* PAN Card Block */}
                        <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-3 shadow-2xs">
                          <div>
                            <label className="crm-label">PAN Card Number (10 Alphanumeric)</label>
                            <input
                              className="crm-input text-xs font-mono uppercase font-bold"
                              placeholder="e.g. ABCDE1234F"
                              maxLength={10}
                              value={modalStaff.data.panNumber || ""}
                              onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, panNumber: e.target.value.toUpperCase() } })}
                            />
                          </div>
                          <ImageUploader
                            variant="compact"
                            label="PAN Card Document (Upload Image or PDF)"
                            value={modalStaff.data.panDoc || ""}
                            category="KYC_PAN"
                            title={`${modalStaff.data.name || 'Staff'}_PAN`}
                            onChange={(url) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, panDoc: url } })}
                          />
                        </div>

                        {/* Aadhaar Card Block */}
                        <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-3 shadow-2xs">
                          <div>
                            <label className="crm-label">Aadhaar Card Number (12 Digits)</label>
                            <input
                              className="crm-input text-xs font-mono font-bold"
                              placeholder="e.g. 5432 1098 7654"
                              maxLength={14}
                              value={modalStaff.data.aadharNumber || ""}
                              onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, aadharNumber: e.target.value } })}
                            />
                          </div>
                          <ImageUploader
                            variant="compact"
                            label="Aadhaar Card Document (Upload Image or PDF)"
                            value={modalStaff.data.aadharDoc || ""}
                            category="KYC_AADHAAR"
                            title={`${modalStaff.data.name || 'Staff'}_Aadhaar`}
                            onChange={(url) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, aadharDoc: url } })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                        <div>
                          <label className="crm-label">Blood Group</label>
                          <select
                            className="crm-select text-xs font-bold"
                            value={modalStaff.data.bloodGroup || "O+"}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, bloodGroup: e.target.value } })}
                          >
                            <option value="O+">O Positive (O+)</option>
                            <option value="O-">O Negative (O-)</option>
                            <option value="A+">A Positive (A+)</option>
                            <option value="A-">A Negative (A-)</option>
                            <option value="B+">B Positive (B+)</option>
                            <option value="B-">B Negative (B-)</option>
                            <option value="AB+">AB Positive (AB+)</option>
                            <option value="AB-">AB Negative (AB-)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Banking & Address Details */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Building size={14} className="text-amber-700" />
                        <span>3. Banking &amp; Residential Address</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="crm-label">Bank Name</label>
                          <input
                            className="crm-input text-xs"
                            placeholder="e.g. State Bank of India"
                            value={modalStaff.data.bankName || ""}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, bankName: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="crm-label">Account Number</label>
                          <input
                            className="crm-input text-xs font-mono font-bold"
                            placeholder="Account number"
                            value={modalStaff.data.bankAccount || ""}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, bankAccount: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="crm-label">IFSC Code</label>
                          <input
                            className="crm-input text-xs font-mono uppercase"
                            placeholder="e.g. SBIN0001234"
                            value={modalStaff.data.ifscCode || ""}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, ifscCode: e.target.value.toUpperCase() } })}
                          />
                        </div>
                        <div>
                          <label className="crm-label">UPI ID for Payouts</label>
                          <input
                            className="crm-input text-xs font-mono"
                            placeholder="e.g. name@okhdfcbank"
                            value={modalStaff.data.upiId || ""}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, upiId: e.target.value } })}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="crm-label">Complete Residential Address</label>
                          <input
                            className="crm-input text-xs"
                            placeholder="House/Street, Landmark, City, Pincode"
                            value={modalStaff.data.address || ""}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, address: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="crm-label">Emergency Contact Person</label>
                          <input
                            className="crm-input text-xs"
                            placeholder="e.g. Parent / Spouse"
                            value={modalStaff.data.emergency || ""}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, emergency: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="crm-label">Emergency Phone</label>
                          <input
                            className="crm-input text-xs font-bold"
                            placeholder="Emergency contact phone"
                            value={modalStaff.data.emergencyPhone || ""}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, emergencyPhone: e.target.value } })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Connect Staff Account & Role Access */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 border border-amber-300 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                          <ShieldCheck size={16} className="text-amber-700" />
                          <span>4. Connect Staff Login Account &amp; Role Access</span>
                        </p>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded text-amber-700 focus:ring-amber-500"
                            checked={modalStaff.data.createLoginAccount}
                            onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, createLoginAccount: e.target.checked } })}
                          />
                          <span className="text-xs font-bold text-slate-800">Enable Software Login</span>
                        </label>
                      </div>

                      {modalStaff.data.createLoginAccount && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-amber-200/80">
                          <div>
                            <label className="crm-label">Login Password *</label>
                            <input
                              type="password"
                              className="crm-input text-xs font-mono"
                              placeholder={modalStaff.isEdit ? "Leave blank to keep" : "Min 6 characters"}
                              value={modalStaff.data.loginPassword || ""}
                              onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, loginPassword: e.target.value } })}
                            />
                          </div>
                          <div>
                            <label className="crm-label">Role Access Tier</label>
                            <select
                              className="crm-select text-xs font-bold"
                              value={modalStaff.data.loginRole}
                              onChange={(e) => setModalStaff({ ...modalStaff, data: { ...modalStaff.data, loginRole: e.target.value } })}
                            >
                              <option value="STAFF">STAFF (Self Attendance &amp; Selected Views)</option>
                              <option value="MANAGER">MANAGER (Advanced Module Access)</option>
                            </select>
                          </div>
                          <div>
                            <label className="crm-label">Auto-Configured Capabilities</label>
                            <div className="flex items-center gap-1 pt-1">
                              <span className="badge badge-green text-[10px] font-bold">
                                Attendance (Self Lock)
                              </span>
                              {modalStaff.data.category === "Administrative" && (
                                <span className="badge badge-blue text-[10px] font-bold">
                                  POS &amp; Bookings
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Form Buttons */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        className="btn-outline text-xs px-4 cursor-pointer"
                        onClick={() => setModalStaff({ open: false, isEdit: false, data: null })}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-gold text-xs px-8 font-bold shadow-md cursor-pointer">
                        {modalStaff.isEdit ? "Update Staff Record" : "Register Staff Member"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ─── IN-PAGE EXPANDABLE: VIEW FULL PROFILE & KYC INSPECTOR ─── */}
              {viewingProfile && (
                <div className="crm-card border-2 border-amber-300 bg-gradient-to-br from-amber-50/30 via-white to-white space-y-6 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      {viewingProfile.photo ? (
                        <img
                          src={viewingProfile.photo}
                          alt={viewingProfile.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center font-black text-amber-900 text-sm shadow-md">
                          {viewingProfile.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-serif font-black text-slate-900">{viewingProfile.name}</h3>
                        <p className="text-xs text-amber-900 font-bold">
                          {viewingProfile.type} • ID: <span className="font-mono">{viewingProfile.attendanceId}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                      onClick={() => setViewingProfile(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* KYC Details Card */}
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
                      <div>
                        <p className="text-slate-400 text-[11px] font-semibold">PAN Card Number</p>
                        <p className="text-slate-900 font-mono font-bold text-sm mt-0.5">
                          {viewingProfile.panNumber || "Not Uploaded"}
                        </p>
                        {viewingProfile.panDoc && (
                          <a
                            href={viewingProfile.panDoc}
                            target="_blank"
                            rel="noreferrer"
                            className="text-amber-800 text-[10px] font-bold underline flex items-center gap-1 mt-1"
                          >
                            <ExternalLink size={10} /> View PAN Document
                          </a>
                        )}
                      </div>
                      <div>
                        <p className="text-slate-400 text-[11px] font-semibold">Aadhaar Card Number</p>
                        <p className="text-slate-900 font-mono font-bold text-sm mt-0.5">
                          {viewingProfile.aadharNumber || "Not Uploaded"}
                        </p>
                        {viewingProfile.aadharDoc && (
                          <a
                            href={viewingProfile.aadharDoc}
                            target="_blank"
                            rel="noreferrer"
                            className="text-amber-800 text-[10px] font-bold underline flex items-center gap-1 mt-1"
                          >
                            <ExternalLink size={10} /> View Aadhaar Document
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Bank & Payout Details */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <p className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                        <Building size={13} className="text-amber-700" />
                        <span>Banking &amp; Settlement Info</span>
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px]">Bank Name:</span>
                          <p className="font-bold text-slate-800">{viewingProfile.bankName || "—"}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px]">A/c Number:</span>
                          <p className="font-mono font-bold text-slate-800">{viewingProfile.bankAccount || "—"}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px]">IFSC Code:</span>
                          <p className="font-mono font-bold text-slate-800">{viewingProfile.ifscCode || "—"}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px]">UPI ID:</span>
                          <p className="font-mono font-bold text-amber-900">{viewingProfile.upiId || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Personal & Emergency */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <span className="text-slate-400 text-[10px]">Phone Number:</span>
                        <p className="font-bold text-slate-800">{viewingProfile.phone}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Blood Group:</span>
                        <p className="font-bold text-rose-700">{viewingProfile.bloodGroup || "—"}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Joining Date:</span>
                        <p className="font-bold text-slate-800">{viewingProfile.joiningDate || "—"}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 text-[10px]">Residential Address:</span>
                        <p className="font-medium text-slate-800">{viewingProfile.address || "—"}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Emergency Contact:</span>
                        <p className="font-bold text-slate-800">{viewingProfile.emergency || "—"} ({viewingProfile.emergencyPhone || "—"})</p>
                      </div>
                    </div>

                    {/* Login Status */}
                    {(() => {
                      const linked = getLinkedUser(viewingProfile.email, viewingProfile.name);
                      return (
                        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-300 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                              <ShieldCheck size={14} className="text-emerald-700" />
                              <span>{linked ? `Active ${linked.role} Software Login` : "No Direct Login Account"}</span>
                            </p>
                            <p className="text-[11px] text-emerald-800/80 font-mono mt-0.5">
                              {linked ? `User: ${linked.email} • ${(linked.permissions || []).length} Assigned Capabilities` : "Create a login account to enable self-attendance and page permissions."}
                            </p>
                          </div>
                          <Link
                            href="/admin/users"
                            className="text-xs font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 hover:bg-emerald-100 flex items-center gap-1"
                          >
                            <span>Role Access Matrix</span>
                            <ArrowRight size={12} />
                          </Link>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-200">
                    <button
                      className="btn-outline text-xs px-5 cursor-pointer"
                      onClick={() => setViewingProfile(null)}
                    >
                      Close Inspector
                    </button>
                  </div>
                </div>
              )}

              <div className="crm-card overflow-x-auto">
                {filteredStaffList.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Users size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-600 font-semibold text-sm">No Staff Registered in this Category</p>
                    <p className="text-slate-400 text-xs">Add salon beauticians, stylists, or front desk personnel using the button above.</p>
                  </div>
                ) : (
                  <table className="crm-table w-full">
                    <thead>
                      <tr>
                        <th>Profile</th>
                        <th>Name &amp; Role</th>
                        <th>Category &amp; Dept</th>
                        <th>KYC &amp; Documents</th>
                        <th>Contact &amp; ID</th>
                        <th>Login Account</th>
                        <th>Monthly Salary</th>
                        <th>Comm.</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStaffList.map((sp) => {
                        const isServiceProv = sp.category !== "Administrative";
                        const staffServices = allServicesLogs.filter(
                          l => l.staffId === sp.id || l.staffName.toLowerCase() === sp.name.toLowerCase()
                        );
                        const staffRevenue = staffServices.reduce((sum, l) => sum + l.net, 0);
                        const staffComm = staffServices.reduce((sum, l) => sum + l.commAmt, 0);
                        const linkedUser = getLinkedUser(sp.email, sp.name);
                        const hasPan = Boolean(sp.panNumber);
                        const hasAadhar = Boolean(sp.aadharNumber);

                        return (
                          <tr key={sp.id} className="hover:bg-amber-50/20 transition-colors">
                            <td>
                              {sp.photo ? (
                                <img
                                  src={sp.photo}
                                  alt={sp.name}
                                  className="w-10 h-10 rounded-full object-cover border border-amber-300 shadow-xs"
                                />
                              ) : (
                                <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-black text-xs shadow-xs ${isServiceProv ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-slate-100 border-slate-300 text-slate-800'}`}>
                                  {sp.name[0]?.toUpperCase()}
                                </div>
                              )}
                            </td>
                            <td>
                              <p className="font-bold text-slate-800 text-sm">{sp.name}</p>
                              <p className="text-slate-500 text-xs">{sp.type}</p>
                              {sp.specialization && (
                                <p className="text-[10px] text-amber-800 font-medium line-clamp-1">
                                  ✨ {sp.specialization}
                                </p>
                              )}
                            </td>
                            <td>
                              <span className={`badge text-[10px] font-bold ${isServiceProv ? 'badge-gold' : 'badge-gray'}`}>
                                {isServiceProv ? "Service Provider" : "Administrative"}
                              </span>
                              <p className="text-[10px] text-slate-400 mt-0.5">{sp.department || "Salon"}</p>
                            </td>
                            <td>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${hasPan ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                    PAN: {hasPan ? sp.panNumber : '—'}
                                  </span>
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${hasAadhar ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                    UIDAI: {hasAadhar ? '••••' + String(sp.aadharNumber).slice(-4) : '—'}
                                  </span>
                                </div>
                                {sp.bankAccount && (
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    🏦 {sp.bankName || "Bank"} (A/c: ••••{String(sp.bankAccount).slice(-4)})
                                  </p>
                                )}
                              </div>
                            </td>
                            <td>
                              <p className="text-slate-700 text-xs font-semibold">{sp.phone}</p>
                              <p className="text-amber-800 font-mono text-[10px] font-bold">{sp.attendanceId}</p>
                            </td>
                            <td>
                              {linkedUser ? (
                                <div className="space-y-0.5">
                                  <span className="badge badge-green text-[10px] font-bold flex items-center gap-1">
                                    <ShieldCheck size={11} /> {linkedUser.role} Login
                                  </span>
                                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                                    {linkedUser.email}
                                  </p>
                                </div>
                              ) : (
                                <span className="badge badge-gray text-[10px]">
                                  No Login Account
                                </span>
                              )}
                            </td>
                            <td className="font-bold text-slate-900 text-xs">{formatCurrency(sp.salary)}</td>
                            <td className="text-xs">
                              {isServiceProv ? (
                                <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  {sp.commissionService}%
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">—</span>
                              )}
                            </td>
                            <td className="text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  className="btn-sm bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 flex items-center gap-1 cursor-pointer font-bold"
                                  onClick={() => {
                                    setModalStaff({ open: false, isEdit: false, data: null });
                                    setViewingProfile(sp);
                                  }}
                                  title="View Full Profile & KYC Documents"
                                >
                                  <Eye size={12} /> KYC
                                </button>
                                <button
                                  className="btn-sm bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 flex items-center gap-1 cursor-pointer font-bold"
                                  onClick={() => {
                                    setViewingProfile(null);
                                    const linked = getLinkedUser(sp.email, sp.name);
                                    setModalStaff({
                                      open: true,
                                      isEdit: true,
                                      data: {
                                        ...sp,
                                        createLoginAccount: Boolean(linked),
                                        loginPassword: "",
                                        loginRole: linked?.role || (isServiceProv ? "STAFF" : "MANAGER"),
                                        loginPermissions: linked?.permissions || ["attendance", "appointments", "clients"],
                                      }
                                    });
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  title="Edit Profile, KYC, Banking & Role Access"
                                >
                                  <Edit2 size={12} /> Edit
                                </button>
                                {isServiceProv && (
                                  <button
                                    className="btn-sm bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
                                    onClick={() => viewStaffHistory(sp)}
                                    title="View Full Month Service History"
                                  >
                                    <FileText size={12} /> Ledger
                                  </button>
                                )}
                                <button
                                  className="btn-danger p-1.5 cursor-pointer"
                                  onClick={() => delStaff(sp.id)}
                                  title="Delete Profile"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 2: STAFF MONTHLY SERVICE LEDGER & HISTORY
             ═══════════════════════════════════════════════════════════════════ */}
          {tab === "services_ledger" && (
            <div className="space-y-5">
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="crm-card bg-gradient-to-br from-amber-50 to-white border border-amber-200/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Services Completed</p>
                    <Scissors className="w-5 h-5 text-amber-700" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{ledgerMetrics.totalServices}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Assigned to beauticians</p>
                </div>

                <div className="crm-card bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Gross Billed</p>
                    <DollarSign className="w-5 h-5 text-slate-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(ledgerMetrics.totalGross)}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Service value before discounts</p>
                </div>

                <div className="crm-card bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">Net Service Revenue</p>
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-800 mt-2">{formatCurrency(ledgerMetrics.totalNetRevenue)}</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Net revenue generated</p>
                </div>

                <div className="crm-card bg-gradient-to-br from-indigo-50 to-white border border-indigo-200/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">Total Commission Earned</p>
                    <TrendingUp className="w-5 h-5 text-indigo-700" />
                  </div>
                  <p className="text-2xl font-bold text-indigo-900 mt-2">{formatCurrency(ledgerMetrics.totalCommission)}</p>
                  <p className="text-[11px] text-indigo-600 mt-0.5">Beautician payouts</p>
                </div>
              </div>

              {/* Ledger Table Container */}
              <div className="crm-card space-y-4">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="section-title">Individual Staff Service History &amp; Monthly Ledger</p>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Search */}
                    <div className="w-52 relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        className="crm-input pl-8 text-xs"
                        placeholder="Search staff, bill, service..."
                        value={ledgerSearch}
                        onChange={(e) => setLedgerSearch(e.target.value)}
                      />
                    </div>

                    {/* Staff Selector */}
                    <select
                      className="crm-select text-xs font-semibold w-44"
                      value={selectedStaffFilter}
                      onChange={(e) => setSelectedStaffFilter(e.target.value)}
                    >
                      <option value="all">All Staff Personnel</option>
                      {staffList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.type})
                        </option>
                      ))}
                    </select>

                    {/* Month Selector */}
                    <select
                      className="crm-select text-xs font-semibold w-36"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      {months.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>

                    {/* Year Selector */}
                    <select
                      className="crm-select text-xs font-semibold w-24"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                </div>

                {filteredServicesLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-600 font-semibold text-sm">No Service Logs Found</p>
                    <p className="text-slate-400 text-xs">No service records match the selected month/staff filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="crm-table w-full">
                      <thead>
                        <tr>
                          <th>Date &amp; Time</th>
                          <th>Bill No.</th>
                          <th>Service Performed</th>
                          <th>Assigned Provider</th>
                          <th>Client Name</th>
                          <th>Rate (₹)</th>
                          <th>Net Value</th>
                          <th>Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredServicesLogs.map((log) => (
                          <tr key={log.logId} className="hover:bg-slate-50/80 transition-colors">
                            <td>
                              <p className="font-bold text-slate-800 text-xs">{log.date}</p>
                              <p className="text-slate-400 text-[10.5px] font-mono">{log.time}</p>
                            </td>
                            <td>
                              <Link
                                href={`/admin/billing`}
                                className="text-amber-800 font-mono font-bold text-xs hover:underline"
                              >
                                {log.billNo}
                              </Link>
                            </td>
                            <td>
                              <p className="font-bold text-slate-800 text-xs">{log.serviceName}</p>
                              {log.qty > 1 && <span className="badge badge-gray text-[9px]">Qty: {log.qty}</span>}
                            </td>
                            <td>
                              <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-[10px]">
                                  {log.staffName[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 text-xs">{log.staffName}</p>
                                  <p className="text-slate-400 text-[10px]">{log.staffRole}</p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <p className="text-slate-700 text-xs font-semibold">{log.clientName}</p>
                              <p className="text-slate-400 text-[10px]">{log.phone}</p>
                            </td>
                            <td className="font-mono text-xs">{formatCurrency(log.rate)}</td>
                            <td className="font-bold text-slate-900 text-xs font-mono">{formatCurrency(log.net)}</td>
                            <td>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-emerald-800 text-xs font-mono">
                                  {formatCurrency(log.commAmt)}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">({log.commPct}%)</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
