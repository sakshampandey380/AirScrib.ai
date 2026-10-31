import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, Sparkles, User as UserIcon, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

import brandMark from "../assets/brand-mark.svg";
import { useAuth } from "../hooks/useAuth";
import { API_ROOT } from "../services/api";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Studio", path: "/studio" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Settings", path: "/settings" },
];

function resolveAvatar(profilePicture) {
  if (!profilePicture) return null;
  if (profilePicture.startsWith("http")) return profilePicture;
  const filename = profilePicture.split("/").pop();
  return `${API_ROOT}/uploads/${filename}`;
}

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const avatarUrl = resolveAvatar(user?.profile_picture);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/65 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <img
            src={brandMark}
            alt="AirScribe AI"
            className="h-10 w-10 transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12"
          />
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">AirScribe AI</p>
            <p className="hidden text-[10px] uppercase tracking-[0.35em] text-cyan-200/75 sm:block">
              Write in air. See in real.
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] p-1.5 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `relative rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-400/20 via-sky-500/20 to-violet-500/20 text-white shadow-[0_0_20px_rgba(35,211,255,0.18)] border border-cyan-300/30"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {isAuthenticated ? (
            <>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1.5 pl-2 pr-4 text-sm text-slate-200 md:flex"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user?.full_name || "User"}
                    className="h-7 w-7 rounded-full border border-cyan-300/40 object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-200">
                    <UserIcon className="h-4 w-4" />
                  </span>
                )}
                <span className="max-w-[140px] truncate font-medium">{user?.full_name}</span>
              </motion.div>
              <button
                type="button"
                onClick={logout}
                title="Logout"
                className="rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-200 transition hover:border-rose-300/40 hover:bg-rose-500/10 hover:text-rose-200 sm:p-3"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:text-white sm:inline-flex"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-neon transition hover:brightness-110 sm:px-4 sm:text-sm"
              >
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Start Free
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-200 transition hover:border-cyan-300/40 hover:text-white lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
              {isAuthenticated && (
                <div className="mb-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.full_name || "User"}
                      className="h-9 w-9 rounded-full border border-cyan-300/40 object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-200">
                      <UserIcon className="h-5 w-5" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-semibold text-white">{user?.full_name}</p>
                    <p className="truncate text-xs text-slate-400">{user?.email}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "border-cyan-300/40 bg-gradient-to-r from-cyan-400/20 to-violet-500/20 text-white shadow-neon"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              {!isAuthenticated && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-slate-950"
                  >
                    <Sparkles className="h-4 w-4" />
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
