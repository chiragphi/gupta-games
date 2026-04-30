'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import Sidebar, { MobileBottomNav } from '@/components/layout/sidebar';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const DEPOSIT_AMOUNTS = [500, 1000, 5000, 10000, 25000, 50000];
const BONUS_MAP: Record<number, number> = { 500: 50, 1000: 75, 5000: 100, 10000: 150, 25000: 200, 50000: 250 };

const PAYMENT_METHODS = [
  { id: 'card', label: 'Card', icon: '💳', color: '#FFD700' },
  { id: 'upi', label: 'UPI', icon: '📱', color: '#00C875' },
  { id: 'crypto', label: 'Crypto', icon: '₿', color: '#FF6B1A' },
  { id: 'bank', label: 'Bank', icon: '🏦', color: '#00E5FF' },
];

function generateHistory() {
  const games = ['Maharaja Slots', 'Crash Rocket', 'Royal Blackjack', 'Diamond Mines'];
  const types = ['win', 'loss', 'deposit'] as const;
  return Array.from({ length: 18 }, (_, i) => {
    const type = i < 2 ? 'deposit' : types[Math.floor(Math.random() * 3)];
    const amount = type === 'deposit'
      ? [5000, 10000, 25000][Math.floor(Math.random() * 3)]
      : Math.floor(Math.random() * 8000 + 100);
    return {
      id: i, type, game: type !== 'deposit' ? games[Math.floor(Math.random() * 4)] : undefined, amount,
      date: new Date(Date.now() - i * 3600000 * (1 + Math.random() * 6)),
    };
  });
}

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 18,
  padding: '20px',
};

