'use client';

import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif-custom text-4xl text-stone-100 font-light mb-2">
          Welcome back, <span className="italic">{session?.user?.name}</span>
        </h1>
        <p className="text-stone-400">
          Here's what's happening with your clinic today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-stone-950 border border-stone-800 p-6 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-wider text-stone-500">Today's Appointments</h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
          </div>
          <p className="text-3xl font-serif-custom text-stone-100">12</p>
        </div>

        <div className="bg-stone-950 border border-stone-800 p-6 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-wider text-stone-500">Clients in Queue</h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p className="text-3xl font-serif-custom text-stone-100">5</p>
        </div>

        <div className="bg-stone-950 border border-stone-800 p-6 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-wider text-stone-500">Today's Revenue</h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <line x1="12" x2="12" y1="2" y2="22"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <p className="text-3xl font-serif-custom text-stone-100">KSh 45,000</p>
        </div>

        <div className="bg-stone-950 border border-stone-800 p-6 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-wider text-stone-500">New Clients</h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" x2="19" y1="8" y2="14"/>
              <line x1="22" x2="16" y1="11" y2="11"/>
            </svg>
          </div>
          <p className="text-3xl font-serif-custom text-stone-100">3</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-stone-950 border border-stone-800 p-6 rounded-sm">
        <h2 className="font-display text-xl text-stone-100 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 px-6 py-4 bg-primary/20 hover:bg-primary/30 border border-primary/30 hover:border-primary/50 rounded-sm transition-colors text-left">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" x2="19" y1="8" y2="14"/>
              <line x1="22" x2="16" y1="11" y2="11"/>
            </svg>
            <div>
              <p className="text-sm font-medium text-stone-200">New Client</p>
              <p className="text-xs text-stone-500">Register a new client</p>
            </div>
          </button>

          <button className="flex items-center gap-3 px-6 py-4 bg-primary/20 hover:bg-primary/30 border border-primary/30 hover:border-primary/50 rounded-sm transition-colors text-left">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
            <div>
              <p className="text-sm font-medium text-stone-200">Book Appointment</p>
              <p className="text-xs text-stone-500">Schedule a new appointment</p>
            </div>
          </button>

          <button className="flex items-center gap-3 px-6 py-4 bg-primary/20 hover:bg-primary/30 border border-primary/30 hover:border-primary/50 rounded-sm transition-colors text-left">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <line x1="12" x2="12" y1="2" y2="22"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <div>
              <p className="text-sm font-medium text-stone-200">Process Payment</p>
              <p className="text-xs text-stone-500">Record a payment</p>
            </div>
          </button>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-stone-950 border border-stone-800 p-6 rounded-sm">
        <h2 className="font-display text-xl text-stone-100 mb-6">Upcoming Appointments</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-stone-900/50 border border-stone-800 rounded-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-medium">
                JD
              </div>
              <div>
                <p className="text-sm font-medium text-stone-200">Jane Doe</p>
                <p className="text-xs text-stone-500">Deep Cleansing Facial • 10:00 AM</p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full">
              Confirmed
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-stone-900/50 border border-stone-800 rounded-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-medium">
                MS
              </div>
              <div>
                <p className="text-sm font-medium text-stone-200">Mary Smith</p>
                <p className="text-xs text-stone-500">Swedish Massage • 11:30 AM</p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-full">
              Pending
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
