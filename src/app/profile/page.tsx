'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import Sidebar from '@/components/layout/sidebar';
import { VIP_LEVELS, AVATARS } from '@/data/fake-data';
import { toast } from 'sonner';
import { Edit2, Trophy, Zap, Target, Clock } from 'lucide-react';

const ACHIEVEMENTS = [
  { id: 'first_spin', emoji: '🎰', label: 'First Spin', desc: 'Play your first slot', xp: 100 },
  { id: 'high_roller', emoji: '💎', label: 'High Roller', desc: 'Bet 10,000+ in one round', xp: 500 },
  { id: 'lucky_7', emoji: '7️⃣', label: 'Lucky Seven', desc: 'Win 7 times in a row', xp: 700 },
  { id: 'jackpot', emoji: '🏆', label: 'Jackpot Winner', desc: 'Hit the jackpot', xp: 2000 },
  { id: 'daily', emoji: '📅', label: 'Daily Devotee', desc: 'Log in 7 days straight', xp: 300 },
  { id: 'crash', emoji: '🚀', label: 'Moon Shot', desc: 'Cash out at 10x+ in Crash', xp: 400 },
  { id: 'blackjack', emoji: '🃏', label: 'Natural 21', desc: 'Hit Blackjack', xp: 250 },
  { id: 'survivor', emoji: '💣', label: 'Survivor', desc: 'Reveal 20 safe tiles in Mines', xp: 600 },
  { id: 'whale', emoji: '🐋', label: 'Whale', desc: 'Wager 1,000,000 total', xp: 5000 },
  { id: 'social', emoji: '👥', label: 'Social King', desc: 'Refer 5 friends', xp: 1000 },
  { id: 'vip', emoji: '👑', label: 'VIP Ascension', desc: 'Reach Gold VIP', xp: 800 },
  { id: 'maharaja', emoji: '🦚', label: 'Maharaja', desc: 'Reach Maharaja VIP', xp: 10000 },
];

