import os
import io
import time
import base64
from pathlib import Path
from typing import List, Optional

import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, Form, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO

app = FastAPI(
    title="ResQAI YOLO11 Landslide Vision API",
    description="Automated Landslide Detection & Segmentation Service powered by trained YOLO11",
    version="1.0.0"
)

# Enable CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model initialization
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = os.getenv("MODEL_PATH", str(BASE_DIR / "model" / "best.pt"))

print(f"[ResQAI Backend] Loading YOLO11 model from: {MODEL_PATH}")
try:
    model = YOLO(MODEL_PATH)
    print(f"[ResQAI Backend] YOLO11 Model loaded successfully! Classes: {model.names}")
except Exception as e:
    print(f"[ResQAI Backend] ERROR loading YOLO11 model from {MODEL_PATH}: {e}")
    model = None


@app.get("/")
def root():
    return {
        "service": "ResQAI Landslide Detection API",
        "status": "online",
        "model_loaded": model is not None,
        "classes": model.names if model else {},
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    if model is None:
        raise HTTPException(status_code=503, detail="YOLO11 Model not loaded")
    return {
        "status": "healthy",
        "model": "YOLO11",
        "classes": model.names,
        "model_path": MODEL_PATH
    }


@app.post("/predict")
async def predict(
    image: UploadFile = File(...),
    confidence_threshold: Optional[float] = Query(0.10, ge=0.01, le=1.0)
):
    start_time = time.time()

    if model is None:
        raise HTTPException(
            status_code=503, 
            detail="Model is not initialized. Please verify backend/model/best.pt exists."
        )

    # Validate image file presence
    if not image.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    content_type = image.content_type or ""
    if content_type and not any(t in content_type.lower() for t in ["image", "octet-stream"]):
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {content_type}. Please upload a JPG, JPEG, PNG, or WEBP image."
        )

    try:
        contents = await image.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Uploaded image file is empty.")

        # Read image using PIL to ensure it is a valid format
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as img_err:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(img_err)}")

    try:
        # Run YOLO11 inference with the specified confidence threshold
        results = model.predict(source=pil_image, conf=confidence_threshold, verbose=False)
        result = results[0]

        detections = []
        max_conf = 0.0

        if result.boxes is not None and len(result.boxes) > 0:
            for box in result.boxes:
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                xyxy = [float(coord) for coord in box.xyxy[0].tolist()]

                # Use actual class names from the trained YOLO11 model
                class_name = model.names.get(cls_id, f"Class {cls_id}")
                if conf > max_conf:
                    max_conf = conf

                detections.append({
                    "class": class_name,
                    "confidence": round(conf, 4),
                    "bbox": [round(c, 2) for c in xyxy]
                })

        # Generate annotated image with bounding boxes drawn by YOLO
        annotated_bgr = result.plot()
        success, encoded_img = cv2.imencode(".jpg", annotated_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
        annotated_image_url = None
        if success:
            base64_str = base64.b64encode(encoded_img).decode("utf-8")
            annotated_image_url = f"data:image/jpeg;base64,{base64_str}"

        # Risk categorization based on real detections
        landslide_detections = [d for d in detections if d["class"].lower() == "landslide"]
        has_landslide = len(landslide_detections) > 0

        if has_landslide:
            if max_conf >= 0.70:
                risk_indicator = "Critical"
            elif max_conf >= 0.40:
                risk_indicator = "High"
            else:
                risk_indicator = "Moderate"
            
            zone_count = len(landslide_detections)
            detection_status = f"Landslide Detected ({zone_count} zone{'s' if zone_count > 1 else ''})"
            explanation = (
                f"YOLO11 detected {zone_count} landslide rupture/debris zone(s) with peak confidence of "
                f"{(max_conf * 100):.1f}%. Immediate terrain monitoring advised."
            )
        elif len(detections) > 0:
            risk_indicator = "Low"
            detection_status = "Normal Terrain (Stable)"
            explanation = f"YOLO11 analyzed the terrain and confirmed {len(detections)} normal/stable slope region(s)."
        else:
            risk_indicator = "Low"
            detection_status = "No Landslide Detected"
            explanation = "YOLO11 scanned the slope imagery and detected no active landslide scarp or slope rupture zones."

        inference_time_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "status": "SUCCESS" if len(detections) > 0 else "NO_DETECTIONS",
            "model": "YOLO11",
            "detectionStatus": detection_status,
            "detection_status": detection_status,
            "detectionCount": len(detections),
            "detection_count": len(detections),
            "detections": detections,
            "confidence": round(max_conf, 4) if len(detections) > 0 else 0.0,
            "riskIndicator": risk_indicator,
            "risk_indicator": risk_indicator,
            "annotated_image_url": annotated_image_url,
            "annotatedImageUrl": annotated_image_url,
            "explanation": explanation,
            "inference_time_ms": inference_time_ms
        }

    except Exception as infer_err:
        raise HTTPException(
            status_code=500, 
            detail=f"Inference error processing image: {str(infer_err)}"
        )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
