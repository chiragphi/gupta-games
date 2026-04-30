'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
    ? Math.min(100, ((vipXP - vipInfo.minXP) / (vipInfo.maxXP - vipInfo.minXP)) * 100)
    : 100;

  const handleDailyBonus = async () => {
    if (claimedDaily) return;
    const bonus = 500 + vipLevel * 200;
    await updateBalance(bonus);
    setClaimedDaily(true);
    toast.success(`🎁 +${bonus.toLocaleString()} Gupta Coins!`);
  };

  return (
    <aside
      className="hidden md:flex"
      style={{
        position: 'fixed',
        left: 0,
        top: 64,
        bottom: 0,
        width: 224,
        flexDirection: 'column',
        background: 'rgba(10,5,25,0.92)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,215,0,.12)',
        zIndex: 40,
        overflowY: 'auto',
      }}
    >
      <div style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== '/lobby' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 3 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  background: active ? 'rgba(255,215,0,.1)' : 'transparent',
                  border: active ? '1px solid rgba(255,215,0,.25)' : '1px solid transparent',
                  color: active ? '#FFD700' : 'rgba(255,255,255,.55)',
                  transition: 'background .2s,color .2s',
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: active ? 700 : 500 }}>{item.label}</span>
                {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#FFD700' }} />}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* VIP progress */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,215,0,.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, fontWeight: 700, color: vipInfo.color }}>
            {vipInfo.badge} {vipInfo.label}
          </span>
          {vipLevel < 5 && (
            <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.3)' }}>→ {nextVipInfo.label}</span>
          )}
        </div>
        <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${vipInfo.color},#FFD700)` }}
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p style={{ fontFamily: 'Syne,sans-serif', fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>
          {vipXP.toFixed(0)} / {vipLevel < 5 ? vipInfo.maxXP : '∞'} XP
        </p>
      </div>

      {/* Daily bonus */}
      <div style={{ padding: '10px 10px 14px' }}>
        <motion.button
          onClick={handleDailyBonus}
          disabled={claimedDaily}
          animate={!claimedDaily ? { boxShadow: ['0 0 10px rgba(255,215,0,.15)', '0 0 22px rgba(255,215,0,.35)', '0 0 10px rgba(255,215,0,.15)'] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: 12,
            fontFamily: 'Syne,sans-serif',
            fontSize: 13,
            fontWeight: 700,
            border: claimedDaily ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(255,215,0,.35)',
            background: claimedDaily ? 'rgba(255,255,255,.04)' : 'rgba(255,215,0,.1)',
            color: claimedDaily ? 'rgba(255,255,255,.3)' : '#FFD700',
            cursor: claimedDaily ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          🎁 {claimedDaily ? 'Bonus Claimed' : 'Daily Bonus'}
        </motion.button>
      </div>
    </aside>
  );
}

const MOBILE_ITEMS = [
  { href: '/lobby', label: 'Home', icon: '🏛️' },
  { href: '/games/slots', label: 'Slots', icon: '🎰' },
  { href: '/games/crash', label: 'Crash', icon: '🚀' },
  { href: '/wallet', label: 'Wallet', icon: '💰' },
  { href: '/profile', label: 'Me', icon: '👤' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        display: 'flex',
        alignItems: 'stretch',
        background: 'rgba(8,4,20,0.97)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,215,0,.15)',
        zIndex: 50,
      }}
    >
      {MOBILE_ITEMS.map(item => {
        const active = pathname === item.href || (item.href !== '/lobby' && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} style={{ flex: 1 }}>
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              position: 'relative',
            }}>
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '15%',
                    right: '15%',
                    height: 2,
                    borderRadius: 99,
                    background: '#FFD700',
                  }}
                />
              )}
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{
                fontFamily: 'Syne,sans-serif',
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                color: active ? '#FFD700' : 'rgba(255,255,255,.4)',
              }}>
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
