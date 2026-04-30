'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { VIP_LEVELS } from '@/data/fake-data';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';

const NOTIFICATIONS = [
  { id: 1, text: 'Daily bonus available! Claim 500 coins', time: '2 min ago', icon: '🎁' },
  { id: 2, text: 'New game: Royal Blackjack Pro', time: '1 hour ago', icon: '🃏' },
  { id: 3, text: 'Referral code used! +1000 coins', time: '3 hours ago', icon: '👥' },
];

export default function Navbar() {
  const { userProfile, signOut } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [prevBalance, setPrevBalance] = useState<number | null>(null);
  const [balancePulse, setBalancePulse] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const balance = userProfile?.balance ?? 0;
  const vipLevel = userProfile?.vipLevel ?? 0;
  const vipInfo = VIP_LEVELS[vipLevel] || VIP_LEVELS[0];

  useEffect(() => {
    if (prevBalance !== null && balance !== prevBalance) {
      setBalancePulse(true);
      setTimeout(() => setBalancePulse(false), 600);
    }
    setPrevBalance(balance);
  }, [balance, prevBalance]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logged out. Come back soon!');
    router.push('/');
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      background: 'rgba(8,4,20,0.95)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(255,215,0,.15)',
      zIndex: 50,
      gap: 8,
    }}>
      {/* Logo */}
      <Link href="/lobby">
        <div style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 16, fontWeight: 900, background: 'linear-gradient(135deg,#FFD700,#FFF176,#B8960C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap', cursor: 'pointer' }}>
          GUPTA GAMES
        </div>
      </Link>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Balance */}
        <motion.div
          animate={balancePulse ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 10,
            background: 'rgba(255,215,0,.08)',
            border: '1px solid rgba(255,215,0,.2)',
          }}
        >
          <span style={{ fontSize: 14 }}>🪙</span>
          <span style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 13, fontWeight: 700, color: '#FFD700' }}>
            {balance.toLocaleString()}
          </span>
        </motion.div>

        {/* Notif bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setNotifOpen(o => !o); setDropdownOpen(false); }}
            style={{ position: 'relative', padding: 8, borderRadius: 10, background: 'rgba(255,255,255,.05)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Bell size={18} />
            <div style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#E91E8C' }} />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 44,
                  width: 280,
                  background: 'rgba(12,6,30,0.98)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,215,0,.2)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  zIndex: 100,
                  boxShadow: '0 20px 60px rgba(0,0,0,.6)',
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,215,0,.1)' }}>
                  <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: '#FFD700' }}>Notifications</span>
                </div>
                {NOTIFICATIONS.map(n => (
                  <div key={n.id} style={{ padding: '10px 16px', display: 'flex', gap: 10, borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer' }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{n.icon}</span>
                    <div>
                      <p style={{ fontFamily: 'Syne,sans-serif', fontSize: 12, color: 'rgba(255,255,255,.8)', margin: 0 }}>{n.text}</p>
                      <p style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.35)', margin: '3px 0 0' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar + dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setDropdownOpen(o => !o); setNotifOpen(false); }}
            style={{ fontSize: 24, padding: '4px', borderRadius: 10, background: 'rgba(255,255,255,.05)', border: 'none', cursor: 'pointer', lineHeight: 1 }}
          >
            {userProfile?.avatar ?? '👤'}
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 44,
                  width: 200,
                  background: 'rgba(12,6,30,0.98)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,215,0,.2)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  zIndex: 100,
                  boxShadow: '0 20px 60px rgba(0,0,0,.6)',
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,215,0,.1)' }}>
                  <p style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: '#FFD700', margin: 0 }}>{userProfile?.username}</p>
                  <p style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, color: vipInfo.color, margin: '2px 0 0' }}>{vipInfo.badge} {vipInfo.label}</p>
                </div>
                {[
                  { href: '/profile', label: '👤 Profile' },
                  { href: '/wallet', label: '💰 Wallet' },
                  { href: '/leaderboard', label: '🏆 Leaderboard' },
                  { href: '/referral', label: '👥 Referral' },
                ].map(item => (
                  <Link key={item.href} href={item.href}>
                    <button
                      onClick={() => setDropdownOpen(false)}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontFamily: 'Syne,sans-serif', fontSize: 13, color: 'rgba(255,255,255,.65)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,.04)' }}
                    >
                      {item.label}
                    </button>
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontFamily: 'Syne,sans-serif', fontSize: 13, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  🚪 Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
