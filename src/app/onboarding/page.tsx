'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { AVATARS } from '@/data/fake-data';
import { toast } from 'sonner';

function CoinRainEffect() {
  const coins = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 1.5 + Math.random() * 1.5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {coins.map(c => (
        <motion.div
          key={c.id}
          className="absolute text-3xl"
          style={{ left: `${c.x}%`, top: '-40px' }}
          animate={{
            y: ['0px', '110vh'],
            rotate: [0, 720],
            opacity: [1, 0],
          }}
          transition={{
            duration: c.duration,
            delay: c.delay,
            ease: 'easeIn',
          }}
        >
          🪙
        </motion.div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const { user, updateProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleUsernameNext = () => {
    if (!username || username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    if (username.length > 20) {
      toast.error('Username must be 20 characters or less');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return;
    }
    setStep(1);
  };

  const handleAvatarNext = () => {
    if (!selectedAvatar) {
      toast.error('Please select an avatar');
      return;
    }
    setStep(2);
    setShowCoins(true);
    setTimeout(() => setShowCoins(false), 4000);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await updateProfile({ username, avatar: selectedAvatar, balance: 10000 });
      toast.success('Your profile is ready! Time to reign!');
      setTimeout(() => router.push('/lobby'), 500);
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Choose Your Warrior Name', emoji: '⚔️' },
    { title: 'Choose Your Avatar', emoji: '🎭' },
    { title: 'Your Coins Await!', emoji: '🪙' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: 'var(--void)' }}>
      {showCoins && <CoinRainEffect />}

      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.05) 0%, transparent 70%)' }} />

      {/* Step indicators */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
              style={{
                background: i <= step ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                color: i <= step ? '#1a1000' : 'var(--text-muted)',
              }}
            >
              {i < step ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className="w-12 h-0.5 transition-all duration-300" style={{ background: i < step ? 'var(--gold)' : 'rgba(255,255,255,0.15)' }} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="glass-card w-full max-w-md p-8 relative z-10"
            style={{ border: '1px solid rgba(255,215,0,0.25)' }}
          >
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">⚔️</div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>
                Choose Your Warrior Name
              </h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                This is how you&apos;ll be known in the palace
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="RajKumar99"
                className="input-dark w-full px-4 py-3 rounded-xl text-base"
                maxLength={20}
                onKeyDown={e => e.key === 'Enter' && handleUsernameNext()}
              />
              <div className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>{username.length}/20</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Letters, numbers, and underscores only. 3-20 characters.
              </div>
              <motion.button
                onClick={handleUsernameNext}
                className="btn-gold w-full py-3 rounded-xl font-bold mt-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue →
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="glass-card w-full max-w-lg p-8 relative z-10"
            style={{ border: '1px solid rgba(255,215,0,0.25)' }}
          >
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">🎭</div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>
                Choose Your Avatar
              </h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Select your royal insignia
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {AVATARS.map((avatar) => (
                <motion.button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className="aspect-square rounded-xl flex items-center justify-center text-4xl transition-all duration-200"
                  style={{
                    background: selectedAvatar === avatar ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.04)',
                    border: selectedAvatar === avatar ? '2px solid var(--gold)' : '2px solid transparent',
                    boxShadow: selectedAvatar === avatar ? '0 0 20px rgba(255,215,0,0.4)' : 'none',
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {avatar}
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="btn-glass flex-1 py-3 rounded-xl font-semibold">
                ← Back
              </button>
              <motion.button
                onClick={handleAvatarNext}
                className="btn-gold flex-[2] py-3 rounded-xl font-bold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue →
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="glass-card w-full max-w-md p-10 text-center relative z-10"
            style={{ border: '2px solid rgba(255,215,0,0.5)', boxShadow: '0 0 60px rgba(255,215,0,0.2)' }}
          >
            <motion.div
              className="text-7xl mb-4"
              animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: 2 }}
            >
              🏆
            </motion.div>

            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>
              Welcome, {username}!
            </h2>
            <div className="text-6xl my-4">{selectedAvatar}</div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="rounded-2xl p-4 mb-6"
              style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)' }}
            >
              <div className="text-4xl font-bold mb-1" style={{ fontFamily: 'Orbitron, sans-serif', color: 'var(--gold)' }}>
                +10,000
              </div>
              <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>Gupta Coins Added!</div>
            </motion.div>

            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
              Your royal treasury is ready. Enter the palace and start your reign!
            </p>

            <motion.button
              onClick={handleFinish}
              disabled={loading}
              className="btn-gold w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 glow-pulse"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <><div className="spinner w-5 h-5" /> Loading...</> : 'Enter the Palace 🎰'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
