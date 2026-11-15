import type { GameItem, Quiz, Story } from '../../types/education.ts';
import { StorybookView } from './StorybookView.tsx';

interface StoryPlayerModalProps {
  story: Story;
  allStories?: Story[];
  defaultCaptionsOn: boolean;
  defaultReadAloud: boolean;
  isAlreadyCompleted: boolean;
  relatedGame?: GameItem;
  relatedQuiz?: Quiz;
  onClose: () => void;
  onSelectStory?: (story: Story) => void;
  onCompleteStory: (storyId: string) => void;
  onLaunchGame: (game: GameItem) => void;
  onLaunchQuiz: (quiz: Quiz) => void;
}

export function StoryPlayerModal({
  story,
  allStories,
  defaultReadAloud,
  isAlreadyCompleted,
  relatedGame,
  relatedQuiz,
  onClose,
  onSelectStory,
  onCompleteStory,
  onLaunchGame,
  onLaunchQuiz,
}: StoryPlayerModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Storybook: ${story.title}`}
    >
      <StorybookView
        story={story}
        allStories={allStories}
        defaultReadAloud={defaultReadAloud}
        isAlreadyCompleted={isAlreadyCompleted}
        relatedGame={relatedGame}
        relatedQuiz={relatedQuiz}
        onClose={onClose}
        onSelectStory={onSelectStory}
        onCompleteStory={onCompleteStory}
        onLaunchGame={onLaunchGame}
        onLaunchQuiz={onLaunchQuiz}
      />
    </div>
  );
}
