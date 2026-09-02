"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Key,
  Mail,
  User as UserIcon,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  CheckSquare,
  Square,
  Eye,
  Edit3,
  SlidersHorizontal,
  Lock,
  Layers,
  Sparkles,
  PlusCircle
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
  permissions: string[];
  createdAt: string;
}

interface PermissionModule {
  id: string;
  label: string;
  desc: string;
  group?: string;
}

const permissionGroups = [
  {
    name: "Operations & POS",
    modules: [
      { id: "billing", label: "Billing & POS", desc: "Invoice creation, billing counter, and payment receipts" },
      { id: "appointments", label: "Appointments Booking", desc: "Calendar schedule, slot booking, and queue management" },
      { id: "followups", label: "Daily Follow-ups", desc: "Client call follow-ups, pending renewals, and logs" },
      { id: "enquiries", label: "Enquiries & Leads", desc: "Lead capture, walk-in inquiries, and conversions" },
      { id: "clients", label: "Clients Directory", desc: "Customer profiles, transaction history, and wallet" },
    ]
  },
  {
    name: "Salon Master",
    modules: [
      { id: "services", label: "Services Catalog", desc: "Categories, subcategories, pricing, and timing" },
      { id: "packages", label: "Packages Builder", desc: "Combo packages, duration, and bundled items" },
      { id: "memberships", label: "VIP Memberships", desc: "Tier benefits, discounts, and point boosters" },
      { id: "coupons", label: "Coupons & Discounts", desc: "Promo codes, minimum bills, and validity rules" },
      { id: "inventory", label: "Product Inventory Hub", desc: "Retail stock, usage logs, barcodes, and purchases" },
    ]
  },
  {
    name: "Team & Payroll",
    modules: [
      { id: "staff", label: "Team & Beauticians", desc: "Provider directory, salary, and commissions" },
      { id: "attendance", label: "Staff Attendance", desc: "Daily roster, punch logs, and geofencing verification" },
      { id: "payroll", label: "Monthly Payroll", desc: "Monthly salary generation and payouts" },
    ]
  },
  {
    name: "Financials & Audits",
    modules: [
      { id: "expenses", label: "Salon Expenses", desc: "Expense tracking, categories, and payment modes" },
      { id: "reports", label: "11-Report Analytics", desc: "Sales, provider revenue, and inventory reports" },
      { id: "assessment", label: "Quality Audits", desc: "Daily branch checklist, ratings, and audits" },
      { id: "feedbacks", label: "Client Feedbacks", desc: "Customer ratings, satisfaction reviews, and notes" },
      { id: "reminders", label: "Service Reminders", desc: "Automated WhatsApp and SMS reminder rules" },
    ]
  },
  {
    name: "Multi-Branch & Marketing",
    modules: [
      { id: "branches", label: "Branch Locations", desc: "Multi-salon branches, managers, and targets" },
      { id: "transfers", label: "Branch Transfers", desc: "Stock and asset movement between branches" },
      { id: "gallery", label: "Photo Gallery", desc: "Portfolio media vault and categorizations" },
      { id: "sms", label: "SMS & WhatsApp", desc: "Bulk campaigns, transactional alerts, and logs" },
    ]
  },
  {
    name: "Website CMS & Settings",
    modules: [
      { id: "offers", label: "Website Offers", desc: "Homepage banners, discount deals, and badges" },
      { id: "hero", label: "Hero Slides", desc: "Main landing slider images, titles, and buttons" },
      { id: "interior", label: "Sanctuary Interior", desc: "Salon gallery showcase images and labels" },
      { id: "images", label: "Image Asset Vault", desc: "Cloudflare R2 image library and uploads" },
      { id: "settings", label: "Software & API Settings", desc: "Brand configuration, API keys, and database sync" },
    ]
  }
];

