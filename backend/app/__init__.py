"""AirScribe AI backend package."""

import os
import tempfile
from pathlib import Path

mpl_cache_dir = Path(tempfile.gettempdir()) / "airscribe-mpl"
mpl_cache_dir.mkdir(parents=True, exist_ok=True)
os.environ.setdefault("MPLCONFIGDIR", str(mpl_cache_dir))
