import {
  Download,
  Eraser,
  Palette,
  RotateCcw,
  RotateCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";

import GlassPanel from "./GlassPanel";

const PRESET_COLORS = [
  "#23d3ff",
  "#9c5dff",
  "#d93eff",
  "#f1c46e",
  "#10b981",
  "#f43f5e",
  "#ffffff",
];

function Toolbar({
  brushColor,
  brushSize,
  tool,
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onRecognize,
  onExport,
  canUndo = false,
  canRedo = false,
  saving = false,
}) {
  return (
    <GlassPanel className="flex h-full flex-col gap-4 p-4 sm:p-5">
      <div>
        <p className="font-display text-lg font-semibold text-white">Studio Tools</p>
        <p className="mt-1 text-xs text-slate-300 sm:text-sm">
          Combine Air Pen hand gestures with touch or mouse precision.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onToolChange("brush")}
          className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
            tool === "brush"
              ? "border-cyan-300/50 bg-cyan-400/15 text-white shadow-neon"
              : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
          }`}
        >
          <Palette className="mx-auto mb-1.5 h-4 w-4 text-cyan-300" />
          Brush
        </button>
        <button
          type="button"
          onClick={() => onToolChange("eraser")}
          className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
            tool === "eraser"
              ? "border-violet-400/50 bg-violet-500/15 text-white shadow-neon"
              : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
          }`}
        >
          <Eraser className="mx-auto mb-1.5 h-4 w-4 text-violet-300" />
          Eraser
        </button>
      </div>

      <div className="space-y-2.5 text-sm text-slate-300">
        <div className="flex items-center justify-between">
          <span>Brush Color</span>
          <span className="font-mono text-xs text-cyan-200">{brushColor.toUpperCase()}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
          {PRESET_COLORS.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => {
                onColorChange(swatch);
                if (tool === "eraser") onToolChange("brush");
              }}
              aria-label={`Select color ${swatch}`}
              className={`h-7 w-7 rounded-full border transition ${
                brushColor.toLowerCase() === swatch.toLowerCase()
                  ? "scale-110 border-white ring-2 ring-cyan-300/60"
                  : "border-white/20 hover:scale-105"
              }`}
              style={{ backgroundColor: swatch }}
            />
          ))}
          <label
            title="Custom Color Picker"
            className="ml-auto flex h-8 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-slate-900"
          >
            <input
              type="color"
              value={brushColor}
              onChange={(event) => {
                onColorChange(event.target.value);
                if (tool === "eraser") onToolChange("brush");
              }}
              className="h-10 w-12 cursor-pointer border-0 bg-transparent"
            />
          </label>
        </div>
      </div>

      <label className="space-y-2 text-sm text-slate-300">
        <div className="flex items-center justify-between">
          <span>Brush Size</span>
          <span className="rounded-full bg-cyan-400/15 px-2.5 py-0.5 text-xs font-medium text-cyan-200">
            {brushSize}px
          </span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
          <input
            type="range"
            min="2"
            max="28"
            value={brushSize}
            onChange={(event) => onBrushSizeChange(Number(event.target.value))}
            className="w-full cursor-pointer accent-cyan-400"
          />
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
            <span>Fine (2px)</span>
            <span>Bold (28px)</span>
          </div>
        </div>
      </label>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 2xl:grid-cols-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-medium text-slate-200 transition hover:border-cyan-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
        >
          <RotateCcw className="mx-auto mb-1.5 h-4 w-4 text-cyan-300" />
          Undo
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-medium text-slate-200 transition hover:border-cyan-300/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
        >
          <RotateCw className="mx-auto mb-1.5 h-4 w-4 text-cyan-300" />
          Redo
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-medium text-slate-200 transition hover:border-rose-300/30 hover:bg-rose-500/10 hover:text-rose-100 sm:text-sm"
        >
          <Trash2 className="mx-auto mb-1.5 h-4 w-4 text-rose-300" />
          Clear
        </button>
        <button
          type="button"
          onClick={() => onExport("png")}
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-medium text-slate-200 transition hover:border-cyan-300/30 hover:bg-white/10 sm:text-sm"
        >
          <Download className="mx-auto mb-1.5 h-4 w-4 text-amber-300" />
          PNG
        </button>
      </div>

      <div className="mt-auto space-y-2.5 pt-2">
        <button
          type="button"
          onClick={onRecognize}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/35 bg-gradient-to-r from-cyan-400/20 to-violet-500/20 px-4 py-3 text-sm font-medium text-white transition hover:border-cyan-300/60 hover:shadow-neon disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4 text-cyan-300" />
          Save & Recognize AI
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-neon transition hover:brightness-110 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Drawing"}
        </button>
      </div>
    </GlassPanel>
  );
}

export default Toolbar;
