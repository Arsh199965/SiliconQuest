import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  orderBy,
  where,
  arrayUnion,
  increment 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Team, Card, Character } from '@/types';

// Fetch all teams ordered by score (descending)
export async function getTeams(): Promise<Team[]> {
  try {
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, orderBy('score', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Team[];
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
}

// Fetch a single team by ID
export async function getTeamById(teamId: string): Promise<Team | null> {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);
    
    if (teamSnap.exists()) {
      return {
        id: teamSnap.id,
        ...teamSnap.data()
      } as Team;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching team:', error);
    throw error;
  }
}

// Add a character to team's collected characters
export async function addCharacterToTeam(teamId: string, characterId: string): Promise<void> {
  try {
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      cardsCaught: arrayUnion(characterId),
      score: increment(1)
    });
  } catch (error) {
    console.error('Error adding character to team:', error);
    throw error;
  }
}

// Fetch all characters
export async function getCharacters(): Promise<Character[]> {
  try {
    const charactersRef = collection(db, 'characters');
    const snapshot = await getDocs(charactersRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Character[];
  } catch (error) {
    console.error('Error fetching characters:', error);
    throw error;
  }
}

// Fetch all cards
export async function getCards(): Promise<Card[]> {
  try {
    const cardsRef = collection(db, 'cards');
    const snapshot = await getDocs(cardsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Card[];
  } catch (error) {
    console.error('Error fetching cards:', error);
    throw error;
  }
}

// Fetch uncaught cards (isCaught = false)
export async function getUncaughtCards(): Promise<Card[]> {
  try {
    const cardsRef = collection(db, 'cards');
    const q = query(cardsRef, where('isCaught', '==', false));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Card[];
  } catch (error) {
    console.error('Error fetching uncaught cards:', error);
    throw error;
  }
}

// Fetch cards caught by a specific team
export async function getCardsCaughtByTeam(teamId: string): Promise<Card[]> {
  try {
    const cardsRef = collection(db, 'cards');
    const q = query(cardsRef, where('caughtByTeam', '==', teamId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Card[];
  } catch (error) {
    console.error('Error fetching cards caught by team:', error);
    throw error;
  }
}

// Mark a card as caught by a team
export async function markCardAsCaught(cardId: string, teamId: string): Promise<void> {
  try {
    const cardRef = doc(db, 'cards', cardId);
    await updateDoc(cardRef, {
      isCaught: true,
      caughtByTeam: teamId
    });
  } catch (error) {
    console.error('Error marking card as caught:', error);
    throw error;
  }
}
