import { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Music,
  Play,
  RotateCcw,
  Shuffle,
  Undo2,
  VolumeX,
} from 'lucide-react';
import { playChime } from '../../../utils/soundEffects.ts';
import { useGameMusic } from '../../../utils/gameMusic.ts';
import { ChapterGameShell } from './ChapterGameShell.tsx';

interface Ch5GreenhouseDetectiveGameProps {
  onFinish: () => void;
}

type ClueTileType =
  | 'pale-leaves'
  | 'drooping-plants'
  | 'roots'
  | 'lamps'
  | 'water-pipes'
  | 'dashboard';

interface TileTypeMeta {
  id: ClueTileType;
  label: string;
  notebookNote: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

interface BoardTile {
  uid: number;
  type: ClueTileType;
  layer: 0 | 1 | 2;
  r: number;
  c: number;
}

interface TrayTile {
  uid: number;
  type: ClueTileType;
}

interface Snapshot {
  board: BoardTile[];
  tray: TrayTile[];
  uncoveredClues: ClueTileType[];
}

const CLUE_TYPES: TileTypeMeta[] = [
  {
    id: 'pale-leaves',
    label: 'Pale Leaves',
    notebookNote: 'Leaves lost their deep green color and turned pale.',
    bgClass: 'bg-yellow-50',
    borderClass: 'border-yellow-500',
    textClass: 'text-yellow-950',
  },
  {
    id: 'drooping-plants',
    label: 'Drooping',
    notebookNote: 'Upper stems and leaves are drooping instead of standing tall.',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-950',
  },
  {
    id: 'roots',
    label: 'Roots',
    notebookNote: 'Hydroponic roots look drier than normal.',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-500',
    textClass: 'text-orange-950',
  },
  {
    id: 'lamps',
    label: 'Lamps',
    notebookNote: 'Grow lamps are shining brightly on schedule.',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-950',
  },
  {
    id: 'water-pipes',
    label: 'Water Pipes',
    notebookNote: 'Pipes run from the pump toward the plant trays.',
    bgClass: 'bg-sky-50',
    borderClass: 'border-sky-500',
    textClass: 'text-sky-950',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    notebookNote: 'Dashboard readings claim flow is steady—even while plants droop!',
    bgClass: 'bg-violet-50',
    borderClass: 'border-violet-500',
    textClass: 'text-violet-950',
  },
];

const CLUE_MAP = Object.fromEntries(CLUE_TYPES.map((t) => [t.id, t])) as Record<
  ClueTileType,
  TileTypeMeta
>;

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// 48 layered tiles (16 triples) across 3 layers:
// Layer 0: 4x6 = 24 | Layer 1: 3x5 = 15 | Layer 2: 3x3 = 9 -> 48 total
function buildLayeredBoard(): BoardTile[] {
  const coords: Array<{ layer: 0 | 1 | 2; r: number; c: number }> = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      coords.push({ layer: 0, r, c });
    }
  }
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 5; c++) {
      coords.push({ layer: 1, r: r + 0.5, c: c + 0.5 });
    }
  }
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      coords.push({ layer: 2, r: 0.75 + r * 0.75, c: 1.5 + c });
    }
  }

  // 4 random clue types get 3 triples (9 tiles each = 36) + 2 types get 2 triples (6 tiles each = 12) = 48
  const order = shuffleArray(CLUE_TYPES);
  const deck: ClueTileType[] = [];
  order.forEach((clue, idx) => {
    const count = idx < 4 ? 9 : 6;
    for (let k = 0; k < count; k++) deck.push(clue.id);
  });
  const shuffled = shuffleArray(deck);

  return coords.map((pos, idx) => ({
    uid: idx + 1,
    type: shuffled[idx],
    layer: pos.layer,
    r: pos.r,
    c: pos.c,
  }));
}

function isTileBlocked(tile: BoardTile, board: BoardTile[]): boolean {
  return board.some(
    (other) =>
      other.layer > tile.layer &&
      Math.abs(other.r - tile.r) < 0.85 &&
      Math.abs(other.c - tile.c) < 0.85
  );
}

