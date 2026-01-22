'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      if (parsedUser.role === 'receptionist') {
        router.push('/reception');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) {
    return <div className="min-h-screen bg-stone-900 text-amber-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-stone-800 pb-6">
          <h1 className="font-display text-3xl text-amber-50">Welcome, {user.name}</h1>
          <Button variant="outline" onClick={handleLogout} size="sm">Log Out</Button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#2C2926] p-6 rounded-sm border border-stone-800/50">
            <h2 className="font-display text-xl text-amber-200 mb-4">Upcoming Appointments</h2>
            <p className="text-stone-400 font-light">You have no upcoming appointments.</p>
             <div className="mt-6">
                <Button size="sm">Book New</Button>
            </div>
          </div>
          
           <div className="bg-[#2C2926] p-6 rounded-sm border border-stone-800/50">
            <h2 className="font-display text-xl text-amber-200 mb-4">Your Queue Status</h2>
             <p className="text-stone-400 font-light">You are not currently in a queue.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
