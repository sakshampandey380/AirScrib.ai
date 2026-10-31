import { useEffect, useRef } from "react";
import { Camera, Power, VideoOff } from "lucide-react";

import GlassPanel from "./GlassPanel";
import Loader from "./Loader";

function CameraCanvas({
  videoRef,
  pointer,
  landmarks,
  handConnections,
  ready,
  loading,
  error,
  cameraEnabled = true,
  onToggleCamera,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks?.length) {
      return;
    }

    ctx.strokeStyle = "rgba(130, 240, 255, 0.65)";
    ctx.lineWidth = 2.5;
    handConnections.forEach(([from, to]) => {
      const start = landmarks[from];
      const end = landmarks[to];
      if (!start || !end) {
        return;
      }
      ctx.beginPath();
      ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
      ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
      ctx.stroke();
    });

    landmarks.forEach((point, index) => {
      ctx.beginPath();
      ctx.fillStyle = index === 8 ? "#d93eff" : "#23d3ff";
      ctx.arc(point.x * canvas.width, point.y * canvas.height, index === 8 ? 7.5 : 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [handConnections, landmarks]);

  return (
    <GlassPanel className="relative flex min-h-[260px] flex-col overflow-hidden p-3 sm:min-h-[340px] lg:min-h-[400px]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <p className="font-display text-base font-semibold text-white sm:text-lg">Live Air Pen Feed</p>
          <p className="text-xs text-slate-300 sm:text-sm">
            Mirrored camera + hand skeleton + index fingertip tracker.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onToggleCamera && (
            <button
              type="button"
              onClick={onToggleCamera}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                cameraEnabled
                  ? "border-cyan-300/30 bg-cyan-400/15 text-cyan-100 hover:bg-cyan-400/25"
                  : "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Power className="h-3.5 w-3.5" />
              {cameraEnabled ? "Camera On" : "Camera Off"}
            </button>
          )}
          <div
            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.15em] ${
              ready
                ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                : "border-cyan-300/20 bg-cyan-400/10 text-cyan-200"
            }`}
          >
            {!cameraEnabled ? "paused" : ready ? "camera live" : "standby"}
          </div>
        </div>
      </div>

      <div className="relative aspect-video flex-1 overflow-hidden rounded-[20px] border border-white/10 bg-slate-950/75 sm:rounded-[24px]">
        <video ref={videoRef} muted playsInline className="h-full w-full object-cover [transform:scaleX(-1)]" />
        <canvas
          ref={overlayRef}
          width={1280}
          height={720}
          className="pointer-events-none absolute inset-0 h-full w-full [transform:scaleX(-1)]"
        />
        {pointer && cameraEnabled ? (
          <div
            className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-cyan-300/50 shadow-neon transition-transform duration-75"
            style={{ left: `${pointer.x * 100}%`, top: `${pointer.y * 100}%` }}
          />
        ) : null}

        {(!cameraEnabled || loading || error || !ready) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/75 p-4 text-center backdrop-blur-sm">
            {!cameraEnabled ? (
              <>
                <VideoOff className="h-8 w-8 text-slate-400" />
                <p className="text-sm text-slate-300">
                  Camera is paused. Draw directly on the Drawing Layer below using touch or mouse, or turn Camera On.
                </p>
              </>
            ) : loading ? (
              <Loader label="Warming up hand tracking..." />
            ) : error ? (
              <>
                <VideoOff className="h-8 w-8 text-amber-300" />
                <p className="max-w-md text-xs text-amber-100 sm:text-sm">{error}</p>
                <p className="text-xs text-cyan-200">
                  Tip: Touch & Mouse drawing is active on the Drawing Layer below!
                </p>
              </>
            ) : (
              <>
                <Camera className="h-8 w-8 text-cyan-300" />
                <p className="text-sm text-slate-300">Waiting for camera permission...</p>
              </>
            )}
          </div>
        )}
      </div>
    </GlassPanel>
  );
}

export default CameraCanvas;
