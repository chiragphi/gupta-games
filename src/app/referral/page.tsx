'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import Sidebar from '@/components/layout/sidebar';
import { toast } from 'sonner';
import { Copy, Share2, Users, Gift, TrendingUp } from 'lucide-react';

const FAKE_REFERRALS = [
  { username: 'SpiceTrader99', avatar: '🌶️', joined: '3 days ago', bonus: 1000, status: 'active' },
  { username: 'MumbaiMaharaja', avatar: '🦁', joined: '1 week ago', bonus: 1000, status: 'active' },
  { username: 'DelhiDreamer', avatar: '🌙', joined: '2 weeks ago', bonus: 1000, status: 'active' },
];

export default function ReferralPage() {
  const { user, userProfile, updateBalance } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showShareAnim, setShowShareAnim] = useState(false);

  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);

  const code = userProfile?.referralCode ?? 'GUPTA000';
  const referralLink = `https://guptagames.vercel.app/auth/signup?ref=${code}`;
  const totalEarned = FAKE_REFERRALS.length * 1000;

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setShowShareAnim(true);
    toast.success('Referral link copied!');
    setTimeout(() => setShowShareAnim(false), 1500);
  };

  const claimBonus = () => {
    updateBalance(1000);
    toast.success('🎁 +1,000 Gupta Coins claimed!');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--void)' }}>
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-3xl">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-6" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>
            👥 Referral Program
          </motion.h1>

          {/* Hero Card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(233,30,140,0.08) 0%, rgba(255,215,0,0.05) 100%)', border: '2px solid rgba(233,30,140,0.3)' }}>
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-6xl mb-4">🎁</motion.div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--magenta)' }}>
              Invite Friends, Earn Coins!
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              For every friend who joins using your code, you BOTH get <strong style={{ color: 'var(--gold)' }}>1,000 Gupta Coins</strong> free!
            </p>

            {/* Code Display */}
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl mb-4"
              style={{ background: 'rgba(233,30,140,0.1)', border: '2px dashed rgba(233,30,140,0.5)' }}>
              <span className="font-number text-3xl font-black tracking-[0.3em]"
                style={{ color: 'var(--magenta)', fontFamily: 'Orbitron, sans-serif' }}>
                {code}
              </span>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={copyCode}
                className="p-2 rounded-lg" style={{ background: copied ? 'rgba(0,200,117,0.2)' : 'rgba(233,30,140,0.2)', color: copied ? 'var(--emerald)' : 'var(--magenta)' }}>
                {copied ? '✓' : <Copy size={18} />}
              </motion.button>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={copyLink}
                className="btn-gold px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                style={{ fontFamily: 'Syne, sans-serif' }}>
                <AnimatePresence>
                  {showShareAnim ? (
                    <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>✓</motion.span>
                  ) : (
                    <Share2 size={16} />
                  )}
                </AnimatePresence>
                Share Link
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { navigator.clipboard.writeText(`Hey! Join me on Gupta Games and get 1,000 free coins! Use my code ${code}: ${referralLink}`); toast.success('Message copied!'); }}
                className="btn-glass px-6 py-3 rounded-xl font-bold text-sm">
                Copy Message
              </motion.button>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Friends Referred', value: FAKE_REFERRALS.length, icon: Users, color: 'var(--teal)' },
              { label: 'Coins Earned', value: totalEarned.toLocaleString(), icon: Gift, color: 'var(--gold)' },
              { label: 'Active Friends', value: FAKE_REFERRALS.filter(r => r.status === 'active').length, icon: TrendingUp, color: 'var(--emerald)' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="glass-card p-4 text-center">
                  <Icon size={20} className="mx-auto mb-2" style={{ color: stat.color }} />
                  <div className="font-number text-xl font-bold" style={{ color: stat.color, fontFamily: 'Orbitron, sans-serif' }}>{stat.value}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Referral History */}
          <div className="glass-card p-5 mb-6">
            <div className="font-bold mb-4" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>Referred Friends</div>
            {FAKE_REFERRALS.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                <div className="text-4xl mb-3">👥</div>
                <p>No referrals yet. Share your code to start earning!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {FAKE_REFERRALS.map((ref, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-2xl">{ref.avatar}</span>
                    <div className="flex-1">
                      <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{ref.username}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Joined {ref.joined}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-number font-bold text-sm" style={{ color: 'var(--emerald)', fontFamily: 'Orbitron, sans-serif' }}>
                        +{ref.bonus.toLocaleString()}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>coins earned</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Bonus Claim */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="glass-card p-5 text-center"
            style={{ border: '1px solid rgba(255,215,0,0.3)' }}>
            <div className="text-xl mb-2 font-bold" style={{ color: 'var(--gold)', fontFamily: 'Cinzel Decorative, serif' }}>Demo Referral Bonus</div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Test the referral system — claim a free 1,000 Gupta Coins demo bonus!
            </p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={claimBonus}
              className="btn-gold px-8 py-3 rounded-xl font-bold glow-pulse"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              🎁 Claim 1,000 Coins
            </motion.button>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
