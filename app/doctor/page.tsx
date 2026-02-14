'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Clock, CheckCircle, Activity, LogOut, 
  RefreshCcw, Stethoscope, Phone, Plus, History, UserPlus, Calendar, Menu, X, FileText
} from 'lucide-react';

type MobileSection = 'schedule' | 'queue' | 'workspace';

interface QueueItem {
    id: number;
    ticket_number: string;
    status?: string;
    provider_id?: number | null;
    client_name: string;
    phone: string;
    user_id: number;
    client_id?: number | null;
    created_at: string;
}

interface ProductEntry {
    product: string;
    usage_time: string;
}

interface FormData {
    /** List of product + when to use (new format) */
    products_list?: ProductEntry[];
    /** Next appointment date YYYY-MM-DD */
    next_appointment?: string;
    // Legacy fields for existing records
    products_for_patient?: string;
    products_usage_time?: string;
    findings?: string;
    recommendations?: string;
    products_used?: string;
    follow_up_instructions?: string;
}

interface AppointmentItem {
    id: number;
    user_id: number;
    service_type: string;
    appointment_date: string;
    status: string;
    client_name?: string;
    phone?: string;
}

interface PatientRecord {
    id: number;
    content: string;
    created_at: string;
    author_id?: number | null;
    author_name?: string | null;
    form_data?: FormData | null;
}

