'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { LIVE_WIN_MESSAGES, FAKE_TESTIMONIALS } from '@/data/fake-data';

const SLOT_SYMBOLS = ['👑', '💎', '🏆', '🐘', '🦁', '🔔', '🍇', '🍊', '🍋'];

function SlotReel({ symbols, spinning }: { symbols: string[]; spinning: boolean }) {
  return (
    <div
      className="overflow-hidden rounded-lg flex flex-col items-center justify-center"
      style={{
        height: 80,
        width: 72,
        background: 'rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,215,0,0.3)',
      }}
    >
      <motion.div
        animate={spinning ? { y: [0, -400, 0] } : { y: 0 }}
        transition={spinning ? { duration: 0.6, ease: 'easeInOut', repeat: Infinity } : {}}
        className="flex flex-col items-center"
      >
        {symbols.map((s, i) => (
          <div key={i} className="text-3xl flex items-center justify-center" style={{ height: 80 }}>
            {s}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function JackpotCounter() {
  const [count, setCount] = useState(9800000);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const target = 10243100;
    const duration = 2500;
    const startTime = Date.now();
    const startVal = 9800000;
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(startVal + (target - startVal) * eased));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView]);

  // Keep ticking after animation
  useEffect(() => {
    const ticker = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 50 + 10));
    }, 2000);
    return () => clearInterval(ticker);
  }, []);

  return (
    <div ref={ref} className="font-number text-5xl md:text-7xl jackpot-glow" style={{ color: 'var(--gold)', fontFamily: 'Orbitron, sans-serif' }}>
      {count.toLocaleString()}
    </div>
  );
}

