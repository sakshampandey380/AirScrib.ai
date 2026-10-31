import { motion } from "framer-motion";
import { Eraser, Hand, HandMetal, Handshake, Sparkles, ThumbsUp } from "lucide-react";

import GlassPanel from "./GlassPanel";

const gestures = [
  {
    title: "Pinch",
    action: "Start drawing",
    icon: Handshake,
    glow: "from-cyan-400/20 to-sky-500/10",
    accent: "text-cyan-200",
    pulseClass: "bg-cyan-300/80",
  },
  {
    title: "Open Palm",
    action: "Stop drawing",
    icon: Hand,
    glow: "from-sky-500/15 to-violet-500/10",
    accent: "text-sky-200",
    pulseClass: "bg-sky-300/80",
  },
  {
    title: "Two Fingers",
    action: "Erase",
    icon: HandMetal,
    glow: "from-violet-500/20 to-fuchsia-500/10",
    accent: "text-violet-200",
    pulseClass: "bg-violet-300/80",
  },
  {
    title: "Thumb Up",
    action: "Save",
    icon: ThumbsUp,
    glow: "from-cyan-400/20 to-violet-500/15",
    accent: "text-cyan-100",
    pulseClass: "bg-cyan-200/80",
  },
  {
    title: "Fist",
    action: "Clear canvas",
    icon: Eraser,
    glow: "from-violet-500/20 to-cyan-500/10",
    accent: "text-violet-100",
    pulseClass: "bg-fuchsia-300/80",
  },
];

function GestureShowcase({ compact = false }) {
  return (
    <GlassPanel className={`relative overflow-hidden ${compact ? "p-5" : "p-6 md:p-8"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(35,211,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(217,62,255,0.12),transparent_34%)]" />
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-200">
              <Sparkles className="h-4 w-4" />
              Gesture controls
            </div>
            <h3 className="mt-4 font-display text-2xl font-semibold text-white md:text-3xl">
              Learn the five hand moves that drive the studio
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              AirScribe feels best when the gestures are visible and memorable, so this guide stays close to the
              experience with soft neon motion and clear actions.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            Camera-first. Gesture-led. Premium by default.
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {gestures.map((gesture, index) => {
            const Icon = gesture.icon;
            return (
              <motion.div
                key={gesture.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.08 }}
                className={`group relative overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br ${gesture.glow} p-[1px]`}
              >
                <div className="relative h-full rounded-[25px] bg-slate-950/80 p-5">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.55, 1, 0.55] }}
                    transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.15 }}
                    className={`absolute right-4 top-4 h-2.5 w-2.5 rounded-full ${gesture.pulseClass}`}
                  />

                  <motion.div
                    animate={{ y: [0, -5, 0], rotate: [0, 2, 0, -2, 0] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.12 }}
                    className="mb-5 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <Icon className={`h-6 w-6 ${gesture.accent}`} />
                  </motion.div>

                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{gesture.title}</p>
                  <p className="mt-2 font-display text-xl font-semibold text-white">{gesture.action}</p>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      animate={{ x: ["-100%", "0%", "120%"] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.18 }}
                      className="h-full w-1/2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}

export default GestureShowcase;

