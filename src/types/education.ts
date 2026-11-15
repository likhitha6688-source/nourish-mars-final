export type StoryCategory = 'Dream & Mars' | 'Space Food' | 'Systems & Data' | 'Dust Storm' | 'Hydroponics';

export type CharacterRefId =
  | 'MAYA-CHILD'
  | 'MAYA-ADULT'
  | 'SATHYA-CHILD'
  | 'SATHYA-ADULT'
  | 'ELENA'
  | 'REYES'
  | 'GRANDMOTHER'
  | 'MOTHER'
  | 'FATHER';

export type VoiceRoleId =
  | 'narrator'
  | 'maya-child'
  | 'maya-adult'
  | 'sathya-child'
  | 'sathya-adult'
  | 'elena'
  | 'reyes'
  | 'grandmother'
  | 'mother'
  | 'father';

export interface DialogueLine {
  speaker: string;
  voiceRole: VoiceRoleId;
  tone?: string;
  line: string;
}

export interface StoryCaption {
  start: number;
  end: number;
  text: string;
}

export interface StoryScene {
  id: string;
  sceneCode?: string;
  duration: number;
  setting: 'backyard' | 'spacefood' | 'hydroponics' | 'rover' | 'storm' | 'harvest';
  imageUrl: string;
  headline: string;
  location?: string;
  characters?: CharacterRefId[];
  visualCue?: string;
  screenText?: string;
  narration: string;
  narratorTone?: string;
  dialogueLines?: DialogueLine[];
  characterSpeaker: string;
  characterDialogue: string;
}

export interface Story {
  id: string;
  chapterLabel: string;
  title: string;
  description: string;
  category: StoryCategory;
  ageRange: string;
  durationSeconds: number;
  thumbnailUrl: string;
  videoUrl?: string;
  scenes: StoryScene[];
  captions: StoryCaption[];
  relatedGameId?: string;
  relatedQuizId?: string;
  published: boolean;
  createdAt: string;
}

export type GameType = 'matching' | 'memory' | 'dragdrop' | 'scenario' | 'chapter_mission';

export type ChapterGameMode =
  | 'ch1-build'
  | 'ch2-connect'
  | 'ch3-solar'
  | 'ch4-watts'
  | 'ch5-detective'
  | 'ch6-flow'
  | 'ch7-data'
  | 'ch8-storm'
  | 'ch9-harvest';

export interface MatchingPair {
  id: string;
  leftLabel: string;
  rightLabel: string;
  symbol: string;
  imageUrl?: string;
  hint: string;
}

export interface DragZone {
  id: string;
  title: string;
  description: string;
}

export interface DragItem {
  id: string;
  label: string;
  zoneId: string;
  symbol: string;
}

export interface ScenarioStep {
  id: string;
  situation: string;
  imageUrl?: string;
  question: string;
  choices: {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export interface GameItem {
  id: string;
  title: string;
  description: string;
  category: StoryCategory;
  type: GameType;
  chapterNumber?: number;
  chapterGameId?: ChapterGameMode;
  thumbnailUrl?: string;
  storyId?: string;
  published: boolean;
  starReward: number;
  pairs?: MatchingPair[];
  dragZones?: DragZone[];
  dragItems?: DragItem[];
  scenarios?: ScenarioStep[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  scenarioContext?: string;
  imageUrl?: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  correctFeedback: string;
  incorrectFeedback: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: StoryCategory;
  thumbnailUrl?: string;
  storyId?: string;
  mode?: 'standard' | 'flappy_flight';
  externalUrl?: string;
  published: boolean;
  starReward: number;
  badgeName: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export type NasaModelType = 'mars' | 'rover' | 'earth' | 'saturn' | 'voyager' | 'custom_glb';

export interface NasaModelItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: NasaModelType;
  glbUrl?: string;
  credit: string;
  sourceUrl: string;
  funFact: string;
}

export interface ParentalSettings {
  dailyLimitMinutes: number;
  defaultCaptionsOn: boolean;
  readAloudEnabled: boolean;
  safeExploreOnly: boolean;
}

export interface ChildProgress {
  explorerName: string;
  stars: number;
  completedStoryIds: string[];
  completedGameIds: string[];
  completedQuizIds: string[];
  badges: string[];
}

export interface AppContentPayload {
  stories: Story[];
  games: GameItem[];
  quizzes: Quiz[];
  models: NasaModelItem[];
  parentSettings: ParentalSettings;
}
