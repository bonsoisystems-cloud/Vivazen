"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  Package,
  Truck,
  AlertTriangle,
  X,
  Scissors,
  Download,
  Upload,
  FileSpreadsheet,
  FileDown,
  AlertCircle
} from "lucide-react";

export default function AdminInventoryPage() {
  const today = new Date().toISOString().split("T")[0];

  const [tab, setTab] = useState<"products" | "stock" | "purchase" | "usage" | "vendors">("products");

  // Product Master
  const [productList, setProductList] = useState<any[]>([]);
  const [prodForm, setProdForm] = useState<any>({ unit: "ML", stock: 10, volume: "100" });
  const [showAddProd, setShowAddProd] = useState(false);

  // In-Salon Usage Log
  const [usageList, setUsageList] = useState<any[]>([]);
  const [usageForm, setUsageForm] = useState({ productId: "", qty: 1, providerId: "", remarks: "" });

  // Vendors & Purchases
  const [vendorList, setVendorList] = useState<any[]>([]);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [vendorForm, setVendorForm] = useState({ name: "", phone: "", email: "", gst: "", address: "" });

  const [purchaseVendor, setPurchaseVendor] = useState("");
  const [purchaseInvoice, setPurchaseInvoice] = useState("");
  const [purchaseItems, setPurchaseItems] = useState([
    { productId: "", name: "", qty: 1, purchasePrice: 0, salePrice: 0, expiry: "2026-12-31" }
  ]);

  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, vRes, uRes, stRes] = await Promise.all([
        fetch("/api/crm/inventory?type=products"),
        fetch("/api/crm/inventory?type=vendors"),
        fetch("/api/crm/inventory?type=usage"),
        fetch("/api/crm/staff?type=providers"),
      ]);

      if (pRes.ok) {
        const d = await pRes.json();
        if (d.success) setProductList(d.data || []);
      }
      if (vRes.ok) {
        const d = await vRes.json();
        if (d.success) setVendorList(d.data || []);
      }
      if (uRes.ok) {
        const d = await uRes.json();
        if (d.success) setUsageList(d.data || []);
      }
      if (stRes.ok) {
        const d = await stRes.json();
        if (d.success) {
          const list = Array.isArray(d.data) ? d.data : Array.isArray(d.data?.providers) ? d.data.providers : Array.isArray(d.data?.staff) ? d.data.staff : [];
          setStaff(list);
        }
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

  // ─── EXPORT PRODUCTS TO XLSX ───
  const handleExportProductsExcel = () => {
    try {
      if (productList.length === 0) {
        return alert("No products found to export.");
      }

      const flatList = productList.map((p) => ({
        "Product name": p.name,
        "Available in stock": p.stock || 0,
        "Sale price": p.salePrice || 0,
        "MRP": p.mrp || p.salePrice || 0,
        "Barcode": p.barcode || "",
        "Volume": p.volume || "100",
        "Unit": p.unit || "ML",
        "Reward points": p.rewardPoints || 0,
      }));

      const worksheet = XLSX.utils.json_to_sheet(flatList);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
      XLSX.writeFile(workbook, `Vivazen_Product_Catalog_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (err) {
      console.error(err);
      alert("Failed to export products to Excel");
    }
  };

  // ─── DOWNLOAD SAMPLE PRODUCTS TEMPLATE ───
  const handleDownloadProductsTemplate = () => {
    try {
      const sample = [
        {
          "Product name": "L'Oreal Professional Shampoo 500ml",
          "Available in stock": 25,
          "Sale price": 850,
        },
        {
          "Product name": "Moroccan Argan Hair Oil 100ml",
          "Available in stock": 14,
          "Sale price": 1400,
        },
        {
          "Product name": "O3+ Radiant Glow Facial Kit",
          "Available in stock": 8,
          "Sale price": 2200,
        },
        {
          "Product name": "Streax Pro Hair Serum 100ml",
          "Available in stock": 30,
          "Sale price": 420,
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(sample);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products Template");
      XLSX.writeFile(workbook, "Products_Import_Template.xlsx");
    } catch (err) {
      console.error(err);
      alert("Failed to download sample template");
    }
  };

  // ─── PARSE UPLOADED PRODUCTS XLSX ───
  const handleProductsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        const sampleRow = rows[0];
        const hasName = "Product name" in sampleRow || "Product Name" in sampleRow || "name" in sampleRow || "Name" in sampleRow;
        const hasPrice = "Sale price" in sampleRow || "Sale Price" in sampleRow || "price" in sampleRow || "Price" in sampleRow || "MRP" in sampleRow;

        if (!hasName || !hasPrice) {
          setImportModal((prev) => ({
            ...prev,
            file,
            parsedRows: rows,
            error: "Header note: The first row should contain columns: Product name, Available in stock, Sale price",
          }));
        } else {
          setImportModal((prev) => ({
            ...prev,
            file,
            parsedRows: rows,
            error: null,
          }));
        }
      } catch (err) {
        console.error(err);
        setImportModal((prev) => ({
          ...prev,
          file,
          parsedRows: [],
          error: "Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.",
        }));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ─── EXECUTE PRODUCTS BULK IMPORT ───
  const handleExecuteProductsImport = async () => {
    if (importModal.parsedRows.length === 0) return;
    try {
      setImportModal((prev) => ({ ...prev, loading: true, error: null }));
      const res = await fetch("/api/crm/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "products",
          items: importModal.parsedRows,
        }),
      });

      const d = await res.json();
      if (d.success) {
        alert(d.message || "Products bulk import completed successfully!");
        setImportModal({
          open: false,
          file: null,
          parsedRows: [],
          error: null,
          loading: false,
          result: null,
        });
        loadData();
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

  const saveProduct = async () => {
    if (!prodForm.name?.trim() || !prodForm.mrp) {
      return alert("Product Name and MRP are required.");
    }

    const action = prodForm.id ? "edit_product" : "add_product";

    try {
      const res = await fetch("/api/crm/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...prodForm })
      });
      const d = await res.json();
      if (d.success) {
        setShowAddProd(false);
        setProdForm({ unit: "ML", stock: 10, volume: "100" });
        loadData();
      } else {
        alert(d.error || "Failed to save product");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveVendor = async () => {
    if (!vendorForm.name?.trim() || !vendorForm.phone?.trim()) {
      return alert("Vendor name and contact phone are required.");
    }

    const action = (vendorForm as any).id ? "edit_vendor" : "add_vendor";

    try {
      const res = await fetch("/api/crm/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...vendorForm })
      });
      const d = await res.json();
      if (d.success) {
        setShowAddVendor(false);
        setVendorForm({ name: "", phone: "", email: "", gst: "", address: "" });
        loadData();
      } else {
        alert(d.error || "Failed to save vendor");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addUsage = async () => {
    if (!usageForm.productId || !usageForm.providerId) {
      return alert("Please select a product and service provider.");
    }
    const prod = productList.find(p => p.id === usageForm.productId);
    const sp = staff.find(p => p.id === usageForm.providerId);
    if (!prod || !sp) return;

    try {
      const res = await fetch("/api/crm/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log_usage",
          productId: prod.id,
          productName: prod.name,
          qty: Number(usageForm.qty || 1),
          providerId: sp.id,
          providerName: sp.name,
          remarks: usageForm.remarks
        })
      });
      const d = await res.json();
      if (d.success) {
        setUsageForm({ productId: "", qty: 1, providerId: "", remarks: "" });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveStockPurchase = async () => {
    if (!purchaseVendor) return alert("Please select a vendor.");
    const v = vendorList.find(vn => vn.id === purchaseVendor);

    try {
      const total = purchaseItems.reduce((s, itm) => s + (Number(itm.purchasePrice || 0) * Number(itm.qty || 1)), 0);
      const res = await fetch("/api/crm/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stock_purchase",
          vendorId: purchaseVendor,
          vendorName: v?.name || "Vendor",
          invoiceNo: purchaseInvoice,
          items: purchaseItems.filter(i => i.name),
          total
        })
      });
      const d = await res.json();
      if (d.success) {
        alert("Stock purchase recorded and stock levels updated in DB!");
        setPurchaseItems([{ productId: "", name: "", qty: 1, purchasePrice: 0, salePrice: 0, expiry: "2026-12-31" }]);
        setPurchaseInvoice("");
        setTab("stock");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const delProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/crm/inventory?id=${id}&type=product`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">
            Inventory & Stock Control
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Product catalog, stock valuation, vendor purchases, and in-salon consumption tracking  .
          </p>
        </div>
      </div>

      <div className="crm-tabs">
        <button className={`tab-btn ${tab === 'products' ? 'active' : ''}`} onClick={() => { setTab('products'); setShowAddProd(false); setShowAddVendor(false); }}>
          🏷️ Product Catalog ({productList.length})
        </button>
        <button className={`tab-btn ${tab === 'stock' ? 'active' : ''}`} onClick={() => { setTab('stock'); setShowAddProd(false); setShowAddVendor(false); }}>
          📊 Stock Valuation
        </button>
        <button className={`tab-btn ${tab === 'purchase' ? 'active' : ''}`} onClick={() => { setTab('purchase'); setShowAddProd(false); setShowAddVendor(false); }}>
          📥 Purchase from Vendor
        </button>
        <button className={`tab-btn ${tab === 'usage' ? 'active' : ''}`} onClick={() => { setTab('usage'); setShowAddProd(false); setShowAddVendor(false); }}>
          ✂️ In-Salon Usage ({usageList.length})
        </button>
        <button className={`tab-btn ${tab === 'vendors' ? 'active' : ''}`} onClick={() => { setTab('vendors'); setShowAddProd(false); setShowAddVendor(false); }}>
          🚚 Vendor Directory ({vendorList.length})
        </button>
      </div>

      {loading ? (
        <div className="crm-card py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 animate-pulse">
            Fetching product inventory, stock levels, and vendor records  ...
          </p>
        </div>
      ) : (
        <>
          {/* Product Catalog */}
          {tab === "products" && (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <p className="text-slate-500 text-xs font-bold uppercase">Products Master</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportProductsExcel}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Export products catalog to Excel (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Export Excel</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAddProd(false);
                      setImportModal((prev) => ({ ...prev, open: !prev.open }));
                    }}
                    className={`px-3 py-1.5 border font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${importModal.open ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300'}`}
                    title="Bulk Import Products from Excel (.xlsx)"
                  >
                    {importModal.open ? <X className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5 text-blue-700" />}
                    <span>{importModal.open ? "Close Import" : "Bulk Import"}</span>
                  </button>

                  <button
                    className="btn-gold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                    onClick={() => {
                      setImportModal((prev) => ({ ...prev, open: false }));
                      setShowAddProd(!showAddProd);
                    }}
                  >
                    {showAddProd ? <X size={14} /> : <Plus size={14} />}
                    <span>{showAddProd ? "Close Form" : "Add Product"}</span>
                  </button>
                </div>
              </div>

              {/* ─── IN-PAGE EXPANDABLE: BULK IMPORT PRODUCTS FORM ─── */}
              {importModal.open && (
                <div className="crm-card border-2 border-blue-300 bg-gradient-to-br from-blue-50/40 via-white to-white space-y-5 shadow-lg">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-blue-100 text-blue-800">
                        <FileSpreadsheet className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">Bulk Import Products from Excel (.xlsx)</h3>
                        <p className="text-[11px] text-slate-500">Upload salon retail &amp; backbar items with stocks and sale prices.</p>
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
                      <p className="font-bold text-blue-950">Excel Spreadsheet Headers Required:</p>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        First row must have: <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">Product name</span>, <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">Available in stock</span>, <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">Sale price</span>
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadProductsTemplate}
                      className="text-xs font-bold text-blue-900 bg-white px-3 py-1.5 rounded-xl border border-blue-300 hover:bg-blue-50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <FileDown size={13} className="text-blue-700" />
                      <span>Download Sample Template</span>
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center transition-colors bg-white/70">
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleProductsFileChange}
                      className="hidden"
                      id="product-inpage-file-input"
                    />
                    <label
                      htmlFor="product-inpage-file-input"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center shadow-xs">
                        <Upload size={18} />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {importModal.file ? importModal.file.name : "Click to select Excel spreadsheet (.xlsx)"}
                      </p>
                      <p className="text-[11px] text-slate-400">Standard spreadsheet with header row</p>
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
                          Detected Rows: {importModal.parsedRows.length} Products
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
                              <th>Product Name</th>
                              <th>Available in Stock</th>
                              <th>Sale Price (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importModal.parsedRows.slice(0, 10).map((row, idx) => {
                              const name = row.name || row["Product name"] || row["Product Name"] || row["Name"] || "—";
                              const stock = row.stock || row["Available in stock"] || row["Stock"] || row["Quantity"] || 0;
                              const price = row.salePrice || row["Sale price"] || row["Sale Price"] || row["Price"] || 0;
                              return (
                                <tr key={idx}>
                                  <td className="text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                                  <td className="font-bold text-slate-900">{name}</td>
                                  <td><span className="font-bold text-slate-800 font-mono">{stock} units</span></td>
                                  <td><span className="font-bold text-emerald-800 font-mono">₹{price}</span></td>
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
                      onClick={handleExecuteProductsImport}
                      disabled={importModal.loading || importModal.parsedRows.length === 0}
                    >
                      {importModal.loading ? "Processing..." : `Import ${importModal.parsedRows.length} Products`}
                    </button>
                  </div>
                </div>
              )}

              {/* Add Product In-Page Form (ONLY in Product Catalog Tab) */}
              {showAddProd && (
                <div className="crm-card max-w-4xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-4 shadow-lg">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-700" />
                      <span>Register New Product Item</span>
                    </h3>
                    <button
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                      onClick={() => setShowAddProd(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    <div>
                      <label className="crm-label">Product Name *</label>
                      <input
                        className="crm-input text-xs font-bold"
                        placeholder="e.g. Loreal Mythic Oil"
                        value={prodForm.name || ""}
                        onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="crm-label">MRP (₹) *</label>
                      <input
                        type="number"
                        className="crm-input text-xs font-bold"
                        value={prodForm.mrp || ""}
                        onChange={(e) => setProdForm({ ...prodForm, mrp: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="crm-label">Sale Price (₹)</label>
                      <input
                        type="number"
                        className="crm-input text-xs font-bold text-emerald-800"
                        value={prodForm.salePrice || ""}
                        onChange={(e) => setProdForm({ ...prodForm, salePrice: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="crm-label">Pack Volume</label>
                      <input
                        className="crm-input text-xs"
                        placeholder="e.g. 250"
                        value={prodForm.volume || ""}
                        onChange={(e) => setProdForm({ ...prodForm, volume: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="crm-label">Volume Unit</label>
                      <select
                        className="crm-select text-xs font-semibold"
                        value={prodForm.unit}
                        onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })}
                      >
                        <option>ML</option>
                        <option>GM</option>
                        <option>PCS</option>
                        <option>KG</option>
                      </select>
                    </div>
                    <div>
                      <label className="crm-label">Stock (Units)</label>
                      <input
                        type="number"
                        className="crm-input text-xs font-bold"
                        placeholder="e.g. 10"
                        value={prodForm.stock || ""}
                        onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                    <button className="btn-outline text-xs px-4 cursor-pointer" onClick={() => setShowAddProd(false)}>
                      Cancel
                    </button>
                    <button className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer" onClick={saveProduct}>
                      Save Product
                    </button>
                  </div>
                </div>
              )}

              <div className="crm-card overflow-x-auto">
                {productList.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-600 font-semibold text-sm">No Products Added Yet</p>
                    <p className="text-slate-400 text-xs">Add retail products or salon consumables using the 'Add Product' button.</p>
                  </div>
                ) : (
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>MRP</th>
                        <th>Sale Price</th>
                        <th>Volume / Unit</th>
                        <th>Barcode</th>
                        <th>Reward Points</th>
                        <th>Current Stock</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productList.map((p) => (
                        <tr key={p.id}>
                          <td className="font-bold text-slate-800 text-sm">{p.name}</td>
                          <td className="text-slate-500 text-xs">{formatCurrency(p.mrp)}</td>
                          <td className="text-emerald-700 font-bold text-xs">{formatCurrency(p.salePrice)}</td>
                          <td><span className="badge badge-gray">{p.volume} {p.unit}</span></td>
                          <td className="font-mono text-xs text-amber-800 font-semibold">{p.barcode}</td>
                          <td className="text-amber-800 text-xs font-bold">{p.rewardPoints} pts</td>
                          <td>
                            <span className={`badge ${p.stock < 5 ? 'badge-red font-bold' : 'badge-green'}`}>
                              {p.stock} {p.stock === 1 ? 'Unit' : 'Units'}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setProdForm({
                                    id: p.id,
                                    name: p.name,
                                    mrp: p.mrp,
                                    salePrice: p.salePrice,
                                    volume: p.volume,
                                    unit: p.unit,
                                    barcode: p.barcode,
                                    rewardPoints: p.rewardPoints,
                                    stock: p.stock,
                                  });
                                  setShowAddProd(true);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => delProduct(p.id)}
                                className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Stock Valuation */}
          {tab === "stock" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="crm-card">
                  <p className="crm-label text-slate-400">Total Products Tracked</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{productList.length}</p>
                </div>
                <div className="crm-card">
                  <p className="crm-label text-slate-400">Total Stock Valuation (MRP)</p>
                  <p className="text-2xl font-bold text-amber-800 mt-1">
                    {formatCurrency(productList.reduce((s, p) => s + (p.mrp * p.stock), 0))}
                  </p>
                </div>
                <div className="crm-card">
                  <p className="crm-label text-slate-400">Low Stock Alerts (&lt; 5)</p>
                  <p className="text-2xl font-bold text-rose-600 mt-1">
                    {productList.filter(p => p.stock < 5).length} Items
                  </p>
                </div>
              </div>

              <div className="crm-card overflow-x-auto">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>In Stock</th>
                      <th>Unit Valuation (MRP)</th>
                      <th>Total Value</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productList.map((p) => (
                      <tr key={p.id}>
                        <td className="font-bold text-slate-800 text-xs">{p.name}</td>
                        <td className="font-bold text-slate-900 text-xs">{p.stock} {p.stock === 1 ? 'Unit' : 'Units'}</td>
                        <td className="text-slate-500 text-xs">{formatCurrency(p.mrp)}</td>
                        <td className="font-bold text-amber-800 text-xs">{formatCurrency(p.mrp * p.stock)}</td>
                        <td>
                          {p.stock < 5 ? (
                            <span className="badge badge-red font-bold flex items-center gap-1 w-fit">
                              <AlertTriangle size={10} /> Low Stock
                            </span>
                          ) : (
                            <span className="badge badge-green font-semibold">Healthy</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Purchase from Vendor */}
          {tab === "purchase" && (
            <div className="space-y-4">
              <div className="crm-card space-y-4">
                <p className="section-title">Record Vendor Stock Inward</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="crm-label">Select Vendor Partner *</label>
                    <select
                      className="crm-select text-xs font-semibold"
                      value={purchaseVendor}
                      onChange={(e) => setPurchaseVendor(e.target.value)}
                    >
                      <option value="">-- Choose Supplier Vendor --</option>
                      {vendorList.map((v) => (
                        <option key={v.id} value={v.id}>{v.name} ({v.phone})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="crm-label">Vendor Invoice / Bill No.</label>
                    <input
                      className="crm-input text-xs font-mono font-bold"
                      placeholder="e.g. INV-2026-9812"
                      value={purchaseInvoice}
                      onChange={(e) => setPurchaseInvoice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold text-slate-700">Stock Line Items</p>
                  {purchaseItems.map((itm, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="sm:col-span-2">
                        <select
                          className="crm-select text-xs font-semibold"
                          value={itm.productId}
                          onChange={(e) => {
                            const p = productList.find(pr => pr.id === e.target.value);
                            const copy = [...purchaseItems];
                            copy[idx].productId = e.target.value;
                            copy[idx].name = p?.name || "";
                            copy[idx].purchasePrice = p ? Math.round(p.mrp * 0.7) : 0;
                            copy[idx].salePrice = p?.salePrice || 0;
                            setPurchaseItems(copy);
                          }}
                        >
                          <option value="">-- Choose Product --</option>
                          {productList.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Qty Units"
                          className="crm-input text-xs font-bold"
                          value={itm.qty}
                          onChange={(e) => {
                            const copy = [...purchaseItems];
                            copy[idx].qty = Number(e.target.value);
                            setPurchaseItems(copy);
                          }}
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Purchase Cost ₹"
                          className="crm-input text-xs font-bold"
                          value={itm.purchasePrice}
                          onChange={(e) => {
                            const copy = [...purchaseItems];
                            copy[idx].purchasePrice = Number(e.target.value);
                            setPurchaseItems(copy);
                          }}
                        />
                      </div>
                      <div>
                        <input
                          type="date"
                          className="crm-input text-xs"
                          value={itm.expiry}
                          onChange={(e) => {
                            const copy = [...purchaseItems];
                            copy[idx].expiry = e.target.value;
                            setPurchaseItems(copy);
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-800">
                          {formatCurrency(itm.qty * itm.purchasePrice)}
                        </span>
                        {purchaseItems.length > 1 && (
                          <button
                            onClick={() => setPurchaseItems(purchaseItems.filter((_, i) => i !== idx))}
                            className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setPurchaseItems([...purchaseItems, { productId: "", name: "", qty: 1, purchasePrice: 0, salePrice: 0, expiry: "2026-12-31" }])}
                    className="btn-outline text-xs flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Item Row
                  </button>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    Total Invoice Cost: <strong className="text-slate-900 text-sm">{formatCurrency(purchaseItems.reduce((s, i) => s + (i.purchasePrice * i.qty), 0))}</strong>
                  </p>
                  <button className="btn-gold text-xs" onClick={saveStockPurchase}>
                    Record Purchase &amp; Increase Stock
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* In-Salon Usage */}
          {tab === "usage" && (
            <div className="space-y-4">
              <div className="crm-card space-y-4">
                <p className="section-title">Log Daily In-Salon Consumption</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="crm-label">Product Consumed *</label>
                    <select
                      className="crm-select text-xs font-semibold"
                      value={usageForm.productId}
                      onChange={(e) => setUsageForm({ ...usageForm, productId: e.target.value })}
                    >
                      <option value="">-- Choose Product --</option>
                      {productList.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock} {p.stock === 1 ? 'Unit' : 'Units'})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="crm-label">Qty Consumed *</label>
                    <input
                      type="number"
                      min="1"
                      className="crm-input text-xs font-bold"
                      value={usageForm.qty}
                      onChange={(e) => setUsageForm({ ...usageForm, qty: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="crm-label">Service Provider (Stylist) *</label>
                    <select
                      className="crm-select text-xs font-semibold"
                      value={usageForm.providerId}
                      onChange={(e) => setUsageForm({ ...usageForm, providerId: e.target.value })}
                    >
                      <option value="">-- Assigned Stylist --</option>
                      {staff.map((st) => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="crm-label">Remarks / Service Ref</label>
                    <input
                      className="crm-input text-xs"
                      placeholder="e.g. Used for Luxury Hair Spa"
                      value={usageForm.remarks}
                      onChange={(e) => setUsageForm({ ...usageForm, remarks: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button className="btn-gold text-xs" onClick={addUsage}>
                    Deduct from Stock &amp; Log Usage
                  </button>
                </div>
              </div>

              <div className="crm-card overflow-x-auto">
                <p className="section-title mb-3">Recent In-Salon Consumptions</p>
                {usageList.length === 0 ? (
                  <div className="text-center py-10">
                    <Scissors size={28} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-600 font-semibold text-sm">No Salon Usage Recorded</p>
                    <p className="text-slate-400 text-xs">Internal product consumptions for client services will appear here.</p>
                  </div>
                ) : (
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Service Provider</th>
                        <th>Assigned By</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageList.map((u) => (
                        <tr key={u.id}>
                          <td className="text-slate-500 text-xs">{u.date}</td>
                          <td className="font-bold text-slate-800 text-xs">{u.productName}</td>
                          <td className="font-bold text-amber-800 text-xs">{u.qty}</td>
                          <td className="text-slate-700 text-xs font-semibold">{u.providerName}</td>
                          <td className="text-slate-500 text-xs">{u.assignedBy}</td>
                          <td className="text-slate-600 text-xs">{u.remarks || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Vendors Directory */}
          {tab === "vendors" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-slate-500 text-xs font-bold uppercase">Vendor Partners</p>
                <button
                  className="btn-gold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                  onClick={() => setShowAddVendor(!showAddVendor)}
                >
                  {showAddVendor ? <X size={14} /> : <Plus size={14} />}
                  <span>{showAddVendor ? "Close Form" : "Add Vendor"}</span>
                </button>
              </div>

              {/* Add Vendor In-Page Form (ONLY in Vendors Tab) */}
              {showAddVendor && (
                <div className="crm-card max-w-4xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-4 shadow-lg">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-700" />
                      <span>Add Supplier Vendor</span>
                    </h3>
                    <button
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                      onClick={() => setShowAddVendor(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    <div>
                      <label className="crm-label">Vendor Name *</label>
                      <input
                        className="crm-input text-xs font-bold"
                        placeholder="e.g. Loreal Professional India"
                        value={vendorForm.name}
                        onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="crm-label">Contact Phone *</label>
                      <input
                        className="crm-input text-xs font-bold"
                        placeholder="Mobile / Phone"
                        value={vendorForm.phone}
                        onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="crm-label">Email Address</label>
                      <input
                        type="email"
                        className="crm-input text-xs"
                        placeholder="vendor@company.com"
                        value={vendorForm.email}
                        onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="crm-label">GST Number</label>
                      <input
                        className="crm-input text-xs font-mono uppercase font-bold"
                        placeholder="09AABCL1234F1Z1"
                        value={vendorForm.gst}
                        onChange={(e) => setVendorForm({ ...vendorForm, gst: e.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="crm-label">Address</label>
                      <input
                        className="crm-input text-xs"
                        placeholder="City / Area"
                        value={vendorForm.address}
                        onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                    <button className="btn-outline text-xs px-4 cursor-pointer" onClick={() => setShowAddVendor(false)}>
                      Cancel
                    </button>
                    <button className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer" onClick={saveVendor}>
                      Save Vendor Profile
                    </button>
                  </div>
                </div>
              )}

              <div className="crm-card overflow-x-auto">
                {vendorList.length === 0 ? (
                  <div className="text-center py-12">
                    <Truck size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-600 font-semibold text-sm">No Vendors Registered</p>
                    <p className="text-slate-400 text-xs">Add authorized supplier contacts using the 'Add Vendor' button.</p>
                  </div>
                ) : (
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Vendor Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>GST Number</th>
                        <th>Address</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorList.map((v) => (
                        <tr key={v.id}>
                          <td className="font-bold text-slate-800 text-xs">{v.name}</td>
                          <td className="text-slate-600 text-xs font-semibold">{v.phone}</td>
                          <td className="text-slate-500 text-xs">{v.email || "-"}</td>
                          <td className="font-mono text-xs text-amber-800 font-bold">{v.gst || "-"}</td>
                          <td className="text-slate-500 text-xs">{v.address || "-"}</td>
                          <td>
                            <button
                              onClick={() => {
                                setVendorForm({
                                  id: v.id,
                                  name: v.name,
                                  phone: v.phone,
                                  email: v.email || "",
                                  gst: v.gst || "",
                                  address: v.address || "",
                                } as any);
                                setShowAddVendor(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                              title="Edit Vendor"
                            >
                              <Edit2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
