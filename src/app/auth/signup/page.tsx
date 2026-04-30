'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirm) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      // Create account with a temporary username/avatar; finalized in onboarding
      await signUp(email, password, 'Player' + Math.floor(Math.random() * 9999), '🦁');
      toast.success('Account created! Let\'s set up your profile.');
      router.push('/onboarding');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Signup failed';
      if (msg.includes('email-already-in-use')) {
        toast.error('Email already registered. Try logging in.');
      } else if (msg.includes('invalid-email')) {
        toast.error('Invalid email address');
      } else if (msg.includes('weak-password')) {
        toast.error('Password is too weak');
      } else {
        toast.error('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: 'var(--void)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(233,30,140,0.08) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8 relative z-10"
        style={{ border: '1px solid rgba(255,215,0,0.25)' }}
      >
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-black cursor-pointer" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>
              Gupta Games
            </h1>
          </Link>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Create your royal account</p>
        </div>

        {/* Welcome bonus badge */}
        <div className="mb-6 p-3 rounded-xl flex items-center gap-3 text-sm font-semibold"
          style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', color: 'var(--gold)' }}>
          <span className="text-xl">🎁</span>
          <span>Sign up and get <strong>10,000 Gupta Coins FREE!</strong></span>
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
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="input-dark w-full px-4 py-3 rounded-xl text-sm"
              autoComplete="new-password"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password"
              className="input-dark w-full px-4 py-3 rounded-xl text-sm"
              autoComplete="new-password"
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
                Creating Account...
              </>
            ) : (
              'Create Account & Claim Coins'
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: 'var(--gold)' }}>
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 text-center border-t" style={{ borderColor: 'var(--border-gold)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            By signing up, you agree to play responsibly. Gupta Coins have no real-world value.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