function ClueTileArt({ type, small = false }: { type: ClueTileType; small?: boolean }) {
  const cls = small ? 'w-5 h-5' : 'w-6 h-6';
  switch (type) {
    case 'pale-leaves':
      return (
        <svg viewBox="0 0 40 40" className={cls} aria-hidden="true">
          <path d="M20 33 C10 28 8 15 20 7 C32 15 30 28 20 33 Z" fill="#FDE047" stroke="#A16207" strokeWidth="2.2" />
          <path d="M20 11 V33" stroke="#A16207" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'drooping-plants':
      return (
        <svg viewBox="0 0 40 40" className={cls} aria-hidden="true">
          <path d="M20 34 Q18 20 12 15" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="10" cy="20" rx="6" ry="3.5" transform="rotate(35 10 20)" fill="#34D399" stroke="#065F46" strokeWidth="1.5" />
          <ellipse cx="24" cy="23" rx="6" ry="3.5" transform="rotate(-35 24 23)" fill="#6EE7B7" stroke="#065F46" strokeWidth="1.5" />
        </svg>
      );
    case 'roots':
      return (
        <svg viewBox="0 0 40 40" className={cls} aria-hidden="true">
          <path d="M20 8 V17 M20 17 L12 29 M20 17 L20 32 M20 17 L28 28 M15 24 L9 30" fill="none" stroke="#C2410C" strokeWidth="2.6" strokeLinecap="round" />
          <rect x="13" y="6" width="14" height="5" rx="2" fill="#FB923C" />
        </svg>
      );
    case 'lamps':
      return (
        <svg viewBox="0 0 40 40" className={cls} aria-hidden="true">
          <rect x="8" y="9" width="24" height="7" rx="3.5" fill="#F59E0B" stroke="#92400E" strokeWidth="1.8" />
          <path d="M13 21 L10 31 M20 21 V32 M27 21 L30 31" stroke="#FBBF24" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'water-pipes':
      return (
        <svg viewBox="0 0 40 40" className={cls} aria-hidden="true">
          <path d="M7 14 H22 V28 H33" fill="none" stroke="#0284C7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="29" cy="14" r="3.5" fill="#38BDF8" />
        </svg>
      );
    case 'dashboard':
      return (
        <svg viewBox="0 0 40 40" className={cls} aria-hidden="true">
          <rect x="6" y="9" width="28" height="22" rx="4" fill="#1E293B" stroke="#7C3AED" strokeWidth="2" />
          <line x1="10" y1="18" x2="30" y2="18" stroke="#A78BFA" strokeWidth="2.5" />
          <line x1="10" y1="24" x2="30" y2="24" stroke="#34D399" strokeWidth="2.5" />
        </svg>
      );
  }
}

export function Ch5GreenhouseDetectiveGame({ onFinish }: Ch5GreenhouseDetectiveGameProps) {
  const [phase, setPhase] = useState<'intro' | 'board' | 'choice' | 'complete'>('intro');
  const [board, setBoard] = useState<BoardTile[]>(buildLayeredBoard);
  const [tray, setTray] = useState<TrayTile[]>([]);
  const [uncoveredClues, setUncoveredClues] = useState<ClueTileType[]>([]);
  const [undoUsed, setUndoUsed] = useState(false);
  const [shuffleUsed, setShuffleUsed] = useState(false);
  const [lastSnapshot, setLastSnapshot] = useState<Snapshot | null>(null);
  const [trayOverflowing, setTrayOverflowing] = useState(false);
  const [wrongChoiceShake, setWrongChoiceShake] = useState(false);
  const [reaction, setReaction] = useState(
    'Maya: "Match 3 identical greenhouse tiles across 48 layered pieces to fill my notebook!"'
  );

  const { musicOn, startMusic, stopMusic, toggleMusic } = useGameMusic('playful');

  const restartAttempt = (msg?: string) => {
    setBoard(buildLayeredBoard());
    setTray([]);
    setUncoveredClues([]);
    setUndoUsed(false);
    setShuffleUsed(false);
    setLastSnapshot(null);
    setTrayOverflowing(false);
    setWrongChoiceShake(false);
    setPhase('board');
    startMusic();
    setReaction(msg || 'Match three, uncover clues, and help Maya choose what to check!');
  };

  const handleTileTap = (tile: BoardTile) => {
    if (phase !== 'board' || trayOverflowing) return;
    if (isTileBlocked(tile, board)) {
      playChime('gentle');
      setReaction('That tile is covered by an upper tile! Clear top tiles first.');
      return;
    }
    if (tray.length >= 7) return;

    playChime('pop');
    const snapshot: Snapshot = {
      board: [...board],
      tray: [...tray],
      uncoveredClues: [...uncoveredClues],
    };
    setLastSnapshot(snapshot);

    const nextBoard = board.filter((t) => t.uid !== tile.uid);

    const nextTray = [...tray];
    const lastSameIdx = nextTray.map((t) => t.type).lastIndexOf(tile.type);
    const newTrayItem: TrayTile = { uid: tile.uid, type: tile.type };
    if (lastSameIdx !== -1) {
      nextTray.splice(lastSameIdx + 1, 0, newTrayItem);
    } else {
      nextTray.push(newTrayItem);
    }

    const matchingCount = nextTray.filter((t) => t.type === tile.type).length;
    if (matchingCount >= 3) {
      let removed = 0;
      const clearedTray = nextTray.filter((t) => {
        if (t.type === tile.type && removed < 3) {
          removed += 1;
          return false;
        }
        return true;
      });
      const nextClues = uncoveredClues.includes(tile.type)
        ? uncoveredClues
        : [...uncoveredClues, tile.type];

      setBoard(nextBoard);
      setTray(clearedTray);
      setUncoveredClues(nextClues);
      playChime('success');

      if (nextBoard.length === 0 && clearedTray.length === 0) {
        setPhase('choice');
        setReaction(
          'All 48 tiles cleared! All 6 clues are in Maya’s notebook. Now help Maya make the right call!'
        );
      } else {
        setReaction(
          `Matched 3 ${CLUE_MAP[tile.type].label}! Clue added to Maya’s investigation notebook.`
        );
      }
      return;
    }

    setBoard(nextBoard);
    setTray(nextTray);

    if (nextTray.length >= 7) {
      playChime('gentle');
      setTrayOverflowing(true);
      setReaction(
        'Tray filled all 7 slots without a match! Restarting the board—try completing triples early!'
      );
      window.setTimeout(() => {
        restartAttempt('Fresh 48-tile board ready! Watch the 7-slot tray and match 3 identical clues.');
      }, 1250);
    }
  };

  const handleUndo = () => {
    if (undoUsed || !lastSnapshot || phase !== 'board' || trayOverflowing) return;
    playChime('button');
    setBoard(lastSnapshot.board);
    setTray(lastSnapshot.tray);
    setUncoveredClues(lastSnapshot.uncoveredClues);
    setUndoUsed(true);
    setLastSnapshot(null);
    setReaction('Used your 1 Undo! Pick another uncovered tile carefully.');
  };

  const handleShuffle = () => {
    if (shuffleUsed || board.length < 2 || phase !== 'board' || trayOverflowing) return;
    playChime('button');
    const types = shuffleArray(board.map((b) => b.type));
    setBoard(board.map((b, i) => ({ ...b, type: types[i] })));
    setShuffleUsed(true);
    setLastSnapshot(null);
    setReaction('Used your 1 Shuffle! Remaining greenhouse tiles have shifted places.');
  };

  const handleFinalChoice = (choice: 'trust' | 'independent') => {
    if (choice === 'trust') {
      playChime('gentle');
      setWrongChoiceShake(true);
      window.setTimeout(() => setWrongChoiceShake(false), 400);
      setReaction(
        'Maya: "Wait—our clues show pale leaves and drooping plants! The dashboard might be wrong. Check the water flow independently!"'
      );
      return;
    }
    playChime('success');
    stopMusic();
    setPhase('complete');
    setReaction(
      'Maya: "Yes! When observations disagree with a display, always check the physical water flow independently!"'
    );
    onFinish();
  };

  return (
    <ChapterGameShell
      instruction="Match three, uncover clues, and help Maya choose what to check!"
      reaction={reaction}
    >
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
        <span className="text-xs font-extrabold text-slate-700 font-mono-tabular">
          Tiles Left: {board.length} / 48 · Clues: {uncoveredClues.length} / 6
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={undoUsed || !lastSnapshot || phase !== 'board' || trayOverflowing}
            onClick={handleUndo}
            className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-extrabold disabled:opacity-45 hover:bg-slate-100"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Undo ({undoUsed ? '0' : '1'})
          </button>
          <button
            type="button"
            disabled={shuffleUsed || board.length < 2 || phase !== 'board' || trayOverflowing}
            onClick={handleShuffle}
            className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-extrabold disabled:opacity-45 hover:bg-slate-100"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Shuffle ({shuffleUsed ? '0' : '1'})
          </button>
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
            onClick={() => {
              playChime('button');
              restartAttempt();
            }}
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
              <p className="text-xs font-bold text-lime-300 mb-0.5">Chapter 5 Investigation</p>
              <h2 className="text-2xl font-extrabold">Greenhouse Mystery Tiles (48 Tiles)</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                playChime('pop');
                startMusic();
                setPhase('board');
              }}
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-lime-300 hover:bg-lime-200 text-slate-950 text-base font-extrabold shrink-0"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Matching!
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-lime-300 text-sm">1. Tap Uncovered Tiles</p>
              <p className="text-slate-200">
                Upper tiles lock the ones underneath. Tap bright uncovered tiles across 3 layers to send them to the tray.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-sky-300 text-sm">2. Match 3 Identical</p>
              <p className="text-slate-200">
                Three matching tiles vanish and log a clue in Maya’s notebook. Don’t fill all 7 tray slots!
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-amber-300 text-sm">3. Make the Final Call</p>
              <p className="text-slate-200">
                Use 1 Undo and 1 Shuffle wisely. Once cleared, help Maya choose what to check!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* Left: Compact 48-Tile Layered Board + 7-Slot Tray (or Final Choice) */}
          <div className="lg:col-span-8 space-y-2.5">
            {phase === 'board' ? (
              <>
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-2.5 sm:p-3">
                  <div className="relative mx-auto w-full max-w-[460px] aspect-[6/4]">
                    {board.map((tile) => {
                      const meta = CLUE_MAP[tile.type];
                      const blocked = isTileBlocked(tile, board);
                      const leftPct = (tile.c / 6) * 100;
                      const topPct = (tile.r / 4) * 100;

                      return (
                        <button
                          key={tile.uid}
                          type="button"
                          onClick={() => handleTileTap(tile)}
                          style={{
                            left: `${leftPct}%`,
                            top: `${topPct}%`,
                            width: '15.8%',
                            height: '23%',
                            zIndex: tile.layer * 10 + Math.round(tile.r * 2),
                            transform: `translate(${tile.layer * -2}px, ${tile.layer * -3}px)`,
                          }}
                          className={`absolute rounded-lg border-2 p-0.5 flex flex-col items-center justify-center transition-transform select-none shadow-md ${
                            blocked
                              ? 'bg-slate-700 border-slate-600 text-slate-300 opacity-65 cursor-not-allowed'
                              : `${meta.bgClass} ${meta.borderClass} ${meta.textClass} hover:scale-105 cursor-pointer`
                          }`}
                          aria-label={`${meta.label}${blocked ? ' (blocked by upper tile)' : ''}`}
                        >
                          {blocked ? (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ClueTileArt type={tile.type} small />
                          )}
                          <span className="text-[8px] sm:text-[9px] font-extrabold leading-none text-center truncate w-full px-0.5 mt-0.5">
                            {meta.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Compact 7-Slot Collection Tray */}
                <div
                  className={`rounded-2xl border-2 px-3 py-2 transition-colors ${
                    trayOverflowing
                      ? 'bg-rose-50 border-rose-400 animate-gentle-shake'
                      : 'bg-slate-100 border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-extrabold text-slate-700">
                      Collection Tray ({tray.length} / 7 slots used)
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500">
                      Match 3 identical tiles to clear
                    </p>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: 7 }).map((_, idx) => {
                      const item = tray[idx];
                      if (!item) {
                        return (
                          <div
                            key={`slot-${idx}`}
                            className="h-12 sm:h-14 rounded-xl border-2 border-dashed border-slate-300 bg-white/60"
                          />
                        );
                      }
                      const meta = CLUE_MAP[item.type];
                      return (
                        <div
                          key={item.uid}
                          className={`h-12 sm:h-14 rounded-xl border-2 ${meta.bgClass} ${meta.borderClass} ${meta.textClass} p-0.5 flex flex-col items-center justify-center shadow-sm`}
                        >
                          <ClueTileArt type={item.type} small />
                          <span className="text-[8px] font-extrabold leading-none truncate w-full text-center mt-0.5">
                            {meta.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* Final Investigation Decision */
              <div
                className={`rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 space-y-4 ${
                  wrongChoiceShake ? 'animate-gentle-shake' : ''
                }`}
              >
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                    All Greenhouse Clues Collected
                  </p>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                    The plants show pale, drooping leaves—yet the dashboard claims everything is fine. What should Maya do?
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={phase === 'complete'}
                    onClick={() => handleFinalChoice('trust')}
                    className="min-h-[54px] p-3.5 rounded-xl border-2 border-slate-300 bg-white hover:border-amber-500 text-left text-sm font-extrabold text-slate-900"
                  >
                    Trust the dashboard
                  </button>
                  <button
                    type="button"
                    disabled={phase === 'complete'}
                    onClick={() => handleFinalChoice('independent')}
                    className={`min-h-[54px] p-3.5 rounded-xl border-2 text-left text-sm font-extrabold flex items-center justify-between gap-2 ${
                      phase === 'complete'
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-900 text-lime-300'
                    }`}
                  >
                    <span>Check the water flow independently</span>
                    {phase === 'complete' && <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Compact Investigation Notebook */}
          <aside className="lg:col-span-4 bg-amber-50 border border-amber-200 rounded-2xl p-3 space-y-2">
            <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
              <BookOpen className="w-4 h-4 text-amber-800 shrink-0" />
              <h3 className="text-xs font-extrabold text-amber-950">
                Maya’s Investigation Notebook
              </h3>
            </div>

            <div className="space-y-1.5">
              {CLUE_TYPES.map((clue) => {
                const discovered = uncoveredClues.includes(clue.id);
                return (
                  <div
                    key={clue.id}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] transition-colors ${
                      discovered
                        ? 'bg-white border-emerald-300 text-slate-900'
                        : 'bg-amber-100/50 border-amber-200/80 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 font-extrabold">
                      <span>{clue.label}</span>
                      {discovered && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <p className="leading-snug text-[10px]">
                      {discovered ? clue.notebookNote : 'Clear a matching triple to uncover...'}
                    </p>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </ChapterGameShell>
  );
}
