import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Maximize2,
  ShieldAlert,
  Sprout,
  Utensils,
  X,
} from 'lucide-react';
import { playChime } from '../../utils/soundEffects.ts';

type NoteCategory = 'All' | 'Growing Food' | 'Food Safety & Crew' | 'Solar Radiation & Protection';

interface TakeAwayNoteItem {
  id: string;
  number: string;
  title: string;
  summary: string;
  imageSrc: string;
  categories: Exclude<NoteCategory, 'All'>[];
  orientation?: 'landscape' | 'portrait';
}

const TAKE_AWAY_NOTES: TakeAwayNoteItem[] = [
  {
    id: 'note-01',
    number: 'Note 01',
    title: '5 Essentials for a Mars Greenhouse',
    summary:
      'Inside a sealed Mars dome, plants need Water, Light, Air, Warmth, and Nutrients—carefully controlled because Martian air and dust cannot support Earth crops.',
    imageSrc: '/assets/nourish/notes/note_01.jpg',
    categories: ['Growing Food'],
  },
  {
    id: 'note-02',
    number: 'Note 02',
    title: 'How Hydroponics Recirculates Water',
    summary:
      'LED grow lights shine above support trays while a pump cycles nutrient-rich water past bare lettuce roots and back to the reservoir with minimal water loss.',
    imageSrc: '/assets/nourish/notes/note_02.jpg',
    categories: ['Growing Food'],
  },
  {
    id: 'note-03',
    number: 'Note 03',
    title: 'Mission Decision: Space Food Safety',
    summary:
      'Never eat from a puffed or torn food packet. Seal it inside an Isolation Container marked "Do Not Eat" and switch to an approved safe meal.',
    imageSrc: '/assets/nourish/notes/note_03.jpg',
    categories: ['Food Safety & Crew'],
  },
  {
    id: 'note-04',
    number: 'Note 04',
    title: 'Crew Mission Rules & Connected Systems',
    summary:
      'Life Support, Greenhouse, Science Lab, and Crew Quarters share energy and water tokens. Always follow Mission Rules: 1. Protect People, 2. Preserve Survival.',
    imageSrc: '/assets/nourish/notes/note_04.jpg',
    categories: ['Food Safety & Crew'],
  },
  {
    id: 'note-05',
    number: 'Note 05',
    title: 'Useful Sunlight vs. Space Radiation',
    summary:
      'The Sun emits Visible Light and Infrared Heat for plants, alongside Ultraviolet (UV) rays and Charged Particles that require shielding for astronauts.',
    imageSrc: '/assets/nourish/notes/note_05.jpg',
    categories: ['Solar Radiation & Protection'],
  },
  {
    id: 'note-06',
    number: 'Note 06',
    title: 'NOURISH—MARS Big Picture Guide',
    summary:
      'Grow Food, Protect Life, Sustain the Future: Fuel the Crew, Grow Indoors, Protect Against Radiation, Keep Food Safe, Manage Resources, and Work Sustainably.',
    imageSrc: '/assets/nourish/notes/note_06.jpg',
    categories: ['Growing Food', 'Food Safety & Crew', 'Solar Radiation & Protection'],
  },
  {
    id: 'note-07',
    number: 'Note 07',
    title: 'Solar Radiation Emergency Procedure',
    summary:
      'Crew Safety First! Stop outdoor work immediately, radio your team, and head to the designated radiation shelter—never stop to harvest, save gear, or take photos.',
    imageSrc: '/assets/nourish/notes/note_07.jpg',
    categories: ['Solar Radiation & Protection', 'Food Safety & Crew'],
  },
  {
    id: 'note-08',
    number: 'Note 08',
    title: 'Mars Food Production: Shielding & LEDs',
    summary:
      'Transparent greenhouses let harmful radiation reach plants. Growing inside thick shielded structures using balanced LED grow lights keeps crops healthy.',
    imageSrc: '/assets/nourish/notes/note_08.jpg',
    categories: ['Growing Food', 'Solar Radiation & Protection'],
  },
  {
    id: 'note-09',
    number: 'Note 09',
    title: '4 Methods to Protect Astronauts on Mars',
    summary:
      'Protect crews by shielding habitats with Martian soil and water walls, tracking space-weather forecasts, using cliffs or caves, and limiting outdoor time.',
    imageSrc: '/assets/nourish/notes/note_09.jpg',
    categories: ['Solar Radiation & Protection'],
  },
  {
    id: 'note-10',
    number: 'Note 10',
    title: 'Radiation, Cells & Crew Protection',
    summary:
      'High-energy radiation can harm cells and DNA depending on dose, type, and speed—so astronauts use radiation monitors, thick shielding, and strict procedures.',
    imageSrc: '/assets/nourish/notes/note_10.jpg',
    categories: ['Solar Radiation & Protection'],
  },
  {
    id: 'note-11',
    number: 'Note 11',
    title: 'Exploring Solar Radiation: Where It Comes From',
    summary:
      'Sunlight drives photosynthesis on Earth, while high-energy particles from solar events exceed safe levels in space and demand shielding for people and crops.',
    imageSrc: '/assets/nourish/notes/note_11.jpg',
    categories: ['Solar Radiation & Protection'],
  },
  {
    id: 'note-12',
    number: 'Note 12',
    title: 'Why Radiation Is Stronger on Mars Than Earth',
    summary:
      'Earth has a dense atmosphere and strong global magnetic field. Mars has less than 1% of Earth’s atmosphere and no global magnetic shield, requiring shielded habitats.',
    imageSrc: '/assets/nourish/notes/note_12.jpg',
    categories: ['Solar Radiation & Protection'],
    orientation: 'portrait',
  },
];

