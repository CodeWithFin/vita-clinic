'use client';

import { useState } from 'react';
import { ArrowLeft, Calendar, Clock, User, Phone, CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function BookPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    date: '',
    time: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [smsSent, setSmsSent] = useState<boolean | null>(null);
  const [smsReason, setSmsReason] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState('');

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

  // Spa hours: Mon–Fri 09:00–19:45, Sat 10:00–19:45. Closed Sundays. Last slot 19:00.
  // For today: only show times that haven't passed (e.g. at 12:48, show from 13:00).
  const getTimeSlots = () => {
    const slots: { value: string; label: string }[] = [];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const currentHour = today.getHours();
    const currentMinutes = today.getMinutes();
    // Next bookable slot: if past the hour, next full hour (e.g. 12:48 → 13:00)
    const minHourToday = currentMinutes > 0 ? currentHour + 1 : currentHour;

    if (!formData.date) {
      // No date: show weekday slots as default (no "today" filter)
      for (let h = 9; h <= 19; h++) {
        const value = `${String(h).padStart(2, '0')}:00`;
        const label = h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`;
        slots.push({ value, label });
      }
      return slots;
    }
    const d = new Date(formData.date + 'T12:00:00');
    const day = d.getDay(); // 0 = Sun, 6 = Sat
    if (day === 0) return slots; // Closed Sunday
    const isSaturday = day === 6;
    let startHour = isSaturday ? 10 : 9;
    const endHour = 19;
    // If booking today, don't show times that have already passed
    if (formData.date === todayStr) {
      startHour = Math.max(startHour, minHourToday);
    }
    for (let h = startHour; h <= endHour; h++) {
      const value = `${String(h).padStart(2, '0')}:00`;
      const label = h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`;
      slots.push({ value, label });
    }
    return slots;
  };

  const handleDateChange = (value: string) => {
    setDateError('');
    if (!value) {
      setFormData(prev => ({ ...prev, date: '', time: '' }));
      return;
    }
    const d = new Date(value + 'T12:00:00');
    if (d.getDay() === 0) {
      setDateError('We\'re closed on Sundays. Please choose another day.');
      setFormData(prev => ({ ...prev, date: '', time: '' }));
      return;
    }
    setFormData(prev => ({ ...prev, date: value, time: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = data?.error || 'Booking failed. Please try again.';
        const details = data?.details;
        setError(details ? `${msg} (${details})` : msg);
        return;
      }

      setSmsSent(data.smsSent === true);
      setSmsReason(data.smsReason ?? null);
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-[#4A5D4F] rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-serif-custom text-stone-100 mb-4">Booking Confirmed</h2>
        <p className="text-stone-400 max-w-md mb-4">
          Thank you, {formData.name}. Your appointment for {formData.service} on {formData.date} at {formData.time} has been confirmed.
          We look forward to seeing you.
        </p>
        {smsSent === true && (
          <p className="text-stone-500 text-sm max-w-md mb-8">
            A confirmation SMS has been sent to your phone.
          </p>
        )}
        {smsSent === false && (
          <div className="text-amber-200/90 text-sm max-w-md mb-8 space-y-1">
            <p>We couldn&apos;t send an SMS reminder. Please save your booking details above.</p>
            {smsReason && (
              <p className="text-stone-500 text-xs font-mono max-w-md break-words">
                {smsReason.includes('not configured') || smsReason.includes('TILIL')
                  ? 'To enable SMS: add TILIL_API_KEY, TILIL_SHORTCODE, and SMS_ENDPOINT to your .env (see README).'
                  : smsReason}
              </p>
            )}
          </div>
        )}
        {smsSent === null && <div className="mb-8" />}
        <Link href="/" className="px-8 py-3 border border-stone-700 text-stone-300 hover:text-white hover:border-white transition-colors uppercase tracking-widest text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 selection:bg-[#4A5D4F] selection:text-white flex flex-col lg:flex-row">
      {/* Left Panel - Image/Info */}
      <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-screen">
        <img 
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80" 
          alt="Spa Atmosphere" 
          className="absolute inset-0 w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-stone-950/40"></div>
        <div className="absolute inset-0 flex flex-col justify-between p-8 lg:p-16 z-10">
            <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors w-fit">
                <ArrowLeft className="w-5 h-5" />
                <span className="uppercase tracking-widest text-xs font-medium">Back</span>
            </Link>
            <div className="space-y-4">
                <Sparkles className="w-8 h-8 text-white/80" />
                <h1 className="font-serif-custom text-4xl lg:text-6xl text-white leading-tight">
                    Begin your <br/> journey to <span className="italic text-stone-300">serenity.</span>
                </h1>
            </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="lg:w-1/2 p-8 lg:p-16 lg:overflow-y-auto max-h-screen">
        <div className="max-w-md mx-auto space-y-8">
            <div>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#8e9f92]">
                    Reservations
                </span>
                <h2 className="font-serif-custom text-3xl text-stone-200 mt-2">Book an Appointment</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-stone-500">Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                                <input 
                                    required
                                    type="text" 
                                    className="w-full bg-stone-900 border border-stone-800 focus:border-[#4A5D4F] outline-none py-3 pl-10 pr-4 text-stone-300 text-sm rounded-sm"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-stone-500">Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                                <input 
                                    required
                                    type="tel"
                                    pattern="07[0-9]{8}"
                                    className="w-full bg-stone-900 border border-stone-800 focus:border-[#4A5D4F] outline-none py-3 pl-10 pr-4 text-stone-300 text-sm rounded-sm"
                                    placeholder="0712345678"
                                    title="Please enter a valid phone number starting with 07 (e.g., 0712345678)"
                                    value={formData.phone}
                                    onChange={e => {
                                        // Only allow digits to be typed
                                        const val = e.target.value.replace(/\D/g, '');
                                        setFormData({...formData, phone: val});
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                     <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-stone-500">Service</label>
                        <select 
                            required
                            className="w-full bg-stone-900 border border-stone-800 focus:border-[#4A5D4F] outline-none py-3 px-4 text-stone-300 text-sm rounded-sm appearance-none"
                            value={formData.service}
                            onChange={e => setFormData({...formData, service: e.target.value})}
                        >
                            <option value="">Select a Treatment</option>
                            {services.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-stone-500">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                                <input 
                                    required
                                    type="date" 
                                    className="w-full bg-stone-900 border border-stone-800 focus:border-[#4A5D4F] outline-none py-3 pl-10 pr-4 text-stone-300 text-sm rounded-sm [color-scheme:dark]"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.date}
                                    onChange={e => handleDateChange(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-stone-500">Closed Sundays.</p>
                            {dateError && <p className="text-amber-400/90 text-xs">{dateError}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-stone-500">Preferred Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                                <select 
                                    required
                                    className="w-full bg-stone-900 border border-stone-800 focus:border-[#4A5D4F] outline-none py-3 pl-10 pr-4 text-stone-300 text-sm rounded-sm appearance-none"
                                    value={getTimeSlots().some(s => s.value === formData.time) ? formData.time : ''}
                                    onChange={e => setFormData({...formData, time: e.target.value})}
                                    disabled={getTimeSlots().length === 0}
                                >
                                    <option value="">
                                      {getTimeSlots().length === 0 ? 'Closed Sundays' : 'Select Time'}
                                    </option>
                                    {getTimeSlots().map(({ value, label }) => (
                                      <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <button 
                    disabled={loading}
                    type="submit" 
                    className="w-full bg-[#4A5D4F] text-white uppercase tracking-widest text-xs font-medium py-4 hover:bg-[#3d4d41] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
                
                <p className="text-xs text-stone-500 text-center leading-relaxed">
                    By booking, you agree to our 24-hour cancellation policy. <br/>
                    We will contact you to confirm your specific treatment requirements.
                </p>
            </form>
        </div>
      </div>
    </div>
  );
}
