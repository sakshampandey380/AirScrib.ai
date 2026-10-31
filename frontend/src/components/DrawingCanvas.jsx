import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const WIDTH = 1280;
const HEIGHT = 720;

function drawStroke(ctx, stroke) {
  if (!stroke?.points?.length) {
    return;
  }

  ctx.save();
  ctx.globalCompositeOperation = stroke.composite_mode || "source-over";
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (stroke.tool_type !== "eraser") {
    ctx.shadowBlur = Math.min(12, stroke.size * 1.1);
    ctx.shadowColor = stroke.color;
  }

  const pts = stroke.points;
  ctx.beginPath();
  if (pts.length === 1) {
    ctx.arc(pts[0].x, pts[0].y, stroke.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = stroke.color;
    ctx.fill();
  } else if (pts.length === 2) {
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.stroke();
  } else {
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i += 1) {
      const midX = (pts[i].x + pts[i + 1].x) / 2;
      const midY = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRecognition(ctx, overlay) {
  if (!overlay?.bounding_box) {
    return;
  }

  const { x, y, width, height } = overlay.bounding_box;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radius = Math.max(Math.min(width, height) / 2.3, 28);

  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, "#23d3ff");
  gradient.addColorStop(1, "#d93eff");

  ctx.save();
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowBlur = 18;
  ctx.shadowColor = "rgba(35,211,255,0.45)";

  switch (overlay.label) {
    case "circle":
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "square":
      ctx.strokeRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
      break;
    case "triangle":
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX + radius, centerY + radius);
      ctx.lineTo(centerX - radius, centerY + radius);
      ctx.closePath();
      ctx.stroke();
      break;
    case "heart":
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + radius * 0.85);
      ctx.bezierCurveTo(
        centerX - radius * 1.2,
        centerY + radius * 0.2,
        centerX - radius * 1.1,
        centerY - radius * 0.85,
        centerX,
        centerY - radius * 0.25
      );
      ctx.bezierCurveTo(
        centerX + radius * 1.1,
        centerY - radius * 0.85,
        centerX + radius * 1.2,
        centerY + radius * 0.2,
        centerX,
        centerY + radius * 0.85
      );
      ctx.stroke();
      break;
    case "star": {
      ctx.beginPath();
      for (let i = 0; i < 10; i += 1) {
        const r = i % 2 === 0 ? radius : radius * 0.42;
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const px = centerX + Math.cos(angle) * r;
        const py = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case "arrow":
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius * 0.65, centerY);
      ctx.lineTo(centerX + radius * 0.2, centerY - radius * 0.45);
      ctx.moveTo(centerX + radius * 0.65, centerY);
      ctx.lineTo(centerX + radius * 0.2, centerY + radius * 0.45);
      ctx.stroke();
      break;
    case "house":
      ctx.beginPath();
      ctx.moveTo(centerX - radius * 0.85, centerY - radius * 0.1);
      ctx.lineTo(centerX, centerY - radius * 0.9);
      ctx.lineTo(centerX + radius * 0.85, centerY - radius * 0.1);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeRect(centerX - radius * 0.65, centerY - radius * 0.1, radius * 1.3, radius * 0.95);
      break;
    case "tree":
      ctx.beginPath();
      ctx.arc(centerX, centerY - radius * 0.25, radius * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeRect(centerX - radius * 0.2, centerY + radius * 0.35, radius * 0.4, radius * 0.6);
      break;
    case "sun":
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.58, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 8; i += 1) {
        const angle = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * radius * 0.72, centerY + Math.sin(angle) * radius * 0.72);
        ctx.lineTo(centerX + Math.cos(angle) * radius * 1.05, centerY + Math.sin(angle) * radius * 1.05);
        ctx.stroke();
      }
      break;
    case "face":
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX - radius * 0.35, centerY - radius * 0.2, Math.max(4, radius * 0.08), 0, Math.PI * 2);
      ctx.arc(centerX + radius * 0.35, centerY - radius * 0.2, Math.max(4, radius * 0.08), 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, centerY + radius * 0.15, radius * 0.4, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      break;
    case "car":
      ctx.strokeRect(centerX - radius * 0.95, centerY - radius * 0.15, radius * 1.9, radius * 0.55);
      ctx.beginPath();
      ctx.arc(centerX - radius * 0.5, centerY + radius * 0.45, radius * 0.22, 0, Math.PI * 2);
      ctx.arc(centerX + radius * 0.5, centerY + radius * 0.45, radius * 0.22, 0, Math.PI * 2);
      ctx.stroke();
      break;
    default:
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
  }

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "600 20px Sora, sans-serif";
  ctx.fillText(overlay.label.toUpperCase(), x, Math.max(y - 14, 28));
  ctx.restore();
}

const DrawingCanvas = forwardRef(function DrawingCanvas(
  { strokes, liveStroke, cleanOverlay, pointerPosition, onPointerStrokeStart, onPointerStrokeMove, onPointerStrokeEnd },
  ref
) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    strokes.forEach((stroke) => drawStroke(ctx, stroke));
    if (liveStroke) {
      drawStroke(ctx, liveStroke);
    }
    if (cleanOverlay) {
      drawRecognition(ctx, cleanOverlay);
    }
  }, [cleanOverlay, liveStroke, strokes]);

  useImperativeHandle(ref, () => ({
    exportDataUrl(type = "image/png") {
      return canvasRef.current?.toDataURL(type);
    },
    getCanvasSize() {
      return { width: WIDTH, height: HEIGHT };
    },
  }));

  function getCanvasCoords(event) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    return {
      x: Math.max(0, Math.min(WIDTH, (event.clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(HEIGHT, (event.clientY - rect.top) * scaleY)),
      pressure: event.pressure || 0.5,
      timestamp_ms: Date.now(),
    };
  }

  function handlePointerDown(event) {
    if (!onPointerStrokeStart) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    const pt = getCanvasCoords(event);
    if (pt) onPointerStrokeStart(pt);
  }

  function handlePointerMove(event) {
    if (!isDrawingRef.current || !onPointerStrokeMove) return;
    const pt = getCanvasCoords(event);
    if (pt) onPointerStrokeMove(pt);
  }

  function handlePointerUp(event) {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore release error
    }
    if (onPointerStrokeEnd) onPointerStrokeEnd();
  }

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-0 h-full w-full cursor-crosshair touch-none rounded-[20px] sm:rounded-[24px]"
      />
      {pointerPosition ? (
        <div
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200 bg-cyan-400/50 shadow-neon"
          style={{ left: `${pointerPosition.x * 100}%`, top: `${pointerPosition.y * 100}%` }}
        />
      ) : null}
    </div>
  );
});

export default DrawingCanvas;
