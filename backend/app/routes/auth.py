from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import LoginRequest, TokenResponse, UserPublic
from app.services.auth import authenticate_user, create_user
from app.utils.security import create_access_token

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
def register(
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    bio: str | None = Form(None),
    profile_picture: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    user = create_user(
        db=db,
        full_name=full_name,
        email=email,
        password=password,
        bio=bio,
        profile_picture=profile_picture,
    )
    token = create_access_token(user.email)
    return TokenResponse(access_token=token, user=user)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    token = create_access_token(user.email)
    return TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=UserPublic)
def me(current_user: User = Depends(get_current_user)):
    return current_user

