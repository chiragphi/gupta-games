'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import Sidebar, { MobileBottomNav } from '@/components/layout/sidebar';
import { FAKE_LEADERBOARD, VIP_LEVELS } from '@/data/fake-data';

type Tab = 'alltime' | 'week' | 'today';

function scramble<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() * 0.4 - 0.2);
}

const PODIUM_CONFIG = [
  { rank: 2, color: '#C0C0C0', glow: 'rgba(192,192,192,0.3)', medal: '🥈', height: 110, order: 0 },
  { rank: 1, color: '#FFD700', glow: 'rgba(255,215,0,0.5)', medal: '🥇', height: 150, order: 1 },
  { rank: 3, color: '#CD7F32', glow: 'rgba(205,127,50,0.3)', medal: '🥉', height: 90, order: 2 },
];

export default function LeaderboardPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('alltime');
  const [board, setBoard] = useState(FAKE_LEADERBOARD);

  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);

  useEffect(() => {
    const base = [...FAKE_LEADERBOARD];
    if (tab === 'week') {
      setBoard(scramble(base).map((e, i) => ({ ...e, rank: i + 1, totalWon: Math.floor(e.totalWon * (0.3 + Math.random() * 0.5)) })));
    } else if (tab === 'today') {
      setBoard(scramble(base).slice(0, 15).map((e, i) => ({ ...e, rank: i + 1, totalWon: Math.floor(e.totalWon * (0.05 + Math.random() * 0.15)) })));
    } else {
      setBoard(FAKE_LEADERBOARD);
    }
  }, [tab]);

  const top3 = board.slice(0, 3);
  const rest = board.slice(3);

  if (!user) return null;

  return (
    <div className="page-layout">
      <Navbar />
      <Sidebar />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 22, fontWeight: 900, color: '#FFD700', margin: 0 }}>
            🏆 Leaderboard
          </h1>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['alltime', 'week', 'today'] as Tab[]).map(t => (
              <motion.button key={t} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setTab(t)}
                style={{
                  padding: '7px 16px', borderRadius: 10, fontFamily: 'Syne,sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
                  background: tab === t ? 'rgba(255,215,0,.18)' : 'rgba(255,255,255,.05)',
                  color: tab === t ? '#FFD700' : 'rgba(255,255,255,.45)',
                  outline: tab === t ? '1px solid rgba(255,215,0,.4)' : '1px solid rgba(255,255,255,.08)',
                }}>
                {t === 'alltime' ? 'All Time' : t === 'week' ? 'This Week' : 'Today'}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Podium — card-based, not bars */}
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
            {PODIUM_CONFIG.map(cfg => {
              const entry = top3.find(e => e.rank === cfg.rank);
              if (!entry) return null;
              const isFirst = cfg.rank === 1;
              return (
                <motion.div key={entry.username}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: cfg.rank * 0.1, type: 'spring', stiffness: 180 }}
                  style={{
                    flex: isFirst ? '0 0 220px' : '0 0 180px',
                    background: `linear-gradient(160deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,.02) 100%)`,
                    border: `1px solid ${cfg.color}50`,
                    borderRadius: 20,
                    padding: isFirst ? '24px 16px 20px' : '18px 14px 16px',
                    textAlign: 'center',
                    boxShadow: `0 0 ${isFirst ? 50 : 25}px ${cfg.glow}`,
                    position: 'relative',
                    backdropFilter: 'blur(12px)',
                  }}>
                  {/* Medal badge */}
                  <div style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    width: 28, height: 28, borderRadius: '50%',
                    background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontFamily: 'Orbitron,sans-serif', fontWeight: 900, color: '#000',
                    boxShadow: `0 0 12px ${cfg.glow}`,
                  }}>
                    {cfg.rank}
                  </div>
                  <div style={{ fontSize: isFirst ? 48 : 38, marginBottom: 8, lineHeight: 1 }}>{entry.avatar}</div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: isFirst ? 15 : 13, fontWeight: 700, color: '#fff', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.username}
                  </div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 10, color: VIP_LEVELS[entry.vipLevel]?.color, fontWeight: 700, marginBottom: 8 }}>
                    {VIP_LEVELS[entry.vipLevel]?.badge} {VIP_LEVELS[entry.vipLevel]?.label}
                  </div>
                  <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: isFirst ? 16 : 13, fontWeight: 800, color: cfg.color }}>
                    {entry.totalWon.toLocaleString()}
                  </div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>coins won</div>
                  <div style={{ fontSize: isFirst ? 28 : 22, marginTop: 10 }}>{cfg.medal}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Rank list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rest.map((entry, i) => {
            const vipInfo = VIP_LEVELS[entry.vipLevel];
            const isYou = entry.username === userProfile?.username;
            return (
              <motion.div key={entry.username}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 14,
                  background: isYou ? 'rgba(255,215,0,.07)' : 'rgba(255,255,255,.03)',
                  border: isYou ? '1px solid rgba(255,215,0,.3)' : '1px solid rgba(255,255,255,.05)',
                }}>
                {/* Rank */}
                <div style={{ width: 36, fontFamily: 'Orbitron,sans-serif', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.35)', flexShrink: 0 }}>
                  #{entry.rank}
                </div>
                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{entry.avatar}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: isYou ? '#FFD700' : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.username}{isYou && ' 👈'}
                    </div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, color: vipInfo?.color, fontWeight: 600 }}>
                      {vipInfo?.badge} {vipInfo?.label}
                    </div>
                  </div>
                </div>
                {/* Games */}
                <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.35)', flexShrink: 0, textAlign: 'right' }}>
                  {entry.gamesPlayed}g
                </div>
                {/* Won */}
                <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 13, fontWeight: 700, color: '#00C875', flexShrink: 0, minWidth: 80, textAlign: 'right' }}>
                  {entry.totalWon.toLocaleString()}
                </div>
              </motion.div>
            );
          })}
        </div>

      </main>
      <MobileBottomNav />
    </div>
  );
}
