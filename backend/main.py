from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router as match_router
from app.auth import router as auth_router

app = FastAPI()

# ✅ Add your local and deployed frontend URLs here
origins = [
    "http://localhost:3000",
    "https://neighborfit-xi.vercel.app"
]

# ✅ CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include your routers
app.include_router(match_router)
app.include_router(auth_router)

# ✅ Health check route
@app.get("/")
def read_root():
    return {"message": "NeighborFit Backend is Running 🚀"}
