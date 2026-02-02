'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flower2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token (basic implementation)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'receptionist') {
        router.push('/reception');
      } else if (data.user.role === 'doctor') {
        router.push('/doctor');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-stone-900">
      {/* Visual Side */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-[#2C2926] relative overflow-hidden p-12">
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="mx-auto w-24 h-24 mb-8 text-amber-500/80 flex items-center justify-center">
             <Flower2 size={80} strokeWidth={1} />
          </div>
          <h2 className="font-display text-4xl text-amber-50 mb-6">Welcome Back</h2>
          <p className="font-light text-stone-300 text-lg leading-relaxed">
            "To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear."
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex flex-col justify-center items-center p-8 bg-stone-900">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:hidden mb-8">
                <Flower2 className="mx-auto text-amber-500 mb-4" size={48} />
                <h2 className="font-display text-3xl text-amber-50">Vitapharm</h2>
            </div>

            <div className="space-y-2">
                <h1 className="font-display text-2xl text-amber-50">Sign In</h1>
                <p className="text-stone-400 font-light">Enter your details to access your wellness dashboard</p>
            </div>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-200 text-sm rounded-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-xs uppercase tracking-wider text-stone-400">Email</label>
                        <Input 
                            id="email"
                            name="email"
                            type="email" 
                            placeholder="name@example.com" 
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-xs uppercase tracking-wider text-stone-400">Password</label>
                        <Input 
                            id="password"
                            name="password"
                            type="password" 
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <Button fullWidth disabled={loading}>
                    {loading ? 'More gently...' : 'Enter Sanctuary'}
                </Button>
            </form>

            <div className="text-center pt-4">
                <p className="text-stone-400 text-sm">
                    New to Vita? {' '}
                    <Link href="/register" className="text-amber-500 hover:text-amber-400 underline decoration-amber-500/30 underline-offset-4 transition-colors">
                        Begin your journey
                    </Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
