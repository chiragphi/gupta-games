'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

const SYMBOLS = ['👑', '💎', '🏆', '🐘', '🦁', '🔔', '🍇', '🍊', '🍋'];

function SlotReel({ offset }: { offset: number }) {
  const [idx, setIdx] = useState(offset % SYMBOLS.length);
  const [lit, setLit] = useState(false);
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const spin = () => {
      setLit(true);
      let count = 0, total = 14 + Math.floor(Math.random() * 10);
      const iv = setInterval(() => {
        setIdx(i => (i + 1) % SYMBOLS.length);
        if (++count >= total) { clearInterval(iv); setLit(false); timer = setTimeout(spin, 2000 + offset * 350 + Math.random() * 1500); }
      }, 80);
    };
    timer = setTimeout(spin, 600 + offset * 400);
    return () => clearTimeout(timer);
  }, [offset]);
  return (
    <div style={{ width: 68, height: 88, borderRadius: 14, flexShrink: 0, background: 'linear-gradient(180deg,#0A0220 0%,#1E0A46 100%)', border: lit ? '2px solid rgba(255,215,0,0.95)' : '2px solid rgba(255,215,0,0.3)', boxShadow: lit ? '0 0 28px rgba(255,215,0,0.55),inset 0 0 18px rgba(123,47,190,0.4)' : '0 0 8px rgba(255,215,0,0.08),inset 0 0 12px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, overflow: 'hidden', position: 'relative', transition: 'border-color .2s,box-shadow .2s' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,.65) 0%,transparent 28%,transparent 72%,rgba(0,0,0,.65) 100%)', zIndex: 2, pointerEvents: 'none' }} />
      <motion.span key={idx} initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.07 }} style={{ zIndex: 1, lineHeight: 1, userSelect: 'none' }}>
        {SYMBOLS[idx]}
      </motion.span>
    </div>
  );
}

function CountUp({ target }: { target: number }) {
  const [n, setN] = useState(Math.floor(target * .85));
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const s = Date.now(), from = Math.floor(target * .85), dur = 2200;
    const t = setInterval(() => {
      const p = Math.min((Date.now() - s) / dur, 1);
      setN(Math.floor(from + (target - from) * (1 - Math.pow(1 - p, 3))));
      if (p >= 1) { setN(target); clearInterval(t); }
    }, 16);
    return () => clearInterval(t);
  }, [inView, target]);
  useEffect(() => {
    const t = setInterval(() => setN(c => c + Math.floor(Math.random() * 80 + 20)), 1600);
    return () => clearInterval(t);
  }, []);
  return <span ref={ref}>{n.toLocaleString()}</span>;
}

const WINS = [
  { user: 'RajKumar99', av: '🦁', game: 'Maharaja Slots', amt: '245,000', color: '#FFD700' },
  { user: 'MughalMaster', av: '👑', game: 'Crash Rocket', amt: '89,200', color: '#00E5FF' },
  { user: 'DelhiDynasty', av: '💎', game: 'Diamond Mines', amt: '167,500', color: '#E91E8C' },
  { user: 'BombayBaller', av: '🔥', game: 'Maharaja Slots', amt: '512,000', color: '#FFD700' },
  { user: 'IndusKing', av: '🦅', game: 'Crash Rocket', amt: '278,400', color: '#00E5FF' },
  { user: 'SpiceKing99', av: '🌙', game: 'Maharaja Slots', amt: '1,200,000', color: '#FF6B1A' },
];

const GAMES = [
  { icon: '🎰', name: 'Maharaja Slots', desc: '5 reels · 20 paylines · Free spins', color: '#9333EA', badge: 'HOT' },
  { icon: '🚀', name: 'Crash Rocket', desc: 'Live multiplier · Cash out anytime', color: '#10B981', badge: 'LIVE' },
  { icon: '🃏', name: 'Royal Blackjack', desc: 'Beat the dealer · Double down', color: '#F59E0B', badge: 'NEW' },
  { icon: '💎', name: 'Diamond Mines', desc: '5×5 grid · Growing multiplier', color: '#06B6D4', badge: 'POPULAR' },
];

