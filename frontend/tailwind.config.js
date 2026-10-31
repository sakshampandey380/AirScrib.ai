/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#020816",
        midnight: "#061126",
        glass: "rgba(12, 22, 43, 0.68)",
        cyan: {
          300: "#82f0ff",
          400: "#23d3ff",
          500: "#1197ff",
        },
        violet: {
          400: "#9c5dff",
          500: "#7f3eff",
          600: "#d93eff",
        },
        amber: {
          200: "#f8d28d",
          300: "#f1c46e",
          400: "#dea84e",
        },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(130,240,255,0.15), 0 20px 60px rgba(8,18,42,0.55)",
        neon: "0 0 24px rgba(35,211,255,0.24), 0 0 44px rgba(241,196,110,0.18)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top, rgba(35,211,255,0.2), transparent 30%), radial-gradient(circle at bottom right, rgba(217,62,255,0.12), transparent 36%), radial-gradient(circle at top right, rgba(241,196,110,0.1), transparent 24%)",
      },
    },
  },
  plugins: [],
};
