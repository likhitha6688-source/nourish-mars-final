import { useCallback, useEffect, useState } from 'react';
import { Award, Menu, Star, X } from 'lucide-react';
import type {
  AppContentPayload,
  ChildProgress,
  GameItem,
  ParentalSettings,
  Quiz,
  Story,
} from './types/education.ts';
import { HomeView } from './components/home/HomeView.tsx';
import { StoriesView } from './components/stories/StoriesView.tsx';
import { StoryPlayerModal } from './components/stories/StoryPlayerModal.tsx';
import { GamesView } from './components/games/GamesView.tsx';
import { GameArena } from './components/games/GameArena.tsx';
import { QuizzesView } from './components/quizzes/QuizzesView.tsx';
import { QuizArena } from './components/quizzes/QuizArena.tsx';
import { ParentTeacherView } from './components/parents/ParentTeacherView.tsx';
import { TakeAwayNotesView } from './components/notes/TakeAwayNotesView.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { MusicControlBar } from './components/audio/MusicControlBar.tsx';
import { PWAInstallButton } from './components/pwa/PWAInstallButton.tsx';
import { OfflineIndicator } from './components/pwa/OfflineIndicator.tsx';
import { playChime } from './utils/soundEffects.ts';

type PageRoute = 'home' | 'stories' | 'games' | 'quizzes' | 'notes' | 'parents' | 'admin';

