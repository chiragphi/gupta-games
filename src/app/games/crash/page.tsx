'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

type RoundState = 'waiting' | 'flying' | 'crashed';

interface HistoryItem {
  value: number;
  color: string;
}

interface Player {
  username: string;
  avatar: string;
  bet: number;
  cashedOut?: number;
  status: 'playing' | 'cashed' | 'lost';
}

const FAKE_PLAYERS_BASE = [
  { username: 'RajKumar99', avatar: '🦁' },
  { username: 'MughalMaster', avatar: '🐘' },
  { username: 'DelhiDynasty', avatar: '🦅' },
  { username: 'BombayBaller', avatar: '🐉' },
  { username: 'JaipurJack', avatar: '🦊' },
  { username: 'SpiceKing', avatar: '🔥' },
  { username: 'AshokaAce', avatar: '⭐' },
];

function generateCrashPoint(): number {
  // House edge: crashes tend lower
  const r = Math.random();
  if (r < 0.4) return +(1 + Math.random() * 0.8).toFixed(2);
  if (r < 0.7) return +(1.8 + Math.random() * 2).toFixed(2);
  if (r < 0.9) return +(3.8 + Math.random() * 6).toFixed(2);
  if (r < 0.97) return +(10 + Math.random() * 30).toFixed(2);
  return +(40 + Math.random() * 60).toFixed(2);
}

