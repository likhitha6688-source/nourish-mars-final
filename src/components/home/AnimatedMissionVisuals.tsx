import { useEffect, useState } from 'react';
import { Maximize2, Pause, Play, Radio, Sun, Globe2, Satellite, X } from 'lucide-react';
import { playChime } from '../../utils/soundEffects.ts';

export interface ShowcasePicture {
  src: string;
  title: string;
  caption: string;
}

interface AnimatedMissionVisualsProps {
  onZoomImage: (item: ShowcasePicture) => void;
}

export function AnimatedMissionVisuals({ onZoomImage }: AnimatedMissionVisualsProps) {
  const [motionOn, setMotionOn] = useState(true);
  const [satView, setSatView] = useState<'orbiter' | 'datalink'>('orbiter');

  const satPicture: ShowcasePicture =
    satView === 'orbiter'
      ? {
          src: '/assets/nourish/scenes/scene_07.jpg',
          title: 'Mars Reconnaissance Orbiter (MRO)',
          caption: 'Relaying science data across Mars orbit with high-gain Dish & Solar Arrays.',
        }
      : {
          src: '/assets/nourish/scenes/scene_10.jpg',
          title: 'Interplanetary Data Link — MRO & DSN',
          caption: 'NASA’s Mars communicators connecting Mars orbiters to 70-meter Earth ground antennas.',
        };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-sky-700 mb-1">
            Living Cosmic Showcase · Sun, Earth &amp; Satellite
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
            Watch the Sun, Earth &amp; Mars Orbiter in Motion
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1.5">
            Explore crisp NASA-inspired mission visuals with live solar flare shimmer, Earth atmosphere drift, and orbital telemetry waves. Tap any frame to inspect full-size!
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            playChime('button');
            setMotionOn((m) => !m);
          }}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors self-start whitespace-nowrap"
        >
          {motionOn ? <Pause className="w-4 h-4 text-orange-600" /> : <Play className="w-4 h-4 text-emerald-600" />}
          {motionOn ? 'Pause Animations' : 'Play Animations'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. ANIMATED SUN */}
        <article className="bg-slate-900 text-white rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden group">
            <img
              src="/assets/nourish/scenes/scene_11.jpg"
              alt="The Sun: Energy and Risk diagram showing solar flare, coronal mass ejection, and sunlight powering Mars solar arrays"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-500 ${
                motionOn ? 'animate-solar-glow' : ''
              }`}
            />
            {/* Animated Solar Corona & Sunbeam Shimmer */}
            {motionOn && (
              <>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-8 top-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-amber-400/25 blur-xl animate-solar-glow"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/4 top-[38%] w-2/3 h-6 bg-gradient-to-r from-amber-300/45 via-yellow-200/25 to-transparent blur-sm -rotate-6 animate-sunbeam-drift"
                />
              </>
            )}
            <button
              type="button"
              onClick={() => {
                playChime('pop');
                onZoomImage({
                  src: '/assets/nourish/scenes/scene_11.jpg',
                  title: 'The Sun: Energy & Risk',
                  caption:
                    'Sunlight powers Mars solar arrays, while solar flares and CMEs require space-weather monitoring (DONKI).',
                });
              }}
              className="absolute top-3 right-3 min-h-[36px] min-w-[36px] inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/85 hover:bg-slate-900 text-white text-xs font-semibold border border-white/15"
              aria-label="Inspect full Sun Energy and Risk diagram"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
              Zoom
            </button>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-amber-300 inline-flex items-center gap-1.5 mb-1">
                <Sun className="w-3.5 h-3.5" />
                Solar Energy &amp; Space Weather
              </p>
              <h3 className="text-xl font-bold text-white mb-1.5">The Sun: Energy &amp; Risk</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Sunlight powers solar arrays on satellites and habitats—while solar flares and coronal mass ejections remind crews to watch space-weather alerts.
              </p>
            </div>
          </div>
        </article>

        {/* 2. ANIMATED EARTH */}
        <article className="bg-slate-900 text-white rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden group">
            <img
              src="/assets/nourish/scenes/scene_06.jpg"
              alt="Earth orbital cloud horizon arching above family kitchen, laboratory, and sunny backyard"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-700 ${
                motionOn ? 'animate-earth-drift' : ''
              }`}
            />
            {motionOn && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-sky-400/20 via-cyan-300/10 to-transparent animate-solar-glow"
              />
            )}
            <button
              type="button"
              onClick={() => {
                playChime('pop');
                onZoomImage({
                  src: '/assets/nourish/scenes/scene_06.jpg',
                  title: 'Planet Earth: Home & Inspiration',
                  caption:
                    'From Earth’s kitchens and science labs to orbital blue skies, curiosity connects family dinners to Mars.',
                });
              }}
              className="absolute top-3 right-3 min-h-[36px] min-w-[36px] inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/85 hover:bg-slate-900 text-white text-xs font-semibold border border-white/15"
              aria-label="Inspect full Earth Horizon scene"
            >
              <Maximize2 className="w-3.5 h-3.5 text-sky-300" />
              Zoom
            </button>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-sky-300 inline-flex items-center gap-1.5 mb-1">
                <Globe2 className="w-3.5 h-3.5" />
                Home Planet Horizon
              </p>
              <h3 className="text-xl font-bold text-white mb-1.5">Earth: Kitchens, Labs &amp; Sky</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Drifting cloud swirls above Earth remind Maya and Sathya where their questions started—over warm family meals and science benches.
              </p>
            </div>
          </div>
        </article>

        {/* 3. ANIMATED SATELLITE & DATA LINK */}
        <article className="bg-slate-900 text-white rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden group">
            <img
              src={satPicture.src}
              alt={satPicture.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-500 ${
                motionOn ? 'animate-satellite-orbit' : ''
              }`}
            />
            {/* Animated Radio Telemetry Waves radiating from orbiter */}
            {motionOn && satView === 'orbiter' && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-[28%] right-[24%] w-16 h-16 flex items-center justify-center"
              >
                <span className="absolute inset-0 rounded-full border-2 border-cyan-300/60 animate-radio-wave" />
                <span
                  className="absolute inset-0 rounded-full border-2 border-lime-300/50 animate-radio-wave"
                  style={{ animationDelay: '0.8s' }}
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                playChime('pop');
                onZoomImage(satPicture);
              }}
              className="absolute top-3 right-3 min-h-[36px] min-w-[36px] inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/85 hover:bg-slate-900 text-white text-xs font-semibold border border-white/15"
              aria-label="Inspect full Satellite visual"
            >
              <Maximize2 className="w-3.5 h-3.5 text-lime-300" />
              Zoom
            </button>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-lime-300 inline-flex items-center gap-1.5 mb-1">
                <Satellite className="w-3.5 h-3.5" />
                Orbital Relay &amp; Deep Space Network
              </p>
              <h3 className="text-xl font-bold text-white mb-1.5">{satPicture.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{satPicture.caption}</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  playChime('button');
                  setSatView('orbiter');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  satView === 'orbiter'
                    ? 'bg-lime-300 text-slate-950'
                    : 'bg-white/10 text-slate-200 hover:bg-white/15'
                }`}
              >
                Orbiter Flight
              </button>
              <button
                type="button"
                onClick={() => {
                  playChime('button');
                  setSatView('datalink');
                }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  satView === 'datalink'
                    ? 'bg-lime-300 text-slate-950'
                    : 'bg-white/10 text-slate-200 hover:bg-white/15'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                Data Link Diagram
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

interface ImageLightboxProps {
  item: ShowcasePicture | null;
  onClose: () => void;
}

export function ImageLightbox({ item, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
    >
      <div
        className="max-w-4xl w-full bg-slate-900 border border-white/15 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-white/10">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">{item.title}</h3>
            <p className="text-xs text-slate-300">{item.caption}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            aria-label="Close image preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-slate-950 p-2 sm:p-4 flex items-center justify-center max-h-[80vh]">
          <img
            src={item.src}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="max-h-[72vh] w-auto object-contain rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
