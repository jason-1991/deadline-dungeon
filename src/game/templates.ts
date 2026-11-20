export interface TaskTemplate {
  title: string;
  estimateHours: number;
}

export interface RoomTemplate {
  title: string;
  tasks: TaskTemplate[];
}

export interface DungeonTemplate {
  id: string;
  name: string;
  blurb: string;
  rooms: RoomTemplate[];
}

export const TEMPLATES: DungeonTemplate[] = [
  {
    id: "hackathon-48h",
    name: "Hackathon 48h",
    blurb: "Race from blank repo to live demo in one weekend.",
    rooms: [
      {
        title: "Idea & Setup",
        tasks: [
          { title: "Project setup", estimateHours: 1 },
          { title: "Core feature", estimateHours: 4 },
        ],
      },
      {
        title: "Build",
        tasks: [
          { title: "Main flow", estimateHours: 6 },
          { title: "Polish & art", estimateHours: 2 },
        ],
      },
      {
        title: "Ship",
        tasks: [
          { title: "Demo prep", estimateHours: 1.5 },
          { title: "Submit", estimateHours: 0.5 },
        ],
      },
    ],
  },
  {
    id: "course-project",
    name: "Course Project",
    blurb: "Conquer every milestone from brief to final submission.",
    rooms: [
      {
        title: "Research",
        tasks: [
          { title: "Read brief", estimateHours: 1 },
          { title: "Outline", estimateHours: 2 },
        ],
      },
      {
        title: "Draft",
        tasks: [
          { title: "First draft", estimateHours: 5 },
          { title: "Figures & data", estimateHours: 2 },
        ],
      },
      {
        title: "Revise & Submit",
        tasks: [
          { title: "Revision", estimateHours: 3 },
          { title: "Final check", estimateHours: 0.5 },
        ],
      },
    ],
  },
];
