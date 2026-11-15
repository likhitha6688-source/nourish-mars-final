import type { VoiceRoleId } from '../types/education.ts';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicInterval: number | null = null;
let isMusicPlaying = false;
let isMuted = false;
let isMusicDucked = false;
let currentVolume = 0.55;
let stepIndex = 0;
let activeSequenceId = 0;
let pauseTimeoutId: number | null = null;

// Mission-oriented Space Exploration Soundtrack (D minor / F major cinematic mission score)
// 32-step cycle at 215ms (~6.88s heroic phrase): inspiring launch pads, telemetry pulse & noble lead
const MISSION_LEAD: Array<number | null> = [
  293.66, null, 440.0, 392.0, 349.23, null, 329.63, 293.66,
  349.23, null, 392.0, 440.0, 523.25, null, 440.0, null,
  587.33, null, 523.25, 440.0, 392.0, null, 349.23, 392.0,
  440.0, null, 392.0, 329.63, 293.66, null, null, null,
];

const MISSION_ARP: Array<number | null> = [
  293.66, 440.0, 587.33, 440.0, 293.66, 440.0, 587.33, 440.0,
  233.08, 349.23, 466.16, 349.23, 233.08, 349.23, 466.16, 349.23,
  261.63, 392.0, 523.25, 392.0, 261.63, 392.0, 523.25, 392.0,
  220.0, 329.63, 440.0, 329.63, 293.66, 440.0, 587.33, null,
];

// Sweeping cosmic chord roots (D2 -> Bb1 -> C2 -> A1)
const PAD_ROOTS = [146.83, 116.54, 130.81, 110.0];

type MusicListener = (state: { playing: boolean; muted: boolean; volume: number }) => void;
const listeners = new Set<MusicListener>();

function notifyListeners() {
  const snapshot = { playing: isMusicPlaying, muted: isMuted, volume: currentVolume };
  listeners.forEach((fn) => fn(snapshot));
}

export function subscribeAudioState(fn: MusicListener): () => void {
  listeners.add(fn);
  fn({ playing: isMusicPlaying, muted: isMuted, volume: currentVolume });
  return () => listeners.delete(fn);
}

function ensureAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
    masterGain = audioCtx.createGain();
    musicGain = audioCtx.createGain();
    masterGain.gain.value = isMuted ? 0 : currentVolume;
    musicGain.gain.value = isMusicDucked ? 0.1 : 0.34;
    musicGain.connect(masterGain);
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function duckBackgroundMusic(ducked: boolean): void {
  isMusicDucked = ducked;
  if (musicGain && audioCtx) {
    musicGain.gain.setTargetAtTime(ducked ? 0.09 : 0.34, audioCtx.currentTime, 0.12);
  }
}

export function setAudioVolume(val: number): void {
  currentVolume = Math.max(0, Math.min(1, val));
  if (masterGain && audioCtx) {
    masterGain.gain.setTargetAtTime(isMuted ? 0 : currentVolume, audioCtx.currentTime, 0.04);
  }
  notifyListeners();
}

export function toggleAudioMute(): boolean {
  isMuted = !isMuted;
  if (masterGain && audioCtx) {
    masterGain.gain.setTargetAtTime(isMuted ? 0 : currentVolume, audioCtx.currentTime, 0.04);
  }
  notifyListeners();
  return isMuted;
}

