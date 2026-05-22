from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProjectBase(BaseModel):
    title: str
    description: str
    poly_count: str
    blender_script: str | None = None


class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    poly_count: str | None = None
    blender_script: str | None = None


class ProjectResponse(ProjectBase):
    id: int
    file_url: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
