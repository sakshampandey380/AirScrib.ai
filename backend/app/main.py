from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import Base, engine
from app.routes import auth, drawings, exports, feedback, settings as settings_router
from app.utils.image_tools import ensure_directory

settings = get_settings()
ensure_directory(settings.upload_dir_path)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(drawings.router, prefix="/api", tags=["drawings"])
app.include_router(settings_router.router, prefix="/api/settings", tags=["settings"])
app.include_router(exports.router, prefix="/api", tags=["exports"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["feedback"])

app.mount("/uploads", StaticFiles(directory=settings.upload_dir_path), name="uploads")


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": settings.app_name}


@app.get("/")
def root():
    return {
        "service": settings.app_name,
        "status": "running",
        "health": "/api/health",
        "docs": "/docs",
    }
