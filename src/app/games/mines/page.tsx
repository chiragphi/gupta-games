'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import WinModal from '@/components/shared/win-modal';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

type TileState = 'hidden' | 'safe' | 'mine';

interface Tile {
  id: number;
  state: TileState;
  isMine: boolean;
}

function calcMultiplier(revealed: number, mines: number): number {
  // Fair multiplier calc based on probability
  let mult = 1.0;
  const total = 25;
  for (let i = 0; i < revealed; i++) {
    const remaining = total - i;
    const safeRemaining = remaining - mines;
    mult *= remaining / safeRemaining;
  }
  return Math.round(mult * 97) / 100; // 97% RTP
}

function generateMines(count: number): boolean[] {
  const mines = new Array(25).fill(false);
  let placed = 0;
  while (placed < count) {
    const idx = Math.floor(Math.random() * 25);
    if (!mines[idx]) { mines[idx] = true; placed++; }
  }
  return mines;
}

export default function MinesPage() {
  const { user, userProfile, updateBalance, updateProfile } = useAuth();
  const router = useRouter();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [mineCount, setMineCount] = useState(5);
  const [bet, setBet] = useState(500);
  const [active, setActive] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [currentWin, setCurrentWin] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [winModal, setWinModal] = useState(false);
  const [winAmount, setWinAmount] = useState(0);

  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);

  const resetTiles = useCallback((mines: boolean[]) => {
    setTiles(mines.map((isMine, i) => ({ id: i, state: 'hidden', isMine })));
  }, []);

  const startGame = useCallback(async () => {
    if ((userProfile?.balance ?? 0) < bet) { toast.error('Not enough coins!'); return; }
    await updateBalance(-bet);
    const mines = generateMines(mineCount);
    resetTiles(mines);
    setActive(true);
    setRevealed(0);
    setMultiplier(1.0);
    setCurrentWin(0);
    setGameOver(false);
    setCashedOut(false);
  }, [userProfile, bet, mineCount, updateBalance, resetTiles]);

  const revealTile = useCallback(async (id: number) => {
    if (!active || gameOver || cashedOut) return;
    const tile = tiles[id];
    if (tile.state !== 'hidden') return;

    if (tile.isMine) {
      // Reveal all mines
      setTiles((prev) => prev.map((t) => t.isMine ? { ...t, state: 'mine' } : t));
      setGameOver(true);
      setActive(false);
      toast.error(`💥 You hit a mine! Lost ${bet.toLocaleString()} coins.`);
      await updateProfile({
        gamesPlayed: (userProfile?.gamesPlayed ?? 0) + 1,
        totalWagered: (userProfile?.totalWagered ?? 0) + bet,
      });
    } else {
      const newRevealed = revealed + 1;
      const newMult = calcMultiplier(newRevealed, mineCount);
      const newWin = Math.floor(bet * newMult);
      setTiles((prev) => prev.map((t) => t.id === id ? { ...t, state: 'safe' } : t));
      setRevealed(newRevealed);
      setMultiplier(newMult);
      setCurrentWin(newWin);

      // Auto win if all safe tiles revealed
      const totalSafe = 25 - mineCount;
      if (newRevealed >= totalSafe) {
        await cashOut(newWin, newMult);
      }
    }
  }, [active, gameOver, cashedOut, tiles, revealed, mineCount, bet, updateProfile, userProfile]);

  const cashOut = useCallback(async (amount?: number, mult?: number) => {
    const finalAmount = amount ?? currentWin;
    const finalMult = mult ?? multiplier;
    if (!active || gameOver || cashedOut || finalAmount === 0) return;
    setCashedOut(true);
    setActive(false);
    await updateBalance(finalAmount);
    await updateProfile({
      gamesPlayed: (userProfile?.gamesPlayed ?? 0) + 1,
      totalWagered: (userProfile?.totalWagered ?? 0) + bet,
      biggestWin: Math.max(userProfile?.biggestWin ?? 0, finalAmount),
    });
    setWinAmount(finalAmount);
    if (finalAmount > 1000) {
      setWinModal(true);
    } else {
      toast.success(`Cashed out ${finalAmount.toLocaleString()} coins at ${finalMult.toFixed(2)}x!`);
    }
    // Reveal all mines
    setTiles((prev) => prev.map((t) => t.isMine ? { ...t, state: 'mine' } : t));
  }, [active, gameOver, cashedOut, currentWin, multiplier, updateBalance, updateProfile, userProfile, bet]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--void)' }}>
      <Navbar />
      <main className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/lobby"><motion.button whileHover={{ scale: 1.05 }} className="btn-glass p-2 rounded-lg"><ArrowLeft size={20} /></motion.button></Link>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>Diamond Mines</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Controls */}
          <div className="sm:w-48 space-y-4">
            {/* Bet */}
            <div className="glass-card p-4">
              <label className="text-xs font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>BET AMOUNT</label>
              <input
                type="number"
                value={bet}
                onChange={(e) => !active && setBet(Math.max(100, Number(e.target.value)))}
                disabled={active}
                className="input-dark w-full px-3 py-2 rounded-lg text-sm font-number mb-2"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              />
              <div className="grid grid-cols-2 gap-1">
                {[500, 1000, 2500, 5000].map((v) => (
                  <motion.button key={v} whileHover={{ scale: 1.05 }} onClick={() => !active && setBet(v)}
                    disabled={active}
                    className="py-1 rounded text-xs"
                    style={{ background: bet === v ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)', color: bet === v ? 'var(--gold)' : 'var(--text-muted)', fontFamily: 'Orbitron, sans-serif', fontSize: 10 }}>
                    {v >= 1000 ? `${v/1000}k` : v}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Mines Count */}
            <div className="glass-card p-4">
              <label className="text-xs font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>MINES</label>
              <div className="flex items-center gap-3">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => !active && setMineCount((m) => Math.max(1, m - 1))}
                  disabled={active}
                  className="w-8 h-8 rounded-lg font-bold flex items-center justify-center"
                  style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--gold)' }}>−</motion.button>
                <span className="font-number text-xl font-bold flex-1 text-center" style={{ color: 'var(--magenta)', fontFamily: 'Orbitron, sans-serif' }}>
                  {mineCount}💥
                </span>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => !active && setMineCount((m) => Math.min(24, m + 1))}
                  disabled={active}
                  className="w-8 h-8 rounded-lg font-bold flex items-center justify-center"
                  style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--gold)' }}>+</motion.button>
              </div>
              <div className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
                {25 - mineCount} safe tiles
              </div>
            </div>

            {/* Multiplier / Win */}
            {active || cashedOut || gameOver ? (
              <div className="glass-card p-4 text-center">
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>MULTIPLIER</div>
                <motion.div
                  key={multiplier}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.3 }}
                  className="font-number text-2xl font-black mb-2"
                  style={{ color: 'var(--teal)', fontFamily: 'Orbitron, sans-serif' }}>
                  {multiplier.toFixed(2)}x
                </motion.div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>PROFIT</div>
                <div className="font-number text-lg font-bold" style={{ color: currentWin > 0 ? 'var(--emerald)' : 'var(--text-muted)', fontFamily: 'Orbitron, sans-serif' }}>
                  {currentWin > 0 ? `+${(currentWin - bet).toLocaleString()}` : '—'}
                </div>
              </div>
            ) : null}

            {/* Action button */}
            {!active ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="btn-gold w-full py-3 rounded-xl font-black text-lg glow-pulse"
                style={{ fontFamily: 'Cinzel Decorative, serif' }}>
                {gameOver ? 'Play Again' : cashedOut ? 'Play Again' : 'Start Game'}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: currentWin > 0 ? 1.05 : 1 }}
                whileTap={{ scale: currentWin > 0 ? 0.95 : 1 }}
                onClick={() => cashOut()}
                disabled={currentWin === 0}
                className="w-full py-3 rounded-xl font-black text-lg"
                style={{
                  background: currentWin > 0 ? 'linear-gradient(135deg, #00a050, #00C875)' : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  fontFamily: 'Cinzel Decorative, serif',
                  boxShadow: currentWin > 0 ? '0 0 20px rgba(0,200,117,0.4)' : 'none',
                  opacity: currentWin === 0 ? 0.5 : 1,
                }}>
                Cash Out<br />
                <span className="text-sm font-normal font-number" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {currentWin > 0 ? `${currentWin.toLocaleString()} coins` : 'Reveal tiles first'}
                </span>
              </motion.button>
            )}

            {/* Balance */}
            <div className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              Balance: <span className="font-number font-bold" style={{ color: 'var(--gold)', fontFamily: 'Orbitron, sans-serif' }}>
                🪙 {(userProfile?.balance ?? 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1">
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
            >
              {tiles.length === 0 ? (
                // Placeholder grid
                Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-2xl opacity-20">❔</span>
                  </div>
                ))
              ) : (
                tiles.map((tile) => (
                  <motion.button
                    key={tile.id}
                    whileHover={tile.state === 'hidden' && active ? { scale: 1.08, y: -2 } : {}}
                    whileTap={tile.state === 'hidden' && active ? { scale: 0.92 } : {}}
                    onClick={() => revealTile(tile.id)}
                    className="aspect-square rounded-xl flex items-center justify-center text-2xl relative overflow-hidden"
                    style={{
                      background:
                        tile.state === 'safe' ? 'linear-gradient(135deg, rgba(0,80,40,0.8), rgba(0,200,117,0.3))'
                        : tile.state === 'mine' ? 'linear-gradient(135deg, rgba(80,0,20,0.8), rgba(233,30,140,0.3))'
                        : 'rgba(255,255,255,0.06)',
                      border:
                        tile.state === 'safe' ? '1px solid rgba(0,200,117,0.5)'
                        : tile.state === 'mine' ? '1px solid rgba(233,30,140,0.5)'
                        : '1px solid rgba(255,255,255,0.08)',
                      cursor: tile.state === 'hidden' && active ? 'pointer' : 'default',
                      boxShadow: tile.state === 'safe' ? '0 0 12px rgba(0,200,117,0.3)' : tile.state === 'mine' ? '0 0 12px rgba(233,30,140,0.3)' : 'none',
                    }}
                  >
                    <AnimatePresence>
                      {tile.state === 'safe' && (
                        <motion.div
                          key="safe"
                          initial={{ rotateY: 90, scale: 0 }}
                          animate={{ rotateY: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          💎
                        </motion.div>
                      )}
                      {tile.state === 'mine' && (
                        <motion.div
                          key="mine"
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.5, 1] }}
                          transition={{ duration: 0.4 }}
                        >
                          💥
                        </motion.div>
                      )}
                      {tile.state === 'hidden' && (
                        <motion.div key="hidden">
                          {active ? (
                            <span style={{ opacity: 0.15 }}>❔</span>
                          ) : (
                            <span style={{ opacity: 0.08 }}>❔</span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))
              )}
            </div>

            {/* Status */}
            {(gameOver || cashedOut) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl text-center font-bold text-lg"
                style={{
                  background: cashedOut ? 'rgba(0,200,117,0.1)' : 'rgba(233,30,140,0.1)',
                  border: `1px solid ${cashedOut ? 'var(--emerald)' : 'var(--magenta)'}`,
                  color: cashedOut ? 'var(--emerald)' : 'var(--magenta)',
                  fontFamily: 'Cinzel Decorative, serif',
                }}
              >
                {cashedOut
                  ? `✅ Cashed out ${currentWin.toLocaleString()} coins at ${multiplier.toFixed(2)}x!`
                  : `💥 Boom! Mine hit. Lost ${bet.toLocaleString()} coins.`}
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <WinModal
        open={winModal}
        amount={winAmount}
        multiplier={multiplier}
        onClose={() => setWinModal(false)}
        onPlayAgain={() => { setWinModal(false); startGame(); }}
      />
    </div>
  );
}
