import { useState } from 'react';
import {
  CheckCircle2,
  Droplets,
  Eye,
  EyeOff,
  HelpCircle,
  Music,
  Play,
  RotateCcw,
  VolumeX,
  Wrench,
} from 'lucide-react';
import { playChime } from '../../../utils/soundEffects.ts';
import { useGameMusic } from '../../../utils/gameMusic.ts';
import { ChapterGameShell } from './ChapterGameShell.tsx';

interface Ch6RestoreFlowGameProps {
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

function WaterCutawayIllustration({
  viewBox = '0 0 600 500',
  tubeRepaired = false,
  flowStep = 0,
}: {
  viewBox?: string;
  tubeRepaired?: boolean;
  flowStep?: number;
}) {
  return (
    <svg viewBox={viewBox} className="w-full h-full select-none">
      {/* Cutaway Interior Backdrop */}
      <rect width="600" height="500" fill="#0F172A" />
      <path d="M0 100 H600 M0 200 H600 M0 300 H600 M0 400 H600" stroke="#1E293B" strokeWidth="2" />
      <path d="M100 0 V500 M200 0 V500 M300 0 V500 M400 0 V500 M500 0 V500" stroke="#1E293B" strokeWidth="2" />

      {/* Structural Frame Conduits */}
      <path d="M30 34 H570" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
      <path d="M570 34 V460" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
      <path d="M250 40 V120" stroke="#1E293B" strokeWidth="8" />

      {/* 1. RESERVOIR (Left tank) */}
      <rect x="28" y="80" width="136" height="230" rx="14" fill="#1E293B" stroke="#38BDF8" strokeWidth="4" />
      <rect x="34" y="138" width="124" height="165" rx="10" fill="#0284C7" opacity="0.85" />
      <path d="M34 142 Q66 130 96 142 T158 142" fill="none" stroke="#7DD3FC" strokeWidth="3.5" />
      <text x="96" y="114" textAnchor="middle" fill="#E0F2FE" fontSize="15" fontWeight="800">
        RESERVOIR
      </text>
      <text x="96" y="226" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="800">
        FULL TANK
      </text>

      {/* 2. PUMP (Upper middle) */}
      <path d="M164 146 H212" stroke={flowStep >= 1 ? '#38BDF8' : '#64748B'} strokeWidth="16" strokeLinecap="round" />
      <rect x="210" y="106" width="90" height="80" rx="12" fill="#334155" stroke="#94A3B8" strokeWidth="3.5" />
      <circle cx="255" cy="140" r="19" fill="#0F172A" stroke="#38BDF8" strokeWidth="3" />
      <path d="M255 125 V155 M240 140 H270" stroke="#38BDF8" strokeWidth="3" />
      <text x="255" y="177" textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="800">
        PUMP ON
      </text>

      {/* 3. SUPPLY LINE TO SERVICE BRACKET */}
      <path d="M300 140 H406" stroke={flowStep >= 2 ? '#38BDF8' : '#64748B'} strokeWidth="16" strokeLinecap="round" />

      {/* 4. SERVICE BRACKET & COMPRESSED TUBE */}
      <rect
        x="412"
        y="76"
        width="82"
        height="136"
        rx="10"
        fill="#1E293B"
        stroke={tubeRepaired ? '#34D399' : '#F59E0B'}
        strokeWidth="3.5"
        strokeDasharray={tubeRepaired ? 'none' : '6 4'}
      />
      <text x="453" y="98" textAnchor="middle" fill="#FDE68A" fontSize="11" fontWeight="800">
        BRACKET
      </text>

      {tubeRepaired ? (
        <path
          d="M406 140 H500 V255"
          fill="none"
          stroke={flowStep >= 3 ? '#38BDF8' : '#34D399'}
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <path
            d="M406 140 L436 140 L450 156 L464 124 L478 140 L500 140 V255"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="430" y="164" width="46" height="10" rx="3" fill="#94A3B8" />
          <text x="453" y="198" textAnchor="middle" fill="#FCD34D" fontSize="11" fontWeight="800">
            PINCHED
          </text>
        </>
      )}

      {/* 5. GROW TRAY & PLANT ROOTS */}
      <path d="M500 250 V296 H340" fill="none" stroke={flowStep >= 4 ? '#38BDF8' : '#64748B'} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="305" y="272" width="245" height="74" rx="12" fill="#1E293B" stroke="#475569" strokeWidth="3" />
      {flowStep >= 4 && (
        <rect x="312" y="306" width="231" height="34" rx="8" fill="#0284C7" opacity="0.65" />
      )}
      <path d="M368 274 V328 M368 292 L352 328 M368 294 L385 330" stroke="#FDBA74" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M460 274 V328 M460 292 L444 328 M460 294 L477 330" stroke="#FDBA74" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <ellipse cx="355" cy="258" rx="15" ry="7.5" transform="rotate(20 355 258)" fill="#A3E635" />
      <ellipse cx="381" cy="258" rx="15" ry="7.5" transform="rotate(-20 381 258)" fill="#A3E635" />
      <ellipse cx="447" cy="258" rx="15" ry="7.5" transform="rotate(18 447 258)" fill="#BEF264" />
      <ellipse cx="473" cy="258" rx="15" ry="7.5" transform="rotate(-18 473 258)" fill="#BEF264" />
      <text x="425" y="366" textAnchor="middle" fill="#A7F3D0" fontSize="13" fontWeight="800">
        PLANT ROOTS
      </text>

      {/* 6. RETURN LINE (Bottom row looping back to Reservoir) */}
      <path
        d="M340 346 V425 H96 V310"
        fill="none"
        stroke={flowStep >= 5 ? '#38BDF8' : '#64748B'}
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M245 425 L230 416 M245 425 L230 434" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
      <text x="225" y="464" textAnchor="middle" fill="#BAE6FD" fontSize="13" fontWeight="800">
        RETURN LINE TO RESERVOIR
      </text>
    </svg>
  );
}

export function Ch6RestoreFlowGame({ onFinish }: Ch6RestoreFlowGameProps) {
  const [phase, setPhase] = useState<'intro' | 'puzzle' | 'find-restriction' | 'testing' | 'complete'>('intro');
  const [trayPieces, setTrayPieces] = useState<number[]>(() => shuffleIndices(TOTAL_PIECES));
  const [placedSlots, setPlacedSlots] = useState<Array<number | null>>(() =>
    Array(TOTAL_PIECES).fill(null)
  );
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [wrongSlot, setWrongSlot] = useState<number | null>(null);
  const [tubeRepaired, setTubeRepaired] = useState(false);
  const [flowStep, setFlowStep] = useState(0);
  const [reaction, setReaction] = useState(
    'Maya: "Assemble all 30 jigsaw pieces of the water cutaway, then find what blocks the water!"'
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
        setPhase('find-restriction');
        setReaction(
          'Cutaway complete! Look carefully behind the Service Bracket and tap what blocks the water!'
        );
      } else {
        setReaction(`Nice fit! (${TOTAL_PIECES - nextTray.length} / ${TOTAL_PIECES} pieces placed)`);
      }
    } else {
      playChime('gentle');
      setWrongSlot(slotIdx);
      setSelectedPiece(null);
      window.setTimeout(() => setWrongSlot(null), 420);
      setReaction(
        'Not quite that spot! Check the pipe lines and return the piece to the tray.'
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
      setPhase('find-restriction');
      setReaction('Picture complete! Now tap the blocked tube behind the Service Bracket!');
    } else {
      setReaction(`Hint placed 1 piece! (${hintsLeft - 1} hints remaining)`);
    }
  };

