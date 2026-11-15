import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Box,
  CheckCircle2,
  ExternalLink,
  Gamepad2,
  HelpCircle,
  Music,
  Pause,
  Play,
  Rocket,
  Sparkles,
  Star,
  Upload,
  XCircle,
} from 'lucide-react';
import type { GameItem, NasaModelItem, Quiz, Story } from '../../types/education.ts';
import { Hero3DScene } from '../three/Hero3DScene.tsx';
import { Nasa3DViewer } from '../three/Nasa3DViewer.tsx';
import {
  playChime,
  subscribeAudioState,
  toggleBackgroundMusic,
} from '../../utils/soundEffects.ts';
import {
  AnimatedMissionVisuals,
  ImageLightbox,
  type ShowcasePicture,
} from './AnimatedMissionVisuals.tsx';

interface HomeViewProps {
  stories: Story[];
  games: GameItem[];
  quizzes: Quiz[];
  models: NasaModelItem[];
  stars: number;
  onNavigate: (page: 'stories' | 'games' | 'quizzes' | 'parents') => void;
  onWatchStory: (story: Story) => void;
  onPlayGame: (game: GameItem) => void;
  onStartQuiz: (quiz: Quiz) => void;
}

const MISSION_GALLERY: Array<ShowcasePicture> = [
  {
    src: '/assets/nourish/scenes/scene_01.jpg',
    title: 'Maya: The Girl Who Grows a Dream',
    caption: 'From Earth backyard seedlings to Mars hydroponics.',
  },
  {
    src: '/assets/nourish/scenes/scene_02.jpg',
    title: 'Sathya & Maya’s Rover Workshop',
    caption: 'Designing toy rovers first, then full Mars hardware.',
  },
  {
    src: '/assets/nourish/scenes/scene_05.png',
    title: 'Childhood Sketchbook & Stargazing',
    caption: 'Drawing green sprouts on Mars under the night sky.',
  },
  {
    src: '/assets/nourish/scenes/scene_09.jpg',
    title: 'Mars Hydroponic Greenhouse Bay',
    caption: 'Checking irrigation H₂O and nutrient feed on tablet.',
  },
  {
    src: '/assets/nourish/scenes/scene_03.jpg',
    title: 'Dr. Elena Brooks · Habitat Biology',
    caption: 'Inspecting holographic crop data in the Mars lab.',
  },
  {
    src: '/assets/nourish/scenes/scene_04.jpg',
    title: 'Commander Reyes · Orbital Bridge',
    caption: 'Coordinating mission safety high above the planet.',
  },
  {
    src: '/assets/nourish/scenes/scene_08.png',
    title: 'NASA Space Food & Sublimation Lab',
    caption: 'Freeze-dried strawberries, space meals, and nutrition.',
  },
  {
    src: '/assets/nourish/scenes/scene_06.jpg',
    title: 'Planet Earth · Home & Family',
    caption: 'Warm kitchens and labs beneath Earth’s swirling sky.',
  },
  {
    src: '/assets/nourish/scenes/scene_07.jpg',
    title: 'Mars Reconnaissance Orbiter',
    caption: 'Spinning solar panels & dish orbiting Mars.',
  },
  {
    src: '/assets/nourish/scenes/scene_10.jpg',
    title: 'Interplanetary Data Link (MRO + DSN)',
    caption: 'How 70m Earth antennas talk to Mars spacecraft.',
  },
  {
    src: '/assets/nourish/scenes/scene_11.jpg',
    title: 'The Sun: Energy & Space Weather',
    caption: 'Sunlight powers solar arrays; solar flares bring risk.',
  },
];

