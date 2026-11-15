import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  HelpCircle,
  Lock,
  Music,
  Package,
  Play,
  RotateCcw,
  Shuffle,
  Sparkles,
  VolumeX,
} from 'lucide-react';
import { playChime } from '../../../utils/soundEffects.ts';
import { useGameMusic } from '../../../utils/gameMusic.ts';
import { ChapterGameShell } from './ChapterGameShell.tsx';

interface Ch2ConnectHabitatGameProps {
  onFinish: () => void;
}

type HabitatKind = 'lamp' | 'pump' | 'power' | 'radio' | 'greenhouse' | 'meal';

interface HabitatTypeMeta {
  kind: HabitatKind;
  label: string;
  symbol: string;
  connectionNote: string;
  accentBg: string;
}

const HABITAT_META: Record<HabitatKind, HabitatTypeMeta> = {
  lamp: {
    kind: 'lamp',
    label: 'Grow Lamp',
    symbol: '💡',
    connectionNote: 'The growing lamp needs electricity to shine on plants.',
    accentBg: 'bg-amber-50 border-amber-400',
  },
  pump: {
    kind: 'pump',
    label: 'Water Pump',
    symbol: '🚰',
    connectionNote: 'The water pump needs electricity to push nutrient water.',
    accentBg: 'bg-sky-50 border-sky-400',
  },
  power: {
    kind: 'power',
    label: 'Power Unit',
    symbol: '⚡',
    connectionNote: 'The power unit supplies electricity to lamps, pumps, and radios.',
    accentBg: 'bg-yellow-50 border-yellow-500',
  },
  radio: {
    kind: 'radio',
    label: 'Radio',
    symbol: '📻',
    connectionNote: 'The radio needs power and an antenna to talk with Earth.',
    accentBg: 'bg-indigo-50 border-indigo-400',
  },
  greenhouse: {
    kind: 'greenhouse',
    label: 'Greenhouse',
    symbol: '🌱',
    connectionNote: 'The greenhouse needs water from the pump and light from lamps.',
    accentBg: 'bg-emerald-50 border-emerald-400',
  },
  meal: {
    kind: 'meal',
    label: 'Stored Meals',
    symbol: '🍱',
    connectionNote: 'Stored meals stay separate as safe backup food for the crew!',
    accentBg: 'bg-orange-50 border-orange-400',
  },
};

interface MahjongTile {
  id: string;
  kind: HabitatKind;
  layer: 0 | 1;
  row: number; // 0..3
  col: number; // 0..3
  removed: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// 24 tiles total (12 pairs: 4 tiles of each of the 6 habitat items) across 2 stacked layers
function buildMahjongBoard(): MahjongTile[] {
  const deck = shuffle<HabitatKind>([
    'lamp', 'lamp', 'lamp', 'lamp',
    'pump', 'pump', 'pump', 'pump',
    'power', 'power', 'power', 'power',
    'radio', 'radio', 'radio', 'radio',
    'greenhouse', 'greenhouse', 'greenhouse', 'greenhouse',
    'meal', 'meal', 'meal', 'meal',
  ]);

  const coords: Array<{ layer: 0 | 1; row: number; col: number }> = [];
  // Layer 1 (top stack): 2 center rows (1..2) x 4 cols (0..3) = 8 tiles
  for (let row = 1; row <= 2; row++) {
    for (let col = 0; col < 4; col++) {
      coords.push({ layer: 1, row, col });
    }
  }
  // Layer 0 (base): 4 rows (0..3) x 4 cols (0..3) = 16 tiles
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      coords.push({ layer: 0, row, col });
    }
  }

  return coords.map((pos, idx) => ({
    id: `mj-${idx}`,
    kind: deck[idx],
    layer: pos.layer,
    row: pos.row,
    col: pos.col,
    removed: false,
  }));
}

