import { useState } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
  Music,
  Play,
  RotateCcw,
  VolumeX,
} from 'lucide-react';
import { playChime } from '../../../utils/soundEffects.ts';
import { useGameMusic } from '../../../utils/gameMusic.ts';
import { ChapterGameShell } from './ChapterGameShell.tsx';

interface Ch7DataReadingsGameProps {
  onFinish: () => void;
}

const COLS = 6;
const ROWS = 5;
const TOTAL_PIECES = COLS * ROWS; // 30 pieces (6x5 grid)

function shuffleIndices(count: number): number[] {
  const arr = Array.from({ length: count }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Uses BOTH line pattern (Solid vs Dashed) AND geometric symbols (Circle ● vs Triangle ▲)
 * so paths are never distinguished by color alone.
 */
function SensorDiagramSVG({
  viewBox = '0 0 600 500',
  traceA = false,
  traceB = false,
  repaired = false,
  verified = false,
}: {
  viewBox?: string;
  traceA?: boolean;
  traceB?: boolean;
  repaired?: boolean;
  verified?: boolean;
}) {
  return (
    <svg viewBox={viewBox} className="w-full h-full select-none">
      <rect width="600" height="500" fill="#0F172A" />
      <path d="M0 100 H600 M0 200 H600 M0 300 H600 M0 400 H600" stroke="#1E293B" strokeWidth="2" />
      <path d="M100 0 V500 M200 0 V500 M300 0 V500 M400 0 V500 M500 0 V500" stroke="#1E293B" strokeWidth="2" />

      {/* Top Displays */}
      <rect x="40" y="24" width="180" height="72" rx="12" fill="#1E293B" stroke="#38BDF8" strokeWidth="3.5" />
      <circle cx="62" cy="48" r="8" fill="#38BDF8" />
      <text x="78" y="53" fill="#E0F2FE" fontSize="13" fontWeight="800">
        DISPLAY A (●)
      </text>
      <text x="130" y="80" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="800">
        1.8 L/m
      </text>

      <rect x="380" y="24" width="180" height="72" rx="12" fill="#1E293B" stroke="#FBBF24" strokeWidth="3.5" />
      <polygon points="402,40 410,55 394,55" fill="#FBBF24" />
      <text x="418" y="53" fill="#FEF3C7" fontSize="13" fontWeight="800">
        DISPLAY B (▲)
      </text>
      <text x="470" y="80" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="800">
        {verified ? '0.4 L/m' : '1.8 L/m'}
      </text>

      {/* Path A: SOLID line + Circle Symbols ● */}
      <path
        d="M130 96 V205 H255 V295 L150 388"
        fill="none"
        stroke={traceA ? '#38BDF8' : '#94A3B8'}
        strokeWidth={traceA ? 10 : 7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="130" cy="152" r="8" fill="#38BDF8" />
      <circle cx="205" cy="205" r="8" fill="#38BDF8" />
      <circle cx="195" cy="346" r="8" fill="#38BDF8" />

      {/* Path B: DASHED line + Triangle Symbols ▲ */}
      <path
        d={
          repaired
            ? 'M470 96 V205 H345 V295 L450 388'
            : 'M470 96 V205 H345 V295 L178 388'
        }
        fill="none"
        stroke={repaired ? '#34D399' : traceB ? '#FBBF24' : '#CBD5E1'}
        strokeWidth={traceB || repaired ? 10 : 7}
        strokeDasharray="13 9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points="470,144 479,161 461,161" fill="#FBBF24" />
      <polygon points="395,196 404,213 386,213" fill="#FBBF24" />
      <polygon
        points={repaired ? '405,336 414,353 396,353' : '255,336 264,353 246,353'}
        fill={repaired ? '#34D399' : '#FBBF24'}
      />

      {/* Controller Box in Center */}
      <rect x="210" y="180" width="180" height="96" rx="14" fill="#334155" stroke="#E2E8F0" strokeWidth="3" />
      <text x="300" y="218" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="800">
        CONTROLLER
      </text>
      <text x="300" y="244" textAnchor="middle" fill="#CBD5E1" fontSize="12" fontWeight="700">
        {repaired ? 'CH A ●  |  CH B ▲' : 'COPIED INPUT → CH A & B'}
      </text>

      {/* Bottom Sensor 1 (Shared Source) */}
      <rect
        x="52"
        y="388"
        width="210"
        height="84"
        rx="12"
        fill="#1E293B"
        stroke={repaired ? '#38BDF8' : '#F59E0B'}
        strokeWidth="3.5"
      />
      <text x="157" y="422" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="800">
        SENSOR 1 (Pump Outlet)
      </text>
      <text x="157" y="448" textAnchor="middle" fill="#FDE68A" fontSize="11.5" fontWeight="700">
        {repaired ? 'Feeds Display A (●) Only' : 'SHARED SOURCE (● + ▲)'}
      </text>

      {/* Bottom Sensor 2 (Independent Root Sensor) */}
      <rect
        x="342"
        y="388"
        width="210"
        height="84"
        rx="12"
        fill="#1E293B"
        stroke={repaired ? '#34D399' : '#64748B'}
        strokeWidth="3.5"
      />
      <text x="447" y="422" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="800">
        SENSOR 2 (Root Tray)
      </text>
      <text x="447" y="448" textAnchor="middle" fill={repaired ? '#A7F3D0' : '#94A3B8'} fontSize="11.5" fontWeight="700">
        {repaired ? 'Feeds Display B (▲) Solo!' : 'NOT CONNECTED'}
      </text>
    </svg>
  );
}

export function Ch7DataReadingsGame({ onFinish }: Ch7DataReadingsGameProps) {
  const [phase, setPhase] = useState<'intro' | 'puzzle' | 'trace' | 'verify' | 'complete'>('intro');
  const [trayPieces, setTrayPieces] = useState<number[]>(() => shuffleIndices(TOTAL_PIECES));
  const [placedSlots, setPlacedSlots] = useState<Array<number | null>>(() =>
    Array(TOTAL_PIECES).fill(null)
  );
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [wrongSlot, setWrongSlot] = useState<number | null>(null);
  const [tracedA, setTracedA] = useState(false);
  const [tracedB, setTracedB] = useState(false);
  const [reaction, setReaction] = useState(
    'Maya: "Build the 30-piece sensor puzzle, then trace ● Solid and ▲ Dashed paths to their source!"'
  );

  const { musicOn, startMusic, stopMusic, toggleMusic } = useGameMusic('playful');

  const placedCount = placedSlots.filter((p) => p !== null).length;

  const tryPlacePiece = (pieceIdx: number, slotIdx: number) => {
    if (phase !== 'puzzle' || placedSlots[slotIdx] !== null) return;

    if (pieceIdx === slotIdx) {
      playChime('pop');
      const nextPlaced = [...placedSlots];
      nextPlaced[slotIdx] = pieceIdx;
      const nextTray = trayPieces.filter((p) => p !== pieceIdx);
      setPlacedSlots(nextPlaced);
      setTrayPieces(nextTray);
      setSelectedPiece(null);

      if (nextTray.length === 0) {
        playChime('success');
        setPhase('trace');
        setReaction(
          'Picture complete! Trace Path A (● solid) and Path B (▲ dashed), then tap the shared sensor!'
        );
      } else {
        setReaction(`Great match! (${TOTAL_PIECES - nextTray.length} / ${TOTAL_PIECES} pieces placed)`);
      }
    } else {
      playChime('gentle');
      setWrongSlot(slotIdx);
      setSelectedPiece(null);
      window.setTimeout(() => setWrongSlot(null), 420);
      setReaction(
        'Check the line style and symbols (● solid vs ▲ dashed)! Piece returned to the tray.'
      );
    }
  };

  const handleUseHint = () => {
    if (hintsLeft <= 0 || trayPieces.length === 0 || phase !== 'puzzle') return;
    playChime('star');
    const targetPiece = trayPieces[0];
    setHintsLeft((h) => h - 1);
    const nextPlaced = [...placedSlots];
    nextPlaced[targetPiece] = targetPiece;
    const nextTray = trayPieces.filter((p) => p !== targetPiece);
    setPlacedSlots(nextPlaced);
    setTrayPieces(nextTray);
    setSelectedPiece(null);

    if (nextTray.length === 0) {
      playChime('success');
      setPhase('trace');
      setReaction('Diagram complete! Trace Path A (●) and Path B (▲), then tap the shared source!');
    } else {
      setReaction(`Hint placed 1 piece! (${hintsLeft - 1} hints left)`);
    }
  };

  const handleTapSharedSource = () => {
    if (phase !== 'trace') return;
    if (!tracedA || !tracedB) {
      playChime('gentle');
      setReaction('Trace BOTH Path A (●) and Path B (▲) first so you can see where both lines lead!');
      return;
    }
    playChime('success');
    setPhase('verify');
    setReaction(
      'Sathya: "Both displays copied Sensor 1! Now inspect the corrected wiring and run an independent check!"'
    );
  };

  const handleVerifyCheck = () => {
    if (phase !== 'verify') return;
    playChime('success');
    stopMusic();
    setPhase('complete');
    setReaction(
      'Maya: "Independent check shows Sensor 2 at the roots is 0.4 L/m! Two matching displays weren’t two independent measurements!"'
    );
    onFinish();
  };

  const handleReset = () => {
    playChime('button');
    setPhase('puzzle');
    startMusic();
    setTrayPieces(shuffleIndices(TOTAL_PIECES));
    setPlacedSlots(Array(TOTAL_PIECES).fill(null));
    setSelectedPiece(null);
    setShowPreview(false);
    setHintsLeft(3);
    setWrongSlot(null);
    setTracedA(false);
    setTracedB(false);
    setReaction('Complete the 30-piece picture. Discover where both readings come from!');
  };

  return (
    <ChapterGameShell
      instruction="Complete the picture. Discover where both readings come from!"
      reaction={reaction}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
        <span className="text-xs font-extrabold text-slate-700 font-mono-tabular">
          Pieces: {placedCount} / {TOTAL_PIECES} · ● Solid = Display A · ▲ Dashed = Display B
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          {phase === 'puzzle' && (
            <>
              <button
                type="button"
                onClick={() => {
                  playChime('button');
                  setShowPreview((v) => !v);
                }}
                className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-extrabold hover:bg-slate-100"
              >
                {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
              <button
                type="button"
                disabled={hintsLeft <= 0 || trayPieces.length === 0}
                onClick={handleUseHint}
                className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-extrabold disabled:opacity-45 hover:bg-amber-100"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Hint ({hintsLeft})
              </button>
            </>
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
            onClick={handleReset}
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
              <p className="text-xs font-bold text-lime-300 mb-0.5">Chapter 7 Sensor Jigsaw</p>
              <h2 className="text-2xl font-extrabold">Two Readings, One Source (30 Pieces)</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                playChime('pop');
                startMusic();
                setPhase('puzzle');
              }}
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-lime-300 hover:bg-lime-200 text-slate-950 text-base font-extrabold shrink-0"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Puzzle!
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-lime-300 text-sm">1. Build the 30-Piece Diagram</p>
              <p className="text-slate-200">
                Match Display A (● solid line), Display B (▲ dashed line), the controller, and the bottom sensors.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-sky-300 text-sm">2. Trace Both Paths</p>
              <p className="text-slate-200">
                Follow the ● solid line and ▲ dashed line through the controller and tap the shared source sensor.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-amber-300 text-sm">3. Verify Independently</p>
              <p className="text-slate-200">
                Inspect the corrected sensor wiring and run an independent measurement check!
              </p>
            </div>
          </div>
        </div>
      ) : phase === 'puzzle' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* 6x5 Board */}
          <div className="lg:col-span-6 bg-slate-900 rounded-2xl border border-slate-800 p-2.5 relative">
            <div className="relative grid grid-cols-6 gap-0.5 bg-slate-950 p-1.5 rounded-xl border border-slate-700 aspect-[6/5] max-w-[390px] mx-auto">
              {placedSlots.map((placedIdx, slotIdx) => {
                const r = Math.floor(slotIdx / COLS);
                const c = slotIdx % COLS;
                const isWrong = wrongSlot === slotIdx;

                return (
                  <div
                    key={slotIdx}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const raw = e.dataTransfer.getData('text/plain');
                      const pieceNum = Number(raw);
                      if (!Number.isNaN(pieceNum)) tryPlacePiece(pieceNum, slotIdx);
                    }}
                    onClick={() => {
                      if (selectedPiece !== null && placedIdx === null) {
                        tryPlacePiece(selectedPiece, slotIdx);
                      }
                    }}
                    className={`relative rounded border overflow-hidden flex items-center justify-center transition-colors ${
                      placedIdx !== null
                        ? 'border-emerald-400/70'
                        : isWrong
                        ? 'border-amber-400 bg-amber-500/30 animate-gentle-shake'
                        : selectedPiece !== null
                        ? 'border-sky-400/70 bg-slate-900 hover:bg-sky-900/40 cursor-pointer'
                        : 'border-slate-700 bg-slate-900/70'
                    }`}
                  >
                    {placedIdx !== null ? (
                      <SensorDiagramSVG viewBox={`${c * 100} ${r * 100} 100 100`} />
                    ) : (
                      <span className="text-[10px] text-slate-600 font-mono-tabular">·</span>
                    )}
                  </div>
                );
              })}

              {showPreview && (
                <div className="absolute inset-1.5 rounded-lg overflow-hidden border-2 border-sky-400 bg-slate-950/95 z-10 pointer-events-none">
                  <SensorDiagramSVG />
                </div>
              )}
            </div>
          </div>

          {/* 30-Piece All-Visible Tray */}
          <div className="lg:col-span-6 bg-slate-100 rounded-2xl border border-slate-300 p-2.5 space-y-1.5">
            <p className="text-xs font-extrabold text-slate-700">
              30-Piece Diagram Tray ({trayPieces.length} left — drag or tap to place)
            </p>
            <div className="grid grid-cols-6 gap-1.5">
              {trayPieces.map((pieceIdx) => {
                const r = Math.floor(pieceIdx / COLS);
                const c = pieceIdx % COLS;
                const isSelected = selectedPiece === pieceIdx;
                return (
                  <button
                    key={pieceIdx}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', String(pieceIdx));
                      setSelectedPiece(pieceIdx);
                    }}
                    onClick={() => {
                      playChime('button');
                      setSelectedPiece(isSelected ? null : pieceIdx);
                    }}
                    className={`aspect-square rounded-md border-2 overflow-hidden transition-transform cursor-grab active:cursor-grabbing ${
                      isSelected
                        ? 'border-lime-400 ring-2 ring-lime-400 scale-105'
                        : 'border-slate-400 hover:border-sky-500'
                    }`}
                    aria-label="Sensor diagram jigsaw piece"
                  >
                    <SensorDiagramSVG viewBox={`${c * 100} ${r * 100} 100 100`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-3 relative">
            <div className="relative aspect-[6/5] max-h-[340px] mx-auto rounded-xl overflow-hidden">
              <SensorDiagramSVG
                traceA={tracedA}
                traceB={tracedB}
                repaired={phase === 'verify' || phase === 'complete'}
                verified={phase === 'complete'}
              />

              {phase === 'trace' && (
                <button
                  type="button"
                  onClick={handleTapSharedSource}
                  style={{ left: '8%', top: '76%', width: '36%', height: '19%' }}
                  className="absolute rounded-xl border-2 border-amber-300 bg-amber-400/15 hover:bg-amber-400/30"
                  aria-label="Tap Shared Sensor 1"
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            {phase === 'trace' ? (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2.5">
                <p className="text-xs font-extrabold uppercase text-sky-800">Step 2 · Trace &amp; Identify</p>
                <button
                  type="button"
                  onClick={() => {
                    playChime('button');
                    setTracedA(true);
                  }}
                  className={`w-full min-h-[44px] px-4 rounded-xl border-2 text-sm font-extrabold text-left ${
                    tracedA
                      ? 'bg-sky-100 border-sky-500 text-sky-950'
                      : 'bg-white border-slate-300 text-slate-900 hover:border-sky-500'
                  }`}
                >
                  {tracedA ? '✓ Traced Display A (● Solid)' : '1. Trace Display A Path (● Solid)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playChime('button');
                    setTracedB(true);
                  }}
                  className={`w-full min-h-[44px] px-4 rounded-xl border-2 text-sm font-extrabold text-left ${
                    tracedB
                      ? 'bg-amber-100 border-amber-500 text-amber-950'
                      : 'bg-white border-slate-300 text-slate-900 hover:border-amber-500'
                  }`}
                >
                  {tracedB ? '✓ Traced Display B (▲ Dashed)' : '2. Trace Display B Path (▲ Dashed)'}
                </button>

                <button
                  type="button"
                  onClick={handleTapSharedSource}
                  className={`w-full min-h-[46px] px-4 rounded-xl text-sm font-extrabold ${
                    tracedA && tracedB
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  3. Tap Shared Source (Sensor 1)
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-4 space-y-3">
                <p className="text-xs font-extrabold uppercase text-emerald-800">
                  Corrected Mapping Ready
                </p>
                <h3 className="text-base font-extrabold text-slate-900">
                  Display B (▲) is now mapped to independent Sensor 2 at the roots!
                </h3>
                <button
                  type="button"
                  disabled={phase === 'complete'}
                  onClick={handleVerifyCheck}
                  className="w-full min-h-[48px] px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-emerald-700 text-lime-300 disabled:text-white text-sm font-extrabold inline-flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {phase === 'complete'
                    ? 'Independent Check Complete (0.4 L/m Confirmed)'
                    : 'Run Independent Measurement Check'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </ChapterGameShell>
  );
}
