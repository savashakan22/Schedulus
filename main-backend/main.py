"""
Schedulus Main Backend - API Gateway and Orchestrator

This is the main entry point for the backend API. It coordinates between
the frontend, ML Engine, and Algorithm API to provide schedule optimization.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Dict
import uuid
import asyncio

from config import get_settings
from schemas import (
    OptimizationRequest,
    OptimizationJobResponse,
    TimetableResponse,
    HealthResponse,
    JobStatus,
)
from orchestrator import orchestrator

settings = get_settings()

app = FastAPI(
    title="Schedulus Main Backend",
    description="API Gateway and Orchestrator for Smart University Course Scheduling",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job storage (use Redis/DB in production)
jobs: Dict[str, OptimizationJobResponse] = {}


@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - health check."""
    return await health_check()


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint with service status."""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        services={
            "main_backend": "up",
            "ml_engine": settings.ml_engine_url,
            "algorithm_api": settings.algorithm_api_url,
        },
    )


@app.post("/api/schedules/optimize", response_model=OptimizationJobResponse)
async def start_optimization(
    request: OptimizationRequest,
    background_tasks: BackgroundTasks,
):
    """
    Start a new schedule optimization job.
    
    This endpoint initiates the optimization workflow:
    1. Enriches lessons with ML predictions
    2. Sends to Algorithm API for solving
    3. Returns job ID for status polling
    """
    job_id = str(uuid.uuid4())
    
    # Create job entry
    job = OptimizationJobResponse(
        id=job_id,
        status=JobStatus.PENDING,
        progress=0,
        started_at=datetime.now(),
    )
    jobs[job_id] = job
    
    # Run optimization in background
    background_tasks.add_task(
        run_optimization_task,
        job_id,
        request,
    )
    
    return job


async def run_optimization_task(job_id: str, request: OptimizationRequest):
    """Background task to run optimization."""
    job = jobs.get(job_id)
    if not job:
        return
    
    try:
        # Update status
        job.status = JobStatus.RUNNING
        job.progress = 10
        
        # Convert Pydantic models to dicts
        timeslots = [ts.model_dump() for ts in request.timeslots]
        rooms = [room.model_dump() for room in request.rooms]
        lessons = [lesson.model_dump() for lesson in request.lessons]
        
        job.progress = 30
        
        # Run optimization
        result = await orchestrator.run_optimization(
            timeslots=timeslots,
            rooms=rooms,
            lessons=lessons,
        )
        
        job.progress = 90
        
        # Parse result (convert from Java API format)
        job.result = parse_timetable_result(result)
        job.status = JobStatus.COMPLETED
        job.progress = 100
        job.completed_at = datetime.now()
        
    except Exception as e:
        job.status = JobStatus.FAILED
        job.error = str(e)
        job.completed_at = datetime.now()


def parse_timetable_result(result: dict) -> TimetableResponse:
    """Parse Algorithm API result to response model."""
    from schemas import TimeslotResponse, RoomResponse, LessonResponse, ScoreResponse
    
    timeslots = [
        TimeslotResponse(
            day_of_week=ts.get("dayOfWeek", ""),
            start_time=ts.get("startTime", ""),
            end_time=ts.get("endTime", ""),
            preference_bonus=ts.get("preferenceBonus"),
        )
        for ts in result.get("timeslots", [])
    ]
    
    rooms = [
        RoomResponse(
            name=room.get("name", ""),
            capacity=room.get("capacity"),
        )
        for room in result.get("rooms", [])
    ]
    
    lessons = []
    for lesson in result.get("lessons", []):
        ts = lesson.get("timeslot")
        room = lesson.get("room")
        
        lessons.append(LessonResponse(
            id=lesson.get("id", ""),
            subject=lesson.get("subject", ""),
            teacher=lesson.get("teacher", ""),
            student_group=lesson.get("studentGroup", ""),
            difficulty_weight=lesson.get("difficultyWeight"),
            satisfaction_score=lesson.get("satisfactionScore"),
            pinned=lesson.get("pinned", False),
            timeslot=TimeslotResponse(
                day_of_week=ts.get("dayOfWeek", "") if ts else "",
                start_time=ts.get("startTime", "") if ts else "",
                end_time=ts.get("endTime", "") if ts else "",
                preference_bonus=ts.get("preferenceBonus") if ts else None,
            ) if ts else None,
            room=RoomResponse(
                name=room.get("name", "") if room else "",
                capacity=room.get("capacity") if room else None,
            ) if room else None,
        ))
    
    score = result.get("score")
    score_response = None
    if score:
        # Parse Timefold score format (e.g., "0hard/-15soft")
        if isinstance(score, str):
            hard = 0
            soft = 0
            parts = score.replace("hard", "").replace("soft", "").split("/")
            if len(parts) >= 1:
                hard = int(parts[0])
            if len(parts) >= 2:
                soft = int(parts[1])
            score_response = ScoreResponse(hard_score=hard, soft_score=soft)
        elif isinstance(score, dict):
            score_response = ScoreResponse(
                hard_score=score.get("hardScore", 0),
                soft_score=score.get("softScore", 0),
            )
    
    return TimetableResponse(
        timeslots=timeslots,
        rooms=rooms,
        lessons=lessons,
        score=score_response,
    )


@app.get("/api/schedules/jobs/{job_id}", response_model=OptimizationJobResponse)
async def get_job_status(job_id: str):
    """Get the status of an optimization job."""
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.get("/api/schedules/latest", response_model=TimetableResponse)
async def get_latest_schedule():
    """Get the most recently completed schedule."""
    completed_jobs = [
        job for job in jobs.values()
        if job.status == JobStatus.COMPLETED and job.result
    ]
    
    if not completed_jobs:
        raise HTTPException(status_code=404, detail="No completed schedules found")
    
    # Sort by completion time and get latest
    latest = max(completed_jobs, key=lambda j: j.completed_at or datetime.min)
    return latest.result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
