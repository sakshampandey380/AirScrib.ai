from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, UserSettings
from app.schemas import UserSettingsResponse, UserSettingsUpdate

router = APIRouter()


def _get_or_create_settings(db: Session, user_id: int) -> UserSettings:
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        settings = UserSettings(
            user_id=user_id,
            theme_mode="dark",
            brush_color="#23d3ff",
            brush_size=6,
            gesture_sensitivity=0.16,
            camera_quality="720p",
            auto_recognition=True,
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=UserSettingsResponse)
def get_settings_route(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _get_or_create_settings(db, current_user.id)


@router.put("", response_model=UserSettingsResponse)
def update_settings(
    payload: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    settings = _get_or_create_settings(db, current_user.id)
    for field, value in payload.model_dump().items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings


