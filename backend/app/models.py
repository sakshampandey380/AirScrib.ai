from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(160), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    profile_picture: Mapped[str | None] = mapped_column(String(255), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    settings: Mapped["UserSettings"] = relationship(back_populates="user", cascade="all, delete-orphan")
    sessions: Mapped[list["DrawingSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    drawings: Mapped[list["Drawing"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    gestures: Mapped[list["GestureLog"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    feedback_items: Mapped[list["Feedback"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    theme_mode: Mapped[str] = mapped_column(String(20), default="dark", nullable=False)
    brush_color: Mapped[str] = mapped_column(String(20), default="#23d3ff", nullable=False)
    brush_size: Mapped[int] = mapped_column(Integer, default=6, nullable=False)
    gesture_sensitivity: Mapped[float] = mapped_column(Float, default=0.2, nullable=False)
    camera_quality: Mapped[str] = mapped_column(String(30), default="720p", nullable=False)
    auto_recognition: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="settings")


class DrawingSession(Base):
    __tablename__ = "drawing_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_name: Mapped[str] = mapped_column(String(120), default="Air Session", nullable=False)
    started_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    ended_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    last_gesture: Mapped[str | None] = mapped_column(String(50), nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    user: Mapped["User"] = relationship(back_populates="sessions")
    drawings: Mapped[list["Drawing"]] = relationship(back_populates="session", cascade="all, delete-orphan")
    gestures: Mapped[list["GestureLog"]] = relationship(back_populates="session", cascade="all, delete-orphan")


class Drawing(Base):
    __tablename__ = "drawings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id: Mapped[int | None] = mapped_column(
        ForeignKey("drawing_sessions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_path: Mapped[str] = mapped_column(String(255), nullable=False)
    thumbnail_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    svg_markup: Mapped[str | None] = mapped_column(Text().with_variant(LONGTEXT, "mysql"), nullable=True)
    canvas_width: Mapped[int] = mapped_column(Integer, default=1280, nullable=False)
    canvas_height: Mapped[int] = mapped_column(Integer, default=720, nullable=False)
    background_style: Mapped[str | None] = mapped_column(String(120), nullable=True)
    primary_label: Mapped[str | None] = mapped_column(String(80), nullable=True)
    primary_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="drawings")
    session: Mapped["DrawingSession | None"] = relationship(back_populates="drawings")
    strokes: Mapped[list["DrawingStroke"]] = relationship(back_populates="drawing", cascade="all, delete-orphan")
    recognized_objects: Mapped[list["RecognizedObject"]] = relationship(
        back_populates="drawing", cascade="all, delete-orphan"
    )
    predictions: Mapped[list["AiPrediction"]] = relationship(back_populates="drawing", cascade="all, delete-orphan")
    gestures: Mapped[list["GestureLog"]] = relationship(back_populates="drawing", cascade="all, delete-orphan")
    exports: Mapped[list["SavedExport"]] = relationship(back_populates="drawing", cascade="all, delete-orphan")
    feedback_items: Mapped[list["Feedback"]] = relationship(back_populates="drawing", cascade="all, delete-orphan")


class DrawingStroke(Base):
    __tablename__ = "drawing_strokes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    drawing_id: Mapped[int] = mapped_column(ForeignKey("drawings.id", ondelete="CASCADE"), nullable=False, index=True)
    stroke_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tool_type: Mapped[str] = mapped_column(String(30), default="brush", nullable=False)
    color: Mapped[str] = mapped_column(String(20), default="#23d3ff", nullable=False)
    size: Mapped[int] = mapped_column(Integer, default=6, nullable=False)
    gesture_trigger: Mapped[str | None] = mapped_column(String(50), nullable=True)
    composite_mode: Mapped[str] = mapped_column(String(30), default="source-over", nullable=False)
    started_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    ended_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)

    drawing: Mapped["Drawing"] = relationship(back_populates="strokes")
    points: Mapped[list["StrokePoint"]] = relationship(back_populates="stroke", cascade="all, delete-orphan")


class StrokePoint(Base):
    __tablename__ = "stroke_points"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    stroke_id: Mapped[int] = mapped_column(
        ForeignKey("drawing_strokes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    point_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    x: Mapped[float] = mapped_column(Float, nullable=False)
    y: Mapped[float] = mapped_column(Float, nullable=False)
    pressure: Mapped[float | None] = mapped_column(Float, nullable=True)
    timestamp_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    stroke: Mapped["DrawingStroke"] = relationship(back_populates="points")


class RecognizedObject(Base):
    __tablename__ = "recognized_objects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    drawing_id: Mapped[int] = mapped_column(ForeignKey("drawings.id", ondelete="CASCADE"), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(80), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    bounding_box: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    clean_asset_key: Mapped[str | None] = mapped_column(String(80), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    drawing: Mapped["Drawing"] = relationship(back_populates="recognized_objects")
    predictions: Mapped[list["AiPrediction"]] = relationship(
        back_populates="recognized_object", cascade="all, delete-orphan"
    )


class GestureLog(Base):
    __tablename__ = "gesture_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id: Mapped[int | None] = mapped_column(
        ForeignKey("drawing_sessions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    drawing_id: Mapped[int | None] = mapped_column(
        ForeignKey("drawings.id", ondelete="SET NULL"), nullable=True, index=True
    )
    gesture_name: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    trigger_state: Mapped[str | None] = mapped_column(String(30), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship(back_populates="gestures")
    session: Mapped["DrawingSession | None"] = relationship(back_populates="gestures")
    drawing: Mapped["Drawing | None"] = relationship(back_populates="gestures")


class SavedExport(Base):
    __tablename__ = "saved_exports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    drawing_id: Mapped[int] = mapped_column(ForeignKey("drawings.id", ondelete="CASCADE"), nullable=False, index=True)
    file_format: Mapped[str] = mapped_column(String(10), nullable=False)
    file_path: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size_kb: Mapped[float | None] = mapped_column(Float, nullable=True)
    exported_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    drawing: Mapped["Drawing"] = relationship(back_populates="exports")


class AiPrediction(Base):
    __tablename__ = "ai_predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    drawing_id: Mapped[int] = mapped_column(ForeignKey("drawings.id", ondelete="CASCADE"), nullable=False, index=True)
    recognized_object_id: Mapped[int | None] = mapped_column(
        ForeignKey("recognized_objects.id", ondelete="SET NULL"), nullable=True, index=True
    )
    model_name: Mapped[str] = mapped_column(String(120), default="contour-template-v1", nullable=False)
    label: Mapped[str] = mapped_column(String(80), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    inference_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    raw_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    drawing: Mapped["Drawing"] = relationship(back_populates="predictions")
    recognized_object: Mapped["RecognizedObject | None"] = relationship(back_populates="predictions")


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    drawing_id: Mapped[int | None] = mapped_column(
        ForeignKey("drawings.id", ondelete="SET NULL"), nullable=True, index=True
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship(back_populates="feedback_items")
    drawing: Mapped["Drawing | None"] = relationship(back_populates="feedback_items")

