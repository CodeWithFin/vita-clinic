'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, AlertCircle, Search, RefreshCcw, Plus } from 'lucide-react';

interface Booking {
  id: number;
  client_name: string;
  phone: string;
  email: string;
  service_type: string;
  appointment_date: string;
  status: string;
}

export default function ReceptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    name: '',
    phone: '',
    service: '',
    date: '',
    time: ''
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const services = [
    "Timeless Facial", "Hydra Facial", "Royal Facial", "Chemical Peels", 
    "Glow Fusion Facial", "Oxygen Facial", "Collagen Peptide Facial", 
    "Deep Treatment Facial", "Anti-Aging Facials", "Vitapharm Special", 
    "Pampering Facial", "Back Massage", "Reflexology", "Soft Tissue Massage", 
    "Deep Tissue Massage", "Body Scrub", "Radio Frequency", "Body Treatments", 
    "LED Light Therapy", "Acne Treatment", "Pigmentation Treatment", 
    "IV Therapy", "Microdermabrasion", "Mesotherapy", "Microneedling", 
    "PRP Microneedling", "Armpits Waxing", "Bikini Waxing", "Body Waxing", 
    "Consultation"
  ];

  const fetchBookings = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await fetch('/api/reception/bookings', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Failed to load bookings', error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    
    // Initial fetch
    fetchBookings();

    // Real-time updates: Poll every 10 seconds
    const interval = setInterval(() => {
        fetchBookings(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBooking) // Resuse public booking logic
        });
        
        if (res.ok) {
            setShowModal(false);
            setNewBooking({ name: '', phone: '', service: '', date: '', time: '' });
            fetchBookings();
        } else {
            alert('Failed to create booking');
        }
    } catch (error) {
        console.error('Booking error', error);
        alert('An error occurred');
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedBooking) return;

    try {
        const res = await fetch(`/api/reception/bookings/${selectedBooking.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            setSelectedBooking(null);
            fetchBookings();
        } else {
            alert('Failed to update status');
        }
    } catch (error) {
        console.error('Update error', error);
    }
  };

  const filteredBookings = bookings.filter(booking => 
    (booking.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (booking.phone || '').includes(searchTerm) ||
    (booking.service_type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'confirmed': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'completed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-stone-400 bg-stone-400/10 border-stone-400/20';
    }
  };

  if (!user) return null; // Or a loading spinner while redirecting

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 py-4 border-b border-stone-800">
          <div>
            <h1 className="font-serif-custom text-3xl text-white">Reception Desk</h1>
            <p className="text-stone-400 text-sm mt-1">Hello, {user.name} • <span className="text-[#4A5D4F] font-medium">{new Date().toDateString()}</span></p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#4A5D4F] text-white rounded-sm hover:bg-[#3d4d41] transition-colors text-sm uppercase tracking-wider font-medium"
            >
                <Plus className="w-4 h-4" />
                New Booking
            </button>
             <button 
                onClick={fetchBookings}
                className="flex items-center gap-2 px-4 py-2 bg-stone-900 border border-stone-800 rounded-sm hover:bg-stone-800 transition-colors text-sm"
            >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
            </button>
            <button 
                onClick={() => {
                    localStorage.clear();
                    router.push('/login');
                }}
                className="px-4 py-2 border border-red-900/50 text-red-400/80 hover:bg-red-950/30 rounded-sm transition-colors text-sm"
            >
                Log Out
            </button>
          </div>
        </div>

        {/* Stats / Overview (Mocked for visual) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-stone-900/50 border border-stone-800 p-4 rounded-sm">
                <span className="text-stone-500 text-xs uppercase tracking-wider">Today's Appointments</span>
                <p className="text-2xl font-light text-white mt-1">{bookings.length}</p>
             </div>
             <div className="bg-stone-900/50 border border-stone-800 p-4 rounded-sm">
                <span className="text-stone-500 text-xs uppercase tracking-wider">Pending</span>
                <p className="text-2xl font-light text-amber-400 mt-1">{bookings.filter(b => b.status === 'pending').length}</p>
             </div>
             <div className="bg-stone-900/50 border border-stone-800 p-4 rounded-sm">
                <span className="text-stone-500 text-xs uppercase tracking-wider">In Service</span>
                <p className="text-2xl font-light text-blue-400 mt-1">0</p>
             </div>
        </div>

        {/* Controls */}
        <div className="flex items-center bg-stone-900 border border-stone-800 px-4 py-2 rounded-sm max-w-md">
            <Search className="w-4 h-4 text-stone-500 mr-2" />
            <input 
                type="text" 
                placeholder="Search Client, Phone, or Service..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-stone-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Table */}
        <div className="border border-stone-800 rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#1c1c1a] text-stone-400 uppercase tracking-wider text-xs font-medium border-b border-stone-800">
                        <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Contacts</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/50">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-stone-500">Loading bookings...</td></tr>
                        ) : filteredBookings.length === 0 ? (
                             <tr><td colSpan={6} className="px-6 py-8 text-center text-stone-500">No bookings found matching your search.</td></tr>
                        ) : (
                            filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-stone-900/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wide border ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-stone-200 font-medium">{formatTime(booking.appointment_date)}</span>
                                            <span className="text-stone-500 text-xs">{formatDate(booking.appointment_date)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 text-xs">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="text-stone-200">{booking.client_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-stone-300">
                                        {booking.service_type}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-xs text-stone-400 gap-1">
                                            {booking.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {booking.phone}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedBooking(booking)}
                                            className="text-stone-500 hover:text-white transition-colors text-xs underline decoration-stone-700 underline-offset-4"
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-stone-900 border border-stone-800 p-8 rounded-sm w-full max-w-md space-y-6 relative">
                    <button 
                        onClick={() => setShowModal(false)}
                        className="absolute top-4 right-4 text-stone-500 hover:text-white"
                    >
                        <XCircle className="w-6 h-6" />
                    </button>
                    
                    <h2 className="font-serif-custom text-2xl text-white">New Appointment</h2>
                    
                    <form onSubmit={handleCreateBooking} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-stone-500">Client Name</label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-300 text-sm rounded-sm"
                                value={newBooking.name}
                                onChange={e => setNewBooking({...newBooking, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-stone-500">Phone</label>
                            <input 
                                required
                                type="tel" 
                                className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-300 text-sm rounded-sm"
                                value={newBooking.phone}
                                onChange={e => setNewBooking({...newBooking, phone: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-stone-500">Service</label>
                            <select 
                                required
                                className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-300 text-sm rounded-sm"
                                value={newBooking.service}
                                onChange={e => setNewBooking({...newBooking, service: e.target.value})}
                            >
                                <option value="">Select Service</option>
                                {services.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase text-stone-500">Date</label>
                                <input 
                                    required
                                    type="date" 
                                    className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-300 text-sm rounded-sm [color-scheme:dark]"
                                    value={newBooking.date}
                                    onChange={e => setNewBooking({...newBooking, date: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase text-stone-500">Time</label>
                                <input 
                                    required
                                    type="time" 
                                    className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-300 text-sm rounded-sm [color-scheme:dark]"
                                    value={newBooking.time}
                                    onChange={e => setNewBooking({...newBooking, time: e.target.value})}
                                />
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="w-full bg-[#4A5D4F] text-white py-3 rounded-sm uppercase tracking-wider text-xs font-medium hover:bg-[#3d4d41] transition-colors"
                        >
                            Confirm Booking
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* Manage Modal */}
        {selectedBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-stone-900 border border-stone-800 p-8 rounded-sm w-full max-w-sm space-y-6 relative">
                    <button 
                        onClick={() => setSelectedBooking(null)}
                        className="absolute top-4 right-4 text-stone-500 hover:text-white"
                    >
                        <XCircle className="w-6 h-6" />
                    </button>
                    
                    <div className="space-y-1">
                        <span className="text-xs uppercase text-stone-500 tracking-wider">Managing Booking</span>
                        <h2 className="font-serif-custom text-2xl text-white">{selectedBooking.client_name}</h2>
                        <p className="text-stone-400 text-sm font-medium text-[#4A5D4F]">{selectedBooking.service_type}</p>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 pb-2">
                             <div className="bg-stone-950/50 p-3 rounded-sm border border-stone-800">
                                <span className="text-[10px] uppercase text-stone-500 tracking-wider block mb-1">Contact</span>
                                <div className="space-y-1">
                                    <p className="text-sm text-stone-300 flex items-center gap-2">
                                        <Phone className="w-3 h-3" /> {selectedBooking.phone || 'N/A'}
                                    </p>
                                    {selectedBooking.email && (
                                        <p className="text-xs text-stone-400 truncate">{selectedBooking.email}</p>
                                    )}
                                </div>
                             </div>
                             <div className="bg-stone-950/50 p-3 rounded-sm border border-stone-800">
                                <span className="text-[10px] uppercase text-stone-500 tracking-wider block mb-1">Time</span>
                                <div className="space-y-1">
                                    <p className="text-sm text-stone-300 flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> {new Date(selectedBooking.appointment_date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-stone-300 flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> {new Date(selectedBooking.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                             </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-stone-800">
                        <p className="text-xs uppercase text-stone-500 tracking-wider">Update Status</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => handleStatusUpdate('confirmed')}
                                className="px-4 py-3 bg-green-900/20 border border-green-900/50 text-green-400 hover:bg-green-900/40 rounded-sm text-xs font-medium uppercase tracking-wide transition-colors"
                            >
                                Confirm
                            </button>
                            <button 
                                onClick={() => handleStatusUpdate('completed')}
                                className="px-4 py-3 bg-blue-900/20 border border-blue-900/50 text-blue-400 hover:bg-blue-900/40 rounded-sm text-xs font-medium uppercase tracking-wide transition-colors"
                            >
                                Complete
                            </button>
                             <button 
                                onClick={() => handleStatusUpdate('pending')}
                                className="px-4 py-3 bg-amber-900/20 border border-amber-900/50 text-amber-400 hover:bg-amber-900/40 rounded-sm text-xs font-medium uppercase tracking-wide transition-colors"
                            >
                                Pending
                            </button>
                            <button 
                                onClick={() => handleStatusUpdate('cancelled')}
                                className="px-4 py-3 bg-red-900/20 border border-red-900/50 text-red-400 hover:bg-red-900/40 rounded-sm text-xs font-medium uppercase tracking-wide transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