function playMusicStep() {
  if (!isMusicPlaying || !audioCtx || !musicGain) return;
  const now = audioCtx.currentTime;
  const idx = stepIndex % MISSION_LEAD.length;

  // 1. Telemetry mission pulse arpeggio (low-pass filtered triangle)
  const arpFreq = MISSION_ARP[idx];
  if (arpFreq) {
    const arpOsc = audioCtx.createOscillator();
    const arpFilter = audioCtx.createBiquadFilter();
    const arpGain = audioCtx.createGain();
    arpOsc.type = 'triangle';
    arpOsc.frequency.setValueAtTime(arpFreq, now);
    arpFilter.type = 'lowpass';
    arpFilter.frequency.setValueAtTime(1400, now);
    arpGain.gain.setValueAtTime(0.001, now);
    arpGain.gain.exponentialRampToValueAtTime(0.055, now + 0.02);
    arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    arpOsc.connect(arpFilter);
    arpFilter.connect(arpGain);
    arpGain.connect(musicGain);
    arpOsc.start(now);
    arpOsc.stop(now + 0.21);
  }

  // 2. Heroic brass-like mission melody
  const leadFreq = MISSION_LEAD[idx];
  if (leadFreq) {
    const leadOsc = audioCtx.createOscillator();
    const leadFilter = audioCtx.createBiquadFilter();
    const leadGain = audioCtx.createGain();
    leadOsc.type = 'sawtooth';
    leadOsc.frequency.setValueAtTime(leadFreq, now);
    leadFilter.type = 'lowpass';
    leadFilter.frequency.setValueAtTime(1150, now);
    leadGain.gain.setValueAtTime(0.001, now);
    leadGain.gain.linearRampToValueAtTime(0.08, now + 0.045);
    leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    leadOsc.connect(leadFilter);
    leadFilter.connect(leadGain);
    leadGain.connect(musicGain);
    leadOsc.start(now);
    leadOsc.stop(now + 0.44);
  }

  // 3. Soft mission percussion / bass pulse on strong beats (every 4 steps)
  if (idx % 4 === 0) {
    const kickOsc = audioCtx.createOscillator();
    const kickGain = audioCtx.createGain();
    kickOsc.type = 'sine';
    kickOsc.frequency.setValueAtTime(82, now);
    kickOsc.frequency.exponentialRampToValueAtTime(42, now + 0.14);
    kickGain.gain.setValueAtTime(0.11, now);
    kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    kickOsc.connect(kickGain);
    kickGain.connect(musicGain);
    kickOsc.start(now);
    kickOsc.stop(now + 0.18);
  }

  // 4. Sweeping cosmic fifth pad every bar (8 steps)
  if (idx % 8 === 0) {
    const padFreq = PAD_ROOTS[Math.floor(idx / 8) % PAD_ROOTS.length];
    [padFreq, padFreq * 1.5].forEach((freq, i) => {
      const padOsc = audioCtx!.createOscillator();
      const padFilter = audioCtx!.createBiquadFilter();
      const padGain = audioCtx!.createGain();
      padOsc.type = i === 0 ? 'sawtooth' : 'triangle';
      padOsc.frequency.setValueAtTime(freq, now);
      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(620, now);
      padGain.gain.setValueAtTime(0.001, now);
      padGain.gain.linearRampToValueAtTime(i === 0 ? 0.075 : 0.06, now + 0.25);
      padGain.gain.exponentialRampToValueAtTime(0.001, now + 1.65);
      padOsc.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(musicGain!);
      padOsc.start(now);
      padOsc.stop(now + 1.7);
    });
  }

  stepIndex += 1;
}

export function startBackgroundMusic(): void {
  const ctx = ensureAudioContext();
  if (!ctx || isMusicPlaying) return;
  isMusicPlaying = true;
  playMusicStep();
  musicInterval = window.setInterval(playMusicStep, 215);
  notifyListeners();
}

export function stopBackgroundMusic(): void {
  isMusicPlaying = false;
  if (musicInterval !== null) {
    window.clearInterval(musicInterval);
    musicInterval = null;
  }
  notifyListeners();
}

export function toggleBackgroundMusic(): boolean {
  if (isMusicPlaying) {
    stopBackgroundMusic();
    return false;
  }
  startBackgroundMusic();
  return true;
}

export function playChime(type: 'success' | 'gentle' | 'star' | 'pop' | 'button' | 'achievement' | 'alert'): void {
  if (isMuted) return;
  try {
    const ctx = ensureAudioContext();
    if (!ctx || !masterGain) return;
    const now = ctx.currentTime;

    const notes =
      type === 'achievement'
        ? [523.25, 659.25, 783.99, 1046.5]
        : type === 'success'
        ? [523.25, 659.25, 783.99]
        : type === 'star'
        ? [587.33, 783.99, 1046.5]
        : type === 'pop'
        ? [440, 587.33]
        : type === 'button'
        ? [520]
        : type === 'alert'
        ? [493.88, 440] // Restrained calm habitat alert (never harsh siren)
        : [392, 329.63];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type === 'gentle' || type === 'alert' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.085);
      gain.gain.setValueAtTime(0.001, now + idx * 0.085);
      gain.gain.exponentialRampToValueAtTime(type === 'button' ? 0.06 : 0.13, now + idx * 0.085 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.085 + 0.24);
      osc.connect(gain);
      gain.connect(masterGain!);
      osc.start(now + idx * 0.085);
      osc.stop(now + idx * 0.085 + 0.26);
    });
  } catch {
    // Ignore audio errors
  }
}

