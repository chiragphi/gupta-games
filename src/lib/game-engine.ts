import {
  doc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type GameType = 'slots' | 'crash' | 'blackjack' | 'mines';

export interface GameRecord {
  userId: string;
  gameType: GameType;
  betAmount: number;
  winAmount: number;
  multiplier: number;
  timestamp: string;
  profit: number;
}

const VIP_XP_PER_COIN_WAGERED = 0.1;

function calculateVipLevel(xp: number): number {
  if (xp >= 100000) return 5; // Maharaja
  if (xp >= 50000) return 4;  // Diamond
  if (xp >= 20000) return 3;  // Platinum
  if (xp >= 8000) return 2;   // Gold
  if (xp >= 2000) return 1;   // Silver
  return 0;                    // Bronze
}

export async function placeBet(userId: string, amount: number, currentBalance: number): Promise<number> {
  const newBalance = currentBalance - amount;
  await updateDoc(doc(db, 'users', userId), {
    balance: newBalance,
    totalWagered: increment(amount),
    vipXP: increment(amount * VIP_XP_PER_COIN_WAGERED),
  });
  return newBalance;
}

export async function settleBet(userId: string, winAmount: number, currentBalance: number): Promise<number> {
  const newBalance = currentBalance + winAmount;
  const updates: Record<string, unknown> = {
    balance: newBalance,
    totalWon: increment(winAmount),
    gamesPlayed: increment(1),
  };
  await updateDoc(doc(db, 'users', userId), updates);
  return newBalance;
}

export async function recordGame(
  userId: string,
  gameType: GameType,
  betAmount: number,
  winAmount: number,
  multiplier: number,
  currentBiggestWin: number
): Promise<void> {
  const profit = winAmount - betAmount;
  await addDoc(collection(db, 'users', userId, 'gameHistory'), {
    gameType,
    betAmount,
    winAmount,
    multiplier,
    profit,
    timestamp: serverTimestamp(),
  });

  // Check for biggest win update
  if (winAmount > currentBiggestWin) {
    await updateDoc(doc(db, 'users', userId), {
      biggestWin: winAmount,
    });
  }
}

export async function processBetAndWin(
  userId: string,
  gameType: GameType,
  betAmount: number,
  winAmount: number,
  multiplier: number,
  currentBalance: number,
  currentBiggestWin: number
): Promise<number> {
  const profit = winAmount - betAmount;
  const newBalance = currentBalance + profit;

  const updateData: Record<string, unknown> = {
    balance: newBalance,
    totalWagered: increment(betAmount),
    gamesPlayed: increment(1),
    vipXP: increment(betAmount * VIP_XP_PER_COIN_WAGERED),
  };

  if (winAmount > 0) {
    updateData.totalWon = increment(winAmount);
  }

  if (winAmount > currentBiggestWin) {
    updateData.biggestWin = winAmount;
  }

  await updateDoc(doc(db, 'users', userId), updateData);

  try {
    await addDoc(collection(db, 'users', userId, 'gameHistory'), {
      gameType,
      betAmount,
      winAmount,
      multiplier,
      profit,
      timestamp: serverTimestamp(),
    });
  } catch {
    // non-critical
  }

  return newBalance;
}

export { calculateVipLevel };
