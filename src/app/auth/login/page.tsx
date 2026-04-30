'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

const BG = 'linear-gradient(155deg,#0D0520 0%,#110836 22%,#0A1A0F 48%,#1A0830 75%,#0D0520 100%)';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) router.replace('/lobby');
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back, Maharaja! 👑');
      router.push('/lobby');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential') || msg.includes('INVALID_LOGIN_CREDENTIALS')) {
        toast.error('Wrong email or password');
      } else if (msg.includes('too-many-requests')) {
        toast.error('Too many attempts — try again later');
      } else {
        toast.error('Sign in failed. Check email & password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: BG, position: 'relative', overflow: 'hidden' }}>
      {/* Orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '55%', height: '65%', background: 'radial-gradient(ellipse,rgba(147,51,234,.45) 0%,transparent 65%)', filter: 'blur(55px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '60%', background: 'radial-gradient(ellipse,rgba(255,107,26,.3) 0%,transparent 65%)', filter: 'blur(55px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,215,0,.06) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 2 }}>

        {/* Card */}
        <div style={{ background: 'rgba(13,5,32,0.75)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,215,0,0.22)', borderRadius: 24, padding: '40px 36px', boxShadow: '0 0 80px rgba(147,51,234,.2), 0 0 160px rgba(0,0,0,.5)' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Link href="/">
              <div style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 26, fontWeight: 900, background: 'linear-gradient(135deg,#FFD700,#FFF176,#B8960C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer', marginBottom: 6 }}>
                GUPTA GAMES
              </div>
            </Link>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, color: 'rgba(255,255,255,.45)' }}>Welcome back, Maharaja</div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontFamily: 'Syne,sans-serif', fontSize: 12, color: 'rgba(255,255,255,.5)', letterSpacing: '.08em', display: 'block', marginBottom: 8 }}>EMAIL ADDRESS</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email"
                style={{ width: '100%', padding: '13px 16px', borderRadius: 12, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,215,0,.18)', color: '#F5F5F0', fontFamily: 'Syne,sans-serif', fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s', }}
                onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,.6)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,215,0,.18)')}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontFamily: 'Syne,sans-serif', fontSize: 12, color: 'rgba(255,255,255,.5)', letterSpacing: '.08em' }}>PASSWORD</label>
                <Link href="/auth/reset-password" style={{ fontFamily: 'Syne,sans-serif', fontSize: 12, color: 'rgba(255,215,0,.6)', textDecoration: 'none' }}>Forgot?</Link>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                style={{ width: '100%', padding: '13px 16px', borderRadius: 12, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,215,0,.18)', color: '#F5F5F0', fontFamily: 'Syne,sans-serif', fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,.6)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,215,0,.18)')}
              />
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.03, boxShadow: '0 0 40px rgba(255,215,0,.45)' } : {}}
              whileTap={!loading ? { scale: 0.97 } : {}}
              style={{ marginTop: 6, padding: '15px', borderRadius: 12, border: 'none', background: loading ? 'rgba(184,150,12,.5)' : 'linear-gradient(135deg,#B8960C,#FFD700,#FFF176,#FFD700,#B8960C)', backgroundSize: '200% auto', animation: !loading ? 'shimmer 3s linear infinite' : 'none', color: '#1a1000', fontFamily: 'Cinzel Decorative,serif', fontWeight: 900, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 0 25px rgba(255,215,0,.25)' }}>
              {loading ? (
                <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(26,16,0,.4)', borderTopColor: '#1a1000', animation: 'spin .7s linear infinite' }} /> Signing In...</>
              ) : 'Sign In 👑'}
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontFamily: 'Syne,sans-serif', fontSize: 14, color: 'rgba(255,255,255,.4)' }}>
            No account?{' '}
            <Link href="/auth/signup" style={{ color: '#FFD700', fontWeight: 700, textDecoration: 'none' }}>Create one free →</Link>
          </div>

          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,215,0,.1)', textAlign: 'center', fontFamily: 'Syne,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.2)' }}>
            🎮 Gupta Coins only — no real money gambling
          </div>
        </div>
      </motion.div>
    </div>
  );
}
