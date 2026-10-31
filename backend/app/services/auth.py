from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import User, UserSettings
from app.utils.image_tools import save_profile_image
from app.utils.security import hash_password, verify_password

settings = get_settings()


def create_user(
    db: Session,
    full_name: str,
    email: str,
    password: str,
    bio: str | None = None,
    profile_picture: UploadFile | None = None,
) -> User:
    existing_user = db.query(User).filter(User.email == email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")

    profile_path = None
    if profile_picture:
        file_bytes = profile_picture.file.read()
        extension = Path(profile_picture.filename or "avatar.png").suffix.replace(".", "") or "png"
        profile_path = save_profile_image(file_bytes, settings.upload_dir_path, extension)

    user = User(
        full_name=full_name,
        email=email.lower(),
        password_hash=hash_password(password),
        bio=bio,
        profile_picture=profile_path,
    )
    db.add(user)
    db.flush()

    db.add(
        UserSettings(
            user_id=user.id,
            theme_mode="dark",
            brush_color="#23d3ff",
            brush_size=6,
            gesture_sensitivity=0.2,
            camera_quality="720p",
            auto_recognition=True,
        )
    )
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    return user
