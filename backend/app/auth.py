from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt

from app.users import users_db, pwd_context

# Secret key for JWT encoding (keep this secret!)
SECRET_KEY = "secret_neighborfit_key"
ALGORITHM = "HS256"

router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(username: str, password: str):
    user = users_db.get(username)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_data = {
        "sub": user["username"],
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}
