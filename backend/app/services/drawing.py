import os

import cv2
import numpy as np
from sqlalchemy.orm import Session, joinedload

from app.config import get_settings
from app.models import AiPrediction, Drawing, DrawingStroke, RecognizedObject, StrokePoint
from app.schemas import DrawingCreate, PredictionCreate, StrokePayload
from app.services.recognition import recognize_shape
from app.utils.image_tools import save_data_url_image

settings = get_settings()


def _save_stroke_points(db: Session, drawing_id: int, strokes: list[StrokePayload]) -> None:
    for stroke_payload in strokes:
        stroke = DrawingStroke(
            drawing_id=drawing_id,
            stroke_order=stroke_payload.stroke_order,
            tool_type=stroke_payload.tool_type,
            color=stroke_payload.color,
            size=stroke_payload.size,
            gesture_trigger=stroke_payload.gesture_trigger,
            composite_mode=stroke_payload.composite_mode,
            started_at=stroke_payload.started_at,
            ended_at=stroke_payload.ended_at,
        )
        db.add(stroke)
        db.flush()

        for index, point in enumerate(stroke_payload.points):
            db.add(
                StrokePoint(
                    stroke_id=stroke.id,
                    point_order=index,
                    x=point.x,
                    y=point.y,
                    pressure=point.pressure,
                    timestamp_ms=point.timestamp_ms,
                )
            )


def create_drawing(db: Session, user_id: int, payload: DrawingCreate) -> Drawing:
    image_path, thumb_path = save_data_url_image(payload.image_data, settings.upload_dir_path)

    drawing = Drawing(
        user_id=user_id,
        session_id=payload.session_id,
        title=payload.title,
        description=payload.description,
        image_path=image_path,
        thumbnail_path=thumb_path,
        svg_markup=payload.svg_markup,
        canvas_width=payload.canvas_width,
        canvas_height=payload.canvas_height,
        background_style=payload.background_style,
    )
    db.add(drawing)
    db.flush()

    _save_stroke_points(db, drawing.id, payload.strokes)
    db.commit()
    db.refresh(drawing)

    if payload.auto_recognize:
        run_recognition(db, drawing.id)
        db.refresh(drawing)

    return get_drawing(db, drawing.id, user_id)


def update_drawing(db: Session, drawing: Drawing, user_id: int, payload: DrawingCreate) -> Drawing:
    for old_path in [drawing.image_path, drawing.thumbnail_path]:
        if old_path and os.path.exists(old_path):
            try:
                os.remove(old_path)
            except OSError:
                pass

    image_path, thumb_path = save_data_url_image(payload.image_data, settings.upload_dir_path)
    drawing.title = payload.title or drawing.title
    drawing.description = payload.description or drawing.description
    drawing.image_path = image_path
    drawing.thumbnail_path = thumb_path
    drawing.svg_markup = payload.svg_markup
    drawing.canvas_width = payload.canvas_width
    drawing.canvas_height = payload.canvas_height
    drawing.background_style = payload.background_style

    db.query(DrawingStroke).filter(DrawingStroke.drawing_id == drawing.id).delete()
    db.flush()

    _save_stroke_points(db, drawing.id, payload.strokes)
    db.commit()
    db.refresh(drawing)

    if payload.auto_recognize:
        run_recognition(db, drawing.id)
        db.refresh(drawing)

    return get_drawing(db, drawing.id, user_id)


def get_drawing(db: Session, drawing_id: int, user_id: int) -> Drawing | None:
    return (
        db.query(Drawing)
        .options(
            joinedload(Drawing.strokes).joinedload(DrawingStroke.points),
            joinedload(Drawing.predictions),
            joinedload(Drawing.recognized_objects),
            joinedload(Drawing.exports),
        )
        .filter(Drawing.id == drawing_id, Drawing.user_id == user_id)
        .first()
    )


def list_drawings(db: Session, user_id: int) -> list[Drawing]:
    return db.query(Drawing).filter(Drawing.user_id == user_id).order_by(Drawing.created_at.desc()).all()


def delete_drawing(db: Session, drawing: Drawing) -> None:
    for path in [drawing.image_path, drawing.thumbnail_path]:
        if path and os.path.exists(path):
            os.remove(path)
    for export in drawing.exports:
        if export.file_path and os.path.exists(export.file_path):
            os.remove(export.file_path)
    db.delete(drawing)
    db.commit()


def run_recognition(db: Session, drawing_id: int):
    drawing = db.query(Drawing).filter(Drawing.id == drawing_id).first()
    image = cv2.imread(drawing.image_path)
    prediction = recognize_shape(image if image is not None else np.zeros((512, 512, 3), dtype=np.uint8))

    recognized = RecognizedObject(
        drawing_id=drawing.id,
        label=prediction.label,
        confidence=prediction.confidence,
        bounding_box=prediction.bbox,
        clean_asset_key=prediction.clean_asset_key,
    )
    db.add(recognized)
    db.flush()

    db.add(
        AiPrediction(
            drawing_id=drawing.id,
            recognized_object_id=recognized.id,
            model_name="contour-template-v1",
            label=prediction.label,
            confidence=prediction.confidence,
            inference_time_ms=prediction.inference_time_ms,
            raw_payload=prediction.raw_payload,
        )
    )

    drawing.primary_label = prediction.label
    drawing.primary_confidence = prediction.confidence
    db.commit()
    db.refresh(drawing)
    return prediction


def save_prediction(db: Session, drawing_id: int, payload: PredictionCreate) -> AiPrediction:
    prediction = AiPrediction(
        drawing_id=drawing_id,
        model_name=payload.model_name,
        label=payload.label,
        confidence=payload.confidence,
        inference_time_ms=payload.inference_time_ms,
        raw_payload=payload.raw_payload,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction
