from app.data import neighborhoods

def compute_match_score(user_prefs, neighborhood):
    score = 0
    weights = {
        "budget": 0.25,
        "commute_time": 0.20,
        "noise_tolerance": 0.20,
        "pet_friendly": 0.15,
        "green_spaces": 0.20
    }

    # Numeric feature scoring (normalized difference)
    for key in ["budget", "commute_time", "noise_tolerance"]:
        user_value = user_prefs[key]
        neighborhood_value = neighborhood[key]
        diff = abs(user_value - neighborhood_value)
        score += (1 - (diff / 4)) * weights[key]

    # Boolean features (exact match)
    for key in ["pet_friendly", "green_spaces"]:
        match = user_prefs[key] == neighborhood[key]
        score += (1 if match else 0) * weights[key]

    return round(score, 4)

def match_neighborhoods(user_prefs):
    scored = []
    for n in neighborhoods:
        score = compute_match_score(user_prefs, n)
        n_with_score = dict(n)  # copy the neighborhood dict
        n_with_score["score"] = score
        scored.append(n_with_score)

    # Sort by score descending and return top 5
    top_matches = sorted(scored, key=lambda x: x["score"], reverse=True)[:5]
    return top_matches
