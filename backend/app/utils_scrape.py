import json
import re
from typing import Any, Dict, List, Optional

import httpx
from bs4 import BeautifulSoup

# Conservative desktop UA to avoid some anti-bot blocks
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)


async def fetch_html(url: str) -> str:
    """Fetch HTML with redirects and modest timeout."""
    async with httpx.AsyncClient(headers={"User-Agent": UA}, timeout=15) as client:
        r = await client.get(url, follow_redirects=True)
        r.raise_for_status()
        return r.text


def _jsonld_product(soup: BeautifulSoup) -> Optional[Dict[str, Any]]:
    """Try schema.org Product JSON-LD first (best quality fields)."""
    for tag in soup.find_all("script", {"type": "application/ld+json"}):
        try:
            data = json.loads(tag.string or "{}")
        except json.JSONDecodeError:
            continue

        items: List[Dict[str, Any]]
        if isinstance(data, dict):
            items = [data]
        elif isinstance(data, list):
            items = [d for d in data if isinstance(d, dict)]
        else:
            items = []

        for d in items:
            types = d.get("@type")
            types_list = [types] if isinstance(types, str) else (types or [])
            if any(isinstance(t, str) and t.lower() == "product" for t in types_list):
                brand_name = None
                brand = d.get("brand")
                if isinstance(brand, dict):
                    brand_name = brand.get("name")
                elif isinstance(brand, str):
                    brand_name = brand

                # Offers/price variations
                offers = d.get("offers") or {}
                if isinstance(offers, list) and offers:
                    offers = offers[0]
                price = None
                if isinstance(offers, dict):
                    price = offers.get("price") or offers.get(
                        "priceSpecification", {}
                    ).get("price")

                images = d.get("image")
                if isinstance(images, str):
                    images = [images]

                return {
                    "title": d.get("name"),
                    "description": d.get("description"),
                    "brand": brand_name if isinstance(brand_name, str) else None,
                    "price": str(price) if price is not None else None,
                    "images": images,
                }
    return None


def _opengraph(soup: BeautifulSoup) -> Dict[str, Any]:
    """Fallback to Open Graph / Twitter Card metadata."""

    def meta(prop: str) -> Optional[str]:
        tag = soup.find("meta", property=prop) or soup.find(
            "meta", attrs={"name": prop}
        )
        return tag.get("content") if tag and tag.has_attr("content") else None

    title = meta("og:title") or meta("twitter:title")
    desc = meta("og:description") or meta("twitter:description") or meta("description")
    image = meta("og:image") or meta("twitter:image")
    return {"title": title, "description": desc, "images": [image] if image else None}


PRICE_RE = re.compile(r"(\$\s?\d[\d,]*(?:\.\d{2})?|\d[\d,]*\s?(USD|usd|\$))")


def _fallback(soup: BeautifulSoup) -> Dict[str, Any]:
    """Last resort: guess from visible text/meta."""
    h1 = soup.find("h1")
    h2 = soup.find("h2")
    meta_desc = soup.find("meta", attrs={"name": "description"})
    body_text = soup.get_text(" ", strip=True)
    m = PRICE_RE.search(body_text)
    price = m.group(0) if m else None
    return {
        "title": (
            h1.get_text(strip=True) if h1 else (h2.get_text(strip=True) if h2 else None)
        ),
        "description": meta_desc.get("content") if meta_desc else None,
        "price": price,
    }


async def scrape_brief(url: str) -> Dict[str, Any]:
    """Normalize a product brief from a public product URL."""
    html = await fetch_html(url)
    soup = BeautifulSoup(html, "html.parser")

    # Preference: JSON-LD Product > Open Graph > fallback hints
    brief = _jsonld_product(soup) or _opengraph(soup)
    fb = _fallback(soup)

    # Merge with precedence for structured fields
    out: Dict[str, Any] = {k: v for k, v in (brief or {}).items() if v}
    for k, v in fb.items():
        out.setdefault(k, v)

    # Ensure images key exists (even if None)
    out.setdefault("images", (brief or {}).get("images"))
    return out
