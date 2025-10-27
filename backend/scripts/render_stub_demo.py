from pathlib import Path
import json
from app.generators.video_stub import render_storyboard_to_mp4

ROOT = Path(__file__).resolve().parents[1]
story_path = ROOT / "demo" / "SAMPLE_STORYBOARD.json"

if not story_path.exists():
    raise SystemExit(f"Missing demo storyboard: {story_path}")

with open(story_path) as f:
    storyboard = json.load(f)

out = render_storyboard_to_mp4(
    storyboard,
    brand_color_hex="#6D28D9",            # nice purple
    outfile_basename="demo_stub"
)
print("✅ Demo video written:")
print("  file:", out["path"])
print("  url :", out["url"])
