import { Film } from 'lucide-react';
import type { GameItem, Quiz, Story } from '../../types/education.ts';
import { stopBackgroundMusic } from '../../utils/soundEffects.ts';

interface StoriesViewProps {
  stories: Story[];
  games: GameItem[];
  quizzes: Quiz[];
  completedStoryIds: string[];
  onWatchStory: (story: Story) => void;
  onLaunchGame: (game: GameItem) => void;
  onLaunchQuiz: (quiz: Quiz) => void;
}

const FULL_STORY_VIDEO_URL =
  '/assets/aistudio/WhatsApp_Video_2026-11-15_at_10.22.45_AM_dbe9ace1.mp4';

export function StoriesView(_props: StoriesViewProps) {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="p-6 sm:p-8 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-lime-300 inline-flex items-center gap-1.5 mb-2">
              <Film className="w-4 h-4" />
              Full Animated Story
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              NOURISH—MARS: THE LAST HARVEST
            </h1>
            <p className="text-sm text-slate-300 mt-1.5">
              Watch the complete story of Maya and Sathya from their backyard sketchbook to Jezero Crater.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-slate-950">
          <video
            controls
            playsInline
            preload="metadata"
            poster="/assets/nourish/scenes/scene_01.jpg"
            src={FULL_STORY_VIDEO_URL}
            onPlay={() => stopBackgroundMusic()}
            className="w-full aspect-video rounded-xl bg-black shadow-lg outline-none"
          >
            Your browser does not support HTML5 video playback.
          </video>
        </div>
      </div>
    </section>
  );
}
