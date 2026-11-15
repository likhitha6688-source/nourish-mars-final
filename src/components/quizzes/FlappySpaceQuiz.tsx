import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  Award,
  CheckCircle2,
  Heart,
  Music,
  Play,
  RotateCcw,
  Star,
  VolumeX,
  XCircle,
} from 'lucide-react';
import {
  FLAPPY_SPACE_QUIZ_QUESTIONS,
  type FlappyQuizQuestion,
} from '../../data/flappyQuizQuestions.ts';
import type { Quiz } from '../../types/education.ts';
import { useGameMusic } from '../../utils/gameMusic.ts';
import { playChime } from '../../utils/soundEffects.ts';

interface FlappySpaceQuizProps {
  quiz: Quiz;
  onBack: () => void;
  onCompleteQuiz: (quizId: string, starsEarned: number, badgeName: string) => void;
}

interface PipePair {
  id: number;
  x: number;
  gapY: number;
  gapH: number;
  passed: boolean;
}

const CANVAS_W = 860;
const CANVAS_H = 330;
const BIRD_X = 190;
const BIRD_W = 42;
const BIRD_H = 32;
const PIPE_W = 54;
const PIPE_SPEED = 2.85;
const GRAVITY = 0.38;
const FLAP_VY = -6.7;
const TARGET_CORRECT_FOR_BADGE = 5;

const STARS_BG = Array.from({ length: 42 }, (_, i) => ({
  x: (i * 197 + 31) % CANVAS_W,
  y: (i * 89 + 17) % (CANVAS_H - 60),
  r: i % 3 === 0 ? 2 : 1.2,
}));

