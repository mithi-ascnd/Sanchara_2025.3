from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime
import json

app = FastAPI(title="Sanchara API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    mode: str

class UserLogin(BaseModel):
    username: str
    password: str

class LocationCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    has_ramp: bool = False
    has_elevator: bool = False
    surface_type: str = "smooth"
    incline_level: float = 0.0

class BarrierCreate(BaseModel):
    user_id: str
    latitude: float
    longitude: float
    barrier_type: str
    severity: str
    description: str
    photo_base64: Optional[str] = None

class AISearch(BaseModel):
    query: str
    user_mode: str
    latitude: float
    longitude: float
    radius: int = 5000

# In-memory storage (replace with database in production)
users_db = {}
locations_db = {}
barriers_db = {}

# Sample data
sample_locations = [
    {
        "id": "loc1",
        "name": "Central Park Cafe",
        "latitude": 40.758896,
        "longitude": -73.985130,
        "has_ramp": True,
        "has_elevator": False,
        "surface_type": "smooth",
        "incline_level": 0.0,
        "sanchara_score": 8.5
    },
    {
        "id": "loc2", 
        "name": "Metro Station",
        "latitude": 40.758896,
        "longitude": -73.985130,
        "has_ramp": True,
        "has_elevator": True,
        "surface_type": "smooth",
        "incline_level": 0.0,
        "sanchara_score": 9.0
    }
]

sample_barriers = [
    {
        "id": "bar1",
        "user_id": "user1",
        "latitude": 40.758896,
        "longitude": -73.985130,
        "barrier_type": "pothole",
        "severity": "medium",
        "description": "Large pothole on main street",
        "created_at": datetime.now().isoformat()
    }
]

# Initialize sample data
for loc in sample_locations:
    locations_db[loc["id"]] = loc

for bar in sample_barriers:
    barriers_db[bar["id"]] = bar

@app.get("/")
async def root():
    return {"message": "Sanchara API is running!", "status": "healthy"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Authentication endpoints
@app.post("/api/auth/register")
async def register(user: UserCreate):
    user_id = str(uuid.uuid4())
    users_db[user_id] = {
        "user_id": user_id,
        "username": user.username,
        "email": user.email,
        "mode": user.mode,
        "is_premium": False,
        "created_at": datetime.now().isoformat()
    }
    return {"user_id": user_id, "message": "User registered successfully"}

@app.post("/api/auth/login")
async def login(user: UserLogin):
    # Simple authentication - in production, use proper password hashing
    for user_id, user_data in users_db.items():
        if user_data["username"] == user.username:
            return {
                "user_id": user_id,
                "username": user_data["username"],
                "mode": user_data["mode"],
                "is_premium": user_data["is_premium"]
            }
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/users/{user_id}")
async def get_user(user_id: str):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    return users_db[user_id]

# Location endpoints
@app.get("/api/locations")
async def get_locations(latitude: float, longitude: float, radius: int = 5000):
    # Simple distance calculation - return all sample locations for demo
    return list(locations_db.values())

@app.get("/api/locations/heatmap")
async def get_heatmap(latitude: float, longitude: float):
    # Return sample heatmap data
    return {
        "heatmap": [
            {"latitude": 40.758896, "longitude": -73.985130, "intensity": 0.8},
            {"latitude": 40.759896, "longitude": -73.986130, "intensity": 0.6}
        ]
    }

# Barrier endpoints
@app.post("/api/barriers")
async def create_barrier(barrier: BarrierCreate):
    barrier_id = str(uuid.uuid4())
    barriers_db[barrier_id] = {
        "id": barrier_id,
        "user_id": barrier.user_id,
        "latitude": barrier.latitude,
        "longitude": barrier.longitude,
        "barrier_type": barrier.barrier_type,
        "severity": barrier.severity,
        "description": barrier.description,
        "photo_base64": barrier.photo_base64,
        "created_at": datetime.now().isoformat(),
        "ai_classification": "Mock AI analysis: " + barrier.barrier_type
    }
    return barriers_db[barrier_id]

@app.get("/api/barriers")
async def get_barriers(latitude: float, longitude: float, radius: int = 500):
    # Return sample barriers for demo
    return list(barriers_db.values())

# AI Search endpoint
@app.post("/api/ai/search")
async def ai_search(search: AISearch):
    # Mock AI response
    return {
        "response": f"Based on your {search.user_mode} mode, I found several accessible locations near you. Here are some recommendations: Central Park Cafe (accessibility score: 8.5/10) with ramp access, and Metro Station (score: 9.0/10) with both ramp and elevator access.",
        "locations_found": 2,
        "query": search.query,
        "user_mode": search.user_mode
    }

# Alerts endpoint
@app.get("/api/alerts")
async def get_alerts(latitude: float, longitude: float):
    # Return sample alerts
    return [
        {
            "id": "alert1",
            "message": "Construction work ahead - use alternative route",
            "severity": "high",
            "latitude": 40.758896,
            "longitude": -73.985130,
            "created_at": datetime.now().isoformat()
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
