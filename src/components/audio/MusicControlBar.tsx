import { useEffect, useState } from 'react';
import { Music, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import {
  playChime,
  setAudioVolume,
  subscribeAudioState,
  toggleAudioMute,
  toggleBackgroundMusic,
} from '../../utils/soundEffects.ts';

export function MusicControlBar() {
  const [audioState, setAudioState] = useState({ playing: false, muted: false, volume: 0.55 });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    return subscribeAudioState(setAudioState);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
      {expanded && (
        <div className="bg-slate-900 text-white border border-white/15 rounded-xl px-3.5 py-2 shadow-lg flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              toggleAudioMute();
            }}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label={audioState.muted ? 'Unmute audio' : 'Mute audio'}
          >
            {audioState.muted ? (
              <VolumeX className="w-4 h-4 text-amber-300" />
            ) : (
              <Volume2 className="w-4 h-4 text-lime-300" />
            )}
          </button>

          <label className="flex items-center gap-2 text-xs text-slate-300">
            <span className="sr-only">Music and effects volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audioState.muted ? 0 : audioState.volume}
              onChange={(e) => setAudioVolume(Number(e.target.value))}
              className="w-20 accent-lime-300 cursor-pointer"
            />
          </label>
        </div>
      )}

      <div className="bg-slate-900 text-white border border-white/15 rounded-xl p-1.5 shadow-lg flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            const started = toggleBackgroundMusic();
            if (started) playChime('pop');
          }}
          className="min-h-[38px] inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-lime-300 hover:bg-lime-200 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap"
          title="Play or pause mission-oriented space exploration music"
        >
          {audioState.playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{audioState.playing ? 'Mission Music On' : 'Mission Music'}</span>
        </button>

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-200 transition-colors"
          aria-label="Volume and mute settings"
          title="Volume & Mute"
        >
          {audioState.muted ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Music className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
