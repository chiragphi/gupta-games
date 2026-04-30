'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Game {
  id: string;
  name: string;
  category: string;
  href: string;
  emoji: string;
  bg: string;
  badge?: string;
  players: number;
  rtp?: string;
}

export default function GameCard({ game }: { game: Game }) {
  const [hovered, setHovered] = useState(false);

  const badgeStyle: Record<string, { bg: string; color: string }> = {
    HOT: { bg: 'rgba(255,107,26,0.25)', color: 'var(--saffron)' },
    LIVE: { bg: 'rgba(0,200,117,0.25)', color: 'var(--emerald)' },
    NEW: { bg: 'rgba(0,229,255,0.25)', color: 'var(--teal)' },
    POPULAR: { bg: 'rgba(233,30,140,0.25)', color: 'var(--magenta)' },
  };

  const bs = game.badge ? badgeStyle[game.badge] : null;

  return (
    <Link href={game.href}>
      <motion.div
        className="relative overflow-hidden rounded-2xl cursor-pointer"
        style={{
          background: game.bg,
          border: hovered ? '2px solid var(--gold)' : '2px solid rgba(255,215,0,0.12)',
          boxShadow: hovered ? '0 0 40px rgba(255,215,0,0.25)' : '0 4px 20px rgba(0,0,0,0.4)',
          minHeight: 180,
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.97 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      >
        {/* Big BG emoji */}
        <div className="absolute right-3 bottom-3 text-8xl opacity-15 select-none pointer-events-none" style={{ transform: 'rotate(12deg)' }}>
          {game.emoji}
        </div>

        <div className="relative z-10 p-5 flex flex-col gap-3 h-full">
          {/* Top row: badges */}
          <div className="flex gap-2 flex-wrap">
            {bs && game.badge && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black" style={{ background: bs.bg, color: bs.color }}>
                {game.badge === 'LIVE' ? '🔴' : game.badge === 'HOT' ? '🔥' : game.badge === 'NEW' ? '✨' : '⚡'} {game.badge}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
              {game.category}
            </span>
          </div>

          <div className="text-4xl">{game.emoji}</div>

          <div>
            <h3 className="font-bold text-lg leading-tight" style={{ fontFamily: 'Cinzel Decorative, serif', color: '#fff' }}>
              {game.name}
            </h3>
            {game.rtp && <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>RTP {game.rtp}</div>}
          </div>

          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              {game.players.toLocaleString()} playing
            </span>
            <motion.div
              animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'var(--gold)', color: '#1a1000' }}>
                Play Now →
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
