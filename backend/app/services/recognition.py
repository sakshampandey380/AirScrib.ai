from __future__ import annotations

import math
import time
from dataclasses import dataclass

import cv2
import numpy as np


@dataclass
class PredictionResult:
    label: str
    confidence: float
    bbox: dict[str, int] | None
    clean_asset_key: str
    inference_time_ms: int
    raw_payload: dict


def _create_canvas() -> np.ndarray:
    return np.zeros((256, 256), dtype=np.uint8)


def _normalize_mask(mask: np.ndarray, pad: int = 28) -> np.ndarray:
    """Crop non-zero region of a binary mask and scale it into a centered (256-2*pad) box."""
    coords = cv2.findNonZero(mask)
    norm = np.zeros((256, 256), dtype=np.uint8)
    if coords is None:
        return norm
    x, y, w, h = cv2.boundingRect(coords)
    if w <= 0 or h <= 0:
        return norm
    crop = mask[y : y + h, x : x + w]
    target_size = 256 - 2 * pad
    scale = min(target_size / float(w), target_size / float(h))
    nw = max(1, int(round(w * scale)))
    nh = max(1, int(round(h * scale)))
    resized = cv2.resize(crop, (nw, nh), interpolation=cv2.INTER_AREA)
    _, resized = cv2.threshold(resized, 40, 255, cv2.THRESH_BINARY)
    ox = (256 - nw) // 2
    oy = (256 - nh) // 2
    norm[oy : oy + nh, ox : ox + nw] = resized
    # Standardize stroke thickness & blur for smooth spatial correlation
    norm = cv2.dilate(norm, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    return cv2.GaussianBlur(norm, (17, 17), 0)


def _create_template_canvas(label: str) -> np.ndarray:
    canvas = _create_canvas()
    color = 255
    thickness = 14

    if label == "circle":
        cv2.circle(canvas, (128, 128), 80, color, thickness)
    elif label == "square":
        cv2.rectangle(canvas, (52, 52), (204, 204), color, thickness)
    elif label == "triangle":
        pts = np.array([[128, 42], [42, 208], [214, 208]], np.int32)
        cv2.polylines(canvas, [pts], True, color, thickness)
    elif label == "heart":
        cv2.circle(canvas, (90, 96), 36, color, thickness)
        cv2.circle(canvas, (166, 96), 36, color, thickness)
        pts = np.array([[48, 110], [128, 214], [208, 110]], np.int32)
        cv2.polylines(canvas, [pts], True, color, thickness)
    elif label == "star":
        pts = np.array(
            [[128, 32], [151, 97], [220, 97], [164, 139], [185, 210], [128, 166], [71, 210], [92, 139], [36, 97], [105, 97]],
            np.int32,
        )
        cv2.polylines(canvas, [pts], True, color, thickness)
    elif label == "arrow":
        pts = np.array([[44, 128], [186, 128]], np.int32)
        cv2.polylines(canvas, [pts], False, color, thickness)
        head = np.array([[136, 78], [196, 128], [136, 178]], np.int32)
        cv2.polylines(canvas, [head], False, color, thickness)
    elif label == "house":
        roof = np.array([[52, 120], [128, 48], [204, 120]], np.int32)
        cv2.polylines(canvas, [roof], True, color, thickness)
        cv2.rectangle(canvas, (68, 120), (188, 214), color, thickness)
    elif label == "tree":
        cv2.rectangle(canvas, (110, 148), (146, 216), color, thickness)
        cv2.circle(canvas, (128, 104), 62, color, thickness)
    elif label == "sun":
        cv2.circle(canvas, (128, 128), 52, color, thickness)
        for angle in range(0, 360, 45):
            rad = math.radians(angle)
            inner = (int(128 + math.cos(rad) * 72), int(128 + math.sin(rad) * 72))
            outer = (int(128 + math.cos(rad) * 104), int(128 + math.sin(rad) * 104))
            cv2.line(canvas, inner, outer, color, thickness // 2)
    elif label == "face":
        cv2.circle(canvas, (128, 128), 82, color, thickness)
        cv2.circle(canvas, (96, 106), 10, color, thickness // 2)
        cv2.circle(canvas, (160, 106), 10, color, thickness // 2)
        cv2.ellipse(canvas, (128, 148), (34, 22), 0, 0, 180, color, thickness // 2)
    elif label == "car":
        body = np.array([[52, 150], [70, 118], [184, 118], [208, 150], [208, 186], [52, 186]], np.int32)
        cv2.polylines(canvas, [body], True, color, thickness)
        cv2.circle(canvas, (88, 188), 18, color, thickness // 2)
        cv2.circle(canvas, (176, 188), 18, color, thickness // 2)

    return canvas


def _template_contour(label: str):
    canvas = _create_template_canvas(label)
    contours, _ = cv2.findContours(canvas, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    return max(contours, key=cv2.contourArea) if contours else None


TEMPLATE_LABELS = ["circle", "square", "triangle", "heart", "star", "arrow", "house", "tree", "sun", "face", "car"]
TEMPLATE_CANVASES = {label: _normalize_mask(_create_template_canvas(label)) for label in TEMPLATE_LABELS}
TEMPLATE_CONTOURS = {label: _template_contour(label) for label in TEMPLATE_LABELS}


def _preprocess(image_bgr: np.ndarray):
    if image_bgr.ndim == 3 and image_bgr.shape[2] == 4:
        alpha = image_bgr[:, :, 3]
        bgr = image_bgr[:, :, :3]
    else:
        alpha = None
        bgr = image_bgr

    # Dynamically estimate background color from top/bottom border pixels
    border = np.concatenate([bgr[0, :, :], bgr[-1, :, :], bgr[:, 0, :], bgr[:, -1, :]], axis=0)
    bg = np.median(border, axis=0).astype(np.int16)
    diff = np.max(np.abs(bgr.astype(np.int16) - bg), axis=2).astype(np.uint8)
    if alpha is not None and np.min(alpha) < 250:
        diff = np.maximum(diff, alpha)

    blurred = cv2.GaussianBlur(diff, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 28, 255, cv2.THRESH_BINARY)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    ext_contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    all_contours, _ = cv2.findContours(closed, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    return diff, closed, ext_contours, all_contours


def recognize_shape(image_bgr: np.ndarray) -> PredictionResult:
    start = time.perf_counter()
    _, thresh, contours, all_contours = _preprocess(image_bgr)
    valid_contours = [c for c in contours if cv2.contourArea(c) > 35 or cv2.arcLength(c, False) > 30]
    total_components = len([c for c in all_contours if cv2.contourArea(c) > 20 or cv2.arcLength(c, False) > 20])
    if not valid_contours:
        return PredictionResult(
            label="unknown",
            confidence=0.0,
            bbox=None,
            clean_asset_key="unknown",
            inference_time_ms=0,
            raw_payload={"reason": "no_contours"},
        )

    all_pts = np.vstack(valid_contours)
    x, y, w, h = cv2.boundingRect(all_pts)
    contour = max(valid_contours, key=cv2.contourArea)

    user_norm = _normalize_mask(thresh)

    hu = cv2.HuMoments(cv2.moments(contour)).flatten()
    hu = -np.sign(hu) * np.log10(np.abs(hu) + 1e-12)

    peri = max(cv2.arcLength(contour, True), 1.0)
    area = cv2.contourArea(contour)
    circularity = (4 * math.pi * area) / (peri * peri) if area > 0 else 0
    approx = cv2.approxPolyDP(contour, 0.035 * peri, True)
    vertices = len(approx)
    aspect_ratio = float(w) / max(float(h), 1.0)
    extent = area / max(float(w * h), 1.0)

    best_label = "unknown"
    best_score = float("inf")
    score_map: dict[str, float] = {}

    user_f = user_norm.astype(np.float32)
    user_norm_val = float(np.linalg.norm(user_f))

    for label, template_contour in TEMPLATE_CONTOURS.items():
        if template_contour is None:
            continue
        template_hu = cv2.HuMoments(cv2.moments(template_contour)).flatten()
        template_hu = -np.sign(template_hu) * np.log10(np.abs(template_hu) + 1e-12)
        hu_dist = min(float(np.linalg.norm(hu - template_hu)), 12.0)

        tmpl_f = TEMPLATE_CANVASES[label].astype(np.float32)
        denom = float(np.linalg.norm(tmpl_f) * user_norm_val)
        corr = float(np.sum(tmpl_f * user_f) / denom) if denom > 0 else 0.0

        combined_distance = (1.0 - corr) * 8.0 + hu_dist * 0.14

        if label == "circle" and circularity > 0.83 and vertices >= 6 and len(valid_contours) == 1 and total_components <= 2:
            combined_distance *= 0.45
        elif label == "triangle" and vertices == 3 and len(valid_contours) <= 2:
            combined_distance *= 0.45
        elif label == "square" and vertices == 4 and extent > 0.78 and len(valid_contours) == 1 and total_components <= 2:
            combined_distance *= 0.45
        elif label == "sun" and len(valid_contours) >= 5:
            combined_distance *= 0.55
        elif label == "face" and len(valid_contours) == 1 and total_components >= 4:
            combined_distance *= 0.50

        score_map[label] = round(combined_distance, 4)
        if combined_distance < best_score:
            best_label = label
            best_score = combined_distance

    confidence = max(0.45, min(0.99, 1 - (best_score / 7.5)))
    inference_time_ms = max(1, int((time.perf_counter() - start) * 1000))

    return PredictionResult(
        label=best_label,
        confidence=round(confidence, 4),
        bbox={"x": int(x), "y": int(y), "width": int(w), "height": int(h)},
        clean_asset_key=best_label,
        inference_time_ms=inference_time_ms,
        raw_payload={
            "scores": score_map,
            "area": float(area),
            "vertices": vertices,
            "circularity": round(circularity, 3),
            "components": len(valid_contours),
        },
    )
