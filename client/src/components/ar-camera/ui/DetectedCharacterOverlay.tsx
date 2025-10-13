import { formatCooldownTime } from "@/utils/quizCooldown";
import { getImageSrc, shouldDisplayAsText } from "@/utils/imageUtils";
import { Character, getTierFromValue } from "../types";
import { getTierColor, getTierThemeColor } from "../utils/tierStyles";

interface DetectedCharacterOverlayProps {
  character: Character;
  onCollect: () => void;
  isCaught: boolean;
  cooldownSeconds?: number | null;
}

export const DetectedCharacterOverlay = ({
  character,
  onCollect,
  isCaught,
  cooldownSeconds = null,
}: DetectedCharacterOverlayProps) => {
  const tier = character.tier || getTierFromValue(character.value);
  const themeColor = getTierThemeColor(tier);

  const imageSrc = getImageSrc(character.image);
  const displayAsText = shouldDisplayAsText(character.image);
  const hasContent = imageSrc || displayAsText;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-40">
      <div
        className={`bg-slate-900/95 backdrop-blur-md border-2 border-${themeColor.primary}/70 rounded-3xl p-6 max-w-sm w-full shadow-2xl shadow-${themeColor.glow} animate-scaleIn`}
      >
        <div className="flex flex-col items-center gap-4">
          {hasContent ? (
            <div
              className={`relative w-48 h-64 rounded-2xl overflow-hidden border-2 border-${themeColor.primary}/40 shadow-lg shadow-${themeColor.glow} bg-slate-800/80 flex items-center justify-center`}
            >
              {imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageSrc}
                  alt={character.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = "none";
                    const textSpan = e.currentTarget.nextElementSibling;
                    if (
                      textSpan &&
                      textSpan.classList.contains("fallback-text")
                    ) {
                      textSpan.classList.remove("hidden");
                    }
                  }}
                />
              ) : null}
              {displayAsText && (
                <span
                  className={`text-6xl ${
                    imageSrc ? "hidden fallback-text" : ""
                  }`}
                  aria-hidden="true"
                >
                  {character.image?.trim()}
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
            <div
              className={`relative w-48 h-64 rounded-2xl border-2 border-dashed border-${themeColor.primary}/40 bg-slate-800/60 flex items-center justify-center text-${themeColor.primary} text-sm text-center px-6`}
            >
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
            <h3
              className={`text-2xl font-extrabold text-${themeColor.primary} drop-shadow mb-2`}
            >
              {character.name}
            </h3>
            <p className={`text-${themeColor.primary} text-sm`}>
              {isCaught
                ? "Already caught!"
                : cooldownSeconds && cooldownSeconds > 0
                ? "On cooldown"
                : "Character detected!"}
            </p>
            {isCaught && character.caughtByTeam && (
              <p className="text-slate-400 text-xs mt-1">
                Caught by: {character.caughtByTeam}
              </p>
            )}
            {!isCaught && cooldownSeconds && cooldownSeconds > 0 && (
              <p className="text-amber-400 text-sm font-bold mt-2 animate-pulse">
                Wait {formatCooldownTime(cooldownSeconds)}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onCollect}
          disabled={
            isCaught || (cooldownSeconds !== null && cooldownSeconds > 0)
          }
          className={`mt-6 w-full py-3 font-bold rounded-xl transition-all duration-300 ${
            isCaught || (cooldownSeconds !== null && cooldownSeconds > 0)
              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
              : `bg-gradient-to-r from-${themeColor.primary} to-${themeColor.secondary} hover:from-${themeColor.primary} hover:to-${themeColor.secondary} text-white transform hover:scale-105`
          }`}
        >
          {isCaught
            ? "Already Caught"
            : cooldownSeconds && cooldownSeconds > 0
            ? `Cooldown: ${formatCooldownTime(cooldownSeconds)}`
            : "Collect Character"}
        </button>
      </div>
    </div>
  );
};
