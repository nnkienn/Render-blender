from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    poly_count = Column(String(100), nullable=False)
    file_url = Column(String(500), nullable=False)
    blender_script = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
