import { Brain, Download, Sparkles } from "lucide-react";

import GlassPanel from "./GlassPanel";
import { confidencePercent, formatDate } from "../utils/formatters";
import { RecognitionIcon } from "../utils/recognitionIcons";

function RecognitionPanel({ prediction, history = [], lastSavedAt, onExport }) {
  return (
    <GlassPanel className="flex h-full flex-col gap-5 p-5">
      <div>
        <p className="font-display text-lg font-semibold text-white">AI Recognition</p>
        <p className="mt-1 text-sm text-slate-300">AirScribe analyzes your canvas and refines the final object cue.</p>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
        {prediction ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/15 to-violet-500/15 p-4">
                <RecognitionIcon label={prediction.label} className="h-14 w-14" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/75">Primary Match</p>
                <p className="font-display text-2xl font-semibold capitalize text-white">{prediction.label}</p>
                <p className="text-sm text-slate-300">{confidencePercent(prediction.confidence)} confidence</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
              Clean overlay icon is rendered on the canvas using the detected bounding area.
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-slate-300">
            Save a sketch or trigger AI recognition to see the detected object here.
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-semibold text-white">Export Ready</p>
          <Brain className="h-4 w-4 text-cyan-300" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {["png", "jpg", "pdf", "svg"].map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => onExport(format)}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              {format.toUpperCase()}
            </button>
          ))}
        </div>
        {lastSavedAt ? (
          <p className="text-xs text-slate-400">Last saved {formatDate(lastSavedAt)}</p>
        ) : (
          <p className="text-xs text-slate-400">No saved version yet. Gestures can still drive the live canvas.</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="h-4 w-4 text-violet-300" />
          <p className="font-display text-base font-semibold">Recognition History</p>
        </div>
        <div className="space-y-2">
          {history.length ? (
            history.map((entry, index) => (
              <div key={`${entry.label}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="capitalize text-white">{entry.label}</p>
                  <span className="text-sm text-cyan-200">{confidencePercent(entry.confidence)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-400">
              Your recognition timeline will appear here after the first save.
            </div>
          )}
        </div>
      </div>
    </GlassPanel>
  );
}

export default RecognitionPanel;

