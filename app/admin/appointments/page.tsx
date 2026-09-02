"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  User,
  Filter,
  DollarSign,
  Printer,
  Edit2,
  X,
  AlertCircle,
  Sparkles,
  Scissors,
  ArrowLeft,
  Award
} from "lucide-react";

export default function AdminAppointmentsPage() {
  const today = new Date().toISOString().split("T")[0];

  const [appointments, setAppointments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"calendar" | "book">("calendar");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Booking Form State
  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    date: today,
    time: "11:00",
    advance: 0,
    remarks: "",
    services: [
      {
        categoryId: "",
        serviceId: "",
        name: "",
        price: 0,
        providerId: "",
        providerName: "",
        discountType: "%",
        discountValue: 0
      }
    ]
  });

  // Edit Appointment State (FULL-PAGE MODE)
  const [editingAppt, setEditingAppt] = useState<any>(null);
  const [editServices, setEditServices] = useState<any[]>([]);
  const [editSaving, setEditSaving] = useState(false);

  // Delete Confirmation State
  const [deletingAppt, setDeletingAppt] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aRes, sRes, stRes, cRes] = await Promise.all([
        fetch("/api/crm/appointments"),
        fetch("/api/services"),
        fetch("/api/crm/staff?type=providers"),
        fetch("/api/crm/clients"),
      ]);

      if (aRes.ok) {
        const d = await aRes.json();
        if (d.success) setAppointments(d.data || []);
      }
      if (sRes.ok) {
        const d = await sRes.json();
        if (d.success) setCategories(d.data || []);
      }
      if (stRes.ok) {
        const d = await stRes.json();
        if (d.success) setStaff(d.data || []);
      }
      if (cRes.ok) {
        const d = await cRes.json();
        if (d.success) setClients(d.data || []);
      }
    } catch (err) {
      console.error("Error loading appointment data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper: Get subcategories and items for category
  const getSubcategoriesAndItemsForCategory = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return [];
    const itemsList: any[] = [];
    (cat.subcategories || []).forEach((sub: any) => {
      (sub.items || []).forEach((itm: any) => {
        itemsList.push({
          id: itm.id,
          name: itm.name,
          price: Number(itm.price || 0),
          subCategoryName: sub.name
        });
      });
    });
    return itemsList;
  };

  const totalBookingPrice = useMemo(() => {
    return form.services.reduce((acc, s) => {
      const gross = Number(s.price || 0);
      const disc = s.discountType === "%"
        ? (gross * Number(s.discountValue || 0)) / 100
        : Number(s.discountValue || 0);
      return acc + Math.max(0, gross - disc);
    }, 0);
  }, [form.services]);

  const addServiceRow = (catId = "") => {
    setForm({
      ...form,
      services: [
        ...form.services,
        {
          categoryId: catId,
          serviceId: "",
          name: "",
          price: 0,
          providerId: "",
          providerName: "",
          discountType: "%",
          discountValue: 0
        }
      ]
    });
  };

  const updateServiceCategory = (idx: number, catId: string) => {
    const copy = [...form.services];
    copy[idx].categoryId = catId;
    copy[idx].serviceId = "";
    copy[idx].name = "";
    copy[idx].price = 0;
    setForm({ ...form, services: copy });
  };

  const updateServiceItemSelect = (idx: number, serviceId: string) => {
    const copy = [...form.services];
    const items = getSubcategoriesAndItemsForCategory(copy[idx].categoryId);
    const selected = items.find(i => i.id === serviceId);
    if (selected) {
      copy[idx].serviceId = selected.id;
      copy[idx].name = selected.name;
      copy[idx].price = selected.price;
    }
    setForm({ ...form, services: copy });
  };

  const updateProviderRow = (idx: number, providerId: string) => {
    const p = staff.find(sp => sp.id === providerId);
    const copy = [...form.services];
    copy[idx].providerId = providerId;
    copy[idx].providerName = p?.name || "";
    setForm({ ...form, services: copy });
  };

  const handleBook = async () => {
    if (!form.clientName.trim() || !form.phone.trim()) {
      return alert("Client name and phone number are required.");
    }
    if (form.services.every(s => !s.name)) {
      return alert("Please select at least one service.");
    }

    // MANDATORY STAFF CHECK FOR APPOINTMENTS:
    const unassignedService = form.services.find(s => s.name && (!s.providerId || !s.providerName));
    if (unassignedService) {
      return alert(
        `Staff Allocation Required: Please select an assigned beautician/staff for "${unassignedService.name}". Every service must have an assigned staff member before scheduling.`
      );
    }

    const formattedServices = form.services
      .filter(s => s.name)
      .map(s => {
        const gross = Number(s.price || 0);
        const disc = s.discountType === "%"
          ? (gross * Number(s.discountValue || 0)) / 100
          : Number(s.discountValue || 0);
        return {
          name: s.name,
          price: Number(s.price || 0),
          qty: 1,
          discount: disc,
          discountPct: s.discountType === "%" ? Number(s.discountValue || 0) : 0,
          providerId: s.providerId,
          providerName: s.providerName
        };
      });

    try {
      const res = await fetch("/api/crm/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: form.clientName.trim(),
          phone: form.phone.trim(),
          date: form.date,
          time: form.time,
          services: formattedServices,
          total: totalBookingPrice,
          advance: Number(form.advance || 0),
          status: "Confirmed",
          remarks: form.remarks || null
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Appointment scheduled successfully!");
        setForm({
          clientName: "",
          phone: "",
          date: today,
          time: "11:00",
          advance: 0,
          remarks: "",
          services: [
            {
              categoryId: "",
              serviceId: "",
              name: "",
              price: 0,
              providerId: "",
              providerName: "",
              discountType: "%",
              discountValue: 0
            }
          ]
        });
        setTab("calendar");
        loadData();
      } else {
        alert(data.error || "Failed to book appointment");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while booking appointment");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/crm/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Edit Appointment Functions (FULL-PAGE MODE) ───
  const startEditAppointment = (appt: any) => {
    let sList = appt.services || [];
    if (typeof sList === "string") {
      try { sList = JSON.parse(sList); } catch { sList = []; }
    }
    setEditServices(sList.map((s: any, idx: number) => ({
      id: `edit_svc_${idx}`,
      categoryId: "",
      serviceId: s.serviceId || "",
      name: s.name || s.service || "",
      price: Number(s.price || 0),
      qty: Number(s.qty || 1),
      discountType: s.discountPct > 0 ? "%" : "₹",
      discountValue: s.discountPct > 0 ? Number(s.discountPct) : Number(s.discount || 0),
      providerName: s.providerName || s.provider || ""
    })));

    setEditingAppt({
      ...appt,
      clientName: appt.clientName || "",
      phone: appt.phone || "",
      date: appt.date || today,
      time: appt.time || "11:00",
      advance: Number(appt.advance || 0),
      status: appt.status || "Confirmed",
      remarks: appt.remarks || ""
    });
  };

  const addEditServiceRow = (catId = "") => {
    setEditServices([
      ...editServices,
      {
        id: `edit_svc_${Date.now()}`,
        categoryId: catId,
        serviceId: "",
        name: "",
        price: 0,
        qty: 1,
        discountType: "%",
        discountValue: 0,
        providerName: ""
      }
    ]);
  };

  const editTotalBookingPrice = useMemo(() => {
    return editServices.reduce((sum, s) => {
      const gross = Number(s.price || 0) * Number(s.qty || 1);
      const disc = s.discountType === "%"
        ? (gross * Number(s.discountValue || 0)) / 100
        : Number(s.discountValue || 0);
      return sum + Math.max(0, gross - disc);
    }, 0);
  }, [editServices]);

  const handleSaveEditedAppointment = async () => {
    if (!editingAppt) return;

    // MANDATORY STAFF CHECK ON EDIT:
    const unassignedEditService = editServices.find(s => s.name && (!s.providerName || s.providerName.trim() === ""));
    if (unassignedEditService) {
      return alert(
        `Staff Allocation Required: Please select an assigned beautician/staff for "${unassignedEditService.name}". Every service must have an assigned staff member.`
      );
    }

    try {
      setEditSaving(true);

      const formattedServices = editServices
        .filter(s => s.name)
        .map(s => {
          const gross = Number(s.price || 0) * Number(s.qty || 1);
          const disc = s.discountType === "%"
            ? (gross * Number(s.discountValue || 0)) / 100
            : Number(s.discountValue || 0);
          return {
            name: s.name,
            price: Number(s.price || 0),
            qty: Number(s.qty || 1),
            discount: disc,
            discountPct: s.discountType === "%" ? Number(s.discountValue || 0) : 0,
            providerName: s.providerName
          };
        });

      const payload = {
        id: editingAppt.id,
        clientName: editingAppt.clientName.trim(),
        phone: editingAppt.phone.trim(),
        date: editingAppt.date,
        time: editingAppt.time,
        services: formattedServices,
        total: editTotalBookingPrice,
        advance: Number(editingAppt.advance || 0),
        status: editingAppt.status,
        remarks: editingAppt.remarks || null
      };

      const res = await fetch("/api/crm/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const d = await res.json();
      if (d.success) {
        alert("Appointment updated successfully!");
        setEditingAppt(null);
        setTab("calendar");
        loadData();
      } else {
        alert(d.error || "Failed to update appointment");
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating appointment");
    } finally {
      setEditSaving(false);
    }
  };

  // ─── Delete Appointment ───
  const handleDeleteAppointment = async () => {
    if (!deletingAppt) return;
    try {
      const res = await fetch(`/api/crm/appointments?id=${deletingAppt.id}`, {
        method: "DELETE"
      });
      const d = await res.json();
      if (d.success) {
        setDeletingAppt(null);
        loadData();
      } else {
        alert(d.error || "Failed to delete appointment");
      }
    } catch (err) {
      console.error(err);
      alert("Network error deleting appointment");
    }
  };

  const formatCurrency = (amount: number) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const matchSearch =
        !searchQuery ||
        a.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.phone.includes(searchQuery) ||
        (Array.isArray(a.services) && a.services.some((s: any) => s.name?.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchDate = !filterDate || a.date === filterDate;
      const matchStatus = !filterStatus || a.status === filterStatus;
      return matchSearch && matchDate && matchStatus;
    });
  }, [appointments, searchQuery, filterDate, filterStatus]);

  // Appointment Metrics
  const metrics = useMemo(() => {
    const totalCount = filtered.length;
    const confirmedCount = filtered.filter(a => a.status === "Confirmed" || a.status === "Checked In").length;
    const pendingCount = filtered.filter(a => a.status === "Pending").length;
    const advanceSum = filtered.reduce((acc, a) => acc + Number(a.advance || 0), 0);
    return {
      totalCount,
      confirmedCount,
      pendingCount,
      advanceSum
    };
  }, [filtered]);

  // ══════════════════════════════════════════════════════════════════
  // IF IN FULL-PAGE EDIT MODE: RENDER DIRECTLY ON THE FULL PAGE
  // ══════════════════════════════════════════════════════════════════
  if (editingAppt) {
    return (
      <div className="fade-in space-y-6 max-w-7xl mx-auto pb-12">
        {/* Full-Page Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditingAppt(null)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={16} /> Back to Schedule
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-700" />
                <span>Editing Appointment for {editingAppt.clientName}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Full-page appointment editor: Modify schedule, booked services, prices, and beautician assignments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn-outline text-xs px-4 py-2"
              onClick={() => setEditingAppt(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-gold text-xs px-6 py-2.5 font-bold shadow-md flex items-center gap-1.5"
              disabled={editSaving}
              onClick={handleSaveEditedAppointment}
            >
              {editSaving ? "Saving..." : "Save Updated Appointment"}
            </button>
          </div>
        </div>

        {/* 2-Column Full-Page Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Left: Client Info & Services Editor */}
          <div className="lg:col-span-8 space-y-6">
            {/* Client & Date Card */}
            <div className="crm-card">
              <p className="section-title mb-3">Client &amp; Schedule Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="crm-label flex items-center justify-between gap-1 flex-wrap">
                    <span>Client Name *</span>
                    {(() => {
                      const matched = clients.find(cl => (editingAppt?.phone && cl.phone === editingAppt.phone) || (editingAppt?.clientName && cl.name.toLowerCase() === editingAppt.clientName.toLowerCase()));
                      if (matched?.membershipName) {
                        return (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#faf6ee] border border-[#ecdcc4] text-[#7a5426] text-[10.5px] font-bold shadow-xs">
                            <Award size={11} className="text-[#9a733e]" />
                            <span>VIP: {matched.membershipName}</span>
                            <CheckCircle2 size={11} className="text-[#2d5a42]" />
                          </span>
                        );
                      } else if (matched) {
                        return (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-500 text-[10px] font-medium">
                            No Membership Card
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </label>
                  <input
                    className="crm-input text-xs font-bold"
                    value={editingAppt.clientName}
                    onChange={(e) => setEditingAppt({ ...editingAppt, clientName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="crm-label">Phone Number *</label>
                  <input
                    className="crm-input text-xs font-bold"
                    value={editingAppt.phone}
                    onChange={(e) => setEditingAppt({ ...editingAppt, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="crm-label">Appointment Date *</label>
                  <input
                    type="date"
                    className="crm-input text-xs font-semibold"
                    value={editingAppt.date}
                    onChange={(e) => setEditingAppt({ ...editingAppt, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="crm-label">Time Slot *</label>
                  <input
                    type="time"
                    className="crm-input text-xs font-bold"
                    value={editingAppt.time}
                    onChange={(e) => setEditingAppt({ ...editingAppt, time: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Booked Services Card */}
            <div className="crm-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="section-title">Booked Services &amp; Staff Allocation</p>
                  <p className="text-[11px] text-slate-500">
                    Add or update services, <strong className="text-amber-900">assign beauticians (Mandatory)</strong>, and customize prices.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-outline text-xs py-1 px-3 flex items-center gap-1"
                  onClick={() => addEditServiceRow("")}
                >
                  <Plus size={13} /> Add Service
                </button>
              </div>

              <div className="space-y-3">
                {editServices.map((s, idx) => {
                  const availableServices = getSubcategoriesAndItemsForCategory(s.categoryId);
                  const gross = Number(s.price || 0) * Number(s.qty || 1);
                  const disc = s.discountType === "%"
                    ? (gross * Number(s.discountValue || 0)) / 100
                    : Number(s.discountValue || 0);
                  const net = Math.max(0, gross - disc);
                  const isStaffMissing = s.name && !s.providerName;

                  return (
                    <div
                      key={idx}
                      className={`p-4 bg-slate-50 rounded-2xl border transition-all space-y-3 ${isStaffMissing ? 'border-amber-300 ring-1 ring-amber-300' : 'border-slate-200'
                        }`}
                    >
                      {/* Top: Category, Service & Staff */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-4">
                          <label className="crm-label">1. Service Category</label>
                          <select
                            className="crm-select text-xs font-semibold"
                            value={s.categoryId}
                            onChange={(e) => {
                              const copy = [...editServices];
                              copy[idx].categoryId = e.target.value;
                              copy[idx].serviceId = "";
                              copy[idx].name = "";
                              copy[idx].price = 0;
                              setEditServices(copy);
                            }}
                          >
                            <option value="">-- Choose Category --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="crm-label">2. Select Service</label>
                          <select
                            className="crm-select text-xs font-bold"
                            value={s.serviceId}
                            disabled={!s.categoryId}
                            onChange={(e) => {
                              const copy = [...editServices];
                              const items = getSubcategoriesAndItemsForCategory(copy[idx].categoryId);
                              const found = items.find(i => i.id === e.target.value);
                              if (found) {
                                copy[idx].serviceId = found.id;
                                copy[idx].name = found.name;
                                copy[idx].price = found.price;
                              }
                              setEditServices(copy);
                            }}
                          >
                            <option value="">
                              {!s.categoryId ? "Select category first..." : "-- Choose Service --"}
                            </option>
                            {availableServices.map(sv => (
                              <option key={sv.id} value={sv.id}>
                                {sv.name} {sv.subCategoryName ? `(${sv.subCategoryName})` : ""} - ₹{sv.price}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="crm-label flex items-center justify-between text-slate-900 font-bold">
                            <span>3. Beautician</span>
                            <span className="text-[10px] text-rose-600 font-black uppercase">* Required</span>
                          </label>
                          <select
                            className={`crm-select text-xs font-bold ${isStaffMissing ? 'border-rose-400 bg-rose-50/40 text-rose-900' : 'text-slate-800'
                              }`}
                            value={s.providerName}
                            onChange={(e) => {
                              const copy = [...editServices];
                              copy[idx].providerName = e.target.value;
                              setEditServices(copy);
                            }}
                          >
                            <option value="">-- Select Staff (Required) --</option>
                            {staff.map(st => <option key={st.name} value={st.name}>{st.name} ({st.type})</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Bottom: Custom Name, Rate, Qty, Item-Level Discount, Net Total */}
                      <div className="grid grid-cols-12 gap-2 items-center pt-2 border-t border-slate-200/80">
                        <div className="col-span-12 sm:col-span-4">
                          <input
                            className="crm-input text-xs font-medium"
                            placeholder="Service name"
                            value={s.name}
                            onChange={(e) => {
                              const copy = [...editServices];
                              copy[idx].name = e.target.value;
                              setEditServices(copy);
                            }}
                          />
                        </div>

                        <div className="col-span-3 sm:col-span-2">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                            <input
                              type="number"
                              className="crm-input text-xs font-bold pl-5 text-right"
                              placeholder="Price"
                              value={s.price}
                              onChange={(e) => {
                                const copy = [...editServices];
                                copy[idx].price = Number(e.target.value);
                                setEditServices(copy);
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                          <input
                            type="number"
                            min="1"
                            className="crm-input text-xs font-bold text-center p-1"
                            value={s.qty}
                            onChange={(e) => {
                              const copy = [...editServices];
                              copy[idx].qty = Math.max(1, Number(e.target.value));
                              setEditServices(copy);
                            }}
                          />
                        </div>

                        {/* Discount */}
                        <div className="col-span-4 sm:col-span-3 flex items-center gap-1">
                          <div className="flex rounded-lg border border-slate-200 overflow-hidden shrink-0">
                            <button
                              type="button"
                              className={`px-2 py-1 text-xs font-bold ${s.discountType === '%' ? 'bg-amber-100 text-amber-900' : 'bg-slate-50 text-slate-600'}`}
                              onClick={() => {
                                const copy = [...editServices];
                                copy[idx].discountType = "%";
                                setEditServices(copy);
                              }}
                            >
                              %
                            </button>
                            <button
                              type="button"
                              className={`px-2 py-1 text-xs font-bold ${s.discountType === '₹' ? 'bg-amber-100 text-amber-900' : 'bg-slate-50 text-slate-600'}`}
                              onClick={() => {
                                const copy = [...editServices];
                                copy[idx].discountType = "₹";
                                setEditServices(copy);
                              }}
                            >
                              ₹
                            </button>
                          </div>
                          <input
                            type="number"
                            min="0"
                            className="crm-input text-xs p-1 text-right flex-1"
                            placeholder="Dis"
                            value={s.discountValue || ""}
                            onChange={(e) => {
                              const copy = [...editServices];
                              copy[idx].discountValue = Number(e.target.value);
                              setEditServices(copy);
                            }}
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-1 text-right font-bold text-slate-900 text-xs">
                          {formatCurrency(net)}
                        </div>

                        <div className="col-span-1 flex justify-end">
                          <button
                            type="button"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                            disabled={editServices.length <= 1}
                            onClick={() => setEditServices(editServices.filter((_, i) => i !== idx))}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Summary & Checkout Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="crm-card sticky top-6 space-y-4">
              <p className="section-title">Booking Status &amp; Advance</p>

              <div>
                <label className="crm-label">Booking Status</label>
                <select
                  className="crm-select text-xs font-bold"
                  value={editingAppt.status}
                  onChange={(e) => setEditingAppt({ ...editingAppt, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Checked In">Checked In</option>
                  <option value="Billed">Billed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="crm-label">Advance Deposit Collected (₹)</label>
                <input
                  type="number"
                  className="crm-input text-xs font-bold text-emerald-800"
                  value={editingAppt.advance}
                  onChange={(e) => setEditingAppt({ ...editingAppt, advance: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="crm-label">Remarks / Special Notes</label>
                <textarea
                  rows={3}
                  className="crm-input text-xs"
                  placeholder="Special client requirements, bridal notes..."
                  value={editingAppt.remarks || ""}
                  onChange={(e) => setEditingAppt({ ...editingAppt, remarks: e.target.value })}
                />
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center text-sm font-black text-amber-900">
                  <span>Estimated Total:</span>
                  <span className="text-xl">{formatCurrency(editTotalBookingPrice)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  className="btn-gold w-full py-3 text-sm font-bold shadow-md flex items-center justify-center gap-1.5"
                  disabled={editSaving}
                  onClick={handleSaveEditedAppointment}
                >
                  {editSaving ? "Saving..." : "Save Updated Appointment"}
                </button>
                <button
                  type="button"
                  className="btn-outline w-full py-2 text-xs"
                  onClick={() => setEditingAppt(null)}
                >
                  Cancel / Return to Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // DEFAULT APPOINTMENTS VIEW (CALENDAR SCHEDULE / BOOKING)
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="fade-in space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">
            Appointments &amp; Schedule Booking
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Book appointments with category selectors, mandatory staff assignment, schedule ledger, and receipt printing.
          </p>
        </div>
        <button
          className="btn-gold text-xs shadow-md flex items-center gap-1.5"
          onClick={() => setTab(tab === "book" ? "calendar" : "book")}
        >
          <Plus size={14} /> {tab === "book" ? "View Schedule Ledger" : "Book New Appointment"}
        </button>
      </div>

      {loading ? (
        <div className="crm-card py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 animate-pulse">
            Fetching appointment schedules, customer bookings, and staff allocations...
          </p>
        </div>
      ) : (
        <>
          {/* TAB: BOOK NEW APPOINTMENT */}
          {tab === "book" && (
            <div className="crm-card max-w-4xl space-y-5">
              <p className="section-title">Book New Client Appointment</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="crm-label">Contact Phone *</label>
                  <input
                    className="crm-input text-xs font-bold"
                    placeholder="10-digit mobile"
                    value={form.phone}
                    onChange={(e) => {
                      setForm({ ...form, phone: e.target.value });
                      const c = clients.find(cl => cl.phone === e.target.value);
                      if (c) setForm(f => ({ ...f, clientName: c.name }));
                    }}
                  />
                </div>
                <div>
                  <label className="crm-label flex items-center justify-between gap-1 flex-wrap">
                    <span>Client Name *</span>
                    {(() => {
                      const matched = clients.find(cl => (form.phone.trim() && cl.phone === form.phone.trim()) || (form.clientName.trim() && cl.name.toLowerCase() === form.clientName.trim().toLowerCase()));
                      if (matched?.membershipName) {
                        return (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#faf6ee] border border-[#ecdcc4] text-[#7a5426] text-[10.5px] font-bold shadow-xs">
                            <Award size={11} className="text-[#9a733e]" />
                            <span>VIP: {matched.membershipName}</span>
                            <CheckCircle2 size={11} className="text-[#2d5a42]" />
                          </span>
                        );
                      } else if (matched) {
                        return (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-500 text-[10px] font-medium">
                            No Membership Card
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </label>
                  <input
                    className="crm-input text-xs font-bold"
                    placeholder="Full name"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="crm-label">Appointment Date *</label>
                  <input
                    type="date"
                    className="crm-input text-xs"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="crm-label">Appointment Time *</label>
                  <input
                    type="time"
                    className="crm-input text-xs font-bold"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="crm-label text-slate-900 font-bold">
                    Booked Services &amp; Staff Allocation <span className="text-rose-600 font-bold">(* Staff Required)</span>
                  </label>
                  <button className="btn-outline text-xs py-1 px-3" onClick={() => addServiceRow("")}>
                    <Plus size={12} /> Add Service
                  </button>
                </div>

                <div className="space-y-3">
                  {form.services.map((row, idx) => {
                    const availableServices = getSubcategoriesAndItemsForCategory(row.categoryId);
                    const lineGross = Number(row.price || 0);
                    const lineDisc = row.discountType === "%"
                      ? (lineGross * Number(row.discountValue || 0)) / 100
                      : Number(row.discountValue || 0);
                    const lineNet = Math.max(0, lineGross - lineDisc);
                    const isStaffMissing = row.name && !row.providerId;

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 bg-slate-50 rounded-2xl border transition-all space-y-2.5 ${isStaffMissing ? 'border-amber-300 ring-1 ring-amber-300' : 'border-slate-200'
                          }`}
                      >
                        {/* Top: Category & Service Dropdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                          <div className="sm:col-span-4">
                            <label className="crm-label">1. Service Category</label>
                            <select
                              className="crm-select text-xs font-semibold"
                              value={row.categoryId}
                              onChange={(e) => updateServiceCategory(idx, e.target.value)}
                            >
                              <option value="">-- Choose Category --</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>

                          <div className="sm:col-span-4">
                            <label className="crm-label">2. Select Service</label>
                            <select
                              className="crm-select text-xs font-bold"
                              value={row.serviceId}
                              disabled={!row.categoryId}
                              onChange={(e) => updateServiceItemSelect(idx, e.target.value)}
                            >
                              <option value="">
                                {!row.categoryId ? "Select category first..." : "-- Choose Service --"}
                              </option>
                              {availableServices.map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.name} {s.subCategoryName ? `(${s.subCategoryName})` : ""} - ₹{s.price}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-4">
                            <label className="crm-label flex items-center justify-between text-slate-900 font-bold">
                              <span>3. Beautician</span>
                              <span className="text-[10px] text-rose-600 font-black uppercase">* Required</span>
                            </label>
                            <select
                              className={`crm-select text-xs font-bold ${isStaffMissing ? 'border-rose-400 bg-rose-50/40 text-rose-900' : 'text-slate-800'
                                }`}
                              value={row.providerId}
                              onChange={(e) => updateProviderRow(idx, e.target.value)}
                            >
                              <option value="">-- Select Staff (Required) --</option>
                              {staff.map(sp => <option key={sp.id} value={sp.id}>{sp.name} ({sp.type})</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Bottom: Custom Name, Rate, Discount, Line Net Total */}
                        <div className="grid grid-cols-12 gap-2 items-center pt-2 border-t border-slate-200/80">
                          <div className="col-span-12 sm:col-span-5">
                            <input
                              className="crm-input text-xs font-medium"
                              placeholder="Service title"
                              value={row.name}
                              onChange={(e) => {
                                const copy = [...form.services];
                                copy[idx].name = e.target.value;
                                setForm({ ...form, services: copy });
                              }}
                            />
                          </div>

                          <div className="col-span-4 sm:col-span-2">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                              <input
                                type="number"
                                className="crm-input text-xs font-bold pl-5 text-right"
                                placeholder="Price"
                                value={row.price || ""}
                                onChange={(e) => {
                                  const copy = [...form.services];
                                  copy[idx].price = Number(e.target.value);
                                  setForm({ ...form, services: copy });
                                }}
                              />
                            </div>
                          </div>

                          {/* Discount (% or ₹) */}
                          <div className="col-span-5 sm:col-span-3 flex items-center gap-1">
                            <div className="flex rounded-lg border border-slate-200 overflow-hidden shrink-0">
                              <button
                                type="button"
                                className={`px-1.5 py-1 text-[10px] font-bold ${row.discountType === '%' ? 'bg-amber-100 text-amber-900' : 'bg-slate-50 text-slate-600'}`}
                                onClick={() => {
                                  const copy = [...form.services];
                                  copy[idx].discountType = "%";
                                  setForm({ ...form, services: copy });
                                }}
                              >
                                %
                              </button>
                              <button
                                type="button"
                                className={`px-1.5 py-1 text-[10px] font-bold ${row.discountType === '₹' ? 'bg-amber-100 text-amber-900' : 'bg-slate-50 text-slate-600'}`}
                                onClick={() => {
                                  const copy = [...form.services];
                                  copy[idx].discountType = "₹";
                                  setForm({ ...form, services: copy });
                                }}
                              >
                                ₹
                              </button>
                            </div>
                            <input
                              type="number"
                              min="0"
                              className="crm-input text-xs p-1 text-right flex-1"
                              placeholder="Dis"
                              value={row.discountValue || ""}
                              onChange={(e) => {
                                const copy = [...form.services];
                                copy[idx].discountValue = Number(e.target.value);
                                setForm({ ...form, services: copy });
                              }}
                            />
                          </div>

                          <div className="col-span-2 sm:col-span-1 text-right font-bold text-slate-900 text-xs">
                            {formatCurrency(lineNet)}
                          </div>

                          <div className="col-span-1 flex justify-end">
                            <button
                              type="button"
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                              disabled={form.services.length <= 1}
                              onClick={() => setForm({ ...form, services: form.services.filter((_, i) => i !== idx) })}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <label className="crm-label">Advance Deposit Collected (₹)</label>
                  <input
                    type="number"
                    className="crm-input text-xs font-bold text-emerald-800"
                    value={form.advance || ""}
                    onChange={(e) => setForm({ ...form, advance: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="crm-label">Remarks / Special Notes</label>
                  <input
                    className="crm-input text-xs"
                    placeholder="Bridal, sensitive skin, etc."
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900">Estimated Appointment Total:</span>
                <span className="text-base font-black text-amber-900">{formatCurrency(totalBookingPrice)}</span>
              </div>

              <button
                className="btn-gold w-full py-3 text-sm font-bold shadow-md"
                onClick={handleBook}
              >
                Confirm &amp; Schedule Appointment
              </button>
            </div>
          )}

          {/* TAB: CALENDAR / SCHEDULE LEDGER */}
          {tab === "calendar" && (
            <div className="space-y-5">
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="crm-card bg-gradient-to-br from-amber-50 to-white border border-amber-200/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Total Bookings</p>
                    <Calendar className="w-5 h-5 text-amber-700" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{metrics.totalCount}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Appointments listed</p>
                </div>

                <div className="crm-card bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">Confirmed</p>
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  </div>
                  <p className="text-2xl font-black text-emerald-800 mt-2">{metrics.confirmedCount}</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Confirmed &amp; Checked In</p>
                </div>

                <div className="crm-card bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Pending</p>
                    <Clock className="w-5 h-5 text-slate-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{metrics.pendingCount}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Awaiting confirmation</p>
                </div>

                <div className="crm-card bg-gradient-to-br from-indigo-50 to-white border border-indigo-200/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">Advance Collected</p>
                    <DollarSign className="w-5 h-5 text-indigo-700" />
                  </div>
                  <p className="text-2xl font-black text-indigo-900 mt-2">{formatCurrency(metrics.advanceSum)}</p>
                  <p className="text-[11px] text-indigo-600 mt-0.5">Prepaid deposits</p>
                </div>
              </div>

              {/* Schedule Filter & Table Card */}
              <div className="crm-card space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="section-title">Appointments Schedule &amp; History</p>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Search */}
                    <div className="w-60 relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        className="crm-input pl-8 text-xs"
                        placeholder="Search client, phone, service..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Date Filter */}
                    <input
                      type="date"
                      className="crm-input text-xs w-36"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />

                    {/* Status Filter */}
                    <select
                      className="crm-select text-xs w-32"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Checked In">Checked In</option>
                      <option value="Billed">Billed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <button
                      className="btn-outline text-xs py-1.5 px-2.5"
                      onClick={() => {
                        setFilterDate(today);
                        setFilterStatus("");
                        setSearchQuery("");
                      }}
                    >
                      Today
                    </button>

                    {(searchQuery || filterDate || filterStatus) && (
                      <button
                        className="btn-outline text-xs py-1.5 px-2.5"
                        onClick={() => {
                          setFilterDate("");
                          setFilterStatus("");
                          setSearchQuery("");
                        }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Table */}
                {filtered.length === 0 ? (
                  <div className="text-center py-14">
                    <Calendar size={36} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-700 font-bold text-sm">No Appointments Found</p>
                    <p className="text-slate-400 text-xs mt-0.5">Schedule new bookings or adjust your filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="crm-table">
                      <thead>
                        <tr>
                          <th>Date &amp; Time</th>
                          <th>Client Name</th>
                          <th>Contact</th>
                          <th>Booked Services</th>
                          <th>Est. Total</th>
                          <th>Advance</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((a) => {
                          let sList = a.services;
                          if (typeof sList === "string") {
                            try { sList = JSON.parse(sList); } catch { sList = []; }
                          }
                          const servicesSummary = Array.isArray(sList)
                            ? sList.map((s: any) => `${s.name || s.service}${s.providerName ? ` (${s.providerName})` : ''}`).join(", ")
                            : "-";

                          return (
                            <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="whitespace-nowrap">
                                <span className="font-bold text-amber-900 text-xs block">{a.time}</span>
                                <span className="text-[11px] text-slate-500">{a.date}</span>
                              </td>
                              <td className="font-bold text-slate-900 text-xs">{a.clientName}</td>
                              <td className="text-slate-600 text-xs font-semibold">{a.phone}</td>
                              <td className="text-slate-700 text-xs max-w-xs truncate" title={servicesSummary}>
                                {servicesSummary}
                              </td>
                              <td className="font-bold text-slate-900 text-xs">{formatCurrency(a.total)}</td>
                              <td className="text-emerald-700 font-bold text-xs">{formatCurrency(a.advance)}</td>
                              <td>
                                <span className={`badge ${a.status === 'Confirmed' || a.status === 'Checked In' ? 'badge-green' :
                                    a.status === 'Pending' ? 'badge-gold' : 'badge-gray'
                                  }`}>
                                  {a.status}
                                </span>
                              </td>
                              <td className="text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {a.status !== "Checked In" && a.status !== "Billed" && (
                                    <button
                                      className="btn-sm bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                                      onClick={() => updateStatus(a.id, "Checked In")}
                                      title="Check In Client"
                                    >
                                      Check In
                                    </button>
                                  )}

                                  {/* View / Print Invoice */}
                                  <Link
                                    href={`/admin/appointments/invoice/${a.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-sm bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100"
                                    title="Print Appointment Invoice"
                                  >
                                    <Printer size={12} />
                                  </Link>

                                  {/* Edit Appointment (Full Page) */}
                                  <button
                                    className="btn-sm bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
                                    onClick={() => startEditAppointment(a)}
                                    title="Edit Booking Details"
                                  >
                                    <Edit2 size={12} />
                                  </button>

                                  {/* Delete Appointment */}
                                  <button
                                    className="btn-sm bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
                                    onClick={() => setDeletingAppt(a)}
                                    title="Delete Appointment"
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
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── IN-PAGE: DELETE APPOINTMENT CONFIRMATION ─── */}
      {deletingAppt && (
        <div className="crm-card border-2 border-rose-300 bg-rose-50/90 p-5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold">
              <Trash2 size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">Delete Appointment Confirmation</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Permanently delete appointment for <strong>{deletingAppt.clientName}</strong> on <strong>{deletingAppt.date} at {deletingAppt.time}</strong>?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              className="btn-outline text-xs px-4 bg-white cursor-pointer"
              onClick={() => setDeletingAppt(null)}
            >
              Cancel
            </button>
            <button
              className="btn-sm bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-xs"
              onClick={handleDeleteAppointment}
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
