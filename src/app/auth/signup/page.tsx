'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

const BG = 'linear-gradient(155deg,#0D0520 0%,#110836 22%,#0A1A0F 48%,#1A0830 75%,#0D0520 100%)';

const inputStyle = { width: '100%', padding: '13px 16px', borderRadius: 12, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,215,0,.18)', color: '#F5F5F0', fontFamily: 'Syne,sans-serif', fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color .2s' };
const labelStyle = { fontFamily: 'Syne,sans-serif', fontSize: 12, color: 'rgba(255,255,255,.5)', letterSpacing: '.08em', display: 'block', marginBottom: 8 };

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) router.replace('/lobby');
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirm) { toast.error('Fill in all fields'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signUp(email, password, 'Player' + Math.floor(Math.random() * 9999), '🦁');
      toast.success("Account created! Let's set up your profile 🎉");
      router.push('/onboarding');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('email-already-in-use')) toast.error('Email already registered — try logging in');
      else if (msg.includes('invalid-email')) toast.error('Invalid email address');
      else if (msg.includes('weak-password')) toast.error('Password too weak — use 6+ characters');
      else toast.error('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: BG, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: '55%', height: '65%', background: 'radial-gradient(ellipse,rgba(233,30,140,.38) 0%,transparent 65%)', filter: 'blur(55px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-8%', width: '50%', height: '60%', background: 'radial-gradient(ellipse,rgba(0,200,117,.28) 0%,transparent 65%)', filter: 'blur(55px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,215,0,.06) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 430, position: 'relative', zIndex: 2 }}>
        <div style={{ background: 'rgba(13,5,32,0.75)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,215,0,.22)', borderRadius: 24, padding: '40px 36px', boxShadow: '0 0 80px rgba(233,30,140,.15), 0 0 160px rgba(0,0,0,.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Link href="/">
              <div style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 26, fontWeight: 900, background: 'linear-gradient(135deg,#FFD700,#FFF176,#B8960C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer', marginBottom: 6 }}>GUPTA GAMES</div>
            </Link>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, color: 'rgba(255,255,255,.45)' }}>Create your royal account</div>
          </div>

          {/* Welcome bonus */}
          <div style={{ marginBottom: 24, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,215,0,.08)', border: '1px solid rgba(255,215,0,.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🎁</span>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
              Sign up and get <strong style={{ color: '#FFD700' }}>10,000 Gupta Coins FREE!</strong>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><label style={labelStyle}>EMAIL ADDRESS</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,.6)')} onBlur={e => (e.target.style.borderColor = 'rgba(255,215,0,.18)')} /></div>

            <div><label style={labelStyle}>PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,.6)')} onBlur={e => (e.target.style.borderColor = 'rgba(255,215,0,.18)')} /></div>

            <div><label style={labelStyle}>CONFIRM PASSWORD</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" autoComplete="new-password" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,.6)')} onBlur={e => (e.target.style.borderColor = 'rgba(255,215,0,.18)')} /></div>

            <motion.button type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.03, boxShadow: '0 0 40px rgba(255,215,0,.45)' } : {}}
              whileTap={!loading ? { scale: 0.97 } : {}}
              style={{ marginTop: 6, padding: '15px', borderRadius: 12, border: 'none', background: loading ? 'rgba(184,150,12,.5)' : 'linear-gradient(135deg,#B8960C,#FFD700,#FFF176,#FFD700,#B8960C)', backgroundSize: '200% auto', animation: !loading ? 'shimmer 3s linear infinite' : 'none', color: '#1a1000', fontFamily: 'Cinzel Decorative,serif', fontWeight: 900, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 0 25px rgba(255,215,0,.25)' }}>
              {loading
                ? <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(26,16,0,.4)', borderTopColor: '#1a1000', animation: 'spin .7s linear infinite' }} /> Creating Account...</>
                : 'Create Account & Claim Coins 🪙'}
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 22, fontFamily: 'Syne,sans-serif', fontSize: 14, color: 'rgba(255,255,255,.4)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#FFD700', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
          </div>
          <div style={{ marginTop: 22, paddingTop: 22, borderTop: '1px solid rgba(255,215,0,.1)', textAlign: 'center', fontFamily: 'Syne,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.2)' }}>
            Gupta Coins have no real-world value · Play responsibly
          </div>
        </div>
      </motion.div>
    </div>
  );
}
