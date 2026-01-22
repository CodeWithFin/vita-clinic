'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden relative flex items-center justify-center">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1722483173894-74b0de110e54?w=2560&q=80" 
          alt="Background" 
          className="object-center brightness-[0.7] contrast-[0.95] saturate-[0.8] w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70"></div>
        <div className="absolute inset-0 bg-stone-950/30"></div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-sm p-8 md:p-10 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-200">
                <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Z"/>
                <path d="M12 14c.732 0 1.423.132 2.066.372"/>
                <path d="M16.472 14.372a8 8 0 1 1-8.944 0"/>
              </svg>
              <div className="flex flex-col">
                <span className="font-display text-2xl tracking-tight text-white">
                  VitaPharm
                </span>
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-stone-400 font-light">
                  Wellness Clinic
                </span>
              </div>
            </div>
            <h2 className="font-serif-custom text-3xl text-stone-100 font-light">
              Staff Portal
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-800/50 text-red-200 px-4 py-3 rounded-sm text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-stone-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-stone-800/50 border border-stone-700 text-stone-200 px-4 py-3 rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-stone-600"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-800/50 border border-stone-700 text-stone-200 px-4 py-3 rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-stone-600"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full uppercase hover:bg-primary-dark transition-all duration-300 text-sm font-medium text-white tracking-[0.15em] bg-primary border border-primary rounded-sm py-4 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-stone-400 hover:text-stone-300 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-xs text-stone-500 mt-6">
          For assistance, contact your system administrator
        </p>
      </div>
    </div>
  );
}
