"use client";

import { useEffect, useRef, useState } from "react";

interface Character {
  id: number;
  name: string;
  image: string;
  tier: "Common" | "Rare" | "Legendary";
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ARCameraProps {
  teamName: string;
  onClose: () => void;
  onCharacterCollected: (
    character: Omit<Character, "question" | "options" | "correctAnswer">
  ) => void;
}

// Mock characters with tiers and quiz questions
const mockCharacters: Character[] = [
  {
    id: 1,
    name: "Naruto Uzumaki",
    image: "🦊",
    tier: "Legendary",
    question: "What does DSA stand for?",
    options: [
      "Data Science and Analysis",
      "Data Structures and Analysis",
      "Data Structures and Algorithms",
      "Data Synthesis and Analysis",
    ],
    correctAnswer: 2,
  },
  {
    id: 2,
    name: "Goku",
    image: "💪",
    tier: "Legendary",
    question: "Which sorting algorithm has O(n log n) average time complexity?",
    options: ["Bubble Sort", "Merge Sort", "Selection Sort", "Insertion Sort"],
    correctAnswer: 1,
  },
  {
    id: 3,
    name: "Eren Yeager",
    image: "⚔️",
    tier: "Rare",
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
    correctAnswer: 2,
  },
  {
    id: 4,
    name: "Tanjiro",
    image: "🌊",
    tier: "Rare",
    question: "Which data structure uses LIFO principle?",
    options: ["Queue", "Stack", "Tree", "Graph"],
    correctAnswer: 1,
  },
  {
    id: 5,
    name: "Deku",
    image: "💚",
    tier: "Common",
    question: "What is a linked list?",
    options: [
      "A sequential data structure",
      "A tree-based structure",
      "A hash-based structure",
      "A graph structure",
    ],
    correctAnswer: 0,
  },
];

export default function ARCamera({
  teamName,
  onClose,
  onCharacterCollected,
}: ARCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [detectedCharacter, setDetectedCharacter] = useState<Character | null>(
    null
  );
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [useMockCamera, setUseMockCamera] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Ensure component only runs camera logic on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Draw mock camera feed on canvas
  useEffect(() => {
    if (!useMockCamera || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create animated background
    let frame = 0;
    const animate = () => {
      // Create gradient background
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, `hsl(${frame % 360}, 50%, 20%)`);
      gradient.addColorStop(1, `hsl(${(frame + 180) % 360}, 50%, 30%)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add some "scan lines" effect
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.height; i += 4) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Add text
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.font = "16px monospace";
      ctx.textAlign = "center";
      ctx.fillText("MOCK CAMERA FEED", canvas.width / 2, canvas.height / 2);
      ctx.fillText(
        "(Camera blocked - using simulation)",
        canvas.width / 2,
        canvas.height / 2 + 25
      );

      frame++;
      if (useMockCamera) {
        requestAnimationFrame(animate);
      }
    };

    animate();
    setIsCameraReady(true);
  }, [useMockCamera]);

  useEffect(() => {
    if (!isMounted) return;

    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        console.log("Starting camera...");
        console.log("Navigator:", typeof navigator);
        console.log("MediaDevices:", typeof navigator?.mediaDevices);
        console.log(
          "getUserMedia:",
          typeof navigator?.mediaDevices?.getUserMedia
        );

        // Check if mediaDevices is supported
        if (
          !navigator ||
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          console.error(
            "Camera API not available - likely non-secure context (HTTP instead of HTTPS)"
          );
          console.log("Switching to mock camera feed...");
          setUseMockCamera(true);
          setCameraError(null); // Clear error since we're using mock
          return;
        }

        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Use back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        console.log("Camera stream obtained:", stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error("Camera access error:", err);
        console.log("Switching to mock camera feed...");
        setUseMockCamera(true);
        setCameraError(null); // Clear error since we're using mock
      }
    };

    startCamera();

    // Mock: Simulate character detection after 3 seconds
    const timer = setTimeout(() => {
      const randomChar =
        mockCharacters[Math.floor(Math.random() * mockCharacters.length)];
      setDetectedCharacter(randomChar);
    }, 3000);

    return () => {
      clearTimeout(timer);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isMounted]);

  const handleCollectClick = () => {
    setShowQuiz(true);
  };

  const handleAnswerSelect = (index: number) => {
    if (quizResult === null) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmitQuiz = () => {
    if (selectedAnswer === null || !detectedCharacter) return;

    if (selectedAnswer === detectedCharacter.correctAnswer) {
      setQuizResult("correct");
      setTimeout(() => {
        onCharacterCollected({
          id: detectedCharacter.id,
          name: detectedCharacter.name,
          image: detectedCharacter.image,
          tier: detectedCharacter.tier,
        });
        setShowQuiz(false);
        setDetectedCharacter(null);
        setSelectedAnswer(null);
        setQuizResult(null);

        // Mock: Detect another character after 3 seconds
        setTimeout(() => {
          const randomChar =
            mockCharacters[Math.floor(Math.random() * mockCharacters.length)];
          setDetectedCharacter(randomChar);
        }, 3000);
      }, 1500);
    } else {
      setQuizResult("incorrect");
      setTimeout(() => {
        setQuizResult(null);
        setSelectedAnswer(null);
      }, 1500);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Legendary":
        return "from-amber-400 to-orange-500";
      case "Rare":
        return "from-purple-400 to-pink-500";
      case "Common":
        return "from-slate-400 to-slate-500";
      default:
        return "from-slate-400 to-slate-500";
    }
  };

  const getTierBorder = (tier: string) => {
    switch (tier) {
      case "Legendary":
        return "border-amber-400 shadow-amber-500/50";
      case "Rare":
        return "border-purple-400 shadow-purple-500/50";
      case "Common":
        return "border-slate-400 shadow-slate-500/50";
      default:
        return "border-slate-400 shadow-slate-500/50";
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Camera View */}
      <div className="relative flex-1 overflow-hidden">
        {cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center p-6">
              <p className="text-red-400 mb-4">{cameraError}</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Real camera video */}
            {!useMockCamera && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* Mock camera canvas */}
            {useMockCamera && (
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-purple-300">Starting camera...</p>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-white font-bold text-lg">Hunt is On!!</h2>
                  <p className="text-purple-300 text-sm">Team: {teamName}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* AR Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full">
                {/* Corner markers for AR view */}
                <line
                  x1="20"
                  y1="20"
                  x2="60"
                  y2="20"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                />
                <line
                  x1="20"
                  y1="20"
                  x2="20"
                  y2="60"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                />
                <line
                  x1="calc(100% - 20)"
                  y1="20"
                  x2="calc(100% - 60)"
                  y2="20"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                />
                <line
                  x1="calc(100% - 20)"
                  y1="20"
                  x2="calc(100% - 20)"
                  y2="60"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                />
                <line
                  x1="20"
                  y1="calc(100% - 20)"
                  x2="60"
                  y2="calc(100% - 20)"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                />
                <line
                  x1="20"
                  y1="calc(100% - 20)"
                  x2="20"
                  y2="calc(100% - 60)"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                />
                <line
                  x1="calc(100% - 20)"
                  y1="calc(100% - 20)"
                  x2="calc(100% - 60)"
                  y2="calc(100% - 20)"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                />
                <line
                  x1="calc(100% - 20)"
                  y1="calc(100% - 20)"
                  x2="calc(100% - 20)"
                  y2="calc(100% - 60)"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                />
              </svg>
            </div>

            {/* Scanning indicator */}
            {!detectedCharacter && isCameraReady && (
              <div className="absolute bottom-24 left-0 right-0 text-center animate-pulse">
                <p className="text-purple-300 text-sm font-medium">
                  Point your camera at a character poster
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Scanning for characters...
                </p>
              </div>
            )}

            {/* Character Detection Overlay */}
            {detectedCharacter && !showQuiz && (
              <div className="absolute inset-0 flex items-center justify-center p-4 z-40">
                <div className="bg-slate-900/90 backdrop-blur-sm border-2 border-purple-500 rounded-3xl p-6 max-w-sm w-full shadow-2xl shadow-purple-500/50 animate-scaleIn">
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-3">
                      {detectedCharacter.image}
                    </div>
                    <h3 className="text-2xl font-bold text-purple-300 mb-2">
                      {detectedCharacter.name}
                    </h3>
                    <div
                      className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${getTierColor(
                        detectedCharacter.tier
                      )} text-white text-sm font-bold mb-4`}
                    >
                      {detectedCharacter.tier}
                    </div>
                    <p className="text-purple-400 text-sm">
                      Character detected!
                    </p>
                  </div>
                  <button
                    onClick={handleCollectClick}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Collect Character
                  </button>
                </div>
              </div>
            )}

            {/* Quiz Overlay */}
            {showQuiz && detectedCharacter && (
              <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto z-50">
                <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md border-2 border-purple-500/50 rounded-3xl p-6 max-w-lg w-full shadow-2xl shadow-purple-500/30 animate-scaleIn my-auto max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6">
                    Let&apos;s start hunting
                  </h2>

                  <div
                    className={`border-3 ${getTierBorder(
                      detectedCharacter.tier
                    )} rounded-2xl p-6 mb-6 bg-slate-800/50 shadow-xl`}
                  >
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center border-2 border-purple-500/30">
                          <span className="text-5xl">
                            {detectedCharacter.image}
                          </span>
                        </div>
                        <div
                          className={`absolute -top-2 -right-2 px-2 py-1 rounded-full bg-gradient-to-r ${getTierColor(
                            detectedCharacter.tier
                          )} text-white text-xs font-bold`}
                        >
                          {detectedCharacter.tier}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-purple-300 mb-4 text-center">
                      {detectedCharacter.question}
                    </h3>

                    <div className="space-y-3">
                      {detectedCharacter.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          disabled={quizResult !== null}
                          className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-300 ${
                            selectedAnswer === index
                              ? quizResult === "correct"
                                ? "bg-green-600/30 border-green-500 text-green-300"
                                : quizResult === "incorrect"
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
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitQuiz}
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
