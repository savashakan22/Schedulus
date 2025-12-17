"""
Schedulus Main Backend - API Gateway and Orchestrator

This is the main entry point for the backend API. It coordinates between
the frontend, ML Engine, and Algorithm API to provide schedule optimization.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from contextlib import asynccontextmanager
from datetime import datetime
import uuid

from config import get_settings
from database import get_db, init_db, close_db
from models import OptimizationJob, JobStatusEnum
from schemas import (
    OptimizationRequest,
    OptimizationJobResponse,
    TimetableResponse,
    HealthResponse,
    JobStatus,
)
from orchestrator import orchestrator

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


app = FastAPI(
    title="Schedulus Main Backend",
    description="API Gateway and Orchestrator for Smart University Course Scheduling",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    db: AsyncSession = Depends(get_db),
):
    """
    Start a new schedule optimization job.
    
    This endpoint initiates the optimization workflow:
    1. Enriches lessons with ML predictions
    2. Sends to Algorithm API for solving
    3. Returns job ID for status polling
    """
    job_id = uuid.uuid4()
    
    # Create job in database
    job = OptimizationJob(
        id=job_id,
        status=JobStatusEnum.PENDING,
        progress=0,
        started_at=datetime.utcnow(),
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    
    # Run optimization in background
    background_tasks.add_task(
        run_optimization_task,
        str(job_id),
        request,
    )
    
    return OptimizationJobResponse(
        id=str(job.id),
        status=JobStatus(job.status.value),
        progress=job.progress,
        started_at=job.started_at,
    )


async def run_optimization_task(job_id: str, request: OptimizationRequest):
    """Background task to run optimization."""
    from database import async_session_factory
    
    async with async_session_factory() as db:
        try:
            # Get job from database
            result = await db.execute(
                select(OptimizationJob).where(OptimizationJob.id == uuid.UUID(job_id))
            )
            job = result.scalar_one_or_none()
            
            if not job:
                return
            
            # Update status to running
            job.status = JobStatusEnum.RUNNING
            job.progress = 10
            await db.commit()
            
            # Convert Pydantic models to dicts
            timeslots = [ts.model_dump() for ts in request.timeslots]
            rooms = [room.model_dump() for room in request.rooms]
            lessons = [lesson.model_dump() for lesson in request.lessons]
            
            job.progress = 30
            await db.commit()
            
            # Run optimization
            optimization_result = await orchestrator.run_optimization(
                timeslots=timeslots,
                rooms=rooms,
                lessons=lessons,
            )
            
            job.progress = 90
            await db.commit()
            
            # Parse and store result
            timetable_response = parse_timetable_result(optimization_result)
            job.result = timetable_response.model_dump()
            job.status = JobStatusEnum.COMPLETED
            job.progress = 100
            job.completed_at = datetime.utcnow()
            await db.commit()
            
        except Exception as e:
            job.status = JobStatusEnum.FAILED
            job.error = str(e)
            job.completed_at = datetime.utcnow()
            await db.commit()


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
async def get_job_status(job_id: str, db: AsyncSession = Depends(get_db)):
    """Get the status of an optimization job."""
    try:
        job_uuid = uuid.UUID(job_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid job ID format")
    
    result = await db.execute(
        select(OptimizationJob).where(OptimizationJob.id == job_uuid)
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return OptimizationJobResponse(
        id=str(job.id),
        status=JobStatus(job.status.value),
        progress=job.progress,
        started_at=job.started_at,
        completed_at=job.completed_at,
        result=TimetableResponse(**job.result) if job.result else None,
        error=job.error,
    )


@app.get("/api/schedules/latest", response_model=TimetableResponse)
async def get_latest_schedule(db: AsyncSession = Depends(get_db)):
    """Get the most recently completed schedule."""
    result = await db.execute(
        select(OptimizationJob)
        .where(OptimizationJob.status == JobStatusEnum.COMPLETED)
        .where(OptimizationJob.result.isnot(None))
        .order_by(desc(OptimizationJob.completed_at))
        .limit(1)
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="No completed schedules found")
    
    return TimetableResponse(**job.result)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
