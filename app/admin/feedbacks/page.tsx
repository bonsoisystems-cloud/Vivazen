"use client";

import { useState, useMemo, useEffect } from "react";
import { Star, Plus, Trash2, X, MessageSquareQuote, Send, RefreshCw, CheckCircle2, MessageSquare, Globe, Sparkles, Zap, Clock, ShieldCheck, Check } from "lucide-react";

export default function AdminFeedbacksPage() {
  const [activeTab, setActiveTab] = useState<"google" | "csat">("google");

  // Google Reviews state
  const [googleReviews, setGoogleReviews] = useState<any[]>([]);
  const [googleLoading, setGoogleLoading] = useState(true);
  const [showAddGoogle, setShowAddGoogle] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [bulkReplying, setBulkReplying] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "replied" | "unreplied" | "critical">("all");

  const [googleForm, setGoogleForm] = useState({
    authorName: "",
    rating: 5,
    text: "",
    relativeTime: "Recently",
    isPublishedOnWeb: true,
  });

  // CSAT Feedback state
  const [csatData, setCsatData] = useState<any[]>([]);
  const [csatLoading, setCsatLoading] = useState(true);
  const [showAddCsat, setShowAddCsat] = useState(false);

  const [csatForm, setCsatForm] = useState({
    billNo: "",
    clientName: "",
    email: "",
    overall: 5,
    timely: 5,
    support: 5,
    satisfaction: 5,
    serviceRating: 5,
    review: "",
    suggestion: "",
  });

  // Load Google Reviews
  const loadGoogleReviews = async () => {
    try {
      setGoogleLoading(true);
      const res = await fetch("/api/crm/google-reviews");
      if (res.ok) {
        const d = await res.json();
        if (d.success) setGoogleReviews(d.data || []);
      }
    } catch (err) {
      console.error("Error loading Google reviews:", err);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Load In-Salon CSAT Feedbacks
  const loadCsatData = async () => {
    try {
      setCsatLoading(true);
      const res = await fetch("/api/crm/feedbacks");
      if (res.ok) {
        const d = await res.json();
        if (d.success) setCsatData(d.data || []);
      }
    } catch (err) {
      console.error("Error loading CSAT feedbacks:", err);
    } finally {
      setCsatLoading(false);
    }
  };

  useEffect(() => {
    loadGoogleReviews();
    loadCsatData();
  }, []);

  // Generate customized Gemini AI response
  const generateAiReply = async (revTarget?: any) => {
    const target = revTarget || replyingTo;
    if (!target) return;

    try {
      setGeneratingAi(true);
      const res = await fetch("/api/crm/google-reviews/auto-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: target.id,
          authorName: target.authorName,
          rating: target.rating,
          text: target.text,
        }),
      });
      const d = await res.json();
      if (d.success && d.data?.replyText) {
        setReplyText(d.data.replyText);
      } else {
        alert(d.error || "Failed to generate AI response");
      }
    } catch (err) {
      console.error("Error generating Gemini AI reply:", err);
    } finally {
      setGeneratingAi(false);
    }
  };

  // Bulk Auto-Reply to all unanswered reviews using Gemini
  const handleBulkAutoReply = async () => {
    const unansweredCount = googleReviews.filter((r) => !r.replyText).length;
    if (unansweredCount === 0) {
      return alert("All reviews already have replies!");
    }

    if (!confirm(`Generate and publish Gemini AI replies for all ${unansweredCount} unanswered reviews?`)) {
      return;
    }

    try {
      setBulkReplying(true);
      const res = await fetch("/api/crm/google-reviews/auto-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulkAll: true }),
      });
      const d = await res.json();
      if (d.success) {
        alert(d.message || "Auto-replies generated and published successfully!");
        loadGoogleReviews();
      } else {
        alert(d.error || "Bulk auto-reply failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBulkReplying(false);
    }
  };

  // Save new Google Review
  const saveGoogleReview = async () => {
    if (!googleForm.authorName.trim() || !googleForm.text.trim()) {
      return alert("Author Name and Review Text are required.");
    }

    try {
      const res = await fetch("/api/crm/google-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleForm),
      });
      const d = await res.json();
      if (d.success) {
        setShowAddGoogle(false);
        setGoogleForm({
          authorName: "",
          rating: 5,
          text: "",
          relativeTime: "Recently",
          isPublishedOnWeb: true,
        });
        loadGoogleReviews();
      } else {
        alert(d.error || "Failed to save review");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Reply to Google Review
  const submitReply = async () => {
    if (!replyingTo || !replyText.trim()) {
      return alert("Please enter a reply message.");
    }

    try {
      setReplySubmitting(true);
      const res = await fetch("/api/crm/google-reviews/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: replyingTo.id,
          replyText: replyText.trim(),
        }),
      });
      const d = await res.json();
      if (d.success) {
        setReplyingTo(null);
        setReplyText("");
        loadGoogleReviews();
      } else {
        alert(d.error || "Failed to submit reply");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReplySubmitting(false);
    }
  };

  // Delete Google Review
  const deleteGoogleReview = async (id: string) => {
    if (!confirm("Delete this Google review entry?")) return;
    try {
      const res = await fetch(`/api/crm/google-reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) loadGoogleReviews();
    } catch (err) {
      console.error(err);
    }
  };

  // Save In-Salon CSAT Feedback
  const saveCsatFeedback = async () => {
    if (!csatForm.billNo.trim() || !csatForm.clientName.trim()) {
      return alert("Bill Number and Client Name are required.");
    }

    try {
      const res = await fetch("/api/crm/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(csatForm),
      });
      const d = await res.json();
      if (d.success) {
        setShowAddCsat(false);
        setCsatForm({
          billNo: "",
          clientName: "",
          email: "",
          overall: 5,
          timely: 5,
          support: 5,
          satisfaction: 5,
          serviceRating: 5,
          review: "",
          suggestion: "",
        });
        loadCsatData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete CSAT Feedback
  const deleteCsatFeedback = async (id: string) => {
    if (!confirm("Delete feedback entry?")) return;
    try {
      const res = await fetch(`/api/crm/feedbacks?id=${id}`, { method: "DELETE" });
      if (res.ok) loadCsatData();
    } catch (err) {
      console.error(err);
    }
  };

  // Google Rating Stats & Reply Tracking
  const googleStats = useMemo(() => {
    if (googleReviews.length === 0) return { avg: "5.0", fiveStars: 0, count: 0, repliedCount: 0, unrepliedCount: 0, criticalCount: 0, replyRate: 100 };
    const fiveStars = googleReviews.filter((r) => Number(r.rating) === 5).length;
    const repliedCount = googleReviews.filter((r) => Boolean(r.replyText && r.replyText.trim())).length;
    const unrepliedCount = googleReviews.length - repliedCount;
    const criticalCount = googleReviews.filter((r) => Number(r.rating) <= 3).length;
    const sum = googleReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    const replyRate = Math.round((repliedCount / googleReviews.length) * 100);

    return {
      avg: (sum / googleReviews.length).toFixed(1),
      fiveStars,
      count: googleReviews.length,
      repliedCount,
      unrepliedCount,
      criticalCount,
      replyRate,
    };
  }, [googleReviews]);

  // Filtered reviews based on reply status tab
  const filteredGoogleReviews = useMemo(() => {
    return googleReviews.filter((r) => {
      const hasReply = Boolean(r.replyText && r.replyText.trim());
      if (reviewFilter === "replied") return hasReply;
      if (reviewFilter === "unreplied") return !hasReply;
      if (reviewFilter === "critical") return Number(r.rating) <= 3;
      return true;
    });
  }, [googleReviews, reviewFilter]);

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">
            Reviews, Feedbacks &amp; Google Reputation
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Manage Google Business Profile reviews, reply automatically with Gemini AI, and track CSAT scores.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {activeTab === "google" ? (
            <>
              <button
                onClick={handleBulkAutoReply}
                disabled={bulkReplying}
                className="btn-gold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Auto-reply to all unanswered reviews with Gemini AI"
              >
                <Zap className={`w-3.5 h-3.5 ${bulkReplying ? "animate-spin" : ""}`} />
                <span>{bulkReplying ? "Generating AI Replies..." : "Auto-Reply All (AI)"}</span>
              </button>

              <button
                onClick={loadGoogleReviews}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Refresh reviews"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${googleLoading ? "animate-spin" : ""}`} />
                <span>Sync</span>
              </button>

              <button
                onClick={() => setShowAddGoogle(true)}
                className="crm-btn-primary flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Review</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAddCsat(true)}
              className="crm-btn-primary flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add CSAT Feedback</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("google")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === "google"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Google Business Reviews</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 font-bold">
            {googleReviews.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("csat")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === "csat"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <MessageSquareQuote className="w-4 h-4" />
          <span>In-Salon CSAT Feedbacks</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
            {csatData.length}
          </span>
        </button>
      </div>

      {/* TAB 1: GOOGLE REVIEWS */}
      {activeTab === "google" && (
        <div className="space-y-6">
          {/* Stats Bar with Reply Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="crm-card flex items-center gap-4 p-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold text-lg font-serif">
                ★
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Rating</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xl font-bold font-serif text-slate-900">{googleStats.avg}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="crm-card flex items-center gap-4 p-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Reviews</p>
                <p className="text-xl font-bold font-serif text-slate-900 mt-0.5">{googleStats.count}</p>
              </div>
            </div>

            <div className="crm-card flex items-center gap-4 p-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Owner Replied</p>
                <p className="text-xl font-bold font-serif text-emerald-700 mt-0.5">
                  {googleStats.repliedCount} <span className="text-xs text-slate-400 font-sans font-semibold">({googleStats.replyRate}%)</span>
                </p>
              </div>
            </div>

            <div className="crm-card flex items-center gap-4 p-4">
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${
                googleStats.unrepliedCount > 0 ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Awaiting Reply</p>
                <p className={`text-xl font-bold font-serif mt-0.5 ${
                  googleStats.unrepliedCount > 0 ? 'text-amber-800' : 'text-slate-700'
                }`}>
                  {googleStats.unrepliedCount}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Filter Pill Buttons for Reply Tracking (Minimal Luxury) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setReviewFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                reviewFilter === "all"
                  ? "bg-[#2c2723] text-white shadow-xs font-semibold"
                  : "bg-white border border-[#ebe6df] text-stone-600 hover:bg-[#faf8f5]"
              }`}
            >
              <span>All Reviews</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${reviewFilter === 'all' ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-600'}`}>
                {googleReviews.length}
              </span>
            </button>

            <button
              onClick={() => setReviewFilter("replied")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                reviewFilter === "replied"
                  ? "bg-[#f2f7f4] text-[#2d5a42] border border-[#d5e5db] font-semibold"
                  : "bg-white border border-[#ebe6df] text-stone-600 hover:bg-[#f2f7f4]"
              }`}
            >
              <CheckCircle2 size={13} className="text-[#2d5a42]" />
              <span>Replied</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#e4efe8] text-[#2d5a42]">
                {googleStats.repliedCount}
              </span>
            </button>

            <button
              onClick={() => setReviewFilter("unreplied")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                reviewFilter === "unreplied"
                  ? "bg-[#fcf7ee] text-[#8a571c] border border-[#edd9bd] font-semibold"
                  : "bg-white border border-[#ebe6df] text-stone-600 hover:bg-[#fcf7ee]"
              }`}
            >
              <Clock size={13} className="text-[#8a571c]" />
              <span>Awaiting Reply</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#f5ebd7] text-[#8a571c]">
                {googleStats.unrepliedCount}
              </span>
            </button>

            <button
              onClick={() => setReviewFilter("critical")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                reviewFilter === "critical"
                  ? "bg-[#faf3f3] text-[#873e3e] border border-[#edd4d4] font-semibold"
                  : "bg-white border border-[#ebe6df] text-stone-600 hover:bg-[#faf3f3]"
              }`}
            >
              <span>Needs Escalation (≤3★)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#f4dede] text-[#873e3e]">
                {googleStats.criticalCount}
              </span>
            </button>
          </div>

          {/* Google Reviews Table / Cards */}
          <div className="crm-card overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Google Business Profile Review Feed</h2>
              <span className="text-xs text-slate-500">
                5-Star reviews automatically display on the public website Testimonials
              </span>
            </div>

            {googleLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading reviews...</div>
            ) : googleReviews.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <p className="font-serif text-base text-slate-800">No reviews found in the database.</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click &quot;Add Review&quot; to add real customer reviews or configure Google Places API credentials in <code>.env</code>.
                </p>
                <button
                  onClick={() => setShowAddGoogle(true)}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl press-tactile"
                >
                  Add First Review
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredGoogleReviews.map((rev) => {
                  const isLow = Number(rev.rating) <= 3;
                  const hasReply = Boolean(rev.replyText && rev.replyText.trim());

                  return (
                    <div key={rev.id} className="p-5 hover:bg-slate-50/50 transition-colors space-y-3">
                      <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            isLow ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-700"
                          }`}>
                            {(rev.authorName || "G")
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-slate-900">{rev.authorName}</h3>
                              <div className="flex gap-0.5">
                                {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                                ))}
                              </div>
                              {hasReply ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                                  <CheckCircle2 size={10} className="text-emerald-700" />
                                  <span>Replied</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 border border-amber-200 text-amber-900 text-[10px] font-bold">
                                  <Clock size={10} className="text-amber-700" />
                                  <span>Awaiting Reply</span>
                                </span>
                              )}
                              {isLow && (
                                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold">
                                  Escalation Needed (≤3★)
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {rev.relativeTime || "Recently"} • {rev.source || "Google Business Profile"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setReplyingTo(rev);
                              setReplyText(rev.replyText || "");
                              if (!rev.replyText) {
                                generateAiReply(rev);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors ${
                              hasReply
                                ? "bg-white hover:bg-stone-50 text-stone-700 border border-[#ebe6df]"
                                : "bg-[#faf6ee] hover:bg-[#f5ecdd] text-[#7a5426] border border-[#ecdcc4]"
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#9a733e]" />
                            <span>{hasReply ? "Edit Reply" : "AI Reply"}</span>
                          </button>

                          <button
                            onClick={() => deleteGoogleReview(rev.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Review text */}
                      <p className="text-xs text-slate-700 leading-relaxed font-light pl-13">
                        &ldquo;{rev.text}&rdquo;
                      </p>

                      {/* Reply banner if present */}
                      {rev.replyText && (
                        <div className="ml-13 p-3.5 rounded-xl bg-gradient-to-r from-emerald-50/80 via-slate-50 to-amber-50/40 border border-emerald-200/90 space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="font-bold text-slate-900">
                                Response dispatched by: {rev.repliedBy || "VivaZen Concierge (Gemini AI)"}
                              </span>
                              <span className="text-[10px] text-slate-400">→ to {rev.authorName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                <Check size={10} /> Live on Google &amp; Web
                              </span>
                              {rev.repliedAt && (
                                <span className="text-slate-400 font-mono text-[10px]">
                                  {new Date(rev.repliedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-800 leading-relaxed pl-3.5 border-l-2 border-emerald-400">
                            {rev.replyText}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: IN-SALON CSAT FEEDBACKS */}
      {activeTab === "csat" && (
        <div className="space-y-6">
          <div className="crm-card overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">In-Salon Client Feedback Slips</h2>
            </div>

            {csatLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading CSAT records...</div>
            ) : csatData.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p className="font-serif text-base text-slate-800">No in-salon feedback slips recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Bill No</th>
                      <th>Client Name</th>
                      <th>Overall</th>
                      <th>Timeliness</th>
                      <th>Support</th>
                      <th>Satisfaction</th>
                      <th>Review &amp; Notes</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csatData.map((fb) => (
                      <tr key={fb.id}>
                        <td className="font-mono font-bold text-slate-900">{fb.billNo}</td>
                        <td className="font-semibold text-slate-900">{fb.clientName}</td>
                        <td>
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {fb.overall || 5}
                          </span>
                        </td>
                        <td>{fb.timely || 5}/5</td>
                        <td>{fb.support || 5}/5</td>
                        <td>{fb.satisfaction || 5}/5</td>
                        <td className="text-xs text-slate-600 max-w-xs truncate">{fb.review || fb.suggestion || "—"}</td>
                        <td className="font-mono text-xs">{fb.date}</td>
                        <td>
                          <button
                            onClick={() => deleteCsatFeedback(fb.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Reply to Google Review with Gemini AI */}
      {replyingTo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reply to Review</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Author: {replyingTo.authorName} ({replyingTo.rating}★)
                </p>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-700 italic border border-slate-200">
              &ldquo;{replyingTo.text}&rdquo;
            </div>

            {/* AI Generation Action */}
            <div className="flex items-center justify-between">
              <label className="crm-label mb-0">Response Message (max 30-40 words)</label>
              <button
                type="button"
                onClick={() => generateAiReply()}
                disabled={generatingAi}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-rose-50 to-amber-50 hover:from-rose-100 hover:to-amber-100 border border-rose-200 text-rose-700 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3 h-3 text-rose-600 ${generatingAi ? "animate-spin" : ""}`} />
                <span>{generatingAi ? "Generating..." : "✨ Re-Generate with Gemini AI"}</span>
              </button>
            </div>

            <div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Writing tailored response..."
                rows={4}
                className="crm-input resize-none text-xs leading-relaxed"
              />
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                <span>
                  {Number(replyingTo.rating) <= 3
                    ? "⚠️ Low Rating review: Asking for bill details & prioritizing happiness over money."
                    : "🌟 High Rating review: Personalized appreciation message."}
                </span>
                <span>{replyText.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setReplyingTo(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={submitReply}
                disabled={replySubmitting}
                className="crm-btn-primary flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{replySubmitting ? "Sending..." : "Publish Reply"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Review */}
      {showAddGoogle && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Customer Review</h3>
              <button
                onClick={() => setShowAddGoogle(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="crm-label">Client / Reviewer Name *</label>
                <input
                  type="text"
                  value={googleForm.authorName}
                  onChange={(e) => setGoogleForm({ ...googleForm, authorName: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="crm-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="crm-label">Rating</label>
                  <select
                    value={googleForm.rating}
                    onChange={(e) => setGoogleForm({ ...googleForm, rating: Number(e.target.value) })}
                    className="crm-input"
                  >
                    <option value={5}>5 Stars (Show on website)</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
                <div>
                  <label className="crm-label">Relative Time</label>
                  <input
                    type="text"
                    value={googleForm.relativeTime}
                    onChange={(e) => setGoogleForm({ ...googleForm, relativeTime: e.target.value })}
                    placeholder="e.g. 2 weeks ago"
                    className="crm-input"
                  />
                </div>
              </div>

              <div>
                <label className="crm-label">Review Message *</label>
                <textarea
                  value={googleForm.text}
                  onChange={(e) => setGoogleForm({ ...googleForm, text: e.target.value })}
                  placeholder="Paste the review message here..."
                  rows={4}
                  className="crm-input resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddGoogle(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button onClick={saveGoogleReview} className="crm-btn-primary cursor-pointer">
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add In-Salon CSAT Feedback */}
      {showAddCsat && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add CSAT Feedback Slip</h3>
              <button
                onClick={() => setShowAddCsat(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="crm-label">Bill Number *</label>
                  <input
                    type="text"
                    value={csatForm.billNo}
                    onChange={(e) => setCsatForm({ ...csatForm, billNo: e.target.value })}
                    placeholder="INV-001"
                    className="crm-input"
                  />
                </div>
                <div>
                  <label className="crm-label">Client Name *</label>
                  <input
                    type="text"
                    value={csatForm.clientName}
                    onChange={(e) => setCsatForm({ ...csatForm, clientName: e.target.value })}
                    placeholder="Client name"
                    className="crm-input"
                  />
                </div>
              </div>

              <div>
                <label className="crm-label">Overall Rating (1-5)</label>
                <select
                  value={csatForm.overall}
                  onChange={(e) => setCsatForm({ ...csatForm, overall: Number(e.target.value) })}
                  className="crm-input"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor</option>
                  <option value={1}>1 - Bad</option>
                </select>
              </div>

              <div>
                <label className="crm-label">Client Review / Comments</label>
                <textarea
                  value={csatForm.review}
                  onChange={(e) => setCsatForm({ ...csatForm, review: e.target.value })}
                  placeholder="Feedback comments..."
                  rows={3}
                  className="crm-input resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddCsat(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button onClick={saveCsatFeedback} className="crm-btn-primary cursor-pointer">
                Save Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
