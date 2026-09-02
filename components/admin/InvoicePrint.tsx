"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

/* ─────────────────────────── Types ─────────────────────────── */
export interface InvoiceItem {
  name: string;
  provider?: string;
  duration?: number;
  qty?: number;
  price: number;
  discount?: number;
  discountPct?: number;
  type?: string;
}

export interface PaymentEntry {
  mode: string;
  amount: number;
}

export interface InvoiceData {
  invoiceNo: string;
  invoiceType: "Billing" | "Appointment";
  date: string;
  time?: string;
  createdBy?: string;
  branch?: string;
  clientName: string;
  phone: string;
  email?: string;
  dob?: string;
  anniversary?: string;
  inviteCode?: string;
  membershipType?: string;
  rewardPoints?: number;
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  couponDiscount?: number;
  taxRate?: number;
  taxAmount?: number;
  taxInclusive?: boolean;
  previousDues?: number;
  advanceAdjust?: number;
  walletDeduct?: number;
  total: number;
  paid: number;
  pending: number;
  payments?: PaymentEntry[];
  appointmentDate?: string;
  appointmentTime?: string;
  advance?: number;
  notes?: string;
  appointmentStatus?: string;
  totalQty?: number;
}

export interface InvoicePrintProps {
  data: InvoiceData;
  salonName?: string;
  salonAddress?: string;
  salonPhone?: string;
  salonEmail?: string;
  salonWebsite?: string;
  salonGst?: string;
  salonLogoUrl?: string;
}

