import { Sparkles } from "lucide-react";

function EmptyState({ title, description, action }) {
  return (
    <div className="glass-panel flex min-h-[240px] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-cyan-200">
        <Sparkles className="h-8 w-8" />
      </div>
      <div>
        <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 max-w-md text-sm text-slate-300">{description}</p>
      </div>
      {action}
    </div>
  );
}

export default EmptyState;

