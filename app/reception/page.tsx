'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar as CalendarIcon, Clock, User, Phone, CheckCircle, XCircle, Search, RefreshCcw, Plus, Users, List, LayoutGrid } from 'lucide-react';
import { getTotalDurationMinutes } from '@/lib/service-durations';

interface Booking {
  id: number;
  client_name: string;
  phone: string;
  email: string;
  service_type: string;
  appointment_date: string;
  status: string;
  user_id?: number;
  client_id?: number;
  provider_id?: number | null;
  notes?: string | null;
  appointment_type?: string | null;
  cancellation_reason?: string | null;
  services?: { service_type: string; duration_minutes?: number }[];
}

interface QueueItem {
    id: number;
    ticket_number: string;
    client_name: string;
    phone: string;
    user_id: number;
    client_id?: number;
    created_at: string;
}

interface ClientOption {
  id: number;
  client_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: string;
}

interface PatientRecord {
    id: number;
    content: string;
    created_at: string;
}

export default function ReceptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [newRecord, setNewRecord] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<'client' | 'service'>('client');
  const [clientSearch, setClientSearch] = useState('');
  const [clientSearchResults, setClientSearchResults] = useState<ClientOption[]>([]);
  const [clientSearching, setClientSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  const [manageTab, setManageTab] = useState<'status' | 'records'>('status');

  const [newBooking, setNewBooking] = useState({
    name: '',
    phone: '',
    service: '',
    services: [] as string[],
    date: '',
    time: '',
    provider_id: '' as string | number,
    appointment_type: 'treatment',
    notes: '',
    recurrence_rule: '' as string,
    recurrence_end_date: '',
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [providers, setProviders] = useState<{ id: number; name: string }[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarMode, setCalendarMode] = useState<'day' | 'week' | 'month'>('month');
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingCancelBooking, setPendingCancelBooking] = useState<Booking | null>(null);
  const [showWaitingListModal, setShowWaitingListModal] = useState(false);
  const [waitingListPreferredDate, setWaitingListPreferredDate] = useState('');

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

  const fetchQueue = async () => {
      try {
          setQueueLoading(true);
          const res = await fetch('/api/queue', { cache: 'no-store' });
          if (res.ok) {
              const data = await res.json();
              setQueue(data);
          }
      } catch (error) {
          console.error("Queue fetch error", error);
      } finally {
          setQueueLoading(false);
      }
  };

  const fetchRecords = async (booking: Booking) => {
      try {
          setRecordsLoading(true);
          if (booking.client_id) {
              const res = await fetch(`/api/clients/${booking.client_id}/records`, { cache: 'no-store' });
              if (res.ok) {
                  const data = await res.json();
                  setPatientRecords(Array.isArray(data) ? data : []);
              }
          } else if (booking.user_id) {
              const res = await fetch(`/api/patients/${booking.user_id}/records`, { cache: 'no-store' });
              if (res.ok) {
                  const data = await res.json();
                  setPatientRecords(data);
              }
          } else {
              setPatientRecords([]);
          }
      } catch (error) {
          console.error("Records fetch error", error);
      } finally {
          setRecordsLoading(false);
      }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchBookings();
    fetchQueue();
    fetch('/api/providers').then(r => r.json()).then(d => setProviders(Array.isArray(d) ? d : [])).catch(() => {});
    const interval = setInterval(() => {
        fetchBookings(true);
        fetchQueue();
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (!clientSearch.trim()) {
      setClientSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setClientSearching(true);
      try {
        const res = await fetch(`/api/clients?q=${encodeURIComponent(clientSearch.trim())}`);
        const data = await res.json().catch(() => []);
        setClientSearchResults(Array.isArray(data) ? data : []);
      } catch {
        setClientSearchResults([]);
      } finally {
        setClientSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [clientSearch]);

  const totalDuration = newBooking.services.length > 0
    ? getTotalDurationMinutes(newBooking.services)
    : newBooking.service ? getTotalDurationMinutes([newBooking.service]) : 0;
  useEffect(() => {
    if (!newBooking.date || !newBooking.provider_id || totalDuration < 1) {
      setAvailableSlots([]);
      return;
    }
    setSlotsLoading(true);
    fetch(`/api/providers/available-slots?date=${newBooking.date}&provider_id=${newBooking.provider_id}&duration=${totalDuration}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setAvailableSlots(Array.isArray(d) ? d : []))
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [newBooking.date, newBooking.provider_id, totalDuration]);

  useEffect(() => {
      if (selectedBooking && (selectedBooking.client_id || selectedBooking.user_id)) {
          setManageTab('status');
          fetchRecords(selectedBooking);
      } else {
          setPatientRecords([]);
      }
  }, [selectedBooking]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const servicesToSend = newBooking.services?.length ? newBooking.services : (newBooking.service ? [newBooking.service] : []);
    if (servicesToSend.length === 0) {
      alert('Select at least one service');
      return;
    }
    try {
        if (selectedClient) {
            const res = await fetch('/api/reception/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: selectedClient.id,
                    services: servicesToSend,
                    service: servicesToSend[0],
                    date: newBooking.date,
                    time: newBooking.time,
                    provider_id: newBooking.provider_id || undefined,
                    appointment_type: newBooking.appointment_type,
                    notes: newBooking.notes || undefined,
                    recurrence_rule: newBooking.recurrence_rule || undefined,
                    recurrence_end_date: newBooking.recurrence_end_date || undefined,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                setShowModal(false);
                setBookingStep('client');
                setSelectedClient(null);
                setNewBooking({ name: '', phone: '', service: '', services: [], date: '', time: '', provider_id: '', appointment_type: 'treatment', notes: '', recurrence_rule: '', recurrence_end_date: '' });
                fetchBookings();
            } else if (res.status === 409) {
                setShowWaitingListModal(true);
                setWaitingListPreferredDate(newBooking.date);
            } else {
                alert(data.error || 'Failed to create booking');
            }
        } else {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newBooking.name, phone: newBooking.phone, service: servicesToSend[0], date: newBooking.date, time: newBooking.time }),
            });
            if (res.ok) {
                setShowModal(false);
                setNewBooking({ name: '', phone: '', service: '', services: [], date: '', time: '', provider_id: '', appointment_type: 'treatment', notes: '', recurrence_rule: '', recurrence_end_date: '' });
                fetchBookings();
            } else {
                alert('Failed to create booking');
            }
        }
    } catch (error) {
        console.error('Booking error', error);
        alert('An error occurred');
    }
  };

  const handleStatusUpdate = async (newStatus: string, cancellationReason?: string) => {
    const booking = pendingCancelBooking || selectedBooking;
    if (!booking) return;

    try {
        const res = await fetch(`/api/reception/bookings/${booking.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: newStatus,
              ...(newStatus === 'cancelled' && cancellationReason != null ? { cancellation_reason: cancellationReason } : {}),
            }),
        });

        if (res.ok) {
            setSelectedBooking(null);
            setPendingCancelBooking(null);
            setShowCancelModal(false);
            setCancelReason('');
            fetchBookings();
        } else {
            alert('Failed to update status');
        }
    } catch (error) {
        console.error('Update error', error);
    }
  };

  const requestCancel = () => {
    if (selectedBooking) {
      setPendingCancelBooking(selectedBooking);
      setShowCancelModal(true);
    }
  };

  const handleQueueAction = async (id: number) => {
      try {
          const res = await fetch(`/api/queue/${id}`, { method: 'DELETE' });
          if (res.ok) {
              fetchQueue();
          }
      } catch (error) {
          console.error("Queue action error", error);
      }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newRecord.trim()) return;
      const hasClientId = selectedBooking?.client_id != null;
      const hasUserId = selectedBooking?.user_id != null;
      if (!hasClientId && !hasUserId) return;

      try {
          const authorId = user?.id ?? null;
          const body = { content: newRecord, author_id: authorId };
          const url = hasClientId
              ? `/api/clients/${selectedBooking!.client_id}/records`
              : `/api/patients/${selectedBooking!.user_id}/records`;
          const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
          });
          if (res.ok) {
              setNewRecord('');
              fetchRecords(selectedBooking!);
          }
      } catch (error) {
          console.error("Add record error", error);
      }
  };

  const handleBookNextVisit = () => {
      if (!selectedBooking) return;
      if (selectedBooking.client_id) {
          setSelectedClient({
              id: selectedBooking.client_id,
              client_id: '',
              name: selectedBooking.client_name,
              phone: selectedBooking.phone ?? null,
              email: selectedBooking.email ?? null,
              status: 'active',
          });
          setBookingStep('service');
      } else {
          setSelectedClient(null);
          setNewBooking({
              name: selectedBooking.client_name,
              phone: selectedBooking.phone ?? '',
              service: '',
              date: '',
              time: ''
          });
          setBookingStep('service');
      }
      setSelectedBooking(null);
      setShowModal(true);
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
             <Link
                href="/clients"
                className="flex items-center gap-2 px-4 py-2 border border-stone-700 text-stone-300 rounded-sm hover:bg-stone-800 transition-colors text-sm uppercase tracking-wider font-medium"
            >
                Clients
            </Link>
             <button 
                onClick={() => { setShowModal(true); setBookingStep('client'); setSelectedClient(null); setClientSearch(''); setClientSearchResults([]); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#4A5D4F] text-white rounded-sm hover:bg-[#3d4d41] transition-colors text-sm uppercase tracking-wider font-medium"
            >
                <Plus className="w-4 h-4" />
                New Booking
            </button>
             <button 
                onClick={() => { fetchBookings(); fetchQueue(); }}
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

        {/* Stats / Overview with Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
             {/* Left Column: Stats */}
             <div className="lg:col-span-3 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-stone-900/50 border border-stone-800 p-4 rounded-sm">
                        <span className="text-stone-500 text-xs uppercase tracking-wider">Today's Appointments</span>
                        <p className="text-2xl font-light text-white mt-1">{bookings.length}</p>
                    </div>
                     <div className="bg-stone-900/50 border border-stone-800 p-4 rounded-sm">
                        <span className="text-stone-500 text-xs uppercase tracking-wider">In Service</span>
                        <p className="text-2xl font-light text-blue-400 mt-1">{queue.length}</p>
                    </div>
                </div>

                {/* View toggle + Search */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex rounded-sm border border-stone-800 overflow-hidden">
                        <button type="button" onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-2 text-sm ${viewMode === 'list' ? 'bg-stone-800 text-white' : 'bg-stone-900 text-stone-400 hover:text-stone-200'}`}>
                            <List className="w-4 h-4" /> List
                        </button>
                        <button type="button" onClick={() => setViewMode('calendar')} className={`flex items-center gap-2 px-4 py-2 text-sm ${viewMode === 'calendar' ? 'bg-stone-800 text-white' : 'bg-stone-900 text-stone-400 hover:text-stone-200'}`}>
                            <CalendarIcon className="w-4 h-4" /> Calendar
                        </button>
                    </div>
                    <div className="flex rounded-sm border border-stone-800 overflow-hidden">
                        <button type="button" onClick={() => setCalendarMode('day')} className={`px-3 py-2 text-xs ${viewMode === 'calendar' && calendarMode === 'day' ? 'bg-[#4A5D4F] text-white' : 'bg-stone-900 text-stone-400'}`}>Day</button>
                        <button type="button" onClick={() => setCalendarMode('week')} className={`px-3 py-2 text-xs ${viewMode === 'calendar' && calendarMode === 'week' ? 'bg-[#4A5D4F] text-white' : 'bg-stone-900 text-stone-400'}`}>Week</button>
                        <button type="button" onClick={() => setCalendarMode('month')} className={`px-3 py-2 text-xs ${viewMode === 'calendar' && calendarMode === 'month' ? 'bg-[#4A5D4F] text-white' : 'bg-stone-900 text-stone-400'}`}>Month</button>
                    </div>
                    <div className="flex items-center bg-stone-900 border border-stone-800 px-4 py-2 rounded-sm flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 text-stone-500 mr-2 shrink-0" />
                        <input type="text" placeholder="Search Client, Phone, or Service..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-stone-600" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                {/* Calendar view */}
                {viewMode === 'calendar' && (
                  <div className="border border-stone-800 rounded-sm overflow-hidden bg-stone-900/50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800">
                      <button type="button" onClick={() => { const d = new Date(calendarDate); d.setMonth(d.getMonth() - 1); setCalendarDate(d); }} className="p-2 text-stone-400 hover:text-white">←</button>
                      <span className="font-medium text-stone-200">
                        {calendarMode === 'month' && calendarDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                        {calendarMode === 'week' && `Week of ${calendarDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                        {calendarMode === 'day' && calendarDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <button type="button" onClick={() => { const d = new Date(calendarDate); d.setMonth(d.getMonth() + 1); setCalendarDate(d); }} className="p-2 text-stone-400 hover:text-white">→</button>
                    </div>
                    {calendarMode === 'month' && (
                      <div className="p-4 grid grid-cols-7 gap-1 text-sm">
                        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => <div key={day} className="py-2 text-stone-500 text-center text-xs font-medium">{day}</div>)}
                        {(() => {
                          const y = calendarDate.getFullYear(), m = calendarDate.getMonth();
                          const first = new Date(y, m, 1);
                          const start = new Date(first); start.setDate(start.getDate() - (first.getDay() === 0 ? 6 : first.getDay() - 1));
                          const days: Date[] = []; for (let i = 0; i < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); days.push(d); }
                          return days.map(d => {
                            const dateStr = d.toISOString().slice(0, 10);
                            const count = bookings.filter(b => b.appointment_date && b.appointment_date.toString().slice(0, 10) === dateStr && b.status !== 'cancelled').length;
                            const isCurrentMonth = d.getMonth() === m;
                            return (
                              <button key={d.toISOString()} type="button" onClick={() => { setCalendarDate(d); setCalendarMode('day'); }} className={`p-2 rounded-sm text-left min-h-[60px] ${isCurrentMonth ? 'text-stone-200 hover:bg-stone-800' : 'text-stone-600'} ${d.toDateString() === new Date().toDateString() ? 'ring-1 ring-[#4A5D4F]' : ''}`}>
                                <span>{d.getDate()}</span>
                                {count > 0 && <span className="block text-[10px] text-[#4A5D4F]">{count} booking{count !== 1 ? 's' : ''}</span>}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    )}
                    {calendarMode === 'week' && (
                      <div className="p-4 grid grid-cols-7 gap-2">
                        {(() => {
                          const start = new Date(calendarDate); start.setDate(calendarDate.getDate() - calendarDate.getDay() + (calendarDate.getDay() === 0 ? -6 : 1));
                          return Array.from({ length: 7 }, (_, i) => {
                            const d = new Date(start); d.setDate(start.getDate() + i);
                            const dateStr = d.toISOString().slice(0, 10);
                            const dayBookings = bookings.filter(b => b.appointment_date && b.appointment_date.toString().slice(0, 10) === dateStr && b.status !== 'cancelled');
                            return (
                              <div key={i} className="border border-stone-800 rounded-sm p-2 min-h-[120px]">
                                <p className="text-xs text-stone-500 mb-2">{d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}</p>
                                {dayBookings.slice(0, 3).map(b => (
                                  <button key={b.id} type="button" onClick={() => setSelectedBooking(b)} className="block w-full text-left text-xs p-1.5 rounded bg-stone-800/50 hover:bg-stone-800 truncate">
                                    {new Date(b.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {b.client_name}
                                  </button>
                                ))}
                                {dayBookings.length > 3 && <p className="text-[10px] text-stone-500 mt-1">+{dayBookings.length - 3} more</p>}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                    {calendarMode === 'day' && (
                      <div className="p-4">
                        <div className="space-y-2">
                          {bookings.filter(b => b.appointment_date && b.appointment_date.toString().slice(0, 10) === calendarDate.toISOString().slice(0, 10) && b.status !== 'cancelled').sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()).map(b => (
                            <button key={b.id} type="button" onClick={() => setSelectedBooking(b)} className="w-full flex items-center gap-4 p-3 rounded-sm border border-stone-800 hover:bg-stone-800/50 text-left">
                              <span className="text-stone-400 w-14">{new Date(b.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="text-stone-200 font-medium">{b.client_name}</span>
                              <span className="text-stone-500 text-sm">{b.services?.length ? b.services.map((s: { service_type: string }) => s.service_type).join(', ') : b.service_type}</span>
                            </button>
                          ))}
                          {bookings.filter(b => b.appointment_date && b.appointment_date.toString().slice(0, 10) === calendarDate.toISOString().slice(0, 10) && b.status !== 'cancelled').length === 0 && (
                            <p className="text-stone-500 text-sm py-8 text-center">No appointments this day</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Table (list view) */}
                {viewMode === 'list' && (
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
                                                {booking.services?.length ? booking.services.map((s: { service_type: string }) => s.service_type).join(', ') : booking.service_type}
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
                )}
             </div>

             {/* Right Column: Queue */}
             <div className="lg:col-span-1 border-l border-stone-800 lg:pl-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <h3 className="text-sm uppercase tracking-wider text-stone-400 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Live Queue
                    </h3>
                    <span className="bg-[#4A5D4F] text-white text-[10px] px-1.5 py-0.5 rounded-full">{queue.length}</span>
                </div>
                
                <div className="space-y-3">
                    {queueLoading ? (
                        <p className="text-xs text-stone-500 italic">Updating queue...</p>
                    ) : queue.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-stone-800 bg-stone-900/30 rounded-sm">
                            <p className="text-xs text-stone-500">The waiting list is empty.</p>
                        </div>
                    ) : (
                        queue.map((item) => (
                            <div key={item.id} className="bg-stone-900 border border-stone-800 p-3 rounded-sm hover:border-stone-700 transition-colors group relative">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xl font-serif-custom text-white">{item.ticket_number}</span>
                                    <button 
                                        onClick={() => handleQueueAction(item.id)}
                                        className="text-stone-600 hover:text-red-400 transition-colors p-1"
                                        title="Mark as Served / Remove"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-stone-300 font-medium truncate">{item.client_name}</p>
                                <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {new Date(item.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        ))
                    )}
                </div>
             </div>
        </div>

        {/* Modal: New Booking (step 1: select client, step 2: service/date/time) */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-stone-900 border border-stone-800 p-8 rounded-sm w-full max-w-md space-y-6 relative">
                    <button 
                        onClick={() => { setShowModal(false); setBookingStep('client'); setSelectedClient(null); }}
                        className="absolute top-4 right-4 text-stone-500 hover:text-white"
                    >
                        <XCircle className="w-6 h-6" />
                    </button>
                    
                    <h2 className="font-serif-custom text-2xl text-white">
                        {bookingStep === 'client' ? 'Select client' : 'Appointment details'}
                    </h2>

                    {bookingStep === 'client' ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                                <input 
                                    type="text"
                                    placeholder="Search by name, phone, or client ID..."
                                    className="w-full bg-stone-950 border border-stone-800 pl-10 pr-4 py-3 text-stone-300 text-sm rounded-sm"
                                    value={clientSearch}
                                    onChange={e => setClientSearch(e.target.value)}
                                />
                            </div>
                            {clientSearching && <p className="text-stone-500 text-sm">Searching...</p>}
                            {clientSearchResults.length > 0 && (
                                <ul className="border border-stone-800 rounded-sm max-h-48 overflow-y-auto">
                                    {clientSearchResults.map((c) => (
                                        <li key={c.id}>
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedClient(c); setBookingStep('service'); }}
                                                className="w-full text-left px-4 py-3 hover:bg-stone-800/50 flex justify-between items-center"
                                            >
                                                <span className="text-stone-200 font-medium">{c.name}</span>
                                                <span className="text-stone-500 text-xs font-mono">{c.client_id}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {clientSearch.trim() && !clientSearching && clientSearchResults.length === 0 && (
                                <p className="text-stone-500 text-sm">No clients found.</p>
                            )}
                            <div className="pt-2 border-t border-stone-800">
                                <Link
                                    href="/clients/new"
                                    className="text-[#4A5D4F] hover:underline text-sm font-medium"
                                >
                                    + Register new client
                                </Link>
                            </div>
                            <p className="text-stone-500 text-xs">Or book without a client record (legacy):</p>
                            <button
                                type="button"
                                onClick={() => { setSelectedClient(null); setBookingStep('service'); }}
                                className="w-full py-2 border border-stone-700 text-stone-400 rounded-sm hover:bg-stone-800 text-sm"
                            >
                                Continue with name & phone only
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleCreateBooking} className="space-y-4">
                            {selectedClient && (
                                <div className="flex items-center justify-between py-2 px-3 bg-stone-950 border border-stone-800 rounded-sm">
                                    <span className="text-stone-200 font-medium">{selectedClient.name}</span>
                                    <span className="text-stone-500 text-xs font-mono">{selectedClient.client_id}</span>
                                </div>
                            )}
                            {!selectedClient && (
                                <>
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
                                            placeholder="0712345678"
                                            value={newBooking.phone}
                                            onChange={e => setNewBooking({...newBooking, phone: e.target.value.replace(/\D/g, '')})}
                                        />
                                    </div>
                                </>
                            )}
                            <div className="space-y-2">
                                <label className="text-xs uppercase text-stone-500">Service(s) — multi-select</label>
                                <select 
                                    multiple
                                    className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-300 text-sm rounded-sm min-h-[100px]"
                                    value={newBooking.services.length ? newBooking.services : (newBooking.service ? [newBooking.service] : [])}
                                    onChange={e => {
                                      const selected = Array.from(e.target.selectedOptions, o => o.value);
                                      setNewBooking({ ...newBooking, services: selected, service: selected[0] || '' });
                                    }}
                                >
                                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <p className="text-stone-500 text-[10px]">Hold Ctrl/Cmd to select multiple</p>
                            </div>
                            {providers.length > 0 && (
                              <div className="space-y-2">
                                <label className="text-xs uppercase text-stone-500">Provider</label>
                                <select 
                                    className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-300 text-sm rounded-sm"
                                    value={String(newBooking.provider_id)}
                                    onChange={e => setNewBooking({...newBooking, provider_id: e.target.value ? Number(e.target.value) : ''})}
                                >
                                    <option value="">Any</option>
                                    {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                              </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-xs uppercase text-stone-500">Appointment type</label>
                                <select 
                                    className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-300 text-sm rounded-sm"
                                    value={newBooking.appointment_type}
                                    onChange={e => setNewBooking({...newBooking, appointment_type: e.target.value})}
                                >
                                    <option value="first_visit">First visit</option>
                                    <option value="returning">Returning</option>
                                    <option value="consultation">Consultation only</option>
                                    <option value="treatment">Treatment</option>
                                    <option value="package">Package</option>
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
                                    {availableSlots.length > 0 ? (
                                      <select 
                                        required
                                        className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-300 text-sm rounded-sm"
                                        value={newBooking.time}
                                        onChange={e => setNewBooking({...newBooking, time: e.target.value})}
                                      >
                                        <option value="">Select slot</option>
                                        {availableSlots.map(s => <option key={s} value={s}>{s}</option>)}
                                      </select>
                                    ) : (
                                      <input 
                                        required
                                        type="time" 
                                        className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-300 text-sm rounded-sm [color-scheme:dark]"
                                        value={newBooking.time}
                                        onChange={e => setNewBooking({...newBooking, time: e.target.value})}
                                      />
                                    )}
                                    {slotsLoading && <p className="text-stone-500 text-[10px]">Loading slots…</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase text-stone-500">Notes / special instructions</label>
                                <textarea 
                                    rows={2}
                                    className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-300 text-sm rounded-sm"
                                    placeholder="Optional"
                                    value={newBooking.notes}
                                    onChange={e => setNewBooking({...newBooking, notes: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase text-stone-500">Recurring</label>
                                    <select 
                                        className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-300 text-sm rounded-sm"
                                        value={newBooking.recurrence_rule}
                                        onChange={e => setNewBooking({...newBooking, recurrence_rule: e.target.value})}
                                    >
                                        <option value="">None</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="biweekly">Bi-weekly</option>
                                    </select>
                                </div>
                                {(newBooking.recurrence_rule === 'weekly' || newBooking.recurrence_rule === 'biweekly') && (
                                  <div className="space-y-2">
                                    <label className="text-xs uppercase text-stone-500">End date</label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-300 text-sm rounded-sm [color-scheme:dark]"
                                        value={newBooking.recurrence_end_date}
                                        onChange={e => setNewBooking({...newBooking, recurrence_end_date: e.target.value})}
                                    />
                                  </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setBookingStep('client')}
                                    className="px-4 py-2 border border-stone-700 text-stone-400 rounded-sm hover:bg-stone-800 text-sm"
                                >
                                    Back
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 bg-[#4A5D4F] text-white py-3 rounded-sm uppercase tracking-wider text-xs font-medium hover:bg-[#3d4d41] transition-colors"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        )}

        {/* Modal: Cancellation reason */}
        {showCancelModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-stone-900 border border-stone-800 p-6 rounded-sm w-full max-w-sm space-y-4">
              <h3 className="font-medium text-white">Cancellation reason</h3>
              <textarea
                className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-300 text-sm rounded-sm min-h-[80px]"
                placeholder="Optional: e.g. Client requested, No-show, Rescheduled..."
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => { setShowCancelModal(false); setPendingCancelBooking(null); setCancelReason(''); }} className="flex-1 py-2 border border-stone-700 text-stone-400 rounded-sm hover:bg-stone-800 text-sm">Back</button>
                <button onClick={() => handleStatusUpdate('cancelled', cancelReason)} className="flex-1 py-2 bg-red-900/50 text-red-300 rounded-sm hover:bg-red-900/70 text-sm">Confirm cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add to waiting list (when slot conflict) */}
        {showWaitingListModal && selectedClient && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-stone-900 border border-stone-800 p-6 rounded-sm w-full max-w-sm space-y-4">
              <h3 className="font-medium text-white">No slot available</h3>
              <p className="text-stone-400 text-sm">Add this client to the waiting list for the chosen date?</p>
              <input type="date" className="w-full bg-stone-950 border border-stone-800 p-2 text-stone-300 rounded-sm [color-scheme:dark]" value={waitingListPreferredDate} onChange={e => setWaitingListPreferredDate(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={() => { setShowWaitingListModal(false); }} className="flex-1 py-2 border border-stone-700 text-stone-400 rounded-sm hover:bg-stone-800 text-sm">No</button>
                <button
                  onClick={async () => {
                    const service = newBooking.services?.length ? newBooking.services[0] : newBooking.service;
                    const body = {
                      client_id: selectedClient.id,
                      service_type: service,
                      preferred_date_from: waitingListPreferredDate,
                      preferred_date_to: waitingListPreferredDate,
                      provider_id: newBooking.provider_id || null,
                    };
                    const res = await fetch('/api/waiting-list', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(body),
                    });
                    if (res.ok) {
                      setShowWaitingListModal(false);
                      setShowModal(false);
                      setBookingStep('client');
                      setSelectedClient(null);
                      fetchBookings();
                      alert('Added to waiting list');
                    } else {
                      alert('Failed to add to waiting list');
                    }
                  }}
                  className="flex-1 py-2 bg-[#4A5D4F] text-white rounded-sm hover:bg-[#3d4d41] text-sm"
                >
                  Add to waiting list
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Manage Booking & Records */}
        {selectedBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-stone-900 border border-stone-800 rounded-sm w-full max-w-lg relative flex flex-col max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-stone-800 flex justify-between items-start">
                        <div>
                             <span className="text-xs uppercase text-stone-500 tracking-wider">Patient Management</span>
                             <h2 className="font-serif-custom text-2xl text-white mt-1">{selectedBooking.client_name}</h2>
                             <p className="text-stone-400 text-xs flex items-center gap-2 mt-2">
                                <Phone className="w-3 h-3" /> {selectedBooking.phone || 'N/A'}
                                <span className="text-stone-600">•</span>
                                {selectedBooking.email || 'No Email'}
                             </p>
                        </div>
                        <button 
                            onClick={() => setSelectedBooking(null)}
                            className="text-stone-500 hover:text-white"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-stone-800">
                        <button 
                            onClick={() => setManageTab('status')}
                            className={`flex-1 py-3 text-xs uppercase tracking-wider font-medium transition-colors ${manageTab === 'status' ? 'bg-stone-800/50 text-white border-b-2 border-[#4A5D4F]' : 'text-stone-500 hover:text-stone-300'}`}
                        >
                            Appointment
                        </button>
                        <button 
                            onClick={() => setManageTab('records')}
                            className={`flex-1 py-3 text-xs uppercase tracking-wider font-medium transition-colors ${manageTab === 'records' ? 'bg-stone-800/50 text-white border-b-2 border-[#4A5D4F]' : 'text-stone-500 hover:text-stone-300'}`}
                        >
                            Medical Records
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto">
                        {manageTab === 'status' ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-stone-950/50 p-4 rounded-sm border border-stone-800">
                                        <span className="text-[10px] uppercase text-stone-500 tracking-wider block mb-2">Service</span>
                                        <p className="text-stone-200 font-medium">{selectedBooking.services?.length ? selectedBooking.services.map((s: { service_type: string }) => s.service_type).join(', ') : selectedBooking.service_type}</p>
                                     </div>
                                     <div className="bg-stone-950/50 p-4 rounded-sm border border-stone-800">
                                        <span className="text-[10px] uppercase text-stone-500 tracking-wider block mb-2">Schedule</span>
                                        <p className="text-stone-200">{new Date(selectedBooking.appointment_date).toLocaleDateString()}</p>
                                        <p className="text-stone-400 text-sm">{new Date(selectedBooking.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                     </div>
                                </div>
                                {selectedBooking.status === 'cancelled' && selectedBooking.cancellation_reason && (
                                  <div className="p-3 rounded-sm border border-stone-800 bg-stone-950/50">
                                    <span className="text-[10px] uppercase text-stone-500 tracking-wider">Cancellation reason</span>
                                    <p className="text-stone-400 text-sm mt-1">{selectedBooking.cancellation_reason}</p>
                                  </div>
                                )}
                                
                                <div className="space-y-3">
                                    <p className="text-xs uppercase text-stone-500 tracking-wider">Actions</p>
                                    <button 
                                        onClick={async () => {
                                            const hasClientId = selectedBooking?.client_id != null;
                                            const hasUserId = selectedBooking?.user_id != null;
                                            if (!hasClientId && !hasUserId) return;
                                            try {
                                                const res = await fetch('/api/queue/join', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(
                                                        hasClientId
                                                            ? { client_id: selectedBooking!.client_id }
                                                            : { userId: selectedBooking!.user_id }
                                                    ),
                                                });
                                                if (res.ok) {
                                                    fetchQueue();
                                                    alert('Patient added to queue');
                                                } else {
                                                    alert('Failed or already in queue');
                                                }
                                            } catch (e) {
                                                console.error(e);
                                            }
                                        }}
                                        disabled={queue.some(q => 
                                            (selectedBooking?.client_id != null && q.client_id === selectedBooking.client_id) ||
                                            (selectedBooking?.user_id != null && q.user_id === selectedBooking.user_id)
                                        )}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4A5D4F] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3d4d41] rounded-sm text-xs font-medium uppercase tracking-wide transition-colors"
                                    >
                                        {queue.some(q => 
                                            (selectedBooking?.client_id != null && q.client_id === selectedBooking.client_id) ||
                                            (selectedBooking?.user_id != null && q.user_id === selectedBooking.user_id)
                                        ) ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                In Queue
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                Add to Queue
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-xs uppercase text-stone-500 tracking-wider">Update Status</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => handleStatusUpdate('completed')} className="px-4 py-3 bg-blue-900/20 border border-blue-900/50 text-blue-400 hover:bg-blue-900/40 rounded-sm text-xs font-medium uppercase tracking-wide transition-colors">Complete</button>
                                        <button onClick={requestCancel} className="px-4 py-3 bg-red-900/20 border border-red-900/50 text-red-400 hover:bg-red-900/40 rounded-sm text-xs font-medium uppercase tracking-wide transition-colors">Cancel</button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-stone-800">
                                    <button 
                                        onClick={handleBookNextVisit}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-800 text-stone-200 hover:bg-stone-700 rounded-sm text-xs font-medium uppercase tracking-wide transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Book Next Visit
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs uppercase text-stone-500 tracking-wider">Patient History</h3>
                                    {recordsLoading ? (
                                        <p className="text-xs text-stone-500">Loading records...</p>
                                    ) : patientRecords.length === 0 ? (
                                        <div className="p-4 border border-dashed border-stone-800 rounded-sm text-center">
                                            <p className="text-xs text-stone-500">No records found for this patient.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                            {patientRecords.map(record => (
                                                <div key={record.id} className="bg-stone-950 border border-stone-800 p-3 rounded-sm space-y-1">
                                                    <p className="text-xs text-stone-500">{new Date(record.created_at).toLocaleString()}</p>
                                                    <p className="text-sm text-stone-300 whitespace-pre-wrap">{record.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleAddRecord} className="space-y-3 pt-4 border-t border-stone-800">
                                     <h3 className="text-xs uppercase text-stone-500 tracking-wider">Add Note</h3>
                                     <textarea 
                                        className="w-full h-24 bg-stone-950 border border-stone-800 p-3 text-sm text-stone-300 focus:outline-none focus:border-[#4A5D4F] rounded-sm"
                                        placeholder="Enter clinical notes, preferences, or observations..."
                                        value={newRecord}
                                        onChange={(e) => setNewRecord(e.target.value)}
                                     ></textarea>
                                     <button 
                                        type="submit"
                                        disabled={!newRecord.trim()}
                                        className="w-full px-4 py-2 bg-[#4A5D4F] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3d4d41] rounded-sm text-xs font-medium uppercase tracking-wide transition-colors"
                                     >
                                        Save Record
                                     </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
