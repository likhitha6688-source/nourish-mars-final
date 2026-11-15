import type { CharacterRefId } from '../../types/education.ts';

interface CharacterVisualSpec {
  id: CharacterRefId;
  label: string;
  roleTitle: string;
  skin: string;
  hair: string;
  topColor: string;
  accentColor: string;
  hasBun?: boolean;
  hasLongHair?: boolean;
  hasGlasses?: boolean;
  hasLeafPatch?: boolean;
  hasGearPatch?: boolean;
  hasOveralls?: boolean;
  hasNotebook?: boolean;
}

export const CHARACTER_SPECS: Record<CharacterRefId, CharacterVisualSpec> = {
  'MAYA-CHILD': {
    id: 'MAYA-CHILD',
    label: 'Maya',
    roleTitle: 'Age 9 · Curious Explorer',
    skin: '#8D5524',
    hair: '#1C1917',
    topColor: '#FACC15', // Yellow shirt
    accentColor: '#2563EB', // Blue overalls
    hasBun: true,
    hasOveralls: true,
    hasNotebook: true,
  },
  'MAYA-ADULT': {
    id: 'MAYA-ADULT',
    label: 'Maya',
    roleTitle: 'Mars Plant Scientist',
    skin: '#8D5524',
    hair: '#1C1917',
    topColor: '#0F766E', // Teal habitat uniform
    accentColor: '#4ADE80', // Green leaf patch
    hasBun: true,
    hasLeafPatch: true,
  },
  'SATHYA-CHILD': {
    id: 'SATHYA-CHILD',
    label: 'Sathya',
    roleTitle: 'Age 9 · Rocket Builder',
    skin: '#8D5524',
    hair: '#1C1917',
    topColor: '#2563EB', // Blue shirt
    accentColor: '#D6B88D', // Tan shorts
  },
  'SATHYA-ADULT': {
    id: 'SATHYA-ADULT',
    label: 'Sathya',
    roleTitle: 'Mars Systems Engineer',
    skin: '#8D5524',
    hair: '#1C1917',
    topColor: '#1E3A8A', // Navy habitat uniform
    accentColor: '#F97316', // Orange gear patch
    hasGearPatch: true,
  },
  ELENA: {
    id: 'ELENA',
    label: 'Dr. Elena',
    roleTitle: 'Mission Scientist',
    skin: '#E0AC8B',
    hair: '#6B4F3B', // Brown hair with grey streaks
    topColor: '#94A3B8', // Light-grey science uniform
    accentColor: '#CBD5E1',
    hasGlasses: true,
  },
  REYES: {
    id: 'REYES',
    label: 'Cmdr. Reyes',
    roleTitle: 'Mission Commander',
    skin: '#C6865C',
    hair: '#1F2937',
    topColor: '#881337', // Burgundy command uniform
    accentColor: '#FDE047',
    hasBun: true,
  },
  GRANDMOTHER: {
    id: 'GRANDMOTHER',
    label: 'Grandmother',
    roleTitle: 'Backyard Storyteller',
    skin: '#8D5524',
    hair: '#D1D5DB', // Silver hair tied back
    topColor: '#A78BFA', // Comfortable lavender clothing
    accentColor: '#EDE9FE',
    hasBun: true,
  },
  MOTHER: {
    id: 'MOTHER',
    label: 'Mother',
    roleTitle: 'On Earth',
    skin: '#8D5524',
    hair: '#1C1917',
    topColor: '#0284C7',
    accentColor: '#E0F2FE',
    hasLongHair: true,
  },
  FATHER: {
    id: 'FATHER',
    label: 'Father',
    roleTitle: 'On Earth',
    skin: '#8D5524',
    hair: '#1C1917',
    topColor: '#475569',
    accentColor: '#CBD5E1',
  },
};

interface CharacterCastStripProps {
  characters?: CharacterRefId[];
  activeSpeaker?: string;
}

