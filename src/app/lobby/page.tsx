'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import Sidebar, { MobileBottomNav } from '@/components/layout/sidebar';
import GameCard from '@/components/lobby/game-card';
import { generateFakeWin, VIP_LEVELS } from '@/data/fake-data';
import { toast } from 'sonner';

const GAMES = [
  {
    id: 'slots',
    name: 'Maharaja Slots',
    category: 'Slots',
    href: '/games/slots',
    emoji: '🎰',
    bg: 'linear-gradient(135deg,#2d0b6b 0%,#5c1aad 60%,#8b2be2 100%)',
    badge: 'HOT',
    players: 842,
    rtp: '96.5%',
  },
  {
    id: 'crash',
    name: 'Crash Rocket',
    category: 'Originals',
    href: '/games/crash',
    emoji: '🚀',
    bg: 'linear-gradient(135deg,#003d1a 0%,#006633 60%,#00c875 100%)',
    badge: 'LIVE',
    players: 1204,
    rtp: '99%',
  },
  {
    id: 'blackjack',
    name: 'Royal Blackjack',
    category: 'Table',
    href: '/games/blackjack',
    emoji: '🃏',
    bg: 'linear-gradient(135deg,#2a1500 0%,#5a3000 60%,#b8960c 100%)',
    badge: 'NEW',
    players: 367,
    rtp: '99.5%',
  },
  {
    id: 'mines',
    name: 'Diamond Mines',
    category: 'Originals',
    href: '/games/mines',
    emoji: '💎',
    bg: 'linear-gradient(135deg,#001a2a 0%,#003d5a 60%,#00c8e6 100%)',
    badge: 'POPULAR',
    players: 593,
    rtp: '99%',
  },
];

interface ActivityItem {
  id: string;
  username: string;
  game: string;
  amount: number;
  avatar: string;
}

