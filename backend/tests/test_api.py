import zipfile
from unittest.mock import patch

import pytest

BRIEF = {
    "title": "Lumina Campaign",
    "product_url": "https://example.com/lumina",
    "brief": {
        "title": "Lumina Water Bottle",
        "description": "Self-cleaning bottle with UV-C cap. Keeps water fresh all day.",
        "price": "49",
        "brand": "Lumina",
    },
    "brand": {"name": "Lumina", "color": "#7C3AED"},
}


def _new_variant(client, fmt="reel"):
    pid = client.post("/projects/", json=BRIEF).json()["id"]
    job = client.post(f"/projects/{pid}/generate", json={"tones": ["professional"], "format": fmt})
    assert job.status_code == 200, job.text
    assert job.json()["status"] == "completed"
    v = client.get(f"/projects/{pid}/variants/latest").json()
    return pid, v


def test_health_reports_free_mode(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"ok": True, "db": True, "ai": False}


def test_project_roundtrip(client):
    r = client.post("/projects/", json=BRIEF)
    assert r.status_code == 200
    pid = r.json()["id"]
    p = client.get(f"/projects/{pid}").json()
    assert p["brief_json"]["title"] == "Lumina Water Bottle"
    assert p["brand_json"]["color"] == "#7C3AED"
    assert client.get("/projects/999999").status_code == 404


def test_generate_builds_timed_storyboard(client):
    _, v = _new_variant(client)
    scenes = v["storyboard_json"]["scenes"]
    assert [s["id"] for s in scenes] == ["hook", "value", "proof", "cta", "endcard"]
    assert scenes[0]["text"] == "Meet Lumina Water Bottle."
    assert scenes[3]["text"] == "Get yours for $49 — tap the link."
    # Scenes are contiguous and non-empty.
    for a, b in zip(scenes, scenes[1:]):
        assert a["end"] > a["start"]
        assert b["start"] == pytest.approx(a["end"])


@pytest.mark.parametrize("fmt,size", [("square", (1080, 1080)), ("portrait", (1080, 1350))])
def test_generate_respects_format(client, fmt, size):
    _, v = _new_variant(client, fmt)
    canvas = v["storyboard_json"]["canvas"]
    assert (canvas["w"], canvas["h"]) == size


def test_post_text(client):
    pid, _ = _new_variant(client)
    r = client.get(f"/post_text/projects/{pid}").json()
    assert r["caption"].startswith("Meet Lumina Water Bottle.")
    assert "$49" in r["caption"]
    assert r["hashtags"][0] == "#lumina"
    assert r["text"].startswith(r["caption"])
    # Deterministic across calls.
    assert client.get(f"/post_text/projects/{pid}").json() == r


def test_static_endcard(client):
    pid = client.post("/projects/", json=BRIEF).json()["id"]
    r = client.post("/generate_static/", json={"project_id": pid, "width": 1080, "height": 1080}).json()
    assert r["ok"] and r["data_url"].startswith("data:image/png;base64,")


def test_assemble_free_render_and_export(client, export_dir):
    pid, v = _new_variant(client, "square")

    r = client.post(f"/variants/{v['id']}/assemble", json={"mode": "free", "music_mood": "chill"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["mode"] == "free"
    assert body["mp4_url"] == f"/exports/{body['filename']}"
    assert 13 < body["duration"] < 17

    mp4 = client.get(body["mp4_url"])
    assert mp4.status_code == 200 and mp4.content[4:8] == b"ftyp"
    # Only the final MP4 is left behind; intermediates are cleaned up.
    assert sorted(p.name for p in export_dir.iterdir()) == [body["filename"]]

    latest = client.get(f"/projects/{pid}/variants/latest").json()
    assert latest["mp4_url"] == body["mp4_url"] and latest["status"] == "rendered"

    z = client.post(f"/variants/{v['id']}/export_zip")
    assert z.status_code == 200, z.text
    dl = client.get(z.json()["download"])
    assert dl.status_code == 200
    assert "attachment" in dl.headers["content-disposition"]
    zpath = export_dir / z.json()["download"].rsplit("/", 1)[-1]
    with zipfile.ZipFile(zpath) as zf:
        assert set(zf.namelist()) == {f"ad_variant_{v['id']}.mp4", "storyboard.json", "script.json", "caption.txt"}


def test_assemble_ai_without_key_is_400(client):
    _, v = _new_variant(client)
    r = client.post(f"/variants/{v['id']}/assemble", json={"mode": "ai"})
    assert r.status_code == 400
    assert "OPENAI_API_KEY" in r.json()["detail"]


def test_export_before_render_is_404(client):
    _, v = _new_variant(client)
    assert client.post(f"/variants/{v['id']}/export_zip").status_code == 404


def test_download_rejects_traversal(client):
    assert client.get("/exports/download/..%2Fmain.py").status_code == 404
    assert client.get("/exports/download/nope.mp4").status_code == 404


def test_scrape(client):
    fake = {"url": "https://shop.test/p", "title": "Hydra Bottle", "description": "Cold for 24h.",
            "images": ["https://shop.test/a.jpg"], "bullets": ["Leak-proof lid"]}
    with patch("app.routers.scrape.scrape_url", return_value=fake):
        r = client.post("/scrape/", json={"url": "https://shop.test/p"}).json()
    assert r["ok"] and r["brief"]["title"] == "Hydra Bottle" and r["brief"]["bullets"] == ["Leak-proof lid"]

    with patch("app.routers.scrape.scrape_url", side_effect=OSError("boom")):
        r = client.post("/scrape/", json={"url": "https://shop.test/p"}).json()
    assert not r["ok"] and "boom" in r["reason"]


def test_ai_generate_endpoint_free_mode(client):
    r = client.post("/ai/generate", json={"title": "Hydra Bottle", "price": "29", "mode": "free", "music_mood": "none"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["video"]["mode"] == "free"
    assert body["script"]["meta"]["source"] == "template"  # no key → template fallback
    assert "$29" in body["caption"]["caption"]