const CATEGORIES: NoteCategory[] = [
  'All',
  'Growing Food',
  'Food Safety & Crew',
  'Solar Radiation & Protection',
];

export function TakeAwayNotesView() {
  const [filter, setFilter] = useState<NoteCategory>('All');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filteredNotes =
    filter === 'All'
      ? TAKE_AWAY_NOTES
      : TAKE_AWAY_NOTES.filter((note) => note.categories.includes(filter));

  const activeNote = activeIndex !== null ? filteredNotes[activeIndex] ?? null : null;

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveIndex(null);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((idx) => (idx === null ? null : (idx + 1) % filteredNotes.length));
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((idx) =>
          idx === null ? null : (idx - 1 + filteredNotes.length) % filteredNotes.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, filteredNotes.length]);

  const getCategoryIcon = (cat: NoteCategory) => {
    if (cat === 'Growing Food') return <Sprout className="w-4 h-4" />;
    if (cat === 'Food Safety & Crew') return <Utensils className="w-4 h-4" />;
    if (cat === 'Solar Radiation & Protection') return <ShieldAlert className="w-4 h-4" />;
    return <ClipboardList className="w-4 h-4" />;
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch mb-8 border border-slate-800 shadow-lg">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-3">
          <p className="text-xs font-semibold text-lime-300 inline-flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4" />
            Mission Field Guide · 12 Illustrated Visual Notes
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Take Away Notes
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Review everything you learned with Maya and Sathya—Mars greenhouse essentials, hydroponics, space food safety, and solar radiation protection in clear visual guides. Tap any picture to zoom in full-screen.
          </p>
          <div className="pt-1 text-xs sm:text-sm font-mono-tabular text-lime-300 font-semibold">
            {TAKE_AWAY_NOTES.length} Printable-Style Reference Posters · Tap Any Card to Zoom
          </div>
        </div>
        <div className="lg:col-span-5 bg-slate-950 p-3 flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              playChime('pop');
              setFilter('All');
              setActiveIndex(5);
            }}
            className="relative w-full h-full min-h-[210px] rounded-xl overflow-hidden group text-left"
            aria-label="Zoom NOURISH-MARS Big Picture Guide"
          >
            <img
              src="/assets/nourish/notes/note_06.jpg"
              alt="NOURISH-MARS master takeaway poster showing how to grow food, protect life, and sustain the future"
              className="w-full h-full object-contain bg-slate-950"
            />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-semibold border border-white/15 group-hover:bg-lime-300 group-hover:text-slate-950 transition-colors">
              <Maximize2 className="w-3.5 h-3.5" />
              Inspect Overview Poster
            </span>
          </button>
        </div>
      </div>

      {/* Topic Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              playChime('button');
              setFilter(cat);
              setActiveIndex(null);
            }}
            className={`min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${
              filter === cat
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {getCategoryIcon(cat)}
            {cat}
          </button>
        ))}
      </div>

      {/* Visual Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNotes.map((note, idx) => (
          <article
            key={note.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:border-sky-300 transition-colors shadow-sm"
          >
            <button
              type="button"
              onClick={() => {
                playChime('pop');
                setActiveIndex(idx);
              }}
              className="relative w-full bg-slate-950 overflow-hidden group text-left"
              aria-label={`Zoom in on ${note.title}`}
            >
              <div
                className={`w-full flex items-center justify-center p-2 ${
                  note.orientation === 'portrait' ? 'h-80 sm:h-96' : 'aspect-[16/10]'
                }`}
              >
                <img
                  src={note.imageSrc}
                  alt={note.title}
                  loading="lazy"
                  className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg group-hover:scale-[1.015] transition-transform duration-300"
                />
              </div>
              <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-semibold border border-white/15 group-hover:bg-lime-300 group-hover:text-slate-950 transition-colors">
                <Maximize2 className="w-3.5 h-3.5" />
                Zoom
              </span>
            </button>

            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold mb-1.5">
                  <span className="text-orange-700">{note.number}</span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="text-sky-700">{note.categories[0]}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5">{note.title}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{note.summary}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Full-Screen Zoom Lightbox with Previous / Next Navigation */}
      {activeNote && activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/92 flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={activeNote.title}
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="max-w-5xl w-full bg-slate-900 border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start sm:items-center justify-between gap-4 px-5 py-3.5 border-b border-white/10">
              <div>
                <p className="text-xs font-semibold text-lime-300">
                  {activeNote.number} · {activeIndex + 1} of {filteredNotes.length}
                </p>
                <h3 className="text-base sm:text-lg font-bold text-white">{activeNote.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="min-w-[40px] min-h-[40px] rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shrink-0"
                aria-label="Close note preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 sm:p-5 flex-1 min-h-0 flex items-center justify-center overflow-auto">
              <img
                src={activeNote.imageSrc}
                alt={activeNote.title}
                className="max-h-[68vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="px-5 py-3.5 border-t border-white/10 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {activeNote.summary}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    playChime('button');
                    setActiveIndex((activeIndex - 1 + filteredNotes.length) % filteredNotes.length);
                  }}
                  className="min-h-[40px] inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playChime('button');
                    setActiveIndex((activeIndex + 1) % filteredNotes.length);
                  }}
                  className="min-h-[40px] inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-lime-300 hover:bg-lime-200 text-slate-950 text-xs sm:text-sm font-bold"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
