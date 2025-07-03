from fastapi import APIRouter
from app.models import UserPreferences
from app.match import match_neighborhoods

router = APIRouter()

@router.post("/match")
def get_matches(prefs: UserPreferences):
    matches = match_neighborhoods(prefs.dict())
    return {"matches": matches}
