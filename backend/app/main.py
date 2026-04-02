"""FastAPI backend for OncoAI demo inference."""

from io import BytesIO
from pathlib import Path
from typing import Dict

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = BASE_DIR / "models" / "model.h5"
IMG_SIZE = (224, 224)

app = FastAPI(title="OncoAI API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _load_or_build_model() -> tf.keras.Model:
    """Load an existing model file, or create a tiny demo binary classifier."""
    if MODEL_PATH.exists():
        return tf.keras.models.load_model(MODEL_PATH)

    model = tf.keras.Sequential(
        [
            tf.keras.layers.Input(shape=(224, 224, 3)),
            tf.keras.layers.Rescaling(1.0 / 255),
            tf.keras.layers.Conv2D(8, 3, activation="relu"),
            tf.keras.layers.MaxPooling2D(),
            tf.keras.layers.Conv2D(16, 3, activation="relu"),
            tf.keras.layers.GlobalAveragePooling2D(),
            tf.keras.layers.Dense(1, activation="sigmoid"),
        ]
    )
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    model.save(MODEL_PATH)
    return model


MODEL = _load_or_build_model()


def preprocess_image(content: bytes) -> np.ndarray:
    """Convert uploaded image bytes into model-ready tensor."""
    image = Image.open(BytesIO(content)).convert("RGB").resize(IMG_SIZE)
    arr = np.asarray(image, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


def to_risk_level(probability: float) -> str:
    if probability >= 0.8:
        return "High"
    if probability >= 0.5:
        return "Medium"
    return "Low"


@app.get("/")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "OncoAI API"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> Dict[str, float | str]:
    content = await file.read()
    arr = preprocess_image(content)

    probability = float(MODEL.predict(arr, verbose=0)[0][0])
    detected = probability >= 0.5
    confidence = probability * 100 if detected else (1 - probability) * 100

    return {
        "result": "Cancer Detected" if detected else "No Cancer Detected",
        "confidence_score": round(confidence, 2),
        "risk_level": to_risk_level(probability),
        "probability": round(probability, 4),
    }
