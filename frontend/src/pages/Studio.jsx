import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, FilePlus2, Hand, MousePointerClick } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import CameraCanvas from "../components/CameraCanvas";
import DrawingCanvas from "../components/DrawingCanvas";
import GestureStatus from "../components/GestureStatus";
import GlassPanel from "../components/GlassPanel";
import RecognitionPanel from "../components/RecognitionPanel";
import Sidebar from "../components/Sidebar";
import Toolbar from "../components/Toolbar";
import { useAirPen } from "../hooks/useAirPen";
import { API_ROOT } from "../services/api";
import {
  createSession,
  exportDrawing,
  getDrawing,
  recognizeDrawing,
  saveDrawing,
  saveGestureLog,
  updateDrawing,
} from "../services/drawingService";
import { getSettings } from "../services/settingsService";
import { downloadDataUrl, downloadFromUrl, strokesToSvg } from "../utils/canvas";

function Studio() {
  const [searchParams, setSearchParams] = useSearchParams();
  const drawingIdParam = searchParams.get("drawing");

  const [tool, setTool] = useState("brush");
  const [brushColor, setBrushColor] = useState("#23d3ff");
  const [brushSize, setBrushSize] = useState(6);
  const [autoRecognition, setAutoRecognition] = useState(true);
  const [gestureSensitivity, setGestureSensitivity] = useState(0.16);
  const [cameraQuality, setCameraQuality] = useState("720p");
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [drawingTitle, setDrawingTitle] = useState(`Air Sketch ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);

  const [strokes, setStrokes] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [liveStroke, setLiveStroke] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [cleanOverlay, setCleanOverlay] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [activeDrawingId, setActiveDrawingId] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [saving, setSaving] = useState(false);

  const drawingCanvasRef = useRef(null);
  const clearCooldownRef = useRef(0);
  const saveCooldownRef = useRef(0);
  const gestureLogRef = useRef({ gesture: "", timestamp: 0 });
  const wsRef = useRef(null);
  const isManualDrawingRef = useRef(false);

  useEffect(() => {
    getSettings()
      .then((settings) => {
        if (!settings) return;
        setBrushColor(settings.brush_color);
        setBrushSize(settings.brush_size);
        setGestureSensitivity(settings.gesture_sensitivity);
        setCameraQuality(settings.camera_quality);
        setAutoRecognition(settings.auto_recognition);
        if (settings.theme_mode) {
          document.body.setAttribute("data-theme", settings.theme_mode);
        }
      })
      .catch(() => {});

    createSession({
      session_name: `Studio ${new Date().toLocaleTimeString()}`,
      metadata_json: { source: "browser-studio" },
    })
      .then((session) => setSessionId(session.id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!drawingIdParam) {
      return;
    }
    getDrawing(drawingIdParam)
      .then((drawing) => {
        setActiveDrawingId(drawing.id);
        setDrawingTitle(drawing.title || "Air Sketch");
        setStrokes(drawing.strokes || []);
        setPredictionHistory(drawing.predictions || []);
        if (drawing.recognized_objects?.length) {
          const currentPrediction = drawing.recognized_objects[0];
          setPrediction(currentPrediction);
          setCleanOverlay(currentPrediction);
        }
        setLastSavedAt(drawing.created_at);
      })
      .catch(() => toast.error("Unable to load selected drawing."));
  }, [drawingIdParam]);

  useEffect(() => {
    if (!sessionId) {
      return undefined;
    }

    const wsBase = API_ROOT.replace(/^http/, "ws");
    const socket = new WebSocket(`${wsBase}/ws/studio/${sessionId}`);
    wsRef.current = socket;
    return () => {
      try {
        socket.close();
      } catch {
        // Ignore close error
      }
    };
  }, [sessionId]);

  const airPen = useAirPen({
    enabled: cameraEnabled,
    sensitivity: gestureSensitivity,
    cameraQuality,
  });

  useEffect(() => {
    // Do not interrupt manual touch/mouse drawing with webcam idle state
    if (isManualDrawingRef.current) {
      return;
    }

    if (!airPen.pointer) {
      if (liveStroke?.points?.length && liveStroke.gesture_trigger !== "pointer") {
        setStrokes((current) => [...current, liveStroke]);
        setLiveStroke(null);
      }
      return;
    }

    const pointer = {
      x: airPen.pointer.x * 1280,
      y: airPen.pointer.y * 720,
      timestamp_ms: Date.now(),
    };
    const gesture = airPen.gesture?.name;
    const currentTime = Date.now();

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          gesture,
          pointer,
          timestamp: currentTime,
        })
      );
    }

    const activeTool = gesture === "erase" ? "eraser" : tool;
    const shouldDraw = gesture === "drawing" || gesture === "erase";

    if (shouldDraw) {
      setLiveStroke((current) => {
        if (!current) {
          return {
            stroke_order: strokes.length,
            tool_type: activeTool,
            color: activeTool === "eraser" ? "#071120" : brushColor,
            size: activeTool === "eraser" ? brushSize * 2.2 : brushSize,
            gesture_trigger: gesture,
            composite_mode: activeTool === "eraser" ? "destination-out" : "source-over",
            points: [pointer],
          };
        }
        return { ...current, points: [...current.points, pointer] };
      });
    } else if (liveStroke?.points?.length && liveStroke.gesture_trigger !== "pointer") {
      setStrokes((current) => [...current, liveStroke]);
      setRedoStack([]);
      setLiveStroke(null);
    }

    if (gesture === "clear" && currentTime - clearCooldownRef.current > 2400) {
      clearCooldownRef.current = currentTime;
      if (strokes.length > 0 || liveStroke) {
        setStrokes([]);
        setRedoStack([]);
        setLiveStroke(null);
        setPrediction(null);
        setCleanOverlay(null);
        toast.info("Canvas cleared by fist gesture.");
      }
    }

    if (gesture === "save" && currentTime - saveCooldownRef.current > 3200) {
      saveCooldownRef.current = currentTime;
      if (strokes.length > 0 || liveStroke?.points?.length) {
        persistDrawing({ autoRecognize: autoRecognition, notify: true });
      }
    }

    if (sessionId && ["drawing", "erase", "save", "clear"].includes(gesture)) {
      const shouldLog =
        gestureLogRef.current.gesture !== gesture || currentTime - gestureLogRef.current.timestamp > 2500;
      if (shouldLog) {
        gestureLogRef.current = { gesture, timestamp: currentTime };
        saveGestureLog({
          session_id: sessionId,
          drawing_id: activeDrawingId,
          gesture_name: gesture,
          confidence: airPen.gesture.confidence,
          trigger_state: "active",
        }).catch(() => {});
      }
    }
  }, [
    activeDrawingId,
    airPen.gesture,
    airPen.pointer,
    autoRecognition,
    brushColor,
    brushSize,
    liveStroke,
    sessionId,
    strokes.length,
    tool,
  ]);

  // Direct Touch / Mouse / Stylus Drawing Handlers
  function handlePointerStrokeStart(point) {
    isManualDrawingRef.current = true;
    setLiveStroke({
      stroke_order: strokes.length,
      tool_type: tool,
      color: tool === "eraser" ? "#071120" : brushColor,
      size: tool === "eraser" ? brushSize * 2.2 : brushSize,
      gesture_trigger: "pointer",
      composite_mode: tool === "eraser" ? "destination-out" : "source-over",
      points: [point],
    });
  }

  function handlePointerStrokeMove(point) {
    if (!isManualDrawingRef.current) return;
    setLiveStroke((current) => {
      if (!current) return null;
      return {
        ...current,
        points: [...current.points, point],
      };
    });
  }

  function handlePointerStrokeEnd() {
    if (!isManualDrawingRef.current) return;
    isManualDrawingRef.current = false;
    setLiveStroke((current) => {
      if (current?.points?.length) {
        setStrokes((prev) => [...prev, current]);
        setRedoStack([]);
      }
      return null;
    });
  }

  async function persistDrawing({ autoRecognize = autoRecognition, notify = true } = {}) {
    if (!drawingCanvasRef.current || saving) {
      return null;
    }
    const allStrokes = liveStroke?.points?.length ? [...strokes, liveStroke] : strokes;
    if (!allStrokes.length) {
      toast.info("Create a sketch on the canvas first before saving.");
      return null;
    }

    try {
      setSaving(true);
      const imageData = drawingCanvasRef.current.exportDataUrl("image/png");
      const svgMarkup = strokesToSvg(allStrokes, 1280, 720);
      const payload = {
        session_id: sessionId,
        title: drawingTitle.trim() || `Air Sketch ${new Date().toLocaleDateString()}`,
        description: "Saved from the AirScribe AI studio.",
        image_data: imageData,
        svg_markup: svgMarkup,
        canvas_width: 1280,
        canvas_height: 720,
        background_style: "midnight-neon",
        strokes: allStrokes,
        auto_recognize: autoRecognize,
      };

      const drawing = activeDrawingId
        ? await updateDrawing(activeDrawingId, payload)
        : await saveDrawing(payload);

      setActiveDrawingId(drawing.id);
      setStrokes(allStrokes);
      setLiveStroke(null);
      setLastSavedAt(drawing.created_at);
      if (drawing.recognized_objects?.length) {
        const currentPrediction = drawing.recognized_objects[drawnObjectIndex(drawing.recognized_objects)];
        setPrediction(currentPrediction);
        setCleanOverlay(currentPrediction);
      }
      if (drawing.predictions?.length) {
        setPredictionHistory(drawing.predictions);
      }
      if (notify) {
        toast.success(activeDrawingId ? "Drawing updated & synced!" : "Drawing saved successfully!");
      }
      return drawing;
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Save failed.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  function drawnObjectIndex(objects) {
    return objects.length - 1;
  }

  function handleUndo() {
    if (!strokes.length) {
      return;
    }
    const updated = [...strokes];
    const lastStroke = updated.pop();
    setStrokes(updated);
    setRedoStack((current) => [lastStroke, ...current]);
  }

  function handleRedo() {
    if (!redoStack.length) {
      return;
    }
    const [next, ...rest] = redoStack;
    setStrokes((current) => [...current, next]);
    setRedoStack(rest);
  }

  function handleClear() {
    setStrokes([]);
    setRedoStack([]);
    setLiveStroke(null);
    setPrediction(null);
    setCleanOverlay(null);
  }

  function handleNewCanvas() {
    handleClear();
    setActiveDrawingId(null);
    setLastSavedAt(null);
    setDrawingTitle(`Air Sketch ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
    if (drawingIdParam) {
      setSearchParams({});
    }
    toast.success("Fresh canvas ready.");
  }

  async function handleRecognize() {
    const saved = await persistDrawing({ autoRecognize: true, notify: false });
    const targetId = saved?.id || activeDrawingId;
    if (!targetId) {
      return;
    }
    try {
      const result = await recognizeDrawing(targetId);
      setPrediction(result);
      setPredictionHistory((current) => [result, ...current].slice(0, 8));
      setCleanOverlay(result);
      toast.success(`AI Recognized: ${result.label.toUpperCase()} (${Math.round(result.confidence * 100)}%)`);
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Recognition failed.");
    }
  }

  async function handleExport(format) {
    const allStrokes = liveStroke?.points?.length ? [...strokes, liveStroke] : strokes;
    if (!allStrokes.length) {
      toast.info("Draw something on the canvas before exporting.");
      return;
    }

    let drawingId = activeDrawingId;
    if (!drawingId) {
      const saved = await persistDrawing({ autoRecognize: false, notify: false });
      drawingId = saved?.id;
    }

    if (drawingId) {
      try {
        const result = await exportDrawing(drawingId, format);
        downloadFromUrl(result.download_path, `airscribe-${drawingId}.${format}`);
        toast.success(`${format.toUpperCase()} export ready!`);
        return;
      } catch {
        // Fall back to local client export when API export is not available.
      }
    }

    const dataUrl = drawingCanvasRef.current?.exportDataUrl(format === "jpg" ? "image/jpeg" : "image/png");
    if (format === "svg") {
      const svg = strokesToSvg(allStrokes, 1280, 720);
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      downloadDataUrl(url, "airscribe-export.svg");
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Local SVG export downloaded.");
      return;
    }

    if (dataUrl) {
      downloadDataUrl(dataUrl, `airscribe-export.${format === "jpg" ? "jpg" : "png"}`);
      toast.success(`Local ${format.toUpperCase()} export downloaded.`);
    }
  }

  return (
    <main className="mx-auto grid max-w-[1700px] gap-5 px-3 py-6 sm:gap-6 sm:px-6 sm:py-8 xl:grid-cols-[250px_1fr] xl:px-8">
      <Sidebar />

      <section className="min-w-0 space-y-5 sm:space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/75 sm:text-sm">AI Air Pen Studio</p>
            <h1 className="mt-1.5 font-display text-2xl font-semibold text-white sm:text-4xl">
              Gesture & touch drawing with live AI recognition
            </h1>
            <p className="mt-2 max-w-3xl text-xs text-slate-300 sm:text-sm">
              Pinch in the air in front of your webcam OR draw directly on the canvas with your finger, stylus, or mouse.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              value={drawingTitle}
              onChange={(e) => setDrawingTitle(e.target.value)}
              placeholder="Drawing Title..."
              className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300/40 sm:w-56"
            />
            <button
              type="button"
              onClick={handleNewCanvas}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-300/30 hover:bg-white/10 sm:text-sm"
            >
              <FilePlus2 className="h-4 w-4 text-cyan-300" />
              New Canvas
            </button>
            <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium text-cyan-100 sm:text-sm">
              {saving ? "Saving..." : activeDrawingId ? `Saved #${activeDrawingId}` : "Live Draft"}
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_1fr] 2xl:grid-cols-[310px_1fr_330px]">
          <Toolbar
            tool={tool}
            brushColor={brushColor}
            brushSize={brushSize}
            onToolChange={setTool}
            onColorChange={setBrushColor}
            onBrushSizeChange={setBrushSize}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
            onSave={() => persistDrawing({ autoRecognize: autoRecognition, notify: true })}
            onRecognize={handleRecognize}
            onExport={handleExport}
            canUndo={strokes.length > 0}
            canRedo={redoStack.length > 0}
            saving={saving}
          />

          <div className="space-y-5">
            <CameraCanvas
              videoRef={airPen.videoRef}
              pointer={airPen.pointer}
              landmarks={airPen.landmarks}
              handConnections={airPen.handConnections}
              ready={airPen.ready}
              loading={airPen.loading}
              error={airPen.error}
              cameraEnabled={cameraEnabled}
              onToggleCamera={() => setCameraEnabled((prev) => !prev)}
            />

            <GlassPanel className="p-3 sm:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-base font-semibold text-white sm:text-lg">Interactive Drawing Layer</p>
                    <span className="hidden items-center gap-1 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-0.5 text-[11px] text-cyan-200 sm:inline-flex">
                      <Hand className="h-3 w-3" /> Air + <MousePointerClick className="h-3 w-3" /> Touch/Mouse
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 sm:text-sm">
                    Draw in the air via camera OR sketch directly here with your finger/mouse.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {cleanOverlay && (
                    <button
                      type="button"
                      onClick={() => setShowOverlay((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-violet-300/30 bg-violet-500/15 px-3 py-1 text-xs text-violet-100 transition hover:bg-violet-500/25"
                    >
                      {showOverlay ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      {showOverlay ? "Hide Overlay" : "Show Overlay"}
                    </button>
                  )}
                  <div className="rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.15em] text-violet-200">
                    1280 x 720
                  </div>
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-[20px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(35,211,255,0.09),transparent_40%),linear-gradient(180deg,#081120,#040b16)] sm:rounded-[24px]">
                <DrawingCanvas
                  ref={drawingCanvasRef}
                  strokes={strokes}
                  liveStroke={liveStroke}
                  cleanOverlay={showOverlay ? cleanOverlay : null}
                  pointerPosition={cameraEnabled ? airPen.pointer : null}
                  onPointerStrokeStart={handlePointerStrokeStart}
                  onPointerStrokeMove={handlePointerStrokeMove}
                  onPointerStrokeEnd={handlePointerStrokeEnd}
                />
              </div>
            </GlassPanel>
          </div>

          <div className="lg:col-span-2 2xl:col-span-1">
            <RecognitionPanel
              prediction={prediction}
              history={predictionHistory}
              lastSavedAt={lastSavedAt}
              onExport={handleExport}
            />
          </div>
        </div>

        <GestureStatus activeGesture={airPen.gesture.name} confidence={airPen.gesture.confidence} />
      </section>
    </main>
  );
}

export default Studio;
