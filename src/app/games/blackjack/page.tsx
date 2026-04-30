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
      style={{
        position: 'relative', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, userSelect: 'none',
        width: 72, height: 104, flexShrink: 0,
        background: card.hidden ? 'linear-gradient(135deg, #1a0a3e, #3d1078)' : '#F8F6F0',
        border: card.hidden ? '2px solid rgba(255,215,0,0.3)' : '2px solid rgba(0,0,0,0.1)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        color: isRed ? '#DC143C' : '#1a1a1a',
      }}
    >
      {card.hidden ? (
        <div style={{ fontSize: 30, opacity: 0.6 }}>🃏</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', padding: 8, height: '100%', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ fontSize: 13, fontWeight: 900, lineHeight: 1 }}>
            <div>{card.rank}</div>
            <div>{card.suit}</div>
          </div>
          <div style={{ fontSize: 22, alignSelf: 'center', lineHeight: 1 }}>{card.suit}</div>
          <div style={{ fontSize: 13, fontWeight: 900, lineHeight: 1, alignSelf: 'flex-end', transform: 'rotate(180deg)' }}>
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

    if (handValue(p) === 21) {
      setTimeout(() => settle(p, dealer, d.slice(4), 'blackjack'), 500);
    }
  }, [bet, userProfile, updateBalance]);

  const settle = useCallback(async (
    pHand: Card[], dHand: Card[], remainingDeck: Card[], forcedResult?: 'blackjack'
  ) => {
    setPhase('dealer');
    setDealerThinking(true);

    const revealedDealer = dHand.map((c) => ({ ...c, hidden: false }));
    setDealerHand(revealedDealer);

    if (forcedResult !== 'blackjack') {
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
    win: '#00C875', blackjack: '#FFD700', lose: '#E91E8C', push: '#00E5FF'
  };

  if (!user) return null;

  return (
    <div className="page-layout">
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        {/* Back + Title + Balance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <Link href="/lobby">
            <motion.button
              whileHover={{ scale: 1.05 }}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 10px', color: 'rgba(255,255,255,0.9)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <ArrowLeft size={20} />
            </motion.button>
          </Link>
          <h1 style={{ fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', fontSize: 24, fontWeight: 700, margin: 0, flex: 1 }}>
            Royal Blackjack
          </h1>
          <div style={{ fontFamily: 'Orbitron, sans-serif', color: '#FFD700', fontWeight: 700 }}>
            🪙 {(userProfile?.balance ?? 0).toLocaleString()}
          </div>
          {bet > 0 && (
            <div style={{ fontFamily: 'Orbitron, sans-serif', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              Bet: <span style={{ color: '#FFD700', fontWeight: 700 }}>{bet.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Felt Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #0a2a0a 0%, #0d3d0d 100%)',
            border: '1px solid rgba(0,200,117,0.25)',
            borderRadius: 20,
            padding: 28,
          }}
        >
          {/* Dealer Area */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'rgba(255,255,255,0.5)' }}>
              Dealer {dealerHand.length > 0 && phase !== 'playing' ? `(${dVal})` : ''}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', minHeight: 110, alignItems: 'center' }}>
              {dealerHand.length === 0 ? (
                <div style={{ fontSize: 44, opacity: 0.15 }}>🃏 🃏</div>
              ) : (
                dealerHand.map((c, i) => <CardComponent key={i} card={c} index={i} />)
              )}
              {dealerThinking && (
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} style={{ fontSize: 13, marginLeft: 8, color: 'rgba(255,255,255,0.5)' }}>
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
                style={{
                  textAlign: 'center', fontSize: 20, fontWeight: 700, padding: '12px 0', marginBottom: 16, borderRadius: 12,
                  color: result ? resultColors[result] : '#FFD700',
                  background: result ? `${resultColors[result]}15` : 'rgba(255,215,0,0.08)',
                  border: `1px solid ${result ? resultColors[result] : '#FFD700'}30`,
                  fontFamily: 'Cinzel Decorative, serif',
                }}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Player Area */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'rgba(255,255,255,0.5)' }}>
              You {playerHand.length > 0 ? `(${pVal})` : ''}
              {pVal === 21 && playerHand.length === 2 && <span style={{ marginLeft: 8, color: '#FFD700' }}>♠ BLACKJACK!</span>}
              {pVal > 21 && <span style={{ marginLeft: 8, color: '#E91E8C' }}>BUST!</span>}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', minHeight: 110, alignItems: 'center' }}>
              {playerHand.length === 0 ? (
                <div style={{ fontSize: 44, opacity: 0.15 }}>🃏 🃏</div>
              ) : (
                playerHand.map((c, i) => <CardComponent key={i} card={c} index={i} />)
              )}
            </div>
          </div>

          {/* Chips Row */}
          {phase === 'betting' && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 12, letterSpacing: 1 }}>SELECT CHIPS</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 14 }}>
                {CHIP_CONFIGS.map((chip) => (
                  <motion.button
                    key={chip.value}
                    whileHover={{ scale: 1.12, y: -4 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => addBet(chip.value)}
                    style={{
                      width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: chip.bg, border: `3px solid ${chip.border}`, color: '#fff',
                      fontFamily: 'Orbitron, sans-serif', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      boxShadow: `0 4px 12px ${chip.border}40`,
                    }}
                  >
                    {chip.label}
                  </motion.button>
                ))}
              </div>
              {bet > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Bet: </span>
                  <span style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 18, color: '#FFD700' }}>{bet.toLocaleString()}</span>
                  <motion.button
                    onClick={() => setBet(0)}
                    whileHover={{ scale: 1.05 }}
                    style={{ marginLeft: 12, fontSize: 12, padding: '4px 10px', borderRadius: 8, background: 'rgba(233,30,140,0.15)', color: '#E91E8C', border: 'none', cursor: 'pointer' }}
                  >
                    Clear
                  </motion.button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {phase === 'betting' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={deal}
                disabled={bet === 0}
                style={{
                  padding: '14px 48px', borderRadius: 14, fontFamily: 'Cinzel Decorative, serif', fontWeight: 900, fontSize: 18,
                  background: bet === 0 ? 'rgba(255,215,0,0.3)' : 'linear-gradient(135deg, #FFD700, #FF9500)',
                  color: '#1a1000', border: 'none', cursor: bet === 0 ? 'not-allowed' : 'pointer',
                  opacity: bet === 0 ? 0.5 : 1, boxShadow: bet > 0 ? '0 4px 20px rgba(255,215,0,0.3)' : 'none',
                }}
              >
                Deal
              </motion.button>
            )}
            {phase === 'playing' && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={hit}
                  style={{
                    padding: '14px 40px', borderRadius: 14, fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 18,
                    background: 'linear-gradient(135deg, #FFD700, #FF9500)', color: '#1a1000', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
                  }}
                >
                  Hit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stand}
                  style={{
                    padding: '14px 40px', borderRadius: 14, fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 18,
                    background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
                  }}
                >
                  Stand
                </motion.button>
                {playerHand.length === 2 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={doubleDown}
                    disabled={(userProfile?.balance ?? 0) < bet}
                    style={{
                      padding: '14px 32px', borderRadius: 14, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16,
                      background: 'rgba(0,229,255,0.15)', border: '1px solid #00E5FF', color: '#00E5FF', cursor: 'pointer',
                      opacity: (userProfile?.balance ?? 0) < bet ? 0.5 : 1,
                    }}
                  >
                    Double
                  </motion.button>
                )}
              </>
            )}
            {phase === 'result' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={reset}
                style={{
                  padding: '14px 56px', borderRadius: 14, fontFamily: 'Cinzel Decorative, serif', fontWeight: 900, fontSize: 18,
                  background: 'linear-gradient(135deg, #FFD700, #FF9500)', color: '#1a1000', border: 'none', cursor: 'pointer',
                  boxShadow: '0 0 30px rgba(255,215,0,0.4)',
                }}
              >
                New Round
              </motion.button>
            )}
          </div>
        </motion.div>
      </main>

      <MobileBottomNav />

      <WinModal open={winModal} amount={winAmount} onClose={() => setWinModal(false)} onPlayAgain={() => { setWinModal(false); reset(); }} />
    </div>
  );
}
