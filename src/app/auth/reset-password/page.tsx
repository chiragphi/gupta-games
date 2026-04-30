'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      toast.error('Failed to send reset email. Check your email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--void)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8"
        style={{ border: '1px solid rgba(255,215,0,0.25)' }}
      >
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-2xl font-black cursor-pointer" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>
              Gupta Games
            </h1>
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Reset Password</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Enter your email address and we&apos;ll send you a password reset link.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {loading ? <><div className="spinner w-5 h-5" /> Sending...</> : 'Send Reset Link'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-4">📧</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--gold)' }}>Email Sent!</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Check your inbox for the password reset link. It may take a few minutes to arrive.
              </p>
              <Link href="/auth/login">
                <button className="btn-gold w-full py-3 rounded-xl font-bold">Back to Login</button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {!sent && (
          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
              Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
