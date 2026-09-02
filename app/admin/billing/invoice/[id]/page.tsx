"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import InvoicePrint from "@/components/admin/InvoicePrint";

export default function BillingInvoicePage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/crm/bills/${id}`);
        const d = await res.json();
        if (d.success) {
          setData(d.data);
        } else {
          setError(d.error || "Invoice not found");
        }
      } catch {
        setError("Network error loading invoice");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center p-8 bg-rose-50 border border-rose-200 rounded-2xl">
          <p className="text-rose-700 font-black text-sm">⚠️ Invoice Not Found</p>
          <p className="text-rose-500 text-xs mt-1">{error || "This invoice does not exist in the database."}</p>
        </div>
      </div>
    );
  }

  // Parse items/payments if stored as strings
  let items = data.items || [];
  if (typeof items === "string") try { items = JSON.parse(items); } catch { items = []; }

  let payments = data.payments || [];
  if (typeof payments === "string") try { payments = JSON.parse(payments); } catch { payments = []; }

  const invoiceData = {
    invoiceNo: data.billNo || id,
    invoiceType: "Billing" as const,
    date: data.date,
    time: data.createdAt
      ? new Date(data.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      : undefined,
    createdBy: data.createdBy,
    branch: data.branch,
    clientName: data.clientName || data.client?.name || "Guest",
    phone: data.phone || data.client?.phone || "",
    email: data.client?.email,
    dob: data.client?.dob,
    anniversary: data.client?.anniversary,
    inviteCode: data.client?.inviteCode,
    membershipType: data.client?.membership,
    rewardPoints: data.client?.points,
    items: items.map((i: any) => ({
      ...i,
      qty: i.qty || 1,
      discountPct: i.discountPct || 0,
    })),
    subtotal: Number(data.subtotal || 0),
    discount: Number(data.discount || 0),
    couponDiscount: Number(data.couponDiscount || 0),
    taxRate: Number(data.taxRate || 0),
    taxAmount: Number(data.taxAmount || 0),
    taxInclusive: data.taxInclusive || false,
    previousDues: Number(data.previousDues || 0),
    advanceAdjust: Number(data.advanceAdjust || 0),
    walletDeduct: Number(data.walletDeduct || 0),
    total: Number(data.total || 0),
    paid: Number(data.paid || 0),
    pending: Number(data.pending || 0),
    payments,
    totalQty: items.reduce((s: number, i: any) => s + (Number(i.qty) || 1), 0),
  };

  return (
    <div className="fade-in py-2">
      <InvoicePrint data={invoiceData} />
    </div>
  );
}
