import { motion } from "framer-motion";
import { Brain, Camera, Layers3, Sparkles, WandSparkles } from "lucide-react";
import { Link } from "react-router-dom";

import brandMark from "../assets/brand-mark.svg";
import GlassPanel from "../components/GlassPanel";
import { useAuth } from "../hooks/useAuth";

const features = [
  {
    icon: Camera,
    title: "Real-time Air Pen & Touch",
    description:
      "Use your webcam with MediaPipe hand landmarks to sketch in the air, or draw directly with touch/mouse on any device.",
  },
  {
    icon: Brain,
    title: "Instant Shape Recognition",
    description:
      "Detect circles, stars, arrows, faces, houses, hearts, and more with confidence scoring and clean vector overlays.",
  },
  {
    icon: Layers3,
    title: "Structured Drawing Memory",
    description:
      "Persist sessions, strokes, points, gesture logs, multi-format exports (PNG, JPG, SVG, PDF), and AI predictions in MySQL.",
  },
];

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-10 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
        <GlassPanel className="relative overflow-hidden p-6 sm:p-8 md:p-10">
          <div className="absolute right-[-10%] top-[-15%] h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[15%] h-60 w-60 rounded-full bg-violet-500/20 blur-3xl" />

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.22em] text-cyan-200 sm:mb-8 sm:px-4 sm:py-2 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Premium Air-Drawing Workspace
            </div>
            <h1 className="max-w-3xl font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
              Sketch in the air and let AI turn gesture-driven motion into a saved visual memory.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8">
              AirScribe AI combines webcam hand tracking, interactive touch & mouse canvas rendering, shape recognition,
              exports, and a polished gallery into one responsive creative studio.
            </p>

            <div className="mt-7 flex flex-wrap gap-3.5 sm:mt-8 sm:gap-4">
              <Link
                to={isAuthenticated ? "/studio" : "/signup"}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-neon transition hover:brightness-110 sm:text-base"
              >
                <WandSparkles className="h-5 w-5" />
                Launch Studio
              </Link>
              <Link
                to="/dashboard"
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/10 sm:text-base"
              >
                View Dashboard
              </Link>
            </div>
          </motion.div>
        </GlassPanel>

        <GlassPanel className="flex flex-col items-center justify-center p-6 text-center sm:p-8">
          <motion.img
            src={brandMark}
            alt="AirScribe logo mark"
            animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="h-32 w-32 drop-shadow-[0_0_30px_rgba(35,211,255,0.4)] sm:h-40 sm:w-40"
          />
          <h2 className="mt-5 font-display text-2xl font-semibold text-white sm:mt-6 sm:text-3xl">AirScribe AI</h2>
          <p className="mt-2 text-xs uppercase tracking-[0.35em] text-cyan-200/75 sm:mt-3 sm:text-sm">
            Write in air. See in real.
          </p>
          <div className="mt-6 grid w-full gap-3 text-left sm:mt-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300 sm:text-sm">
              Works across Desktop, Tablet, and Mobile with Air Pen webcam tracking + direct Touch/Mouse drawing.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300 sm:text-sm">
              Dark navy glassmorphism surfaces keep contrast high for live camera and glowing neon strokes.
            </div>
          </div>
        </GlassPanel>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassPanel className="h-full p-6">
                <div className="mb-4 inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-200">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
              </GlassPanel>
            </motion.div>
          );
        })}
      </section>
    </main>
  );
}

export default Home;