/* ─────────────────────────── Helpers ─────────────────────────── */
const fmt = (v?: number) =>
  Number(v || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtDateStr = (d?: string, t?: string) => {
  if (!d) return "";
  try {
    const dt = new Date(d);
    const day = String(dt.getDate()).padStart(2, "0");
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const year = dt.getFullYear();
    let out = `${day}-${month}-${year}`;
    if (t) out += ` ${t}`;
    return out;
  } catch {
    return d;
  }
};

/* ─────────────────────────── Component ─────────────────────────── */
export default function InvoicePrint({
  data,
  salonName = "Vivazen Beauty Salon",
  salonAddress = "Sapna Complex Building, In front of Shivangi Clinic (Ground Floor), Wajidpur Tiraha, Jaunpur, 222002",
  salonPhone = "7617079955",
  salonEmail = "vivazenwellnessjnp@gmail.com",
  salonWebsite = "https://www.vivazen.in/",
  salonGst,
  salonLogoUrl = "https://2024.geteasysoftware.com/vivazen_beauty_salon/upload/1732513339.png",
}: InvoicePrintProps) {
  const isAppt = data.invoiceType === "Appointment";

  const paymentModeStr = (data.payments || []).length > 1
    ? (data.payments || [])
        .filter((p) => Number(p.amount) > 0)
        .map((p) => `${p.mode}: ₹${fmt(p.amount)}`)
        .join(" • ")
    : (data.payments || [])[0]?.mode || "Cash";

  const totalQty = data.totalQty ?? (data.items || []).reduce((s, i) => s + (i.qty || 1), 0);

  const appointmentDateStr = fmtDateStr(
    data.appointmentDate || data.date,
    data.appointmentTime || data.time
  );

  const invoiceDateStr = fmtDateStr(data.date, data.time);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const isPaid = data.pending <= 0;

  // Calculate Item-Level Discounts Sum
  const itemDiscountsTotal = (data.items || []).reduce((sum, item) => {
    const qty = item.qty || 1;
    const discPct = item.discountPct ?? 0;
    if (item.discount != null && item.discount > 0) {
      return sum + Number(item.discount);
    } else if (discPct > 0) {
      return sum + (Number(item.price || 0) * qty * (discPct / 100));
    }
    return sum;
  }, 0);

  const overallDiscount = Number(data.discount || 0);
  const couponDiscount = Number(data.couponDiscount || 0);
  const totalAllDiscounts = itemDiscountsTotal + overallDiscount + couponDiscount;

  return (
    <div className="w-full flex flex-col items-center py-6 px-4">
      {/* ─── Print Stylesheet ─── */}
      <style>{`
        /* Screen Typography and Spacing */
        .inv-receipt-card {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #1e293b;
        }

        /* ── Critical Print Media Styles ── */
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            width: 100% !important;
            height: 100% !important;
          }

          body * {
            visibility: hidden !important;
          }

          #invoice-printable-area,
          #invoice-printable-area * {
            visibility: visible !important;
          }

          #invoice-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 3mm 2mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }

          #invoice-printable-area table,
          #invoice-printable-area td,
          #invoice-printable-area th,
          #invoice-printable-area p,
          #invoice-printable-area h1,
          #invoice-printable-area h2,
          #invoice-printable-area h3,
          #invoice-printable-area h4,
          #invoice-printable-area span,
          #invoice-printable-area hr,
          #invoice-printable-area div {
            color: #000000 !important;
            border-color: #000000 !important;
          }

          .inv-no-print {
            display: none !important;
            visibility: hidden !important;
          }

          @page {
            margin: 2mm 0;
            size: 80mm auto;
          }
        }
      `}</style>

      {/* ─── Screen Control Bar (Hidden on Print) ─── */}
      <div className="inv-no-print w-full max-w-[440px] mb-5 flex items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-md shadow-slate-100">
        <Link
          href={isAppt ? "/admin/appointments" : "/admin/billing"}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>

        <div className="flex items-center gap-2">
          {isPaid ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3 h-3 text-amber-600" /> Due: ₹{fmt(data.pending)}
            </span>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-amber-600/20 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* ─── Receipt Card Document (Visible on Screen & Printed) ─── */}
      <div
        id="invoice-printable-area"
        className="inv-receipt-card w-full max-w-[360px] bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/60 text-slate-800"
      >
        {/* ── Salon Header ── */}
        <div className="text-center pb-2">
          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={salonLogoUrl}
            alt={salonName}
            className="max-w-[170px] h-auto mx-auto mb-2 object-contain"
          />

          <h2 className="text-sm font-bold tracking-wide uppercase text-slate-900 mb-1">
            {salonName}
          </h2>

          <p className="text-[11px] leading-tight text-slate-600 font-medium max-w-[280px] mx-auto uppercase mb-1.5">
            {salonAddress}
          </p>

          <div className="text-[11px] text-slate-600 space-y-0.5 font-medium">
            <p><strong>Contact:</strong> {salonPhone}</p>
            <p><strong>Email:</strong> {salonEmail}</p>
            <p><strong>Website:</strong> {salonWebsite}</p>
            {salonGst && <p><strong>GSTIN:</strong> {salonGst}</p>}
          </div>
        </div>

        {/* ── Invoice Title & Branch ── */}
        <div className="my-2.5 py-1.5 border-y border-dashed border-slate-300 text-center">
          <h3 className="text-xs font-black tracking-widest uppercase text-slate-900">
            {isAppt ? "APPOINTMENT INVOICE" : "SALES TAX INVOICE"}
          </h3>
          <p className="text-[11px] font-semibold text-amber-800 mt-0.5">
            Branch: {data.branch || "Jaunpur"}
          </p>
        </div>

        {/* ── Customer & Invoice Details ── */}
        <div className="py-2 text-[11.5px] leading-relaxed text-slate-700">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="w-24 py-0.5 text-slate-500 font-semibold">Client Name</td>
                <td className="py-0.5 font-bold text-slate-900">: {data.clientName}</td>
              </tr>
              <tr>
                <td className="py-0.5 text-slate-500 font-semibold">Mobile No</td>
                <td className="py-0.5 font-semibold text-slate-800">: {data.phone || "—"}</td>
              </tr>
              {isAppt ? (
                <>
                  <tr>
                    <td className="py-0.5 text-slate-500 font-semibold">Appt No</td>
                    <td className="py-0.5 font-bold text-slate-900">: #{data.invoiceNo}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 text-slate-500 font-semibold">Appt Date</td>
                    <td className="py-0.5 font-semibold text-slate-800">: {appointmentDateStr}</td>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <td className="py-0.5 text-slate-500 font-semibold">Invoice No</td>
                    <td className="py-0.5 font-bold text-slate-900">: #{data.invoiceNo}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 text-slate-500 font-semibold">Invoice Date</td>
                    <td className="py-0.5 font-semibold text-slate-800">: {invoiceDateStr}</td>
                  </tr>
                </>
              )}
              {data.membershipType && (
                <tr>
                  <td className="py-0.5 text-slate-500 font-semibold">Membership</td>
                  <td className="py-0.5 font-semibold text-amber-700">: {data.membershipType}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Line Items (Showing Item Name, Qty, Rate, Item-level Discount & Line Total) ── */}
        <div className="my-2.5 border-t border-dashed border-slate-300 pt-2">
          {/* Header Bar */}
          <div className="flex items-center justify-between text-[10.5px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5 px-0.5">
            <span>Service &amp; Item Details</span>
            <span>Total</span>
          </div>

          {/* Item List */}
          <div className="divide-y divide-dashed divide-slate-200">
            {(data.items || []).length === 0 ? (
              <div className="py-3 text-center text-slate-400 text-xs">
                No items added
              </div>
            ) : (
              (data.items || []).map((item, idx) => {
                const qty = item.qty || 1;
                const discPct = item.discountPct ?? 0;
                const discAmt = item.discount != null && item.discount > 0
                  ? Number(item.discount)
                  : discPct > 0
                  ? (Number(item.price || 0) * qty * (discPct / 100))
                  : 0;

                const lineTotal = Math.max(0, (Number(item.price || 0) * qty) - discAmt);

                return (
                  <div key={idx} className="py-2 text-[11.5px]">
                    {/* Line 1: Item Name & Line Total */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 font-bold text-slate-900 leading-snug">
                        {item.name}
                      </div>
                      <div className="font-black text-slate-900 text-right whitespace-nowrap text-xs">
                        ₹{fmt(lineTotal)}
                      </div>
                    </div>

                    {/* Line 2: Spacious Details (Qty, Rate, Item Discount, Staff) */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[10.5px] text-slate-600">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                        Qty: <strong className="text-slate-900 font-bold">{qty}</strong>
                      </span>

                      <span className="text-slate-600">
                        Rate: <strong>₹{fmt(item.price)}</strong>
                      </span>

                      {discAmt > 0 && (
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                          Dis: {discPct > 0 ? `${discPct}% (-₹${fmt(discAmt)})` : `-₹${fmt(discAmt)}`}
                        </span>
                      )}

                      {item.provider && (
                        <span className="text-slate-500">
                          By: <strong className="text-slate-800">{item.provider}</strong>
                        </span>
                      )}

                      {item.type && (
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                          [{item.type}]
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Summary & Totals Breakdown ── */}
        <div className="border-t border-dashed border-slate-300 pt-2.5 text-[11.5px]">
          <table className="w-full border-collapse">
            <tbody className="space-y-1">
              {!isAppt && (
                <tr>
                  <td className="text-slate-500 font-semibold py-0.5">Total Qty</td>
                  <td className="text-right font-semibold text-slate-800 py-0.5">{totalQty}</td>
                </tr>
              )}
              <tr>
                <td className="text-slate-500 font-semibold py-0.5">Items Subtotal</td>
                <td className="text-right font-semibold text-slate-800 py-0.5">₹{fmt(data.subtotal)}</td>
              </tr>

              {/* Item-Level Discounts */}
              {itemDiscountsTotal > 0 && (
                <tr>
                  <td className="text-slate-500 font-semibold py-0.5">Item Discounts</td>
                  <td className="text-right font-semibold text-emerald-600 py-0.5">-₹{fmt(itemDiscountsTotal)}</td>
                </tr>
              )}

              {/* Bill-Level Discount */}
              {overallDiscount > 0 && (
                <tr>
                  <td className="text-slate-500 font-semibold py-0.5">Overall Bill Discount</td>
                  <td className="text-right font-semibold text-emerald-600 py-0.5">-₹{fmt(overallDiscount)}</td>
                </tr>
              )}

              {/* Coupon Discount */}
              {couponDiscount > 0 && (
                <tr>
                  <td className="text-slate-500 font-semibold py-0.5">Coupon Discount</td>
                  <td className="text-right font-semibold text-emerald-600 py-0.5">-₹{fmt(couponDiscount)}</td>
                </tr>
              )}

              {/* Total Discount Row (if any discounts exist) */}
              {totalAllDiscounts > 0 && (
                <tr className="border-y border-dashed border-emerald-200/80 bg-emerald-50/50">
                  <td className="text-emerald-900 font-bold py-1">Total Discount</td>
                  <td className="text-right font-black text-emerald-700 py-1">-₹{fmt(totalAllDiscounts)}</td>
                </tr>
              )}

              {/* Tax / GST */}
              {Boolean(data.taxAmount && data.taxAmount > 0) && (
                <tr>
                  <td className="text-slate-500 font-semibold py-0.5">
                    Tax / GST {data.taxRate ? `(${data.taxRate}%)` : ""}
                  </td>
                  <td className="text-right font-semibold text-slate-800 py-0.5">₹{fmt(data.taxAmount)}</td>
                </tr>
              )}

              {/* Previous Unpaid Dues (if any added) */}
              {Boolean(data.previousDues && data.previousDues > 0) && (
                <tr>
                  <td className="text-rose-700 font-semibold py-0.5">Previous Unpaid Dues</td>
                  <td className="text-right font-bold text-rose-700 py-0.5">+₹{fmt(data.previousDues)}</td>
                </tr>
              )}

              {/* Grand Total */}
              <tr className="border-t border-slate-300 font-bold">
                <td className="py-2 text-slate-900 uppercase text-xs">Grand Total</td>
                <td className="py-2 text-right text-slate-900 text-sm font-black">₹{fmt(data.total)}</td>
              </tr>

              {/* Payment Details */}
              {isAppt ? (
                <>
                  <tr>
                    <td className="text-slate-500 font-semibold py-0.5">Advance Paid</td>
                    <td className="text-right font-bold text-emerald-700 py-0.5">
                      ₹{fmt(data.advance || data.advanceAdjust || 0)}
                    </td>
                  </tr>
                  <tr className="border-t border-slate-200">
                    <td className="py-1 text-slate-900 font-bold">Balance Due</td>
                    <td className="py-1 text-right font-black text-rose-700 text-xs">
                      ₹{fmt(Math.max(0, data.total - (data.advance || data.advanceAdjust || 0)))}
                    </td>
                  </tr>
                </>
              ) : (
                <>
                  {Boolean(data.advanceAdjust && data.advanceAdjust > 0) && (
                    <tr>
                      <td className="text-emerald-700 font-semibold py-0.5">Advance Adjusted</td>
                      <td className="text-right font-bold text-emerald-700 py-0.5">-₹{fmt(data.advanceAdjust)}</td>
                    </tr>
                  )}
                  {Boolean(data.walletDeduct && data.walletDeduct > 0) && (
                    <tr>
                      <td className="text-emerald-700 font-semibold py-0.5">Wallet Credit Redeemed</td>
                      <td className="text-right font-bold text-emerald-700 py-0.5">-₹{fmt(data.walletDeduct)}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="text-slate-500 font-semibold py-0.5">Amount Paid</td>
                    <td className="text-right font-bold text-emerald-700 py-0.5">₹{fmt(data.paid)}</td>
                  </tr>
                  <tr className="border-t border-slate-200">
                    <td className="py-1 text-slate-900 font-bold">Balance Pending</td>
                    <td className="py-1 text-right font-black text-rose-700 text-xs">₹{fmt(data.pending)}</td>
                  </tr>
                </>
              )}

              {/* Payment Mode */}
              <tr>
                <td className="py-1 text-slate-500 font-semibold text-[10.5px]">Payment Mode</td>
                <td className="py-1 text-right font-semibold text-slate-700 text-[10.5px] uppercase">
                  {paymentModeStr}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Footer / Policy / Thank You ── */}
        <div className="border-t border-dashed border-slate-300 mt-3 pt-3 text-center space-y-1.5 text-[10.5px] text-slate-600 font-medium leading-relaxed">
          {isAppt ? (
            <p className="text-slate-500 italic">
              *Advances for Appointments &amp; Packages are non-refundable*
            </p>
          ) : (
            <>
              <p className="text-slate-700 font-bold">
                *Booking Amount: Non-refundable &amp; Non-transferable*
              </p>
              {data.inviteCode && (
                <p className="text-amber-800 font-semibold">
                  Client Referral Code: <span className="font-bold">{data.inviteCode}</span>
                </p>
              )}
            </>
          )}

          <div className="pt-2">
            <p className="text-xs font-black tracking-wider text-slate-800 uppercase flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Thank You • Please Visit Again</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
