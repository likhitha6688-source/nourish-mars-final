import { useEffect, useState } from 'react';
import {
  BatteryCharging,
  CheckCircle2,
  Clock,
  CloudLightning,
  Droplets,
  HelpCircle,
  Home,
  Moon,
  Music,
  Play,
  Radio,
  RotateCcw,
  ShieldCheck,
  Users,
  VolumeX,
} from 'lucide-react';
import { playChime } from '../../../utils/soundEffects.ts';
import { useGameMusic } from '../../../utils/gameMusic.ts';
import { ChapterGameShell } from './ChapterGameShell.tsx';

interface Ch8StormTeamGameProps {
  onFinish: () => void;
}

interface WordPuzzle {
  id: string;
  answer: string;
  tiles: string[];
  question: string;
  habitatPart: string;
  Icon: typeof BatteryCharging;
}

interface BankTile {
  uid: number;
  letter: string;
}

const WORDS: WordPuzzle[] = [
  {
    id: 'power',
    answer: 'POWER',
    tiles: ['W', 'O', 'R', 'P', 'E'],
    question: 'Clue Question: What electrical energy must the crew save when dust dims the solar panels?',
    habitatPart: 'Solar & Battery Hub',
    Icon: BatteryCharging,
  },
  {
    id: 'water',
    answer: 'WATER',
    tiles: ['T', 'A', 'R', 'E', 'W'],
    question: 'Clue Question: What vital liquid must the greenhouse pump keep flowing to the plant roots?',
    habitatPart: 'Hydroponic Loop',
    Icon: Droplets,
  },
  {
    id: 'safety',
    answer: 'SAFETY',
    tiles: ['F', 'A', 'S', 'Y', 'T', 'E'],
    question: 'Clue Question: What always comes first before doing any optional science work?',
    habitatPart: 'Airlock Shield Wall',
    Icon: ShieldCheck,
  },
  {
    id: 'team',
    answer: 'TEAM',
    tiles: ['M', 'A', 'E', 'T'],
    question: 'Clue Question: What do Maya, Sathya, Elena, and Reyes become by working together?',
    habitatPart: 'Central Crew Bay',
    Icon: Users,
  },
  {
    id: 'rest',
    answer: 'REST',
    tiles: ['S', 'E', 'T', 'R'],
    question: 'Clue Question: What does Maya need to get while Elena takes over the night watch?',
    habitatPart: 'Crew Bunk Quarters',
    Icon: Moon,
  },
  {
    id: 'signal',
    answer: 'SIGNAL',
    tiles: ['G', 'I', 'N', 'L', 'A', 'S'],
    question: 'Clue Question: What radio message takes many minutes to travel between Mars and Earth?',
    habitatPart: 'Deep-Space Dish',
    Icon: Radio,
  },
  {
    id: 'storm',
    answer: 'STORM',
    tiles: ['M', 'O', 'T', 'R', 'S'],
    question: 'Clue Question: What swirling Mars dust weather darkens the sky outside the domes?',
    habitatPart: 'Weather Sensor Mast',
    Icon: CloudLightning,
  },
  {
    id: 'shelter',
    answer: 'SHELTER',
    tiles: ['L', 'E', 'S', 'H', 'R', 'T', 'E'],
    question: 'Clue Question: What strong protective dome keeps astronauts out of danger in bad weather?',
    habitatPart: 'Protected Base Core',
    Icon: Home,
  },
];

function makeInitialBank(tiles: string[]): BankTile[] {
  return tiles.map((letter, idx) => ({ uid: idx + 1, letter }));
}

