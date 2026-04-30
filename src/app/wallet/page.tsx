'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/layout/navbar';
import Sidebar from '@/components/layout/sidebar';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { CreditCard, Smartphone, Bitcoin, Landmark, Plus, TrendingUp, TrendingDown } from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, color: 'var(--gold)' },
  { id: 'upi', label: 'UPI', icon: Smartphone, color: 'var(--emerald)' },
  { id: 'crypto', label: 'Crypto (USDT)', icon: Bitcoin, color: 'var(--saffron)' },
  { id: 'netbanking', label: 'Net Banking', icon: Landmark, color: 'var(--teal)' },
];

const DEPOSIT_AMOUNTS = [500, 1000, 5000, 10000, 25000, 50000];

const BONUS_MAP: Record<number, string> = {
  500: '50%',
  1000: '75%',
  5000: '100%',
  10000: '150%',
  25000: '200%',
  50000: '250%',
};

function generateHistory() {
  const games = ['Maharaja Slots', 'Crash Rocket', 'Royal Blackjack', 'Diamond Mines'];
  const types = ['win', 'loss', 'deposit'];
  return Array.from({ length: 20 }, (_, i) => {
    const type = i < 2 ? 'deposit' : types[Math.floor(Math.random() * 3)];
    const amount = type === 'deposit' ? [5000, 10000, 25000][Math.floor(Math.random() * 3)]
      : Math.floor(Math.random() * 15000 + 100);
    return {
      id: i,
      type,
      game: type !== 'deposit' ? games[Math.floor(Math.random() * 4)] : undefined,
      amount,
      date: new Date(Date.now() - i * 3600000 * (1 + Math.random() * 8)),
    };
  });
}

