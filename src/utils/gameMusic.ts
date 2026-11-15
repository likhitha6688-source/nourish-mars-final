import { useCallback, useEffect, useState } from 'react';
import { stopBackgroundMusic } from './soundEffects.ts';

export type GameMusicTrack = 'bomberman' | 'playful' | 'mario';

interface TrackDefinition {
  tempoMs: number;
  leadWave: OscillatorType;
  bassWave: OscillatorType;
  leadGain: number;
  bassGain: number;
  melody: Array<number | null>;
  bass: Array<number | null>;
}

// Original Web Audio API synthesized arcade themes inspired by classic game styles
const TRACKS: Record<GameMusicTrack, TrackDefinition> = {
  // Energetic retro maze-action theme (Games 1, 3, 4)
  bomberman: {
    tempoMs: 150,
    leadWave: 'square',
    bassWave: 'triangle',
    leadGain: 0.045,
    bassGain: 0.07,
    melody: [
      523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 587.33,
      523.25, 587.33, 659.25, 783.99, 659.25, null, 587.33, null,
      659.25, 783.99, 880.0, 783.99, 987.77, 880.0, 783.99, 659.25,
      587.33, 659.25, 783.99, 587.33, 523.25, null, 523.25, null,
    ],
    bass: [
      130.81, 261.63, 130.81, 261.63, 146.83, 293.66, 146.83, 293.66,
      164.81, 329.63, 146.83, 293.66, 130.81, 196.0, 130.81, null,
      164.81, 329.63, 164.81, 329.63, 174.61, 349.23, 174.61, 349.23,
      196.0, 392.0, 196.0, 293.66, 130.81, 196.0, 130.81, null,
    ],
  },
  // Cheerful bouncy puzzle groove (Games 2, 5, 6, 7, 8)
  playful: {
    tempoMs: 210,
    leadWave: 'triangle',
    bassWave: 'sine',
    leadGain: 0.075,
    bassGain: 0.065,
    melody: [
      523.25, 659.25, 587.33, 783.99, 659.25, null, 523.25, 587.33,
      659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25, null,
      587.33, 698.46, 659.25, 880.0, 783.99, null, 659.25, 587.33,
      523.25, 659.25, 783.99, 659.25, 523.25, null, null, null,
    ],
    bass: [
      261.63, null, 196.0, null, 220.0, null, 196.0, null,
      261.63, null, 196.0, null, 293.66, null, 196.0, null,
      174.61, null, 196.0, null, 261.63, null, 220.0, null,
      196.0, null, 246.94, null, 261.63, null, 196.0, null,
    ],
  },
  // Heroic side-scrolling platformer march (Game 9)
  mario: {
    tempoMs: 145,
    leadWave: 'square',
    bassWave: 'triangle',
    leadGain: 0.048,
    bassGain: 0.075,
    melody: [
      659.25, 659.25, null, 659.25, null, 523.25, 659.25, null,
      783.99, null, null, null, 392.0, null, null, null,
      523.25, null, null, 392.0, null, null, 329.63, null,
      null, 440.0, null, 493.88, null, 466.16, 440.0, null,
      392.0, 659.25, 783.99, 880.0, null, 698.46, 783.99, null,
      659.25, null, 523.25, 587.33, 493.88, null, null, null,
    ],
    bass: [
      164.81, 164.81, null, 164.81, null, 130.81, 164.81, null,
      196.0, null, null, null, 98.0, null, null, null,
      130.81, null, null, 196.0, null, null, 164.81, null,
      null, 220.0, null, 246.94, null, 233.08, 220.0, null,
      196.0, 261.63, 329.63, 349.23, null, 293.66, 329.63, null,
      261.63, null, 196.0, 246.94, 196.0, null, null, null,
    ],
  },
};

export function useGameMusic(track: GameMusicTrack) {
  const [musicOn, setMusicOn] = useState(false);

  const startMusic = useCallback(() => {
    stopBackgroundMusic();
    setMusicOn(true);
  }, []);

  const stopMusic = useCallback(() => {
    setMusicOn(false);
  }, []);

  const toggleMusic = useCallback(() => {
    setMusicOn((prev) => {
      if (!prev) stopBackgroundMusic();
      return !prev;
    });
  }, []);

  useEffect(() => {
    if (!musicOn) return;
    const def = TRACKS[track];
    let step = 0;
    let ctx: AudioContext | null = null;
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) ctx = new Ctor();
    } catch {
      ctx = null;
    }

    const playStep = () => {
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const leadFreq = def.melody[step % def.melody.length];
      const bassFreq = def.bass[step % def.bass.length];
      const dur = Math.max(0.08, (def.tempoMs / 1000) * 0.86);

      if (leadFreq) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = def.leadWave;
        osc.frequency.setValueAtTime(leadFreq, now);
        g.gain.setValueAtTime(0.001, now);
        g.gain.exponentialRampToValueAtTime(def.leadGain, now + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, now + dur);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + dur + 0.02);
      }

      if (bassFreq) {
        const bOsc = ctx.createOscillator();
        const bGain = ctx.createGain();
        bOsc.type = def.bassWave;
        bOsc.frequency.setValueAtTime(bassFreq, now);
        bGain.gain.setValueAtTime(0.001, now);
        bGain.gain.exponentialRampToValueAtTime(def.bassGain, now + 0.015);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        bOsc.connect(bGain);
        bGain.connect(ctx.destination);
        bOsc.start(now);
        bOsc.stop(now + dur + 0.02);
      }

      step += 1;
    };

    playStep();
    const id = window.setInterval(playStep, def.tempoMs);

    return () => {
      window.clearInterval(id);
      ctx?.close().catch(() => {});
    };
  }, [musicOn, track]);

  return { musicOn, startMusic, stopMusic, toggleMusic };
}
