from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt

from app.users import users_db, pwd_context

SECRET_KEY = "secret_neighborfit_key"
ALGORITHM = "HS256"

router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str

class RegisterForm(BaseModel):
    username: str
    password: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

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

@router.post("/register", status_code=201)
def register_user(form: RegisterForm):
    if form.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = get_password_hash(form.password)
    users_db[form.username] = {
        "username": form.username,
        "hashed_password": hashed_password,
        "full_name": form.username.title(),
        "disabled": False
    }
    return {"msg": "User registered successfully"}
