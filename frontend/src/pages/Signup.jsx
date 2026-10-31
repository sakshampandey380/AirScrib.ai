import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import GlassPanel from "../components/GlassPanel";
import { useAuth } from "../hooks/useAuth";

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    bio: "",
    profile_picture: null,
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          payload.append(key, value);
        }
      });
      await signup(payload);
      toast.success("Account created! Redirecting to login...");
      navigate("/login", {
        replace: true,
        state: {
          justSignedUp: true,
          email: form.email,
          message: "Account created successfully. Please log in to enter AirScribe AI.",
        },
      });
    } catch (error) {
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;
      const message =
        status === 409
          ? "This email is already registered. Please log in instead."
          : Array.isArray(detail)
            ? detail.map((item) => item.msg).join(", ")
            : detail || "Signup failed. Please check if backend server is running.";

      if (status === 409) {
        navigate("/login", {
          replace: true,
          state: {
            existingAccount: true,
            email: form.email,
            message,
          },
        });
        return;
      }

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-7xl items-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-2xl">
        <GlassPanel className="gold-panel p-6 sm:p-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3.5 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Free Creative Account
          </div>
          <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">Create your AirScribe account</h1>
          <p className="mt-2 text-sm text-slate-300">
            Save your air sketches, AI shape predictions, and multi-format exports in your personal gallery.
          </p>

          {errorMessage ? (
            <div className="mt-6 rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {errorMessage}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 md:grid-cols-2">
            <label className="block text-sm text-slate-300">
              Full Name
              <input
                type="text"
                value={form.full_name}
                onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-amber-300/40"
                placeholder="Aarav Sharma"
                required
              />
            </label>

            <label className="block text-sm text-slate-300">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-amber-300/40"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block text-sm text-slate-300 md:col-span-2">
              Short Bio (Optional)
              <textarea
                rows="3"
                value={form.bio}
                onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-amber-300/40"
                placeholder="Creative technologist, visual thinker, AI builder..."
              />
            </label>

            <label className="block text-sm text-slate-300">
              Password (min 6 chars)
              <input
                type="password"
                minLength={6}
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-amber-300/40"
                placeholder="••••••••"
                required
              />
            </label>

            <label className="block text-sm text-slate-300">
              Profile Picture (Optional)
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setForm((current) => ({ ...current, profile_picture: event.target.files?.[0] || null }))
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-amber-300/15 file:px-3.5 file:py-1.5 file:text-xs file:font-medium file:text-amber-50"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-amber-300 px-5 py-3.5 font-semibold text-slate-950 shadow-neon disabled:opacity-70 md:col-span-2"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-300">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-cyan-200 hover:text-white">
              Login here
            </Link>
          </p>
        </GlassPanel>
      </motion.div>
    </main>
  );
}

export default Signup;
