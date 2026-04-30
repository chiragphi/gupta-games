export interface FakeWin {
  id: string;
  username: string;
  game: string;
  amount: number;
  multiplier: number;
  timestamp: Date;
  avatar: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  vipLevel: number;
  totalWon: number;
  gamesPlayed: number;
  vipLabel: string;
}

export interface VipLevel {
  level: number;
  label: string;
  color: string;
  minXP: number;
  maxXP: number;
  badge: string;
  benefits: string[];
}

const USERNAMES = [
  'RajKumar99', 'SilkRouteKing', 'MughalMaster', 'DelhiDynasty',
  'BombayBaller', 'KolkataCrash', 'MumbaiMaharaja', 'JaipurJackpot',
  'GuruNanak777', 'TajMahalTycoon', 'SpiceMerchant', 'IndusKing',
  'AshokaAce', 'VikramVault', 'ChandraguPt', 'AkbarAce99',
  'ShahJahan_X', 'AurangzebAlpha', 'BirbalBet', 'TansenWins',
];

const GAMES = ['Maharaja Slots', 'Crash Rocket', 'Royal Blackjack', 'Diamond Mines'];

const AVATARS_LIST = [
  '🦁', '🐯', '🦅', '🐘', '🦚', '🐉', '🦊', '🐺', '🦋', '🌙', '⭐', '🔥',
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateFakeWin(): FakeWin {
  const amount = randomBetween(500, 250000);
  const multiplier = parseFloat((amount / randomBetween(100, 5000)).toFixed(2));
  return {
    id: Math.random().toString(36).slice(2),
    username: randomPick(USERNAMES),
    game: randomPick(GAMES),
    amount,
    multiplier,
    timestamp: new Date(),
    avatar: randomPick(AVATARS_LIST),
  };
}

export const FAKE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: 'MughalMaster', avatar: '👑', vipLevel: 5, totalWon: 9842100, gamesPlayed: 4521, vipLabel: 'Maharaja' },
  { rank: 2, username: 'TajMahalTycoon', avatar: '🏆', vipLevel: 5, totalWon: 7234500, gamesPlayed: 3892, vipLabel: 'Maharaja' },
  { rank: 3, username: 'DelhiDynasty', avatar: '💎', vipLevel: 4, totalWon: 5123400, gamesPlayed: 2741, vipLabel: 'Diamond' },
  { rank: 4, username: 'RajKumar99', avatar: '🦁', vipLevel: 4, totalWon: 4890300, gamesPlayed: 3120, vipLabel: 'Diamond' },
  { rank: 5, username: 'BombayBaller', avatar: '🐯', vipLevel: 4, totalWon: 3741200, gamesPlayed: 2456, vipLabel: 'Diamond' },
  { rank: 6, username: 'IndusKing', avatar: '🦅', vipLevel: 3, totalWon: 2983100, gamesPlayed: 1987, vipLabel: 'Platinum' },
  { rank: 7, username: 'AshokaAce', avatar: '⭐', vipLevel: 3, totalWon: 2541800, gamesPlayed: 1654, vipLabel: 'Platinum' },
  { rank: 8, username: 'VikramVault', avatar: '🔥', vipLevel: 3, totalWon: 2198400, gamesPlayed: 1432, vipLabel: 'Platinum' },
  { rank: 9, username: 'SilkRouteKing', avatar: '🐘', vipLevel: 2, totalWon: 1876500, gamesPlayed: 1234, vipLabel: 'Gold' },
  { rank: 10, username: 'KolkataCrash', avatar: '🦋', vipLevel: 2, totalWon: 1432100, gamesPlayed: 987, vipLabel: 'Gold' },
  { rank: 11, username: 'MumbaiMaharaja', avatar: '🌙', vipLevel: 2, totalWon: 1198700, gamesPlayed: 876, vipLabel: 'Gold' },
  { rank: 12, username: 'JaipurJackpot', avatar: '🦚', vipLevel: 2, totalWon: 987300, gamesPlayed: 743, vipLabel: 'Gold' },
  { rank: 13, username: 'GuruNanak777', avatar: '🐉', vipLevel: 1, totalWon: 743200, gamesPlayed: 621, vipLabel: 'Silver' },
  { rank: 14, username: 'SpiceMerchant', avatar: '🦊', vipLevel: 1, totalWon: 587400, gamesPlayed: 498, vipLabel: 'Silver' },
  { rank: 15, username: 'ChandraguPt', avatar: '🐺', vipLevel: 1, totalWon: 432100, gamesPlayed: 387, vipLabel: 'Silver' },
  { rank: 16, username: 'AkbarAce99', avatar: '🦁', vipLevel: 1, totalWon: 321800, gamesPlayed: 298, vipLabel: 'Silver' },
  { rank: 17, username: 'ShahJahan_X', avatar: '🏆', vipLevel: 0, totalWon: 214300, gamesPlayed: 187, vipLabel: 'Bronze' },
  { rank: 18, username: 'AurangzebAlpha', avatar: '💎', vipLevel: 0, totalWon: 143200, gamesPlayed: 143, vipLabel: 'Bronze' },
  { rank: 19, username: 'BirbalBet', avatar: '⭐', vipLevel: 0, totalWon: 98700, gamesPlayed: 98, vipLabel: 'Bronze' },
  { rank: 20, username: 'TansenWins', avatar: '🔥', vipLevel: 0, totalWon: 54300, gamesPlayed: 67, vipLabel: 'Bronze' },
];

