'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back, Maharaja!');
      router.push('/lobby');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        toast.error('Invalid email or password');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: 'var(--void)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(123,47,190,0.1) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8 relative z-10"
        style={{ border: '1px solid rgba(255,215,0,0.25)' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1
              className="text-3xl font-black cursor-pointer"
              style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}
            >
              Gupta Games
            </h1>
          </Link>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Welcome back, Maharaja</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-dark w-full px-4 py-3 rounded-xl text-sm"
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <Link href="/auth/reset-password" className="text-xs hover:underline" style={{ color: 'var(--gold-dim)' }}>
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-dark w-full px-4 py-3 rounded-xl text-sm"
              autoComplete="current-password"
            />
          </div>

          <motion.button
            type="submit"
            className="btn-gold w-full py-3 rounded-xl text-base font-bold mt-2 flex items-center justify-center gap-2"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? (
              <>
                <div className="spinner w-5 h-5" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            New here?{' '}
            <Link href="/auth/signup" className="font-semibold hover:underline" style={{ color: 'var(--gold)' }}>
              Create Account
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 text-center border-t" style={{ borderColor: 'var(--border-gold)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            🎮 Play with Gupta Coins only — No real money gambling
          </p>
        </div>
      </motion.div>
    </div>
  );
}
