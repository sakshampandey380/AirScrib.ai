from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Drawing, SavedExport, User
from app.schemas import ExportCreate, ExportResponse
from app.services.export import export_drawing

router = APIRouter()
settings = get_settings()


@router.post("/drawings/{drawing_id}/export", response_model=ExportResponse)
def export_drawing_route(
    drawing_id: int,
    payload: ExportCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    drawing = db.query(Drawing).filter(Drawing.id == drawing_id, Drawing.user_id == current_user.id).first()
    if not drawing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drawing not found.")

    export_path, file_size_kb = export_drawing(
        source_path=drawing.image_path,
        svg_markup=drawing.svg_markup,
        output_dir=settings.upload_dir_path / "exports",
        file_format=payload.file_format,
    )
    export = SavedExport(
        drawing_id=drawing.id,
        file_format=payload.file_format,
        file_path=export_path,
        file_size_kb=file_size_kb,
    )
    db.add(export)
    db.commit()
    db.refresh(export)
    relative_path = Path(export.file_path).relative_to(settings.upload_dir_path).as_posix()
    download_url = str(request.base_url).rstrip("/") + f"/uploads/{relative_path}"

    return ExportResponse(
        id=export.id,
        file_format=export.file_format,
        download_path=download_url,
        file_size_kb=export.file_size_kb,
    )
