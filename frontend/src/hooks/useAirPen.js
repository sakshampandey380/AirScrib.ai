import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
];

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function isFingerExtended(tip, pip, mcp) {
  return tip.y < pip.y && pip.y < mcp.y;
}

function classifyGesture(landmarks, sensitivity) {
  if (!landmarks?.length) {
    return { name: "idle", confidence: 0 };
  }

  const [
    wrist,
    ,
    thumbMcp,
    thumbIp,
    thumbTip,
    indexMcp,
    indexPip,
    ,
    indexTip,
    middleMcp,
    middlePip,
    ,
    middleTip,
    ringMcp,
    ringPip,
    ,
    ringTip,
    pinkyMcp,
    pinkyPip,
    ,
    pinkyTip,
  ] = landmarks;

  const pinchDistance = distance(indexTip, thumbTip);
  const indexExtended = isFingerExtended(indexTip, indexPip, indexMcp);
  const middleExtended = isFingerExtended(middleTip, middlePip, middleMcp);
  const ringExtended = isFingerExtended(ringTip, ringPip, ringMcp);
  const pinkyExtended = isFingerExtended(pinkyTip, pinkyPip, pinkyMcp);
  const thumbUp = thumbTip.y < thumbIp.y && thumbTip.y < wrist.y && !indexExtended && !middleExtended;

  if (pinchDistance < sensitivity) {
    return { name: "drawing", confidence: Math.min(0.99, Math.max(0.55, 1 - pinchDistance / sensitivity)) };
  }

  if (thumbUp) {
    return { name: "save", confidence: 0.94 };
  }

  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    return { name: "erase", confidence: 0.88 };
  }

  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && thumbTip.y > thumbMcp.y) {
    return { name: "clear", confidence: 0.91 };
  }

  if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
    return { name: "pause", confidence: 0.9 };
  }

  return { name: "hover", confidence: 0.75 };
}

export function useAirPen({ enabled = true, sensitivity = 0.16, cameraQuality = "720p" } = {}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(0);
  const landmarkerRef = useRef(null);
  const sensitivityRef = useRef(sensitivity);
  const smoothedPointerRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  useEffect(() => {
    sensitivityRef.current = sensitivity;
  }, [sensitivity]);

  const [state, setState] = useState({
    ready: false,
    loading: false,
    error: "",
    pointer: null,
    gesture: { name: "idle", confidence: 0 },
    landmarks: [],
  });

  useEffect(() => {
    if (!enabled) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      smoothedPointerRef.current = null;
      setState({
        ready: false,
        loading: false,
        error: "",
        pointer: null,
        gesture: { name: "idle", confidence: 0 },
        landmarks: [],
      });
      return undefined;
    }

    let isMounted = true;
    let animationFrame = 0;

    const targetDims =
      cameraQuality === "1080p"
        ? { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: "user" }
        : cameraQuality === "480p"
          ? { width: { ideal: 854 }, height: { ideal: 480 }, facingMode: "user" }
          : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" };

    async function boot() {
      try {
        setState((current) => ({ ...current, loading: true, error: "" }));

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera API not available in this browser or non-HTTPS context. Use Touch/Mouse on the canvas below!");
        }

        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        if (!isMounted) return;

        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
          },
          runningMode: "VIDEO",
          numHands: 1,
        });

        if (!isMounted) return;

        try {
          streamRef.current = await navigator.mediaDevices.getUserMedia({
            video: targetDims,
            audio: false,
          });
        } catch {
          streamRef.current = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (!videoRef.current || !isMounted) {
          return;
        }

        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();

        if (!isMounted) {
          return;
        }

        setState((current) => ({ ...current, ready: true, loading: false, error: "" }));

        const detect = () => {
          if (!isMounted) return;
          const videoEl = videoRef.current;
          const landmarker = landmarkerRef.current;

          if (videoEl && landmarker && videoEl.readyState >= 2 && videoEl.videoWidth > 0) {
            const nowInMs = performance.now();
            if (nowInMs > lastVideoTimeRef.current) {
              lastVideoTimeRef.current = nowInMs;
              try {
                const result = landmarker.detectForVideo(videoEl, nowInMs);
                const landmarks = result?.landmarks?.[0] ?? [];
                const gesture = classifyGesture(landmarks, sensitivityRef.current);

                let pointer = null;
                if (landmarks[8]) {
                  // Mirror X coordinate (1 - x) so hand movement matches mirrored selfie video and drawing canvas
                  const rawX = 1 - landmarks[8].x;
                  const rawY = landmarks[8].y;
                  const alpha = 0.48;
                  if (smoothedPointerRef.current) {
                    pointer = {
                      x: smoothedPointerRef.current.x + alpha * (rawX - smoothedPointerRef.current.x),
                      y: smoothedPointerRef.current.y + alpha * (rawY - smoothedPointerRef.current.y),
                    };
                  } else {
                    pointer = { x: rawX, y: rawY };
                  }
                  smoothedPointerRef.current = pointer;
                } else {
                  smoothedPointerRef.current = null;
                }

                if (isMounted) {
                  setState((current) => ({
                    ...current,
                    pointer,
                    gesture,
                    landmarks,
                  }));
                }
              } catch {
                // Ignore transient frame detection errors
              }
            }
          }

          animationFrame = requestAnimationFrame(detect);
          frameRef.current = animationFrame;
        };

        detect();
      } catch (error) {
        if (isMounted) {
          setState((current) => ({
            ...current,
            loading: false,
            ready: false,
            error: error?.message || "Camera access unavailable. You can still draw directly on the canvas with touch or mouse!",
          }));
        }
      }
    }

    boot();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrame);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch {
          // Ignore close error
        }
        landmarkerRef.current = null;
      }
    };
  }, [enabled, cameraQuality]);

  return {
    videoRef,
    handConnections: HAND_CONNECTIONS,
    ...state,
  };
}
