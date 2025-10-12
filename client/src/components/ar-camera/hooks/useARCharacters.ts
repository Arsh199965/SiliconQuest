import { useEffect, useState } from "react";

import { getARCharacters } from "@/services/firestore";
import { Character } from "../types";

interface UseARCharactersResult {
  characters: Character[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const validateCharacter = (char: any): char is Character => {
  const requiredFields = [
    'id', 'name', 'image', 'question', 'options', 
    'correctAnswer', 'value', 'isCaught', 'caughtByTeam', 
    'mindFile'
  ];
  
  const missingFields = requiredFields.filter(field => !(field in char));
  
  if (missingFields.length > 0) {
    console.warn(
      `Character ${char.name || char.id} is missing required fields:`, 
      missingFields.join(', ')
    );
    return false;
  }
  
  return true;
};

export const useARCharacters = (): UseARCharactersResult => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getARCharacters();
      
      // Filter out invalid characters
      const validCharacters = data.filter(validateCharacter);
      
      if (validCharacters.length === 0 && data.length > 0) {
        setError(
          "No valid AR characters found. Please check Firestore schema. " +
          "See FIRESTORE_SCHEMA.md for required fields."
        );
      } else if (validCharacters.length < data.length) {
        console.warn(
          `${data.length - validCharacters.length} character(s) skipped due to missing fields`
        );
      }
      
      setCharacters(validCharacters);
    } catch (err) {
      console.error("Error fetching AR characters:", err);
      setError("Failed to load characters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  return {
    characters,
    loading,
    error,
    refetch: fetchCharacters,
  };
};
