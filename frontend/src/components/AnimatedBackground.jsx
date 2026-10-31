import { motion } from "framer-motion";

const FLYING_ITEMS = [
  {
    id: "orb-1",
    type: "circle",
    size: 46,
    initialX: "8%",
    initialY: "18%",
    animateX: ["0vw", "22vw", "-6vw", "14vw", "0vw"],
    animateY: ["0vh", "14vh", "28vh", "-8vh", "0vh"],
    duration: 26,
    delay: 0,
  },
  {
    id: "star-1",
    type: "star",
    size: 42,
    initialX: "82%",
    initialY: "14%",
    animateX: ["0vw", "-24vw", "-10vw", "-30vw", "0vw"],
    animateY: ["0vh", "20vh", "36vh", "10vh", "0vh"],
    duration: 30,
    delay: 1.5,
  },
  {
    id: "triangle-1",
    type: "triangle",
    size: 44,
    initialX: "18%",
    initialY: "72%",
    animateX: ["0vw", "28vw", "12vw", "34vw", "0vw"],
    animateY: ["0vh", "-26vh", "-12vh", "-34vh", "0vh"],
    duration: 28,
    delay: 0.8,
  },
  {
    id: "heart-1",
    type: "heart",
    size: 38,
    initialX: "74%",
    initialY: "68%",
    animateX: ["0vw", "-20vw", "-35vw", "-12vw", "0vw"],
    animateY: ["0vh", "-18vh", "-32vh", "-10vh", "0vh"],
    duration: 24,
    delay: 2.2,
  },
  {
    id: "sparkle-1",
    type: "sparkle",
    size: 36,
    initialX: "48%",
    initialY: "12%",
    animateX: ["0vw", "18vw", "-18vw", "8vw", "0vw"],
    animateY: ["0vh", "30vh", "48vh", "18vh", "0vh"],
    duration: 22,
    delay: 0.4,
  },
  {
    id: "diamond-1",
    type: "diamond",
    size: 34,
    initialX: "32%",
    initialY: "42%",
    animateX: ["0vw", "-16vw", "20vw", "-8vw", "0vw"],
    animateY: ["0vh", "-20vh", "16vh", "26vh", "0vh"],
    duration: 27,
    delay: 3.1,
  },
  {
    id: "pen-wave-1",
    type: "wave",
    size: 64,
    initialX: "62%",
    initialY: "36%",
    animateX: ["0vw", "-26vw", "12vw", "-14vw", "0vw"],
    animateY: ["0vh", "22vh", "-16vh", "12vh", "0vh"],
    duration: 32,
    delay: 1.1,
  },
  {
    id: "star-2",
    type: "star",
    size: 30,
    initialX: "12%",
    initialY: "46%",
    animateX: ["0vw", "30vw", "45vw", "18vw", "0vw"],
    animateY: ["0vh", "-14vh", "18vh", "-6vh", "0vh"],
    duration: 25,
    delay: 2.7,
  },
  {
    id: "circle-2",
    type: "circle",
    size: 32,
    initialX: "88%",
    initialY: "44%",
    animateX: ["0vw", "-28vw", "-14vw", "-36vw", "0vw"],
    animateY: ["0vh", "-22vh", "14vh", "-8vh", "0vh"],
    duration: 29,
    delay: 1.9,
  },
  {
    id: "sparkle-2",
    type: "sparkle",
    size: 28,
    initialX: "54%",
    initialY: "82%",
    animateX: ["0vw", "-22vw", "16vw", "-10vw", "0vw"],
    animateY: ["0vh", "-32vh", "-48vh", "-20vh", "0vh"],
    duration: 23,
    delay: 3.6,
  },
];

const PARTICLES = Array.from({ length: 16 }, (_, idx) => ({
  id: `particle-${idx}`,
  left: `${(idx * 17 + 7) % 94}%`,
  top: `${(idx * 23 + 11) % 90}%`,
  size: (idx % 3) * 2 + 4,
  duration: 14 + (idx % 7) * 3,
  delay: (idx % 5) * 1.2,
  driftX: (idx % 2 === 0 ? 1 : -1) * (40 + (idx % 4) * 25),
  driftY: (idx % 3 === 0 ? -1 : 1) * (50 + (idx % 5) * 20),
}));

