"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Receipt,
  Plus,
  Trash2,
  Printer,
  Search,
  User,
  Percent,
  CreditCard,
  Wallet,
  CheckCircle2,
  Calendar,
  Phone,
  Tag,
  Edit2,
  AlertCircle,
  X,
  Clock,
  Award,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Scissors,
  ShoppingBag,
  Sparkles,
  History,
  AlertTriangle,
  Check,
  Smartphone,
  ChevronDown,
  MessageSquare
} from "lucide-react";

const paymentModeOptions = [
  "Cash",
  "UPI (GPay)",
  "UPI (PhonePe)",
  "UPI (Paytm)",
  "Debit / Credit Card",
  "Bank Transfer",
  "Cheque",
  "Other"
];

export default function AdminBillingPage() {
  const today = new Date().toISOString().split("T")[0];

  // DB Data States
  const [clients, setClients] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Billing Tab
  const [activeTab, setActiveTab] = useState<"pos" | "invoices">("pos");

  // Date of Bill (Max: Today - Future Dates strictly blocked)
  const [billDate, setBillDate] = useState<string>(today);

  // Client Search & Selection (New Bill)
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientPhone, setClientPhone] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientGender, setClientGender] = useState("Female");

  // Line Items in POS
  const [items, setItems] = useState<any[]>([
    {
      id: "1",
      categoryId: "",
      subCategoryId: "",
      serviceId: "",
      name: "",
      price: 0,
      qty: 1,
      discountType: "%",
      discountValue: 0,
      providerId: "",
      providerName: "",
      type: "service"
    }
  ]);

  // Autocomplete Suggestions for Service / Product Name Search
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState<number | null>(null);
  const [activeEditSuggestionIdx, setActiveEditSuggestionIdx] = useState<number | null>(null);

  // Overall Adjustments & Discounts in POS
  const [overallDiscountType, setOverallDiscountType] = useState<"%" | "₹">("%");
  const [overallDiscountValue, setOverallDiscountValue] = useState<number>(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState<number>(0);

  // Client Financial History Adjustments in POS (STRICT TOGGLES - NO MANUAL INPUT)
  const [deductAdvanceToggle, setDeductAdvanceToggle] = useState<boolean>(true);
  const [includePreviousDuesToggle, setIncludePreviousDuesToggle] = useState<boolean>(false);
  const [useWalletToggle, setUseWalletToggle] = useState<boolean>(false);

  // Split / Custom Multi-Payment Modes in POS
  const [payments, setPayments] = useState<{ mode: string; amount: number }[]>([
    { mode: "Cash", amount: 0 }
  ]);

  // Bill Generation Success State (IN-PAGE CARD)
  const [generatedBill, setGeneratedBill] = useState<any>(null);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const [whatsappSentStatus, setWhatsappSentStatus] = useState<string | null>(null);

  const handleSendInvoiceWhatsApp = async () => {
    if (!generatedBill || !generatedBill.phone) return;
    setSendingWhatsapp(true);
    setWhatsappSentStatus(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://vivazen.in";
      const billUrl = `${origin}/admin/billing/invoice/${generatedBill.id || generatedBill.billNo}`;
      const msg = `✨ *VivaZen Beauty Salon & Spa - Invoice Receipt*\n\nDear ${generatedBill.clientName || "Valued Client"},\nThank you for choosing VivaZen! Here is your bill receipt:\n\n📄 *Invoice No:* #${generatedBill.billNo}\n📅 *Date:* ${generatedBill.date}\n💰 *Grand Total:* ₹${Number(generatedBill.total || 0).toLocaleString("en-IN")}\n✅ *Amount Paid:* ₹${Number(generatedBill.paid || 0).toLocaleString("en-IN")}\n⏳ *Pending Balance:* ₹${Number(generatedBill.pending || 0).toLocaleString("en-IN")}\n\nView or download full tax invoice receipt:\n🔗 ${billUrl}\n\nFor queries or appointments, call: 7617079955.\nHave a wonderful day! 🌸`;

      const res = await fetch("/api/crm/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: generatedBill.phone,
          message: msg,
          clientName: generatedBill.clientName,
          billNo: generatedBill.billNo,
          type: "Tax Invoice Receipt"
        })
      });

      const d = await res.json();
      if (d.success) {
        setWhatsappSentStatus("✓ Sent to WhatsApp!");
      } else {
        setWhatsappSentStatus(`⚠️ ${d.error || "Failed"}`);
      }
    } catch (err: any) {
      setWhatsappSentStatus(`⚠️ ${err.message || "Network error"}`);
    } finally {
      setSendingWhatsapp(false);
    }
  };

  // Settle Past Dues State (Pay Today)
  const [settlingBill, setSettlingBill] = useState<any>(null);
  const [settlingPaymentMode, setSettlingPaymentMode] = useState("Cash");
  const [settlingAmount, setSettlingAmount] = useState<number>(0);
  const [settlingLoading, setSettlingLoading] = useState(false);

  // Invoices Ledger Filters
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceDateFilter, setInvoiceDateFilter] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("");

  // Edit Bill State (FULL-PAGE MODE)
  const [editingBill, setEditingBill] = useState<any>(null);
  const [editItems, setEditItems] = useState<any[]>([]);
  const [editOverallDiscountType, setEditOverallDiscountType] = useState<"%" | "₹">("%");
  const [editOverallDiscountValue, setEditOverallDiscountValue] = useState<number>(0);
  const [editIncludePreviousDues, setEditIncludePreviousDues] = useState(false);
  const [editDeductAdvance, setEditDeductAdvance] = useState(false);
  const [editPayments, setEditPayments] = useState<{ mode: string; amount: number }[]>([
    { mode: "Cash", amount: 0 }
  ]);
  const [editSaving, setEditSaving] = useState(false);

  // Delete Bill State (IN-PAGE CARD)
  const [deletingBill, setDeletingBill] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, bRes, aRes, sRes, pRes, mRes, cpRes, stRes] = await Promise.all([
        fetch("/api/crm/clients"),
        fetch("/api/crm/bills"),
        fetch("/api/crm/appointments"),
        fetch("/api/services"),
        fetch("/api/crm/inventory?type=products"),
        fetch("/api/crm/memberships"),
        fetch("/api/crm/coupons"),
        fetch("/api/crm/staff?type=providers"),
      ]);

      if (cRes.ok) {
        const d = await cRes.json();
        if (d.success) setClients(d.data || []);
      }
      if (bRes.ok) {
        const d = await bRes.json();
        if (d.success) setBills(d.data || []);
      }
      if (aRes.ok) {
        const d = await aRes.json();
        if (d.success) setAppointments(d.data || []);
      }
      if (sRes.ok) {
        const d = await sRes.json();
        if (d.success) setCategories(d.data || []);
      }
      if (pRes.ok) {
        const d = await pRes.json();
        if (d.success) setProducts(d.data || []);
      }
      if (mRes.ok) {
        const d = await mRes.json();
        if (d.success) setMemberships(d.data || []);
      }
      if (cpRes.ok) {
        const d = await cpRes.json();
        if (d.success) setCoupons(d.data || []);
      }
      if (stRes.ok) {
        const d = await stRes.json();
        if (d.success) {
          const list = Array.isArray(d.data) ? d.data : Array.isArray(d.data?.providers) ? d.data.providers : Array.isArray(d.data?.staff) ? d.data.staff : [];
          setStaff(list);
        }
      }
    } catch (err) {
      console.error("Error loading billing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Client Selection
  const selectClient = (c: any) => {
    setSelectedClient(c);
    setClientName(c.name);
    setClientPhone(c.phone);
    setClientEmail(c.email || "");
    setClientGender(c.gender || "Female");
    setClientSearch("");
  };

  // ─── Real-Time Client Unbilled Advance & Past Dues Lookup ───
  const clientAppointmentsWithAdvance = useMemo(() => {
    if (!clientPhone.trim()) return [];
    return appointments.filter(a =>
      (a.phone === clientPhone.trim() || (selectedClient?.id && a.clientId === selectedClient.id)) &&
      a.status !== "Cancelled" && a.status !== "Billed" &&
      Number(a.advance || 0) > 0
    );
  }, [appointments, clientPhone, selectedClient]);

  const totalUnbilledAdvance = useMemo(() => {
    return clientAppointmentsWithAdvance.reduce((sum, a) => sum + Number(a.advance || 0), 0);
  }, [clientAppointmentsWithAdvance]);

  const clientPendingBills = useMemo(() => {
    if (!clientPhone.trim()) return [];
    return bills.filter(b =>
      (b.phone === clientPhone.trim() || (selectedClient?.id && b.clientId === selectedClient.id)) &&
      Number(b.pending || 0) > 0 &&
      (!editingBill || b.id !== editingBill.id)
    );
  }, [bills, clientPhone, selectedClient, editingBill]);

  const totalPreviousDues = useMemo(() => {
    return clientPendingBills.reduce((sum, b) => sum + Number(b.pending || 0), 0);
  }, [clientPendingBills]);

  // Helper: List of all primary categories (Salon Categories + Retail Products)
  const allBillingCategories = useMemo(() => {
    const list: { id: string; name: string; type: "service" | "product"; count: number }[] = [];

    (categories || []).forEach(cat => {
      let count = 0;
      (cat.subcategories || []).forEach((sub: any) => {
        count += (sub.items || []).length;
      });
      list.push({
        id: cat.id,
        name: cat.name,
        type: "service",
        count
      });
    });

    if (products.length > 0) {
      list.push({
        id: "PRODUCTS",
        name: "🛍️ Retail Products",
        type: "product",
        count: products.length
      });
    }

    return list;
  }, [categories, products]);

  // Helper: Flatten all subcategories and their services across all categories
  const allSubCategories = useMemo(() => {
    const list: { id: string; name: string; categoryId: string; categoryName: string; items: any[]; type: "service" | "product" }[] = [];

    (categories || []).forEach(cat => {
      (cat.subcategories || []).forEach((sub: any) => {
        const itemsList = (sub.items || []).map((itm: any) => ({
          id: itm.id,
          name: itm.name,
          price: Number(itm.price || 0),
          categoryId: cat.id,
          categoryName: cat.name,
          subCategoryId: sub.id,
          subCategoryName: sub.name,
          type: "service"
        }));
        list.push({
          id: sub.id,
          name: sub.name,
          categoryId: cat.id,
          categoryName: cat.name,
          items: itemsList,
          type: "service"
        });
      });
    });

    if (products.length > 0) {
      list.push({
        id: "PRODUCTS",
        name: "🛍️ Retail Products",
        categoryId: "PRODUCTS",
        categoryName: "Retail Products",
        items: products.map(p => ({
          id: p.id,
          name: p.name,
          price: Number(p.salePrice || p.mrp || 0),
          categoryId: "PRODUCTS",
          categoryName: "Retail Products",
          subCategoryId: "PRODUCTS",
          subCategoryName: "Retail Products",
          type: "product"
        })),
        type: "product"
      });
    }

    return list;
  }, [categories, products]);

  // Flat list of all catalog services & retail products for instant search suggestions
  const allFlatServices = useMemo(() => {
    const list: {
      id: string;
      name: string;
      price: number;
      categoryId: string;
      categoryName: string;
      subCategoryId: string;
      subCategoryName: string;
      type: "service" | "product";
    }[] = [];

    (allSubCategories || []).forEach(sub => {
      (sub.items || []).forEach(itm => {
        list.push({
          id: itm.id,
          name: itm.name,
          price: Number(itm.price || 0),
          categoryId: itm.categoryId || sub.categoryId || "",
          categoryName: itm.categoryName || sub.categoryName || "",
          subCategoryId: sub.id,
          subCategoryName: sub.name,
          type: itm.type || sub.type || "service"
        });
      });
    });

    return list;
  }, [allSubCategories]);

  const handleSelectServiceSuggestion = (idx: number, service: {
    id: string;
    name: string;
    price: number;
    categoryId?: string;
    subCategoryId: string;
    subCategoryName: string;
    categoryName: string;
    type: "service" | "product";
  }) => {
    const copy = [...items];
    copy[idx].categoryId = service.categoryId || copy[idx].categoryId;
    copy[idx].subCategoryId = service.subCategoryId;
    copy[idx].serviceId = service.id;
    copy[idx].name = service.name;
    copy[idx].price = service.price;
    copy[idx].type = service.type;
    setItems(copy);
    setActiveSuggestionIdx(null);
  };

  const handleSelectEditServiceSuggestion = (idx: number, service: {
    id: string;
    name: string;
    price: number;
    categoryId?: string;
    subCategoryId: string;
    subCategoryName: string;
    categoryName: string;
    type: "service" | "product";
  }) => {
    const copy = [...editItems];
    copy[idx].categoryId = service.categoryId || copy[idx].categoryId;
    copy[idx].subCategoryId = service.subCategoryId;
    copy[idx].serviceId = service.id;
    copy[idx].name = service.name;
    copy[idx].price = service.price;
    copy[idx].type = service.type;
    setEditItems(copy);
    setActiveEditSuggestionIdx(null);
  };

  const getServicesForCategory = (catId: string) => {
    if (!catId) return allFlatServices;
    return allFlatServices.filter(s => s.categoryId === catId);
  };

  // Line Item Handlers for POS Checkout
  const addItemRow = (catId = "") => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        categoryId: catId,
        subCategoryId: "",
        serviceId: "",
        name: "",
        price: 0,
        qty: 1,
        discountType: "%",
        discountValue: 0,
        providerId: "",
        providerName: "",
        type: catId === "PRODUCTS" ? "product" : "service"
      }
    ]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItemCategory = (idx: number, categoryId: string) => {
    const copy = [...items];
    copy[idx].categoryId = categoryId;
    copy[idx].subCategoryId = "";
    copy[idx].serviceId = "";
    copy[idx].name = "";
    copy[idx].price = 0;
    copy[idx].type = categoryId === "PRODUCTS" ? "product" : "service";
    setItems(copy);
  };

  const updateItemSubCategory = (idx: number, subCategoryId: string) => {
    const copy = [...items];
    copy[idx].subCategoryId = subCategoryId;
    copy[idx].serviceId = "";
    copy[idx].name = "";
    copy[idx].price = 0;
    copy[idx].type = subCategoryId === "PRODUCTS" ? "product" : "service";
    setItems(copy);
  };

  const getServicesForSubCategory = (subCatId: string) => {
    const sub = allSubCategories.find(s => s.id === subCatId);
    return sub ? sub.items : [];
  };

  const updateItemServiceSelect = (idx: number, serviceId: string) => {
    const copy = [...items];
    const catItems = copy[idx].categoryId ? getServicesForCategory(copy[idx].categoryId) : allFlatServices;
    const selected = catItems.find((i: any) => i.id === serviceId);
    if (selected) {
      copy[idx].serviceId = selected.id;
      copy[idx].name = selected.name;
      copy[idx].price = selected.price;
      copy[idx].categoryId = selected.categoryId || copy[idx].categoryId;
      copy[idx].subCategoryId = selected.subCategoryId || copy[idx].subCategoryId;
      copy[idx].type = selected.type;
    }
    setItems(copy);
  };

  const updateItemProvider = (idx: number, providerId: string) => {
    const p = staff.find(sp => sp.id === providerId);
    const copy = [...items];
    copy[idx].providerId = providerId;
    copy[idx].providerName = p?.name || "";
    setItems(copy);
  };

  const updateItemQty = (idx: number, qty: number) => {
    const copy = [...items];
    copy[idx].qty = Math.max(1, qty);
    setItems(copy);
  };

  const updateItemDiscountType = (idx: number, discountType: "%" | "₹") => {
    const copy = [...items];
    copy[idx].discountType = discountType;
    setItems(copy);
  };

  const updateItemDiscountValue = (idx: number, val: number) => {
    const copy = [...items];
    copy[idx].discountValue = Math.max(0, val);
    setItems(copy);
  };

  // Calculations for POS Checkout
  const grossSubtotal = useMemo(() => {
    return items.reduce((acc, row) => acc + (Number(row.price || 0) * Number(row.qty || 1)), 0);
  }, [items]);

  const itemDiscountsTotal = useMemo(() => {
    return items.reduce((acc, row) => {
      const gross = Number(row.price || 0) * Number(row.qty || 1);
      const val = Number(row.discountValue || 0);
      const disc = row.discountType === "%" ? (gross * val) / 100 : val;
      return acc + Math.min(gross, disc);
    }, 0);
  }, [items]);

  const netAfterItemDiscounts = Math.max(0, grossSubtotal - itemDiscountsTotal);

  const billDiscountAmount = useMemo(() => {
    const val = Number(overallDiscountValue || 0);
    if (overallDiscountType === "%") {
      return (netAfterItemDiscounts * val) / 100;
    }
    return val;
  }, [netAfterItemDiscounts, overallDiscountType, overallDiscountValue]);

  const totalAllDiscounts = itemDiscountsTotal + billDiscountAmount + couponDiscount;
  const taxableAmount = Math.max(0, netAfterItemDiscounts - billDiscountAmount - couponDiscount);
  const taxAmount = (taxableAmount * Number(taxRate || 0)) / 100;
  const currentBillGross = taxableAmount + taxAmount;

  // STRICT AUTO-CALCULATED FINANCIAL ADJUSTMENTS:
  const previousDuesToAdd = includePreviousDuesToggle ? totalPreviousDues : 0;
  const advanceToDeduct = deductAdvanceToggle ? totalUnbilledAdvance : 0;
  const walletToDeduct = useWalletToggle && selectedClient?.walletBalance
    ? Math.min(selectedClient.walletBalance, currentBillGross + previousDuesToAdd - advanceToDeduct)
    : 0;

  const netPayable = Math.max(
    0,
    currentBillGross + previousDuesToAdd - advanceToDeduct - walletToDeduct
  );

  // ─── Split Payment Handlers for POS Checkout ───
  useEffect(() => {
    if (payments.length === 1 && payments[0].amount === 0) {
      setPayments([{ mode: payments[0].mode || "Cash", amount: netPayable }]);
    }
  }, [netPayable, payments.length]);

  const addPaymentRow = () => {
    const currentPaid = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const remainder = Math.max(0, netPayable - currentPaid);
    setPayments([
      ...payments,
      { mode: "UPI (GPay)", amount: remainder }
    ]);
  };

  const updatePaymentMode = (idx: number, mode: string) => {
    const copy = [...payments];
    copy[idx].mode = mode;
    setPayments(copy);
  };

  const updatePaymentAmount = (idx: number, amount: number) => {
    const copy = [...payments];
    copy[idx].amount = Math.max(0, amount);
    setPayments(copy);
  };

  const removePaymentRow = (idx: number) => {
    if (payments.length <= 1) return;
    setPayments(payments.filter((_, i) => i !== idx));
  };

  const totalPaid = useMemo(() => {
    return payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  }, [payments]);

  const pendingAmount = Math.max(0, netPayable - totalPaid);

  const applyCoupon = () => {
    if (!couponCode.trim()) return;
    const found = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (!found) return alert("Invalid coupon code.");
    if (grossSubtotal < (found.minBill || 0)) {
      return alert(`Minimum bill amount of ₹${found.minBill} required for this coupon.`);
    }
    let disc = 0;
    if (found.discountType === "%") {
      disc = (grossSubtotal * found.discount) / 100;
      if (found.maxDiscount && disc > found.maxDiscount) disc = found.maxDiscount;
    } else {
      disc = found.discount;
    }
    setCouponDiscount(disc);
    alert(`Coupon ${found.code} applied! Discount: ₹${disc}`);
  };

  const handleCreateBill = async () => {
    // BLOCK FUTURE BILLING:
    if (billDate > today) {
      return alert(
        "Future billing is blocked. You cannot generate a bill for a future date. Future bookings must be scheduled as Appointments in the Appointments section."
      );
    }

    if (!clientName.trim() || !clientPhone.trim()) {
      return alert("Please enter client name and phone number.");
    }
    if (items.every(i => !i.name)) {
      return alert("Please add at least one valid service or product item.");
    }

    // MANDATORY STAFF VALIDATION: Every service item must have a staff member assigned
    const unassignedItem = items.find(i => i.name && (!i.providerId || !i.providerName));
    if (unassignedItem) {
      return alert(
        `Staff Allocation Required: Please select an assigned staff member for "${unassignedItem.name}". Every service must have an assigned staff member before the bill can be generated.`
      );
    }

    const billNo = `VIV-${new Date().getFullYear()}-${String(bills.length + 1).padStart(4, "0")}`;
    const currentTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    // Format items with their respective discounts and staff info for saving
    const formattedItems = items
      .filter(i => i.name)
      .map(i => {
        const itemGross = Number(i.price || 0) * Number(i.qty || 1);
        const itemDiscVal = Number(i.discountValue || 0);
        const itemDiscAmt = i.discountType === "%" ? (itemGross * itemDiscVal) / 100 : itemDiscVal;
        return {
          name: i.name,
          price: Number(i.price || 0),
          qty: Number(i.qty || 1),
          discount: itemDiscAmt,
          discountPct: i.discountType === "%" ? itemDiscVal : 0,
          providerId: i.providerId,
          providerName: i.providerName,
          type: i.type || "service",
          date: billDate,
          time: currentTime
        };
      });

    const billData = {
      billNo,
      clientId: selectedClient?.id || "",
      clientName: clientName.trim(),
      phone: clientPhone.trim(),
      email: clientEmail.trim() || null,
      date: billDate,
      time: currentTime,
      items: formattedItems,
      subtotal: grossSubtotal,
      discount: billDiscountAmount + couponDiscount,
      couponDiscount,
      taxRate,
      taxAmount,
      previousDues: previousDuesToAdd,
      advanceAdjust: advanceToDeduct,
      walletDeduct: walletToDeduct,
      total: currentBillGross + previousDuesToAdd,
      paid: totalPaid,
      pending: pendingAmount,
      payments,
      status: pendingAmount > 0 ? "Pending Dues" : "Settled"
    };

    try {
      const res = await fetch("/api/crm/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billData)
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedBill(data.data);
        loadData();
      } else {
        alert(data.error || "Failed to create invoice");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while creating bill");
    }
  };

  const resetForm = () => {
    setGeneratedBill(null);
    setSelectedClient(null);
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setBillDate(today);
    setItems([
      {
        id: "1",
        categoryId: "",
        subCategoryId: "",
        serviceId: "",
        name: "",
        price: 0,
        qty: 1,
        discountType: "%",
        discountValue: 0,
        providerId: "",
        providerName: "",
        type: "service"
      }
    ]);
    setOverallDiscountValue(0);
    setCouponCode("");
    setCouponDiscount(0);
    setTaxRate(0);
    setDeductAdvanceToggle(true);
    setIncludePreviousDuesToggle(false);
    setUseWalletToggle(false);
    setPayments([{ mode: "Cash", amount: 0 }]);
  };

  // ─── Settle Past Dues Today Handler ───
  const startSettleBillToday = (bill: any) => {
    setSettlingBill(bill);
    setSettlingAmount(Number(bill.pending || 0));
    setSettlingPaymentMode("Cash");
  };

  const handleConfirmSettleToday = async () => {
    if (!settlingBill) return;
    if (settlingAmount <= 0) return alert("Please enter a valid settlement payment amount.");

    try {
      setSettlingLoading(true);
      const currentTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
      const receiptNo = `VIV-${new Date().getFullYear()}-${String(bills.length + 1).padStart(4, "0")}`;

      const settlementBillData = {
        billNo: receiptNo,
        clientId: settlingBill.clientId || "",
        clientName: settlingBill.clientName,
        phone: settlingBill.phone,
        date: today, // Today's date
        time: currentTime,
        items: [
          {
            name: `Past Dues Payment (Ref Bill #${settlingBill.billNo} dated ${settlingBill.date})`,
            price: settlingAmount,
            qty: 1,
            discount: 0,
            discountPct: 0,
            providerName: "Front Desk Cashier",
            type: "service",
            date: today,
            time: currentTime
          }
        ],
        subtotal: settlingAmount,
        discount: 0,
        taxRate: 0,
        taxAmount: 0,
        previousDues: settlingAmount, // will auto-settle the past bill
        advanceAdjust: 0,
        walletDeduct: 0,
        total: settlingAmount,
        paid: settlingAmount,
        pending: 0,
        payments: [{ mode: settlingPaymentMode, amount: settlingAmount }],
        status: "Settled"
      };

      const res = await fetch("/api/crm/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settlementBillData)
      });
      const data = await res.json();
      if (data.success) {
        alert(`Past dues of ₹${settlingAmount} settled successfully on today's receipt #${receiptNo}!`);
        setSettlingBill(null);
        setGeneratedBill(data.data);
        loadData();
      } else {
        alert(data.error || "Failed to process settlement receipt");
      }
    } catch (err) {
      console.error(err);
      alert("Network error processing settlement");
    } finally {
      setSettlingLoading(false);
    }
  };

  // ─── Edit Invoice Functions (FULL PAGE MODE) ───
  const startEditBill = (bill: any) => {
    let parsedItems = bill.items || [];
    if (typeof parsedItems === "string") {
      try { parsedItems = JSON.parse(parsedItems); } catch { parsedItems = []; }
    }

    let parsedPayments = bill.payments || [];
    if (typeof parsedPayments === "string") {
      try { parsedPayments = JSON.parse(parsedPayments); } catch { parsedPayments = []; }
    }
    if (!Array.isArray(parsedPayments) || parsedPayments.length === 0) {
      parsedPayments = [{ mode: "Cash", amount: Number(bill.paid || 0) }];
    }

    setEditItems(parsedItems.map((item: any, idx: number) => {
      let matchedSubCatId = item.subCategoryId || "";
      if (!matchedSubCatId && item.name) {
        for (const sub of allSubCategories) {
          const found = sub.items.find(i => i.name.toLowerCase() === item.name.toLowerCase());
          if (found) {
            matchedSubCatId = sub.id;
            break;
          }
        }
      }
      return {
        id: item.id || `edit_item_${idx}`,
        subCategoryId: matchedSubCatId,
        serviceId: item.serviceId || "",
        name: item.name || "",
        price: Number(item.price || 0),
        qty: Number(item.qty || 1),
        discountType: item.discountPct > 0 ? "%" : "₹",
        discountValue: item.discountPct > 0 ? Number(item.discountPct) : Number(item.discount || 0),
        providerId: item.providerId || "",
        providerName: item.providerName || item.provider || "",
        type: item.type || "service"
      };
    }));

    const billDisc = Number(bill.discount || 0);
    setEditOverallDiscountType("₹");
    setEditOverallDiscountValue(billDisc);
    setEditIncludePreviousDues(Number(bill.previousDues || 0) > 0);
    setEditDeductAdvance(Number(bill.advanceAdjust || 0) > 0);
    setEditPayments(parsedPayments);

    setEditingBill({
      ...bill,
      clientName: bill.clientName || "",
      phone: bill.phone || "",
      date: bill.date || today,
      subtotal: Number(bill.subtotal || 0),
      taxRate: Number(bill.taxRate || 0),
      taxAmount: Number(bill.taxAmount || 0),
      previousDues: Number(bill.previousDues || 0),
      advanceAdjust: Number(bill.advanceAdjust || 0),
      total: Number(bill.total || 0),
      paid: Number(bill.paid || 0),
      pending: Number(bill.pending || 0),
      status: bill.status || "Settled"
    });
  };

  const addEditItemRow = (catId = "") => {
    setEditItems([
      ...editItems,
      {
        id: `edit_${Date.now()}`,
        categoryId: catId,
        subCategoryId: "",
        serviceId: "",
        name: "",
        price: 0,
        qty: 1,
        discountType: "%",
        discountValue: 0,
        providerId: "",
        providerName: "",
        type: catId === "PRODUCTS" ? "product" : "service"
      }
    ]);
  };

  const removeEditItemRow = (idx: number) => {
    if (editItems.length <= 1) return;
    setEditItems(editItems.filter((_, i) => i !== idx));
  };

  const updateEditItemCategory = (idx: number, categoryId: string) => {
    const copy = [...editItems];
    copy[idx].categoryId = categoryId;
    copy[idx].subCategoryId = "";
    copy[idx].serviceId = "";
    copy[idx].name = "";
    copy[idx].price = 0;
    copy[idx].type = categoryId === "PRODUCTS" ? "product" : "service";
    setEditItems(copy);
  };

  const updateEditItemSubCategory = (idx: number, subCategoryId: string) => {
    const copy = [...editItems];
    copy[idx].subCategoryId = subCategoryId;
    copy[idx].serviceId = "";
    copy[idx].name = "";
    copy[idx].price = 0;
    copy[idx].type = subCategoryId === "PRODUCTS" ? "product" : "service";
    setEditItems(copy);
  };

  const updateEditItemServiceSelect = (idx: number, serviceId: string) => {
    const copy = [...editItems];
    const catItems = copy[idx].categoryId ? getServicesForCategory(copy[idx].categoryId) : allFlatServices;
    const selected = catItems.find((i: any) => i.id === serviceId);
    if (selected) {
      copy[idx].serviceId = selected.id;
      copy[idx].name = selected.name;
      copy[idx].price = selected.price;
      copy[idx].categoryId = selected.categoryId || copy[idx].categoryId;
      copy[idx].subCategoryId = selected.subCategoryId || copy[idx].subCategoryId;
      copy[idx].type = selected.type;
    }
    setEditItems(copy);
  };

  // Recalculate Edit Totals
  const editGrossSubtotal = useMemo(() => {
    return editItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0);
  }, [editItems]);

  const editItemDiscountsTotal = useMemo(() => {
    return editItems.reduce((sum, item) => {
      const gross = Number(item.price || 0) * Number(item.qty || 1);
      const val = Number(item.discountValue || 0);
      const disc = item.discountType === "%" ? (gross * val) / 100 : val;
      return sum + Math.min(gross, disc);
    }, 0);
  }, [editItems]);

  const editNetAfterItemDiscounts = Math.max(0, editGrossSubtotal - editItemDiscountsTotal);

  const editOverallDiscountAmount = useMemo(() => {
    const val = Number(editOverallDiscountValue || 0);
    if (editOverallDiscountType === "%") {
      return (editNetAfterItemDiscounts * val) / 100;
    }
    return val;
  }, [editNetAfterItemDiscounts, editOverallDiscountType, editOverallDiscountValue]);

  const editTaxableAmount = Math.max(0, editNetAfterItemDiscounts - editOverallDiscountAmount);

  const editTaxAmount = useMemo(() => {
    if (!editingBill) return 0;
    return (editTaxableAmount * Number(editingBill.taxRate || 0)) / 100;
  }, [editTaxableAmount, editingBill?.taxRate]);

  const editPrevDuesAmt = editIncludePreviousDues ? Number(editingBill?.previousDues || totalPreviousDues) : 0;
  const editAdvanceDeductAmt = editDeductAdvance ? Number(editingBill?.advanceAdjust || totalUnbilledAdvance) : 0;

  const editGrandTotal = useMemo(() => {
    if (!editingBill) return 0;
    return editTaxableAmount + editTaxAmount + editPrevDuesAmt - editAdvanceDeductAmt;
  }, [editTaxableAmount, editTaxAmount, editPrevDuesAmt, editAdvanceDeductAmt]);

  // Edit Payment Handlers
  const addEditPaymentRow = () => {
    const currentPaid = editPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const remainder = Math.max(0, editGrandTotal - currentPaid);
    setEditPayments([
      ...editPayments,
      { mode: "UPI (GPay)", amount: remainder }
    ]);
  };

  const updateEditPaymentMode = (idx: number, mode: string) => {
    const copy = [...editPayments];
    copy[idx].mode = mode;
    setEditPayments(copy);
  };

  const updateEditPaymentAmount = (idx: number, amount: number) => {
    const copy = [...editPayments];
    copy[idx].amount = Math.max(0, amount);
    setEditPayments(copy);
  };

  const removeEditPaymentRow = (idx: number) => {
    if (editPayments.length <= 1) return;
    setEditPayments(editPayments.filter((_, i) => i !== idx));
  };

  const editTotalPaid = useMemo(() => {
    return editPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [editPayments]);

  const editPending = useMemo(() => {
    if (!editingBill) return 0;
    return Math.max(0, editGrandTotal - editTotalPaid);
  }, [editGrandTotal, editTotalPaid]);

  const handleSaveEditedBill = async () => {
    if (!editingBill) return;

    // BLOCK FUTURE DATE ON EDIT:
    if (editingBill.date > today) {
      return alert(
        "Cannot set invoice date to a future date. Only past or current dates are permitted for billing receipts."
      );
    }

    // MANDATORY STAFF VALIDATION on Edit:
    const unassignedEditItem = editItems.find(i => i.name && (!i.providerName || i.providerName.trim() === ""));
    if (unassignedEditItem) {
      return alert(
        `Staff Allocation Required: Please select an assigned staff member for "${unassignedEditItem.name}". Every service must have an assigned staff member before saving changes.`
      );
    }

    try {
      setEditSaving(true);

      const formattedEditItems = editItems
        .filter(i => i.name)
        .map(i => {
          const itemGross = Number(i.price || 0) * Number(i.qty || 1);
          const itemDiscVal = Number(i.discountValue || 0);
          const itemDiscAmt = i.discountType === "%" ? (itemGross * itemDiscVal) / 100 : itemDiscVal;
          return {
            name: i.name,
            price: Number(i.price || 0),
            qty: Number(i.qty || 1),
            discount: itemDiscAmt,
            discountPct: i.discountType === "%" ? itemDiscVal : 0,
            providerId: i.providerId,
            providerName: i.providerName,
            type: i.type || "service"
          };
        });

      const payload = {
        clientName: editingBill.clientName,
        phone: editingBill.phone,
        date: editingBill.date, // Retains or updates for that exact past date
        items: formattedEditItems,
        subtotal: editGrossSubtotal,
        discount: editOverallDiscountAmount,
        taxRate: Number(editingBill.taxRate || 0),
        taxAmount: editTaxAmount,
        previousDues: editPrevDuesAmt,
        advanceAdjust: editAdvanceDeductAmt,
        total: editGrandTotal,
        paid: editTotalPaid,
        pending: editPending,
        payments: editPayments,
        status: editPending > 0 ? "Pending Dues" : "Settled"
      };

      const res = await fetch(`/api/crm/bills/${editingBill.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const d = await res.json();
      if (d.success) {
        alert(`Receipt #${editingBill.billNo} updated successfully for date: ${editingBill.date}!`);
        setEditingBill(null);
        setActiveTab("invoices");
        loadData();
      } else {
        alert(d.error || "Failed to update receipt");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while updating bill");
    } finally {
      setEditSaving(false);
    }
  };

  // Delete Bill
  const handleDeleteBill = async () => {
    if (!deletingBill) return;
    try {
      const res = await fetch(`/api/crm/bills/${deletingBill.id}`, {
        method: "DELETE"
      });
      const d = await res.json();
      if (d.success) {
        setDeletingBill(null);
        loadData();
      } else {
        alert(d.error || "Failed to delete bill");
      }
    } catch (err) {
      console.error(err);
      alert("Network error deleting bill");
    }
  };

  // Filtered Invoices for History Ledger
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const matchesSearch =
        !invoiceSearch ||
        b.billNo.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        b.clientName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        (b.phone && b.phone.includes(invoiceSearch));
      const matchesDate = !invoiceDateFilter || b.date === invoiceDateFilter;
      const matchesStatus = !invoiceStatusFilter || b.status === invoiceStatusFilter;
      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [bills, invoiceSearch, invoiceDateFilter, invoiceStatusFilter]);

  // Ledger Summary Metrics
  const ledgerMetrics = useMemo(() => {
    const totalInvoiced = filteredBills.reduce((acc, b) => acc + Number(b.total || 0), 0);
    const totalPaid = filteredBills.reduce((acc, b) => acc + Number(b.paid || 0), 0);
    const totalPending = filteredBills.reduce((acc, b) => acc + Number(b.pending || 0), 0);
    return {
      count: filteredBills.length,
      totalInvoiced,
      totalPaid,
      totalPending,
    };
  }, [filteredBills]);

  const formatCurrency = (amount: number) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  // ══════════════════════════════════════════════════════════════════
  // IF IN FULL-PAGE EDIT MODE: RENDER DIRECTLY ON THE FULL PAGE
  // ══════════════════════════════════════════════════════════════════
  if (editingBill) {
    return (
      <div className="fade-in space-y-6 max-w-7xl mx-auto pb-12">
        {/* Full-Page Edit Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditingBill(null)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Ledger
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-700" />
                <span>Editing Invoice #{editingBill.billNo}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Past Date Editing: Updates the same invoice for date <strong className="text-amber-900">{editingBill.date}</strong> with revised services, calculations, and beauticians.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn-outline text-xs px-4 py-2 cursor-pointer"
              onClick={() => setEditingBill(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-gold text-xs px-6 py-2.5 font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              disabled={editSaving}
              onClick={handleSaveEditedBill}
            >
              {editSaving ? "Saving..." : "Save Updated Invoice"}
            </button>
          </div>
        </div>

        {/* 2-Column Full-Page Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Left: Client Info & Full Line Items Editor */}
          <div className="lg:col-span-8 space-y-6">
            {/* Client Info Card */}
            <div className="crm-card">
              <p className="section-title mb-3">Client &amp; Receipt Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="crm-label">Client Name *</label>
                  <input
                    className="crm-input text-xs font-bold"
                    value={editingBill.clientName}
                    onChange={(e) => setEditingBill({ ...editingBill, clientName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="crm-label">Phone Number *</label>
                  <input
                    className="crm-input text-xs font-bold"
                    value={editingBill.phone}
                    onChange={(e) => setEditingBill({ ...editingBill, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="crm-label flex items-center justify-between">
                    <span>Invoice Date *</span>
                  </label>
                  <input
                    type="date"
                    max={today}
                    className="crm-input text-xs font-semibold"
                    value={editingBill.date}
                    onChange={(e) => {
                      if (e.target.value > today) {
                        alert("Future billing is blocked. Invoice date cannot be set in the future.");
                        return;
                      }
                      setEditingBill({ ...editingBill, date: e.target.value });
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Line Items Card */}
            <div className="crm-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="section-title">Billed Line Items</p>
                  <p className="text-[11px] text-slate-500">
                    Add or edit services with category auto-pricing, <strong className="text-amber-900">mandatory staff assignment</strong>, and item discounts.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-outline text-xs py-1 px-3 flex items-center gap-1 cursor-pointer"
                    onClick={() => addEditItemRow("")}
                  >
                    <Plus size={13} /> Add Service
                  </button>
                  <button
                    type="button"
                    className="btn-outline text-xs py-1 px-3 flex items-center gap-1 cursor-pointer"
                    onClick={() => addEditItemRow("PRODUCTS")}
                  >
                    <ShoppingBag size={13} /> Add Product
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {editItems.map((itm, idx) => {
                  const availableServices = itm.categoryId ? getServicesForCategory(itm.categoryId) : allFlatServices;
                  const gross = Number(itm.price || 0) * Number(itm.qty || 1);
                  const disc = itm.discountType === "%"
                    ? (gross * Number(itm.discountValue || 0)) / 100
                    : Number(itm.discountValue || 0);
                  const net = Math.max(0, gross - disc);
                  const isStaffMissing = itm.name && !itm.providerName;

                  return (
                    <div
                      key={itm.id || idx}
                      className={`p-4 bg-slate-50 rounded-2xl border transition-all space-y-3 ${isStaffMissing ? 'border-amber-300 ring-1 ring-amber-300' : 'border-slate-200'
                        }`}
                    >
                      {/* Top: Category, Service & Staff */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        {/* 1. Category Selector */}
                        <div className="sm:col-span-4">
                          <label className="crm-label flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold flex items-center justify-center">1</span>
                            <span>Category</span>
                          </label>
                          <select
                            className="crm-select text-xs font-semibold"
                            value={itm.categoryId || ""}
                            onChange={(e) => updateEditItemCategory(idx, e.target.value)}
                          >
                            <option value="">-- All Categories --</option>
                            {allBillingCategories.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.name} {c.count ? `(${c.count})` : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 2. Searchable Service / Item Combobox */}
                        <div className="sm:col-span-4 relative">
                          <label className="crm-label flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold flex items-center justify-center">2</span>
                              <span>Select Service / Item</span>
                            </span>
                            <span className="text-[10px] text-[#8f6732] font-semibold flex items-center gap-1">
                              <Sparkles size={10} className="text-[#8f6732]" /> Search
                            </span>
                          </label>

                          <div className="relative">
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                              <Search size={13} />
                            </div>
                            <input
                              type="text"
                              className="crm-input text-xs font-medium pl-8 pr-16 text-stone-900 placeholder:text-stone-400 transition-all shadow-xs"
                              placeholder="Search or pick service..."
                              value={itm.name}
                              onFocus={() => setActiveEditSuggestionIdx(idx)}
                              onBlur={() => setTimeout(() => setActiveEditSuggestionIdx(null), 250)}
                              onChange={(e) => {
                                const copy = [...editItems];
                                copy[idx].name = e.target.value;
                                if (!e.target.value) {
                                  copy[idx].serviceId = "";
                                  copy[idx].price = 0;
                                }
                                setEditItems(copy);
                                setActiveEditSuggestionIdx(idx);
                              }}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              {itm.name ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const copy = [...editItems];
                                    copy[idx].name = "";
                                    copy[idx].serviceId = "";
                                    copy[idx].price = 0;
                                    setEditItems(copy);
                                  }}
                                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                                  title="Clear"
                                >
                                  <X size={12} />
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setActiveEditSuggestionIdx(activeEditSuggestionIdx === idx ? null : idx);
                                }}
                                className="text-slate-400 hover:text-amber-700 p-1 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                                title="Toggle List"
                              >
                                <ChevronDown size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Auto-suggestions Dropdown (Minimal luxury styling) */}
                          {activeEditSuggestionIdx === idx && (
                            (() => {
                              const query = (itm.name || "").toLowerCase().trim();
                              let matches: typeof allFlatServices = [];
                              if (query.length > 0) {
                                matches = allFlatServices
                                  .filter(s => {
                                    const matchesCat = !itm.categoryId || s.categoryId === itm.categoryId;
                                    const matchesQ = s.name.toLowerCase().includes(query) || s.categoryName.toLowerCase().includes(query) || s.subCategoryName.toLowerCase().includes(query);
                                    return matchesCat && matchesQ;
                                  })
                                  .slice(0, 15);
                              } else if (itm.categoryId) {
                                matches = allFlatServices
                                  .filter(s => s.categoryId === itm.categoryId)
                                  .slice(0, 25);
                              } else {
                                matches = allFlatServices.slice(0, 20);
                              }

                              if (matches.length === 0) {
                                return (
                                  <div className="absolute left-0 z-50 mt-1.5 w-full sm:w-[380px] bg-white rounded-2xl shadow-xl border border-stone-200 p-4 text-center text-xs text-stone-500">
                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-1.5 text-stone-400">
                                      <Search size={14} />
                                    </div>
                                    <p className="font-semibold text-stone-700">No services found</p>
                                    <p className="text-[11px] text-stone-400 mt-0.5">Try searching with a different keyword</p>
                                  </div>
                                );
                              }

                              return (
                                <div className="absolute left-0 z-50 mt-1.5 w-full sm:w-[420px] max-w-[95vw] bg-white/98 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-200/90 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                                  {/* Sleek Header */}
                                  <div className="px-3.5 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <Sparkles size={13} className="text-amber-600" />
                                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                        {query ? `Matching Services (${matches.length})` : "Available Services"}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      Auto-selects Category &amp; Price
                                    </span>
                                  </div>

                                  {/* Suggestion Item Rows */}
                                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-1">
                                    {matches.map((s) => {
                                      const isSelected = itm.serviceId === s.id;
                                      const isProduct = s.type === "product";

                                      return (
                                        <button
                                          key={`${s.id}_${s.subCategoryId}`}
                                          type="button"
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleSelectEditServiceSuggestion(idx, s);
                                          }}
                                          className={`w-full p-2.5 text-left rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer group ${isSelected
                                            ? "bg-amber-50/80 border-l-4 border-amber-600 shadow-2xs"
                                            : "hover:bg-slate-50 hover:border-l-4 hover:border-amber-500 border-l-4 border-transparent"
                                            }`}
                                        >
                                          {/* Icon & Title */}
                                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <div
                                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${isProduct
                                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                                : "bg-amber-50 text-amber-700 border border-amber-200/80"
                                                }`}
                                            >
                                              {isProduct ? <ShoppingBag size={14} /> : <Scissors size={14} />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="text-xs font-bold text-slate-900 group-hover:text-amber-900 truncate">
                                                {s.name}
                                              </p>
                                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/60 truncate max-w-[200px]">
                                                  {s.categoryName !== "Products" ? `${s.categoryName} › ${s.subCategoryName}` : s.subCategoryName}
                                                </span>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Price Tag */}
                                          <div className="shrink-0 text-right">
                                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-black shadow-xs group-hover:bg-amber-600 transition-colors">
                                              ₹{s.price.toLocaleString("en-IN")}
                                            </span>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Sleek Footer */}
                                  <div className="px-3 py-1.5 bg-slate-50/70 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                                    <span>Click to choose &amp; auto-fill</span>
                                    <span className="font-mono text-[9px]">ESC to close</span>
                                  </div>
                                </div>
                              );
                            })()
                          )}
                        </div>

                        <div className="sm:col-span-4">
                          <label className="crm-label flex items-center justify-between text-slate-900 font-bold">
                            <span className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-950 text-[10px] font-black flex items-center justify-center">3</span>
                              <span>Beautician</span>
                            </span>
                            <span className="text-[10px] text-rose-600 font-black uppercase tracking-wide bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60">* Required</span>
                          </label>
                          <select
                            className={`crm-select text-xs font-bold ${isStaffMissing ? 'border-rose-400 bg-rose-50/40 text-rose-900' : 'text-slate-800'
                              }`}
                            value={itm.providerName}
                            onChange={(e) => {
                              const staffObj = staff.find(st => st.name === e.target.value);
                              const copy = [...editItems];
                              copy[idx].providerName = e.target.value;
                              copy[idx].providerId = staffObj?.id || "";
                              setEditItems(copy);
                            }}
                          >
                            <option value="">-- Select Staff (Required) --</option>
                            {staff.map(st => <option key={st.id} value={st.name}>{st.name} ({st.type})</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Bottom: Item Name, Price, Qty, Item-Level Discount, Net Total - Fixed overlapping layout */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-2.5 border-t border-slate-200/80 text-xs">
                        {/* Custom Description / Title */}
                        <div className="flex-1 min-w-[200px]">
                          <input
                            className="crm-input text-xs font-medium"
                            placeholder="Item title / notes (optional)"
                            value={itm.name}
                            onChange={(e) => {
                              const copy = [...editItems];
                              copy[idx].name = e.target.value;
                              setEditItems(copy);
                            }}
                          />
                        </div>

                        {/* Rate */}
                        <div className="w-28 relative shrink-0">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">₹</span>
                          <input
                            type="number"
                            className="crm-input text-xs font-bold pl-6 pr-2 text-right"
                            placeholder="Rate"
                            value={itm.price}
                            onChange={(e) => {
                              const copy = [...editItems];
                              copy[idx].price = Number(e.target.value);
                              setEditItems(copy);
                            }}
                          />
                        </div>

                        {/* Qty */}
                        <div className="w-16 shrink-0">
                          <input
                            type="number"
                            min="1"
                            className="crm-input text-xs font-bold text-center px-1 py-1.5"
                            placeholder="Qty"
                            value={itm.qty}
                            onChange={(e) => {
                              const copy = [...editItems];
                              copy[idx].qty = Math.max(1, Number(e.target.value));
                              setEditItems(copy);
                            }}
                          />
                        </div>

                        {/* Item-Level Discount */}
                        <div className="w-40 shrink-0 flex items-center gap-1">
                          <div className="flex rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-50">
                            <button
                              type="button"
                              className={`px-2 py-1 text-[10px] font-bold transition-colors ${itm.discountType === '%' ? 'bg-amber-200 text-amber-950 font-black' : 'text-slate-600 hover:bg-slate-100'}`}
                              onClick={() => {
                                const copy = [...editItems];
                                copy[idx].discountType = "%";
                                setEditItems(copy);
                              }}
                            >
                              %
                            </button>
                            <button
                              type="button"
                              className={`px-2 py-1 text-[10px] font-bold transition-colors ${itm.discountType === '₹' ? 'bg-amber-200 text-amber-950 font-black' : 'text-slate-600 hover:bg-slate-100'}`}
                              onClick={() => {
                                const copy = [...editItems];
                                copy[idx].discountType = "₹";
                                setEditItems(copy);
                              }}
                            >
                              ₹
                            </button>
                          </div>
                          <input
                            type="number"
                            min="0"
                            className="crm-input text-xs py-1.5 px-2 text-right flex-1 min-w-0 font-medium"
                            placeholder="Discount"
                            value={itm.discountValue || ""}
                            onChange={(e) => {
                              const copy = [...editItems];
                              copy[idx].discountValue = Number(e.target.value);
                              setEditItems(copy);
                            }}
                          />
                        </div>

                        {/* Line Net Total */}
                        <div className="w-24 shrink-0 text-right">
                          <span className="text-[10px] text-slate-400 block -mb-0.5">Net Total</span>
                          <span className="font-bold text-slate-900 text-xs">
                            {(() => {
                              const gross = Number(itm.price || 0) * Number(itm.qty || 1);
                              const disc = itm.discountType === "%" ? (gross * Number(itm.discountValue || 0)) / 100 : Number(itm.discountValue || 0);
                              return formatCurrency(Math.max(0, gross - disc));
                            })()}
                          </span>
                        </div>

                        {/* Delete Row */}
                        <div className="shrink-0">
                          {editItems.length > 1 ? (
                            <button
                              type="button"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              onClick={() => setEditItems(editItems.filter((_, i) => i !== idx))}
                              title="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : (
                            <div className="w-7" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Summary & Checkout Panel */}
          <div className="lg:col-span-4">
            <div className="crm-card sticky top-6 space-y-4">
              <p className="section-title">Updated Financial Breakdown</p>

              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Gross Items Subtotal:</span>
                <span className="font-bold text-slate-800">{formatCurrency(editGrossSubtotal)}</span>
              </div>

              {editItemDiscountsTotal > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold text-xs">
                  <span>Item-Level Discounts:</span>
                  <span>-{formatCurrency(editItemDiscountsTotal)}</span>
                </div>
              )}

              {/* Overall Bill Discount (% or ₹) */}
              <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="crm-label">Overall Bill Discount</label>
                  {editOverallDiscountAmount > 0 && (
                    <span className="text-emerald-700 font-bold text-[11px]">-{formatCurrency(editOverallDiscountAmount)}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white">
                    <button
                      type="button"
                      className={`px-2.5 py-1 text-xs font-bold ${editOverallDiscountType === '%' ? 'bg-amber-100 text-amber-900' : 'text-slate-600'}`}
                      onClick={() => setEditOverallDiscountType('%')}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      className={`px-2.5 py-1 text-xs font-bold ${editOverallDiscountType === '₹' ? 'bg-amber-100 text-amber-900' : 'text-slate-600'}`}
                      onClick={() => setEditOverallDiscountType('₹')}
                    >
                      ₹
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    className="crm-input text-xs flex-1"
                    placeholder={`Overall Discount (${editOverallDiscountType})`}
                    value={editOverallDiscountValue || ""}
                    onChange={(e) => setEditOverallDiscountValue(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* GST Tax */}
              <div>
                <label className="crm-label">GST Tax (%)</label>
                <select
                  className="crm-select text-xs"
                  value={editingBill.taxRate}
                  onChange={(e) => setEditingBill({ ...editingBill, taxRate: Number(e.target.value) })}
                >
                  <option value="0">0% (None)</option>
                  <option value="5">5% GST</option>
                  <option value="12">12% GST</option>
                  <option value="18">18% GST</option>
                </select>
              </div>

              {/* ── Strict Financial Adjustments (Toggle-Only) ── */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                <p className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Client Balance Adjustments</span>
                  <span className="text-[10px] text-slate-500 font-normal">Calculated by System</span>
                </p>

                {/* Advance Adjustment Toggle */}
                {(totalUnbilledAdvance > 0 || Number(editingBill.advanceAdjust || 0) > 0) && (
                  <label className="flex items-center justify-between p-2 bg-indigo-50/70 border border-indigo-200 rounded-xl cursor-pointer">
                    <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={editDeductAdvance}
                        onChange={(e) => setEditDeductAdvance(e.target.checked)}
                      />
                      <span>Deduct Unbilled Advance:</span>
                    </span>
                    <span className="font-black text-indigo-700 text-xs">
                      -{formatCurrency(editingBill.advanceAdjust || totalUnbilledAdvance)}
                    </span>
                  </label>
                )}

                {/* Previous Dues Toggle */}
                {(totalPreviousDues > 0 || Number(editingBill.previousDues || 0) > 0) && (
                  <label className="flex items-center justify-between p-2 bg-rose-50/70 border border-rose-200 rounded-xl cursor-pointer">
                    <span className="text-[11px] font-bold text-rose-950 flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={editIncludePreviousDues}
                        onChange={(e) => setEditIncludePreviousDues(e.target.checked)}
                      />
                      <span>Add Previous Unpaid Dues:</span>
                    </span>
                    <span className="font-black text-rose-700 text-xs">
                      +{formatCurrency(editingBill.previousDues || totalPreviousDues)}
                    </span>
                  </label>
                )}

                {!totalUnbilledAdvance && !Number(editingBill.advanceAdjust || 0) && !totalPreviousDues && !Number(editingBill.previousDues || 0) && (
                  <p className="text-[11px] text-slate-500 italic py-1">
                    ✓ No unbilled advances or past dues on record for this client.
                  </p>
                )}
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center text-sm font-black text-amber-900">
                  <span>Grand Total:</span>
                  <span className="text-xl">{formatCurrency(editGrandTotal)}</span>
                </div>
              </div>

              {/* ── Split Payments Collection in Edit ── */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="crm-label text-slate-900 font-bold">Split Payments Collection</label>
                  <button
                    type="button"
                    className="text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/80 cursor-pointer flex items-center gap-1"
                    onClick={addEditPaymentRow}
                  >
                    <Plus size={11} /> Add Split Mode
                  </button>
                </div>

                <div className="space-y-2">
                  {editPayments.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <select
                        className="crm-select text-xs font-bold flex-1"
                        value={p.mode}
                        onChange={(e) => updateEditPaymentMode(idx, e.target.value)}
                      >
                        {paymentModeOptions.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>

                      <div className="relative w-28">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                        <input
                          type="number"
                          className="crm-input text-xs font-bold pl-5 text-right"
                          placeholder="Amount"
                          value={p.amount}
                          onChange={(e) => updateEditPaymentAmount(idx, Number(e.target.value))}
                        />
                      </div>

                      {editPayments.length > 1 && (
                        <button
                          type="button"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                          onClick={() => removeEditPaymentRow(idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Total Collected:</span>
                  <span className="font-black text-emerald-800 text-sm">{formatCurrency(editTotalPaid)}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Pending Balance:</span>
                  <span className={`font-black text-sm ${editPending > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {formatCurrency(editPending)}
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  className="btn-gold w-full py-3 text-sm font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  disabled={editSaving}
                  onClick={handleSaveEditedBill}
                >
                  {editSaving ? "Saving..." : "Save Updated Invoice"}
                </button>
                <button
                  type="button"
                  className="btn-outline w-full py-2 text-xs cursor-pointer"
                  onClick={() => setEditingBill(null)}
                >
                  Cancel / Return to Ledger
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // DEFAULT BILLING VIEW (POS BILLING / INVOICES HISTORY LEDGER)
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="fade-in space-y-6">
      {/* Top Title Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">
            Billing &amp; POS Management
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Point-of-sale checkout with custom split payments, past dues settlement, and strict future billing protection.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="crm-card py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 animate-pulse">
            Fetching billing records, client directory, and service catalog...
          </p>
        </div>
      ) : (
        <>
          {/* ─── IN-PAGE EXPANDABLE: SETTLE PAST DUES TODAY FORM ─── */}
          {settlingBill && (
            <div className="crm-card border-2 border-emerald-400 bg-gradient-to-br from-emerald-50/50 via-white to-white space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-700" />
                    <span>Settle Past Unpaid Dues for Today: {today}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generates a new payment invoice for <strong>Today ({today})</strong> and automatically clears the pending dues on Bill #{settlingBill.billNo}.
                  </p>
                </div>
                <button
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  onClick={() => setSettlingBill(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 text-xs">
                <div>
                  <label className="crm-label">Client Name</label>
                  <input className="crm-input text-xs font-bold bg-slate-50" readOnly value={settlingBill.clientName} />
                </div>
                <div>
                  <label className="crm-label">Reference Bill &amp; Date</label>
                  <input className="crm-input text-xs font-mono font-bold bg-slate-50" readOnly value={`#${settlingBill.billNo} (${settlingBill.date})`} />
                </div>
                <div>
                  <label className="crm-label">Payment Mode</label>
                  <select
                    className="crm-select text-xs font-bold"
                    value={settlingPaymentMode}
                    onChange={(e) => setSettlingPaymentMode(e.target.value)}
                  >
                    {paymentModeOptions.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="crm-label">Amount Paying Today (₹)</label>
                  <input
                    type="number"
                    max={settlingBill.pending}
                    className="crm-input text-xs font-black text-emerald-800"
                    value={settlingAmount}
                    onChange={(e) => setSettlingAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button className="btn-outline text-xs px-4 cursor-pointer" onClick={() => setSettlingBill(null)}>
                  Cancel
                </button>
                <button
                  className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  disabled={settlingLoading}
                  onClick={handleConfirmSettleToday}
                >
                  {settlingLoading ? "Processing..." : `Generate Today's Receipt (₹${settlingAmount}) & Settle Dues`}
                </button>
              </div>
            </div>
          )}

          {/* ─── IN-PAGE CARD: GENERATED BILL RECEIPT PREVIEW (NO POPUP) ─── */}
          {generatedBill && (
            <div className="crm-card border-2 border-amber-400 bg-gradient-to-br from-amber-50/60 via-white to-white space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Tax Invoice #{generatedBill.billNo} Generated Successfully!
                    </h3>
                    <p className="text-xs text-slate-500">
                      Date: <strong className="text-slate-800">{generatedBill.date}</strong> · Client: <strong className="text-slate-800">{generatedBill.clientName}</strong> ({generatedBill.phone})
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                  <button
                    type="button"
                    disabled={sendingWhatsapp}
                    onClick={handleSendInvoiceWhatsApp}
                    className="px-3.5 py-2 rounded-xl bg-[#25d366]/15 hover:bg-[#25d366]/25 text-[#128c7e] border border-[#25d366]/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all disabled:opacity-50"
                    title="Send invoice receipt via Official WhatsApp Cloud API"
                  >
                    <MessageSquare size={13} className="text-[#25d366]" />
                    <span>{sendingWhatsapp ? "Sending..." : "Send Official WhatsApp"}</span>
                  </button>
                  {whatsappSentStatus && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${whatsappSentStatus.startsWith("✓") ? "bg-[#eaf5ee] text-[#2d5a42] border border-[#cbe4d4]" : "bg-[#faf3f3] text-[#873e3e] border border-[#edd4d4]"}`}>
                      {whatsappSentStatus}
                    </span>
                  )}
                  <Link
                    href={`/admin/billing/invoice/${generatedBill.id || generatedBill.billNo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold text-xs px-5 py-2 font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Printer size={13} /> Print Full Receipt
                  </Link>
                  <button
                    className="btn-outline text-xs px-4 py-2 cursor-pointer"
                    onClick={resetForm}
                  >
                    Done / Start New Bill
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">Items Billed:</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {Array.isArray(generatedBill.items) ? `${generatedBill.items.length} items` : '1 item'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Grand Total:</span>
                  <p className="font-black text-slate-900 mt-0.5">{formatCurrency(generatedBill.total)}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Amount Paid:</span>
                  <p className="font-black text-emerald-700 mt-0.5">{formatCurrency(generatedBill.paid)}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Payment Status:</span>
                  <p className={`font-bold mt-0.5 ${generatedBill.pending > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {generatedBill.pending > 0 ? `Pending Due: ${formatCurrency(generatedBill.pending)}` : 'Fully Settled ✓'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── IN-PAGE CARD: DELETE INVOICE CONFIRMATION (NO POPUP) ─── */}
          {deletingBill && (
            <div className="crm-card border-2 border-rose-300 bg-rose-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Confirm Delete Invoice #{deletingBill.billNo}?</span>
                </h4>
                <button className="text-slate-400 hover:text-slate-600" onClick={() => setDeletingBill(null)}>
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-slate-600">
                Are you sure you want to permanently delete receipt <strong>#{deletingBill.billNo}</strong> created for <strong>{deletingBill.clientName}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2.5 pt-2 border-t border-rose-200">
                <button className="btn-outline text-xs px-3 py-1.5 cursor-pointer" onClick={() => setDeletingBill(null)}>
                  Cancel
                </button>
                <button
                  className="btn-danger text-xs px-4 py-1.5 font-bold cursor-pointer"
                  onClick={handleDeleteBill}
                >
                  Permanently Delete
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="crm-tabs">
            <button
              className={`tab-btn ${activeTab === 'pos' ? 'active' : ''}`}
              onClick={() => setActiveTab('pos')}
            >
              🧾 New Invoice / POS Checkout
            </button>
            <button
              className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
              onClick={() => setActiveTab('invoices')}
            >
              📜 Invoices History Ledger ({bills.length})
            </button>
          </div>

          {/* TAB 1: POS BILLING */}
          {activeTab === "pos" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Left: Client Info & Line Items */}
              <div className="lg:col-span-8 space-y-6">
                {/* Client Search / Input Card */}
                <div className="crm-card space-y-4">
                  <p className="section-title">Client &amp; Billing Information</p>

                  {/* Autocomplete Search */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className="crm-input pl-9 text-xs"
                      placeholder="Search registered client by name or phone..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                    />
                    {clientSearch && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                        {clients
                          .filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.phone.includes(clientSearch))
                          .map(c => (
                            <div
                              key={c.id}
                              onClick={() => selectClient(c)}
                              className="p-2.5 hover:bg-amber-50/60 border-b border-slate-100 last:border-0 cursor-pointer flex justify-between items-center text-xs"
                            >
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="font-bold text-slate-800">{c.name}</p>
                                  {c.membershipName && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black shadow-2xs">
                                      <Award size={10} className="text-amber-700" /> {c.membershipName}
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-400 text-[11px]">{c.phone}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-amber-800 font-bold">{c.points} pts</p>
                                <p className="text-emerald-700 font-semibold">{formatCurrency(c.walletBalance)}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="crm-label">Contact Phone *</label>
                      <input
                        className="crm-input text-xs font-bold"
                        placeholder="10-digit mobile"
                        value={clientPhone}
                        onChange={(e) => {
                          setClientPhone(e.target.value);
                          const found = clients.find(c => c.phone === e.target.value);
                          if (found) selectClient(found);
                        }}
                      />
                    </div>
                    <div>
                      <label className="crm-label flex items-center justify-between gap-1 flex-wrap">
                        <span>Client Name *</span>
                        {selectedClient?.membershipName ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#faf6ee] border border-[#ecdcc4] text-[#7a5426] text-[10.5px] font-bold shadow-xs">
                            <Award size={11} className="text-[#9a733e]" />
                            <span>VIP: {selectedClient.membershipName}</span>
                            <CheckCircle2 size={11} className="text-[#2d5a42]" />
                          </span>
                        ) : selectedClient ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-500 text-[10px] font-medium">
                            No Membership Card
                          </span>
                        ) : null}
                      </label>
                      <input
                        className="crm-input text-xs font-bold"
                        placeholder="Full name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="crm-label">Email (Optional)</label>
                      <input
                        className="crm-input text-xs"
                        placeholder="client@email.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="crm-label flex items-center justify-between">
                        <span>Billing Date *</span>
                      </label>
                      <input
                        type="date"
                        max={today}
                        className="crm-input text-xs font-bold"
                        value={billDate}
                        onChange={(e) => {
                          if (e.target.value > today) {
                            alert("Future billing is blocked. You cannot generate a bill for a future date. Future bookings must be scheduled as Appointments.");
                            return;
                          }
                          setBillDate(e.target.value);
                        }}
                      />
                    </div>
                  </div>

                  {/* ─── CLIENT FINANCIAL BALANCE & ADVANCE / PAST DUES SUMMARY BAR ─── */}
                  {(totalUnbilledAdvance > 0 || totalPreviousDues > 0 || (selectedClient && selectedClient.walletBalance > 0)) ? (
                    <div className="p-4 bg-gradient-to-r from-amber-50/90 via-slate-50 to-emerald-50/70 border border-amber-200/90 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <p className="font-black text-slate-900 flex items-center gap-1.5">
                          <History className="w-4 h-4 text-amber-700" />
                          <span>Client Account Ledger &amp; Unbilled Balance</span>
                        </p>
                        <span className="text-[11px] text-slate-500 font-semibold">Automatic System Calculation</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {/* 1. Unbilled Appointment Advance Deposit */}
                        <div className={`p-3 bg-white rounded-xl border space-y-1.5 shadow-xs transition-all ${totalUnbilledAdvance > 0 ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-slate-200'
                          }`}>
                          <div className="flex justify-between items-center">
                            <span className="text-indigo-950 font-bold flex items-center gap-1">
                              <Clock size={12} className="text-indigo-700" /> Unbilled Advance
                            </span>
                            <span className="font-black text-indigo-800 text-sm">{formatCurrency(totalUnbilledAdvance)}</span>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {clientAppointmentsWithAdvance.length > 0 ? `${clientAppointmentsWithAdvance.length} unbilled booking(s)` : 'No active advance'}
                          </p>
                          {totalUnbilledAdvance > 0 && (
                            <label className="flex items-center justify-between pt-1 border-t border-slate-100 cursor-pointer">
                              <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  checked={deductAdvanceToggle}
                                  onChange={(e) => setDeductAdvanceToggle(e.target.checked)}
                                />
                                <span>Deduct on this bill</span>
                              </span>
                              {deductAdvanceToggle && (
                                <span className="text-[11px] font-black text-indigo-700">-{formatCurrency(totalUnbilledAdvance)}</span>
                              )}
                            </label>
                          )}
                        </div>

                        {/* 2. Previous Unpaid Dues */}
                        <div className={`p-3 bg-white rounded-xl border space-y-1.5 shadow-xs transition-all ${totalPreviousDues > 0 ? 'border-rose-300 ring-1 ring-rose-100' : 'border-slate-200'
                          }`}>
                          <div className="flex justify-between items-center">
                            <span className="text-rose-950 font-bold flex items-center gap-1">
                              <AlertCircle size={12} className="text-rose-700" /> Past Debt / Dues
                            </span>
                            <span className="font-black text-rose-800 text-sm">{formatCurrency(totalPreviousDues)}</span>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {clientPendingBills.length > 0 ? `${clientPendingBills.length} past unpaid bill(s)` : 'Zero dues'}
                          </p>
                          {totalPreviousDues > 0 && (
                            <label className="flex items-center justify-between pt-1 border-t border-slate-100 cursor-pointer">
                              <span className="text-[11px] font-bold text-rose-900 flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  checked={includePreviousDuesToggle}
                                  onChange={(e) => setIncludePreviousDuesToggle(e.target.checked)}
                                />
                                <span>Add to this bill</span>
                              </span>
                              {includePreviousDuesToggle && (
                                <span className="text-[11px] font-black text-rose-700">+{formatCurrency(totalPreviousDues)}</span>
                              )}
                            </label>
                          )}
                        </div>

                        {/* 3. Prepaid Wallet Balance */}
                        <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1.5 shadow-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-emerald-950 font-bold flex items-center gap-1">
                              <Wallet size={12} className="text-emerald-700" /> Prepaid Wallet
                            </span>
                            <span className="font-black text-emerald-800 text-sm">
                              {formatCurrency(selectedClient?.walletBalance || 0)}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">Available credits</p>
                          {selectedClient && selectedClient.walletBalance > 0 && (
                            <label className="flex items-center justify-between pt-1 border-t border-slate-100 cursor-pointer">
                              <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  checked={useWalletToggle}
                                  onChange={(e) => setUseWalletToggle(e.target.checked)}
                                />
                                <span>Redeem wallet</span>
                              </span>
                              {useWalletToggle && (
                                <span className="text-[11px] font-black text-emerald-700">
                                  -{formatCurrency(walletToDeduct)}
                                </span>
                              )}
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : clientPhone.trim() ? (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>No unbilled advances or past debt on record for this client.</span>
                    </div>
                  ) : null}
                </div>

                {/* Line Items Card with Category & Subcategory Selectors */}
                <div className="crm-card space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="section-title">Billed Services &amp; Products</p>
                      <p className="text-[11px] text-slate-500">
                        Select category &amp; service, <strong className="text-amber-900">assign beautician (Mandatory)</strong>, and apply line discounts.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-outline text-xs py-1 px-2.5 cursor-pointer" onClick={() => addItemRow("")}>
                        <Plus size={12} /> Add Service
                      </button>
                      <button className="btn-outline text-xs py-1 px-2.5 cursor-pointer" onClick={() => addItemRow("PRODUCTS")}>
                        <ShoppingBag size={12} /> Add Product
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {items.map((row, idx) => {
                      const availableServices = row.categoryId ? getServicesForCategory(row.categoryId) : allFlatServices;
                      const lineGross = Number(row.price || 0) * Number(row.qty || 1);
                      const lineDisc = row.discountType === "%"
                        ? (lineGross * Number(row.discountValue || 0)) / 100
                        : Number(row.discountValue || 0);
                      const lineNet = Math.max(0, lineGross - lineDisc);
                      const isStaffMissing = row.name && !row.providerId;

                      return (
                        <div
                          key={row.id || idx}
                          className={`p-3.5 bg-slate-50 rounded-2xl border transition-all space-y-2.5 ${isStaffMissing ? 'border-amber-300 ring-1 ring-amber-300' : 'border-slate-200'
                            }`}
                        >
                          {/* Top Row: Category Selection & Service Dropdown & Staff */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                            {/* 1. Category Selector */}
                            <div className="sm:col-span-4">
                              <label className="crm-label flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold flex items-center justify-center">1</span>
                                <span>Category</span>
                              </label>
                              <select
                                className="crm-select text-xs font-semibold"
                                value={row.categoryId || ""}
                                onChange={(e) => updateItemCategory(idx, e.target.value)}
                              >
                                <option value="">-- All Categories --</option>
                                {allBillingCategories.map(c => (
                                  <option key={c.id} value={c.id}>
                                    {c.name} {c.count ? `(${c.count})` : ""}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* 2. Searchable Service / Item Combobox */}
                            <div className="sm:col-span-4 relative">
                              <label className="crm-label flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold flex items-center justify-center">2</span>
                                  <span>Select Service / Item</span>
                                </span>
                                <span className="text-[10px] text-[#8f6732] font-semibold flex items-center gap-1">
                                  <Sparkles size={10} className="text-[#8f6732]" /> Search
                                </span>
                              </label>

                              <div className="relative">
                                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                                  <Search size={13} />
                                </div>
                                <input
                                  type="text"
                                  className="crm-input text-xs font-medium pl-8 pr-16 text-stone-900 placeholder:text-stone-400 transition-all shadow-xs"
                                  placeholder="Search or select service..."
                                  value={row.name}
                                  onFocus={() => setActiveSuggestionIdx(idx)}
                                  onBlur={() => setTimeout(() => setActiveSuggestionIdx(null), 250)}
                                  onChange={(e) => {
                                    const copy = [...items];
                                    copy[idx].name = e.target.value;
                                    if (!e.target.value) {
                                      copy[idx].serviceId = "";
                                      copy[idx].price = 0;
                                    }
                                    setItems(copy);
                                    setActiveSuggestionIdx(idx);
                                  }}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                  {row.name ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const copy = [...items];
                                        copy[idx].name = "";
                                        copy[idx].serviceId = "";
                                        copy[idx].price = 0;
                                        setItems(copy);
                                      }}
                                      className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                                      title="Clear"
                                    >
                                      <X size={12} />
                                    </button>
                                  ) : null}
                                  <button
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setActiveSuggestionIdx(activeSuggestionIdx === idx ? null : idx);
                                    }}
                                    className="text-slate-400 hover:text-amber-700 p-1 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                                    title="Toggle List"
                                  >
                                    <ChevronDown size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Auto-suggestions Dropdown (Minimal luxury styling) */}
                              {activeSuggestionIdx === idx && (
                                (() => {
                                  const query = (row.name || "").toLowerCase().trim();
                                  let matches: typeof allFlatServices = [];
                                  if (query.length > 0) {
                                    matches = allFlatServices
                                      .filter(s => {
                                        const matchesCat = !row.categoryId || s.categoryId === row.categoryId;
                                        const matchesQ = s.name.toLowerCase().includes(query) || s.categoryName.toLowerCase().includes(query) || s.subCategoryName.toLowerCase().includes(query);
                                        return matchesCat && matchesQ;
                                      })
                                      .slice(0, 15);
                                  } else if (row.categoryId) {
                                    matches = allFlatServices
                                      .filter(s => s.categoryId === row.categoryId)
                                      .slice(0, 25);
                                  } else {
                                    matches = allFlatServices.slice(0, 20);
                                  }

                                  if (matches.length === 0) {
                                    return (
                                      <div className="absolute left-0 z-50 mt-1.5 w-full sm:w-[380px] bg-white rounded-2xl shadow-xl border border-stone-200 p-4 text-center text-xs text-stone-500">
                                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-1.5 text-stone-400">
                                          <Search size={14} />
                                        </div>
                                        <p className="font-semibold text-stone-700">No services found</p>
                                        <p className="text-[11px] text-stone-400 mt-0.5">Try searching with a different keyword</p>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div className="absolute left-0 z-50 mt-1.5 w-full sm:w-[420px] max-w-[95vw] bg-white/98 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-200/90 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                                      {/* Sleek Header */}
                                      <div className="px-3.5 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                          <Sparkles size={13} className="text-amber-600" />
                                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                            {query ? `Matching Services (${matches.length})` : "Available Services"}
                                          </span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                          Auto-selects Category &amp; Price
                                        </span>
                                      </div>

                                      {/* Suggestion Item Rows */}
                                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-1">
                                        {matches.map((s) => {
                                          const isSelected = row.serviceId === s.id;
                                          const isProduct = s.type === "product";

                                          return (
                                            <button
                                              key={`${s.id}_${s.subCategoryId}`}
                                              type="button"
                                              onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleSelectServiceSuggestion(idx, s);
                                              }}
                                              className={`w-full p-2.5 text-left rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer group ${isSelected
                                                ? "bg-amber-50/80 border-l-4 border-amber-600 shadow-2xs"
                                                : "hover:bg-slate-50 hover:border-l-4 hover:border-amber-500 border-l-4 border-transparent"
                                                }`}
                                            >
                                              {/* Icon & Title */}
                                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                <div
                                                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${isProduct
                                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                                    : "bg-amber-50 text-amber-700 border border-amber-200/80"
                                                    }`}
                                                >
                                                  {isProduct ? <ShoppingBag size={14} /> : <Scissors size={14} />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                  <p className="text-xs font-bold text-slate-900 group-hover:text-amber-900 truncate">
                                                    {s.name}
                                                  </p>
                                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                    <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/60 truncate max-w-[200px]">
                                                      {s.categoryName !== "Products" ? `${s.categoryName} › ${s.subCategoryName}` : s.subCategoryName}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Price Tag */}
                                              <div className="shrink-0 text-right">
                                                <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-black shadow-xs group-hover:bg-amber-600 transition-colors">
                                                  ₹{s.price.toLocaleString("en-IN")}
                                                </span>
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>

                                      {/* Sleek Footer */}
                                      <div className="px-3 py-1.5 bg-slate-50/70 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                                        <span>Click to choose &amp; auto-fill</span>
                                        <span className="font-mono text-[9px]">ESC to close</span>
                                      </div>
                                    </div>
                                  );
                                })()
                              )}
                            </div>

                            {/* 3. Assigned Staff (MANDATORY) */}
                            <div className="sm:col-span-4">
                              <label className="crm-label flex items-center justify-between text-slate-900 font-bold">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-950 text-[10px] font-black flex items-center justify-center">3</span>
                                  <span>Staff / Beautician *</span>
                                </span>
                              </label>
                              <select
                                className={`crm-select text-xs font-bold ${isStaffMissing ? 'border-rose-400 bg-rose-50/40 text-rose-900' : 'text-slate-800'
                                  }`}
                                value={row.providerId}
                                onChange={(e) => updateItemProvider(idx, e.target.value)}
                              >
                                <option value="">-- Select Staff (Required) --</option>
                                {staff.map(st => <option key={st.id} value={st.id}>{st.name} ({st.type})</option>)}
                              </select>
                            </div>
                          </div>

                          {/* Bottom Row: Editable Name, Rate, Qty, Item-Level Discount, Net Total, Delete - Fixed overlapping layout */}
                          <div className="flex flex-wrap items-center gap-2.5 pt-2.5 border-t border-slate-200/80 text-xs">
                            {/* Custom Description / Title */}
                            <div className="flex-1 min-w-[200px]">
                              <input
                                className="crm-input text-xs font-medium"
                                placeholder="Item title / notes (optional)"
                                value={row.name}
                                onChange={(e) => {
                                  const copy = [...items];
                                  copy[idx].name = e.target.value;
                                  setItems(copy);
                                }}
                              />
                            </div>

                            {/* Unit Rate */}
                            <div className="w-28 relative shrink-0">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">₹</span>
                              <input
                                type="number"
                                className="crm-input text-xs font-bold pl-6 pr-2 text-right"
                                placeholder="Rate"
                                value={row.price || ""}
                                onChange={(e) => {
                                  const copy = [...items];
                                  copy[idx].price = Number(e.target.value);
                                  setItems(copy);
                                }}
                              />
                            </div>

                            {/* Qty */}
                            <div className="w-16 shrink-0">
                              <input
                                type="number"
                                min="1"
                                className="crm-input text-xs font-bold text-center px-1 py-1.5"
                                placeholder="Qty"
                                value={row.qty}
                                onChange={(e) => updateItemQty(idx, Number(e.target.value))}
                              />
                            </div>

                            {/* Item-Level Discount (% or ₹) */}
                            <div className="w-40 shrink-0 flex items-center gap-1">
                              <div className="flex rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-50">
                                <button
                                  type="button"
                                  className={`px-2 py-1 text-[10px] font-bold transition-colors ${row.discountType === '%' ? 'bg-amber-200 text-amber-950 font-black' : 'text-slate-600 hover:bg-slate-100'}`}
                                  onClick={() => updateItemDiscountType(idx, "%")}
                                >
                                  %
                                </button>
                                <button
                                  type="button"
                                  className={`px-2 py-1 text-[10px] font-bold transition-colors ${row.discountType === '₹' ? 'bg-amber-200 text-amber-950 font-black' : 'text-slate-600 hover:bg-slate-100'}`}
                                  onClick={() => updateItemDiscountType(idx, "₹")}
                                >
                                  ₹
                                </button>
                              </div>
                              <input
                                type="number"
                                min="0"
                                className="crm-input text-xs py-1.5 px-2 text-right flex-1 min-w-0 font-medium"
                                placeholder="Discount"
                                value={row.discountValue || ""}
                                onChange={(e) => updateItemDiscountValue(idx, Number(e.target.value))}
                              />
                            </div>

                            {/* Line Net Total */}
                            <div className="w-24 shrink-0 text-right">
                              <span className="text-[10px] text-slate-400 block -mb-0.5">Net Total</span>
                              <span className="font-bold text-slate-900 text-xs">
                                {formatCurrency(lineNet)}
                              </span>
                            </div>

                            {/* Delete Row */}
                            <div className="col-span-1 flex justify-end">
                              <button
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                onClick={() => removeItemRow(idx)}
                                title="Remove line item"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Summary & Checkout Panel */}
              <div className="lg:col-span-4">
                <div className="crm-card sticky top-6 space-y-4">
                  <p className="section-title">Invoice Checkout Summary</p>

                  {/* Gross Subtotal */}
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Gross Items Subtotal:</span>
                    <span className="font-bold text-slate-800">{formatCurrency(grossSubtotal)}</span>
                  </div>

                  {/* Item Discounts Subtotal (if any) */}
                  {itemDiscountsTotal > 0 && (
                    <div className="flex justify-between items-center text-xs text-emerald-700 font-semibold">
                      <span>Item-Level Discounts:</span>
                      <span>-{formatCurrency(itemDiscountsTotal)}</span>
                    </div>
                  )}

                  {/* Total Bill-Level Discount (% or ₹) */}
                  <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <label className="crm-label">Overall Bill Discount</label>
                      {billDiscountAmount > 0 && (
                        <span className="text-emerald-700 font-bold text-[11px]">-{formatCurrency(billDiscountAmount)}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                        <button
                          type="button"
                          className={`px-2.5 py-1 text-xs font-bold ${overallDiscountType === '%' ? 'bg-amber-100 text-amber-900' : 'bg-slate-50 text-slate-600'}`}
                          onClick={() => setOverallDiscountType('%')}
                        >
                          %
                        </button>
                        <button
                          type="button"
                          className={`px-2.5 py-1 text-xs font-bold ${overallDiscountType === '₹' ? 'bg-amber-100 text-amber-900' : 'bg-slate-50 text-slate-600'}`}
                          onClick={() => setOverallDiscountType('₹')}
                        >
                          ₹
                        </button>
                      </div>
                      <input
                        type="number"
                        min="0"
                        className="crm-input text-xs flex-1"
                        placeholder={`Overall Discount in ${overallDiscountType}`}
                        value={overallDiscountValue || ""}
                        onChange={(e) => setOverallDiscountValue(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Total Discount Row (highlighted) */}
                  {totalAllDiscounts > 0 && (
                    <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200/80 flex justify-between items-center text-xs text-emerald-900 font-bold">
                      <span>Total All Discounts Applied:</span>
                      <span className="text-sm font-black text-emerald-700">-{formatCurrency(totalAllDiscounts)}</span>
                    </div>
                  )}

                  {/* Promo Coupon Code */}
                  <div className="flex gap-2">
                    <input
                      className="crm-input text-xs uppercase"
                      placeholder="Promo Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button className="btn-outline text-xs py-1.5 px-3 cursor-pointer" onClick={applyCoupon}>
                      Apply
                    </button>
                  </div>

                  {/* Tax & GST */}
                  <div>
                    <label className="crm-label">GST Tax (%)</label>
                    <select className="crm-select text-xs" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))}>
                      <option value="0">0% (None)</option>
                      <option value="5">5% GST</option>
                      <option value="12">12% GST</option>
                      <option value="18">18% GST</option>
                    </select>
                  </div>

                  {/* ── Strict Financial Adjustments (Toggle-Only, No Manual Typing) ── */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                    <p className="font-bold text-slate-900 flex items-center justify-between">
                      <span>Client Balance Adjustments</span>
                      <span className="text-[10px] text-slate-500 font-normal">Calculated by System</span>
                    </p>

                    {/* Advance Adjustment Toggle */}
                    {totalUnbilledAdvance > 0 && (
                      <label className="flex items-center justify-between p-2 bg-indigo-50/70 border border-indigo-200 rounded-xl cursor-pointer">
                        <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={deductAdvanceToggle}
                            onChange={(e) => setDeductAdvanceToggle(e.target.checked)}
                          />
                          <span>Deduct Unbilled Advance:</span>
                        </span>
                        <span className="font-black text-indigo-700 text-xs">
                          -{formatCurrency(totalUnbilledAdvance)}
                        </span>
                      </label>
                    )}

                    {/* Previous Dues Toggle */}
                    {totalPreviousDues > 0 && (
                      <label className="flex items-center justify-between p-2 bg-rose-50/70 border border-rose-200 rounded-xl cursor-pointer">
                        <span className="text-[11px] font-bold text-rose-950 flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={includePreviousDuesToggle}
                            onChange={(e) => setIncludePreviousDuesToggle(e.target.checked)}
                          />
                          <span>Add Previous Unpaid Dues:</span>
                        </span>
                        <span className="font-black text-rose-700 text-xs">
                          +{formatCurrency(totalPreviousDues)}
                        </span>
                      </label>
                    )}

                    {/* Wallet Credit Toggle */}
                    {selectedClient && selectedClient.walletBalance > 0 && (
                      <label className="flex items-center justify-between p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl cursor-pointer">
                        <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={useWalletToggle}
                            onChange={(e) => setUseWalletToggle(e.target.checked)}
                          />
                          <span>Redeem Wallet Balance:</span>
                        </span>
                        <span className="font-black text-emerald-700 text-xs">
                          -{formatCurrency(walletToDeduct)}
                        </span>
                      </label>
                    )}

                    {!totalUnbilledAdvance && !totalPreviousDues && (!selectedClient || !selectedClient.walletBalance) && (
                      <p className="text-[11px] text-slate-500 italic py-1">
                        ✓ No unbilled advances or past dues on record for this client.
                      </p>
                    )}
                  </div>

                  {/* Net Payable Banner */}
                  <div className="pt-3 border-t border-slate-200 space-y-1">
                    <div className="flex justify-between items-center text-sm font-black text-amber-900">
                      <span>Net Payable Amount:</span>
                      <span className="text-xl">{formatCurrency(netPayable)}</span>
                    </div>
                    {(previousDuesToAdd > 0 || advanceToDeduct > 0 || walletToDeduct > 0) && (
                      <p className="text-[10.5px] text-slate-500 font-medium text-right">
                        Includes {previousDuesToAdd > 0 ? `+₹${previousDuesToAdd} past dues ` : ''}
                        {advanceToDeduct > 0 ? `-₹${advanceToDeduct} advance ` : ''}
                        {walletToDeduct > 0 ? `-₹${walletToDeduct} wallet` : ''}
                      </p>
                    )}
                  </div>

                  {/* ── Split Payments Collection Panel ── */}
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="crm-label text-slate-900 font-bold flex items-center gap-1">
                        <CreditCard size={13} className="text-amber-800" />
                        <span>Payment Collection (Split Modes)</span>
                      </label>
                      <button
                        type="button"
                        className="text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/80 cursor-pointer flex items-center gap-1"
                        onClick={addPaymentRow}
                      >
                        <Plus size={11} /> Add Split Mode
                      </button>
                    </div>

                    <div className="space-y-2">
                      {payments.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <select
                            className="crm-select text-xs font-bold flex-1"
                            value={p.mode}
                            onChange={(e) => updatePaymentMode(idx, e.target.value)}
                          >
                            {paymentModeOptions.map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>

                          <div className="relative w-28">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                            <input
                              type="number"
                              className="crm-input text-xs font-bold pl-5 text-right"
                              placeholder="Amount"
                              value={p.amount}
                              onChange={(e) => updatePaymentAmount(idx, Number(e.target.value))}
                            />
                          </div>

                          {payments.length > 1 && (
                            <button
                              type="button"
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                              onClick={() => removePaymentRow(idx)}
                              title="Remove split method"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Total Collected:</span>
                      <span className="font-black text-emerald-800 text-sm">{formatCurrency(totalPaid)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Pending Balance:</span>
                      <span className={`font-black text-sm ${pendingAmount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {formatCurrency(pendingAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    className="btn-gold w-full py-3 text-sm font-bold shadow-md cursor-pointer"
                    onClick={handleCreateBill}
                  >
                    Generate Tax Invoice
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVOICES HISTORY LEDGER */}
          {activeTab === "invoices" && (
            <div className="space-y-5">
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="crm-card bg-gradient-to-br from-amber-50 to-white border border-amber-200/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Total Invoices</p>
                    <Receipt className="w-5 h-5 text-amber-700" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{ledgerMetrics.count}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Recorded billing receipts</p>
                </div>

                <div className="crm-card bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Total Invoiced</p>
                    <DollarSign className="w-5 h-5 text-slate-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(ledgerMetrics.totalInvoiced)}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Gross billed revenue</p>
                </div>

                <div className="crm-card bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">Paid Amount</p>
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  </div>
                  <p className="text-2xl font-black text-emerald-800 mt-2">{formatCurrency(ledgerMetrics.totalPaid)}</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Collected payments</p>
                </div>

                <div className="crm-card bg-gradient-to-br from-rose-50 to-white border border-rose-200/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-rose-900 uppercase tracking-wider">Pending Dues</p>
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  </div>
                  <p className="text-2xl font-black text-rose-700 mt-2">{formatCurrency(ledgerMetrics.totalPending)}</p>
                  <p className="text-[11px] text-rose-600 mt-0.5">Outstanding balance</p>
                </div>
              </div>

              {/* Ledger Table Container */}
              <div className="crm-card space-y-4">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="section-title">Invoice Records &amp; Receipt History</p>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Search */}
                    <div className="w-60 relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        className="crm-input pl-8 text-xs"
                        placeholder="Search invoice no, client..."
                        value={invoiceSearch}
                        onChange={(e) => setInvoiceSearch(e.target.value)}
                      />
                    </div>

                    {/* Date Filter */}
                    <input
                      type="date"
                      className="crm-input text-xs w-36"
                      value={invoiceDateFilter}
                      onChange={(e) => setInvoiceDateFilter(e.target.value)}
                    />

                    {/* Status Filter */}
                    <select
                      className="crm-select text-xs w-32"
                      value={invoiceStatusFilter}
                      onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="Settled">Settled</option>
                      <option value="Pending Dues">Pending Dues</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    {(invoiceSearch || invoiceDateFilter || invoiceStatusFilter) && (
                      <button
                        className="btn-outline text-xs py-1.5 px-2.5 cursor-pointer"
                        onClick={() => {
                          setInvoiceSearch("");
                          setInvoiceDateFilter("");
                          setInvoiceStatusFilter("");
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Table */}
                {filteredBills.length === 0 ? (
                  <div className="text-center py-14">
                    <Receipt size={36} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-700 font-bold text-sm">No Invoice Records Found</p>
                    <p className="text-slate-400 text-xs mt-0.5">Generate a bill from the POS tab or adjust your search filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="crm-table">
                      <thead>
                        <tr>
                          <th>Invoice No.</th>
                          <th>Date</th>
                          <th>Client Name</th>
                          <th>Contact</th>
                          <th>Items Billed</th>
                          <th>Total</th>
                          <th>Paid</th>
                          <th>Pending</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBills.map((b) => {
                          let itemsList = b.items;
                          if (typeof itemsList === "string") {
                            try { itemsList = JSON.parse(itemsList); } catch { itemsList = []; }
                          }
                          const itemCount = Array.isArray(itemsList) ? itemsList.length : 0;
                          const itemSummary = Array.isArray(itemsList)
                            ? itemsList.map((i: any) => `${i.name}${i.providerName ? ` (${i.providerName})` : ''}`).join(", ")
                            : "-";

                          return (
                            <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="font-mono text-amber-900 font-bold text-xs">{b.billNo}</td>
                              <td className="text-slate-600 text-xs whitespace-nowrap">{b.date}</td>
                              <td className="font-bold text-slate-900 text-xs">{b.clientName}</td>
                              <td className="text-slate-600 text-xs font-semibold">{b.phone}</td>
                              <td className="text-slate-600 text-xs max-w-xs truncate" title={itemSummary}>
                                <span className="inline-block px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700 mr-1">
                                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                </span>
                                {itemSummary}
                              </td>
                              <td className="font-bold text-slate-900 text-xs">{formatCurrency(b.total)}</td>
                              <td className="text-emerald-700 font-bold text-xs">{formatCurrency(b.paid)}</td>
                              <td className={`font-bold text-xs ${b.pending > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                                {formatCurrency(b.pending)}
                              </td>
                              <td>
                                <span className={`badge ${b.status === 'Settled' ? 'badge-green' :
                                  b.status === 'Pending Dues' ? 'badge-gold' : 'badge-gray'
                                  }`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Settle Past Dues Action (If Pending) */}
                                  {Number(b.pending || 0) > 0 && (
                                    <button
                                      className="btn-sm bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-all font-bold cursor-pointer flex items-center gap-1"
                                      onClick={() => startSettleBillToday(b)}
                                      title="Pay / Settle Pending Balance Today"
                                    >
                                      <CreditCard size={11} /> Settle Today
                                    </button>
                                  )}

                                  {/* View / Print */}
                                  <Link
                                    href={`/admin/billing/invoice/${b.id || b.billNo}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-sm bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-all"
                                    title="Print Thermal Invoice"
                                  >
                                    <Printer size={12} /> Print
                                  </Link>

                                  {/* Edit Receipt (Opens Full Page) */}
                                  <button
                                    className="btn-sm bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer"
                                    onClick={() => startEditBill(b)}
                                    title="Edit Receipt Details for that date"
                                  >
                                    <Edit2 size={12} /> Edit
                                  </button>

                                  {/* Delete Receipt */}
                                  <button
                                    className="btn-sm bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer"
                                    onClick={() => setDeletingBill(b)}
                                    title="Delete Invoice Record"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
