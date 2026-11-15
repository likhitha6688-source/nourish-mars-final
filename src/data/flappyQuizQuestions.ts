// Sourced from https://space-es.netlify.app/ interactive NOURISH-Mars Flappy Quiz
export interface FlappyQuizQuestion {
  id: string;
  level: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export const FLAPPY_SPACE_QUIZ_QUESTIONS: FlappyQuizQuestion[] = [
  {
    "id": "flappy-q-1",
    "level": "Level 1 - First Steps",
    "prompt": "Where does Maya dream of travelling?",
    "options": [
      "Mars",
      "An underwater city",
      "A jungle"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-2",
    "level": "Level 1 - First Steps",
    "prompt": "Who is Maya’s best friend?",
    "options": [
      "Elena",
      "Sathya",
      "Reyes"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-3",
    "level": "Level 1 - First Steps",
    "prompt": "What does Maya enjoy studying?",
    "options": [
      "Racing cars",
      "Musical instruments",
      "Plants and food systems"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-4",
    "level": "Level 1 - First Steps",
    "prompt": "What does Sathya enjoy working with?",
    "options": [
      "Machines and robots",
      "Dance costumes",
      "Musical instruments"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-5",
    "level": "Level 1 - First Steps",
    "prompt": "What appears beside the girl in Maya’s childhood drawing?",
    "options": [
      "A castle",
      "A green leaf",
      "A submarine"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-6",
    "level": "Level 2 - Growing Curiosity",
    "prompt": "Where do Maya and Sathya make their childhood promise?",
    "options": [
      "In a spacecraft",
      "In a classroom",
      "Beneath the stars in the backyard"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-7",
    "level": "Level 2 - Growing Curiosity",
    "prompt": "Who connects their dream of space travel with the need for food?",
    "options": [
      "Grandmother",
      "A toy robot",
      "A computer alert"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-8",
    "level": "Level 2 - Growing Curiosity",
    "prompt": "What do Maya and Sathya build as children?",
    "options": [
      "A full-sized spacecraft",
      "A small growing experiment",
      "A Mars habitat"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-9",
    "level": "Level 2 - Growing Curiosity",
    "prompt": "Which item provides light in their growing experiment?",
    "options": [
      "A notebook",
      "A reservoir",
      "A growing lamp"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-10",
    "level": "Level 2 - Growing Curiosity",
    "prompt": "What should they do when an experiment fails?",
    "options": [
      "Record what happened",
      "Hide the result",
      "Stop asking questions"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-11",
    "level": "Level 2 - Growing Curiosity",
    "prompt": "Why is Maya initially disappointed at home?",
    "options": [
      "She dislikes her drawing",
      "Her parents are busy when she asks a question",
      "Sathya breaks her notebook"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-12",
    "level": "Level 2 - Growing Curiosity",
    "prompt": "How do Maya’s parents respond after noticing her hurt feelings?",
    "options": [
      "They forbid her dream",
      "They throw away her drawing",
      "They reassure her and ask about her plan"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-13",
    "level": "Level 3 - Build the Basics",
    "prompt": "Which group lists the growing needs explored in the garden game?",
    "options": [
      "Water, light, nutrients, air, and suitable conditions",
      "Toys, dust, paint, sand, and music",
      "Metal, ice, darkness, plastic, and rocks"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-14",
    "level": "Level 3 - Build the Basics",
    "prompt": "In Maya’s soilless experiment, what carries nutrients to the roots?",
    "options": [
      "A radio signal",
      "Prepared nutrient water",
      "A notebook"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-15",
    "level": "Level 3 - Build the Basics",
    "prompt": "What does the growing lamp need to operate?",
    "options": [
      "A larger window",
      "A drawing",
      "Electrical power"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-16",
    "level": "Level 3 - Build the Basics",
    "prompt": "What do Maya and Sathya learn to keep during experiments?",
    "options": [
      "Written observations",
      "Secret results",
      "Unlabelled guesses"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-17",
    "level": "Level 3 - Build the Basics",
    "prompt": "What does the mission greenhouse add to the crew’s diet?",
    "options": [
      "All food forever",
      "Fresh produce",
      "Battery power"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-18",
    "level": "Level 3 - Build the Basics",
    "prompt": "Why does the mission carry stored meals?",
    "options": [
      "To replace water",
      "To feed the robots",
      "To provide food if crops fail"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-19",
    "level": "Level 3 - Build the Basics",
    "prompt": "What does Elena mean by “Nothing works alone”?",
    "options": [
      "Systems depend on one another",
      "Everyone must do the same job",
      "Machines never need help"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-20",
    "level": "Level 3 - Build the Basics",
    "prompt": "What message brings Maya and Sathya exciting news?",
    "options": [
      "A weather report",
      "Their programme selection results",
      "A shopping reminder"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-21",
    "level": "Level 3 - Build the Basics",
    "prompt": "What does Maya bring to Mars that connects her to childhood?",
    "options": [
      "A classroom desk",
      "A garden fence",
      "Her old notebook"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-22",
    "level": "Level 3 - Build the Basics",
    "prompt": "What follows the first growing cycle?",
    "options": [
      "Planning another cycle",
      "Ending all plant research",
      "Discarding all records"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-23",
    "level": "Level 4 - Observe and Understand",
    "prompt": "What first makes Maya suspect a greenhouse problem?",
    "options": [
      "A missing chair",
      "Pale leaves and drooping plants",
      "A new notebook"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-24",
    "level": "Level 4 - Observe and Understand",
    "prompt": "How does Maya check whether the plants have changed?",
    "options": [
      "She asks them",
      "She changes every setting",
      "She compares them with an earlier photograph"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-25",
    "level": "Level 4 - Observe and Understand",
    "prompt": "What does the dashboard initially suggest?",
    "options": [
      "Conditions appear normal",
      "Every plant is dead",
      "The habitat is empty"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-26",
    "level": "Level 4 - Observe and Understand",
    "prompt": "What should the team do when plants and dashboard readings disagree?",
    "options": [
      "Ignore the plants",
      "Investigate the mismatch",
      "Stop keeping records"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-27",
    "level": "Level 4 - Observe and Understand",
    "prompt": "What does Maya place beside the affected tray?",
    "options": [
      "A meal pouch",
      "A helmet",
      "A numbered marker"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-28",
    "level": "Level 4 - Observe and Understand",
    "prompt": "What does Sathya notice about two flow graphs?",
    "options": [
      "They match unusually closely",
      "They show different planets",
      "They contain no readings"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-29",
    "level": "Level 4 - Observe and Understand",
    "prompt": "What earlier event does Maya remember?",
    "options": [
      "A family meal",
      "The training-unit maintenance warning",
      "The launch countdown"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-30",
    "level": "Level 4 - Observe and Understand",
    "prompt": "What check does Elena request?",
    "options": [
      "A new drawing",
      "A taste test",
      "An independent flow measurement"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-31",
    "level": "Level 4 - Observe and Understand",
    "prompt": "What does Sathya find in the reservoir?",
    "options": [
      "Water is present",
      "The tank has disappeared",
      "The tank contains soil"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-32",
    "level": "Level 4 - Observe and Understand",
    "prompt": "What does an operating pump prove by itself?",
    "options": [
      "Every root receives enough water",
      "The pump is operating, not necessarily that delivery is sufficient",
      "Every plant is healthy"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-33",
    "level": "Level 4 - Observe and Understand",
    "prompt": "Where is the compressed tube found?",
    "options": [
      "Inside Maya’s notebook",
      "Beneath the dining table",
      "Behind a service bracket"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-34",
    "level": "Level 4 - Observe and Understand",
    "prompt": "What must happen before the repair?",
    "options": [
      "Isolate the section and follow the checklist",
      "Pull the tube while it is operating",
      "Ignore the procedure"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-35",
    "level": "Level 4 - Observe and Understand",
    "prompt": "What do the plants need after flow is restored?",
    "options": [
      "An instant harvest",
      "Time and monitoring",
      "No further checks"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-36",
    "level": "Level 4 - Observe and Understand",
    "prompt": "What does the crew document during the investigation?",
    "options": [
      "Only successful guesses",
      "Nothing until the end",
      "Observations, checks, and results"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-37",
    "level": "Level 4 - Observe and Understand",
    "prompt": "What is a stressed leaf in this investigation?",
    "options": [
      "A clue requiring investigation",
      "Proof of every possible cause",
      "A reason to ignore all instruments"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-38",
    "level": "Level 5 - Connected Mission",
    "prompt": "Who coordinates the crew’s mission decisions?",
    "options": [
      "Grandmother",
      "A toy rover",
      "Commander Reyes"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-39",
    "level": "Level 5 - Connected Mission",
    "prompt": "Who guides many of the scientific discussions?",
    "options": [
      "Elena",
      "Maya’s father",
      "A maintenance robot"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-40",
    "level": "Level 5 - Connected Mission",
    "prompt": "Which connection does Sathya identify during training?",
    "options": [
      "Notebooks power radios",
      "Pumps and lights need electricity",
      "Stored meals operate doors"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-41",
    "level": "Level 5 - Connected Mission",
    "prompt": "Why can Maya not plan the greenhouse completely separately?",
    "options": [
      "Plants never need care",
      "Only engineers make plans",
      "It depends on shared habitat resources"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-42",
    "level": "Level 5 - Connected Mission",
    "prompt": "What happens to the faulty Earth training unit?",
    "options": [
      "It is removed from service for investigation",
      "It is knowingly used without review",
      "It is hidden from the team"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-43",
    "level": "Level 5 - Connected Mission",
    "prompt": "What warning appears in the training archive?",
    "options": [
      "Stop all plant research",
      "Verify flow independently",
      "Discard every sensor"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-44",
    "level": "Level 5 - Connected Mission",
    "prompt": "When does the replacement-controller issue occur?",
    "options": [
      "Before Maya is born",
      "During the childhood experiment",
      "During the Mars mission"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-45",
    "level": "Level 5 - Connected Mission",
    "prompt": "What does Sathya check after installing the replacement?",
    "options": [
      "Pump commands and display responses",
      "Only its colour",
      "Only its size"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-46",
    "level": "Level 5 - Connected Mission",
    "prompt": "Why does Maya continue checking the crop?",
    "options": [
      "Equipment checks are meaningless",
      "Plant condition provides additional evidence",
      "Photographs replace every measurement"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-47",
    "level": "Level 5 - Connected Mission",
    "prompt": "What reduces the crew’s available power during the storm?",
    "options": [
      "Their notebook use",
      "Their conversation",
      "Falling solar generation"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-48",
    "level": "Level 5 - Connected Mission",
    "prompt": "What should guide power planning?",
    "options": [
      "Measured output, storage information, and the approved plan",
      "The brightest screen",
      "The quickest guess"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-49",
    "level": "Level 5 - Connected Mission",
    "prompt": "Which category belongs in the power plan?",
    "options": [
      "Tasks chosen by colour",
      "Activities that can wait",
      "Tasks nobody understands"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-50",
    "level": "Level 5 - Connected Mission",
    "prompt": "Which systems remain protected?",
    "options": [
      "Every optional experiment",
      "Decorative lighting only",
      "Essential crew systems"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-51",
    "level": "Level 5 - Connected Mission",
    "prompt": "What is one possible approved greenhouse adjustment?",
    "options": [
      "A reduced lighting schedule",
      "Removing every root channel",
      "Turning off all monitoring"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-52",
    "level": "Level 5 - Connected Mission",
    "prompt": "Why review the whole power plan before changing greenhouse lighting?",
    "options": [
      "Plants never need light",
      "The decision affects shared resources",
      "Lighting has no connection to power"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-53",
    "level": "Level 5 - Connected Mission",
    "prompt": "Why are the plants nearly mature before the storm?",
    "options": [
      "They grow instantly",
      "They are planted during dinner",
      "They have been growing for weeks"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-54",
    "level": "Level 5 - Connected Mission",
    "prompt": "What is the greenhouse’s role in this mission?",
    "options": [
      "Supplementing food and supporting research",
      "Replacing every stored meal immediately",
      "Running the spacecraft"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-55",
    "level": "Level 5 - Connected Mission",
    "prompt": "Which resource connects food preparation and some stored meals?",
    "options": [
      "Paint",
      "Water",
      "Sand"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-56",
    "level": "Level 5 - Connected Mission",
    "prompt": "Which resource connects growing lamps with habitat operations?",
    "options": [
      "Paper",
      "Soil",
      "Electricity"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-57",
    "level": "Level 5 - Connected Mission",
    "prompt": "What makes a habitat plan successful?",
    "options": [
      "Systems working safely together",
      "One machine getting every resource",
      "Never checking results"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-58",
    "level": "Level 6 - Evidence Detective",
    "prompt": "What does a solar alert help the crew understand?",
    "options": [
      "The taste of lettuce",
      "Activity at the Sun",
      "Reservoir water quality"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-59",
    "level": "Level 6 - Evidence Detective",
    "prompt": "What provides information about Maya’s individual radiation exposure?",
    "options": [
      "A plant photograph",
      "A power cable",
      "Her personal dosimetry record"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-60",
    "level": "Level 6 - Evidence Detective",
    "prompt": "What provides radiation information at the habitat?",
    "options": [
      "The habitat radiation monitor",
      "The meal inventory",
      "The growing lamp"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-61",
    "level": "Level 6 - Evidence Detective",
    "prompt": "Are these three information sources interchangeable?",
    "options": [
      "Yes, always",
      "No, they answer different questions",
      "Yes, if the screens match"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-62",
    "level": "Level 6 - Evidence Detective",
    "prompt": "Why does Sathya put down his helmet after the alert?",
    "options": [
      "It changes colour",
      "The mission is over",
      "Exterior preparations are paused"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-63",
    "level": "Level 6 - Evidence Detective",
    "prompt": "What determines the crew’s shelter response?",
    "options": [
      "The mission procedure and reviewed information",
      "Whether radiation looks bright",
      "A game score"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-64",
    "level": "Level 6 - Evidence Detective",
    "prompt": "What does Elena say about shielding?",
    "options": [
      "It removes every risk",
      "It helps reduce exposure without removing every risk",
      "It makes monitoring unnecessary"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-65",
    "level": "Level 6 - Evidence Detective",
    "prompt": "What can the plant study directly describe?",
    "options": [
      "Every astronaut’s exact health",
      "Every future crop",
      "The studied plants under the tested conditions"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-66",
    "level": "Level 6 - Evidence Detective",
    "prompt": "Why is crew monitoring still needed?",
    "options": [
      "A plant study does not measure each astronaut’s exposure",
      "Plant studies are always useless",
      "Records should never be compared"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-67",
    "level": "Level 6 - Evidence Detective",
    "prompt": "What must happen before leaving the shelter?",
    "options": [
      "Someone feels bored",
      "Required checks and permission under the procedure",
      "A plant grows a new leaf"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-68",
    "level": "Level 6 - Evidence Detective",
    "prompt": "What does independent flow testing reveal?",
    "options": [
      "A problem with the dining table",
      "Normal delivery everywhere",
      "Actual delivery is low"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-69",
    "level": "Level 6 - Evidence Detective",
    "prompt": "Which observation supports that result?",
    "options": [
      "Stress in the affected plants",
      "Sathya’s uniform colour",
      "The notebook’s age"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-70",
    "level": "Level 6 - Evidence Detective",
    "prompt": "Does a running pump guarantee an unrestricted pipe?",
    "options": [
      "Yes",
      "No",
      "Only at night"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-71",
    "level": "Level 6 - Evidence Detective",
    "prompt": "What should follow identification of the compressed tube?",
    "options": [
      "A celebration without repair",
      "Discarding all plants",
      "A safe, checklist-based repair"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-72",
    "level": "Level 6 - Evidence Detective",
    "prompt": "What verifies the physical repair?",
    "options": [
      "A repeated independent delivery measurement",
      "A new label alone",
      "A guess"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-73",
    "level": "Level 6 - Evidence Detective",
    "prompt": "Why investigate the dashboard after restoring flow?",
    "options": [
      "The physical repair could not work",
      "The display failed to show the restriction correctly",
      "The notebook is full"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-74",
    "level": "Level 6 - Evidence Detective",
    "prompt": "What does “Two labels. One source” describe?",
    "options": [
      "Two independent confirmations",
      "Two different planets",
      "One input displayed twice"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-75",
    "level": "Level 6 - Evidence Detective",
    "prompt": "Which controller is linked to the mapping fault?",
    "options": [
      "The replacement installed during the mission",
      "The classroom lamp",
      "The dining-area controls"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-76",
    "level": "Level 6 - Evidence Detective",
    "prompt": "Which signal was mapped to both displays?",
    "options": [
      "An unrelated radio signal",
      "The upstream signal",
      "The temperature photograph"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-77",
    "level": "Level 6 - Evidence Detective",
    "prompt": "What was not correctly represented?",
    "options": [
      "The crew meal list",
      "The notebook drawing",
      "The independent downstream sensor"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-78",
    "level": "Level 6 - Evidence Detective",
    "prompt": "What helps define when the data problem began?",
    "options": [
      "The replacement installation record",
      "The weather forecast alone",
      "Maya’s childhood age"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-79",
    "level": "Level 6 - Evidence Detective",
    "prompt": "Does finding one error justify discarding unrelated data?",
    "options": [
      "Yes, immediately",
      "No, investigate the error’s scope",
      "Yes, without review"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-80",
    "level": "Level 6 - Evidence Detective",
    "prompt": "What accompanies the corrected mapping?",
    "options": [
      "Removal of every record",
      "A new room decoration",
      "Review, testing, and documentation"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-81",
    "level": "Level 6 - Evidence Detective",
    "prompt": "Why compare corrected readings with an independent instrument?",
    "options": [
      "To verify the result through another source",
      "To make the dashboard look busier",
      "To avoid checking the configuration"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-82",
    "level": "Level 6 - Evidence Detective",
    "prompt": "Which statement best represents good evidence use?",
    "options": [
      "Every number answers every question",
      "Match the evidence to the question",
      "Matching screens never need investigation"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-83",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "A leaf looks different from yesterday. What should Maya do first?",
    "options": [
      "Remove every plant",
      "Change all settings",
      "Observe and record the change"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-84",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "The display disagrees with the plants. What is the best response?",
    "options": [
      "Investigate both sources of information",
      "Ignore the plants",
      "Ignore every instrument forever"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-85",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Several causes could explain plant stress. What should the team do?",
    "options": [
      "Choose one without checking",
      "Narrow the possibilities through checks",
      "Blame the newest crew member"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-86",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Why mark affected trays?",
    "options": [
      "To decorate the greenhouse",
      "To hide the damage",
      "To track where symptoms occur"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-87",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Why compare current and earlier photographs?",
    "options": [
      "To identify changes over time",
      "To replace all measurements",
      "To select a favourite colour"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-88",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Why keep other growing conditions stable during a flow check?",
    "options": [
      "Changes are always forbidden",
      "It helps interpret the result",
      "Plants cannot respond to anything"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-89",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "A full tank and low delivery are found together. What should be checked?",
    "options": [
      "Only the dining table",
      "Only the notebook",
      "The delivery path"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-90",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "A compressed tube is found. What comes before repair?",
    "options": [
      "Safe isolation and checklist review",
      "Pulling it immediately",
      "Increasing every setting"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-91",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Flow improves, but leaves remain drooped. What should Maya do?",
    "options": [
      "Declare the repair impossible",
      "Monitor recovery over time",
      "Expect instant harvesting"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-92",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "The pipe is repaired, but the display problem remains. Is the investigation complete?",
    "options": [
      "Yes, all questions are answered",
      "Yes, records are unnecessary",
      "No, the misleading display still needs investigation"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-93",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Two graphs match exactly. What question should Sathya ask?",
    "options": [
      "Are their sources independent?",
      "Which graph is prettier?",
      "Can one screen be hidden?"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-94",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Both displays lead to one input. What has the team found?",
    "options": [
      "Two independent confirmations",
      "A duplicated data source",
      "Proof that water is absent"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-95",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "What should be corrected?",
    "options": [
      "Maya’s childhood drawing",
      "Every unrelated record",
      "The controller’s channel mapping"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-96",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "What should be checked after correcting the mapping?",
    "options": [
      "The readings against an independent measurement",
      "Only the display brightness",
      "Only the controller casing"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-97",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Historical data may be affected. What should the team identify?",
    "options": [
      "Every astronaut’s favourite food",
      "The affected channels and time interval",
      "A new mission name"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-98",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "A solar alert arrives before optional exterior work. What should Sathya do?",
    "options": [
      "Rush to finish outside",
      "Ignore the alert",
      "Pause preparations and follow procedure"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-99",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Can the crew decide radiation is absent because it is invisible?",
    "options": [
      "No, they need monitoring and procedures",
      "Yes, visibility is the only test",
      "Yes, if the window is clean"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-100",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "A plant study reports a result. What should Maya check before applying it?",
    "options": [
      "Whether its title sounds exciting",
      "What organisms and conditions were studied",
      "Whether its graph is colourful"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-101",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Shelter checks are not complete. Should the crew leave because work is waiting?",
    "options": [
      "Yes, schedules come first",
      "Yes, if one person volunteers",
      "No, follow the required checks"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-102",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Solar generation falls. What information supports the power review?",
    "options": [
      "Current output and storage information",
      "The number of notebooks",
      "The dining-table size"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-103",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Essential and optional tasks compete for power. Which should be postponed first?",
    "options": [
      "Essential crew systems",
      "Optional work",
      "Every monitoring task"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-104",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Crop lighting may be reduced. What must guide the change?",
    "options": [
      "A random timer",
      "A player’s favourite colour",
      "The approved operating plan"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-105",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Panel cleaning might help, but outside conditions are unsafe. What is the better choice?",
    "options": [
      "Wait until conditions and procedures permit it",
      "Go immediately",
      "Send someone without training"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-106",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Why is a possible benefit not enough to approve an action?",
    "options": [
      "Benefits never matter",
      "Risks must also be considered",
      "Only fast decisions count"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-107",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Earth has not replied yet. What should the crew use?",
    "options": [
      "Only guesses",
      "No procedures",
      "Their training, available evidence, and approved plans"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-108",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Maya is tired and Elena is assigned the next watch. What should happen?",
    "options": [
      "A proper handover followed by rest",
      "Maya secretly continues every task",
      "All monitoring stops"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-109",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "Conditions improve after the storm. What comes before restarting postponed work?",
    "options": [
      "A race outside",
      "Required checks and review",
      "Discarding the plan"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-110",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "A crop tray needs further inspection. What should happen?",
    "options": [
      "Serve it immediately",
      "Mix it with cleared food",
      "Follow the inspection process"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-111",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "The harvest is small. What is the most accurate description?",
    "options": [
      "A useful supplement and learning result",
      "Unlimited food forever",
      "Proof that monitoring is unnecessary"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-112",
    "level": "Level 7 - Mission Problem Solver",
    "prompt": "What should guide the next growing cycle?",
    "options": [
      "Only the happiest memory",
      "Records and lessons from the first cycle",
      "Ignoring every loss"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-113",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "How many tokens do all listed activities use together?",
    "options": [
      "12",
      "14",
      "16"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-114",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "How many tokens do essential crew systems, minimum greenhouse operation, and communications use?",
    "options": [
      "12",
      "10",
      "8"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-115",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "A dust event reduces available energy to 12 tokens. How many tokens must be saved from the original plan?",
    "options": [
      "2",
      "4",
      "6"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-116",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "Which change meets that 12-token budget while protecting the required activities?",
    "options": [
      "Add another experiment",
      "Pause communications and keep both optional activities",
      "Pause optional sample analysis and extra crop lighting"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-117",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "With the required 12 tokens allocated, how many remain for optional tasks?",
    "options": [
      "0",
      "2",
      "4"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-118",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "Why should the crew not keep every optional activity running?",
    "options": [
      "Optional activities are always useless",
      "The available budget may not support them",
      "Planning is unnecessary"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-119",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "What is protected when Reyes approves reductions?",
    "options": [
      "Every decorative light",
      "Every postponed experiment",
      "Essential crew systems"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-120",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "What is one reason to prepare a contingency plan early?",
    "options": [
      "The crew can review safe choices before conditions worsen",
      "It prevents every possible fault",
      "It removes the need for measurements"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-121",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "A battery trend is falling faster than expected. What should the team do?",
    "options": [
      "Hide the reading",
      "Reassess measurements and the approved plan",
      "Assume it will correct itself"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-122",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "What does postponing an experiment mean?",
    "options": [
      "Its results are already known",
      "It can never be useful",
      "It waits until conditions allow it"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-123",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "Why keep required root circulation operating?",
    "options": [
      "It is part of the greenhouse’s minimum plan in the story",
      "It decorates the growing tray",
      "It replaces every other plant need"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-124",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "What should determine whether an outside task proceeds?",
    "options": [
      "Who is most impatient",
      "Conditions, risk review, and procedures",
      "Whether the task sounds exciting"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-125",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "A message is sent to Earth. What should the crew expect?",
    "options": [
      "An instant face-to-face conversation",
      "No possibility of any reply",
      "A delay before a reply can return"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-126",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "What makes Maya’s storm update useful?",
    "options": [
      "It reports faults, corrections, operating status, and crew safety",
      "It hides unresolved concerns",
      "It replaces all records"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-127",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "Why is a watch roster useful?",
    "options": [
      "It lets everyone stop working together",
      "It assigns responsibility and supports handovers",
      "It proves equipment cannot fail"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-128",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "What should a handover include?",
    "options": [
      "Only a goodbye",
      "No information",
      "Current conditions and outstanding concerns"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-129",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "Why does Sathya remind Maya that she is “part of the system too”?",
    "options": [
      "Crew wellbeing matters to safe operations",
      "She should become a robot",
      "Her observations no longer matter"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-130",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "Does an improving exterior view automatically approve every outside task?",
    "options": [
      "Yes, immediately",
      "No, checks and authorisation are still needed",
      "Yes, if the camera is clear"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-131",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "What does the crew do while waiting for conditions to improve?",
    "options": [
      "Ignore every trend",
      "Stop sharing information",
      "Monitor, document, and follow the plan"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-132",
    "level": "Level 8 - Power and Storm Decisions",
    "prompt": "Which outcome best represents success during the storm?",
    "options": [
      "Safe crew and controlled operation within the plan",
      "Completing optional work at any cost",
      "Avoiding every handover"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-133",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Which pair represents different kinds of evidence about the greenhouse problem?",
    "options": [
      "Two copies of one graph",
      "Plant symptoms and an independent flow test",
      "Two screenshots of one reading"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-134",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Which question should come before trusting two matching displays as confirmation?",
    "options": [
      "Are the labels large?",
      "Are the screens expensive?",
      "Do the readings come from independent sources?"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-135",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Why is the maintenance timeline important?",
    "options": [
      "It links equipment changes to the affected data period",
      "It replaces all measurements",
      "It guarantees every repair worked"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-136",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Which finding explains low delivery in the story?",
    "options": [
      "The notebook’s colour",
      "The compressed tube",
      "The dining-table position"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-137",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Which finding explains why the dashboard missed the problem?",
    "options": [
      "A shortage of photographs",
      "A change in meal packaging",
      "The duplicated upstream input"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-138",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Are the compressed tube and mapping error the same fault?",
    "options": [
      "No, one affects delivery and the other affects displayed information",
      "Yes, both are only screen colours",
      "Yes, both are food problems"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-139",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Why must both faults be addressed?",
    "options": [
      "To make the repair take longer",
      "Delivery and reliable monitoring both matter",
      "Because no single repair can ever work"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-140",
    "level": "Level 9 - Investigation Leader",
    "prompt": "What is the strongest evidence that the delivery repair helped?",
    "options": [
      "Sathya likes the result",
      "The controller looks newer",
      "Repeated independent delivery readings return to range"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-141",
    "level": "Level 9 - Investigation Leader",
    "prompt": "What is the strongest evidence that the display correction helped?",
    "options": [
      "Correctly mapped readings agree with an independent check",
      "The screen background changes",
      "The old records disappear"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-142",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Why continue observing plants after restoring flow?",
    "options": [
      "Measurements are useless",
      "Recovery and crop condition still need assessment",
      "Plants must recover instantly"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-143",
    "level": "Level 9 - Investigation Leader",
    "prompt": "What should happen if plants remain stressed despite restored delivery?",
    "options": [
      "Ignore them",
      "Declare every instrument wrong",
      "Continue investigating other possible causes"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-144",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Why avoid declaring “all historical data is wrong”?",
    "options": [
      "The error’s scope must be established",
      "Errors must never be discussed",
      "Old data is always correct"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-145",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Which record best identifies when the new configuration entered service?",
    "options": [
      "A childhood photograph",
      "The replacement-controller installation log",
      "The dining menu"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-146",
    "level": "Level 9 - Investigation Leader",
    "prompt": "What should happen to records outside the affected period?",
    "options": [
      "Delete them automatically",
      "Mark them wrong without review",
      "Assess them on their own evidence"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-147",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Why document a corrected fault?",
    "options": [
      "So others can understand the cause, change, and verification",
      "To hide the investigation",
      "To avoid future checks"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-148",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Why is the training-unit warning relevant later?",
    "options": [
      "It proves every controller is faulty",
      "It reminds the crew to question apparent independence",
      "It predicts the exact storm"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-149",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Does remembering an old warning prove the current diagnosis?",
    "options": [
      "Yes, no test is needed",
      "Yes, memories replace measurements",
      "No, it suggests a possibility that needs testing"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-150",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Which statement separates observation from explanation?",
    "options": [
      "“The leaves droop; we still need to determine why.”",
      "“Drooping proves every system has failed.”",
      "“The dashboard is normal, so the leaf cannot droop.”"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-151",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Which statement shows appropriate uncertainty?",
    "options": [
      "“There is only one imaginable cause.”",
      "“The tube could restrict flow; let’s test it.”",
      "“No evidence is needed.”"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-152",
    "level": "Level 9 - Investigation Leader",
    "prompt": "What does testing after an action establish?",
    "options": [
      "That every future problem is solved",
      "That records can stop",
      "Whether the action produced the expected result"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-153",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Which information belongs in a useful fault report?",
    "options": [
      "Observations, affected equipment, action taken, and verification",
      "Only the final celebration",
      "Only who found it first"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-154",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Why is a clearly labelled diagram useful?",
    "options": [
      "It replaces all physical checks",
      "It helps trace resource and data paths",
      "It makes independent checks unnecessary"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-155",
    "level": "Level 9 - Investigation Leader",
    "prompt": "What should the crew do if corrected channels still disagree?",
    "options": [
      "Choose the larger number automatically",
      "Hide one display",
      "Investigate the remaining disagreement"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-156",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Which conclusion fits a successful independent flow test?",
    "options": [
      "Delivery at the tested point meets the expected range",
      "Every plant is completely recovered",
      "No future blockage is possible"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-157",
    "level": "Level 9 - Investigation Leader",
    "prompt": "What does a successful harvest prove about future cycles?",
    "options": [
      "Every future cycle will succeed",
      "It provides experience, not a guarantee",
      "Monitoring can end"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-158",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Why record crop losses as well as successes?",
    "options": [
      "Losses should replace every positive result",
      "Only damaged plants matter",
      "Both help evaluate and improve the growing system"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-159",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Which improvement directly addresses the mapping fault?",
    "options": [
      "Verify channel sources during controller checks",
      "Change the dining furniture",
      "Rename the greenhouse"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-160",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Which improvement directly addresses the tubing restriction?",
    "options": [
      "Stop using observation logs",
      "Review tube routing and bracket clearance",
      "Remove the meal inventory"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-161",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Which improvement supports teamwork during long events?",
    "options": [
      "Let one person work without rest",
      "Avoid sharing concerns",
      "Maintain clear watches and handovers"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-162",
    "level": "Level 9 - Investigation Leader",
    "prompt": "Which sentence best summarises the investigation?",
    "options": [
      "Observe, check, act safely, and verify",
      "Guess, change everything, and stop checking",
      "Trust any repeated number"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-163",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "An optional exterior task is ready, but a solar alert arrives. What is your first choice?",
    "options": [
      "Launch the task quickly",
      "Ignore the alert",
      "Pause preparations and review the procedure"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-164",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "A crew member says, “The danger is invisible, so it cannot be here.” What should you explain?",
    "options": [
      "Monitoring and procedures—not visibility—guide the response",
      "Only visible dangers matter",
      "Windows detect every hazard"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-165",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "A plant study and a personal dosimeter show different kinds of results. What should you do?",
    "options": [
      "Treat them as identical",
      "Use each for the question it actually addresses",
      "Discard both automatically"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-166",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "Solar generation falls while optional science is running. What is your priority?",
    "options": [
      "Finish every experiment",
      "Keep all lights unchanged",
      "Protect essential crew systems and review reductions"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-167",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "Maya reports stressed plants despite normal dashboard readings. How should you respond?",
    "options": [
      "Authorise an evidence-based investigation",
      "Tell her to ignore the plants",
      "Remove all records"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-168",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "The reservoir is full, but roots receive too little water. What should the team investigate?",
    "options": [
      "Only the food cupboard",
      "The delivery route and relevant measurements",
      "The notebook cover"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-169",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "A compressed tube is discovered. What should you require?",
    "options": [
      "An immediate unplanned repair",
      "No further action",
      "Safe isolation, an approved repair, and verification"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-170",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "Flow is restored, but plants still look stressed. What conclusion is appropriate?",
    "options": [
      "Delivery improved, while recovery still needs monitoring",
      "The repair definitely failed",
      "The plants should be harvested immediately"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-171",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "Two displays share an input. What should happen next?",
    "options": [
      "Delete every mission record",
      "Correct the mapping, define affected data, and verify",
      "Hide one screen"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-172",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "An error is discovered in one time interval. What should you avoid?",
    "options": [
      "Reviewing the maintenance log",
      "Checking affected channels",
      "Declaring all unrelated data wrong"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-173",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "Cleaning panels might help, but the excursion is unsafe. What is your decision?",
    "options": [
      "Wait until conditions and procedures permit it",
      "Send the quickest volunteer",
      "Skip the risk review"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-174",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "Earth has not replied. How should the crew continue?",
    "options": [
      "Stop making all decisions",
      "Use training, local evidence, and approved plans",
      "Ignore existing procedures"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-175",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "Maya wants to keep working through another person’s watch. What should you support?",
    "options": [
      "Unlimited work without rest",
      "Ending all greenhouse checks",
      "A clear handover and rest"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-176",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "The storm weakens. What comes before restarting postponed work?",
    "options": [
      "Required checks and authorisation",
      "An immediate race outside",
      "Removing the contingency plan"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-177",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "Some produce is marked “Needs Checking.” What should happen?",
    "options": [
      "Serve it because it looks green",
      "Keep it out of the meal until the process clears it",
      "Mix it with cleared produce"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-178",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "The cleared harvest is small. How should it be presented?",
    "options": [
      "As unlimited food",
      "As proof stored meals are unnecessary",
      "As a supplement and a useful research outcome"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-179",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "What does “the last harvest” mean?",
    "options": [
      "The final harvest of the first growing cycle",
      "The crew’s last available meal",
      "The end of all food research"
    ],
    "correctIndex": 0
  },
  {
    "id": "flappy-q-180",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "Which next-cycle plan best uses the crew’s experience?",
    "options": [
      "Repeat everything without review",
      "Improve routing checks, data verification, and operating plans",
      "Stop documenting failures"
    ],
    "correctIndex": 1
  },
  {
    "id": "flappy-q-181",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "What is the most important measure of a mission decision?",
    "options": [
      "Whether it looks exciting",
      "Whether one person gets credit",
      "Whether it uses evidence and manages consequences safely"
    ],
    "correctIndex": 2
  },
  {
    "id": "flappy-q-182",
    "level": "Level 10 - NOURISH Mission Commander",
    "prompt": "Which message best captures the story’s ending?",
    "options": [
      "Exploration requires science, care, teamwork, and continued learning",
      "One harvest solves every problem",
      "Good explorers never admit uncertainty"
    ],
    "correctIndex": 0
  }
];