export function CharacterCastStrip({ characters = [], activeSpeaker = '' }: CharacterCastStripProps) {
  if (characters.length === 0) return null;

  const normalizedSpeaker = activeSpeaker.toLowerCase();

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {characters.map((charId) => {
        const spec = CHARACTER_SPECS[charId];
        if (!spec) return null;
        const isSpeaking =
          normalizedSpeaker.length > 0 &&
          (normalizedSpeaker.includes(spec.label.toLowerCase()) ||
            (charId === 'REYES' && normalizedSpeaker.includes('reyes')) ||
            (charId === 'ELENA' && normalizedSpeaker.includes('elena')));

        return (
          <div
            key={charId}
            className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 border transition-all ${
              isSpeaking
                ? 'bg-slate-900/95 border-lime-300 shadow-md scale-[1.03]'
                : 'bg-slate-900/80 border-white/15'
            }`}
          >
            {/* Consistent 3D-shaded SVG character bust */}
            <svg width="36" height="36" viewBox="0 0 48 48" className="shrink-0 rounded-lg bg-slate-950/70" aria-hidden="true">
              <defs>
                <radialGradient id={`skin-${charId}`} cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
                  <stop offset="100%" stopColor={spec.skin} stopOpacity="1" />
                </radialGradient>
              </defs>
              {/* Soft background glow */}
              <circle cx="24" cy="24" r="22" fill={spec.topColor} fillOpacity="0.16" />

              {/* Hair bun / back */}
              {spec.hasBun && <circle cx="24" cy="9" r="5.5" fill={spec.hair} />}
              {spec.hasLongHair && <rect x="12" y="13" width="24" height="16" rx="8" fill={spec.hair} />}

              {/* Torso / Uniform */}
              <path d="M9 46 C9 34, 39 34, 39 46 Z" fill={spec.topColor} />
              {spec.hasOveralls && (
                <>
                  <rect x="16" y="36" width="16" height="10" fill={spec.accentColor} />
                  <rect x="17" y="34" width="3" height="5" fill={spec.accentColor} />
                  <rect x="28" y="34" width="3" height="5" fill={spec.accentColor} />
                </>
              )}
              {spec.hasLeafPatch && <circle cx="31" cy="40" r="2.6" fill="#4ADE80" />}
              {spec.hasGearPatch && <circle cx="31" cy="40" r="2.6" fill="#F97316" />}

              {/* Head */}
              <circle cx="24" cy="21" r="10.5" fill={spec.skin} />
              <circle cx="24" cy="21" r="10.5" fill={`url(#skin-${charId})`} />

              {/* Hair top */}
              <path d="M13.5 19 C14 10, 34 10, 34.5 19 C31 15, 17 15, 13.5 19 Z" fill={spec.hair} />
              {charId === 'ELENA' && (
                <path d="M17 13.5 Q22 11 26 13" stroke="#D1D5DB" strokeWidth="1.6" fill="none" />
              )}

              {/* Eyes */}
              <circle cx="20.2" cy="21.5" r="1.4" fill="#111827" />
              <circle cx="27.8" cy="21.5" r="1.4" fill="#111827" />
              <circle cx="20.6" cy="21" r="0.45" fill="#FFFFFF" />
              <circle cx="28.2" cy="21" r="0.45" fill="#FFFFFF" />

              {/* Glasses for Elena */}
              {spec.hasGlasses && (
                <g stroke="#1E293B" strokeWidth="1.2" fill="none">
                  <rect x="17" y="19" width="6" height="4.5" rx="1" />
                  <rect x="25" y="19" width="6" height="4.5" rx="1" />
                  <line x1="23" y1="21.2" x2="25" y2="21.2" />
                </g>
              )}

              {/* Warm smile */}
              <path d="M21 26 Q24 28.5 27 26" stroke="#451A03" strokeWidth="1.3" strokeLinecap="round" fill="none" />

              {/* Childhood Mars notebook prop for MAYA-CHILD */}
              {spec.hasNotebook && (
                <g transform="translate(33, 33)">
                  <rect x="0" y="0" width="9" height="11" rx="1.2" fill="#FEF3C7" stroke="#92400E" strokeWidth="0.8" />
                  <circle cx="4.5" cy="4.2" r="2" fill="#EA580C" />
                  <path d="M4.5 7.5 Q6.8 6 7 8.5 Q4.5 9.2 4.5 7.5 Z" fill="#22C55E" />
                </g>
              )}
            </svg>

            <div className="leading-tight pr-1">
              <p className={`text-xs font-bold ${isSpeaking ? 'text-lime-300' : 'text-white'}`}>
                {spec.label}
              </p>
              <p className="text-[10px] text-slate-300">{spec.roleTitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
