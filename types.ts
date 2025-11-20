
export interface Position {
  x: number;
  y: number;
}

export interface PaperCard {
  id: string;
  text: string;
  position: Position; // Current position (starts at typewriter, moves to target)
  targetPosition: Position; // Where it will fly to after typing
  rotation: number;
  createdAt: number;
  isTyping: boolean; // To trigger the initial typing animation
  imageUrl?: string; // The base64 data URL of the generated retro image
  isGeneratingImage?: boolean; // Loading state for image generation
}

export enum TypingSpeed {
  SLOW = 100,
  MEDIUM = 50,
  FAST = 20,
}
