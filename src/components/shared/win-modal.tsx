'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface WinModalProps {
  open: boolean;
  amount: number;
  multiplier?: number;
  onClose: () => void;
  onPlayAgain?: () => void;
}

function getWinTier(amount: number): { label: string; color: string; emoji: string } {
  if (amount >= 50000) return { label: 'LEGENDARY WIN!', color: 'var(--magenta)', emoji: '👑' };
  if (amount >= 10000) return { label: 'MEGA WIN!', color: 'var(--gold)', emoji: '🏆' };
  if (amount >= 2500) return { label: 'BIG WIN!', color: 'var(--emerald)', emoji: '💎' };
  if (amount >= 500) return { label: 'WINNER!', color: 'var(--teal)', emoji: '🎉' };
  return { label: 'WIN!', color: 'var(--saffron)', emoji: '✨' };
}

export default function WinModal({ open, amount, multiplier, onClose, onPlayAgain }: WinModalProps) {
  const fired = useRef(false);
  const tier = getWinTier(amount);

  useEffect(() => {
    if (open && !fired.current) {
      fired.current = true;
      const colors =
        amount >= 10000
          ? ['#FFD700', '#FFF176', '#FF6B1A', '#E91E8C']
          : ['#00C875', '#00E5FF', '#FFD700'];
      const count = amount >= 10000 ? 5 : 2;
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { x: 0.5, y: 0.4 },
            colors,
            zIndex: 9999,
          });
        }, i * 300);
      }
    }
    if (!open) fired.current = false;
  }, [open, amount]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.3, rotate: -15, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="glass-card text-center p-10 mx-4 max-w-md w-full relative overflow-hidden"
            style={{ border: `2px solid ${tier.color}`, boxShadow: `0 0 60px ${tier.color}40` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated rings */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-xl border-2"
              style={{ borderColor: tier.color }}
            />

            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-6xl mb-4"
            >
              {tier.emoji}
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold mb-2"
              style={{ color: tier.color, fontFamily: 'Cinzel Decorative, serif' }}
            >
              {tier.label}
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="font-number text-5xl font-black mb-2"
              style={{ color: 'var(--gold)', fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 30px rgba(255,215,0,0.8)' }}
            >
              +{amount.toLocaleString()}
            </motion.div>

            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              Gupta Coins
            </div>

            {multiplier && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-bold mb-6"
                style={{ color: 'var(--teal)', fontFamily: 'Orbitron, sans-serif' }}
              >
                {multiplier.toFixed(2)}x MULTIPLIER
              </motion.div>
            )}

            <div className="flex gap-3 justify-center mt-6">
              {onPlayAgain && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onPlayAgain}
                  className="btn-gold px-6 py-3 rounded-lg font-bold text-sm"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  Play Again
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="btn-glass px-6 py-3 rounded-lg font-bold text-sm"
              >
                Collect
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
