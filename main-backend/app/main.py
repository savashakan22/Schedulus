from fastapi import FastAPI, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
from app.services.scheduler_service import SchedulerService

app = FastAPI()
scheduler_service = SchedulerService()

class ScheduleRequest(BaseModel):
    # Simplified request
    pass

@app.post("/schedule")
async def create_schedule():
    try:
        result = await scheduler_service.generate_schedule()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok"}
