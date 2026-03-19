from __future__ import annotations
import io
from pathlib import Path
from typing import Any
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v3 import preprocess_input


APP_DIR = Path(__file__).resolve().parent
MODEL_PATH = APP_DIR / "MobileNetV3Large_tendurian_avg_top5.keras"
IMG_SIZE = (224, 224)




CLASS_NAMES = [
    "Fruit_Rot",
    "Leaf_Algal",
    "Leaf_Blight",
    "Leaf_Colletotrichum",
    "Leaf_Healthy",
    "Leaf_Phomopsis",
    "Leaf_Rhizoctonia",
    "Mealybug_Infestation",
    "Pink_Disease",
    "Sooty_Mold",
    "Stem_Cracking_Gummosis",
    "Thrips_Disease",
    "Yellow_Leaf",
]




app = FastAPI(title="VietDurian AI Service", version="1.0.0")








def _load_model() -> tf.keras.Model:
    if not MODEL_PATH.exists():
        raise RuntimeError(f"Model file not found: {MODEL_PATH}")
    return tf.keras.models.load_model(str(MODEL_PATH))








MODEL = _load_model()








def _predict_from_image(image: Image.Image, top_k: int = 5) -> dict[str, Any]:
    image = image.convert("RGB")




    img = image.resize(IMG_SIZE)
    img_array = np.array(img)
    img_array = preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)




    predictions = MODEL.predict(img_array, verbose=0)[0]
    predictions = np.asarray(predictions, dtype=np.float32)




    best_index = int(np.argmax(predictions))
    confidence = float(predictions[best_index])
    predicted_class = CLASS_NAMES[best_index]

    k = max(1, min(int(top_k), len(CLASS_NAMES)))
    top_indices = np.argsort(predictions)[::-1][:k]
    top = [
        {
            "class_name": CLASS_NAMES[int(i)],
            "probability": float(predictions[int(i)]),
        }
        for i in top_indices
    ]

    probabilities = {
        CLASS_NAMES[i]: float(predictions[i]) for i in range(len(CLASS_NAMES))
    }

    return {
        "predicted_class": predicted_class,
        "confidence": confidence,
        "top_k": top,
        "probabilities": probabilities,
        "model": MODEL_PATH.name,
        "image_size": [IMG_SIZE[0], IMG_SIZE[1]],
    }


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "model_loaded": True,
        "model": MODEL_PATH.name,
        "classes": len(CLASS_NAMES),
    }

@app.post("/predict")
async def predict(image: UploadFile = File(...)) -> JSONResponse:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are supported")
    try:
        raw = await image.read()
        pil = Image.open(io.BytesIO(raw))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Invalid image file") from exc
    
    result = _predict_from_image(pil, top_k=5)
    return JSONResponse({"success": True, "data": result})

# Local dev:
#   uvicorn app:app --host 127.0.0.1 --port 8001
if __name__ == "__main__":
    import uvicorn




    uvicorn.run("app:app", host="127.0.0.1", port=8001, reload=False)