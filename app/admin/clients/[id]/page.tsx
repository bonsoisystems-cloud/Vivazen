"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, Save, X, User, Receipt, Calendar, Award, Wallet, Star, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";

const tabs = ['Profile Details', 'VIP Membership Card', 'Appointments', 'Billing Invoices', 'Reward Points', 'Prepaid Wallet', 'Feedback Ratings'];

export default function AdminClientProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [client, setClient] = useState<any>(null);
  const [bills, setBills] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('Profile Details');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [selectedTierToAssign, setSelectedTierToAssign] = useState<string>("");
  const [assigningCard, setAssigningCard] = useState(false);

  const loadProfile = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [cRes, bRes, aRes, fRes, mRes] = await Promise.all([
        fetch(`/api/crm/clients?id=${id}`),
        fetch(`/api/crm/bills?clientId=${id}`),
        fetch(`/api/crm/appointments?clientId=${id}`),
        fetch(`/api/crm/feedbacks`),
        fetch(`/api/crm/memberships`),
      ]);

      if (cRes.ok) {
        const d = await cRes.json();
        if (d.success && d.data) {
          setClient(d.data);
          setForm(d.data);
          setSelectedTierToAssign(d.data.membershipId || "");
        }
      }
      if (mRes.ok) {
        const d = await mRes.json();
        if (d.success) setMemberships(d.data || []);
      }
      if (bRes.ok) {
        const d = await bRes.json();
        if (d.success) setBills(d.data || []);
      }
      if (aRes.ok) {
        const d = await aRes.json();
        if (d.success) setAppointments(d.data || []);
      }
      if (fRes.ok) {
        const d = await fRes.json();
        if (d.success) setFeedbacks((d.data || []).filter((fb: any) => fb.clientName === client?.name));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  const saveProfile = async () => {
    try {
      const res = await fetch("/api/crm/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setClient(data.data);
        setEditing(false);
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignOrUpdateMembership = async (newMembershipId: string | null) => {
    if (!client?.id) return;
    try {
      setAssigningCard(true);
      const res = await fetch("/api/crm/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: client.id,
          membershipId: newMembershipId || ""
        })
      });
      const data = await res.json();
      if (data.success) {
        setClient(data.data);
        setForm(data.data);
        setSelectedTierToAssign(data.data.membershipId || "");
        alert(newMembershipId ? "VIP Membership Card status updated successfully!" : "Membership card revoked.");
      } else {
        alert(data.error || "Failed to update membership card status");
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating membership card");
    } finally {
      setAssigningCard(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  if (loading || !client) {
    return (
      <div className="crm-card text-center py-20">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-slate-500 text-xs font-semibold">Loading 360° Client Profile...</p>
      </div>
    );
  }

  const totalSpend = bills.reduce((s, b) => s + (Number(b.paid) || 0), 0);

  return (
    <div className="fade-in space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/clients" className="btn-outline text-xs p-2">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-amber-900 text-lg shadow-xs">
              {client.name[0]?.toUpperCase() || "C"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-stone-900">{client.name}</h1>
                <span className="badge badge-gold font-mono">{client.inviteCode}</span>
                {client.membershipId ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#faf6ee] border border-[#ecdcc4] text-[#7a5426] text-[10.5px] font-bold shadow-xs">
                    <Award size={12} className="text-[#9a733e]" />
                    <span>VIP: {client.membershipName || "Active Member"}</span>
                    <CheckCircle2 size={11} className="text-[#2d5a42]" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-500 text-[10px] font-medium">
                    No Membership Card
                  </span>
                )}
              </div>
              <p className="text-stone-500 text-xs font-medium">{client.phone} {client.email && `· ${client.email}`}</p>
            </div>
          </div>
        </div>

        {/* Lifetime Value Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-white border border-slate-200 rounded-xl p-2.5 text-center shadow-xs">
          <div className="px-2">
            <p className="text-slate-400 text-[10px] uppercase font-bold">Total Spent</p>
            <p className="font-bold text-slate-900 text-xs">{formatCurrency(totalSpend)}</p>
          </div>
          <div className="px-2 border-l border-slate-100">
            <p className="text-slate-400 text-[10px] uppercase font-bold">Total Visits</p>
            <p className="font-bold text-blue-700 text-xs">{bills.length}</p>
          </div>
          <div className="px-2 border-l border-slate-100">
            <p className="text-slate-400 text-[10px] uppercase font-bold">Loyalty Points</p>
            <p className="font-bold text-amber-800 text-xs">{client.points || 0} pts</p>
          </div>
          <div className="px-2 border-l border-slate-100">
            <p className="text-slate-400 text-[10px] uppercase font-bold">Wallet Balance</p>
            <p className="font-bold text-emerald-700 text-xs">{formatCurrency(client.walletBalance)}</p>
          </div>
          <div className="px-2 border-l border-slate-100 col-span-2 sm:col-span-1">
            <p className="text-slate-400 text-[10px] uppercase font-bold">Membership Card</p>
            <p className={`font-black text-xs truncate ${client.membershipId ? 'text-amber-800' : 'text-slate-400'}`}>
              {client.membershipName || "No Card"}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="crm-tabs flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            className={`tab-btn ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab 1: Profile Details */}
      {activeTab === 'Profile Details' && (
        <div className="crm-card max-w-2xl">
          <div className="section-header">
            <p className="section-title">Client Information</p>
            {!editing ? (
              <button className="btn-outline text-xs" onClick={() => setEditing(true)}>
                <Edit2 size={13} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button className="btn-gold text-xs" onClick={saveProfile}>
                  <Save size={13} /> Save Changes
                </button>
                <button className="btn-outline text-xs" onClick={() => setEditing(false)}>
                  <X size={13} /> Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="crm-label">Full Name</label>
              {editing ? (
                <input className="crm-input text-xs font-bold" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              ) : (
                <p className="p-2 bg-slate-50 rounded-lg font-semibold text-slate-800">{client.name}</p>
              )}
            </div>
            <div>
              <label className="crm-label">Contact Number</label>
              {editing ? (
                <input className="crm-input text-xs font-bold" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              ) : (
                <p className="p-2 bg-slate-50 rounded-lg font-semibold text-slate-800">{client.phone}</p>
              )}
            </div>
            <div>
              <label className="crm-label">Email Address</label>
              {editing ? (
                <input className="crm-input text-xs" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              ) : (
                <p className="p-2 bg-slate-50 rounded-lg text-slate-700">{client.email || "-"}</p>
              )}
            </div>
            <div>
              <label className="crm-label">Gender</label>
              <p className="p-2 bg-slate-50 rounded-lg text-slate-700">{client.gender}</p>
            </div>
            <div>
              <label className="crm-label">Date of Birth</label>
              <p className="p-2 bg-slate-50 rounded-lg text-slate-700">{client.dob || "-"}</p>
            </div>
            <div>
              <label className="crm-label">Anniversary Date</label>
              <p className="p-2 bg-slate-50 rounded-lg text-slate-700">{client.anniversary || "-"}</p>
            </div>
            <div>
              <label className="crm-label">Acquisition Channel</label>
              <p className="p-2 bg-slate-50 rounded-lg text-slate-700">{client.source}</p>
            </div>
            <div>
              <label className="crm-label">Residential Address</label>
              <p className="p-2 bg-slate-50 rounded-lg text-slate-700">{client.address || "-"}</p>
            </div>

            {/* VIP Membership Card Status in Profile Details */}
            <div className="col-span-2 pt-2 border-t border-slate-100">
              <label className="crm-label flex items-center justify-between">
                <span>VIP Membership Card Status</span>
                {client.membershipId ? (
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Active Cardholder
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">
                    No Membership Assigned
                  </span>
                )}
              </label>

              {editing ? (
                <div className="flex items-center gap-2">
                  <select
                    className="crm-select text-xs font-bold flex-1"
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
              ) : (
                <div className={`p-3 rounded-xl border flex items-center justify-between ${client.membershipId ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
                  }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${client.membershipId ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                      <Award size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">
                        {client.membershipName || "No Active Membership Card"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {client.membershipId ? `Card Tier: ${client.membershipName} • Member Code: ${client.inviteCode}` : "Standard client account without membership privileges"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('VIP Membership Card')}
                    className="btn-outline text-xs px-2.5 py-1 text-amber-800 border-amber-300 hover:bg-amber-100"
                  >
                    {client.membershipId ? "Manage Card" : "Issue Card"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: VIP Membership Card Status & Management */}
      {activeTab === 'VIP Membership Card' && (
        <div className="crm-card max-w-2xl space-y-5">
          <div className="section-header">
            <div>
              <p className="section-title">VIP Membership Card Status</p>
              <p className="text-slate-500 text-xs">Verify whether this client holds a membership card and manage tier benefits.</p>
            </div>
            {client.membershipId && (
              <span className="badge badge-gold px-3 py-1 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-700" /> ACTIVE CARDHOLDER
              </span>
            )}
          </div>

          {client.membershipId ? (
            /* Visual VIP Membership Card Graphic */
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-neutral-900 to-amber-950 text-amber-100 p-6 shadow-xl border border-amber-500/40">
                {/* Background watermarks */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-2 right-4 text-7xl font-black text-amber-500/5 select-none font-serif">
                  VIVAZEN
                </div>

                <div className="relative z-10 flex flex-col justify-between h-44">
                  {/* Top: Brand & Chip */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-serif font-black tracking-widest text-base text-amber-300">VIVAZEN</p>
                      <p className="text-[9px] uppercase tracking-[0.25em] text-amber-400/80 font-bold">Luxury Salon &amp; Spa</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border border-amber-200/60 flex items-center justify-center shadow-inner">
                        <div className="w-6 h-4 border border-amber-900/30 rounded-xs" />
                      </div>
                      <Sparkles size={16} className="text-amber-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Middle: Membership Tier Name */}
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.3em] text-amber-400 font-bold block mb-0.5">VIP Membership Tier</span>
                    <p className="text-xl sm:text-2xl font-serif font-black text-white tracking-wide">
                      {client.membershipName}
                    </p>
                  </div>

                  {/* Bottom: Cardholder Name & Code */}
                  <div className="flex items-end justify-between pt-2 border-t border-amber-500/30">
                    <div>
                      <p className="text-[8px] uppercase tracking-widest text-amber-400/70">Cardholder Name</p>
                      <p className="font-bold text-xs sm:text-sm text-amber-100 tracking-wider uppercase">{client.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] uppercase tracking-widest text-amber-400/70">Member ID / Code</p>
                      <p className="font-mono font-black text-xs text-amber-300">{client.inviteCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tier Benefits Quick Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-center">
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Service Discount</p>
                  <p className="text-amber-900 font-black text-sm mt-0.5">
                    {client.membershipDiscountServices ? `${client.membershipDiscountServices}% OFF` : "Standard VIP"}
                  </p>
                </div>
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-center">
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Reward Boost</p>
                  <p className="text-amber-900 font-black text-sm mt-0.5">
                    {client.membershipPointsBoost || "1.5X Points"}
                  </p>
                </div>
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-center">
                  <p className="text-slate-500 text-[10px] uppercase font-bold">Product Savings</p>
                  <p className="text-amber-900 font-black text-sm mt-0.5">
                    {client.membershipDiscountProducts ? `${client.membershipDiscountProducts}% OFF` : "VIP Rate"}
                  </p>
                </div>
              </div>

              {/* Action: Change or Revoke Membership Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <p className="font-bold text-xs text-slate-800">Change or Upgrade Membership Card Tier</p>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="crm-select text-xs font-bold flex-1 min-w-[200px]"
                    value={selectedTierToAssign}
                    onChange={(e) => setSelectedTierToAssign(e.target.value)}
                  >
                    {memberships.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — ₹{m.price.toLocaleString("en-IN")} ({m.durationDays || 365} Days)
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={assigningCard || selectedTierToAssign === client.membershipId}
                    onClick={() => handleAssignOrUpdateMembership(selectedTierToAssign)}
                    className="btn-gold text-xs px-4 py-2 font-bold cursor-pointer disabled:opacity-50"
                  >
                    {assigningCard ? "Updating..." : "Update Tier"}
                  </button>
                  <button
                    type="button"
                    disabled={assigningCard}
                    onClick={() => {
                      if (confirm("Are you sure you want to revoke this client's VIP membership card?")) {
                        handleAssignOrUpdateMembership(null);
                      }
                    }}
                    className="btn-outline text-xs px-3 py-2 text-rose-700 border-rose-200 hover:bg-rose-50 cursor-pointer"
                  >
                    Revoke Card
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* NO MEMBERSHIP CARD STATE */
            <div className="space-y-4">
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                  <Award size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">No Membership Card Assigned</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    This client does not currently hold a VivaZen VIP Membership Card. Assign a membership card tier below to unlock VIP rates, reward point boosts, and auto-discounts.
                  </p>
                </div>
              </div>

              {/* Quick Issue Card Form */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                <p className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-700" />
                  <span>Issue VIP Membership Card to {client.name}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="crm-select text-xs font-bold flex-1 min-w-[220px]"
                    value={selectedTierToAssign}
                    onChange={(e) => setSelectedTierToAssign(e.target.value)}
                  >
                    <option value="">-- Choose Membership Tier to Issue --</option>
                    {memberships.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — ₹{m.price.toLocaleString("en-IN")} ({m.durationDays || 365} Days)
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={assigningCard || !selectedTierToAssign}
                    onClick={() => handleAssignOrUpdateMembership(selectedTierToAssign)}
                    className="btn-gold text-xs px-5 py-2 font-bold cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Award size={14} />
                    <span>{assigningCard ? "Issuing Card..." : "Issue Membership Card"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Appointments */}
      {activeTab === 'Appointments' && (
        <div className="crm-card overflow-x-auto">
          <p className="section-title mb-4">Client Booking History</p>
          {appointments.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-8">No appointments on record for this client.</p>
          ) : (
            <table className="crm-table">
              <thead><tr><th>Date & Time</th><th>Booked Services</th><th>Total</th><th>Advance</th><th>Status</th></tr></thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td className="text-slate-700 font-semibold text-xs">{a.date} at {a.time}</td>
                    <td className="text-slate-800 text-xs">{Array.isArray(a.services) ? a.services.map((s: any) => s.name).join(", ") : "-"}</td>
                    <td className="font-bold text-slate-900">{formatCurrency(a.total)}</td>
                    <td className="text-emerald-700 font-semibold">{formatCurrency(a.advance)}</td>
                    <td><span className="badge badge-gold">{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 3: Billing Invoices */}
      {activeTab === 'Billing Invoices' && (
        <div className="crm-card overflow-x-auto">
          <p className="section-title mb-4">Invoice Ledger</p>
          {bills.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-8">No invoices generated for this client yet.</p>
          ) : (
            <table className="crm-table">
              <thead><tr><th>Invoice No.</th><th>Date</th><th>Billed Items</th><th>Total</th><th>Paid</th><th>Pending Dues</th></tr></thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.id}>
                    <td className="font-mono text-amber-800 font-bold text-xs">{b.billNo}</td>
                    <td className="text-slate-600 text-xs">{b.date}</td>
                    <td className="text-slate-700 text-xs">{Array.isArray(b.items) ? b.items.map((i: any) => i.name).join(", ") : "-"}</td>
                    <td className="font-bold text-slate-900">{formatCurrency(b.total)}</td>
                    <td className="text-emerald-700 font-bold">{formatCurrency(b.paid)}</td>
                    <td className={b.pending > 0 ? 'text-rose-700 font-bold' : 'text-slate-400'}>{formatCurrency(b.pending)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 4: Reward Points */}
      {activeTab === 'Reward Points' && (
        <div className="crm-card max-w-xl">
          <p className="section-title mb-4">Loyalty Reward Points Balance</p>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center mb-6">
            <span className="text-amber-900 font-bold text-sm">Available Reward Points</span>
            <span className="text-2xl font-black text-amber-800">{client.points || 0} pts</span>
          </div>
          <p className="text-slate-500 text-xs">Points are automatically credited on service completion and invoice settlements.</p>
        </div>
      )}

      {/* Tab 5: Prepaid Wallet */}
      {activeTab === 'Prepaid Wallet' && (
        <div className="crm-card max-w-xl">
          <p className="section-title mb-4">Prepaid Client Wallet</p>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center mb-4">
            <span className="text-emerald-900 font-bold text-sm">Wallet Balance</span>
            <span className="text-2xl font-black text-emerald-700">{formatCurrency(client.walletBalance)}</span>
          </div>
        </div>
      )}

      {/* Tab 6: Feedback Ratings */}
      {activeTab === 'Feedback Ratings' && (
        <div className="crm-card">
          <p className="section-title mb-4">Client Feedback Log</p>
          {feedbacks.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-8">No feedback submitted by this client yet.</p>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((f) => (
                <div key={f.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 text-xs">{f.billNo}</span>
                    <div className="stars text-xs">{'★'.repeat(f.overall || 5)}</div>
                  </div>
                  <p className="text-slate-600 text-xs italic">"{f.review || "Great experience!"}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
