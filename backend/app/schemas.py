from typing import Any, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

AdFormat = Literal["reel", "story", "square", "portrait"]
RenderMode = Literal["auto", "ai", "free"]
MusicMood = Literal["upbeat", "chill", "luxury", "none"]


class Brief(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[str] = None
    brand: Optional[str] = None
    images: Optional[List[str]] = None
    bullets: Optional[List[str]] = None


class ScrapeIn(BaseModel):
    url: HttpUrl


class ScrapeOut(BaseModel):
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
    title: Optional[str] = None
    product_url: Optional[str] = None
    brief_json: Optional[dict[str, Any]] = None
    brand_json: Optional[dict[str, Any]] = None


class GenerateRequest(BaseModel):
    tones: Optional[List[str]] = None
    persona: Optional[str] = None
    format: AdFormat = "reel"
    ai_script: bool = Field(False, description="Write the script with gpt-4o-mini (falls back to template).")


class AssembleRequest(BaseModel):
    mode: RenderMode = "auto"
    voice: str = "alloy"
    music_mood: MusicMood = "upbeat"


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
    project_id: int
    status: Optional[str] = None
    tone: Optional[str] = None
    persona: Optional[str] = None
    mp4_url: Optional[str] = None
    post_text: Optional[str] = None
    script_json: Optional[dict[str, Any]] = None
    storyboard_json: Optional[dict[str, Any]] = None


class PostTextOut(BaseModel):
    caption: str
    hashtags: list[str]
    text: str
