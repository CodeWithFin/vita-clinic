'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageSquare,
  CreditCard,
  Clock,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Edit2,
  X,
  RefreshCw,
} from 'lucide-react';

interface Template {
  id: number;
  name: string;
  slug: string;
  body: string;
  description: string | null;
  is_system: boolean;
}
interface ReminderSetting {
  id: number;
  reminder_type: string;
  hours_before: number;
  template_slug: string | null;
  enabled: boolean;
}
interface ReportEntry {
  id: number;
  client_id: number | null;
  client_name: string | null;
  phone: string;
  message: string;
  template_slug: string | null;
  status: string;
  failure_reason: string | null;
  sent_at: string;
}
interface ClientForBulk {
  id: number;
  client_id: string;
  name: string;
  phone: string;
}

export default function AdminSMSPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [balance, setBalance] = useState<{ available: number | null; message?: string } | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [reminders, setReminders] = useState<ReminderSetting[]>([]);
  const [report, setReport] = useState<{ recent: ReportEntry[]; summary: { sent: number; failed: number; total: number }; days: number } | null>(null);
  const [clientsForBulk, setClientsForBulk] = useState<ClientForBulk[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateBody, setTemplateBody] = useState('');
  const [templateSaving, setTemplateSaving] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkSelected, setBulkSelected] = useState<Set<number>>(new Set());
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ sent: number; failed: number; skipped: number } | null>(null);

  useEffect(() => {
    if (clientsForBulk.length > 0 && bulkSelected.size === 0 && !bulkResult) setBulkSelected(new Set(clientsForBulk.map((c) => c.id)));
  }, [clientsForBulk.length]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(userData);
    setUser(parsed);
    if (parsed.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [router]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [balRes, tRes, rRes, repRes, cRes] = await Promise.all([
        fetch('/api/sms/balance'),
        fetch('/api/sms/templates'),
        fetch('/api/sms/reminder-settings'),
        fetch('/api/sms/report?limit=30&days=7'),
        fetch('/api/sms/clients-for-bulk?status=active'),
      ]);
      if (balRes.ok) setBalance(await balRes.json());
      if (tRes.ok) setTemplates(await tRes.json());
      if (rRes.ok) setReminders(await rRes.json());
      if (repRes.ok) setReport(await repRes.json());
      if (cRes.ok) setClientsForBulk(await cRes.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchAll();
  }, [user?.role]);

  const handleToggleReminder = async (r: ReminderSetting) => {
    try {
      const res = await fetch('/api/sms/reminder-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id, enabled: !r.enabled }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReminders((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setTemplateSaving(true);
    try {
      const res = await fetch(`/api/sms/templates/${editingTemplate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: templateBody }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTemplates((prev) => prev.map((x) => (x.id === editingTemplate.id ? updated : x)));
        setEditingTemplate(null);
      }
    } catch (e) {
      console.error(e);
    }
    setTemplateSaving(false);
  };

  const handleBulkSend = async () => {
    const ids = Array.from(bulkSelected);
    if (ids.length === 0 || !bulkMessage.trim()) return;
    setBulkSending(true);
    setBulkResult(null);
    try {
      const res = await fetch('/api/sms/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_ids: ids, message: bulkMessage.trim() }),
      });
      const data = await res.json();
      setBulkResult({ sent: data.sent ?? 0, failed: data.failed ?? 0, skipped: data.skipped ?? 0 });
      if (data.sent) fetchAll();
    } catch (e) {
      console.error(e);
      setBulkResult({ sent: 0, failed: 0, skipped: 0 });
    }
    setBulkSending(false);
  };

  if (!user) return null;
  if (user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 p-6 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4 border-b border-stone-800 pb-6">
          <Link href="/dashboard" className="p-2 rounded-sm border border-stone-800 hover:bg-stone-800/50">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif-custom text-2xl text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6" /> SMS Settings
            </h1>
            <p className="text-stone-500 text-sm mt-1">Templates, reminders, balance & bulk send</p>
          </div>
          <button onClick={fetchAll} disabled={loading} className="ml-auto flex items-center gap-2 px-4 py-2 border border-stone-700 rounded-sm hover:bg-stone-800 text-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-stone-500">Loading...</p>
        ) : (
          <>
            {/* Balance */}
            <section className="bg-stone-900/50 border border-stone-800 rounded-sm p-6">
              <h2 className="text-sm uppercase tracking-wider text-stone-500 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Credit balance
              </h2>
              {balance?.available != null ? (
                <p className="text-2xl text-white font-light">{balance.available} credits</p>
              ) : (
                <p className="text-stone-400 text-sm">{balance?.message ?? 'Not configured'}</p>
              )}
            </section>

            {/* Reminder settings */}
            <section className="bg-stone-900/50 border border-stone-800 rounded-sm p-6">
              <h2 className="text-sm uppercase tracking-wider text-stone-500 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Reminder timing
              </h2>
              <ul className="space-y-3">
                {reminders.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2 border-b border-stone-800/50 last:border-0">
                    <span className="text-stone-300">
                      {r.reminder_type.replace(/_/g, ' ')} ({r.hours_before}h before)
                    </span>
                    <button
                      onClick={() => handleToggleReminder(r)}
                      className={`px-3 py-1 rounded text-xs font-medium ${r.enabled ? 'bg-green-900/30 text-green-400' : 'bg-stone-800 text-stone-500'}`}
                    >
                      {r.enabled ? 'On' : 'Off'}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Templates */}
            <section className="bg-stone-900/50 border border-stone-800 rounded-sm p-6">
              <h2 className="text-sm uppercase tracking-wider text-stone-500 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Templates
              </h2>
              <ul className="space-y-3">
                {templates.map((t) => (
                  <li key={t.id} className="border border-stone-800 rounded-sm p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-stone-200">{t.name}</p>
                        <p className="text-stone-500 text-xs mt-1">{t.description || t.slug}</p>
                        <p className="text-stone-400 text-sm mt-2 line-clamp-2">{t.body}</p>
                      </div>
                      <button onClick={() => { setEditingTemplate(t); setTemplateBody(t.body); }} className="p-2 text-stone-500 hover:text-white">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Delivery report */}
            <section className="bg-stone-900/50 border border-stone-800 rounded-sm p-6">
              <h2 className="text-sm uppercase tracking-wider text-stone-500 mb-4">Delivery report (last {report?.days ?? 7} days)</h2>
              {report && (
                <>
                  <div className="flex gap-6 mb-4">
                    <span className="text-green-400">Sent: {report.summary.sent}</span>
                    <span className="text-red-400">Failed: {report.summary.failed}</span>
                    <span className="text-stone-400">Total: {report.summary.total}</span>
                  </div>
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {report.recent.map((e) => (
                      <li key={e.id} className="flex items-center gap-3 py-2 border-b border-stone-800/50 text-sm">
                        {e.status === 'sent' ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                        <span className="text-stone-400 shrink-0">{new Date(e.sent_at).toLocaleString()}</span>
                        <span className="text-stone-300 truncate">{e.client_name || e.phone}</span>
                        <span className="text-stone-500 truncate max-w-[200px]">{e.message}</span>
                        {e.failure_reason && <span className="text-red-400/80 text-xs">{e.failure_reason}</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            {/* Bulk SMS */}
            <section className="bg-stone-900/50 border border-stone-800 rounded-sm p-6">
              <h2 className="text-sm uppercase tracking-wider text-stone-500 mb-4 flex items-center gap-2">
                <Send className="w-4 h-4" /> Bulk SMS
              </h2>
              <p className="text-stone-400 text-sm mb-4">
                {clientsForBulk.length} opted-in clients with phone. {bulkSelected.size} selected.
              </p>
              <div className="max-h-40 overflow-y-auto border border-stone-800 rounded-sm p-2 mb-4">
                <label className="flex items-center gap-2 py-2 text-sm text-stone-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clientsForBulk.length > 0 && bulkSelected.size === clientsForBulk.length}
                    onChange={(e) => setBulkSelected(e.target.checked ? new Set(clientsForBulk.map((c) => c.id)) : new Set())}
                  />
                  Select all / none
                </label>
                {clientsForBulk.slice(0, 100).map((c) => (
                  <label key={c.id} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bulkSelected.has(c.id)}
                      onChange={(e) => {
                        if (e.target.checked) setBulkSelected((s) => new Set([...s, c.id]));
                        else setBulkSelected((s) => { const n = new Set(s); n.delete(c.id); return n; });
                      }}
                    />
                    {c.name} ({c.phone})
                  </label>
                ))}
                {clientsForBulk.length > 100 && <p className="text-stone-500 text-xs py-2">Showing first 100. Toggle &quot;Select all&quot; to include everyone.</p>}
              </div>
              <textarea
                className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-200 text-sm rounded-sm min-h-[80px] mb-4"
                placeholder="Message to send..."
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
                maxLength={500}
              />
              {bulkResult && (
                <p className="text-sm mb-4 text-stone-400">Sent: {bulkResult.sent}, Failed: {bulkResult.failed}, Skipped: {bulkResult.skipped}</p>
              )}
              <button
                onClick={handleBulkSend}
                disabled={!bulkMessage.trim() || bulkSending || bulkSelected.size === 0}
                className="px-4 py-2 bg-[#4A5D4F] text-white rounded-sm hover:bg-[#3d4d41] disabled:opacity-50 text-sm font-medium"
              >
                {bulkSending ? 'Sending...' : `Send to ${bulkSelected.size} client${bulkSelected.size !== 1 ? 's' : ''}`}
              </button>
            </section>
          </>
        )}

        {/* Edit template modal */}
        {editingTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-sm w-full max-w-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-white">Edit template: {editingTemplate.name}</h3>
                <button onClick={() => setEditingTemplate(null)} className="text-stone-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <textarea className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-200 text-sm rounded-sm min-h-[120px]" value={templateBody} onChange={(e) => setTemplateBody(e.target.value)} />
              <div className="flex gap-3">
                <button onClick={handleSaveTemplate} disabled={templateSaving} className="px-4 py-2 bg-[#4A5D4F] text-white rounded-sm hover:bg-[#3d4d41] disabled:opacity-50 text-sm">Save</button>
                <button onClick={() => setEditingTemplate(null)} className="px-4 py-2 border border-stone-700 rounded-sm text-stone-300 text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
