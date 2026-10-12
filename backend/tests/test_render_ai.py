"""Exercise the paid AI render path against a fake OpenAI client (no network, no credits)."""
import base64
import io
from types import SimpleNamespace
from unittest.mock import patch

from PIL import Image
from moviepy.editor import AudioClip

from app.generators import video_ai


class _Speech:
    def __init__(self, calls):
        self.calls = calls

    def create(self, **kw):
        self.calls.append(kw["input"])

        class _Resp:
            def __enter__(self):
                return self

            def __exit__(self, *a):
                return False

            def stream_to_file(self, path):
                AudioClip(lambda t: 0 * t, duration=2.5, fps=44100).write_audiofile(str(path), logger=None)

        return _Resp()


class FakeClient:
    def __init__(self):
        self.tts_inputs, self.image_sizes = [], []
        self.audio = SimpleNamespace(speech=SimpleNamespace(with_streaming_response=_Speech(self.tts_inputs)))
        self.images = SimpleNamespace(generate=self._image)

    def _image(self, **kw):
        self.image_sizes.append(kw["size"])
        buf = io.BytesIO()
        Image.new("RGB", (1024, 1536), (40, 90, 160)).save(buf, format="PNG")
        return SimpleNamespace(data=[SimpleNamespace(b64_json=base64.b64encode(buf.getvalue()).decode())])


def test_ai_render_uses_tts_and_images_and_extends_to_voice_length():
    fake = FakeClient()
    storyboard = {
        "canvas": {"w": 1080, "h": 1920, "fps": 30},
        "scenes": [
            {"id": "hook", "start": 0, "end": 1.0, "text": "Meet Hydra."},
            {"id": "cta", "start": 1.0, "end": 2.0, "text": "Tap the link."},
            {"id": "endcard", "start": 2.0, "end": 3.0, "text": "Hydra", "visual": {"type": "endcard"}},
        ],
    }
    with patch.object(video_ai, "ai_available", return_value=True), \
         patch.object(video_ai, "get_client", return_value=fake):
        out = video_ai.generate_ai_ad(storyboard, brand_name="Hydra", mode="auto", music_mood="upbeat")

    assert out["mode"] == "ai"
    assert fake.tts_inputs == ["Meet Hydra.", "Tap the link."]  # end-card is not voiced
    assert fake.image_sizes == ["1024x1536", "1024x1536"]
    # Each voiced 1s scene stretches to 2.5s of VO + 0.3s padding; end-card keeps its 1s.
    assert abs(out["duration"] - (2.8 + 2.8 + 1.0)) < 0.1