export function FlappySpaceQuiz({
  quiz,
  onBack,
  onCompleteQuiz,
}: FlappySpaceQuizProps) {
  const levels = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const q of FLAPPY_SPACE_QUIZ_QUESTIONS) {
      if (!seen.has(q.level)) {
        seen.add(q.level);
        list.push(q.level);
      }
    }
    return list;
  }, []);

  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [phase, setPhase] = useState<'intro' | 'flying' | 'quiz' | 'gameover' | 'victory'>('intro');
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [badgeClaimed, setBadgeClaimed] = useState(false);
  const [statusBanner, setStatusBanner] = useState(
    'Tap Flap, Space, or Up Arrow to steer through glowing gates and answer Mars quiz checkpoints!'
  );

  const { musicOn, startMusic, stopMusic, toggleMusic } = useGameMusic('playful');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeDeck = useMemo<FlappyQuizQuestion[]>(() => {
    if (selectedLevel === 'ALL') return FLAPPY_SPACE_QUIZ_QUESTIONS;
    return FLAPPY_SPACE_QUIZ_QUESTIONS.filter((q) => q.level === selectedLevel);
  }, [selectedLevel]);

  const currentQuestion = activeDeck[questionIdx % activeDeck.length];

  const simRef = useRef({
    birdY: 140,
    birdVy: 0,
    flapTimer: 0,
    invulnFrames: 0,
    tick: 0,
    pipes: [] as PipePair[],
    nextPipeId: 1,
    score: 0,
    hearts: 3,
    questionIdx: 0,
    graceFrames: 45,
  });

  const spawnInitialPipe = useCallback((): PipePair => {
    const gapH = 134;
    const gapY = 65 + Math.floor(Math.random() * (CANVAS_H - gapH - 115));
    return { id: 1, x: CANVAS_W + 40, gapY, gapH, passed: false };
  }, []);

  const resetAndStart = useCallback(
    (levelOverride?: string) => {
      if (levelOverride !== undefined) setSelectedLevel(levelOverride);
      simRef.current = {
        birdY: 140,
        birdVy: 0,
        flapTimer: 0,
        invulnFrames: 30,
        tick: 0,
        pipes: [spawnInitialPipe()],
        nextPipeId: 2,
        score: 0,
        hearts: 3,
        questionIdx: 0,
        graceFrames: 35,
      };
      setHearts(3);
      setScore(0);
      setCorrectCount(0);
      setQuestionIdx(0);
      setSelectedOption(null);
      setBadgeClaimed(false);
      setPhase('flying');
      startMusic();
      setStatusBanner('Fly smoothly between gates! Odd gate scores trigger a Space Quiz Checkpoint.');
    },
    [spawnInitialPipe, startMusic]
  );

  const triggerFlap = useCallback(() => {
    if (phase !== 'flying') return;
    simRef.current.birdVy = FLAP_VY;
    simRef.current.flapTimer = 10;
    simRef.current.graceFrames = 0;
    playChime('button');
  }, [phase]);

  // Keyboard controls for flight + quiz answer shortcuts (1/2/3 or A/B/C, Enter to continue)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (phase === 'flying') {
        if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') {
          e.preventDefault();
          triggerFlap();
        }
      } else if (phase === 'intro' && e.key === 'Enter') {
        e.preventDefault();
        resetAndStart();
      } else if (phase === 'quiz' && currentQuestion) {
        const lower = e.key.toLowerCase();
        const keyMap: Record<string, number> = { '1': 0, a: 0, '2': 1, b: 1, '3': 2, c: 2 };
        if (selectedOption === null && lower in keyMap) {
          const idx = keyMap[lower];
          if (idx < currentQuestion.options.length) {
            e.preventDefault();
            handleSelectOption(idx);
          }
        } else if (selectedOption !== null && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleContinueFlight();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  // 60fps Canvas Loop while flying
  useEffect(() => {
    if (phase !== 'flying') return;
    let rafId = 0;

    const handleCrash = (reason: string) => {
      const s = simRef.current;
      if (s.invulnFrames > 0) return;
      playChime('gentle');
      s.hearts -= 1;
      setHearts(s.hearts);

      if (s.hearts <= 0) {
        stopMusic();
        setPhase('gameover');
        setStatusBanner(`${reason} Final score: ${s.score} gates · ${correctCount} quiz answers right.`);
        return;
      }

      // Safe mid-air respawn with invulnerability and clear nearby pipes
      s.birdY = CANVAS_H * 0.42;
      s.birdVy = -2.2;
      s.invulnFrames = 85;
      s.pipes = s.pipes.filter((p) => p.x > BIRD_X + 200);
      if (s.pipes.length === 0) {
        s.pipes.push({
          id: s.nextPipeId++,
          x: CANVAS_W + 40,
          gapY: 95,
          gapH: 136,
          passed: false,
        });
      }
      setStatusBanner(`${reason} (${s.hearts} shield hearts remaining)`);
    };

    const drawScene = () => {
      const s = simRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      // Space backdrop
      ctx.fillStyle = '#070d1f';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Twinkling starfield
      for (const st of STARS_BG) {
        const px = (st.x - s.tick * 0.35 + CANVAS_W * 10) % CANVAS_W;
        ctx.fillStyle = st.r > 1.5 ? '#BAE6FD' : '#94A3B8';
        ctx.beginPath();
        ctx.arc(px, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Red Mars terrain ridge along bottom
      ctx.fillStyle = '#431407';
      ctx.fillRect(0, CANVAS_H - 22, CANVAS_W, 22);
      ctx.fillStyle = '#9A3412';
      ctx.fillRect(0, CANVAS_H - 24, CANVAS_W, 4);

      // Futuristic Cyan/Cobalt Pipes (inspired directly by space-es.netlify.app)
      for (const p of s.pipes) {
        const topH = p.gapY;
        const botY = p.gapY + p.gapH;
        const botH = CANVAS_H - 22 - botY;

        const drawPipeBody = (x: number, y: number, w: number, h: number, capAtBottom: boolean) => {
          if (h <= 0) return;
          const grad = ctx.createLinearGradient(x, 0, x + w, 0);
          grad.addColorStop(0, '#18234c');
          grad.addColorStop(0.22, '#536a9e');
          grad.addColorStop(0.48, '#b7d5e8');
          grad.addColorStop(0.75, '#526b9e');
          grad.addColorStop(1, '#17244d');
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, w, h);

          ctx.strokeStyle = '#9bdfff';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(x, y, w, h);

          // Glowing futuristic cap
          const capY = capAtBottom ? y + h - 14 : y;
          ctx.fillStyle = '#7dd3fc';
          ctx.fillRect(x - 6, capY, w + 12, 14);
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 2;
          ctx.strokeRect(x - 6, capY, w + 12, 14);
        };

        drawPipeBody(p.x, 0, PIPE_W, topH, true);
        drawPipeBody(p.x, botY, PIPE_W, botH, false);
      }

      // Winged Mars Explorer Flyer (Blinks briefly when invulnerable)
      if (s.invulnFrames % 8 < 5) {
        ctx.save();
        ctx.translate(BIRD_X + BIRD_W / 2, s.birdY + BIRD_H / 2);
        const tilt = Math.max(-0.38, Math.min(0.45, s.birdVy * 0.055));
        ctx.rotate(tilt);

        // Jetpack / wing flap
        const wingY = s.flapTimer > 0 ? -9 : 2;
        ctx.fillStyle = '#A3E635';
        ctx.beginPath();
        ctx.ellipse(-6, wingY, 13, 7, -0.25, 0, Math.PI * 2);
        ctx.fill();

        // Flyer capsule body
        ctx.fillStyle = '#EA580C';
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FDBA74';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Visor window
        ctx.fillStyle = '#E0F2FE';
        ctx.beginPath();
        ctx.arc(8, -2, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(10, -2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    };

    const step = () => {
      const s = simRef.current;
      s.tick += 1;
      if (s.flapTimer > 0) s.flapTimer -= 1;
      if (s.invulnFrames > 0) s.invulnFrames -= 1;

      if (s.graceFrames > 0) {
        s.graceFrames -= 1;
      } else {
        s.birdVy = Math.min(8.5, s.birdVy + GRAVITY);
        s.birdY += s.birdVy;
      }

      // Spawn new pipe every ~260px
      const lastPipe = s.pipes[s.pipes.length - 1];
      if (!lastPipe || lastPipe.x < CANVAS_W - 265) {
        const gapH = 132;
        const gapY = 54 + Math.floor(Math.random() * (CANVAS_H - gapH - 100));
        s.pipes.push({
          id: s.nextPipeId++,
          x: CANVAS_W + 20,
          gapY,
          gapH,
          passed: false,
        });
      }

      // Move pipes & check pass / collision
      let openQuizNow = false;
      for (const p of s.pipes) {
        p.x -= PIPE_SPEED;

        if (!p.passed && p.x + PIPE_W < BIRD_X) {
          p.passed = true;
          s.score += 1;
          setScore(s.score);
          playChime('pop');

          // Matches space-es.netlify.app: quiz popup on odd gate scores (1, 3, 5...)
          if (s.score % 2 !== 0) {
            openQuizNow = true;
          }
        }

        // Collision check (generous inset hitbox)
        const hitX = BIRD_X + BIRD_W - 8 > p.x && BIRD_X + 8 < p.x + PIPE_W;
        const hitTop = s.birdY + 6 < p.gapY;
        const hitBot = s.birdY + BIRD_H - 6 > p.gapY + p.gapH;
        if (hitX && (hitTop || hitBot)) {
          handleCrash('Bumped a space gate!');
          break;
        }
      }

      s.pipes = s.pipes.filter((p) => p.x + PIPE_W > -30);

      // Ceiling / Mars floor collision
      if (s.birdY < 0) {
        s.birdY = 0;
        s.birdVy = 0.8;
      } else if (s.birdY + BIRD_H > CANVAS_H - 22) {
        handleCrash('Touched the Martian ground!');
      }

      drawScene();

      if (openQuizNow && simRef.current.hearts > 0) {
        setSelectedOption(null);
        setPhase('quiz');
        setStatusBanner('Quiz Checkpoint! Answer correctly to keep your flight streak going!');
        return;
      }

      if (simRef.current.hearts > 0) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [correctCount, phase, stopMusic]);

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null || phase !== 'quiz') return;
    setSelectedOption(idx);
    const isCorrect = idx === currentQuestion.correctIndex;

    if (isCorrect) {
      playChime('success');
      const nextCorrect = correctCount + 1;
      setCorrectCount(nextCorrect);

      if (!badgeClaimed && nextCorrect >= TARGET_CORRECT_FOR_BADGE) {
        setBadgeClaimed(true);
        playChime('achievement');
        onCompleteQuiz(quiz.id, quiz.starReward, quiz.badgeName);
        setStatusBanner(
          `Awesome! ${nextCorrect} right answers unlocked +${quiz.starReward} Stars & "${quiz.badgeName}"!`
        );
      } else {
        setStatusBanner(
          `Spot on! (${nextCorrect} / ${TARGET_CORRECT_FOR_BADGE} answers for your badge)`
        );
      }
    } else {
      playChime('gentle');
      setStatusBanner(
        `Not quite—the right answer was "${currentQuestion.options[currentQuestion.correctIndex]}".`
      );
    }
  };

  const handleContinueFlight = () => {
    playChime('button');
    const nextQ = questionIdx + 1;
    setQuestionIdx(nextQ);
    setSelectedOption(null);

    if (selectedOption !== currentQuestion.correctIndex) {
      const nextHearts = Math.max(0, simRef.current.hearts - 1);
      simRef.current.hearts = nextHearts;
      setHearts(nextHearts);
      if (nextHearts <= 0) {
        stopMusic();
        setPhase('gameover');
        return;
      }
    }

    simRef.current.questionIdx = nextQ;
    simRef.current.graceFrames = 24;
    simRef.current.birdVy = -1.5;
    simRef.current.invulnFrames = 45;
    setPhase('flying');
  };

  const handleFinishWithBadge = () => {
    playChime('achievement');
    stopMusic();
    setPhase('victory');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-2.5">
      {/* Compact Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playChime('button');
              stopMusic();
              onBack();
            }}
            className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quizzes
          </button>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 hidden sm:inline">
            {quiz.title}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-0.5" aria-label={`Shield Hearts: ${hearts} of 3`}>
            {[0, 1, 2].map((i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${
                  i < hearts ? 'fill-rose-500 text-rose-600' : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-extrabold font-mono-tabular text-sky-700">
            Gates: {score}
          </span>
          <span className="text-xs font-extrabold font-mono-tabular text-emerald-700">
            Correct: {correctCount}/{TARGET_CORRECT_FOR_BADGE}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleMusic}
            className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-extrabold hover:bg-slate-50"
          >
            {musicOn ? <VolumeX className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5" />}
            {musicOn ? 'Mute' : 'Music'}
          </button>
          <button
            type="button"
            onClick={() => resetAndStart()}
            className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-extrabold hover:bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-slate-900 text-lime-300 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold flex flex-wrap items-center justify-between gap-2">
        <span>{statusBanner}</span>
        {badgeClaimed && phase !== 'victory' && (
          <button
            type="button"
            onClick={handleFinishWithBadge}
            className="px-3 py-1 rounded-lg bg-lime-300 hover:bg-lime-200 text-slate-950 text-xs font-extrabold"
          >
            Claim Rewards &amp; Finish
          </button>
        )}
      </div>

      {phase === 'intro' ? (
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-3.5">
            <div>
              <p className="text-xs font-bold text-lime-300 mb-0.5">
                Arcade Flight + 182 NOURISH-Mars Questions
              </p>
              <h2 className="text-2xl font-extrabold">{quiz.title}</h2>
            </div>
            <button
              type="button"
              onClick={() => resetAndStart()}
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-lime-300 hover:bg-lime-200 text-slate-950 text-base font-extrabold shrink-0"
            >
              <Play className="w-5 h-5 fill-current" />
              Launch Flight Quiz!
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-lime-300 text-sm">1. Fly Through Space Gates</p>
              <p className="text-slate-200">
                Press <strong>Space</strong>, <strong>↑ Arrow</strong>, or tap <strong>Flap</strong> to steer between glowing cyan space gates.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-sky-300 text-sm">2. Answer Checkpoints</p>
              <p className="text-slate-200">
                Passing gates opens real NOURISH-Mars story questions from all 10 levels! Pick A, B, or C to continue flying.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 space-y-1">
              <p className="font-extrabold text-amber-300 text-sm">3. Unlock Mars Rewards</p>
              <p className="text-slate-200">
                Get <strong>{TARGET_CORRECT_FOR_BADGE} correct answers</strong> to earn <strong>+{quiz.starReward} Stars</strong> &amp; the <strong>{quiz.badgeName}</strong> badge!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <label htmlFor="flappy-level-select" className="text-xs font-bold text-slate-300">
              Question Level:
            </label>
            <select
              id="flappy-level-select"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold px-3 py-2"
            >
              <option value="ALL">All 10 Levels ({FLAPPY_SPACE_QUIZ_QUESTIONS.length} Questions)</option>
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : phase === 'gameover' || phase === 'victory' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-lime-200 text-slate-950 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase">
              {badgeClaimed ? 'Flight Quiz Badge Earned!' : 'Flight Summary'}
            </p>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              {badgeClaimed ? quiz.badgeName : 'Nice Space Flight!'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Gates passed: <strong className="font-mono-tabular">{score}</strong> · Correct answers:{' '}
              <strong className="font-mono-tabular">{correctCount}</strong>
            </p>
          </div>

          {badgeClaimed && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              +{quiz.starReward} Explorer Stars Added!
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => resetAndStart()}
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-lime-300 hover:bg-lime-200 text-slate-950 text-sm font-extrabold"
            >
              <RotateCcw className="w-4 h-4" />
              Fly Again
            </button>
            <button
              type="button"
              onClick={() => {
                playChime('button');
                onBack();
              }}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 relative">
          {/* Interactive Canvas */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-[#070d1f] min-h-[325px]">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              onPointerDown={triggerFlap}
              className={`w-full object-contain mx-auto block cursor-pointer ${
                phase === 'quiz'
                  ? 'absolute inset-0 h-full opacity-35 pointer-events-none'
                  : 'max-h-[325px]'
              }`}
            />

            {/* On-Screen Quiz Checkpoint Overlay (replaces window.prompt/alert!) */}
            {phase === 'quiz' && currentQuestion && (
              <div className="relative z-10 min-h-[325px] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                <div className="w-full max-w-xl bg-white text-slate-900 rounded-2xl border-2 border-sky-400 shadow-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-sky-700">
                      {currentQuestion.level}
                    </span>
                    <span className="text-xs font-bold font-mono-tabular text-slate-500">
                      Gate #{score} Checkpoint
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                    {currentQuestion.prompt}
                  </h3>

                  <div className="space-y-2">
                    {currentQuestion.options.map((opt, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === currentQuestion.correctIndex;
                      const revealed = selectedOption !== null;

                      let cls =
                        'bg-slate-50 border-slate-200 text-slate-900 hover:border-sky-500 hover:bg-sky-50';
                      if (revealed) {
                        if (isCorrect) cls = 'bg-emerald-50 border-emerald-500 text-emerald-950';
                        else if (isSelected) cls = 'bg-amber-50 border-amber-500 text-amber-950';
                        else cls = 'bg-slate-50 border-slate-200 text-slate-400';
                      }

                      return (
                        <button
                          key={`${currentQuestion.id}-${idx}`}
                          type="button"
                          disabled={revealed}
                          onClick={() => handleSelectOption(idx)}
                          className={`w-full min-h-[42px] px-3.5 py-2 rounded-xl border-2 text-left text-xs sm:text-sm font-bold flex items-center justify-between gap-2 transition-colors ${cls}`}
                        >
                          <span>
                            <strong className="mr-2 font-mono-tabular">{letter})</strong>
                            {opt}
                          </span>
                          {revealed && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {revealed && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedOption !== null && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span
                        className={`text-xs font-extrabold ${
                          selectedOption === currentQuestion.correctIndex
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {selectedOption === currentQuestion.correctIndex
                          ? 'Correct! 🚀 Clear for launch!'
                          : `Almost! Correct answer: ${String.fromCharCode(
                              65 + currentQuestion.correctIndex
                            )}`}
                      </span>
                      <button
                        type="button"
                        onClick={handleContinueFlight}
                        className="min-h-[40px] px-5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-lime-300 text-xs sm:text-sm font-extrabold"
                      >
                        Continue Flight →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Touch / Click Flap Bar */}
          {phase === 'flying' && (
            <div className="flex justify-center">
              <button
                type="button"
                onPointerDown={triggerFlap}
                className="min-h-[44px] px-8 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-sm font-extrabold inline-flex items-center gap-2 select-none shadow-sm"
              >
                <ArrowUp className="w-4 h-4" />
                Flap / Fly Up (Space or ↑)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
