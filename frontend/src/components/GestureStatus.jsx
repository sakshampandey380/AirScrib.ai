import { Hand, HandMetal, HandPlatter, PenLine, ThumbsUp, Trash2 } from "lucide-react";

import GlassPanel from "./GlassPanel";

const gestureMap = {
  drawing: { icon: PenLine, text: "Pinch to draw" },
  pause: { icon: HandPlatter, text: "Open palm to stop" },
  erase: { icon: HandMetal, text: "Two fingers to erase" },
  clear: { icon: Trash2, text: "Fist to clear" },
  save: { icon: ThumbsUp, text: "Thumb up to save" },
  hover: { icon: Hand, text: "Point to hover" },
  idle: { icon: Hand, text: "Waiting for hand" },
};

function GestureStatus({ activeGesture, confidence = 0 }) {
  const current = gestureMap[activeGesture] ?? gestureMap.idle;
  const Icon = current.icon;

  return (
    <GlassPanel className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-200">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
            Active Gesture
          </p>
          <p className="text-base text-white">{current.text}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 sm:grid-cols-5 sm:gap-3 sm:text-sm">
        {["drawing", "pause", "erase", "clear", "save"].map((gesture) => (
          <div
            key={gesture}
            className={`rounded-2xl border px-3 py-2 text-center transition-all duration-300 ${
              activeGesture === gesture
                ? "scale-105 border-cyan-300/50 bg-cyan-400/15 font-medium text-white shadow-neon"
                : "border-white/10 bg-white/5"
            }`}
          >
            <p className="capitalize">{gesture}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 lg:block lg:py-3 lg:text-right">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Confidence</p>
        <p className="text-base font-semibold text-white sm:text-lg">{Math.round(confidence * 100)}%</p>
      </div>
    </GlassPanel>
  );
}

export default GestureStatus;