export default function DoctorPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentPatient, setCurrentPatient] = useState<QueueItem | null>(null);
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [newRecord, setNewRecord] = useState('');
  const [formData, setFormData] = useState<FormData>({});
  const [callingNext, setCallingNext] = useState(false);
  const [todayAppointments, setTodayAppointments] = useState<AppointmentItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [mobileSection, setMobileSection] = useState<MobileSection>('queue');
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchQueue = async () => {
      try {
          const userData = localStorage.getItem('user');
          const providerId = userData ? (JSON.parse(userData) as { id?: number }).id : null;
          const url = providerId ? `/api/queue?provider_id=${providerId}` : '/api/queue';
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
              const data = await res.json();
              setQueue(data);
          }
      } catch (error) {
          console.error("Queue fetch error", error);
      } finally {
          setLoading(false);
      }
  };

  const handleCallNext = async () => {
      if (!user?.id) return;
      setCallingNext(true);
      try {
          const res = await fetch('/api/queue/call-next', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ provider_id: Number(user.id) })
          });
          if (res.ok) {
              const assigned = await res.json();
              await fetchQueue();
              setCurrentPatient(assigned);
          } else {
              const data = await res.json().catch(() => ({}));
              if (res.status === 404) {
                  alert('No patients waiting in the queue.');
              } else {
                  alert(data.message || 'Could not call next patient.');
              }
          }
      } catch (error) {
          console.error("Call next error", error);
          alert('Error calling next patient.');
      } finally {
          setCallingNext(false);
      }
  };

  const fetchRecords = async (patient: QueueItem) => {
      try {
          setRecordsLoading(true);
          const url = patient.client_id
              ? `/api/clients/${patient.client_id}/records`
              : `/api/patients/${patient.user_id}/records`;
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
              const data = await res.json();
              setRecords(Array.isArray(data) ? data : []);
          }
      } catch (error) {
          console.error("Records fetch error", error);
      } finally {
          setRecordsLoading(false);
      }
  };

  const fetchTodayAppointments = async () => {
      try {
          const now = new Date();
          const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const res = await fetch(`/api/appointments?date=${today}`, { cache: 'no-store' });
          if (res.ok) {
              const data = await res.json();
              setTodayAppointments(data);
          }
      } catch (error) {
          console.error("Today appointments fetch error", error);
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

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role !== 'doctor' && parsedUser.role !== 'admin') {
         // Optionally redirect if not a doctor, but for now we trust the login redirect
    }
    
    fetchQueue();
    fetchTodayAppointments();

    const interval = setInterval(() => {
      fetchQueue();
      fetchTodayAppointments();
    }, 15000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (currentPatient) {
        fetchRecords(currentPatient);
    } else {
        setRecords([]);
    }
  }, [currentPatient]);

  const handlePatientSelect = (patient: QueueItem) => {
      setCurrentPatient(patient);
      setNewRecord('');
      setFormData({});
      setMobileSection('workspace');
      setMenuOpen(false);
  };

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const productsList = formData.products_list?.length
      ? formData.products_list
      : [{ product: '', usage_time: '' }];

  const handleAddRecord = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentPatient || !user?.id) return;
      const hasProducts = formData.products_list?.some(p => (p.product?.trim() || p.usage_time?.trim()));
      const hasOther = newRecord.trim() || (formData.next_appointment?.trim()) ||
          (typeof formData.findings === 'string' && formData.findings.trim()) ||
          (typeof formData.recommendations === 'string' && formData.recommendations.trim()) ||
          (typeof formData.products_used === 'string' && formData.products_used.trim()) ||
          (typeof formData.follow_up_instructions === 'string' && formData.follow_up_instructions.trim());
      const hasContent = newRecord.trim() || hasProducts || hasOther || formData.next_appointment?.trim();
      if (!hasContent) return;

      setSaveStatus('saving');
      try {
          const payload: { content: string; author_id: number; form_data?: FormData } = {
              content: newRecord.trim(),
              author_id: Number(user.id)
          };
          const filteredProducts = formData.products_list?.filter(p => p.product?.trim() || p.usage_time?.trim());
          const hasFormData = hasProducts || hasOther || (formData.next_appointment?.trim()) ||
              (filteredProducts && filteredProducts.length > 0);
          if (hasFormData) {
              payload.form_data = {
                  ...formData,
                  products_list: filteredProducts?.length ? filteredProducts : undefined
              };
          }

          const recordsUrl = currentPatient.client_id
              ? `/api/clients/${currentPatient.client_id}/records`
              : `/api/patients/${currentPatient.user_id}/records`;
          const res = await fetch(recordsUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });

          const data = await res.json().catch(() => ({}));
          if (res.ok) {
              setNewRecord('');
              setFormData({});
              setSaveStatus('saved');
              fetchRecords(currentPatient);
              setTimeout(() => setSaveStatus('idle'), 2000);
          } else {
              setSaveStatus('error');
              alert(data?.message || 'Failed to save record');
          }
      } catch (error) {
          console.error("Add record error", error);
          setSaveStatus('error');
          alert('Error saving record');
      }
  };

  const handleCompleteConsultation = async () => {
      if (!currentPatient) return;

      if (!confirm("Are you sure you want to complete this consultation? The patient will be removed from the waiting list.")) {
          return;
      }

      try {
          // Remove from queue (mark as completed)
          const res = await fetch(`/api/queue/${currentPatient.id}`, { method: 'DELETE' });
          if (res.ok) {
              fetchQueue();
              setCurrentPatient(null);
          } else {
              alert('Failed to update status');
          }
      } catch (error) {
          console.error("Complete error", error);
      }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#1c1c1a] text-stone-200 p-4 lg:p-8 flex flex-col h-screen overflow-hidden">
      
      {/* Header */}
      <header className="flex justify-between items-center pb-6 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
              <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="lg:hidden p-2 text-stone-400 hover:text-white transition-colors"
                  aria-label="Open menu"
              >
                  <Menu className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 bg-[#4A5D4F] rounded-md flex items-center justify-center text-white shrink-0">
                  <Stethoscope className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                  <h1 className="font-serif-custom text-2xl text-white truncate">Doctor&apos;s Station</h1>
                  <p className="text-stone-500 text-xs">Dr. {user.name}</p>
              </div>
          </div>
          <div className="flex items-center gap-3">
              <button 
                  onClick={() => fetchQueue()}
                  className="p-2 text-stone-400 hover:text-white transition-colors"
                  title="Refresh Queue"
              >
                  <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button 
                  onClick={() => {
                      localStorage.clear();
                      router.push('/login');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-900 border border-stone-800 rounded-sm hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/30 transition-all text-sm"
              >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Out</span>
              </button>
          </div>
      </header>

      {/* Mobile hamburger menu overlay */}
      <div
          className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-200 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          aria-hidden={!menuOpen}
      >
          <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
              aria-label="Close menu"
          />
          <div
              className={`absolute top-0 left-0 h-full w-full max-w-xs bg-stone-900 border-r border-stone-800 shadow-xl flex flex-col transition-transform duration-200 ease-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
              <div className="flex items-center justify-between p-4 border-b border-stone-800">
                  <span className="font-display text-lg text-white">Sections</span>
                  <button type="button" onClick={() => setMenuOpen(false)} className="p-2 text-stone-400 hover:text-white" aria-label="Close">
                      <X className="w-5 h-5" />
                  </button>
              </div>
              <nav className="p-4 space-y-1">
                  <button
                      type="button"
                      onClick={() => { setMobileSection('schedule'); setMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-left transition-colors ${mobileSection === 'schedule' ? 'bg-[#4A5D4F]/30 text-white border border-[#4A5D4F]' : 'text-stone-300 hover:bg-stone-800'}`}
                  >
                      <Calendar className="w-5 h-5 shrink-0" />
                      <span>Today&apos;s schedule</span>
                  </button>
                  <button
                      type="button"
                      onClick={() => { setMobileSection('queue'); setMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-left transition-colors ${mobileSection === 'queue' ? 'bg-[#4A5D4F]/30 text-white border border-[#4A5D4F]' : 'text-stone-300 hover:bg-stone-800'}`}
                  >
                      <User className="w-5 h-5 shrink-0" />
                      <span>My Queue</span>
                      {queue.length > 0 && (
                          <span className="ml-auto bg-[#4A5D4F] text-white text-xs font-bold px-2 py-0.5 rounded-full">{queue.length}</span>
                      )}
                  </button>
                  <button
                      type="button"
                      onClick={() => { setMobileSection('workspace'); setMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-left transition-colors ${mobileSection === 'workspace' ? 'bg-[#4A5D4F]/30 text-white border border-[#4A5D4F]' : 'text-stone-300 hover:bg-stone-800'}`}
                  >
                      <FileText className="w-5 h-5 shrink-0" />
                      <span>Consultation</span>
                      {currentPatient && (
                          <span className="ml-auto text-stone-500 text-xs truncate max-w-[120px]">{currentPatient.client_name}</span>
                      )}
                  </button>
              </nav>
          </div>
      </div>

      <div className="flex-1 min-h-0 pt-4 lg:pt-6 flex flex-col lg:grid lg:grid-cols-2 lg:grid-rows-2 lg:gap-6 lg:content-stretch">
          
          {/* Panel 1: Today's schedule — mobile: full screen when active; lg: col 1 row 1 */}
          <div
              className={`flex-1 min-h-0 flex flex-col overflow-hidden lg:min-h-0 lg:row-span-1 lg:max-h-[280px] ${mobileSection !== 'schedule' ? 'hidden' : ''} lg:!flex lg:flex-col lg:gap-4`}
          >
              {/* Mobile: full-screen section title */}
              <div className="lg:hidden shrink-0 py-3 px-4 border-b border-stone-800 bg-stone-900/80 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#4A5D4F]" />
                  <h2 className="text-base font-medium text-white">Today&apos;s schedule</h2>
              </div>
              <div className="bg-stone-900/30 border border-stone-800 rounded-sm overflow-hidden flex flex-col flex-1 min-h-0 lg:max-h-40 lg:shrink-0">
                  <div className="hidden lg:flex p-4 border-b border-stone-800 bg-[#2C2926]/50 items-center gap-2 shrink-0">
                      <Calendar className="w-4 h-4 text-stone-400" />
                      <h2 className="text-sm font-medium uppercase tracking-wider text-stone-400">Today&apos;s schedule</h2>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto min-h-0 lg:max-h-32">
                      {todayAppointments.length === 0 ? (
                          <p className="text-stone-600 text-sm">No appointments assigned for today.</p>
                      ) : (
                          <ul className="space-y-2">
                              {todayAppointments.map((apt) => (
                                  <li key={apt.id} className="flex justify-between items-start gap-2 text-sm border-b border-stone-800/50 pb-2 last:border-0">
                                      <div>
                                          <p className="text-stone-200 font-medium">{apt.client_name ?? '—'}</p>
                                          <p className="text-stone-500 text-xs">{apt.service_type}</p>
                                      </div>
                                      <span className="text-stone-500 text-xs whitespace-nowrap">
                                          {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                  </li>
                              ))}
                          </ul>
                      )}
                  </div>
              </div>
          </div>

          {/* Panel 2: My Queue — mobile: full screen when active; lg: col 1 row 2 */}
          <div
              className={`flex-1 min-h-0 flex flex-col overflow-hidden lg:min-h-0 lg:row-span-1 ${mobileSection !== 'queue' ? 'hidden' : ''} lg:!flex`}
          >
              {/* Mobile: full-screen section title */}
              <div className="lg:hidden shrink-0 py-3 px-4 border-b border-stone-800 bg-stone-900/80 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#4A5D4F]" />
                  <h2 className="text-base font-medium text-white">My Queue</h2>
                  {queue.length > 0 && (
                      <span className="ml-auto bg-[#4A5D4F] text-white text-xs font-bold px-2 py-0.5 rounded-full">{queue.length}</span>
                  )}
              </div>
              <div className="flex-1 flex flex-col bg-stone-900/30 border border-stone-800 rounded-sm overflow-hidden min-h-0">
                  <div className="p-4 border-b border-stone-800 bg-[#2C2926]/50 space-y-3 shrink-0">
                      <div className="hidden lg:flex justify-between items-center">
                          <h2 className="text-sm font-medium uppercase tracking-wider text-stone-400 flex items-center gap-2">
                              <User className="w-4 h-4" /> My Queue
                          </h2>
                          <span className="bg-[#4A5D4F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{queue.length}</span>
                      </div>
                      <button
                          type="button"
                          onClick={handleCallNext}
                          disabled={callingNext}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#4A5D4F] hover:bg-[#3d4d41] disabled:opacity-50 text-white text-sm font-medium rounded-sm transition-colors"
                      >
                          <UserPlus className="w-4 h-4" />
                          {callingNext ? 'Calling…' : 'Call next patient'}
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 custom-scrollbar">
                      {queue.length === 0 ? (
                          <div className="text-center py-12 text-stone-600">
                              <p>No patients waiting.</p>
                          </div>
                      ) : (
                          queue.map((item) => (
                              <div 
                                  key={item.id}
                                  onClick={() => handlePatientSelect(item)}
                                  className={`p-4 rounded-sm border cursor-pointer transition-all ${
                                      currentPatient?.id === item.id 
                                      ? 'bg-[#4A5D4F]/20 border-[#4A5D4F] ring-1 ring-[#4A5D4F]/50' 
                                      : 'bg-stone-900 border-stone-800 hover:border-stone-600'
                                  }`}
                              >
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="text-lg font-serif-custom text-white">{item.ticket_number}</span>
                                      <span className="text-xs text-stone-500 font-mono flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {new Date(item.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                      </span>
                                  </div>
                                  <p className="text-stone-300 font-medium">{item.client_name}</p>
                                  {item.phone && (
                                      <p className="text-stone-500 text-xs mt-1 flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> {item.phone}
                                      </p>
                                  )}
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>

          {/* Panel 3: Workspace (Consultation) — mobile: full screen when active; lg: col 2 row 1-2 */}
          <div
              className={`flex-1 min-h-0 flex flex-col overflow-hidden lg:min-h-0 lg:row-span-2 lg:col-start-2 lg:row-start-1 ${mobileSection !== 'workspace' ? 'hidden' : ''} lg:!flex`}
          >
          <div className="flex-1 flex flex-col bg-stone-900/30 border border-stone-800 rounded-sm overflow-hidden min-h-0">
              {/* Mobile: full-screen section title (Consultation / patient name) */}
              <div className="lg:hidden shrink-0 py-3 px-4 border-b border-stone-800 bg-stone-900/80 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#4A5D4F] shrink-0" />
                  <h2 className="text-base font-medium text-white truncate">
                      {currentPatient ? currentPatient.client_name : 'Consultation'}
                  </h2>
              </div>
              {currentPatient ? (
                  <>
                      {/* Patient Banner */}
                      <div className="p-4 lg:p-6 border-b border-stone-800 bg-[#2C2926]/50 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                          <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl font-serif-custom text-white">{currentPatient.client_name}</h2>
                                <span className="bg-stone-800 text-stone-400 text-xs px-2 py-0.5 rounded-sm border border-stone-700">
                                    {currentPatient.ticket_number}
                                </span>
                              </div>
                              <p className="text-stone-500 text-sm flex items-center gap-2">
                                  <span>ID: #{currentPatient.user_id}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {currentPatient.phone}</span>
                              </p>
                          </div>
                          <button 
                              onClick={handleCompleteConsultation}
                              className="w-full sm:w-auto bg-stone-800 text-stone-300 hover:bg-[#4A5D4F] hover:text-white border border-stone-700 hover:border-[#4A5D4F] px-4 py-2 rounded-sm text-sm font-medium transition-all flex items-center justify-center gap-2 shrink-0"
                          >
                              <CheckCircle className="w-4 h-4" />
                              End Session
                          </button>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                          
                          {/* Previous Records */}
                          <div className="space-y-4">
                              <h3 className="text-sm font-medium uppercase tracking-wider text-stone-400 flex items-center gap-2">
                                  <History className="w-4 h-4" /> Medical History
                              </h3>
                              
                              {recordsLoading ? (
                                  <div className="animate-pulse space-y-3">
                                      <div className="h-20 bg-stone-900 rounded-sm"></div>
                                      <div className="h-20 bg-stone-900 rounded-sm"></div>
                                  </div>
                              ) : records.length === 0 ? (
                                  <div className="p-6 border border-dashed border-stone-800 rounded-sm text-center">
                                      <p className="text-stone-600 text-sm">No previous medical records found.</p>
                                  </div>
                              ) : (
                                  <div className="space-y-4">
                                      {records.map((rec) => (
                                          <div key={rec.id} className="bg-stone-950 border border-stone-800 p-4 rounded-sm relative group">
                                              {/* Client notes (symptoms) */}
                                              {rec.content && (
                                                  <div className="mb-3 pb-3 border-b border-stone-800">
                                                      <p className="text-stone-500 uppercase text-xs font-medium mb-1">Client notes (symptoms)</p>
                                                      <p className="text-stone-300 text-sm whitespace-pre-wrap leading-relaxed">{rec.content}</p>
                                                  </div>
                                              )}
                                              {/* Products + time + next appointment */}
                                              {rec.form_data && (rec.form_data.products_list?.length || rec.form_data.products_for_patient || rec.form_data.products_usage_time || rec.form_data.next_appointment || rec.form_data.findings || rec.form_data.recommendations || rec.form_data.products_used || rec.form_data.follow_up_instructions) && (
                                                  <div className="space-y-2 mb-3 pb-3 border-b border-stone-800 text-sm">
                                                      {rec.form_data.products_list?.length ? (
                                                          <div className="space-y-2">
                                                              <p className="text-stone-500 uppercase text-xs font-medium">Products for patient</p>
                                                              {rec.form_data.products_list.map((p, i) => (
                                                                  (p.product?.trim() || p.usage_time?.trim()) && (
                                                                      <p key={i} className="pl-2 border-l-2 border-stone-700">
                                                                          <span className="text-stone-300">{p.product || '—'}</span>
                                                                          {p.usage_time?.trim() && <span className="text-stone-500 ml-2">· {p.usage_time}</span>}
                                                                      </p>
                                                                  )
                                                              ))}
                                                          </div>
                                                      ) : (
                                                          <>
                                                              {rec.form_data.products_for_patient && (
                                                                  <p><span className="text-stone-500 uppercase text-xs">Products for patient:</span><span className="text-stone-300 ml-2">{rec.form_data.products_for_patient}</span></p>
                                                              )}
                                                              {rec.form_data.products_usage_time && (
                                                                  <p><span className="text-stone-500 uppercase text-xs">When to use:</span><span className="text-stone-300 ml-2">{rec.form_data.products_usage_time}</span></p>
                                                              )}
                                                          </>
                                                      )}
                                                      {rec.form_data.next_appointment && (
                                                          <p><span className="text-stone-500 uppercase text-xs">Next appointment:</span><span className="text-stone-300 ml-2">{rec.form_data.next_appointment.includes('-') ? new Date(rec.form_data.next_appointment + 'T12:00:00').toLocaleDateString(undefined, { dateStyle: 'medium' }) : rec.form_data.next_appointment}</span></p>
                                                      )}
                                                      {rec.form_data.findings && (
                                                          <p><span className="text-stone-500 uppercase text-xs">Findings:</span><span className="text-stone-300 ml-2">{rec.form_data.findings}</span></p>
                                                      )}
                                                      {rec.form_data.recommendations && (
                                                          <p><span className="text-stone-500 uppercase text-xs">Recommendations:</span><span className="text-stone-300 ml-2">{rec.form_data.recommendations}</span></p>
                                                      )}
                                                      {rec.form_data.products_used && (
                                                          <p><span className="text-stone-500 uppercase text-xs">Products used:</span><span className="text-stone-300 ml-2">{rec.form_data.products_used}</span></p>
                                                      )}
                                                      {rec.form_data.follow_up_instructions && (
                                                          <p><span className="text-stone-500 uppercase text-xs">Follow-up:</span><span className="text-stone-300 ml-2">{rec.form_data.follow_up_instructions}</span></p>
                                                      )}
                                                  </div>
                                              )}
                                              <div className="mt-3 pt-3 border-t border-stone-900 flex justify-between items-center text-xs text-stone-600">
                                                  <span>{rec.author_name ? `Dr. ${rec.author_name}` : '—'}</span>
                                                  <span>{new Date(rec.created_at).toLocaleString()}</span>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Consultation form: Client notes (symptoms), Products + time, Next appointment */}
                      <div className="p-4 border-t border-stone-800 bg-[#2C2926]/30 overflow-y-auto">
                          <form onSubmit={handleAddRecord} className="space-y-5">
                              {/* 1. Client notes (symptoms) */}
                              <div className="space-y-2">
                                  <label className="text-xs uppercase tracking-wider text-stone-500 font-medium block">
                                      Client notes (symptoms)
                                  </label>
                                  <textarea
                                      value={newRecord}
                                      onChange={(e) => setNewRecord(e.target.value)}
                                      placeholder="List the patient's symptoms, complaints, and relevant observations..."
                                      className="w-full h-32 bg-stone-950 border border-stone-800 p-4 text-stone-300 text-sm focus:outline-none focus:border-[#4A5D4F] rounded-sm resize-y min-h-[120px] placeholder:text-stone-600"
                                  />
                              </div>

                              {/* 2. Products for patient + when to use (multiple rows, Add button) */}
                              <div className="space-y-3">
                                  <label className="text-xs uppercase tracking-wider text-stone-500 font-medium block">
                                      Products for patient
                                  </label>
                                  <div className="space-y-3">
                                      {productsList.map((row, index) => (
                                          <div key={index} className="flex flex-col sm:flex-row gap-2 sm:items-center">
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 sm:min-w-0">
                                                  <input
                                                      type="text"
                                                      value={row.product}
                                                      onChange={e => setFormData(f => ({
                                                          ...f,
                                                          products_list: (f.products_list?.length ? f.products_list : [{ product: '', usage_time: '' }]).map((r, i) =>
                                                              i === index ? { ...r, product: e.target.value } : r
                                                          )
                                                      }))}
                                                      placeholder="Product to use"
                                                      className="w-full bg-stone-950 border border-stone-800 px-3 py-2 text-stone-300 text-sm focus:outline-none focus:border-[#4A5D4F] rounded-sm placeholder:text-stone-600"
                                                  />
                                                  <input
                                                      type="text"
                                                      value={row.usage_time}
                                                      onChange={e => setFormData(f => ({
                                                          ...f,
                                                          products_list: (f.products_list?.length ? f.products_list : [{ product: '', usage_time: '' }]).map((r, i) =>
                                                              i === index ? { ...r, usage_time: e.target.value } : r
                                                          )
                                                      }))}
                                                      placeholder="Time to use (e.g. Twice daily)"
                                                      className="w-full bg-stone-950 border border-stone-800 px-3 py-2 text-stone-300 text-sm focus:outline-none focus:border-[#4A5D4F] rounded-sm placeholder:text-stone-600"
                                                  />
                                              </div>
                                              {productsList.length > 1 && (
                                                  <button
                                                      type="button"
                                                      onClick={() => setFormData(f => ({
                                                          ...f,
                                                          products_list: (f.products_list?.length ? f.products_list : [{ product: '', usage_time: '' }]).filter((_, i) => i !== index)
                                                      }))}
                                                      className="sm:shrink-0 px-3 py-2 text-stone-500 hover:text-red-400 hover:bg-stone-800/50 rounded-sm text-sm transition-colors"
                                                      title="Remove row"
                                                  >
                                                      Remove
                                                  </button>
                                              )}
                                          </div>
                                      ))}
                                      <button
                                          type="button"
                                          onClick={() => setFormData(f => ({
                                              ...f,
                                              products_list: [...(f.products_list?.length ? f.products_list : [{ product: '', usage_time: '' }]), { product: '', usage_time: '' }]
                                          }))}
                                          className="flex items-center gap-2 px-3 py-2 text-sm text-[#4A5D4F] hover:bg-[#4A5D4F]/20 border border-stone-700 hover:border-[#4A5D4F] rounded-sm transition-colors"
                                      >
                                          <Plus className="w-4 h-4" />
                                          Add product
                                      </button>
                                  </div>
                              </div>

                              {/* 3. Next appointment date */}
                              <div className="space-y-2">
                                  <label className="text-xs uppercase tracking-wider text-stone-500 font-medium flex items-center gap-1.5">
                                      <Calendar className="w-4 h-4" /> Next appointment
                                  </label>
                                  <input
                                      type="date"
                                      value={formData.next_appointment ?? ''}
                                      onChange={e => setFormData(f => ({ ...f, next_appointment: e.target.value || undefined }))}
                                      min={new Date().toISOString().split('T')[0]}
                                      className="w-full bg-stone-950 border border-stone-800 px-3 py-2 text-stone-300 text-sm focus:outline-none focus:border-[#4A5D4F] rounded-sm [color-scheme:dark]"
                                  />
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                                  <span className="text-xs text-stone-500">
                                      {saveStatus === 'saving' && 'Saving…'}
                                      {saveStatus === 'saved' && 'Saved.'}
                                      {saveStatus === 'error' && 'Save failed.'}
                                  </span>
                                  <button
                                      type="submit"
                                      disabled={(!newRecord.trim() && !formData.products_list?.some(p => p.product?.trim() || p.usage_time?.trim()) && !formData.next_appointment?.trim()) || saveStatus === 'saving'}
                                      className="bg-[#4A5D4F] text-white px-4 py-2 rounded-sm hover:bg-[#3d4d41] disabled:opacity-50 transition-all text-sm font-medium flex items-center gap-2"
                                      title="Save note"
                                  >
                                      <Plus className="w-4 h-4" />
                                      Save note
                                  </button>
                              </div>
                          </form>
                      </div>
                  </>
              ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-stone-600 space-y-4">
                      <div className="w-20 h-20 rounded-full bg-stone-900 flex items-center justify-center border border-stone-800">
                          <Activity className="w-10 h-10 text-stone-700" />
                      </div>
                      <div className="text-center">
                          <h3 className="text-lg font-serif-custom text-stone-400">Ready to Consult</h3>
                          <p className="text-sm">Select a patient from the waiting list to begin.</p>
                      </div>
                  </div>
              )}
          </div>
          </div>
      </div>
    </div>
  );
}
