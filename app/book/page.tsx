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
  const [error, setError] = useState('');

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

      if (!response.ok) {
        throw new Error('Booking failed. Please try again.');
      }

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
        <p className="text-stone-400 max-w-md mb-8">
          Thank you, {formData.name}. Your appointment for {formData.service} has been confirmed. 
          We look forward to seeing you.
        </p>
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
                                    className="w-full bg-stone-900 border border-stone-800 focus:border-[#4A5D4F] outline-none py-3 pl-10 pr-4 text-stone-300 text-sm rounded-sm"
                                    placeholder="+254..."
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
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
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-stone-500">Preferred Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                                <select 
                                    required
                                    className="w-full bg-stone-900 border border-stone-800 focus:border-[#4A5D4F] outline-none py-3 pl-10 pr-4 text-stone-300 text-sm rounded-sm appearance-none"
                                    value={formData.time}
                                    onChange={e => setFormData({...formData, time: e.target.value})}
                                >
                                    <option value="">Select Time</option>
                                    <option value="09:00">09:00 AM</option>
                                    <option value="10:00">10:00 AM</option>
                                    <option value="11:00">11:00 AM</option>
                                    <option value="12:00">12:00 PM</option>
                                    <option value="13:00">01:00 PM</option>
                                    <option value="14:00">02:00 PM</option>
                                    <option value="15:00">03:00 PM</option>
                                    <option value="16:00">04:00 PM</option>
                                    <option value="17:00">05:00 PM</option>
                                    <option value="18:00">06:00 PM</option>
                                    <option value="19:00">07:00 PM</option>
                                    <option value="20:00">08:00 PM</option>
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
