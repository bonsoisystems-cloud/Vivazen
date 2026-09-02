"use client";

import { useState, useMemo, useEffect } from "react";
import { Bell, Calendar, MessageSquare, Gift, CheckCircle2, Phone, AlertTriangle, ShoppingBag, UserCheck, DollarSign } from "lucide-react";
import Link from "next/link";

export default function AdminFollowupsPage() {
  const today = new Date().toISOString().split("T")[0];

  const [tab, setTab] = useState<"birthdays" | "leads" | "pending" | "low_stock" | "irregular">("birthdays");
  
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Irregular date filter
  const [irregularDays, setIrregularDays] = useState(10);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eRes, bRes, cRes, pRes] = await Promise.all([
        fetch("/api/crm/enquiries"),
        fetch("/api/crm/bills"),
        fetch("/api/crm/clients"),
        fetch("/api/crm/inventory?type=products"),
      ]);

      if (eRes.ok) {
        const d = await eRes.json();
        if (d.success) setEnquiries(d.data || []);
      }
      if (bRes.ok) {
        const d = await bRes.json();
        if (d.success) setBills(d.data || []);
      }
      if (cRes.ok) {
        const d = await cRes.json();
        if (d.success) setClients(d.data || []);
      }
      if (pRes.ok) {
        const d = await pRes.json();
        if (d.success) setProducts(d.data || []);
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

  const formatCurrency = (amount: number) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  // 1. Birthdays & Anniversaries (in next 7 days)
  const currentMonthDay = today.slice(5);
  const birthdayClients = useMemo(() => clients.filter(c => c.dob && c.dob.slice(5) >= currentMonthDay).slice(0, 20), [clients, currentMonthDay]);
  const anniversaryClients = useMemo(() => clients.filter(c => c.anniversary && c.anniversary.slice(5) >= currentMonthDay).slice(0, 20), [clients, currentMonthDay]);

  // 2. Pending Lead Follow-ups
  const pendingLeads = useMemo(() => enquiries.filter(e => e.followDate <= today && e.status !== "Converted" && e.status !== "Lost"), [enquiries, today]);

  // 3. Pending Payments
  const pendingBills = useMemo(() => bills.filter(b => Number(b.pending) > 0), [bills]);

  // 4. Low Stock Products (< 5 units)
  const lowStockProducts = useMemo(() => products.filter(p => Number(p.stock) < 5), [products]);

  // 5. Irregular Clients (no visits in last N days)
  const irregularClients = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - irregularDays);
    const cutoffStr = cutoffDate.toISOString().split("T")[0];

    return clients.filter(c => {
      const clientBills = bills.filter(b => b.clientId === c.id || b.phone === c.phone);
      if (clientBills.length === 0) return true; // never visited
      const lastBill = clientBills.sort((a, b) => b.date.localeCompare(a.date))[0];
      return lastBill.date < cutoffStr;
    });
  }, [clients, bills, irregularDays]);

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">
            Daily Follow-up Center
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Real-time daily operations: birthdays, anniversaries, lead calls, pending balance recovery, and stock alerts.
          </p>
        </div>
      </div>

      <div className="crm-tabs flex-wrap">
        <button
          className={`tab-btn ${tab === "birthdays" ? "active" : ""}`}
          onClick={() => setTab("birthdays")}
        >
          🎉 Birthday & Anniversary ({birthdayClients.length + anniversaryClients.length})
        </button>
        <button
          className={`tab-btn ${tab === "leads" ? "active" : ""}`}
          onClick={() => setTab("leads")}
        >
          📞 Enquiry Follow-up ({pendingLeads.length})
        </button>
        <button
          className={`tab-btn ${tab === "pending" ? "active" : ""}`}
          onClick={() => setTab("pending")}
        >
          💳 Pending Payment(s) ({pendingBills.length})
        </button>
        <button
          className={`tab-btn ${tab === "low_stock" ? "active" : ""}`}
          onClick={() => setTab("low_stock")}
        >
          ⚠️ Product Low Stock ({lowStockProducts.length})
        </button>
        <button
          className={`tab-btn ${tab === "irregular" ? "active" : ""}`}
          onClick={() => setTab("irregular")}
        >
          👥 Irregular Client(s) ({irregularClients.length})
        </button>
      </div>

      {/* Tab 1: Birthday & Anniversary */}
      {tab === "birthdays" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="crm-card">
            <p className="section-title flex items-center gap-2 mb-4">
              <Gift size={16} className="text-rose-600" /> Upcoming Birthdays
            </p>
            {birthdayClients.length === 0 ? (
              <p className="text-slate-400 text-xs py-8 text-center">No upcoming client birthdays.</p>
            ) : (
              <div className="space-y-2.5">
                {birthdayClients.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{c.name}</p>
                      <p className="text-slate-400 text-[11px]">{c.phone} · DOB: {c.dob}</p>
                    </div>
                    <a
                      href={`https://wa.me/91${c.phone}?text=Dear%20${encodeURIComponent(c.name)},%20wishing%20you%20a%20very%20Happy%20Birthday!%20Enjoy%20a%20special%20complimentary%20glow%20treatment%20at%20Vivazen%20Beauty%20Salon.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold text-xs"
                    >
                      <Phone size={12} /> WhatsApp Wish
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="crm-card">
            <p className="section-title flex items-center gap-2 mb-4">
              <Gift size={16} className="text-purple-600" /> Upcoming Anniversaries
            </p>
            {anniversaryClients.length === 0 ? (
              <p className="text-slate-400 text-xs py-8 text-center">No upcoming client anniversaries.</p>
            ) : (
              <div className="space-y-2.5">
                {anniversaryClients.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{c.name}</p>
                      <p className="text-slate-400 text-[11px]">{c.phone} · Anniv: {c.anniversary}</p>
                    </div>
                    <a
                      href={`https://wa.me/91${c.phone}?text=Happy%20Anniversary%20${encodeURIComponent(c.name)}!%20Celebrate%20your%20special%20day%20with%20luxury%20pampering%20at%20Vivazen%20Beauty%20Salon.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold text-xs"
                    >
                      <Phone size={12} /> WhatsApp Wish
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Enquiry Follow-up */}
      {tab === "leads" && (
        <div className="crm-card overflow-x-auto">
          <p className="section-title mb-4">Due Lead Follow-ups</p>
          {pendingLeads.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 size={36} className="text-emerald-600 mx-auto mb-2" />
              <p className="text-slate-700 font-bold text-sm">All Follow-ups Complete!</p>
              <p className="text-slate-400 text-xs mt-0.5">No pending inquiry follow-ups due today.</p>
            </div>
          ) : (
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Contact</th>
                  <th>Enquiry For</th>
                  <th>Follow-up Due</th>
                  <th>Representative</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="font-bold text-slate-800 text-sm">{lead.clientName}</td>
                    <td className="text-slate-500 text-xs font-semibold">{lead.phone}</td>
                    <td className="text-slate-700 font-semibold text-xs">{lead.enquiryFor}</td>
                    <td className="text-rose-700 font-bold text-xs">{lead.followDate}</td>
                    <td className="text-slate-600 text-xs">{lead.representative || "Unassigned"}</td>
                    <td>
                      <span className={`badge ${lead.status === "Hot" ? "badge-hot" : lead.status === "Warm" ? "badge-warm" : "badge-cold"}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`https://wa.me/91${lead.phone}?text=Hello%20${encodeURIComponent(lead.clientName)},%20following%20up%20regarding%20your%20inquiry%20for%20${encodeURIComponent(lead.enquiryFor)}%20at%20Vivazen%20Beauty%20Salon.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-sm bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                      >
                        <Phone size={12} /> WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 3: Pending Payments */}
      {tab === "pending" && (
        <div className="crm-card overflow-x-auto">
          <p className="section-title mb-4">Pending Invoice Balances</p>
          {pendingBills.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-8">No pending dues on record.</p>
          ) : (
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Date</th>
                  <th>Client Name</th>
                  <th>Phone</th>
                  <th>Total Billed</th>
                  <th>Paid Amount</th>
                  <th>Pending Due</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingBills.map((b) => (
                  <tr key={b.id}>
                    <td className="font-mono text-amber-800 font-bold text-xs">{b.billNo}</td>
                    <td className="text-slate-500 text-xs">{b.date}</td>
                    <td className="font-bold text-slate-800 text-xs">{b.clientName}</td>
                    <td className="text-slate-600 text-xs">{b.phone}</td>
                    <td className="font-bold text-slate-900">{formatCurrency(b.total)}</td>
                    <td className="text-emerald-700 font-semibold">{formatCurrency(b.paid)}</td>
                    <td className="text-rose-700 font-black text-sm">{formatCurrency(b.pending)}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Link href="/admin/billing" className="btn-sm bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100">
                          <DollarSign size={12} /> Pay Now
                        </Link>
                        <a
                          href={`https://wa.me/91${b.phone}?text=Dear%20${encodeURIComponent(b.clientName)},%20gentle%20reminder%20for%20the%20pending%20balance%20of%20${encodeURIComponent(formatCurrency(b.pending))}%20on%20Invoice%20${encodeURIComponent(b.billNo)}%20at%20Vivazen%20Beauty%20Salon.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-sm bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                        >
                          <Phone size={12} /> Remind
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 4: Low Stock Alert */}
      {tab === "low_stock" && (
        <div className="crm-card overflow-x-auto">
          <p className="section-title mb-4">Products Running Low on Stock</p>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 size={32} className="text-emerald-600 mx-auto mb-2" />
              <p className="text-slate-700 font-bold text-sm">All Stock Levels Optimal</p>
              <p className="text-slate-400 text-xs mt-0.5">No products below threshold of 5 units.</p>
            </div>
          ) : (
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Volume / Unit</th>
                  <th>MRP</th>
                  <th>Remaining Stock</th>
                  <th>Stock Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="font-bold text-slate-800 text-sm">{p.name}</td>
                    <td><span className="badge badge-gray">{p.volume} {p.unit}</span></td>
                    <td className="text-slate-600 text-xs">{formatCurrency(p.mrp)}</td>
                    <td className="font-black text-rose-700 text-sm">{p.stock} units</td>
                    <td>
                      {p.stock === 0 ? (
                        <span className="badge badge-lost">Out of Stock</span>
                      ) : (
                        <span className="badge badge-hot">Critical Low</span>
                      )}
                    </td>
                    <td>
                      <Link href="/admin/inventory" className="btn-gold text-xs py-1 px-3">
                        + Add Stock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 5: Irregular Clients */}
      {tab === "irregular" && (
        <div className="crm-card space-y-4">
          <div className="filter-bar">
            <div>
              <label className="crm-label">Not Visited Since (Days)</label>
              <select
                className="crm-select text-xs font-bold"
                value={irregularDays}
                onChange={(e) => setIrregularDays(Number(e.target.value))}
              >
                <option value={7}>Last 7+ Days</option>
                <option value={10}>Last 10+ Days</option>
                <option value={15}>Last 15+ Days</option>
                <option value={30}>Last 30+ Days</option>
                <option value={60}>Last 60+ Days</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {irregularClients.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-8">No irregular clients matching this filter.</p>
            ) : (
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Phone</th>
                    <th>Invite Code</th>
                    <th>Reward Points</th>
                    <th>Prepaid Wallet</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {irregularClients.slice(0, 50).map((c) => (
                    <tr key={c.id}>
                      <td className="font-bold text-slate-800 text-sm">{c.name}</td>
                      <td className="text-slate-600 text-xs font-semibold">{c.phone}</td>
                      <td className="font-mono text-amber-800 font-bold text-xs">{c.inviteCode}</td>
                      <td className="text-amber-800 font-bold text-xs">{c.points || 0} pts</td>
                      <td className="text-emerald-700 font-bold text-xs">{formatCurrency(c.walletBalance)}</td>
                      <td>
                        <a
                          href={`https://wa.me/91${c.phone}?text=Hello%20${encodeURIComponent(c.name)},%20we%20miss%20you%20at%20Vivazen%20Beauty%20Salon!%20Enjoy%20an%20exclusive%2015%%20re-visit%20discount%20this%20week.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-sm bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                        >
                          <Phone size={12} /> Re-engage on WhatsApp
                        </a>
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
