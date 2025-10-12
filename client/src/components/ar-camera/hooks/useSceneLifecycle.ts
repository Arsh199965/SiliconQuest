import { MutableRefObject, useEffect } from "react";

import { MindARSceneElement } from "../types";

export const useSceneLifecycle = (
  sceneRef: MutableRefObject<MindARSceneElement | null>,
  scriptsLoaded: boolean,
  onReady: () => void,
  onError: (message: string) => void
) => {
  useEffect(() => {
    if (!scriptsLoaded) return;

    const sceneEl = sceneRef.current;
    if (!sceneEl) return;

    const handleLoaded = () => {
      onReady();
    };

    const handleArReady = () => {
      onReady();
    };

    const handleArError = (event: Event) => {
      console.error("MindAR arError", event);
      onError(
        "AR session couldn't start. Please check camera permissions and try again."
      );
    };

    sceneEl.addEventListener("loaded", handleLoaded);
    sceneEl.addEventListener("arReady", handleArReady);
    sceneEl.addEventListener("arError", handleArError);

    return () => {
      sceneEl.removeEventListener("loaded", handleLoaded);
      sceneEl.removeEventListener("arReady", handleArReady);
      sceneEl.removeEventListener("arError", handleArError);
    };
  }, [scriptsLoaded, sceneRef, onReady, onError]);
};
