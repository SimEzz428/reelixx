from pydantic import BaseModel, HttpUrl, ConfigDict
from typing import Optional, List
from typing import Any, Optional


class Brief(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[str] = None
    brand: Optional[str] = None
    images: Optional[List[str]] = None


class ScrapeIn(BaseModel):
    url: HttpUrl


class ScrapeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    ok: bool = True
    brief: Optional[Brief] = None
    reason: Optional[str] = None


class ProjectCreate(BaseModel):
    title: Optional[str] = None
    product_url: Optional[HttpUrl] = None
    brief: Optional[Brief] = None
    brand: Optional[dict[str, Any]] = None


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int


class GenerateRequest(BaseModel):
    n_variants: int = 1
    tones: Optional[List[str]] = None
    persona: Optional[str] = None
    voice_id: Optional[str] = None


class JobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    project_id: int
    kind: str
    status: str
    logs: Optional[str] = None


class VariantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: Optional[str] = None
    tone: Optional[str] = None
    persona: Optional[str] = None
    script_json: Optional[dict[str, Any]] = None
    storyboard_json: Optional[dict[str, Any]] = None


class PostTextOut(BaseModel):
    caption: str
    hashtags: list[str]
