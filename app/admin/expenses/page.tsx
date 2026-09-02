"use client";

import { useState, useMemo, useEffect } from "react";
import { TrendingUp, Plus, Trash2, Calendar, X, DollarSign } from "lucide-react";

const today = new Date().toISOString().split("T")[0];

const expenseTypes = [
  "Electricity & Power",
  "Salon Rent",
  "Tea & Refreshments",
  "Cleaning & Laundry",
  "Staff Advance / Bonus",
  "Maintenance & Repair",
  "Printing & Stationery",
  "Marketing & Ads",
  "Miscellaneous",
];

const paymentModes = ["Cash", "UPI", "Bank Transfer", "Cheque", "Card"];

export default function AdminExpensesPage() {
  const [data, setData] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterMonth, setFilterMonth] = useState("2026-08");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    date: today,
    type: "Electricity & Power",
    amount: 1500,
    paymentMode: "Cash",
    recipient: "",
    paidBy: "Super Admin",
    description: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/crm/expenses");
      if (res.ok) {
        const d = await res.json();
        if (d.success) setData(d.data || []);
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

  const saveExpense = async () => {
    if (!form.type || !form.amount) return alert("Category and amount required.");

    try {
      const res = await fetch("/api/crm/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const d = await res.json();
      if (d.success) {
        setShowAdd(false);
        setForm({
          date: today,
          type: "Electricity & Power",
          amount: 1500,
          paymentMode: "Cash",
          recipient: "",
          paidBy: "Super Admin",
          description: "",
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const delExpense = async (id: string) => {
    if (!confirm("Delete expense record?")) return;
    try {
      const res = await fetch(`/api/crm/expenses?id=${id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const filtered = useMemo(() => data.filter(e => {
    const matchMonth = !filterMonth || e.date.startsWith(filterMonth);
    const matchType = !filterType || e.type === filterType;
    return matchMonth && matchType;
  }), [data, filterMonth, filterType]);

  const totalExpense = useMemo(() => filtered.reduce((s, e) => s + Number(e.amount || 0), 0), [filtered]);

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">Salon Operating Expenses</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">Track petty cash, utility bills, salon rent, staff advances, and overhead costs.</p>
        </div>
        <button
          className="btn-gold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? <X size={14} /> : <Plus size={14} />}
          <span>{showAdd ? "Close Form" : "Record New Expense"}</span>
        </button>
      </div>

      {/* ─── IN-PAGE EXPANDABLE: RECORD EXPENSE FORM ─── */}
      {showAdd && (
        <div className="crm-card max-w-4xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-700" />
              <span>Record Salon Operational Expense</span>
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
              <label className="crm-label">Expense Date *</label>
              <input
                type="date"
                className="crm-input text-xs font-bold"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Amount (₹) *</label>
              <input
                type="number"
                className="crm-input text-xs font-bold text-rose-700"
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="crm-label">Expense Category *</label>
              <select
                className="crm-select text-xs font-semibold"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {expenseTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="crm-label">Payment Mode</label>
              <select
                className="crm-select text-xs font-semibold"
                value={form.paymentMode}
                onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
              >
                {paymentModes.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="crm-label">Vendor / Recipient</label>
              <input
                className="crm-input text-xs"
                placeholder="e.g. Electric Dept, Landlord..."
                value={form.recipient}
                onChange={(e) => setForm({ ...form, recipient: e.target.value })}
              />
            </div>
            <div>
              <label className="crm-label">Authorized By</label>
              <input
                className="crm-input text-xs font-medium"
                value={form.paidBy}
                onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
              />
            </div>
            <div className="sm:col-span-3">
              <label className="crm-label">Notes / Remarks</label>
              <input
                className="crm-input text-xs"
                placeholder="Bill number, meter reading, or specific details..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button className="btn-outline text-xs px-4 cursor-pointer" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer" onClick={saveExpense}>
              Save Expense Entry
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="crm-card py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 animate-pulse">
            Fetching salon operating expenses and financial records  ...
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="crm-card bg-gradient-to-br from-rose-50 to-white border border-rose-200/80 p-4">
              <p className="text-xs font-semibold text-rose-900 uppercase tracking-wider">Total Filtered Outflow</p>
              <p className="text-2xl font-black text-rose-700 mt-2">{formatCurrency(totalExpense)}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{filtered.length} expense transactions</p>
            </div>
            <div className="crm-card bg-gradient-to-br from-amber-50 to-white border border-amber-200/80 p-4">
              <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Top Spending Head</p>
              <p className="text-xl font-black text-amber-900 mt-2">
                {filtered.length > 0 ? (
                  Object.entries(filtered.reduce((acc: any, e) => { acc[e.type] = (acc[e.type] || 0) + Number(e.amount); return acc; }, {}))
                    .sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "—"
                ) : "—"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Highest operational category</p>
            </div>
            <div className="crm-card bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Avg Outflow / Entry</p>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {formatCurrency(filtered.length > 0 ? Math.round(totalExpense / filtered.length) : 0)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Per expense average</p>
            </div>
          </div>

          {/* Table Card */}
          <div className="crm-card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="section-title">Expense History Log</p>
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  type="month"
                  className="crm-input text-xs w-36 font-semibold"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                />
                <select
                  className="crm-select text-xs w-44"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {expenseTypes.map(t => <option key={t}>{t}</option>)}
                </select>
                {(filterType || filterMonth) && (
                  <button
                    className="btn-outline text-xs py-1.5 px-2.5 cursor-pointer"
                    onClick={() => { setFilterType(""); setFilterMonth(""); }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-14">
                <TrendingUp size={36} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-700 font-bold text-sm">No Expense Entries Found</p>
                <p className="text-slate-400 text-xs mt-0.5">Record an expense or adjust your month/category filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Expense Category</th>
                      <th>Description</th>
                      <th>Payment Mode</th>
                      <th>Recipient / Vendor</th>
                      <th>Amount</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="text-slate-600 font-mono text-xs">{e.date}</td>
                        <td>
                          <span className="badge badge-gray font-semibold">{e.type}</span>
                        </td>
                        <td className="text-slate-800 text-xs font-medium max-w-xs truncate">{e.description || "—"}</td>
                        <td><span className="badge badge-gold">{e.paymentMode}</span></td>
                        <td className="text-slate-600 text-xs">{e.recipient || "—"}</td>
                        <td className="font-bold text-rose-700 text-xs">{formatCurrency(e.amount)}</td>
                        <td className="text-right">
                          <button
                            className="btn-danger p-1.5 cursor-pointer"
                            onClick={() => delExpense(e.id)}
                            title="Delete Expense"
                          >
                            <Trash2 size={12} />
                          </button>
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
