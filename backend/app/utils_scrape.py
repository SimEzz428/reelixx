# backend/app/utils_scrape.py
from __future__ import annotations

import re
from typing import Dict, List
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/126.0 Safari/537.36"
    )
}


def _text(el) -> str:
   
    return re.sub(r"\s+", " ", (el.get_text(" ", strip=True) if el else "")).strip()


def _meta(soup: BeautifulSoup, *names: str) -> str:
    
    for n in names:
        tag = soup.find("meta", property=n) or soup.find("meta", attrs={"name": n})
        if tag:
            val = (tag.get("content") or "").strip()
            if val:
                return val
    return ""


def _pick_images(soup: BeautifulSoup, base_url: str) -> List[str]:
   
    urls: List[str] = []

   
    for tag in soup.find_all("meta", property="og:image"):
        u = (tag.get("content") or "").strip()
        if u:
            urls.append(u)

    for img in soup.find_all("img"):
        u = (img.get("src") or img.get("data-src") or "").strip()
        if not u:
            continue
        urls.append(urljoin(base_url, u))

   
    def good(u: str) -> bool:
        return u.startswith("http://") or u.startswith("https://")

    dedup: List[str] = []
    seen = set()
    for u in sorted([u for u in urls if good(u)], key=len, reverse=True):
        if u not in seen:
            seen.add(u)
            dedup.append(u)
    return dedup[:12]


def _pick_bullets(soup: BeautifulSoup) -> List[str]:
    
    bullets: List[str] = []
    candidates = []
    for sel in [
        ".features ul",
        ".feature-list ul",
        ".specs ul",
        ".specifications ul",
        "ul[role='list']",
        "ul",
    ]:
        candidates.extend(soup.select(sel))

    for ul in candidates:
        for li in ul.find_all("li"):
            t = _text(li)
            if len(t) >= 6 and not t.lower().startswith(("add to cart", "learn more")):
                bullets.append(t)
        if len(bullets) >= 12:
            break


    out, seen = [], set()
    for b in bullets:
        b = b.strip(" •-—").strip()
        if b and b not in seen:
            seen.add(b)
            out.append(b)
    return out[:8]

def scrape_url(url: str) -> Dict:

    if not isinstance(url, str) or not url.strip():
        raise ValueError("scrape_url: missing URL")

    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    title = (
        _meta(soup, "og:title", "twitter:title") or
        _text(soup.title) or
        ""
    )

    description = (
        _meta(soup, "og:description", "description", "twitter:description") or
        ""
    )

    images = _pick_images(soup, url)
    bullets = _pick_bullets(soup)

    if not title:
        title = "Your Product"
    if not description:
        p = soup.find("p")
        description = _text(p)[:240] if p else "Great product that customers love."

    return {
        "url": url,
        "title": title.strip(),
        "description": description.strip(),
        "images": images,
        "bullets": bullets,
    }


def scrape_brief(url: str) -> Dict:

    data = scrape_url(url)

    
    brief = {
        "ok": True,
        "title": data["title"],
        "description": data["description"],
        "bullets": data["bullets"],
        "voice": "alloy",
        "music_mood": "upbeat",
        "tone": "energetic",
    }
    return brief


__all__ = ["scrape_url", "scrape_brief"]