const VOICE_PROFILE: Record<VoiceRoleId, { pitch: number; rate: number }> = {
  narrator: { pitch: 0.96, rate: 0.9 },
  'maya-child': { pitch: 1.24, rate: 0.98 },
  'maya-adult': { pitch: 1.08, rate: 0.93 },
  'sathya-child': { pitch: 1.15, rate: 1.0 },
  'sathya-adult': { pitch: 0.9, rate: 0.94 },
  elena: { pitch: 1.02, rate: 0.9 },
  reyes: { pitch: 0.95, rate: 0.94 },
  grandmother: { pitch: 0.98, rate: 0.87 },
  mother: { pitch: 1.06, rate: 0.95 },
  father: { pitch: 0.88, rate: 0.94 },
};

let activeWordTimerId: number | null = null;

export interface WordToken {
  word: string;
  start: number;
  end: number;
}

export function tokenizeWords(text: string): WordToken[] {
  const tokens: WordToken[] = [];
  const regex = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    tokens.push({
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return tokens;
}

export interface SpeechSegment {
  role: VoiceRoleId;
  text: string;
}

/**
 * Plays spoken dialogue and narration sequentially (never overlapping)
 * with brief natural pauses, gentle background music ducking, and word-level progress callbacks.
 */
export function speakSceneSequence(
  segments: SpeechSegment[],
  enabled: boolean,
  onSegmentChange?: (index: number | null) => void,
  onWordChange?: (segmentIndex: number, wordIndex: number) => void
): void {
  stopNarration();
  if (!enabled || isMuted || segments.length === 0 || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const seqId = ++activeSequenceId;
  duckBackgroundMusic(true);

  const clearWordTimer = () => {
    if (activeWordTimerId !== null) {
      window.clearInterval(activeWordTimerId);
      activeWordTimerId = null;
    }
  };

  const speakNext = (idx: number) => {
    clearWordTimer();
    if (seqId !== activeSequenceId || isMuted) {
      duckBackgroundMusic(false);
      onSegmentChange?.(null);
      return;
    }
    if (idx >= segments.length) {
      duckBackgroundMusic(false);
      onSegmentChange?.(null);
      return;
    }

    const seg = segments[idx];
    const profile = VOICE_PROFILE[seg.role] || VOICE_PROFILE.narrator;
    const tokens = tokenizeWords(seg.text);
    onSegmentChange?.(idx);
    if (tokens.length > 0) {
      onWordChange?.(idx, 0);
    }

    try {
      const utterance = new SpeechSynthesisUtterance(seg.text);
      utterance.pitch = profile.pitch;
      utterance.rate = profile.rate;
      utterance.volume = Math.min(1, currentVolume + 0.15);

      let boundaryTriggered = false;
      let fallbackWordIdx = 0;

      // Browser native word boundary tracking
      utterance.onboundary = (ev) => {
        if (seqId !== activeSequenceId || ev.name !== 'word') return;
        boundaryTriggered = true;
        const charIdx = ev.charIndex;
        let found = 0;
        for (let i = 0; i < tokens.length; i++) {
          if (tokens[i].start <= charIdx) found = i;
          else break;
        }
        fallbackWordIdx = found;
        onWordChange?.(idx, found);
      };

      // Smooth fallback cadence when OS voice lacks onboundary events
      if (tokens.length > 1) {
        const msPerWord = Math.round(375 / Math.max(profile.rate, 0.7));
        activeWordTimerId = window.setInterval(() => {
          if (seqId !== activeSequenceId || boundaryTriggered) return;
          if (fallbackWordIdx < tokens.length - 1) {
            fallbackWordIdx += 1;
            onWordChange?.(idx, fallbackWordIdx);
          }
        }, msPerWord);
      }

      utterance.onend = () => {
        clearWordTimer();
        if (seqId !== activeSequenceId) return;
        if (tokens.length > 0) {
          onWordChange?.(idx, tokens.length - 1);
        }
        pauseTimeoutId = window.setTimeout(() => speakNext(idx + 1), 360);
      };
      utterance.onerror = () => {
        clearWordTimer();
        if (seqId !== activeSequenceId) return;
        pauseTimeoutId = window.setTimeout(() => speakNext(idx + 1), 200);
      };
      window.speechSynthesis.speak(utterance);
    } catch {
      clearWordTimer();
      duckBackgroundMusic(false);
      onSegmentChange?.(null);
    }
  };

  speakNext(0);
}

export function speakNarration(text: string, enabled: boolean): void {
  speakSceneSequence([{ role: 'narrator', text }], enabled);
}

export function stopNarration(): void {
  activeSequenceId += 1;
  if (pauseTimeoutId !== null) {
    window.clearTimeout(pauseTimeoutId);
    pauseTimeoutId = null;
  }
  if (activeWordTimerId !== null) {
    window.clearInterval(activeWordTimerId);
    activeWordTimerId = null;
  }
  duckBackgroundMusic(false);
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore
  }
}
