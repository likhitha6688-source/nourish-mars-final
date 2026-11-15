import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Clock,
  Heart,
  Music,
  Package,
  Play,
  RotateCcw,
  Shield,
  Sprout,
  VolumeX,
} from 'lucide-react';
import { playChime } from '../../../utils/soundEffects.ts';
import { useGameMusic } from '../../../utils/gameMusic.ts';
import { ChapterGameShell } from './ChapterGameShell.tsx';

interface Ch9HarvestGameProps {
  onFinish: () => void;
}

type CharacterId = 'maya' | 'sathya';

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  kind?: 'ground' | 'brick' | 'pipe' | 'moving';
  movingRangeX?: number;
  movingSpeed?: number;
  baseX?: number;
}

interface QuestionBlock {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  reward: 'shield' | 'bonus';
}

interface BasketItem {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface InspectionStation {
  id: string;
  x: number;
  y: number;
}

interface ShieldPickup {
  id: string;
  x: number;
  y: number;
}

interface PatrolRobot {
  id: string;
  x: number;
  y: number;
  minX: number;
  maxX: number;
  vx: number;
}

interface Checkpoint {
  id: string;
  x: number;
  y: number;
}

const CANVAS_W = 900;
const CANVAS_H = 310;
const WORLD_W = 4800;
const GRAVITY = 0.56;
const JUMP_VY = -11.3;
const MOVE_SPEED = 4.8;
const GOAL_X = 4600;
const COURSE_TIME_SECONDS = 180; // 3-minute Super Mario-style course

const STATIC_PLATFORMS: Platform[] = [
  // Ground segments (leaving 5 Maintenance Pit Gaps!)
  { x: 0, y: 264, w: 690, h: 46, kind: 'ground' },
  { x: 820, y: 264, w: 680, h: 46, kind: 'ground' },
  { x: 1690, y: 264, w: 660, h: 46, kind: 'ground' },
  { x: 2540, y: 264, w: 670, h: 46, kind: 'ground' },
  { x: 3400, y: 264, w: 610, h: 46, kind: 'ground' },
  { x: 4190, y: 264, w: 610, h: 46, kind: 'ground' },

  // Green Greenhouse Airlock Pipes to jump over (Mario-style!)
  { x: 360, y: 218, w: 46, h: 46, kind: 'pipe' },
  { x: 1120, y: 204, w: 48, h: 60, kind: 'pipe' },
  { x: 2050, y: 214, w: 46, h: 50, kind: 'pipe' },
  { x: 2940, y: 204, w: 48, h: 60, kind: 'pipe' },
  { x: 3780, y: 214, w: 48, h: 50, kind: 'pipe' },

  // Elevated Brick / Hydroponic Platforms
  { x: 185, y: 186, w: 120, h: 20, kind: 'brick' },
  { x: 470, y: 150, w: 130, h: 20, kind: 'brick' },
  { x: 920, y: 182, w: 145, h: 20, kind: 'brick' },
  { x: 1245, y: 144, w: 140, h: 20, kind: 'brick' },
  { x: 1790, y: 184, w: 150, h: 20, kind: 'brick' },
  { x: 2155, y: 148, w: 135, h: 20, kind: 'brick' },
  { x: 2660, y: 182, w: 155, h: 20, kind: 'brick' },
  { x: 3045, y: 146, w: 140, h: 20, kind: 'brick' },
  { x: 3520, y: 182, w: 160, h: 20, kind: 'brick' },
  { x: 3860, y: 150, w: 130, h: 20, kind: 'brick' },
  { x: 4290, y: 184, w: 150, h: 20, kind: 'brick' },
];

const QUESTION_BLOCKS: QuestionBlock[] = [
  { id: 'qb1', x: 230, y: 118, w: 32, h: 32, reward: 'shield' },
  { id: 'qb2', x: 980, y: 114, w: 32, h: 32, reward: 'bonus' },
  { id: 'qb3', x: 1850, y: 116, w: 32, h: 32, reward: 'shield' },
  { id: 'qb4', x: 2720, y: 114, w: 32, h: 32, reward: 'bonus' },
  { id: 'qb5', x: 3580, y: 114, w: 32, h: 32, reward: 'shield' },
];

const INITIAL_MOVING_PLATFORMS: Platform[] = [
  { x: 715, y: 232, w: 86, h: 18, kind: 'moving', movingRangeX: 40, movingSpeed: 0.028, baseX: 715 },
  { x: 1545, y: 224, w: 94, h: 18, kind: 'moving', movingRangeX: 55, movingSpeed: 0.03, baseX: 1545 },
  { x: 2395, y: 228, w: 94, h: 18, kind: 'moving', movingRangeX: 55, movingSpeed: 0.032, baseX: 2395 },
  { x: 3255, y: 224, w: 94, h: 18, kind: 'moving', movingRangeX: 55, movingSpeed: 0.032, baseX: 3255 },
  { x: 4050, y: 228, w: 94, h: 18, kind: 'moving', movingRangeX: 55, movingSpeed: 0.03, baseX: 4050 },
];

const BASKETS: BasketItem[] = [
  { id: 'b1', label: 'Red Romaine', x: 245, y: 146 },
  { id: 'b2', label: 'Dwarf Kale', x: 992, y: 142 },
  { id: 'b3', label: 'Crisp Cress', x: 1315, y: 104 },
  { id: 'b4', label: 'Baby Spinach', x: 1865, y: 144 },
  { id: 'b5', label: 'Sweet Basil', x: 2735, y: 142 },
  { id: 'b6', label: 'Bok Choy', x: 3115, y: 106 },
  { id: 'b7', label: 'Micro Radish', x: 3600, y: 142 },
  { id: 'b8', label: 'Sun Tomatoes', x: 4365, y: 144 },
];

// Separate "Needs Checking" Inspection Stations — NEVER collectible
const INSPECTION_STATIONS: InspectionStation[] = [
  { id: 'ins1', x: 535, y: 110 },
  { id: 'ins2', x: 2222, y: 108 },
  { id: 'ins3', x: 3925, y: 110 },
];

const SHIELDS: ShieldPickup[] = [
  { id: 'sh1', x: 145, y: 226 },
  { id: 'sh2', x: 1735, y: 226 },
  { id: 'sh3', x: 3445, y: 226 },
];

const CHECKPOINTS: Checkpoint[] = [
  { id: 'cp1', x: 865, y: 264 },
  { id: 'cp2', x: 2585, y: 264 },
  { id: 'cp3', x: 3445, y: 264 },
];

function createRobots(): PatrolRobot[] {
  return [
    { id: 'r1', x: 460, y: 234, minX: 415, maxX: 650, vx: 1.5 },
    { id: 'r2', x: 960, y: 234, minX: 880, maxX: 1090, vx: -1.6 },
    { id: 'r3', x: 1810, y: 234, minX: 1730, maxX: 2010, vx: 1.7 },
    { id: 'r4', x: 2690, y: 234, minX: 2600, maxX: 2900, vx: -1.8 },
    { id: 'r5', x: 3560, y: 234, minX: 3480, maxX: 3745, vx: 1.85 },
    { id: 'r6', x: 4320, y: 234, minX: 4230, maxX: 4530, vx: -1.9 },
  ];
}

function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function Ch9HarvestGame({ onFinish }: Ch9HarvestGameProps) {
  const [character, setCharacter] = useState<CharacterId>('maya');
  const [phase, setPhase] = useState<'intro' | 'platformer' | 'dining' | 'complete'>('intro');
  const [hearts, setHearts] = useState(3);
  const [timeLeftSec, setTimeLeftSec] = useState(COURSE_TIME_SECONDS);
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [bonusScore, setBonusScore] = useState(0);
  const [shieldSec, setShieldSec] = useState(0);
  const [knockoutBanner, setKnockoutBanner] = useState<string | null>(null);
  const [seedPlanted, setSeedPlanted] = useState(false);
  const [reaction, setReaction] = useState(
    'Maya: "Choose Maya or Sathya and beat our 3-minute greenhouse course! Bump ? blocks, jump pipes, and deliver cleared baskets!"'
  );

  const { musicOn, startMusic, stopMusic, toggleMusic } = useGameMusic('mario');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef({ left: false, right: false, jump: false });

  const simRef = useRef({
    px: 55,
    py: 215,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1 as 1 | -1,
    checkpointX: 55,
    checkpointY: 215,
    hearts: 3,
    collected: new Set<string>(),
    shieldsUsed: new Set<string>(),
    bumpedBlocks: new Set<string>(),
    shieldFrames: 0,
    invulnFrames: 0,
    knockoutFrames: 0,
    tick: 0,
    robots: createRobots(),
    movingPlatforms: INITIAL_MOVING_PLATFORMS.map((p) => ({ ...p })),
    noticedStations: new Set<string>(),
  });

  const charName = character === 'maya' ? 'Maya' : 'Sathya';

  const resetLevel = useCallback(
    (goStraightToPlay = true, customMsg?: string) => {
      simRef.current = {
        px: 55,
        py: 215,
        vx: 0,
        vy: 0,
        onGround: false,
        facing: 1,
        checkpointX: 55,
        checkpointY: 215,
        hearts: 3,
        collected: new Set<string>(),
        shieldsUsed: new Set<string>(),
        bumpedBlocks: new Set<string>(),
        shieldFrames: 0,
        invulnFrames: 0,
        knockoutFrames: 0,
        tick: 0,
        robots: createRobots(),
        movingPlatforms: INITIAL_MOVING_PLATFORMS.map((p) => ({ ...p })),
        noticedStations: new Set<string>(),
      };
      setHearts(3);
      setTimeLeftSec(COURSE_TIME_SECONDS);
      setCollectedIds([]);
      setBonusScore(0);
      setShieldSec(0);
      setKnockoutBanner(null);
      setSeedPlanted(false);
      setPhase(goStraightToPlay ? 'platformer' : 'intro');
      if (goStraightToPlay) startMusic();
      setReaction(
        customMsg ||
          '3:00 on the clock! Jump airlock pipes, bump ? blocks, dodge robots, and reach the Crew Dining Area!'
      );
    },
    [startMusic]
  );

  // 3-minute countdown timer
  useEffect(() => {
    if (phase !== 'platformer') return;
    const id = window.setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          resetLevel(true, "Time's up after 3 minutes! Starting a fresh 3:00 run—let's go!");
          return COURSE_TIME_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, resetLevel]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (phase !== 'platformer') return;
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = true;
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') {
        e.preventDefault();
        keysRef.current.jump = true;
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = false;
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') keysRef.current.jump = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [phase]);

  // 60fps Platformer Game Loop
  useEffect(() => {
    if (phase !== 'platformer') return;
    let rafId = 0;

    const triggerKnockout = (reason: string) => {
      const s = simRef.current;
      if (s.knockoutFrames > 0) return;
      playChime('gentle');
      s.hearts -= 1;
      setHearts(s.hearts);
      s.knockoutFrames = 44;
      setKnockoutBanner(reason);

      window.setTimeout(() => {
        if (s.hearts <= 0) {
          resetLevel(true, `${charName} ran out of hearts! Level restarted with 3:00 on the clock!`);
        } else {
          s.px = s.checkpointX;
          s.py = s.checkpointY - 12;
          s.vx = 0;
          s.vy = 0;
          s.invulnFrames = 60;
          s.knockoutFrames = 0;
          setKnockoutBanner(null);
          setReaction(
            `${reason} Respawned at checkpoint—your ${s.collected.size} cleared baskets stayed safe!`
          );
        }
      }, 680);
    };

    const step = () => {
      const s = simRef.current;
      s.tick += 1;

      for (const mp of s.movingPlatforms) {
        if (mp.baseX !== undefined && mp.movingRangeX && mp.movingSpeed) {
          mp.x = mp.baseX + Math.sin(s.tick * mp.movingSpeed) * mp.movingRangeX;
        }
      }

      for (const rob of s.robots) {
        rob.x += rob.vx;
        if (rob.x <= rob.minX) {
          rob.x = rob.minX;
          rob.vx = Math.abs(rob.vx);
        } else if (rob.x >= rob.maxX) {
          rob.x = rob.maxX;
          rob.vx = -Math.abs(rob.vx);
        }
      }

      if (s.knockoutFrames === 0) {
        if (s.invulnFrames > 0) s.invulnFrames -= 1;
        if (s.shieldFrames > 0) {
          s.shieldFrames -= 1;
          if (s.tick % 15 === 0) setShieldSec(Math.ceil(s.shieldFrames / 60));
        } else if (s.tick % 15 === 0) {
          setShieldSec(0);
        }

        if (keysRef.current.left) {
          s.vx = -MOVE_SPEED;
          s.facing = -1;
        } else if (keysRef.current.right) {
          s.vx = MOVE_SPEED;
          s.facing = 1;
        } else {
          s.vx *= 0.72;
          if (Math.abs(s.vx) < 0.15) s.vx = 0;
        }

        if (keysRef.current.jump && s.onGround) {
          s.vy = JUMP_VY;
          s.onGround = false;
          playChime('button');
        }

        const prevTop = s.py;
        const prevBottom = s.py + 44;
        s.px = Math.max(10, Math.min(WORLD_W - 44, s.px + s.vx));
        s.vy = Math.min(12, s.vy + GRAVITY);
        s.py += s.vy;
        s.onGround = false;

        const playerW = 32;
        const playerH = 44;

        // Solid & Question Blocks collision (top landing + upward head bump on ? blocks!)
        for (const qb of QUESTION_BLOCKS) {
          const horizOverlap = s.px + playerW > qb.x + 2 && s.px < qb.x + qb.w - 2;
          if (horizOverlap) {
            if (s.vy >= 0 && prevBottom <= qb.y + 8 && s.py + playerH >= qb.y) {
              s.py = qb.y - playerH;
              s.vy = 0;
              s.onGround = true;
            } else if (s.vy < 0 && prevTop >= qb.y + qb.h - 8 && s.py <= qb.y + qb.h) {
              s.py = qb.y + qb.h;
              s.vy = 2;
              if (!s.bumpedBlocks.has(qb.id)) {
                s.bumpedBlocks.add(qb.id);
                if (qb.reward === 'shield') {
                  s.shieldFrames = 480;
                  setShieldSec(8);
                  playChime('success');
                  setReaction('Bumped a ? Supply Block! Protective Shield active for 8s!');
                } else {
                  playChime('star');
                  setBonusScore((b) => b + 100);
                  setReaction('Bumped a ? Supply Block! +100 Greenhouse Star Points!');
                }
              }
            }
          }
        }

        // Static & Moving Platforms landing
        const allPlatforms = [...STATIC_PLATFORMS, ...s.movingPlatforms];
        for (const plat of allPlatforms) {
          const horizOverlap = s.px + playerW > plat.x + 4 && s.px < plat.x + plat.w - 4;
          if (
            horizOverlap &&
            s.vy >= 0 &&
            prevBottom <= plat.y + 9 &&
            s.py + playerH >= plat.y
          ) {
            s.py = plat.y - playerH;
            s.vy = 0;
            s.onGround = true;
            if (plat.movingRangeX && plat.baseX !== undefined && plat.movingSpeed) {
              const delta =
                Math.cos(s.tick * plat.movingSpeed) * plat.movingRangeX * plat.movingSpeed;
              s.px += delta;
            }
            break;
          }
        }

        // Side collision with tall green pipes
        for (const plat of STATIC_PLATFORMS) {
          if (plat.kind !== 'pipe') continue;
          if (s.py + playerH > plat.y + 8 && s.py < plat.y + plat.h) {
            if (s.px + playerW > plat.x && s.px < plat.x + 12) {
              s.px = plat.x - playerW;
            } else if (s.px < plat.x + plat.w && s.px + playerW > plat.x + plat.w - 12) {
              s.px = plat.x + plat.w;
            }
          }
        }

        // Fall into Maintenance Pit Gap
        if (s.py > CANVAS_H + 10) {
          triggerKnockout('Whoops! Fell into a maintenance gap!');
        }

        // Checkpoints
        for (const cp of CHECKPOINTS) {
          if (Math.abs(s.px - cp.x) < 38 && s.checkpointX < cp.x) {
            s.checkpointX = cp.x;
            s.checkpointY = cp.y - 44;
            playChime('pop');
            setReaction('Checkpoint flag raised! Cleared baskets and progress saved here.');
          }
        }

        // Collect Food-Safety Cleared Baskets
        for (const b of BASKETS) {
          if (!s.collected.has(b.id) && Math.hypot(s.px + 16 - b.x, s.py + 22 - b.y) < 34) {
            s.collected.add(b.id);
            playChime('star');
            setCollectedIds(Array.from(s.collected));
            setReaction(
              `Collected "${b.label}" (Food-Safety Cleared)! (${s.collected.size} / ${BASKETS.length})`
            );
          }
        }

        // Notice Inspection Stations (never collectible)
        for (const st of INSPECTION_STATIONS) {
          if (
            !s.noticedStations.has(st.id) &&
            Math.hypot(s.px + 16 - st.x, s.py + 22 - st.y) < 42
          ) {
            s.noticedStations.add(st.id);
            setReaction(
              'Inspection Station: "Needs Checking" produce stays here for testing—never packed as cleared food!'
            );
          }
        }

        // Protective Shields
        for (const sh of SHIELDS) {
          if (!s.shieldsUsed.has(sh.id) && Math.hypot(s.px + 16 - sh.x, s.py + 22 - sh.y) < 34) {
            s.shieldsUsed.add(sh.id);
            s.shieldFrames = 420;
            setShieldSec(7);
            playChime('success');
            setReaction('Protective Shield active! You are protected from the next maintenance robot bump!');
          }
        }

        // Patrol Robot Dodge Check (never stomp/attack)
        if (s.invulnFrames === 0) {
          for (const rob of s.robots) {
            if (Math.abs(s.px - rob.x) < 28 && Math.abs(s.py + 16 - rob.y) < 28) {
              if (s.shieldFrames > 0) {
                s.shieldFrames = 0;
                s.invulnFrames = 65;
                setShieldSec(0);
                playChime('pop');
                setReaction('Protective Shield absorbed the robot bump safely!');
              } else {
                triggerKnockout('Boing! Touched a moving maintenance robot!');
              }
              break;
            }
          }
        }

        // Goal: Crew Dining Area
        if (s.px >= GOAL_X) {
          playChime('achievement');
          setPhase('dining');
          setReaction(
            'Welcome to the Crew Dining Area! Your cleared harvest sits beside stored meals—now plant the next seed!'
          );
          return;
        }
      }

      // Draw Super Mario-inspired Greenhouse Course
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        const camX = Math.max(0, Math.min(WORLD_W - CANVAS_W, s.px - CANVAS_W * 0.34));

        // 1. Mars Greenhouse Sky Backdrop
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Distant Red Mars Horizon
        ctx.fillStyle = '#451A03';
        ctx.fillRect(0, 224, CANVAS_W, 86);

        ctx.save();
        ctx.translate(-camX, 0);

        // Greenhouse glass arches, grow lamps, and clouds/stars
        for (let x = 70; x < WORLD_W; x += 250) {
          ctx.strokeStyle = '#1E293B';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(x, 265);
          ctx.lineTo(x, 38);
          ctx.stroke();

          ctx.fillStyle = '#FDE047';
          ctx.fillRect(x + 60, 18, 90, 8);
          ctx.fillStyle = 'rgba(253, 224, 71, 0.06)';
          ctx.beginPath();
          ctx.moveTo(x + 60, 26);
          ctx.lineTo(x + 150, 26);
          ctx.lineTo(x + 185, 264);
          ctx.lineTo(x + 25, 264);
          ctx.closePath();
          ctx.fill();
        }

        // Maintenance Pit Warning Stripes
        [690, 1500, 2350, 3210, 4010].forEach((gx) => {
          ctx.fillStyle = '#7F1D1D';
          ctx.fillRect(gx, 286, 180, 24);
          ctx.fillStyle = '#FCA5A5';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText('MAINTENANCE GAP', gx + 14, 302);
        });

        // Tiled Static Platforms, Brick Shelves & Green Pipes
        for (const plat of STATIC_PLATFORMS) {
          if (plat.kind === 'pipe') {
            ctx.fillStyle = '#16A34A';
            ctx.fillRect(plat.x + 4, plat.y + 12, plat.w - 8, plat.h - 12);
            ctx.fillStyle = '#22C55E';
            ctx.fillRect(plat.x, plat.y, plat.w, 14);
            ctx.strokeStyle = '#14532D';
            ctx.lineWidth = 2;
            ctx.strokeRect(plat.x, plat.y, plat.w, 14);
            ctx.strokeRect(plat.x + 4, plat.y + 14, plat.w - 8, plat.h - 14);
          } else if (plat.kind === 'brick') {
            ctx.fillStyle = '#9A3412';
            ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
            ctx.fillStyle = '#34D399';
            ctx.fillRect(plat.x, plat.y, plat.w, 5);
            // Brick tile mortar lines
            ctx.strokeStyle = '#431407';
            ctx.lineWidth = 1.5;
            for (let bx = plat.x + 24; bx < plat.x + plat.w; bx += 24) {
              ctx.beginPath();
              ctx.moveTo(bx, plat.y + 5);
              ctx.lineTo(bx, plat.y + plat.h);
              ctx.stroke();
            }
          } else {
            ctx.fillStyle = '#334155';
            ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
            ctx.fillStyle = '#65A30D';
            ctx.fillRect(plat.x, plat.y, plat.w, 7);
            // Tile seams along ground
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 1.5;
            for (let gx = plat.x + 32; gx < plat.x + plat.w; gx += 32) {
              ctx.beginPath();
              ctx.moveTo(gx, plat.y + 7);
              ctx.lineTo(gx, plat.y + plat.h);
              ctx.stroke();
            }
          }
        }

        // Bumpable ? Supply Blocks (Mario-style!)
        for (const qb of QUESTION_BLOCKS) {
          const used = s.bumpedBlocks.has(qb.id);
          ctx.fillStyle = used ? '#78350F' : '#F59E0B';
          ctx.fillRect(qb.x, qb.y, qb.w, qb.h);
          ctx.strokeStyle = used ? '#451A03' : '#FEF3C7';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(qb.x, qb.y, qb.w, qb.h);
          ctx.fillStyle = used ? '#D6D3D1' : '#FFFFFF';
          ctx.font = 'bold 18px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(used ? '✓' : '?', qb.x + qb.w / 2, qb.y + 22);
          ctx.textAlign = 'left';
        }

        // Moving Platforms
        for (const mp of s.movingPlatforms) {
          ctx.fillStyle = '#0284C7';
          ctx.fillRect(mp.x, mp.y, mp.w, mp.h);
          ctx.fillStyle = '#BAE6FD';
          ctx.fillRect(mp.x, mp.y, mp.w, 5);
        }

        // Checkpoints
        for (const cp of CHECKPOINTS) {
          const reached = s.checkpointX >= cp.x;
          ctx.fillStyle = '#CBD5E1';
          ctx.fillRect(cp.x, cp.y - 52, 4, 52);
          ctx.fillStyle = reached ? '#A3E635' : '#64748B';
          ctx.fillRect(cp.x + 4, cp.y - 52, 34, 18);
          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('SAVE', cp.x + 8, cp.y - 40);
        }

        // Inspection Stations ("Needs Checking" — non-collectible)
        for (const st of INSPECTION_STATIONS) {
          ctx.fillStyle = '#FEF3C7';
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 2;
          ctx.fillRect(st.x - 42, st.y - 6, 84, 34);
          ctx.strokeRect(st.x - 42, st.y - 6, 84, 34);
          ctx.fillStyle = '#78350F';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('INSPECTION', st.x, st.y + 7);
          ctx.fillText('? Needs Checking', st.x, st.y + 20);
          ctx.textAlign = 'left';
        }

        // Harvest Baskets ("Food-Safety Cleared")
        for (const b of BASKETS) {
          if (s.collected.has(b.id)) continue;
          const bob = Math.sin(s.tick * 0.08 + b.x) * 3.5;
          ctx.fillStyle = '#10B981';
          ctx.strokeStyle = '#ECFDF5';
          ctx.lineWidth = 2;
          ctx.fillRect(b.x - 15, b.y - 12 + bob, 30, 24);
          ctx.strokeRect(b.x - 15, b.y - 12 + bob, 30, 24);
          ctx.fillStyle = '#ECFDF5';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🥬', b.x, b.y + 4 + bob);
          ctx.fillStyle = '#A7F3D0';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.fillText('Food-Safety Cleared', b.x, b.y - 18 + bob);
          ctx.textAlign = 'left';
        }

        // Protective Shield Pickups
        for (const sh of SHIELDS) {
          if (s.shieldsUsed.has(sh.id)) continue;
          const bob = Math.sin(s.tick * 0.09) * 3.5;
          ctx.beginPath();
          ctx.arc(sh.x, sh.y + bob, 13, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.fill();
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('SHIELD', sh.x, sh.y + 3 + bob);
          ctx.textAlign = 'left';
        }

        // Patrol Robots (dodge cleanly)
        for (const rob of s.robots) {
          ctx.fillStyle = '#E11D48';
          ctx.fillRect(rob.x, rob.y, 30, 25);
          ctx.fillStyle = '#FDA4AF';
          ctx.fillRect(rob.x + 5, rob.y + 6, 8, 6);
          ctx.fillRect(rob.x + 17, rob.y + 6, 8, 6);
          ctx.fillStyle = '#0F172A';
          ctx.beginPath();
          ctx.arc(rob.x + 7, rob.y + 27, 4, 0, Math.PI * 2);
          ctx.arc(rob.x + 23, rob.y + 27, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Goal: Crew Dining Area Castle / Station
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#A3E635';
        ctx.lineWidth = 3;
        ctx.fillRect(GOAL_X, 152, 125, 112);
        ctx.strokeRect(GOAL_X, 152, 125, 112);
        ctx.fillStyle = '#A3E635';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CREW DINING', GOAL_X + 62, 176);
        ctx.fillText('AREA', GOAL_X + 62, 192);
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(GOAL_X + 24, 218, 76, 20);
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('Stored Meals', GOAL_X + 62, 232);
        ctx.textAlign = 'left';

        // Player Character (Maya or Sathya)
        if (s.invulnFrames % 6 < 4) {
          if (s.shieldFrames > 0) {
            ctx.beginPath();
            ctx.arc(s.px + 16, s.py + 22, 27, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.fill();
            ctx.strokeStyle = '#38BDF8';
            ctx.lineWidth = 2.5;
            ctx.stroke();
          }

          ctx.fillStyle = character === 'maya' ? '#F97316' : '#0EA5E9';
          ctx.fillRect(s.px + 6, s.py + 18, 20, 20);
          ctx.fillStyle = '#E2E8F0';
          ctx.fillRect(s.px + 7, s.py + 38, 7, 6);
          ctx.fillRect(s.px + 18, s.py + 38, 7, 6);
          ctx.fillStyle = '#F8FAFC';
          ctx.beginPath();
          ctx.arc(s.px + 16, s.py + 11, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1E293B';
          ctx.fillRect(s.facing === 1 ? s.px + 14 : s.px + 8, s.py + 7, 11, 7);
        }

        ctx.restore();
      }

      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [charName, character, phase, resetLevel]);

  const handlePlantSeed = () => {
    playChime('success');
    stopMusic();
    setSeedPlanted(true);
    setPhase('complete');
    setReaction('Maya & Sathya: "New Cycle 02 seed planted beside the crew’s table! Every leaf begins with care!"');
    onFinish();
  };

  return (
    <ChapterGameShell
      instruction="Run, jump pipes, bump ? blocks & finish within 3:00!"
      reaction={reaction}
    >
      {/* Compact HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
        <div className="flex items-center gap-1.5">
          {(['maya', 'sathya'] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                playChime('button');
                setCharacter(id);
              }}
              className={`min-h-[34px] px-2.5 py-1 rounded-xl text-xs font-extrabold border ${
                character === id
                  ? 'bg-slate-900 text-lime-300 border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              {id === 'maya' ? '👩‍🚀 Maya' : '🧑‍🚀 Sathya'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-0.5" aria-label={`Hearts: ${hearts} of 3`}>
            {[0, 1, 2].map((i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${
                  i < hearts ? 'fill-rose-500 text-rose-600' : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span
            className={`inline-flex items-center gap-1 text-xs font-extrabold font-mono-tabular ${
              timeLeftSec <= 30 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {formatTimer(timeLeftSec)}
          </span>
          <span className="text-xs font-extrabold font-mono-tabular text-emerald-700">
            Cleared: {collectedIds.length}/{BASKETS.length}
          </span>
          {bonusScore > 0 && (
            <span className="text-xs font-extrabold font-mono-tabular text-amber-700">
              +{bonusScore} pts
            </span>
          )}
          {shieldSec > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-sky-700">
              <Shield className="w-3.5 h-3.5" />
              {shieldSec}s
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
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
              resetLevel(true);
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
              <p className="text-xs font-bold text-lime-300 mb-0.5">Chapter 9 · 3-Minute Platformer</p>
              <h2 className="text-2xl font-extrabold">The Harvest Adventure</h2>
            </div>
            <button
              type="button"
              onClick={() => resetLevel(true)}
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-lime-300 hover:bg-lime-200 text-slate-950 text-base font-extrabold shrink-0"
            >
              <Play className="w-5 h-5 fill-current" />
              Start 3:00 Adventure!
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-lime-300 text-sm">1. Run, Jump &amp; Bump ?</p>
              <p className="text-slate-200">
                Use Arrow/WASD keys or touch buttons to leap over green airlock pipes, bump ? blocks from below, and grab 8 cleared baskets.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-sky-300 text-sm">2. Beat the 3:00 Clock</p>
              <p className="text-slate-200">
                Dodge 6 patrolling robots and 5 gaps before 03:00 runs out—3 checkpoints save your cleared baskets!
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-amber-300 text-sm">3. Deliver &amp; Plant Again</p>
              <p className="text-slate-200">
                Leave “Needs Checking” items at inspection desks, bring cleared harvest beside stored meals, and plant a seed!
              </p>
            </div>
          </div>
        </div>
      ) : phase === 'platformer' ? (
        <div className="space-y-2">
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="w-full max-h-[290px] object-contain mx-auto block"
            />
            {knockoutBanner && (
              <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center text-white text-center p-4">
                <span className="text-3xl mb-1" aria-hidden="true">💫</span>
                <p className="text-base font-extrabold text-amber-300">{knockoutBanner}</p>
                <p className="text-xs text-slate-200 mt-1">Respawning at checkpoint...</p>
              </div>
            )}
          </div>

          {/* Compact Mobile / Touch Controls */}
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onPointerDown={() => { keysRef.current.left = true; }}
                onPointerUp={() => { keysRef.current.left = false; }}
                onPointerLeave={() => { keysRef.current.left = false; }}
                className="min-h-[42px] px-4 rounded-xl bg-slate-900 text-lime-300 text-sm font-extrabold inline-flex items-center gap-1.5 select-none"
              >
                <ArrowLeft className="w-4 h-4" />
                Left
              </button>
              <button
                type="button"
                onPointerDown={() => { keysRef.current.right = true; }}
                onPointerUp={() => { keysRef.current.right = false; }}
                onPointerLeave={() => { keysRef.current.right = false; }}
                className="min-h-[42px] px-4 rounded-xl bg-slate-900 text-lime-300 text-sm font-extrabold inline-flex items-center gap-1.5 select-none"
              >
                Right
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onPointerDown={() => { keysRef.current.jump = true; }}
              onPointerUp={() => { keysRef.current.jump = false; }}
              onPointerLeave={() => { keysRef.current.jump = false; }}
              className="min-h-[42px] px-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-sm font-extrabold inline-flex items-center gap-1.5 select-none"
            >
              <ArrowUp className="w-4 h-4" />
              Jump
            </button>
          </div>
        </div>
      ) : (
        /* Crew Dining Area Finale */
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-900 text-white p-4 flex items-center gap-3">
              <Package className="w-9 h-9 text-sky-300 shrink-0" />
              <div>
                <p className="text-xs font-bold text-sky-300">Crew Stored Meals</p>
                <p className="text-base font-extrabold">6 Freeze-Dried Meal Pouches</p>
                <p className="text-xs text-slate-300">Primary Mars mission nutrition</p>
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-400 p-4 flex items-center gap-3">
              <Sprout className="w-9 h-9 text-emerald-700 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-800">
                  Delivered Beside Stored Meals
                </p>
                <p className="text-base font-extrabold text-slate-900">
                  {collectedIds.length} Food-Safety Cleared Baskets
                </p>
                <p className="text-xs text-emerald-800">
                  Finished with {formatTimer(timeLeftSec)} left!
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-300 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-900">
              {seedPlanted
                ? 'Cycle 02 seed planted! Every harvest on Mars begins with preparation and teamwork.'
                : 'Final step in the Crew Dining Area: plant a seed for the next growing cycle!'}
            </p>
            <button
              type="button"
              disabled={seedPlanted}
              onClick={handlePlantSeed}
              className={`min-h-[46px] px-6 py-2 rounded-xl text-sm font-extrabold inline-flex items-center gap-2 shrink-0 ${
                seedPlanted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-lime-300 hover:bg-lime-200 text-slate-950'
              }`}
            >
              {seedPlanted ? <CheckCircle2 className="w-4 h-4" /> : <Sprout className="w-4 h-4" />}
              {seedPlanted ? 'Next Seed Planted!' : 'Plant the Next Seed'}
            </button>
          </div>
        </div>
      )}
    </ChapterGameShell>
  );
}
