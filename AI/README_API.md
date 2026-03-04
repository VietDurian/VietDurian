# VietDurian AI Service (JSON API)

This folder contains two entrypoints:

- `app.py`: Streamlit UI (for manual testing)
- `api_service.py`: FastAPI JSON service (for web integration)

## Run API service

From `AI/`:

```bash
pip install -r requirements_api.txt
uvicorn api_service:app --host 0.0.0.0 --port 8001
```

Health check:

```bash
curl http://localhost:8001/health
```

Predict (multipart upload, field name `image`):

```bash
curl -F "image=@your_leaf.jpg" http://localhost:8001/predict
```