function ShapeSvg({ type, id }) {
  const gradId = `fly-grad-${id}`;
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full overflow-visible" fill="none">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <motion.stop
            offset="0%"
            animate={{
              stopColor: ["#23d3ff", "#9c5dff", "#f1c46e", "#d93eff", "#23d3ff"],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <motion.stop
            offset="100%"
            animate={{
              stopColor: ["#d93eff", "#23d3ff", "#7f3eff", "#f1c46e", "#d93eff"],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
        </linearGradient>
      </defs>

      {type === "circle" && (
        <>
          <circle cx="32" cy="32" r="20" stroke={`url(#${gradId})`} strokeWidth="2.5" strokeDasharray="8 4" />
          <circle cx="32" cy="32" r="10" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeOpacity="0.6" />
        </>
      )}
      {type === "star" && (
        <path
          d="M32 8L38.5 22.8L54.6 24.7L42.6 35.8L45.9 51.7L32 43.6L18.1 51.7L21.4 35.8L9.4 24.7L25.5 22.8L32 8Z"
          stroke={`url(#${gradId})`}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      )}
      {type === "triangle" && (
        <path
          d="M32 10L54 50H10L32 10Z"
          stroke={`url(#${gradId})`}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}
      {type === "heart" && (
        <path
          d="M32 52C32 52 10 38 10 23C10 15.5 16 10 23 10C27.4 10 30.5 12.4 32 15.5C33.5 12.4 36.6 10 41 10C48 10 54 15.5 54 23C54 38 32 52 32 52Z"
          stroke={`url(#${gradId})`}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      )}
      {type === "sparkle" && (
        <path
          d="M32 6C33.5 21 43 30.5 58 32C43 33.5 33.5 43 32 58C30.5 43 21 33.5 6 32C21 30.5 30.5 21 32 6Z"
          stroke={`url(#${gradId})`}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      )}
      {type === "diamond" && (
        <rect
          x="32"
          y="8"
          width="34"
          height="34"
          rx="5"
          transform="rotate(45 32 8)"
          stroke={`url(#${gradId})`}
          strokeWidth="2.4"
        />
      )}
      {type === "wave" && (
        <path
          d="M6 36C16 16 28 16 34 32C40 48 50 46 58 22"
          stroke={`url(#${gradId})`}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none" aria-hidden="true">
      {/* Morphing Color-Shifting Ambient Glow Blobs */}
      <motion.div
        animate={{
          x: [0, 90, -40, 0],
          y: [0, 50, -30, 0],
          scale: [1, 1.18, 0.92, 1],
          backgroundColor: [
            "rgba(35, 211, 255, 0.18)",
            "rgba(156, 93, 255, 0.18)",
            "rgba(241, 196, 110, 0.14)",
            "rgba(35, 211, 255, 0.18)",
          ],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 -top-16 h-80 w-80 rounded-full blur-3xl sm:h-96 sm:w-96"
      />

      <motion.div
        animate={{
          x: [0, -100, 50, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.22, 0.9, 1],
          backgroundColor: [
            "rgba(217, 62, 255, 0.15)",
            "rgba(35, 211, 255, 0.16)",
            "rgba(127, 62, 255, 0.18)",
            "rgba(217, 62, 255, 0.15)",
          ],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -right-24 h-80 w-80 rounded-full blur-3xl sm:h-[420px] sm:w-[420px]"
      />

      <motion.div
        animate={{
          x: [0, -60, 70, 0],
          y: [0, 80, -40, 0],
          backgroundColor: [
            "rgba(241, 196, 110, 0.11)",
            "rgba(35, 211, 255, 0.14)",
            "rgba(217, 62, 255, 0.12)",
            "rgba(241, 196, 110, 0.11)",
          ],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[12%] top-[20%] h-64 w-64 rounded-full blur-3xl sm:h-80 sm:w-80"
      />

      {/* Subtle architectural perspective grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.032)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.032)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_90%)]" />

      {/* Flying & Color-Shifting AirScribe Shapes */}
      {FLYING_ITEMS.map((item) => (
        <motion.div
          key={item.id}
          style={{
            left: item.initialX,
            top: item.initialY,
            width: item.size,
            height: item.size,
          }}
          animate={{
            x: item.animateX,
            y: item.animateY,
            rotate: [0, 120, 240, 360],
            scale: [0.88, 1.14, 0.94, 1.08, 0.88],
            opacity: [0.18, 0.42, 0.24, 0.45, 0.18],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute drop-shadow-[0_0_16px_rgba(35,211,255,0.35)] will-change-transform"
        >
          <ShapeSvg type={item.type} id={item.id} />
        </motion.div>
      ))}

      {/* Flying Neon Air-Pen Light Comets */}
      <motion.div
        animate={{
          x: ["-20vw", "115vw"],
          y: ["18vh", "62vh"],
          opacity: [0, 0.65, 0.65, 0],
        }}
        transition={{ duration: 13, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
        className="absolute left-0 top-0 h-[2px] w-40 rotate-[18deg] rounded-full bg-gradient-to-r from-transparent via-cyan-300 to-violet-400 shadow-[0_0_20px_#23d3ff]"
      />
      <motion.div
        animate={{
          x: ["115vw", "-20vw"],
          y: ["75vh", "22vh"],
          opacity: [0, 0.55, 0.55, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, repeatDelay: 6, delay: 5, ease: "easeInOut" }}
        className="absolute left-0 top-0 h-[2px] w-48 -rotate-[18deg] rounded-full bg-gradient-to-r from-transparent via-amber-300 to-fuchsia-400 shadow-[0_0_20px_#d93eff]"
      />

      {/* Floating Color-Changing Luminous Particles */}
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
          }}
          animate={{
            x: [0, p.driftX, -p.driftX * 0.6, 0],
            y: [0, p.driftY, -p.driftY * 0.5, 0],
            opacity: [0.15, 0.7, 0.25, 0.75, 0.15],
            backgroundColor: ["#23d3ff", "#9c5dff", "#f1c46e", "#d93eff", "#23d3ff"],
            boxShadow: [
              "0 0 12px rgba(35,211,255,0.7)",
              "0 0 14px rgba(156,93,255,0.7)",
              "0 0 12px rgba(241,196,110,0.7)",
              "0 0 14px rgba(217,62,255,0.7)",
              "0 0 12px rgba(35,211,255,0.7)",
            ],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute rounded-full will-change-transform"
        />
      ))}

      {/* Top luminous horizon line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/45 to-transparent" />
    </div>
  );
}

export default AnimatedBackground;
