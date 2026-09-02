"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import * as XLSX from "xlsx";
import {
  Scissors,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Search,
  Check,
  X,
  AlertCircle,
  Layers,
  IndianRupee,
  Save,
  Clock,
  Tag,
  FileSpreadsheet,
  Upload,
  Download,
  FileDown,
  Gift
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  desc?: string | null;
  order: number;
  duration?: number;
  membershipPrice?: number | null;
  rewardPoints?: number;
  serviceFor?: string;
}

interface SubCategory {
  id: string;
  name: string;
  order: number;
  items: ServiceItem[];
}

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  desc?: string | null;
  gradient?: string | null;
  order: number;
  subcategories: SubCategory[];
}

export default function AdminServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [userRole, setUserRole] = useState<string>("MANAGER");

  // Editing inline price state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>("");
  const [priceSaving, setPriceSaving] = useState(false);

  // Bulk Import / Export States
  const [importModal, setImportModal] = useState<{
    open: boolean;
    file: File | null;
    parsedRows: any[];
    error: string | null;
    loading: boolean;
    result: string | null;
  }>({
    open: false,
    file: null,
    parsedRows: [],
    error: null,
    loading: false,
    result: null,
  });

  // Category Form state
  const [categoryModal, setCategoryModal] = useState<{
    open: boolean;
    isEdit: boolean;
    data: Partial<ServiceCategory>;
  }>({ open: false, isEdit: false, data: {} });

  // SubCategory Form state
  const [subCategoryModal, setSubCategoryModal] = useState<{
    open: boolean;
    isEdit: boolean;
    id?: string;
    categoryId: string | null;
    name: string;
  }>({ open: false, isEdit: false, categoryId: null, name: "" });

  // Service Item Form state
  const [itemModal, setItemModal] = useState<{
    open: boolean;
    isEdit: boolean;
    subCategoryId: string | null;
    data: Partial<ServiceItem>;
  }>({ open: false, isEdit: false, subCategoryId: null, data: {} });

  // Notifications
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper open functions that auto-scroll to top
  const openCategoryForm = (isEdit: boolean, data: Partial<ServiceCategory> = {}) => {
    setCategoryModal({ open: true, isEdit, data });
    setSubCategoryModal({ open: false, isEdit: false, categoryId: null, name: "" });
    setItemModal({ open: false, isEdit: false, subCategoryId: null, data: {} });
    setImportModal((prev) => ({ ...prev, open: false }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openSubCategoryForm = (isEdit: boolean, categoryId: string | null, name: string = "", id?: string) => {
    setSubCategoryModal({ open: true, isEdit, categoryId, name, id });
    setCategoryModal({ open: false, isEdit: false, data: {} });
    setItemModal({ open: false, isEdit: false, subCategoryId: null, data: {} });
    setImportModal((prev) => ({ ...prev, open: false }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openItemForm = (isEdit: boolean, subCategoryId: string | null, data: Partial<ServiceItem> = {}) => {
    setItemModal({ open: true, isEdit, subCategoryId, data });
    setCategoryModal({ open: false, isEdit: false, data: {} });
    setSubCategoryModal({ open: false, isEdit: false, categoryId: null, name: "" });
    setImportModal((prev) => ({ ...prev, open: false }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Load all categories with nested subcategories and items
  const loadServices = async () => {
    try {
      setLoading(true);
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.user) setUserRole(authData.user.role);
      }

      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
        if (data.data.length > 0 && Object.keys(openCategories).length === 0) {
          setOpenCategories({ [data.data[0].id]: true });
        }
      } else {
        showToast("error", data.error || "Failed to load services");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error while loading services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  // ─── EXPORT SERVICES TO XLSX ───
  const handleExportExcel = () => {
    try {
      const flatList: any[] = [];
      categories.forEach((cat) => {
        cat.subcategories.forEach((sub) => {
          sub.items.forEach((item) => {
            flatList.push({
              "Category": cat.name,
              "Sub Category": sub.name,
              "Service": item.name,
              "Price (₹)": item.price,
              "Duration (Min)": item.duration || 30,
              "Membership Price (₹)": item.membershipPrice || "",
              "Reward Points": item.rewardPoints || 0,
              "Service For": item.serviceFor || "Female",
              "Description": item.desc || "",
            });
          });
        });
      });

      if (flatList.length === 0) {
        return showToast("error", "No service items found to export");
      }

      const worksheet = XLSX.utils.json_to_sheet(flatList);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Services");
      XLSX.writeFile(workbook, `Vivazen_Services_Catalog_${new Date().toISOString().split("T")[0]}.xlsx`);
      showToast("success", `Exported ${flatList.length} services to Excel!`);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to export Excel file");
    }
  };

  // ─── DOWNLOAD SAMPLE IMPORT TEMPLATE ───
  const handleDownloadTemplate = () => {
    try {
      const sample = [
        {
          "Category": "Hair Care",
          "Sub Category": "Hair Cut & Styling",
          "Service": "Women's Advanced Hair Cut",
          "Price (₹)": 650,
        },
        {
          "Category": "Hair Care",
          "Sub Category": "Hair Spa & Treatments",
          "Service": "Keratin Smooth Treatment",
          "Price (₹)": 3500,
        },
        {
          "Category": "Skin & Facials",
          "Sub Category": "Organic Facials",
          "Service": "Lotus Radiant Glow Facial",
          "Price (₹)": 1200,
        },
        {
          "Category": "Bridal & Pre-Bridal",
          "Sub Category": "Bridal Makeup",
          "Service": "Bridal HD Makeup & Styling",
          "Price (₹)": 4500,
        },
        {
          "Category": "Hands & Feet Care",
          "Sub Category": "Pedicure",
          "Service": "Classic French Pedicure",
          "Price (₹)": 550,
        }
      ];
      const worksheet = XLSX.utils.json_to_sheet(sample);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Services Template");
      XLSX.writeFile(workbook, "Services_Import_Template.xlsx");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to download template");
    }
  };

  // ─── PARSE UPLOADED XLSX FILE ───
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rows || rows.length === 0) {
          setImportModal((prev) => ({
            ...prev,
            file,
            parsedRows: [],
            error: "The uploaded file contains no data rows.",
          }));
          return;
        }

        setImportModal((prev) => ({
          ...prev,
          file,
          parsedRows: rows,
          error: null,
        }));
      } catch (err) {
        console.error(err);
        setImportModal((prev) => ({
          ...prev,
          file: null,
          parsedRows: [],
          error: "Failed to parse Excel file. Please upload a valid .xlsx file.",
        }));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ─── EXECUTE BULK IMPORT TO DATABASE ───
  const handleExecuteImport = async () => {
    if (!importModal.parsedRows || importModal.parsedRows.length === 0) {
      showToast("error", "No parsed items to import");
      return;
    }

    try {
      setImportModal((prev) => ({ ...prev, loading: true, error: null }));

      const res = await fetch("/api/crm/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "services",
          items: importModal.parsedRows,
        }),
      });

      const d = await res.json();
      if (d.success) {
        showToast("success", d.message || "Bulk import completed successfully!");
        setImportModal({
          open: false,
          file: null,
          parsedRows: [],
          error: null,
          loading: false,
          result: null,
        });
        loadServices();
      } else {
        setImportModal((prev) => ({
          ...prev,
          loading: false,
          error: d.error || "Failed to complete bulk import",
        }));
      }
    } catch (err) {
      console.error(err);
      setImportModal((prev) => ({
        ...prev,
        loading: false,
        error: "Network error occurred during bulk import",
      }));
    }
  };

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Quick Inline Price update
  const handleSavePrice = async (itemId: string) => {
    const num = parseFloat(editingPriceValue);
    if (isNaN(num) || num < 0) {
      showToast("error", "Please enter a valid price");
      return;
    }

    try {
      setPriceSaving(true);
      const res = await fetch("/api/services/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "item",
          id: itemId,
          price: num,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", "Price updated successfully");
        setEditingPriceId(null);
        loadServices();
      } else {
        showToast("error", data.error || "Failed to update price");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Error saving price");
    } finally {
      setPriceSaving(false);
    }
  };

  // Category CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isEdit, data } = categoryModal;

    if (!data.name || !data.slug) {
      showToast("error", "Category name and slug are required");
      return;
    }

    try {
      const res = await fetch("/api/services", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        showToast(
          "success",
          isEdit ? "Category updated successfully" : "Category created successfully"
        );
        setCategoryModal({ open: false, isEdit: false, data: {} });
        loadServices();
      } else {
        showToast("error", result.error || "Failed to save category");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error occurred");
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}" and all of its subcategories and prices?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        showToast("success", "Category deleted");
        loadServices();
      } else {
        showToast("error", result.error || "Failed to delete category");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error occurred");
    }
  };

  // Subcategory CRUD
  const handleSaveSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isEdit, id, categoryId, name } = subCategoryModal;

    if (!name.trim() || (!isEdit && !categoryId)) {
      showToast("error", "Subcategory name is required");
      return;
    }

    try {
      const res = await fetch("/api/services/items", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "subcategory",
          ...(isEdit ? { id } : { categoryId }),
          name: name.trim(),
        }),
      });

      const result = await res.json();
      if (result.success) {
        showToast("success", isEdit ? "Subcategory updated" : "Subcategory added");
        setSubCategoryModal({ open: false, isEdit: false, categoryId: null, name: "" });
        if (categoryId) setOpenCategories((prev) => ({ ...prev, [categoryId]: true }));
        loadServices();
      } else {
        showToast("error", result.error || "Failed to save subcategory");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error occurred");
    }
  };

  const handleDeleteSubCategory = async (id: string, name: string) => {
    if (!confirm(`Delete subcategory "${name}" and all items inside it?`)) return;

    try {
      const res = await fetch(`/api/services/items?type=subcategory&id=${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        showToast("success", "Subcategory removed");
        loadServices();
      } else {
        showToast("error", result.error || "Failed to delete subcategory");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error occurred");
    }
  };

  // Service Item CRUD
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isEdit, subCategoryId, data } = itemModal;

    if (!data.name || data.price === undefined) {
      showToast("error", "Service name and price are required");
      return;
    }

    try {
      const res = await fetch("/api/services/items", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "item",
          ...(isEdit ? { id: data.id } : { subCategoryId }),
          name: String(data.name).trim(),
          price: Number(data.price),
          duration: data.duration !== undefined ? Number(data.duration) : 30,
          membershipPrice: data.membershipPrice ? Number(data.membershipPrice) : null,
          rewardPoints: data.rewardPoints !== undefined ? Number(data.rewardPoints) : 0,
          serviceFor: data.serviceFor || "Female",
          desc: data.desc || null,
        }),
      });

      const result = await res.json();
      if (result.success) {
        showToast("success", isEdit ? "Service updated" : "Service added");
        setItemModal({ open: false, isEdit: false, subCategoryId: null, data: {} });
        loadServices();
      } else {
        showToast("error", result.error || "Failed to save item");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error occurred");
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Delete service item "${name}"?`)) return;

    try {
      const res = await fetch(`/api/services/items?type=item&id=${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        showToast("success", "Item removed");
        loadServices();
      } else {
        showToast("error", result.error || "Failed to delete item");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error occurred");
    }
  };

  // Filter categories by search
  const filteredCategories = categories
    .map((category) => {
      const matchesCategory =
        category.name.toLowerCase().includes(search.toLowerCase()) ||
        category.slug.toLowerCase().includes(search.toLowerCase());

      const filteredSubs = category.subcategories
        .map((sub) => {
          const matchesSub = sub.name.toLowerCase().includes(search.toLowerCase());
          const filteredItems = sub.items.filter(
            (item) =>
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.price.toString().includes(search)
          );

          if (matchesSub || filteredItems.length > 0) {
            return {
              ...sub,
              items: matchesSub ? sub.items : filteredItems,
            };
          }
          return null;
        })
        .filter(Boolean) as SubCategory[];

      if (matchesCategory || filteredSubs.length > 0) {
        return {
          ...category,
          subcategories: matchesCategory ? category.subcategories : filteredSubs,
        };
      }
      return null;
    })
    .filter(Boolean) as ServiceCategory[];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm border animate-in fade-in slide-in-from-top-4 duration-300 ${
            notification.type === "success"
              ? "bg-emerald-900/90 text-emerald-100 border-emerald-700/50 backdrop-blur-md"
              : "bg-rose-900/90 text-rose-100 border-rose-700/50 backdrop-blur-md"
          }`}
        >
          {notification.type === "success" ? (
            <Check className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-600" />
            <span>Services & Pricing Catalog</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage your service categories, subcategories, menu items, and live pricing.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Export all services into an Excel spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() =>
              setImportModal((prev) => ({
                ...prev,
                open: !prev.open,
              }))
            }
            className={`px-3.5 py-2.5 border font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${importModal.open ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300'}`}
            title="Bulk Import Services from Excel (.xlsx)"
          >
            {importModal.open ? <X className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5 text-blue-700" />}
            <span>{importModal.open ? "Close Import" : "Bulk Import"}</span>
          </button>

          <button
            onClick={() =>
              openCategoryForm(false, {
                name: "",
                slug: "",
                icon: "",
                desc: "",
                gradient: "from-rose-500/20 to-pink-500/20",
                order: categories.length + 1,
              })
            }
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* ─── IN-PAGE EXPANDABLE: BULK IMPORT SERVICES FORM ─── */}
      {importModal.open && (
        <div className="crm-card border-2 border-blue-300 bg-gradient-to-br from-blue-50/40 via-white to-white space-y-5 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-blue-100 text-blue-800">
                <FileSpreadsheet className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900">Bulk Import Services (Excel / CSV)</h3>
                <p className="text-[11px] text-slate-500">Upload salon catalog with Category, Sub Category, Service name, and Prices.</p>
              </div>
            </div>
            <button
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              onClick={() => setImportModal((prev) => ({ ...prev, open: false }))}
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-blue-950">Spreadsheet Headers Required:</p>
              <p className="text-[11px] text-blue-800 mt-0.5">
                First row must have: <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">Category</span>, <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">Sub Category</span>, <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">Service</span>, <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">Price (₹)</span>
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="text-xs font-bold text-blue-900 bg-white px-3 py-1.5 rounded-xl border border-blue-300 hover:bg-blue-50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FileDown size={13} className="text-blue-700" />
              <span>Download Sample Template</span>
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center transition-colors bg-white/70">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
              id="service-inpage-file-input"
            />
            <label
              htmlFor="service-inpage-file-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center shadow-xs">
                <Upload size={18} />
              </div>
              <p className="text-xs font-bold text-slate-800">
                {importModal.file ? importModal.file.name : "Click to select Excel spreadsheet (.xlsx, .xls, .csv)"}
              </p>
              <p className="text-[11px] text-slate-400">Excel / CSV spreadsheet with header row</p>
            </label>
          </div>

          {importModal.error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0 text-rose-600" />
              <span>{importModal.error}</span>
            </div>
          )}

          {importModal.parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-800">
                  Detected Rows: {importModal.parsedRows.length} Services
                </p>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  ✓ Verified Format
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl bg-white">
                <table className="crm-table w-full text-xs">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Category</th>
                      <th>Sub Category</th>
                      <th>Service</th>
                      <th>Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importModal.parsedRows.slice(0, 15).map((row, idx) => {
                      const cat = row["Category"] || row["category"] || row["Service Category"] || row.category || "General";
                      const subCat = row["Sub Category"] || row["SubCategory"] || row["Sub-Category"] || row["subCategory"] || row["subcategory"] || row["Subcategory"] || row.subCategory || "General";
                      const service = row["Service"] || row["Service Name"] || row["Name"] || row.service || row.name || "—";
                      const price = row["Price (₹)"] ?? row["Price(₹)"] ?? row["Price (Rs)"] ?? row["Price (Rs.)"] ?? row["Price"] ?? row["Rate"] ?? row.price ?? 0;
                      return (
                        <tr key={idx}>
                          <td className="text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td><span className="badge badge-gold text-[10px]">{cat}</span></td>
                          <td><span className="text-slate-700 font-medium text-[11px]">{subCat}</span></td>
                          <td className="font-bold text-slate-900">{service}</td>
                          <td className="font-bold text-slate-900 font-mono">₹{price}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              className="btn-outline text-xs px-4 cursor-pointer"
              onClick={() => setImportModal((prev) => ({ ...prev, open: false }))}
            >
              Cancel
            </button>
            <button
              className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer flex items-center gap-2"
              onClick={handleExecuteImport}
              disabled={importModal.loading || importModal.parsedRows.length === 0}
            >
              {importModal.loading ? "Processing..." : `Import ${importModal.parsedRows.length} Services`}
            </button>
          </div>
        </div>
      )}

      {/* ─── IN-PAGE EXPANDABLE: CATEGORY FORM (CREATE / EDIT) ─── */}
      {categoryModal.open && (
        <div className="crm-card border-2 border-amber-400 bg-gradient-to-br from-amber-50/50 via-white to-white space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-700" />
              <span>{categoryModal.isEdit ? "Edit Service Category" : "New Service Category"}</span>
            </h3>
            <button
              onClick={() => setCategoryModal({ open: false, isEdit: false, data: {} })}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="crm-label">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hair Spa & Wellness"
                  value={categoryModal.data.name || ""}
                  onChange={(e) =>
                    setCategoryModal({
                      ...categoryModal,
                      data: {
                        ...categoryModal.data,
                        name: e.target.value,
                        ...(!categoryModal.isEdit && {
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                        }),
                      },
                    })
                  }
                  className="crm-input text-xs font-bold"
                />
              </div>

              <div>
                <label className="crm-label">URL Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. hair-spa"
                  value={categoryModal.data.slug || ""}
                  onChange={(e) =>
                    setCategoryModal({
                      ...categoryModal,
                      data: { ...categoryModal.data, slug: e.target.value },
                    })
                  }
                  className="crm-input text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="crm-label">Category Icon URL / Upload</label>
              <ImageUploader
                value={categoryModal.data.icon || ""}
                onChange={(url) =>
                  setCategoryModal({
                    ...categoryModal,
                    data: { ...categoryModal.data, icon: url },
                  })
                }
              />
            </div>

            <div>
              <label className="crm-label">Brief Description</label>
              <input
                type="text"
                placeholder="e.g. Rejuvenating and premium hair therapies"
                value={categoryModal.data.desc || ""}
                onChange={(e) =>
                  setCategoryModal({
                    ...categoryModal,
                    data: { ...categoryModal.data, desc: e.target.value },
                  })
                }
                className="crm-input text-xs"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCategoryModal({ open: false, isEdit: false, data: {} })}
                className="btn-outline text-xs px-4 cursor-pointer"
              >
                Cancel
              </button>
              <button type="submit" className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer">
                {categoryModal.isEdit ? "Update Category" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── IN-PAGE EXPANDABLE: SUBCATEGORY FORM (CREATE / EDIT) ─── */}
      {subCategoryModal.open && (
        <div className="crm-card border-2 border-amber-400 bg-gradient-to-br from-amber-50/50 via-white to-white space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-700" />
              <span>{subCategoryModal.isEdit ? "Edit Subcategory" : "Add New Subcategory"}</span>
            </h3>
            <button
              onClick={() => setSubCategoryModal({ open: false, isEdit: false, categoryId: null, name: "" })}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveSubCategory} className="space-y-4 text-xs">
            <div>
              <label className="crm-label">Subcategory Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Keratin & Hair Botox"
                value={subCategoryModal.name}
                onChange={(e) => setSubCategoryModal({ ...subCategoryModal, name: e.target.value })}
                className="crm-input text-xs font-bold"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSubCategoryModal({ open: false, isEdit: false, categoryId: null, name: "" })}
                className="btn-outline text-xs px-4 cursor-pointer"
              >
                Cancel
              </button>
              <button type="submit" className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer">
                {subCategoryModal.isEdit ? "Update Subcategory" : "Add Subcategory"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── IN-PAGE EXPANDABLE: SERVICE ITEM FORM (CREATE / EDIT) ─── */}
      {itemModal.open && (
        <div className="crm-card border-2 border-amber-400 bg-gradient-to-br from-amber-50/50 via-white to-white space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-700" />
              <span>{itemModal.isEdit ? `Edit Service: ${itemModal.data.name || ""}` : "Add New Service Item"}</span>
            </h3>
            <button
              onClick={() => setItemModal({ open: false, isEdit: false, subCategoryId: null, data: {} })}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="crm-label">Service Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hair Colour - Global/Fashion (Boy Cut)"
                  value={itemModal.data.name || ""}
                  onChange={(e) =>
                    setItemModal({
                      ...itemModal,
                      data: { ...itemModal.data, name: e.target.value },
                    })
                  }
                  className="crm-input text-xs font-bold"
                />
              </div>

              <div>
                <label className="crm-label">Standard Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 1590"
                  value={itemModal.data.price !== undefined ? itemModal.data.price : ""}
                  onChange={(e) =>
                    setItemModal({
                      ...itemModal,
                      data: { ...itemModal.data, price: Number(e.target.value) },
                    })
                  }
                  className="crm-input text-xs font-bold text-amber-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              <div>
                <label className="crm-label">Duration (Minutes)</label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    placeholder="30"
                    value={itemModal.data.duration !== undefined ? itemModal.data.duration : 30}
                    onChange={(e) =>
                      setItemModal({
                        ...itemModal,
                        data: { ...itemModal.data, duration: Number(e.target.value) },
                      })
                    }
                    className="crm-input pl-8 text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="crm-label">Membership Price (₹)</label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional discounted"
                    value={itemModal.data.membershipPrice !== undefined && itemModal.data.membershipPrice !== null ? itemModal.data.membershipPrice : ""}
                    onChange={(e) =>
                      setItemModal({
                        ...itemModal,
                        data: {
                          ...itemModal.data,
                          membershipPrice: e.target.value ? Number(e.target.value) : null,
                        },
                      })
                    }
                    className="crm-input pl-8 text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="crm-label">Reward Points</label>
                <div className="relative">
                  <Gift className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={itemModal.data.rewardPoints !== undefined ? itemModal.data.rewardPoints : 0}
                    onChange={(e) =>
                      setItemModal({
                        ...itemModal,
                        data: { ...itemModal.data, rewardPoints: Number(e.target.value) },
                      })
                    }
                    className="crm-input pl-8 text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="crm-label">Service Target</label>
                <select
                  value={itemModal.data.serviceFor || "Female"}
                  onChange={(e) =>
                    setItemModal({
                      ...itemModal,
                      data: { ...itemModal.data, serviceFor: e.target.value },
                    })
                  }
                  className="crm-select text-xs font-semibold"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Unisex">Unisex / All</option>
                </select>
              </div>
            </div>

            <div>
              <label className="crm-label">Description / Treatment Details</label>
              <textarea
                rows={2}
                placeholder="Optional description of service, included products, or specific steps..."
                value={itemModal.data.desc || ""}
                onChange={(e) =>
                  setItemModal({
                    ...itemModal,
                    data: { ...itemModal.data, desc: e.target.value },
                  })
                }
                className="crm-input text-xs"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setItemModal({ open: false, isEdit: false, subCategoryId: null, data: {} })}
                className="btn-outline text-xs px-4 cursor-pointer"
              >
                Cancel
              </button>
              <button type="submit" className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer">
                {itemModal.isEdit ? "Update Service Item" : "Save Service Item"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search categories, subcategories, or individual service items & prices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-600 transition-all shadow-2xs"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Categories Accordion List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 tracking-wider uppercase font-medium">Loading Services...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs">
          <p className="text-slate-500 text-sm">No services found matching your search.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((category) => {
            const isOpen = openCategories[category.id] ?? false;
            const totalItemsCount = category.subcategories.reduce(
              (acc, sub) => acc + sub.items.length,
              0
            );

            return (
              <div
                key={category.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xs transition-all"
              >
                {/* Category Header Bar */}
                <div
                  onClick={() => toggleCategory(category.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <button className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                      {isOpen ? <ChevronDown className="w-5 h-5 text-amber-700" /> : <ChevronRight className="w-5 h-5" />}
                    </button>

                    <div className="w-10 h-10 relative flex-shrink-0 bg-slate-50 rounded-2xl p-1.5 border border-slate-200 shadow-2xs">
                      {category.icon ? (
                        <Image
                          src={category.icon}
                          alt={category.name}
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <Scissors className="w-5 h-5 text-amber-700" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 truncate">
                          {category.name}
                        </h2>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-mono">
                          /{category.slug}
                        </span>
                        <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold">
                          {totalItemsCount} services
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {category.desc || "No description provided"}
                      </p>
                    </div>
                  </div>

                  {/* Category Action Buttons */}
                  <div
                    className="flex items-center gap-2 ml-4 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openSubCategoryForm(false, category.id)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-700" />
                      <span className="hidden sm:inline">Add Subcategory</span>
                    </button>

                    <button
                      onClick={() => openCategoryForm(true, category)}
                      className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {userRole === "ADMIN" && (
                      <button
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Subcategories & Items */}
                {isOpen && (
                  <div className="p-4 sm:p-6 bg-slate-50/50 border-t border-slate-100 space-y-5">
                    {category.subcategories.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No subcategories yet. Click &quot;Add Subcategory&quot; to begin adding services.
                      </div>
                    ) : (
                      category.subcategories.map((subCategory) => (
                        <div
                          key={subCategory.id}
                          className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs"
                        >
                          {/* Subcategory Header */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                            <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-amber-700" />
                              <h3 className="text-sm font-bold text-slate-900">
                                {subCategory.name}
                              </h3>
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                                {subCategory.items.length} items
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  openItemForm(false, subCategory.id, {
                                    name: "",
                                    price: 0,
                                    duration: 30,
                                    rewardPoints: 0,
                                    serviceFor: "Female",
                                  })
                                }
                                className="px-2.5 py-1 text-xs font-semibold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Service Item</span>
                              </button>

                              <button
                                onClick={() => openSubCategoryForm(true, category.id, subCategory.name, subCategory.id)}
                                className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Edit Subcategory Name"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {userRole === "ADMIN" && (
                                <button
                                  onClick={() =>
                                    handleDeleteSubCategory(subCategory.id, subCategory.name)
                                  }
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete Subcategory"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Items Table */}
                          {subCategory.items.length === 0 ? (
                            <p className="text-slate-400 text-xs py-3 text-center">
                              No items in this subcategory yet.
                            </p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    <th className="py-2 px-3">Service Name</th>
                                    <th className="py-2 px-3">Duration</th>
                                    <th className="py-2 px-3">Target</th>
                                    <th className="py-2 px-3">Points</th>
                                    <th className="py-2 px-3">Price (₹)</th>
                                    <th className="py-2 px-3 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/60">
                                  {subCategory.items.map((item) => (
                                    <tr
                                      key={item.id}
                                      className="hover:bg-amber-50/20 transition-colors group"
                                    >
                                      <td className="py-2.5 px-3">
                                        <p className="font-bold text-slate-900">{item.name}</p>
                                        {item.desc && (
                                          <p className="text-[11px] text-slate-400 line-clamp-1">{item.desc}</p>
                                        )}
                                      </td>

                                      <td className="py-2.5 px-3 text-slate-600 font-mono">
                                        {item.duration || 30} mins
                                      </td>

                                      <td className="py-2.5 px-3">
                                        <span className="badge badge-gold text-[10px]">
                                          {item.serviceFor || "Female"}
                                        </span>
                                      </td>

                                      <td className="py-2.5 px-3 font-mono text-slate-600">
                                        {item.rewardPoints || 0} pts
                                      </td>

                                      {/* Price with Quick Inline Edit */}
                                      <td className="py-2.5 px-3">
                                        {editingPriceId === item.id ? (
                                          <div className="flex items-center gap-1.5">
                                            <div className="relative flex items-center">
                                              <IndianRupee className="w-3 h-3 text-slate-400 absolute left-1.5" />
                                              <input
                                                type="number"
                                                value={editingPriceValue}
                                                onChange={(e) => setEditingPriceValue(e.target.value)}
                                                className="w-24 pl-6 pr-2 py-1 bg-white border border-amber-500 rounded text-slate-900 text-xs font-mono font-bold focus:outline-none"
                                                autoFocus
                                              />
                                            </div>
                                            <button
                                              onClick={() => handleSavePrice(item.id)}
                                              disabled={priceSaving}
                                              className="p-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded cursor-pointer"
                                              title="Save Price"
                                            >
                                              <Save className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              onClick={() => setEditingPriceId(null)}
                                              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ) : (
                                          <div
                                            onClick={() => {
                                              setEditingPriceId(item.id);
                                              setEditingPriceValue(item.price.toString());
                                            }}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-mono font-bold cursor-pointer transition-all hover:scale-102"
                                            title="Click to quick edit price"
                                          >
                                            <span>₹{item.price.toLocaleString("en-IN")}</span>
                                            <Edit2 className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 text-amber-700" />
                                          </div>
                                        )}
                                      </td>

                                      <td className="py-2.5 px-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                          <button
                                            onClick={() => openItemForm(true, subCategory.id, item)}
                                            className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                            title="Edit Item Details"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteItem(item.id, item.name)}
                                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                            title="Delete Item"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
