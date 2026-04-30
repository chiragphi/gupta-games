'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { VIP_LEVELS } from '@/data/fake-data';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { href: '/lobby', label: 'Lobby', icon: '🏛️' },
  { href: '/games/slots', label: 'Slots', icon: '🎰' },
  { href: '/games/crash', label: 'Crash', icon: '🚀' },
  { href: '/games/blackjack', label: 'Blackjack', icon: '🃏' },
  { href: '/games/mines', label: 'Mines', icon: '💎' },
  { href: '/wallet', label: 'Wallet', icon: '💰' },
  { href: '/profile', label: 'Profile', icon: '👤' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { href: '/referral', label: 'Referral', icon: '👥' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { userProfile, updateBalance } = useAuth();
  const [claimedDaily, setClaimedDaily] = useState(false);

  const vipLevel = userProfile?.vipLevel ?? 0;
  const vipXP = userProfile?.vipXP ?? 0;
  const vipInfo = VIP_LEVELS[vipLevel];
  const nextVipInfo = VIP_LEVELS[Math.min(vipLevel + 1, 5)];

  const xpProgress = vipLevel < 5
    ? ((vipXP - vipInfo.minXP) / (vipInfo.maxXP - vipInfo.minXP)) * 100
    : 100;

  const handleDailyBonus = async () => {
    if (claimedDaily) return;
    const bonus = 500 + vipLevel * 200;
    await updateBalance(bonus);
    setClaimedDaily(true);
    toast.success(`Daily bonus claimed! +${bonus.toLocaleString()} Gupta Coins!`);
  };

  return (
    <aside
      className="hidden md:flex flex-col w-56 shrink-0 fixed left-0 top-16 bottom-0 overflow-y-auto"
      style={{
        background: 'rgba(6,6,15,0.85)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border-gold)',
        zIndex: 40,
      }}
    >
      <div className="flex-1 py-4 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                style={{
                  background: active ? 'rgba(255,215,0,0.12)' : 'transparent',
                  border: active ? '1px solid rgba(255,215,0,0.3)' : '1px solid transparent',
                  color: active ? 'var(--gold)' : 'var(--text-secondary)',
                }}
                whileHover={{ x: 3 }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} />}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* VIP progress */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border-gold)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold" style={{ color: vipInfo.color }}>
            {vipInfo.badge} {vipInfo.label}
          </span>
          {vipLevel < 5 && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>→ {nextVipInfo.label}</span>
          )}
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${vipInfo.color}, var(--gold))`, width: `${Math.min(xpProgress, 100)}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(xpProgress, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {vipXP.toFixed(0)} / {vipLevel < 5 ? vipInfo.maxXP : '∞'} XP
        </p>
      </div>

      {/* Daily bonus */}
      <div className="px-3 pb-4">
        <motion.button
          onClick={handleDailyBonus}
          disabled={claimedDaily}
          className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          style={{
            background: claimedDaily ? 'rgba(255,255,255,0.05)' : 'rgba(255,215,0,0.12)',
            border: claimedDaily ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,215,0,0.4)',
            color: claimedDaily ? 'var(--text-muted)' : 'var(--gold)',
            boxShadow: claimedDaily ? 'none' : '0 0 15px rgba(255,215,0,0.2)',
          }}
          animate={!claimedDaily ? { boxShadow: ['0 0 10px rgba(255,215,0,0.2)', '0 0 25px rgba(255,215,0,0.4)', '0 0 10px rgba(255,215,0,0.2)'] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎁 {claimedDaily ? 'Bonus Claimed' : 'Daily Bonus'}
        </motion.button>
      </div>
    </aside>
  );
}

// Mobile bottom nav
export function MobileBottomNav() {
  const pathname = usePathname();
  const MOBILE_ITEMS = [
    { href: '/lobby', label: 'Home', icon: '🏛️' },
    { href: '/games/slots', label: 'Slots', icon: '🎰' },
    { href: '/games/crash', label: 'Crash', icon: '🚀' },
    { href: '/wallet', label: 'Wallet', icon: '💰' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex items-center z-40"
      style={{
        background: 'rgba(6,6,15,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-gold)',
        height: 64,
      }}
    >
      {MOBILE_ITEMS.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link key={item.href} href={item.href} className="flex-1">
            <div className="flex flex-col items-center gap-0.5 py-2">
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium" style={{ color: active ? 'var(--gold)' : 'var(--text-muted)' }}>
                {item.label}
              </span>
              {active && <div className="absolute bottom-0 w-8 h-0.5 rounded-full" style={{ background: 'var(--gold)' }} />}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