export function HomeView({
  stories,
  games,
  quizzes,
  models,
  stars,
  onNavigate,
  onWatchStory,
  onPlayGame,
  onStartQuiz,
}: HomeViewProps) {
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || 'nasa-mars');
  const [localGlbUrl, setLocalGlbUrl] = useState<string | null>(null);
  const [localGlbName, setLocalGlbName] = useState<string>('');
  const [challengeChoice, setChallengeChoice] = useState<number | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<ShowcasePicture | null>(null);

  useEffect(() => {
    return subscribeAudioState((state) => {
      setMusicPlaying(state.playing);
    });
  }, []);

  const activeModel = models.find((m) => m.id === selectedModelId) || models[0];
  const featuredStory = stories[0];
  const featuredGame = games[0];
  const featuredQuiz = quizzes[0];

  const handleLocalGlbPick = (file: File) => {
    if (localGlbUrl) URL.revokeObjectURL(localGlbUrl);
    const url = URL.createObjectURL(file);
    setLocalGlbUrl(url);
    setLocalGlbName(file.name);
    playChime('pop');
  };

  return (
    <div>
      {/* 1. ANIMATED 3D COSMIC WELCOME HERO (Homepage-only smooth animations) */}
      <section className="relative bg-[#070d1f] text-white overflow-hidden">
        {/* Subtle atmospheric starry Mars dream backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-22">
          <img
            src="/assets/nourish/scenes/scene_05.png"
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070d1f] via-[#070d1f]/85 to-[#070d1f]/75" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Copy & Actions */}
            <div className="lg:col-span-5 space-y-5">
              <p className="text-sm font-semibold text-lime-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                NOURISH-Mars · Based on &ldquo;The Last Harvest&rdquo;
              </p>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] text-balance">
                Little Explorers,{' '}
                <span className="text-lime-300">Big Adventures on Mars!</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-lg">
                Join <strong>Maya</strong> and <strong>Sathya</strong> from a backyard stargazing blanket all the way to Jezero Crater! Discover space food, hydroponic gardens, Mars rovers, and teamwork through interactive stories, games, and quizzes.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#learning-categories"
                  onClick={() => playChime('button')}
                  className="min-h-[48px] inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-lime-300 hover:bg-lime-200 text-slate-950 text-base font-bold transition-colors whitespace-nowrap"
                >
                  Start Exploring
                  <ArrowRight className="w-5 h-5" />
                </a>

                {featuredStory && (
                  <button
                    type="button"
                    onClick={() => {
                      playChime('pop');
                      onWatchStory(featuredStory);
                    }}
                    className="min-h-[48px] inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/25 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors whitespace-nowrap"
                  >
                    <BookOpen className="w-4 h-4 text-lime-300" />
                    Read Chapter 1
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const started = toggleBackgroundMusic();
                    if (started) playChime('star');
                  }}
                  className="min-h-[48px] inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-sky-400/35 bg-sky-500/15 hover:bg-sky-500/25 text-sky-100 text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  {musicPlaying ? (
                    <>
                      <Pause className="w-4 h-4 text-lime-300" />
                      Pause Mission Music
                    </>
                  ) : (
                    <>
                      <Music className="w-4 h-4 text-lime-300" />
                      Play Mission Music
                    </>
                  )}
                </button>
              </div>

              {/* Character & Progress Summary */}
              <div className="pt-4 border-t border-white/15 flex flex-wrap items-center gap-5 text-sm text-slate-200">
                <span className="inline-flex items-center gap-1.5 font-mono-tabular">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <strong className="text-white">{stars}</strong> Explorer Stars
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-sky-300" />
                  Read · Imagine · Play · Grow
                </span>
              </div>
            </div>

            {/* Right Interactive 3D Mascot (Maya) & Mars Stage */}
            <div className="lg:col-span-7 home-float-slow">
              <Hero3DScene />
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE THREE MAIN CATEGORIES WITH USER'S CATEGORY ARTWORK */}
      <section id="learning-categories" className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-orange-700 mb-1">Choose Your NOURISH-Mars Mission</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
              Three Big Ways to Read, Play, and Learn
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-sm">
            Every story chapter connects directly to hands-on games and problem-solving quizzes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 01 — STORIES */}
          <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
              <img
                src="/assets/nourish/scenes/scene_01.jpg"
                alt="Maya: The Girl Who Grows a Dream storybook cover showing young Maya and astronaut Maya in the Mars greenhouse"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {featuredStory && (
                <button
                  type="button"
                  onClick={() => {
                    playChime('pop');
                    onWatchStory(featuredStory);
                  }}
                  className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-lime-300" />
                  Read {featuredStory.chapterLabel}
                </button>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sky-700 mb-1">
                  01 · Stories ({stories.length} Chapters)
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Read &amp; Imagine</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Follow Maya, Sathya, Dr. Elena, and Commander Reyes across the full illustrated <em>NOURISH-Mars</em> storybook.
                </p>
                <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Illustrated two-page storybook with read-along highlights</li>
                  <li>Space food science, Jezero Crater &amp; Mars storms</li>
                  <li>Instant link to matching games &amp; quizzes</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  playChime('button');
                  onNavigate('stories');
                }}
                className="min-h-[46px] w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Explore Stories
              </button>
            </div>
          </article>

          {/* 02 — GAMES */}
          <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
              <img
                src="/assets/nourish/scenes/scene_02.jpg"
                alt="Sathya and Maya building Mars rovers in their sunny engineering workshop"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {featuredGame && (
                <button
                  type="button"
                  onClick={() => {
                    playChime('pop');
                    onPlayGame(featuredGame);
                  }}
                  className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-700/95 hover:bg-sky-800 text-white text-xs font-semibold transition-colors"
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-lime-300" />
                  Quick Play: {featuredGame.title}
                </button>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sky-700 mb-1">
                  02 · Games ({games.length} Activities)
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Play &amp; Experiment</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Nine playful chapter mini-games—one clear goal per mission with animations and Maya &amp; Sathya cheering you on!
                </p>
                <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Maya&apos;s Garden Rescue, Connect the Mission &amp; Bubble Trouble</li>
                  <li>Every Watt Counts, Greenhouse Mystery Tiles &amp; Water Route</li>
                  <li>Two Readings One Source, Storm Word Scramble &amp; Harvest Adventure</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  playChime('button');
                  onNavigate('games');
                }}
                className="min-h-[46px] w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors"
              >
                <Gamepad2 className="w-4 h-4" />
                Play Games
              </button>
            </div>
          </article>

          {/* 03 — QUIZZES */}
          <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
              <img
                src="/assets/nourish/scenes/scene_08.png"
                alt="NASA Space Food collage featuring freeze-dried strawberries, astronaut meals, and science lab nutrition"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {featuredQuiz && (
                <button
                  type="button"
                  onClick={() => {
                    playChime('pop');
                    onStartQuiz(featuredQuiz);
                  }}
                  className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800/95 hover:bg-emerald-900 text-white text-xs font-semibold transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-lime-300" />
                  Try: {featuredQuiz.title}
                </button>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                  03 · Quizzes ({quizzes.length} Challenges)
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Think &amp; Earn Badges</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Test what you discovered in Maya &amp; Sathya&apos;s journey with real-life science scenarios and instant feedback.
                </p>
                <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Real questions about Mars, food &amp; systems</li>
                  <li>Encouraging feedback from Maya &amp; Sathya</li>
                  <li>Unlock Explorer Stars and special Mars badges</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  playChime('button');
                  onNavigate('quizzes');
                }}
                className="min-h-[46px] w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-lime-300 hover:bg-lime-400 text-slate-950 text-sm font-bold transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Take a Quiz
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* 2B. ANIMATED SUN, EARTH & SATELLITE SHOWCASE */}
      <AnimatedMissionVisuals onZoomImage={setZoomedImage} />

      {/* 3. INTERACTIVE NOURISH-MARS STORY CHALLENGE & VISUAL MISSION GALLERY */}
      <section className="bg-slate-100/90 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-sm font-semibold text-orange-700">
                Interactive Story Challenge · Chapter 2
              </p>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight text-balance">
                Think Like Maya &amp; Sathya in the Mars Greenhouse
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Dr. Brooks reminds the crew: <em>&ldquo;On Mars, nothing works alone.&rdquo;</em> Practice solving a real crisis from the story before launching the full mission!
              </p>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200">
                <img
                  src="/assets/nourish/scenes/scene_09.jpg"
                  alt="Maya kneeling inside the Martian hydroponic greenhouse bay checking irrigation telemetry"
                  referrerPolicy="no-referrer"
                  className="w-20 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 block text-sm">Clue from Maya &amp; Dr. Brooks:</strong>
                  When two water sensors disagree, never guess from a screen alone—follow the physical pipe!
                </div>
              </div>

              {featuredStory && (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playChime('pop');
                      onWatchStory(featuredStory);
                    }}
                    className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
                  >
                    <Play className="w-4 h-4 fill-lime-300 text-lime-300" />
                    Read Story From Chapter 1
                  </button>
                  {featuredGame && (
                    <button
                      type="button"
                      onClick={() => {
                        playChime('button');
                        onPlayGame(featuredGame);
                      }}
                      className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 text-sm font-semibold transition-colors"
                    >
                      <Rocket className="w-4 h-4 text-orange-600" />
                      Open Full Mission Game
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-sky-700">
                  Live Decision Challenge · CHANNEL MISMATCH
                </p>
                <span className="text-xs text-slate-500 font-mono-tabular">Jezero Hydroponics Bay</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                The greenhouse lettuce leaves are drooping, and the dashboard shows <span className="font-mono-tabular text-orange-700">CHANNEL MISMATCH</span>. What should Maya and Sathya do?
              </h3>

              <div className="space-y-2.5">
                {[
                  'A. Ignore the drooping leaves because one sensor looks green.',
                  'B. Trace the physical nutrient water pipes together and check the backup pump.',
                  'C. Mix untamed Martian dust soil directly into the water tank.',
                ].map((option, idx) => {
                  const isSelected = challengeChoice === idx;
                  const isCorrect = idx === 1;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setChallengeChoice(idx);
                        playChime(isCorrect ? 'success' : 'gentle');
                      }}
                      className={`w-full min-h-[48px] px-4 py-3 rounded-xl border text-left text-sm sm:text-base font-medium transition-colors flex items-center justify-between gap-3 ${
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                            : 'bg-amber-50 border-amber-500 text-amber-950'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-sky-400'
                      }`}
                    >
                      <span>{option}</span>
                      {isSelected &&
                        (isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        ))}
                    </button>
                  );
                })}
              </div>

              {challengeChoice !== null && (
                <div
                  className={`p-4 rounded-xl border text-sm leading-relaxed ${
                    challengeChoice === 1
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <span className="font-bold">
                    {challengeChoice === 1 ? 'Maya & Sathya say:' : 'Dr. Brooks reminds you:'}
                  </span>{' '}
                  {challengeChoice === 1
                    ? 'Spot on! By following the real pipe, Sathya found the bent connector restricting flow—and checking systems together saved the crop!'
                    : 'Not quite! Martian regolith contains perchlorates and cannot go in hydroponic water, and sensors must always be verified in person.'}
                </div>
              )}
            </div>
          </div>

          {/* Illustrated Mission & Space Food Gallery using User Uploaded Images */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                Inside the NOURISH-Mars Adventure &amp; Space Food Lab
              </h3>
              <button
                type="button"
                onClick={() => {
                  playChime('button');
                  onNavigate('stories');
                }}
                className="text-sm font-semibold text-sky-700 hover:underline inline-flex items-center gap-1"
              >
                See all {stories.length} chapters (9 Chapters + Epilogue)
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {MISSION_GALLERY.map((item) => (
                <button
                  key={item.src}
                  type="button"
                  onClick={() => {
                    playChime('pop');
                    setZoomedImage(item);
                  }}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col text-left hover:border-sky-400 transition-colors group"
                >
                  <div className="aspect-[16/10] w-full bg-slate-950 overflow-hidden">
                    <img
                      src={item.src}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-slate-900 leading-snug">{item.title}</p>
                    <p className="text-[11px] text-slate-600 leading-snug mt-0.5">{item.caption}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. NASA 3D MARS & SPACE EXPLORER + GLB/GLTF VIEWER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold text-sky-700 mb-1">Real NASA Science Meets Imagination</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              NASA-Inspired 3D Mars &amp; Space Explorer
            </h2>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Spin Mars, inspect Sathya&apos;s Jezero Crater Rover, Earth, and deep-space craft—or preview any{' '}
              <code className="font-mono-tabular text-xs bg-slate-100 px-1.5 py-0.5 rounded">.glb / .gltf</code> 3D model.
            </p>
          </div>
          <label className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold cursor-pointer transition-colors self-start">
            <Upload className="w-4 h-4 text-sky-600" />
            {localGlbName ? `Loaded: ${localGlbName}` : 'Preview Local .GLB Model'}
            <input
              type="file"
              accept=".glb,.gltf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLocalGlbPick(file);
              }}
            />
          </label>
        </div>

        {/* Model Selector Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {models.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setLocalGlbUrl(null);
                setLocalGlbName('');
                setSelectedModelId(m.id);
                playChime('button');
              }}
              className={`min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                !localGlbUrl && selectedModelId === m.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Box className="w-4 h-4" />
              {m.title}
            </button>
          ))}
        </div>

        {activeModel && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8">
              <Nasa3DViewer model={activeModel} localGlbUrl={localGlbUrl} />
            </div>
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <p className="text-xs font-medium text-sky-700">{activeModel.subtitle}</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {localGlbName || activeModel.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {localGlbName
                    ? 'Rendering your custom GLB/glTF 3D model with physically-based studio lighting and interactive 360-degree orbit controls.'
                    : activeModel.description}
                </p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <strong className="block text-slate-900 mb-1">NOURISH-Mars Fun Fact</strong>
                  {activeModel.funFact}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                <p>{activeModel.credit}</p>
                <a
                  href={activeModel.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sky-700 font-semibold hover:underline"
                >
                  Explore Official NASA 3D Resources
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      <ImageLightbox item={zoomedImage} onClose={() => setZoomedImage(null)} />
    </div>
  );
}