function getBlockedReason(tile: MahjongTile, allTiles: MahjongTile[]): string | null {
  if (tile.removed) return 'Already matched';
  const live = allTiles.filter((t) => !t.removed && t.id !== tile.id);
  const coveredAbove = live.some(
    (other) => other.layer > tile.layer && other.row === tile.row && other.col === tile.col
  );
  if (coveredAbove) return 'Blocked! Another tile is stacked right on top of it.';

  const blockedLeft = live.some(
    (other) => other.layer === tile.layer && other.row === tile.row && other.col === tile.col - 1
  );
  const blockedRight = live.some(
    (other) => other.layer === tile.layer && other.row === tile.row && other.col === tile.col + 1
  );
  if (blockedLeft && blockedRight) {
    return 'Blocked! Both left and right sides are closed—clear an outer tile first!';
  }
  return null;
}

const CONNECTION_QUESTIONS = [
  { id: 'c-pump', label: 'The water pump needs electricity from the power unit.', isCorrect: true },
  {
    id: 'c-gh',
    label: 'The greenhouse grows crops with light and water, separate from stored backup meals.',
    isCorrect: true,
  },
  { id: 'c-bad', label: 'Radios grow leaves on their own without electricity.', isCorrect: false },
];

export function Ch2ConnectHabitatGame({ onFinish }: Ch2ConnectHabitatGameProps) {
  const [phase, setPhase] = useState<'intro' | 'play' | 'complete'>('intro');
  const [tiles, setTiles] = useState<MahjongTile[]>(buildMahjongBoard);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [blockedTileId, setBlockedTileId] = useState<string | null>(null);
  const [wrongShakeIds, setWrongShakeIds] = useState<string[]>([]);
  const [unlockedKinds, setUnlockedKinds] = useState<HabitatKind[]>([]);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [hintIds, setHintIds] = useState<string[]>([]);
  const [pickedConnections, setPickedConnections] = useState<string[]>([]);
  const [reaction, setReaction] = useState(
    'Dr. Elena: "Read the guide, press Start Matching, and clear all 24 tiles!"'
  );

  const { musicOn, startMusic, stopMusic, toggleMusic } = useGameMusic('playful');

  const liveTiles = useMemo(() => tiles.filter((t) => !t.removed), [tiles]);
  const boardCleared = liveTiles.length === 0;

  const availableTiles = useMemo(
    () => liveTiles.filter((t) => getBlockedReason(t, tiles) === null),
    [liveTiles, tiles]
  );

  const availablePairsCount = useMemo(() => {
    const counts = new Map<HabitatKind, number>();
    for (const t of availableTiles) {
      counts.set(t.kind, (counts.get(t.kind) || 0) + 1);
    }
    let pairs = 0;
    for (const c of counts.values()) {
      pairs += Math.floor(c / 2);
    }
    return pairs;
  }, [availableTiles]);

  const handleTileTap = (tile: MahjongTile) => {
    const blocked = getBlockedReason(tile, tiles);
    if (blocked) {
      playChime('gentle');
      setBlockedTileId(tile.id);
      setReaction(blocked);
      window.setTimeout(() => setBlockedTileId(null), 900);
      return;
    }

    setBlockedTileId(null);
    setHintIds([]);

    if (!selectedId) {
      playChime('button');
      setSelectedId(tile.id);
      setReaction(`Picked ${HABITAT_META[tile.kind].label}. Now tap its open match!`);
      return;
    }

    if (selectedId === tile.id) {
      setSelectedId(null);
      return;
    }

    const first = tiles.find((t) => t.id === selectedId);
    if (!first) {
      setSelectedId(tile.id);
      return;
    }

    if (first.kind === tile.kind) {
      playChime('success');
      const nextTiles = tiles.map((t) =>
        t.id === first.id || t.id === tile.id ? { ...t, removed: true } : t
      );
      setTiles(nextTiles);
      setSelectedId(null);

      const meta = HABITAT_META[tile.kind];
      setUnlockedKinds((prev) => (prev.includes(tile.kind) ? prev : [...prev, tile.kind]));

      if (nextTiles.every((t) => t.removed)) {
        setReaction('All 24 tiles cleared! Pick TWO true habitat connections on the right to finish!');
      } else {
        setReaction(`${meta.symbol} ${meta.connectionNote}`);
      }
    } else {
      playChime('gentle');
      setWrongShakeIds([first.id, tile.id]);
      setSelectedId(null);
      setReaction('Not a match! Those tiles stay on the board—try another open pair.');
      window.setTimeout(() => setWrongShakeIds([]), 450);
    }
  };

  const handleHint = () => {
    if (hintsLeft <= 0 || boardCleared) return;
    for (let i = 0; i < availableTiles.length; i++) {
      for (let j = i + 1; j < availableTiles.length; j++) {
        if (availableTiles[i].kind === availableTiles[j].kind) {
          playChime('pop');
          setHintsLeft((h) => h - 1);
          setHintIds([availableTiles[i].id, availableTiles[j].id]);
          setReaction(`Hint highlighted: match ${HABITAT_META[availableTiles[i].kind].label}!`);
          return;
        }
      }
    }
    setReaction('No open matches right now—tap Reshuffle to rearrange remaining tiles!');
  };

  const handleReshuffle = () => {
    if (boardCleared) return;
    playChime('pop');
    const remainingKinds = shuffle(liveTiles.map((t) => t.kind));
    let idx = 0;
    setTiles((prev) =>
      prev.map((t) => (t.removed ? t : { ...t, kind: remainingKinds[idx++] }))
    );
    setSelectedId(null);
    setHintIds([]);
    setReaction('Remaining tiles reshuffled cleanly!');
  };

  const handleToggleConnection = (id: string, isCorrect: boolean) => {
    if (phase === 'complete') return;
    if (!isCorrect) {
      playChime('gentle');
      setReaction('Remember Elena’s rule: "Nothing works alone"—radios need electricity too!');
      return;
    }
    if (pickedConnections.includes(id)) return;
    const next = [...pickedConnections, id];
    setPickedConnections(next);
    playChime('success');
    if (next.length === 2) {
      setPhase('complete');
      stopMusic();
      setReaction('Elena, Maya & Sathya: "Nothing works alone! The Mars habitat is connected!"');
      onFinish();
    } else {
      setReaction('Great connection identified! Pick one more true system connection.');
    }
  };

  const handleReset = () => {
    playChime('button');
    setTiles(buildMahjongBoard());
    setSelectedId(null);
    setBlockedTileId(null);
    setWrongShakeIds([]);
    setUnlockedKinds([]);
    setHintsLeft(3);
    setHintIds([]);
    setPickedConnections([]);
    setPhase('play');
    setReaction('Match the tiles. Discover what keeps the habitat working!');
  };

  return (
    <ChapterGameShell
      instruction="Match the tiles. Discover what keeps the habitat working!"
      reaction={reaction}
    >
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
        <span className="text-slate-700 font-mono-tabular">
          Tiles Left: {liveTiles.length} / 24 · Open Pairs: {availablePairsCount}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={toggleMusic}
            className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700"
          >
            {musicOn ? <VolumeX className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5" />}
            {musicOn ? 'Mute' : 'Music'}
          </button>
          {phase === 'play' && (
            <>
              <button
                type="button"
                disabled={hintsLeft <= 0 || boardCleared}
                onClick={handleHint}
                className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 disabled:opacity-50"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Hint ({hintsLeft})
              </button>
              <button
                type="button"
                disabled={boardCleared}
                onClick={handleReshuffle}
                className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 disabled:opacity-50"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Reshuffle
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart
          </button>
        </div>
      </div>

      {phase === 'intro' ? (
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <p className="text-xs font-bold text-lime-300 mb-0.5">Chapter 2 Tile Matching</p>
              <h2 className="text-xl font-extrabold">Connect the Mission</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                playChime('pop');
                startMusic();
                setPhase('play');
                setReaction('Match open identical tiles! Uncover bottom tiles layer by layer.');
              }}
              className="min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-lime-300 hover:bg-lime-200 text-slate-950 text-sm font-extrabold shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Matching!
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-lime-300 text-sm">1. Match 24 Stacked Tiles</p>
              <p className="text-slate-200">
                Match two identical tiles that are uncovered and have an open left or right edge!
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-sky-300 text-sm">2. Connect the Habitat</p>
              <p className="text-slate-200">
                Each match adds that system to the diagram—while Stored Meals stay separate as backup food.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-amber-300 text-sm">3. Hints &amp; Reshuffle</p>
              <p className="text-slate-200">
                Blocked tiles never cost lives! Use 3 hints or Reshuffle anytime, then pick 2 connections to win.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Stacked 24-Tile Board */}
          <div className="lg:col-span-7 bg-emerald-950 rounded-2xl border border-emerald-800 p-3 sm:p-4">
            {!boardCleared ? (
              <div className="relative mx-auto w-full max-w-[440px] aspect-[4/3.6]">
                {/* Base Layer (Layer 0) */}
                {tiles
                  .filter((t) => t.layer === 0 && !t.removed)
                  .map((tile) => {
                    const meta = HABITAT_META[tile.kind];
                    const isBlocked = getBlockedReason(tile, tiles) !== null;
                    const isSel = selectedId === tile.id;
                    const isHint = hintIds.includes(tile.id);
                    const isShaking = wrongShakeIds.includes(tile.id);
                    const isWarnBlocked = blockedTileId === tile.id;
                    return (
                      <button
                        key={tile.id}
                        type="button"
                        onClick={() => handleTileTap(tile)}
                        style={{
                          left: `${tile.col * 25}%`,
                          top: `${tile.row * 25}%`,
                          width: '23.2%',
                          height: '22.5%',
                          zIndex: 5 + tile.row,
                        }}
                        className={`absolute rounded-xl border-2 border-b-4 p-1 flex flex-col items-center justify-center transition-transform ${
                          isShaking ? 'animate-gentle-shake bg-rose-100 border-rose-400' : ''
                        } ${
                          isWarnBlocked
                            ? 'bg-amber-200 border-amber-500 text-slate-950'
                            : isSel
                            ? 'bg-lime-300 border-slate-900 text-slate-950 scale-105'
                            : isHint
                            ? 'bg-sky-200 border-sky-500 text-slate-950 ring-2 ring-white'
                            : isBlocked
                            ? 'bg-slate-400/90 border-slate-600 text-slate-700'
                            : `${meta.accentBg} text-slate-900 hover:scale-[1.03]`
                        }`}
                      >
                        {isBlocked && (
                          <Lock className="w-3 h-3 text-slate-700 absolute top-1 right-1" />
                        )}
                        <span className="text-xl leading-none" aria-hidden="true">{meta.symbol}</span>
                        <span className="text-[10px] font-extrabold truncate max-w-full mt-0.5">
                          {meta.label}
                        </span>
                      </button>
                    );
                  })}

                {/* Top Stacked Layer (Layer 1, slightly offset up-left for crisp 3D depth) */}
                {tiles
                  .filter((t) => t.layer === 1 && !t.removed)
                  .map((tile) => {
                    const meta = HABITAT_META[tile.kind];
                    const isBlocked = getBlockedReason(tile, tiles) !== null;
                    const isSel = selectedId === tile.id;
                    const isHint = hintIds.includes(tile.id);
                    const isShaking = wrongShakeIds.includes(tile.id);
                    const isWarnBlocked = blockedTileId === tile.id;
                    return (
                      <button
                        key={tile.id}
                        type="button"
                        onClick={() => handleTileTap(tile)}
                        style={{
                          left: `calc(${tile.col * 25}% - 5px)`,
                          top: `calc(${tile.row * 25}% - 6px)`,
                          width: '23.2%',
                          height: '22.5%',
                          zIndex: 25 + tile.row,
                        }}
                        className={`absolute rounded-xl border-2 border-b-4 shadow-lg p-1 flex flex-col items-center justify-center transition-transform ${
                          isShaking ? 'animate-gentle-shake bg-rose-100 border-rose-400' : ''
                        } ${
                          isWarnBlocked
                            ? 'bg-amber-200 border-amber-500 text-slate-950'
                            : isSel
                            ? 'bg-lime-300 border-slate-900 text-slate-950 scale-105'
                            : isHint
                            ? 'bg-sky-200 border-sky-500 text-slate-950 ring-2 ring-white'
                            : isBlocked
                            ? 'bg-slate-200 border-slate-400 text-slate-600'
                            : 'bg-white border-emerald-500 text-slate-900 hover:bg-lime-50 hover:scale-[1.03]'
                        }`}
                      >
                        {isBlocked && (
                          <Lock className="w-3 h-3 text-slate-500 absolute top-1 right-1" />
                        )}
                        <span className="text-xl leading-none" aria-hidden="true">{meta.symbol}</span>
                        <span className="text-[10px] font-extrabold truncate max-w-full mt-0.5">
                          {meta.label}
                        </span>
                      </button>
                    );
                  })}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-emerald-900/70 border border-lime-300 text-white text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-lime-300 mx-auto" />
                <p className="text-base font-extrabold">All 24 Habitat Tiles Cleared!</p>
                <p className="text-xs text-emerald-100">
                  Pick TWO true habitat connections on the right to complete the mission!
                </p>
              </div>
            )}
          </div>

          {/* Connected Habitat Systems + Stored Meals Separate */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <h2 className="text-xs font-extrabold text-slate-900 inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                Connected Habitat ({unlockedKinds.filter((k) => k !== 'meal').length}/5)
              </h2>
              <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                {(['power', 'lamp', 'pump', 'radio', 'greenhouse'] as HabitatKind[]).map((k) => {
                  const meta = HABITAT_META[k];
                  const active = unlockedKinds.includes(k);
                  return (
                    <div
                      key={k}
                      className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-2 ${
                        active
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="text-base shrink-0">{active ? meta.symbol : '◻️'}</span>
                      <div className="min-w-0">
                        <span className="font-bold">{meta.label}</span>
                        {active && (
                          <span className="block text-[10px] text-emerald-800 truncate">
                            {meta.connectionNote}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-1.5 border-t border-slate-200">
                <p className="text-[10px] font-bold text-sky-800 mb-1 inline-flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  Separate Backup Food Storage
                </p>
                <div
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] flex items-center gap-2 ${
                    unlockedKinds.includes('meal')
                      ? 'bg-sky-50 border-sky-300 text-sky-950'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="text-base shrink-0">
                    {unlockedKinds.includes('meal') ? '🍱' : '◻️'}
                  </span>
                  <div className="min-w-0">
                    <span className="font-bold">Stored Crew Meals</span>
                    {unlockedKinds.includes('meal') && (
                      <span className="block text-[10px] text-sky-800 truncate">
                        {HABITAT_META.meal.connectionNote}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {boardCleared && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 space-y-1.5">
                <p className="text-xs font-extrabold text-amber-950">
                  Identify TWO true habitat connections ({pickedConnections.length}/2):
                </p>
                {CONNECTION_QUESTIONS.map((q) => {
                  const picked = pickedConnections.includes(q.id);
                  return (
                    <button
                      key={q.id}
                      type="button"
                      disabled={picked || phase === 'complete'}
                      onClick={() => handleToggleConnection(q.id, q.isCorrect)}
                      className={`w-full min-h-[38px] px-2.5 py-1.5 rounded-lg border text-left text-[11px] font-semibold flex items-center justify-between gap-2 ${
                        picked
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                          : 'bg-white border-amber-200 hover:border-slate-900 text-slate-800'
                      }`}
                    >
                      <span>{q.label}</span>
                      {picked && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </ChapterGameShell>
  );
}
