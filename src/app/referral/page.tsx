'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import Sidebar, { MobileBottomNav } from '@/components/layout/sidebar';
import { toast } from 'sonner';

const FAKE_REFERRALS = [
  { username: 'SpiceTrader99', avatar: '🌶️', joined: '3 days ago', bonus: 1000, active: true },
  { username: 'MumbaiMaharaja', avatar: '🦁', joined: '1 week ago', bonus: 1000, active: true },
  { username: 'DelhiDreamer', avatar: '🌙', joined: '2 weeks ago', bonus: 1000, active: true },
];

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 18,
  padding: '20px',
};

export default function ReferralPage() {
  const { user, userProfile, updateBalance } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);

  const code = userProfile?.referralCode ?? 'GUPTA000';
  const referralLink = `https://guptagames.vercel.app/auth/signup?ref=${code}`;

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const claimBonus = () => {
    updateBalance(1000);
    toast.success('🎁 +1,000 Gupta Coins!');
  };

  if (!user) return null;

  return (
    <div className="page-layout">
      <Navbar />
      <Sidebar />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg,rgba(233,30,140,.12) 0%,rgba(147,51,234,.08) 100%)',
            border: '1px solid rgba(233,30,140,.3)',
            borderRadius: 24, padding: '32px 24px', textAlign: 'center', marginBottom: 20,
          }}>
          <motion.div
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>🎁</motion.div>
          <h1 style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 22, fontWeight: 900, color: '#E91E8C', margin: '0 0 8px' }}>
            Invite Friends, Earn Coins!
          </h1>
          <p style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, color: 'rgba(255,255,255,.55)', margin: '0 0 24px' }}>
            You & your friend both get <strong style={{ color: '#FFD700' }}>1,000 free coins</strong> when they sign up with your code.
          </p>

          {/* Code */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: 'rgba(233,30,140,.1)', border: '2px dashed rgba(233,30,140,.4)',
            borderRadius: 14, padding: '14px 20px', marginBottom: 18,
          }}>
            <span style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 24, fontWeight: 900, letterSpacing: '0.2em', color: '#E91E8C' }}>
              {code}
            </span>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={copyCode}
              style={{
                padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Syne,sans-serif', fontSize: 12, fontWeight: 700,
                background: copied ? 'rgba(0,200,117,.2)' : 'rgba(233,30,140,.2)',
                color: copied ? '#00C875' : '#E91E8C',
              }}>
              {copied ? '✓ Copied' : 'Copy'}
            </motion.button>
          </div>

          {/* Share buttons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={copyLink}
              style={{
                padding: '11px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#B8960C,#FFD700)', fontFamily: 'Cinzel Decorative,serif',
                fontSize: 13, fontWeight: 900, color: '#1a1000',
              }}>
              {linkCopied ? '✓ Link Copied!' : '🔗 Share Link'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { navigator.clipboard.writeText(`Join me on Gupta Games! Use code ${code} for 1,000 free coins 🪙 ${referralLink}`); toast.success('Message copied!'); }}
              style={{
                padding: '11px 22px', borderRadius: 12, cursor: 'pointer', fontFamily: 'Syne,sans-serif',
                fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.7)',
                background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
              }}>
              📋 Copy Message
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Friends', value: FAKE_REFERRALS.length, color: '#00E5FF' },
            { label: 'Coins Earned', value: `${(FAKE_REFERRALS.length * 1000).toLocaleString()}`, color: '#FFD700' },
            { label: 'Active', value: FAKE_REFERRALS.filter(r => r.active).length, color: '#00C875' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 + i * 0.06 }}
              style={{ ...card, textAlign: 'center', padding: '18px 12px' }}>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Referred Friends */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ ...card, marginBottom: 20 }}>
          <div style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 14, fontWeight: 700, color: '#FFD700', marginBottom: 14 }}>
            👥 Your Referrals
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAKE_REFERRALS.map((ref, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,.03)' }}>
                <span style={{ fontSize: 26 }}>{ref.avatar}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: '#fff' }}>{ref.username}</div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.35)' }}>Joined {ref.joined}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 13, fontWeight: 700, color: '#00C875' }}>+{ref.bonus.toLocaleString()}</div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 10, color: 'rgba(255,255,255,.3)' }}>coins</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Demo claim */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ ...card, border: '1px solid rgba(255,215,0,.2)', textAlign: 'center', padding: '24px' }}>
          <div style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 16, fontWeight: 700, color: '#FFD700', marginBottom: 8 }}>
            Demo Referral Bonus
          </div>
          <p style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, color: 'rgba(255,255,255,.5)', margin: '0 0 18px' }}>
            Test the referral flow — claim 1,000 free coins now.
          </p>
          <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,215,0,.4)' }} whileTap={{ scale: 0.95 }} onClick={claimBonus}
            style={{
              padding: '13px 36px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#B8960C,#FFD700)', fontFamily: 'Cinzel Decorative,serif',
              fontSize: 15, fontWeight: 900, color: '#1a1000',
            }}>
            🎁 Claim 1,000 Coins
          </motion.button>
        </motion.div>

      </main>
      <MobileBottomNav />
    </div>
  );
}
