import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bot,
  CheckCircle2,
  Heart,
  Music,
  Play,
  RotateCcw,
  Sparkles,
  VolumeX,
  Zap,
} from 'lucide-react';
import { playChime } from '../../../utils/soundEffects.ts';
import { useGameMusic } from '../../../utils/gameMusic.ts';
import { ChapterGameShell } from './ChapterGameShell.tsx';

interface Ch1BuildDreamGameProps {
  onFinish: () => void;
}

type CharacterId = 'maya' | 'sathya';
type SupplyId = 'water' | 'lamp' | 'nutrients' | 'vent' | 'temp';
type TileKind = 'open' | 'wall' | 'block' | 'cracked' | 'station';

interface SupplyDef {
  id: SupplyId;
  name: string;
  symbol: string;
  needLabel: string;
  pos: [number, number];
}

interface PulsePod {
  id: number;
  r: number;
  c: number;
  ticksLeft: number;
}

interface RobotState {
  id: string;
  r: number;
  c: number;
  dr: number;
  dc: number;
  stunTicks: number;
}

const ROWS = 7;
const COLS = 9;
const STATION_POS: [number, number] = [3, 4];
const SPAWN_POS: [number, number] = [0, 0];

const SUPPLIES: SupplyDef[] = [
  { id: 'water', name: 'Water Tank', symbol: '💧', needLabel: 'Water for roots to drink', pos: [0, 8] },
  { id: 'lamp', name: 'Growing Lamp', symbol: '💡', needLabel: 'Light for making food', pos: [3, 0] },
  { id: 'nutrients', name: 'Nutrient Pack', symbol: '🧪', needLabel: 'Nutrients & minerals', pos: [3, 8] },
  { id: 'vent', name: 'Ventilation Unit', symbol: '🌬️', needLabel: 'Fresh airflow & CO₂', pos: [6, 0] },
  { id: 'temp', name: 'Temperature Controller', symbol: '🌡️', needLabel: 'Warmth to avoid freezing', pos: [6, 8] },
];

function buildInitialGrid(): TileKind[][] {
  const layout: string[] = [
    '.......B.',
    '.#C#.#C#B',
    'B.......B',
    '.#.#S#.#.',
    'B.......B',
    'B#C#.#C#B',
    '.B.....B.',
  ];
  return layout.map((row) =>
    row.split('').map((ch): TileKind => {
      if (ch === '#') return 'wall';
      if (ch === 'B') return 'block';
      if (ch === 'C') return 'cracked';
      if (ch === 'S') return 'station';
      return 'open';
    })
  );
}

function getBlastCells(grid: TileKind[][], r: number, c: number): Array<[number, number]> {
  const cells: Array<[number, number]> = [[r, c]];
  const dirs: Array<[number, number]> = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] !== 'wall') {
      cells.push([nr, nc]);
    }
  }
  return cells;
}

const ALL_DIRS: Array<[number, number]> = [
  [-1, 0], // Up
  [1, 0],  // Down
  [0, -1], // Left
  [0, 1],  // Right
];

