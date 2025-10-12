import { Character, getTierFromValue } from "../types";
import { getTierColor } from "../utils/tierStyles";

interface DetectedCharacterOverlayProps {
  character: Character;
  onCollect: () => void;
  isCaught: boolean;
}

export const DetectedCharacterOverlay = ({
  character,
  onCollect,
  isCaught,
}: DetectedCharacterOverlayProps) => {
  const tier = character.tier || getTierFromValue(character.value);

  console.log("🎨 DetectedCharacterOverlay rendering:", {
    name: character.name,
    tier,
    isCaught,
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
      <div className="bg-slate-900/90 backdrop-blur-sm border-2 border-purple-500 rounded-3xl p-6 max-w-sm w-full shadow-2xl shadow-purple-500/50 pointer-events-auto">
        <div className="text-center mb-4">
          <div className="text-6xl mb-3">{character.image}</div>
          <h3 className="text-2xl font-bold text-purple-300 mb-2">
            {character.name}
          </h3>
          <div
            className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${getTierColor(
              tier
            )} text-white text-sm font-bold mb-4`}
          >
            {tier}
          </div>
          <p className="text-purple-400 text-sm">
            {isCaught ? "Already caught!" : "Character detected!"}
          </p>
          {isCaught && character.caughtByTeam && (
            <p className="text-slate-400 text-xs mt-1">
              Caught by: {character.caughtByTeam}
            </p>
          )}
        </div>
        <button
          onClick={onCollect}
          disabled={isCaught}
          className={`w-full py-3 font-bold rounded-xl transition-all duration-300 ${
            isCaught
              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105"
          }`}
        >
          {isCaught ? "Already Caught" : "Collect Character"}
        </button>
      </div>
    </div>
  );
};