  const handleTapRestriction = () => {
    if (phase !== 'find-restriction') return;
    playChime('success');
    setTubeRepaired(true);
    setPhase('testing');
    setReaction(
      'Sathya: "You found the compressed tube behind the bracket! Now press Test Repaired Route!"'
    );
  };

  const handleTestRoute = () => {
    if (phase !== 'testing') return;
    playChime('pop');
    setReaction('Testing repaired route: pumping from reservoir past the bracket toward the roots...');
    [1, 2, 3, 4, 5].forEach((step, idx) => {
      window.setTimeout(() => {
        setFlowStep(step);
        if (step === 5) {
          playChime('success');
          stopMusic();
          setPhase('complete');
          setReaction(
            'Maya: "Route test passed—water reaches the roots and returns! Plants will recover gradually."'
          );
          onFinish();
        }
      }, (idx + 1) * 420);
    });
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
    setTubeRepaired(false);
    setFlowStep(0);
    setReaction('Fresh 30-piece puzzle ready! Complete the picture and find what blocks the water!');
  };

  return (
    <ChapterGameShell
      instruction="Complete the picture. Find what is blocking the water!"
      reaction={reaction}
    >
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
        <span className="text-xs font-extrabold text-slate-700 font-mono-tabular">
          Pieces Placed: {placedCount} / {TOTAL_PIECES}
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
              <p className="text-xs font-bold text-lime-300 mb-0.5">Chapter 6 Cutaway Jigsaw</p>
              <h2 className="text-2xl font-extrabold">The Missing Water Route (30 Pieces)</h2>
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
              <p className="font-extrabold text-lime-300 text-sm">1. Drag or Tap 30 Pieces</p>
              <p className="text-slate-200">
                Drag puzzle pieces from the tray onto the matching 6×5 grid square—or tap a piece and tap its spot!
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-sky-300 text-sm">2. Watch Similar Pipes</p>
              <p className="text-slate-200">
                Check pipe shapes carefully! Wrong placements return to the tray. Use Preview or 3 Hints anytime.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-amber-300 text-sm">3. Find &amp; Test the Blockage</p>
              <p className="text-slate-200">
                Tap the compressed tube behind the service bracket, repair it, and test the real water flow!
              </p>
            </div>
          </div>
        </div>
      ) : phase === 'puzzle' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* 6x5 Jigsaw Board */}
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
                      <WaterCutawayIllustration viewBox={`${c * 100} ${r * 100} 100 100`} />
                    ) : (
                      <span className="text-[10px] text-slate-600 font-mono-tabular">·</span>
                    )}
                  </div>
                );
              })}

              {showPreview && (
                <div className="absolute inset-1.5 rounded-lg overflow-hidden border-2 border-sky-400 bg-slate-950/95 z-10 pointer-events-none">
                  <WaterCutawayIllustration />
                </div>
              )}
            </div>
          </div>

          {/* 30-Piece All-Visible Tray (zero internal scroll) */}
          <div className="lg:col-span-6 bg-slate-100 rounded-2xl border border-slate-300 p-2.5 space-y-1.5">
            <p className="text-xs font-extrabold text-slate-700">
              30-Piece Tray ({trayPieces.length} left — drag or tap piece, then tap board spot)
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
                    aria-label="Jigsaw puzzle piece"
                  >
                    <WaterCutawayIllustration viewBox={`${c * 100} ${r * 100} 100 100`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Completed Cutaway -> Tap Restriction -> Animated Route Test */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-3 relative">
            <div
              className="relative aspect-[6/5] max-h-[340px] mx-auto rounded-xl overflow-hidden cursor-pointer"
              onClick={() => {
                if (phase === 'find-restriction') {
                  playChime('gentle');
                  setReaction('Look closely behind the metallic Service Bracket on the upper-right supply tube!');
                }
              }}
            >
              <WaterCutawayIllustration tubeRepaired={tubeRepaired} flowStep={flowStep} />

              {phase === 'find-restriction' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTapRestriction();
                  }}
                  style={{ left: '68%', top: '15%', width: '15%', height: '28%' }}
                  className="absolute rounded-xl border-2 border-amber-300 bg-amber-400/15 hover:bg-amber-400/30 focus-visible:ring-2"
                  aria-label="Tap the compressed tube behind the service bracket"
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            {phase === 'find-restriction' && (
              <div className="rounded-2xl bg-amber-50 border border-amber-300 p-4 space-y-2">
                <p className="text-xs font-extrabold uppercase text-amber-800">Step 2 · Inspect Cutaway</p>
                <h3 className="text-base font-extrabold text-slate-900">
                  Even with a full reservoir and pump ON, why isn’t water reaching the roots?
                </h3>
                <p className="text-xs text-slate-700">
                  Tap the restricted section inside the completed cutaway diagram!
                </p>
              </div>
            )}

            {(phase === 'testing' || phase === 'complete') && (
              <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sky-950 font-extrabold text-sm">
                  <Wrench className="w-4 h-4 text-emerald-700" />
                  <span>Compressed Tube Repaired!</span>
                </div>
                <p className="text-xs text-slate-700">
                  Test the repaired pipe route to confirm water flows past the bracket to the roots and back to the reservoir.
                </p>
                <button
                  type="button"
                  disabled={flowStep > 0}
                  onClick={handleTestRoute}
                  className="w-full min-h-[48px] rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-slate-950 text-sm font-extrabold inline-flex items-center justify-center gap-2"
                >
                  <Droplets className="w-5 h-5" />
                  {phase === 'complete'
                    ? 'Route Test Confirmed!'
                    : flowStep > 0
                    ? 'Testing Water Flow...'
                    : 'Test Repaired Route'}
                </button>
                {phase === 'complete' && (
                  <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-950 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      Water reaches the roots again! Real plants recover gradually over time.
                    </span>
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
