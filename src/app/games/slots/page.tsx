'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import { MobileBottomNav } from '@/components/layout/sidebar';
import WinModal from '@/components/shared/win-modal';
import { toast } from 'sonner';
import { ArrowLeft, Zap, RotateCcw, Info } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

const SYMBOLS = ['🍋', '🍊', '🍇', '🔔', '💎', '👑', '🐘', '🦁', '🏆'];
const WEIGHTS = [22, 20, 18, 15, 12, 8, 4, 2, 1];
const SYMBOL_NAMES = ['Lemon', 'Orange', 'Grape', 'Bell', 'Diamond', 'Crown', 'Elephant', 'Lion', 'Trophy'];

const PAYOUTS: Record<string, number[]> = {
  '🍋': [0, 0, 1.5, 3, 6],
  '🍊': [0, 0, 2, 4, 8],
  '🍇': [0, 0, 2.5, 6, 12],
  '🔔': [0, 0, 3, 8, 20],
  '💎': [0, 0, 5, 15, 50],
  '👑': [0, 0, 10, 30, 100],
  '🐘': [0, 0, 15, 50, 200],
  '🦁': [0, 0, 25, 100, 500],
  '🏆': [0, 0, 50, 250, 1000],
};

const PAYLINES = [
  [1,1,1,1,1],
  [0,0,0,0,0],
  [2,2,2,2,2],
  [0,1,2,1,0],
  [2,1,0,1,2],
  [1,0,1,0,1],
  [1,2,1,2,1],
  [0,0,1,2,2],
  [2,2,1,0,0],
  [0,1,1,1,0],
  [2,1,1,1,2],
  [1,1,0,1,1],
  [1,1,2,1,1],
  [0,1,0,1,0],
  [2,1,2,1,2],
  [1,0,0,0,1],
  [1,2,2,2,1],
  [0,0,2,0,0],
  [2,2,0,2,2],
  [0,2,0,2,0],
];

const BET_OPTIONS = [100, 250, 500, 1000, 2500];

function weightedRandom(): string {
  const totalWeight = WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < SYMBOLS.length; i++) {
    r -= WEIGHTS[i];
    if (r <= 0) return SYMBOLS[i];
  }
  return SYMBOLS[0];
}

function generateGrid(): string[][] {
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 3 }, () => weightedRandom())
  );
}

function checkWins(grid: string[][]): { payline: number; symbol: string; count: number; multiplier: number }[] {
  const wins: { payline: number; symbol: string; count: number; multiplier: number }[] = [];
  for (let pl = 0; pl < PAYLINES.length; pl++) {
    const line = PAYLINES[pl];
    const firstSymbol = grid[0][line[0]];
    let count = 1;
    for (let reel = 1; reel < 5; reel++) {
      if (grid[reel][line[reel]] === firstSymbol) count++;
      else break;
    }
    if (count >= 3) {
      const multiplier = PAYOUTS[firstSymbol]?.[count] ?? 0;
      if (multiplier > 0) wins.push({ payline: pl, symbol: firstSymbol, count, multiplier });
    }
  }
  return wins;
}

function nearMissGrid(grid: string[][]): string[][] {
  const modified = grid.map((reel) => [...reel]);
  const s = modified[0][1];
  modified[1][1] = s;
  return modified;
}

interface ReelProps {
  symbols: string[];
  spinning: boolean;
  delay: number;
  turbo: boolean;
}

