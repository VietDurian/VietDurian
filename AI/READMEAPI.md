# VietDurian AI Service (JSON API)
This folder contains two entrypoints:

- `app.py`: FastAPI JSON service (for web integration)
- `streamlit_app.py`: Streamlit UI (optional manual testing)

## Run API service

From `AI/`:


```bash Install package
pip install fastapi
pip install uvicorn
pip install pillow
pip install tensorflow (required python version 3.11)
```

```bash Run
python app.py
```

```bash
pip install -r requirements_api.txt
uvicorn app:app --host 127.0.0.1 --port 8001
```

Health check:

```bash
curl http://127.0.0.1:8001/health
```
Predict (multipart upload, field name `image`):