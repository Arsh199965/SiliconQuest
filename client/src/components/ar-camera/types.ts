export interface Character {
  id: string;
  name: string;
  image: string;
  tier?: "Common" | "Rare" | "Legendary"; // Optional - calculated from value
  question: string;
  options: string[];
  correctAnswer: number;
  value: number;
  isCaught: boolean;
  caughtByTeam: string;
  mindFile: string; // Just filename (e.g., "mewtwo.mind"), path prepended automatically
  modelUrl?: string;
}

// Helper to calculate tier from value
export const getTierFromValue = (value: number): "Common" | "Rare" | "Legendary" => {
  if (value >= 50) return "Legendary";
  if (value >= 20) return "Rare";
  return "Common";
};

export interface ARCameraProps {
  teamName: string;
  teamId: string;
  onClose: () => void;
  onCharacterCollected: (
    character: Pick<Character, "id" | "name" | "image" | "value"> & { tier?: "Common" | "Rare" | "Legendary" }
  ) => void;
}

export type ScriptResource = {
  src: string;
  fallbacks?: string[];
  optional?: boolean;
  key?: "animation-mixer" | string;
};

export type MindARSceneElement = HTMLElement & {
  components?: Record<string, { stop?: () => void }>;
};
