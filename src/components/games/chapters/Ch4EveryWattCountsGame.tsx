import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  DoorOpen,
  Heart,
  Lock,
  Music,
  Play,
  RotateCcw,
  VolumeX,
  Zap,
} from 'lucide-react';
import { playChime } from '../../../utils/soundEffects.ts';
import { useGameMusic } from '../../../utils/gameMusic.ts';
import { ChapterGameShell } from './ChapterGameShell.tsx';

interface Ch4EveryWattCountsGameProps {
  onFinish: () => void;
}

type CharacterId = 'sathya' | 'maya';

interface PowerTargetBubble {
  id: number;
  x: number; // 0..100
  y: number; // 0..86
  vx: number;
  vy: number;
  size: 1 | 2 | 3; // 3=Large Surge, 2=Medium, 1=Small
}

interface PulseBeam {
  x: number;
  topY: number;
}

const POWER_CARDS = [
  {
    id: 'essential',
    title: '1. Essential Crew Systems',
    detail: 'Cabin air, heating, and medical systems stay LOCKED ON and protected.',
  },
  {
    id: 'reducible',
    title: '2. Reducible Habitat Loads',
    detail: 'Adjust lighting and heaters carefully within safe limits when dust hits.',
  },
  {
    id: 'optional',
    title: '3. Optional Experiments',
    detail: 'Pause extra equipment first to save every watt for the crew.',
  },
  {
    id: 'reserve',
    title: '4. Power Reserve Margin',
    detail: 'Keep backup energy ready until solar panels clear.',
  },
];

const RADIUS_BY_SIZE: Record<1 | 2 | 3, number> = {
  3: 6.0,
  2: 4.1,
  1: 2.7,
};

// Harder Bubble-Trouble style waves for Chapter 4
function spawnHardWave(wave: 1 | 2 | 3 | 4, nextId: () => number): PowerTargetBubble[] {
  if (wave === 1) {
    return [
      { id: nextId(), x: 25, y: 20, vx: 0.72, vy: 0, size: 3 },
      { id: nextId(), x: 74, y: 22, vx: -0.72, vy: -0.3, size: 3 },
    ];
  }
  if (wave === 2) {
    return [
      { id: nextId(), x: 20, y: 20, vx: 0.78, vy: 0, size: 3 },
      { id: nextId(), x: 50, y: 28, vx: 0.65, vy: -0.5, size: 2 },
      { id: nextId(), x: 80, y: 20, vx: -0.78, vy: -0.2, size: 3 },
    ];
  }
  if (wave === 3) {
    return [
      { id: nextId(), x: 22, y: 18, vx: 0.82, vy: 0, size: 3 },
      { id: nextId(), x: 52, y: 16, vx: -0.75, vy: -0.4, size: 3 },
      { id: nextId(), x: 78, y: 20, vx: -0.82, vy: -0.2, size: 3 },
    ];
  }
  return [
    { id: nextId(), x: 18, y: 18, vx: 0.88, vy: 0, size: 3 },
    { id: nextId(), x: 40, y: 28, vx: -0.78, vy: -0.4, size: 2 },
    { id: nextId(), x: 62, y: 28, vx: 0.78, vy: -0.4, size: 2 },
    { id: nextId(), x: 82, y: 18, vx: -0.88, vy: -0.2, size: 3 },
  ];
}

