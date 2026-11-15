import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  DoorOpen,
  Heart,
  Info,
  Music,
  Play,
  RotateCcw,
  Shield,
  VolumeX,
  Zap,
} from 'lucide-react';
import { playChime } from '../../../utils/soundEffects.ts';
import { useGameMusic } from '../../../utils/gameMusic.ts';
import { ChapterGameShell } from './ChapterGameShell.tsx';

interface Ch3SolarAlertGameProps {
  onFinish: () => void;
}

type CharacterId = 'maya' | 'sathya';

interface TrainingBubble {
  id: number;
  x: number; // 0..100 (%)
  y: number; // 0..85 (%)
  vx: number;
  vy: number;
  size: 1 | 2 | 3; // 3=Large, 2=Medium, 1=Small
}

interface PulseBeam {
  x: number;
  topY: number; // moves from 88 upward to 0
}

const INFO_CARDS = [
  {
    id: 'solar-alert',
    title: '1. Solar Alert',
    detail: 'Forecast from space weather monitors warning that solar particles are approaching Mars.',
  },
  {
    id: 'habitat-monitor',
    title: '2. Habitat Radiation Monitor',
    detail: 'Indoor wall sensor checking whether habitat shielding keeps inside spaces protected.',
  },
  {
    id: 'personal-dosimeter',
    title: '3. Personal Dosimeter',
    detail: 'Small clip-on badge measuring each astronaut’s own personal radiation dose over time.',
  },
];

const RADIUS_BY_SIZE: Record<1 | 2 | 3, number> = {
  3: 6.2,
  2: 4.3,
  1: 2.9,
};

function spawnWave(wave: 1 | 2 | 3, nextId: () => number): TrainingBubble[] {
  if (wave === 1) {
    return [{ id: nextId(), x: 50, y: 24, vx: 0.48, vy: 0, size: 3 }];
  }
  if (wave === 2) {
    return [
      { id: nextId(), x: 30, y: 22, vx: 0.55, vy: 0, size: 3 },
      { id: nextId(), x: 70, y: 30, vx: -0.5, vy: -0.4, size: 2 },
    ];
  }
  return [
    { id: nextId(), x: 25, y: 20, vx: 0.62, vy: 0, size: 3 },
    { id: nextId(), x: 72, y: 24, vx: -0.58, vy: -0.3, size: 3 },
  ];
}

