'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lotus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/dashboard');
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
             style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        </div>
        <div className="relative z-10 text-center max-w-md">
           <div className="mx-auto w-24 h-24 mb-8 text-amber-500/80 flex items-center justify-center">
             <Lotus size={80} strokeWidth={1} />
          </div>
          <h2 className="font-display text-4xl text-amber-50 mb-6">Begin Your Journey</h2>
          <p className="font-light text-stone-300 text-lg leading-relaxed">
            "Your body fits you like a glove... you can only change it by changing yourself."
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex flex-col justify-center items-center p-8 bg-stone-900">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:hidden mb-8">
                <Lotus className="mx-auto text-amber-500 mb-4" size={48} />
                <h2 className="font-display text-3xl text-amber-50">Vita Clinic</h2>
            </div>

            <div className="space-y-2">
                <h1 className="font-display text-2xl text-amber-50">Register</h1>
                <p className="text-stone-400 font-light">Join our community of wellness</p>
            </div>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-200 text-sm rounded-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-xs uppercase tracking-wider text-stone-400">Full Name</label>
                        <Input 
                            id="name"
                            name="name"
                            type="text" 
                            placeholder="John Doe" 
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
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
                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider text-stone-400">Confirm Password</label>
                        <Input 
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password" 
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <Button fullWidth disabled={loading}>
                    {loading ? 'Creating...' : 'Create Account'}
                </Button>
            </form>

            <div className="text-center pt-4">
                <p className="text-stone-400 text-sm">
                    Already a member? {' '}
                    <Link href="/login" className="text-amber-500 hover:text-amber-400 underline decoration-amber-500/30 underline-offset-4 transition-colors">
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
