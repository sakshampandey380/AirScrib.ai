from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Drawing, DrawingSession, GestureLog, User
from app.schemas import (
    AiPredictionResponse,
    DrawingCreate,
    DrawingDetail,
    DrawingSessionCreate,
    DrawingSessionResponse,
    DrawingSummary,
    GestureLogCreate,
    PredictionCreate,
    RecognitionResult,
    StrokePayload,
)
from app.services.drawing import (
    create_drawing,
    get_drawing,
    list_drawings,
    run_recognition,
    save_prediction,
    update_drawing,
)

router = APIRouter()


@router.post("/sessions", response_model=DrawingSessionResponse)
def create_session(
    payload: DrawingSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = DrawingSession(
        user_id=current_user.id,
        session_name=payload.session_name,
        metadata_json=payload.metadata_json,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.post("/drawings", response_model=DrawingDetail)
def save_drawing(
    payload: DrawingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_drawing(db, current_user.id, payload)


@router.put("/drawings/{drawing_id}", response_model=DrawingDetail)
def update_existing_drawing(
    drawing_id: int,
    payload: DrawingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    drawing = db.query(Drawing).filter(Drawing.id == drawing_id, Drawing.user_id == current_user.id).first()
    if not drawing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drawing not found.")
    return update_drawing(db, drawing, current_user.id, payload)


@router.get("/drawings", response_model=list[DrawingSummary])
def get_drawings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return list_drawings(db, current_user.id)


@router.get("/drawings/{drawing_id}", response_model=DrawingDetail)
def get_single_drawing(
    drawing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    drawing = get_drawing(db, drawing_id, current_user.id)
    if not drawing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drawing not found.")
    return drawing


@router.delete("/drawings/{drawing_id}")
def delete_drawing(
    drawing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    drawing = db.query(Drawing).filter(Drawing.id == drawing_id, Drawing.user_id == current_user.id).first()
    if not drawing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drawing not found.")

    from app.services.drawing import delete_drawing as delete_drawing_service

    delete_drawing_service(db, drawing)
    return {"message": "Drawing deleted successfully."}


@router.post("/drawings/{drawing_id}/strokes", response_model=DrawingDetail)
def save_strokes(
    drawing_id: int,
    strokes: list[StrokePayload],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    drawing = db.query(Drawing).filter(Drawing.id == drawing_id, Drawing.user_id == current_user.id).first()
    if not drawing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drawing not found.")

    from app.services.drawing import _save_stroke_points

    _save_stroke_points(db, drawing_id, strokes)
    db.commit()
    return get_drawing(db, drawing_id, current_user.id)


@router.post("/drawings/{drawing_id}/recognize", response_model=RecognitionResult)
def recognize_drawing(
    drawing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    drawing = db.query(Drawing).filter(Drawing.id == drawing_id, Drawing.user_id == current_user.id).first()
    if not drawing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drawing not found.")
    prediction = run_recognition(db, drawing_id)
    return RecognitionResult(
        label=prediction.label,
        confidence=prediction.confidence,
        bounding_box=prediction.bbox,
        clean_asset_key=prediction.clean_asset_key,
    )


@router.post("/drawings/{drawing_id}/predictions", response_model=AiPredictionResponse)
def create_prediction(
    drawing_id: int,
    payload: PredictionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    drawing = db.query(Drawing).filter(Drawing.id == drawing_id, Drawing.user_id == current_user.id).first()
    if not drawing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Drawing not found.")
    return save_prediction(db, drawing_id, payload)


@router.post("/gesture-logs")
def save_gesture_log(
    payload: GestureLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = GestureLog(
        user_id=current_user.id,
        session_id=payload.session_id,
        drawing_id=payload.drawing_id,
        gesture_name=payload.gesture_name,
        confidence=payload.confidence,
        trigger_state=payload.trigger_state,
    )
    db.add(log)

    if payload.session_id:
        session = db.query(DrawingSession).filter(DrawingSession.id == payload.session_id).first()
        if session:
            session.last_gesture = payload.gesture_name

    db.commit()
    db.refresh(log)
    return {"message": "Gesture logged.", "id": log.id}


@router.websocket("/ws/studio/{session_id}")
async def studio_socket(websocket: WebSocket, session_id: int):
    await websocket.accept()
    try:
        await websocket.send_json({"type": "connected", "session_id": session_id})
        while True:
            payload = await websocket.receive_json()
            await websocket.send_json(
                {
                    "type": "telemetry",
                    "session_id": session_id,
                    "gesture": payload.get("gesture", "idle"),
                    "pointer": payload.get("pointer"),
                    "timestamp": payload.get("timestamp"),
                }
            )
    except WebSocketDisconnect:
        return

