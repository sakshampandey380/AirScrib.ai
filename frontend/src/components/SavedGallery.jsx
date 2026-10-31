import { Download, Eye, Trash2 } from "lucide-react";

import EmptyState from "./EmptyState";
import GlassPanel from "./GlassPanel";
import { API_ROOT } from "../services/api";
import { confidencePercent, formatDate } from "../utils/formatters";

function resolveImageSource(imagePath) {
  if (!imagePath) return "";
  const filename = imagePath.split("/").pop();
  return `${API_ROOT}/uploads/${filename}`;
}

function SavedGallery({ drawings, onDelete, onOpen, onExport }) {
  if (!drawings.length) {
    return (
      <EmptyState
        title="No saved drawings yet"
        description="Your gallery will fill up as soon as you save your first air or touch sketch from the studio."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {drawings.map((drawing) => (
        <GlassPanel key={drawing.id} className="group flex flex-col overflow-hidden">
          <div
            onClick={() => onOpen(drawing.id)}
            className="relative aspect-[4/3] cursor-pointer overflow-hidden border-b border-white/10 bg-[#071120]"
          >
            <img
              src={resolveImageSource(drawing.image_path)}
              alt={drawing.title}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
            {drawing.primary_label && (
              <span className="absolute right-3 top-3 rounded-full border border-cyan-300/30 bg-slate-950/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-cyan-200 backdrop-blur-md">
                {drawing.primary_label}
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col justify-between space-y-4 p-4 sm:p-5">
            <div>
              <h3 className="truncate font-display text-lg font-semibold text-white sm:text-xl">{drawing.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-slate-300 sm:text-sm">
                {drawing.description || "Air drawing captured from live studio."}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 sm:text-sm">
                <span>{formatDate(drawing.created_at)}</span>
                {drawing.primary_confidence ? (
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-cyan-200">
                    {confidencePercent(drawing.primary_confidence)} match
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onOpen(drawing.id)}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-3 py-2.5 text-xs font-medium text-cyan-100 transition hover:bg-cyan-400/20 sm:text-sm"
                >
                  <Eye className="h-4 w-4" />
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => onExport(drawing.id, "png")}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-white/10 sm:text-sm"
                >
                  <Download className="h-4 w-4" />
                  PNG
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(drawing.id)}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-3 py-2.5 text-xs font-medium text-rose-100 transition hover:bg-rose-400/20 sm:text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}

export default SavedGallery;
