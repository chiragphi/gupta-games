# 🎰 Gupta Games — Mughal Cyber Palace

A stunning fake casino / social gaming website. Pure play money entertainment — no real gambling.

## Tech Stack
- Next.js 16 (App Router + TypeScript)
- Tailwind CSS v4 + custom design system
- Firebase (Auth + Firestore)
- Framer Motion animations
- canvas-confetti win celebrations

## Quick Start

### 1. Install
```bash
npm install
```

### 2. Firebase Setup
1. [console.firebase.google.com](https://console.firebase.google.com) → New project
2. Authentication → Enable Email/Password
3. Firestore → Create database → Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /games/{gameId} {
      allow read, write: if request.auth != null;
    }
  }
}
```
4. Project Settings → Web app → copy firebaseConfig

### 3. Environment Variables
```bash
cp .env.local.example .env.local
# Fill in your Firebase values
```

### 4. Run
```bash
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel
```bash
npx vercel
# Add all NEXT_PUBLIC_FIREBASE_* env vars in Vercel dashboard
```

## Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth/signup` | Create account |
| `/auth/login` | Sign in |
| `/onboarding` | Pick username + avatar |
| `/lobby` | Main dashboard |
| `/games/slots` | Maharaja Slots (flagship) |
| `/games/crash` | Crash Rocket |
| `/games/blackjack` | Royal Blackjack |
| `/games/mines` | Diamond Mines |
| `/wallet` | Coins + fake deposit |
| `/profile` | Stats + achievements |
| `/leaderboard` | Top players |
| `/referral` | Referral system |

## Games
- **Maharaja Slots**: 5-reel, 3-row, 20 paylines, free spins, near-miss mechanics
- **Crash Rocket**: Exponential multiplier, cash out before crash
- **Royal Blackjack**: Dealer hits to 17, double down, 2.5x blackjack payout
- **Diamond Mines**: 5×5 grid, reveal diamonds, cash out anytime

All users start with **10,000 Gupta Coins** (play money, no real value).

## Disclaimer
For entertainment only. No real money. Gupta Coins have zero monetary value.
