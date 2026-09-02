"use client";

import { useState, useEffect } from "react";
import { Send, Plus, Trash2, X, MessageSquare, Phone } from "lucide-react";

export default function AdminSmsPage() {
  const [data, setData] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    clientName: "All Registered Clients",
    phone: "Broadcast Group",
    type: "Promotional Offer",
    channel: "WhatsApp",
    message: "✨ Exclusive festive discounts on all hair and spa packages at Vivazen Beauty Salon! Book now: 7617079955.",
    status: "Sent",
    sentBy: "Super Admin",
    recipientType: "All Clients"
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [sRes, cRes] = await Promise.all([
        fetch("/api/crm/sms"),
        fetch("/api/crm/clients")
      ]);

      if (sRes.ok) {
        const d = await sRes.json();
        if (d.success) setData(d.data || []);
      }
      if (cRes.ok) {
        const d = await cRes.json();
        if (d.success) setClients(d.data || []);
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

  const sendBroadcast = async () => {
    if (!form.message.trim()) return alert("Message content cannot be empty.");

    try {
      const res = await fetch("/api/crm/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const d = await res.json();
      if (d.success) {
        setShowBroadcast(false);
        setForm({
          clientName: "All Registered Clients",
          phone: "Broadcast Group",
          type: "Promotional Offer",
          channel: "WhatsApp",
          message: "✨ Exclusive festive discounts on all hair and spa packages at Vivazen Beauty Salon! Book now: 7617079955.",
          status: "Sent",
          sentBy: "Super Admin",
          recipientType: "All Clients"
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">SMS &amp; WhatsApp Broadcasts</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Bulk notifications, appointment reminders, and promotional campaigns logged in PostgreSQL database.
          </p>
        </div>
        <button
          className="btn-gold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          onClick={() => setShowBroadcast(!showBroadcast)}
        >
          {showBroadcast ? <X size={14} /> : <Send size={14} />}
          <span>{showBroadcast ? "Close Form" : "Send Broadcast"}</span>
        </button>
      </div>

      {/* ─── IN-PAGE EXPANDABLE: DISPATCH BROADCAST FORM ─── */}
      {showBroadcast && (
        <div className="crm-card max-w-4xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-700" />
              <span>Dispatch Bulk Broadcast Campaign</span>
            </h3>
            <button
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              onClick={() => setShowBroadcast(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="crm-label">Broadcast Channel</label>
              <select
                className="crm-select text-xs font-semibold"
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
              >
                <option>WhatsApp</option>
                <option>SMS</option>
              </select>
            </div>
            <div>
              <label className="crm-label">Target Audience</label>
              <select
                className="crm-select text-xs font-semibold"
                value={form.recipientType}
                onChange={(e) => {
                  setForm({
                    ...form,
                    recipientType: e.target.value,
                    clientName: e.target.value === "All Clients" ? "All Registered Clients" : "VIP Members",
                    phone: "Broadcast Group"
                  });
                }}
              >
                <option value="All Clients">All Clients ({clients.length} Recipients)</option>
                <option value="VIP Members">VIP Loyalty Members</option>
              </select>
            </div>
            <div>
              <label className="crm-label">Campaign Type</label>
              <select
                className="crm-select text-xs font-semibold"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option>Promotional Offer</option>
                <option>Festive Greetings</option>
                <option>Service Discount</option>
                <option>Re-engagement</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="crm-label">Message Content</label>
              <textarea
                className="crm-input text-xs"
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button className="btn-outline text-xs px-4 cursor-pointer" onClick={() => setShowBroadcast(false)}>
              Cancel
            </button>
            <button className="btn-gold text-xs px-6 font-bold shadow-md cursor-pointer" onClick={sendBroadcast}>
              Dispatch Campaign Now
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="crm-card overflow-x-auto">
        {data.length === 0 ? (
          <div className="text-center py-14">
            <Send size={36} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-bold text-sm">No Broadcast Logs Recorded</p>
            <p className="text-slate-400 text-xs mt-0.5">Dispatched SMS and WhatsApp logs will appear here automatically.</p>
          </div>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Recipient / Group</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Channel</th>
                <th>Message Content</th>
                <th>Status</th>
                <th>Sender</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="text-slate-600 text-xs whitespace-nowrap">{s.date}</td>
                  <td className="font-bold text-slate-800 text-xs">{s.clientName}</td>
                  <td className="text-slate-600 text-xs font-mono">{s.phone}</td>
                  <td><span className="badge badge-purple">{s.type}</span></td>
                  <td><span className="badge badge-blue">{s.channel}</span></td>
                  <td className="max-w-md text-slate-700 text-xs italic truncate">"{s.message}"</td>
                  <td><span className="badge badge-green">{s.status}</span></td>
                  <td className="text-slate-500 text-xs">{s.sentBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
