import { Character, getTierFromValue } from "../types";
import { getTierBorder, getTierColor } from "../utils/tierStyles";

interface QuizModalProps {
  character: Character;
  selectedAnswer: number | null;
  quizResult: "correct" | "incorrect" | null;
  onAnswerSelect: (index: number) => void;
  onSubmit: () => void;
}

export const QuizModal = ({
  character,
  selectedAnswer,
  quizResult,
  onAnswerSelect,
  onSubmit,
}: QuizModalProps) => {
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
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto z-50">
      <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md border-2 border-purple-500/50 rounded-3xl p-6 max-w-lg w-full shadow-2xl shadow-purple-500/30 animate-scaleIn my-auto max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6">
          Let&apos;s start hunting
        </h2>

        <div
          className={`border-3 ${getTierBorder(
            tier
          )} rounded-2xl p-6 mb-6 bg-slate-800/60 shadow-xl`}
        >
          <div className="flex items-center justify-center mb-4">
            {rawImage ? (
              <div className="relative w-28 h-36 rounded-2xl overflow-hidden border-2 border-purple-500/40 shadow-lg shadow-purple-500/30 bg-slate-800/80 flex items-center justify-center">
                {isLikelyImageAsset ? (
                  <img
                    src={imageSrc}
                    alt={character.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <span className="text-5xl" aria-hidden="true">
                    {rawImage}
                  </span>
                )}
                <div
                  className={`absolute -top-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r ${getTierColor(
                    tier
                  )} text-white text-xs font-bold shadow-md`}
                >
                  {tier}
                </div>
              </div>
            ) : (
              <div className="relative w-28 h-36 rounded-2xl border-2 border-dashed border-purple-500/40 bg-slate-800/60 flex items-center justify-center text-purple-300 text-xs text-center px-4">
                Card art coming soon
                <div
                  className={`absolute -top-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r ${getTierColor(
                    tier
                  )} text-white text-xs font-bold shadow-md`}
                >
                  {tier}
                </div>
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold text-purple-300 mb-4 text-center">
            {character.question}
          </h3>

          <div className="space-y-3">
            {character.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = quizResult === "correct" && isSelected;
              const isIncorrect = quizResult === "incorrect" && isSelected;

              return (
                <button
                  key={index}
                  onClick={() => onAnswerSelect(index)}
                  disabled={quizResult !== null}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-300 ${
                    isSelected
                      ? isCorrect
                        ? "bg-green-600/30 border-green-500 text-green-300"
                        : isIncorrect
                        ? "bg-red-600/30 border-red-500 text-red-300"
                        : "bg-purple-600/30 border-purple-500 text-purple-300"
                      : "bg-slate-700/30 border-slate-600 text-slate-300 hover:border-purple-500/50 hover:bg-slate-700/50"
                  } ${
                    quizResult !== null
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <span className="font-medium">
                    {index + 1}. {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={selectedAnswer === null || quizResult !== null}
          className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
            selectedAnswer === null || quizResult !== null
              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105"
          }`}
        >
          {quizResult === "correct"
            ? "✓ Correct! Collecting..."
            : quizResult === "incorrect"
            ? "✗ Try Again"
            : "Submit"}
        </button>

        {quizResult === "incorrect" && (
          <p className="text-red-400 text-center text-sm mt-3 animate-shake">
            Incorrect answer. Please try again!
          </p>
        )}
      </div>
    </div>
  );
};
