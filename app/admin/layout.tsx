"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Calendar,
  Bell,
  MessageSquare,
  Users,
  Scissors,
  Package,
  Award,
  Tag,
  ShoppingBag,
  UserCheck,
  Clock,
  DollarSign,
  TrendingUp,
  BarChart3,
  ClipboardCheck,
  Star,
  Zap,
  Building2,
  ArrowLeftRight,
  Image as ImageIcon,
  Send,
  Sparkles,
  SlidersHorizontal,
  Home,
  Shield,
  LogOut,
  Menu,
  X,
  Lock,
  ChevronRight
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
  permissions?: string[];
}

interface NavGroup {
  title: string;
  items: {
    id: string;
    label: string;
    href: string;
    icon: any;
    adminOnly?: boolean;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: "OPERATIONS & POS",
    items: [
      { id: "dashboard", label: "Executive Dashboard", href: "/admin", icon: LayoutDashboard },
      { id: "billing", label: "Billing & POS", href: "/admin/billing", icon: Receipt },
      { id: "appointments", label: "Appointments", href: "/admin/appointments", icon: Calendar },
      { id: "followups", label: "Daily Follow-ups", href: "/admin/followups", icon: Bell },
      { id: "enquiries", label: "Enquiries & Leads", href: "/admin/enquiries", icon: MessageSquare },
      { id: "clients", label: "Clients Directory", href: "/admin/clients", icon: Users },
    ],
  },
  {
    title: "SALON MASTER",
    items: [
      { id: "services", label: "Services Catalog", href: "/admin/services", icon: Scissors },
      { id: "packages", label: "Packages Builder", href: "/admin/packages", icon: Package },
      { id: "memberships", label: "VIP Memberships", href: "/admin/memberships", icon: Award },
      { id: "coupons", label: "Coupons & Codes", href: "/admin/coupons", icon: Tag },
      { id: "inventory", label: "Inventory Hub", href: "/admin/inventory", icon: ShoppingBag },
    ],
  },
  {
    title: "TEAM & PAYROLL",
    items: [
      { id: "staff", label: "Team & Beauticians", href: "/admin/staff", icon: UserCheck },
      { id: "attendance", label: "Staff Attendance", href: "/admin/attendance", icon: Clock },
      { id: "payroll", label: "Monthly Payroll", href: "/admin/payroll", icon: DollarSign },
    ],
  },
  {
    title: "FINANCIALS & QUALITY",
    items: [
      { id: "expenses", label: "Salon Expenses", href: "/admin/expenses", icon: TrendingUp },
      { id: "reports", label: "11-Report Analytics", href: "/admin/reports", icon: BarChart3 },
      { id: "assessment", label: "Quality Audits", href: "/admin/assessment", icon: ClipboardCheck },
      { id: "feedbacks", label: "Reviews & Reputation", href: "/admin/feedbacks", icon: Star },
      { id: "reminders", label: "Service Reminders", href: "/admin/reminders", icon: Zap },
    ],
  },
  {
    title: "MULTI-BRANCH & MARKETING",
    items: [
      { id: "branches", label: "Branch Locations", href: "/admin/branches", icon: Building2 },
      { id: "transfers", label: "Branch Transfers", href: "/admin/transfers", icon: ArrowLeftRight },
      { id: "gallery", label: "Photo Gallery", href: "/admin/gallery", icon: ImageIcon },
      { id: "sms", label: "SMS & WhatsApp", href: "/admin/sms", icon: Send },
    ],
  },
  {
    title: "WEBSITE CMS",
    items: [
      { id: "offers", label: "Exclusive Offers", href: "/admin/offers", icon: Sparkles },
      { id: "hero", label: "Hero Slides", href: "/admin/hero", icon: SlidersHorizontal },
      { id: "interior", label: "Sanctuary Interior", href: "/admin/interior", icon: Home },
      { id: "images", label: "Image Asset Vault", href: "/admin/images", icon: ImageIcon },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { id: "settings", label: "Software & API Settings", href: "/admin/settings", icon: SlidersHorizontal },
      { id: "users", label: "Staff & Role Access", href: "/admin/users", icon: Shield, adminOnly: true },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } catch {
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs tracking-widest text-slate-500 uppercase font-medium">Loading Management Portal...</p>
        </div>
      </div>
    );
  }

  // Permission check helper
  const hasAccess = (itemId: string, adminOnly?: boolean) => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    if (adminOnly) return false;
    if (itemId === "dashboard") return true;
    const userPerms = user.permissions || [];
    return userPerms.includes(itemId) || userPerms.includes(`${itemId}:view`) || userPerms.includes(`${itemId}:create`) || userPerms.includes(`${itemId}:edit`);
  };

  // Find current route's required module ID
  const currentNav = navGroups.flatMap(g => g.items).find(i => i.href === pathname);
  const isAllowedCurrentRoute = !currentNav || hasAccess(currentNav.id, currentNav.adminOnly);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2c2723] flex flex-col md:flex-row antialiased">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#ece7e0] sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-serif text-lg font-bold tracking-widest text-[#2c2723]">VIVAZEN</span>
          <span className="text-[10px] bg-[#faf6ee] text-[#7a5426] border border-[#ecdcc4] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">CRM</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider ${
            user?.role === 'ADMIN' ? 'bg-[#faf6ee] text-[#7a5426] border border-[#ecdcc4]' : 'bg-stone-100 text-stone-800 border border-stone-200'
          }`}>
            {user?.role}
          </span>
          <button
            onClick={handleLogout}
            className="p-2 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-[#ece7df] flex flex-col z-50 transition-transform duration-300 ease-in-out md:translate-x-0 shadow-xs ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#f3ede4] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold tracking-widest text-[#1c1917]">VIVAZEN</span>
              <span className="text-[10px] bg-[#faf6ee] text-[#7a5426] border border-[#ecdcc4] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">CRM</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5 font-medium">Beauty & Spa Management</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar text-xs">
          {navGroups.map((group) => {
            const accessibleItems = group.items.filter((item) => hasAccess(item.id, item.adminOnly));
            if (accessibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                <p className="px-3 text-[9.5px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                  {group.title}
                </p>
                {accessibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        isActive
                          ? "bg-[#faf6ee] text-[#7a5426] border border-[#ecdcc4] font-semibold shadow-xs"
                          : "text-stone-600 hover:bg-[#faf7f2] hover:text-[#1c1917]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? "text-[#9a733e]" : "text-stone-400"}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#9a733e]" />}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-3.5 border-t border-[#f3ede4] bg-[#faf8f5]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#faf6ee] border border-[#ecdcc4] flex items-center justify-center font-bold text-[#7a5426] text-xs flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="truncate">
                <p className="font-semibold text-stone-800 text-xs truncate">{user?.name}</p>
                <span className="text-[10px] text-stone-500 font-medium">{user?.role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="w-full flex-1 min-w-0 p-4 sm:p-6 md:p-8 min-h-screen overflow-x-auto">
        {!isAllowedCurrentRoute ? (
          <div className="crm-card text-center py-20 max-w-lg mx-auto mt-12">
            <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
            <p className="text-slate-500 text-xs mt-1">
              You do not have permission to access this module. Please contact the administrator to request access.
            </p>
            <Link href="/admin" className="btn-gold text-xs mt-6 inline-flex">
              Return to Dashboard
            </Link>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
