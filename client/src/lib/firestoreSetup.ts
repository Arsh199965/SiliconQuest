import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Initializes the counter documents in Firestore if they don't exist.
 * This should be called when setting up the admin portal for the first time.
 */
export async function initializeFirestoreCounters() {
  const counters = ['cards', 'teams'];
  
  for (const collectionName of counters) {
    const counterRef = doc(db, 'counters', `${collectionName}Counter`);
    const counterDoc = await getDoc(counterRef);
    
    if (!counterDoc.exists()) {
      await setDoc(counterRef, {
        count: 0
      });
      console.log(`Initialized counter for ${collectionName}`);
    }
  }
}

/**
 * Checks if the counter documents exist in Firestore.
 * @returns An object indicating which counters exist
 */
export async function checkCounters() {
  const counters = ['cards', 'teams'];
  const status: Record<string, boolean> = {};
  
  for (const collectionName of counters) {
    const counterRef = doc(db, 'counters', `${collectionName}Counter`);
    const counterDoc = await getDoc(counterRef);
    status[collectionName] = counterDoc.exists();
  }
  
  return status;
}