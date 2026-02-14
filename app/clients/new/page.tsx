'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = ['active', 'inactive', 'VIP', 'archived'];
const GENDER_OPTIONS = ['', 'female', 'male', 'other', 'prefer_not_to_say'];

export default function NewClientPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [duplicates, setDuplicates] = useState<Array<{ id: number; client_id: string; name: string; phone: string | null; email: string | null }>>([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: '',
    skin_type: '',
    skin_concerns: '',
    allergies: '',
    contraindications: '',
    status: 'active',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const checkDuplicates = async () => {
    if (!form.phone && !form.email && form.name.length < 2) return;
    const params = new URLSearchParams();
    if (form.phone) params.set('phone', form.phone);
    if (form.email) params.set('email', form.email);
    if (form.name.length >= 2) params.set('name', form.name);
    if (params.toString() === '') return;
    const res = await fetch(`/api/clients/check-duplicates?${params}`);
    const data = await res.json().catch(() => ({}));
    setDuplicates(data.duplicates ?? []);
  };

  useEffect(() => {
    const t = setTimeout(checkDuplicates, 400);
    return () => clearTimeout(t);
  }, [form.phone, form.email, form.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date_of_birth: form.date_of_birth || null,
          gender: form.gender || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          setDuplicates(data.duplicates ?? []);
          setError(data.error || 'A client with this phone or email already exists.');
        } else {
          setError(data.error || 'Failed to create client');
        }
        setSaving(false);
        return;
      }
      router.push(`/clients/${data.id}`);
    } catch {
      setError('Network error');
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 p-6 lg:p-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/clients"
            className="p-2 rounded-sm border border-stone-800 hover:bg-stone-800/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif-custom text-2xl text-white">Register new client</h1>
            <p className="text-stone-500 text-sm">Create a client profile with full details</p>
          </div>
        </div>

        {duplicates.length > 0 && (
          <div className="flex gap-3 p-4 rounded-sm border border-amber-900/50 bg-amber-950/20 text-amber-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Possible duplicate(s) found</p>
              <ul className="mt-2 text-sm text-amber-200/90 space-y-1">
                {duplicates.map((d) => (
                  <li key={d.id}>
                    <Link href={`/clients/${d.id}`} className="underline hover:no-underline">
                      {d.client_id} — {d.name}
                      {d.phone && ` • ${d.phone}`}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-stone-500">You can still submit to create a new record.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-sm border border-red-900/50 bg-red-950/20 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-sm uppercase tracking-wider text-stone-500 border-b border-stone-800 pb-2">
              Basic information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase text-stone-500 mb-1">Full name *</label>
                <input
                  required
                  type="text"
                  className="w-full bg-stone-900 border border-stone-800 px-4 py-2.5 text-stone-200 rounded-sm focus:outline-none focus:border-[#4A5D4F]"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-stone-500 mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full bg-stone-900 border border-stone-800 px-4 py-2.5 text-stone-200 rounded-sm focus:outline-none focus:border-[#4A5D4F]"
                  placeholder="0712345678"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-stone-500 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full bg-stone-900 border border-stone-800 px-4 py-2.5 text-stone-200 rounded-sm focus:outline-none focus:border-[#4A5D4F]"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-stone-500 mb-1">Date of birth</label>
                <input
                  type="date"
                  className="w-full bg-stone-900 border border-stone-800 px-4 py-2.5 text-stone-200 rounded-sm [color-scheme:dark] focus:outline-none focus:border-[#4A5D4F]"
                  value={form.date_of_birth}
                  onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-stone-500 mb-1">Gender</label>
                <select
                  className="w-full bg-stone-900 border border-stone-800 px-4 py-2.5 text-stone-200 rounded-sm focus:outline-none focus:border-[#4A5D4F]"
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                >
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g || '—'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase text-stone-500 mb-1">Address</label>
                <textarea
                  rows={2}
                  className="w-full bg-stone-900 border border-stone-800 px-4 py-2.5 text-stone-200 rounded-sm focus:outline-none focus:border-[#4A5D4F]"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-stone-500 mb-1">Emergency contact name</label>
                <input
                  type="text"
                  className="w-full bg-stone-900 border border-stone-800 px-4 py-2.5 text-stone-200 rounded-sm focus:outline-none focus:border-[#4A5D4F]"
                  value={form.emergency_contact_name}
                  onChange={(e) => setForm((f) => ({ ...f, emergency_contact_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-stone-500 mb-1">Emergency contact phone</label>
                <input
                  type="tel"
                  className="w-full bg-stone-900 border border-stone-800 px-4 py-2.5 text-stone-200 rounded-sm focus:outline-none focus:border-[#4A5D4F]"
                  value={form.emergency_contact_phone}
                  onChange={(e) => setForm((f) => ({ ...f, emergency_contact_phone: e.target.value }))}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm uppercase tracking-wider text-stone-500 border-b border-stone-800 pb-2">
              Clinical & notes
            </h2>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Skin type</label>
              <input
                type="text"
                className="w-full bg-stone-900 border border-stone-800 px-4 py-2.5 text-stone-200 rounded-sm focus:outline-none focus:border-[#4A5D4F]"
                placeholder="e.g. Oily, Combination, Dry"
                value={form.skin_type}
                onChange={(e) => setForm((f) => ({ ...f, skin_type: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Skin concerns</label>
              <textarea
                rows={2}
                className="w-full bg-stone-900 border border-stone-800 px-4 py-2.5 text-stone-200 rounded-sm focus:outline-none focus:border-[#4A5D4F]"
                placeholder="e.g. Acne, pigmentation, sensitivity"
                value={form.skin_concerns}
                onChange={(e) => setForm((f) => ({ ...f, skin_concerns: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Allergies</label>
              <textarea
                rows={2}
                className="w-full bg-stone-900 border border-stone-800 px-4 py-2.5 text-stone-200 rounded-sm focus:outline-none focus:border-[#4A5D4F]"
                value={form.allergies}
                onChange={(e) => setForm((f) => ({ ...f, allergies: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Contraindications</label>
              <textarea
                rows={2}
                className="w-full bg-stone-900 border border-stone-800 px-4 py-2.5 text-stone-200 rounded-sm focus:outline-none focus:border-[#4A5D4F]"
                value={form.contraindications}
                onChange={(e) => setForm((f) => ({ ...f, contraindications: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Notes</label>
              <textarea
                rows={3}
                className="w-full bg-stone-900 border border-stone-800 px-4 py-2.5 text-stone-200 rounded-sm focus:outline-none focus:border-[#4A5D4F]"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-stone-500 mb-1">Status</label>
              <select
                className="w-full bg-stone-900 border border-stone-800 px-4 py-2.5 text-stone-200 rounded-sm focus:outline-none focus:border-[#4A5D4F]"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </section>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="px-6 py-2.5 bg-[#4A5D4F] text-white rounded-sm hover:bg-[#3d4d41] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium uppercase tracking-wider text-sm"
            >
              {saving ? 'Saving...' : 'Create client'}
            </button>
            <Link
              href="/clients"
              className="px-6 py-2.5 border border-stone-700 text-stone-300 rounded-sm hover:bg-stone-800/50 transition-colors font-medium text-sm"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
