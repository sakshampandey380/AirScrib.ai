import { useEffect, useState } from "react";
import { toast } from "sonner";

import GlassPanel from "../components/GlassPanel";
import Loader from "../components/Loader";
import Sidebar from "../components/Sidebar";
import { getSettings, updateSettings } from "../services/settingsService";

function Settings() {
  const [form, setForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then((data) => {
        setForm(data);
        if (data?.theme_mode) {
          document.body.setAttribute("data-theme", data.theme_mode);
        }
      })
      .catch((error) => toast.error(error?.response?.data?.detail || "Unable to load settings."));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateSettings(form);
      setForm(updated);
      if (updated?.theme_mode) {
        document.body.setAttribute("data-theme", updated.theme_mode);
      }
      toast.success("Settings saved and applied.");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Unable to save settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 xl:grid-cols-[250px_1fr] xl:px-8">
      <Sidebar />
      <section className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70 sm:text-sm">Settings</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-white sm:text-4xl">
            Personalize your air workspace
          </h1>
          <p className="mt-2 max-w-2xl text-xs text-slate-300 sm:text-sm">
            Tune gesture sensitivity, brush defaults, theme, and camera quality so the studio feels tailored to you.
          </p>
        </div>

        {!form ? (
          <div className="glass-panel flex min-h-[300px] items-center justify-center p-8">
            <Loader label="Loading settings..." />
          </div>
        ) : (
          <GlassPanel className="p-5 sm:p-8">
            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <label className="text-sm text-slate-300">
                Theme Mode
                <select
                  value={form.theme_mode}
                  onChange={(event) => {
                    const mode = event.target.value;
                    setForm((current) => ({ ...current, theme_mode: mode }));
                    document.body.setAttribute("data-theme", mode);
                  }}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                >
                  <option value="dark">Dark Navy (Default)</option>
                  <option value="midnight">Deep Midnight</option>
                </select>
              </label>

              <label className="text-sm text-slate-300">
                Camera Quality
                <select
                  value={form.camera_quality}
                  onChange={(event) => setForm((current) => ({ ...current, camera_quality: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                >
                  <option value="480p">480p (Fastest on Mobile)</option>
                  <option value="720p">720p (Recommended HD)</option>
                  <option value="1080p">1080p (Full HD)</option>
                </select>
              </label>

              <label className="text-sm text-slate-300">
                Default Brush Color
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
                  <input
                    type="color"
                    value={form.brush_color}
                    onChange={(event) => setForm((current) => ({ ...current, brush_color: event.target.value }))}
                    className="h-10 w-12 cursor-pointer rounded-xl border-0 bg-transparent"
                  />
                  <span className="font-mono text-xs text-white">{form.brush_color.toUpperCase()}</span>
                </div>
              </label>

              <label className="text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Default Brush Size</span>
                  <span className="font-mono text-xs text-cyan-200">{form.brush_size}px</span>
                </div>
                <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
                  <input
                    type="range"
                    min="2"
                    max="28"
                    value={form.brush_size}
                    onChange={(event) => setForm((current) => ({ ...current, brush_size: Number(event.target.value) }))}
                    className="w-full cursor-pointer accent-cyan-400"
                  />
                </div>
              </label>

              <label className="text-sm text-slate-300 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span>Pinch Gesture Sensitivity</span>
                  <span className="font-mono text-xs text-violet-200">{form.gesture_sensitivity}</span>
                </div>
                <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
                  <input
                    type="range"
                    min="0.08"
                    max="0.3"
                    step="0.01"
                    value={form.gesture_sensitivity}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, gesture_sensitivity: Number(event.target.value) }))
                    }
                    className="w-full cursor-pointer accent-violet-400"
                  />
                  <div className="mt-1 flex justify-between text-xs text-slate-400">
                    <span>Strict Pinch (0.08)</span>
                    <span>Relaxed Pinch (0.30)</span>
                  </div>
                </div>
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200 md:col-span-2">
                <div>
                  <p className="font-medium text-white">Auto AI Shape Recognition</p>
                  <p className="text-xs text-slate-400">Automatically run shape recognition whenever a sketch is saved</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.auto_recognition}
                  onChange={(event) => setForm((current) => ({ ...current, auto_recognition: event.target.checked }))}
                  className="h-5 w-5 cursor-pointer rounded accent-cyan-400"
                />
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 px-5 py-3.5 font-semibold text-slate-950 shadow-neon transition hover:brightness-110 disabled:opacity-70 md:col-span-2"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </form>
          </GlassPanel>
        )}
      </section>
    </main>
  );
}

export default Settings;
