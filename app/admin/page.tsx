"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Scissors,
  Receipt,
  Calendar,
  Bell,
  MessageSquare,
  Users,
  ShoppingBag,
  Clock,
  TrendingUp,
  BarChart3,
  DollarSign,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Star,
  Crown,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Wallet,
  Building2,
  ChevronRight,
  Check,
  UserCheck
} from "lucide-react";

interface CrmStats {
  todaySales: number;
  todayVisits: number;
  todayInvoiced: number;
  totalSales: number;
  todayAppointmentsCount: number;
  todayEnquiriesCount: number;
  totalClients: number;
  totalStaff: number;
  totalProducts: number;
  totalBills: number;
  dueLeadsCount: number;
  recentBills: any[];
  todayAppointments: any[];
  recentFeedbacks: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<CrmStats>({
    todaySales: 0,
    todayVisits: 0,
    todayInvoiced: 0,
    totalSales: 0,
    todayAppointmentsCount: 0,
    todayEnquiriesCount: 0,
    totalClients: 0,
    totalStaff: 0,
    totalProducts: 0,
    totalBills: 0,
    dueLeadsCount: 0,
    recentBills: [],
    todayAppointments: [],
    recentFeedbacks: []
  });
  const [userName, setUserName] = useState<string>("Executive");
  const [userRole, setUserRole] = useState<string>("ADMIN");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [authRes, statsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/crm/stats")
        ]);

        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.user) {
            setUserName(authData.user.name);
            setUserRole(authData.user.role);
          }
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success && statsData.data) {
            setStats(statsData.data);
          }
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const formatCurrency = (amount: number) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  return (
    <div className="fade-in space-y-7 max-w-7xl mx-auto pb-12">
      {/* ─── LUXURY EXECUTIVE WELCOME BANNER ─── */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-[#1c1308] to-slate-900 text-white p-7 md:p-10 border border-amber-500/20 shadow-2xl">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/20 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-tr from-amber-600/15 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold tracking-[0.25em] uppercase">
              <Sparkles size={11} className="text-amber-400 animate-pulse" />
              <span>Vivazen Executive Suite</span>
              <span className="w-1 h-1 rounded-full bg-amber-400" />
              {/* <span className="text-amber-200/80">Live PostgreSQL</span> */}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
              Welcome back, <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 bg-clip-text text-transparent">{userName}</span>
            </h1>

            {/* <p className="text-amber-100/70 text-xs sm:text-sm font-light leading-relaxed max-w-xl">
              Live salon operations overview, real-time POS collections, client appointment rosters, and geofenced staff attendance.
            </p> */}
          </div>

          {/* Quick Action Luxury Tiles */}
          <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
            <Link
              href="/admin/billing"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-950/40 hover:shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer font-sans"
            >
              <Receipt size={14} className="stroke-[2.5]" />
              <span>POS Quick Bill</span>
            </Link>

            <Link
              href="/admin/appointments"
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-amber-100 border border-white/15 text-xs font-semibold tracking-wide backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer hover:border-amber-400/40"
            >
              <Calendar size={14} className="text-amber-300" />
              <span>Book Appointment</span>
            </Link>

            <Link
              href="/admin/attendance"
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-amber-100 border border-white/15 text-xs font-semibold tracking-wide backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer hover:border-amber-400/40"
            >
              <UserCheck size={14} className="text-amber-300" />
              <span>Staff Attendance</span>
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200/80 p-16 flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="w-12 h-12 border-3 border-amber-300 border-t-amber-700 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase animate-pulse">
            Synchronizing live salon collections...
          </p>
        </div>
      ) : (
        <>
          {/* ─── 4 LUXURY KPI METRIC CARDS (Normal Font Numbers) ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Today's Revenue */}
            <div className="group relative bg-white/90 backdrop-blur-xl rounded-[1.75rem] p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-300/80 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Today's Collections
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Receipt size={17} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-normal font-sans">
                {formatCurrency(stats.todaySales)}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-slate-500">{stats.todayVisits} billed visits</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Live POS
                </span>
              </div>
            </div>

            {/* Card 2: Today's Bookings */}
            <div className="group relative bg-white/90 backdrop-blur-xl rounded-[1.75rem] p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300/80 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Today's Bookings
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Calendar size={17} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-normal font-sans">
                {stats.todayAppointmentsCount}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-slate-500">Scheduled salon slots</span>
                <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {stats.todayAppointments.length} Active
                </span>
              </div>
            </div>

            {/* Card 3: Actionable Follow-ups */}
            <div className="group relative bg-white/90 backdrop-blur-xl rounded-[1.75rem] p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-rose-300/80 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Follow-ups &amp; Leads
                </span>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Bell size={17} />
                </div>
              </div>
              <p className={`text-3xl font-bold tracking-normal font-sans ${stats.dueLeadsCount > 0 ? "text-rose-700" : "text-slate-900"}`}>
                {stats.dueLeadsCount}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-slate-500">Due reminders</span>
                <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  {stats.todayEnquiriesCount} new leads
                </span>
              </div>
            </div>

            {/* Card 4: Total VIP Clientele */}
            <div className="group relative bg-white/90 backdrop-blur-xl rounded-[1.75rem] p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-300/80 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Clientele
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Users size={17} />
                </div>
              </div>
              <p className="text-3xl font-bold text-amber-900 tracking-normal font-sans">
                {stats.totalClients}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-slate-500">{stats.totalBills} lifetime bills</span>
                <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Registered
                </span>
              </div>
            </div>
          </div>

          {/* ─── MAIN OPERATIONS SECTION ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Today's Appointment Schedule */}
            <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-[2rem] border border-slate-200/90 p-6 md:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-serif font-bold text-slate-900">
                      Today's Appointment Schedule
                    </h2>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                      {stats.todayAppointments.length} Bookings
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5 font-light">
                    Real-time salon reservations &amp; service queues for today
                  </p>
                </div>
                <Link
                  href="/admin/appointments"
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold tracking-wide transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Full Schedule</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {stats.todayAppointments.length === 0 ? (
                <div className="text-center py-14 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
                    <Calendar size={26} />
                  </div>
                  <p className="text-slate-700 font-serif font-bold text-base">No Appointments Scheduled Today</p>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto font-light">
                    Your queue is clear for today. Book clients using the interactive appointment scheduler.
                  </p>
                  <Link
                    href="/admin/appointments"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wide transition-all shadow-sm cursor-pointer"
                  >
                    <Plus size={13} /> Book First Appointment
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="crm-table w-full">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Client</th>
                        <th>Services</th>
                        <th>Total</th>
                        <th>Advance</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.todayAppointments.map((a: any) => (
                        <tr key={a.id} className="hover:bg-amber-50/30 transition-colors">
                          <td className="text-amber-900 font-bold text-xs whitespace-nowrap">
                            <span className="bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-md">
                              {a.time}
                            </span>
                          </td>
                          <td>
                            <p className="font-bold text-slate-800 text-xs">{a.clientName}</p>
                            <p className="text-slate-400 text-[10px]">{a.phone}</p>
                          </td>
                          <td className="text-slate-600 text-xs max-w-[180px] truncate">
                            {Array.isArray(a.services) ? a.services.map((s: any) => s.name).join(", ") : "-"}
                          </td>
                          <td className="font-bold text-slate-900 text-xs">{formatCurrency(a.total)}</td>
                          <td className="text-emerald-700 font-bold text-xs">{formatCurrency(a.advance)}</td>
                          <td>
                            <span className="badge badge-gold text-[10px] font-bold">
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Column: Salon Master & Quick Reviews */}
            <div className="space-y-6">
              {/* Quick Metrics Tile */}
              <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] border border-slate-200/90 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-2">
                    <Activity size={15} className="text-amber-600" />
                    <span>Operations Hub Overview</span>
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-medium">Service Providers / Staff</span>
                    <span className="font-bold text-slate-800">{stats.totalStaff} Personnel</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-medium">Retail / Spa Inventory</span>
                    <span className="font-bold text-slate-800">{stats.totalProducts} Items</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
                    <span className="text-amber-900 font-medium">Lifetime Gross Sales</span>
                    <span className="font-bold text-amber-900 text-sm">
                      {formatCurrency(stats.totalSales)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 font-medium">Total Billed Invoices</span>
                    <span className="font-bold text-slate-800">{stats.totalBills} Invoices</span>
                  </div>
                </div>
              </div>

              {/* Recent Client Reviews Box */}
              <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] border border-slate-200/90 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-1.5">
                    <Star size={15} className="text-amber-500 fill-amber-500" />
                    <span>Client Feedback &amp; Reviews</span>
                  </h3>
                  <Link href="/admin/feedbacks" className="text-[11px] font-bold text-amber-800 hover:underline">
                    View All
                  </Link>
                </div>

                {stats.recentFeedbacks.length === 0 ? (
                  <p className="text-slate-400 text-xs py-6 text-center font-light">No client feedback logged yet.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentFeedbacks.slice(0, 3).map((f: any) => (
                      <div key={f.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">{f.clientName}</span>
                          <div className="flex items-center gap-0.5 text-amber-500 text-[10px]">
                            {Array.from({ length: f.overall || 5 }).map((_, idx) => (
                              <Star key={idx} size={11} className="fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-500 text-[11px] italic font-light line-clamp-2">
                          "{f.review || "Wonderful luxury service and highly professional staff."}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── RECENT INVOICES LEDGER ─── */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] border border-slate-200/90 p-6 md:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-slate-900">
                  Recent Invoiced Transactions
                </h2>
                <p className="text-slate-400 text-xs mt-0.5 font-light">
                  Latest customer billing receipts from the PostgreSQL database
                </p>
              </div>
              <Link
                href="/admin/billing"
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold tracking-wide transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Open POS</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {stats.recentBills.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
                  <Receipt size={26} />
                </div>
                <p className="text-slate-700 font-serif font-bold text-base">No Invoices Generated Yet</p>
                <p className="text-slate-400 text-xs max-w-sm mx-auto font-light">
                  Create your first client bill and log payment collections using the POS billing counter.
                </p>
                <Link
                  href="/admin/billing"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wide transition-all shadow-sm cursor-pointer"
                >
                  <Plus size={13} /> Create First Bill
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="crm-table w-full">
                  <thead>
                    <tr>
                      <th>Invoice No.</th>
                      <th>Date</th>
                      <th>Client Name</th>
                      <th>Contact</th>
                      <th>Total Invoiced</th>
                      <th>Paid Amount</th>
                      <th>Pending Dues</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBills.map((b: any) => (
                      <tr key={b.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="text-amber-900 font-bold text-xs whitespace-nowrap">
                          {b.billNo}
                        </td>
                        <td className="text-slate-500 text-xs">{b.date}</td>
                        <td className="font-bold text-slate-800 text-xs">{b.clientName}</td>
                        <td className="text-slate-400 text-xs">{b.phone}</td>
                        <td className="font-bold text-slate-900 text-xs">{formatCurrency(b.total)}</td>
                        <td className="text-emerald-700 font-bold text-xs">{formatCurrency(b.paid)}</td>
                        <td className={`text-xs font-bold ${b.pending > 0 ? "text-rose-700" : "text-slate-400"}`}>
                          {formatCurrency(b.pending)}
                        </td>
                        <td>
                          <span className={`badge text-[10px] font-bold ${b.status === "Settled" ? "badge-green" : "badge-gold"}`}>
                            {b.status}
                          </span>
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
