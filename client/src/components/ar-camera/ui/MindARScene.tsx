import { createElement, MutableRefObject, useMemo } from "react";

import { Character, MindARSceneElement } from "../types";

interface MindARSceneProps {
  sceneRef: MutableRefObject<MindARSceneElement | null>;
  characters: Character[];
  animationMixerAvailable: boolean;
  registerTargetRef: (id: string) => (el: Element | null) => void;
  activeMindFile: string | null;
}

export const MindARScene = ({
  sceneRef,
  characters,
  animationMixerAvailable,
  registerTargetRef,
  activeMindFile,
}: MindARSceneProps) => {
  // Use the first character's mindFile
  // Note: MindAR can only load one .mind file at a time
  // To scan multiple characters, you need to switch .mind files or compile them into one
  const targetSrc = useMemo(() => {
    if (activeMindFile) return activeMindFile;
    return characters.length > 0
      ? characters[0].mindFile
      : "/ar-targets/default.mind";
  }, [activeMindFile, characters]);

  const targetCharacters = useMemo(() => {
    if (!activeMindFile) return characters;
    return characters.filter((character) => character.mindFile === activeMindFile);
  }, [characters, activeMindFile]);

  return createElement(
    "a-scene",
    {
      ref: sceneRef,
      // Single target per .mind file - no targetIndex needed
      "mindar-image": `imageTargetSrc: ${targetSrc}; filterMinCF:0.0001; filterBeta: 10`,
      "color-space": "sRGB",
      renderer:
        "colorManagement: true, physicallyCorrectLights: true, legacyLights: false",
      "vr-mode-ui": "enabled: false",
      "device-orientation-permission-ui": "enabled: false",
      embedded: true,
      className: "mindar-scene w-full h-full",
    },
    createElement(
      "a-assets",
      null,
      targetCharacters
        .filter((character) => !!character.modelUrl)
        .map((character) =>
          createElement("a-asset-item", {
            key: `asset-${character.id}`,
            id: `character-model-${character.id}`,
            src: character.modelUrl,
          })
        )
    ),
    createElement("a-camera", {
      position: "0 0 0",
    }),
    createElement("a-entity", {
      light: "type: ambient; intensity: 1",
    }),
    createElement("a-entity", {
      light: "type: directional; intensity: 0.8",
      position: "0 1 0",
    }),
    // Only render the first character (since we load one .mind file at a time)
    characters.length > 0 &&
      targetCharacters.length > 0 &&
      createElement(
        "a-entity",
        {
          key: targetCharacters[0].id,
          ref: registerTargetRef(targetCharacters[0].id),
          // Single target per .mind file, so targetIndex is always 0
          "mindar-image-target": "targetIndex: 0",
        },
        targetCharacters[0].modelUrl
          ? createElement("a-gltf-model", {
              src: `#character-model-${targetCharacters[0].id}`,
              position: "0 -0.25 0",
              rotation: "0 180 0",
              scale: "0.6 0.6 0.6",
              ...(animationMixerAvailable ? { "animation-mixer": "" } : {}),
            })
          : createElement(
              "a-plane",
              {
                position: "0 0 0",
                rotation: "0 0 0",
                height: "0.8",
                width: "0.8",
                color: "#4338ca",
              },
              createElement("a-text", {
                value: targetCharacters[0].name,
                position: "0 0 0.1",
                align: "center",
                width: "1.5",
                color: "#facc15",
              })
            )
      )
  );
};
