
from __future__ import annotations
from typing import List, Optional
from pathlib import Path
import io, base64, time, os
from PIL import Image
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
APP_DIR = Path(__file__).resolve().parent
EXPORT_DIR = APP_DIR.parent / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)


_IMG_SIZE = "1024x1536"  

def generate_scene_image(prompt: str) -> Path:
    res = client.images.generate(
        model="gpt-image-1",
        prompt=f"vertical 9:16 cinematic product ad still, {prompt}",
        size=_IMG_SIZE
    )
    b64 = res.data[0].b64_json
    img = Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")
    out = EXPORT_DIR / f"scene_{int(time.time()*1000)}.png"
    img.save(out, format="PNG", optimize=True)
    return out

def resolve_images_for_scenes(scene_prompts: List[str], provided: Optional[List[Path]] = None) -> List[Path]:
    if provided:
        provided = [p for p in provided if Path(p).exists()]
        if provided:
            paths: List[Path] = []
            for i, _ in enumerate(scene_prompts):
                paths.append(Path(provided[i % len(provided)]))
            return paths

    return [generate_scene_image(p or "product hero") for p in scene_prompts]