export default function ProfilePage() {
  const { user, userProfile, updateProfile } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);
  useEffect(() => {
    if (userProfile) {
      setNewUsername(userProfile.username);
      setNewAvatar(userProfile.avatar);
    }
  }, [userProfile]);

  const vipInfo = VIP_LEVELS[userProfile?.vipLevel ?? 0];
  const xpProgress = userProfile ? ((userProfile.vipXP - vipInfo.minXP) / (vipInfo.maxXP - vipInfo.minXP)) * 100 : 0;

  const unlockedAchievements = new Set<string>();
  if ((userProfile?.gamesPlayed ?? 0) > 0) unlockedAchievements.add('first_spin');
  if ((userProfile?.biggestWin ?? 0) > 0) unlockedAchievements.add('jackpot');
  if ((userProfile?.vipLevel ?? 0) >= 2) unlockedAchievements.add('vip');
  if ((userProfile?.vipLevel ?? 0) >= 5) unlockedAchievements.add('maharaja');

  const saveEdit = async () => {
    if (!newUsername.trim()) { toast.error('Username required'); return; }
    setSaving(true);
    await updateProfile({ username: newUsername.trim(), avatar: newAvatar });
    setSaving(false);
    setEditing(false);
    toast.success('Profile updated!');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--void)' }}>
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-6" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>
            Profile
          </motion.h1>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Card */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 lg:w-72"
              style={{ border: `1px solid ${vipInfo?.color}40` }}>

              {/* Avatar */}
              <div className="text-center mb-4">
                <motion.div whileHover={{ scale: 1.1 }} className="text-7xl mb-3 inline-block" style={{ filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.4))' }}>
                  {userProfile?.avatar ?? '🦁'}
                </motion.div>
                <h2 className="text-xl font-bold" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--text-primary)' }}>
                  {userProfile?.username ?? 'Player'}
                </h2>
                <div className="text-sm mt-1 font-bold" style={{ color: vipInfo?.color }}>
                  {vipInfo?.badge} {vipInfo?.label}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Member since {userProfile?.joinDate ? new Date(userProfile.joinDate).toLocaleDateString() : '—'}
                </div>
              </div>

              {/* VIP Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  <span>{vipInfo?.label}</span>
                  <span>{VIP_LEVELS[Math.min((userProfile?.vipLevel ?? 0) + 1, 5)]?.label ?? 'MAX'}</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(xpProgress, 100)}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    className="h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${vipInfo?.color}, var(--gold))` }} />
                </div>
                <div className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
                  {Math.floor(userProfile?.vipXP ?? 0).toLocaleString()} / {vipInfo?.maxXP.toLocaleString()} XP
                </div>
              </div>

              {/* VIP Benefits */}
              <div className="mb-4">
                <div className="text-xs font-bold mb-2" style={{ color: 'var(--gold)' }}>VIP BENEFITS</div>
                {vipInfo?.benefits.map((b, i) => (
                  <div key={i} className="text-xs py-1 flex items-center gap-2" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>✓</span><span>{b}</span>
                  </div>
                ))}
              </div>

              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setEditing(!editing)}
                className="btn-glass w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                <Edit2 size={14} /> Edit Profile
              </motion.button>
            </motion.div>

            <div className="flex-1 space-y-6">
              {/* Edit Form */}
              {editing && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5" style={{ border: '1px solid var(--teal)' }}>
                  <h3 className="font-bold mb-4" style={{ color: 'var(--teal)', fontFamily: 'Cinzel Decorative, serif' }}>Edit Profile</h3>
                  <div className="mb-4">
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>USERNAME</label>
                    <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                      className="input-dark w-full px-3 py-2 rounded-lg text-sm" maxLength={20} />
                  </div>
                  <div className="mb-4">
                    <label className="text-xs mb-2 block" style={{ color: 'var(--text-muted)' }}>AVATAR</label>
                    <div className="flex flex-wrap gap-2">
                      {AVATARS.map((av) => (
                        <motion.button key={av} whileHover={{ scale: 1.2 }} onClick={() => setNewAvatar(av)}
                          className="text-3xl p-2 rounded-lg"
                          style={{ background: newAvatar === av ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.04)', border: `2px solid ${newAvatar === av ? 'var(--gold)' : 'transparent'}` }}>
                          {av}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.03 }} onClick={saveEdit} disabled={saving}
                      className="btn-gold px-6 py-2 rounded-lg text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                      {saving ? 'Saving...' : 'Save'}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} onClick={() => setEditing(false)}
                      className="btn-glass px-6 py-2 rounded-lg text-sm">Cancel</motion.button>
                  </div>
                </motion.div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Games Played', value: (userProfile?.gamesPlayed ?? 0).toLocaleString(), icon: '🎮', color: 'var(--teal)' },
                  { label: 'Total Wagered', value: (userProfile?.totalWagered ?? 0).toLocaleString(), icon: '🪙', color: 'var(--gold)' },
                  { label: 'Biggest Win', value: (userProfile?.biggestWin ?? 0).toLocaleString(), icon: '🏆', color: 'var(--emerald)' },
                  { label: 'Login Streak', value: `${userProfile?.streak ?? 1} days`, icon: '🔥', color: 'var(--saffron)' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="glass-card p-4 text-center">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="font-number font-bold" style={{ color: stat.color, fontFamily: 'Orbitron, sans-serif', fontSize: 14 }}>{stat.value}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Achievements */}
              <div className="glass-card p-5">
                <div className="font-bold mb-4" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>
                  Achievements ({unlockedAchievements.size}/{ACHIEVEMENTS.length})
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {ACHIEVEMENTS.map((ach, i) => {
                    const unlocked = unlockedAchievements.has(ach.id);
                    return (
                      <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                        className="flex flex-col items-center gap-1 cursor-default group relative"
                        title={`${ach.label}: ${ach.desc} (+${ach.xp} XP)`}>
                        <div className={`achievement-badge ${unlocked ? 'unlocked' : 'locked'}`}
                          style={{ background: unlocked ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.04)', border: `2px solid ${unlocked ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
                          {ach.emoji}
                        </div>
                        <div className="text-center text-xs" style={{ color: unlocked ? 'var(--gold)' : 'var(--text-muted)', fontSize: 10 }}>
                          {ach.label}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Referral Code */}
              <div className="glass-card p-5" style={{ border: '1px solid rgba(233,30,140,0.3)' }}>
                <div className="font-bold mb-2" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--magenta)' }}>Your Referral Code</div>
                <div className="flex items-center gap-3">
                  <div className="font-number text-xl font-black px-4 py-2 rounded-lg" style={{ background: 'rgba(233,30,140,0.1)', color: 'var(--magenta)', fontFamily: 'Orbitron, sans-serif', letterSpacing: 3 }}>
                    {userProfile?.referralCode ?? 'GUPTA000'}
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => { navigator.clipboard.writeText(userProfile?.referralCode ?? ''); toast.success('Copied!'); }}
                    className="btn-glass px-4 py-2 rounded-lg text-sm">Copy</motion.button>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Share your code and earn 1,000 coins per referral!</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
