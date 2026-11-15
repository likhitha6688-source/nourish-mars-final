import type { ChapterGameMode } from '../../../types/education.ts';
import { Ch1BuildDreamGame } from './Ch1BuildDreamGame.tsx';
import { Ch2ConnectHabitatGame } from './Ch2ConnectHabitatGame.tsx';
import { Ch3SolarAlertGame } from './Ch3SolarAlertGame.tsx';
import { Ch4EveryWattCountsGame } from './Ch4EveryWattCountsGame.tsx';
import { Ch5GreenhouseDetectiveGame } from './Ch5GreenhouseDetectiveGame.tsx';
import { Ch6RestoreFlowGame } from './Ch6RestoreFlowGame.tsx';
import { Ch7DataReadingsGame } from './Ch7DataReadingsGame.tsx';
import { Ch8StormTeamGame } from './Ch8StormTeamGame.tsx';
import { Ch9HarvestGame } from './Ch9HarvestGame.tsx';

interface ChapterMissionRouterProps {
  mode?: ChapterGameMode;
  onFinish: () => void;
}

export function ChapterMissionRouter({ mode, onFinish }: ChapterMissionRouterProps) {
  switch (mode) {
    case 'ch1-build':
      return <Ch1BuildDreamGame onFinish={onFinish} />;
    case 'ch2-connect':
      return <Ch2ConnectHabitatGame onFinish={onFinish} />;
    case 'ch3-solar':
      return <Ch3SolarAlertGame onFinish={onFinish} />;
    case 'ch4-watts':
      return <Ch4EveryWattCountsGame onFinish={onFinish} />;
    case 'ch5-detective':
      return <Ch5GreenhouseDetectiveGame onFinish={onFinish} />;
    case 'ch6-flow':
      return <Ch6RestoreFlowGame onFinish={onFinish} />;
    case 'ch7-data':
      return <Ch7DataReadingsGame onFinish={onFinish} />;
    case 'ch8-storm':
      return <Ch8StormTeamGame onFinish={onFinish} />;
    case 'ch9-harvest':
      return <Ch9HarvestGame onFinish={onFinish} />;
    default:
      return (
        <p className="text-slate-600 text-sm">
          Chapter mission configuration missing. Please choose another game.
        </p>
      );
  }
}
