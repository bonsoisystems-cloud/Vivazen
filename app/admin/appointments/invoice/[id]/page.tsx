"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import InvoicePrint from "@/components/admin/InvoicePrint";

export default function AppointmentInvoicePage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/crm/appointments/${id}`);
        const d = await res.json();
        if (d.success) {
          setData(d.data);
        } else {
          setError(d.error || "Appointment invoice not found");
        }
      } catch {
        setError("Network error loading appointment invoice");
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
          <p className="text-slate-500 text-sm">Loading appointment invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center p-8 bg-rose-50 border border-rose-200 rounded-2xl">
          <p className="text-rose-700 font-black text-sm">⚠️ Appointment Not Found</p>
          <p className="text-rose-500 text-xs mt-1">{error || "This appointment invoice does not exist."}</p>
        </div>
      </div>
    );
  }

  // Parse services if stored as string
  let services = data.services || [];
  if (typeof services === "string") try { services = JSON.parse(services); } catch { services = []; }

  // Map services to invoice items format
  const items = services.map((s: any) => {
    const price = Number(s.price || 0);
    const discountPct = Number(s.discountPct || 0);
    const discountAmt = Number(s.discount || 0);
    const lineTotal = discountPct > 0
      ? price * (1 - discountPct / 100)
      : discountAmt > 0
        ? price - discountAmt
        : price;
    return {
      name: s.name || s.service || "Service",
      provider: s.provider || s.beautician || s.providerName,
      duration: s.duration,
      qty: s.qty || 1,
      price,
      discount: discountAmt,
      discountPct,
      type: s.type || "Service",
    };
  });

  // Build appointment number like #APP0375
  const apptNum = data.apptNumber || `APP${id.slice(-4).toUpperCase().padStart(4, "0")}`;

  // Payment modes from stored data
  let payments = data.payments || [];
  if (typeof payments === "string") try { payments = JSON.parse(payments); } catch { payments = []; }
  if (payments.length === 0 && data.paymentMode) {
    payments = [{ mode: data.paymentMode, amount: Number(data.advance || 0) }];
  }

  const invoiceData = {
    invoiceNo: apptNum,
    invoiceType: "Appointment" as const,
    date: data.date,
    time: data.time,
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
    items,
    subtotal: Number(data.total || 0),
    discount: Number(data.discount || 0),
    couponDiscount: Number(data.couponDiscount || 0),
    taxRate: Number(data.taxRate || 0),
    taxAmount: Number(data.taxAmount || 0),
    total: Number(data.total || 0),
    paid: Number(data.advance || 0),
    pending: Math.max(0, Number(data.total || 0) - Number(data.advance || 0)),
    advance: Number(data.advance || 0),
    advanceAdjust: Number(data.advance || 0),
    appointmentDate: data.date,
    appointmentTime: data.time,
    appointmentStatus: data.status,
    notes: data.remarks,
    payments,
  };

  return (
    <div className="fade-in py-2">
      <InvoicePrint data={invoiceData} />
    </div>
  );
}
