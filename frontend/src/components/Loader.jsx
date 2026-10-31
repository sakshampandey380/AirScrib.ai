function Loader({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <span className="h-3 w-3 animate-pulse rounded-full bg-cyan-400 shadow-neon" />
      <span>{label}</span>
    </div>
  );
}

export default Loader;