function HabitatStormIllustration({ solvedIds }: { solvedIds: string[] }) {
  const lit = (id: string) => solvedIds.includes(id);

  return (
    <svg viewBox="0 0 420 210" className="w-full h-auto rounded-xl bg-slate-950 border border-slate-800">
      {/* Swirling Dust Storm Sky */}
      <rect width="420" height="210" fill={lit('storm') ? '#2A1810' : '#1E1410'} />
      <path d="M20 30 Q120 14 220 34 T400 24" stroke={lit('storm') ? '#EA580C' : '#9A3412'} strokeWidth="3" fill="none" opacity="0.65" />
      <path d="M35 58 Q160 42 270 62 T405 50" stroke={lit('storm') ? '#F97316' : '#C2410C'} strokeWidth="2.5" fill="none" opacity="0.55" />
      {/* Weather mast (lights on STORM) */}
      <line x1="65" y1="118" x2="65" y2="74" stroke="#94A3B8" strokeWidth="3" />
      <circle cx="65" cy="70" r="6" fill={lit('storm') ? '#FB923C' : '#475569'} />
      <text x="65" y="60" textAnchor="middle" fill={lit('storm') ? '#FED7AA' : '#64748B'} fontSize="8" fontWeight="800">
        {lit('storm') ? 'STORM' : '???'}
      </text>

      {/* Mars Horizon */}
      <path d="M0 168 Q140 156 280 166 T420 162 V210 H0 Z" fill="#431407" />

      {/* Left Solar & Battery Hub */}
      <rect
        x="22"
        y="118"
        width="64"
        height="46"
        rx="8"
        fill={lit('power') ? '#FACC15' : '#334155'}
        stroke={lit('power') ? '#FEF08A' : '#475569'}
        strokeWidth="2.5"
      />
      <text x="54" y="145" textAnchor="middle" fill={lit('power') ? '#0F172A' : '#94A3B8'} fontSize="10" fontWeight="800">
        {lit('power') ? 'POWER' : '???'}
      </text>

      {/* Outer Protective Dome Shell (SAFETY + SHELTER) */}
      <path
        d="M102 166 C102 82 310 82 310 166 Z"
        fill={lit('shelter') ? '#0F172A' : '#1E293B'}
        stroke={lit('safety') ? '#34D399' : '#475569'}
        strokeWidth="4"
      />
      <text x="206" y="96" textAnchor="middle" fill={lit('shelter') ? '#A7F3D0' : '#64748B'} fontSize="9" fontWeight="800">
        {lit('shelter') ? 'SHELTER' : lit('safety') ? 'SAFETY' : '???'}
      </text>

      {/* Greenhouse Hydro-Bay */}
      <rect
        x="114"
        y="120"
        width="56"
        height="42"
        rx="6"
        fill={lit('water') ? '#0284C7' : '#334155'}
      />
      <text x="142" y="145" textAnchor="middle" fill={lit('water') ? '#E0F2FE' : '#94A3B8'} fontSize="9" fontWeight="800">
        {lit('water') ? 'WATER' : '???'}
      </text>

      {/* Central Crew Bay */}
      <rect
        x="177"
        y="110"
        width="58"
        height="52"
        rx="6"
        fill={lit('team') ? '#F59E0B' : '#334155'}
      />
      <text x="206" y="140" textAnchor="middle" fill={lit('team') ? '#0F172A' : '#94A3B8'} fontSize="10" fontWeight="800">
        {lit('team') ? 'TEAM' : '???'}
      </text>

      {/* Right Crew Bunk Quarters */}
      <rect
        x="242"
        y="120"
        width="54"
        height="42"
        rx="6"
        fill={lit('rest') ? '#818CF8' : '#334155'}
      />
      <text x="269" y="145" textAnchor="middle" fill={lit('rest') ? '#EEF2FF' : '#94A3B8'} fontSize="9" fontWeight="800">
        {lit('rest') ? 'REST' : '???'}
      </text>

      {/* Comms Dish & Beam */}
      <line x1="360" y1="166" x2="360" y2="106" stroke="#94A3B8" strokeWidth="4" />
      <path d="M340 104 Q360 86 380 104" fill={lit('signal') ? '#38BDF8' : '#475569'} stroke="#E2E8F0" strokeWidth="2" />
      {lit('signal') && (
        <>
          <path d="M370 80 Q384 72 390 86" stroke="#7DD3FC" strokeWidth="2.5" fill="none" />
          <path d="M376 68 Q398 58 406 78" stroke="#38BDF8" strokeWidth="2.5" fill="none" />
        </>
      )}
      <text x="360" y="186" textAnchor="middle" fill={lit('signal') ? '#7DD3FC' : '#94A3B8'} fontSize="9" fontWeight="800">
        {lit('signal') ? 'SIGNAL' : '???'}
      </text>
    </svg>
  );
}