function LiveWinsTicker() {
  const [currentIdx, setCurrentIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrentIdx(i => (i + 1) % LIVE_WIN_MESSAGES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const doubled = [...LIVE_WIN_MESSAGES, ...LIVE_WIN_MESSAGES];
  return (
    <div className="marquee-container w-full py-3" style={{ background: 'rgba(255,215,0,0.05)', borderTop: '1px solid rgba(255,215,0,0.15)', borderBottom: '1px solid rgba(255,215,0,0.15)' }}>
      <div className="marquee-content gap-16 px-8">
        {doubled.map((msg, i) => (
          <span key={i} className="text-sm mr-8 flex items-center gap-2 shrink-0" style={{ fontFamily: 'Syne, sans-serif' }}>
            <span style={{ color: 'var(--gold)' }}>🏆</span>
            <span style={{ color: 'var(--text-secondary)' }}>{msg}</span>
            <span style={{ color: 'var(--gold-dim)', margin: '0 16px' }}>•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 8,
    size: 2 + Math.random() * 4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: '0%',
            width: p.size,
            height: p.size,
            background: `rgba(255, 215, 0, ${0.2 + Math.random() * 0.4})`,
          }}
          animate={{
            y: [0, -800],
            opacity: [0, 0.8, 0],
            x: [0, (Math.random() - 0.5) * 100],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

const FEATURE_CARDS = [
  {
    icon: '🎰',
    title: 'Stunning Games',
    desc: 'Experience 4 handcrafted casino games with Mughal Cyber Palace aesthetics. Slots, Crash, Blackjack, and Mines.',
    color: 'var(--gold)',
  },
  {
    icon: '🪙',
    title: 'Gupta Coins Only',
    desc: 'Play with our virtual currency. No real money involved - pure entertainment for the thrill of the game.',
    color: 'var(--emerald)',
  },
  {
    icon: '👑',
    title: 'VIP Maharaja System',
    desc: 'Rise through 6 exclusive tiers from Bronze to Maharaja. Unlock bonuses, cashback, and royal privileges.',
    color: 'var(--magenta)',
  },
];

export default function LandingPage() {
  const [spinning, setSpinning] = useState(true);
  const [reelSymbols] = useState([
    [SLOT_SYMBOLS[0], SLOT_SYMBOLS[4], SLOT_SYMBOLS[2]],
    [SLOT_SYMBOLS[1], SLOT_SYMBOLS[3], SLOT_SYMBOLS[5]],
    [SLOT_SYMBOLS[2], SLOT_SYMBOLS[0], SLOT_SYMBOLS[6]],
    [SLOT_SYMBOLS[5], SLOT_SYMBOLS[1], SLOT_SYMBOLS[3]],
    [SLOT_SYMBOLS[4], SLOT_SYMBOLS[2], SLOT_SYMBOLS[0]],
  ]);

  const featuresRef = useRef<HTMLElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });
  const jackpotRef = useRef<HTMLElement>(null);
  const jackpotInView = useInView(jackpotRef, { once: true });
  const testimonialsRef = useRef<HTMLElement>(null);
  const testimonialsInView = useInView(testimonialsRef, { once: true });

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--void)' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4" style={{ background: 'rgba(6,6,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-gold)' }}>
        <div className="font-display text-xl" style={{ color: 'var(--gold)', fontFamily: 'Cinzel Decorative, serif' }}>
          Gupta Games
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <button className="btn-glass px-5 py-2 rounded-lg text-sm font-semibold">Login</button>
          </Link>
          <Link href="/auth/signup">
            <button className="btn-gold px-5 py-2 rounded-lg text-sm">Sign Up</button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(123,47,190,0.15) 0%, rgba(255,215,0,0.05) 40%, transparent 70%)',
          }}
        />
        <Particles />

        <div className="relative z-10 flex flex-col items-center text-center px-6 gap-8">
          {/* Slot reels teaser */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex gap-2 mb-4"
            style={{
              padding: '16px 24px',
              background: 'rgba(0,0,0,0.6)',
              borderRadius: 16,
              border: '2px solid rgba(255,215,0,0.3)',
              boxShadow: '0 0 40px rgba(255,215,0,0.15)',
            }}
          >
            {reelSymbols.map((reel, i) => (
              <SlotReel key={i} symbols={reel} spinning={spinning} />
            ))}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl md:text-8xl font-black"
            style={{ fontFamily: 'Cinzel Decorative, serif' }}
          >
            <span className="gold-shimmer">Gupta Games</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl md:text-4xl font-light tracking-widest"
            style={{ color: 'var(--text-secondary)', fontFamily: 'Syne, sans-serif', letterSpacing: '0.3em' }}
          >
            Play. Win. Reign.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base md:text-lg max-w-xl"
            style={{ color: 'var(--text-muted)' }}
          >
            Enter the Mughal Cyber Palace. 10,000 Gupta Coins await you on signup. No real money — pure entertainment and royal thrills.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex gap-4 flex-wrap justify-center"
          >
            <Link href="/auth/signup">
              <motion.button
                className="btn-gold px-8 py-4 rounded-xl text-lg font-bold glow-pulse"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Play Now — Free
              </motion.button>
            </Link>
            <motion.button
              className="btn-glass px-8 py-4 rounded-xl text-lg"
              onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Learn More
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex items-center gap-6 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>✓ No real money</span>
            <span>✓ 10,000 free coins</span>
            <span>✓ Instant play</span>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div style={{ color: 'var(--gold-dim)', fontSize: 24 }}>↓</div>
        </motion.div>
      </section>

      {/* Live wins ticker */}
      <LiveWinsTicker />

      {/* Features */}
      <section ref={featuresRef as React.RefObject<HTMLElement>} className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl mb-4 gold-text" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
              Why Gupta Games?
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>The most immersive fake casino experience on the internet</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURE_CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="glass-card glass-card-hover p-8 flex flex-col gap-4"
              >
                <div className="text-5xl">{card.icon}</div>
                <h3 className="text-xl font-bold" style={{ color: card.color, fontFamily: 'Syne, sans-serif' }}>
                  {card.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Jackpot Counter */}
      <section ref={jackpotRef as React.RefObject<HTMLElement>} className="py-24 px-6 text-center" style={{ background: 'linear-gradient(180deg, transparent, rgba(255,215,0,0.03), transparent)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={jackpotInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-sm tracking-widest mb-4 uppercase" style={{ color: 'var(--gold-dim)', fontFamily: 'Orbitron, sans-serif' }}>
            Total Jackpot Pool
          </div>
          <JackpotCounter />
          <div className="mt-4 text-2xl" style={{ color: 'var(--text-secondary)', fontFamily: 'Orbitron, sans-serif' }}>
            Gupta Coins
          </div>
          <p className="mt-6" style={{ color: 'var(--text-muted)' }}>
            Virtual jackpot pool grows with every spin. For entertainment purposes only.
          </p>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef as React.RefObject<HTMLElement>} className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center text-3xl md:text-5xl mb-16 gold-text font-display"
            style={{ fontFamily: 'Cinzel Decorative, serif' }}
          >
            Player Stories
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {FAKE_TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 40 }}
                animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="glass-card p-6 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{t.avatar}</div>
                  <div>
                    <div className="font-bold" style={{ color: 'var(--gold)' }}>{t.username}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.vipLabel} Member</div>
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic' }}>
                  &quot;{t.text}&quot;
                </p>
                <div style={{ color: 'var(--gold)' }}>★★★★★</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto rounded-2xl p-12 text-center glass-card"
          style={{ border: '1px solid rgba(255,215,0,0.3)', background: 'linear-gradient(135deg, rgba(123,47,190,0.1), rgba(255,215,0,0.05))' }}
        >
          <h2 className="font-display text-3xl md:text-5xl mb-4" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
            <span className="gold-shimmer">Claim Your Throne</span>
          </h2>
          <p className="mb-8 text-lg" style={{ color: 'var(--text-secondary)' }}>
            10,000 Gupta Coins instantly on signup. No credit card. No catch.
          </p>
          <Link href="/auth/signup">
            <motion.button
              className="btn-gold px-10 py-4 rounded-xl text-xl font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Playing Free
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6 text-center" style={{ borderColor: 'var(--border-gold)', background: 'rgba(0,0,0,0.3)' }}>
        <div className="font-display text-xl mb-4" style={{ color: 'var(--gold)', fontFamily: 'Cinzel Decorative, serif' }}>
          Gupta Games
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Play Responsibly | For Entertainment Only | No Real Money Gambling | Gupta Coins Have No Real-World Value
        </p>
        <div className="flex justify-center gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          <span>© 2026 Gupta Games</span>
          <span>18+ Entertainment</span>
          <span>Virtual Currency Only</span>
        </div>
      </footer>
    </div>
  );
}
