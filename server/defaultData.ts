import type {
  ChildProgress,
  GameItem,
  NasaModelItem,
  ParentalSettings,
  Quiz,
  Story,
} from '../src/types/education.ts';
import { NOURISH_MARS_STORIES } from './storyScriptData.ts';

export interface DatabaseSchema {
  stories: Story[];
  games: GameItem[];
  quizzes: Quiz[];
  models: NasaModelItem[];
  parentSettings: ParentalSettings;
  progress: ChildProgress;
}

export function createDefaultDatabase(): DatabaseSchema {
  const stories: Story[] = NOURISH_MARS_STORIES;

  const games: GameItem[] = [
    {
      id: 'nourish-game-ch1',
      title: 'Maya’s Garden Rescue',
      description:
        'Dodge obstacles, escape the pulse, and collect five supplies! Clear maze blocks with pulse pods as Maya or Sathya and match each supply to a plant need.',
      category: 'Dream & Mars',
      type: 'chapter_mission',
      chapterNumber: 1,
      chapterGameId: 'ch1-build',
      thumbnailUrl: '/assets/nourish/scenes/scene_01.jpg',
      storyId: 'nourish-ch1',
      published: true,
      starReward: 4,
      createdAt: '2026-11-01T10:00:00.000Z',
    },
    {
      id: 'nourish-game-ch2',
      title: 'Connect the Mission',
      description:
        'Match all 24 stacked habitat tiles across 2 layers and discover how greenhouse lamps, pumps, power, and backup meals connect.',
      category: 'Space Food',
      type: 'chapter_mission',
      chapterNumber: 2,
      chapterGameId: 'ch2-connect',
      thumbnailUrl: '/assets/nourish/scenes/scene_02.jpg',
      storyId: 'nourish-ch2',
      published: true,
      starReward: 4,
      createdAt: '2026-11-02T10:00:00.000Z',
    },
    {
      id: 'nourish-game-ch3',
      title: 'Solar Alert—Bubble Trouble',
      description:
        'Clear the training targets, collect the information, and reach the shelter! Play as Maya or Sathya in the mission-training simulation.',
      category: 'Systems & Data',
      type: 'chapter_mission',
      chapterNumber: 3,
      chapterGameId: 'ch3-solar',
      thumbnailUrl: '/assets/nourish/scenes/scene_11.jpg',
      storyId: 'nourish-ch3',
      published: true,
      starReward: 4,
      createdAt: '2026-11-03T10:00:00.000Z',
    },
    {
      id: 'nourish-game-ch4',
      title: 'Every Watt Counts',
      description:
        'Launch upward energy pulses to split bouncing overload spheres across 4 fast waves, unlock 4 power rules, and keep essential crew systems ON!',
      category: 'Systems & Data',
      type: 'chapter_mission',
      chapterNumber: 4,
      chapterGameId: 'ch4-watts',
      thumbnailUrl: '/assets/nourish/scenes/scene_04.jpg',
      storyId: 'nourish-ch4',
      published: true,
      starReward: 4,
      createdAt: '2026-11-04T10:00:00.000Z',
    },
    {
      id: 'nourish-game-ch5',
      title: 'Greenhouse Mystery Tiles',
      description:
        'Match 3 identical clues across 48 layered greenhouse tiles into your 7-slot tray, fill Maya’s notebook, and choose an independent check!',
      category: 'Hydroponics',
      type: 'chapter_mission',
      chapterNumber: 5,
      chapterGameId: 'ch5-detective',
      thumbnailUrl: '/assets/nourish/scenes/scene_03.jpg',
      storyId: 'nourish-ch5',
      published: true,
      starReward: 4,
      createdAt: '2026-11-05T10:00:00.000Z',
    },
    {
      id: 'nourish-game-ch6',
      title: 'The Missing Water Route',
      description:
        'Assemble the 30-piece cutaway water system jigsaw, tap the compressed tube behind the service bracket, and test the repaired route.',
      category: 'Hydroponics',
      type: 'chapter_mission',
      chapterNumber: 6,
      chapterGameId: 'ch6-flow',
      thumbnailUrl: '/assets/nourish/scenes/scene_09.jpg',
      storyId: 'nourish-ch6',
      published: true,
      starReward: 4,
      createdAt: '2026-11-06T10:00:00.000Z',
    },
    {
      id: 'nourish-game-ch7',
      title: 'Two Readings, One Source',
      description:
        'Build the 30-piece sensor jigsaw, trace ● solid and ▲ dashed paths to the shared sensor, and run an independent verification check.',
      category: 'Systems & Data',
      type: 'chapter_mission',
      chapterNumber: 7,
      chapterGameId: 'ch7-data',
      thumbnailUrl: '/assets/nourish/scenes/scene_10.jpg',
      storyId: 'nourish-ch7',
      published: true,
      starReward: 4,
      createdAt: '2026-11-07T10:00:00.000Z',
    },
    {
      id: 'nourish-game-ch8',
      title: 'Storm Word Scramble',
      description:
        'Solve 8 clue questions by arranging jumbled letter tiles to power up the Mars habitat illustration and choose the safest storm plan!',
      category: 'Dust Storm',
      type: 'chapter_mission',
      chapterNumber: 8,
      chapterGameId: 'ch8-storm',
      thumbnailUrl: '/assets/nourish/scenes/scene_07.jpg',
      storyId: 'nourish-ch8',
      published: true,
      starReward: 4,
      createdAt: '2026-11-08T10:00:00.000Z',
    },
    {
      id: 'nourish-game-ch9',
      title: 'The Harvest Adventure',
      description:
        'Beat the 3-minute greenhouse course! Leap airlock pipes, bump ? supply blocks, dodge robots, deliver 8 cleared baskets, and plant the next seed.',
      category: 'Dust Storm',
      type: 'chapter_mission',
      chapterNumber: 9,
      chapterGameId: 'ch9-harvest',
      thumbnailUrl: '/assets/nourish/scenes/scene_06.jpg',
      storyId: 'nourish-ch9',
      published: true,
      starReward: 5,
      createdAt: '2026-11-09T10:00:00.000Z',
    },
  ];

  const quizzes: Quiz[] = [
    {
      id: 'nourish-quiz-dream-food',
      title: 'Dreaming of Mars & Space Food Quiz',
      description: 'Test what you learned from Maya and Sathya’s childhood stargazing, Jezero Crater, and astronaut nutrition!',
      category: 'Space Food',
      thumbnailUrl: '/assets/nourish/scenes/scene_08.png',
      storyId: 'nourish-ch2',
      published: true,
      starReward: 5,
      badgeName: 'Space Nutrition Cadet',
      createdAt: '2026-11-02T10:00:00.000Z',
      questions: [
        {
          id: 'nq-1',
          scenarioContext: 'Maya researched early NASA missions to see how space meals began.',
          imageUrl: '/assets/nourish/scenes/scene_08.png',
          prompt: 'What food did astronaut John Glenn eat from a tube during his 1962 Mercury flight?',
          options: [
            'Chocolate ice cream cake',
            'Applesauce',
            'Fresh garden salad',
          ],
          correctIndex: 1,
          correctFeedback: 'Spot on! John Glenn ate applesauce from a tube in 1962 before modern rehydratable meals existed.',
          incorrectFeedback: "Almost! Let's think about it together. Remember Maya read about a smooth fruit snack packed in a squeeze tube in 1962!",
          points: 100,
        },
        {
          id: 'nq-2',
          scenarioContext: 'Inside a freeze-drying chamber, frozen fruit is placed under reduced pressure.',
          imageUrl: '/assets/nourish/scenes/scene_08.png',
          prompt: 'What is the process called when ice turns directly into water vapor without melting into liquid first?',
          options: [
            'Sublimation',
            'Evaporation from boiling water',
            'Condensation',
          ],
          correctIndex: 0,
          correctFeedback: 'Amazing science memory! Sublimation removes water gently so space food stays super light.',
          incorrectFeedback: "Almost! Let's think about it together. Solid ice skipping the liquid step straight to vapor is called sublimation!",
          points: 100,
        },
        {
          id: 'nq-3',
          scenarioContext: 'Maya checks whether astronauts can plant Earth vegetable seeds straight into Mars dirt.',
          imageUrl: '/assets/nourish/scenes/scene_09.jpg',
          prompt: 'Why can’t astronauts simply plant seeds directly in Martian regolith?',
          options: [
            'Mars dirt is too bright pink.',
            'Martian regolith is not fertile garden soil and contains harmful perchlorate salts.',
            'Plants refuse to grow on any round planet.',
          ],
          correctIndex: 1,
          correctFeedback: 'You nailed it! Hydroponic greenhouses protect crops from perchlorates and freezing -63°C air.',
          incorrectFeedback: "Almost! Let's think about it together. Scientists detected chemical salts called perchlorates in Martian regolith.",
          points: 100,
        },
      ],
    },
    {
      id: 'nourish-quiz-systems',
      title: 'Mars Systems & Data Detective Quiz',
      description: 'Join Sathya and Dr. Elena Brooks to solve sensor puzzles, radiation safety, and energy balance!',
      category: 'Systems & Data',
      thumbnailUrl: '/assets/nourish/scenes/scene_10.jpg',
      storyId: 'nourish-ch7',
      published: true,
      starReward: 5,
      badgeName: 'Systems Detective',
      createdAt: '2026-11-04T10:00:00.000Z',
      questions: [
        {
          id: 'nq-s1',
          scenarioContext: 'Maya found an archive note: CHANNEL MISMATCH OBSERVED. VERIFY INDEPENDENT FLOW MEASUREMENT.',
          imageUrl: '/assets/nourish/scenes/scene_03.jpg',
          prompt: 'Why did the greenhouse dashboard look normal while the plants were actually thirsty?',
          options: [
            'Two separate dashboard channels were copying the same single sensor data path.',
            'The plants were pretending to droop as a joke.',
            'Mars has too much rain inside the greenhouse.',
          ],
          correctIndex: 0,
          correctFeedback: 'Two readings, one source! You caught the exact hidden engineering bug Sathya and Maya solved!',
          incorrectFeedback: "Almost! Let's think about it together. Remember Sathya said: 'Two readings. One source.'",
          points: 100,
        },
        {
          id: 'nq-s2',
          scenarioContext: 'Dr. Elena opens NASA’s DONKI Space Weather Database during mission training.',
          imageUrl: '/assets/nourish/scenes/scene_11.jpg',
          prompt: 'What does NASA’s DONKI database help mission teams monitor?',
          options: [
            'Daily lunch recipes on Earth',
            'Space-weather events from the Sun that can raise radiation risks',
            'Ocean tides on Jupiter',
          ],
          correctIndex: 1,
          correctFeedback: 'Super science thinking! Monitoring solar bursts helps crews move into shielded shelters in time.',
          incorrectFeedback: "Almost! Let's think about it together. DONKI tracks bursts of solar energy and charged particles from the Sun.",
          points: 100,
        },
      ],
    },
    {
      id: 'nourish-quiz-harvest',
      title: 'The Last Harvest & Exploration Quiz',
      description: 'Reflect on surviving the Martian dust storm, Earth–Mars communication delays, and Maya’s message home.',
      category: 'Dust Storm',
      thumbnailUrl: '/assets/nourish/scenes/scene_06.jpg',
      storyId: 'nourish-ch9',
      published: true,
      starReward: 5,
      badgeName: 'Mars Harvest Guardian',
      createdAt: '2026-11-05T10:00:00.000Z',
      questions: [
        {
          id: 'nq-h1',
          scenarioContext: 'Maya sends a message from Mars back to Earth during the dust storm.',
          imageUrl: '/assets/nourish/scenes/scene_10.jpg',
          prompt: 'Why couldn’t Earth reply to Maya’s message instantaneously?',
          options: [
            'Even at the speed of light, radio signals take time to cross the huge distance between Mars and Earth.',
            'Radio waves freeze solid in space.',
            'Earth turns off its antennas every night.',
          ],
          correctIndex: 0,
          correctFeedback: 'Cosmic physics master! Light-speed communication delay means Mars crews must solve urgent problems together.',
          incorrectFeedback: "Almost! Let's think about it together. Space between planets is so vast that even light-speed radio signals are delayed.",
          points: 100,
        },
        {
          id: 'nq-h2',
          scenarioContext: 'The crew gathers around the first fresh leaves harvested after the storm.',
          imageUrl: '/assets/nourish/scenes/scene_01.jpg',
          prompt: 'According to Maya’s message home, what does every green leaf grown on Mars represent?',
          options: [
            'Only a lucky accident',
            'A question asked, a problem solved, and teamwork protecting each other',
            'Something only robots care about',
          ],
          correctIndex: 1,
          correctFeedback: "Fantastic! You're a true NOURISH-Mars Explorer! Exploration needs courage, science, and care.",
          incorrectFeedback: "Almost! Let's think about it together. Every leaf stood for asking questions, checking data, and helping one another.",
          points: 100,
        },
      ],
    },
    {
      id: 'nourish-quiz-flappy-space',
      title: 'Flappy Space Quiz Challenge',
      description:
        'Fly through glowing Mars space gates and answer 182 NOURISH-Mars story & engineering questions across all 10 levels!',
      category: 'Dream & Mars',
      thumbnailUrl: '/assets/nourish/scenes/scene_07.jpg',
      storyId: 'nourish-ch1',
      mode: 'flappy_flight',
      externalUrl: 'https://space-es.netlify.app/',
      published: true,
      starReward: 6,
      badgeName: 'Flappy Space Ace',
      createdAt: '2026-11-10T10:00:00.000Z',
      questions: [
        {
          id: 'flappy-preview-1',
          prompt: 'Where does Maya dream of travelling?',
          options: ['Mars', 'An underwater city', 'A jungle'],
          correctIndex: 0,
          correctFeedback: 'Mars!',
          incorrectFeedback: 'Maya dreams of travelling to Mars!',
          points: 100,
        },
      ],
    },
  ];

  const models: NasaModelItem[] = [
    {
      id: 'nasa-mars',
      title: 'Planet Mars (Jezero & Red Plains)',
      subtitle: 'Average Temp: -63°C · Thin CO₂ Atmosphere',
      description:
        'Spin the Red Planet that inspired Maya and Sathya! Look for its polar ice caps and rusty iron-oxide plains where dust storms can span across regions.',
      type: 'mars',
      credit: 'Inspired by NASA Mars Reconnaissance Orbiter & NOURISH-Mars',
      sourceUrl: 'https://science.nasa.gov/3d-resources/',
      funFact: 'Mars’s rusty color comes from iron-oxide dust, and a Martian day is 24 hours and 37 minutes long!',
    },
    {
      id: 'nasa-rover',
      title: 'Jezero Crater Mars Rover',
      subtitle: 'Perseverance-Class Robotic Geologist',
      description:
        'Inspect a six-wheeled rover like the one Maya and Sathya studied! Features stereo MastCam eyes, rocker-bogie wheels, gold thermal foil, and a dish antenna.',
      type: 'rover',
      credit: 'Inspired by NASA JPL Mars Perseverance 3D Archive',
      sourceUrl: 'https://eyes.nasa.gov/',
      funFact: 'Perseverance landed in Jezero Crater in February 2021 to search for clues of an ancient Martian lake!',
    },
    {
      id: 'nasa-earth',
      title: 'Planet Earth (Home & Mission Control)',
      subtitle: 'Where Maya & Sathya Counted Stars',
      description:
        'Look back at our Blue Marble—the vibrant home planet sending radio signals across space to Maya and Sathya’s Mars habitat.',
      type: 'earth',
      credit: 'Inspired by NASA Visible Earth Blue Marble',
      sourceUrl: 'https://images.nasa.gov/',
      funFact: 'Depending on where Earth and Mars sit in orbit, one-way radio messages take roughly 4 to 24 minutes!',
    },
    {
      id: 'nasa-voyager',
      title: 'Deep Space Communications Probe',
      subtitle: 'High-Gain Dish & Golden Record',
      description:
        'Explore a deep-space spacecraft carrying a white parabolic dish antenna, magnetometer boom, and gold thermal protection.',
      type: 'voyager',
      credit: 'Inspired by NASA Eyes on the Solar System',
      sourceUrl: 'https://eyes.nasa.gov/',
      funFact: 'High-gain parabolic dishes focus faint radio whispers across hundreds of millions of kilometers!',
    },
    {
      id: 'nasa-saturn',
      title: 'Saturn & Its Icy Rings',
      subtitle: 'Beyond the Asteroid Belt',
      description:
        'Remember the ringed planets Maya watched from her backyard blanket—orbit around Saturn’s golden bands and sparkling ice rings.',
      type: 'saturn',
      credit: 'Inspired by NASA Cassini 3D Resources',
      sourceUrl: 'https://science.nasa.gov/3d-resources/',
      funFact: 'Saturn’s rings are made of billions of pieces of water ice and rocky dust!',
    },
  ];

  const parentSettings: ParentalSettings = {
    dailyLimitMinutes: 45,
    defaultCaptionsOn: true,
    readAloudEnabled: false,
    safeExploreOnly: true,
  };

  const progress: ChildProgress = {
    explorerName: 'Maya & Sathya Crew',
    stars: 4,
    completedStoryIds: [],
    completedGameIds: [],
    completedQuizIds: [],
    badges: ['Backyard Stargazer'],
  };

  return {
    stories,
    games,
    quizzes,
    models,
    parentSettings,
    progress,
  };
}
