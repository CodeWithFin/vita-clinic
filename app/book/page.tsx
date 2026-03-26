'use client';

import { useState } from 'react';
import { ArrowLeft, Calendar, Clock, CheckCircle } from 'lucide-react';
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
          <CheckCircle className="w-8 h-8 text-stone-100" />
        </div>
        <h2 className="text-4xl font-serif-custom font-light text-stone-100 mb-6">Booking Confirmed</h2>
        <p className="text-xl font-light text-stone-400 max-w-md mb-4 leading-relaxed">
          Thank you, {formData.name}. Your appointment for <span className="italic text-[#8e9f92]">{formData.service}</span> on {formData.date} at {formData.time} has been confirmed.
        </p>
        <p className="text-lg font-light text-stone-500 max-w-md mb-8">
          We look forward to seeing you.
        </p>
        {smsSent === true && (
          <p className="text-[#8e9f92] text-base font-light max-w-md mb-8">
            ✓ A confirmation SMS has been sent to your phone.
          </p>
        )}
        {smsSent === false && (
          <div className="text-amber-400/90 text-base font-light max-w-md mb-8 space-y-2">
            <p>We couldn&apos;t send an SMS reminder. Please save your booking details.</p>
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
        <Link href="/" className="px-8 py-3 border border-stone-700 text-stone-300 hover:text-stone-100 hover:border-stone-500 transition-colors uppercase tracking-widest text-xs font-medium rounded-sm">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 selection:bg-[#4A5D4F] selection:text-white text-stone-200">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-stone-800/50 bg-stone-950/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl tracking-tight font-serif-custom font-light text-stone-100">
            Vita<span className="font-serif-custom font-light text-[#8e9f92] italic">.</span>
          </Link>
          
          <Link href="/" className="group relative overflow-hidden px-6 py-3 rounded-sm text-sm font-light transition-all duration-300 bg-[#4A5D4F] text-stone-100 hover:bg-[#5a6d5f] hover:-translate-y-0.5 shadow-lg shadow-black/30 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="relative z-10">Back</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-40 pb-16 bg-stone-950 border-b border-stone-800/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#8e9f92] mb-8 block">Reservations</span>
          <h1 className="font-serif-custom text-4xl md:text-6xl tracking-tight leading-tight text-stone-100 mb-8">
            Book your <span className="italic text-[#8e9f92]">experience.</span>
          </h1>
          <p className="text-lg md:text-xl tracking-tight leading-relaxed text-stone-400 max-w-2xl mx-auto font-light">
            Select your preferred treatment, date, and time to begin your wellness journey with us.
          </p>
        </div>
      </header>

      {/* Main Form Section */}
      <section className="py-20 relative overflow-hidden bg-stone-950">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-stone-900 rounded-sm p-8 md:p-14 shadow-xl shadow-black/30 border border-stone-800/50 relative overflow-hidden">
            
            <h2 className="text-3xl tracking-tight font-serif-custom font-light text-stone-100 mb-12 relative z-10">Reserve Your Appointment</h2>
            
            <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
              
              {/* Name & Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="relative group">
                  <label htmlFor="name" className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-3 transition-colors group-focus-within:text-[#8e9f92]">Full Name</label>
                  <input 
                    id="name"
                    required
                    type="text" 
                    placeholder="Your Name"
                    className="w-full bg-transparent border-b border-stone-800/50 py-3 text-lg tracking-tight font-light text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-[#4A5D4F] transition-colors rounded-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="relative group">
                  <label htmlFor="phone" className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-3 transition-colors group-focus-within:text-[#8e9f92]">Phone Number</label>
                  <input 
                    id="phone"
                    required
                    type="tel"
                    placeholder="0712345678"
                    className="w-full bg-transparent border-b border-stone-800/50 py-3 text-lg tracking-tight font-light text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-[#4A5D4F] transition-colors rounded-none"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              {/* Service Selection */}
              <div className="relative group">
                <label htmlFor="service" className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-3 transition-colors group-focus-within:text-[#8e9f92]">Select Treatment</label>
                <div className="relative">
                  <select 
                    id="service"
                    required
                    className="w-full bg-stone-800 border-b border-stone-800/50 py-3 pr-10 text-lg tracking-tight font-light text-stone-100 focus:outline-none focus:border-[#4A5D4F] transition-colors rounded-none cursor-pointer appearance-none"
                    value={formData.service}
                    onChange={e => setFormData({...formData, service: e.target.value})}
                  >
                    <option value="" disabled className="bg-stone-800 text-stone-500">Select a Treatment</option>
                    {services.map(s => <option key={s} value={s} className="bg-stone-800 text-stone-100">{s}</option>)}
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="relative group">
                  <label htmlFor="date" className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-3 transition-colors group-focus-within:text-[#8e9f92]">Preferred Date</label>
                  <input 
                    id="date"
                    required
                    type="date" 
                    className="w-full bg-transparent border-b border-stone-800/50 py-3 text-lg tracking-tight font-light text-stone-200 focus:outline-none focus:border-[#4A5D4F] transition-colors rounded-none [color-scheme:dark]"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={e => handleDateChange(e.target.value)}
                  />
                  <p className="text-xs text-stone-500 mt-2">Closed Sundays.</p>
                  {dateError && <p className="text-amber-400/90 text-xs mt-2">{dateError}</p>}
                </div>

                <div className="relative group">
                  <label htmlFor="time" className="block text-xs font-medium uppercase tracking-widest text-stone-500 mb-3 transition-colors group-focus-within:text-[#8e9f92]">Preferred Time</label>
                  <div className="relative">
                    <select 
                      id="time"
                      required
                      className="w-full bg-stone-800 border-b border-stone-800/50 py-3 pr-10 text-lg tracking-tight font-light text-stone-100 focus:outline-none focus:border-[#4A5D4F] transition-colors rounded-none cursor-pointer appearance-none"
                      value={getTimeSlots().some(s => s.value === formData.time) ? formData.time : ''}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                      disabled={getTimeSlots().length === 0}
                    >
                      <option value="" disabled className="bg-stone-800 text-stone-500">
                        {getTimeSlots().length === 0 ? 'Closed Sundays' : 'Select Time'}
                      </option>
                      {getTimeSlots().map(({ value, label }) => (
                        <option key={value} value={value} className="bg-stone-800 text-stone-100">{label}</option>
                      ))}
                    </select>
                    <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-400/90 text-sm">{error}</p>}

              {/* Submit Button */}
              <div className="pt-8">
                <button 
                  type="submit"
                  disabled={loading}
                  className="group relative overflow-hidden w-full inline-flex justify-center items-center gap-3 px-12 py-5 rounded-sm text-lg font-light transition-all duration-300 bg-[#4A5D4F] text-stone-100 hover:bg-[#5a6d5f] shadow-lg shadow-black/30 hover:-translate-y-1 border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {loading ? 'Processing...' : 'Confirm Booking'}
                    {!loading && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </span>
                </button>
              </div>

              <p className="text-xs text-stone-500 text-center leading-relaxed pt-4">
                By booking, you agree to our 24-hour cancellation policy. <br className="hidden md:block" />
                We will contact you to confirm your specific treatment requirements.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-12 bg-stone-900 border-t border-stone-800/50 text-stone-300 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <h3 className="text-4xl md:text-5xl tracking-tight mb-6 font-serif-custom font-light text-stone-100">
            Vita<span className="text-[#8e9f92] italic">.</span>
          </h3>
          <p className="mb-10 max-w-lg text-base tracking-tight text-stone-400 font-light">
            A wellness sanctuary in Kilimani. Experience therapeutic and aesthetic treatments designed for your complete wellbeing.
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm tracking-tight border-t border-stone-800/50 pt-10 w-full text-stone-500">
            <a href="#" className="transition-colors hover:text-[#8e9f92] font-light">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-[#8e9f92] font-light">Terms of Service</a>
            <span className="font-light">© 2024 Vita Clinic. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