export function Ch3SolarAlertGame({ onFinish }: Ch3SolarAlertGameProps) {
  const [character, setCharacter] = useState<CharacterId>('maya');
  const [phase, setPhase] = useState<'intro' | 'arena' | 'check' | 'complete'>('intro');

  const idRef = useRef(1);
  const getNextId = () => idRef.current++;

  const [wave, setWave] = useState<1 | 2 | 3>(1);
  const [hearts, setHearts] = useState(3);
  const [playerX, setPlayerX] = useState(50);
  const [bubbles, setBubbles] = useState<TrainingBubble[]>(() => spawnWave(1, () => idRef.current++));
  const [beam, setBeam] = useState<PulseBeam | null>(null);
  const [unlockedCards, setUnlockedCards] = useState<string[]>([]);
  const [knockout, setKnockout] = useState(false);
  const [pickedDistinction, setPickedDistinction] = useState<string>('');
  const [reaction, setReaction] = useState(
    'Clear training target bubbles with upward pulses to unlock all 3 monitoring cards, then walk into the Shelter Door!'
  );

  const moveDirRef = useRef<-1 | 0 | 1>(0);
  const stateRef = useRef({
    phase,
    wave,
    hearts,
    playerX,
    bubbles,
    beam,
    unlockedCards,
    knockout,
  });
  stateRef.current = {
    phase,
    wave,
    hearts,
    playerX,
    bubbles,
    beam,
    unlockedCards,
    knockout,
  };

  const charName = character === 'maya' ? 'Maya' : 'Sathya';
  const charEmoji = character === 'maya' ? '👩‍🚀' : '🧑‍🚀';
  const shelterOpen = unlockedCards.length === 3;
  const { musicOn, startMusic, stopMusic, toggleMusic } = useGameMusic('bomberman');

  const resetRound = useCallback((goToArena = true, customMsg?: string) => {
    setWave(1);
    setHearts(3);
    setPlayerX(50);
    setBubbles(spawnWave(1, getNextId));
    setBeam(null);
    setUnlockedCards([]);
    setKnockout(false);
    setPickedDistinction('');
    setPhase(goToArena ? 'arena' : 'intro');
    setReaction(
      customMsg ||
        'Training round ready! Dodge training targets, launch upward pulses, and collect all 3 cards!'
    );
  }, []);

  const firePulse = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'arena' || s.knockout || s.beam || s.unlockedCards.length === 3) return;
    playChime('pop');
    setBeam({ x: s.playerX, topY: 84 });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (stateRef.current.phase !== 'arena') return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        e.preventDefault();
        moveDirRef.current = -1;
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        e.preventDefault();
        moveDirRef.current = 1;
      } else if (e.key === ' ') {
        e.preventDefault();
        firePulse();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'ArrowRight' || e.key === 'd') {
        moveDirRef.current = 0;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [firePulse]);

  // Physics loop (smooth 33ms step)
  useEffect(() => {
    if (phase !== 'arena') return;
    const timer = window.setInterval(() => {
      const s = stateRef.current;
      if (s.knockout) return;

      // Move character
      let nextX = s.playerX + moveDirRef.current * 2.1;
      nextX = Math.max(7, Math.min(93, nextX));
      if (nextX !== s.playerX) setPlayerX(nextX);

      // If shelter door is open, check entry on right side (x >= 84)
      if (s.unlockedCards.length === 3 && nextX >= 84) {
        playChime('success');
        setPhase('check');
        setReaction(`${charName} safely entered the shielded Shelter Door! Complete the quick check below!`);
        return;
      }

      // Advance upward pulse beam
      let nextBeam = s.beam ? { ...s.beam, topY: s.beam.topY - 3.6 } : null;
      if (nextBeam && nextBeam.topY <= 4) {
        nextBeam = null;
      }

      // Update bouncing bubbles + check beam collision
      let hitTarget = false;
      const nextBubbles: TrainingBubble[] = [];

      for (const b of s.bubbles) {
        let bx = b.x + b.vx;
        let by = b.y + b.vy;
        let bvx = b.vx;
        let bvy = b.vy + 0.085; // gentle gravity

        const rad = RADIUS_BY_SIZE[b.size];
        if (bx - rad < 3) {
          bx = 3 + rad;
          bvx = Math.abs(bvx);
        } else if (bx + rad > 97) {
          bx = 97 - rad;
          bvx = -Math.abs(bvx);
        }

        if (by + rad >= 90) {
          by = 90 - rad;
          // Bounce height scales with bubble size cleanly
          bvy = b.size === 3 ? -2.35 : b.size === 2 ? -2.05 : -1.75;
        }
        if (by - rad < 6) {
          by = 6 + rad;
          bvy = Math.abs(bvy);
        }

        // Check pulse beam hit (vertical line from nextBeam.topY to 90 at nextBeam.x)
        if (
          nextBeam &&
          !hitTarget &&
          Math.abs(bx - nextBeam.x) <= rad + 1.8 &&
          by + rad >= nextBeam.topY
        ) {
          hitTarget = true;
          nextBeam = null;
          playChime('star');
          if (b.size > 1) {
            const smallerSize = (b.size - 1) as 1 | 2;
            const speedBoost = smallerSize === 2 ? 0.68 : 0.85;
            nextBubbles.push(
              { id: getNextId(), x: Math.max(8, bx - 3), y: by, vx: -speedBoost, vy: -1.6, size: smallerSize },
              { id: getNextId(), x: Math.min(92, bx + 3), y: by, vx: speedBoost, vy: -1.6, size: smallerSize }
            );
          }
          continue;
        }

        nextBubbles.push({ ...b, x: bx, y: by, vx: bvx, vy: bvy });
      }

      setBeam(nextBeam);
      setBubbles(nextBubbles);

      // Check player collision with any training bubble (player sits around y=82..91, width +/-4)
      const touched = nextBubbles.some((b) => {
        const rad = RADIUS_BY_SIZE[b.size];
        return Math.abs(b.x - nextX) < rad + 2.8 && b.y + rad > 79;
      });

      if (touched) {
        playChime('gentle');
        setKnockout(true);
        const remainingHearts = s.hearts - 1;
        setHearts(remainingHearts);
        window.setTimeout(() => {
          if (remainingHearts <= 0) {
            resetRound(true, `${charName} used all 3 hearts! Training round restarted cleanly!`);
          } else {
            setKnockout(false);
            setPlayerX(50);
            setBeam(null);
            setReaction(`Cartoon bonk! ${remainingHearts} ${remainingHearts === 1 ? 'heart' : 'hearts'} left—keep dodging!`);
          }
        }, 780);
        return;
      }

      // Check Wave cleared
      if (nextBubbles.length === 0 && s.unlockedCards.length < 3) {
        const unlockedIndex = s.unlockedCards.length;
        const card = INFO_CARDS[unlockedIndex];
        const nextCards = [...s.unlockedCards, card.id];
        setUnlockedCards(nextCards);
        playChime('success');

        if (nextCards.length < 3) {
          const nextWaveNum = (s.wave + 1) as 2 | 3;
          setWave(nextWaveNum);
          setBubbles(spawnWave(nextWaveNum, getNextId));
          setReaction(`Unlocked "${card.title}"! Group ${nextWaveNum} training targets arriving!`);
        } else {
          setReaction('All 3 Monitoring Cards collected! The Shelter Door on the right is OPEN—walk inside!');
        }
      }
    }, 33);

    return () => window.clearInterval(timer);
  }, [charName, phase, resetRound]);

  const handleConfirmDistinction = (id: string) => {
    playChime('button');
    setPickedDistinction(id);
    if (id === 'correct') {
      playChime('success');
      stopMusic();
      setPhase('complete');
      setReaction('Elena & Maya: "Exactly right! Follow monitoring alerts and enter the shelter cleanly!"');
      onFinish();
    } else {
      playChime('gentle');
      setReaction('Remember: a Solar Alert warns about incoming Sun activity, while a Personal Dosimeter measures one astronaut’s own dose!');
    }
  };

  return (
    <ChapterGameShell
      instruction="Clear the training targets, collect the information, and reach the shelter!"
      reaction={reaction}
    >
      {/* Prominent Scientific Safety Reminder */}
      <div className="rounded-xl bg-amber-50 border border-amber-300 px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-amber-950">
        <Info className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          Real radiation cannot be seen or shot away. Follow monitoring and shelter procedures.
        </span>
      </div>

      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500">Train as:</span>
          {(['maya', 'sathya'] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                playChime('button');
                setCharacter(id);
              }}
              className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
                character === id
                  ? 'bg-slate-900 text-lime-300 border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              {id === 'maya' ? '👩‍🚀 Maya' : '🧑‍🚀 Sathya'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1" aria-label={`Hearts: ${hearts} of 3`}>
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              className={`w-5 h-5 ${
                i < hearts ? 'fill-rose-500 text-rose-600' : 'text-slate-300'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="font-mono-tabular text-sky-800">
            Info Cards: {unlockedCards.length} / 3
          </span>
          <button
            type="button"
            onClick={toggleMusic}
            className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700"
          >
            {musicOn ? <VolumeX className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5" />}
            {musicOn ? 'Mute' : 'Music'}
          </button>
          <button
            type="button"
            onClick={() => {
              playChime('button');
              resetRound(true);
            }}
            className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart
          </button>
        </div>
      </div>

      {phase === 'intro' ? (
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <p className="text-xs font-bold text-lime-300 mb-0.5">Fictional Mission-Training Simulation</p>
              <h2 className="text-xl font-extrabold">Solar Alert — Bubble Trouble</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                playChime('pop');
                startMusic();
                setPhase('arena');
              }}
              className="min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-lime-300 hover:bg-lime-200 text-slate-950 text-sm font-extrabold"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Training!
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-lime-300 text-sm">1. Split Training Targets</p>
              <p className="text-slate-200">
                Move left/right and tap Pulse (or Space) to split bouncing Training Targets until they clear.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-sky-300 text-sm">2. Unlock 3 Info Cards</p>
              <p className="text-slate-200">
                Each cleared group unlocks a monitoring card: Solar Alert, Habitat Monitor, and Personal Dosimeter.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-amber-300 text-sm">3. Enter Shelter Door</p>
              <p className="text-slate-200">
                Dodge targets to protect your 3 hearts, then walk through the glowing Shelter Door once all 3 cards unlock!
              </p>
            </div>
          </div>
        </div>
      ) : phase === 'arena' ? (
        <div className="space-y-2.5">
          {/* Mission-Training Room Arena */}
          <div className="relative rounded-2xl bg-slate-950 border-2 border-slate-800 h-[250px] sm:h-[270px] overflow-hidden select-none">
            {/* Training Room Backdrop Label */}
            <span className="absolute top-3 left-3 text-[11px] font-bold text-slate-400">
              Mission-Training Room · Targets Wave {wave} of 3
            </span>

            {/* Shelter Door on Right Wall */}
            <div
              className={`absolute right-2 bottom-4 w-16 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                shelterOpen
                  ? 'bg-emerald-500/25 border-lime-300 text-lime-300 animate-pulse'
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
            >
              {shelterOpen ? <DoorOpen className="w-7 h-7" /> : <Shield className="w-6 h-6" />}
              <span className="text-[10px] font-extrabold text-center leading-tight">
                {shelterOpen ? 'ENTER SHELTER' : 'LOCKED'}
              </span>
            </div>

            {/* Upward Pulse Beam */}
            {beam && (
              <div
                style={{ left: `${beam.x}%`, top: `${beam.topY}%` }}
                className="absolute bottom-6 w-1.5 -translate-x-1/2 bg-gradient-to-t from-sky-400 via-lime-300 to-white rounded-full"
              />
            )}

            {/* Bouncing Training Target Bubbles */}
            {bubbles.map((b) => {
              const radPct = RADIUS_BY_SIZE[b.size];
              return (
                <div
                  key={b.id}
                  style={{
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    width: `${radPct * 2}%`,
                    aspectRatio: '1 / 1',
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/90 border-2 border-white flex items-center justify-center shadow-md"
                >
                  <span className="text-[9px] font-extrabold text-slate-950 leading-none text-center px-0.5">
                    Target
                  </span>
                </div>
              );
            })}

            {/* Player Character */}
            <div
              style={{ left: `${playerX}%` }}
              className="absolute bottom-3 -translate-x-1/2 flex flex-col items-center"
            >
              <span className="text-3xl leading-none" aria-hidden="true">
                {knockout ? '💫' : charEmoji}
              </span>
              <span className="text-[10px] font-extrabold text-lime-300 bg-slate-900/90 px-1.5 rounded">
                {charName}
              </span>
            </div>

            {/* Floor Line */}
            <div className="absolute bottom-0 inset-x-0 h-3 bg-slate-800 border-t border-slate-700" />
          </div>

          {/* Touch Controls */}
          <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto">
            <button
              type="button"
              onPointerDown={() => { moveDirRef.current = -1; }}
              onPointerUp={() => { moveDirRef.current = 0; }}
              onPointerLeave={() => { moveDirRef.current = 0; }}
              className="min-h-[44px] rounded-xl bg-slate-900 active:bg-slate-800 text-lime-300 font-extrabold inline-flex items-center justify-center gap-1.5 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Left
            </button>
            <button
              type="button"
              onClick={firePulse}
              className="min-h-[44px] rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 font-extrabold inline-flex items-center justify-center gap-1.5 text-sm"
            >
              <Zap className="w-4 h-4" />
              Pulse
            </button>
            <button
              type="button"
              onPointerDown={() => { moveDirRef.current = 1; }}
              onPointerUp={() => { moveDirRef.current = 0; }}
              onPointerLeave={() => { moveDirRef.current = 0; }}
              className="min-h-[44px] rounded-xl bg-slate-900 active:bg-slate-800 text-lime-300 font-extrabold inline-flex items-center justify-center gap-1.5 text-sm"
            >
              Right
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Unlocked Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {INFO_CARDS.map((card) => {
              const unlocked = unlockedCards.includes(card.id);
              return (
                <div
                  key={card.id}
                  className={`p-2.5 rounded-xl border text-[11px] ${
                    unlocked
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <p className="font-extrabold">{card.title}</p>
                  <p className="leading-snug mt-0.5">{unlocked ? card.detail : 'Clear wave to unlock...'}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Expected Output Check: Distinguish Solar Alert vs Personal Dose Reading */
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="text-base font-extrabold text-slate-900">
            Final Training Check: What is the difference between a Solar Alert and a Personal Dosimeter?
          </h3>
          {[
            {
              id: 'wrong-1',
              label: 'A Solar Alert shoots bubbles away while a Dosimeter changes the Sun.',
            },
            {
              id: 'correct',
              label: 'A Solar Alert warns the whole crew about incoming Sun particles, a Personal Dosimeter tracks each person’s dose, and we move into the Shielded Shelter when instructed.',
            },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={phase === 'complete'}
              onClick={() => handleConfirmDistinction(opt.id)}
              className={`w-full min-h-[52px] px-4 py-3 rounded-xl border text-left text-sm font-bold flex items-center justify-between gap-2 ${
                pickedDistinction === opt.id && opt.id === 'correct'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  : 'bg-white border-slate-200 hover:border-slate-900 text-slate-900'
              }`}
            >
              <span>{opt.label}</span>
              {phase === 'complete' && opt.id === 'correct' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </ChapterGameShell>
  );
}