export function Ch8StormTeamGame({ onFinish }: Ch8StormTeamGameProps) {
  const [phase, setPhase] = useState<'intro' | 'play' | 'decision' | 'complete'>('intro');
  const [wordIdx, setWordIdx] = useState(0);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [bank, setBank] = useState<BankTile[]>(() => makeInitialBank(WORDS[0].tiles));
  const [slots, setSlots] = useState<Array<{ tile: BankTile; locked?: boolean } | null>>(() =>
    Array(WORDS[0].answer.length).fill(null)
  );
  const [hintsLeft, setHintsLeft] = useState(4);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [wrongDecisionShake, setWrongDecisionShake] = useState(false);

  const [timedMode, setTimedMode] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  const [reaction, setReaction] = useState(
    'Commander Reyes: "Read the clue question carefully, find the mystery word, and arrange the jumbled tiles!"'
  );

  const { musicOn, startMusic, stopMusic, toggleMusic } = useGameMusic('playful');
  const currentWord = WORDS[wordIdx];

  useEffect(() => {
    if (!timedMode || phase !== 'play') return;
    const t = window.setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [phase, timedMode]);

  const loadWord = (idx: number) => {
    const w = WORDS[idx];
    setWordIdx(idx);
    setBank(makeInitialBank(w.tiles));
    setSlots(Array(w.answer.length).fill(null));
  };

  const placeTileInSlot = (tile: BankTile, targetSlotIdx: number, fromSlotIdx?: number) => {
    if (phase !== 'play') return;
    if (slots[targetSlotIdx]?.locked) return;

    playChime('button');
    const nextSlots = [...slots];
    let nextBank = [...bank];

    if (fromSlotIdx !== undefined) {
      if (slots[fromSlotIdx]?.locked) return;
      const displaced = nextSlots[targetSlotIdx];
      nextSlots[targetSlotIdx] = { tile };
      nextSlots[fromSlotIdx] = displaced;
    } else {
      nextBank = nextBank.filter((b) => b.uid !== tile.uid);
      const displaced = nextSlots[targetSlotIdx];
      if (displaced) nextBank.push(displaced.tile);
      nextSlots[targetSlotIdx] = { tile };
    }

    setSlots(nextSlots);
    setBank(nextBank);
  };

  const handleBankTileTap = (tile: BankTile) => {
    const firstEmpty = slots.findIndex((s) => s === null);
    if (firstEmpty === -1) return;
    placeTileInSlot(tile, firstEmpty);
  };

  const handleSlotTap = (slotIdx: number) => {
    const item = slots[slotIdx];
    if (!item || item.locked || phase !== 'play') return;
    playChime('button');
    const nextSlots = [...slots];
    nextSlots[slotIdx] = null;
    setSlots(nextSlots);
    setBank([...bank, item.tile]);
  };

  const handleUseHint = () => {
    if (hintsLeft <= 0 || phase !== 'play') return;
    const targetIdx = slots.findIndex(
      (s, i) => !s || s.tile.letter !== currentWord.answer[i]
    );
    if (targetIdx === -1) return;

    const neededLetter = currentWord.answer[targetIdx];
    const nextSlots = [...slots];
    let nextBank = [...bank];

    if (nextSlots[targetIdx] && !nextSlots[targetIdx]?.locked) {
      nextBank.push(nextSlots[targetIdx]!.tile);
      nextSlots[targetIdx] = null;
    }

    const bankMatchIdx = nextBank.findIndex((b) => b.letter === neededLetter);
    let chosenTile: BankTile | null = null;
    if (bankMatchIdx !== -1) {
      chosenTile = nextBank[bankMatchIdx];
      nextBank.splice(bankMatchIdx, 1);
    } else {
      const slotMatchIdx = nextSlots.findIndex(
        (s, i) => s && !s.locked && i !== targetIdx && s.tile.letter === neededLetter
      );
      if (slotMatchIdx !== -1 && nextSlots[slotMatchIdx]) {
        chosenTile = nextSlots[slotMatchIdx]!.tile;
        nextSlots[slotMatchIdx] = null;
      }
    }

    if (!chosenTile) return;
    playChime('star');
    nextSlots[targetIdx] = { tile: chosenTile, locked: true };
    setSlots(nextSlots);
    setBank(nextBank);
    setHintsLeft((h) => h - 1);
    setReaction(`Hint revealed letter "${neededLetter}"! (${hintsLeft - 1} hints left)`);
  };

  const handleCheckWord = () => {
    if (slots.some((s) => s === null) || phase !== 'play') return;
    const guess = slots.map((s) => s?.tile.letter ?? '').join('');

    if (guess === currentWord.answer) {
      playChime('success');
      const nextSolved = [...solvedIds, currentWord.id];
      setSolvedIds(nextSolved);

      if (wordIdx + 1 >= WORDS.length) {
        setPhase('decision');
        setReaction(
          `Solved "${currentWord.answer}"! All ${WORDS.length} habitat sections lit up—choose the storm team’s plan!`
        );
      } else {
        setReaction(
          `Solved "${currentWord.answer}"! ${currentWord.habitatPart} lit up! Answer the next clue question!`
        );
        loadWord(wordIdx + 1);
      }
    } else {
      playChime('gentle');
      setShakeWrong(true);
      setReaction('Not quite the mystery word—re-read the clue question and try another letter order!');
      window.setTimeout(() => {
        setShakeWrong(false);
        const returned: BankTile[] = [...bank];
        const keptSlots = slots.map((s) => {
          if (s && s.locked) return s;
          if (s) returned.push(s.tile);
          return null;
        });
        setSlots(keptSlots);
        setBank(returned);
      }, 460);
    }
  };

  const handleFinalDecision = (choice: 'pause-optional' | 'switch-essential') => {
    if (choice === 'switch-essential') {
      playChime('gentle');
      setWrongDecisionShake(true);
      window.setTimeout(() => setWrongDecisionShake(false), 420);
      setReaction(
        'Commander Reyes: "Never switch off essential crew systems! We pause optional experiments to protect safety and power."'
      );
      return;
    }
    playChime('success');
    stopMusic();
    setPhase('complete');
    setReaction(
      timedMode
        ? `Storm Team Decision Confirmed in ${elapsedSec}s! Optional experiments paused while essential systems stay safe!`
        : 'Maya, Sathya, Elena & Reyes: "Pause optional experiments, watch the systems together, and rest safely!"'
    );
    onFinish();
  };

  const startAttempt = (useTimer: boolean) => {
    playChime('button');
    startMusic();
    setTimedMode(useTimer);
    setElapsedSec(0);
    setSolvedIds([]);
    setHintsLeft(4);
    loadWord(0);
    setPhase('play');
    setReaction(
      useTimer
        ? `Timed Challenge started! Solve all ${WORDS.length} clue questions cleanly!`
        : 'Answer each clue question by arranging the jumbled letter tiles!'
    );
  };

  const ActiveIcon = currentWord.Icon;

  return (
    <ChapterGameShell
      instruction="Answer each clue question and arrange the jumbled tiles!"
      reaction={reaction}
    >
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
        <div className="flex items-center gap-3 text-xs font-extrabold text-slate-700 font-mono-tabular">
          <span>
            Words Solved: {solvedIds.length} / {WORDS.length}
          </span>
          {timedMode && (
            <span className="inline-flex items-center gap-1 text-sky-700">
              <Clock className="w-3.5 h-3.5" />
              {elapsedSec}s
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {phase === 'play' && (
            <button
              type="button"
              disabled={hintsLeft <= 0}
              onClick={handleUseHint}
              className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-extrabold disabled:opacity-45 hover:bg-amber-100"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Hint ({hintsLeft})
            </button>
          )}
          <button
            type="button"
            onClick={toggleMusic}
            className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-extrabold hover:bg-slate-100"
          >
            {musicOn ? <VolumeX className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5" />}
            {musicOn ? 'Mute' : 'Music'}
          </button>
          <button
            type="button"
            onClick={() => startAttempt(false)}
            className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-extrabold hover:bg-slate-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart
          </button>
        </div>
      </div>

      {phase === 'intro' ? (
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-3.5">
            <div>
              <p className="text-xs font-bold text-lime-300 mb-0.5">Chapter 8 Mystery Word Challenge</p>
              <h2 className="text-2xl font-extrabold">Storm Clue Unscramble (8 Words)</h2>
            </div>
            <button
              type="button"
              onClick={() => startAttempt(false)}
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-lime-300 hover:bg-lime-200 text-slate-950 text-base font-extrabold shrink-0"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Word Puzzle!
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-lime-300 text-sm">1. Read the Clue Question</p>
              <p className="text-slate-200">
                Each word stays hidden as “???” until you solve it! Read the question to deduce the mystery word.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-sky-300 text-sm">2. Arrange Jumbled Tiles</p>
              <p className="text-slate-200">
                Drag or tap jumbled letters into the answer slots to reveal all 8 Mars habitat sections!
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-amber-300 text-sm">3. Help the Storm Team</p>
              <p className="text-slate-200">
                Use 4 optional hints if needed, then pick the safest crew power plan during the dust storm.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Left: Progressive Habitat Illustration (hidden words shown as ??? until solved) */}
          <div className="lg:col-span-5 space-y-1.5">
            <HabitatStormIllustration solvedIds={solvedIds} />
            <p className="text-[11px] font-semibold text-slate-600 text-center">
              Hidden habitat labels (“???”) reveal as you solve each mystery word!
            </p>
          </div>

          {/* Right: Active Word Puzzle OR Final Decision */}
          <div className="lg:col-span-7">
            {phase === 'play' ? (
              <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-4 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shrink-0">
                    <ActiveIcon className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-lime-300">
                      Mystery Word {wordIdx + 1} of {WORDS.length} · Powers {currentWord.habitatPart}
                    </p>
                    <p className="text-sm sm:text-base font-bold text-white mt-0.5 leading-snug">
                      {currentWord.question}
                    </p>
                  </div>
                </div>

                {/* Answer Slots */}
                <div
                  className={`flex flex-wrap justify-center gap-2 py-1 ${
                    shakeWrong ? 'animate-gentle-shake' : ''
                  }`}
                >
                  {slots.map((slotItem, sIdx) => (
                    <div
                      key={`slot-${sIdx}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const raw = e.dataTransfer.getData('application/json');
                        if (!raw) return;
                        const parsed = JSON.parse(raw) as { tile: BankTile; fromSlot?: number };
                        placeTileInSlot(parsed.tile, sIdx, parsed.fromSlot);
                      }}
                      onClick={() => handleSlotTap(sIdx)}
                      className={`w-10 h-12 sm:w-12 sm:h-13 rounded-xl border-2 flex items-center justify-center text-xl font-extrabold select-none transition-colors ${
                        slotItem
                          ? slotItem.locked
                            ? 'bg-emerald-500 border-emerald-300 text-slate-950 cursor-default'
                            : 'bg-lime-300 border-white text-slate-950 cursor-pointer hover:bg-lime-200'
                          : 'bg-slate-950 border-dashed border-slate-500 text-slate-500'
                      }`}
                    >
                      {slotItem ? slotItem.tile.letter : ''}
                    </div>
                  ))}
                </div>

                {/* Scrambled Tile Bank */}
                <div className="space-y-1.5">
                  <p className="text-[11px] text-slate-400 text-center">
                    Drag jumbled tiles into slots above or tap letters in order:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 min-h-[52px]">
                    {bank.map((tile) => (
                      <button
                        key={tile.uid}
                        type="button"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            'application/json',
                            JSON.stringify({ tile })
                          );
                        }}
                        onClick={() => handleBankTileTap(tile)}
                        className="w-10 h-12 sm:w-12 sm:h-12 rounded-xl bg-white hover:bg-sky-100 text-slate-950 border-2 border-slate-300 text-lg font-extrabold shadow-sm cursor-grab active:cursor-grabbing transition-transform hover:scale-105"
                      >
                        {tile.letter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    disabled={slots.some((s) => s === null)}
                    onClick={handleCheckWord}
                    className="min-h-[44px] px-7 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 disabled:opacity-40 text-slate-950 text-sm font-extrabold"
                  >
                    Check Answer
                  </button>
                </div>
              </div>
            ) : (
              /* Final Crew Storm Decision + Optional Timed Replay */
              <div
                className={`rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 space-y-3.5 ${
                  wrongDecisionShake ? 'animate-gentle-shake' : ''
                }`}
              >
                <div>
                  <p className="text-xs font-extrabold uppercase text-amber-800">
                    All {WORDS.length} Mystery Words Solved!
                  </p>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                    With dust blocking solar power, what should Maya’s team decide?
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={phase === 'complete'}
                    onClick={() => handleFinalDecision('pause-optional')}
                    className={`min-h-[54px] p-3.5 rounded-xl border-2 text-left text-sm font-extrabold flex items-center justify-between gap-2 ${
                      phase === 'complete'
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-900 text-lime-300'
                    }`}
                  >
                    <span>Pause optional experiments</span>
                    {phase === 'complete' && <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    disabled={phase === 'complete'}
                    onClick={() => handleFinalDecision('switch-essential')}
                    className="min-h-[54px] p-3.5 rounded-xl border-2 border-slate-300 bg-white hover:border-amber-500 text-left text-sm font-extrabold text-slate-900"
                  >
                    Switch off essential crew systems
                  </button>
                </div>

                {phase === 'complete' && (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-amber-200">
                    <span className="text-xs font-bold text-slate-700">
                      Want a playful challenge? Try solving all 8 clues against the clock!
                    </span>
                    <button
                      type="button"
                      onClick={() => startAttempt(true)}
                      className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 text-xs font-extrabold"
                    >
                      <Clock className="w-4 h-4" />
                      Play Timed Replay
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </ChapterGameShell>
  );
}
