'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import { MobileBottomNav } from '@/components/layout/sidebar';
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
  let mult = 1.0;
  const total = 25;
  for (let i = 0; i < revealed; i++) {
    const remaining = total - i;
    const safeRemaining = remaining - mines;
    mult *= remaining / safeRemaining;
  }
  return Math.round(mult * 97) / 100;
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
    setTiles((prev) => prev.map((t) => t.isMine ? { ...t, state: 'mine' } : t));
  }, [active, gameOver, cashedOut, currentWin, multiplier, updateBalance, updateProfile, userProfile, bet]);

  if (!user) return null;

  return (
    <div className="page-layout">
      <Navbar />
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
            Diamond Mines
          </h1>
        </div>

        {/* Layout: grid left, controls right on desktop; stacked on mobile */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Mine Grid */}
          <div style={{ flex: '1 1 320px' }}>
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}
            >
              {tiles.length === 0 ? (
                Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      aspectRatio: '1', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                      fontSize: 22,
                    }}
                  >
                    <span style={{ opacity: 0.15 }}>❔</span>
                  </div>
                ))
              ) : (
                tiles.map((tile) => (
                  <motion.button
                    key={tile.id}
                    whileHover={tile.state === 'hidden' && active ? { scale: 1.08, y: -2 } : {}}
                    whileTap={tile.state === 'hidden' && active ? { scale: 0.92 } : {}}
                    onClick={() => revealTile(tile.id)}
                    style={{
                      aspectRatio: '1', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                      position: 'relative', overflow: 'hidden', border: 'none',
                      background:
                        tile.state === 'safe' ? 'linear-gradient(135deg, rgba(0,80,40,0.8), rgba(0,200,117,0.3))'
                        : tile.state === 'mine' ? 'linear-gradient(135deg, rgba(80,0,20,0.8), rgba(233,30,140,0.3))'
                        : 'rgba(255,255,255,0.06)',
                      borderColor:
                        tile.state === 'safe' ? 'rgba(0,200,117,0.5)'
                        : tile.state === 'mine' ? 'rgba(233,30,140,0.5)'
                        : 'rgba(255,255,255,0.08)',
                      outline: `1px solid ${tile.state === 'safe' ? 'rgba(0,200,117,0.5)' : tile.state === 'mine' ? 'rgba(233,30,140,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      cursor: tile.state === 'hidden' && active ? 'pointer' : 'default',
                      boxShadow: tile.state === 'safe' ? '0 0 12px rgba(0,200,117,0.3)' : tile.state === 'mine' ? '0 0 12px rgba(233,30,140,0.3)' : 'none',
                    }}
                  >
                    <AnimatePresence>
                      {tile.state === 'safe' && (
                        <motion.div key="safe" initial={{ rotateY: 90, scale: 0 }} animate={{ rotateY: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                          💎
                        </motion.div>
                      )}
                      {tile.state === 'mine' && (
                        <motion.div key="mine" initial={{ scale: 0 }} animate={{ scale: [0, 1.5, 1] }} transition={{ duration: 0.4 }}>
                          💥
                        </motion.div>
                      )}
                      {tile.state === 'hidden' && (
                        <motion.div key="hidden">
                          <span style={{ opacity: active ? 0.15 : 0.08 }}>❔</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))
              )}
            </div>

            {/* Status Banner */}
            {(gameOver || cashedOut) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 16, padding: '14px 20px', borderRadius: 14, textAlign: 'center', fontWeight: 700, fontSize: 16,
                  background: cashedOut ? 'rgba(0,200,117,0.1)' : 'rgba(233,30,140,0.1)',
                  border: `1px solid ${cashedOut ? '#00C875' : '#E91E8C'}`,
                  color: cashedOut ? '#00C875' : '#E91E8C',
                  fontFamily: 'Cinzel Decorative, serif',
                }}
              >
                {cashedOut
                  ? `✅ Cashed out ${currentWin.toLocaleString()} coins at ${multiplier.toFixed(2)}x!`
                  : `💥 Boom! Mine hit. Lost ${bet.toLocaleString()} coins.`}
              </motion.div>
            )}
          </div>

          {/* Right Controls Sidebar */}
          <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Bet Amount */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 16, padding: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 8, letterSpacing: 1 }}>BET AMOUNT</label>
              <input
                type="number"
                value={bet}
                onChange={(e) => !active && setBet(Math.max(100, Number(e.target.value)))}
                disabled={active}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontFamily: 'Orbitron, sans-serif', fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[500, 1000, 2500, 5000].map((v) => (
                  <motion.button
                    key={v}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => !active && setBet(v)}
                    disabled={active}
                    style={{
                      padding: '6px 0', borderRadius: 8, fontSize: 11, cursor: active ? 'not-allowed' : 'pointer',
                      background: bet === v ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                      color: bet === v ? '#FFD700' : 'rgba(255,255,255,0.5)',
                      border: `1px solid ${bet === v ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      fontFamily: 'Orbitron, sans-serif',
                    }}
                  >
                    {v >= 1000 ? `${v/1000}k` : v}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Mine Count */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 16, padding: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 10, letterSpacing: 1 }}>MINES</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => !active && setMineCount((m) => Math.max(1, m - 1))}
                  disabled={active}
                  style={{ width: 36, height: 36, borderRadius: 10, fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,215,0,0.1)', color: '#FFD700', border: 'none', cursor: active ? 'not-allowed' : 'pointer' }}
                >−</motion.button>
                <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 20, fontWeight: 700, flex: 1, textAlign: 'center', color: '#E91E8C' }}>
                  {mineCount} 💥
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => !active && setMineCount((m) => Math.min(24, m + 1))}
                  disabled={active}
                  style={{ width: 36, height: 36, borderRadius: 10, fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,215,0,0.1)', color: '#FFD700', border: 'none', cursor: active ? 'not-allowed' : 'pointer' }}
                >+</motion.button>
              </div>
              <div style={{ fontSize: 11, marginTop: 6, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                {25 - mineCount} safe tiles
              </div>
            </div>

            {/* Multiplier / Win */}
            {(active || cashedOut || gameOver) && (
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 16, padding: 18, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6, letterSpacing: 1 }}>MULTIPLIER</div>
                <motion.div
                  key={multiplier}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.3 }}
                  style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 28, fontWeight: 900, color: '#00E5FF', marginBottom: 8 }}
                >
                  {multiplier.toFixed(2)}x
                </motion.div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4, letterSpacing: 1 }}>PROFIT</div>
                <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 16, fontWeight: 700, color: currentWin > 0 ? '#00C875' : 'rgba(255,255,255,0.3)' }}>
                  {currentWin > 0 ? `+${(currentWin - bet).toLocaleString()}` : '—'}
                </div>
              </div>
            )}

            {/* Start / Cashout Button */}
            {!active ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                style={{
                  width: '100%', padding: '16px 0', borderRadius: 14, fontFamily: 'Cinzel Decorative, serif', fontWeight: 900, fontSize: 17,
                  background: 'linear-gradient(135deg, #FFD700, #FF9500)', color: '#1a1000', border: 'none', cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(255,215,0,0.3)',
                }}
              >
                {gameOver || cashedOut ? 'Play Again' : 'Start Game'}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: currentWin > 0 ? 1.05 : 1 }}
                whileTap={{ scale: currentWin > 0 ? 0.95 : 1 }}
                onClick={() => cashOut()}
                disabled={currentWin === 0}
                style={{
                  width: '100%', padding: '16px 0', borderRadius: 14, fontFamily: 'Cinzel Decorative, serif', fontWeight: 900, fontSize: 16, border: 'none',
                  background: currentWin > 0 ? 'linear-gradient(135deg, #00a050, #00C875)' : 'rgba(255,255,255,0.05)',
                  color: '#fff', cursor: currentWin === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: currentWin > 0 ? '0 0 20px rgba(0,200,117,0.4)' : 'none',
                  opacity: currentWin === 0 ? 0.5 : 1,
                }}
              >
                Cash Out
                <div style={{ fontSize: 12, fontFamily: 'Orbitron, sans-serif', fontWeight: 400, marginTop: 2 }}>
                  {currentWin > 0 ? `${currentWin.toLocaleString()} coins` : 'Reveal tiles first'}
                </div>
              </motion.button>
            )}

            {/* Balance */}
            <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              Balance: <span style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, color: '#FFD700' }}>
                🪙 {(userProfile?.balance ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav />

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
