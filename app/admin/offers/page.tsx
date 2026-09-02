"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  Tag,
  Check,
  X,
  Flame,
  Percent
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface Offer {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  image: string;
  serviceSlug: string;
  subCategoryName: string;
  isActive: boolean;
  order: number;
}

const BADGE_COLORS = [
  { label: "Rose Coral", value: "from-rose-500 to-red-500" },
  { label: "Golden Amber", value: "from-amber-500 to-yellow-500" },
  { label: "Royal Purple", value: "from-purple-500 to-indigo-500" },
  { label: "Emerald Green", value: "from-emerald-500 to-teal-500" },
  { label: "Classic Black", value: "from-gray-800 to-black" },
];

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("MANAGER");

  const [modal, setModal] = useState<{
    open: boolean;
    isEdit: boolean;
    data: Partial<Offer>;
  }>({ open: false, isEdit: false, data: {} });

  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadOffers = async () => {
    try {
      setLoading(true);
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.user) setUserRole(authData.user.role);
      }

      const res = await fetch("/api/offers?all=true");
      const data = await res.json();
      if (data.success) {
        setOffers(data.data);
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isEdit, data } = modal;

    if (!data.title || !data.subtitle || !data.image) {
      showToast("error", "Please fill all required offer fields");
      return;
    }

    try {
      const res = await fetch("/api/offers", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        showToast("success", isEdit ? "Offer updated successfully" : "Offer created successfully");
        setModal({ open: false, isEdit: false, data: {} });
        loadOffers();
      } else {
        showToast("error", result.error || "Failed to save offer");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error occurred");
    }
  };

  const handleToggleActive = async (offer: Offer) => {
    try {
      const res = await fetch("/api/offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: offer.id, isActive: !offer.isActive }),
      });

      const result = await res.json();
      if (result.success) {
        showToast(
          "success",
          `Offer ${!offer.isActive ? "activated" : "hidden"} on live site`
        );
        loadOffers();
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to toggle offer status");
    }
  };

  const handleDeleteOffer = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the offer "${title}"?`)) return;

    try {
      const res = await fetch(`/api/offers?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        showToast("success", "Offer deleted successfully");
        loadOffers();
      } else {
        showToast("error", result.error || "Failed to delete offer");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error occurred");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold ${
            notification.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-purple-50 text-purple-700">
              <Sparkles className="w-6 h-6" />
            </div>
            Exclusive Promotional Offers
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Create, style, and manage promotional deals featured on the homepage carousel.
          </p>
        </div>

        <button
          onClick={() =>
            setModal({
              open: true,
              isEdit: false,
              data: {
                title: "",
                subtitle: "",
                badge: "HOT",
                badgeColor: "from-rose-500 to-red-500",
                image: "",
                serviceSlug: "hair",
                subCategoryName: "Hair Cut",
                isActive: true,
                order: offers.length + 1,
              },
            })
          }
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Offer</span>
        </button>
      </div>

      {/* In-Page Form (Create / Edit) */}
      {modal.open && (
        <div className="crm-card max-w-4xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>{modal.isEdit ? "Edit Promotional Offer" : "Create New Promotional Offer"}</span>
            </h3>
            <button
              onClick={() => setModal({ open: false, isEdit: false, data: {} })}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveOffer} className="space-y-4 text-xs">
            <ImageUploader
              value={modal.data.image || ""}
              onChange={(url) =>
                setModal({
                  ...modal,
                  data: { ...modal.data, image: url },
                })
              }
              category="OFFERS"
              title={modal.data.title || "Offer Banner"}
              label="Promotional Image Banner"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="crm-label">Offer Headline / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50% OFF on Keratin Spa"
                  value={modal.data.title || ""}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      data: { ...modal.data, title: e.target.value },
                    })
                  }
                  className="crm-input text-xs font-bold"
                />
              </div>

              <div>
                <label className="crm-label">Subtitle / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exclusive Weekday Monsoon Special"
                  value={modal.data.subtitle || ""}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      data: { ...modal.data, subtitle: e.target.value },
                    })
                  }
                  className="crm-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="crm-label">Target Service Category Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. hair-spa"
                  value={modal.data.serviceSlug || ""}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      data: { ...modal.data, serviceSlug: e.target.value },
                    })
                  }
                  className="crm-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="crm-label">Target Subcategory Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Keratin & Hair Botox"
                  value={modal.data.subCategoryName || ""}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      data: { ...modal.data, subCategoryName: e.target.value },
                    })
                  }
                  className="crm-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="crm-label">Badge Tag</label>
                <input
                  type="text"
                  placeholder="e.g. HOT, 40% OFF, LIMITED"
                  value={modal.data.badge || ""}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      data: { ...modal.data, badge: e.target.value },
                    })
                  }
                  className="crm-input text-xs font-bold uppercase"
                />
              </div>

              <div>
                <label className="crm-label">Badge Gradient Theme</label>
                <select
                  value={modal.data.badgeColor || BADGE_COLORS[0].value}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      data: { ...modal.data, badgeColor: e.target.value },
                    })
                  }
                  className="crm-select text-xs font-semibold"
                >
                  {BADGE_COLORS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModal({ open: false, isEdit: false, data: {} })}
                className="btn-outline text-xs px-4 cursor-pointer"
              >
                Cancel
              </button>
              <button type="submit" className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer">
                {modal.isEdit ? "Save Changes" : "Create Offer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Offers Cards Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 tracking-wider uppercase font-medium">Loading Offers...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs">
          <p className="text-slate-500 text-sm">No promotional offers created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`bg-white border rounded-3xl overflow-hidden shadow-2xs flex flex-col justify-between transition-all duration-300 ${
                offer.isActive
                  ? "border-slate-200 hover:shadow-md hover:border-slate-300"
                  : "border-slate-200 opacity-60 bg-slate-50"
              }`}
            >
              <div>
                {/* Visual Card Preview */}
                <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Badge */}
                  <div
                    className={`absolute top-3 left-3 bg-gradient-to-r ${offer.badgeColor} text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 z-10`}
                  >
                    {offer.badge === "HOT" ? <Flame className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5" />}
                    {offer.badge}
                  </div>

                  {/* Active status pill */}
                  <button
                    onClick={() => handleToggleActive(offer)}
                    className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 z-10 shadow-xs cursor-pointer ${
                      offer.isActive
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {offer.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{offer.isActive ? "Active" : "Hidden"}</span>
                  </button>

                  <div className="absolute bottom-3 inset-x-3">
                    <p className="text-white/80 text-[10px] tracking-wider uppercase font-medium">
                      {offer.subtitle}
                    </p>
                    <h3 className="text-base font-serif font-bold text-white leading-tight">
                      {offer.title}
                    </h3>
                  </div>
                </div>

                {/* Offer Details */}
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] uppercase tracking-wider font-medium">Service Link:</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {offer.serviceSlug} / {offer.subCategoryName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] uppercase tracking-wider font-medium">Display Priority:</span>
                    <span className="font-mono text-slate-700 font-bold">#{offer.order}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(offer)}
                  className={`text-xs font-semibold px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                    offer.isActive
                      ? "text-slate-600 hover:bg-slate-200/60"
                      : "text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {offer.isActive ? "Deactivate" : "Activate"}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setModal({ open: true, isEdit: true, data: offer });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                    title="Edit Offer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {userRole === "ADMIN" && (
                    <button
                      onClick={() => handleDeleteOffer(offer.id, offer.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Offer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
