import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import GlassPanel from "../components/GlassPanel";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: location.state?.email || "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const bannerMessage = location.state?.message || "";

  useEffect(() => {
    if (location.state?.email) {
      setForm((current) => ({ ...current, email: location.state.email }));
    }
  }, [location.state]);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await login(form);
      navigate(location.state?.from || "/studio");
    } catch (error) {
      setErrorMessage(error?.response?.data?.detail || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-lg">
        <GlassPanel className="gold-panel p-8">
          <h1 className="font-display text-3xl font-semibold text-white">Welcome back</h1>
          <p className="mt-3 text-sm text-slate-300">Log in to reopen your saved drawings, gestures, and exports.</p>

          {bannerMessage ? (
            <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-50">
              {bannerMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {errorMessage}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block text-sm text-slate-300">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block text-sm text-slate-300">
              Password
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                placeholder="********"
                required
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-amber-300 px-5 py-3 font-semibold text-slate-950 shadow-neon disabled:opacity-70"
            >
              {isSubmitting ? "Logging in..." : "Login"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-300">
            New to AirScribe?{" "}
            <Link to="/signup" className="text-cyan-200 hover:text-white">
              Create your account
            </Link>
          </p>
        </GlassPanel>
      </motion.div>
    </main>
  );
}

export default Login;
