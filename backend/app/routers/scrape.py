from fastapi import APIRouter

from ..schemas import Brief, ScrapeIn, ScrapeOut
from ..utils_scrape import scrape_url

router = APIRouter()


@router.post("/", response_model=ScrapeOut)
def scrape(inb: ScrapeIn) -> ScrapeOut:
    """Pull title, description, bullets and images from a product page."""
    try:
        data = scrape_url(str(inb.url))
    except Exception as e:
        return ScrapeOut(ok=False, reason=f"Could not read that page: {e}")
    return ScrapeOut(ok=True, brief=Brief(
        title=data["title"],
        description=data["description"],
        bullets=data["bullets"],
        images=data["images"],
    ))
