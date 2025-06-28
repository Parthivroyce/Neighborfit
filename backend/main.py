from fastapi import FastAPI
from app.routes import router as match_router
from app.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(match_router)
app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"message": "NeighborFit Backend is Running 🚀"}