const TESTIMONIALS = [
  { user: 'RajKumar99', av: '🦁', vip: 'Diamond', stars: 5, text: 'Won 250K coins on Maharaja Slots! Graphics are insane, free spins are ridiculous.' },
  { user: 'DelhiDynasty', av: '💎', vip: 'Platinum', stars: 5, text: 'Cashed out at 45x on Crash. The adrenaline is REAL. Best fake casino on the internet.' },
  { user: 'MumbaiMaharaja', av: '🌙', vip: 'Gold', stars: 5, text: 'Mughal Cyber Palace theme is absolutely fire. Diamond Mines had me sweating every click.' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{ background: 'linear-gradient(155deg,#0D0520 0%,#110836 22%,#0A1A0F 48%,#1A0830 75%,#0D0520 100%)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(16px,4vw,44px)', background: scrolled ? 'rgba(13,5,32,.92)' : 'transparent', backdropFilter: scrolled ? 'blur(24px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,215,0,.12)' : 'none', transition: 'all .3s' }}>
        <div style={{ fontFamily: 'Cinzel Decorative,serif', fontWeight: 900, fontSize: 20, background: 'linear-gradient(135deg,#FFD700 0%,#FFF176 50%,#B8960C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GUPTA GAMES</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/auth/login">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }} style={{ padding: '9px 22px', borderRadius: 10, border: '1px solid rgba(255,215,0,.35)', background: 'rgba(255,215,0,.06)', color: '#FFD700', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Login</motion.button>
          </Link>
          <Link href="/auth/signup">
            <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,215,0,.45)' }} whileTap={{ scale: .95 }} style={{ padding: '9px 22px', borderRadius: 10, background: 'linear-gradient(135deg,#B8960C,#FFD700,#FFF176,#FFD700)', backgroundSize: '200% auto', color: '#1a1000', fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 14, cursor: 'pointer', border: 'none' }}>Sign Up Free</motion.button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '110px 20px 70px', overflow: 'hidden' }}>
        {/* Glowing orbs */}
        <div style={{ position: 'absolute', top: '0%', left: '-8%', width: '58%', height: '70%', background: 'radial-gradient(ellipse,rgba(147,51,234,.5) 0%,transparent 65%)', filter: 'blur(55px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '10%', right: '-8%', width: '48%', height: '60%', background: 'radial-gradient(ellipse,rgba(255,107,26,.32) 0%,transparent 65%)', filter: 'blur(55px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '0%', left: '20%', width: '55%', height: '50%', background: 'radial-gradient(ellipse,rgba(0,200,117,.28) 0%,transparent 65%)', filter: 'blur(55px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '35%', left: '35%', width: '35%', height: '45%', background: 'radial-gradient(ellipse,rgba(233,30,140,.22) 0%,transparent 65%)', filter: 'blur(45px)', pointerEvents: 'none' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,215,0,.07) 1px,transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />
        {/* Particles */}
        {[...Array(20)].map((_,i) => (
          <motion.div key={i} style={{ position: 'absolute', width: i%4===0?4:2, height: i%4===0?4:2, borderRadius: '50%', background: ['#FFD700','#00E5FF','#E91E8C','#00C875','#FF6B1A'][i%5], left: `${4+(i*4.8)%92}%`, top: `${8+(i*7.1)%84}%`, pointerEvents: 'none' }}
            animate={{ y:[0,-18,0], opacity:[.25,.9,.25], scale:[1,1.3,1] }} transition={{ duration:2.5+i*.35, repeat:Infinity, delay:i*.25 }} />
        ))}

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 880, width: '100%' }}>
          {/* Badge */}
          <motion.div initial={{ opacity:0,y:-20 }} animate={{ opacity:1,y:0 }} transition={{ delay:.1 }}
            style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 18px', borderRadius:100, background:'rgba(255,215,0,.1)', border:'1px solid rgba(255,215,0,.28)', marginBottom:32 }}>
            <span style={{ width:6,height:6,borderRadius:'50%',background:'#00C875',display:'inline-block',boxShadow:'0 0 8px #00C875' }} />
            <span style={{ fontFamily:'Syne,sans-serif',fontSize:12,color:'rgba(255,255,255,.65)',letterSpacing:'.15em' }}>10,000 FREE COINS ON SIGNUP</span>
          </motion.div>

          {/* Slot machine */}
          <motion.div initial={{ opacity:0,scale:.85 }} animate={{ opacity:1,scale:1 }} transition={{ delay:.2,type:'spring',stiffness:120 }}
            style={{ display:'flex',justifyContent:'center',marginBottom:38 }}>
            <div style={{ display:'flex',gap:10,alignItems:'center', background:'linear-gradient(135deg,rgba(80,20,160,.55),rgba(20,5,50,.85))', border:'2px solid rgba(255,215,0,.32)', borderRadius:22, padding:'14px 20px', boxShadow:'0 0 70px rgba(147,51,234,.35),0 0 130px rgba(255,215,0,.07)' }}>
              {[0,1,2,3,4].map(i => <SlotReel key={i} offset={i} />)}
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1 initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }} transition={{ delay:.3,duration:.7 }}
            style={{ fontFamily:'Cinzel Decorative,serif',fontSize:'clamp(50px,11vw,110px)',fontWeight:900,lineHeight:.92,marginBottom:20,letterSpacing:'-2px',background:'linear-gradient(135deg,#B8960C 0%,#FFD700 25%,#FFF9C4 50%,#FFD700 75%,#B8960C 100%)',backgroundSize:'250% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',animation:'shimmer 4s linear infinite' }}>
            GUPTA<br/>GAMES
          </motion.h1>

          <motion.p initial={{ opacity:0,y:15 }} animate={{ opacity:1,y:0 }} transition={{ delay:.45 }}
            style={{ fontFamily:'Syne,sans-serif',fontSize:'clamp(12px,2.5vw,17px)',color:'rgba(255,255,255,.42)',letterSpacing:'.5em',textTransform:'uppercase',marginBottom:16 }}>
            Play · Win · Reign
          </motion.p>

          <motion.p initial={{ opacity:0,y:15 }} animate={{ opacity:1,y:0 }} transition={{ delay:.55 }}
            style={{ fontFamily:'Syne,sans-serif',fontSize:16,color:'rgba(255,255,255,.48)',marginBottom:42,maxWidth:480,margin:'0 auto 42px',lineHeight:1.75 }}>
            Enter the Mughal Cyber Palace. 4 live games, instant play, and <span style={{ color:'#FFD700',fontWeight:700 }}>10,000 Gupta Coins</span> waiting for you.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:.65 }}
            style={{ display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',marginBottom:44 }}>
            <Link href="/auth/signup">
              <motion.button whileHover={{ scale:1.07,boxShadow:'0 0 70px rgba(255,215,0,.55),0 0 140px rgba(255,215,0,.2)' }} whileTap={{ scale:.95 }}
                style={{ padding:'17px 46px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#B8960C 0%,#FFD700 45%,#FFF176 65%,#FFD700 80%,#B8960C 100%)',backgroundSize:'200% auto',animation:'shimmer 3s linear infinite',color:'#1a1000',fontFamily:'Cinzel Decorative,serif',fontWeight:900,fontSize:18,cursor:'pointer',boxShadow:'0 0 35px rgba(255,215,0,.35)',letterSpacing:'.02em' }}>
                Play Now — Free 🎰
              </motion.button>
            </Link>
            <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:.96 }}
              onClick={() => document.getElementById('games')?.scrollIntoView({ behavior:'smooth' })}
              style={{ padding:'17px 32px',borderRadius:14,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.05)',color:'rgba(255,255,255,.7)',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:15,cursor:'pointer',backdropFilter:'blur(12px)' }}>
              See Games ↓
            </motion.button>
          </motion.div>

          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.8 }}
            style={{ display:'flex',justifyContent:'center',gap:24,flexWrap:'wrap' }}>
            {['✓ No real money','✓ 10,000 free coins','✓ Instant play','✓ 4 games live'].map(t => (
              <span key={t} style={{ fontFamily:'Syne,sans-serif',fontSize:13,color:'rgba(255,255,255,.28)' }}>{t}</span>
            ))}
          </motion.div>
        </div>
        <motion.div animate={{ y:[0,10,0] }} transition={{ repeat:Infinity,duration:2.2 }}
          style={{ position:'absolute',bottom:28,fontSize:22,color:'rgba(255,215,0,.32)',zIndex:2 }}>↓</motion.div>
      </section>

      {/* TICKER */}
      <div style={{ background:'linear-gradient(90deg,rgba(147,51,234,.18),rgba(255,107,26,.12),rgba(0,200,117,.12),rgba(147,51,234,.18))', borderTop:'1px solid rgba(255,215,0,.18)',borderBottom:'1px solid rgba(255,215,0,.18)',padding:'14px 0',overflow:'hidden' }}>
        <div style={{ display:'flex',alignItems:'center' }}>
          <div style={{ flexShrink:0,padding:'5px 20px',background:'rgba(255,215,0,.15)',borderRight:'1px solid rgba(255,215,0,.2)',marginRight:28,fontFamily:'Orbitron,sans-serif',fontSize:10,fontWeight:700,color:'#FFD700',letterSpacing:'.15em',whiteSpace:'nowrap' }}>🔴 LIVE WINS</div>
          <div className="marquee-container" style={{ flex:1 }}>
            <div className="marquee-content" style={{ gap:'0 64px' }}>
              {[...WINS,...WINS,...WINS].map((w,i) => (
                <span key={i} style={{ display:'inline-flex',alignItems:'center',gap:7,whiteSpace:'nowrap',fontFamily:'Syne,sans-serif',fontSize:13,color:'rgba(255,255,255,.6)' }}>
                  <span>{w.av}</span><strong style={{ color:'#fff' }}>{w.user}</strong><span>won</span>
                  <strong style={{ color:w.color,fontFamily:'Orbitron,sans-serif',fontSize:12 }}>🪙 {w.amt}</strong>
                  <span style={{ color:'rgba(255,255,255,.3)' }}>· {w.game}</span>
                  <span style={{ color:'rgba(255,255,255,.1)',marginLeft:10 }}>◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* JACKPOT */}
      <section style={{ padding:'90px 20px',textAlign:'center',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at center,rgba(255,215,0,.07) 0%,transparent 65%)',pointerEvents:'none' }} />
        <motion.div initial={{ opacity:0,y:40 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}>
          <div style={{ fontFamily:'Syne,sans-serif',fontSize:11,letterSpacing:'.4em',color:'rgba(255,215,0,.55)',textTransform:'uppercase',marginBottom:14 }}>PROGRESSIVE JACKPOT</div>
          <div style={{ fontFamily:'Orbitron,sans-serif',fontSize:'clamp(42px,9vw,88px)',fontWeight:900,color:'#FFD700',textShadow:'0 0 50px rgba(255,215,0,.7),0 0 100px rgba(255,215,0,.3)',lineHeight:1 }}>
            🪙 <CountUp target={10482750} />
          </div>
          <div style={{ fontFamily:'Syne,sans-serif',color:'rgba(255,255,255,.35)',marginTop:10,fontSize:15 }}>Gupta Coins waiting to be won</div>
        </motion.div>
      </section>

      {/* GAMES */}
      <section id="games" style={{ padding:'80px 20px',maxWidth:1120,margin:'0 auto' }}>
        <motion.div initial={{ opacity:0,y:30 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} style={{ textAlign:'center',marginBottom:56 }}>
          <h2 style={{ fontFamily:'Cinzel Decorative,serif',fontSize:'clamp(28px,5vw,52px)',color:'#fff',marginBottom:14,lineHeight:1.1 }}>
            4 Games. <span style={{ background:'linear-gradient(135deg,#FFD700,#FF6B1A)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>Infinite Thrills.</span>
          </h2>
          <p style={{ fontFamily:'Syne,sans-serif',color:'rgba(255,255,255,.38)',fontSize:16 }}>Each one built to keep you on the edge of your seat</p>
        </motion.div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:18 }}>
          {GAMES.map((g,i) => (
            <motion.div key={g.name} initial={{ opacity:0,y:50 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*.1 }}
              whileHover={{ y:-8,boxShadow:`0 24px 80px ${g.color}35` }}
              style={{ background:`linear-gradient(145deg,rgba(255,255,255,.05) 0%,${g.color}18 100%)`,border:`1px solid ${g.color}35`,borderRadius:22,padding:'28px 24px',position:'relative',overflow:'hidden',cursor:'pointer',transition:'box-shadow .3s' }}>
              <div style={{ position:'absolute',top:-24,right:-24,fontSize:96,opacity:.07,pointerEvents:'none',transform:'rotate(10deg)' }}>{g.icon}</div>
              <span style={{ display:'inline-block',padding:'3px 10px',borderRadius:100,background:`${g.color}25`,border:`1px solid ${g.color}50`,color:g.color,fontFamily:'Syne,sans-serif',fontSize:11,fontWeight:700,marginBottom:16 }}>{g.badge}</span>
              <div style={{ fontSize:52,marginBottom:14 }}>{g.icon}</div>
              <h3 style={{ fontFamily:'Cinzel Decorative,serif',fontSize:18,color:'#fff',marginBottom:8 }}>{g.name}</h3>
              <p style={{ fontFamily:'Syne,sans-serif',fontSize:13,color:'rgba(255,255,255,.4)',lineHeight:1.65,marginBottom:22 }}>{g.desc}</p>
              <Link href="/auth/signup">
                <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
                  style={{ padding:'9px 22px',borderRadius:10,background:`${g.color}22`,border:`1px solid ${g.color}55`,color:g.color,fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:13,cursor:'pointer' }}>
                  Play Now →
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding:'80px 20px',maxWidth:860,margin:'0 auto',textAlign:'center' }}>
        <motion.h2 initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          style={{ fontFamily:'Cinzel Decorative,serif',fontSize:'clamp(24px,4vw,42px)',color:'#fff',marginBottom:60,lineHeight:1.2 }}>
          Start in <span style={{ background:'linear-gradient(135deg,#FFD700,#FF6B1A)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>3 Seconds</span>
        </motion.h2>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:40 }}>
          {[{step:'01',icon:'✍️',title:'Sign Up',desc:'Free account — email + password, done.'},
            {step:'02',icon:'🪙',title:'Get 10K Coins',desc:'Instant 10,000 Gupta Coins on signup.'},
            {step:'03',icon:'🎰',title:'Play & Win',desc:'Spin, crash, deal, mine your way to riches.'}].map((s,i) => (
            <motion.div key={s.step} initial={{ opacity:0,y:30 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*.15 }}>
              <div style={{ fontFamily:'Orbitron,sans-serif',fontSize:11,color:'rgba(255,215,0,.4)',letterSpacing:'.2em',marginBottom:14 }}>{s.step}</div>
              <div style={{ fontSize:52,marginBottom:14 }}>{s.icon}</div>
              <h3 style={{ fontFamily:'Cinzel Decorative,serif',fontSize:20,color:'#FFD700',marginBottom:10 }}>{s.title}</h3>
              <p style={{ fontFamily:'Syne,sans-serif',fontSize:14,color:'rgba(255,255,255,.38)',lineHeight:1.7 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding:'80px 20px',maxWidth:1060,margin:'0 auto' }}>
        <motion.h2 initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          style={{ fontFamily:'Cinzel Decorative,serif',fontSize:'clamp(24px,4vw,42px)',color:'#fff',textAlign:'center',marginBottom:52 }}>Players Love It</motion.h2>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:18 }}>
          {TESTIMONIALS.map((t,i) => (
            <motion.div key={t.user} initial={{ opacity:0,scale:.93 }} whileInView={{ opacity:1,scale:1 }} viewport={{ once:true }} transition={{ delay:i*.1 }}
              style={{ background:'linear-gradient(145deg,rgba(255,255,255,.04),rgba(147,51,234,.08))',border:'1px solid rgba(255,255,255,.08)',borderRadius:18,padding:'26px 24px' }}>
              <div style={{ color:'#FFD700',fontSize:14,letterSpacing:3,marginBottom:14 }}>{'★'.repeat(t.stars)}</div>
              <p style={{ fontFamily:'Syne,sans-serif',fontSize:14,color:'rgba(255,255,255,.6)',lineHeight:1.75,marginBottom:22,fontStyle:'italic' }}>&ldquo;{t.text}&rdquo;</p>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <span style={{ fontSize:28 }}>{t.av}</span>
                <div>
                  <div style={{ fontFamily:'Syne,sans-serif',fontWeight:700,color:'#fff',fontSize:14 }}>{t.user}</div>
                  <div style={{ fontFamily:'Syne,sans-serif',fontSize:11,color:'#FFD700' }}>{t.vip} VIP</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding:'110px 20px',textAlign:'center',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at 30% 50%,rgba(147,51,234,.38) 0%,transparent 55%),radial-gradient(ellipse at 70% 50%,rgba(255,107,26,.22) 0%,transparent 55%)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(255,215,0,.07) 1px,transparent 1px)',backgroundSize:'32px 32px',pointerEvents:'none' }} />
        <motion.div initial={{ opacity:0,y:50 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} style={{ position:'relative',zIndex:1 }}>
          <motion.div animate={{ rotate:[0,10,-10,0],scale:[1,1.1,1] }} transition={{ repeat:Infinity,duration:4 }} style={{ fontSize:72,marginBottom:24,display:'inline-block' }}>👑</motion.div>
          <h2 style={{ fontFamily:'Cinzel Decorative,serif',fontSize:'clamp(30px,7vw,64px)',color:'#fff',marginBottom:18,lineHeight:1.1 }}>
            Your Throne<br /><span style={{ background:'linear-gradient(135deg,#FFD700,#FF6B1A)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>Awaits, Maharaja</span>
          </h2>
          <p style={{ fontFamily:'Syne,sans-serif',fontSize:18,color:'rgba(255,255,255,.4)',marginBottom:44 }}>Free to play. Forever. No real money ever.</p>
          <Link href="/auth/signup">
            <motion.button whileHover={{ scale:1.08,boxShadow:'0 0 80px rgba(255,215,0,.6),0 0 160px rgba(255,215,0,.25)' }} whileTap={{ scale:.95 }}
              style={{ padding:'22px 68px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#B8960C 0%,#FFD700 40%,#FFF9C4 60%,#FFD700 80%,#B8960C 100%)',backgroundSize:'200% auto',animation:'shimmer 3s linear infinite',color:'#1a1000',fontFamily:'Cinzel Decorative,serif',fontWeight:900,fontSize:22,cursor:'pointer',boxShadow:'0 0 50px rgba(255,215,0,.4)',letterSpacing:'.02em' }}>
              Claim 10,000 Coins Free 🪙
            </motion.button>
          </Link>
          <p style={{ marginTop:22,fontFamily:'Syne,sans-serif',fontSize:12,color:'rgba(255,255,255,.2)' }}>Play money only · Zero real money · Pure entertainment</p>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid rgba(255,215,0,.1)',padding:'36px 20px',textAlign:'center' }}>
        <div style={{ fontFamily:'Cinzel Decorative,serif',fontSize:16,background:'linear-gradient(135deg,#FFD700,#B8960C)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:10 }}>GUPTA GAMES</div>
        <p style={{ fontFamily:'Syne,sans-serif',fontSize:12,color:'rgba(255,255,255,.18)' }}>Gupta Coins have zero real-world monetary value · Play responsibly</p>
      </footer>
    </div>
  );
}
