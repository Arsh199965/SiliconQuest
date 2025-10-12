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

  const rawImage = character.image?.trim();
  const isLikelyImageAsset =
    !!rawImage &&
    (rawImage.startsWith("http") ||
      rawImage.startsWith("/") ||
      /\.(png|jpe?g|gif|webp|svg)$/i.test(rawImage));
  const imageSrc =
    isLikelyImageAsset &&
    rawImage &&
    !rawImage.startsWith("http") &&
    !rawImage.startsWith("/")
      ? `/cards/${rawImage}`
      : rawImage;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-40">
      <div className="bg-slate-900/95 backdrop-blur-md border-2 border-purple-500/70 rounded-3xl p-6 max-w-sm w-full shadow-2xl shadow-purple-500/40 animate-scaleIn">
        <div className="flex flex-col items-center gap-4">
          {rawImage ? (
            <div className="relative w-48 h-64 rounded-2xl overflow-hidden border-2 border-purple-500/40 shadow-lg shadow-purple-500/30 bg-slate-800/80 flex items-center justify-center">
              {isLikelyImageAsset ? (
                <img
                  src={imageSrc}
                  alt={character.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <span className="text-6xl" aria-hidden="true">
                  {rawImage}
                </span>
              )}
              <span
                className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r ${getTierColor(
                  tier
                )} text-white text-xs font-bold shadow-lg`}
              >
                {tier}
              </span>
            </div>
          ) : (
            <div className="relative w-48 h-64 rounded-2xl border-2 border-dashed border-purple-500/40 bg-slate-800/60 flex items-center justify-center text-purple-300 text-sm text-center px-6">
              Card art coming soon
              <span
                className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r ${getTierColor(
                  tier
                )} text-white text-xs font-bold shadow-lg`}
              >
                {tier}
              </span>
            </div>
          )}

          <div className="text-center">
            <h3 className="text-2xl font-extrabold text-purple-200 drop-shadow mb-2">
              {character.name}
            </h3>
            <p className="text-purple-300 text-sm">
              {isCaught ? "Already caught!" : "Character detected!"}
            </p>
            {isCaught && character.caughtByTeam && (
              <p className="text-slate-400 text-xs mt-1">
                Caught by: {character.caughtByTeam}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onCollect}
          disabled={isCaught}
          className={`mt-6 w-full py-3 font-bold rounded-xl transition-all duration-300 ${
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
