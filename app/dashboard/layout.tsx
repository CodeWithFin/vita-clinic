'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900">
        <div className="text-stone-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-900">
      {/* Header */}
      <header className="fixed z-50 w-full backdrop-blur-md bg-stone-900/95 border-b border-stone-800">
        <div className="flex items-center justify-between px-6 md:px-12 py-4">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-200">
              <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Z"/>
              <path d="M12 14c.732 0 1.423.132 2.066.372"/>
              <path d="M16.472 14.372a8 8 0 1 1-8.944 0"/>
            </svg>
            <div className="flex flex-col">
              <span className="font-display text-lg tracking-tight text-white">
                VitaPharm
              </span>
              <span className="text-[0.6rem] uppercase tracking-[0.2em] text-stone-400 font-light">
                Clinic Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm text-stone-200">{session.user?.name}</span>
              <span className="text-xs text-stone-500 uppercase tracking-wider">
                {session.user?.role}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-sm text-stone-400 hover:text-stone-200 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="flex pt-20">
        {/* Sidebar */}
        <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-stone-950 border-r border-stone-800 p-6">
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="block px-4 py-3 text-sm text-stone-300 hover:bg-stone-800/50 hover:text-white rounded-sm transition-colors"
            >
              Dashboard
            </Link>
            
            {(session.user?.role === 'ADMIN' || session.user?.role === 'RECEPTIONIST') && (
              <>
                <Link
                  href="/dashboard/clients"
                  className="block px-4 py-3 text-sm text-stone-300 hover:bg-stone-800/50 hover:text-white rounded-sm transition-colors"
                >
                  Clients
                </Link>
                <Link
                  href="/dashboard/appointments"
                  className="block px-4 py-3 text-sm text-stone-300 hover:bg-stone-800/50 hover:text-white rounded-sm transition-colors"
                >
                  Appointments
                </Link>
                <Link
                  href="/dashboard/queue"
                  className="block px-4 py-3 text-sm text-stone-300 hover:bg-stone-800/50 hover:text-white rounded-sm transition-colors"
                >
                  Queue
                </Link>
                <Link
                  href="/dashboard/billing"
                  className="block px-4 py-3 text-sm text-stone-300 hover:bg-stone-800/50 hover:text-white rounded-sm transition-colors"
                >
                  Billing
                </Link>
              </>
            )}

            {session.user?.role === 'SERVICE_PROVIDER' && (
              <>
                <Link
                  href="/dashboard/my-queue"
                  className="block px-4 py-3 text-sm text-stone-300 hover:bg-stone-800/50 hover:text-white rounded-sm transition-colors"
                >
                  My Queue
                </Link>
                <Link
                  href="/dashboard/my-schedule"
                  className="block px-4 py-3 text-sm text-stone-300 hover:bg-stone-800/50 hover:text-white rounded-sm transition-colors"
                >
                  My Schedule
                </Link>
              </>
            )}

            {session.user?.role === 'ADMIN' && (
              <>
                <div className="border-t border-stone-800 my-4"></div>
                <Link
                  href="/dashboard/services"
                  className="block px-4 py-3 text-sm text-stone-300 hover:bg-stone-800/50 hover:text-white rounded-sm transition-colors"
                >
                  Services
                </Link>
                <Link
                  href="/dashboard/users"
                  className="block px-4 py-3 text-sm text-stone-300 hover:bg-stone-800/50 hover:text-white rounded-sm transition-colors"
                >
                  Users
                </Link>
                <Link
                  href="/dashboard/reports"
                  className="block px-4 py-3 text-sm text-stone-300 hover:bg-stone-800/50 hover:text-white rounded-sm transition-colors"
                >
                  Reports
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-3 text-sm text-stone-300 hover:bg-stone-800/50 hover:text-white rounded-sm transition-colors"
                >
                  Settings
                </Link>
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
