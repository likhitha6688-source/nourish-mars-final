import { useState } from 'react';
import { Award, ExternalLink, Lock, ShieldCheck, Star } from 'lucide-react';
import type { ChildProgress, ParentalSettings } from '../../types/education.ts';
import { playChime } from '../../utils/soundEffects.ts';

interface ParentTeacherViewProps {
  settings: ParentalSettings;
  progress: ChildProgress;
  onSaveSettings: (next: ParentalSettings) => Promise<void>;
  onResetProgress: () => Promise<void>;
  onOpenAdmin: () => void;
}

export function ParentTeacherView({
  settings,
  progress,
  onSaveSettings,
  onResetProgress,
  onOpenAdmin,
}: ParentTeacherViewProps) {
  const [localSettings, setLocalSettings] = useState<ParentalSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = async () => {
    playChime('button');
    setSaving(true);
    setSavedMsg('');
    await onSaveSettings(localSettings);
    setSaving(false);
    playChime('success');
    setSavedMsg('Parental preferences saved.');
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
      {/* About NOURISH-Mars & Story Characters */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-5 bg-slate-950 grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1.5">
          <div className="sm:col-span-2 aspect-[16/9] overflow-hidden rounded-t-xl bg-slate-900">
            <img
              src="/assets/nourish/scenes/scene_01.jpg"
              alt="Maya: The Girl Who Grows a Dream — young Maya and astronaut Maya in the Mars greenhouse"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-[16/10] overflow-hidden rounded-bl-xl bg-slate-900">
            <img
              src="/assets/nourish/scenes/scene_02.jpg"
              alt="Sathya and Maya designing and building Mars rovers"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-[16/10] overflow-hidden rounded-br-xl bg-slate-900">
            <img
              src="/assets/nourish/scenes/scene_09.jpg"
              alt="Maya checking irrigation and hydroponic greens inside the Mars greenhouse"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-4">
          <p className="text-sm font-semibold text-orange-700">About NOURISH-Mars: The Last Harvest</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Courage, Science &amp; Nourishing Life Beyond Earth
          </h1>
          <p className="text-slate-600 leading-relaxed">
            Built around the original story of Maya and Sathya, <strong>NOURISH-Mars</strong> introduces young learners to space nutrition, freeze-drying sublimation, hydroponic greenhouses, systems thinking, data verification, and resilience during Martian dust storms—with zero ads or tracking.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500">Stars Earned</p>
              <p className="text-xl font-bold font-mono-tabular text-slate-900 inline-flex items-center gap-1.5 mt-0.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                {progress.stars}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500">Chapters</p>
              <p className="text-xl font-bold font-mono-tabular text-slate-900 mt-0.5">
                {progress.completedStoryIds.length}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500">Games</p>
              <p className="text-xl font-bold font-mono-tabular text-slate-900 mt-0.5">
                {progress.completedGameIds.length}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500">Badges</p>
              <p className="text-xl font-bold font-mono-tabular text-slate-900 inline-flex items-center gap-1.5 mt-0.5">
                <Award className="w-4 h-4 text-sky-600" />
                {progress.badges.length}
              </p>
            </div>
          </div>

          {progress.badges.length > 0 && (
            <p className="text-xs text-slate-600 pt-1">
              Unlocked Badges: <span className="font-semibold text-slate-900">{progress.badges.join(' · ')}</span>
            </p>
          )}
        </div>
      </div>

      {/* Crisp High-Resolution Story & Science Gallery for Parents & Teachers */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Inside the NOURISH-Mars Visual Curriculum
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Every chapter pairs illustrated storytelling with real NASA Earth, Sun, Orbiter, and Space Food science diagrams.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              src: '/assets/nourish/scenes/scene_05.png',
              title: 'Childhood Stargazing & Sketchbook',
              desc: 'Inspiring curiosity at home with parents and friends.',
            },
            {
              src: '/assets/nourish/scenes/scene_03.jpg',
              title: 'Dr. Elena Brooks · Plant Telemetry',
              desc: 'Checking biological and systems health in the habitat.',
            },
            {
              src: '/assets/nourish/scenes/scene_08.png',
              title: 'NASA Space Food Nutrition',
              desc: 'Freeze-dried strawberries, hydration & balanced space meals.',
            },
            {
              src: '/assets/nourish/scenes/scene_10.jpg',
              title: 'Interplanetary Data Link',
              desc: 'Mars Reconnaissance Orbiter & 70m Deep Space Network dishes.',
            },
          ].map((card) => (
            <div
              key={card.src}
              className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col"
            >
              <div className="aspect-[16/10] bg-slate-950 overflow-hidden">
                <img
                  src={card.src}
                  alt={card.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-slate-900">{card.title}</p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls + Admin Studio + NASA Science References */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Child Privacy &amp; Parental Controls</h2>
          </div>
          <p className="text-sm text-slate-600">
            Zero personal child data or third-party trackers are collected. Customize accessibility captions, read-aloud narration, and daily learning reminders below.
          </p>

          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-200 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-900">Default Subtitles (Captions On)</p>
                <p className="text-xs text-slate-500">Automatically display closed captions during story playback</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.defaultCaptionsOn}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, defaultCaptionsOn: e.target.checked })
                }
                className="w-5 h-5 accent-sky-600"
              />
            </label>

            <label className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-200 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-900">Read-Aloud Narration Voice</p>
                <p className="text-xs text-slate-500">Speak story chapters aloud for young readers</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.readAloudEnabled}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, readAloudEnabled: e.target.checked })
                }
                className="w-5 h-5 accent-sky-600"
              />
            </label>

            <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-900">Daily Learning Reminder</span>
                <span className="font-mono-tabular font-semibold text-sky-700">
                  {localSettings.dailyLimitMinutes} mins
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={90}
                step={15}
                value={localSettings.dailyLimitMinutes}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, dailyLimitMinutes: Number(e.target.value) })
                }
                className="w-full accent-sky-600"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
            <button
              type="button"
              onClick={() => {
                playChime('button');
                onResetProgress();
              }}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors"
            >
              Reset Child Progress
            </button>
          </div>
          {savedMsg && <p className="text-xs font-medium text-emerald-700">{savedMsg}</p>}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-lime-300" />
              <h2 className="text-xl font-bold">NOURISH-Mars Administrator Studio</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Upload new story videos (.mp4 / .webm), custom thumbnails, interactive games, quizzes, and .glb/.gltf 3D models without editing code.
            </p>
            <button
              type="button"
              onClick={() => {
                playChime('button');
                onOpenAdmin();
              }}
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-300 hover:bg-lime-400 text-slate-950 text-sm font-bold transition-colors"
            >
              Open Administrator Dashboard
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <h3 className="text-base font-bold text-slate-900">NASA Science &amp; Story References</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inspired by real Mars exploration missions featured in Maya and Sathya’s story:
            </p>
            <ul className="space-y-2 text-xs font-medium text-sky-700">
              <li>
                <a
                  href="https://science.nasa.gov/3d-resources/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  NASA 3D Resources (Jezero Crater, Rovers &amp; Spacecraft)
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://ccmc.gsfc.nasa.gov/tools/DONKI/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  NASA Space Weather Database (DONKI)
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://osdr.nasa.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  NASA Open Science Data Repository (OSDR)
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
