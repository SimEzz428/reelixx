from __future__ import annotations
from sqlalchemy import JSON

import enum
from sqlalchemy import JSON, Column, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .db import Base


class JobStatus(str, enum.Enum):
    queued = "queued"
    running = "running"
    completed = "completed"
    failed = "failed"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=True)
    product_url = Column(Text, nullable=True)
    brief_json = Column(JSON, nullable=True)
    brand_json = Column(JSON, nullable=True)

    variants = relationship("Variant", back_populates="project")


class Variant(Base):
    __tablename__ = "variants"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    tone = Column(String(64), nullable=True)
    persona = Column(String(128), nullable=True)
    status = Column(String(32), default="draft")
    duration_s = Column(Integer, nullable=True)
    mp4_url = Column(Text, nullable=True)
    srt_url = Column(Text, nullable=True)
    post_text = Column(Text, nullable=True)

    project = relationship("Project", back_populates="variants")

    script_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    storyboard_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    kind = Column(String(64), nullable=False)
    status = Column(Enum(JobStatus), default=JobStatus.queued, nullable=False)
    logs = Column(Text, nullable=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    name = Column(String(255), nullable=True)
