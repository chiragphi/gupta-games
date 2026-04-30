'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import WinModal from '@/components/shared/win-modal';
import { toast } from 'sonner';
import { ArrowLeft, Zap, RotateCcw, Info } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

const SYMBOLS = ['🍋', '🍊', '🍇', '🔔', '💎', '👑', '🐘', '🦁', '🏆'];
const WEIGHTS = [22, 20, 18, 15, 12, 8, 4, 2, 1]; // house edge baked in
const SYMBOL_NAMES = ['Lemon', 'Orange', 'Grape', 'Bell', 'Diamond', 'Crown', 'Elephant', 'Lion', 'Trophy'];

// Payout table: [minMatch, multiplier]
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

// 20 paylines as row indices per reel [r0, r1, r2, r3, r4]
const PAYLINES = [
  [1,1,1,1,1], // center
  [0,0,0,0,0], // top
  [2,2,2,2,2], // bottom
  [0,1,2,1,0], // V
  [2,1,0,1,2], // inverted V
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
  // Force 2 matching symbols on center payline
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
      className="relative overflow-hidden rounded-lg flex flex-col"
      style={{
        width: 72,
        height: 240,
        background: 'rgba(0,0,0,0.6)',
        border: '2px solid rgba(255,215,0,0.25)',
        boxShadow: spinning ? '0 0 20px rgba(255,215,0,0.2)' : 'none',
        transition: 'box-shadow 0.3s',
      }}
    >
      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)' }} />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }} />
      {/* Center highlight */}
      <div className="absolute left-0 right-0 z-10 pointer-events-none"
        style={{ top: 80, height: 80, border: '2px solid rgba(255,215,0,0.4)', background: 'rgba(255,215,0,0.03)' }} />

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
        className="flex flex-col items-center justify-start pt-1"
      >
        {[...symbols, ...symbols].map((sym, i) => (
          <div
            key={i}
            className="flex items-center justify-center"
            style={{ width: 72, height: 80, fontSize: 38, lineHeight: 1 }}
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
    // Near-miss 30% of the time on losses
    const rawWins = checkWins(newGrid);
    if (rawWins.length === 0 && roll < 0.3) {
      newGrid = nearMissGrid(newGrid);
    }

    setGrid(newGrid);
    const wins = checkWins(newGrid);

    // Check for free spins trigger (3+ 🏆 anywhere)
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

        // Jackpot on 5 trophies
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

  // Display symbols: middle row of each reel
  const displaySymbols = grid.map((reel) => [reel[0], reel[1], reel[2]]);

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--void)' }}>
      <Navbar />

      <AnimatePresence>
        {jackpotFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1, 0, 1] }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
            style={{ background: 'rgba(255,215,0,0.15)' }}
          >
            <div className="text-center">
              <div className="font-display text-6xl jackpot-glow" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>
                🏆 JACKPOT! 🏆
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Back + Title */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/lobby">
            <motion.button whileHover={{ scale: 1.05 }} className="btn-glass p-2 rounded-lg">
              <ArrowLeft size={20} />
            </motion.button>
          </Link>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>
            Maharaja Slots
          </h1>
          {freeSpinMode && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="px-3 py-1 rounded-full text-sm font-bold"
              style={{ background: 'rgba(255,215,0,0.2)', color: 'var(--gold)', border: '1px solid var(--gold)' }}
            >
              🎰 FREE SPINS: {freeSpins}
            </motion.div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Slot Machine */}
          <div className="flex-1">
            <motion.div
              className="glass-card p-6 text-center"
              style={{
                background: freeSpinMode
                  ? 'linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,107,26,0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(26,10,62,0.6) 0%, rgba(61,16,120,0.4) 100%)',
                border: freeSpinMode ? '2px solid var(--gold)' : '1px solid rgba(255,215,0,0.2)',
              }}
            >
              {/* RTP Badge */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(0,200,117,0.15)', color: 'var(--emerald)' }}>
                  RTP: 96.5%
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>20 Paylines</span>
                <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--teal)' }}>
                  5 Reels × 3 Rows
                </span>
              </div>

              {/* Reels */}
              <div className="flex justify-center gap-2 mb-6">
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
                    className="mb-4 text-sm font-bold"
                    style={{ color: 'var(--emerald)' }}
                  >
                    ✨ {winLines.length} winning payline{winLines.length > 1 ? 's' : ''}!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bet Selector */}
              <div className="mb-4">
                <div className="text-xs mb-2 font-bold" style={{ color: 'var(--text-muted)' }}>BET PER LINE</div>
                <div className="flex justify-center gap-2 flex-wrap">
                  {BET_OPTIONS.map((b) => (
                    <motion.button
                      key={b}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => !spinning && setBet(b)}
                      disabled={spinning}
                      className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
                      style={{
                        background: bet === b ? 'var(--gold)' : 'rgba(255,215,0,0.1)',
                        color: bet === b ? '#1a1000' : 'var(--gold)',
                        border: `1px solid ${bet === b ? 'var(--gold)' : 'rgba(255,215,0,0.2)'}`,
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: 11,
                      }}
                    >
                      {b.toLocaleString()}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Total bet display */}
              <div className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Total Bet: <span className="font-number font-bold" style={{ color: 'var(--gold)', fontFamily: 'Orbitron, sans-serif' }}>{(bet * 20).toLocaleString()}</span> coins (×20 lines)
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-3 flex-wrap">
                {/* Auto spin select */}
                <select
                  value={autoSpinMax}
                  onChange={(e) => setAutoSpinMax(Number(e.target.value))}
                  disabled={spinning}
                  className="input-dark px-3 py-2 rounded-lg text-sm"
                  style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 11 }}
                >
                  {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} Auto</option>)}
                </select>

                {/* Turbo */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTurbo(!turbo)}
                  className="px-4 py-2 rounded-lg text-sm font-bold"
                  style={{
                    background: turbo ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${turbo ? 'var(--teal)' : 'rgba(255,255,255,0.1)'}`,
                    color: turbo ? 'var(--teal)' : 'var(--text-muted)',
                  }}
                >
                  <Zap size={16} />
                </motion.button>

                {/* Auto Spin */}
                {!autoSpin ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAutoSpin}
                    disabled={spinning || (userProfile?.balance ?? 0) < bet}
                    className="btn-glass px-5 py-2 rounded-lg font-bold text-sm"
                  >
                    <RotateCcw size={16} />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setAutoSpin(false); setAutoSpinCount(0); }}
                    className="px-5 py-2 rounded-lg font-bold text-sm"
                    style={{ background: 'rgba(233,30,140,0.2)', border: '1px solid var(--magenta)', color: 'var(--magenta)' }}
                  >
                    Stop ({autoSpinMax - autoSpinCount} left)
                  </motion.button>
                )}

                {/* Main Spin */}
                <motion.button
                  whileHover={{ scale: spinning ? 1 : 1.05, boxShadow: spinning ? 'none' : '0 0 30px rgba(255,215,0,0.5)' }}
                  whileTap={{ scale: spinning ? 1 : 0.95 }}
                  onClick={handleSpin}
                  disabled={!freeSpinMode && (userProfile?.balance ?? 0) < bet}
                  className="btn-gold px-10 py-3 rounded-xl font-black text-lg relative overflow-hidden glow-pulse"
                  style={{ fontFamily: 'Cinzel Decorative, serif', minWidth: 140 }}
                >
                  {spinning ? (
                    <span className="flex items-center gap-2">
                      <div className="spinner w-5 h-5" />
                      Spinning...
                    </span>
                  ) : freeSpinMode ? (
                    `Free Spin! (${freeSpins})`
                  ) : (
                    'SPIN'
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Payout Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-4 mt-4"
            >
              <div className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--gold)', fontFamily: 'Cinzel Decorative, serif' }}>
                <Info size={16} /> Payout Table (3-5 of a kind)
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SYMBOLS.map((sym, i) => (
                  <div key={sym} className="flex items-center gap-2 text-xs p-2 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-lg">{sym}</span>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      <div>{PAYOUTS[sym][2]}× / {PAYOUTS[sym][3]}× / {PAYOUTS[sym][4]}×</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Side Panel */}
          <div className="lg:w-52 space-y-4">
            {/* Balance */}
            <div className="glass-card p-4 text-center">
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>BALANCE</div>
              <div className="font-number text-xl font-black" style={{ color: 'var(--gold)', fontFamily: 'Orbitron, sans-serif' }}>
                🪙 {(userProfile?.balance ?? 0).toLocaleString()}
              </div>
            </div>

            {/* Recent Spins */}
            <div className="glass-card p-4">
              <div className="text-xs font-bold mb-3" style={{ color: 'var(--gold)', fontFamily: 'Cinzel Decorative, serif' }}>Recent Spins</div>
              <div className="space-y-1">
                {recentSpins.length === 0 ? (
                  <div className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No spins yet</div>
                ) : (
                  recentSpins.map((spin, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex justify-between text-xs px-2 py-1 rounded"
                      style={{
                        background: spin.amount > 0 ? 'rgba(0,200,117,0.1)' : 'rgba(233,30,140,0.06)',
                        color: spin.amount > 0 ? 'var(--emerald)' : 'var(--magenta)',
                      }}
                    >
                      <span>Spin {recentSpins.length - i}</span>
                      <span className="font-bold font-number" style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 10 }}>
                        {spin.result}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Loss aversion nudge */}
            {(userProfile?.balance ?? 0) < bet * 10 && (userProfile?.balance ?? 0) > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-4 text-center"
                style={{ border: '1px solid var(--saffron)' }}
              >
                <div className="text-2xl mb-2">💸</div>
                <div className="text-xs font-bold mb-2" style={{ color: 'var(--saffron)' }}>Low on coins!</div>
                <div className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>You&apos;re so close to a big win!</div>
                <Link href="/wallet">
                  <motion.button whileHover={{ scale: 1.05 }} className="btn-gold w-full py-2 rounded-lg text-xs font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                    Get More Coins
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </main>

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