const allModulesList = permissionGroups.flatMap(g => g.modules);

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [modal, setModal] = useState<{
    open: boolean;
    isEdit: boolean;
    data: {
      id?: string;
      name: string;
      email: string;
      password?: string;
      role: "ADMIN" | "MANAGER" | "STAFF";
      permissions: string[];
    };
  }>({
    open: false,
    isEdit: false,
    data: { name: "", email: "", password: "", role: "MANAGER", permissions: [] },
  });

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.user) {
          setCurrentUserId(authData.user.id);
        }
      }

      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        showToast("error", data.error || "Failed to load staff users");
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Network error while loading staff users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ─── GRANULAR PERMISSION CHECKERS (VIEW, CREATE, EDIT, DELETE) ───
  const hasView = (moduleId: string) => {
    const perms = modal.data.permissions || [];
    return perms.includes(moduleId) || perms.includes(`${moduleId}:view`);
  };

  const hasCreate = (moduleId: string) => {
    const perms = modal.data.permissions || [];
    return perms.includes(`${moduleId}:create`);
  };

  const hasEdit = (moduleId: string) => {
    const perms = modal.data.permissions || [];
    return perms.includes(`${moduleId}:edit`);
  };

  const hasDelete = (moduleId: string) => {
    const perms = modal.data.permissions || [];
    return perms.includes(`${moduleId}:delete`);
  };

  // ─── GRANULAR TOGGLERS ───
  const toggleView = (moduleId: string) => {
    const current = modal.data.permissions || [];
    const isCurrentlyView = hasView(moduleId);

    if (isCurrentlyView) {
      // Remove View, Create, Edit, and Delete for this module
      const filtered = current.filter(
        p => p !== moduleId && p !== `${moduleId}:view` && p !== `${moduleId}:create` && p !== `${moduleId}:edit` && p !== `${moduleId}:delete`
      );
      setModal({ ...modal, data: { ...modal.data, permissions: filtered } });
    } else {
      // Add View
      const updated = Array.from(new Set([...current, moduleId]));
      setModal({ ...modal, data: { ...modal.data, permissions: updated } });
    }
  };

  const toggleCreate = (moduleId: string) => {
    const current = modal.data.permissions || [];
    const isCurrentlyCreate = hasCreate(moduleId);
    const createKey = `${moduleId}:create`;

    if (isCurrentlyCreate) {
      const filtered = current.filter(p => p !== createKey);
      setModal({ ...modal, data: { ...modal.data, permissions: filtered } });
    } else {
      // Adding Create also ensures View is present
      const updated = Array.from(new Set([...current, moduleId, createKey]));
      setModal({ ...modal, data: { ...modal.data, permissions: updated } });
    }
  };

  const toggleEdit = (moduleId: string) => {
    const current = modal.data.permissions || [];
    const isCurrentlyEdit = hasEdit(moduleId);
    const editKey = `${moduleId}:edit`;

    if (isCurrentlyEdit) {
      const filtered = current.filter(p => p !== editKey);
      setModal({ ...modal, data: { ...modal.data, permissions: filtered } });
    } else {
      // Adding Edit also ensures View is present
      const updated = Array.from(new Set([...current, moduleId, editKey]));
      setModal({ ...modal, data: { ...modal.data, permissions: updated } });
    }
  };

  const toggleDelete = (moduleId: string) => {
    const current = modal.data.permissions || [];
    const isCurrentlyDelete = hasDelete(moduleId);
    const deleteKey = `${moduleId}:delete`;

    if (isCurrentlyDelete) {
      const filtered = current.filter(p => p !== deleteKey);
      setModal({ ...modal, data: { ...modal.data, permissions: filtered } });
    } else {
      // Adding Delete also ensures View is present
      const updated = Array.from(new Set([...current, moduleId, deleteKey]));
      setModal({ ...modal, data: { ...modal.data, permissions: updated } });
    }
  };

  // Group Level Helpers
  const grantGroupAll = (groupModules: PermissionModule[]) => {
    const current = modal.data.permissions || [];
    const toAdd: string[] = [];
    groupModules.forEach(m => {
      toAdd.push(m.id, `${m.id}:create`, `${m.id}:edit`, `${m.id}:delete`);
    });
    const merged = Array.from(new Set([...current, ...toAdd]));
    setModal({ ...modal, data: { ...modal.data, permissions: merged } });
  };

  const grantGroupViewOnly = (groupModules: PermissionModule[]) => {
    const current = modal.data.permissions || [];
    const groupModuleIds = groupModules.map(m => m.id);
    // Remove create, edit & delete for this group, ensure view is set
    const filtered = current.filter(
      p => !groupModuleIds.some(id => p === `${id}:create` || p === `${id}:edit` || p === `${id}:delete`)
    );
    const merged = Array.from(new Set([...filtered, ...groupModuleIds]));
    setModal({ ...modal, data: { ...modal.data, permissions: merged } });
  };

  const clearGroup = (groupModules: PermissionModule[]) => {
    const current = modal.data.permissions || [];
    const groupKeys = groupModules.flatMap(m => [m.id, `${m.id}:view`, `${m.id}:create`, `${m.id}:edit`, `${m.id}:delete`]);
    const filtered = current.filter(p => !groupKeys.includes(p));
    setModal({ ...modal, data: { ...modal.data, permissions: filtered } });
  };

  // Global Presets
  const selectAllFullPermissions = () => {
    const allTokens: string[] = [];
    allModulesList.forEach(m => {
      allTokens.push(m.id, `${m.id}:create`, `${m.id}:edit`, `${m.id}:delete`);
    });
    setModal({ ...modal, data: { ...modal.data, permissions: allTokens } });
  };

  const selectAllViewOnly = () => {
    setModal({ ...modal, data: { ...modal.data, permissions: allModulesList.map(m => m.id) } });
  };

  const deselectAllPermissions = () => {
    setModal({ ...modal, data: { ...modal.data, permissions: [] } });
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isEdit, data } = modal;

    if (!data.name || !data.email) {
      showToast("error", "Name and email are required");
      return;
    }

    if (!isEdit && (!data.password || data.password.length < 6)) {
      showToast("error", "Password must be at least 6 characters");
      return;
    }

    try {
      const url = "/api/users";
      const method = isEdit ? "PUT" : "POST";
      const allTokens: string[] = [];
      allModulesList.forEach(m => {
        allTokens.push(m.id, `${m.id}:create`, `${m.id}:edit`, `${m.id}:delete`);
      });

      const payload: any = {
        name: data.name,
        email: data.email,
        role: data.role,
        permissions: data.role === "ADMIN" ? allTokens : data.permissions,
      };

      if (isEdit) {
        payload.id = data.id;
        if (data.password && data.password.length >= 6) {
          payload.password = data.password;
        }
      } else {
        payload.password = data.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (resData.success) {
        showToast("success", isEdit ? "Staff user updated successfully" : "New staff user created");
        setModal({ open: false, isEdit: false, data: { name: "", email: "", password: "", role: "MANAGER", permissions: [] } });
        loadUsers();
      } else {
        showToast("error", resData.error || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save user");
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (user.id === currentUserId) {
      showToast("error", "You cannot delete your own account");
      return;
    }

    if (!confirm(`Are you sure you want to remove staff member ${user.name}?`)) return;

    try {
      const res = await fetch(`/api/users?id=${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Staff member removed");
        loadUsers();
      } else {
        showToast("error", data.error || "Failed to delete user");
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to delete user");
    }
  };

  return (
    <div className="fade-in space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-rose-50 text-rose-900 border-rose-300'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">
            Staff &amp; Role-Based Access Control
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Configure staff logins with full CRUD permissions (View, Create, Edit, and Delete) across all CRM modules.
          </p>
        </div>
        <button
          onClick={() => {
            setModal({
              open: true,
              isEdit: false,
              data: {
                name: "",
                email: "",
                password: "",
                role: "MANAGER",
                permissions: [
                  "billing", "billing:create", "billing:edit",
                  "appointments", "appointments:create", "appointments:edit",
                  "clients", "clients:create", "clients:edit",
                  "enquiries", "enquiries:create", "enquiries:edit"
                ]
              },
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="btn-gold text-xs px-4 py-2.5 shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Staff User
        </button>
      </div>

      {/* ─── USER CREATE / EDIT ROLE ACCESS IN-PAGE CARD ─── */}
      {modal.open && (
        <div className="crm-card border-2 border-amber-300/80 bg-white space-y-5 shadow-2xl rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
              <span>{modal.isEdit ? `Edit Staff Member: ${modal.data.name}` : "Create New Staff Account & Role Access"}</span>
            </h2>
            <button
              onClick={() => setModal({ open: false, isEdit: false, data: { name: "", email: "", password: "", role: "MANAGER", permissions: [] } })}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveUser} className="space-y-6">
            {/* Account Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
              <div>
                <label className="crm-label">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  className="crm-input text-xs font-bold"
                  placeholder="e.g. Priya Sharma"
                  value={modal.data.name}
                  onChange={(e) => setModal({ ...modal, data: { ...modal.data, name: e.target.value } })}
                />
              </div>
              <div>
                <label className="crm-label">Email Address (Login ID) *</label>
                <input
                  type="email"
                  required
                  className="crm-input text-xs font-semibold"
                  placeholder="staff@vivazen.in"
                  value={modal.data.email}
                  onChange={(e) => setModal({ ...modal, data: { ...modal.data, email: e.target.value } })}
                />
              </div>
              <div>
                <label className="crm-label">
                  {modal.isEdit ? "Password (leave blank to keep)" : "Account Password *"}
                </label>
                <input
                  type="password"
                  placeholder={modal.isEdit ? "••••••••" : "Min 6 characters"}
                  className="crm-input text-xs"
                  value={modal.data.password || ""}
                  onChange={(e) => setModal({ ...modal, data: { ...modal.data, password: e.target.value } })}
                />
              </div>
              <div>
                <label className="crm-label">Role Tier</label>
                <select
                  className="crm-select text-xs font-bold"
                  value={modal.data.role}
                  onChange={(e) => setModal({ ...modal, data: { ...modal.data, role: e.target.value as any } })}
                >
                  <option value="ADMIN">ADMIN (Full Unrestricted Access)</option>
                  <option value="MANAGER">MANAGER (Configurable Module Access)</option>
                  <option value="STAFF">STAFF (Self-Attendance &amp; Assigned Modules)</option>
                </select>
              </div>
            </div>

            {/* ─── GRANULAR PERMISSION MATRIX (VIEW, CREATE, EDIT, DELETE) ─── */}
            {modal.data.role !== "ADMIN" ? (
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <SlidersHorizontal size={13} className="text-amber-700" />
                      <span>Granular Module &amp; Action Permissions</span>
                    </label>
                    <p className="text-[11px] text-slate-500 font-light">
                      Select exact capabilities for each module: <strong>View</strong>, <strong>Create</strong> (Add New), <strong>Edit</strong> (Update Records), and <strong>Delete</strong>.
                    </p>
                  </div>

                  {/* Preset Controls */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={selectAllFullPermissions}
                      className="text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200/80 px-2.5 py-1 rounded-lg border border-amber-300 cursor-pointer shadow-xs transition-colors"
                    >
                      🌟 Full (View + Create + Edit + Delete)
                    </button>
                    <button
                      type="button"
                      onClick={selectAllViewOnly}
                      className="text-[11px] font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 cursor-pointer transition-colors"
                    >
                      👁️ View-Only All
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllPermissions}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer transition-colors"
                    >
                      🧹 Clear All
                    </button>
                  </div>
                </div>

                {/* Grouped Permission Accordion Cards */}
                <div className="space-y-4">
                  {permissionGroups.map((group) => (
                    <div key={group.name} className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3.5 space-y-3">
                      {/* Group Header */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers size={13} className="text-amber-700" />
                          <span>{group.name}</span>
                        </span>
                        <div className="flex items-center gap-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => grantGroupAll(group.modules)}
                            className="font-bold text-amber-800 hover:underline cursor-pointer"
                          >
                            All (V·C·E·D)
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => grantGroupViewOnly(group.modules)}
                            className="font-bold text-blue-700 hover:underline cursor-pointer"
                          >
                            View Only
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => clearGroup(group.modules)}
                            className="text-slate-400 hover:text-slate-700 hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Module Granular Capability Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {group.modules.map((module) => {
                          const v = hasView(module.id);
                          const c = hasCreate(module.id);
                          const e = hasEdit(module.id);
                          const d = hasDelete(module.id);

                          return (
                            <div
                              key={module.id}
                              className={`p-2.5 rounded-xl border transition-all ${
                                v
                                  ? "bg-white border-amber-300/80 shadow-2xs"
                                  : "bg-slate-100/60 border-slate-200 opacity-60"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <div>
                                  <p className="font-bold text-slate-800 text-xs">{module.label}</p>
                                  <p className="text-[10px] text-slate-400 font-light line-clamp-1">{module.desc}</p>
                                </div>
                              </div>

                              {/* 4 Action Capability Buttons: View, Create, Edit, Delete */}
                              <div className="grid grid-cols-4 gap-1 text-[10px] pt-1 border-t border-slate-100">
                                {/* View Toggle */}
                                <button
                                  type="button"
                                  onClick={() => toggleView(module.id)}
                                  className={`py-1 px-1 rounded-lg border font-bold flex items-center justify-center gap-0.5 cursor-pointer transition-all ${
                                    v
                                      ? "bg-blue-100 text-blue-900 border-blue-300 shadow-2xs"
                                      : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                                  }`}
                                  title="Allows staff to access and view this module page"
                                >
                                  <Eye size={10} />
                                  <span>View</span>
                                </button>

                                {/* Create Toggle */}
                                <button
                                  type="button"
                                  onClick={() => toggleCreate(module.id)}
                                  className={`py-1 px-1 rounded-lg border font-bold flex items-center justify-center gap-0.5 cursor-pointer transition-all ${
                                    c
                                      ? "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs"
                                      : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                                  }`}
                                  title="Allows staff to create/add new records in this module"
                                >
                                  <PlusCircle size={10} />
                                  <span>Create</span>
                                </button>

                                {/* Edit Toggle */}
                                <button
                                  type="button"
                                  onClick={() => toggleEdit(module.id)}
                                  className={`py-1 px-1 rounded-lg border font-bold flex items-center justify-center gap-0.5 cursor-pointer transition-all ${
                                    e
                                      ? "bg-amber-100 text-amber-900 border-amber-300 shadow-2xs"
                                      : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                                  }`}
                                  title="Allows staff to edit/update existing records in this module"
                                >
                                  <Edit3 size={10} />
                                  <span>Edit</span>
                                </button>

                                {/* Delete Toggle */}
                                <button
                                  type="button"
                                  onClick={() => toggleDelete(module.id)}
                                  className={`py-1 px-1 rounded-lg border font-bold flex items-center justify-center gap-0.5 cursor-pointer transition-all ${
                                    d
                                      ? "bg-rose-50 text-rose-800 border-rose-300 shadow-2xs"
                                      : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                                  }`}
                                  title="Allows staff to delete records in this module"
                                >
                                  <Trash2 size={10} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-800" /> ADMIN Role has unrestricted master privileges
                </p>
                <p className="text-[11px] text-amber-800/80">
                  Admins automatically have full permissions to View, Create, Edit, and Delete across all system modules, financial reports, payroll, and settings.
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-xs text-slate-400 font-medium">
                {(modal.data.permissions || []).length} active permissions selected
              </span>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setModal({ open: false, isEdit: false, data: { name: "", email: "", password: "", role: "MANAGER", permissions: [] } })}
                  className="btn-outline text-xs px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer">
                  {modal.isEdit ? "Update Staff Permissions" : "Create Staff Account"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="crm-card overflow-x-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-slate-500 text-xs">Loading staff accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-semibold text-sm">No Staff Accounts Found</p>
            <p className="text-slate-400 text-xs">Create accounts to allow staff members to access designated CRM pages.</p>
          </div>
        ) : (
          <table className="crm-table w-full">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Role Tier</th>
                <th>Assigned Permissions Breakdown</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const perms = Array.isArray(u.permissions) ? u.permissions : [];
                // Group active permissions by module
                const activeModules = allModulesList.filter(m => perms.includes(m.id) || perms.includes(`${m.id}:view`));

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-amber-900 text-xs shadow-xs">
                          {u.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                          <p className="text-slate-400 text-[11px] font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        u.role === 'ADMIN' ? 'badge-hot font-bold' : u.role === 'MANAGER' ? 'badge-gold font-bold' : 'badge-gray font-bold'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="max-w-md">
                      {u.role === "ADMIN" ? (
                        <span className="badge badge-green font-bold flex items-center gap-1 w-fit">
                          <Sparkles size={11} /> Unrestricted Full Access (All View · Create · Edit · Delete)
                        </span>
                      ) : perms.length === 0 ? (
                        <span className="badge badge-lost">No Module Access Assigned</span>
                      ) : (
                        <div className="space-y-1.5 py-1">
                          <div className="flex flex-wrap gap-1.5">
                            {activeModules.slice(0, 4).map(m => {
                              const hasC = perms.includes(`${m.id}:create`);
                              const hasE = perms.includes(`${m.id}:edit`);
                              const hasD = perms.includes(`${m.id}:delete`);

                              return (
                                <span
                                  key={m.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-semibold"
                                >
                                  <span>{m.label}</span>
                                  <span className="text-[9px] font-mono text-amber-800 font-bold bg-amber-50 px-1 rounded border border-amber-200/60">
                                    V{hasC ? "·C" : ""}{hasE ? "·E" : ""}{hasD ? "·D" : ""}
                                  </span>
                                </span>
                              );
                            })}

                            {activeModules.length > 4 && (
                              <span className="badge badge-purple text-[10px] font-bold">
                                +{activeModules.length - 4} more modules
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {activeModules.length} Modules Assigned ({perms.length} Total Capabilities)
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="text-slate-500 text-xs font-mono">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setModal({
                              open: true,
                              isEdit: true,
                              data: {
                                id: u.id,
                                name: u.name,
                                email: u.email,
                                role: u.role,
                                permissions: perms,
                              },
                            });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="btn-sm bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 font-bold flex items-center gap-1 cursor-pointer"
                        >
                        <Edit2 className="w-3.5 h-3.5" /> Edit Permissions
                      </button>
                      {u.id !== currentUserId && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="btn-danger p-1.5 cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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
  );
}