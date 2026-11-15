import { useMemo, useState } from 'react';
import { ArrowLeft, Award, BookOpen, CheckCircle2, HelpCircle, RotateCcw, XCircle } from 'lucide-react';
import type { GameItem, Story } from '../../types/education.ts';
import { playChime } from '../../utils/soundEffects.ts';
import { ChapterMissionRouter } from './chapters/ChapterMissionRouter.tsx';

interface GameArenaProps {
  game: GameItem;
  relatedStory?: Story;
  onBack: () => void;
  onReturnToStorybook?: (story: Story) => void;
  onCompleteGame: (gameId: string, starsEarned: number) => void;
}

export function GameArena({
  game,
  relatedStory,
  onBack,
  onReturnToStorybook,
  onCompleteGame,
}: GameArenaProps) {
  const [completed, setCompleted] = useState(false);

  const finishGame = () => {
    if (!completed) {
      setCompleted(true);
      playChime('achievement');
      onCompleteGame(game.id, game.starReward);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-5 py-2.5">
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                playChime('button');
                onBack();
              }}
              className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Games
            </button>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
              {game.title}
            </h1>
          </div>
          <span className="text-xs font-semibold text-slate-500 shrink-0">
            {game.chapterNumber ? `Chapter ${game.chapterNumber} · ` : ''}
            +{game.starReward} Stars
          </span>
        </div>

        {game.type === 'chapter_mission' && (
          <ChapterMissionRouter mode={game.chapterGameId} onFinish={finishGame} />
        )}
        {game.type === 'scenario' && (
          <ScenarioGame game={game} onFinish={finishGame} />
        )}
        {game.type === 'matching' && (
          <MatchingGame game={game} onFinish={finishGame} />
        )}
        {game.type === 'dragdrop' && (
          <DragDropGame game={game} onFinish={finishGame} />
        )}
        {game.type === 'memory' && (
          <MemoryGame game={game} onFinish={finishGame} />
        )}

        {completed && (
          <div className="p-3.5 rounded-xl bg-lime-50 border border-lime-300 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-lime-300 text-slate-950 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Mars Mission Complete! (+{game.starReward} Explorer Stars)
                </h2>
                <p className="text-xs text-slate-700">
                  Maya &amp; Sathya say: “Awesome teamwork!”
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {relatedStory && onReturnToStorybook && (
                <button
                  type="button"
                  onClick={() => {
                    playChime('pop');
                    onReturnToStorybook(relatedStory);
                  }}
                  className="min-h-[38px] inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-lime-300 hover:bg-lime-200 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Return to Storybook
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  playChime('button');
                  onBack();
                }}
                className="min-h-[38px] px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                Choose Next Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScenarioGame({ game, onFinish }: { game: GameItem; onFinish: () => void }) {
  const steps = game.scenarios || [];
  const [stepIdx, setStepIdx] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  if (steps.length === 0) {
    return <p className="text-slate-500">No scenarios configured yet.</p>;
  }

  const current = steps[stepIdx];
  const chosen = current.choices.find((c) => c.id === selectedChoiceId);

  const handleNext = () => {
    playChime('button');
    if (stepIdx + 1 < steps.length) {
      setStepIdx((i) => i + 1);
      setSelectedChoiceId(null);
    } else {
      onFinish();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>Mars Situation {stepIdx + 1} of {steps.length}</span>
      </div>

      {current.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-slate-200 aspect-[16/7] bg-slate-100">
          <img
            src={current.imageUrl}
            alt={current.question}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5 rounded-xl bg-orange-50 border border-orange-200">
        <p className="text-xs font-semibold text-orange-800 mb-1">Mission Briefing</p>
        <p className="text-slate-800">{current.situation}</p>
      </div>

      <h2 className="text-xl font-bold text-slate-900">{current.question}</h2>

      <div className="space-y-3">
        {current.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => {
                setSelectedChoiceId(choice.id);
                playChime(choice.isCorrect ? 'success' : 'gentle');
              }}
              className={`w-full min-h-[52px] text-left px-5 py-3.5 rounded-xl border text-base font-medium transition-colors flex items-center justify-between gap-3 ${
                isSelected
                  ? choice.isCorrect
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                    : 'bg-amber-50 border-amber-500 text-amber-950'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-sky-400 hover:bg-slate-50'
              }`}
            >
              <span>{choice.label}</span>
              {isSelected &&
                (choice.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
                ))}
            </button>
          );
        })}
      </div>

      {chosen && (
        <div
          className={`p-4 rounded-xl border ${
            chosen.isCorrect
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          <p className="text-sm font-semibold mb-1">
            {chosen.isCorrect ? 'Maya & Sathya celebrate:' : 'Dr. Elena encourages you:'}
          </p>
          <p className="text-sm mb-3">{chosen.feedback}</p>
          {chosen.isCorrect && (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
            >
              {stepIdx + 1 < steps.length ? 'Next Mission Challenge' : 'Complete Mission'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function MatchingGame({ game, onFinish }: { game: GameItem; onFinish: () => void }) {
  const pairs = game.pairs || [];
  const shuffledRight = useMemo(() => {
    const arr = [...pairs];
    return arr.sort((a, b) => a.rightLabel.localeCompare(b.rightLabel));
  }, [pairs]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [hintText, setHintText] = useState<string>('Tap a clue on the left, then tap its matching science discovery on the right!');

  const handleRightClick = (rightPairId: string) => {
    if (!selectedLeft || matchedIds.includes(rightPairId)) return;
    if (selectedLeft === rightPairId) {
      const next = [...matchedIds, rightPairId];
      setMatchedIds(next);
      setSelectedLeft(null);
      playChime('success');
      setHintText('Great science match! Keep exploring!');
      if (next.length === pairs.length) {
        onFinish();
      }
    } else {
      playChime('gentle');
      const clue = pairs.find((p) => p.id === selectedLeft)?.hint;
      setHintText(clue ? `Almost! Hint: ${clue}` : 'Almost! Try another pair.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-sm text-sky-950">
        <span className="inline-flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-sky-700 shrink-0" />
          {hintText}
        </span>
        <span className="font-mono-tabular font-semibold">
          {matchedIds.length} / {pairs.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          {pairs.map((p) => {
            const isMatched = matchedIds.includes(p.id);
            const isSelected = selectedLeft === p.id;
            return (
              <button
                key={p.id}
                type="button"
                disabled={isMatched}
                onClick={() => {
                  playChime('button');
                  setSelectedLeft(p.id);
                  setHintText(`Selected "${p.leftLabel}". Now pick its match on the right!`);
                }}
                className={`w-full min-h-[64px] px-4 py-2.5 rounded-xl border text-left font-medium transition-colors flex items-center gap-3 ${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 opacity-75'
                    : isSelected
                    ? 'bg-lime-100 border-slate-900 text-slate-950'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-sky-400'
                }`}
              >
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.leftLabel}
                    className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
                  />
                ) : (
                  <span className="text-2xl" aria-hidden="true">{p.symbol}</span>
                )}
                <span className="text-sm">{p.leftLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {shuffledRight.map((p) => {
            const isMatched = matchedIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                disabled={isMatched}
                onClick={() => handleRightClick(p.id)}
                className={`w-full min-h-[64px] px-4 py-3 rounded-xl border text-left font-semibold transition-colors flex items-center justify-between ${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-sky-50 hover:border-sky-400'
                }`}
              >
                <span className="text-sm">{p.rightLabel}</span>
                {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DragDropGame({ game, onFinish }: { game: GameItem; onFinish: () => void }) {
  const zones = game.dragZones || [];
  const items = game.dragItems || [];
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>(
    'Drag any card into a Mars Greenhouse bin below—or tap a card then tap the bin!'
  );

  const remaining = items.filter((it) => !placed[it.id]);

  const placeItemInZone = (itemId: string, zoneId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    if (item.zoneId === zoneId) {
      const next = { ...placed, [itemId]: zoneId };
      setPlaced(next);
      setSelectedItemId(null);
      playChime('success');
      setFeedback(`Great call! ${item.label} is sorted right where Maya needs it!`);
      if (Object.keys(next).length === items.length) {
        onFinish();
      }
    } else {
      playChime('gentle');
      setFeedback(`Hmm, think about Maya’s greenhouse! Should ${item.label} go in the other bin?`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-sm text-sky-950 flex items-center justify-between gap-3">
        <span>{feedback}</span>
        <span className="font-mono-tabular font-semibold whitespace-nowrap">
          {Object.keys(placed).length} / {items.length} Sorted
        </span>
      </div>

      <div className="flex flex-wrap gap-3 min-h-[72px] p-4 rounded-xl bg-slate-50 border border-slate-200">
        {remaining.length === 0 ? (
          <p className="text-sm font-medium text-emerald-700">Every greenhouse item sorted cleanly!</p>
        ) : (
          remaining.map((item) => (
            <button
              key={item.id}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', item.id);
                setSelectedItemId(item.id);
              }}
              onClick={() => {
                playChime('button');
                setSelectedItemId((cur) => (cur === item.id ? null : item.id));
              }}
              className={`min-h-[48px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold cursor-grab active:cursor-grabbing transition-colors ${
                selectedItemId === item.id
                  ? 'bg-lime-200 border-slate-900 text-slate-950'
                  : 'bg-white border-slate-300 text-slate-900 hover:border-sky-400'
              }`}
            >
              <span className="text-xl" aria-hidden="true">{item.symbol}</span>
              <span>{item.label}</span>
            </button>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {zones.map((zone) => {
          const zoneItems = items.filter((it) => placed[it.id] === zone.id);
          return (
            <div
              key={zone.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const draggedId = e.dataTransfer.getData('text/plain') || selectedItemId;
                if (draggedId) placeItemInZone(draggedId, zone.id);
              }}
              onClick={() => {
                if (selectedItemId) placeItemInZone(selectedItemId, zone.id);
              }}
              className={`p-5 rounded-2xl border-2 border-dashed transition-colors min-h-[160px] cursor-pointer ${
                selectedItemId
                  ? 'border-sky-400 bg-sky-50/40 hover:bg-sky-50'
                  : 'border-slate-300 bg-white'
              }`}
            >
              <h3 className="text-lg font-bold text-slate-900 mb-1">{zone.title}</h3>
              <p className="text-xs text-slate-500 mb-4">{zone.description}</p>
              <div className="flex flex-wrap gap-2">
                {zoneItems.map((it) => (
                  <span
                    key={it.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold"
                  >
                    <span>{it.symbol}</span>
                    {it.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MemoryGame({ game, onFinish }: { game: GameItem; onFinish: () => void }) {
  const pairs = game.pairs || [];
  const cards = useMemo(() => {
    const deck = pairs.flatMap((p) => [
      { uid: `${p.id}-a`, pairId: p.id, label: p.leftLabel, symbol: p.symbol, imageUrl: p.imageUrl },
      { uid: `${p.id}-b`, pairId: p.id, label: p.leftLabel, symbol: p.symbol, imageUrl: p.imageUrl },
    ]);
    for (let i = deck.length - 1; i > 0; i--) {
      const j = (i * 7 + 3) % (i + 1);
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }, [pairs]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleFlip = (uid: string, pairId: string) => {
    if (locked || flipped.includes(uid) || matchedPairs.includes(pairId)) return;
    playChime('button');
    const nextFlipped = [...flipped, uid];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const first = cards.find((c) => c.uid === nextFlipped[0]);
      const second = cards.find((c) => c.uid === nextFlipped[1]);
      if (first && second && first.pairId === second.pairId) {
        const nextMatched = [...matchedPairs, first.pairId];
        setMatchedPairs(nextMatched);
        setFlipped([]);
        playChime('success');
        if (nextMatched.length === pairs.length) {
          onFinish();
        }
      } else {
        setLocked(true);
        playChime('gentle');
        window.setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 700);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm">
        <span className="font-mono-tabular text-slate-700">
          Moves: <strong>{moves}</strong> · Pairs Found: <strong>{matchedPairs.length} / {pairs.length}</strong>
        </span>
        <button
          type="button"
          onClick={() => {
            setFlipped([]);
            setMatchedPairs([]);
            setMoves(0);
            setLocked(false);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restart
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => {
          const isRevealed = flipped.includes(card.uid) || matchedPairs.includes(card.pairId);
          const isMatched = matchedPairs.includes(card.pairId);
          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => handleFlip(card.uid, card.pairId)}
              className={`min-h-[124px] rounded-2xl border p-2.5 flex flex-col items-center justify-center gap-2 transition-colors overflow-hidden ${
                isMatched
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : isRevealed
                  ? 'bg-white border-sky-400 text-slate-900'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-lime-300'
              }`}
            >
              {isRevealed ? (
                <>
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={card.label}
                      className="w-full h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-3xl" aria-hidden="true">{card.symbol}</span>
                  )}
                  <span className="text-xs font-semibold text-center leading-tight">{card.label}</span>
                </>
              ) : (
                <span className="text-lg font-bold">?</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
