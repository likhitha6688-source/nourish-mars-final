import { useState } from 'react';
import { ArrowLeft, Award, CheckCircle2, RotateCcw, Star, XCircle } from 'lucide-react';
import type { Quiz } from '../../types/education.ts';
import { playChime } from '../../utils/soundEffects.ts';
import { FlappySpaceQuiz } from './FlappySpaceQuiz.tsx';

interface QuizArenaProps {
  quiz: Quiz;
  onBack: () => void;
  onCompleteQuiz: (quizId: string, starsEarned: number, badgeName: string) => void;
}

export function QuizArena({ quiz, onBack, onCompleteQuiz }: QuizArenaProps) {
  if (quiz.mode === 'flappy_flight') {
    return (
      <FlappySpaceQuiz
        quiz={quiz}
        onBack={onBack}
        onCompleteQuiz={onCompleteQuiz}
      />
    );
  }

  return (
    <StandardQuizArena
      quiz={quiz}
      onBack={onBack}
      onCompleteQuiz={onCompleteQuiz}
    />
  );
}

function StandardQuizArena({ quiz, onBack, onCompleteQuiz }: QuizArenaProps) {
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = quiz.questions || [];
  const current = questions[questionIdx];

  const handleSelectOption = (idx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
    const isCorrect = idx === current.correctIndex;
    if (isCorrect) {
      setScore((s) => s + (current.points || 100));
      setCorrectCount((c) => c + 1);
      playChime('success');
    } else {
      playChime('gentle');
    }
  };

  const handleNext = () => {
    playChime('button');
    if (questionIdx + 1 < questions.length) {
      setQuestionIdx((i) => i + 1);
      setSelectedIdx(null);
    } else {
      setFinished(true);
      playChime('achievement');
      onCompleteQuiz(quiz.id, quiz.starReward, quiz.badgeName);
    }
  };

  const handleRetry = () => {
    playChime('button');
    setQuestionIdx(0);
    setSelectedIdx(null);
    setScore(0);
    setCorrectCount(0);
    setFinished(false);
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <button type="button" onClick={onBack} className="text-sm font-medium text-sky-700 hover:underline mb-4">
          Back to Quizzes
        </button>
        <p className="text-slate-600">This quiz does not have any questions yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={() => {
            playChime('button');
            onBack();
          }}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quizzes
        </button>
        <div className="text-sm font-mono-tabular font-semibold text-slate-700">
          Points: {score} · Question {Math.min(questionIdx + 1, questions.length)} / {questions.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
        {finished ? (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-lime-200 text-slate-950 flex items-center justify-center mx-auto">
              <Award className="w-9 h-9" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-700 mb-1">NOURISH-Mars Quiz Complete</p>
              <h1 className="text-3xl font-bold text-slate-900">{quiz.title}</h1>
              <p className="text-slate-600 mt-2">
                You answered <strong className="font-mono-tabular">{correctCount} of {questions.length}</strong> questions right and scored <strong className="font-mono-tabular">{score}</strong> points!
              </p>
            </div>

            <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4">
              <div className="flex items-center gap-2 text-amber-600 font-bold">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                <span>+{quiz.starReward} Explorer Stars</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="text-sm font-semibold text-slate-900">
                Badge Unlocked: {quiz.badgeName}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRetry}
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Play Quiz Again
              </button>
              <button
                type="button"
                onClick={() => {
                  playChime('button');
                  onBack();
                }}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
              >
                More Quizzes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">
                {quiz.category} · {quiz.title}
              </p>
              {current.imageUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 aspect-[16/7] bg-slate-100">
                  <img
                    src={current.imageUrl}
                    alt={current.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {current.scenarioContext && (
                <div className="mt-3 p-4 rounded-xl bg-sky-50 border border-sky-200 text-sm text-sky-950">
                  <span className="font-semibold">Story Moment:</span> {current.scenarioContext}
                </div>
              )}
            </div>

            <h1 className="text-2xl font-bold text-slate-900">{current.prompt}</h1>

            <div className="space-y-3">
              {current.options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = selectedIdx === idx;
                const isCorrect = idx === current.correctIndex;
                const showResult = selectedIdx !== null;

                let styleClass =
                  'bg-white border-slate-200 text-slate-800 hover:border-sky-400 hover:bg-slate-50';
                if (showResult) {
                  if (isCorrect) {
                    styleClass = 'bg-emerald-50 border-emerald-500 text-emerald-950';
                  } else if (isSelected) {
                    styleClass = 'bg-amber-50 border-amber-500 text-amber-950';
                  } else {
                    styleClass = 'bg-slate-50 border-slate-200 text-slate-500';
                  }
                }

                return (
                  <button
                    key={`${current.id}-${idx}`}
                    type="button"
                    disabled={selectedIdx !== null}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full min-h-[54px] text-left px-5 py-3.5 rounded-xl border text-base font-medium transition-colors flex items-center justify-between gap-3 ${styleClass}`}
                  >
                    <span>
                      <strong className="mr-2 font-mono-tabular">{letter}.</strong>
                      {opt}
                    </span>
                    {showResult && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedIdx !== null && (
              <div
                className={`p-5 rounded-xl border ${
                  selectedIdx === current.correctIndex
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <p className="text-sm font-bold mb-1">
                  {selectedIdx === current.correctIndex
                    ? 'Maya says — Correct!'
                    : "Sathya says — Let's think about it together!"}
                </p>
                <p className="text-sm mb-4">
                  {selectedIdx === current.correctIndex
                    ? current.correctFeedback
                    : current.incorrectFeedback}
                </p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
                >
                  {questionIdx + 1 < questions.length ? 'Next Question' : 'See My Rewards'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
