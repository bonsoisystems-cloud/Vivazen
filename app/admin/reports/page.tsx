"use client";

import { useState, useMemo, useEffect } from "react";
import { BarChart3, Download, Calendar, Filter, FileSpreadsheet } from "lucide-react";

const today = new Date().toISOString().split("T")[0];

const reportTabs = [
  { id: "day_summary", label: "Day Summary" },
  { id: "daily_report", label: "Daily Report" },
  { id: "collection_report", label: "Collection Report" },
  { id: "sales_report", label: "Sales Report" },
  { id: "billing_report", label: "Billing Report" },
  { id: "service_provider", label: "Provider Wise" },
  { id: "pending_payments", label: "Pending Payments" },
  { id: "enquiry_report", label: "Enquiry Report" },
  { id: "customer_wallet", label: "Wallet Report" },
  { id: "feedback_report", label: "Feedback Report" },
  { id: "expense_report", label: "Expense Report" },
];

export default function AdminReportsPage() {
  const [activeReport, setActiveReport] = useState("day_summary");
  const [dateFrom, setDateFrom] = useState("2026-08-01");
  const [dateTo, setDateTo] = useState(today);

  const [bills, setBills] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bRes, eRes, exRes, fRes, cRes, stRes] = await Promise.all([
        fetch("/api/crm/bills"),
        fetch("/api/crm/enquiries"),
        fetch("/api/crm/expenses"),
        fetch("/api/crm/feedbacks"),
        fetch("/api/crm/clients"),
        fetch("/api/crm/staff?type=providers"),
      ]);

      if (bRes.ok) {
        const d = await bRes.json();
        if (d.success) setBills(d.data || []);
      }
      if (eRes.ok) {
        const d = await eRes.json();
        if (d.success) setEnquiries(d.data || []);
      }
      if (exRes.ok) {
        const d = await exRes.json();
        if (d.success) setExpenses(d.data || []);
      }
      if (fRes.ok) {
        const d = await fRes.json();
        if (d.success) setFeedbacks(d.data || []);
      }
      if (cRes.ok) {
        const d = await cRes.json();
        if (d.success) setClients(d.data || []);
      }
      if (stRes.ok) {
        const d = await stRes.json();
        if (d.success) setProviders(d.data || []);
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

  const inDateRange = (d: string) => (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo);

  const filteredBills = useMemo(() => bills.filter(b => inDateRange(b.date)), [bills, dateFrom, dateTo]);
  const filteredEnquiries = useMemo(() => enquiries.filter(e => inDateRange(e.followDate || e.date || today)), [enquiries, dateFrom, dateTo]);
  const filteredExpenses = useMemo(() => expenses.filter(e => inDateRange(e.date)), [expenses, dateFrom, dateTo]);
  const filteredFeedbacks = useMemo(() => feedbacks.filter(f => inDateRange(f.date)), [feedbacks, dateFrom, dateTo]);

  // Aggregate Metrics
  const totalSales = filteredBills.reduce((s, b) => s + Number(b.total || 0), 0);
  const totalCollections = filteredBills.reduce((s, b) => s + Number(b.paid || 0), 0);
  const totalPending = filteredBills.reduce((s, b) => s + Number(b.pending || 0), 0);
  const totalExpense = filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const netProfit = totalCollections - totalExpense;

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">
            11-Report Analytics & Financial Audits
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Audit salon collections, sales pipelines, staff commissions, wallet registers, and tax accounting  .
          </p>
        </div>
      </div>

      {/* Date Filter & Report Tabs */}
      <div className="crm-card">
        <div className="filter-bar mb-4">
          <div>
            <label className="crm-label">From Date</label>
            <input type="date" className="crm-input text-xs font-bold" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="crm-label">To Date</label>
            <input type="date" className="crm-input text-xs font-bold" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div>
            <button className="btn-outline text-xs" onClick={() => { setDateFrom(today); setDateTo(today); }}>
              Today
            </button>
          </div>
        </div>

        <div className="crm-tabs overflow-x-auto">
          {reportTabs.map((t) => (
            <button
              key={t.id}
              className={`tab-btn whitespace-nowrap ${activeReport === t.id ? 'active' : ''}`}
              onClick={() => setActiveReport(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Day Summary */}
      {activeReport === "day_summary" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Gross Sales", value: formatCurrency(totalSales), color: "text-slate-900" },
              { label: "Net Collections", value: formatCurrency(totalCollections), color: "text-emerald-700" },
              { label: "Total Overheads", value: formatCurrency(totalExpense), color: "text-rose-700" },
              { label: "Net Operational Profit", value: formatCurrency(netProfit), color: "text-amber-800" },
              { label: "Pending Balances", value: formatCurrency(totalPending), color: "text-orange-700" },
            ].map(s => (
              <div key={s.label} className="crm-card p-4">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="crm-card overflow-x-auto">
            <p className="section-title mb-4">Day Summary Transaction Overview</p>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Metric Component</th>
                  <th>Quantity / Count</th>
                  <th>Total Financial Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold text-slate-800">Invoices Billed</td>
                  <td className="font-bold text-amber-800">{filteredBills.length} Invoices</td>
                  <td className="font-bold text-slate-900">{formatCurrency(totalSales)}</td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800">New Client Inquiries</td>
                  <td className="font-bold text-blue-700">{filteredEnquiries.length} Leads</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800">Salon Expenses Logged</td>
                  <td className="font-bold text-rose-700">{filteredExpenses.length} Entries</td>
                  <td className="font-bold text-rose-700">-{formatCurrency(totalExpense)}</td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800">Client Reviews Logged</td>
                  <td className="font-bold text-purple-700">{filteredFeedbacks.length} Reviews</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Daily Report / Sales & Invoices */}
      {(activeReport === "daily_report" || activeReport === "billing_report" || activeReport === "sales_report") && (
        <div className="crm-card overflow-x-auto">
          <p className="section-title mb-4">Transaction Ledger ({filteredBills.length} Invoices)</p>
          {filteredBills.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-8">No invoices within selected date range.</p>
          ) : (
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Date</th>
                  <th>Client Name</th>
                  <th>Contact</th>
                  <th>Billed Items</th>
                  <th>Gross Total</th>
                  <th>Paid Amount</th>
                  <th>Pending Dues</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((b) => (
                  <tr key={b.id}>
                    <td className="font-mono text-amber-800 font-bold text-xs">{b.billNo}</td>
                    <td className="text-slate-500 text-xs">{b.date}</td>
                    <td className="font-bold text-slate-800 text-xs">{b.clientName}</td>
                    <td className="text-slate-500 text-xs">{b.phone}</td>
                    <td className="text-slate-600 text-xs max-w-xs truncate">
                      {Array.isArray(b.items) ? b.items.map((i: any) => i.name).join(", ") : "-"}
                    </td>
                    <td className="font-bold text-slate-900">{formatCurrency(b.total)}</td>
                    <td className="text-emerald-700 font-bold">{formatCurrency(b.paid)}</td>
                    <td className={b.pending > 0 ? 'text-rose-700 font-bold' : 'text-slate-400'}>{formatCurrency(b.pending)}</td>
                    <td><span className="badge badge-green">{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 3. Collection Report */}
      {activeReport === "collection_report" && (
        <div className="crm-card overflow-x-auto">
          <p className="section-title mb-4">Payment Mode Collection Breakdown</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase">Cash Collections</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {formatCurrency(filteredBills.reduce((s, b) => s + (Array.isArray(b.payments) ? b.payments.filter((p: any) => p.mode === "Cash").reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0) : b.paid), 0))}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase">UPI / Digital Collections</p>
              <p className="text-2xl font-black text-blue-700 mt-1">
                {formatCurrency(filteredBills.reduce((s, b) => s + (Array.isArray(b.payments) ? b.payments.filter((p: any) => p.mode === "UPI").reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0) : 0), 0))}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase">Card / POS Collections</p>
              <p className="text-2xl font-black text-purple-700 mt-1">
                {formatCurrency(filteredBills.reduce((s, b) => s + (Array.isArray(b.payments) ? b.payments.filter((p: any) => p.mode === "Card").reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0) : 0), 0))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Service Provider Report */}
      {activeReport === "service_provider" && (
        <div className="crm-card overflow-x-auto">
          <p className="section-title mb-4">Provider Performance & Revenue</p>
          <table className="crm-table">
            <thead>
              <tr>
                <th>Service Provider</th>
                <th>Role</th>
                <th>Services Billed</th>
                <th>Revenue Generated</th>
                <th>Service Commission</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((sp) => {
                const billedAmount = filteredBills.reduce((sum, b) => {
                  if (!Array.isArray(b.items)) return sum;
                  return sum + b.items.filter((i: any) => i.providerId === sp.id).reduce((s: number, itm: any) => s + (Number(itm.price || 0) * Number(itm.qty || 1)), 0);
                }, 0);
                const comm = Math.round((billedAmount * Number(sp.commissionService || 15)) / 100);

                return (
                  <tr key={sp.id}>
                    <td className="font-bold text-slate-800 text-sm">{sp.name}</td>
                    <td className="text-slate-500 text-xs">{sp.type}</td>
                    <td className="text-slate-700 text-xs font-semibold">
                      {filteredBills.reduce((s, b) => s + (Array.isArray(b.items) ? b.items.filter((i: any) => i.providerId === sp.id).length : 0), 0)} services
                    </td>
                    <td className="font-bold text-slate-900">{formatCurrency(billedAmount)}</td>
                    <td className="font-bold text-amber-800">{formatCurrency(comm)} ({sp.commissionService}%)</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Pending Payments Report */}
      {activeReport === "pending_payments" && (
        <div className="crm-card overflow-x-auto">
          <p className="section-title mb-4">Unsettled Invoices Ledger</p>
          {filteredBills.filter(b => Number(b.pending) > 0).length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-8">No pending dues on record.</p>
          ) : (
            <table className="crm-table">
              <thead><tr><th>Invoice</th><th>Date</th><th>Client Name</th><th>Phone</th><th>Total</th><th>Paid</th><th>Pending Due</th></tr></thead>
              <tbody>
                {filteredBills.filter(b => Number(b.pending) > 0).map((b) => (
                  <tr key={b.id}>
                    <td className="font-mono text-amber-800 font-bold text-xs">{b.billNo}</td>
                    <td className="text-slate-500 text-xs">{b.date}</td>
                    <td className="font-bold text-slate-800 text-xs">{b.clientName}</td>
                    <td className="text-slate-600 text-xs">{b.phone}</td>
                    <td className="font-bold text-slate-900">{formatCurrency(b.total)}</td>
                    <td className="text-emerald-700 font-semibold">{formatCurrency(b.paid)}</td>
                    <td className="text-rose-700 font-black text-sm">{formatCurrency(b.pending)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 6. Expense Report */}
      {activeReport === "expense_report" && (
        <div className="crm-card overflow-x-auto">
          <p className="section-title mb-4">Expenses Ledger ({filteredExpenses.length} Entries)</p>
          <table className="crm-table">
            <thead><tr><th>Date</th><th>Category</th><th>Recipient</th><th>Mode</th><th>Amount</th></tr></thead>
            <tbody>
              {filteredExpenses.map((e) => (
                <tr key={e.id}>
                  <td className="text-slate-500 text-xs">{e.date}</td>
                  <td className="font-bold text-slate-800 text-xs">{e.type}</td>
                  <td className="text-slate-600 text-xs">{e.recipient || "-"}</td>
                  <td><span className="badge badge-blue">{e.paymentMode}</span></td>
                  <td className="font-bold text-rose-700">{formatCurrency(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 7. Feedback Report */}
      {activeReport === "feedback_report" && (
        <div className="crm-card overflow-x-auto">
          <p className="section-title mb-4">Quality & Ratings Register</p>
          <table className="crm-table">
            <thead><tr><th>Date</th><th>Client Name</th><th>Invoice</th><th>Overall</th><th>Review</th></tr></thead>
            <tbody>
              {filteredFeedbacks.map((f) => (
                <tr key={f.id}>
                  <td className="text-slate-500 text-xs">{f.date}</td>
                  <td className="font-bold text-slate-800 text-xs">{f.clientName}</td>
                  <td className="font-mono text-amber-800 font-bold text-xs">{f.billNo}</td>
                  <td><div className="stars text-xs">{'★'.repeat(f.overall || 5)}</div></td>
                  <td className="text-slate-600 text-xs italic">"{f.review || "-"}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 8. Wallet Report */}
      {activeReport === "customer_wallet" && (
        <div className="crm-card overflow-x-auto">
          <p className="section-title mb-4">Prepaid Client Wallets</p>
          <table className="crm-table">
            <thead><tr><th>Client Name</th><th>Contact</th><th>Invite Code</th><th>Points</th><th>Wallet Balance</th></tr></thead>
            <tbody>
              {clients.filter(c => Number(c.walletBalance) > 0 || Number(c.points) > 0).map((c) => (
                <tr key={c.id}>
                  <td className="font-bold text-slate-800 text-xs">{c.name}</td>
                  <td className="text-slate-600 text-xs">{c.phone}</td>
                  <td className="font-mono text-amber-800 font-bold text-xs">{c.inviteCode}</td>
                  <td className="text-amber-800 font-bold text-xs">{c.points || 0} pts</td>
                  <td className="text-emerald-700 font-black text-sm">{formatCurrency(c.walletBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 9. Enquiry Report */}
      {activeReport === "enquiry_report" && (
        <div className="crm-card overflow-x-auto">
          <p className="section-title mb-4">Inquiry Pipeline Audits</p>
          <table className="crm-table">
            <thead><tr><th>Client</th><th>Phone</th><th>Enquiry For</th><th>Source</th><th>Status</th></tr></thead>
            <tbody>
              {filteredEnquiries.map((e) => (
                <tr key={e.id}>
                  <td className="font-bold text-slate-800 text-xs">{e.clientName}</td>
                  <td className="text-slate-600 text-xs">{e.phone}</td>
                  <td className="text-slate-700 text-xs font-semibold">{e.enquiryFor}</td>
                  <td><span className="badge badge-gray">{e.source}</span></td>
                  <td><span className="badge badge-gold">{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
