'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { VIP_LEVELS } from '@/data/fake-data';
import { toast } from 'sonner';
import { Bell, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { userProfile, signOut } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const FAKE_NOTIFICATIONS = [
    { id: 1, text: 'Daily bonus available! Claim 500 coins', time: '2 min ago', icon: '🎁' },
    { id: 2, text: 'New game added: Royal Blackjack Pro', time: '1 hour ago', icon: '🃏' },
    { id: 3, text: 'Your referral code was used! +1000 coins', time: '3 hours ago', icon: '👥' },
  ];

  const NAV_LINKS = [
    { href: '/lobby', label: 'Lobby' },
    { href: '/games/slots', label: 'Slots' },
    { href: '/games/crash', label: 'Crash' },
    { href: '/games/blackjack', label: 'Blackjack' },
    { href: '/games/mines', label: 'Mines' },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
      style={{
        background: 'rgba(6,6,15,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-gold)',
      }}
    >
      {/* Logo */}
      <Link href="/lobby" className="font-display text-lg font-black shrink-0" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>
        Gupta Games
      </Link>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map(link => (
          <Link key={link.href} href={link.href}>
            <button
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-white/5"
              style={{ color: 'var(--text-secondary)' }}
            >
              {link.label}
            </button>
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Balance */}
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid var(--border-gold)' }}
          animate={balancePulse ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.4 }}
        >
          <span>🪙</span>
          <span
            className="font-number font-bold text-sm"
            style={{ fontFamily: 'Orbitron, sans-serif', color: 'var(--gold)' }}
          >
            {balance.toLocaleString()}
          </span>
        </motion.div>

        {/* VIP badge */}
        <div
          className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold"
          style={{ background: 'rgba(255,255,255,0.05)', color: vipInfo.color }}
        >
          {vipInfo.badge} {vipInfo.label}
        </div>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Bell size={18} />
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: 'var(--magenta)' }} />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-10 w-72 glass-card overflow-hidden"
                style={{ border: '1px solid var(--border-gold)', zIndex: 100 }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-gold)' }}>
                  <span className="font-semibold text-sm" style={{ color: 'var(--gold)' }}>Notifications</span>
                </div>
                {FAKE_NOTIFICATIONS.map(n => (
                  <div key={n.id} className="px-4 py-3 flex gap-3 hover:bg-white/5 cursor-pointer" style={{ borderBottom: '1px solid rgba(255,215,0,0.05)' }}>
                    <span className="text-xl shrink-0">{n.icon}</span>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{n.text}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-2xl p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            {userProfile?.avatar ?? '👤'}
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-10 w-52 glass-card overflow-hidden"
                style={{ border: '1px solid var(--border-gold)', zIndex: 100 }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-gold)' }}>
                  <p className="font-bold text-sm" style={{ color: 'var(--gold)' }}>{userProfile?.username}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{vipInfo.badge} {vipInfo.label}</p>
                </div>
                {[
                  { href: '/profile', label: '👤 Profile' },
                  { href: '/wallet', label: '💰 Wallet' },
                  { href: '/leaderboard', label: '🏆 Leaderboard' },
                  { href: '/referral', label: '👥 Referral' },
                ].map(item => (
                  <Link key={item.href} href={item.href}>
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                      onClick={() => setDropdownOpen(false)}
                    >
                      {item.label}
                    </button>
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors border-t"
                  style={{ color: '#ef4444', borderColor: 'var(--border-gold)' }}
                >
                  🚪 Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/5"
          style={{ color: 'var(--text-secondary)' }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 glass-card border-t"
            style={{ borderColor: 'var(--border-gold)', zIndex: 100 }}
          >
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}>
                <button
                  className="w-full text-left px-6 py-3 text-sm hover:bg-white/5"
                  style={{ color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,215,0,0.05)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </button>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
