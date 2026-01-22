'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Client {
  id: string;
  clientId: string;
  fullName: string;
  phone: string;
  email?: string;
  status: string;
  createdAt: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [search]);

  const fetchClients = async () => {
    try {
      const url = search
        ? `/api/clients?search=${encodeURIComponent(search)}`
        : '/api/clients';
      const res = await fetch(url);
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif-custom text-4xl text-stone-100 font-light">
            Client Management
          </h1>
          <p className="text-stone-400 mt-2">
            Manage client records and information
          </p>
        </div>
        <button
          onClick={() => setShowNewClientModal(true)}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-sm transition-colors text-sm font-medium uppercase tracking-wider"
        >
          + New Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-stone-950 border border-stone-800 rounded-sm p-6">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, phone, client ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 text-stone-200 pl-12 pr-4 py-3 rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-stone-600"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-stone-950 border border-stone-800 rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500">Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            No clients found. {search && 'Try a different search term or '}
            <button
              onClick={() => setShowNewClientModal(true)}
              className="text-primary hover:underline"
            >
              add a new client
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-stone-900/50 border-b border-stone-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Client ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-stone-900/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-300">
                    {client.clientId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-200">
                    {client.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-400">
                    {client.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-400">
                    {client.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        client.status === 'ACTIVE'
                          ? 'bg-green-900/30 text-green-400'
                          : client.status === 'VIP'
                          ? 'bg-purple-900/30 text-purple-400'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="text-primary hover:text-primary-dark transition-colors"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Client Modal */}
      {showNewClientModal && (
        <NewClientModal
          onClose={() => setShowNewClientModal(false)}
          onSuccess={() => {
            setShowNewClientModal(false);
            fetchClients();
          }}
        />
      )}
    </div>
  );
}

function NewClientModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    skinType: '',
    allergies: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create client:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-800 rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-stone-900 border-b border-stone-800 px-6 py-4 flex items-center justify-between">
          <h2 className="font-serif-custom text-2xl text-stone-100">
            New Client Registration
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full bg-stone-800/50 border border-stone-700 text-stone-200 px-4 py-2 rounded-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full bg-stone-800/50 border border-stone-700 text-stone-200 px-4 py-2 rounded-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-stone-800/50 border border-stone-700 text-stone-200 px-4 py-2 rounded-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="w-full bg-stone-800/50 border border-stone-700 text-stone-200 px-4 py-2 rounded-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full bg-stone-800/50 border border-stone-700 text-stone-200 px-4 py-2 rounded-sm focus:outline-none focus:border-primary"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Skin Type
              </label>
              <select
                value={formData.skinType}
                onChange={(e) =>
                  setFormData({ ...formData, skinType: e.target.value })
                }
                className="w-full bg-stone-800/50 border border-stone-700 text-stone-200 px-4 py-2 rounded-sm focus:outline-none focus:border-primary"
              >
                <option value="">Select...</option>
                <option value="Normal">Normal</option>
                <option value="Dry">Dry</option>
                <option value="Oily">Oily</option>
                <option value="Combination">Combination</option>
                <option value="Sensitive">Sensitive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full bg-stone-800/50 border border-stone-700 text-stone-200 px-4 py-2 rounded-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Emergency Contact Name
              </label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyContact: e.target.value })
                }
                className="w-full bg-stone-800/50 border border-stone-700 text-stone-200 px-4 py-2 rounded-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyPhone: e.target.value })
                }
                className="w-full bg-stone-800/50 border border-stone-700 text-stone-200 px-4 py-2 rounded-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Allergies / Contraindications
            </label>
            <textarea
              value={formData.allergies}
              onChange={(e) =>
                setFormData({ ...formData, allergies: e.target.value })
              }
              rows={2}
              className="w-full bg-stone-800/50 border border-stone-700 text-stone-200 px-4 py-2 rounded-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={2}
              className="w-full bg-stone-800/50 border border-stone-700 text-stone-200 px-4 py-2 rounded-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Register Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
