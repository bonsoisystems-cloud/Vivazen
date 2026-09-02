"use client";

import { useState, useEffect } from "react";
import { Sliders, MessageSquare, Plus, Trash2, Save, CheckCircle2, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<"software" | "communication">("software");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    remindBirthday: true,
    remindAnniversary: true,
    remindAppointments: true,
    remindPendingPayments: true,
    remindPackageExpiry: true,
    redeemPointsThreshold: 100,
    pricePerPoint: 1.0,
    maxRedeemPoints: 500,
    holidays: [{ date: "2026-08-15", description: "Independence Day" }, { date: "2026-10-02", description: "Gandhi Jayanti" }],
    officialWhatsappEnabled: false,
    officialWhatsappApiUrl: "https://graph.facebook.com/v20.0/",
    officialWhatsappPhoneId: "",
    officialWhatsappToken: "",
    scannerWhatsappEnabled: true,
    scannerWhatsappApiUrl: "https://wap.shivsofts.com/",
    scannerWhatsappInstanceId: "",
    scannerWhatsappToken: ""
  });

  const [testPhone, setTestPhone] = useState("7617079955");
  const [testingWa, setTestingWa] = useState(false);
  const [waTestResult, setWaTestResult] = useState<any>(null);

  const handleTestWhatsApp = async () => {
    setTestingWa(true);
    setWaTestResult(null);
    try {
      const res = await fetch("/api/crm/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: testPhone,
          apiUrl: form.officialWhatsappApiUrl,
          phoneId: form.officialWhatsappPhoneId,
          token: form.officialWhatsappToken
        })
      });
      const data = await res.json();
      setWaTestResult(data);
    } catch (err: any) {
      setWaTestResult({ error: err.message || "Network error" });
    } finally {
      setTestingWa(false);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/crm/settings");
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.data) {
          setForm({
            ...form,
            ...d.data,
            holidays: Array.isArray(d.data.holidays) ? d.data.holidays : form.holidays
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/crm/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const d = await res.json();
      if (d.success) {
        showToastMsg("Settings successfully saved to database!");
        loadSettings();
      } else {
        alert(d.error || "Failed to save settings");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while saving settings");
    } finally {
      setSaving(false);
    }
  };

  const addHolidayRow = () => {
    setForm({
      ...form,
      holidays: [...form.holidays, { date: new Date().toISOString().split("T")[0], description: "" }]
    });
  };

  const updateHoliday = (idx: number, field: "date" | "description", val: string) => {
    const copy = [...form.holidays];
    copy[idx][field] = val;
    setForm({ ...form, holidays: copy });
  };

  const removeHoliday = (idx: number) => {
    setForm({
      ...form,
      holidays: form.holidays.filter((_: any, i: number) => i !== idx)
    });
  };

  return (
    <div className="fade-in space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">
            Salon & Communication Settings
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Configure system-wide automations, customer loyalty point rules, shop holiday calendars, and WhatsApp API gateways.
          </p>
        </div>
        <button
          className="btn-gold text-xs px-5 py-2.5 font-bold flex items-center gap-2 shadow-sm"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={14} /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="crm-tabs">
        <button
          className={`tab-btn ${tab === 'software' ? 'active' : ''}`}
          onClick={() => setTab('software')}
        >
          ⚙️ Software Setting
        </button>
        <button
          className={`tab-btn ${tab === 'communication' ? 'active' : ''}`}
          onClick={() => setTab('communication')}
        >
          💬 Communication Setting
        </button>
      </div>

      {tab === "software" && (
        <div className="space-y-6">
          {/* Automatic Reminders Checkboxes */}
          <div className="crm-card">
            <p className="section-title mb-1">Automatic Customer Reminders</p>
            <p className="text-slate-400 text-xs mb-4">Toggle automated background triggers sent to registered clients.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: "remindBirthday", label: "Birthday Greetings & Vouchers" },
                { key: "remindAnniversary", label: "Anniversary Wishes" },
                { key: "remindAppointments", label: "Appointment Confirmations" },
                { key: "remindPendingPayments", label: "Pending Payment Reminders" },
                { key: "remindPackageExpiry", label: "Package Expiry Notices" },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${form[item.key]
                      ? "bg-amber-50/70 border-amber-300 text-amber-900 font-bold shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-amber-800 rounded border-slate-300 focus:ring-amber-500"
                    checked={Boolean(form[item.key])}
                    onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })}
                  />
                  <span className="text-xs">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Loyalty Reward Points Configuration */}
          <div className="crm-card">
            <p className="section-title mb-1">Redeem Points Setting (Loyalty Program)</p>
            <p className="text-slate-400 text-xs mb-4">Configure point valuation rules used during POS billing invoice checkout.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="crm-label">Min Points Threshold to Redeem</label>
                <input
                  type="number"
                  className="crm-input text-xs font-bold"
                  value={form.redeemPointsThreshold}
                  onChange={(e) => setForm({ ...form, redeemPointsThreshold: Number(e.target.value) })}
                />
                <p className="text-slate-400 text-[10px] mt-1">Minimum points needed before a customer can redeem.</p>
              </div>
              <div>
                <label className="crm-label">Price per Point (₹)</label>
                <input
                  type="number"
                  step="0.1"
                  className="crm-input text-xs font-bold text-amber-800"
                  value={form.pricePerPoint}
                  onChange={(e) => setForm({ ...form, pricePerPoint: Number(e.target.value) })}
                />
                <p className="text-slate-400 text-[10px] mt-1">Monetary value for 1 loyalty reward point (e.g. ₹1.00).</p>
              </div>
              <div>
                <label className="crm-label">Max Redeem Points per Bill</label>
                <input
                  type="number"
                  className="crm-input text-xs font-bold text-emerald-800"
                  value={form.maxRedeemPoints}
                  onChange={(e) => setForm({ ...form, maxRedeemPoints: Number(e.target.value) })}
                />
                <p className="text-slate-400 text-[10px] mt-1">Maximum points that can be deducted on a single invoice.</p>
              </div>
            </div>
          </div>

          {/* Salon Holiday List */}
          <div className="crm-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="section-title">List of Salon Holidays</p>
                <p className="text-slate-400 text-xs">Dates when salon operations are closed.</p>
              </div>
              <button className="btn-outline text-xs" onClick={addHolidayRow}>
                <Plus size={13} /> Add Holiday
              </button>
            </div>

            {form.holidays.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">No holidays added yet.</p>
            ) : (
              <div className="space-y-2.5">
                {form.holidays.map((h: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-12 gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 items-center">
                    <div className="col-span-4 sm:col-span-3">
                      <input
                        type="date"
                        className="crm-input text-xs font-bold"
                        value={h.date}
                        onChange={(e) => updateHoliday(idx, "date", e.target.value)}
                      />
                    </div>
                    <div className="col-span-7 sm:col-span-8">
                      <input
                        type="text"
                        className="crm-input text-xs font-semibold"
                        placeholder="Holiday description (e.g. Diwali, Holi)..."
                        value={h.description}
                        onChange={(e) => updateHoliday(idx, "description", e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <button className="btn-danger p-2" onClick={() => removeHoliday(idx)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "communication" && (
        <div className="space-y-6">
          {/* Meta Official Cloud API Setup */}
          <div className="crm-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="section-title">Official WhatsApp (Meta Cloud API)</p>
                <p className="text-slate-400 text-xs">Official WhatsApp Business Cloud API integration.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <span>Enable Official API</span>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-amber-800 rounded"
                  checked={Boolean(form.officialWhatsappEnabled)}
                  onChange={(e) => setForm({ ...form, officialWhatsappEnabled: e.target.checked })}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="crm-label">API Base URL</label>
                <input
                  className="crm-input text-xs font-mono"
                  value={form.officialWhatsappApiUrl}
                  onChange={(e) => setForm({ ...form, officialWhatsappApiUrl: e.target.value })}
                />
              </div>
              <div>
                <label className="crm-label">Meta Phone Number ID</label>
                <input
                  className="crm-input text-xs font-mono font-bold"
                  placeholder="e.g. 104829384729102"
                  value={form.officialWhatsappPhoneId}
                  onChange={(e) => setForm({ ...form, officialWhatsappPhoneId: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="crm-label">Meta Permanent Access Token</label>
                <textarea
                  className="crm-input text-xs font-mono"
                  rows={2}
                  placeholder="EAAG..."
                  value={form.officialWhatsappToken}
                  onChange={(e) => setForm({ ...form, officialWhatsappToken: e.target.value })}
                />
              </div>
            </div>

            {/* Test WhatsApp Cloud API Connection */}
            <div className="pt-4 border-t border-stone-200/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-stone-800">Test WhatsApp Cloud API Connection</p>
                  <p className="text-[11px] text-stone-400 font-light">Verify token permissions and dispatch a test message to a mobile number.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    className="crm-input text-xs w-44 font-mono font-medium"
                    placeholder="10-digit mobile"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                  <button
                    type="button"
                    disabled={testingWa}
                    onClick={handleTestWhatsApp}
                    className="px-4 py-2 rounded-xl bg-[#25d366]/15 hover:bg-[#25d366]/25 text-[#128c7e] border border-[#25d366]/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all disabled:opacity-50"
                  >
                    <MessageSquare size={13} className="text-[#25d366]" />
                    <span>{testingWa ? "Testing API..." : "Test Connection"}</span>
                  </button>
                </div>
              </div>

              {waTestResult && (
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-stone-700">Test Diagnostic Results:</span>
                    {waTestResult.tokenInfo?.is_valid ? (
                      <span className="text-[#2d5a42] bg-[#f2f7f4] border border-[#d5e5db] px-2 py-0.5 rounded-md">
                        ✓ Valid Meta Token (App: {waTestResult.tokenInfo?.application || 'MBGAPI'})
                      </span>
                    ) : (
                      <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                        Token Inspection Failed
                      </span>
                    )}
                  </div>

                  {waTestResult.sendResult?.success ? (
                    <div className="p-2.5 rounded-lg bg-[#f2f7f4] border border-[#d5e5db] text-[#2d5a42]">
                      <strong>Success!</strong> Test WhatsApp message dispatched successfully. (Message ID: {waTestResult.sendResult.messageId})
                    </div>
                  ) : waTestResult.sendResult?.error ? (
                    <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-900 space-y-1">
                      <p className="font-bold">⚠️ Meta API Response: {waTestResult.sendResult.error}</p>
                      {waTestResult.sendResult.error.includes("Object with ID") && (
                        <p className="text-[11px] text-amber-800">
                          <strong>Required Action in Meta Business Manager:</strong> Go to <a href="https://business.facebook.com/settings/system-users" target="_blank" rel="noreferrer" className="underline font-bold text-amber-900">Business Settings &gt; System Users &gt; api</a>, click <strong>"Add Assets"</strong>, select <strong>"WhatsApp Accounts"</strong>, and assign your WhatsApp Account with Full Control.
                        </p>
                      )}
                    </div>
                  ) : null}

                  {Array.isArray(waTestResult.assignedAccounts) && waTestResult.assignedAccounts.length === 0 && (
                    <p className="text-[11px] text-stone-500">
                      ℹ️ System User has no assigned WhatsApp accounts yet. Ensure your WhatsApp Account is assigned to system user <code>api</code> in Meta Business Settings.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Un-Official Scanner API Setup */}
          <div className="crm-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="section-title">Un-Official WhatsApp (QR Scanner API)</p>
                <p className="text-slate-400 text-xs">Direct scanner gateway for instant messages without Meta template approvals.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <span>Enable Scanner API</span>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-amber-800 rounded"
                  checked={Boolean(form.scannerWhatsappEnabled)}
                  onChange={(e) => setForm({ ...form, scannerWhatsappEnabled: e.target.checked })}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="crm-label">Scanner Gateway URL</label>
                <input
                  className="crm-input text-xs font-mono"
                  value={form.scannerWhatsappApiUrl}
                  onChange={(e) => setForm({ ...form, scannerWhatsappApiUrl: e.target.value })}
                />
              </div>
              <div>
                <label className="crm-label">Instance ID</label>
                <input
                  className="crm-input text-xs font-mono font-bold"
                  placeholder="e.g. 64B0A..."
                  value={form.scannerWhatsappInstanceId}
                  onChange={(e) => setForm({ ...form, scannerWhatsappInstanceId: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="crm-label">Access Token / API Key</label>
                <input
                  className="crm-input text-xs font-mono"
                  placeholder="Token key..."
                  value={form.scannerWhatsappToken}
                  onChange={(e) => setForm({ ...form, scannerWhatsappToken: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
