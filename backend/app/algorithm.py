from app.models import UserPreferences

# Neighborhood database
NEIGHBORHOODS = [
    {
        "name": "Parkside",
        "budget": 2,
        "commute_time": 3,
        "noise_tolerance": 1,
        "pet_friendly": True,
        "green_spaces": True
    },
    {
        "name": "Downtown",
        "budget": 4,
        "commute_time": 1,
        "noise_tolerance": 5,
        "pet_friendly": False,
        "green_spaces": False
    },
    {
        "name": "Greenfield",
        "budget": 3,
        "commute_time": 2,
        "noise_tolerance": 2,
        "pet_friendly": True,
        "green_spaces": True
    },
    {
        "name": "Lakeside",
        "budget": 3,
        "commute_time": 4,
        "noise_tolerance": 2,
        "pet_friendly": True,
        "green_spaces": False
    },
    {
        "name": "Hilltop",
        "budget": 5,
        "commute_time": 1,
        "noise_tolerance": 3,
        "pet_friendly": False,
        "green_spaces": True
    }
]

def match_neighborhood(prefs: UserPreferences):
    scored = []

    for n in NEIGHBORHOODS:
        score = 0

        # Scoring numeric similarity
        score += max(0, (5 - abs(n["budget"] - prefs.budget)) * 2)
        score += max(0, (5 - abs(n["commute_time"] - prefs.commute_time)) * 2)
        score += max(0, (5 - abs(n["noise_tolerance"] - prefs.noise_tolerance)) * 1.5)

        # Scoring boolean matches
        if n["pet_friendly"] == prefs.pet_friendly:
            score += 3
        if n["green_spaces"] == prefs.green_spaces:
            score += 3

        scored.append((n, score))  # Keep full neighborhood object

    # Sort by score descending and return top 3
    top_matches = sorted(scored, key=lambda x: x[1], reverse=True)[:3]

    # Extract only the full neighborhood dicts
    return {"matches": [neighborhood for neighborhood, _ in top_matches]}
