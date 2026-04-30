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

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
interface Card { suit: Suit; rank: Rank; hidden?: boolean }
type Phase = 'betting' | 'playing' | 'dealer' | 'result';
type Result = 'win' | 'lose' | 'push' | 'blackjack' | null;

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const RED_SUITS: Suit[] = ['♥', '♦'];

function createDeck(): Card[] {
  const d: Card[] = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ suit: s, rank: r });
  return d.sort(() => Math.random() - 0.5);
}

function cardValue(r: Rank): number {
  if (r === 'A') return 11;
  if (['J','Q','K'].includes(r)) return 10;
  return parseInt(r);
}

function handValue(hand: Card[]): number {
  let total = 0, aces = 0;
  for (const c of hand) {
    if (c.hidden) continue;
    total += cardValue(c.rank);
    if (c.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function CardComponent({ card, index }: { card: Card; index: number }) {
  const isRed = RED_SUITS.includes(card.suit);
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0, y: -30 }}
      animate={{ rotateY: 0, opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, type: 'spring', stiffness: 200 }}
      className="relative rounded-xl flex items-center justify-center font-bold select-none"
      style={{
        width: 72, height: 104,
        background: card.hidden ? 'linear-gradient(135deg, #1a0a3e, #3d1078)' : '#F8F6F0',
        border: card.hidden ? '2px solid rgba(255,215,0,0.3)' : '2px solid rgba(0,0,0,0.1)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        color: isRed ? '#DC143C' : '#1a1a1a',
        flexShrink: 0,
      }}
    >
      {card.hidden ? (
        <div className="text-3xl opacity-60">🃏</div>
      ) : (
        <div className="flex flex-col items-start justify-between p-2 h-full w-full">
          <div className="text-sm font-black leading-none">
            <div>{card.rank}</div>
            <div>{card.suit}</div>
          </div>
          <div className="text-2xl self-center leading-none">{card.suit}</div>
          <div className="text-sm font-black leading-none self-end" style={{ transform: 'rotate(180deg)' }}>
            <div>{card.rank}</div>
            <div>{card.suit}</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

const CHIP_CONFIGS = [
  { value: 100, bg: '#1a6b3e', border: '#2dcc70', label: '100' },
  { value: 500, bg: '#6b1a1a', border: '#e74c3c', label: '500' },
  { value: 1000, bg: '#1a3a6b', border: '#3498db', label: '1K' },
  { value: 2500, bg: '#6b5b1a', border: '#FFD700', label: '2.5K' },
  { value: 5000, bg: '#4a1a6b', border: '#9b59b6', label: '5K' },
];

export default function BlackjackPage() {
  const { user, userProfile, updateBalance, updateProfile } = useAuth();
  const router = useRouter();
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>('betting');
  const [bet, setBet] = useState(0);
  const [result, setResult] = useState<Result>(null);
  const [winModal, setWinModal] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [message, setMessage] = useState('Place your bet to begin!');
  const [dealerThinking, setDealerThinking] = useState(false);

  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);

  const initDeck = useCallback(() => {
    setDeck(createDeck());
  }, []);

  useEffect(() => { initDeck(); }, [initDeck]);

  const deal = useCallback(async () => {
    if (bet === 0) { toast.error('Place a bet first!'); return; }
    if ((userProfile?.balance ?? 0) < bet) { toast.error('Not enough coins!'); return; }

    await updateBalance(-bet);
    const d = createDeck();
    const p = [d[0], d[2]];
    const dealer = [d[1], { ...d[3], hidden: true }];
    setDeck(d.slice(4));
    setPlayerHand(p);
    setDealerHand(dealer);
    setPhase('playing');
    setResult(null);
    setMessage('');

    // Check for blackjack
    if (handValue(p) === 21) {
      setTimeout(() => settle(p, dealer, d.slice(4), 'blackjack'), 500);
    }
  }, [bet, userProfile, updateBalance]);

  const settle = useCallback(async (
    pHand: Card[], dHand: Card[], remainingDeck: Card[], forcedResult?: 'blackjack'
  ) => {
    setPhase('dealer');
    setDealerThinking(true);

    // Reveal dealer card
    const revealedDealer = dHand.map((c) => ({ ...c, hidden: false }));
    setDealerHand(revealedDealer);

    if (forcedResult !== 'blackjack') {
      // Dealer hits to 17
      let dValue = handValue(revealedDealer);
      let currentDealer = [...revealedDealer];
      let currentDeck = [...remainingDeck];

      while (dValue < 17) {
        await new Promise((r) => setTimeout(r, 600));
        const newCard = { ...currentDeck[0], hidden: false };
        currentDeck = currentDeck.slice(1);
        currentDealer = [...currentDealer, newCard];
        dValue = handValue(currentDealer);
        setDealerHand(currentDealer);
      }

      await new Promise((r) => setTimeout(r, 400));

      const pValue = handValue(pHand);
      let res: Result;
      if (pValue > 21) res = 'lose';
      else if (dValue > 21) res = 'win';
      else if (pValue > dValue) res = 'win';
      else if (pValue < dValue) res = 'lose';
      else res = 'push';

      setResult(res);
      setDealerThinking(false);
      setPhase('result');

      let payout = 0;
      if (res === 'win') { payout = bet * 2; setMessage(`You win! +${bet.toLocaleString()} coins!`); }
      else if (res === 'push') { payout = bet; setMessage("Push! Bet returned."); }
      else { setMessage(`Dealer wins. Lost ${bet.toLocaleString()} coins.`); }

      if (payout > 0) {
        await updateBalance(payout);
        if (res === 'win' && payout > 1000) {
          setWinAmount(bet);
          setWinModal(true);
        } else if (res === 'win') {
          toast.success(`Won ${bet.toLocaleString()} coins!`);
        }
      }
    } else {
      setDealerThinking(false);
      setPhase('result');
      setResult('blackjack');
      const payout = Math.floor(bet * 2.5);
      setMessage(`BLACKJACK! +${payout.toLocaleString()} coins!`);
      await updateBalance(payout);
      setWinAmount(payout);
      setWinModal(true);
    }

    await updateProfile({
      gamesPlayed: (userProfile?.gamesPlayed ?? 0) + 1,
      totalWagered: (userProfile?.totalWagered ?? 0) + bet,
    });
  }, [bet, updateBalance, updateProfile, userProfile]);

  const hit = useCallback(() => {
    if (phase !== 'playing') return;
    const newCard = deck[0];
    const newHand = [...playerHand, newCard];
    const newDeck = deck.slice(1);
    setDeck(newDeck);
    setPlayerHand(newHand);
    const val = handValue(newHand);
    if (val > 21) {
      setResult('lose');
      setMessage(`Bust! Lost ${bet.toLocaleString()} coins.`);
      setPhase('result');
      // Reveal dealer
      setDealerHand((d) => d.map((c) => ({ ...c, hidden: false })));
      updateProfile({ gamesPlayed: (userProfile?.gamesPlayed ?? 0) + 1, totalWagered: (userProfile?.totalWagered ?? 0) + bet });
    } else if (val === 21) {
      settle(newHand, dealerHand, newDeck);
    }
  }, [phase, deck, playerHand, dealerHand, bet, settle, updateProfile, userProfile]);

  const stand = useCallback(() => {
    if (phase !== 'playing') return;
    settle(playerHand, dealerHand, deck);
  }, [phase, playerHand, dealerHand, deck, settle]);

  const doubleDown = useCallback(async () => {
    if (phase !== 'playing' || playerHand.length !== 2) return;
    if ((userProfile?.balance ?? 0) < bet) { toast.error('Not enough coins!'); return; }
    await updateBalance(-bet);
    const newCard = deck[0];
    const newHand = [...playerHand, newCard];
    setDeck(deck.slice(1));
    setPlayerHand(newHand);
    setBet(bet * 2);
    settle(newHand, dealerHand, deck.slice(1));
  }, [phase, playerHand, deck, dealerHand, bet, userProfile, updateBalance, settle]);

  const reset = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setBet(0);
    setPhase('betting');
    setResult(null);
    setMessage('Place your bet to begin!');
    initDeck();
  };

  const addBet = (amount: number) => {
    if (phase !== 'betting') return;
    if ((userProfile?.balance ?? 0) < bet + amount) return;
    setBet((b) => b + amount);
  };

  const pVal = handValue(playerHand);
  const dVal = handValue(dealerHand.map((c) => ({ ...c, hidden: false })));

  const resultColors: Record<string, string> = {
    win: 'var(--emerald)', blackjack: 'var(--gold)', lose: 'var(--magenta)', push: 'var(--teal)'
  };

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--void)' }}>
      <Navbar />
      <main className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/lobby"><motion.button whileHover={{ scale: 1.05 }} className="btn-glass p-2 rounded-lg"><ArrowLeft size={20} /></motion.button></Link>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>Royal Blackjack</h1>
        </div>

        <motion.div
          className="glass-card p-6"
          style={{ background: 'linear-gradient(135deg, #0a1500 0%, #1a3000 50%, #0d2800 100%)', border: '1px solid rgba(0,200,117,0.2)' }}
        >
          {/* Balance */}
          <div className="text-right mb-4">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Balance: </span>
            <span className="font-number font-bold" style={{ color: 'var(--gold)', fontFamily: 'Orbitron, sans-serif' }}>
              🪙 {(userProfile?.balance ?? 0).toLocaleString()}
            </span>
          </div>

          {/* Dealer Hand */}
          <div className="mb-6">
            <div className="text-sm mb-2 font-bold" style={{ color: 'var(--text-muted)' }}>
              Dealer {dealerHand.length > 0 && phase !== 'playing' ? `(${dVal})` : ''}
            </div>
            <div className="flex gap-2 flex-wrap min-h-[110px] items-center">
              {dealerHand.length === 0 ? (
                <div className="text-5xl opacity-20">🃏 🃏</div>
              ) : (
                dealerHand.map((c, i) => <CardComponent key={i} card={c} index={i} />)
              )}
              {dealerThinking && (
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="text-sm ml-2" style={{ color: 'var(--text-muted)' }}>
                  thinking...
                </motion.div>
              )}
            </div>
          </div>

          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-xl font-bold py-3 mb-4 rounded-lg"
                style={{
                  color: result ? resultColors[result] : 'var(--gold)',
                  background: result ? `${resultColors[result]}15` : 'rgba(255,215,0,0.08)',
                  border: `1px solid ${result ? resultColors[result] : 'var(--gold)'}30`,
                  fontFamily: 'Cinzel Decorative, serif',
                }}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Player Hand */}
          <div className="mb-6">
            <div className="text-sm mb-2 font-bold" style={{ color: 'var(--text-muted)' }}>
              You {playerHand.length > 0 ? `(${pVal})` : ''}
              {pVal === 21 && playerHand.length === 2 && <span className="ml-2" style={{ color: 'var(--gold)' }}>♠ BLACKJACK!</span>}
              {pVal > 21 && <span className="ml-2" style={{ color: 'var(--magenta)' }}>BUST!</span>}
            </div>
            <div className="flex gap-2 flex-wrap min-h-[110px] items-center">
              {playerHand.length === 0 ? (
                <div className="text-5xl opacity-20">🃏 🃏</div>
              ) : (
                playerHand.map((c, i) => <CardComponent key={i} card={c} index={i} />)
              )}
            </div>
          </div>

          {/* Chips + Bet */}
          {phase === 'betting' && (
            <div className="mb-4">
              <div className="text-xs font-bold mb-3" style={{ color: 'var(--text-muted)' }}>SELECT CHIPS</div>
              <div className="flex gap-3 flex-wrap justify-center mb-4">
                {CHIP_CONFIGS.map((chip) => (
                  <motion.button
                    key={chip.value}
                    whileHover={{ scale: 1.12, y: -4 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => addBet(chip.value)}
                    className="chip"
                    style={{
                      background: chip.bg,
                      borderColor: chip.border,
                      color: '#fff',
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: 11,
                    }}
                  >
                    {chip.label}
                  </motion.button>
                ))}
              </div>
              {bet > 0 && (
                <div className="text-center mb-3">
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Bet: </span>
                  <span className="font-number font-bold text-lg" style={{ color: 'var(--gold)', fontFamily: 'Orbitron, sans-serif' }}>{bet.toLocaleString()}</span>
                  <motion.button onClick={() => setBet(0)} whileHover={{ scale: 1.05 }} className="ml-3 text-xs px-2 py-1 rounded" style={{ background: 'rgba(233,30,140,0.15)', color: 'var(--magenta)' }}>Clear</motion.button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center flex-wrap">
            {phase === 'betting' && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={deal}
                disabled={bet === 0}
                className="btn-gold px-10 py-3 rounded-xl font-black text-lg"
                style={{ fontFamily: 'Cinzel Decorative, serif', opacity: bet === 0 ? 0.5 : 1 }}>
                Deal
              </motion.button>
            )}
            {phase === 'playing' && (
              <>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={hit}
                  className="btn-gold px-8 py-3 rounded-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Hit
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={stand}
                  className="btn-glass px-8 py-3 rounded-xl font-bold">
                  Stand
                </motion.button>
                {playerHand.length === 2 && (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={doubleDown}
                    disabled={(userProfile?.balance ?? 0) < bet}
                    className="px-6 py-3 rounded-xl font-bold text-sm"
                    style={{ background: 'rgba(0,229,255,0.15)', border: '1px solid var(--teal)', color: 'var(--teal)' }}>
                    Double
                  </motion.button>
                )}
              </>
            )}
            {phase === 'result' && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={reset}
                className="btn-gold px-10 py-3 rounded-xl font-black text-lg glow-pulse"
                style={{ fontFamily: 'Cinzel Decorative, serif' }}>
                New Round
              </motion.button>
            )}
          </div>
        </motion.div>
      </main>

      <WinModal open={winModal} amount={winAmount} onClose={() => setWinModal(false)} onPlayAgain={() => { setWinModal(false); reset(); }} />
    </div>
  );
}
