'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus, User, Phone, ArrowLeft } from 'lucide-react';

interface ClientRow {
  id: number;
  client_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: string;
  total_spent: string | number;
  visit_count: number;
  created_at: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
    if (!user) return;
    const q = new URLSearchParams();
    if (search.trim()) q.set('q', search.trim());
    if (statusFilter) q.set('status', statusFilter);
    fetch(`/api/clients?${q}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, [user, search, statusFilter]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 p-6 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href={user.role === 'receptionist' ? '/reception' : '/dashboard'}
              className="p-2 rounded-sm border border-stone-800 hover:bg-stone-800/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-serif-custom text-2xl text-white">Clients</h1>
              <p className="text-stone-500 text-sm">Search and manage client records</p>
            </div>
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A5D4F] text-white rounded-sm hover:bg-[#3d4d41] transition-colors text-sm font-medium uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            Register client
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="text"
              placeholder="Search by name, phone, email, or client ID..."
              className="w-full bg-stone-900 border border-stone-800 pl-10 pr-4 py-2.5 text-sm text-stone-200 placeholder:text-stone-600 rounded-sm focus:outline-none focus:border-[#4A5D4F]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-stone-900 border border-stone-800 px-4 py-2.5 text-sm text-stone-300 rounded-sm focus:outline-none focus:border-[#4A5D4F]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="VIP">VIP</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="border border-stone-800 rounded-sm overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 text-center text-stone-500">Loading...</div>
          ) : clients.length === 0 ? (
            <div className="px-6 py-12 text-center text-stone-500">
              No clients found. Register a new client to get started.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1c1c1a] text-stone-400 uppercase tracking-wider text-xs font-medium border-b border-stone-800">
                <tr>
                  <th className="px-6 py-4">Client ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Visits</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/50">
                {clients.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-stone-900/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-stone-400">{c.client_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center">
                          <User className="w-4 h-4 text-stone-500" />
                        </div>
                        <span className="font-medium text-stone-200">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-400">
                      <div className="flex flex-col gap-0.5">
                        {c.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {c.phone}
                          </span>
                        )}
                        {c.email && <span className="text-xs">{c.email}</span>}
                        {!c.phone && !c.email && <span className="text-stone-600">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wide border ${
                          c.status === 'VIP'
                            ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                            : c.status === 'active'
                              ? 'text-green-400/80 bg-green-400/10 border-green-400/20'
                              : 'text-stone-400 bg-stone-400/10 border-stone-400/20'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-400">{c.visit_count ?? 0}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/clients/${c.id}`}
                        className="text-[#4A5D4F] hover:underline text-xs font-medium uppercase tracking-wider"
                      >
                        View profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
