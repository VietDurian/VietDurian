# VietDurian AI Service (JSON API)

This folder contains the FastAPI service used by backend image diagnosis.

- `app.py`: FastAPI API (`/health`, `/predict`)
- `Dockerfile`: container image for cloud deployment
- `requirements_api.txt`: Python dependencies for API runtime

## Folder descriptions (for architecture/docs)

Note: The current `ai/` directory is file-based and not yet split into physical subfolders. The table below describes the 5 logical folders you are documenting.

| Folder | Description |
| --- | --- |
| VietDurian AI | Root module of the AI diagnosis service. Contains model code, inference API, runtime/deploy config, and related artifacts used by backend image diagnosis. |
| model | Model definitions and trained weights for durian disease classification, for example `EfficientNetV2L.py`, `MobileNetV3.py`, and `MobileNetV3Large_tendurian_avg_top5.keras`. |
| storage | Storage layer for AI assets and prediction inputs/outputs (for production can map to S3/Cloudinary or other object storage for images and model artifacts). |
| api | Inference API layer that exposes health/prediction endpoints for backend integration, currently implemented in `app.py` with FastAPI (`/health`, `/predict`). |
| config | Environment and deployment configuration for AI runtime, such as `requirements_api.txt`, `Dockerfile`, and environment variables needed in deployment. |

## 1) Run locally

From `AI/`:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements_api.txt
uvicorn app:app --host 127.0.0.1 --port 8001
```

Health check:

```bash
curl http://127.0.0.1:8001/health
```

## 2) Important note about S3

S3 is object storage only. FastAPI cannot run directly on S3.

Recommended architecture:

- Deploy FastAPI container to a compute service: AWS App Runner / ECS / EC2 / Render / Railway
- Keep model files and images in storage services (S3/Cloudinary)
- Set backend env `AI_SERVICE_URL` to the public HTTPS URL of FastAPI service

## 3) Deploy FastAPI to AWS App Runner (simple path)

### Step A: Build and push Docker image to ECR

```bash
aws ecr create-repository --repository-name vietdurian-ai --region ap-southeast-1
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com

docker build -t vietdurian-ai .
docker tag vietdurian-ai:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/vietdurian-ai:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-southeast-1.amazonaws.com/vietdurian-ai:latest
```

### Step B: Create App Runner service

- Source: ECR image `vietdurian-ai:latest`
- Port: `8001`
- Health check path: `/health`
- CPU/RAM: at least `1 vCPU / 2 GB` (TensorFlow needs memory)

After deploy you will get a public URL, for example:

`https://xxxx.ap-southeast-1.awsapprunner.com`

## 4) Connect backend to cloud AI URL

In backend environment, set:

```env
AI_SERVICE_URL=https://xxxx.ap-southeast-1.awsapprunner.com
```

Then redeploy backend Lambda:

```bash
cd back-end
serverless deploy --region ap-southeast-1 --aws-profile vietdurian --force
```

## 5) Quick production verification

Call backend prediction endpoint and verify error no longer mentions `127.0.0.1:8001`.