export const AVATARS: string[] = [
  '🦁', '🐯', '🦅', '🐘', '🦚', '🐉',
  '🦊', '🐺', '🦋', '🌙', '⭐', '🔥',
];

export const VIP_LEVELS: VipLevel[] = [
  {
    level: 0,
    label: 'Bronze',
    color: '#CD7F32',
    minXP: 0,
    maxXP: 2000,
    badge: '🥉',
    benefits: ['Standard rewards', 'Basic support', '10,000 welcome coins'],
  },
  {
    level: 1,
    label: 'Silver',
    color: '#C0C0C0',
    minXP: 2000,
    maxXP: 8000,
    badge: '🥈',
    benefits: ['5% cashback', 'Priority support', '25,000 bonus coins', 'Weekly bonus'],
  },
  {
    level: 2,
    label: 'Gold',
    color: '#FFD700',
    minXP: 8000,
    maxXP: 20000,
    badge: '🥇',
    benefits: ['10% cashback', 'VIP support', '50,000 bonus coins', 'Daily bonus'],
  },
  {
    level: 3,
    label: 'Platinum',
    color: '#E5E4E2',
    minXP: 20000,
    maxXP: 50000,
    badge: '💿',
    benefits: ['15% cashback', 'Dedicated manager', '100,000 bonus coins', 'Exclusive games'],
  },
  {
    level: 4,
    label: 'Diamond',
    color: '#00E5FF',
    minXP: 50000,
    maxXP: 100000,
    badge: '💎',
    benefits: ['20% cashback', '24/7 VIP support', '250,000 bonus coins', 'Private tournaments'],
  },
  {
    level: 5,
    label: 'Maharaja',
    color: '#E91E8C',
    minXP: 100000,
    maxXP: Infinity,
    badge: '👑',
    benefits: ['25% cashback', 'Personal concierge', '1,000,000 bonus coins', 'Unlimited access'],
  },
];

export const FAKE_TESTIMONIALS = [
  {
    id: 1,
    username: 'RajKumar99',
    avatar: '🦁',
    text: 'Won 250,000 Gupta Coins on the Maharaja Slots last night! The graphics are absolutely stunning and the gameplay is silky smooth.',
    vipLabel: 'Diamond',
  },
  {
    id: 2,
    username: 'DelhiDynasty',
    avatar: '💎',
    text: 'The Crash game is incredibly thrilling. I cashed out at 45x and the feeling was unreal! Best fake casino experience on the internet.',
    vipLabel: 'Platinum',
  },
  {
    id: 3,
    username: 'MumbaiMaharaja',
    avatar: '🌙',
    text: 'Gupta Games has the most beautiful UI I\'ve ever seen in any game. The Mughal Cyber Palace theme is absolutely fire!',
    vipLabel: 'Gold',
  },
];

export const LIVE_WIN_MESSAGES = [
  'RajKumar99 won 45,200 coins playing Maharaja Slots',
  'DelhiDynasty hit JACKPOT for 250,000 coins on Slots',
  'MughalMaster cashed out at 12.5x on Crash',
  'BombayBaller won 18,500 coins on Royal Blackjack',
  'TajMahalTycoon found 8 diamonds on Diamond Mines',
  'IndusKing won 8,400 coins on Maharaja Slots',
  'SilkRouteKing cashed out at 8.2x on Crash',
  'AshokaAce hit BONUS ROUND for 55,000 coins',
  'VikramVault won 31,200 coins playing Diamond Mines',
  'KolkataCrash won 9,800 coins on Royal Blackjack',
];
