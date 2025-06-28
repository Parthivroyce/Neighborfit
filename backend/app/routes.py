from fastapi import APIRouter
from app.algorithm import match_neighborhood
from app.models import UserPreferences

router = APIRouter()

@router.post("/match")
def match_neighborhoods(prefs: UserPreferences):
    return match_neighborhood(prefs)
