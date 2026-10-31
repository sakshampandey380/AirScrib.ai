from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserPublic"


class UserPublic(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    profile_picture: str | None = None
    bio: str | None = None

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UserSettingsBase(BaseModel):
    theme_mode: str = "dark"
    brush_color: str = "#23d3ff"
    brush_size: int = 6
    gesture_sensitivity: float = 0.2
    camera_quality: str = "720p"
    auto_recognition: bool = True


class UserSettingsUpdate(UserSettingsBase):
    pass


class UserSettingsResponse(UserSettingsBase):
    id: int
    user_id: int
    updated_at: datetime

    model_config = {"from_attributes": True}


class PointPayload(BaseModel):
    x: float
    y: float
    pressure: float | None = None
    timestamp_ms: int | None = None


class StrokePayload(BaseModel):
    stroke_order: int = 0
    tool_type: str = "brush"
    color: str = "#23d3ff"
    size: int = 6
    gesture_trigger: str | None = None
    composite_mode: str = "source-over"
    started_at: datetime | None = None
    ended_at: datetime | None = None
    points: list[PointPayload] = Field(default_factory=list)


class DrawingCreate(BaseModel):
    session_id: int | None = None
    title: str
    description: str | None = None
    image_data: str
    svg_markup: str | None = None
    canvas_width: int = 1280
    canvas_height: int = 720
    background_style: str | None = None
    strokes: list[StrokePayload] = Field(default_factory=list)
    auto_recognize: bool = True


class RecognitionResult(BaseModel):
    label: str
    confidence: float
    bounding_box: dict[str, Any] | None = None
    clean_asset_key: str | None = None


class PredictionCreate(BaseModel):
    model_name: str = "manual-entry"
    label: str
    confidence: float
    inference_time_ms: int | None = None
    raw_payload: dict[str, Any] | None = None


class GestureLogCreate(BaseModel):
    session_id: int | None = None
    drawing_id: int | None = None
    gesture_name: str
    confidence: float | None = None
    trigger_state: str | None = None


class DrawingSessionCreate(BaseModel):
    session_name: str = "Air Session"
    metadata_json: dict[str, Any] | None = None


class DrawingSessionResponse(BaseModel):
    id: int
    user_id: int
    session_name: str
    started_at: datetime
    ended_at: datetime | None = None
    last_gesture: str | None = None

    model_config = {"from_attributes": True}


class DrawingSummary(BaseModel):
    id: int
    title: str
    description: str | None = None
    image_path: str
    primary_label: str | None = None
    primary_confidence: float | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class StrokePointResponse(PointPayload):
    id: int
    point_order: int

    model_config = {"from_attributes": True}


class StrokeResponse(BaseModel):
    id: int
    stroke_order: int
    tool_type: str
    color: str
    size: int
    gesture_trigger: str | None = None
    composite_mode: str
    points: list[StrokePointResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class AiPredictionResponse(BaseModel):
    id: int
    model_name: str
    label: str
    confidence: float
    inference_time_ms: int | None = None
    raw_payload: dict[str, Any] | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class RecognizedObjectResponse(BaseModel):
    id: int
    label: str
    confidence: float
    bounding_box: dict[str, Any] | None = None
    clean_asset_key: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SavedExportResponse(BaseModel):
    id: int
    file_format: str
    file_path: str
    file_size_kb: float | None = None
    exported_at: datetime

    model_config = {"from_attributes": True}


class DrawingDetail(DrawingSummary):
    session_id: int | None = None
    svg_markup: str | None = None
    canvas_width: int
    canvas_height: int
    background_style: str | None = None
    strokes: list[StrokeResponse] = Field(default_factory=list)
    predictions: list[AiPredictionResponse] = Field(default_factory=list)
    recognized_objects: list[RecognizedObjectResponse] = Field(default_factory=list)
    exports: list[SavedExportResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class ExportCreate(BaseModel):
    file_format: str = Field(pattern="^(png|jpg|pdf|svg)$")


class ExportResponse(BaseModel):
    id: int
    file_format: str
    download_path: str
    file_size_kb: float | None = None


class FeedbackCreate(BaseModel):
    drawing_id: int | None = None
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class FeedbackResponse(BaseModel):
    id: int
    drawing_id: int | None = None
    rating: int
    comment: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


TokenResponse.model_rebuild()