export function Ch1BuildDreamGame({ onFinish }: Ch1BuildDreamGameProps) {
  const [character, setCharacter] = useState<CharacterId>('maya');
  const [phase, setPhase] = useState<'intro' | 'maze' | 'match' | 'complete'>('intro');

  const [grid, setGrid] = useState<TileKind[][]>(buildInitialGrid);
  const [playerPos, setPlayerPos] = useState<[number, number]>(SPAWN_POS);
  const [hearts, setHearts] = useState(3);
  const [carryingIds, setCarryingIds] = useState<SupplyId[]>([]);
  const [deliveredIds, setDeliveredIds] = useState<SupplyId[]>([]);
  const [pods, setPods] = useState<PulsePod[]>([]);
  const [flashBlastCells, setFlashBlastCells] = useState<Array<[number, number]>>([]);
  const [robots, setRobots] = useState<RobotState[]>([
    { id: 'rob-1', r: 2, c: 4, dr: 0, dc: 1, stunTicks: 0 },
    { id: 'rob-2', r: 4, c: 4, dr: -1, dc: 0, stunTicks: 0 },
  ]);
  const [knockoutReason, setKnockoutReason] = useState<string | null>(null);
  const [reaction, setReaction] = useState(
    'Read the instructions, choose Maya or Sathya, and press Start Rescue!'
  );

  const [selectedSupply, setSelectedSupply] = useState<SupplyId | null>('water');
  const [matchedNeeds, setMatchedNeeds] = useState<SupplyId[]>([]);

  const podIdRef = useRef(1);
  const knockoutLockRef = useRef(false);
  const { musicOn, startMusic, stopMusic, toggleMusic } = useGameMusic('bomberman');

  const charName = character === 'maya' ? 'Maya' : 'Sathya';
  const charEmoji = character === 'maya' ? '👩‍🚀' : '🧑‍🚀';

  const restartLevel = useCallback((customMsg?: string, goStraightToMaze = true) => {
    knockoutLockRef.current = false;
    setGrid(buildInitialGrid());
    setPlayerPos(SPAWN_POS);
    setHearts(3);
    setCarryingIds([]);
    setDeliveredIds([]);
    setPods([]);
    setFlashBlastCells([]);
    setRobots([
      { id: 'rob-1', r: 2, c: 4, dr: 0, dc: 1, stunTicks: 0 },
      { id: 'rob-2', r: 4, c: 4, dr: -1, dc: 0, stunTicks: 0 },
    ]);
    setKnockoutReason(null);
    setPhase(goStraightToMaze ? 'maze' : 'intro');
    setMatchedNeeds([]);
    setSelectedSupply('water');
    setReaction(
      customMsg ||
        'Clear blocks with Pulse Pods, dodge toy robots & cracks, and bring all 5 supplies to the center garden!'
    );
  }, []);

  const triggerKnockout = useCallback(
    (reason: string) => {
      if (knockoutLockRef.current || phase !== 'maze') return;
      knockoutLockRef.current = true;
      playChime('gentle');
      setKnockoutReason(reason);

      setHearts((prev) => {
        const nextHearts = prev - 1;
        window.setTimeout(() => {
          if (nextHearts <= 0) {
            restartLevel(
              `${charName} used all 3 hearts! Level restarted—let’s try again cleanly!`,
              true
            );
          } else {
            knockoutLockRef.current = false;
            setKnockoutReason(null);
            setPlayerPos(SPAWN_POS);
            setCarryingIds([]);
            setReaction(
              `${reason} ${nextHearts} ${nextHearts === 1 ? 'heart' : 'hearts'} left—delivered supplies stay safe!`
            );
          }
        }, 850);
        return nextHearts;
      });
    },
    [charName, phase, restartLevel]
  );

  const movePlayer = useCallback(
    (dr: number, dc: number) => {
      if (phase !== 'maze' || knockoutLockRef.current) return;
      const nr = playerPos[0] + dr;
      const nc = playerPos[1] + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return;
      const targetTile = grid[nr][nc];
      if (targetTile === 'wall' || targetTile === 'block') return;
      if (pods.some((p) => p.r === nr && p.c === nc)) return;

      playChime('button');
      setPlayerPos([nr, nc]);

      if (targetTile === 'cracked') {
        triggerKnockout('Oops! Stepped on a cracked floor tile!');
        return;
      }

      if (robots.some((rob) => rob.stunTicks === 0 && rob.r === nr && rob.c === nc)) {
        triggerKnockout('Bonk! Bumped into a moving toy robot!');
        return;
      }

      const supplyHere = SUPPLIES.find(
        (s) =>
          s.pos[0] === nr &&
          s.pos[1] === nc &&
          !carryingIds.includes(s.id) &&
          !deliveredIds.includes(s.id)
      );
      if (supplyHere) {
        playChime('pop');
        const nextCarry = [...carryingIds, supplyHere.id];
        setCarryingIds(nextCarry);
        setReaction(
          `${charName} picked up ${supplyHere.name}! Bring it to the Center Garden Station!`
        );
      }

      if (nr === STATION_POS[0] && nc === STATION_POS[1] && carryingIds.length > 0) {
        playChime('success');
        const nextDelivered = Array.from(new Set([...deliveredIds, ...carryingIds]));
        setDeliveredIds(nextDelivered);
        setCarryingIds([]);
        if (nextDelivered.length === SUPPLIES.length) {
          setPhase('match');
          setReaction(
            'All 5 garden supplies delivered! Now match each supply to the plant need it supports!'
          );
        } else {
          setReaction(
            `Delivered! (${nextDelivered.length}/5 supplies safe at the garden station!)`
          );
        }
      }
    },
    [carryingIds, charName, deliveredIds, grid, phase, playerPos, pods, robots, triggerKnockout]
  );

  const dropPulsePod = useCallback(() => {
    if (phase !== 'maze' || knockoutLockRef.current) return;
    const [r, c] = playerPos;
    if (pods.some((p) => p.r === r && p.c === c)) return;
    if (pods.length >= 2) {
      setReaction('Wait for a pulse pod to pop before dropping another!');
      return;
    }
    playChime('pop');
    const nextPod: PulsePod = { id: podIdRef.current++, r, c, ticksLeft: 6 };
    setPods((prev) => [...prev, nextPod]);
    setReaction('Pulse Pod set! Move diagonally or 2 steps out of the yellow blast area!');
  }, [phase, playerPos, pods]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'maze') return;
      if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); movePlayer(-1, 0); }
      else if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); movePlayer(1, 0); }
      else if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); movePlayer(0, -1); }
      else if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); movePlayer(0, 1); }
      else if (e.key === ' ') { e.preventDefault(); dropPulsePod(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dropPulsePod, movePlayer, phase]);

  const stateRef = useRef({ grid, playerPos, robots });
  stateRef.current = { grid, playerPos, robots };

  useEffect(() => {
    if (phase !== 'maze') return;
    const interval = window.setInterval(() => {
      if (knockoutLockRef.current) return;

      setPods((prevPods) => {
        if (prevPods.length === 0) return prevPods;
        const detonating: PulsePod[] = [];
        const remaining: PulsePod[] = [];
        for (const p of prevPods) {
          if (p.ticksLeft <= 1) detonating.push(p);
          else remaining.push({ ...p, ticksLeft: p.ticksLeft - 1 });
        }

        if (detonating.length > 0) {
          const allBlastCells: Array<[number, number]> = [];
          const { grid: curGrid, playerPos: curPlayer } = stateRef.current;
          const nextGrid = curGrid.map((row) => [...row]);

          for (const pod of detonating) {
            const cells = getBlastCells(nextGrid, pod.r, pod.c);
            for (const [br, bc] of cells) {
              allBlastCells.push([br, bc]);
              if (nextGrid[br][bc] === 'block') {
                nextGrid[br][bc] = 'open';
              }
            }
          }

          setGrid(nextGrid);
          setFlashBlastCells(allBlastCells);
          playChime('star');
          window.setTimeout(() => setFlashBlastCells([]), 380);

          setRobots((prevRobs) =>
            prevRobs.map((rob) =>
              allBlastCells.some(([br, bc]) => br === rob.r && bc === rob.c)
                ? { ...rob, stunTicks: 10 }
                : rob
            )
          );

          if (allBlastCells.some(([br, bc]) => br === curPlayer[0] && bc === curPlayer[1])) {
            triggerKnockout('Zap! Caught inside the pulse-pod blast!');
          }
        }
        return remaining;
      });
    }, 350);

    return () => window.clearInterval(interval);
  }, [phase, triggerKnockout]);

  // 4-Directional Toy Robot Movement (Up, Down, Left, Right across open tiles)
  useEffect(() => {
    if (phase !== 'maze') return;
    const robotTimer = window.setInterval(() => {
      if (knockoutLockRef.current) return;
      setRobots((prevRobs) => {
        const { playerPos: curPlayer, grid: curGrid } = stateRef.current;
        const nextRobs = prevRobs.map((rob) => {
          if (rob.stunTicks > 0) {
            return { ...rob, stunTicks: rob.stunTicks - 1 };
          }

          // Gather valid open 4-way neighbors (avoid walls, blocks, cracked tiles, central station, and safe spawn (0,0))
          const isWalkable = (rr: number, cc: number) =>
            rr >= 0 &&
            rr < ROWS &&
            cc >= 0 &&
            cc < COLS &&
            curGrid[rr][cc] === 'open' &&
            !(rr === SPAWN_POS[0] && cc === SPAWN_POS[1]) &&
            !(rr === STATION_POS[0] && cc === STATION_POS[1]);

          const validMoves = ALL_DIRS.filter(([dr, dc]) => isWalkable(rob.r + dr, rob.c + dc));
          if (validMoves.length === 0) return rob;

          // Keep current direction ~60% of the time if valid, otherwise pick among valid non-backtrack turns (all 4 directions!)
          const forwardValid = isWalkable(rob.r + rob.dr, rob.c + rob.dc);
          const nonReverse = validMoves.filter(([dr, dc]) => !(dr === -rob.dr && dc === -rob.dc));
          let chosen: [number, number];
          if (forwardValid && nonReverse.length <= 1) {
            chosen = [rob.dr, rob.dc];
          } else if (forwardValid && Math.random() < 0.55) {
            chosen = [rob.dr, rob.dc];
          } else if (nonReverse.length > 0) {
            chosen = nonReverse[Math.floor(Math.random() * nonReverse.length)];
          } else {
            chosen = validMoves[Math.floor(Math.random() * validMoves.length)];
          }

          return {
            ...rob,
            r: rob.r + chosen[0],
            c: rob.c + chosen[1],
            dr: chosen[0],
            dc: chosen[1],
          };
        });

        if (nextRobs.some((r) => r.stunTicks === 0 && r.r === curPlayer[0] && r.c === curPlayer[1])) {
          triggerKnockout('Bonk! A moving toy robot bumped you!');
        }
        return nextRobs;
      });
    }, 680);
    return () => window.clearInterval(robotTimer);
  }, [phase, triggerKnockout]);

  const handleMatchNeed = (needSupplyId: SupplyId) => {
    if (!selectedSupply || matchedNeeds.includes(needSupplyId)) return;
    if (selectedSupply === needSupplyId) {
      const next = [...matchedNeeds, needSupplyId];
      setMatchedNeeds(next);
      playChime('success');
      const nextUnmatched = SUPPLIES.find((s) => !next.includes(s.id));
      setSelectedSupply(nextUnmatched ? nextUnmatched.id : null);
      if (next.length === SUPPLIES.length) {
        setPhase('complete');
        stopMusic();
        setReaction('Maya & Sathya: "All 5 plant needs matched! Our space garden is thriving!"');
        onFinish();
      } else {
        setReaction(`Right match! ${SUPPLIES.length - next.length} plant needs left!`);
      }
    } else {
      playChime('gentle');
      setReaction('Think about what that garden supply gives the plant—try another match!');
    }
  };

  const warnedCells = new Set<string>();
  for (const pod of pods) {
    for (const [br, bc] of getBlastCells(grid, pod.r, pod.c)) {
      warnedCells.add(`${br},${bc}`);
    }
  }
  const flashSet = new Set(flashBlastCells.map(([r, c]) => `${r},${c}`));

  return (
    <ChapterGameShell
      instruction="Dodge obstacles, escape the pulse, and collect five supplies!"
      reaction={reaction}
    >
      {/* Top HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Play as:</span>
          {(['maya', 'sathya'] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                playChime('button');
                setCharacter(id);
              }}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-colors ${
                character === id
                  ? 'bg-slate-900 text-lime-300 border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              {id === 'maya' ? '👩‍🚀 Maya' : '🧑‍🚀 Sathya'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5" aria-label={`Hearts: ${hearts} of 3`}>
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              className={`w-6 h-6 transition-transform ${
                i < hearts ? 'fill-rose-500 text-rose-600 scale-100' : 'text-slate-300 scale-90'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="font-mono-tabular text-emerald-700">
            Delivered: {deliveredIds.length} / 5
          </span>
          <button
            type="button"
            onClick={toggleMusic}
            className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          >
            {musicOn ? <VolumeX className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5" />}
            {musicOn ? 'Mute' : 'Music'}
          </button>
          <button
            type="button"
            onClick={() => {
              playChime('button');
              restartLevel(undefined, true);
            }}
            className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart
          </button>
        </div>
      </div>

      {phase === 'intro' ? (
        /* Clear Pre-Game Instructions Card */
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <p className="text-xs font-bold text-lime-300 mb-0.5">Mission Guide · Before You Start</p>
              <h2 className="text-xl font-extrabold">How to Play Maya’s Garden Rescue</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                playChime('pop');
                startMusic();
                setPhase('maze');
                setReaction(`${charName}: "Let’s rescue all 5 garden supplies!"`);
              }}
              className="min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-lime-300 hover:bg-lime-200 text-slate-950 text-sm font-extrabold shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Rescue!
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="text-sm font-extrabold text-lime-300">1. Move &amp; Collect</p>
              <p className="text-slate-200 leading-relaxed">
                Use Arrow / WASD keys or touch buttons to collect 5 supplies (💧 💡 🧪 🌬️ 🌡️) and bring them to 🪴 Center Garden.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="text-sm font-extrabold text-amber-300">2. Drop Pulse Pods</p>
              <p className="text-slate-200 leading-relaxed">
                Press <strong>Space</strong> or <strong>Drop Pulse Pod</strong> next to 📦 blocks, then step out of the glowing yellow blast zone!
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="text-sm font-extrabold text-rose-300">3. Dodge Hazards</p>
              <p className="text-slate-200 leading-relaxed">
                Avoid toy robots patrolling in all directions, cracked floor tiles, and your own blast—each bump costs 1 of 3 hearts.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="text-sm font-extrabold text-sky-300">4. Safe Respawns</p>
              <p className="text-slate-200 leading-relaxed">
                Delivered supplies stay safe if you respawn! Losing all 3 hearts resets the level cleanly.
              </p>
            </div>
          </div>
        </div>
      ) : phase === 'maze' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-8 bg-slate-900 rounded-2xl p-2.5 sm:p-3 border border-slate-800 relative overflow-hidden">
            {knockoutReason && (
              <div className="absolute inset-0 z-20 bg-slate-950/75 flex flex-col items-center justify-center text-white p-4 text-center">
                <span className="text-4xl mb-2" aria-hidden="true">💫</span>
                <p className="text-lg font-extrabold text-amber-300">{knockoutReason}</p>
                <p className="text-xs text-slate-200 mt-1">Respawning safely at start...</p>
              </div>
            )}

            <div className="grid grid-cols-9 gap-1 max-w-[445px] mx-auto">
              {grid.map((row, r) =>
                row.map((tile, c) => {
                  const key = `${r},${c}`;
                  const isPlayer = playerPos[0] === r && playerPos[1] === c;
                  const pod = pods.find((p) => p.r === r && p.c === c);
                  const robot = robots.find((rob) => rob.r === r && rob.c === c);
                  const supply = SUPPLIES.find(
                    (s) =>
                      s.pos[0] === r &&
                      s.pos[1] === c &&
                      !carryingIds.includes(s.id) &&
                      !deliveredIds.includes(s.id)
                  );
                  const isWarned = warnedCells.has(key);
                  const isFlashing = flashSet.has(key);

                  return (
                    <div
                      key={key}
                      className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative select-none text-xs ${
                        isFlashing
                          ? 'bg-amber-400 border-white text-slate-950'
                          : tile === 'wall'
                          ? 'bg-slate-800 border-slate-700'
                          : tile === 'block'
                          ? 'bg-amber-800 border-amber-600 text-amber-200'
                          : tile === 'cracked'
                          ? 'bg-stone-700 border-amber-500/70 text-amber-200'
                          : tile === 'station'
                          ? 'bg-emerald-900 border-lime-300 text-lime-200'
                          : isWarned
                          ? 'bg-amber-500/35 border-amber-400 text-white'
                          : 'bg-slate-100 border-slate-300 text-slate-900'
                      }`}
                    >
                      {tile === 'block' && <span className="text-base" aria-hidden="true">📦</span>}
                      {tile === 'cracked' && !isPlayer && (
                        <span className="text-[10px] font-bold text-amber-300" title="Cracked floor">⚡Crack</span>
                      )}
                      {tile === 'station' && !isPlayer && (
                        <span className="text-base" title="Central Garden Station">🪴</span>
                      )}
                      {supply && !isPlayer && (
                        <span className="text-lg animate-bounce" title={supply.name}>
                          {supply.symbol}
                        </span>
                      )}
                      {pod && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 text-lime-300 font-mono-tabular font-extrabold text-[11px]">
                          {Math.ceil(pod.ticksLeft / 2)}
                        </span>
                      )}
                      {robot && !isPlayer && (
                        <span
                          className={`inline-flex items-center justify-center ${
                            robot.stunTicks > 0 ? 'opacity-50' : 'text-rose-600'
                          }`}
                          title={robot.stunTicks > 0 ? 'Dizzy Toy Robot' : 'Moving Toy Robot'}
                        >
                          <Bot className="w-5 h-5" />
                        </span>
                      )}
                      {isPlayer && (
                        <span className="text-lg sm:text-xl leading-none z-10" title={charName}>
                          {charEmoji}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-2.5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center gap-2">
              <div className="grid grid-cols-3 gap-1.5 w-40">
                <div />
                <button
                  type="button"
                  onClick={() => movePlayer(-1, 0)}
                  aria-label="Move Up"
                  className="min-h-[40px] rounded-lg bg-slate-900 hover:bg-slate-800 text-lime-300 flex items-center justify-center"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <div />
                <button
                  type="button"
                  onClick={() => movePlayer(0, -1)}
                  aria-label="Move Left"
                  className="min-h-[40px] rounded-lg bg-slate-900 hover:bg-slate-800 text-lime-300 flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => movePlayer(1, 0)}
                  aria-label="Move Down"
                  className="min-h-[40px] rounded-lg bg-slate-900 hover:bg-slate-800 text-lime-300 flex items-center justify-center"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => movePlayer(0, 1)}
                  aria-label="Move Right"
                  className="min-h-[40px] rounded-lg bg-slate-900 hover:bg-slate-800 text-lime-300 flex items-center justify-center"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={dropPulsePod}
                className="w-full min-h-[42px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs inline-flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                Drop Pulse Pod (Space)
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5">
              <p className="text-[11px] font-bold text-slate-500">Five Garden Supplies</p>
              <div className="space-y-1">
                {SUPPLIES.map((s) => {
                  const isDelivered = deliveredIds.includes(s.id);
                  const isCarried = carryingIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] flex items-center justify-between ${
                        isDelivered
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : isCarried
                          ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>
                        {s.symbol} {s.name}
                      </span>
                      <span>
                        {isDelivered ? 'Delivered' : isCarried ? 'Carrying → 🪴' : 'In Maze'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Match Each Garden Supply to the Plant Need It Supports! ({matchedNeeds.length}/5)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-500">1. Pick a Garden Supply</p>
              {SUPPLIES.map((s) => {
                const isMatched = matchedNeeds.includes(s.id);
                const isSelected = selectedSupply === s.id && !isMatched;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => {
                      playChime('button');
                      setSelectedSupply(s.id);
                    }}
                    className={`w-full min-h-[52px] px-4 py-2.5 rounded-xl border text-left text-sm font-bold flex items-center justify-between ${
                      isMatched
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : isSelected
                        ? 'bg-slate-900 border-slate-900 text-lime-300'
                        : 'bg-white border-slate-200 text-slate-900 hover:border-sky-400'
                    }`}
                  >
                    <span>
                      {s.symbol} {s.name}
                    </span>
                    {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-500">2. Tap the Plant Need It Supports</p>
              {[...SUPPLIES]
                .sort((a, b) => a.needLabel.localeCompare(b.needLabel))
                .map((s) => {
                  const isMatched = matchedNeeds.includes(s.id);
                  return (
                    <button
                      key={`need-${s.id}`}
                      type="button"
                      disabled={isMatched}
                      onClick={() => handleMatchNeed(s.id)}
                      className={`w-full min-h-[52px] px-4 py-2.5 rounded-xl border text-left text-sm font-bold flex items-center justify-between ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-lime-500 hover:bg-lime-50'
                      }`}
                    >
                      <span>{s.needLabel}</span>
                      {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </ChapterGameShell>
  );
}
