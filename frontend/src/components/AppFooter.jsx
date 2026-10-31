import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

import GestureShowcase from "./GestureShowcase";

function AppFooter() {
  return (
    <footer className="mx-auto mt-8 flex max-w-7xl flex-col gap-6 px-4 pb-10 sm:px-6 lg:px-8">
      <GestureShowcase compact />

      <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-950/45 px-6 py-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-xl font-semibold text-white">AirScribe AI</p>
          <p className="mt-1 text-sm text-slate-400">
            Write in air. See in real. Save the idea before it fades.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <Link to="/studio" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10">
            Open Studio
          </Link>
          <Link to="/dashboard" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10">
            Dashboard
          </Link>
          <a
            href="http://127.0.0.1:5173"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-cyan-100 transition hover:bg-cyan-400/15"
          >
            Local App
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;