export default function LobbyPage() {
  const { userProfile, updateBalance, user, loading } = useAuth();
  const router = useRouter();
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [jackpot, setJackpot] = useState(10243100);
  const [onlinePlayers, setOnlinePlayers] = useState(271);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    const lastBonus = localStorage.getItem('gupta_last_bonus');
    const today = new Date().toDateString();
    if (lastBonus !== today) setTimeout(() => setShowDailyBonus(true), 1500);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setJackpot(j => j + Math.floor(Math.random() * 80 + 20)), 1500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setOnlinePlayers(p => Math.max(200, p + Math.floor(Math.random() * 7) - 3)), 5000);
    return () => clearInterval(t);
  }, []);

  const addActivity = useCallback(() => {
    const win = generateFakeWin();
    setActivity(prev => [{ id: win.id, username: win.username, game: win.game, amount: win.amount, avatar: win.avatar }, ...prev.slice(0, 5)]);
  }, []);

  useEffect(() => {
    addActivity();
    const t = setInterval(addActivity, 3500);
    return () => clearInterval(t);
  }, [addActivity]);

  const handleDailyBonus = () => {
    if (dailyClaimed) return;
    setDailyClaimed(true);
    updateBalance(500);
    localStorage.setItem('gupta_last_bonus', new Date().toDateString());
    toast.success('🎁 +500 Gupta Coins!');
    setShowDailyBonus(false);
  };

  const vipInfo = VIP_LEVELS[userProfile?.vipLevel ?? 0];
  const xpProgress = userProfile && vipInfo
    ? Math.min(100, ((userProfile.vipXP - vipInfo.minXP) / (vipInfo.maxXP - vipInfo.minXP)) * 100)
    : 0;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(155deg,#0D0520 0%,#110836 22%,#0A1A0F 48%,#1A0830 75%,#0D0520 100%)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 24, fontWeight: 900, background: 'linear-gradient(135deg,#FFD700,#FFF176,#B8960C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 16 }}>GUPTA GAMES</div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(255,215,0,.2)', borderTopColor: '#FFD700', animation: 'spin .7s linear infinite', margin: '0 auto' }} />
      </div>
    </div>
  );
  if (!user) return null;

  return (
    <div className="page-layout">
      <Navbar />
      <Sidebar />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '20px 16px 24px' }}>

          {/* Balance hero card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255,215,0,0.06)',
              border: '1px solid rgba(255,215,0,0.25)',
              borderRadius: 20,
              padding: '20px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              backdropFilter: 'blur(20px)',
            }}
          >
            <div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 12, color: 'rgba(255,255,255,.45)', letterSpacing: '.1em', marginBottom: 4 }}>
                YOUR BALANCE
              </div>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 28, fontWeight: 900, color: '#FFD700', lineHeight: 1 }}>
                🪙 {(userProfile?.balance ?? 0).toLocaleString()}
              </div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>
                Welcome back, {userProfile?.username ?? 'Player'}!
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 12, color: vipInfo?.color ?? '#CD7F32', fontWeight: 700, background: 'rgba(255,255,255,.06)', borderRadius: 8, padding: '4px 10px' }}>
                {vipInfo?.badge} {vipInfo?.label}
              </div>
              {showDailyBonus && !dailyClaimed && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDailyBonus}
                  style={{ fontFamily: 'Syne,sans-serif', fontSize: 12, fontWeight: 700, color: '#1a1000', background: 'linear-gradient(135deg,#B8960C,#FFD700)', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', boxShadow: '0 0 20px rgba(255,215,0,.4)' }}
                >
                  🎁 Claim 500 Coins!
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Jackpot banner */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: 'linear-gradient(135deg,rgba(255,107,26,.1) 0%,rgba(255,215,0,.08) 100%)',
              border: '1px solid rgba(255,215,0,.2)',
              borderRadius: 16,
              padding: '14px 18px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ fontSize: 28 }}
              >
                🏆
              </motion.span>
              <div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: '.1em' }}>PROGRESSIVE JACKPOT</div>
                <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 22, fontWeight: 900, color: '#FFD700' }}>
                  {jackpot.toLocaleString()}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Syne,sans-serif', fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C875', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                {onlinePlayers} online
              </div>
              <Link href="/games/slots">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 11, fontWeight: 900, color: '#1a1000', background: 'linear-gradient(135deg,#B8960C,#FFD700)', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer' }}
                >
                  Play →
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Quick stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}
          >
            {[
              { label: 'Coins Won', value: (userProfile?.totalWon ?? 0).toLocaleString(), color: '#00C875' },
              { label: 'Games', value: (userProfile?.gamesPlayed ?? 0).toString(), color: '#00E5FF' },
              { label: 'VIP XP', value: Math.floor(userProfile?.vipXP ?? 0).toLocaleString(), color: vipInfo?.color ?? '#CD7F32' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                style={{
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: 14,
                  padding: '16px 12px 14px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 18, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 6 }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Games section */}
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 16, fontWeight: 900, color: '#FFD700', margin: 0 }}>🔥 Games</h2>
            <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, fontWeight: 700, color: '#FF6B1A', background: 'rgba(255,107,26,.12)', borderRadius: 20, padding: '3px 10px' }}>4 LIVE</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 24 }}>
            {GAMES.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
              >
                <GameCard game={game} />
              </motion.div>
            ))}
          </div>

          {/* VIP progress */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            style={{
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,215,0,.15)',
              borderRadius: 16,
              padding: '16px 18px',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 13, color: '#FFD700', fontWeight: 700 }}>
                {vipInfo?.badge} VIP Progress
              </span>
              <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 12, color: vipInfo?.color ?? '#CD7F32', fontWeight: 700 }}>
                {vipInfo?.label}
              </span>
            </div>
            <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
                style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${vipInfo?.color ?? '#CD7F32'},#FFD700)` }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Syne,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 6 }}>
              <span>{Math.floor(userProfile?.vipXP ?? 0).toLocaleString()} XP</span>
              <span>{vipInfo?.maxXP.toLocaleString()} XP</span>
            </div>
          </motion.div>

          {/* Live activity feed */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            style={{
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 16,
              padding: '16px',
              marginBottom: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C875', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 13, fontWeight: 700, color: '#FFD700' }}>Live Wins</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <AnimatePresence>
                {activity.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -40, opacity: 0 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,.03)',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{item.avatar}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.username}</div>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.game}</div>
                    </div>
                    <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 13, fontWeight: 700, color: '#00C875', whiteSpace: 'nowrap' }}>+{item.amount.toLocaleString()}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

        </main>

      <MobileBottomNav />
    </div>
  );
}
