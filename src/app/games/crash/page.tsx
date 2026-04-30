'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import { MobileBottomNav } from '@/components/layout/sidebar';
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
    { value: 2.14, color: '#00C875' },
    { value: 1.02, color: '#E91E8C' },
    { value: 5.87, color: '#00C875' },
    { value: 1.45, color: '#00C875' },
    { value: 1.01, color: '#E91E8C' },
    { value: 23.4, color: '#00E5FF' },
    { value: 1.78, color: '#00C875' },
    { value: 1.12, color: '#E91E8C' },
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

      const ac = parseFloat(autoCashoutRef.current);
      if (!isNaN(ac) && current >= ac && !cashedRef.current && hasBetRef.current) {
        cashOut(current);
      }

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
          { value: crashRef.current, color: crashRef.current < 2 ? '#E91E8C' : crashRef.current < 10 ? '#00C875' : '#00E5FF' },
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

  const multColor = multiplier >= 10 ? '#00E5FF' : multiplier >= 3 ? '#00C875' : multiplier >= 2 ? '#FFD700' : 'rgba(255,255,255,0.9)';

  if (!user) return null;

  return (
    <div className="page-layout">
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        {/* Back + Title + History */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <Link href="/lobby">
            <motion.button
              whileHover={{ scale: 1.05 }}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 10px', color: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <ArrowLeft size={20} />
            </motion.button>
          </Link>
          <h1 style={{ fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', fontSize: 24, fontWeight: 700, margin: 0 }}>
            Crash Rocket
          </h1>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, flex: 1 }}>
            {history.map((h, i) => (
              <span
                key={i}
                style={{ padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, flexShrink: 0, background: 'rgba(255,255,255,0.06)', color: h.color, fontFamily: 'Orbitron, sans-serif', border: `1px solid ${h.color}40` }}
              >
                {h.value}x
              </span>
            ))}
          </div>
        </div>

        {/* Main Game Canvas */}
        <motion.div
          style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, height: 380, background: 'linear-gradient(135deg, #050f05 0%, #0a1f0a 50%, #061406 100%)', border: '1px solid rgba(0,200,117,0.35)', marginBottom: 20 }}
        >
          {/* Grid lines */}
          {[1,2,3,4].map((i) => (
            <div key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: `${i * 20}%`, borderTop: '1px solid rgba(255,255,255,0.04)' }} />
          ))}
          {[1,2,3,4].map((i) => (
            <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${i * 20}%`, borderLeft: '1px solid rgba(255,255,255,0.04)' }} />
          ))}

          {state === 'crashed' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', inset: 0, background: 'rgba(233,30,140,0.08)' }} />
          )}

          {state === 'flying' && (
            <motion.div
              style={{
                position: 'absolute',
                bottom: `${Math.min((multiplier - 1) * 8, 70)}%`,
                left: `${Math.min((multiplier - 1) * 12, 75)}%`,
                fontSize: 40,
                filter: 'drop-shadow(0 0 14px rgba(255,107,26,0.9))',
              }}
              animate={{ rotate: [-10, 5, -10] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              🚀
            </motion.div>
          )}

          {/* Multiplier Display */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <AnimatePresence mode="wait">
                {state === 'waiting' ? (
                  <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div style={{ fontSize: 56, marginBottom: 8 }}>⏳</div>
                    <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22, color: '#FFD700' }}>
                      Starting in {countdown}s
                    </div>
                  </motion.div>
                ) : state === 'crashed' ? (
                  <motion.div key="crashed" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>💥</div>
                    <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 36, fontWeight: 900, color: '#E91E8C' }}>
                      CRASHED @ {crashPoint}x
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="flying" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {cashedOut ? (
                      <div>
                        <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 44, fontWeight: 900, color: '#00C875', textShadow: '0 0 30px rgba(0,200,117,0.8)' }}>
                          CASHED OUT
                        </div>
                        <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 28, marginTop: 4, color: '#FFD700' }}>
                          @ {cashedMultiplier.toFixed(2)}x
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 72, fontWeight: 900, color: multColor, textShadow: `0 0 40px ${multColor}80` }}
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

        {/* Bet Controls Card */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 8, letterSpacing: 1 }}>BET AMOUNT</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  value={bet}
                  onChange={(e) => setBet(Math.max(100, Number(e.target.value)))}
                  disabled={state !== 'waiting' || hasBet}
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontFamily: 'Orbitron, sans-serif', fontSize: 14 }}
                />
                {[500, 1000, 2500].map((v) => (
                  <motion.button
                    key={v}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setBet(v)}
                    disabled={state !== 'waiting' || hasBet}
                    style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,215,0,0.1)', color: '#FFD700', fontFamily: 'Orbitron, sans-serif', fontSize: 12, border: '1px solid rgba(255,215,0,0.25)', cursor: 'pointer' }}
                  >
                    {v >= 1000 ? `${v/1000}k` : v}
                  </motion.button>
                ))}
              </div>
            </div>
            <div style={{ width: 160 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 8, letterSpacing: 1 }}>AUTO CASHOUT</label>
              <input
                type="number"
                placeholder="e.g. 2.00"
                step="0.1"
                value={autoCashout}
                onChange={(e) => setAutoCashout(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontFamily: 'Orbitron, sans-serif', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {!hasBet ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={placeBet}
              disabled={state !== 'waiting'}
              style={{
                width: '100%', padding: '16px 0', borderRadius: 14, fontFamily: 'Cinzel Decorative, serif', fontWeight: 900, fontSize: 18,
                background: state !== 'waiting' ? 'rgba(255,215,0,0.3)' : 'linear-gradient(135deg, #FFD700, #FF9500)',
                color: '#1a1000', border: 'none', cursor: state !== 'waiting' ? 'not-allowed' : 'pointer',
                opacity: state !== 'waiting' ? 0.5 : 1,
              }}
            >
              {state === 'waiting' ? `Bet ${bet.toLocaleString()} Coins` : 'Round in progress...'}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: state === 'flying' && !cashedOut ? 1.05 : 1 }}
              whileTap={{ scale: state === 'flying' && !cashedOut ? 0.95 : 1 }}
              onClick={() => cashOut()}
              disabled={state !== 'flying' || cashedOut}
              style={{
                width: '100%', padding: '16px 0', borderRadius: 14, fontFamily: 'Cinzel Decorative, serif', fontWeight: 900, fontSize: 20, border: 'none',
                background: cashedOut ? 'rgba(0,200,117,0.3)' : 'linear-gradient(135deg, #00a050, #00C875)',
                color: '#fff', cursor: state !== 'flying' || cashedOut ? 'not-allowed' : 'pointer',
                opacity: state !== 'flying' || cashedOut ? 0.6 : 1,
                boxShadow: state === 'flying' && !cashedOut ? '0 0 30px rgba(0,200,117,0.5)' : 'none',
              }}
            >
              {cashedOut ? `Cashed @ ${cashedMultiplier.toFixed(2)}x ✓` : `CASH OUT @ ${multiplier.toFixed(2)}x`}
            </motion.button>
          )}

          {hasBet && state === 'flying' && !cashedOut && (
            <div style={{ textAlign: 'center', fontSize: 13, marginTop: 10, color: 'rgba(255,255,255,0.5)' }}>
              Current profit: <span style={{ fontWeight: 700, color: '#00C875' }}>+{Math.floor(bet * multiplier - bet).toLocaleString()}</span> coins
            </div>
          )}
        </div>

        {/* Players Panel — horizontal scroll row */}
        {players.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#FFD700', fontFamily: 'Cinzel Decorative, serif', marginBottom: 10 }}>
              Players ({players.length})
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
              {players.map((p, i) => (
                <div
                  key={i}
                  style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    minWidth: 140,
                  }}
                >
                  <span style={{ fontSize: 22 }}>{p.avatar}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{p.username}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{p.bet.toLocaleString()}</div>
                    <div style={{ fontSize: 11, fontFamily: 'Orbitron, sans-serif' }}>
                      {p.status === 'cashed' ? (
                        <span style={{ color: '#00C875' }}>{p.cashedOut?.toFixed(2)}x ✓</span>
                      ) : p.status === 'lost' ? (
                        <span style={{ color: '#E91E8C' }}>💥 lost</span>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>playing</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
