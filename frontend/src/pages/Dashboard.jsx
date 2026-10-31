import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import SavedGallery from "../components/SavedGallery";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import GestureShowcase from "../components/GestureShowcase";
import { deleteDrawing, exportDrawing, getDrawings } from "../services/drawingService";
import { downloadFromUrl } from "../utils/canvas";

function Dashboard() {
  const navigate = useNavigate();
  const [drawings, setDrawings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDrawings();
  }, []);

  async function loadDrawings() {
    try {
      setIsLoading(true);
      const data = await getDrawings();
      setDrawings(data);
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Unable to load drawings.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteDrawing(id);
      setDrawings((current) => current.filter((item) => item.id !== id));
      toast.success("Drawing deleted.");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Delete failed.");
    }
  }

  async function handleExport(id, format) {
    try {
      const data = await exportDrawing(id, format);
      downloadFromUrl(data.download_path);
      toast.success(`Export ready at ${data.download_path}`);
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Export failed.");
    }
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 xl:grid-cols-[250px_1fr] xl:px-8">
      <Sidebar />
      <section className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70 sm:text-sm">Dashboard</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-white sm:text-4xl">
            Saved drawings and AI history
          </h1>
          <p className="mt-2 max-w-2xl text-xs text-slate-300 sm:text-sm">
            Reopen your sessions, review predicted labels, export polished versions, and keep the gallery curated.
          </p>
        </div>

        {isLoading ? (
          <div className="glass-panel flex min-h-[320px] items-center justify-center p-8">
            <Loader label="Loading gallery..." />
          </div>
        ) : (
          <SavedGallery drawings={drawings} onDelete={handleDelete} onOpen={(id) => navigate(`/studio?drawing=${id}`)} onExport={handleExport} />
        )}

        <GestureShowcase />
      </section>
    </main>
  );
}

export default Dashboard;
