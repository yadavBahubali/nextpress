export interface RoomConfig {
  id: string;
  title: string;
  description: string;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number]; // [width, height, length]
  cameraPosition: [number, number, number];
  lookAt: [number, number, number];
  ifpSize: string;
  useCase: string;
  color: string;
}

export const officeConfig: RoomConfig[] = [
  {
    id: "lobby",
    title: "Welcome Lobby",
    description: "Experience the first impression with digital signage and corporate branding.",
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    size: [12, 4, 10],
    cameraPosition: [0, 2, 8],
    lookAt: [0, 1.5, 0],
    ifpSize: "65\"",
    useCase: "Digital Signage & Branding",
    color: "#1e293b"
  },
  {
    id: "meeting-room",
    title: "Meeting Room",
    description: "Standard huddle space optimized for hybrid collaboration.",
    position: [-16, 0, 15],
    rotation: [0, 0, 0],
    size: [10, 4, 10],
    cameraPosition: [-16, 2, 23],
    lookAt: [-16, 1.5, 15],
    ifpSize: "75\"",
    useCase: "Video Conferencing",
    color: "#2563eb"
  },
  {
    id: "board-room",
    title: "Executive Board Room",
    description: "Premium boardroom designed for high-stakes executive presentations.",
    position: [16, 0, 15],
    rotation: [0, 0, 0],
    size: [14, 4, 10],
    cameraPosition: [16, 2, 23],
    lookAt: [16, 1.5, 15],
    ifpSize: "98\"",
    useCase: "Executive Analytics",
    color: "#1e3a8a"
  },
  {
    id: "training-room",
    title: "Training Center",
    description: "Flexible education space featuring multi-user interactive teaching.",
    position: [-16, 0, 30],
    rotation: [0, 0, 0],
    size: [10, 4, 10],
    cameraPosition: [-16, 2, 38],
    lookAt: [-16, 1.5, 30],
    ifpSize: "86\"",
    useCase: "Education & Workshops",
    color: "#0f172a"
  },
  {
    id: "collaboration-hub",
    title: "Collaboration Hub",
    description: "Agile workspace designed for team brainstorming and ideation.",
    position: [16, 0, 30],
    rotation: [0, 0, 0],
    size: [10, 4, 10],
    cameraPosition: [16, 2, 38],
    lookAt: [16, 1.5, 30],
    ifpSize: "75\"",
    useCase: "Brainstorming",
    color: "#334155"
  }
];
