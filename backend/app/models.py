from pydantic import BaseModel

class UserPreferences(BaseModel):
    budget: int
    commute_time: int
    noise_tolerance: int
    pet_friendly: bool
    green_spaces: bool
