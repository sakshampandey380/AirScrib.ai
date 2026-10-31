import clsx from "clsx";

function GlassPanel({ children, className = "" }) {
  return <div className={clsx("glass-panel", className)}>{children}</div>;
}

export default GlassPanel;

