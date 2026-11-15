import { Award, CheckCircle2, HelpCircle, Play } from 'lucide-react';
import type { Quiz } from '../../types/education.ts';
import { playChime } from '../../utils/soundEffects.ts';

interface QuizzesViewProps {
  quizzes: Quiz[];
  completedQuizIds: string[];
  onStartQuiz: (quiz: Quiz) => void;
}

export function QuizzesView({ quizzes, completedQuizIds, onStartQuiz }: QuizzesViewProps) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Quiz Banner featuring Uploaded Quiz Show Illustration */}
      <div className="bg-slate-900 text-white rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch mb-10 border border-slate-800">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-3">
          <p className="text-xs font-semibold text-lime-300">03. Quiz &amp; Challenges · NOURISH-Mars</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Think, Answer &amp; Earn Mars Badges
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Answer story-based questions about space food, sublimation, Jezero Crater, sensor debugging, and dust storm survival with instant encouragement from Maya &amp; Sathya.
          </p>
          <div className="pt-2 text-xs sm:text-sm font-mono-tabular text-lime-300 font-semibold">
            {completedQuizIds.length} / {quizzes.length} Quizzes Completed
          </div>
        </div>
        <div className="lg:col-span-5 bg-slate-950">
          <img
            src="/assets/nourish/scenes/scene_03.jpg"
            alt="Dr. Elena Brooks inspecting holographic habitat biology telemetry with Maya and Sathya"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover min-h-[220px]"
          />
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-600">
          <HelpCircle className="w-8 h-8 mx-auto mb-3 text-slate-400" />
          <p className="font-medium text-slate-900">No published quizzes yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => {
            const isCompleted = completedQuizIds.includes(quiz.id);
            return (
              <article
                key={quiz.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:border-slate-300 transition-colors"
              >
                {quiz.thumbnailUrl && (
                  <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
                    <img
                      src={quiz.thumbnailUrl}
                      alt={quiz.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                      <span>{quiz.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">
                        {quiz.mode === 'flappy_flight'
                          ? '182 Questions · Flight Game'
                          : `${quiz.questions.length} Questions`}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">+{quiz.starReward} Stars</span>
                      {isCompleted && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Badge Earned
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{quiz.title}</h2>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">{quiz.description}</p>
                    <p className="text-xs font-medium text-slate-700 inline-flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      Badge reward: {quiz.badgeName}
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        playChime('button');
                        onStartQuiz(quiz);
                      }}
                      className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-300 hover:bg-lime-400 text-slate-950 text-sm font-bold transition-colors"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      {isCompleted ? 'Retake Quiz' : 'Take Quiz'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