export default function App() {
  const [route, setRoute] = useState<PageRoute>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [content, setContent] = useState<AppContentPayload | null>(null);
  const [progress, setProgress] = useState<ChildProgress>({
    explorerName: 'Maya & Sathya Crew',
    stars: 0,
    completedStoryIds: [],
    completedGameIds: [],
    completedQuizIds: [],
    badges: [],
  });
  const [adminToken, setAdminToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? window.sessionStorage.getItem('nourish_mars_admin_token') : null
  );

  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  const loadContent = useCallback(async (tokenOverride?: string | null) => {
    const activeTok = tokenOverride !== undefined ? tokenOverride : adminToken;
    const headers: Record<string, string> = {};
    if (activeTok) headers.Authorization = `Bearer ${activeTok}`;
    const [contentRes, progressRes] = await Promise.all([
      fetch('/api/content', { headers }),
      fetch('/api/progress'),
    ]);
    if (contentRes.ok) {
      const data = (await contentRes.json()) as AppContentPayload;
      setContent(data);
    }
    if (progressRes.ok) {
      const prog = (await progressRes.json()) as ChildProgress;
      setProgress(prog);
    }
  }, [adminToken]);

  useEffect(() => {
    loadContent().catch(() => {});
  }, [loadContent]);

  const persistProgress = async (next: ChildProgress) => {
    setProgress(next);
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
  };

  const handleCompleteStory = async (storyId: string) => {
    const already = progress.completedStoryIds.includes(storyId);
    playChime('star');
    const next: ChildProgress = {
      ...progress,
      stars: already ? progress.stars : progress.stars + 2,
      completedStoryIds: already ? progress.completedStoryIds : [...progress.completedStoryIds, storyId],
    };
    await persistProgress(next);
  };

  const handleCompleteGame = async (gameId: string, starsEarned: number) => {
    const already = progress.completedGameIds.includes(gameId);
    playChime('achievement');
    const next: ChildProgress = {
      ...progress,
      stars: already ? progress.stars : progress.stars + starsEarned,
      completedGameIds: already ? progress.completedGameIds : [...progress.completedGameIds, gameId],
    };
    await persistProgress(next);
  };

  const handleCompleteQuiz = async (quizId: string, starsEarned: number, badgeName: string) => {
    const already = progress.completedQuizIds.includes(quizId);
    playChime('achievement');
    const nextBadges = progress.badges.includes(badgeName)
      ? progress.badges
      : [...progress.badges, badgeName];
    const next: ChildProgress = {
      ...progress,
      stars: already ? progress.stars : progress.stars + starsEarned,
      completedQuizIds: already ? progress.completedQuizIds : [...progress.completedQuizIds, quizId],
      badges: nextBadges,
    };
    await persistProgress(next);
  };

  const handleSaveParentSettings = async (nextSettings: ParentalSettings) => {
    const res = await fetch('/api/parent-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextSettings),
    });
    if (res.ok && content) {
      const updated = (await res.json()) as ParentalSettings;
      setContent({ ...content, parentSettings: updated });
      playChime('success');
    }
  };

  const handleResetProgress = async () => {
    const res = await fetch('/api/progress/reset', { method: 'POST' });
    if (res.ok) {
      const resetProg = (await res.json()) as ChildProgress;
      setProgress(resetProg);
      playChime('pop');
    }
  };

  const handleAdminLogin = async (passcode: string): Promise<string | null> => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });
    const data = (await res.json()) as { token?: string; error?: string };
    if (!res.ok || !data.token) {
      return data.error || 'Incorrect passcode.';
    }
    window.sessionStorage.setItem('nourish_mars_admin_token', data.token);
    setAdminToken(data.token);
    await loadContent(data.token);
    return null;
  };

  const handleAdminLogout = async () => {
    if (adminToken) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }
    window.sessionStorage.removeItem('nourish_mars_admin_token');
    setAdminToken(null);
    await loadContent(null);
  };

  const navigate = (nextRoute: PageRoute) => {
    playChime('button');
    setRoute(nextRoute);
    setActiveGame(null);
    setActiveQuiz(null);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openGameDirectly = (game: GameItem) => {
    playChime('button');
    setRoute('games');
    setActiveGame(game);
    setActiveQuiz(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openQuizDirectly = (quiz: Quiz) => {
    playChime('button');
    setRoute('quizzes');
    setActiveQuiz(quiz);
    setActiveGame(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stories = content?.stories || [];
  const games = content?.games || [];
  const quizzes = content?.quizzes || [];
  const models = content?.models || [];
  const parentSettings = content?.parentSettings || {
    dailyLimitMinutes: 45,
    defaultCaptionsOn: true,
    readAloudEnabled: false,
    safeExploreOnly: true,
  };

  const publishedStories = stories.filter((s) => s.published);
  const publishedGames = games.filter((g) => g.published);
  const publishedQuizzes = quizzes.filter((q) => q.published);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Three-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#070d1f] text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => navigate('home')}
            className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="9" fill="#EA580C" />
              <circle cx="16" cy="17" r="8" fill="#FB923C" />
              <path
                d="M16 18C16 13.5 19.5 10.5 22.5 10.5C22.5 14 19.5 17.5 16 18Z"
                fill="#C7F234"
              />
              <path
                d="M16 18C16 14 13 11.5 10 11.5C10 14.5 13 17.5 16 18Z"
                fill="#A3E635"
              />
              <path d="M16 17V24" stroke="#070D1F" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="font-display">
              NOURISH-<span className="text-lime-300">Mars</span>
            </span>
          </button>

          {/* Zone 2: Concise Nav Links */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-5 text-sm font-medium text-slate-300" aria-label="Primary Navigation">
            {(
              [
                ['home', 'Home'],
                ['stories', 'Stories'],
                ['games', 'Games'],
                ['quizzes', 'Quizzes'],
                ['notes', 'Take Away Notes'],
                ['parents', 'Parents & About'],
              ] as Array<[PageRoute, string]>
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => navigate(key)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                  route === key
                    ? 'text-lime-300 border-lime-300'
                    : 'border-transparent hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Install App + Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <PWAInstallButton />
            <button
              type="button"
              onClick={() => navigate('stories')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-300 hover:bg-lime-200 text-slate-950 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0"
            >
              Start Learning
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-white/15 text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0b132b] px-4 py-4 space-y-2">
            {(
              [
                ['home', 'Home'],
                ['stories', 'Stories'],
                ['games', 'Games'],
                ['quizzes', 'Quizzes'],
                ['notes', 'Take Away Notes'],
                ['parents', 'Parents & About'],
                ['admin', 'Admin Studio'],
              ] as Array<[PageRoute, string]>
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => navigate(key)}
                className={`w-full min-h-[44px] text-left px-3 py-2 rounded-xl text-sm font-semibold ${
                  route === key ? 'bg-lime-300 text-slate-950' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Clean Child Progress Ribbon on Learning Views (hidden during active full-screen game play) */}
      {(route === 'stories' || (route === 'games' && !activeGame) || route === 'quizzes' || route === 'notes') && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900 font-mono-tabular">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                {progress.stars} Stars
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600 font-mono-tabular">
                <Award className="w-4 h-4 text-sky-600" />
                {progress.badges.length} Badges
              </span>
            </div>
            <span className="text-slate-500">
              Explore Maya &amp; Sathya&apos;s Mars chapters, play space-food games, and earn badges!
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {!content ? (
          <div className="max-w-6xl mx-auto px-4 py-20 text-center text-slate-600 text-sm">
            Loading NOURISH-Mars adventures...
          </div>
        ) : route === 'home' ? (
          <HomeView
            stories={publishedStories}
            games={publishedGames}
            quizzes={publishedQuizzes}
            models={models}
            stars={progress.stars}
            onNavigate={(page) => navigate(page)}
            onWatchStory={(s) => setActiveStory(s)}
            onPlayGame={openGameDirectly}
            onStartQuiz={openQuizDirectly}
          />
        ) : route === 'stories' ? (
          <StoriesView
            stories={publishedStories}
            games={publishedGames}
            quizzes={publishedQuizzes}
            completedStoryIds={progress.completedStoryIds}
            onWatchStory={(s) => setActiveStory(s)}
            onLaunchGame={openGameDirectly}
            onLaunchQuiz={openQuizDirectly}
          />
        ) : route === 'games' ? (
          activeGame ? (
            <GameArena
              game={activeGame}
              relatedStory={publishedStories.find((s) => s.id === activeGame.storyId)}
              onBack={() => setActiveGame(null)}
              onReturnToStorybook={(story) => {
                setActiveGame(null);
                setRoute('stories');
                setActiveStory(story);
              }}
              onCompleteGame={handleCompleteGame}
            />
          ) : (
            <GamesView
              games={publishedGames}
              completedGameIds={progress.completedGameIds}
              onPlayGame={(g) => setActiveGame(g)}
            />
          )
        ) : route === 'quizzes' ? (
          activeQuiz ? (
            <QuizArena
              quiz={activeQuiz}
              onBack={() => setActiveQuiz(null)}
              onCompleteQuiz={handleCompleteQuiz}
            />
          ) : (
            <QuizzesView
              quizzes={publishedQuizzes}
              completedQuizIds={progress.completedQuizIds}
              onStartQuiz={(q) => setActiveQuiz(q)}
            />
          )
        ) : route === 'notes' ? (
          <TakeAwayNotesView />
        ) : route === 'parents' ? (
          <ParentTeacherView
            settings={parentSettings}
            progress={progress}
            onSaveSettings={handleSaveParentSettings}
            onResetProgress={handleResetProgress}
            onOpenAdmin={() => navigate('admin')}
          />
        ) : (
          <AdminDashboard
            token={adminToken}
            stories={stories}
            games={games}
            quizzes={quizzes}
            models={models}
            onLogin={handleAdminLogin}
            onLogout={handleAdminLogout}
            onRefresh={() => loadContent()}
          />
        )}
      </main>

      {/* Interactive Illustrated Storybook Modal */}
      {activeStory && (
        <StoryPlayerModal
          story={activeStory}
          allStories={publishedStories}
          defaultCaptionsOn={parentSettings.defaultCaptionsOn}
          defaultReadAloud={parentSettings.readAloudEnabled}
          isAlreadyCompleted={progress.completedStoryIds.includes(activeStory.id)}
          relatedGame={publishedGames.find((g) => g.id === activeStory.relatedGameId)}
          relatedQuiz={publishedQuizzes.find((q) => q.id === activeStory.relatedQuizId)}
          onClose={() => setActiveStory(null)}
          onSelectStory={(nextStory) => setActiveStory(nextStory)}
          onCompleteStory={handleCompleteStory}
          onLaunchGame={openGameDirectly}
          onLaunchQuiz={openQuizDirectly}
        />
      )}

      {/* User-Controlled Background Music & Volume Dock */}
      {!activeGame && <MusicControlBar />}

      {/* Clean Footer (hidden during active game play to keep single-page no-scroll view) */}
      {!activeGame && (
        <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-20 sm:pb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div>
              <p className="font-bold text-white text-sm mb-1">NOURISH-Mars Educational Studio</p>
              <p className="text-slate-400">
                Safe, ad-free space-food &amp; Mars exploration for children · Inspired by NASA 3D Resources, DONKI &amp; OSDR
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 font-medium">
              <button type="button" onClick={() => navigate('stories')} className="hover:text-white">
                Stories
              </button>
              <button type="button" onClick={() => navigate('games')} className="hover:text-white">
                Games
              </button>
              <button type="button" onClick={() => navigate('quizzes')} className="hover:text-white">
                Quizzes
              </button>
              <button type="button" onClick={() => navigate('notes')} className="hover:text-white">
                Take Away Notes
              </button>
              <button type="button" onClick={() => navigate('parents')} className="hover:text-white">
                Parents &amp; About
              </button>
              <button type="button" onClick={() => navigate('admin')} className="text-lime-300 hover:text-lime-200">
                Administrator Studio
              </button>
            </div>
          </div>
        </footer>
      )}
      <OfflineIndicator />
    </div>
  );
}
