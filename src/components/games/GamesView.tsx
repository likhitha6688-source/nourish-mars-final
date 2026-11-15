import { CheckCircle2, Gamepad2, Play } from 'lucide-react';
import type { GameItem } from '../../types/education.ts';
import { playChime } from '../../utils/soundEffects.ts';

interface GamesViewProps {
  games: GameItem[];
  completedGameIds: string[];
  onPlayGame: (game: GameItem) => void;
}

const TYPE_LABEL: Record<GameItem['type'], string> = {
  scenario: 'Mars Mission Decisions',
  matching: 'Picture & Science Matching',
  dragdrop: 'Greenhouse Drag & Drop',
  memory: 'Mars Photo Memory Flip',
  chapter_mission: 'Chapter Adventure',
};

export function GamesView({ games, completedGameIds, onPlayGame }: GamesViewProps) {
  const orderedGames = [...games].sort((a, b) => (a.chapterNumber ?? 99) - (b.chapterNumber ?? 99));

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Games Hero Banner with Uploaded Controller & Puzzle Kid Illustration */}
      <div className="bg-slate-900 text-white rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch mb-10 border border-slate-800">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-3">
          <p className="text-xs font-semibold text-lime-300">02. Game Adventures · NOURISH-Mars</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Play, Build, Connect &amp; Solve Across Chapters 1–9
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Build Maya and Sathya&apos;s childhood experiment, connect Mars habitat systems, solve radiation &amp; power challenges, trace sensor data, and nurture the greenhouse harvest!
          </p>
          <div className="pt-2 text-xs sm:text-sm font-mono-tabular text-lime-300 font-semibold">
            {completedGameIds.length} / {games.length} Games Completed
          </div>
        </div>
        <div className="lg:col-span-5 bg-slate-950">
          <img
            src="/assets/nourish/scenes/scene_02.jpg"
            alt="Sathya and Maya building Mars rovers in their engineering workshop"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover min-h-[220px]"
          />
        </div>
      </div>

      {orderedGames.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-600">
          <Gamepad2 className="w-8 h-8 mx-auto mb-3 text-slate-400" />
          <p className="font-medium text-slate-900">No published games available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orderedGames.map((game) => {
            const isCompleted = completedGameIds.includes(game.id);
            return (
              <article
                key={game.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:border-slate-300 transition-colors"
              >
                {game.thumbnailUrl && (
                  <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
                    <img
                      src={game.thumbnailUrl}
                      alt={game.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                      {game.chapterNumber && (
                        <>
                          <span className="text-orange-700 font-semibold">Chapter {game.chapterNumber}</span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      <span>{game.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{TYPE_LABEL[game.type]}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">+{game.starReward} Stars</span>
                      {isCompleted && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{game.title}</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">{game.description}</p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        playChime('button');
                        onPlayGame(game);
                      }}
                      className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      {isCompleted ? 'Play Again' : 'Play Game'}
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
