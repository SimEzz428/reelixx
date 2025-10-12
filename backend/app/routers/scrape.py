from fastapi import APIRouter
from ..schemas import ScrapeIn, ScrapeOut, Brief
from ..utils_scrape import scrape_brief

router = APIRouter()


@router.post("/", response_model=ScrapeOut)
async def scrape(inb: ScrapeIn) -> ScrapeOut:
    try:
        data = await scrape_brief(str(inb.url))
        if not data:
            return ScrapeOut(ok=False, reason="No product data found")
        return ScrapeOut(ok=True, brief=Brief(**data))
    except Exception as e:
        return ScrapeOut(ok=False, reason=str(e))