function Reel({ symbols, spinning, delay, turbo }: ReelProps) {
  const spinDuration = turbo ? 0.5 : 0.9;
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 12,
        width: 90,
        height: 270,
        background: 'rgba(0,0,0,0.6)',
        border: '2px solid rgba(255,215,0,0.25)',
        boxShadow: spinning ? '0 0 20px rgba(255,215,0,0.2)' : 'none',
        transition: 'box-shadow 0.3s',
        flexShrink: 0,
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 48, zIndex: 10, pointerEvents: 'none', background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 48, zIndex: 10, pointerEvents: 'none', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, zIndex: 10, pointerEvents: 'none', top: 90, height: 90, border: '2px solid rgba(255,215,0,0.4)', background: 'rgba(255,215,0,0.03)' }} />

      <motion.div
        animate={spinning ? {
          y: [0, -300, 0],
          filter: ['blur(0px)', 'blur(4px)', 'blur(0px)'],
        } : { y: 0, filter: 'blur(0px)' }}
        transition={spinning ? {
          duration: spinDuration,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
          repeat: Infinity,
          repeatType: 'loop',
        } : { duration: 0.2 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 }}
      >
        {[...symbols, ...symbols].map((sym, i) => (
          <div
            key={i}
            style={{ width: 90, height: 90, fontSize: 42, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {sym}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function SlotsPage() {
  const { userProfile, user, updateBalance, updateProfile } = useAuth();
  const router = useRouter();
  const [grid, setGrid] = useState<string[][]>(generateGrid());
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(100);
  const [winAmount, setWinAmount] = useState(0);
  const [winModal, setWinModal] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [autoSpinCount, setAutoSpinCount] = useState(0);
  const [autoSpinMax, setAutoSpinMax] = useState(10);
  const [turbo, setTurbo] = useState(false);
  const [freeSpins, setFreeSpins] = useState(0);
  const [freeSpinMode, setFreeSpinMode] = useState(false);
  const [winLines, setWinLines] = useState<number[]>([]);
  const [recentSpins, setRecentSpins] = useState<{ result: string; amount: number }[]>([]);
  const [jackpotFlash, setJackpotFlash] = useState(false);
  const [showPayouts, setShowPayouts] = useState(false);
  const spinLock = useRef(false);

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user, router]);

  const doSpin = useCallback(async () => {
    if (spinLock.current || spinning) return;
    const balance = userProfile?.balance ?? 0;
    const actualBet = freeSpinMode ? 0 : bet;
    if (!freeSpinMode && balance < bet) {
      toast.error('Not enough Gupta Coins!');
      setAutoSpin(false);
      return;
    }

    spinLock.current = true;
    setSpinning(true);
    setWinLines([]);

    if (!freeSpinMode) {
      await updateBalance(-bet);
    }

    const spinDuration = turbo ? 600 : 1200;
    await new Promise((r) => setTimeout(r, spinDuration));

    let newGrid = generateGrid();
    const roll = Math.random();
    const rawWins = checkWins(newGrid);
    if (rawWins.length === 0 && roll < 0.3) {
      newGrid = nearMissGrid(newGrid);
    }

    setGrid(newGrid);
    const wins = checkWins(newGrid);

    const trophyCount = newGrid.flat().filter((s) => s === '🏆').length;
    if (trophyCount >= 3 && !freeSpinMode) {
      setFreeSpins(10);
      setFreeSpinMode(true);
      toast.success('🏆 FREE SPINS TRIGGERED! 10 Free Spins x2 multiplier!', { duration: 4000 });
      confetti({ particleCount: 200, spread: 100, colors: ['#FFD700', '#FF6B1A', '#E91E8C'], origin: { y: 0.3 } });
    }

    let totalWin = 0;
    const hitLines: number[] = [];

    if (wins.length > 0) {
      for (const w of wins) {
        const mult = freeSpinMode ? w.multiplier * 2 : w.multiplier;
        totalWin += Math.floor(actualBet === 0 ? bet * mult : actualBet * mult);
        hitLines.push(w.payline);

        if (w.symbol === '🏆' && w.count === 5) {
          totalWin += bet * 1000;
          setJackpotFlash(true);
          setTimeout(() => setJackpotFlash(false), 3000);
        }
      }
      setWinLines(hitLines);
      await updateBalance(totalWin);
      setWinAmount(totalWin);
      if (totalWin > 500) {
        setWinModal(true);
      } else {
        toast.success(`Won ${totalWin.toLocaleString()} Gupta Coins!`);
      }
      await updateProfile({
        totalWagered: (userProfile?.totalWagered ?? 0) + bet,
        gamesPlayed: (userProfile?.gamesPlayed ?? 0) + 1,
        biggestWin: Math.max(userProfile?.biggestWin ?? 0, totalWin),
      });
    } else {
      await updateProfile({
        totalWagered: (userProfile?.totalWagered ?? 0) + bet,
        gamesPlayed: (userProfile?.gamesPlayed ?? 0) + 1,
      });
    }

    setRecentSpins((prev) => [
      { result: wins.length > 0 ? `+${totalWin.toLocaleString()}` : 'Lost', amount: totalWin },
      ...prev.slice(0, 9),
    ]);

    if (freeSpinMode) {
      const remaining = freeSpins - 1;
      setFreeSpins(remaining);
      if (remaining <= 0) {
        setFreeSpinMode(false);
        toast.info('Free Spins ended!');
      }
    }

    setSpinning(false);
    spinLock.current = false;

    if (autoSpin && autoSpinCount < autoSpinMax - 1) {
      setAutoSpinCount((c) => c + 1);
      setTimeout(() => doSpin(), turbo ? 200 : 500);
    } else if (autoSpin) {
      setAutoSpin(false);
      setAutoSpinCount(0);
    }
  }, [spinning, userProfile, bet, freeSpinMode, freeSpins, turbo, autoSpin, autoSpinCount, autoSpinMax, updateBalance, updateProfile]);

  const handleSpin = () => {
    if (autoSpin) {
      setAutoSpin(false);
      setAutoSpinCount(0);
    } else {
      doSpin();
    }
  };

  const handleAutoSpin = () => {
    setAutoSpin(true);
    setAutoSpinCount(0);
    doSpin();
  };

  const displaySymbols = grid.map((reel) => [reel[0], reel[1], reel[2]]);

  if (!user) return null;

  return (
    <div className="page-layout">
      <Navbar />

      <AnimatePresence>
        {jackpotFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1, 0, 1] }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', background: 'rgba(255,215,0,0.15)' }}
          >
            <div style={{ textAlign: 'center', fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', fontSize: 60 }}>
              🏆 JACKPOT! 🏆
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        {/* Back + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <Link href="/lobby">
            <motion.button
              whileHover={{ scale: 1.05 }}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 10px', color: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <ArrowLeft size={20} />
            </motion.button>
          </Link>
          <h1 style={{ fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', fontSize: 24, fontWeight: 700, margin: 0 }}>
            Maharaja Slots
          </h1>
          {freeSpinMode && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{ padding: '4px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: 'rgba(255,215,0,0.2)', color: '#FFD700', border: '1px solid #FFD700' }}
            >
              🎰 FREE SPINS: {freeSpins}
            </motion.div>
          )}
        </div>

        {/* Centered single-column layout */}
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Main Slot Machine Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: freeSpinMode
                ? 'linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,107,26,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(26,10,62,0.85) 0%, rgba(61,16,120,0.7) 100%)',
              border: freeSpinMode ? '2px solid #FFD700' : '1px solid rgba(255,215,0,0.3)',
              borderRadius: 20,
              padding: 28,
              textAlign: 'center',
            }}
          >
            {/* Info Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: 'rgba(0,200,117,0.15)', color: '#00C875' }}>
                RTP 96.5%
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>20 Paylines · 5×3</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTurbo(!turbo)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: turbo ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${turbo ? '#00E5FF' : 'rgba(255,255,255,0.1)'}`,
                  color: turbo ? '#00E5FF' : 'rgba(255,255,255,0.5)',
                }}
              >
                <Zap size={14} /> Turbo
              </motion.button>
            </div>

            {/* Reels */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
              {displaySymbols.map((reelSyms, i) => (
                <Reel
                  key={i}
                  symbols={reelSyms}
                  spinning={spinning}
                  delay={turbo ? i * 0.08 : i * 0.15}
                  turbo={turbo}
                />
              ))}
            </div>

            {/* Win Lines indicator */}
            <AnimatePresence>
              {winLines.length > 0 && !spinning && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ marginBottom: 16, fontSize: 14, fontWeight: 700, color: '#00C875' }}
                >
                  ✨ {winLines.length} winning payline{winLines.length > 1 ? 's' : ''}!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bet Selector Chips */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 10, letterSpacing: 1 }}>BET PER LINE</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                {BET_OPTIONS.map((b) => (
                  <motion.button
                    key={b}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => !spinning && setBet(b)}
                    disabled={spinning}
                    style={{
                      padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: spinning ? 'not-allowed' : 'pointer',
                      background: bet === b ? '#FFD700' : 'rgba(255,215,0,0.1)',
                      color: bet === b ? '#1a1000' : '#FFD700',
                      border: `1px solid ${bet === b ? '#FFD700' : 'rgba(255,215,0,0.25)'}`,
                      fontFamily: 'Orbitron, sans-serif',
                    }}
                  >
                    {b.toLocaleString()}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Total Bet */}
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
              Total Bet: <span style={{ color: '#FFD700', fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}>{(bet * 20).toLocaleString()}</span> coins (×20 lines)
            </div>

            {/* Control Row */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <select
                value={autoSpinMax}
                onChange={(e) => setAutoSpinMax(Number(e.target.value))}
                disabled={spinning}
                style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', fontFamily: 'Orbitron, sans-serif', fontSize: 11, cursor: 'pointer' }}
              >
                {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} Auto</option>)}
              </select>

              {!autoSpin ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAutoSpin}
                  disabled={spinning || (userProfile?.balance ?? 0) < bet}
                  style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <RotateCcw size={18} />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setAutoSpin(false); setAutoSpinCount(0); }}
                  style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(233,30,140,0.2)', border: '1px solid #E91E8C', color: '#E91E8C', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                >
                  Stop ({autoSpinMax - autoSpinCount})
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: spinning ? 1 : 1.05, boxShadow: spinning ? 'none' : '0 0 30px rgba(255,215,0,0.5)' }}
                whileTap={{ scale: spinning ? 1 : 0.95 }}
                onClick={handleSpin}
                disabled={!freeSpinMode && (userProfile?.balance ?? 0) < bet}
                style={{
                  padding: '12px 48px', borderRadius: 14, fontFamily: 'Cinzel Decorative, serif', fontWeight: 900, fontSize: 18,
                  background: 'linear-gradient(135deg, #FFD700, #FF9500)',
                  color: '#1a1000', border: 'none', cursor: 'pointer', minWidth: 160,
                  boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
                  opacity: (!freeSpinMode && (userProfile?.balance ?? 0) < bet) ? 0.5 : 1,
                }}
              >
                {spinning ? '⏳ Spinning...' : freeSpinMode ? `Free Spin! (${freeSpins})` : 'SPIN'}
              </motion.button>
            </div>
          </motion.div>

          {/* Recent Spins Row */}
          {recentSpins.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 1 }}>RECENT:</span>
              {recentSpins.map((spin, i) => (
                <motion.span
                  key={i}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  style={{
                    padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: 'Orbitron, sans-serif',
                    background: spin.amount > 0 ? 'rgba(0,200,117,0.15)' : 'rgba(233,30,140,0.1)',
                    color: spin.amount > 0 ? '#00C875' : '#E91E8C',
                    border: `1px solid ${spin.amount > 0 ? 'rgba(0,200,117,0.3)' : 'rgba(233,30,140,0.2)'}`,
                  }}
                >
                  {spin.result}
                </motion.span>
              ))}
            </div>
          )}

          {/* Payout Table Accordion */}
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 16 }}>
            <button
              onClick={() => setShowPayouts(!showPayouts)}
              style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', color: '#FFD700', fontFamily: 'Cinzel Decorative, serif', fontWeight: 700, fontSize: 14 }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Info size={16} /> Payout Table (3–5 of a kind)</span>
              <span style={{ fontSize: 18, transform: showPayouts ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
            </button>
            <AnimatePresence>
              {showPayouts && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {SYMBOLS.map((sym) => (
                      <div key={sym} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                        <span style={{ fontSize: 20 }}>{sym}</span>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                          {PAYOUTS[sym][2]}× / {PAYOUTS[sym][3]}× / {PAYOUTS[sym][4]}×
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <MobileBottomNav />

      <WinModal
        open={winModal}
        amount={winAmount}
        multiplier={winAmount / bet}
        onClose={() => setWinModal(false)}
        onPlayAgain={() => { setWinModal(false); doSpin(); }}
      />
    </div>
  );
}