export default function CrashPage() {
  const { user, userProfile, updateBalance, updateProfile } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<RoundState>('waiting');
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [bet, setBet] = useState(500);
  const [autoCashout, setAutoCashout] = useState('');
  const [hasBet, setHasBet] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashedMultiplier, setCashedMultiplier] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([
    { value: 2.14, color: 'var(--emerald)' },
    { value: 1.02, color: 'var(--magenta)' },
    { value: 5.87, color: 'var(--emerald)' },
    { value: 1.45, color: 'var(--emerald)' },
    { value: 1.01, color: 'var(--magenta)' },
    { value: 23.4, color: 'var(--teal)' },
    { value: 1.78, color: 'var(--emerald)' },
    { value: 1.12, color: 'var(--magenta)' },
  ]);
  const [players, setPlayers] = useState<Player[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const crashRef = useRef(0);
  const hasBetRef = useRef(false);
  const cashedRef = useRef(false);
  const autoCashoutRef = useRef('');

  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);
  useEffect(() => { hasBetRef.current = hasBet; }, [hasBet]);
  useEffect(() => { cashedRef.current = cashedOut; }, [cashedOut]);
  useEffect(() => { autoCashoutRef.current = autoCashout; }, [autoCashout]);

  const startRound = useCallback(() => {
    const cp = generateCrashPoint();
    crashRef.current = cp;
    setCrashPoint(cp);
    setMultiplier(1.0);
    setCashedOut(false);
    setCashedMultiplier(0);
    setState('flying');

    // Generate fake players
    const fakePlayers = FAKE_PLAYERS_BASE.slice(0, 5 + Math.floor(Math.random() * 3)).map((p) => ({
      ...p,
      bet: Math.floor(100 + Math.random() * 2000),
      status: 'playing' as const,
    }));
    setPlayers(fakePlayers);

    let current = 1.0;
    const tick = () => {
      const increase = current < 2 ? 0.02 : current < 5 ? 0.04 : 0.08;
      current = +(current + increase).toFixed(2);
      setMultiplier(current);

      // Auto cashout
      const ac = parseFloat(autoCashoutRef.current);
      if (!isNaN(ac) && current >= ac && !cashedRef.current && hasBetRef.current) {
        cashOut(current);
      }

      // Fake players cash out
      setPlayers((prev) => prev.map((p) => {
        if (p.status === 'playing' && Math.random() < 0.02 && current > 1.3) {
          return { ...p, status: 'cashed', cashedOut: current };
        }
        return p;
      }));

      if (current >= crashRef.current) {
        clearInterval(intervalRef.current!);
        setMultiplier(crashRef.current);
        setState('crashed');
        setPlayers((prev) => prev.map((p) => p.status === 'playing' ? { ...p, status: 'lost' } : p));
        setHistory((h) => [
          { value: crashRef.current, color: crashRef.current < 2 ? 'var(--magenta)' : crashRef.current < 10 ? 'var(--emerald)' : 'var(--teal)' },
          ...h.slice(0, 9),
        ]);
        if (hasBetRef.current && !cashedRef.current) {
          toast.error(`Crashed at ${crashRef.current}x! Better luck next time.`);
        }
        setTimeout(() => startCountdown(), 2500);
      }
    };
    intervalRef.current = setInterval(tick, 80);
  }, []);

  const startCountdown = useCallback(() => {
    setState('waiting');
    setHasBet(false);
    setCountdown(5);
    let c = 5;
    const t = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(t);
        startRound();
      }
    }, 1000);
  }, [startRound]);

  useEffect(() => {
    startCountdown();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function cashOut(at?: number) {
    const m = at ?? multiplier;
    if (!hasBetRef.current || cashedRef.current) return;
    cashedRef.current = true;
    setCashedOut(true);
    setCashedMultiplier(m);
    const winnings = Math.floor(bet * m);
    updateBalance(winnings);
    toast.success(`Cashed out at ${m}x! +${winnings.toLocaleString()} coins!`);
    confetti({ particleCount: 80, spread: 60, colors: ['#00C875', '#FFD700'], origin: { y: 0.6 } });
  }

  const placeBet = () => {
    if (state !== 'waiting') return;
    if ((userProfile?.balance ?? 0) < bet) { toast.error('Not enough coins!'); return; }
    updateBalance(-bet);
    setHasBet(true);
    toast.info(`Bet placed: ${bet.toLocaleString()} coins`);
  };

  const multColor = multiplier >= 10 ? 'var(--teal)' : multiplier >= 3 ? 'var(--emerald)' : multiplier >= 2 ? 'var(--gold)' : 'var(--text-primary)';

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--void)' }}>
      <Navbar />
      <main className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/lobby"><motion.button whileHover={{ scale: 1.05 }} className="btn-glass p-2 rounded-lg"><ArrowLeft size={20} /></motion.button></Link>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>Crash Rocket</h1>
        </div>

        {/* History */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {history.map((h, i) => (
            <span key={i} className="px-2 py-1 rounded text-xs font-bold flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)', color: h.color, fontFamily: 'Orbitron, sans-serif', border: `1px solid ${h.color}40` }}>
              {h.value}x
            </span>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Game Canvas */}
          <div className="flex-1">
            <motion.div
              className="glass-card relative overflow-hidden"
              style={{ height: 320, background: 'linear-gradient(135deg, #0a1a0a 0%, #0d2a1a 100%)', border: '1px solid rgba(0,200,117,0.3)' }}
            >
              {/* Grid lines */}
              {[1,2,3,4].map((i) => (
                <div key={i} className="absolute left-0 right-0" style={{ bottom: `${i * 20}%`, borderTop: '1px solid rgba(255,255,255,0.04)' }} />
              ))}
              {[1,2,3,4].map((i) => (
                <div key={i} className="absolute top-0 bottom-0" style={{ left: `${i * 20}%`, borderLeft: '1px solid rgba(255,255,255,0.04)' }} />
              ))}

              {state === 'crashed' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0"
                  style={{ background: 'rgba(233,30,140,0.1)' }}
                />
              )}

              {/* Rocket path (CSS curve) */}
              {state === 'flying' && (
                <motion.div
                  className="absolute"
                  style={{
                    bottom: `${Math.min((multiplier - 1) * 8, 70)}%`,
                    left: `${Math.min((multiplier - 1) * 12, 75)}%`,
                    fontSize: 36,
                    filter: 'drop-shadow(0 0 12px rgba(255,107,26,0.8))',
                  }}
                  animate={{ rotate: [-10, 5, -10] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  🚀
                </motion.div>
              )}

              {/* Multiplier Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <AnimatePresence mode="wait">
                    {state === 'waiting' ? (
                      <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="text-6xl mb-2">⏳</div>
                        <div className="font-number text-2xl" style={{ color: 'var(--gold)', fontFamily: 'Orbitron, sans-serif' }}>
                          Starting in {countdown}s
                        </div>
                      </motion.div>
                    ) : state === 'crashed' ? (
                      <motion.div key="crashed" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="text-5xl mb-2">💥</div>
                        <div className="font-number text-4xl font-black" style={{ color: 'var(--magenta)', fontFamily: 'Orbitron, sans-serif' }}>
                          CRASHED @ {crashPoint}x
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="flying" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {cashedOut ? (
                          <div>
                            <div className="font-number text-5xl font-black" style={{ color: 'var(--emerald)', fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 30px rgba(0,200,117,0.8)' }}>
                              CASHED OUT
                            </div>
                            <div className="font-number text-3xl mt-1" style={{ color: 'var(--gold)', fontFamily: 'Orbitron, sans-serif' }}>
                              @ {cashedMultiplier.toFixed(2)}x
                            </div>
                          </div>
                        ) : (
                          <motion.div
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="font-number text-7xl font-black"
                            style={{ color: multColor, fontFamily: 'Orbitron, sans-serif', textShadow: `0 0 40px ${multColor}80` }}
                          >
                            {multiplier.toFixed(2)}x
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Bet Controls */}
            <div className="glass-card p-4 mt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>BET AMOUNT</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={bet}
                      onChange={(e) => setBet(Math.max(100, Number(e.target.value)))}
                      disabled={state !== 'waiting' || hasBet}
                      className="input-dark flex-1 px-3 py-2 rounded-lg text-sm font-number"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                    />
                    {[500, 1000, 2500].map((v) => (
                      <motion.button key={v} whileHover={{ scale: 1.05 }} onClick={() => setBet(v)}
                        disabled={state !== 'waiting' || hasBet}
                        className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--gold)', fontFamily: 'Orbitron, sans-serif' }}>
                        {v >= 1000 ? `${v/1000}k` : v}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div className="w-40">
                  <label className="text-xs font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>AUTO CASHOUT</label>
                  <input
                    type="number"
                    placeholder="e.g. 2.00"
                    step="0.1"
                    value={autoCashout}
                    onChange={(e) => setAutoCashout(e.target.value)}
                    className="input-dark w-full px-3 py-2 rounded-lg text-sm font-number"
                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                {!hasBet ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={placeBet}
                    disabled={state !== 'waiting'}
                    className="btn-gold flex-1 py-3 rounded-xl font-black text-lg"
                    style={{ fontFamily: 'Cinzel Decorative, serif', opacity: state !== 'waiting' ? 0.5 : 1 }}
                  >
                    {state === 'waiting' ? `Bet ${bet.toLocaleString()} Coins` : 'Round in progress...'}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: state === 'flying' && !cashedOut ? 1.05 : 1 }}
                    whileTap={{ scale: state === 'flying' && !cashedOut ? 0.95 : 1 }}
                    onClick={() => cashOut()}
                    disabled={state !== 'flying' || cashedOut}
                    className="flex-1 py-3 rounded-xl font-black text-xl relative overflow-hidden"
                    style={{
                      background: cashedOut ? 'rgba(0,200,117,0.3)' : 'linear-gradient(135deg, #00a050, #00C875)',
                      color: '#fff',
                      opacity: state !== 'flying' || cashedOut ? 0.6 : 1,
                      fontFamily: 'Cinzel Decorative, serif',
                      boxShadow: state === 'flying' && !cashedOut ? '0 0 30px rgba(0,200,117,0.5)' : 'none',
                    }}
                  >
                    {cashedOut ? `Cashed @ ${cashedMultiplier.toFixed(2)}x ✓` : `CASH OUT @ ${multiplier.toFixed(2)}x`}
                  </motion.button>
                )}
              </div>
              {hasBet && state === 'flying' && !cashedOut && (
                <div className="text-center text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                  Current profit: <span className="font-bold" style={{ color: 'var(--emerald)' }}>+{Math.floor(bet * multiplier - bet).toLocaleString()}</span> coins
                </div>
              )}
            </div>
          </div>

          {/* Players Panel */}
          <div className="lg:w-52 glass-card p-4">
            <div className="text-sm font-bold mb-4" style={{ color: 'var(--gold)', fontFamily: 'Cinzel Decorative, serif' }}>
              Players ({players.length})
            </div>
            <div className="space-y-2">
              {players.map((p, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-lg">{p.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>{p.username}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{p.bet.toLocaleString()}</div>
                  </div>
                  <div className="font-number text-right" style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 10 }}>
                    {p.status === 'cashed' ? (
                      <span style={{ color: 'var(--emerald)' }}>{p.cashedOut?.toFixed(2)}x ✓</span>
                    ) : p.status === 'lost' ? (
                      <span style={{ color: 'var(--magenta)' }}>💥</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>playing</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Your Balance</div>
              <div className="font-number font-bold" style={{ color: 'var(--gold)', fontFamily: 'Orbitron, sans-serif' }}>
                🪙 {(userProfile?.balance ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
