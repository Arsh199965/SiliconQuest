export interface Team {
  id: string;
  teamName: string;
  score: number;
  cardsCaught: string[]; // Array of card IDs
}

export interface Card {
  id: string;
  name: string;
  value: number;
  tier?: 'Common' | 'Rare' | 'Legendary';
  image?: string;
  isCaught: boolean;
  caughtByTeam: string | null; // Team ID that caught this card
}

export interface Character {
  id: string;
  name: string;
  tier: 'Common' | 'Rare' | 'Legendary';
  image: string;
  question: string;
  options: string[];
  correctAnswer: number;
}
