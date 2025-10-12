"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { catchCharacter } from "@/services/firestore";
import { useARCharacters } from "./ar-camera/hooks/useARCharacters";
import { useMindARInlineStyles } from "./ar-camera/hooks/useMindARInlineStyles";
import { useMindARScripts } from "./ar-camera/hooks/useMindARScripts";
import { useSceneLifecycle } from "./ar-camera/hooks/useSceneLifecycle";
import { ARErrorOverlay } from "./ar-camera/ui/ARErrorOverlay";
import { DetectedCharacterOverlay } from "./ar-camera/ui/DetectedCharacterOverlay";
import { FrameOverlay } from "./ar-camera/ui/FrameOverlay";
import { HeaderOverlay } from "./ar-camera/ui/HeaderOverlay";
import { LoadingOverlay } from "./ar-camera/ui/LoadingOverlay";
import { MindARScene } from "./ar-camera/ui/MindARScene";
import { QuizModal } from "./ar-camera/ui/QuizModal";
import { ScanHint } from "./ar-camera/ui/ScanHint";
import {
  ARCameraProps,
  Character,
  getTierFromValue,
  MindARSceneElement,
} from "./ar-camera/types";

export default function ARCamera({
  teamName,
  teamId,
  onClose,
  onCharacterCollected,
}: ARCameraProps) {
  const {
    characters,
    loading: loadingCharacters,
    error: charactersError,
    refetch,
  } = useARCharacters();
  const sceneRef = useRef<MindARSceneElement | null>(null);
  const targetRefs = useRef<Record<string, Element | null>>({});
  const targetListenersRef = useRef<
    Record<
      string,
      {
        onFound: () => void;
        onLost: () => void;
      }
    >
  >({});
  const charactersRef = useRef<Character[]>([]);
  const [detectedCharacter, setDetectedCharacter] = useState<Character | null>(
    null
  );
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [isCatching, setIsCatching] = useState(false);
  const [activeMindFile, setActiveMindFile] = useState<string | null>(null);
  const showQuizRef = useRef(false);
  const activeTargetRef = useRef<string | null>(null);

  const { scriptsLoaded, animationMixerAvailable, arError, setARError } =
    useMindARScripts();

  useMindARInlineStyles(scriptsLoaded);

  // Show error if characters failed to load or have missing fields
  useEffect(() => {
    if (charactersError) {
      setARError(charactersError);
    } else if (!loadingCharacters && characters.length === 0) {
      setARError(
        "No AR characters configured. Please add required fields to Firestore documents. " +
          "See FIRESTORE_SCHEMA.md for details."
      );
    }
  }, [charactersError, loadingCharacters, characters, setARError]);

  useEffect(() => {
    showQuizRef.current = showQuiz;
  }, [showQuiz]);

  useEffect(() => {
    charactersRef.current = characters;
  }, [characters]);

  const mindFileGroups = useMemo(() => {
    const map = new Map<string, Character[]>();
    characters.forEach((character) => {
      if (!map.has(character.mindFile)) {
        map.set(character.mindFile, []);
      }
      map.get(character.mindFile)?.push(character);
    });
    return Array.from(map.entries()).map(([mindFile, list]) => ({
      mindFile,
      characters: list,
      label:
        list
          .map((character) => character.name)
          .filter(Boolean)
          .join(", ") || mindFile,
    }));
  }, [characters]);

  useEffect(() => {
    if (mindFileGroups.length === 0) {
      setActiveMindFile(null);
      return;
    }

    if (!activeMindFile || !mindFileGroups.some(({ mindFile }) => mindFile === activeMindFile)) {
      setActiveMindFile(mindFileGroups[0].mindFile);
    }
  }, [mindFileGroups, activeMindFile]);

  const stopMindAR = useCallback(() => {
    const sceneEl = sceneRef.current;
    if (!sceneEl) return;

    try {
      const mindarComponent = sceneEl.components?.["mindar-image-system"];
      if (mindarComponent && typeof mindarComponent.stop === "function") {
        mindarComponent.stop();
      }
    } catch (error) {
      console.warn("MindAR stop error", error);
    }
  }, []);

  useEffect(() => stopMindAR, [stopMindAR]);

  useEffect(() => {
    activeTargetRef.current = null;
    setDetectedCharacter(null);
    setShowQuiz(false);
    setSelectedAnswer(null);
    setQuizResult(null);
    if (activeMindFile) {
      stopMindAR();
    }
  }, [activeMindFile, stopMindAR]);

  const handleSceneReady = useCallback(() => {
    setIsSceneReady(true);
    setARError(null);
  }, [setARError]);

  const handleSceneError = useCallback(
    (message: string) => {
      setARError(message);
    },
    [setARError]
  );

  useSceneLifecycle(
    sceneRef,
    scriptsLoaded,
    handleSceneReady,
    handleSceneError
  );

  const registerTargetRef = useCallback((id: string) => {
    return (el: Element | null) => {
      const existingListeners = targetListenersRef.current[id];
      const existingElement = targetRefs.current[id];

      if (existingListeners && existingElement) {
        existingElement.removeEventListener("targetFound", existingListeners.onFound);
        existingElement.removeEventListener("targetLost", existingListeners.onLost);
        delete targetListenersRef.current[id];
      }

      if (el) {
        targetRefs.current[id] = el;

        const onFound = () => {
          const character = charactersRef.current.find((c) => c.id === id);
          if (!character) return;

          activeTargetRef.current = character.id;
          setDetectedCharacter(character);
          setShowQuiz(false);
          setSelectedAnswer(null);
          setQuizResult(null);
        };

        const onLost = () => {
          if (activeTargetRef.current === id && !showQuizRef.current) {
            activeTargetRef.current = null;
            setDetectedCharacter((current) =>
              current?.id === id ? null : current
            );
          }
        };

        el.addEventListener("targetFound", onFound);
        el.addEventListener("targetLost", onLost);
        targetListenersRef.current[id] = { onFound, onLost };
      } else {
        delete targetRefs.current[id];
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.entries(targetListenersRef.current).forEach(([id, listeners]) => {
        const element = targetRefs.current[id];
        if (element) {
          element.removeEventListener("targetFound", listeners.onFound);
          element.removeEventListener("targetLost", listeners.onLost);
        }
      });
      targetListenersRef.current = {};
      targetRefs.current = {};
    };
  }, []);

  const handleCollectClick = () => {
    if (detectedCharacter?.isCaught) return;
    setShowQuiz(true);
  };

  const handleAnswerSelect = (index: number) => {
    if (quizResult === null) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmitQuiz = async () => {
    if (selectedAnswer === null || !detectedCharacter || isCatching) return;

    if (selectedAnswer === detectedCharacter.correctAnswer) {
      setQuizResult("correct");
      setIsCatching(true);

      try {
        // Update Firestore: mark character as caught and update team
        await catchCharacter(
          detectedCharacter.id,
          teamId,
          detectedCharacter.value
        );

        // Notify parent component
        setTimeout(() => {
          onCharacterCollected({
            id: detectedCharacter.id,
            name: detectedCharacter.name,
            image: detectedCharacter.image,
            tier:
              detectedCharacter.tier ||
              getTierFromValue(detectedCharacter.value),
            value: detectedCharacter.value,
          });

          // Refresh character list to reflect caught status
          refetch();

          activeTargetRef.current = null;
          setShowQuiz(false);
          setDetectedCharacter(null);
          setSelectedAnswer(null);
          setQuizResult(null);
          setIsCatching(false);
        }, 1200);
      } catch (error) {
        console.error("Error catching character:", error);
        setQuizResult(null);
        setIsCatching(false);
        setARError("Failed to catch character. Please try again.");
      }
    } else {
      setQuizResult("incorrect");
      setTimeout(() => {
        setQuizResult(null);
        setSelectedAnswer(null);
      }, 1500);
    }
  };

  const handleClose = useCallback(() => {
    stopMindAR();
    activeTargetRef.current = null;
    setDetectedCharacter(null);
    setShowQuiz(false);
    setSelectedAnswer(null);
    setQuizResult(null);
    onClose();
  }, [onClose, stopMindAR]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        {(!scriptsLoaded || loadingCharacters) && !arError && (
          <LoadingOverlay />
        )}

        {arError && <ARErrorOverlay message={arError} onClose={handleClose} />}

        {scriptsLoaded &&
          !arError &&
          !loadingCharacters &&
          characters.length > 0 && (
            <div className="absolute inset-0">
              <MindARScene
                key={activeMindFile ?? "default"}
                sceneRef={sceneRef}
                characters={characters}
                animationMixerAvailable={animationMixerAvailable}
                registerTargetRef={registerTargetRef}
                activeMindFile={activeMindFile}
              />
            </div>
          )}

        <HeaderOverlay
          teamName={teamName}
          onClose={handleClose}
          mindFiles={mindFileGroups.map(({ mindFile, label }) => ({
            value: mindFile,
            label,
          }))}
          activeMindFile={activeMindFile}
          onMindFileChange={setActiveMindFile}
        />
        <FrameOverlay />
        <ScanHint visible={!detectedCharacter && isSceneReady && !showQuiz} />

        {detectedCharacter && !showQuiz && (
          <DetectedCharacterOverlay
            character={detectedCharacter}
            onCollect={handleCollectClick}
            isCaught={detectedCharacter.isCaught}
          />
        )}

        {showQuiz && detectedCharacter && (
          <QuizModal
            character={detectedCharacter}
            selectedAnswer={selectedAnswer}
            quizResult={quizResult}
            onAnswerSelect={handleAnswerSelect}
            onSubmit={handleSubmitQuiz}
          />
        )}
      </div>
    </div>
  );
}
