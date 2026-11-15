import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  HelpCircle,
  MapPin,
  Monitor,
  Pause,
  RotateCcw,
  Sparkles,
  Type,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { GameItem, Quiz, Story, VoiceRoleId } from '../../types/education.ts';
import {
  playChime,
  speakSceneSequence,
  stopNarration,
  tokenizeWords,
  type SpeechSegment,
} from '../../utils/soundEffects.ts';
import { CharacterCastStrip, CHARACTER_SPECS } from './CharacterCastStrip.tsx';

export interface StorybookSegment {
  speaker: string;
  role: VoiceRoleId;
  text: string;
}

export interface StorybookViewProps {
  story: Story;
  allStories?: Story[];
  defaultReadAloud: boolean;
  isAlreadyCompleted: boolean;
  relatedGame?: GameItem;
  relatedQuiz?: Quiz;
  onClose: () => void;
  onSelectStory?: (story: Story) => void;
  onCompleteStory: (storyId: string) => void;
  onLaunchGame: (game: GameItem) => void;
  onLaunchQuiz: (quiz: Quiz) => void;
}

export function StorybookView({
  story,
  allStories = [],
  defaultReadAloud,
  isAlreadyCompleted,
  relatedGame,
  relatedQuiz,
  onClose,
  onSelectStory,
  onCompleteStory,
  onLaunchGame,
  onLaunchQuiz,
}: StorybookViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const [pageIdx, setPageIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [readAloud, setReadAloud] = useState(defaultReadAloud);
  const [readAlong, setReadAlong] = useState(true);
  const [largeText, setLargeText] = useState(false);
  const [muted, setMuted] = useState(false);
  const [completedNow, setCompletedNow] = useState(false);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);

  const lastSpokenPageRef = useRef<string>('');
  const lastAlertPageRef = useRef<string>('');

  const pages = useMemo(
    () =>
      story.scenes.length > 0
        ? story.scenes
        : [
            {
              id: 'fallback',
              sceneCode: story.chapterLabel,
              duration: 10,
              setting: 'harvest' as const,
              imageUrl: story.thumbnailUrl,
              headline: story.title,
              narration: story.description,
              characterSpeaker: 'Maya',
              characterDialogue: 'Every leaf begins with a question.',
            },
          ],
    [story.scenes, story.chapterLabel, story.thumbnailUrl, story.title, story.description]
  );

  const safePageIdx = Math.min(pageIdx, pages.length - 1);
  const activePage = pages[safePageIdx];
  const isFirstPage = safePageIdx === 0;
  const isLastPage = safePageIdx === pages.length - 1;

  const currentChapterIdx = allStories.findIndex((s) => s.id === story.id);
  const nextChapter =
    currentChapterIdx >= 0 && currentChapterIdx < allStories.length - 1
      ? allStories[currentChapterIdx + 1]
      : undefined;

  const pageSegments: StorybookSegment[] = useMemo(() => {
    const segs: StorybookSegment[] = [];
    if (activePage.dialogueLines && activePage.dialogueLines.length > 0) {
      for (const dl of activePage.dialogueLines) {
        segs.push({ speaker: dl.speaker, role: dl.voiceRole, text: dl.line });
      }
    } else if (activePage.characterDialogue) {
      segs.push({
        speaker: activePage.characterSpeaker || 'Maya',
        role: 'maya-adult',
        text: activePage.characterDialogue,
      });
    }
    if (activePage.narration && activePage.narration.trim()) {
      segs.push({ speaker: 'Narrator', role: 'narrator', text: activePage.narration });
    }
    return segs;
  }, [activePage]);

  const speechSegments: SpeechSegment[] = useMemo(
    () => pageSegments.map((s) => ({ role: s.role, text: s.text })),
    [pageSegments]
  );

  const activeSpeakerName = useMemo(() => {
    if (
      activeSegmentIndex !== null &&
      activePage.dialogueLines &&
      activeSegmentIndex < activePage.dialogueLines.length
    ) {
      return activePage.dialogueLines[activeSegmentIndex].speaker;
    }
    if (activeSegmentIndex !== null && pageSegments[activeSegmentIndex]) {
      return pageSegments[activeSegmentIndex].speaker;
    }
    return activePage.dialogueLines?.[0]?.speaker || activePage.characterSpeaker || 'Narrator';
  }, [activeSegmentIndex, activePage, pageSegments]);

  useEffect(() => {
    setPageIdx(0);
    setDirection(1);
    setCompletedNow(false);
    setActiveSegmentIndex(null);
    setActiveWordIndex(0);
    lastSpokenPageRef.current = '';
    lastAlertPageRef.current = '';
  }, [story.id]);

  useEffect(() => {
    if (
      !completedNow &&
      !muted &&
      (activePage.id === 'ch3-s1' || activePage.id === 'ch8-s1') &&
      lastAlertPageRef.current !== activePage.id
    ) {
      lastAlertPageRef.current = activePage.id;
      playChime('alert');
    }
  }, [completedNow, muted, activePage.id]);

  useEffect(() => {
    if (!completedNow && readAloud && !muted) {
      if (lastSpokenPageRef.current !== activePage.id) {
        lastSpokenPageRef.current = activePage.id;
        speakSceneSequence(
          speechSegments,
          true,
          (segIdx) => {
            setActiveSegmentIndex(segIdx);
            setActiveWordIndex(0);
          },
          (_segIdx, wIdx) => {
            setActiveWordIndex(wIdx);
          }
        );
      }
    } else {
      setActiveSegmentIndex(null);
      setActiveWordIndex(0);
      stopNarration();
    }
  }, [completedNow, readAloud, muted, activePage.id, speechSegments]);

  useEffect(() => {
    return () => stopNarration();
  }, []);

  const goToPage = (nextIdx: number) => {
    if (nextIdx < 0 || nextIdx >= pages.length) return;
    playChime('button');
    stopNarration();
    lastSpokenPageRef.current = '';
    setDirection(nextIdx >= safePageIdx ? 1 : -1);
    setActiveSegmentIndex(null);
    setActiveWordIndex(0);
    setCompletedNow(false);
    setPageIdx(nextIdx);
  };

  const handleFinishChapter = () => {
    stopNarration();
    setDirection(1);
    setCompletedNow(true);
    playChime('achievement');
    onCompleteStory(story.id);
  };

  const handleRestartBook = () => {
    playChime('button');
    stopNarration();
    lastSpokenPageRef.current = '';
    lastAlertPageRef.current = '';
    setDirection(-1);
    setCompletedNow(false);
    setActiveSegmentIndex(null);
    setActiveWordIndex(0);
    setPageIdx(0);
  };

  const handleSpeakFromSegment = (startIdx: number) => {
    if (muted || startIdx < 0 || startIdx >= speechSegments.length) return;
    playChime('button');
    if (!readAloud) setReadAloud(true);
    lastSpokenPageRef.current = activePage.id;
    speakSceneSequence(
      speechSegments.slice(startIdx),
      true,
      (offsetIdx) => {
        setActiveSegmentIndex(offsetIdx === null ? null : startIdx + offsetIdx);
        setActiveWordIndex(0);
      },
      (_offsetIdx, wIdx) => {
        setActiveWordIndex(wIdx);
      }
    );
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopNarration();
        onClose();
      } else if (!completedNow && e.key === 'ArrowRight') {
        if (!isLastPage) goToPage(safePageIdx + 1);
      } else if (!completedNow && e.key === 'ArrowLeft') {
        if (!isFirstPage) goToPage(safePageIdx - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const renderHighlightedWords = (text: string, segIndex: number) => {
    const tokens = tokenizeWords(text);
    const isCurrentSeg = readAlong && activeSegmentIndex === segIndex;
    const isPastSeg = readAlong && activeSegmentIndex !== null && segIndex < activeSegmentIndex;

    return tokens.map((tok, wIdx) => {
      const isCurrentWord = isCurrentSeg && wIdx === activeWordIndex;
      const isSpokenWord = isPastSeg || (isCurrentSeg && wIdx < activeWordIndex);
      return (
        <span
          key={`word-${segIndex}-${wIdx}`}
          className={`transition-colors duration-100 ${
            isCurrentWord
              ? 'bg-lime-300 text-slate-950 font-extrabold px-1 rounded shadow-xs'
              : isSpokenWord
              ? 'text-slate-900 font-medium'
              : 'text-slate-800'
          }`}
        >
          {tok.word}
        </span>
      );
    });
  };

  const pageTurnVariants = {
    enter: (dir: number) =>
      prefersReducedMotion
        ? { opacity: 0 }
        : {
            opacity: 0,
            x: dir >= 0 ? 64 : -64,
            rotateY: dir >= 0 ? -10 : 10,
            scale: 0.985,
          },
    center: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      scale: 1,
      transition: prefersReducedMotion
        ? { duration: 0.12 }
        : { duration: 0.36, ease: [0.22, 1, 0.36, 1] as const },
    },
    exit: (dir: number) =>
      prefersReducedMotion
        ? { opacity: 0 }
        : {
            opacity: 0,
            x: dir >= 0 ? -64 : 64,
            rotateY: dir >= 0 ? 10 : -10,
            scale: 0.985,
            transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as const },
          },
  };

  return (
    <div className="w-full max-w-6xl bg-[#0B132B] rounded-3xl border border-amber-300/25 shadow-2xl p-2 sm:p-3.5 my-auto">
      {/* Top Book Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 py-2.5 text-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-300/15 border border-amber-300/35 flex items-center justify-center text-amber-200 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-200 truncate">
              NOURISH—MARS: THE LAST HARVEST · {story.chapterLabel}
              {(isAlreadyCompleted || completedNow) && ' · Completed'}
            </p>
            <h2 className="text-base sm:text-lg font-bold text-white truncate">{story.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-lg bg-white/10 text-xs font-mono-tabular text-amber-100">
            Page {safePageIdx + 1} of {pages.length}
          </span>
          {!completedNow && (
            <button
              type="button"
              onClick={handleFinishChapter}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-colors whitespace-nowrap"
            >
              Mark Chapter Read
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              stopNarration();
              onClose();
            }}
            className="min-w-[42px] min-h-[42px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors"
            aria-label="Close storybook"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chapter Switcher Strip when multiple chapters are available */}
      {allStories.length > 1 && onSelectStory && (
        <div className="px-3 sm:px-4 pb-2.5 flex items-center gap-1.5 overflow-x-auto">
          {allStories.map((ch) => {
            const active = ch.id === story.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  if (!active) {
                    playChime('button');
                    stopNarration();
                    onSelectStory(ch);
                  }
                }}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-amber-300 text-slate-950'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
              >
                {ch.chapterLabel}
              </button>
            );
          })}
        </div>
      )}

      {/* Animated Open Two-Page Storybook Spread */}
      <div
        className="relative bg-[#FFFDF8] rounded-2xl overflow-hidden border border-amber-200/80 shadow-inner"
        style={{ perspective: '1600px' }}
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {completedNow ? (
            <motion.div
              key={`${story.id}-completed`}
              custom={direction}
              variants={pageTurnVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="min-h-[460px] flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-[#FFFDF7] via-amber-50/60 to-lime-50/50"
            >
              <div className="max-w-lg w-full bg-white rounded-2xl p-7 text-center border border-amber-200 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-lime-100 text-lime-700 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
                  {story.chapterLabel} Finished!
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  {story.title}
                </h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  Maya &amp; Sathya cheer for you! You earned{' '}
                  <strong className="text-slate-900">+2 Explorer Stars</strong>. Continue the adventure by playing the matching game, taking the quiz, or turning to the next chapter!
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
                  {nextChapter && onSelectStory && (
                    <button
                      type="button"
                      onClick={() => {
                        playChime('pop');
                        onSelectStory(nextChapter);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 text-sm font-bold transition-colors"
                    >
                      Read {nextChapter.chapterLabel}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {relatedGame && (
                    <button
                      type="button"
                      onClick={() => {
                        playChime('button');
                        onClose();
                        onLaunchGame(relatedGame);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      Step 2: Play Game
                    </button>
                  )}
                  {relatedQuiz && (
                    <button
                      type="button"
                      onClick={() => {
                        playChime('button');
                        onClose();
                        onLaunchQuiz(relatedQuiz);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-lime-300 hover:bg-lime-400 text-slate-950 text-sm font-semibold transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Step 3: Take Quiz
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRestartBook}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Read Again
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`${story.id}-${activePage.id}`}
              custom={direction}
              variants={pageTurnVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ transformStyle: 'preserve-3d' }}
              className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]"
            >
              {/* LEFT PAGE: Picture Illustration, Cast & Scene Inset */}
              <div className="lg:col-span-6 bg-[#FAF4E8] p-5 sm:p-7 flex flex-col justify-between gap-4 border-b lg:border-b-0 lg:border-r border-amber-200/90 lg:shadow-[inset_-18px_0_24px_-18px_rgba(120,53,15,0.16)]">
                <div className="space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-100 border border-amber-200 rounded-lg px-2.5 py-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      {activePage.location || story.category}
                    </span>
                    <span className="text-xs font-mono-tabular font-semibold text-amber-800/80">
                      {activePage.sceneCode || `Page ${safePageIdx + 1}`}
                    </span>
                  </div>

                  {/* Framed Storybook Illustration */}
                  <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-md bg-slate-900 aspect-[16/10]">
                    <img
                      src={activePage.imageUrl}
                      alt={`${activePage.headline} illustration`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/10" />
                  </div>

                  {activePage.screenText && (
                    <div className="rounded-xl bg-slate-900 border border-amber-300/40 px-3.5 py-2.5 flex items-start gap-2.5 text-amber-200 shadow-xs">
                      <Monitor className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                      <p className="text-xs font-mono-tabular font-semibold leading-snug">
                        {activePage.screenText}
                      </p>
                    </div>
                  )}

                  {activePage.characters && activePage.characters.length > 0 && (
                    <div className="pt-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900/70 mb-1.5">
                        In This Scene
                      </p>
                      <CharacterCastStrip
                        characters={activePage.characters}
                        activeSpeaker={readAloud ? activeSpeakerName : ''}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-amber-200/80 flex items-start justify-between gap-3 text-xs text-amber-900/80">
                  <p className="italic leading-relaxed">
                    {activePage.visualCue || story.description}
                  </p>
                  <span className="shrink-0 font-mono-tabular font-bold text-amber-800">
                    p. {safePageIdx + 1}
                  </span>
                </div>
              </div>

              {/* RIGHT PAGE: Story Text, Dialogue & Word-by-Word Read-Along */}
              <div className="lg:col-span-6 bg-[#FFFDF9] p-5 sm:p-7 flex flex-col justify-between gap-5 lg:shadow-[inset_18px_0_24px_-18px_rgba(120,53,15,0.12)]">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-amber-200/70">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-orange-700 flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        {story.chapterLabel} · {activePage.sceneCode || `Page ${safePageIdx + 1}`}
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                        {activePage.headline}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playChime('button');
                        setLargeText((v) => !v);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        largeText
                          ? 'bg-amber-100 border-amber-300 text-amber-950'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                      title="Toggle larger reading text"
                    >
                      <Type className="w-3.5 h-3.5" />
                      {largeText ? 'A+' : 'A'}
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {pageSegments.map((seg, sIdx) => {
                      const isNarrator = seg.role === 'narrator';
                      const isCurrentSeg = activeSegmentIndex === sIdx;
                      const matchingSpec = Object.values(CHARACTER_SPECS).find(
                        (spec) =>
                          seg.speaker.toLowerCase().includes(spec.label.toLowerCase()) ||
                          (spec.id === 'REYES' && seg.speaker.toLowerCase().includes('reyes')) ||
                          (spec.id === 'ELENA' && seg.speaker.toLowerCase().includes('elena'))
                      );

                      if (isNarrator) {
                        return (
                          <div
                            key={`book-seg-${activePage.id}-${sIdx}`}
                            className={`rounded-2xl p-4 border transition-colors ${
                              isCurrentSeg
                                ? 'bg-amber-50 border-lime-400 shadow-xs'
                                : 'bg-amber-50/50 border-amber-200/80'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">
                                Story Narrator
                              </span>
                              <button
                                type="button"
                                onClick={() => handleSpeakFromSegment(sIdx)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-900"
                                title="Read narrator passage aloud"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                Listen
                              </button>
                            </div>
                            <p
                              className={`font-serif ${
                                largeText
                                  ? 'text-xl leading-relaxed'
                                  : 'text-base sm:text-lg leading-relaxed'
                              } text-slate-900 flex flex-wrap gap-x-1.5 gap-y-0.5`}
                            >
                              {renderHighlightedWords(seg.text, sIdx)}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={`book-seg-${activePage.id}-${sIdx}`}
                          className={`rounded-2xl p-3.5 border transition-colors ${
                            isCurrentSeg
                              ? 'bg-lime-50/70 border-lime-400 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-amber-300'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleSpeakFromSegment(sIdx)}
                              title={`Hear ${seg.speaker} speak`}
                              className="mt-0.5 shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white transition-transform hover:scale-105"
                              style={{ backgroundColor: matchingSpec?.topColor || '#0F172A' }}
                            >
                              <Volume2 className="w-3 h-3" />
                              {seg.speaker}
                            </button>
                            <p
                              className={`${
                                largeText
                                  ? 'text-lg sm:text-xl leading-relaxed'
                                  : 'text-base sm:text-[17px] leading-relaxed'
                              } text-slate-900 flex-1 flex flex-wrap gap-x-1.5 gap-y-0.5`}
                            >
                              <span aria-hidden="true">&ldquo;</span>
                              {renderHighlightedWords(seg.text, sIdx)}
                              <span aria-hidden="true">&rdquo;</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right-Page Footer: Read-Aloud & Read-Along Controls */}
                <div className="pt-3 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playChime('button');
                        if (readAloud) {
                          setReadAloud(false);
                        } else {
                          lastSpokenPageRef.current = '';
                          setMuted(false);
                          setReadAloud(true);
                        }
                      }}
                      className={`min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                        readAloud && !muted
                          ? 'bg-slate-900 text-lime-300 hover:bg-slate-800'
                          : 'bg-amber-100 text-amber-950 hover:bg-amber-200'
                      }`}
                    >
                      {readAloud && !muted ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause Reading
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          Read Page Aloud
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playChime('button');
                        setReadAlong((v) => !v);
                      }}
                      className={`min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition-colors ${
                        readAlong
                          ? 'bg-lime-100 border-lime-400 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Read-Along {readAlong ? 'On' : 'Off'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMuted((m) => !m)}
                    className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
                    aria-label={muted ? 'Unmute storybook voices' : 'Mute storybook voices'}
                  >
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Page-Turning Navigation Bar */}
      <div className="px-3 sm:px-4 pt-3 pb-1.5 flex flex-wrap items-center justify-between gap-3 text-white">
        <button
          type="button"
          disabled={isFirstPage || completedNow}
          onClick={() => goToPage(safePageIdx - 1)}
          className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-35 text-sm font-semibold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Page
        </button>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {pages.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => goToPage(idx)}
              className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-colors ${
                !completedNow && idx === safePageIdx
                  ? 'bg-lime-300 text-slate-950'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              {p.sceneCode?.replace('Scene ', '') || idx + 1}
            </button>
          ))}
        </div>

        {!completedNow && (
          isLastPage ? (
            <button
              type="button"
              onClick={handleFinishChapter}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-300 hover:bg-lime-200 text-slate-950 text-sm font-bold transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Finish {story.chapterLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goToPage(safePageIdx + 1)}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 text-sm font-bold transition-colors"
            >
              Next Page
              <ChevronRight className="w-4 h-4" />
            </button>
          )
        )}
      </div>

      {(relatedGame || relatedQuiz) && (
        <div className="px-4 py-2 mt-1 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
          <span>After reading this chapter, continue your NOURISH-Mars mission:</span>
          <div className="flex items-center gap-4">
            {relatedGame && (
              <button
                type="button"
                onClick={() => {
                  stopNarration();
                  onClose();
                  onLaunchGame(relatedGame);
                }}
                className="font-semibold text-sky-300 hover:text-sky-200 hover:underline inline-flex items-center gap-1"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                Play: {relatedGame.title}
              </button>
            )}
            {relatedQuiz && (
              <button
                type="button"
                onClick={() => {
                  stopNarration();
                  onClose();
                  onLaunchQuiz(relatedQuiz);
                }}
                className="font-semibold text-lime-300 hover:text-lime-200 hover:underline inline-flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Quiz: {relatedQuiz.title}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
