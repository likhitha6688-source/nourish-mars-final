import { useState, type FormEvent } from 'react';
import {
  Box,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Film,
  Gamepad2,
  HelpCircle,
  Lock,
  LogOut,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import type {
  GameItem,
  GameType,
  NasaModelItem,
  Quiz,
  Story,
  StoryCategory,
} from '../../types/education.ts';

interface AdminDashboardProps {
  token: string | null;
  stories: Story[];
  games: GameItem[];
  quizzes: Quiz[];
  models: NasaModelItem[];
  onLogin: (passcode: string) => Promise<string | null>;
  onLogout: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

type AdminTab = 'stories' | 'games' | 'quizzes' | 'models';

export function AdminDashboard({
  token,
  stories,
  games,
  quizzes,
  models,
  onLogin,
  onLogout,
  onRefresh,
}: AdminDashboardProps) {
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('stories');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [zipDownloadUrl, setZipDownloadUrl] = useState<string | null>(null);

  // Story form state
  const [chapterLabel, setChapterLabel] = useState('Bonus Chapter');
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDesc, setStoryDesc] = useState('');
  const [storyCategory, setStoryCategory] = useState<StoryCategory>('Space Food');
  const [storyAge, setStoryAge] = useState('Ages 6–12');
  const [storyThumb, setStoryThumb] = useState('/assets/nourish/img1_1.jpg');
  const [storyVideoUrl, setStoryVideoUrl] = useState('');
  const [storyCaption, setStoryCaption] = useState('');
  const [storyGameId, setStoryGameId] = useState('');
  const [storyQuizId, setStoryQuizId] = useState('');
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Game form state
  const [gameTitle, setGameTitle] = useState('');
  const [gameDesc, setGameDesc] = useState('');
  const [gameCategory, setGameCategory] = useState<StoryCategory>('Hydroponics');
  const [gameType, setGameType] = useState<GameType>('scenario');
  const [gamePrompt, setGamePrompt] = useState('A sensor pipe in the Mars greenhouse looks pinched. What should Sathya do?');
  const [gameRightChoice, setGameRightChoice] = useState('Isolate the pipe safely, clear the bend, and check an independent meter.');
  const [gameWrongChoice, setGameWrongChoice] = useState('Ignore the plants because the screen says normal.');

  // Quiz form state
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizCategory, setQuizCategory] = useState<StoryCategory>('Space Food');
  const [quizBadge, setQuizBadge] = useState('Mars Harvest Hero');
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptionA, setQuizOptionA] = useState('');
  const [quizOptionB, setQuizOptionB] = useState('');
  const [quizOptionC, setQuizOptionC] = useState('');
  const [quizCorrectIdx, setQuizCorrectIdx] = useState(1);
  const [quizCorrectFeedback, setQuizCorrectFeedback] = useState('Fantastic! Maya & Sathya celebrate your Mars science skills!');
  const [quizWrongFeedback, setQuizWrongFeedback] = useState("Almost! Let's think about it together.");

  // 3D GLB model form state
  const [modelTitle, setModelTitle] = useState('');
  const [modelDesc, setModelDesc] = useState('');
  const [modelCredit, setModelCredit] = useState('NASA 3D Resources / NOURISH-Mars Studio');
  const [modelGlbUrl, setModelGlbUrl] = useState('');

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    const err = await onLogin(passcode);
    setLoggingIn(false);
    if (err) setLoginError(err);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!token) return null;
    setUploadingAsset(true);
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setErrorMessage(data.error || 'Upload failed.');
        return null;
      }
      setStatusMessage(`Uploaded ${file.name} securely.`);
      return data.url;
    } catch {
      setErrorMessage('Network error during file upload.');
      return null;
    } finally {
      setUploadingAsset(false);
    }
  };

  const handleCreateStory = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErrorMessage('');
    setStatusMessage('');
    const res = await fetch('/api/admin/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        chapterLabel,
        title: storyTitle,
        description: storyDesc,
        category: storyCategory,
        ageRange: storyAge,
        durationSeconds: 30,
        thumbnailUrl: storyThumb,
        videoUrl: storyVideoUrl || undefined,
        relatedGameId: storyGameId || undefined,
        relatedQuizId: storyQuizId || undefined,
        captions: storyCaption ? [{ start: 0, end: 30, text: storyCaption }] : undefined,
        published: true,
      }),
    });
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      setErrorMessage(err.error || 'Could not save chapter.');
      return;
    }
    setStoryTitle('');
    setStoryDesc('');
    setStoryVideoUrl('');
    setStoryCaption('');
    setStatusMessage('New NOURISH-Mars chapter published!');
    await onRefresh();
  };

  const toggleStoryPublished = async (story: Story) => {
    if (!token) return;
    await fetch(`/api/admin/stories/${story.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ published: !story.published }),
    });
    await onRefresh();
  };

  const deleteStory = async (id: string) => {
    if (!token) return;
    await fetch(`/api/admin/stories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await onRefresh();
  };

  const handleCreateGame = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErrorMessage('');
    setStatusMessage('');

    const payload: Partial<GameItem> = {
      title: gameTitle,
      description: gameDesc,
      category: gameCategory,
      type: gameType,
      starReward: 3,
      published: true,
    };

    if (gameType === 'scenario') {
      payload.scenarios = [
        {
          id: `sc-${Date.now()}`,
          situation: gameDesc,
          question: gamePrompt,
          choices: [
            {
              id: 'opt-1',
              label: `A. ${gameRightChoice}`,
              isCorrect: true,
              feedback: "Fantastic! Maya & Sathya celebrate your smart choice!",
            },
            {
              id: 'opt-2',
              label: `B. ${gameWrongChoice}`,
              isCorrect: false,
              feedback: "Almost! Let's think about it together.",
            },
          ],
        },
      ];
    } else if (gameType === 'matching' || gameType === 'memory') {
      payload.pairs = [
        { id: 'p1', leftLabel: gameRightChoice, rightLabel: gameCategory, symbol: '🌱', hint: gamePrompt },
        { id: 'p2', leftLabel: 'Maya & Sathya', rightLabel: 'NOURISH-Mars Crew', symbol: '🚀', hint: 'Working together on Mars!' },
      ];
    } else {
      payload.dragZones = [
        { id: 'z1', title: 'Helps Mars Crew', description: 'Safe science actions' },
        { id: 'z2', title: 'Hazard / Fix First', description: 'Risks to solve' },
      ];
      payload.dragItems = [
        { id: 'i1', label: gameRightChoice, zoneId: 'z1', symbol: '✅' },
        { id: 'i2', label: gameWrongChoice, zoneId: 'z2', symbol: '⚠️' },
      ];
    }

    const res = await fetch('/api/admin/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setErrorMessage('Could not create game.');
      return;
    }
    setGameTitle('');
    setGameDesc('');
    setStatusMessage('New interactive game published!');
    await onRefresh();
  };

  const toggleGamePublished = async (game: GameItem) => {
    if (!token) return;
    await fetch(`/api/admin/games/${game.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ published: !game.published }),
    });
    await onRefresh();
  };

  const deleteGame = async (id: string) => {
    if (!token) return;
    await fetch(`/api/admin/games/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await onRefresh();
  };

  const handleCreateQuiz = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErrorMessage('');
    setStatusMessage('');

    const options = [quizOptionA, quizOptionB, quizOptionC].filter((o) => o.trim().length > 0);
    if (options.length < 2) {
      setErrorMessage('Please enter at least 2 answer choices.');
      return;
    }

    const res = await fetch('/api/admin/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: quizTitle,
        description: quizDesc || 'Test your NOURISH-Mars knowledge!',
        category: quizCategory,
        badgeName: quizBadge,
        starReward: 5,
        published: true,
        questions: [
          {
            id: `qq-${Date.now()}`,
            prompt: quizQuestion,
            options,
            correctIndex: Math.min(quizCorrectIdx, options.length - 1),
            correctFeedback: quizCorrectFeedback,
            incorrectFeedback: quizWrongFeedback,
            points: 100,
          },
        ],
      }),
    });
    if (!res.ok) {
      setErrorMessage('Could not save quiz.');
      return;
    }
    setQuizTitle('');
    setQuizDesc('');
    setQuizQuestion('');
    setQuizOptionA('');
    setQuizOptionB('');
    setQuizOptionC('');
    setStatusMessage('New quiz published!');
    await onRefresh();
  };

  const toggleQuizPublished = async (quiz: Quiz) => {
    if (!token) return;
    await fetch(`/api/admin/quizzes/${quiz.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ published: !quiz.published }),
    });
    await onRefresh();
  };

  const deleteQuiz = async (id: string) => {
    if (!token) return;
    await fetch(`/api/admin/quizzes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await onRefresh();
  };

  const handleCreateModel = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErrorMessage('');
    setStatusMessage('');
    const res = await fetch('/api/admin/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: modelTitle,
        description: modelDesc,
        credit: modelCredit,
        glbUrl: modelGlbUrl,
      }),
    });
    if (!res.ok) {
      setErrorMessage('Could not add 3D model. Upload a .glb/.gltf file first.');
      return;
    }
    setModelTitle('');
    setModelDesc('');
    setModelGlbUrl('');
    setStatusMessage('3D GLB/glTF model added to NOURISH-Mars Explorer!');
    await onRefresh();
  };

  const deleteModel = async (id: string) => {
    if (!token) return;
    await fetch(`/api/admin/models/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await onRefresh();
  };

  const handleDownloadProjectZip = async () => {
    if (!token || downloadingZip) return;
    setDownloadingZip(true);
    setErrorMessage('');
    setStatusMessage('');
    setZipDownloadUrl(null);
    try {
      const res = await fetch('/api/admin/export-ticket', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setErrorMessage('Could not export project ZIP. Please sign out and sign back in.');
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (!data.url) {
        setErrorMessage('Could not prepare project ZIP link.');
        return;
      }
      setZipDownloadUrl(data.url);
      const a = document.createElement('a');
      a.href = data.url;
      a.download = 'nourish-mars-app.zip';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setStatusMessage('Downloading nourish-mars-app.zip! Extract it, then run npm install && npm run dev.');
    } catch {
      setErrorMessage('Network error while preparing ZIP download.');
    } finally {
      setDownloadingZip(false);
    }
  };

  if (!token) {
    return (
      <section className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-lime-300 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">NOURISH-Mars Administrator Studio</h1>
            <p className="text-sm text-slate-600 mt-1">
              Sign in to upload story videos, custom thumbnails, games, quizzes, and 3D models without editing code.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-passcode" className="block text-sm font-medium text-slate-700 mb-1.5">
                Administrator Password
              </label>
              <input
                id="admin-passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter administrator password"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm"
                required
              />
            </div>

            {loginError && <p className="text-sm text-rose-600 font-medium">{loginError}</p>}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
            >
              {loggingIn ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-orange-700 mb-1">NOURISH-Mars Content Management</p>
          <h1 className="text-3xl font-bold text-slate-900">Administrator Dashboard</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">
          <button
            type="button"
            disabled={downloadingZip}
            onClick={handleDownloadProjectZip}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-lime-300 text-sm font-bold transition-colors"
          >
            <Download className="w-4 h-4" />
            {downloadingZip ? 'Preparing ZIP...' : 'Download Project (.zip)'}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Story Chapters</p>
          <p className="text-2xl font-bold font-mono-tabular text-slate-900 mt-1">{stories.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Games</p>
          <p className="text-2xl font-bold font-mono-tabular text-slate-900 mt-1">{games.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Quizzes</p>
          <p className="text-2xl font-bold font-mono-tabular text-slate-900 mt-1">{quizzes.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">3D Models</p>
          <p className="text-2xl font-bold font-mono-tabular text-slate-900 mt-1">{models.length}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab('stories')}
          className={`min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'stories' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          <Film className="w-4 h-4" />
          Stories &amp; Videos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('games')}
          className={`min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'games' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          Games
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('quizzes')}
          className={`min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'quizzes' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Quizzes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('models')}
          className={`min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'models' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          <Box className="w-4 h-4" />
          3D Models (.glb)
        </button>
      </div>

      {(statusMessage || errorMessage) && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium border flex flex-wrap items-center justify-between gap-3 ${
            errorMessage
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <span>{errorMessage || statusMessage}</span>
          {!errorMessage && zipDownloadUrl && (
            <a
              href={zipDownloadUrl}
              download="nourish-mars-app.zip"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Save nourish-mars-app.zip
            </a>
          )}
        </div>
      )}

      {activeTab === 'stories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form onSubmit={handleCreateStory} className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add &amp; Upload Story Chapter</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chapter Label</label>
                <input
                  type="text"
                  value={chapterLabel}
                  onChange={(e) => setChapterLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age Range</label>
                <input
                  type="text"
                  value={storyAge}
                  onChange={(e) => setStoryAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chapter Title</label>
              <input
                type="text"
                required
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                placeholder="e.g., Designing the Mars Greenhouse"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={storyDesc}
                onChange={(e) => setStoryDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={storyCategory}
                onChange={(e) => setStoryCategory(e.target.value as StoryCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="Dream & Mars">Dream &amp; Mars</option>
                <option value="Space Food">Space Food</option>
                <option value="Systems & Data">Systems &amp; Data</option>
                <option value="Hydroponics">Hydroponics</option>
                <option value="Dust Storm">Dust Storm</option>
              </select>
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-slate-700">Upload Video (.mp4 / .webm)</label>
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-sky-400 cursor-pointer text-xs font-medium text-slate-700 bg-slate-50">
                <Upload className="w-4 h-4" />
                {uploadingAsset ? 'Uploading...' : storyVideoUrl ? 'Video Ready (Replace)' : 'Choose Video File'}
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const url = await uploadFile(f);
                      if (url) setStoryVideoUrl(url);
                    }
                  }}
                />
              </label>
              {storyVideoUrl && (
                <p className="text-xs text-emerald-700 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Attached: {storyVideoUrl}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Upload Thumbnail Image</label>
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-sky-400 cursor-pointer text-xs font-medium text-slate-700 bg-slate-50">
                <Upload className="w-4 h-4" />
                Upload Custom Thumbnail
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const url = await uploadFile(f);
                      if (url) setStoryThumb(url);
                    }
                  }}
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Closed Captions Line</label>
              <input
                type="text"
                value={storyCaption}
                onChange={(e) => setStoryCaption(e.target.value)}
                placeholder="Accessible subtitle text"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Related Game</label>
                <select
                  value={storyGameId}
                  onChange={(e) => setStoryGameId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="">None</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Related Quiz</label>
                <select
                  value={storyQuizId}
                  onChange={(e) => setStoryQuizId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="">None</option>
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>{q.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Publish Chapter
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Manage Story Chapters ({stories.length})</h2>
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={story.thumbnailUrl}
                    alt={story.title}
                    className="w-16 h-12 rounded-lg object-cover shrink-0 bg-slate-100"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{story.title}</p>
                    <p className="text-xs text-slate-500">
                      {story.chapterLabel} · {story.category} · {story.published ? 'Published' : 'Draft'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleStoryPublished(story)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                    title={story.published ? 'Unpublish' : 'Publish'}
                  >
                    {story.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteStory(story.id)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600"
                    title="Delete chapter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'games' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form onSubmit={handleCreateGame} className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Create Educational Game</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Game Title</label>
              <input
                type="text"
                required
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                required
                rows={2}
                value={gameDesc}
                onChange={(e) => setGameDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Game Type</label>
                <select
                  value={gameType}
                  onChange={(e) => setGameType(e.target.value as GameType)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="scenario">Mission Decision</option>
                  <option value="matching">Picture/Word Match</option>
                  <option value="dragdrop">Drag &amp; Drop Sorter</option>
                  <option value="memory">Memory Card Flip</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={gameCategory}
                  onChange={(e) => setGameCategory(e.target.value as StoryCategory)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="Dream & Mars">Dream &amp; Mars</option>
                  <option value="Space Food">Space Food</option>
                  <option value="Systems & Data">Systems &amp; Data</option>
                  <option value="Hydroponics">Hydroponics</option>
                  <option value="Dust Storm">Dust Storm</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Challenge Prompt</label>
              <input
                type="text"
                value={gamePrompt}
                onChange={(e) => setGamePrompt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correct Action / Item</label>
              <input
                type="text"
                value={gameRightChoice}
                onChange={(e) => setGameRightChoice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Incorrect Distractor</label>
              <input
                type="text"
                value={gameWrongChoice}
                onChange={(e) => setGameWrongChoice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Publish Game
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Manage Games ({games.length})</h2>
            {games.map((g) => (
              <div
                key={g.id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{g.title}</p>
                  <p className="text-xs text-slate-500">
                    {g.type} · {g.category} · {g.published ? 'Published' : 'Draft'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleGamePublished(g)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                    title={g.published ? 'Unpublish' : 'Publish'}
                  >
                    {g.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteGame(g.id)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600"
                    title="Delete game"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form onSubmit={handleCreateQuiz} className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Create Quiz &amp; Answers</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quiz Title</label>
              <input
                type="text"
                required
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={quizCategory}
                  onChange={(e) => setQuizCategory(e.target.value as StoryCategory)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="Dream & Mars">Dream &amp; Mars</option>
                  <option value="Space Food">Space Food</option>
                  <option value="Systems & Data">Systems &amp; Data</option>
                  <option value="Hydroponics">Hydroponics</option>
                  <option value="Dust Storm">Dust Storm</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Reward</label>
                <input
                  type="text"
                  value={quizBadge}
                  onChange={(e) => setQuizBadge(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Question Prompt</label>
              <input
                type="text"
                required
                value={quizQuestion}
                onChange={(e) => setQuizQuestion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Answer Choices</label>
              <input
                type="text"
                required
                value={quizOptionA}
                onChange={(e) => setQuizOptionA(e.target.value)}
                placeholder="Option A"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
              <input
                type="text"
                required
                value={quizOptionB}
                onChange={(e) => setQuizOptionB(e.target.value)}
                placeholder="Option B"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
              <input
                type="text"
                value={quizOptionC}
                onChange={(e) => setQuizOptionC(e.target.value)}
                placeholder="Option C (optional)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correct Option</label>
              <select
                value={quizCorrectIdx}
                onChange={(e) => setQuizCorrectIdx(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value={0}>Option A</option>
                <option value={1}>Option B</option>
                <option value={2}>Option C</option>
              </select>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <input
                type="text"
                value={quizCorrectFeedback}
                onChange={(e) => setQuizCorrectFeedback(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
              <input
                type="text"
                value={quizWrongFeedback}
                onChange={(e) => setQuizWrongFeedback(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Publish Quiz
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Manage Quizzes ({quizzes.length})</h2>
            {quizzes.map((q) => (
              <div
                key={q.id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{q.title}</p>
                  <p className="text-xs text-slate-500">
                    {q.category} · {q.questions.length} questions · {q.published ? 'Published' : 'Draft'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleQuizPublished(q)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                    title={q.published ? 'Unpublish' : 'Publish'}
                  >
                    {q.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteQuiz(q.id)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600"
                    title="Delete quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'models' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form onSubmit={handleCreateModel} className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Upload GLB / glTF 3D Model</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Model Title</label>
              <input
                type="text"
                required
                value={modelTitle}
                onChange={(e) => setModelTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Educational Description</label>
              <textarea
                required
                rows={2}
                value={modelDesc}
                onChange={(e) => setModelDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Attribution / Credit</label>
              <input
                type="text"
                value={modelCredit}
                onChange={(e) => setModelCredit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-slate-300 hover:border-sky-400 cursor-pointer text-xs font-medium text-slate-700 bg-slate-50">
              <Upload className="w-4 h-4" />
              {uploadingAsset ? 'Uploading...' : modelGlbUrl ? 'GLB Attached (Replace)' : 'Upload .glb or .gltf File'}
              <input
                type="file"
                accept=".glb,.gltf"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const url = await uploadFile(f);
                    if (url) setModelGlbUrl(url);
                  }
                }}
              />
            </label>
            <button
              type="submit"
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add 3D Model
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Space &amp; 3D Models ({models.length})</h2>
            {models.map((m) => (
              <div
                key={m.id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{m.title}</p>
                  <p className="text-xs text-slate-500 truncate">{m.credit}</p>
                </div>
                {m.type === 'custom_glb' && (
                  <button
                    type="button"
                    onClick={() => deleteModel(m.id)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 shrink-0"
                    title="Delete model"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