export default function WalletPage() {
  const { user, userProfile, updateBalance } = useAuth();
  const router = useRouter();
  const [showDeposit, setShowDeposit] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [selectedAmount, setSelectedAmount] = useState(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'processing' | 'success'>('select');
  const [history] = useState(generateHistory);

  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);

  const finalAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;
  const bonusPct = BONUS_MAP[finalAmount] ?? 50;
  const bonusCoins = Math.floor(finalAmount * (bonusPct / 100));
  const totalCoins = finalAmount + bonusCoins;

  const handleDeposit = async () => {
    setStep('processing');
    await new Promise(r => setTimeout(r, 1800));
    setStep('success');
    await updateBalance(totalCoins);
    confetti({ particleCount: 180, spread: 100, colors: ['#FFD700', '#FF6B1A', '#00C875', '#E91E8C'], origin: { y: 0.5 } });
    toast.success(`🎉 +${totalCoins.toLocaleString()} Coins!`);
    setTimeout(() => { setShowDeposit(false); setStep('select'); }, 3000);
  };

  const totalWon = history.filter(h => h.type === 'win').reduce((s, h) => s + h.amount, 0);
  const totalLost = history.filter(h => h.type === 'loss').reduce((s, h) => s + h.amount, 0);

  if (!user) return null;

  return (
    <div className="page-layout">
      <Navbar />
      <Sidebar />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px' }}>

        {/* Balance hero */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'linear-gradient(135deg,rgba(255,215,0,.08) 0%,rgba(255,107,26,.05) 100%)',
            border: '1px solid rgba(255,215,0,.3)', borderRadius: 24,
            padding: '32px 24px', textAlign: 'center', marginBottom: 20,
            boxShadow: '0 0 60px rgba(255,215,0,.1)',
          }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, letterSpacing: '.12em', color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>
            TOTAL BALANCE
          </div>
          <motion.div key={userProfile?.balance} animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 0.4 }}
            style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 42, fontWeight: 900, color: '#FFD700', marginBottom: 4, textShadow: '0 0 30px rgba(255,215,0,.4)' }}>
            🪙 {(userProfile?.balance ?? 0).toLocaleString()}
          </motion.div>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 24 }}>
            Gupta Coins · Play money only
          </div>
          <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,215,0,.5)' }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowDeposit(true)}
            style={{
              padding: '14px 40px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#B8960C,#FFD700,#FFF176,#FFD700,#B8960C)',
              backgroundSize: '200% auto', animation: 'shimmer 3s linear infinite',
              fontFamily: 'Cinzel Decorative,serif', fontSize: 16, fontWeight: 900, color: '#1a1000',
              boxShadow: '0 0 25px rgba(255,215,0,.3)',
            }}>
            + Deposit Coins
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total Won', value: totalWon.toLocaleString(), color: '#00C875' },
            { label: 'Total Lost', value: totalLost.toLocaleString(), color: '#E91E8C' },
            { label: 'Net', value: (totalWon - totalLost >= 0 ? '+' : '') + (totalWon - totalLost).toLocaleString(), color: totalWon >= totalLost ? '#00C875' : '#E91E8C' },
            { label: 'Games', value: (userProfile?.gamesPlayed ?? 0).toString(), color: '#00E5FF' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 + i * 0.05 }}
              style={{ ...card, textAlign: 'center', padding: '16px 12px' }}>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Transaction history */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={card}>
          <div style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 14, fontWeight: 700, color: '#FFD700', marginBottom: 14 }}>
            📜 History
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {history.map(tx => (
              <div key={tx.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                borderRadius: 12, background: 'rgba(255,255,255,.03)',
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>
                  {tx.type === 'deposit' ? '💰' : tx.type === 'win' ? '🏆' : '💸'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tx.type === 'deposit' ? 'Deposit' : tx.game}
                  </div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.3)' }}>
                    {tx.date.toLocaleDateString()} {tx.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 13, fontWeight: 700, flexShrink: 0, color: tx.type === 'loss' ? '#E91E8C' : '#00C875' }}>
                  {tx.type === 'loss' ? '-' : '+'}{tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </main>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => step === 'select' && setShowDeposit(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,.88)' }}>
            <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'rgba(12,6,30,.98)', backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255,215,0,.25)', borderRadius: 24,
                padding: '28px 24px', width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 0 80px rgba(0,0,0,.8)',
              }}>

              {step === 'success' ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <motion.div animate={{ rotate: [0, 20, -20, 0] }} transition={{ repeat: Infinity, duration: 1 }} style={{ fontSize: 60, marginBottom: 16 }}>🎊</motion.div>
                  <div style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 20, color: '#FFD700', marginBottom: 12 }}>Deposit Success!</div>
                  <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 32, fontWeight: 900, color: '#00C875', marginBottom: 8 }}>+{totalCoins.toLocaleString()}</div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, color: 'rgba(255,255,255,.5)' }}>Includes {bonusPct}% bonus!</div>
                </div>
              ) : step === 'processing' ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ fontSize: 48, display: 'inline-block', marginBottom: 20 }}>⚙️</motion.div>
                  <div style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 18, color: '#FFD700' }}>Processing...</div>
                </div>
              ) : step === 'confirm' ? (
                <div>
                  <h3 style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 18, color: '#FFD700', textAlign: 'center', margin: '0 0 20px' }}>Confirm Deposit</h3>
                  <div style={{ background: 'rgba(0,200,117,.06)', border: '1px solid rgba(0,200,117,.2)', borderRadius: 14, padding: 16, marginBottom: 20 }}>
                    {[
                      ['Amount', `${finalAmount.toLocaleString()} coins`, '#fff'],
                      ['Bonus', `+${bonusCoins.toLocaleString()} FREE (${bonusPct}%)`, '#00C875'],
                      ['Total', `${totalCoins.toLocaleString()} coins`, '#FFD700'],
                    ].map(([label, value, color]) => (
                      <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: 'Syne,sans-serif', fontSize: 14 }}>
                        <span style={{ color: 'rgba(255,255,255,.5)' }}>{label}</span>
                        <span style={{ fontWeight: 700, color: color as string }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleDeposit}
                    style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#B8960C,#FFD700)', fontFamily: 'Cinzel Decorative,serif', fontSize: 15, fontWeight: 900, color: '#1a1000', marginBottom: 10 }}>
                    Confirm & Deposit!
                  </motion.button>
                  <button onClick={() => setStep('select')} style={{ width: '100%', padding: '8px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne,sans-serif', fontSize: 12, color: 'rgba(255,255,255,.4)' }}>← Back</button>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontFamily: 'Cinzel Decorative,serif', fontSize: 18, color: '#FFD700', textAlign: 'center', margin: '0 0 20px' }}>Add Gupta Coins</h3>

                  <div style={{ background: 'rgba(255,107,26,.1)', border: '1px solid rgba(255,107,26,.25)', borderRadius: 12, padding: '10px 14px', textAlign: 'center', marginBottom: 20 }}>
                    <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: '#FF6B1A' }}>🎁 Up to 250% Bonus Coins!</span>
                  </div>

                  {/* Payment method */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: '.08em', marginBottom: 10 }}>PAYMENT METHOD</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                      {PAYMENT_METHODS.map(m => (
                        <motion.button key={m.id} whileHover={{ scale: 1.05 }} onClick={() => setSelectedMethod(m.id)}
                          style={{
                            padding: '10px 4px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'center',
                            background: selectedMethod === m.id ? `${m.color}18` : 'rgba(255,255,255,.04)',
                            outline: `1px solid ${selectedMethod === m.id ? m.color + '60' : 'rgba(255,255,255,.08)'}`,
                          }}>
                          <div style={{ fontSize: 20, marginBottom: 4 }}>{m.icon}</div>
                          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 10, fontWeight: 600, color: selectedMethod === m.id ? m.color : 'rgba(255,255,255,.45)' }}>{m.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: '.08em', marginBottom: 10 }}>AMOUNT</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
                      {DEPOSIT_AMOUNTS.map(a => (
                        <motion.button key={a} whileHover={{ scale: 1.04 }}
                          onClick={() => { setSelectedAmount(a); setCustomAmount(''); }}
                          style={{
                            padding: '10px 4px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'center',
                            background: !customAmount && selectedAmount === a ? 'rgba(255,215,0,.12)' : 'rgba(255,255,255,.04)',
                            outline: `1px solid ${!customAmount && selectedAmount === a ? 'rgba(255,215,0,.4)' : 'rgba(255,255,255,.08)'}`,
                          }}>
                          <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 14, fontWeight: 700, color: !customAmount && selectedAmount === a ? '#FFD700' : 'rgba(255,255,255,.7)' }}>
                            {a >= 1000 ? `${a / 1000}K` : a}
                          </div>
                          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 10, color: '#00C875', marginTop: 2 }}>+{BONUS_MAP[a] ?? 50}%</div>
                        </motion.button>
                      ))}
                    </div>
                    <input type="number" placeholder="Custom amount..." value={customAmount}
                      onChange={e => setCustomAmount(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: 'rgba(0,0,0,.4)', border: '1px solid rgba(255,215,0,.15)', color: '#fff', fontFamily: 'Syne,sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>

                  {finalAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,200,117,.06)', border: '1px solid rgba(0,200,117,.18)', borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
                      <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, color: 'rgba(255,255,255,.5)' }}>You receive:</span>
                      <span style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 15, fontWeight: 700, color: '#FFD700' }}>{totalCoins.toLocaleString()} coins</span>
                    </div>
                  )}

                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => finalAmount > 0 && setStep('confirm')} disabled={finalAmount <= 0}
                    style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: finalAmount > 0 ? 'pointer' : 'not-allowed', background: 'linear-gradient(135deg,#B8960C,#FFD700)', fontFamily: 'Cinzel Decorative,serif', fontSize: 15, fontWeight: 900, color: '#1a1000', opacity: finalAmount > 0 ? 1 : 0.5 }}>
                    Deposit {finalAmount > 0 ? `${finalAmount.toLocaleString()} Coins` : ''}
                  </motion.button>
                  <p style={{ textAlign: 'center', fontFamily: 'Syne,sans-serif', fontSize: 11, color: 'rgba(255,255,255,.25)', marginTop: 12, marginBottom: 0 }}>
                    Play money only · No real money gambling
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileBottomNav />
    </div>
  );
}
