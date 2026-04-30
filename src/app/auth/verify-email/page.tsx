'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (!user || cooldown > 0) return;
    try {
      await sendEmailVerification(user);
      toast.success('Verification email sent!');
      setCooldown(60);
    } catch {
      toast.error('Failed to resend email. Try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--void)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-10 text-center"
        style={{ border: '1px solid rgba(255,215,0,0.25)' }}
      >
        {/* Animated envelope */}
        <motion.div
          className="text-7xl mb-6"
          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✉️
        </motion.div>

        <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>
          Check Your Email
        </h2>
        <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
          We&apos;ve sent a verification link to:
        </p>
        <p className="font-semibold mb-6" style={{ color: 'var(--gold)' }}>
          {user?.email ?? 'your email address'}
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Please check your inbox and click the verification link. Once verified, you can access all games.
        </p>

        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className="btn-glass w-full py-3 rounded-xl font-semibold mb-4"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
        </button>

        <Link href="/lobby">
          <button className="btn-gold w-full py-3 rounded-xl font-bold">
            Continue to Lobby
          </button>
        </Link>

        <div className="mt-6">
          <Link href="/auth/login" className="text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
