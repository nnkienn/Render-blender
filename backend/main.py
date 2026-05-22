import os
import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

import models
import schemas
from database import Base, engine, get_db


APP_ROOT = Path("/app")
UPLOAD_ROOT = Path(os.getenv("UPLOAD_ROOT", str(APP_ROOT / "uploads")))
MODELS_DIR = UPLOAD_ROOT / "models"
ALLOWED_EXTENSIONS = {".glb", ".gltf"}
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3001,http://127.0.0.1:3001").split(",")
    if origin.strip()
]

MODELS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="NNKIENN Render Platform API",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(MODELS_DIR)), name="static")


@app.on_event("startup")
def on_startup() -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)


def serialize_project(project: models.Project) -> models.Project:
    return project


def save_upload_to_disk(file: UploadFile, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("wb") as output:
        shutil.copyfileobj(file.file, output)


def resolve_project_or_404(project_id: int, db: Session) -> models.Project:
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    return project


@app.get("/api/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/projects", response_model=list[schemas.ProjectResponse])
def get_projects(db: Session = Depends(get_db)) -> list[models.Project]:
    return db.query(models.Project).order_by(models.Project.created_at.desc()).all()


@app.get("/api/projects/{project_id}", response_model=schemas.ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)) -> models.Project:
    return resolve_project_or_404(project_id, db)


@app.post("/api/upload", response_model=schemas.ProjectResponse, status_code=status.HTTP_201_CREATED)
async def upload_project(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...),
    poly_count: str = Form(...),
    blender_script: str | None = Form(None),
    db: Session = Depends(get_db),
) -> models.Project:
    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .glb and .gltf files are allowed.",
        )

    unique_filename = f"{uuid4().hex}{extension}"
    destination = MODELS_DIR / unique_filename

    try:
        save_upload_to_disk(file, destination)
    finally:
        await file.close()

    project = models.Project(
        title=title.strip(),
        description=description.strip(),
        poly_count=poly_count.strip(),
        file_url=f"/static/{unique_filename}",
        blender_script=(blender_script or "").strip() or None,
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return serialize_project(project)


@app.put("/api/projects/{project_id}", response_model=schemas.ProjectResponse)
def update_project(
    project_id: int,
    payload: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
) -> models.Project:
    project = resolve_project_or_404(project_id, db)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, field, value)

    db.add(project)
    db.commit()
    db.refresh(project)
    return serialize_project(project)


@app.delete("/api/projects/{project_id}", status_code=status.HTTP_200_OK)
def delete_project(project_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    project = resolve_project_or_404(project_id, db)

    file_path = MODELS_DIR / Path(project.file_url).name
    if file_path.exists() and file_path.is_file():
        file_path.unlink()

    db.delete(project)
    db.commit()

    return {"message": "Project deleted successfully."}
