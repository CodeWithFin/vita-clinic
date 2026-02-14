'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Edit2,
  Save,
  X,
  AlertCircle,
} from 'lucide-react';

interface Client {
  id: number;
  client_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
  skin_type: string | null;
  skin_concerns: string | null;
  allergies: string | null;
  contraindications: string | null;
  status: string;
  total_spent: string | number;
  visit_count: number;
  visit_history: Array<{ id: number; service_type: string; appointment_date: string; status: string }>;
  service_history: Array<{ date: string; service: string; status: string; appointment_id: number }>;
}

const STATUS_OPTIONS = ['active', 'inactive', 'VIP', 'archived'];

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [user, setUser] = useState<{ role: string; id?: number } | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<Client>>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => {
    if (!id || !user) return;
    fetch(`/api/clients/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setClient(data);
        setForm(data ? {
          name: data.name,
          phone: data.phone,
          email: data.email,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          address: data.address,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          notes: data.notes,
          skin_type: data.skin_type,
          skin_concerns: data.skin_concerns,
          allergies: data.allergies,
          contraindications: data.contraindications,
          status: data.status,
        } : {});
      })
      .catch(() => setClient(null))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to update');
        setSaving(false);
        return;
      }
      setClient(data);
      setForm({
        name: data.name,
        phone: data.phone,
        email: data.email,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        address: data.address,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        notes: data.notes,
        skin_type: data.skin_type,
        skin_concerns: data.skin_concerns,
        allergies: data.allergies,
        contraindications: data.contraindications,
        status: data.status,
      });
      setEditing(false);
    } catch {
      setError('Network error');
    }
    setSaving(false);
  };

  if (!user) return null;
  if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Loading...</div>;
  if (!client) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Client not found.</div>;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 p-6 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/clients"
              className="p-2 rounded-sm border border-stone-800 hover:bg-stone-800/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif-custom text-2xl text-white">{client.name}</h1>
                <span className="font-mono text-stone-500 text-sm">{client.client_id}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide border ${
                    client.status === 'VIP' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                    client.status === 'active' ? 'text-green-400/80 bg-green-400/10 border-green-400/20' :
                    'text-stone-400 bg-stone-400/10 border-stone-400/20'
                  }`}
                >
                  {client.status}
                </span>
              </div>
              <p className="text-stone-500 text-sm mt-1">
                {client.visit_count ?? 0} visits
                {client.total_spent != null && Number(client.total_spent) > 0 && (
                  <> • Total spent: Ksh {Number(client.total_spent).toLocaleString()}</>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A5D4F] text-white rounded-sm hover:bg-[#3d4d41] disabled:opacity-50 text-sm font-medium">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditing(false); setForm(client); setError(''); }} className="inline-flex items-center gap-2 px-4 py-2 border border-stone-700 rounded-sm text-stone-300 hover:bg-stone-800 text-sm font-medium">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 px-4 py-2 border border-stone-700 rounded-sm text-stone-300 hover:bg-stone-800 text-sm font-medium">
                <Edit2 className="w-4 h-4" /> Edit profile
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-sm border border-red-900/50 bg-red-950/20 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section className="bg-stone-900/50 border border-stone-800 rounded-sm p-6">
              <h2 className="text-sm uppercase tracking-wider text-stone-500 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> Contact & details
              </h2>
              {editing ? (
                <div className="space-y-4">
                  <div><label className="text-xs text-stone-500">Name</label><input type="text" className="w-full mt-1 bg-stone-950 border border-stone-800 px-3 py-2 text-stone-200 rounded-sm" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
                  <div><label className="text-xs text-stone-500">Phone</label><input type="tel" className="w-full mt-1 bg-stone-950 border border-stone-800 px-3 py-2 text-stone-200 rounded-sm" value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
                  <div><label className="text-xs text-stone-500">Email</label><input type="email" className="w-full mt-1 bg-stone-950 border border-stone-800 px-3 py-2 text-stone-200 rounded-sm" value={form.email ?? ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
                  <div><label className="text-xs text-stone-500">Date of birth</label><input type="date" className="w-full mt-1 bg-stone-950 border border-stone-800 px-3 py-2 text-stone-200 rounded-sm [color-scheme:dark]" value={form.date_of_birth ?? ''} onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))} /></div>
                  <div><label className="text-xs text-stone-500">Gender</label><input type="text" className="w-full mt-1 bg-stone-950 border border-stone-800 px-3 py-2 text-stone-200 rounded-sm" value={form.gender ?? ''} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} /></div>
                  <div><label className="text-xs text-stone-500">Address</label><textarea rows={2} className="w-full mt-1 bg-stone-950 border border-stone-800 px-3 py-2 text-stone-200 rounded-sm" value={form.address ?? ''} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
                  <div><label className="text-xs text-stone-500">Emergency contact</label><input type="text" className="w-full mt-1 bg-stone-950 border border-stone-800 px-3 py-2 text-stone-200 rounded-sm" value={form.emergency_contact_name ?? ''} onChange={(e) => setForm((f) => ({ ...f, emergency_contact_name: e.target.value }))} placeholder="Name" /></div>
                  <div><input type="tel" className="w-full mt-1 bg-stone-950 border border-stone-800 px-3 py-2 text-stone-200 rounded-sm" value={form.emergency_contact_phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, emergency_contact_phone: e.target.value }))} placeholder="Phone" /></div>
                  <div><label className="text-xs text-stone-500">Status</label><select className="w-full mt-1 bg-stone-950 border border-stone-800 px-3 py-2 text-stone-200 rounded-sm" value={form.status ?? 'active'} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>{STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                </div>
              ) : (
                <dl className="space-y-3 text-sm">
                  {(client.phone || client.email) && (
                    <>
                      {client.phone && <div className="flex items-center gap-2 text-stone-300"><Phone className="w-4 h-4 text-stone-500" /> {client.phone}</div>}
                      {client.email && <div className="flex items-center gap-2 text-stone-300"><Mail className="w-4 h-4 text-stone-500" /> {client.email}</div>}
                    </>
                  )}
                  {client.date_of_birth && <div className="flex items-center gap-2 text-stone-400"><Calendar className="w-4 h-4 text-stone-500" /> {new Date(client.date_of_birth).toLocaleDateString()}</div>}
                  {client.gender && <div className="text-stone-400">Gender: {client.gender}</div>}
                  {client.address && <div className="flex items-start gap-2 text-stone-400"><MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" /> {client.address}</div>}
                  {(client.emergency_contact_name || client.emergency_contact_phone) && (
                    <div className="pt-2 border-t border-stone-800 text-stone-500 text-xs uppercase tracking-wider">Emergency</div>
                  )}
                  {client.emergency_contact_name && <div className="text-stone-400">{client.emergency_contact_name}</div>}
                  {client.emergency_contact_phone && <div className="text-stone-400">{client.emergency_contact_phone}</div>}
                  {!client.phone && !client.email && !client.address && !client.date_of_birth && !client.emergency_contact_name && <p className="text-stone-600">No contact details yet.</p>}
                </dl>
              )}
            </section>

            <section className="bg-stone-900/50 border border-stone-800 rounded-sm p-6">
              <h2 className="text-sm uppercase tracking-wider text-stone-500 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Clinical & notes
              </h2>
              {editing ? (
                <div className="space-y-4">
                  <div><label className="text-xs text-stone-500">Skin type</label><input type="text" className="w-full mt-1 bg-stone-950 border border-stone-800 px-3 py-2 text-stone-200 rounded-sm" value={form.skin_type ?? ''} onChange={(e) => setForm((f) => ({ ...f, skin_type: e.target.value }))} /></div>
                  <div><label className="text-xs text-stone-500">Skin concerns</label><textarea rows={2} className="w-full mt-1 bg-stone-950 border border-stone-800 px-3 py-2 text-stone-200 rounded-sm" value={form.skin_concerns ?? ''} onChange={(e) => setForm((f) => ({ ...f, skin_concerns: e.target.value }))} /></div>
                  <div><label className="text-xs text-stone-500">Allergies</label><textarea rows={2} className="w-full mt-1 bg-stone-950 border border-stone-800 px-3 py-2 text-stone-200 rounded-sm" value={form.allergies ?? ''} onChange={(e) => setForm((f) => ({ ...f, allergies: e.target.value }))} /></div>
                  <div><label className="text-xs text-stone-500">Contraindications</label><textarea rows={2} className="w-full mt-1 bg-stone-950 border border-stone-800 px-3 py-2 text-stone-200 rounded-sm" value={form.contraindications ?? ''} onChange={(e) => setForm((f) => ({ ...f, contraindications: e.target.value }))} /></div>
                  <div><label className="text-xs text-stone-500">Notes</label><textarea rows={3} className="w-full mt-1 bg-stone-950 border border-stone-800 px-3 py-2 text-stone-200 rounded-sm" value={form.notes ?? ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
                </div>
              ) : (
                <dl className="space-y-2 text-sm text-stone-400">
                  {client.skin_type && <div><span className="text-stone-500">Skin type:</span> {client.skin_type}</div>}
                  {client.skin_concerns && <div><span className="text-stone-500">Concerns:</span> {client.skin_concerns}</div>}
                  {client.allergies && <div><span className="text-stone-500">Allergies:</span> {client.allergies}</div>}
                  {client.contraindications && <div><span className="text-stone-500">Contraindications:</span> {client.contraindications}</div>}
                  {client.notes && <div className="pt-2 border-t border-stone-800 whitespace-pre-wrap">{client.notes}</div>}
                  {!client.skin_type && !client.skin_concerns && !client.allergies && !client.contraindications && !client.notes && <p className="text-stone-600">No clinical notes yet.</p>}
                </dl>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-stone-900/50 border border-stone-800 rounded-sm p-6">
              <h2 className="text-sm uppercase tracking-wider text-stone-500 mb-4">Visit history</h2>
              {client.visit_history?.length ? (
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {client.visit_history.map((v: { id: number; service_type: string; appointment_date: string; status: string }) => (
                    <li key={v.id} className="flex justify-between items-center py-2 border-b border-stone-800/50 text-sm">
                      <span className="text-stone-300">{v.service_type}</span>
                      <span className="text-stone-500">{new Date(v.appointment_date).toLocaleDateString()} • {v.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-stone-600 text-sm">No visits yet.</p>
              )}
            </section>
            <section className="bg-stone-900/50 border border-stone-800 rounded-sm p-6">
              <h2 className="text-sm uppercase tracking-wider text-stone-500 mb-4">Service history</h2>
              {client.service_history?.length ? (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {client.service_history.map((s: { date: string; service: string; status: string }, i: number) => (
                    <li key={i} className="flex justify-between text-sm text-stone-400">
                      <span>{s.service}</span>
                      <span>{new Date(s.date).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-stone-600 text-sm">No services recorded yet.</p>
              )}
            </section>
            {user.role === 'receptionist' && (
              <Link
                href={`/reception?book=${client.id}`}
                className="block w-full text-center py-3 bg-[#4A5D4F] text-white rounded-sm hover:bg-[#3d4d41] transition-colors text-sm font-medium uppercase tracking-wider"
              >
                Book appointment
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