export function Ch4EveryWattCountsGame({ onFinish }: Ch4EveryWattCountsGameProps) {
  const [character, setCharacter] = useState<CharacterId>('sathya');
  const [phase, setPhase] = useState<'intro' | 'arena' | 'reflect' | 'complete'>('intro');

  const idRef = useRef(1);
  const getNextId = () => idRef.current++;

  const [wave, setWave] = useState<1 | 2 | 3 | 4>(1);
  const [hearts, setHearts] = useState(3);
  const [playerX, setPlayerX] = useState(50);
  const [bubbles, setBubbles] = useState<PowerTargetBubble[]>(() =>
    spawnHardWave(1, () => idRef.current++)
  );
  const [beam, setBeam] = useState<PulseBeam | null>(null);
  const [unlockedCards, setUnlockedCards] = useState<string[]>([]);
  const [knockout, setKnockout] = useState(false);
  const [pickedWhy, setPickedWhy] = useState('');
  const [reaction, setReaction] = useState(
    'Sathya: "Harder Power Surge Training! Split all 4 waves of overload targets while protecting Essential Crew Systems!"'
  );

  const { musicOn, startMusic, stopMusic, toggleMusic } = useGameMusic('bomberman');

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

  const charName = character === 'sathya' ? 'Sathya' : 'Maya';
  const charEmoji = character === 'sathya' ? '🧑‍🚀' : '👩‍🚀';
  const controlDoorOpen = unlockedCards.length === 4;

  const resetRound = useCallback((goToArena = true, customMsg?: string) => {
    setWave(1);
    setHearts(3);
    setPlayerX(50);
    setBubbles(spawnHardWave(1, getNextId));
    setBeam(null);
    setUnlockedCards([]);
    setKnockout(false);
    setPickedWhy('');
    setPhase(goToArena ? 'arena' : 'intro');
    setReaction(
      customMsg ||
        'Harder Level ready! Clear all 4 power-surge target waves and walk through the Power Control Door!'
    );
  }, []);

  const firePulse = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'arena' || s.knockout || s.beam || s.unlockedCards.length === 4) return;
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

  // Physics loop (30ms step — faster & harder than Ch3!)
  useEffect(() => {
    if (phase !== 'arena') return;
    const timer = window.setInterval(() => {
      const s = stateRef.current;
      if (s.knockout) return;

      let nextX = s.playerX + moveDirRef.current * 2.25;
      nextX = Math.max(7, Math.min(93, nextX));
      if (nextX !== s.playerX) setPlayerX(nextX);

      // Walk through open Power Control Door on right
      if (s.unlockedCards.length === 4 && nextX >= 84) {
        playChime('success');
        setPhase('reflect');
        setReaction(`${charName} reached the Power Control Station! Answer the final wattage check!`);
        return;
      }

      let nextBeam = s.beam ? { ...s.beam, topY: s.beam.topY - 4.0 } : null;
      if (nextBeam && nextBeam.topY <= 4) {
        nextBeam = null;
      }

      let hitTarget = false;
      const nextBubbles: PowerTargetBubble[] = [];

      for (const b of s.bubbles) {
        let bx = b.x + b.vx;
        let by = b.y + b.vy;
        let bvx = b.vx;
        let bvy = b.vy + 0.095;

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
          bvy = b.size === 3 ? -2.55 : b.size === 2 ? -2.2 : -1.85;
        }
        if (by - rad < 6) {
          by = 6 + rad;
          bvy = Math.abs(bvy);
        }

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
            const speedBoost = smallerSize === 2 ? 0.88 : 1.05;
            nextBubbles.push(
              { id: getNextId(), x: Math.max(8, bx - 3), y: by, vx: -speedBoost, vy: -1.75, size: smallerSize },
              { id: getNextId(), x: Math.min(92, bx + 3), y: by, vx: speedBoost, vy: -1.75, size: smallerSize }
            );
          }
          continue;
        }

        nextBubbles.push({ ...b, x: bx, y: by, vx: bvx, vy: bvy });
      }

      setBeam(nextBeam);
      setBubbles(nextBubbles);

      const touched = nextBubbles.some((b) => {
        const rad = RADIUS_BY_SIZE[b.size];
        return Math.abs(b.x - nextX) < rad + 2.7 && b.y + rad > 79;
      });

      if (touched) {
        playChime('gentle');
        setKnockout(true);
        const remainingHearts = s.hearts - 1;
        setHearts(remainingHearts);
        window.setTimeout(() => {
          if (remainingHearts <= 0) {
            resetRound(true, `${charName} used all 3 hearts! Restarting Power Surge Wave 1 cleanly!`);
          } else {
            setKnockout(false);
            setPlayerX(50);
            setBeam(null);
            setReaction(`Zap! ${remainingHearts} ${remainingHearts === 1 ? 'heart' : 'hearts'} left—stay quick!`);
          }
        }, 760);
        return;
      }

      if (nextBubbles.length === 0 && s.unlockedCards.length < 4) {
        const unlockedIndex = s.unlockedCards.length;
        const card = POWER_CARDS[unlockedIndex];
        const nextCards = [...s.unlockedCards, card.id];
        setUnlockedCards(nextCards);
        playChime('success');

        if (nextCards.length < 4) {
          const nextWaveNum = (s.wave + 1) as 2 | 3 | 4;
          setWave(nextWaveNum);
          setBubbles(spawnHardWave(nextWaveNum, getNextId));
          setReaction(`Unlocked "${card.title}"! Harder Wave ${nextWaveNum} incoming!`);
        } else {
          setReaction('All 4 Power Cards unlocked! Enter the glowing Control Door on the right!');
        }
      }
    }, 30);

    return () => window.clearInterval(timer);
  }, [charName, phase, resetRound]);

  const handleReflection = (id: string) => {
    playChime('button');
    setPickedWhy(id);
    if (id === 'correct') {
      playChime('success');
      stopMusic();
      setPhase('complete');
      setReaction('Sathya & Maya: "Awesome power planning! Essential crew systems are always protected!"');
      onFinish();
    } else {
      playChime('gentle');
      setReaction('Remember: crew air and cabin warmth keep astronauts alive—we pause optional tasks instead!');
    }
  };

  return (
    <ChapterGameShell
      instruction="Clear all 4 power-surge waves, protect crew systems, and reach the control door!"
      reaction={reaction}
    >
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500">Train as:</span>
          {(['sathya', 'maya'] as const).map((id) => (
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
              {id === 'sathya' ? '🧑‍🚀 Sathya' : '👩‍🚀 Maya'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800">
          <span className="inline-flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            Essential Crew Systems: LOCKED ON
          </span>
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
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="font-mono-tabular text-sky-800">
            Cards: {unlockedCards.length} / 4
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
              <p className="text-xs font-bold text-amber-300 mb-0.5">
                Harder Arcade Challenge · Power Surge Simulator
              </p>
              <h2 className="text-xl font-extrabold">Every Watt Counts — Bubble Surge</h2>
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
              Start Challenge!
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-lime-300 text-sm">1. Faster Multi-Target Waves</p>
              <p className="text-slate-200">
                Move left/right and shoot upward pulses (Space or Pulse button) across 4 increasingly intense waves!
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-sky-300 text-sm">2. Unlock All 4 Power Rules</p>
              <p className="text-slate-200">
                Each cleared wave unlocks a key habitat power card while Essential Crew Systems stay safely protected.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-amber-300 text-sm">3. Enter Power Control Door</p>
              <p className="text-slate-200">
                Guard your 3 hearts! Once Wave 4 clears, walk through the Control Door on the right to finish.
              </p>
            </div>
          </div>
        </div>
      ) : phase === 'arena' ? (
        <div className="space-y-2.5">
          {/* Arena */}
          <div className="relative rounded-2xl bg-slate-950 border-2 border-slate-800 h-[255px] sm:h-[275px] overflow-hidden select-none">
            <span className="absolute top-2.5 left-3 text-[11px] font-bold text-amber-300">
              Power Training Bay · Harder Wave {wave} of 4
            </span>

            {/* Control Door on Right Wall */}
            <div
              className={`absolute right-2 bottom-4 w-16 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                controlDoorOpen
                  ? 'bg-emerald-500/25 border-lime-300 text-lime-300 animate-pulse'
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
            >
              {controlDoorOpen ? <DoorOpen className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
              <span className="text-[10px] font-extrabold text-center leading-tight">
                {controlDoorOpen ? 'CONTROL DOOR' : 'LOCKED'}
              </span>
            </div>

            {beam && (
              <div
                style={{ left: `${beam.x}%`, top: `${beam.topY}%` }}
                className="absolute bottom-6 w-1.5 -translate-x-1/2 bg-gradient-to-t from-amber-400 via-lime-300 to-white rounded-full"
              />
            )}

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
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/95 border-2 border-white flex items-center justify-center shadow-md"
                >
                  <span className="text-[9px] font-extrabold text-slate-950 leading-none text-center">
                    ⚡Surge
                  </span>
                </div>
              );
            })}

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
              className="min-h-[44px] rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-extrabold inline-flex items-center justify-center gap-1.5 text-sm"
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

          {/* 4 Power Rule Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {POWER_CARDS.map((card) => {
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
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="text-base font-extrabold text-slate-900">
            Control Door Reached! Why do Essential Crew Systems stay protected when power drops?
          </h3>
          {[
            {
              id: 'wrong',
              label: 'Because turning off crew air would give bonus points.',
            },
            {
              id: 'correct',
              label: 'Because astronauts depend on life support and cabin heat to stay safe, so we pause optional experiments instead!',
            },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={phase === 'complete'}
              onClick={() => handleReflection(opt.id)}
              className={`w-full min-h-[48px] px-4 py-2.5 rounded-xl border text-left text-sm font-bold flex items-center justify-between gap-2 ${
                pickedWhy === opt.id && opt.id === 'correct'
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
