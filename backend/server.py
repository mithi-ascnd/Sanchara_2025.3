from fastapi import FastAPI, APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from bson import ObjectId
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# WebSocket connections manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# ============ Models ============

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password: str
    email: str
    mode: str = "wheelchair"  # blind, deaf, wheelchair
    is_premium: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    mode: str = "wheelchair"

class UserLogin(BaseModel):
    username: str
    password: str

class Location(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    latitude: float
    longitude: float
    address: str
    sanchara_score: float = 5.0  # 1-10 scale
    has_ramp: bool = False
    has_elevator: bool = False
    has_stairs: bool = True
    surface_type: str = "rough"  # smooth, rough
    incline_level: str = "moderate"  # low, moderate, high
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class LocationCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    address: str
    sanchara_score: Optional[float] = 5.0
    has_ramp: Optional[bool] = False
    has_elevator: Optional[bool] = False
    has_stairs: Optional[bool] = True
    surface_type: Optional[str] = "rough"
    incline_level: Optional[str] = "moderate"
    description: Optional[str] = None

class Barrier(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    latitude: float
    longitude: float
    barrier_type: str  # pothole, missing_ramp, stairs, construction, curb
    severity: str  # low, medium, high
    description: str
    photo_base64: Optional[str] = None
    ai_classification: Optional[str] = None  # Mocked AI analysis
    verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BarrierCreate(BaseModel):
    user_id: str
    latitude: float
    longitude: float
    barrier_type: str
    severity: str
    description: str
    photo_base64: Optional[str] = None

class Alert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    latitude: float
    longitude: float
    alert_type: str  # pothole, elevator_out, construction, hazard
    message: str
    severity: str  # low, medium, high
    radius: float = 100.0  # meters
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None

class AlertCreate(BaseModel):
    latitude: float
    longitude: float
    alert_type: str
    message: str
    severity: str
    radius: Optional[float] = 100.0

class AISearchQuery(BaseModel):
    query: str
    user_mode: str
    latitude: float
    longitude: float
    radius: Optional[float] = 5000.0  # meters

class Route(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    mode: str  # blind, deaf, wheelchair
    distance: float
    duration: float
    accessibility_score: float
    waypoints: List[Dict[str, float]]
    barriers: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RouteRequest(BaseModel):
    user_id: str
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    mode: str

# ============ Helper Functions ============

def mock_image_analysis(photo_base64: Optional[str] = None) -> str:
    """Mock AI image analysis for barriers"""
    import random
    classifications = [
        "ramp_present",
        "stairs_detected",
        "smooth_surface",
        "rough_surface",
        "pothole_detected",
        "curb_detected",
        "construction_zone"
    ]
    return random.choice(classifications)

def calculate_sanchara_score(location_data: dict) -> float:
    """Calculate accessibility score based on features"""
    score = 5.0
    if location_data.get("has_ramp"):
        score += 2.0
    if location_data.get("has_elevator"):
        score += 1.5
    if not location_data.get("has_stairs"):
        score += 1.0
    if location_data.get("surface_type") == "smooth":
        score += 1.5
    if location_data.get("incline_level") == "low":
        score += 1.0
    
    return min(10.0, max(1.0, score))

def calculate_route_accessibility(mode: str, barriers: List[dict]) -> float:
    """Calculate route accessibility based on mode and barriers"""
    base_score = 8.0
    
    for barrier in barriers:
        severity_impact = {
            "low": 0.5,
            "medium": 1.0,
            "high": 2.0
        }
        base_score -= severity_impact.get(barrier.get("severity", "medium"), 1.0)
    
    return max(1.0, min(10.0, base_score))

# ============ Routes ============

@api_router.post("/auth/register", response_model=User)
async def register_user(user: UserCreate):
    """Register a new user"""
    existing = await db.users.find_one({"username": user.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user_obj = User(**user.dict())
    await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.post("/auth/login")
async def login_user(credentials: UserLogin):
    """Login user"""
    user = await db.users.find_one({"username": credentials.username, "password": credentials.password})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"user_id": user["id"], "username": user["username"], "mode": user["mode"], "is_premium": user.get("is_premium", False)}

@api_router.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get user profile"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.put("/users/{user_id}/mode")
async def update_user_mode(user_id: str, mode: dict):
    """Update user's accessibility mode"""
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"mode": mode["mode"]}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "mode": mode["mode"]}

@api_router.post("/users/{user_id}/premium")
async def upgrade_to_premium(user_id: str):
    """Upgrade user to premium"""
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_premium": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "is_premium": True}

@api_router.post("/locations", response_model=Location)
async def create_location(location: LocationCreate):
    """Create a new location with accessibility data"""
    loc_dict = location.dict()
    loc_dict["sanchara_score"] = calculate_sanchara_score(loc_dict)
    location_obj = Location(**loc_dict)
    await db.locations.insert_one(location_obj.dict())
    return location_obj

@api_router.get("/locations", response_model=List[Location])
async def get_locations(
    latitude: float,
    longitude: float,
    radius: float = 5000.0,
    min_score: Optional[float] = None
):
    """Get locations within radius with optional score filter"""
    # Simple radius search (in production, use geospatial queries)
    query = {}
    if min_score:
        query["sanchara_score"] = {"$gte": min_score}
    
    locations = await db.locations.find(query).limit(100).to_list(100)
    return [Location(**loc) for loc in locations]

@api_router.get("/locations/heatmap")
async def get_heatmap_data(
    latitude: float,
    longitude: float,
    radius: float = 10000.0
):
    """Get heatmap data for accessibility scores"""
    locations = await db.locations.find().limit(200).to_list(200)
    
    heatmap_data = [
        {
            "latitude": loc["latitude"],
            "longitude": loc["longitude"],
            "score": loc["sanchara_score"],
            "intensity": loc["sanchara_score"] / 10.0
        }
        for loc in locations
    ]
    
    return {"heatmap": heatmap_data}

@api_router.post("/barriers", response_model=Barrier)
async def report_barrier(barrier: BarrierCreate):
    """Report a new accessibility barrier"""
    barrier_dict = barrier.dict()
    
    # Mock AI image analysis
    if barrier_dict.get("photo_base64"):
        barrier_dict["ai_classification"] = mock_image_analysis(barrier_dict["photo_base64"])
    
    barrier_obj = Barrier(**barrier_dict)
    await db.barriers.insert_one(barrier_obj.dict())
    
    # Broadcast alert to premium users if high severity
    if barrier.severity == "high":
        alert_msg = {
            "type": "new_barrier",
            "barrier_type": barrier.barrier_type,
            "latitude": barrier.latitude,
            "longitude": barrier.longitude,
            "severity": barrier.severity
        }
        await manager.broadcast(alert_msg)
    
    return barrier_obj

@api_router.get("/barriers", response_model=List[Barrier])
async def get_barriers(
    latitude: float,
    longitude: float,
    radius: float = 5000.0
):
    """Get barriers within radius"""
    barriers = await db.barriers.find().limit(200).to_list(200)
    return [Barrier(**b) for b in barriers]

@api_router.post("/alerts", response_model=Alert)
async def create_alert(alert: AlertCreate):
    """Create a real-time alert (premium feature)"""
    alert_obj = Alert(**alert.dict())
    await db.alerts.insert_one(alert_obj.dict())
    
    # Broadcast to connected premium users
    await manager.broadcast({
        "type": "alert",
        "alert_type": alert.alert_type,
        "message": alert.message,
        "latitude": alert.latitude,
        "longitude": alert.longitude,
        "severity": alert.severity
    })
    
    return alert_obj

@api_router.get("/alerts", response_model=List[Alert])
async def get_active_alerts(
    latitude: float,
    longitude: float,
    radius: float = 1000.0
):
    """Get active alerts within radius"""
    alerts = await db.alerts.find().limit(50).to_list(50)
    return [Alert(**a) for a in alerts]

@api_router.post("/routes", response_model=Route)
async def calculate_route(route_req: RouteRequest):
    """Calculate accessible route based on mode"""
    # Find barriers along potential route
    barriers = await db.barriers.find().limit(50).to_list(50)
    
    # Simple route calculation (in production, use proper routing algorithm)
    distance = ((route_req.end_lat - route_req.start_lat)**2 + 
                (route_req.end_lng - route_req.start_lng)**2) ** 0.5 * 111000  # rough meters
    
    # Generate waypoints
    waypoints = [
        {"latitude": route_req.start_lat, "longitude": route_req.start_lng},
        {"latitude": (route_req.start_lat + route_req.end_lat) / 2, 
         "longitude": (route_req.start_lng + route_req.end_lng) / 2},
        {"latitude": route_req.end_lat, "longitude": route_req.end_lng}
    ]
    
    accessibility_score = calculate_route_accessibility(route_req.mode, barriers)
    
    route = Route(
        user_id=route_req.user_id,
        start_lat=route_req.start_lat,
        start_lng=route_req.start_lng,
        end_lat=route_req.end_lat,
        end_lng=route_req.end_lng,
        mode=route_req.mode,
        distance=distance,
        duration=distance / 1.4,  # rough walking speed
        accessibility_score=accessibility_score,
        waypoints=waypoints,
        barriers=[b["id"] for b in barriers[:5]]
    )
    
    await db.routes.insert_one(route.dict())
    return route

@api_router.post("/ai/search")
async def ai_search(query: AISearchQuery):
    """AI-powered conversational search using Gemini"""
    try:
        # Get nearby locations for context
        locations = await db.locations.find().limit(20).to_list(20)
        
        # Prepare context for AI
        context = f"""User is searching for accessible locations. Their accessibility mode is: {query.user_mode}
Current location: ({query.latitude}, {query.longitude})
Search radius: {query.radius} meters

Available locations:
"""
        for loc in locations:
            context += f"- {loc['name']} at ({loc['latitude']}, {loc['longitude']}) - Score: {loc['sanchara_score']}/10, "
            context += f"Ramp: {loc.get('has_ramp', False)}, Elevator: {loc.get('has_elevator', False)}, "
            context += f"Surface: {loc.get('surface_type', 'unknown')}\n"
        
        # Initialize Gemini chat
        chat = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=f"search_{uuid.uuid4()}",
            system_message="""You are an accessibility assistant for Sanchara app. 
Help users find accessible locations based on their needs. Consider:
- Blind users: Need clear audio landmarks, minimal obstacles
- Deaf users: Need visual information, good lighting
- Wheelchair users: Need ramps, elevators, smooth surfaces, low incline

Provide specific location recommendations with accessibility scores."""
        ).with_model("gemini", "gemini-2.0-flash")
        
        user_message = UserMessage(text=f"{context}\n\nUser query: {query.query}")
        response = await chat.send_message(user_message)
        
        return {
            "query": query.query,
            "response": response,
            "locations_found": len(locations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI search failed: {str(e)}")

@api_router.get("/")
async def root():
    return {"message": "Sanchara API - Inclusive Mobility Navigation"}

# WebSocket for real-time alerts (Premium feature)
@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Keep connection alive
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
