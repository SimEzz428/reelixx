# backend/app/utils/image_scrape.py
from __future__ import annotations
from pathlib import Path
from typing import List, Tuple
import re, os, time
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

APP_DIR = Path(__file__).resolve().parents[1]
EXPORT_DIR = APP_DIR / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

VALID_EXT = (".jpg", ".jpeg", ".png", ".webp")

def _is_valid_img_url(u: str) -> bool:
    if not u: 
        return False
    p = urlparse(u)
    if not p.scheme or not p.netloc:
        return False
    return any(p.path.lower().endswith(ext) for ext in VALID_EXT)

def scrape_product_images(page_url: str, limit: int = 6) -> List[Path]:
    """
    Fetches likely product images from a product detail page.
    Priority:
      1) og:image
      2) product schema images (if present)
      3) <img> tags that look like product shots (size & name filters)
    Saves to exports/scraped/<ts>/ and returns a list of local Paths.
    """
    try:
        resp = requests.get(page_url, timeout=15, headers={"User-Agent": "Mozilla/5.0 ReelixxBot"})
        resp.raise_for_status()
    except Exception:
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    found: List[str] = []

    # 1) og:image
    for tag in soup.select('meta[property="og:image"], meta[name="og:image"]'):
        c = (tag.get("content") or "").strip()
        if c:
            found.append(urljoin(page_url, c))

    # 2) JSON-LD Product images (simple heuristic)
    for tag in soup.find_all("script", {"type": "application/ld+json"}):
        try:
            txt = tag.string or ""
            imgs = re.findall(r'"image"\s*:\s*"(.*?)"', txt, flags=re.I)
            for u in imgs:
                found.append(urljoin(page_url, u))
        except Exception:
            pass

    # 3) <img> tags
    for img in soup.find_all("img"):
        src = (img.get("src") or img.get("data-src") or "").strip()
        if not src:
            continue
        absu = urljoin(page_url, src)
        alt = (img.get("alt") or "").lower()
        cls = " ".join(img.get("class") or []).lower()
        if any(k in alt + " " + cls for k in ["product", "hero", "gallery", "main", "primary"]):
            found.append(absu)
        else:
            # generic fallback
            found.append(absu)

    # Dedup + filter by extension and validity
    uniq = []
    seen = set()
    for u in found:
        if _is_valid_img_url(u) and u not in seen:
            seen.add(u)
            uniq.append(u)
        if len(uniq) >= max(1, limit * 2):  # collect a bit more, we’ll trim after downloads
            break

    # Download to local folder
    tsdir = EXPORT_DIR / "scraped" / str(int(time.time()))
    tsdir.mkdir(parents=True, exist_ok=True)

    out_paths: List[Path] = []
    for u in uniq:
        try:
            r = requests.get(u, timeout=15, headers={"User-Agent": "Mozilla/5.0 ReelixxBot"})
            if r.status_code != 200 or not r.content:
                continue
            ext = os.path.splitext(urlparse(u).path)[1].lower()
            if ext not in VALID_EXT:
                ext = ".jpg"
            fname = f"img_{len(out_paths):02d}{ext}"
            p = tsdir / fname
            with open(p, "wb") as f:
                f.write(r.content)
            out_paths.append(p)
            if len(out_paths) >= limit:
                break
        except Exception:
            continue

    return out_paths