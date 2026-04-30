'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import { MobileBottomNav } from '@/components/layout/sidebar';
import { VIP_LEVELS, AVATARS } from '@/data/fake-data';
import { toast } from 'sonner';
import { Edit2 } from 'lucide-react';

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
    <div className="page-layout">
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', fontSize: 26, fontWeight: 700, marginBottom: 24, margin: '0 0 24px 0' }}
        >
          Profile
        </motion.h1>

        {/* Profile Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(255,255,255,0.05)', border: `1px solid ${vipInfo?.color ?? '#FFD700'}40`,
            borderRadius: 20, padding: 28, marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
          }}
        >
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            style={{ fontSize: 72, lineHeight: 1, filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.4))' }}
          >
            {userProfile?.avatar ?? '🦁'}
          </motion.div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontFamily: 'Cinzel Decorative, serif', color: 'rgba(255,255,255,0.9)', fontSize: 22, fontWeight: 700, margin: '0 0 6px 0' }}>
              {userProfile?.username ?? 'Player'}
            </h2>
            <div style={{ fontSize: 14, fontWeight: 700, color: vipInfo?.color, marginBottom: 4 }}>
              {vipInfo?.badge} {vipInfo?.label}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
              Member since {userProfile?.joinDate ? new Date(userProfile.joinDate).toLocaleDateString() : '—'}
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setEditing(!editing)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              <Edit2 size={14} /> Edit Profile
            </motion.button>
          </div>

          {/* Balance */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: 4 }}>BALANCE</div>
            <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22, fontWeight: 900, color: '#FFD700' }}>
              🪙 {(userProfile?.balance ?? 0).toLocaleString()}
            </div>
          </div>
        </motion.div>

        {/* Edit Form */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #00E5FF', borderRadius: 16, padding: 24, marginBottom: 20 }}
          >
            <h3 style={{ fontFamily: 'Cinzel Decorative, serif', color: '#00E5FF', fontWeight: 700, fontSize: 16, margin: '0 0 16px 0' }}>Edit Profile</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6, letterSpacing: 1 }}>USERNAME</label>
              <input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                maxLength={20}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8, letterSpacing: 1 }}>AVATAR</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {AVATARS.map((av) => (
                  <motion.button
                    key={av}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setNewAvatar(av)}
                    style={{ fontSize: 28, padding: 8, borderRadius: 10, cursor: 'pointer', background: newAvatar === av ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.04)', border: `2px solid ${newAvatar === av ? '#FFD700' : 'transparent'}` }}
                  >
                    {av}
                  </motion.button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                onClick={saveEdit}
                disabled={saving}
                style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #FFD700, #FF9500)', color: '#1a1000', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}
              >
                {saving ? 'Saving...' : 'Save'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                onClick={() => setEditing(false)}
                style={{ padding: '10px 24px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Stats Row: 2×2 on mobile, 4-col on desktop */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Games Played', value: (userProfile?.gamesPlayed ?? 0).toLocaleString(), icon: '🎮', color: '#00E5FF' },
            { label: 'Total Wagered', value: (userProfile?.totalWagered ?? 0).toLocaleString(), icon: '🪙', color: '#FFD700' },
            { label: 'Biggest Win', value: (userProfile?.biggestWin ?? 0).toLocaleString(), icon: '🏆', color: '#00C875' },
            { label: 'Login Streak', value: `${userProfile?.streak ?? 1} days`, icon: '🔥', color: '#FF9500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 16, padding: 20, textAlign: 'center' }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 16, fontWeight: 700, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* VIP Progress Bar Card */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${vipInfo?.color ?? '#FFD700'}30`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
            VIP Progress
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, color: 'rgba(255,255,255,0.5)' }}>
            <span>{vipInfo?.label}</span>
            <span>{VIP_LEVELS[Math.min((userProfile?.vipLevel ?? 0) + 1, 5)]?.label ?? 'MAX'}</span>
          </div>
          <div style={{ width: '100%', borderRadius: 99, height: 10, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 8 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(xpProgress, 100)}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${vipInfo?.color ?? '#FFD700'}, #FFD700)` }}
            />
          </div>
          <div style={{ fontSize: 12, textAlign: 'right', color: 'rgba(255,255,255,0.4)' }}>
            {Math.floor(userProfile?.vipXP ?? 0).toLocaleString()} / {vipInfo?.maxXP.toLocaleString()} XP
          </div>
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {vipInfo?.benefits.map((b: string, i: number) => (
              <span key={i} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#00C875' }}>✓</span> {b}
              </span>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
            Achievements ({unlockedAchievements.size}/{ACHIEVEMENTS.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 12 }}>
            {ACHIEVEMENTS.map((ach, i) => {
              const unlocked = unlockedAchievements.has(ach.id);
              return (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  title={`${ach.label}: ${ach.desc} (+${ach.xp} XP)`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'default' }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                    background: unlocked ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${unlocked ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    filter: unlocked ? 'none' : 'grayscale(1) opacity(0.4)',
                  }}>
                    {ach.emoji}
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 10, color: unlocked ? '#FFD700' : 'rgba(255,255,255,0.4)', lineHeight: 1.2 }}>
                    {ach.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Referral Code Card */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(233,30,140,0.3)', borderRadius: 16, padding: 24 }}>
          <div style={{ fontFamily: 'Cinzel Decorative, serif', color: '#E91E8C', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
            Your Referral Code
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 20, fontWeight: 900, padding: '10px 20px', borderRadius: 12, background: 'rgba(233,30,140,0.1)', color: '#E91E8C', letterSpacing: 4 }}>
              {userProfile?.referralCode ?? 'GUPTA000'}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => { navigator.clipboard.writeText(userProfile?.referralCode ?? ''); toast.success('Copied!'); }}
              style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Copy
            </motion.button>
          </div>
          <p style={{ fontSize: 12, marginTop: 10, color: 'rgba(255,255,255,0.4)' }}>Share your code and earn 1,000 coins per referral!</p>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
