'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import Sidebar from '@/components/layout/sidebar';
import { FAKE_LEADERBOARD, VIP_LEVELS } from '@/data/fake-data';

type Tab = 'alltime' | 'week' | 'today';

function scramble<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() * 0.4 - 0.2);
}

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
  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--void)' }}>
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-6" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>
            🏆 Leaderboard
          </motion.h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(['alltime', 'week', 'today'] as Tab[]).map((t) => (
              <motion.button key={t} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setTab(t)}
                className="px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all"
                style={{
                  background: tab === t ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${tab === t ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`,
                  color: tab === t ? 'var(--gold)' : 'var(--text-muted)',
                }}>
                {t === 'alltime' ? 'All Time' : t === 'week' ? 'This Week' : 'Today'}
              </motion.button>
            ))}
          </div>

          {/* Podium */}
          <div className="flex items-end justify-center gap-4 mb-10">
            {podiumOrder.map((entry, pi) => {
              if (!entry) return null;
              const isFirst = pi === 1;
              const height = isFirst ? 140 : 100;
              const rank = entry.rank;
              const medals = ['🥇', '🥈', '🥉'];
              const colors = ['var(--gold)', '#C0C0C0', '#CD7F32'];
              const actualIdx = rank - 1;
              return (
                <motion.div key={entry.username}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: actualIdx * 0.15, type: 'spring', stiffness: 150 }}
                  className="flex flex-col items-center"
                >
                  <div className="text-4xl mb-2">{entry.avatar}</div>
                  <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{entry.username}</div>
                  <div className="font-number text-xs font-bold mb-2" style={{ color: 'var(--emerald)', fontFamily: 'Orbitron, sans-serif' }}>
                    {entry.totalWon.toLocaleString()}
                  </div>
                  <motion.div
                    className="flex items-start justify-center rounded-t-xl relative"
                    style={{
                      width: isFirst ? 100 : 80,
                      height,
                      background: `linear-gradient(to top, ${colors[actualIdx]}20, ${colors[actualIdx]}40)`,
                      border: `1px solid ${colors[actualIdx]}60`,
                      borderBottom: 'none',
                    }}
                  >
                    <span className="text-3xl mt-3">{medals[actualIdx]}</span>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Table */}
          <div className="glass-card overflow-hidden">
            <div className="grid text-xs font-bold p-3 sticky top-0" style={{ background: 'rgba(0,0,0,0.5)', color: 'var(--text-muted)', gridTemplateColumns: '3rem 1fr 6rem 5rem 5rem' }}>
              <span>Rank</span><span>Player</span><span>VIP</span><span className="text-right">Won</span><span className="text-right">Games</span>
            </div>
            {rest.map((entry, i) => {
              const vipInfo = VIP_LEVELS[entry.vipLevel];
              const isYou = entry.username === userProfile?.username;
              return (
                <motion.div key={entry.username}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid items-center p-3 text-sm"
                  style={{
                    gridTemplateColumns: '3rem 1fr 6rem 5rem 5rem',
                    background: isYou ? 'rgba(255,215,0,0.06)' : i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    borderLeft: isYou ? '3px solid var(--gold)' : '3px solid transparent',
                  }}
                >
                  <span className="font-number font-bold" style={{ color: 'var(--text-muted)', fontFamily: 'Orbitron, sans-serif', fontSize: 12 }}>
                    #{entry.rank}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{entry.avatar}</span>
                    <span className="font-bold" style={{ color: isYou ? 'var(--gold)' : 'var(--text-primary)' }}>
                      {entry.username} {isYou && <span className="text-xs">(you)</span>}
                    </span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: vipInfo?.color }}>{vipInfo?.badge} {vipInfo?.label}</span>
                  <span className="font-number text-right font-bold" style={{ color: 'var(--emerald)', fontFamily: 'Orbitron, sans-serif', fontSize: 11 }}>
                    {entry.totalWon.toLocaleString()}
                  </span>
                  <span className="font-number text-right" style={{ color: 'var(--text-muted)', fontFamily: 'Orbitron, sans-serif', fontSize: 11 }}>
                    {entry.gamesPlayed}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
