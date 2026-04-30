'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFakeWin, type FakeWin } from '@/data/fake-data';

export default function LiveWinsTicker() {
  const [wins, setWins] = useState<FakeWin[]>(() =>
    Array.from({ length: 5 }, () => generateFakeWin())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const newWin = generateFakeWin();
      setWins(prev => [newWin, ...prev.slice(0, 4)]);
    }, 3000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  const formatAmount = (n: number) => n.toLocaleString();

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid var(--border-gold)',
      }}
    >
      <div className="px-4 py-2 flex items-center gap-2 border-b" style={{ borderColor: 'var(--border-gold)', background: 'rgba(255,215,0,0.05)' }}>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--emerald)' }} />
        <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--gold)' }}>LIVE WINS</span>
      </div>

      <div className="flex flex-col gap-0.5 p-2 max-h-80 overflow-hidden">
        <AnimatePresence>
          {wins.map((win) => (
            <motion.div
              key={win.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 cursor-default"
            >
              <span className="text-xl shrink-0">{win.avatar}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-xs truncate" style={{ color: 'var(--text-primary)' }}>{win.username}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>won</span>
                  <span className="font-bold text-xs" style={{ color: 'var(--emerald)', fontFamily: 'Orbitron, sans-serif' }}>
                    🪙 {formatAmount(win.amount)}
                  </span>
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>on {win.game}</div>
              </div>
              {win.multiplier > 5 && (
                <div className="shrink-0 px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: 'rgba(255,107,26,0.2)', color: 'var(--saffron)' }}>
                  {win.multiplier.toFixed(1)}x
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
