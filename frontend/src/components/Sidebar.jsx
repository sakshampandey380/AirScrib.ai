import { Camera, LayoutDashboard, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

import GlassPanel from "./GlassPanel";

const items = [
  { path: "/studio", label: "Studio", icon: Camera },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/settings", label: "Settings", icon: Settings },
];

function Sidebar() {
  return (
    <>
      {/* Mobile / Tablet Quick Switch Bar */}
      <GlassPanel className="flex items-center justify-between gap-2 p-2 xl:hidden">
        {items.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-medium transition sm:text-sm ${
                isActive
                  ? "border border-cyan-300/35 bg-gradient-to-r from-cyan-400/20 to-violet-500/20 text-white shadow-neon"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0 text-cyan-300" />
            <span>{label}</span>
          </NavLink>
        ))}
      </GlassPanel>

      {/* Desktop Sticky Sidebar */}
      <GlassPanel className="sticky top-24 hidden h-fit p-4 xl:block">
        <p className="mb-3 px-3 text-xs uppercase tracking-[0.25em] text-cyan-200/70">Workspace</p>
        <div className="space-y-2">
          {items.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border-cyan-300/35 bg-gradient-to-r from-cyan-400/20 to-violet-500/20 text-white shadow-neon"
                    : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4 text-cyan-300" />
              {label}
            </NavLink>
          ))}
        </div>
      </GlassPanel>
    </>
  );
}

export default Sidebar;
