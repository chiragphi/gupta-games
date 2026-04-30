'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import Sidebar from '@/components/layout/sidebar';
import GameCard from '@/components/lobby/game-card';
import LiveWinsTicker from '@/components/lobby/live-wins-ticker';
import { generateFakeWin, VIP_LEVELS } from '@/data/fake-data';
import { toast } from 'sonner';
import { Trophy, Zap, Users, Gift, ChevronRight } from 'lucide-react';

const GAMES = [
  {
    id: 'slots',
    name: 'Maharaja Slots',
    category: 'Slots',
    href: '/games/slots',
    emoji: '🎰',
    bg: 'linear-gradient(135deg, #1a0a3e 0%, #3d1078 50%, #7B2FBE 100%)',
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
    bg: 'linear-gradient(135deg, #0f2027 0%, #1a3a2a 50%, #00C875 100%)',
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
    bg: 'linear-gradient(135deg, #1a0f00 0%, #3d2800 50%, #B8960C 100%)',
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
    bg: 'linear-gradient(135deg, #00131a 0%, #003d4d 50%, #00E5FF 100%)',
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
  time: Date;
}

function DailyBonusModal({ onClose, onClaim }: { onClose: () => void; onClaim: () => void }) {
  const [claimed, setClaimed] = useState(false);

  const handleClaim = () => {
    setClaimed(true);
    setTimeout(() => { onClaim(); onClose(); }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="glass-card p-8 max-w-sm w-full mx-4 text-center"
        style={{ border: '2px solid var(--gold)', boxShadow: '0 0 60px rgba(255,215,0,0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={claimed ? { scale: [1, 1.3, 1] } : { rotate: [0, 15, -15, 0] }}
          transition={{ repeat: claimed ? 0 : Infinity, duration: 1.5 }}
          className="text-6xl mb-4"
        >
          {claimed ? '🎊' : '🎁'}
        </motion.div>
        <h2 className="font-display text-2xl mb-2" style={{ color: 'var(--gold)', fontFamily: 'Cinzel Decorative, serif' }}>
          {claimed ? 'Bonus Claimed!' : 'Daily Login Bonus!'}
        </h2>
        {claimed ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="font-number text-4xl font-black my-4"
            style={{ color: 'var(--gold)', fontFamily: 'Orbitron, sans-serif' }}
          >
            +500 Coins!
          </motion.div>
        ) : (
          <>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              Welcome back! Claim your daily reward to keep your streak alive.
            </p>
            <div className="font-number text-3xl font-black my-4" style={{ color: 'var(--gold)', fontFamily: 'Orbitron, sans-serif' }}>
              500 Gupta Coins
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClaim}
              className="btn-gold w-full py-3 rounded-lg font-bold text-lg glow-pulse"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Claim Now!
            </motion.button>
          </>
        )}
        <button
          onClick={onClose}
          className="mt-4 text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          {claimed ? '' : 'Maybe later'}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function LobbyPage() {
  const { userProfile, updateBalance, user } = useAuth();
  const router = useRouter();
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [jackpot, setJackpot] = useState(10243100);
  const [onlinePlayers, setOnlinePlayers] = useState(271);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [jackpotInterval, setJackpotIntervalState] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
  }, [user, router]);

  useEffect(() => {
    const lastBonus = localStorage.getItem('gupta_last_bonus');
    const today = new Date().toDateString();
    if (lastBonus !== today) {
      setTimeout(() => setShowDailyBonus(true), 1500);
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setJackpot((j) => j + Math.floor(Math.random() * 80 + 20));
    }, 1500);
    setJackpotIntervalState(t);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setOnlinePlayers((p) => p + Math.floor(Math.random() * 7) - 3);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const addActivity = useCallback(() => {
    const win = generateFakeWin();
    setActivity((prev) => [
      { id: win.id, username: win.username, game: win.game, amount: win.amount, avatar: win.avatar, time: new Date() },
      ...prev.slice(0, 7),
    ]);
  }, []);

  useEffect(() => {
    addActivity();
    const t = setInterval(addActivity, 3500);
    return () => clearInterval(t);
  }, [addActivity]);

  const handleDailyBonus = () => {
    updateBalance(500);
    localStorage.setItem('gupta_last_bonus', new Date().toDateString());
    toast.success('🎁 +500 Gupta Coins added!');
  };

  const vipInfo = VIP_LEVELS[userProfile?.vipLevel ?? 0];
  const xpProgress = userProfile ? ((userProfile.vipXP - vipInfo.minXP) / (vipInfo.maxXP - vipInfo.minXP)) * 100 : 0;

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--void)' }}>
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {/* Jackpot Banner */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card p-4 mb-6 flex items-center justify-between flex-wrap gap-4"
            style={{ border: '1px solid var(--gold)', background: 'linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(255,107,26,0.05) 100%)' }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-3xl"
              >
                🏆
              </motion.div>
              <div>
                <div className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>PROGRESSIVE JACKPOT</div>
                <div className="font-number text-2xl font-black jackpot-glow" style={{ color: 'var(--gold)', fontFamily: 'Orbitron, sans-serif' }}>
                  {jackpot.toLocaleString()} Coins
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2" style={{ color: 'var(--emerald)' }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-number" style={{ fontFamily: 'Orbitron, sans-serif' }}>{onlinePlayers}</span>
                <span style={{ color: 'var(--text-muted)' }}>players online</span>
              </div>
              <Link href="/games/slots">
                <motion.button whileHover={{ scale: 1.05 }} className="btn-gold px-4 py-2 rounded-lg text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Play for Jackpot →
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Welcome + Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>
              Welcome back, {userProfile?.username ?? 'Player'}! 🎰
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Ready to reign? Your throne awaits.</p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: 'Balance', value: `🪙 ${(userProfile?.balance ?? 0).toLocaleString()}`, color: 'var(--gold)' },
              { label: 'Total Won', value: (userProfile?.totalWon ?? 0).toLocaleString(), color: 'var(--emerald)' },
              { label: 'Games Played', value: (userProfile?.gamesPlayed ?? 0).toLocaleString(), color: 'var(--teal)' },
              { label: 'VIP Level', value: vipInfo?.label ?? 'Bronze', color: vipInfo?.color ?? '#CD7F32' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="glass-card p-4 text-center"
              >
                <div className="font-number text-xl font-bold" style={{ color: stat.color, fontFamily: 'Orbitron, sans-serif' }}>
                  {stat.value}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex gap-6 flex-col xl:flex-row">
            {/* Games Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--text-primary)' }}>
                  🔥 Hot Games
                </h2>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(255,107,26,0.2)', color: 'var(--saffron)' }}>
                  4 GAMES LIVE
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GAMES.map((game, i) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                  >
                    <GameCard game={game} />
                  </motion.div>
                ))}
              </div>

              {/* VIP Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-5 mt-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold" style={{ color: 'var(--gold)', fontFamily: 'Cinzel Decorative, serif' }}>
                    {vipInfo?.badge} VIP Progress
                  </div>
                  <div className="text-sm font-bold" style={{ color: vipInfo?.color }}>
                    {vipInfo?.label}
                  </div>
                </div>
                <div className="w-full rounded-full h-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(xpProgress, 100)}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
                    className="h-3 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${vipInfo?.color}, var(--gold))` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  <span>{Math.floor(userProfile?.vipXP ?? 0).toLocaleString()} XP</span>
                  <span>{vipInfo?.maxXP.toLocaleString()} XP needed</span>
                </div>
              </motion.div>
            </div>

            {/* Live Activity Feed */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full xl:w-72 glass-card p-4"
              style={{ maxHeight: 520, overflow: 'hidden' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-sm" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>
                  Live Activity
                </span>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {activity.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ x: 60, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -60, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="flex items-center gap-2 p-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                      <span className="text-xl">{item.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{item.username}</div>
                        <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{item.game}</div>
                      </div>
                      <div className="text-xs font-bold font-number text-right" style={{ color: 'var(--emerald)', fontFamily: 'Orbitron, sans-serif', whiteSpace: 'nowrap' }}>
                        +{item.amount.toLocaleString()}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Live Wins Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <LiveWinsTicker />
          </motion.div>
        </main>
      </div>

      {/* Daily Bonus Modal */}
      <AnimatePresence>
        {showDailyBonus && (
          <DailyBonusModal
            onClose={() => setShowDailyBonus(false)}
            onClaim={handleDailyBonus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