export default function WalletPage() {
  const { user, userProfile, updateBalance } = useAuth();
  const router = useRouter();
  const [showDeposit, setShowDeposit] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [selectedAmount, setSelectedAmount] = useState(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [depositStep, setDepositStep] = useState<'select' | 'confirm' | 'processing' | 'success'>('select');
  const [history] = useState(generateHistory());

  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);

  const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;
  const bonusPct = BONUS_MAP[finalAmount] ?? '50%';
  const bonusCoins = Math.floor(finalAmount * (parseInt(bonusPct) / 100));
  const totalCoins = finalAmount + bonusCoins;

  const handleDeposit = async () => {
    setDepositStep('processing');
    await new Promise((r) => setTimeout(r, 2000));
    setDepositStep('success');
    await updateBalance(totalCoins);
    confetti({
      particleCount: 200, spread: 100,
      colors: ['#FFD700', '#FF6B1A', '#00C875', '#E91E8C'],
      origin: { y: 0.5 },
    });
    toast.success(`🎉 +${totalCoins.toLocaleString()} Gupta Coins added!`);
    setTimeout(() => { setShowDeposit(false); setDepositStep('select'); }, 3500);
  };

  const totalWon = history.filter((h) => h.type === 'win').reduce((s, h) => s + h.amount, 0);
  const totalLost = history.filter((h) => h.type === 'loss').reduce((s, h) => s + h.amount, 0);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--void)' }}>
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-6" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>
            Wallet
          </motion.h1>

          {/* Balance Hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(255,107,26,0.04) 100%)', border: '1px solid var(--gold)' }}
          >
            <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>TOTAL BALANCE</div>
            <motion.div
              key={userProfile?.balance}
              animate={{ scale: [1, 1.05, 1] }}
              className="font-number text-5xl md:text-6xl font-black mb-4"
              style={{ color: 'var(--gold)', fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 30px rgba(255,215,0,0.5)' }}
            >
              🪙 {(userProfile?.balance ?? 0).toLocaleString()}
            </motion.div>
            <div className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Gupta Coins (Play Money)</div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,215,0,0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDeposit(true)}
              className="btn-gold px-12 py-4 rounded-xl font-black text-xl glow-pulse"
              style={{ fontFamily: 'Cinzel Decorative, serif' }}
            >
              <Plus className="inline mr-2" size={20} />
              Deposit Coins
            </motion.button>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Won', value: totalWon.toLocaleString(), color: 'var(--emerald)', icon: TrendingUp },
              { label: 'Total Lost', value: totalLost.toLocaleString(), color: 'var(--magenta)', icon: TrendingDown },
              { label: 'Net Profit', value: (totalWon - totalLost).toLocaleString(), color: totalWon > totalLost ? 'var(--emerald)' : 'var(--magenta)', icon: TrendingUp },
              { label: 'Games Played', value: (userProfile?.gamesPlayed ?? 0).toLocaleString(), color: 'var(--teal)', icon: TrendingUp },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card p-4 text-center">
                <div className="font-number text-lg font-bold" style={{ color: stat.color, fontFamily: 'Orbitron, sans-serif' }}>{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Transaction History */}
          <div className="glass-card p-5">
            <div className="font-bold mb-4" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>Transaction History</div>
            <div className="space-y-2">
              {history.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-xl">
                    {tx.type === 'deposit' ? '💰' : tx.type === 'win' ? '🏆' : '💸'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {tx.type === 'deposit' ? 'Deposit' : tx.game}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {tx.date.toLocaleDateString()} {tx.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="font-number font-bold text-right" style={{
                    color: tx.type === 'loss' ? 'var(--magenta)' : 'var(--emerald)',
                    fontFamily: 'Orbitron, sans-serif', fontSize: 12,
                  }}>
                    {tx.type === 'loss' ? '-' : '+'}{tx.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            onClick={() => depositStep === 'select' && setShowDeposit(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-card p-6 max-w-md w-full"
              style={{ border: '2px solid var(--gold)', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              {depositStep === 'success' ? (
                <motion.div className="text-center py-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <motion.div animate={{ rotate: [0, 20, -20, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-6xl mb-4">🎊</motion.div>
                  <div className="font-display text-2xl mb-2" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>Deposit Successful!</div>
                  <div className="font-number text-4xl font-black my-4" style={{ color: 'var(--emerald)', fontFamily: 'Orbitron, sans-serif' }}>
                    +{totalCoins.toLocaleString()} Coins!
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Includes {bonusPct} bonus: +{bonusCoins.toLocaleString()} free coins 🎁
                  </div>
                </motion.div>
              ) : depositStep === 'processing' ? (
                <div className="text-center py-12">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="text-5xl mb-6 inline-block">⚙️</motion.div>
                  <div className="text-xl font-bold" style={{ color: 'var(--gold)', fontFamily: 'Cinzel Decorative, serif' }}>Processing Deposit...</div>
                  <div className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Preparing your Gupta Coins</div>
                </div>
              ) : depositStep === 'confirm' ? (
                <div>
                  <h3 className="text-xl font-bold mb-6 text-center" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>Confirm Deposit</h3>
                  <div className="glass-card p-4 mb-4" style={{ border: '1px solid var(--emerald)' }}>
                    <div className="flex justify-between mb-2 text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                      <span className="font-bold">{finalAmount.toLocaleString()} coins</span>
                    </div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>Bonus ({bonusPct})</span>
                      <span className="font-bold" style={{ color: 'var(--emerald)' }}>+{bonusCoins.toLocaleString()} FREE</span>
                    </div>
                    <div className="flex justify-between pt-2 text-lg font-bold" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <span>Total</span>
                      <span style={{ color: 'var(--gold)' }}>{totalCoins.toLocaleString()} coins</span>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleDeposit}
                    className="btn-gold w-full py-4 rounded-xl font-black text-xl glow-pulse mb-3"
                    style={{ fontFamily: 'Cinzel Decorative, serif' }}>
                    Confirm & Deposit!
                  </motion.button>
                  <button onClick={() => setDepositStep('select')} className="w-full text-sm py-2" style={{ color: 'var(--text-muted)' }}>← Back</button>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-bold mb-6 text-center" style={{ fontFamily: 'Cinzel Decorative, serif', color: 'var(--gold)' }}>Add Gupta Coins</h3>

                  {/* Bonus Banner */}
                  <div className="p-3 rounded-lg mb-5 text-center" style={{ background: 'rgba(255,107,26,0.15)', border: '1px solid rgba(255,107,26,0.3)' }}>
                    <span className="text-sm font-bold" style={{ color: 'var(--saffron)' }}>🎁 GET UP TO 250% BONUS COINS!</span>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-5">
                    <label className="text-xs font-bold mb-3 block" style={{ color: 'var(--text-muted)' }}>PAYMENT METHOD</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map((m) => {
                        const Icon = m.icon;
                        return (
                          <motion.button key={m.id} whileHover={{ scale: 1.03 }} onClick={() => setSelectedMethod(m.id)}
                            className="p-3 rounded-lg flex items-center gap-2 text-sm font-bold transition-all"
                            style={{
                              background: selectedMethod === m.id ? `${m.color}20` : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${selectedMethod === m.id ? m.color : 'rgba(255,255,255,0.08)'}`,
                              color: selectedMethod === m.id ? m.color : 'var(--text-secondary)',
                            }}>
                            <Icon size={16} />
                            <span className="text-xs">{m.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="mb-5">
                    <label className="text-xs font-bold mb-3 block" style={{ color: 'var(--text-muted)' }}>AMOUNT (GUPTA COINS)</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {DEPOSIT_AMOUNTS.map((a) => (
                        <motion.button key={a} whileHover={{ scale: 1.05 }}
                          onClick={() => { setSelectedAmount(a); setCustomAmount(''); }}
                          className="py-3 rounded-lg text-sm font-bold flex flex-col items-center"
                          style={{
                            background: !customAmount && selectedAmount === a ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${!customAmount && selectedAmount === a ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`,
                            color: !customAmount && selectedAmount === a ? 'var(--gold)' : 'var(--text-secondary)',
                          }}>
                          <span className="font-number text-base" style={{ fontFamily: 'Orbitron, sans-serif' }}>{a >= 1000 ? `${a/1000}K` : a}</span>
                          {BONUS_MAP[a] && <span className="text-xs mt-0.5" style={{ color: 'var(--emerald)' }}>+{BONUS_MAP[a]}</span>}
                        </motion.button>
                      ))}
                    </div>
                    <input
                      type="number"
                      placeholder="Custom amount..."
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="input-dark w-full px-3 py-2 rounded-lg text-sm"
                    />
                  </div>

                  {finalAmount > 0 && (
                    <div className="p-3 rounded-lg mb-5 flex justify-between items-center" style={{ background: 'rgba(0,200,117,0.08)', border: '1px solid rgba(0,200,117,0.2)' }}>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>You receive:</span>
                      <span className="font-number font-bold text-lg" style={{ color: 'var(--gold)', fontFamily: 'Orbitron, sans-serif' }}>
                        {totalCoins.toLocaleString()} coins
                      </span>
                    </div>
                  )}

                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => finalAmount > 0 && setDepositStep('confirm')}
                    disabled={finalAmount <= 0}
                    className="btn-gold w-full py-4 rounded-xl font-black text-lg"
                    style={{ fontFamily: 'Cinzel Decorative, serif', opacity: finalAmount <= 0 ? 0.5 : 1 }}>
                    Deposit {finalAmount > 0 ? `${finalAmount.toLocaleString()} Coins` : ''}
                  </motion.button>
                  <p className="text-center text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                    Play money only · No real money · Entertainment purpose
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
